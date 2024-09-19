const { knex } = require("../config/knex.db");
const table = require("../config/table.macros");
var request = require("request");
let pushEmail = require("./pushEmail");
var moment = require("moment");
const { createModuleLog } = require("../helper/modulelogger");

var headers = {
	Accept: "text/xml",
	"Content-Type": "text/xml",
};

var dataString =
	"<?xml version='1.0'?><methodCall><methodName>address_reload</methodName></methodCall>";
var options = {
	url: "http://127.0.0.1:8000/RPC2",
	method: "POST",
	headers: headers,
	body: dataString,
};

// Add Circle
function addCircle(req, res) {
	let body = req.body;
	let id = parseInt(req.query.id);
	let query = knex
		.select("cr.name")
		.from(table.tbl_Pbx_circle + " as cr")
		.where("cr.name", "=", body.name);
	query
		.then((response) => {
			if (response.length == 0) {
				let sql = knex(table.tbl_Pbx_circle).insert({
					name: "" + body.name + "",
					description: "" + body.description + "",
				});
				sql
					.then((response) => {
						if (response.length > 0) {
							res.json({
								response: response,
								code: 200,
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
			} else {
				res.json({
					response: response,
					code: 201,
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

//show circle list
function getcircleList(req, res) {
	var flags = "";
	var body = req.body;
	let isFilter = Object.keys(body).length == 0 ? false : true;
	let sql = knex.from(table.tbl_Pbx_circle).select("id", "name", "description");
	if (isFilter) {
		sql.where("name", "like", "%" + body.name + "%");
	}
	sql.orderBy("name", "asc");
	sql
		.then(async (response) => {
			if (response) {
				let Map = response ? response : null;
				await Map.map((data) => {
					let sql1 = knex(table.tbl_Call_Plan)
						.where("circle_id", data.id)
						.select("id");
					sql1.then((response1) => {
						if (response1.length && response1[0]["id"]) {
							flags = 0;
							Object.assign(data, { status: 1 });
						} else {
							let sql2 = knex(table.tbl_Package + " as p")
								.leftJoin(
									table.tbl_PBX_features + " as f",
									"p.feature_id",
									"f.id"
								)
								.where("f.circle_id", data.id)
								.select("p.id");
							sql2.then((response2) => {
								if (response2.length && response2[0]["id"]) {
									flags = 1;
									Object.assign(data, { status: 1 });
								}
							});
						}
					});
				});
				setTimeout(() => {
					if (flags == 0 || flags == 1) {
						res.json({
							response: Map,
						});
					} else {
						res.json({
							response,
						});
					}
				}, 1000);
			} else {
				res
					.status(401)
					.send({ error: "error", message: "DB Error: " + err.message });
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
function getblockedIP(req, res) {
	var body = req.body;
	let rangeFrom = body.created_at ? body.created_at[0] : null;
	let rangeTo = body.created_at ? body.created_at[1] : null;
	rangeFrom = rangeFrom
		? "'" + moment(rangeFrom).format("YYYY-MM-DD") + "'"
		: null;
	rangeTo = rangeTo ? "'" + moment(rangeTo).format("YYYY-MM-DD") + "'" : null;

	let sql = knex
		.from(table.tbl_pbx_f2b_ip)
		.select(
			"id",
			"ip",
			knex.raw(`Date_format(created_at,"%d-%m-%y %h:%i:%s") as created_at`)
		);
	if (body.ip) {
		sql.andWhere("ip", "like", "%" + body.ip + "%");
	}
	if (body.created_at && rangeFrom != rangeTo) {
		sql.andWhere(
			knex.raw(
				`DATE(created_at) >= ${rangeFrom} and DATE(created_at) <= ${rangeTo}`
			)
		);
	} else if (body.created_at && rangeFrom == rangeTo) {
		sql.andWhere(knex.raw(`DATE(created_at) = ${rangeFrom}`));
	}
	// sql.orderBy('name','asc')
	sql
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res
					.status(401)
					.send({ error: "error", message: "DB Error: " + err.message });
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

//search with id
function getCircleById(req, res) {
	let id = parseInt(req.query.id);
	knex
		.select("cr.id", "cr.name", "cr.description")
		.from(table.tbl_Pbx_circle + " as cr")
		.where("cr.id", "=", id)
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

//update circle
function updateCircle(req, res) {
	let body = req.body.circle;
	let sql = knex(table.tbl_Pbx_circle)
		.where("name", "=", "" + body.name + "")
		.whereNot("id", body.id);
	sql
		.then((response) => {
			if (response.length == 0) {
				let sql = knex(table.tbl_Pbx_circle).where(
					"id",
					"=",
					"" + body.id + ""
				);
				delete body.id;
				sql.update(body);
				sql
					.then((response) => {
						res.json({
							response: response,
							code: 200,
						});
					})
					.catch((err) => {
						console.log(err);
						res
							.status(401)
							.send({ error: "error", message: "DB Error: " + err.message });
						throw err;
					});
			} else {
				res.json({
					response: response,
					code: 201,
					message: `Circle name already exist`,
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

//Delete Circle
function deleteCircle(req, res) {
	let body = req.body.circle;

	knex
		.select("cp.id")
		.from(table.tbl_Call_Plan + " as cp")
		.where("cp.circle_id", "=", body.id)
		.then((response) => {
			if (response.length == 0) {
				let sql = knex(table.tbl_Pbx_circle).where(
					"id",
					"=",
					"" + body.id + ""
				);
				sql.del();
				sql
					.then((response) => {
						if (response) {
							res.json({
								response: response,
								code: 200,
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
			} else {
				res.json({
					response: response,
					code: 400,
					message: "You can not delete this circle!",
				});
			}
		});
}

function getAllCircle(req, res) {
	let sql = knex.from(table.tbl_Pbx_circle).select("*").orderBy("name");
	sql
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res
					.status(401)
					.send({ error: "error", message: "DB Error: " + err.message });
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

function getAllContactFromCircle(req, res) {
	var circleId = parseInt(req.query.id);
	let sql = knex
		.select(
			"cr.*",
			knex.raw("GROUP_CONCAT(c.company_name) as company_name"),
			knex.raw("GROUP_CONCAT(c.first_name) as first_name"),
			knex.raw("GROUP_CONCAT(c.last_name) as last_name"),
			knex.raw("GROUP_CONCAT(c.email) as email"),
			knex.raw("GROUP_CONCAT(c.mobile) as mobile")
		)
		.from(table.tbl_Pbx_circle + " as cr")
		.leftJoin(table.tbl_PBX_features + " as f", "f.circle_id", "cr.id")
		.leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
		.leftJoin(
			table.tbl_Map_customer_package + " as mpckg",
			"mpckg.package_id",
			"pckg.id"
		)
		.leftJoin(table.tbl_Customer + " as c", "c.id", "mpckg.customer_id")
		.where("cr.id", circleId)
		.orderBy("cr.id", "desc");
	sql
		.then((response) => {
			var customerInfo = response;
			let sql = knex
				.select("cp.name")
				.from(table.tbl_Call_Plan + " as cp")
				.where("cp.circle_id", circleId)
				.orderBy("cp.id", "desc");
			sql
				.then((response2) => {
					var callPlanInfo = response2;
					let sql = knex
						.select("p.id", "p.name")
						.from(table.tbl_Package + " as p")
						.leftJoin(table.tbl_PBX_features + " as f", "p.feature_id", "f.id")
						.where("f.circle_id", circleId)
						.orderBy("p.id", "desc");
					sql
						.then((response3) => {
							let obj = {
								contactData: customerInfo,
								callPlanInfo: callPlanInfo,
								packageInfo: response3,
							};
							res.json({
								response: obj,
							});
						})
						.catch((err) => {
							console.log(err);
							res
								.status(401)
								.send({ error: "error", message: "DB Error: " + err.message });
							throw err;
						});
				})
				.catch((err) => {
					console.log(err);
					res
						.status(401)
						.send({ error: "error", message: "DB Error: " + err.message });
					throw err;
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

function createWhiteListIP(req, res) {
	if (req.body.ipDetail.status == true || req.body.ipDetail.status == "1") {
		req.body.ipDetail.status = "1";
	} else {
		req.body.ipDetail.status = "0";
	}
	let modified_by = req.userId;
	let arr = {
		id: req.body.ipDetail.id,
		ip: req.body.ipDetail.ip,
		status: req.body.ipDetail.status,
		description: req.body.ipDetail.description,
	};
	console.log(
		knex
			.raw(
				"Call pbx_save_whitelist_ip(" +
				req.body.ipDetail.id +
				",'" +
				req.body.ipDetail.ip +
				"','" +
				req.body.ipDetail.status +
				"','" +
				req.body.ipDetail.description +
				"')"
			)
			.toString()
	);
	knex
		.raw(
			"Call pbx_save_whitelist_ip(" +
			req.body.ipDetail.id +
			",'" +
			req.body.ipDetail.ip +
			"','" +
			req.body.ipDetail.status +
			"','" +
			req.body.ipDetail.description +
			"')"
		)
		.then((response) => {
			if (response) {
				function callback(error, response2, body) {
					input = {
						ip: req.body.ipDetail.ip,
						Activate: req.body.ipDetail.status,
						Description: req.body.ipDetail.description
					}
					createModuleLog(table.tbl_pbx_audit_logs, {
						module_name: "whitelist ip",
						module_action_id: req.body.ipDetail?.id ? req.body.ipDetail?.id : response[0][0][0].id,						
						message: req.body.ipDetail?.id ? "Whitelist IP Detail Updated" : "Whitelist IP Detail Created",
						customer_id: modified_by,
						features: "" + JSON.stringify(input) + "",
					});
					if (!error && response2.statusCode == 200) {
						res.send({
							code: response[0][0][0].MYSQL_SUCCESSNO,
							message: response[0][0][0].MESSAGE_TEXT,
							server_message: "Configuration has been updated.",
						}); //Requested server is running
					} else {
						res.send({
							code: response[0][0][0].MYSQL_SUCCESSNO,
							message: response[0][0][0].MESSAGE_TEXT,
							server_message: "Requested server is not running at port 8000",
						});
					}
				}
				request(options, callback);
				// res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT,  });
			}
		})
		.catch((err) => {
			res.send({ code: err.errno, message: err.sqlMessage });
		});
}

function viewWhiteListIPDetails(req, res) {
	// req.body.id = req.body.id ? req.body.id : null;
	req.body.by_ip = req.body.by_ip ? "'" + req.body.by_ip + "'" : null;
	req.body.by_status = req.body.by_status ? req.body.by_status : null;
	knex
		.raw(
			"Call pbx_get_whiteList_IP(" +
			req.body.by_ip +
			"," +
			req.body.by_status +
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

function deleteWhiteListIP(req, res) {
	let modified_by = req.userId;
	let circle_id = req.query[Object.keys(req.query)[0]];
	knex
		.raw(
			"Call pbx_delete_whitelist_ip(" +
			req.query[Object.keys(req.query)[0]] +
			")"
		)
		.then((response) => {
			if (response) {
				function callback(error, response2, body) {
					createModuleLog(table.tbl_pbx_circle_detail_history, {
						circle_id: circle_id,
						action: "Circle Detail deleted",
						modified_by,
						data: "" + JSON.stringify(response) + "",
					});
					if (!error && response2.statusCode == 200) {
						res.send({
							code: response[0][0][0].MYSQL_SUCCESSNO,
							message: response[0][0][0].MESSAGE_TEXT,
							server_message: "Configuration has been updated",
						}); // server is running
					} else {
						res.send({
							code: response[0][0][0].MYSQL_SUCCESSNO,
							message: response[0][0][0].MESSAGE_TEXT,
							server_message: "Requested server is not running at port 8000",
						});
					}
				}
				request(options, callback);
				// res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
			}
		})
		.catch((err) => {
			res.send({ code: err.errno, message: err.sqlMessage });
		});
}

//show dialout group list
function getDialoutGroup(req, res) {
	var body = req.body;
	let isFilter = Object.keys(body).length == 0 ? false : true;
	let sql = knex
		.from(table.tbl_pbx_dialout_group)
		.select("id", "name", "description");
	if (isFilter) {
		sql.where("name", "like", "%" + body.name + "%");
	}
	sql.orderBy("name", "asc");
	sql
		.then(async (response) => {
			if (response) {
				let Map = [];
				Map = response ? response : null;
				await Map.map((data) => {
					let sql1 = knex
						.select("c.first_name", "c.last_name", "c.company_name")
						.from(table.tbl_Customer + " as c")
						.leftJoin(
							table.tbl_pbx_dialout_group + " as d",
							"d.id",
							"c.dialout_group"
						)
						.where("c.dialout_group", data.id);
					sql1.then(async (responses) => {
						if (responses.length) {
							await Object.assign(data, { flag: 1 });
						}
					});
				});
				setTimeout(() => {
					res.send({ response: Map });
				}, 500);
				// res.json({
				//     response
				// });
			} else {
				res
					.status(401)
					.send({ error: "error", message: "DB Error: " + err.message });
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

function createDialOutGroup(req, res) {
	let id = req.body.id ? req.body.id : null;
	let modified_by = req.userId;
	let arr = {
		id: id,
		name: req.body.name,
		description: req.body.description,
	};
	knex
		.raw(
			"Call pbx_save_dialoutGroup(" +
			id +
			",'" +
			req.body.name +
			"','" +
			req.body.description +
			"')"
		)
		.then((response) => {
			if (response) {				
				res.send({
					code: response[0][0][0].MYSQL_SUCCESSNO,
					message: response[0][0][0].MESSAGE_TEXT,
				});
			}
			let input = {
				"Dialout Group": req.body.name,
				"Description": req.body.description
			}
			createModuleLog(table.tbl_pbx_audit_logs, {
				module_action_id: id ? id : response[0][0][0].dial_id,
				module_name: "dialout",
				module_action_name: req.body.name,
				message: id ? "Dialout Group Updated" : "Dialout Group Created",
				customer_id: modified_by,
				features: "" + JSON.stringify(input) + "",
			});
		})
		.catch((err) => {
			res.send({ code: err.errno, message: err.sqlMessage });
		});
}

function createDialOutRules(req, res) {
	let id = req.body.id ? req.body.id : null;
	let is_sign = req.body.is_sign == true || req.body.is_sign == "1" ? "1" : "";
	req.body.prepend_digit = req.body.prepend_digit ? req.body.prepend_digit : "";
	req.body.strip_digit = req.body.strip_digit ? req.body.strip_digit : "";
	let excpt_rules = (req.body.exceptional_rule = req.body.exceptional_rule
		.length
		? "'" + req.body.exceptional_rule + "'"
		: null);
	let arr = req.body;
	let modified_by = req.userId;
	req.body.caller_id_pstn = req.body.caller_id_pstn == null ? '0' : req.body.caller_id_pstn;
	req.body.is_random = req.body.is_random == "" || !req.body.is_random ? '0' : "1";	
	console.log(
		knex
			.raw(
				"Call pbx_save_dialout_rules(" +
				id +
				"," +
				req.body.dialout_group_id +
				",'" +
				req.body.rule_pattern +
				"','" +
				req.body.prepend_digit +
				"','" +
				req.body.strip_digit +
				"','" +
				req.body.dialout_manipulation +
				"','" +
				req.body.blacklist_manipulation +
				"'," +
				excpt_rules +
				"," +
				req.body.caller_id_pstn +
				",'" +
				req.body.is_random + 
				"')"
			)
			.toString()
	);
	knex
		.raw(
			"Call pbx_save_dialout_rules(" +
			id +
			"," +
			req.body.dialout_group_id +
			",'" +
			req.body.rule_pattern +
			"','" +
			req.body.prepend_digit +
			"','" +
			req.body.strip_digit +
			"','" +
			req.body.dialout_manipulation +
			"','" +
			req.body.blacklist_manipulation +
			"'," +
			excpt_rules +
			"," +
			req.body.caller_id_pstn +
			",'" +
			req.body.is_random + 
			"')"			
		)
		.then((response) => {
			if (response) {
				createModuleLog(table.tbl_pbx_dialout_rule_detail_history, {
					dialout_id: arr?.id, // it will be implemented later
					action: arr?.id
						? "Dialout Rule Detail Updated"
						: "New Dialout Rule Detail Created",
					modified_by,
					data: "" + JSON.stringify(arr) + "",
				});
				res.send({
					code: response[0][0][0].MYSQL_SUCCESSNO,
					message: response[0][0][0].MESSAGE_TEXT,
				});
			}
		})
		.catch((err) => {
			res.send({ code: err.errno, message: 'Invalid exceptional rule' });
		});
}

//show dialout rule list
function getDialoutRule(req, res) {
	var body = req.body;
	let isFilter = Object.keys(body).length == 0 ? false : true;
	let sql = knex
		.from(table.tbl_pbx_dialout_rule + " as dr")
		.select("dr.*", "dg.name as dialout_group_name")
		.leftJoin(
			table.tbl_pbx_dialout_group + " as dg",
			"dg.id",
			"dr.dialout_group_id"
		);
	if (isFilter) {
		sql.where("dg.id", body.dialout_group);
	}
	sql.orderBy("dr.created_at", "desc");
	sql
		.then((response) => {
			if (response) {
				res.json({
					response,
				});
			} else {
				res
					.status(401)
					.send({ error: "error", message: "DB Error: " + err.message });
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

//Delete DialOutGroup
function deleteDialOutGroup(req, res) {
	let body = req.body;
	let modified_by = req.userId;
	//    let customer_name = "";
	knex
		.select("c.id", "c.first_name")
		.from(table.tbl_Customer + " as c")
		.where("c.dialout_group", "=", body.id)
		.then((response) => {
			//  customer_name = response[0] ? response[0]['first_name'] : '';
			if (response.length == 0) {
				knex
					.select("dr.id")
					.from(table.tbl_pbx_dialout_rule + " as dr")
					.where("dr.dialout_group_id", "=", body.id)
					.then((response2) => {
						if (response2.length == 0) {
							let sql = knex(table.tbl_pbx_dialout_rule).where(
								"dialout_group_id",
								"=",
								"" + body.id + ""
							);
							sql.del();
							sql
								.then((response) => {
									// if (response) {
									let sql2 = knex(table.tbl_pbx_dialout_group).where(
										"id",
										"=",
										"" + body.id + ""
									);
									sql2.del();
									sql2
										.then((response) => {
											res.json({
												message: "Dialout group is deleted successfully !",
												code: 200,
											});
											createModuleLog(table.tbl_pbx_dialout_group_history, {
												dialout_id: body.id,
												action: "Dialout deleted",
												modified_by,
												data: "" + JSON.stringify(response) + "",
											});
										})
										.catch((err) => {
											console.log(err);
											res.status(401).send({
												error: "error",
												message: "DB Error: " + err.message,
											});
											throw err;
										});
									// } else {
									//     res.status(401).send({ error: 'error', message: 'Associated ' });
									// }
								})
								.catch((err) => {
									console.log(err);
									res.status(401).send({
										error: "error",
										message: "DB Error: " + err.message,
									});
									throw err;
								});
						} else {
							res.json({
								code: 400,
								message: "This dialout group is exist with dialout rules",
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
			} else {
				res.json({
					code: 400,
					message: "This dialout group is exist with customers !",
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

function getAllContactFromDialOutGroup(req, res) {
	var dialOutGroupId = parseInt(req.query.id);
	knex
		.select("c.*")
		.from(table.tbl_Customer + " as c")
		.where("c.dialout_group", dialOutGroupId)
		.orderBy("c.id", "desc")
		.then((response) => {
			res.json({
				response: response,
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

function getAssociatedUser(req, res) {
	let data = req.query.id;
	let groupID = parseInt(req.query.id);
	let sql = knex
		.select("c.first_name", "c.last_name", "c.company_name")
		.from(table.tbl_Customer + " as c")
		.leftJoin(table.tbl_pbx_dialout_group + " as d", "d.id", "c.dialout_group")
		.where("c.dialout_group", groupID);
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

//Delete DialOutGroup
function deleteDialOutRule(req, res) {
	let modified_by = req.userId;
	let body = req.body;
	let sql2 = knex(table.tbl_pbx_dialout_rule).where(
		"id",
		"=",
		"" + body.id + ""
	);
	sql2.del();
	sql2
		.then((response) => {
			if (response) {
				createModuleLog(table.tbl_pbx_dialout_rule_detail_history, {
					dialout_id: body.id,
					action: "Dialout Rule Detail Deleted",
					modified_by,
					data: "" + JSON.stringify(response) + "",
				});
				res.json({
					message: "Dialout rule is deleted successfully !",
					code: 200,
				});
			} else {
				res.json({
					message: "Dialout rules does`t exist !",
					code: 400,
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

 function addSmtp(req,res){
	let data = req.body;	
	let status = data.status == true ? '1' : '0';
	let features = {
		'Host' : data.host,
		'Port' : data.port,
		'Name' : data.name,
		'Username' : data.username,
		'Password' :  data.password,
		'Status' : Number(status)
	}

	knex.from(table.tbl_pbx_smtp).select('id').where('name','like',data.name).then((resp)=>{
		if(resp.length > 0){
			res.send({
				status_code: 409,
				message : 'Duplicate Name.'
			})
		}else{
			let sql = knex.table(table.tbl_pbx_smtp)
			.insert({
				host: data.host, port: data.port , name: data.name, username: data.username , password: data.password , status: status
			})
			sql.then(async (response) => {                
				if(status == '1'){
					knex.table(table.tbl_pbx_smtp).update({ status: '0'}).where('id','!=',response[0]).then((respon)=>{
					})
				}
				let logs_response = await knex("pbx_audit_logs").insert({module_name: 'SMTP',module_action_name: data.name, module_action_id: response[0], message: "SMTP created.", customer_id: data.cust_id, features: JSON.stringify(features) })
				.then((response2)=>{
					console.log("response2");
				})  
				res.send({
					status_code : 200
				})
			}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
		}
	}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateSmtp(req,res){
	let data = req.body;	
	let status = data.status == true ? '1' : '0';	

	let features = {
		'Host' : data.host,
		'Port' : data.port,
		'Name' : data.name,
		'Username' : data.username,
		'Password' :  data.password,
		'Status' : Number(data.status)
	}

	knex.from(table.tbl_pbx_smtp).select('id').where('name','like',data.name).andWhere('id','!=',data.id).then((resp)=>{
		if(resp.length > 0){
			res.send({
				status_code: 409,
				message : 'Duplicate Name.'
			})
		}else{
			let sql = knex.table(table.tbl_pbx_smtp).where('id',data.id)
			.update({
				host: data.host, port: data.port , name: data.name, username: data.username , password: data.password , status: status
			})
			sql.then(async (response) => {    
				if(status == '1'){
					knex.table(table.tbl_pbx_smtp).update({ status: '0'}).where('id','!=',data.id).then((respon)=>{
					})
				}            
				let logs_response = await knex("pbx_audit_logs").insert({module_name: 'SMTP',module_action_name: data.name, module_action_id: response[0], message: "SMTP updated.", customer_id: data.cust_id, features: JSON.stringify(features) })  
				res.send({
					status_code : 200
				})
			}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
		}
	}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getSmtpList(req,res){
	let sql = knex.from(table.tbl_pbx_smtp).select('*',knex.raw('DATE_FORMAT(created_at, "%d/%m/%Y %H:%i:%s") as created_at')).orderBy('id','desc')
	.then((response)=>{
		res.send({
			response: response
		})
	}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getSmtpListByFilter(req,res){
	let data = req.body.filters;
	let host = data.host? data.host : null;
	let port = data.port? data.port : null;
	let name = data.name? data.name : null;
	let username = data.username? data.username : null;

	let sql = knex.from(table.tbl_pbx_smtp).select('*',knex.raw('DATE_FORMAT(created_at, "%d/%m/%Y %H:%i:%s") as created_at'))

	if(host != null){
		sql.andWhere('host','like','%' + host + '%')
    }
    if(port != null){
        sql.andWhere('port','like','%' + port + '%')
    }
	if(name != null){
		sql.andWhere('name','like','%' + name + '%');
    }
	if(username != null){
		sql.andWhere('username','like','%' + username + '%')
    }
	sql.orderBy('id','desc')
	
	sql.then((response)=>{
		res.send({
			response: response
		})
	}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteSmtp(req,res){
	let id = req.query.id;

	let sql = knex.table(table.tbl_pbx_smtp).where('id',id).del()
	.then((response)=>{
		if(response){
			res.send({
				status_code : 200
			})
		}
	}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getSmtpByList(req,res){
	
	let id = req.query.id;

	let sql = knex.from(table.tbl_pbx_smtp).select('*').where('id',id)
	.then((response)=>{
		res.send({
			response: response[0]
		})
	}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

module.exports = {
	addCircle,
	getcircleList,
	getCircleById,
	updateCircle,
	deleteCircle,
	getAllCircle,
	getAllContactFromCircle,
	createWhiteListIP,
	viewWhiteListIPDetails,
	deleteWhiteListIP,
	getblockedIP,
	getDialoutGroup,
	createDialOutGroup,
	createDialOutRules,
	getDialoutRule,
	deleteDialOutGroup,
	getAllContactFromDialOutGroup,
	deleteDialOutRule,
	getAssociatedUser,
	addSmtp,
	getSmtpList,
	getSmtpListByFilter,
	deleteSmtp,
	getSmtpByList,
	updateSmtp
};
