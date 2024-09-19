const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const moment = require('moment');

function createVoicebot(req, res) {

    let data = req.body.credentials;

    let playback = data.playback == "1" ? "1" : "0";
    let media_type = data.media_type == "1" ? "1" : "0";
    let sample_rate = data.sample_rate == "1" ? "1" : "0";

    let features = {
        'Name': data.name,
        'Websocket URl': data.websocket_url,
        'Playback': data.playback + 't',
        'Media Type': data.media_type,
        'Sample Rate': data.sample_rate
    }

    knex.from(table.tbl_pbx_voicebot).select('id').where('name', 'like', data.name).andWhere('customer_id', data.cust_id)
        .then((resp) => {
            if (resp.length > 0) {
                res.send({
                    status_code: 409,
                    message: 'Duplicate Entry'
                })
            } else {
                let sql = knex(table.tbl_pbx_voicebot)
                    .insert({
                        name: "" + data.name + "", websocket_url: "" + data.websocket_url + "", playback: playback, media_type: media_type, sample_rate: sample_rate, customer_id: data.cust_id
                    })
                sql.then(async (response) => {
                    let logs_response = await knex("pbx_audit_logs").insert({ module_name: 'Voicebot', module_action_name: data.name, module_action_id: response[0], message: "Voicebot created.", customer_id: data.cust_id, features: JSON.stringify(features) })
                    res.send({
                        status_code: 200
                    })
                }).catch(err => {
                    res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
                    throw err;
                });
            }
        })

}

function updateVoicebotData(req, res) {
    let data = req.body.credentials;

    let playback = data.playback == "1" ? "1" : "0";
    let media_type = data.media_type == "1" ? "1" : "0";
    let sample_rate = data.sample_rate == "1" ? "1" : "0";

    let features = {
        'Name': data.name,
        'Websocket URl': data.websocket_url,
        'Playback': data.playback + 't',
        'Media Type': data.media_type,
        'Sample Rate': data.sample_rate
    }

    knex.from(table.tbl_pbx_voicebot).select('id').where('name', 'like', data.name).andWhere('id', '!=', data.id).andWhere('customer_id', data.cust_id)
        .then((resp) => {
            if (resp.length > 0) {
                res.send({
                    status_code: 409,
                    message: 'Duplicate Entry'
                })
            } else {
                let sql = knex(table.tbl_pbx_voicebot).where('id', data.id)
                    .update({
                        name: "" + data.name + "", websocket_url: "" + data.websocket_url + "", playback: playback, media_type: media_type, sample_rate: sample_rate, customer_id: data.cust_id
                    })

                sql.then(async (response) => {
                    let logs_response = await knex("pbx_audit_logs").insert({ module_name: 'Voicebot', module_action_name: data.name, module_action_id: response[0], message: "Voicebot updated.", customer_id: data.cust_id, features: JSON.stringify(features) })
                    res.send({
                        status_code: 200
                    })
                }).catch(err => {
                    res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
                    throw err;
                });
            }
        })

}

function getVoicebotById(req, res) {
    let id = req.body.id;

    knex.from(table.tbl_pbx_voicebot).select('*').where('id', id)
        .then((response) => {
            res.send({
                response: response
            })
        })
}


function getVoicebotList(req, res) {
    let id = req.query.cust_id;

    let sql = knex.from(table.tbl_pbx_voicebot).select('*').where('customer_id', id)

    sql.then((response) => {
        res.send({
            response: response
        })
    })
}

function getVoicebotListByFilter(req, res) {
    let data = req.body.credentials;


    let sql = knex.from(table.tbl_pbx_voicebot).select('*').where('customer_id', data.customer_id)
    if (data.name != "") {
        sql.andWhere('name', 'like', '%' + data.name + '%');
    }
    if (data.media_type != "") {
        sql.andWhere('media_type', data.media_type)
    }
    if (data.sample_rate != "") {
        sql.andWhere('sample_rate', data.sample_rate)
    }
    sql.then((response) => {
        res.send({
            response: response
        })
    })
}

function getVoicebotCDR(req, res) {
    let user_id = req.query.id;
    let sql = knex.raw("Call pbx_getVoicebotCdrInfo(" + user_id + "," + req.query.limit_flag + ")")

    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

}

function getVoicebotCount(req, res) {
    let id = req.query.id;
    knex.count('destination_id as voicebot_count').from(table.tbl_DID_Destination).where('destination_id', id).andWhere('active_feature_id', '16')
        .then((response) => {
            let count = response[0]['voicebot_count']
            if (response) {
                res.json({
                    voicebot_count: count
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getVoicebotCDRByFilter(req, res) {
    let data = req.body.credentials;

    data.by_buycost = null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    // data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    terminatecause = data.by_terminatecause ? ("'" + data.by_terminatecause + "'") : null;
    if (typeof terminatecause !== "object") {
        data.by_terminatecause = (data.by_terminatecause).length ? ("'" + data.by_terminatecause + "'") : null;
    } else {
        data.by_terminatecause = null
    }
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;
    destination = data.by_destination ? data.by_destination : null;
    if (typeof destination != "object") {
        let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+' + item) : "";
        data.by_destination = destination_data ? ("'" + destination_data + "'") : null;
    } else {
        data.by_destination = null
    }

    data.page_per_size = data.page_per_size ? ("'" + data.page_per_size + "'") : null;
    data.page_number = data.page_number ? ("'" + data.page_number + "'") : null;

    let sql = knex.raw("Call pbx_getVoicebotCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.user_id + "," + data.by_buycost + "," + data.by_sellcost + "," + data.by_src + "," + data.by_dest + "," + data.by_destination + "," + data.by_callerid + "," + data.by_terminatecause + "," + data.by_call_type + "," + data.page_per_size + "," + data.page_number + ")")

    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function deleteVoicebot(req, res) {

    let id = req.query.id;

    let sql = knex(table.tbl_pbx_voicebot).where('id', id).del()

    sql.then((resp) => {
        res.send({
            status_code: 200
        })
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}


module.exports = {
    createVoicebot, getVoicebotList, getVoicebotListByFilter, getVoicebotById, updateVoicebotData, getVoicebotCDRByFilter, getVoicebotCDR, deleteVoicebot, getVoicebotCount
}