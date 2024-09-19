const { knex } = require("../config/knex.db");
const table = require("../config/table.macros");
var moment = require('moment');


function getAuditLogByFilter(req, res) {
  const module = req.body.filters.by_type;
  const by_date = req.body.filters.by_date;

  knex(table.tbl_pbx_audit_logs).select('*').where('module_name', 'like', "%" + module + "%").groupBy('module_name').then((response) => {
    res.send({
      response
    })
  }).catch((err) => {
    res.status(500).send({ code: 500, message: err.sqlMessage });
  })
}

function getAuditInfo(req, res) {  
  let sql = knex(table.tbl_pbx_audit_logs).select('*',knex.raw('DATE_FORMAT(created_at,"%d-%m-%Y %H:%i:%s") as created_at')).where('module_action_id', req.query.module_events.split(',')[0]).andWhere('customer_id', req.query.customer_id).andWhere('module_name', 'like', "%"+req.query.module_events.split(',')[1]+"%")
  sql.then((response) => {
    if (response.length) {
      res.send({
        response
      })
    }
  }).catch((err) => {
    res.status(500).send({ code: 500, message: err.sqlMessage });
  })
}

function getAuditLog(req, res) {
  knex(table.tbl_pbx_audit_logs).select('module_name', 'module_action_name', "message", 'module_action_id', 'customer_id').groupBy(knex.raw('CONCAT(module_name,"_",module_action_id)')).orderBy('id','desc').then((response) => {
    if (response.length) {
      res.send({
        response
      })
    }
  }).catch((err) => {
    res.status(500).send({ code: 500, message: err.sqlMessage });
  })
}

function getSmtpAuditLog(req,res){
  knex.from(table.tbl_pbx_smtp_audit_log).select('*', knex.raw('DATE_FORMAT(date,"%d-%m-%Y %H:%i:%s") as date')).orderBy('id','desc')
  .then((response)=>{
    res.send({
      response
    })
  })
}

function getSmtpAuditLogByFilter(req,res){
  
    let date = req.body.filters.by_date ? moment(req.body.filters.by_date).format('YYYY-MM-DD') : '';

  let name = req.body.filters.by_name ? req.body.filters.by_name : "";
  let template = req.body.filters.by_template ? req.body.filters.by_template : "";
  let status = req.body.filters.by_status == '1' ? "Success" : req.body.filters.by_status == '2' ? "Failed" : "";

let sql =  knex.from(table.tbl_pbx_smtp_audit_log).select('*', knex.raw('DATE_FORMAT(date,"%d-%m-%Y %H:%i:%s") as date'))

if(name != ""){
  sql.andWhere('service','like', "%" + name + "%")
}
if(template != ""){
  sql.andWhere('subject','like', "%" + template + "%")
}
if(status != ""){
  if(status == 'Success'){
    sql.andWhere('status','like','Success')
  }else{
    sql.andWhere('status','!=',"Success")
  }
}
if(date != ''){
  sql.andWhere('date','like', "%" + date + "%")
}
sql.orderBy('id','desc')
  sql.then((response)=>{
    res.send({
      response
    })
  })
}

module.exports = {
  getAuditLogByFilter, getAuditInfo, getAuditLog,getSmtpAuditLog,getSmtpAuditLogByFilter
};
