const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const { from } = require('form-data');
const { response } = require('express');
const e = require('express');
const encrypt = require('../config/custom_encryption.utils');

/**
* @param req
* @param res
* @returns {*}
*/


function postTrunkList(req, res) {
    let data = req.body.credentials;
    //    let outbound_trunk = data.outbound_trunk ? data.outbound_trunk : '0';
    let outbound_trunk = data.outbound_trunk == true ? '1' : '0';
    let authentication = data.authentication ? data.authentication : '0';
    let inbound_trunk = data.inbound_trunk == true ? '1' : '0';
    let allow_calls = data.allow_calls == true ? "1" : '0';
    let reseller_id = data.reseller_id ? data.reseller_id : '0';
    let running_calls = data.running_calls ? data.running_calls : '0';
    let external_uri = data.external_uri ? data.external_uri : '';
    let profile = data.profile ? data.profile : '0';
    let password = data.password ? data.password : '';
    
    let whitelist_ip = "";
    if (data.whitelist_ip) {
        whitelist_ip = data.whitelist_ip ? data.whitelist_ip : '';
    } else if (data.whitelist_ip2) {
        whitelist_ip = data.whitelist_ip2 ? data.whitelist_ip2 : '';
    } else {
        whitelist_ip = "";
    }

    // const private_cipher = encrypt.cipher(config.appSecret);
    // let enc_password = private_cipher(password);
    let features = {
        'Max Simultaneous Calls': data.max_simultaneous_calls,
        'Caller': data.caller_id,
        'Use as Outbound Trunk': Number(outbound_trunk),
        'Username': data.username,
        "Authentication": "" + data.auth_name + "",
        "Use as Inbound Trunk": Number(inbound_trunk),
        "Allow Calls in Registration": Number(allow_calls),
        "External URI": external_uri,
        "Profile": data.profile_name,
        "Company": data.company_name
    }    
    let sql2 = knex.select('name', 'username').from(table.pbx_trunk)
        .where('name', 'like', data.name)
        if(data.username != "") {
            sql2.orWhere('username', "like", "%" + data.username + "%");
        }    
    sql2.then((resp) => {
        if(resp.length == 0) {
            let sql = knex(table.pbx_trunk).insert({
                name: data.name, max_call: data.max_simultaneous_calls, running_calls: '', caller_id: data.caller_id,
                use_as_out: "" + outbound_trunk + "", authentication: "" + authentication + "", username: data.username,
                password: password, whitelist_ip: "" + whitelist_ip + "", use_as_in: "" + inbound_trunk + "", uri: external_uri, allow_calls_in_registration: "" + allow_calls + "", profile_id: profile
                , customer_id: '', reseller_id: '', extension: '', customer_id: data.customer, reseller_id: "" + reseller_id + "", running_calls: "" + running_calls + "", cps: data.cps 
            })
            sql.then(async (response) => {
                let logs_response = await knex("pbx_audit_logs").insert({ module_name: data.name, module_action_id: response[0], message: "trunk created.", customer_id: data.customer_id, features: JSON.stringify(features) })
                res.send({
                    status_code: 200
                })
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.send({
                status_code: 404
            })
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}



function updateTrunkList(req, res) {
    let data = req.body.credentials;
    let id = req.body.credentials.id;

    let outbound_trunk = data.outbound_trunk ? data.outbound_trunk : '0';
    let authentication = data.authentication ? data.authentication : '0';
    let inbound_trunk = data.inbound_trunk ? data.inbound_trunk : '0';
    let allow_calls = data.allow_calls ? data.allow_calls : '0';
    let external_uri = data.external_uri ? data.external_uri : '';
    let profile = data.profile ? data.profile : '0';
    let password = data.password ? data.password : '';
    let whitelist_ip = [];
    if (data.whitelist_ip) {
        whitelist_ip = data.whitelist_ip ? data.whitelist_ip : '';
    } else if (data.whitelist_ip2) {
        data.whitelist_ip2 ? data.whitelist_ip2.map(item => {
            whitelist_ip.push(item)
        }) : '';
    } else {
        whitelist_ip = "";
    }

    let features = {
        'Max Simultaneous Calls': data.max_simultaneous_calls,
        'Caller': data.caller_id,
        'Use as Outbound Trunk': Number(outbound_trunk),
        'Username': data.username,
        "Authentication": "" + data.auth_name + "",
        "Use as Inbound Trunk": Number(inbound_trunk),
        "Allow Calls in Registration": Number(allow_calls),
        "External URI": external_uri,
        "Profile": data.profile_name,
        "Company": data.company_name
    }
    
    let sql = knex(table.pbx_trunk).where('id', '=', id)
        .update({
            name: data.name, max_call: data.max_simultaneous_calls, running_calls: '', caller_id: data.caller_id,
            use_as_out: outbound_trunk, authentication: "" + data.authentication + "", username: data.username,
            password: password, whitelist_ip: "" + whitelist_ip + "", use_as_in: inbound_trunk, uri: external_uri, allow_calls_in_registration: allow_calls, profile_id: profile, status: "Y"
            , customer_id: '', reseller_id: '', extension: '', customer_id: data.customer, cps: data.cps
        })
    sql.then(async (response) => {
        let logs_response = await knex("pbx_audit_logs").insert({ module_name: data.name, module_action_id: id, message: "trunk updated.", customer_id: data.customer_id, features: JSON.stringify(features) })
        res.send({
            status_code: 200
        })
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}


function getTrunkList(req, res) {

    let sql = knex.select('t.*', 'c.company_name').from(table.pbx_trunk + ' as t')
        .join(table.tbl_Customer + ' as c', 'c.id', 't.customer_id')
        .orderBy('t.id', 'desc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getTrunkListById(req, res) {

    let sql = knex.select('t.*', 'c.company_name').from(table.pbx_trunk + ' as t')
        .join(table.tbl_Customer + ' as c', 'c.id', 't.customer_id')
        .where('t.customer_id', req.body.id)
        .orderBy('t.id', 'desc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getSofiaProfile(req, res) {

    let sql = knex.select('*').from(table.pbx_sofia_profile);
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getActiveCustomers(req, res) {
    let sql = knex.select('company_name', 'id').from(table.tbl_Customer)
        .where('status', '1')
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getTrunkById(req, res) {
    let id = req.body.id;
    let sql = knex.select('*').from(table.pbx_trunk)
        .where('id', id);
    sql.then((response) => {      
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function deleteTrunk(req, res) {
    let id = req.query.id;
    let sql = knex(table.pbx_trunk).where('id', "=", "" + id + "").del();
    sql.then((response) => {
        res.send({
            message: "Deleted Successfully.",
            data: response
        })
    })

}

function deleteRoute(req, res) {
    let id = req.query.id;
    let sql = knex(table.pbx_trunk_routing).where('id', "=", "" + id + "").del();
    sql.then((response) => {
        res.send({
            message: "Deleted Successfully.",
            data: response
        })
    })

}

function getTrunkLIstByFilter(req, res) {

    let name = '';
    if (req.body.filters.by_name != null && req.body.filters.by_name != "") {
        name = req.body.filters.by_name;
    } else {
        name = null;
    }
    let company = '';
    if (req.body.filters.by_company != null && req.body.filters.by_company != "") {
        company = req.body.filters.by_company;
    } else {
        company = null;
    }


    let sql = knex.select('t.*', 'c.company_name').from(table.pbx_trunk + ' as t')
        .join(table.tbl_Customer + ' as c', 'c.id', 't.customer_id');

    if (req.body.filters.by_name != "") {
        sql.andWhere('name', 'like', '%' + name + '%');
    }
    if (req.body.filters.by_company != "") {
        sql.andWhere('customer_id', company);
    }
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getTrunkRoutingByFilter(req, res) {
    let name = '';
    if (req.body.filters.by_name != null && req.body.filters.by_name != "") {
        name = req.body.filters.by_name;
    } else {
        name = null;
    }
    let feature = '';
    if (req.body.filters.by_feature != null && req.body.filters.by_feature != "") {
        feature = req.body.filters.by_feature;
    } else {
        feature = null;
    }
    let dest = '';
    if (req.body.filters.by_prompt != null && req.body.filters.by_prompt != "") {
        dest = req.body.filters.by_prompt;
    } else {
        dest = null;
    }

    let sql = knex.select('t.name', 'tr.trunk_id', 'tr.destination', 'tr.destination_name', 'tr.active_feature').from(table.pbx_trunk + ' as t')
        .join(table.pbx_trunk_routing + ' as tr', 'tr.trunk_id', 't.id')
    // .join(table.tbl_DID_active_feature + ' as af','af.id','tr.active_feature')
    .where('tr.customer_id', req.body.customer_id)
        .orderBy('tr.id', 'desc');

    if (req.body.filters.by_name != "" && req.body.filters.by_name != null) {
        sql.andWhere('tr.trunk_id', name);
    }
    if (req.body.filters.by_feature != "" && req.body.filters.by_feature != null) {
        sql.andWhere('tr.active_feature', feature);
    }
    if (req.body.filters.by_prompt != "" && req.body.filters.by_prompt != null) {
        sql.andWhere('tr.destination', dest);
    }
    
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    return;
}

function postTrunkRouting(req, res) {
    let data = req.body.credentials;
    if (data.enable_bypass == true) {
        data.enable_bypass = '1'
    } else {
        data.enable_bypass = '0'
    }

    let sql = knex(table.pbx_trunk_routing).insert({
        trunk_id: data.trunk_name, destination: data.active_feature == '1' ? data.prompt_id : '*', enable_bypass_media: data.enable_bypass, customer_id: data.custId, active_feature: data.active_feature, destination_name: data.active_feature == '1' ? data.destination_name : ''
    })
    sql.then((response) => {
        res.send({
            status_code: 200
        })
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}


function getTrunkRouting(req, res) {
    let id = req.body.id;
    let sql = knex.select('tr.*', 't.name', 'tr.active_feature', 'tr.destination').from(table.pbx_trunk_routing + ' as tr')
        .leftJoin(table.pbx_trunk + ' as t', 't.id', 'tr.trunk_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'af.id', 'tr.active_feature')
        .where('tr.customer_id', id)
        .orderBy('tr.id', 'desc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getTrunkRoutingById(req, res) {
    let id = req.body.id;
    let sql = knex.select('*').from(table.pbx_trunk_routing)
        .where('id', id);
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function updateRouting(req, res) {
    let data = req.body.credentials;
    if (data.enable_bypass == true) {
        data.enable_bypass = '1'
    } else {
        data.enable_bypass = '0'
    }
    let sql = knex(table.pbx_trunk_routing).where('id', '=', data.id)
        .update({
            trunk_id: data.trunk_name, destination: data.active_feature == '1' ? data.prompt_id : '*', enable_bypass_media: data.enable_bypass, customer_id: data.custId, active_feature: data.active_feature, destination_name: data.active_feature == '1' ? data.destination_name : ''
        })
    sql.then((response) => {
        res.send({
            status_code: 200
        })
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getGeneralPrompt(req, res) {
    let id = req.body.id;
    let sql = knex.from(table.tbl_pbx_prompt)
        .select("*")
        .where('prompt_type', '17')
        .andWhere('customer_id', id)

    sql.then((response) => {
        res.send({
            response: response
        })
    })
}

function checkDuplicateUsername(req, res) {
    let
}
module.exports = {
    postTrunkList, getTrunkList, getTrunkById, updateTrunkList, getActiveCustomers, getSofiaProfile, deleteTrunk, getTrunkLIstByFilter, getTrunkListById, postTrunkRouting, getTrunkRouting, getTrunkRoutingById
    , updateRouting, getTrunkRoutingByFilter, deleteRoute, getGeneralPrompt, checkDuplicateUsername
};