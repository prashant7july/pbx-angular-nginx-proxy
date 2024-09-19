const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');

function getActivityLog(req, res) {
    let sql = knex.raw("Call pbx_getActivityLog(" + req.query.user_type + "," + req.query.user_id + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getActivityLogByFilter(req, res) {
    const data = req.body.filters || {};
    const by_ip = data.by_ip || null;
    const by_username = data.by_username || null;
    const user_type = req.body.user_type ? parseInt(req.body.user_type, 10) : null;
    const user_id = req.body.user_id ? parseInt(req.body.user_id, 10) : null;
    const rangeFrom = data.by_date && data.by_date[0] ? moment(data.by_date[0]).format('YYYY-MM-DD') : null;
    const rangeTo = data.by_date && data.by_date[1] ? moment(data.by_date[1]).format('YYYY-MM-DD') : null;
    const by_logs = data.by_logs || null;

    knex.raw("Call pbx_getActivityLogByFilter(?,?,?,?,?,?,?)", [
        by_ip,
        by_username,
        rangeFrom,
        rangeTo,
        user_type,
        user_id,
        by_logs
    ])
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        })
        .catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getCountryListActive(req, res) {
    // let customer_id = parseInt(req.query.cId);
    var sql = knex.from(table.tbl_Customer)
        .select('company_name', 'id')
        .where('status', '=', '1');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getAllBackendAPILog(req, res) {
    let sql = knex.from(table.tbl_api_logs + ' as l')
        .select('l.*', 'c.company_name', knex.raw('DATE_FORMAT(l.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
            knex.raw('IF (l.application = "pbx","Web User",IF (l.application = "sp","Mobile",IF (l.application = "crm","CRM",""))) AS application'))
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'l.customer_id')
    if (req.query.role == 3) {
        sql.whereIn('l.customer_id', knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.ResellerID}`));
    }
    sql.orderBy('id', 'desc')
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getAllBackendAPILogByFilter(req, res) {
    let data = req.body.filters;
    data.by_username = data.by_username ? ("" + data.by_username + "") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_responsecode = data.by_responsecode ? ("'" + data.by_responsecode + "'") : null;
    knex.raw("Call pbx_getBackendAPILogByFilter(" + data.by_username + ", " + rangeFrom + "," + rangeTo + "," + data.by_responsecode + "," + req.body.role + "," + req.body.ResellerID + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}


// api for dialog
function auditbyId(req, res) {
    let id = req.query.id;
    let sql = knex(table.tbl_api_logs).where('id', id).select('params');
    sql.then((response) => {
        res.send({
            status_code: 200,
            data: response[0]['params']
        });
    })
}
function getC2CStatus(req, res) {
    let uuid = (req.query.uuid) ? req.query.uuid : 0;
    let sql = knex.from('live_calls' + ' as r')
        .select('r.uuid', 'r.destination', 'r.current_status', 'r.src', 'r.call_disposition', knex.raw('CONVERT(r.terminatecause,UNSIGNED INTEGER) AS terminatecause'), 'c.description')
        .leftJoin(table.tbl_Pbx_TerminateCause + ' as c', 'c.digit', 'r.terminatecause')
        .where('r.uuid', '=', uuid);
    // .where('r.uuid', 'like', "%" + uuid + "%");
    sql.then((response) => {
        if (response) {
            res.json({
                status_code: 200,
                message: 'crc current status.',
                data: response
            });
        } else {
            res.status(201).send({ status_code: 201, message: 'No Data found' });
        }
    })
}

function getAllPackageAuditLog(req, res) {
    let sql = knex.from(table.tbl_pbx_pkg_logs + ' as l')
        .select('l.*', 'p.name as package_name', knex.raw('DATE_FORMAT(l.created_at, "%d/%m/%Y %H:%i:%s") as created_at'))
        .leftJoin(table.tbl_Package + ' as p', 'p.id', 'l.package_id')
    // if (req.query.role == 3) {
    //     sql.whereIn('l.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.ResellerID}`));
    // }
    sql.orderBy('id', 'desc')
    sql.groupBy('p.id')
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAllPackageAuditLogByFilter(req, res) {
    let data = req.body.filters;
    data.by_username = data.by_username ? ("'" + data.by_username + "'") : null;
    data.by_pckg = data.by_pckg ? ("'" + data.by_pckg + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    //   console.log(knex.raw("Call pbx_getPackageAuditLogByFilter(" + data.by_username + ", " + rangeFrom + "," + rangeTo + "," + data.by_responsecode +")").toString());
    let sql = knex.raw("Call pbx_getPackageAuditLogByFilter(" + rangeFrom + "," + rangeTo + "," + data.by_pckg + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

module.exports = {
    getActivityLog, getActivityLogByFilter, getAllBackendAPILog, getAllBackendAPILogByFilter, getC2CStatus,
    getAllPackageAuditLog, getAllPackageAuditLogByFilter, auditbyId, getCountryListActive
};