const { knex } = require("../config/knex.db");
const table = require("../config/table.macros.js");
const { createModuleLog } = require("../helper/modulelogger");

function createProvider(req, res) {
	var data = req.body.provider;
	let modified_by = req.userId;
	let arr = {
		provider: req.body.provider,
	};
	knex(table.tbl_Provider)
		.insert({
			provider: "" + data.provider + "",
		}).returning('id')
		.then((id, response) => {
			input = {
				"Provider Name": data.provider
			}
			createModuleLog(table.tbl_pbx_audit_logs, {
				module_action_id: id,			
				module_name: "provider",
				module_action_name: data.provider,
				message: "Provider Created",
				customer_id: modified_by,
				features: "" + JSON.stringify(input) + "",
			});
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

function updateProvider(req, res) {
	var data = req.body.provider;
	let modified_by = req.userId;
	let arr = {
		provider: req.body.provider,
	};
	knex(table.tbl_Provider)
		.where("id", "=", "" + data.id + "")
		.update({ provider: "" + data.provider + "" })
		.then((response) => {
			if (response === 1) {
				res.json({
					response,
				});
				input = {
					"Provider Name": data.provider
				}
				createModuleLog(table.tbl_pbx_audit_logs, {
					module_action_id: data.id,			
					module_name: "provider",
					module_action_name: data.provider,
					message: "Provider Updated",
					customer_id: modified_by,
					features: "" + JSON.stringify(input) + "",
				});
			} else {
				res.status(401).send({ error: "Success", message: "Provider updated" });
			}
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
}

function verifyProvider(req, res) {
	let provider = req.body.provider;
	knex
		.from(table.tbl_Provider)
		.where("provider", "" + provider + "")
		.select("id")
		.then((response) => {
			if (response.length >= 1) {
				res.json({
					provider: response[0].id,
				});
			} else {
				res.json({
					provider: "",
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

function deleteProvider(req, res) {
	let id = parseInt(req.query.id);
    let modified_by = req.userId;    
	knex
		.raw("Call pbx_delete_providers(" + id + ")")
		.then((response) => {
			createModuleLog(table.tbl_pbx_provider_history, {
				provider_id: req.query.id,
				action: "Provider deleted",
				modified_by,
				data: "" + JSON.stringify(response) + "",
			});
			if (response) {
				res.send({
					code: response[0][0][0].MYSQL_SUCCESSNO,
					message: response[0][0][0].MESSAGE_TEXT,
				});
			}
		})
		.catch((err) => {
			console.log(err);
			res.send({ code: err.errno, message: err.sqlMessage });
		});
}

function isProviderInUse(req, res) {
	let id = parseInt(req.query.id);
	knex
		.select(knex.raw('count("p.id") as ids'))
		.from(table.tbl_Provider + " as p")
		.join(table.tbl_Gateway + " as g", "p.id", "g.provider_id")
		.where("p.id", "=", id)
		.then((response) => {
			res.json({
				response,
			});
		});
}

function getProviderById(req, res) {
	let id = parseInt(req.query.id);
	knex
		.select("provider")
		.from(table.tbl_Provider)
		.where("id", "=", id)
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

function viewDIDDetailsBasedOnDID(req, res) {
	let id = parseInt(req.query.id);
	var sql = knex
		.select(
			"d.id",
			"pro.provider",
			"d.product_id",
			"c.name as country",
			"d.activated",
			"d.reserved",
			"d.customer_id",
			"d.did",
			knex.raw("CONCAT((CONCAT(\"+\",c.phonecode)), ' ',d.did) as didDisplay"),
			"d.secondusedreal",
			"d.billingtype",
			"d.fixrate",
			"d.connection_charge",
			"d.selling_rate",
			"d.max_concurrent",
			knex.raw(
				'IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'
			),
			knex.raw(
				'IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'
			),
			knex.raw('IF (d.status = "0","Inactive","Active") as status'),
			"u.company_name as company",
			"d.customer_id",
			"af.active_feature",
			"dest.active_feature_id"
		)
		.from(table.tbl_DID + " as d")
		.leftJoin(table.tbl_Provider + " as pro", "d.provider_id", "pro.id")
		.leftJoin(table.tbl_Country + " as c", "c.id", "d.country_id")
		.leftJoin(table.tbl_Customer + " as u", "u.id", "d.customer_id")
		.leftJoin(table.tbl_DID_Destination + " as dest", "d.id", "dest.did_id")
		.leftJoin(
			table.tbl_DID_active_feature + " as af",
			"dest.active_feature_id",
			"af.id"
		)
		.where("d.provider_id", id)
		.orderBy("d.id", "desc");
	sql
		.then((response) => {
			res.json({
				response,
			});
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
}

function viewProviderDetails(req, res) {
	var sql = knex
		.select(
			"p.id",
			"p.provider",
			knex.raw("GROUP_CONCAT(DISTINCT(d.id)) as did_id"),
			knex.raw("GROUP_CONCAT(DISTINCT(d.status)) as did_status"),
			knex.raw("GROUP_CONCAT(d.customer_id) as did_customer_id"),
			knex.raw("GROUP_CONCAT(DISTINCT (d.did)) as did_number"),
			knex.raw("GROUP_CONCAT(DISTINCT(if(g.ip != '',g.ip,g.domain))) as gateways"),
		)
		.from(table.tbl_Provider + " as p")
		.leftJoin(table.tbl_DID + " as d", "d.provider_id", "p.id")
		.leftJoin(table.tbl_Gateway + " as g","g.provider_id","p.id")
		// if (req.query.role = 3) {
		// 	sql.whereIn('d.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.ResellerID}`))
		// }
		// .andWhere('d.customer_id', '!=0')
		// .where('d.customer_id', '!=', '')
		sql.orderBy("p.id", "desc")
		sql.groupBy("p.id");
		console.log(sql.toQuery());
	sql.then((response) => {
			res.json({
				response,
			});
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
}

function viewProviderAssignDID(req, res) {
	var sql = knex
		.select("d.activated")
		.from(table.tbl_DID + " as d")
		.leftJoin(table.tbl_Provider + " as p", "d.provider_id", "p.id")
		.where("d.activated", "!=", "0");
	// .orderBy('d', 'desc')
	// .groupBy('p.id');
	sql
		.then((response) => {
			res.json({
				response,
			});
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
}

module.exports = {
	createProvider,
	verifyProvider,
	getProviderById,
	viewProviderDetails,
	deleteProvider,
	updateProvider,
	isProviderInUse,
	viewProviderAssignDID,
	viewDIDDetailsBasedOnDID,
};
