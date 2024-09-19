const config = require("../config/app");
const { knex } = require("../config/knex.db");
const table = require("../config/table.macros");
// const Hash = require('crypto-js/pbkdf2');
const Hash = require('crypto-js');
const fs = require('fs');
const pushEmail = require('./pushEmail');
const checksum_lib = require('./checkSum');
var moment = require('moment');
const jwt = require('jsonwebtoken');
const encrypt = require('../config/custom_encryption.utils');
const { createModuleLog } = require('../helper/modulelogger');
const cron = require("node-cron");
const Minio = require('minio');
const { fetchMinIo } = require('./minIo');

//customer
function verifyEmail(req, res) {
	let keyword = req.body.email;
	let notification = req.body.notification_email;
	let user_id = req.body.id;
	let sql = knex
		.from(table.tbl_Customer)
		.select("id", "email")
		.where("email", "" + keyword + "")
		// .orWhere("notification_email", "" + notification + "")
		// .orWhere("notification_email", "" + keyword + "")
		// .orWhere("email", "" + notification + "")
		.andWhere("status", "!=", "2")
		.andWhere("role_id", "!=", "0");
	sql
		.then((response) => {
			if (response.length > 0 && response[0].id != user_id) {
				const user = response[0];
				res.json({
					id: user.id,
					email: user.email,
					notification_email: user.notification_email
				});
			} else {
				res.json({
					id: "",
					email: "",
					notification_email: ""
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(411)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}
function verifynotificationEmail(req, res) {
	let keyword = req.body.notification_email;
	let user_id = req.body.id;
	let sql = knex
		.from(table.tbl_Customer)
		.select("id", "notification_email")
		.where("notification_email", "" + keyword + "")
		.andWhere("status", "!=", "2")
		.andWhere("role_id", "!=", "0");
	sql
		.then((response) => {
			if (response.length > 0 && response[0].id != user_id) {
				const user = response[0];
				res.json({
					id: user.id,
				});
			} else {
				res.json({
					id: "",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(411)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}



function verifyCompany(req, res) {  //for duplicate company
	let company = req.body.company;
	let user_id = req.body.id;
	let sql = knex
		.from(table.tbl_Customer)
		.where("company_name", "" + company + "")
		// .andWhere("customer_id", "=", "2")
		.select("id")
	// .andWhere("customer_id", "!=", "0")
	sql.then((response) => {
		if (response.length > 0 && response[0].id !== user_id) {
			const user = response[0];
			res.json({
				id: user.id,
			});
		} else {
			res.json({
				id: "",
			});
		}
	})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getCustomerBillingTypePackage(req, res) {
	knex
		.select("pbx.billing_type")
		.from(table.tbl_PBX_features + " as pbx")
		.leftJoin(table.tbl_Package + " as p", "pbx.id", "p.feature_id")
		.where("p.id", "=", "" + req.query.packageId + "")
		.then((response) => {
			if (response) {
				var billing_type = response[0].billing_type;
				knex
					.select("p.*")
					.from(table.tbl_Package + " as p")
					.leftJoin(
						table.tbl_PBX_features + " as pbx",
						"pbx.id",
						"p.feature_id"
					)
					.where("pbx.billing_type", "=", "" + billing_type + "")
					.andWhere("p.product_id", "=", "" + req.query.productId + "")
					.then((resp) => {
						if (resp) {
							res.json({
								resp,
							});
						} else {
							res.status(411).send({ error: "error", message: "DB Error" });
						}
					});
			} else {
				res.status(411).send({ error: "error", message: "DB Error" });
			}
		});
}

function getCustomerById(req, res) {
	var package = '';
	var sql = knex.select('c.*', knex.raw('GROUP_CONCAT(DISTINCT (map.product_id)) as product_id'), 'feat.bundle_plan_id', 'feat.is_bundle_type', 'feat.minute_plan', 'feat.outbound_call', 'feat.roaming_plan_id', 'feat.teleConsultancy_call_plan_id',
		knex.raw('GROUP_CONCAT(DISTINCT(pro.name)) as product_name'), knex.raw('GROUP_CONCAT(pack.id) as package_id'),
		knex.raw('GROUP_CONCAT(pack.name) as package_name'), 'feat.minute_plan as is_associate_with_bundle_plan', 'feat.out_bundle_type as is_associate_with_out_bundle_plan', 'feat.is_bundle_type as is_associate_with_bundle_plan_real',
		'feat.is_roaming_type as is_associate_with_roaming_plan', 'feat.teleconsultation as is_associate_with_tc_plan', 'feat.billing_type as pckg_billing_type').from(table.tbl_Customer + ' as c')
		.leftJoin(table.tbl_Map_customer_package + ' as map', 'c.id', 'map.customer_id')
		.leftJoin(table.tbl_Product + ' as pro', 'map.product_id', 'pro.id')
		.leftJoin(table.tbl_Package + ' as pack', 'pack.id', 'map.package_id')
		.leftJoin(table.tbl_PBX_features + ' as feat', 'feat.id', 'pack.feature_id')
		.where('c.id', '=', "" + req.query.id + "")
		.groupBy('map.customer_id')
		.orderBy('c.id', 'desc');
	sql.then((response) => {
		if (response) {
			response[0]['pbx_package_id'] = global.pbx_package_id;
			response[0]['oc_package_id'] = global.oc_package_id;
			res.json({
				response
			});
		} else {
			res.status(401).send({ error: 'error', message: 'DB Error' });
		}
	});
}


//SELECT cdr.esl_country_code, c.name,count(*) AS occurrencs FROM pbx_realtime_cdr cdr LEFT JOIN country as c on concat('+',c.phonecode) = cdr.esl_country_code
//  WHERE cdr.esl_country_code NOT IN ('',"None","0") GROUP BY cdr.esl_country_code ORDER BY occurrencs DESC LIMIT 5;
function getTopDialOut(req, res) {

	let sql = knex.raw("Call pbx_getTopDialOut(" + req.query.id + ")")
	sql.then((response) => {
		if (response) {
			res.send({ response: response[0][0] });
		}
	})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		})


}

function deleteUser(req, res) {
	let arr = [];
	let modified_by = req.userId;
	if (req.body.flag == 1) {
		arr.push({ status: "4" });
	} else if (req.body.flags == 1) {
		arr.push({ status: "4" });
	} else if (req.body.Status == 1) {
		arr.push({ status: "4" });
	} else {
		arr.push({ status: "2", dialout_group: 0 });
	}
	let sql = knex(table.tbl_Customer)
		.where("id", "=", "" + req.body.id + "")
		.update(arr[0]);
	const product_id = req.body.product_id;
	sql.then((response) => {
		if (response) {
			if (req.body.role == '1') {
				var sql = knex.select('d.id', 'pro.provider', 'c.name as country', 'd.reserved', 'd.customer_id', 'd.did', 'd.secondusedreal',
					'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', 'd.did_type', knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
					knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
					'd.status', 'af.active_feature', 'd.customer_id').from(table.tbl_DID + ' as d')
					.leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
					.leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
					.leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
					.leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
					.where('d.status', '!=', "2")
					.andWhere('d.customer_id', '=', "" + req.body.id + "")
					.orderBy('d.id', 'desc');
				sql.then((resp) => {
					if (resp.length > 0) {
						for (let i = 0; i < resp.length; i++) {
							var reservation_month = '';
							var lastUses_id = '';
							var now = new Date();
							let did_id = resp[i].id;
							let user_id = req.body.id;
							let fixrate = parseFloat(resp[i].fixrate);
							var currentMonth = parseInt(now.getMonth() + 1);
							//remove mapping of customer from Table map_customer_package
							sql = knex(table.tbl_Map_customer_package).where('customer_id', "=", "" + req.body.id + "").andWhere('product_id', '=', "1").del();
							//get resevation month
							var sql = knex.from(table.tbl_Uses).where('did_id', "" + did_id + "")
								.select(knex.raw('DATE_FORMAT(`reservation_date`, "%m") as month'), 'id')
								.andWhere('customer_id', "" + user_id + "")
								.first()
								.orderBy('id', 'desc');
							sql.then((response) => {
								reservation_month = parseInt(response.month);
								lastUses_id = response.id;
								if (fixrate > 0 && currentMonth != reservation_month) {
									var totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
									var oneDayPrice = parseFloat(fixrate / totalDays);
									var usedDays = now.getDate();
									var totalBill = parseFloat(oneDayPrice * usedDays);
									var sql = knex(table.tbl_Charge).insert({
										did_id: did_id, customer_id: user_id, amount: totalBill,
										charge_type: "1", description: 'Payment adjusment for DID', charge_status: 0,
										invoice_status: 0, product_id: product_id
									});
									sql.then((resp) => {
										if (resp) {
											knex(table.tbl_DID).where('id', '=', did_id)
												.update({
													reserved: '0', customer_id: '0', activated: '0'
												}).then((respo) => {
													if (respo) {
														knex(table.tbl_Uses).where('id', '=', lastUses_id)
															.update({
																release_date: knex.raw('CURRENT_TIMESTAMP()')
															}).then((response) => {
																if (response) {
																	let sql = knex.from(table.tbl_DID_Destination).where('did_id', "" + did_id + "")
																		.select('id');
																	sql.then((resp) => {
																		if (resp.length > 0) {
																			knex(table.tbl_DID_Destination).where('did_id', '=', did_id)
																				.del().then((respons) => {
																					if (respons) {
																						res.json({
																							respons
																						});
																						res.status(401).send({ error: 'error-1', message: 'DB Error-12' });
																					}
																				}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-2', message: 'DB Error: ' + err.sqlMessage }); throw err });
																		}
																	}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-3', message: 'DB Error: ' + err.sqlMessage }); throw err });
																} else {
																	res.status(401).send({ error: 'error-4', message: 'DB Error' });
																}
															}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-5', message: 'DB Error: ' + err.sqlMessage }); throw err });
													}
												}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-6', message: 'DB Error: ' + err.message }); throw err });
										} else {
											res.status(401).send({ error: 'error-7', message: 'DB Error' });
										}
									}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-8', message: 'DB Error: ' + err.message }); throw err });
								} else {

									knex(table.tbl_DID).where('id', '=', did_id)
										.update({
											reserved: '0', customer_id: '0', activated: '0'
										}).then((respo) => {
											if (respo) {
												knex(table.tbl_Uses).where('id', '=', lastUses_id)
													.update({
														release_date: knex.raw('CURRENT_TIMESTAMP()')
													}).then((response) => {
														if (response) {
															let sql = knex.from(table.tbl_DID_Destination).where('did_id', "" + did_id + "")
																.select('id');
															sql.then((resp) => {
																if (resp.length > 0) {
																	knex(table.tbl_DID_Destination).where('did_id', '=', did_id)
																		.del().then((respons) => {
																			if (respons) {
																				res.json({
																					respons
																				});
																				// } else {
																				res.status(401).send({ error: 'error-11', message: 'DB Error' });
																			}
																		}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-22', message: 'DB Error: ' + err.sqlMessage }); throw err });
																}
															}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-33', message: 'DB Error: ' + err.message }); throw err });

														} else {
															res.status(401).send({ error: 'error-44', message: 'DB Error' });
														}
													}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-55', message: 'DB Error: ' + err.sqlMessage }); throw err });
											}
										}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-66', message: 'DB Error: ' + err.message }); throw err });
								}

							}).catch((err) => { console.log(err); res.status(401).send({ error: 'error-77', message: 'DB Error: ' + err.message }); throw err });
						}

						knex(table.tbl_Customer)
							.where("id", "=", "" + req.body.id + "")
							.update({ status: "4" })
							.then((response) => {
								if (response) {
									res.json({ response });
								}
							});
					} else {
						///
						const ticketSql = knex
							.select("*")
							.from(table.tbl_Ticket)
							.where("customer_id", "=", req.body.id)
							.andWhere("status", "!=", "0");
						ticketSql.then((tickets) => {
							if (tickets.length > 0) {
								for (let i = 0; i < tickets.length; i++) {
									knex
										.select("*")
										.from(table.tbl_Ticket)
										.where("id", "=", "" + tickets[i].id + "")
										.update({ status: "0" })
										.then(() => { });
									knex(table.tbl_Ticket_history)
										.where("ticket_id", "=", "" + tickets[i].id + "")
										.max("ticket_sequence as sequence")
										.then((response) => {
											if (response.length > 0) {
												let sequence = Object.values(
													JSON.parse(JSON.stringify(response))
												);
												sequence =
													sequence[0].sequence != 0
														? sequence[0].sequence + 1
														: parseInt(tickets[0].id) + 1;
												knex(table.tbl_Ticket_history)
													.insert({
														ticket_id: "" + tickets[0].id + "",
														ticket_sequence: "" + sequence + "",
														message: "This customer is deleted",
														ticket_type: "",
														reply_by: "",
														name: "",
													})
													.then(() => { });
											}
										});
								}
							}
						});
						if (
							req.body.flags == 1 ||
							req.body.flag == 1 ||
							req.body.Status == 1
						) {
							knex(table.tbl_Map_customer_package)
								.where("customer_id", "=", req.body.id)
								.then((respons) => {
									if (respons) {
										knex(table.tbl_assignpackage)
											.where("userid", "=", req.body.id)
											.then((respons) => {
												if (respons) {
													res.json({ respons });
												}
											})
											.catch((err) => {
												console.log(err);
												res
													.status(401)
													.send({
														error: "error-222",
														message: "DB Error: " + err.sqlMessage,
													});
												throw err;
											});
									} else {
										res
											.status(401)
											.send({ error: "error-333", message: "DB Error" });
									}
								})
								.catch((err) => {
									console.log(err);
									res
										.status(401)
										.send({
											error: "error-444",
											message: "DB Error: " + err.sqlMessage,
										});
									throw err;
								});
						} else {
							knex(table.tbl_Map_customer_package)
								.where("customer_id", "=", req.body.id)
								.del()
								.then((respons) => {
									if (respons) {
										knex(table.tbl_assignpackage)
											.where("userid", "=", req.body.id)
											.del()
											.then((respons) => {
												if (respons) {
													res.json({ respons });
												}
											})
											.catch((err) => {
												console.log(err);
												res
													.status(401)
													.send({
														error: "error-222",
														message: "DB Error: " + err.sqlMessage,
													});
												throw err;
											});
									} else {
										res
											.status(401)
											.send({ error: "error-333", message: "DB Error" });
									}
								})
								.catch((err) => {
									console.log(err);
									res
										.status(401)
										.send({
											error: "error-444",
											message: "DB Error: " + err.sqlMessage,
										});
									throw err;
								});
							///
						}
					}
				})
					.catch((err) => {
						console.log(err);
						res
							.status(401)
							.send({
								error: "error-555",
								message: "DB Error: " + err.message,
							});
						throw err;
					});
			} else if (req.body.role == "5" || req.body.role == "4") {
				const ticketSql = knex
					.select("*")
					.from(table.tbl_Ticket)
					.where("account_manager_id", "=", req.body.id)
					.andWhere("status", "!=", "0");
				ticketSql.then((tickets) => {
					if (tickets.length > 0) {
						for (let i = 0; i < tickets.length; i++) {
							knex
								.select("*")
								.from(table.tbl_Ticket)
								.where("id", "=", "" + tickets[i].id + "")
								.update({ status: "0" })
								.then(() => { });
							knex(table.tbl_Ticket_history)
								.where("ticket_id", "=", "" + tickets[i].id + "")
								.max("ticket_sequence as sequence")
								.then((response) => {
									if (response.length > 0) {
										let sequence = Object.values(
											JSON.parse(JSON.stringify(response))
										);
										sequence =
											sequence[0].sequence != 0
												? sequence[0].sequence + 1
												: parseInt(tickets[0].id) + 1;
										knex(table.tbl_Ticket_history)
											.insert({
												ticket_id: "" + tickets[0].id + "",
												ticket_sequence: "" + sequence + "",
												message: "This customer is deleted",
												ticket_type: "",
												reply_by: "",
												name: "",
											})
											.then(() => { });
									}
								});
						}
					}
				});
				res.json({ response });
			} else {
				res.json({ response });
			}
		} else {
			res.status(401).send({ error: "error-666-main", message: "DB Error" });
		}
	});
}

function inactiveUser(req, res) {
	let userTypeVal = "";
	if (req.body.role == "1") {
		userTypeVal = "CustomerInactiveStatus";
	} else if (req.body.role == "2") {
		userTypeVal = "SubAdminInactiveStatus";
	} else if (req.body.role == "3") {
		userTypeVal = 'ResellerInactiveStatus'
	} else userTypeVal = "InternalUserInactiveStatus";
	knex(table.tbl_Customer)
		.where("id", "=", "" + req.body.id + "")
		.update({ status: "0" })
		.then((response) => {
			//if (req.body.role == '4' || req.body.role == '5') {
			let newdata = { userName: req.body.name, email: req.body.email };
			pushEmail.getEmailContentUsingCategory(userTypeVal).then((val) => {
				pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
					//res.json({ data1 })
				});
			});
			// }
			res.json({ response });
		});
}

function activeUser(req, res) {
	if (req.body.role == "1") {
		userTypeVal = "CustomerInactiveStatus";
	} else if (req.body.role == "2") {
		userTypeVal = "SubAdminActiveStatus";
	} else if (req.body.role == "3") {
		userTypeVal = 'ResellerActiveStatus'
	} else userTypeVal = "InternalUserActiveStatus";
	knex(table.tbl_Customer)
		.where("id", "=", "" + req.body.id + "")
		.update({ status: "1" })
		.then((response) => {
			if (response) {
				//if (req.body.role == '4' || req.body.role == '5') {
				let newdata = { userName: req.body.name, email: req.body.email };
				pushEmail.getEmailContentUsingCategory(userTypeVal).then((val) => {
					pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
						//res.json({ data1 })
					});
				});
				// }
				res.json({ response });
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		});
}

function verifyUsername(req, res) {
	let username_keyword = req.body.username;
	let user_id = req.body.id;
	knex
		.from(table.tbl_Customer)
		.where("username", "" + username_keyword + "")
		.select("id")
		.then((response) => {
			if (response.length > 0 && response[0].id !== user_id) {
				const user = response[0];
				res.json({
					id: user.id,
				});
			} else {
				res.json({
					id: "",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getUserInfo(req, res) {
	// let userId =req.query.id;
	let userId = req.body.userId;
	let sql = knex
		.select("c.*", "tm.gmtzone")
		.from(table.tbl_Customer + " as c")
		.leftJoin(table.tbl_Time_Zone + " as tm", "tm.id", "c.time_zone_id")
		.where("c.id", "" + userId + "")
	sql
		.then((response) => {
			response.map(item => {
				delete item.password
			})

			if (response) {
				res.json({ response });
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function custDashInfo(req, res) {
	// let userId =req.query.id;
	let data = req.body;
	let total_call = data.total_call;
	if (total_call === true) {
		total_call = "true";
	} else {
		total_call = "false";
	}
	let ans_call = data.ans_call;
	if (ans_call === true) {
		ans_call = "true";
	} else {
		ans_call = "false";
	}
	let missed_call = data.missed_call;
	if (missed_call == true) {
		missed_call = "true";
	} else {
		missed_call = "false";
	}
	let failed_calls = data.failed_calls;
	if (failed_calls == true) {
		failed_calls = "true";
	} else {
		failed_calls = "false";
	}
	let busy_call = data.busy_call;
	if (busy_call == true) {
		busy_call = "true";
	} else {
		busy_call = "false";
	}
	let Concurrent_call = data.Concurrent_call;
	if (Concurrent_call == true) {
		Concurrent_call = "true";
	} else {
		Concurrent_call = "false";
	}
	let Advance_call = data.Advance_call;
	if (Advance_call == true) {
		Advance_call = "true";
	} else {
		Advance_call = "false";
	}

	let Last_invoice_call = data.Last_invoice_call;
	if (Last_invoice_call == true) {
		Last_invoice_call = 'true'
	}
	else {
		Last_invoice_call = 'false'
	}
	let total_call_diagram = data.total_call_diagram;
	if (total_call_diagram == true) {
		total_call_diagram = 'true'
	}
	else {
		total_call_diagram = 'false'
	}
	let Storage_Size = data.Storage_Size;
	if (Storage_Size == true) {
		Storage_Size = 'true'
	}
	else {
		Storage_Size = 'false'
	}
	let calls_per_hours = data.calls_per_hours;
	if (calls_per_hours == true) {
		calls_per_hours = 'true'
	}
	else {
		calls_per_hours = 'false'
	}
	let minutes_consumed = data.minutes_consumed;
	if (minutes_consumed == true) {
		minutes_consumed = 'true'
	}
	else {
		minutes_consumed = 'false'
	}
	let Average_call_duration = data.Average_call_duration;
	if (Average_call_duration == true) {
		Average_call_duration = 'true'
	}
	else {
		Average_call_duration = 'false'
	}
	let Answer_Seizure_ratio = data.Answer_Seizure_ratio;
	if (Answer_Seizure_ratio == true) {
		Answer_Seizure_ratio = 'true'
	}
	else {
		Answer_Seizure_ratio = 'false'
	}
	let Call_records = data.Call_records;
	if (Call_records == true) {
		Call_records = 'true'
	}
	else {
		Call_records = 'false'
	}
	let Extension_information = data.Extension_information;
	if (Extension_information == true) {
		Extension_information = 'true'
	}
	else {
		Extension_information = 'false'
	}
	let Account_Manager_Information = data.Account_Manager_Information;
	if (Account_Manager_Information == true) {
		Account_Manager_Information = 'true'
	}
	else {
		Account_Manager_Information = 'false'
	}
	let Features_Information = data.Features_Information;
	if (Features_Information == true) {
		Features_Information = 'true'
	}
	else {
		Features_Information = 'false'
	}
	let Ticket_Information = data.Ticket_Information;
	if (Ticket_Information == true) {
		Ticket_Information = 'true'
	}
	else {
		Ticket_Information = 'false'
	}
	let Inv_details = data.Inv_details;
	if (Inv_details == true) {
		Inv_details = 'true'
	}
	else {
		Inv_details = 'false'
	}
	let ext_details = data.ext_details;
	if (ext_details == true) {
		ext_details = 'true'
	}
	else {
		ext_details = 'false'
	}
	// let userId = req.body.userId;
	let sql = knex(table.tbl_Customer).where('id', req.query.customer_id)
	let custom_db = {
		total_call: "" + total_call + "", ans_call: "" + ans_call + "", missed_call: "" + missed_call + "",
		failed_calls: "" + failed_calls + "", busy_call: "" + busy_call + "",
		Concurrent_call: "" + Concurrent_call + "", Advance_call: "" + Advance_call + "", Last_invoice_call: "" + Last_invoice_call + "",
		total_call_diagram: "" + total_call_diagram + "", Storage_Size: "" + Storage_Size + "", calls_per_hours: "" + calls_per_hours + "",
		minutes_consumed: "" + minutes_consumed + "", Average_call_duration: "" + Average_call_duration + "",
		Answer_Seizure_ratio: "" + Answer_Seizure_ratio + "", Call_records: "" + Call_records + "", Extension_information: "" + Extension_information + "",
		Account_Manager_Information: "" + Account_Manager_Information + "", Features_Information: "" + Features_Information + "", Ticket_Information: "" + Ticket_Information + ""
		, Inv_details: "" + Inv_details + "", ext_details: "" + ext_details + ""
	}
	sql.update({ custom_db: "" + JSON.stringify(custom_db) + "" })
	sql.then((response) => {
		if (response) {
			res.send({
				response: response,
				message: 'Customize Dashboard updated successfully',
				code: 200
			});
		}
	}).catch((err) => {
		console.log(err);
		res.status(200).send({
			code: err.errno,
			error: 'error', message: 'DB Error: ' + err.message
		}); throw err
	});
}

function viewCustomDashboard(req, res) {
	let customer_id = req.query.customerId;
	knex.select('c.custom_db')
		.from(table.tbl_Customer + ' as c')
		.where('id', '=', "" + customer_id + "")
		// .orderBy('ar.id', 'desc')
		.then((response) => {
			let details = response[0]['custom_db']
			res.send({
				response: JSON.parse(details)
			});
		}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Contact list ' }); throw err });
}

function updateUserProfile(req, res) {
	let userId = parseInt(req.body.user.user_id);
	let country_id = req.body.user.country;
	let country_code = req.body.user.country_code;
	let time_zone = req.body.user.time_zone;
	let token = req.body.user.token;
	let profileImg = req.body.user.profile_img;
	let threshold = req.body.user.threshold;
	let isSMSNotification = req.body.user.sms_notification; //sms_notification
	if (isSMSNotification === true || isSMSNotification == 1) {
		isSMSNotification = "1";
	} else {
		isSMSNotification = "0";
	}
	let isEmailNotification = req.body.user.email_notification; //email_notification
	if (isEmailNotification === true || isEmailNotification == 1) {
		isEmailNotification = "1";
	} else {
		isEmailNotification = "0";
	}

	if (req.body.role === "4" || req.body.role === "5") {
		let sql = knex(table.tbl_Customer)
			.where("id", "=", "" + userId + "")
			.update({
				first_name: knex.raw('TRIM("' + req.body.user.first_name + '")'),
				last_name: knex.raw('TRIM("' + req.body.user.last_name + '")'),
				email: knex.raw('TRIM("' + req.body.user.email + '")'),
				notification_email: knex.raw('TRIM("' + req.body.user.notification_email + '")'),
				mobile: "" + req.body.user.mobile + "",
				country_id: "" + country_id + "",
				country_code: "" + country_code + "",
				time_zone_id: "" + time_zone + "",
			});
		sql.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		});
	} else if (req.body.role === "0") {
		let phone = parseInt(req.body.user.company_phone);
		let accountNo = parseInt(req.body.user.account_no);
		knex(table.tbl_Customer)
			.where("id", "=", "" + userId + "")
			.update({
				first_name: knex.raw('TRIM("' + req.body.user.first_name + '")'),
				last_name: knex.raw('TRIM("' + req.body.user.last_name + '")'),
				email: knex.raw('TRIM("' + req.body.user.email + '")'),
				notification_email: knex.raw('TRIM("' + req.body.user.notification_email + '")'),
				mobile: "" + req.body.user.mobile + "",
				username: "" + req.body.user.username + "",
				account_number: "" + accountNo + "",
				country_id: "" + country_id + "",
				country_code: +country_code + "",
				time_zone_id: "" + time_zone + "",
			})
			.then((response) => {
				if (response) {
					knex(table.tbl_Company_info)
						.update({
							phone: "" + phone + "",
							name: knex.raw('TRIM("' + req.body.user.company_name + '")'),
							address: knex.raw(
								'TRIM("' + req.body.user.company_address + '")'
							),
							domain: knex.raw('TRIM("' + req.body.user.domain + '")'),
						})
						.then((response) => {
							if (response) {
								res.json({
									response,
								});
							} else {
								res.status(401).send({ error: "error", message: "DB Error" });
							}
						});
				} else {
					res.status(401).send({ error: "error", message: "DB Error" });
				}
			});
	}
	else if (req.body.role === "3") {
		let phone = parseInt(req.body.user.company_phone);
		let accountNo = parseInt(req.body.user.account_no);
		let sql = knex(table.tbl_Customer)
			.where("id", "=", "" + userId + "")
			.update({
				first_name: knex.raw('TRIM("' + req.body.user.first_name + '")'),
				last_name: knex.raw('TRIM("' + req.body.user.last_name + '")'),
				email: knex.raw('TRIM("' + req.body.user.email + '")'),
				notification_email: knex.raw('TRIM("' + req.body.user.notification_email + '")'),
				mobile: "" + req.body.user.mobile + "",
				phone: "" + req.body.user.company_phone + "",
				domain: knex.raw('TRIM("' + req.body.user.domain + '")'),
				username: "" + req.body.user.username + "",
				account_number: "" + accountNo + "",
				country_id: "" + country_id + "",
				country_code: "" + req.body.user.country_code + "",
				company_address: "" + req.body.user.company_address + ""
			})
		sql.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		});
	}
	else if (req.body.role === "1") {
		knex(table.tbl_Customer)
			.where("id", "=", "" + userId + "")
			.update({
				first_name: knex.raw('TRIM("' + req.body.user.first_name + '")'),
				last_name: knex.raw('TRIM("' + req.body.user.last_name + '")'),
				email: knex.raw('TRIM("' + req.body.user.email + '")'),
				notification_email: knex.raw('TRIM("' + req.body.user.notification_email + '")'),
				mobile: "" + req.body.user.mobile + "",
				phone: "" + req.body.user.company_phone + "",
				domain: knex.raw('TRIM("' + req.body.user.domain + '")'),
				country_id: "" + country_id + "",
				country_code: "" + country_code + "",
				time_zone_id: "" + time_zone + "",
				token: "" + token + "",
				is_sms_notification: "" + isSMSNotification + "",
				is_email_notification: "" + isEmailNotification + "",
				threshold: "" + threshold + "",
			})
			.then((response) => {
				if (response) {
					res.json({
						response,
					});
				} else {
					res.status(401).send({ error: "error", message: "DB Error" });
				}
			});
	}
}

function UpdateProfile(req, res) {
	let data = req.body.crdentials;
	if (req.body.role === "1") {
		knex(table.tbl_Customer)
			.where("id", "=", "" + data.user_id + "")
			.update({ profile_img: "" + data.profile_img + "" })
			.then((response) => {
				if (response) {
					res.json({
						response,
					});
				} else {
					res.status(401).send({ error: "error", message: "DB Error" });
				}
			});
	}
}

function getCustomers(req, res) {
	knex
		.select(
			"c.*",
			knex.raw("GROUP_CONCAT(DISTINCT (map.product_id)) as product_id"),
			knex.raw("GROUP_CONCAT(DISTINCT(pro.name)) as product_name"),
			knex.raw("GROUP_CONCAT(pack.id) as package_id"),
			knex.raw("GROUP_CONCAT(pack.name) as package_name")
		)
		.from(table.tbl_Customer + " as c")
		.leftJoin(
			table.tbl_Map_customer_package + " as map",
			"c.id",
			"map.customer_id"
		)
		.leftJoin(table.tbl_Product + " as pro", "map.product_id", "pro.id")
		.leftJoin(table.tbl_Package + " as pack", "pack.id", "map.package_id")
		.whereIn("c.role_id", ["1"])
		.whereNotIn("c.status", ["0", "2"])
		.groupBy("map.customer_id")
		.orderBy("c.id", "desc")
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getInternalUserById(req, res) {
	knex
		.from(table.tbl_Customer + " as c")
		.where("c.id", "=", "" + req.query.id + "")
		.select("c.*")
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		});
}

function getCustomerName(req, res) {
	knex(table.tbl_Customer)
		.where("email", "=", "" + req.query.email + "")
		.select(knex.raw("CONCAT(first_name, ' ',last_name) as name"))
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		})
		.catch((err) => {
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getCustomerEmail(req, res) {
	knex
		.select("id", "email")
		.from(table.tbl_Customer)
		.where("first_name", "=", "" + req.query.name + "")
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		})
		.catch((err) => {
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getCustomercompany(req, res) {
	let id = parseInt(req.query.productId);
	let sql = knex
		.distinct()
		.select("c.id", "c.company_name")
		.from(table.tbl_Customer + " as c")
		.leftJoin(
			table.tbl_Map_customer_package + " as map",
			"c.id",
			"map.customer_id"
		)
		.leftJoin(table.tbl_Product + " as pro", "map.product_id", "pro.id")
		.where("pro.id", "=", "" + id + "")
		.whereIn("c.role_id", ["1"])
		.whereIn("c.status", ["1"])
		.orderBy("c.company_name", "asc")
	sql.then((response) => {
		res.json({
			response,
		});
	})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}
function getCustomercompanyReseller(req, res) {
	let p_id = parseInt(req.query.productId);
	let sql = knex
		.distinct()
		.select("c.id", "c.company_name")
		.from(table.tbl_Customer + " as c")
		.leftJoin(
			table.tbl_Map_customer_package + " as map",
			"c.id",
			"map.customer_id"
		)
		.leftJoin(table.tbl_Product + " as pro", "map.product_id", "pro.id")
		.where("pro.id", "=", "" + p_id + "")
		.andWhere('c.created_by', req.query.id)
		.whereIn("c.role_id", ["1"])
		.whereIn("c.status", ["1"])
		.orderBy("c.company_name", "asc")

	sql.then((response) => {
		res.json({
			response,
		});
	})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getAccountManagerCustomercompany(req, res) {
	let id = parseInt(req.query.accountManagerId);

	knex
		.select("id", "company_name")
		.from(table.tbl_Customer)
		.where("account_manager_id", "=", "" + id + "")
		.whereIn("role_id", ["1"], ["0"])
		.whereNotIn("status", ["2"])
		.orderBy("company_name", "asc")
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function resetPassword(req, res) {
	if (req.query.action == "admin") {
		const passwordInput = encrypt.encryptAes(req.query.newPassword);
		knex(table.tbl_Customer)
			.where("email", "=", "" + req.query.email + "")
			.update({ password: passwordInput })
			.then((response) => {
				if (response > 0) {
					pushEmail.getCustomerName(req.query.email).then((data) => {
						pushEmail
							.getEmailContentUsingCategory("ChangePassword")
							.then((val) => {
								pushEmail.sendmail({ data: data, val: val }).then((data1) => {
									res.json({ data1 });
								});
							});
					});
				}
			})
			.catch((err) => {
				console.log(err);
				res
					.status(401)
					.send({ error: "error", message: "DB Error: " + err.message });
				throw err;
			});
	} else if (req.query.action == "extension") {
		const passwordInput = req.query.newPassword;
		knex(table.tbl_Extension_master)
			.where("email", "=", "" + req.query.email + "")
			.update({ ext_web_password: passwordInput })
			.then((response) => {
				if (response === 1) {
					pushEmail.getCustomerName(req.query.email).then((data) => {
						pushEmail
							.getEmailContentUsingCategory("ChangePassword")
							.then((val) => {
								pushEmail.sendmail({ data: data, val: val }).then((data1) => {
									res.json({ data1 });
								});
							});
					});
				}
			})
			.catch((err) => {
				console.log(err);
				res
					.status(401)
					.send({ error: "error", message: "DB Error: " + err.message });
				throw err;
			});
	}
}

async function manageFeaturesCharge(value, customer_id) {
	const result = await knex.select(
		'gfm.amount as featureCharge',
		'gfm.unit_Type as type',
		'gfr.feature_name as feature_name',
		'gfr.id'
	)
		.from(table.tbl_pbx_global_feature_mapping + ' as gfm')
		.leftJoin(table.tbl_Pbx_global_feature_rate + ' as gfr', 'gfm.global_feature_id', 'gfr.id')
		.where('feature_plan_id', value[0]['featureRate']);
	let insertArray = [];
	result.map(item => {

		if (item.type != 2) {
			return;
		}
		let amount = item.featureCharge;
		let charge_type = '';
		let description = '';

		if (item.id == 8 && value[0]['plugin'] != "Y") {
			amount = 0;
		}

		switch (item.id) {
			case 1:
				charge_type = '9';
				description = "Payment adjustment for Speed Dial";
				break;
			case 2:
				charge_type = '9';
				description = "Payment adjustment for Conference";
				break;
			case 3:
				charge_type = '9';
				description = "Payment adjustment for IVR";
				break;
			case 4:
				charge_type = '9';
				description = "Payment adjustment for Queue";
				break;
			case 5:
				charge_type = '9';
				description = "Payment adjustment for Call Group";
				break;
			case 6:
				charge_type = '9';
				description = "Payment adjustment for Call Recording";
				break;
			case 9:
				charge_type = '9';
				description = "Payment adjustment for VMN";
				break;
			case 11:
				charge_type = '9';
				description = "Payment adjustment for Voicemail";
				break;
			case 7:
				if (item.type == 2) {
					charge_type = '9';
					description = "Payment adjustment for Monthly Extension Charge";
				}
				break;
			case 8:
				charge_type = '9';
				description = "Payment adjustment for C2C Plugin";
				break;
		}

		insertArray.push({
			product_id: 1,
			customer_id: customer_id,
			amount: amount,
			charge_type: charge_type,
			description: description,
			charge_status: 0
		});
	});
	await knex(table.tbl_Charge).insert(insertArray);
}

//done
async function createUser(req, res) {
	let request = req.body;

	console.log(request, "request on create customer")
	if (request.user_type == '2' || request.user_type == '4' || request.user_type == '5') {
		request.account_manager = '0'
	}
	else {
		request.account_manager = request.account_manager
	}
	let id = request.id ? request.id : null;
	let url = req.protocol + '://' + req.get('host');
	let userTypeVal = '';
	let permission_id = 0;
	let plugin = request.plugin;
	if (plugin == null || plugin == false) {
		plugin = 'N';
		knex(table.tbl_Extension_master)
			.update({ status: '0' })
			.where('customer_id', id)
			.andWhere('plug_in', '1')
			.then((resp) => {
			});
	} else {
		plugin = 'Y';
	}
	if (!id) {
		if (request.user_type == '1') { userTypeVal = 'CustomerCreation' }
		else if (request.user_type == '2') { userTypeVal = 'SubAdminCreation'; permission_id = request.permission_type }
		else if (request.user_type == '3') { userTypeVal = 'ResellerCreation'; permission_id = request.permission_type != "" ? request.permission_type : 0 }
		else userTypeVal = 'InternalUserCreation';
	}
	else {
		if (request.user_type == '1') { userTypeVal = 'CustomerUpdation' }
		else if (request.user_type == '2') { userTypeVal = 'SubAdminCreation' }
		else if (request.user_type == '3') { userTypeVal = 'ResellerCreation' }
		else userTypeVal = 'InternalUserUpdation';
	}
	// if (request.user_type == '2' || request.user_type == 2) {
	//     request.permission_type = request.permission_type ? "'" + request.permission_type + "'" : '0';

	// }
	let states = '';
	if (request.country_code !== '+91') {
		states = ''
	} else {
		states = request.states
	}
	if (!request.PBXid && request.user_type == '3' && (!request.reseller_type == '1' || !request.reseller_type == '2' || !request.reseller_type == '3')) {
		request.permission_type = 0;
	}
	else if (!request.reseller_type && (request.user_type == '2' || request.user_type == 2)) {
		request.permission_type = request.permission_type ? "'" + request.permission_type + "'" : '0';
		// request.permission_type = 0;
	}
	else if (!request.reseller_type && (request.user_type != '2' || request.user_type != 2)) {
		request.permission_type = 0;
	}
	// else{
	// 	request.permission_type = request.permission_type;
	// }
	if (request.reseller_type == '1' || request.reseller_type == '2' || request.reseller_type == '3') {
		request.permission_type = request.permission_type;
	}
	// if(!request.reseller_type && (request.user_type == '2' || request.user_type == 2)) {
	// 	request.permission_type = request.permission_type ? "'" + request.permission_type + "'" : '0';
	// 	request.permission_type = 0;
	// }
	// else if(!request.reseller_type && (request.user_type != '2' || request.user_type != 2)){
	// 	request.permission_type = 0;
	// }
	request.request_hit = request.request_hit ? "'" + request.request_hit + "'" : '0';
	if (!request.user_type == '3') {
		request.permission_type = request.permission_type != "null" && request.permission_type != "" ? "'" + request.permission_type + "'" : 0;
	}
	request.date = request.date ? request.date : '00/00/0000';
	request.total_hit = request.total_hit ? "'" + request.total_hit + "'" : null;
	// request.permission_type = request.permission_type ? "'" + request.permission_type + "'" : '0';
	let profile_img = "assets/uploads/Profile-Image.png";
	let isCirlce = (request.isCircle == true) ? '1' : '0';
	let issetDate = (request.isSetDate == true) ? '1' : '0';
	let isAPItoken = (request.apiToken == true) ? '1' : '0';
	let isNotificationEmail = request.is_notification_email == true ? '1' : '0';
	let cli_type = request.cli_type == true ? '1' : '0';
	request.circle = request.circle ? request.circle : '';
	request.token = request.token ? request.token : '';

	request.extension_length_limit = request.extension_length_limit ? request.extension_length_limit : 0;
	request.monthly_international_threshold = request.monthly_international_threshold ? request.monthly_international_threshold : 0;
	request.invoice_day = request.invoice_day ? request.invoice_day : 0;
	request.advance_payment = request.advance_payment ? request.advance_payment : 0.00;
	let advance_balance = request.advance_payment;
	let balance = Math.abs(request.balance);
	if (!req.body.credit_limit) {
		request.credit_limit = 0
	} else {
		request.credit_limit = Math.abs(request.credit_limit);
	}
	request.commission = request.commission ? request.commission : 0;
	request.occommission = request.occommission ? request.occommission : 0;
	if (request.balance == '.') {
		request.balance = 0.00;
	}
	else {
		request.balance = request.balance ? request.balance : 0.00;
	}
	if (request.ocbalance == '.') {
		request.ocbalance = 0.00;
	}
	else {
		request.ocbalance = request.ocbalance ? request.ocbalance : 0.00;
	}
	request.callback_url = request.callback_url ? request.callback_url : '';
	request.dialout_group = request.dialout_group ? request.dialout_group : 0;
	request.notification_email = request.notification_email ? request.notification_email : '';
	request.company = request.company ? request.company : '';
	request.states = request.states ? request.states : '';
	request.threshold = request.threshold ? request.threshold : '0';
	request.permission_type = request.permission_type ? request.permission_type : '0';
	let isIntercom = (request.intercom_calling == true) ? '1' : '0';
	let isEnterprise = (request.enterprise_directory == true) ? '1' : '0';
	let pan_number = request.pan_number ? request.pan_number.toUpperCase() : "";
	let p_i_number = request.p_i_number ? request.p_i_number.toUpperCase() : "";
	let p_o_number = request.p_o_number ? request.p_o_number.toUpperCase() : "";

	let password;

	if (!request.id) {
		password = encrypt.encryptAes(Math.random().toString(36).slice(-8));
	} else {
		password = await knex.from(table.tbl_Customer).select('password').where('id', request.id);
	}

	request.credit_limit = request.credit_limit ? request.credit_limit : 0;
	request.is_dunning = request.is_dunning == true ? '1' : '0';
	let sql = knex.raw("Call pbx_create_customer(" + id + ",'" + request.f_name + "','" + request.l_name + "','" + request.email + "','" +
		request.mobile + "','" + request.username + "','" + password.toString() + "','" +
		Math.round(+new Date() / 1000) + "','" + request.company + "','" + request.company_address + "','" + request.company_phone + "','" +
		request.user_type + "','" + request.domain + "','" + request.user_id + "','" + request.status + "','" + request.account_manager + "','" +
		request.country + "','" + request.country_code + "','" + request.time_zone + "','" + request.billing_type + "','" +
		request.balance + "','" + request.credit_limit + "','" + request.gst_number + "','" + request.pbx_package_name + "' ,'" + request.oc_package_name + "','" +
		request.product_name + "', '" + request.states + "', '" + isCirlce + "','" + request.circle + "', '" + isAPItoken + "', '" + request.token + "','" + permission_id + "'," +
		(request.product_name ? (request.product_name).length : 1) + "," + request.extension_length_limit + "," + request.monthly_international_threshold + "," + request.invoice_day + "," +
		advance_balance + ",'" + request.callback_url + "'," + request.dialout_group + ",'" + isNotificationEmail + "','" + request.notification_email + "','" + request.ip + "','" + profile_img + "','" + plugin + "','" + cli_type + "','" + request.threshold + "','" + isIntercom + "','" + isEnterprise + "'," + request.request_hit + ",'" + request.date + "'," + request.permission_type + ", '" + issetDate + "','" + request.is_dunning + "','" + pan_number + "','" + p_o_number + "','" + p_i_number + "','" + request.threshold_balance_notification + "')")
	console.log(sql.toQuery());
	sql.then(async (response) => {
		if (response) {
			let input = {};
			if (id !== null) {
				if (request.user_type == '3' || request.user_type == 3) {
					let reseller_product = []
					reseller_product.push(request.reseller_type, request.ocreseller_type);
					let balanceArray = [];
					balanceArray.push(request.balance, request.ocbalance);
					let commissionArray = [];
					commissionArray.push(request.commission, request.occommission);
					const maxIdQuery = knex.select(knex.max('id').as('maxId')).from(table.tbl_Customer)
					maxIdQuery.then(result => {
						const maxId = result[0].maxId; // Access the result using the alias
						if (request.PBXid) {
							for (let i = 0; i < request.product_name.length; i++) {
								const element = reseller_product[i];
								let updatePBX = knex(table.tbl_pbx_reseller_info)
									.update({
										// product_id: request.product_name[i],
										reseller_type_id: reseller_product[i],
										balance: balanceArray[i],
										commission_per: commissionArray[i],
										reseller_id: request.id,
									}).where("id", request.PBXid).andWhere('product_id', request.product_name[i])
								updatePBX.then((response3) => {
								})

							}
						}
						if (request.OCid) {
							for (let i = 0; i < request.product_name.length; i++) {
								const element = reseller_product[i];
								let updateOC = knex(table.tbl_pbx_reseller_info)
									.update({
										// product_id: request.product_name[i],
										reseller_type_id: reseller_product[1],
										balance: balanceArray[1],
										commission_per: commissionArray[1],
										reseller_id: request.id,
									}).where("id", request.OCid).andWhere('product_id', request.product_name[i])
								updateOC.then((response3) => {
								})

							}
						}
						// const element = request.product_name[i];
						if (!request.PBXid && (request.reseller_type == '1' || request.reseller_type == '2' || request.reseller_type == '3')) {
							//    for (let i = 0; i < request.product_name.length; i++) {
							let checkPBX = knex(table.tbl_pbx_reseller_info)
								.insert({
									product_id: '1',
									reseller_type_id: reseller_product[0],
									balance: balanceArray[0],
									commission_per: commissionArray[0],
									reseller_id: request.id,
								})
							checkPBX.then((response3) => {
							})

							//    }
						}
						if (!request.OCid && (request.ocreseller_type == '1' || request.ocreseller_type == '2' || request.ocreseller_type == '3')) {
							//    for (let i = 0; i < request.product_name.length; i++) {
							let checkOC = knex(table.tbl_pbx_reseller_info)
								.insert({
									product_id: '2',
									reseller_type_id: reseller_product[1],
									balance: balanceArray[1],
									commission_per: commissionArray[1],
									reseller_id: request.id,
								})
							checkOC.then((response3) => {
							})

							//    }
						}
						// 		for (let j = 0; j < request.product_name.length; j++) {
						// 			// const element = array[j];
						// 			knex(table.tbl_pbx_reseller_commission)
						// 			.update({
						// 				payment_type: 0,
						// 				ref_id: 0,
						// 				customer_id: 0,
						// 				amount: balanceArray[j],
						// 				reseller_id: maxId,
						// 				reseller_type_id: reseller_product[j],
						// 				commission_percent: commissionArray[j],
						// 			}).where("id",request.id).then((response4) =>{
						// 			})

						// 		}
					})
						.catch(error => {
							console.error('Error executing query:', error.message);
						})
				}
			}
			if (id === null) { // only for new customer creation  
				if (request.user_type == '3') {
					let reseller_product = []
					reseller_product.push(request.reseller_type, request.ocreseller_type);
					let balanceArray = [];
					balanceArray.push(request.balance, request.ocbalance);
					let commissionArray = [];
					commissionArray.push(request.commission, request.occommission);
					const maxIdQuery = knex.select(knex.max('id').as('maxId')).from(table.tbl_Customer)
					maxIdQuery.then(result => {
						// const maxId = result[0].maxId; // Access the result using the alias
						// let obj = [];
						// for (let i = 0; i < request.product_name.length; i++) {
						// 	obj.push({product_id: request.product_name[i],
						// 		reseller_type_id: request.reseller_type,
						// 		commission_per: request.commission,
						// 		reseller_id: maxId});
						// }
						// knex(table.tbl_pbx_reseller_commission)
						// 	.insert(
						// 	obj
						// 	).then((response3) =>{
						// 	})
						const maxId = result[0].maxId; // Access the result using the alias
						if (request.ocreseller_type != '' && request.reseller_type == '') {
							let sqll = knex(table.tbl_pbx_reseller_info)
								.insert({
									product_id: request.product_name,
									reseller_type_id: reseller_product[1],
									balance: balanceArray[1],
									commission_per: commissionArray[1],
									reseller_id: maxId,
								})
							sqll.then((response5) => {
							})
						}
						else if (request.reseller_type != '' && request.ocreseller_type == '') {
							let sqll = knex(table.tbl_pbx_reseller_info)
								.insert({
									product_id: request.product_name,
									reseller_type_id: reseller_product[0],
									balance: balanceArray[0],
									commission_per: commissionArray[0],
									reseller_id: maxId,
								})
							sqll.then((response7) => {
							})
						}
						else if (request.reseller_type != '' && request.ocreseller_type != '') {
							for (let i = 0; i < request.product_name.length; i++) {
								const element = reseller_product[i];
								let sqll = knex(table.tbl_pbx_reseller_info)
									.insert({
										product_id: request.product_name[i],
										reseller_type_id: reseller_product[i],
										balance: balanceArray[i],
										commission_per: commissionArray[i],
										reseller_id: maxId,
									})
								sqll.then((response3) => {
								})

							}
						}

						if (request.ocreseller_type != '' && request.reseller_type == '') {
							knex(table.tbl_pbx_reseller_commission)
								.insert({
									payment_type: 0,
									ref_id: 0,
									customer_id: 0,
									amount: balanceArray[1],
									reseller_id: maxId,
									reseller_type_id: reseller_product[1],
									commission_percent: commissionArray[1],
								}).then((response4) => {
								})
						}

						else if (request.reseller_type != '' && request.ocreseller_type == '') {
							knex(table.tbl_pbx_reseller_commission)
								.insert({
									payment_type: 0,
									ref_id: 0,
									customer_id: 0,
									amount: balanceArray[0],
									reseller_id: maxId,
									reseller_type_id: reseller_product[0],
									commission_percent: commissionArray[0],
								}).then((response4) => {
								})
						}
						else if (request.reseller_type != '' && request.ocreseller_type != '') {
							for (let j = 0; j < request.product_name.length; j++) {
								// const element = array[j];
								knex(table.tbl_pbx_reseller_commission)
									.insert({
										payment_type: 0,
										ref_id: 0,
										customer_id: 0,
										amount: balanceArray[j],
										reseller_id: maxId,
										reseller_type_id: reseller_product[j],
										commission_percent: commissionArray[j],
									}).then((response4) => {
									})

							}
						}
					}).catch(error => {
						console.error('Error executing query:', error.message);
					})
				}
				let customer_id = response[0][0][0]['lastInserted'];
				const payload = { 'id': customer_id, 'package_id': "", 'customer_id': customer_id, 'ext_number': '', 'token': '', 'user_type': request.user_type };
				const upgradeToken = jwt.sign(payload, config.jwtSecret);
				updateCustomerToken(upgradeToken, customer_id);
				if (request.user_type == '2') {
					updateCustomerPermission(permission_id, request.f_name + " " + request.l_name, request.user_id);
				}

				let sql2 = knex.from(table.tbl_Package + ' as pack')
					.leftJoin(table.tbl_PBX_features + ' as f', 'f.id', 'pack.feature_id')
					.leftJoin(table.tbl_Call_Plan_Rate + ' as cpr', function () {
						this.on(function () {
							this.on('f.bundle_plan_id', '=', 'cpr.call_plan_id')
							this.orOn('f.roaming_plan_id', '=', 'cpr.call_plan_id')
							this.orOn('f.teleConsultancy_call_plan_id', '=', 'cpr.call_plan_id')
							this.orOn('f.out_bundle_call_plan_id', '=', 'cpr.call_plan_id')
						})
					})
					.select('cpr.*')
					.where('pack.id', request.pbx_package_name)
					.andWhere('cpr.customer_id', 0)
				sql2.then((responses => {
					if (responses) {
						for (let i = 0; i < responses.length; i++) {
							if (responses[i].is_group != '0') {
								let sqll = knex.select('*')
									.from(table.tbl_pbx_call_rate_group)
									.where('id', responses[i].group_id)
								sqll.then((resp) => {
									if (resp.length) {
										knex(table.tbl_pbx_call_rate_group)
											.insert({
												customer_id: customer_id,
												name: resp[0].name,
												minutes: resp[0].minutes,
												used_minutes: resp[0].used_minutes
											}).then((respon) => {
												knex(table.tbl_Call_Plan_Rate)
													.insert({
														call_plan_id: responses[i].call_plan_id,
														customer_id: customer_id,
														dial_prefix: responses[i].dial_prefix,
														buying_rate: responses[i].buying_rate,
														selling_rate: responses[i].selling_rate,
														selling_min_duration: responses[i].selling_min_duration,
														selling_billing_block: responses[i].selling_billing_block,
														status: responses[i].status,
														gateway_id: responses[i].gateway_id,
														phonecode: responses[i].phonecode,
														area_code: responses[i].area_code,
														is_group: responses[i].is_group,
														group_id: respon,
														talktime_minutes: responses[i].talktime_minutes,
														used_minutes: responses[i].used_minutes,
														actual_minutes: responses[i].actual_minutes,
														booster_minutes: responses[i].booster_minutes,
														plan_type: responses[i].plan_type,
														booster_for: responses[i].booster_for,
														expiry_date: 0
													}).then((response3) => {
														console.log(response3, "---res 3---");
														if (response3.length) {

															let sql = knex.table(table.tbl_Call_Plan).where('id', responses[i].id).update({
																mapped: responses[i].mapped + 1
															})
															console.log(sql.toQuery());
															sql.then((responses4) => {

															})
														}


													})
											})
									}
								})
							} else {
								if (responses.length > 0) {
									let sql = knex(table.tbl_Call_Plan_Rate)
										.insert({
											call_plan_id: responses[i].call_plan_id,
											customer_id: customer_id,
											dial_prefix: responses[i].dial_prefix,
											buying_rate: responses[i].buying_rate,
											selling_rate: responses[i].selling_rate,
											selling_min_duration: responses[i].selling_min_duration,
											selling_billing_block: responses[i].selling_billing_block,
											status: responses[i].status,
											gateway_id: responses[i].gateway_id,
											phonecode: responses[i].phonecode,
											area_code: responses[i].area_code,
											is_group: responses[i].is_group,
											group_id: '0',
											talktime_minutes: responses[i].talktime_minutes,
											used_minutes: responses[i].used_minutes,
											actual_minutes: responses[i].actual_minutes,
											booster_minutes: responses[i].booster_minutes,
											plan_type: responses[i].plan_type,
											booster_for: responses[i].booster_for,
											expiry_date: 0
										})

									sql.then((response3) => {
										console.log(response3, "---res 3---");
										if (response3.length) {

											let sql = knex.table(table.tbl_Call_Plan_Rate).where('id', responses[i].id).update({
												mapped: responses[i].mapped + 1
											})
											console.log(sql.toQuery());
											sql.then((responses4) => {

											})
										}

									})

								}
							}
						}
					}
				}))

				knex(table.tbl_Package + ' as p').leftJoin(table.tbl_PBX_features + ' as f', 'p.feature_id', 'f.id')
					.leftJoin(table.tbl_Call_Plan + ' as cp', function () {
						this.on(function () {
							this.on('f.bundle_plan_id', '=', 'cp.id')
							this.orOn('f.out_bundle_call_plan_id', '=', 'cp.id')
							this.orOn('f.roaming_plan_id', '=', 'cp.id')
							this.orOn('f.teleConsultancy_call_plan_id', '=', 'cp.id')
						})
					})
					.leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpefm', 'bpefm.bundle_plan_id', 'cp.id')
					.where('p.id', request.pbx_package_name).distinct(knex.raw('(sum(bpefm.charge) + cp.charge) as charge'))
					.select(knex.raw('IF(cp.plan_type = "1" ,"did_bundle", IF(cp.plan_type = "2", "roaming_plan", IF(cp.plan_type = "5", "outgoing_bundle","tc_plan"))) as plan'), 'cp.name', 'cp.plan_type')
					.groupBy('cp.id').then((responses) => {
						if (responses.length) {
							let obj = [];
							responses.forEach(element => {
								obj.push({ minute_plan: element.name, charge: element.charge, plan_type: element.plan_type, customer_id: customer_id, package_id: request.pbx_package_name });
							})
							knex(table.tbl_pbx_minutePlan_history).insert(obj).then(response => {

							})
						}
					})

				if (request.user_type == '1') {
					const result = await knex.select('f.is_feature_rate as isFeatureRate', 'f.feature_rate_id as featureRate', 'c.plugin').from('pbx_feature as f').leftJoin('package as p', 'p.feature_id', 'f.id')
						.leftJoin('map_customer_package as mcp', 'mcp.package_id', 'p.id')
						.leftJoin('customer as c', 'c.id', 'mcp.customer_id')
						.where('c.id', customer_id);
					result[0]['featureRate'] != "" ? manageFeaturesCharge(result, customer_id) : "";
				}
			}
			if ((request.user_type == '1') && (response[0][0][0].MYSQL_SUCCESSNO == 200) && (id == null)) {
				ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted, 0755, function (err) {
					if (err) { console.log("customer dir not created. " + err); }
					else {
						ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted + '/prompts', 0755, function (err) {
							if (err) { console.log("prompts dir not created. " + err); }
							else { console.log("prompts dir created."); }
						});

						ensureExists(
							__dirname +
							"/../upload/" +
							response[0][0][0].lastInserted +
							"/vm",
							0755,
							function (err) {
								if (err) {
									console.log("vm dir not created. " + err);
								} else {
									console.log("vm dir created.");
								}
							}
						);

						ensureExists(
							__dirname +
							"/../upload/" +
							response[0][0][0].lastInserted +
							"/recording",
							0755,
							function (err) {
								if (err) {
									console.log("recording dir not created. " + err);
								} else {
									console.log("recording dir created.");
								}
							}
						);
					}
				}
				);
			}
			if (request.status == "2") {
				// Delete the customer
				generateInvoiceAmount(id);
			}
			// res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, user_id: response[0][0][0].lastInserted });
			let newdata = {
				userName: request.f_name,
				email: request.email,
				url: url,
			};
			pushEmail.getEmailContentUsingCategory(userTypeVal).then((val) => {
				const decrypted = encrypt.decryptAes(!request.id ? password.toString() : password[0].password.toString());
				pushEmail
					.sendmail({
						data: newdata,
						val: val,
						username: request.username,
						password: decrypted,
					})
					.then((data1) => {
						console.log(data1)
						//res.json({ data1 })
					});
			});
			// updateChargeForMinutePlan(request.pbx_package_name, response[0][0][0].lastInserted);
			res.send({
				code: response[0][0][0].MYSQL_SUCCESSNO,
				message: response[0][0][0].MESSAGE_TEXT,
			});

			input['User Type'] = req.body.user_type;
			input['Is Notification Email'] = request.is_notification_email != null ? 1 : 0;
			input['Notification Email'] = request.notification_email;
			input['Account Manager'] = request.account_manager;
			input['Pbx Reseller Type'] = req.body.reseller_type == '1' ? 'Prepaid Reseller' : req.body.reseller_type == '2' ? "Channel Partner" : "Privileges Channel Partner";
			input['Oc Reseller Type'] = req.body.ocreseller_type == '1' ? 'Prepaid Reseller' : req.body.ocreseller_type == '2' ? "Channel Partner" : "Privileges Channel Partner";
			input['Name'] = req.body.f_name + req.body.l_name;
			input['Username'] = req.body.username;
			input['Email'] = req.body.email;
			input['Mobile Number'] = req.body.country_code + req.body.mobile;
			input['Status'] = req.body.status;
			input['Country'] = req.body.country_name;
			input['Address'] = req.body.address;
			if (req.body.country == 99) {
				input['State'] = req.body.state_name;
			}
			if (req.body.reseller_type == '1') {
				input['Pbx Prepaid Balance'] = req.body.balance;
				input['Pbx Commission'] = req.body.commission;
			}
			if (req.body.ocreseller_type == '1') {
				input['Oc Prepaid Balance'] = req.body.ocbalance;
				input['Oc Commission'] = req.body.occommission;
			}

			if (req.body.reseller_type == '2' || req.body.reseller_type == '3') {
				input['Pbx Commission Balance'] = req.body.balance;
				input['Pbx Comission %'] = req.body.commission;
			}

			if (req.body.reseller_type == '2' || req.body.reseller_type == '3') {
				input['Oc Commission Balance'] = req.body.ocbalance;
				input['Oc Comission %'] = req.body.occommission;
			}

			if (request.product_name[0] == 1) {
				input["PBX"] = 1;
				input['Permission'] = req.body.permission_name;
			}
			if (request.product_name[1] == 2) {
				input['Outbound Conference'] = 1
			}
			createModuleLog(table.tbl_pbx_audit_logs, {
				module_action_id: req.body.id ? req.body.id : response[0][0][0]['lastInserted'],
				module_action_name: req.body.username,
				module_name: "reseller",
				message: "Reseller Created",
				customer_id: req.body.user_id,
				features: "" + JSON.stringify(input) + "",
			});
		}
	})
		.catch((err) => {
			res.send({ code: err.errno, message: err.sqlMessage });
		});
}

function ensureExists(path, mask, cb) {
	fs.mkdir(path, mask, function (err) {
		if (err) {
			if (err.code == "EEXIST") cb(null);
			else cb(err);
		} else cb(null);
	});
}

function getInternalUsersByFilters(req, res) {
	let data = req.body.filters;
	data.by_name = data.by_name ? "'" + data.by_name + "'" : null;
	data.by_mobile = data.by_mobile ? "'" + data.by_mobile + "'" : null;
	data.by_email = data.by_email ? "'" + data.by_email + "'" : null;
	data.by_status = data.by_status ? "'" + data.by_status + "'" : null;
	data.by_user_role = data.by_user_role ? "'" + data.by_user_role + "'" : null;
	data.by_permission = data.by_permission ? "'" + data.by_permission + "'" : null;
	knex
		.raw(
			"Call pbx_getinternalusersbyfilters(?, ?, ?, ?, ?, ?)", [data.by_mobile, data.by_email, data.by_status, data.by_name, data.by_user_role, data.by_permission])
		.then((response) => {
			if (response) {
				res.send({ response: response[0][0] });
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getInternalUser(req, res) {
	// if (req.query.role == 3) {
	// 	let sql =knex.select('first_name').from(table.tbl_Customer)
	// 	.where('id',req.query.ResellerID)
	// 	sql.then((response) => {
	// 		if (response) {
	// 			res.send({ response: response[0][0] });
	// 		}
	// 	})
	// 	.catch((err) => {
	// 		res.send({ response: { code: err.errno, message: err.sqlMessage } });
	// 	});
	// }
	// else{
	if (req.role != 0) {
		return res.send({ response: { code: 401, message: "Action not allowed" } });
	}
	let sql = knex
		.raw("Call pbx_get_internalcustomer()")
	sql.then((response) => {
		if (response) {
			res.send({ response: response[0][0] });
		}
	})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}


function getAllUser(req, res) {
	var flags = "";

	knex
		.raw("Call pbx_getAllUser()")
		.then(async (response) => {
			if (response) {
				let Map = response ? response[0] : null;
				await Map[0].map((data) => {
					const bundlePromise = knex
						.select("bp.id")
						.from(table.tbl_pbx_bundle_plan + " as bp")
						.leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
						.leftJoin(
							table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
							"bpm.bundle_plan_id",
							"bp.id"
						)
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.bundle_plan_id",
							"bp.id"
						)
						.leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
						.leftJoin(
							table.tbl_Map_customer_package + " as mpckg",
							"mpckg.package_id",
							"pckg.id"
						)
						.where("mpckg.customer_id", data.id);

					const roamingPromise = knex
						.select("bp.id")
						.from(table.tbl_pbx_bundle_plan + " as bp")
						.leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
						.leftJoin(
							table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
							"bpm.bundle_plan_id",
							"bp.id"
						)
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.roaming_plan_id",
							"bp.id"
						)
						.leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
						.leftJoin(
							table.tbl_Map_customer_package + " as mpckg",
							"mpckg.package_id",
							"pckg.id"
						)
						.where("mpckg.customer_id", data.id);

					const tcPromise = knex
						.select("bp.id")
						.from(table.tbl_pbx_bundle_plan + " as bp")
						.leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
						.leftJoin(
							table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
							"bpm.bundle_plan_id",
							"bp.id"
						)
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.teleConsultancy_call_plan_id",
							"bp.id"
						)
						.leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
						.leftJoin(
							table.tbl_Map_customer_package + " as mpckg",
							"mpckg.package_id",
							"pckg.id"
						)
						.where("mpckg.customer_id", data.id);

					Promise.all([bundlePromise, roamingPromise, tcPromise])
						.then(async (response) => {
							await response.forEach((element) => {
								if (element.length) {
									if (element[0]["id"]) {
										Object.assign(data, { flag: 1 });
									}
								}
							});
						})
						.catch((err) => {
							res.send({
								response: { code: err.errno, message: err.sqlMessage },
							});
						});
				});
				setTimeout(() => {
					res.json({
						response: Map[0],
					});
				}, 500);
				// res.send({ response: response[0][0] });
			} else {
				res.send({ response: response[0][0] });
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getUsersByFilters(req, res) {
	let data = req.body.filters;
	// data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
	data.by_company = data.by_company.length ? "'" + data.by_company + "'" : null;
	data.by_email = data.by_email ? "'" + data.by_email + "'" : null;
	data.by_status = data.by_status ? "'" + data.by_status + "'" : null;
	// data.by_account_manager = data.by_account_manager ? ("'" + data.by_account_manager + "'") : null;
	data.by_account_manager = data.by_account_manager.length
		? "'" + data.by_account_manager + "'"
		: null;
	data.by_billing = data.by_billing_type
		? "'" + data.by_billing_type + "'"
		: null;
	data.by_product = data.by_product ? "'" + data.by_product + "'" : null;
	data.by_oc = data.by_oc ? "'" + data.by_oc + "'" : null;
	data.by_pbx = data.by_pbx ? "'" + data.by_pbx + "'" : null;
	data.by_name = data.by_name ? "'" + data.by_name + "'" : null;
	data.by_circle = data.by_circle.length ? "'" + data.by_circle + "'" : null;
	data.by_username = data.by_username ? "'" + data.by_username + "'" : null;

	knex
		.raw(
			"Call pbx_getusersbyfilters(" +
			data.by_company +
			"," +
			data.by_email +
			"," +
			data.by_status +
			"," +
			data.by_account_manager +
			", " +
			data.by_billing +
			", " +
			data.by_name +
			", " +
			data.by_product +
			", " +
			data.by_pbx +
			", " +
			data.by_oc +
			"," +
			data.by_circle +
			"," +
			data.by_username +
			")"
		)
		.then(async (response) => {
			if (response) {
				let Map = response ? response[0] : null;
				await Map[0].map((data) => {
					const bundlePromise = knex
						.select("bp.id")
						.from(table.tbl_pbx_bundle_plan + " as bp")
						.leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
						.leftJoin(
							table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
							"bpm.bundle_plan_id",
							"bp.id"
						)
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.bundle_plan_id",
							"bp.id"
						)
						.leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
						.leftJoin(
							table.tbl_Map_customer_package + " as mpckg",
							"mpckg.package_id",
							"pckg.id"
						)
						.where("mpckg.customer_id", data.id);

					const roamingPromise = knex
						.select("bp.id")
						.from(table.tbl_pbx_bundle_plan + " as bp")
						.leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
						.leftJoin(
							table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
							"bpm.bundle_plan_id",
							"bp.id"
						)
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.roaming_plan_id",
							"bp.id"
						)
						.leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
						.leftJoin(
							table.tbl_Map_customer_package + " as mpckg",
							"mpckg.package_id",
							"pckg.id"
						)
						.where("mpckg.customer_id", data.id);

					const tcPromise = knex
						.select("bp.id")
						.from(table.tbl_pbx_bundle_plan + " as bp")
						.leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
						.leftJoin(
							table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
							"bpm.bundle_plan_id",
							"bp.id"
						)
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.teleConsultancy_call_plan_id",
							"bp.id"
						)
						.leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
						.leftJoin(
							table.tbl_Map_customer_package + " as mpckg",
							"mpckg.package_id",
							"pckg.id"
						)
						.where("mpckg.customer_id", data.id);

					Promise.all([bundlePromise, roamingPromise, tcPromise])
						.then(async (response) => {
							await response.forEach((element) => {
								if (element.length) {
									if (element[0]["id"]) {
										Object.assign(data, { flag: 1 });
									}
								}
							});
						})
						.catch((err) => {
							res.send({
								response: { code: err.errno, message: err.sqlMessage },
							});
						});
				});
				setTimeout(() => {
					res.json({
						response: Map[0],
					});
				}, 500);
				// res.send({ response: response[0][0] });
			}
			// else{
			//     res.send({ response: response[0][0] });
			// }
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getAllUserStatusWise(req, res) {
	let data = req.body;
	data.customerStatus = data.customerStatus
		? "" + data.customerStatus + ""
		: null;
	data.productId = data.productId ? "" + data.productId + "" : null;
	knex
		.raw(
			"Call pbx_getAllUserStatusWise(" +
			data.customerStatus +
			"," +
			data.productId +
			")"
		)
		.then((response) => {
			if (response) {
				res.send({ response: response[0][0] });
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getAllUserStatusWiseFilters(req, res) {
	let data = req.body.filters;
	// data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
	data.by_email = data.by_email ? "'" + data.by_email + "'" : null;
	data.by_status = data.by_status ? "'" + data.by_status + "'" : null;
	// data.by_account_manager = data.by_account_manager ? ("'" + data.by_account_manager + "'") : null;

	data.productId = data.productId ? "'" + data.productId + "'" : null;
	data.by_username = data.by_username ? "'" + data.by_username + "'" : null;
	data.by_circle = data.by_circle.length ? "'" + data.by_circle + "'" : null;
	data.by_company = data.by_company.length ? "'" + data.by_company + "'" : null;
	data.by_account_manager = data.by_account_manager.length
		? "'" + data.by_account_manager + "'"
		: null;

	knex
		.raw(
			"Call pbx_getAllUserStatusWiseFilters(" +
			data.by_company +
			"," +
			data.by_email +
			"," +
			data.by_status +
			"," +
			data.by_account_manager +
			"," +
			data.productId +
			"," +
			data.by_username +
			")"
		)
		.then((response) => {
			if (response) {
				res.send({ response: response[0][0] });
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getAllUserForAccountManager(req, res) {
	knex
		.raw(
			"Call pbx_getalluserforaccountmanager(" +
			parseInt(req.query.accountManagerId) +
			")"
		)
		.then(async (response) => {
			if (response) {
				let Map = [];
				Map = response ? response[0] : null;
				await Map[0].map((data) => {
					knex
						.distinct()
						.select("cpr.id", "cp.name")
						.from(table.tbl_Call_Plan_Rate + " as cpr")
						.leftJoin(
							table.tbl_Call_Plan + " as cp",
							"cp.id",
							"cpr.call_plan_id"
						)
						.leftJoin(table.tbl_Gateway + " as g", "g.id", "cpr.gateway_id")
						.leftJoin(table.tbl_Provider + " as p", "p.id", "g.provider_id")
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.call_plan_id",
							"cpr.call_plan_id"
						)
						.leftJoin(table.tbl_Package + " as pkg", "pkg.feature_id", "f.id")
						.leftJoin(table.tbl_Product + " as pd", "pd.id", "pkg.product_id")
						.leftJoin(
							table.tbl_Map_customer_package + " as map",
							"map.package_id",
							"pkg.id"
						)
						// .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.package_id', 'pkg.id')
						.leftJoin(table.tbl_Customer + " as c", "c.id", "map.customer_id")
						.leftJoin(table.tbl_Country + " as con", "con.id", "cpr.phonecode")
						.orderBy("id", "desc")
						.where("map.customer_id", data.id)
						.then(async (responses) => {
							if (responses.length) {
								await Object.assign(data, { flag: 1 });
							}
						});
				});
				setTimeout(() => {
					res.send({ response: Map[0] });
				}, 500);
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getUsersForAccountManagerByFilters(req, res) {
	let id = parseInt(req.query.accountManagerId);
	let data = req.body.filters;
	data.by_company = data.by_company.length ? "'" + data.by_company + "'" : null;
	data.by_email = data.by_email ? "'" + data.by_email + "'" : null;
	data.by_status = data.by_status ? "'" + data.by_status + "'" : null;
	data.by_product = data.by_product ? "'" + data.by_product + "'" : null;
	data.by_pbx = data.by_pbx ? "'" + data.by_pbx + "'" : null;
	data.by_oc = data.by_oc ? "'" + data.by_oc + "'" : null;
	data.by_name = data.by_name ? "'" + data.by_name + "'" : null;
	data.by_billing_type = data.by_billing_type
		? "'" + data.by_billing_type + "'"
		: null;
	// data.by_circle = data.by_circle ? ("'" + data.by_circle + "'") : null;
	data.by_circle = data.by_circle.length ? "'" + data.by_circle + "'" : null;
	data.by_username = data.by_username ? "'" + data.by_username + "'" : null;

	knex
		.raw(
			"Call pbx_getUsersForAccountManagerByFilters(" +
			data.by_company +
			"," +
			data.by_email +
			"," +
			data.by_status +
			"," +
			data.by_product +
			"," +
			data.by_pbx +
			"," +
			data.by_oc +
			"," +
			data.by_name +
			"," +
			id +
			"," +
			data.by_billing_type +
			"," +
			data.by_circle +
			"," +
			data.by_username +
			")"
		)
		.then(async (response) => {
			if (response) {
				let Map = [];
				Map = response ? response[0] : null;
				await Map[0].map((data) => {
					knex
						.distinct()
						.select("cpr.id", "cp.name")
						.from(table.tbl_Call_Plan_Rate + " as cpr")
						.leftJoin(
							table.tbl_Call_Plan + " as cp",
							"cp.id",
							"cpr.call_plan_id"
						)
						.leftJoin(table.tbl_Gateway + " as g", "g.id", "cpr.gateway_id")
						.leftJoin(table.tbl_Provider + " as p", "p.id", "g.provider_id")
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.call_plan_id",
							"cpr.call_plan_id"
						)
						.leftJoin(table.tbl_Package + " as pkg", "pkg.feature_id", "f.id")
						.leftJoin(table.tbl_Product + " as pd", "pd.id", "pkg.product_id")
						.leftJoin(
							table.tbl_Map_customer_package + " as map",
							"map.package_id",
							"pkg.id"
						)
						// .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.package_id', 'pkg.id')
						.leftJoin(table.tbl_Customer + " as c", "c.id", "map.customer_id")
						.leftJoin(table.tbl_Country + " as con", "con.id", "cpr.phonecode")
						.orderBy("id", "desc")
						.where("map.customer_id", data.id)
						.then(async (responses) => {
							if (responses.length) {
								await Object.assign(data, { flag: 1 });
							}
						});
				});
				setTimeout(() => {
					res.send({ response: Map[0] });
				}, 500);
				// res.send({ response: response[0][0] });
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}
function getUsersForResellerByFilters(req, res) {

	let id = parseInt(req.query.ResellerId);
	let data = req.body.filters;
	data.by_company = data.by_company.length ? "'" + data.by_company + "'" : null;
	data.by_email = data.by_email ? "'" + data.by_email + "'" : null;
	data.by_status = data.by_status ? "'" + data.by_status + "'" : null;
	data.by_product = data.by_product ? "'" + data.by_product + "'" : null;
	data.by_pbx = data.by_pbx ? "'" + data.by_pbx + "'" : null;
	data.by_oc = data.by_oc ? "'" + data.by_oc + "'" : null;
	data.by_name = data.by_name ? "'" + data.by_name + "'" : null;
	data.by_billing_type = data.by_billing_type
		? "'" + data.by_billing_type + "'"
		: null;
	// data.by_circle = data.by_circle ? ("'" + data.by_circle + "'") : null;
	data.by_circle = data.by_circle.length ? "'" + data.by_circle + "'" : null;
	data.by_username = data.by_username ? "'" + data.by_username + "'" : null;

	knex
		.raw(
			"Call pbx_getUsersForResellerByFilters(" +
			data.by_company +
			"," +
			data.by_email +
			"," +
			data.by_status +
			"," +
			data.by_product +
			"," +
			data.by_pbx +
			"," +
			data.by_oc +
			"," +
			data.by_name +
			"," +
			id +
			"," +
			data.by_billing_type +
			"," +
			data.by_circle +
			"," +
			data.by_username +
			")"
		)
		.then(async (response) => {
			if (response) {
				let Map = [];
				Map = response ? response[0] : null;
				await Map[0].map((data) => {
					knex
						.distinct()
						.select("cpr.id", "cp.name")
						.from(table.tbl_Call_Plan_Rate + " as cpr")
						.leftJoin(
							table.tbl_Call_Plan + " as cp",
							"cp.id",
							"cpr.call_plan_id"
						)
						.leftJoin(table.tbl_Gateway + " as g", "g.id", "cpr.gateway_id")
						.leftJoin(table.tbl_Provider + " as p", "p.id", "g.provider_id")
						.leftJoin(
							table.tbl_PBX_features + " as f",
							"f.call_plan_id",
							"cpr.call_plan_id"
						)
						.leftJoin(table.tbl_Package + " as pkg", "pkg.feature_id", "f.id")
						.leftJoin(table.tbl_Product + " as pd", "pd.id", "pkg.product_id")
						.leftJoin(
							table.tbl_Map_customer_package + " as map",
							"map.package_id",
							"pkg.id"
						)
						// .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.package_id', 'pkg.id')
						.leftJoin(table.tbl_Customer + " as c", "c.id", "map.customer_id")
						.leftJoin(table.tbl_Country + " as con", "con.id", "cpr.phonecode")
						.orderBy("id", "desc")
						.where("map.customer_id", data.id)
						.then(async (responses) => {
							if (responses.length) {
								await Object.assign(data, { flag: 1 });
							}
						});
				});
				setTimeout(() => {
					res.send({ response: Map[0] });
				}, 500);
				// res.send({ response: response[0][0] });
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getAllUserForSupport(req, res) {
	knex
		.raw("Call pbx_getAllUserForSupport(" + parseInt(req.query.productId) + ")")
		.then((response) => {
			if (response) {
				res.send({ response: response[0][0] });
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}
function getAllReseller(req, res) {
	let sql = knex.raw("Call pbx_getAllReseller(" + parseInt(req.query.productId) + ")")
	sql.then((response) => {
		if (response) {
			res.send({ response: response[0][0] });
		}
	})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getAllResellerData(req, res) {
	let data = knex.select('*').from(table.tbl_Customer).where('created_by', parseInt(req.query.productId))
	data.then((response) => {
		if (response) {
			res.send({ response: response });
		}
	})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}
function paidStatusCustomerInvoice(req, res) {
	let query = req.query.id;
	let data = knex
		.distinct()
		.select(
			"i.paid_status",
			"cust.status",
			"cust.balance",
			"ch.charge_status",
			"ch.invoice_status"
		)
		.from(table.tbl_Pbx_Invoice + " as i")
		.innerJoin(table.tbl_Customer + " as cust", "cust.id", "i.customer_id")
		.innerJoin(table.tbl_Charge + " as ch", "ch.customer_id", "cust.id")
		.where("i.customer_id", query)
		.andWhere("ch.customer_id", query);
	data
		.then((response) => {
			if (response == "") {
				let data = knex
					.distinct()
					.select(
						"cust.status",
						"cust.balance",
						"ch.charge_status",
						"ch.invoice_status"
					)
					.from(table.tbl_Charge + " as ch")
					.innerJoin(
						table.tbl_Customer + " as cust",
						"cust.id",
						"ch.customer_id"
					)
					.where("ch.customer_id", query);
				data.then((response) => {
					res.json({
						response,
					});
				});
			} else {
				res.json({
					response,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}
function getAllSupportUser(req, res) {
	let query = knex
		.select("id", "username")
		.from(table.tbl_Customer)
		.where("role_id", "=", "5")
		.whereIn("status", ["1"]);
	query
		.then((response) => {
			res.json({
				response,
			});
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getUsersForSupportByFilters(req, res) {
	let id = parseInt(req.query.productId);
	let data = req.body.filters;
	// data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
	data.by_company = data.by_company.length ? "'" + data.by_company + "'" : null;
	data.by_email = data.by_email ? "'" + data.by_email + "'" : null;
	data.by_status = data.by_status ? "'" + data.by_status + "'" : null;
	data.by_account_manager = data.by_account_manager.length
		? "'" + data.by_account_manager + "'"
		: null;
	data.by_product = data.by_product ? "'" + data.by_product + "'" : null;
	if (data.by_product != "" && data.by_product != null) {
		id = data.by_product;
	}
	data.by_pbx = data.by_pbx ? "'" + data.by_pbx + "'" : null;
	data.by_oc = data.by_oc ? "'" + data.by_oc + "'" : null;
	data.by_name = data.by_name ? "'" + data.by_name + "'" : null;
	data.by_billing_type = data.by_billing_type
		? "'" + data.by_billing_type + "'"
		: null;
	data.by_username = data.by_username ? "'" + data.by_username + "'" : null;

	knex
		.raw(
			"Call pbx_getUsersForSupportByFilters(" +
			data.by_company +
			"," +
			data.by_email +
			"," +
			data.by_status +
			"," +
			id +
			"," +
			data.by_account_manager +
			"," +
			data.by_product +
			"," +
			data.by_pbx +
			"," +
			data.by_oc +
			"," +
			data.by_name +
			"," +
			data.by_billing_type +
			"," +
			data.by_username +
			")"
		)
		.then((response) => {
			if (response) {
				res.send({ response: response[0][0] });
			}
		})
		.catch((err) => {
			res.send({ response: { code: err.errno, message: err.sqlMessage } });
		});
}

function getAllCustomerCompany(req, res) {
	let sql = knex
		.select("id", "company_name")
		.from(table.tbl_Customer)
		.where("role_id", "=", "1")
		.whereNotIn("status", ["2"])
		.orderBy("company_name", "asc")
	sql.then((response) => {
		res.json({
			response,
		});
	})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getAccountManagerProductCustomercompany(req, res) {
	let id = parseInt(req.query.accountManagerId);
	knex
		.select("cus.id", "cus.company_name")
		.from(table.tbl_Customer + " as cus")
		.leftOuterJoin(
			table.tbl_Map_customer_package + " as map",
			"map.customer_id",
			"cus.id"
		)
		.where("cus.account_manager_id", "=", "" + id + "")
		.andWhere("map.product_id", "=", req.query.productId)
		.whereIn("cus.role_id", ["1"], ["0"])
		.whereIn("cus.status", ["1"])
		.orderBy("cus.id", "desc")
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getPackageProductWise(req, res) {
	knex
		.select("id", "product_id")
		.from(table.tbl_Package)
		.where("id", "=", req.query.packageId)
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getCompany(req, res) {
	knex
		.select("id", "company_name")
		.from(table.tbl_Customer)
		.whereIn("role_id", ["1"])
		.whereIn("status", ["1"])
		.orderBy("company_name", "asc")
		.then((response) => {
			res.json({
				response,
			});
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getAssignedUser(req, res) {
	var sql = knex
		.select("id", "status")
		.from(table.tbl_Customer)
		.where("account_manager_id", "=", req.query.managerId)
		.andWhere("status", "=", "1");
	sql
		.then((response) => {
			res.json({
				response,
			});
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function updateLogoutLog(req, res) {
	myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

	knex
		.raw(
			"Call pbx_update_activityLog(" +
			req.body.user_id +
			", " +
			req.body.user_type +
			",'1','" +
			myDate +
			"')"
		)
		.then((response) => {
			res.json({
				response,
			});
		});
}

function getUserByType(req, res) {
	knex
		.from(table.tbl_Customer + " as c")
		.where("c.role_id", "=", "" + req.query.type + "")
		.select("c.*")
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		});
}

function getScriptURL(req, res) {
	knex
		.from(table.tbl_pbx_invoice_conf)
		.select("domain")
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res.status(401).send({ error: "error", message: "DB Error" });
			}
		});
}

function getUserHasMinutePlan(req, res) {
	var sql = knex
		.from(table.tbl_Customer + " as c")
		.leftJoin(
			table.tbl_Map_customer_package + " as map",
			"c.id",
			"map.customer_id"
		)
		.leftJoin(table.tbl_Package + " as pack", "pack.id", "map.package_id")
		.leftJoin(table.tbl_PBX_features + " as feat", "feat.id", "pack.feature_id")
		.where("feat.minute_plan", "=", 1)
		.select("c.*");
	sql.then((response) => {
		if (response) {
			res.json({
				response,
			});
		} else {
			res.status(401).send({ error: "error", message: "DB Error" });
		}
	});
}

function checkContactAssociateOrNot(req, res) {
	let customerId = req.query.id;
	knex
		.select("*")
		.from(table.tbl_pbx_support_user_map_support_group)
		.where("support_user_id", customerId)
		.then((response) => {
			res.json({
				response,
			});
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
}

function getCustomerBillingTypeAndWithOutBundlePackage(req, res) {
	let sql = knex
		.select("pbx.billing_type")
		.from(table.tbl_PBX_features + " as pbx")
		.leftJoin(table.tbl_Package + " as p", "pbx.id", "p.feature_id")
		.where("p.id", "=", "" + req.query.packageId + "")
	sql.then((response) => {
		if (response) {
			// var billing_type = response[0].billing_type;
			let sql1 = knex
				.select("p.*")
				.from(table.tbl_Package + " as p")
				.leftJoin(
					table.tbl_PBX_features + " as pbx",
					"pbx.id",
					"p.feature_id"
				)
				// .where("pbx.billing_type", "=", "" + billing_type + "")
				// .andWhere("p.product_id", "=", "" + req.query.productId + "")
				// .andWhere("pbx.minute_plan", "=", "0")
				.andWhere("pbx.is_circle", "=", "0")
			sql1.then((resp) => {
				if (resp) {
					res.json({
						resp,
					});
				} else {
					res.status(411).send({ error: "error", message: "DB Error" });
				}
			});
		} else {
			res.status(411).send({ error: "error", message: "DB Error" });
		}
	});
}


const updateChargeForMinutePlan = async (packageId, customerId) => {
	await knex
		.select(
			"f.is_bundle_type",
			"f.bundle_plan_id",
			"f.is_roaming_type",
			"f.roaming_plan_id",
			"f.teleconsultation",
			"f.teleConsultancy_call_plan_id"
		)
		.from(table.tbl_PBX_features + " as f")
		.join(table.tbl_Package + " as p", "f.id", "p.feature_id")
		.join(table.tbl_Map_customer_package + " as mp", "mp.package_id", "p.id")
		.where("p.id", "=", "" + packageId + "")
		.then((response) => {
			if (response) {
			}
			// res.json({
			//     response
			// });
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});
};

const generateInvoiceAmount = async (customerId) => {
	var now = new Date();
	var totalInvoiceAmount = 0;
	var currentMonth = parseInt(now.getMonth() + 1);
	await releaseDID(customerId);
	await knex.from(table.tbl_pbx_realtime_cdr + ' as cdr')
		.sum('cdr.sessionbill as amount')
		.select('cdr.created_at')
		.join(table.tbl_Pbx_Invoice + ' as inv', 'inv.customer_id', 'cdr.customer_id')
		.where('cdr.customer_id', '=', "" + customerId + "")
		// .whereBetween('cdr.created_at', ['inv.invoice_date',knex.fn.now()])
		.andWhere(knex.raw('DATE(cdr.created_at)'), '>', knex.raw('DATE(inv.invoice_date)'))
		//  .andWhere(knex.raw('DATE(cdr.created_at)'), '<=', knex.raw('DATE(knex.fn.now())'));       
		.then((response) => {
			if (response) {
				totalInvoiceAmount = totalInvoiceAmount + Number(response[0]['amount']);
			}
		}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

	await knex(table.tbl_Charge).insert({
		did_id: '', customer_id: customerId, amount: totalInvoiceAmount,
		charge_type: "2", description: 'Charge for PSTN - ' + customerId, charge_status: 0,
		invoice_status: 0, product_id: 1
	})
		.then((resp) => {
		});

	await knex(table.tbl_Charge)
		.insert({
			did_id: "",
			customer_id: customerId,
			amount: totalInvoiceAmount,
			charge_type: "2",
			description: "Charge for PSTN - " + customerId,
			charge_status: 0,
			invoice_status: 0,
			product_id: 1,
		})
		.then((resp) => { });

	await knex
		.from(table.tbl_Charge + " as c")
		.sum("c.amount as amount")
		.where("c.customer_id", "=", "" + customerId + "")
		.andWhere("c.charge_status", "=", 0)
		.andWhere("c.invoice_status", "=", 0)
		.then((response) => {
			if (response) {
				totalInvoiceAmount = totalInvoiceAmount + Number(response[0]["amount"]);
			}
		})
		.catch((err) => {
			console.log(err);
			res
				.status(401)
				.send({ error: "error", message: "DB Error: " + err.message });
			throw err;
		});

	await changeStatus(totalInvoiceAmount, customerId);
};

const updateCustomerToken = async (jwtToken, customer_id) => {
	let current_time = new Date();
	current_time.setHours(current_time.getHours() + 1);
	current_time =
		current_time.toISOString().split("T")[0] +
		" " +
		current_time.toTimeString().split(" ")[0];
	await knex(table.tbl_Customer)
		.update({ token: jwtToken, token_exp_time: current_time })
		.where("id", customer_id)
		.then((resp) => { });
};

const changeStatus = (totalInvoiceAmount, customerId) => {
	if (totalInvoiceAmount == 0) {
		knex(table.tbl_Customer).update({
			status: 2
		}).where('id', '=', customerId)
			.then((response) => {
			}).catch((err) => { console.log(err) });
	} else {
		knex(table.tbl_Customer).update({
			status: 4
		}).where('id', '=', customerId)
			.then((response) => {
				generateInvoice(customerId);
			}).catch((err) => { console.log(err) });
	}
}

const releaseDID = (customerId) => {
	var sql0 = knex
		.from(table.tbl_DID)
		.select("id")
		.where("customer_id", "" + customerId + "");
	sql0
		.then((response0) => {
			let allDidIds = response0 ? response0.map((item) => item.id) : [];
			knex
				.from(table.tbl_DID)
				.whereIn("id", allDidIds)
				.update({
					reserved: "0",
					customer_id: "0",
					activated: "0",
					product_id: "0", // need to set product_id : 0
				})
				.then((respo) => {
					if (respo) {
						let sql = knex
							.from(table.tbl_Uses)
							.whereIn("did_id", allDidIds)
							.andWhere("customer_id", customerId)
							.andWhere("release_date", "0000-00-00 00:00:00.000000")
							.update({
								release_date: knex.raw("CURRENT_TIMESTAMP()"),
							});
						sql
							.then((response3) => {
								if (response3) {
									knex
										.from(table.tbl_DID_Destination)
										.whereIn("did_id", allDidIds)
										.del()
										.then((respons) => {
											if (respons) {
											} else {
											}
										})
										.catch((err) => {
											console.log(err);
											throw err;
										});
								} else {
								}
							})
							.catch((err) => {
								console.log(err);
								throw err;
							});
					} else {
					}
				})
				.catch((err) => {
					console.log(err);
					throw err;
				});
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
};

const generateInvoice = (customerId) => {
	var now = new Date();
	var n = now.getMonth() - 1;
	var currentDate = now.getDate();
	var months = [
		"December",
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	var invoice_month = months[++n];
	var current_total_balance = 0;
	knex
		.from(table.tbl_Customer)
		.select(
			"id",
			"email",
			"company_name",
			"invoice_day",
			"balance",
			"advance_payment",
			"created_by"
		)
		.where("id", customerId)
		.andWhere("status", "=", "1")
		.then((response) => {
			// for (let i = 0; i < response.length; i++) {
			current_total_balance = response[i].balance;
			//unique Invoice number
			var numbs = "1234567890";
			var number_lehgth = 6;
			var randomNum = "";
			for (var k = 0; k < number_lehgth; k++) {
				var rnum = Math.floor(Math.random() * numbs.length);
				randomNum += numbs.substring(rnum, rnum + 1);
			}
			let InvoiceNumberDisplay = randomNum;
			let sql = knex(table.tbl_Pbx_Invoice).insert({
				reference_num: "" + InvoiceNumberDisplay + "",
				customer_id: response[i].id,
			});
			sql
				.then((resp) => {
					let invoiceId = resp;
					knex
						.from(table.tbl_Charge + " as c")
						.select(
							"c.*",
							knex.raw('DATE_FORMAT(c.created_at, "%d") as did_activate_day')
						)
						.where("customer_id", response[i].id)
						.andWhere("charge_status", 0)
						.andWhere("invoice_status", 0)
						.then(async (response2) => {
							let allTypeChargeData = response2;
							let didRegularCount = 0; //DID
							let didRegularTotalRate = 0; //DID
							let didRetroCount = 0; // DID -RETRO
							let SMSCount = 0; //SMS
							let SMSTotalRate = 0; //SMS
							let PSTNCount = 0; //PSTN
							let PSTNTotalRate = 0; // PSTN
							let boosterCount = 0; // booster
							let boosterTotalRate = 0; // booster
							let bundleCount = 0; // BUNDLE
							let bundleTotalRate = 0; // BUNDLE
							let roamingCount = 0; // ROAMING
							let roamingTotalRate = 0; // ROAMING
							let TCCount = 0; // TC
							let TCTotalRate = 0; //TC
							for (let j = 0; j < allTypeChargeData.length; j++) {
								if (
									allTypeChargeData[j]["charge_type"] == "1" &&
									allTypeChargeData[j]["did_activate_day"] == 1
								) {
									// DID
									didRegularCount++;
									didRegularTotalRate =
										didRegularTotalRate + allTypeChargeData[j]["amount"];
								} else if (
									allTypeChargeData[j]["charge_type"] == "1" &&
									allTypeChargeData[j]["did_activate_day"] != 1
								) {
									// DID RETRO
									didRetroCount++;
									// didRetroTotalRate++;
									knex(table.tbl_Invoice_Item)
										.insert({
											invoice_id: "" + invoiceId + "",
											amount: allTypeChargeData[j]["amount"],
											description: "DID Retro rental charge" + "-" + "1",
											item_type: "1",
										})
										.then((response3) => { })
										.catch((err) => {
											console.log(err);
										});
								} else if (allTypeChargeData[j]["charge_type"] == "2") {
									// PSTN
									PSTNCount++;
									PSTNTotalRate =
										PSTNTotalRate + allTypeChargeData[j]["amount"];
								} else if (allTypeChargeData[j]["charge_type"] == "3") {
									// SMS
									SMSCount++;
									SMSTotalRate = SMSTotalRate + allTypeChargeData[j]["amount"];
								} else if (allTypeChargeData[j]["charge_type"] == "4") {
									// Booster
									boosterCount++;
									boosterTotalRate =
										boosterTotalRate + allTypeChargeData[j]["amount"];
								} else if (allTypeChargeData[j]["charge_type"] == "5") {
									// Bundle
									bundleCount++;
									bundleTotalRate =
										bundleTotalRate + allTypeChargeData[j]["amount"];
								} else if (allTypeChargeData[j]["charge_type"] == "6") {
									// Roaming
									roamingCount++;
									roamingTotalRate =
										roamingTotalRate + allTypeChargeData[j]["amount"];
								} else if (allTypeChargeData[j]["charge_type"] == "7") {
									// TC
									TCCount++;
									TCTotalRate = TCTotalRate + allTypeChargeData[j]["amount"];
								}
							}

							if (didRegularCount > 0) {
								await knex(table.tbl_Invoice_Item)
									.insert({
										invoice_id: "" + invoiceId + "",
										amount: didRegularTotalRate,
										description: "DID rental charge" + "-" + didRegularCount,
										item_type: "1",
									})
									.then((response3) => { })
									.catch((err) => {
										console.log(err);
									});
							}
							if (PSTNCount > 0) {
								await knex(table.tbl_Invoice_Item)
									.insert({
										invoice_id: "" + invoiceId + "",
										amount: PSTNTotalRate,
										description: "PSTN Call charges",
										item_type: "1",
									})
									.then((response3) => { })
									.catch((err) => {
										console.log(err);
									});
							}
							if (SMSCount > 0) {
								await knex(table.tbl_Invoice_Item)
									.insert({
										invoice_id: "" + invoiceId + "",
										amount: SMSTotalRate,
										description: "SMS charges",
										item_type: "1",
									})
									.then((response3) => { })
									.catch((err) => {
										console.log(err);
									});
							}
							if (bundleCount > 0) {
								await knex(table.tbl_Invoice_Item)
									.insert({
										invoice_id: "" + invoiceId + "",
										amount: bundleTotalRate,
										description: "Bundle charges",
										item_type: "1",
									})
									.then((response3) => { })
									.catch((err) => {
										console.log(err);
									});
							}
							if (roamingCount > 0) {
								await knex(table.tbl_Invoice_Item)
									.insert({
										invoice_id: "" + invoiceId + "",
										amount: roamingTotalRate,
										description: "Roaming charges",
										item_type: "1",
									})
									.then((response3) => { })
									.catch((err) => {
										console.log(err);
									});
							}
							if (TCCount > 0) {
								await knex(table.tbl_Invoice_Item)
									.insert({
										invoice_id: "" + invoiceId + "",
										amount: TCTotalRate,
										description: "Teleconsult charges",
										item_type: "1",
									})
									.then((response3) => { })
									.catch((err) => {
										console.log(err);
									});
							}
							if (boosterCount > 0) {
								await knex(table.tbl_Invoice_Item)
									.insert({
										invoice_id: "" + invoiceId + "",
										amount: boosterTotalRate,
										description: "Booster charges",
										item_type: "1",
									})
									.then((response3) => { })
									.catch((err) => {
										console.log(err);
									});
							}
							await update_invoice_with_single_entry(
								invoiceId,
								response[i].id,
								response[i].company_name,
								response[i].email,
								InvoiceNumberDisplay,
								invoice_month,
								response[i].advance_payment,
								response[i].created_by
							);
						})
						.catch((err) => {
							console.log(err);
						});
				})
				.catch((err) => {
					console.log(err);
				});
			// }
		});

	const update_invoice_with_single_entry = (
		invoiceId,
		customer_id,
		company_name,
		customer_email,
		InvoiceNumberDisplay,
		invoice_month,
		cust_advance_payment,
		created_by
	) => {
		knex
			.from(table.tbl_Invoice_Item)
			.select(knex.raw("(now()- INTERVAL 1 MONTH) as invoice_period"))
			.sum("amount as amount")
			.where("invoice_id", "=", invoiceId)
			.then((response4) => {
				let paid_status = "2";
				var gst_on_amount = 0.0;
				var amount_with_gst = 0.0;
				var cgst_on_amount = 0.0;
				var sgst_on_amount = 0.0;
				var fare_amount = 0.0;
				let invoice_period_day = response4[0]["invoice_period"];
				if (response4[0]["amount"] > 0) {
					paid_status = "2";
					(fare_amount = response4[0]["amount"].toFixed(2)),
						(cgst_on_amount = (
							(response4[0]["amount"].toFixed(2) * config.cgst) /
							100
						).toFixed(2));
					sgst_on_amount = (
						(response4[0]["amount"].toFixed(2) * config.sgst) /
						100
					).toFixed(2);
					gst_on_amount =
						parseFloat(cgst_on_amount) + parseFloat(sgst_on_amount);
					amount_with_gst =
						parseFloat(response4[0]["amount"].toFixed(2)) +
						parseFloat(cgst_on_amount) +
						parseFloat(sgst_on_amount);
				} else {
					paid_status = "4";
				}
				knex
					.from(table.tbl_pbx_invoice_conf)
					.select("*")
					.where("id", created_by)
					.then((resp) => {
						// get user due date record
						let orgInfo = resp[0];
						let currentDate = new Date();
						let current_time = new Date(
							currentDate.setDate(currentDate.getDate() + orgInfo.payment_day)
						);
						let invoiceDueDate =
							current_time.toISOString().split("T")[0] +
							" " +
							current_time.toTimeString().split(" ")[0];
						knex(table.tbl_Pbx_Invoice)
							.where("id", "=", invoiceId)
							.update({
								amount: response4[0]["amount"].toFixed(2),
								paid_status: paid_status,
								cgst_percentage: config.cgst,
								sgst_percentage: config.cgst,
								total_gst_percentage: config.gst,
								amount_with_gst: amount_with_gst,
								cgst_amount: cgst_on_amount,
								sgst_amount: sgst_on_amount,
								total_gst_amount: gst_on_amount,
								invoice_period: invoice_period_day,
								invoice_due_date: invoiceDueDate,
								advance_balance: cust_advance_payment,
							})
							.then((response5) => {
								let sql = knex(table.tbl_Charge)
									.update({
										charge_status: 1,
										invoice_status: 1,
									})
									.where("customer_id", "=", "" + customer_id + "");
								sql
									.then((response6) => {
										let newdata = {
											userName: company_name,
											email: customer_email,
											invoice_number: InvoiceNumberDisplay,
											amount: amount_with_gst.toFixed(2),
											fare_amount: fare_amount,
											gst_amount: gst_on_amount.toFixed(2),
											invoice_month: invoice_month,
										};
										pushEmail
											.getEmailContentUsingCategory("InvoiceCreation")
											.then((val) => {
												pushEmail
													.sendmail({
														data: newdata,
														val: val,
														username: company_name,
														email: customer_email,
													})
													.then((data1) => { });
											});
									})
									.catch((err) => {
										console.log(err);
									});
							})
							.catch((err) => {
								console.log(err);
							});
					})
					.catch((err) => {
						console.log(err);
					});
			})
			.catch((err) => {
				console.log(err);
			});
	};
};

function sendUserEmail(req, res) {
	let url = req.protocol + '://' + req.get('host');
	let request = req.body;
	let newdata = { userName: request.first_name, email: request.email, url: url, logo_img: request.logo_path };
	let decrypt = encrypt.decryptAes(request.password);
	//let decrypted = Hash.AES.decrypt(request.password, config.appSecret);
	// decrypted = decrypted.toString(Hash.enc.Utf8);	
	let userTypeVal = request.template;
	pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
		pushEmail.sendmail({ data: newdata, val: val, username: request.username, password: decrypt }).then((data1) => {
			if (data1.success == false) {
				res.json({
					message: 'Mail Not Sent',
					status: 500
				})
			} else {
				res.json({
					message: 'The mail is sended to ' + request.first_name,
					status: 200
				});
			}
		}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
	}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function setLogo(req, res) {
	if (req.body.is_poweredBy == true) {
		req.body.is_poweredBy = '1'
	} else {
		req.body.is_poweredBy = '0'
		req.body.logo2 = "";
	}

	let user_id = req.body.id ? req.body.id : null;
	let logoPath = req.body.logo ? req.body.logo : null;
	let role = req.body.role_id ? req.body.role_id : null;
	knex(table.tbl_pbx_profile_logo).select('logo_img', 'favicon_img').where('customer_id', user_id)
		.then(async (response1) => {
			await knex(table.tbl_pbx_profile_logo).where('customer_id', user_id).del().then((response) => {
				let sql = knex(table.tbl_pbx_profile_logo).insert({ logo_img: req.body.logo, role: role, is_poweredBy: req.body.is_poweredBy, customer_id: user_id, favicon_img: req.body.logo1, footer_text_left: req.body.footer_text, footer_text: req.body.footer_text_right, title: req.body.title, powered_by: req.body.logo2 });
				sql.then((response2) => {
					res.send({
						status_code: 200
					})
				})
			})
		})
}

function getLogoProfile(req, res) {
	let id = req.query.id;
	let type = req.query.type;

	const handleResponse = (response, res) => {
		if (response.length) {
			//if (!fs.existsSync('app/' + response[0]['logo_img'])) {
			//	response[0]['logo_img'] = 'assets/img/brand/ECTL_logo_new.png';
			//}            
		}
		console.log(response,"Response")
		response[0]['minIoImage'] = response[0]['logo_img'];
		response[0]['minIoFavicon'] = response[0]['favicon_img'];
		response[0]['minIoPoweredBy'] = response[0]['powered_by'];
		res.send({ logo_path: response });
	};

	const handleQuery = (query, res) => {
		query
			.then(response => handleResponse(response, res))
			.catch(err => {
				res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
				throw err;
			});
	};
	const handleError = (err, res) => {
		res.send(err)
	}

	const queryMap = {
		3: () => handleQuery(knex.select('*').from(table.tbl_pbx_profile_logo).where('role', '3').andWhere('customer_id', id), res),
		0: () => handleQuery(knex.select('*').from(table.tbl_pbx_profile_logo).where('role', '0'), res),
		1: () => knex(table.tbl_Customer).where('id', id).select('created_by')
			.then(response => handleQuery(
				knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
			.catch(err => handleError(err, res)),
		6: () => knex(table.tbl_Extension_master + ' as e').join(table.tbl_Customer + ' as c', 'c.id', 'e.customer_id').where('c.id', id).select('c.created_by')
			.then(response => handleQuery(
				knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
			.catch(err => handleError(err, res)),
		5: () => knex(table.tbl_Customer).where('id', id).select('created_by')
			.then(response => handleQuery(
				knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
			.catch(err => handleError(err, res)),
		4: () => knex(table.tbl_Customer).where('id', id).select('created_by')
			.then(response => handleQuery(
				knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
			.catch(err => handleError(err, res)),
		2: () => knex(table.tbl_Customer).where('id', id).select('created_by')
			.then(response => handleQuery(
				knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
			.catch(err => handleError(err, res)),
		default: () => res.status(400).send({ error: 'error', message: 'Invalid type' })
	};

	const queryFunction = queryMap[type] || queryMap.default;
	queryFunction();
}





// Minio Client configuration
const minioClient = new Minio.Client({
	endPoint: '103.163.40.209',
	port: 9900,
	useSSL: false,
	accessKey: 'bhupendra',
	secretKey: 'bhupendra@1234'
});


// function getLogoProfile(req, res) {
// 	let id = req.query.id;
// 	let type = req.query.type;

// 	const getMinioObjectUrl = (bucket, object) => {
// 	  return new Promise((resolve, reject) => {
// 		minioClient.presignedGetObject(bucket, object, 24 * 60 * 60, (err, presignedUrl) => {
// 		  if (err) return reject(err);
// 		  resolve(presignedUrl);
// 		});
// 	  });
// 	};

// 	const stripTimestamp = (filename) => {
// 	  return filename.replace(/_\d+\.\w+$/, (match) => {
// 		return match.replace(/_\d+/, '');
// 	  });
// 	};

// 	const handleResponse = async (response, res) => {
// 	  if (response.length) {
// 		for (let item of response) {
// 		  try {
// 			if (item.logo_img) {
// 			  const cleanedLogoImg = stripTimestamp(item.logo_img);
// 			  item.logo_img = await getMinioObjectUrl('logo', cleanedLogoImg);
// 			}
// 			if (item.favicon_icon) {
// 			  const cleanedFaviconIcon = stripTimestamp(item.favicon_icon);
// 			  item.favicon_icon = await getMinioObjectUrl('favicon-icon', cleanedFaviconIcon);
// 			}
// 			if (item.powered_by) {
// 			  const cleanedPoweredBy = stripTimestamp(item.powered_by);
// 			  item.powered_by = await getMinioObjectUrl('powered-by', cleanedPoweredBy);
// 			}
// 		  } catch (err) {
// 			res.status(500).send({ error: 'error', message: 'Minio Error: ' + err.message });
// 			return;
// 		  }
// 		}
// 	  }
// 	  res.send({ logo_path: response });
// 	};

// 	const handleQuery = (query, res) => {
// 	  query
// 		.then(response => handleResponse(response, res))
// 		.catch(err => {
// 		  res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
// 		  throw err;
// 		});
// 	};

// 	const handleError = (err, res) => {
// 	  res.send(err);
// 	};

// 	const queryMap = {
// 	  3: () => handleQuery(knex.select('*').from(table.tbl_pbx_profile_logo).where('role', '3').andWhere('customer_id', id), res),
// 	  0: () => handleQuery(knex.select('*').from(table.tbl_pbx_profile_logo).where('role', '0'), res),
// 	  1: () => knex(table.tbl_Customer).where('id', id).select('created_by')
// 		.then(response => handleQuery(
// 		  knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
// 		.catch(err => handleError(err, res)),
// 	  6: () => knex(table.tbl_Extension_master + ' as e').join(table.tbl_Customer + ' as c', 'c.id', 'e.customer_id').where('c.id', id).select('c.created_by')
// 		.then(response => handleQuery(
// 		  knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
// 		.catch(err => handleError(err, res)),
// 	  5: () => knex(table.tbl_Customer).where('id', id).select('created_by')
// 		.then(response => handleQuery(
// 		  knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
// 		.catch(err => handleError(err, res)),
// 	  4: () => knex(table.tbl_Customer).where('id', id).select('created_by')
// 		.then(response => handleQuery(
// 		  knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
// 		.catch(err => handleError(err, res)),
// 	  2: () => knex(table.tbl_Customer).where('id', id).select('created_by')
// 		.then(response => handleQuery(
// 		  knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', response[0]['created_by']), res))
// 		.catch(err => handleError(err, res)),
// 	  default: () => res.status(400).send({ error: 'error', message: 'Invalid type' })
// 	};

// 	const queryFunction = queryMap[type] || queryMap.default;
// 	queryFunction();
//   }




function getProductLogo(req, res) {
	if (req.query.role == 0) {
		let sql1 = knex.select('*').from(table.tbl_pbx_profile_logo).where('customer_id', req.query.customerId).first()
		sql1.then((response) => {
			// if (!fs.existsSync('app/' + response['logo_img'])) {
			// 	response['logo_img'] = 'assets/img/brand/ECTL_logo_new.png';
			// }
			res.send({
				response
			})
		}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
	}
}

function updateCustomerPermission(permissionId, customer, modified_by) {
	knex.select('*').from(table.tbl_pbx_menu_permission).where('permission_id', permissionId).
		then((result) => {
			createModuleLog(table.tbl_pbx_permission_history, {
				permission_id: permissionId,
				action: "Permission Assigned to : " + customer, modified_by, data: "" + JSON.stringify(result) + ""
			})
		}).catch((err) => { console.log(err); });
}

cron.schedule(" 59 11 * * * ", function () {
	// cron.schedule("* * * * *", function () {    
	console.log("running a task every 12:00 AM ");
	var now = new Date();
	let current_date = `${now.getFullYear()}-0${now.getMonth() + 1}-${now.getDate()}`;
	let sql = knex.from(table.tbl_Customer)
		.select('*');
	sql.then((response) => {
		for (let i = 0; i < response.length; i++) {
			let actual_Date = new Date(response[i]['date']);
			let custDatee = moment(actual_Date).format('YYYY-MM-DD');
			if (moment(custDatee, "YYYY-MM-DD").isSame(current_date)) { // its means its purchased by booster and add via booster plan.
				knex(table.tbl_Customer).where('id', response[i]['id'])
					.update({
						status: '0'
					})
					.then((responses) => {
					}).catch((err) => { console.log(err) });
			}
		}
		let dates = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		if (moment(dates, "YYYY-MM-DD").isSame(current_date)) {
			knex(table.tbl_Customer)
				.update({
					consume_hit: 0
				})
				.then((responses) => {
				}).catch((err) => { console.log(err) });
		}
	})

})

function getCustomerIdByExtensionId(req, res) {

	let id = req.query.id;
	let sql = knex.select('c.username', 'c.password')
		.from(table.tbl_Extension_master + ' as ext')
		.join(table.tbl_Customer + ' as c', 'c.id', 'ext.customer_id')
		.where('ext.id', id)

	sql.then((response) => {
		// let pas = response[0]['password'].toString();
		// if(pas){
		// const private_cipher = encrypt.decipher(config.appSecret);
		// pas = private_cipher(pas);
		// response[0]['password'] = pas;
		res.send({
			response: response[0]
		})
		// }
	}).catch((err) => { console.log(err) });
}

function getResellerCredByCust(req, res) {

	let id = req.query.id;
	knex.select('created_by').from(table.tbl_Customer).where('id', id)
		.then((resp) => {
			let sql = knex.select('c.username', 'c.password')
				.from(table.tbl_Customer + ' as c')
				.where('c.id', resp[0]['created_by'])
				.andWhere('c.role_id', '3')

			sql.then((response) => {
				res.send({
					response: response[0]
				})
			}).catch((err) => { console.log(err) });
		})

}

function getAdminCredentials(req, res) {
	let sql = knex.select('c.username', 'c.password')
		.from(table.tbl_Customer + ' as c')
		.where('c.role_id', '0')

	sql.then((response) => {

		// let pas = response[0]['password'].toString();
		// if(pas){
		// const private_cipher = encrypt.decipher(config.appSecret);
		// pas = private_cipher(pas);
		// response[0]['password'] = pas;
		// res.send({response: response[0]})
		// }
		res.send({
			response: response[0]
		})
	}).catch((err) => { console.log(err) });
}

function getSubadminCredById(req, res) {
	knex.select('username', 'password')
		.from(table.tbl_Customer)
		.where('id', req.query.id)
		.then((response) => {
			res.send({
				response: response[0]
			})
		})
}

function getResellerCredById(req, res) {
	knex.select('username', 'password')
		.from(table.tbl_Customer)
		.where('id', req.query.id)
		.then((response) => {
			res.send({
				response: response[0]
			})
		})
}

module.exports = {
	createUser, getAllUser, getAllUserStatusWise, verifyUsername, getUserInfo, custDashInfo, getInternalUserById, viewCustomDashboard,
	getInternalUser, deleteUser, inactiveUser, activeUser, getCustomerById, getCustomerBillingTypePackage,
	updateUserProfile, getUsersByFilters, getInternalUsersByFilters, getCustomerName, getCustomers, verifyCompany,
	getCustomerEmail, resetPassword, verifyEmail, verifynotificationEmail, getUsersForAccountManagerByFilters, getUsersForResellerByFilters,
	getAllUserForAccountManager, getUsersForSupportByFilters, getAllUserForSupport, getCustomercompany, getCustomercompanyReseller, getAllReseller, getAllResellerData,
	getAccountManagerCustomercompany, getAllCustomerCompany, getAllUserStatusWiseFilters, getAccountManagerProductCustomercompany, getPackageProductWise,
	getCompany, getAssignedUser, getAllSupportUser, updateLogoutLog, getUserByType, checkContactAssociateOrNot, getCustomerBillingTypeAndWithOutBundlePackage,
	getUserHasMinutePlan, sendUserEmail, UpdateProfile, setLogo, getLogoProfile, paidStatusCustomerInvoice, getProductLogo, getScriptURL, getTopDialOut, getCustomerIdByExtensionId, getAdminCredentials, getResellerCredByCust, getSubadminCredById, getResellerCredById
};
