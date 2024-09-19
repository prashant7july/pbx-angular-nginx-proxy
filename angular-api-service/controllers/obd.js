const config = require("../config/app");
const { knex } = require("../config/knex.db");
const table = require("../config/table.macros.js");
var moment = require("moment");
var path = require("path");
var fs = require("fs");
const { createModuleLog } = require("../helper/modulelogger");
/**
 * Returns jwt token if valid email and password is provided
 * @param req
 * @param res
 * @returns {*}
 */
function getIvr(req, res) {
  let sql = knex
    .from(table.tbl_Pbx_Ivr_Master)
    .select("*")
    .where("customer_id", req.query.id)
    .andWhere("feedback_call", "0")
    .andWhere("is_multilevel_ivr", "0");
  sql.then((response) => {
    res.send({ response });
  });
}

function getObdByCustomer(req, res) {
  let sql = knex
    .from(table.pbx_obd)
    .select("*")
    .where("cust_id", req.query.id)
    .orderBy("id", "desc");
  sql.then((response) => {
    res.send({ response });
  });
}
function viewSMSActive(req, res) {
  let customer_id = parseInt(req.query.id);
  var sql = knex
    .from(table.tbl_pbx_sms_template + " as sms")
    .select(
      "sms.*",
      "smsc.category_name"
      // knex.raw('IF (sms.status = "1","Active","Inactive") as status')
    )
    .leftJoin(
      table.tbl_pbx_sms_category + " as smsc",
      "smsc.id",
      "sms.category_id"
    )
    .orderBy("sms.id", "desc")
    .where("sms.customer_id", "=", customer_id)
    .andWhere("sms.status", "=", "1");
  sql
    .then((response) => {
      res.json({
        response: response,
        code: 200,
      });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

function getObdParticipants(req, res) {
  let id = req.query.id;
  let sql = knex
    .select("contact", "id", "obd_id", "num_of_tires", "dialed_status")
    .from(table.pbx_obd_participants)
    .where("obd_id", id)
    .orderBy("id", "desc");

  sql.then((response) => {
    res.send({ response });
  });
}

function getWhatsappTemp(req, res) {
  let id = req.query.id;
  let sql = knex
    .select("*")
    .from(table.tbl_pbx_whatsapp_template)
    .where("customer_id", id);
  sql.then((response) => {
    res.send({ response });
  });
}

function getObdByFilter(req, res) {
  let name = req.body.credentials.name;
  let scheduler = req.body.credentials.by_schduler;
  let userId = req.body.credentials.cust_id;

  let sql = knex
    .from(table.pbx_obd)
    .select("*")
    .where("cust_id", userId)
    .orderBy("id", "desc");
  if (name != "") {
    sql.andWhere("name", "like", "%" + name + "%");
  }
  if (scheduler != "") {
    sql.andWhere("is_scheduler_type", scheduler);
  }

  sql.then((response) => {
    res.send({ response });
  });
}

function getOdbById(req, res) {
  let sql = knex
    .from(table.pbx_obd)
    .select(
      "name",
      "prompt",
      "sms_temp",
      "DID_caller_id",
      "is_scheduler_type",
      "dtmf",
      "dtmf_selection",
      "recording",
      "is_sms",
      "is_whatsapp",
      "whatsapp_template",
      "ivr_value",
      "created_at",
      "callerid_as_random",
      knex.raw(
        'DATE_FORMAT(schedule_time, "%Y/%m/%d %H:%i:%s") as schedule_time'
      ),
      "call_connection_type",
      "provider_id"
    )
    .where("id", req.query.id);
  sql.then((response) => {
    res.send({ response });
  });
}

function getStatusOBD(req, res) {
  let sql = knex
    .from(table.pbx_obd)
    .select("status","stop")
    .where("id", req.query.obd_id);
  sql.then((response) => {
    res.send({ response });
  });
}

function createIVR(req, res) {
  let cust_id = req.userId;
  let data = req.body.credentials;

  data.sms = data.sms == true ? "1" : "0";
  data.recording = data.recording == true ? "1" : "0";
  data.dtmf = data.dtmf == true ? "1" : "0";
  // data.is_scheduler_type == '1' ? '0' : '1'
  let start_date = data.schedular_start_date;

  let schedular_start_date = start_date
    ? moment(start_date).format("YYYY/MM/DD HH:mm:ss")
    : "";
  knex
    .from(table.pbx_obd)
    .select("name")
    .where("name", "Like", data.name)
    .then((resp) => {
      if (resp.length > 0) {
        res
          .status(412)
          .send({ error: "Unauthorized", message: "Duplicate Name" });
      } else {
        let sql = knex.table(table.pbx_obd).insert({
          name: "" + data.name + "",
          prompt: "" + data.welcome_prompt + "",
          is_scheduler_type: "" + data.scheduler + "",
          schedule_time: "" + schedular_start_date + "",
          cust_id: "" + cust_id + "",
          DID_caller_id: "" + data.caller_id_pstn + "",
          dtmf: "" + data.dtmf + "",
          dtmf_selection: "" + data.dtmfSelection + "",
          recording: "" + data.recording + "",
          is_sms: data.sms + "",
          ivr_value: "" + data.ivr_value + "",
        });
        sql.then((response) => {
          res.send({
            status: 200,
          });
        });
      }
    });
}

function deleteObd(req, res) {
  let data = req.body;

  let sql2 = knex(table.pbx_obd).where("id", "=", req.query.id);
  sql2.del();
  sql2
    .then((response) => {
      if (response) {
        knex(table.pbx_obd_participants)
          .where("obd_id", req.query.id)
          .del()
          .then((responses) => {
            res.json({
              code: 200,
            });
          });
      } else {
        res.json({
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

function updateObd(req, res) {
  let data = req.body.credentials;
  if (data.sms_temp == null || data.sms_temp == "") {
    data.sms_temp = "";
  }
  let cust_id = data.cust_id;
  data.sms = data.sms == true ? "1" : "0";
  data.recording = data.recording == true ? "1" : "0";
  data.dtmf = data.dtmf == true ? "1" : "0";
  data.whatsapp = data.whatsapp == true ? "1" : "0";
  // data.is_scheduler_type == '1' ? '0' : '1'
  let start_date = data.schedular_start_date ? data.schedular_start_date : "";
  data.dtmfSelection = data.dtmfSelection ? data.dtmfSelection : "1";
  data.random_did = req.body.credentials.random_did == true ? '1': '0'

  // let schedular_start_date = start_date ? moment(start_date).format('YYYY-MM-DD HH:mm:ss') : "";
  let schedular_start_date = start_date ? start_date : "";
  knex
    .from(table.pbx_obd)
    .where("id", "=", "" + data.id + "")
    .select("schedule_time")
    .then((response) => {
      if (response.length > 0) {
        let conf = Object.values(JSON.parse(JSON.stringify(response)));
        let lastStartDate = conf[0].schedule_time;
        let schedular_start_date = "";
        if (lastStartDate == start_date) {
          schedular_start_date = start_date;
        } else {
          schedular_start_date = start_date
            ? moment(start_date).format("YYYY/MM/DD HH:mm:ss")
            : "";
        }

        if (schedular_start_date == "Invalid date") {
          schedular_start_date = lastStartDate;
        }

        knex
          .from(table.pbx_obd)
          .select("name")
          .where("name", "Like", data.name)
          .andWhere("id", "!=", data.id)
          .then((resp) => {
            let input = {
              Name: data.name,
              // "Prompt Name": data.welcome_prompt_name,
              "Prompt Name": "ABC",
              // "DID Caller ID": data.CallerID,
              "DID Caller ID": "123456",
            };
            if (data.dtmfSelection == 2) {
              input["Select IVR"] = "1t";
              // input['IVR Value'] = data.ivr_name;
              input["IVR Value"] = "pqr";
            }
            if (data.dtmfSelection == 1) {
              input["Save DTMF"] = "1t";
            }
            if (data.dtmf == 1) {
              input["DTMF"] = "1t";
            }
            if (data.scheduler == 1) {
              input["Systematically Scheduler"] = "1t";
              input["Schedule Time"] = schedular_start_date;
            }
            if (data.scheduler == 0) {
              input["Manual Scheduler"] = "1t";
            }
            if (data.recording == 1) {
              input["Recording"] = "1t";
            }
            if (data.whatsapp == 1) {
              input["Whatsapp"] = "1t";
              input["Whatsapp Template"] = "xyz";
            }

            if (resp.length > 0) {
              res.send({
                status_code: 412,
                error: "Unauthorized",
                message: "Duplicate Name",
              });
            } else {
              let sql = knex
                .table(table.pbx_obd)
                .update({
                  name: "" + data.name + "",
                  prompt: "" + data.welcome_prompt + "",
                  is_scheduler_type: "" + data.scheduler + "",
                  schedule_time: "" + schedular_start_date + "",
                  cust_id: "" + cust_id + "",
                  DID_caller_id: "" + data.caller_id_pstn + "",
                  dtmf: "" + data.dtmf + "",
                  dtmf_selection: "" + data.dtmfSelection + "",
                  recording: "" + data.recording + "",
                  is_sms: data.sms + "",
                  sms_temp: "" + data.sms_temp + "",
                  ivr_value: "" + data.ivr_value + "",
                  is_whatsapp: "" + data.whatsapp + "",
                  whatsapp_template: "" + data.whatsapp_temp + "",
                  provider_id: "" + Number(data.api_integration) + "",
                  call_connection_type: "" + data.provider + "",
                  callerid_as_random: data.random_did
                })
                .where("id", data.id);
              sql.then((response) => {
                createModuleLog(table.tbl_pbx_audit_logs, {
                  module_action_id: data.id,
                  module_action_name: data.name,
                  module_name: "obd",
                  message: "OBD Updated",
                  customer_id: cust_id,
                  features: "" + JSON.stringify(input) + "",
                });
                let participants = [];

                knex(table.pbx_obd_participants)
                  .where("obd_id", data.id)
                  .del()
                  .then((response2) => {
                    // if (data.paricipants_list.length !== 0) {
                    data.paricipants_list.map((item) => {
                      participants.push({
                        obd_id: data.id,
                        contact: item.contact,
                        num_of_tires: item.num_of_tires,
                        dialed_status: item.dialed_status,
                      });
                    });
                    knex(table.pbx_obd_participants)
                      .insert(participants)
                      .then((response3) => {});
                    res.send({
                      status: 200,
                    });
                    // }
                  });
              });
            }
          });
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

function partiallyUpdateOC(req, res) {
  let data = req.body;
  let id = req.query.id;
  let sql = knex(table.pbx_obd)
    .update(data)
    .where("id", "=", "" + id + "");
  sql
    .then((response) => {
      if (response) {
        res.send({
          response: response,
          message: "OBD status Updated Successfully",
          code: 200,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(200).send({
        code: err.errno,
        error: "error",
        message: "DB Error: " + err.message,
      });
      throw err;
    });
}

function partiallyUpdateOCStop(req, res) {
  let status = req.body.status;
  let id = req.query.id;

  if (status == 1) {
    let sql = knex(table.pbx_obd)
      .update({stop: "1",
      status: "0"})
      .where("id", "=", "" + id + "");
    sql
      .then((response) => {
        if (response) {
          res.send({
            response: response,
            message: "OBD status Updated Successfully",
            code: 200,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(200).send({
          code: err.errno,
          error: "error",
          message: "DB Error: " + err.message,
        });
        throw err;
      });
  } else {
    let sql = knex(table.pbx_obd)
      .update("stop", "0")
      .where("id", "=", "" + id + "");
    sql
      .then((response) => {
        if (response) {
          res.send({
            response: response,
            message: "OBD status Updated Successfully",
            code: 200,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(200).send({
          code: err.errno,
          error: "error",
          message: "DB Error: " + err.message,
        });
        throw err;
      });
  }
}

function getobdCDR(req, res) {
  let user_id = req.query.id;
  let sql = knex(table.tbl_pbx_obd_cdr)
    .select(
      "caller",
      "callee",
      "dtmf_store",
      "obd_name",
      "hangup_cause",
      knex.raw(
        'DATE_FORMAT(session_start, "%d/%m/%Y %H:%i:%s") as session_start'
      )
    )
    .where("cust_id", user_id)
    .whereRaw(
      "session_start >= last_day(now()) + interval 1 day - interval 2 month"
    )
    .orderBy("id", "desc");
  // .orderBy('session_start','desc');
  sql
    .then((response) => {
      if (response.length) {
        res.send({
          status_code: 200,
          response,
        });
      } else {
        res.status(202).send({ status_code: 202, message: "No Data Found." });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
  // knex.raw("Call pbx_getObdCdr(" + user_id+")").then((response) => {
  //     if (response) {
  //         res.send({ response: response[0][0] });
  //     }
  // }).catch((err) => {
  //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
  // });
}
function getobdApiCDR(req, res) {
  let user_id = req.query.id;
  let sql = knex(table.tbl_pbx_obd_api_cdr + " as api")
    .select(
      "api.*",
      "api.recordvoice as file_path",
      knex.raw(
        'DATE_FORMAT(api.call_start_time, "%d/%m/%Y %H:%i:%s") as call_start_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.a_party_dial_start_time, "%d/%m/%Y %H:%i:%s") as a_party_dial_start_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.a_party_dial_end_time, "%d/%m/%Y %H:%i:%s") as a_party_dial_end_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.a_party_connected_time, "%d/%m/%Y %H:%i:%s") as a_party_connected_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.a_party_end_time, "%d/%m/%Y %H:%i:%s") as a_party_end_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.b_party_dial_start_time, "%d/%m/%Y %H:%i:%s") as b_party_dial_start_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.b_party_dial_end_time, "%d/%m/%Y %H:%i:%s") as b_party_dial_end_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.b_party_end_time, "%d/%m/%Y %H:%i:%s") as b_party_end_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.b_party_connected_time, "%d/%m/%Y %H:%i:%s") as b_party_connected_time'
      )
    )
    .join(table.pbx_obd + " as obd", "obd.id", "api.ref_id")
    .where("obd.cust_id", user_id)
    .orderBy("api.id", "desc");
  // .orderBy('session_start','desc');
  sql
    .then((response) => {
      if (response.length) {
        res.send({
          status_code: 200,
          response,
        });
      } else {
        res.status(202).send({ status_code: 202, message: "No Data Found." });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}
function getObdApiCDRByFilter(req, res) {
  let data = req.body.credentials;
  let rangeFrom = data.by_date ? data.by_date[0] : null;
  let rangeTo = data.by_date ? data.by_date[1] : null;
  rangeFrom = rangeFrom ? moment(rangeFrom).format("YYYY-MM-DD") : null;
  rangeTo = rangeTo ? moment(rangeTo).format("YYYY-MM-DD") : null;
  var filterCallid = data.by_call_id ? data.by_call_id : null;
  var filter_a_party = data.by_a_party_no ? data.by_a_party_no : null;
  var filter_b_party = data.by_b_party_no ? data.by_b_party_no : null;
  var customer_id = data.user_id;
  // let user_id = req.query.id;
  let sql = knex(table.tbl_pbx_obd_api_cdr + " as api")
    .select(
      "api.*",
      "api.recordvoice as file_path",
      knex.raw(
        'DATE_FORMAT(api.call_start_time, "%d/%m/%Y %H:%i:%s") as call_start_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.a_party_dial_start_time, "%d/%m/%Y %H:%i:%s") as a_party_dial_start_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.a_party_dial_end_time, "%d/%m/%Y %H:%i:%s") as a_party_dial_end_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.a_party_connected_time, "%d/%m/%Y %H:%i:%s") as a_party_connected_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.a_party_end_time, "%d/%m/%Y %H:%i:%s") as a_party_end_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.b_party_dial_start_time, "%d/%m/%Y %H:%i:%s") as b_party_dial_start_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.b_party_dial_end_time, "%d/%m/%Y %H:%i:%s") as b_party_dial_end_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.b_party_end_time, "%d/%m/%Y %H:%i:%s") as b_party_end_time'
      ),
      knex.raw(
        'DATE_FORMAT(api.b_party_connected_time, "%d/%m/%Y %H:%i:%s") as b_party_connected_time'
      )
    )
    .join(table.pbx_obd + " as obd", "obd.id", "api.ref_id")
    .where("obd.cust_id", customer_id)
    .orderBy("api.id", "desc");
  if (data.by_date != "") {
    sql = sql
      .andWhere(
        knex.raw("DATE(api.call_start_time)"),
        ">=",
        "" + rangeFrom + ""
      )
      .andWhere(knex.raw("DATE(api.call_start_time)"), "<=", "" + rangeTo + "");
  }
  if (filterCallid) {
    sql = sql.andWhere("api.call_id", "like", "%" + filterCallid + "%");
  }
  if (filter_a_party) {
    sql = sql.andWhere("api.a_party_no", "like", "%" + filter_a_party + "%");
  }
  if (filter_b_party) {
    sql = sql.andWhere("api.b_party_no", "like", "%" + filter_b_party + "%");
  }
  sql
    .then((response) => {
      res.json({
        response: response,
        code: 200,
      });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}
function getObdCDRByFilter(req, res) {
  let data = req.body.credentials;
  let rangeFrom = data.by_date ? data.by_date[0] : null;
  let rangeTo = data.by_date ? data.by_date[1] : null;
  rangeFrom = rangeFrom
    ? "'" + moment(rangeFrom).format("YYYY-MM-DD") + "'"
    : null;
  rangeTo = rangeTo ? "'" + moment(rangeTo).format("YYYY-MM-DD") + "'" : null;

  data.by_name = data.by_name != "" ? "'" + data.by_name + "'" : null;
  data.by_callee = data.by_callee != "" ? "'" + data.by_callee + "'" : null;

  let sql = knex.raw(
    "Call pbx_getOBDCdrByFilter(" +
      rangeFrom +
      "," +
      rangeTo +
      "," +
      data.by_name +
      "," +
      data.user_id +
      "," +
      data.by_callee +
      ")"
  );

  sql
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function livecallforOBD(req, res) {
  let id = req.query.id;
  let outboundcdrId = parseInt(req.query.outbound_id);
  let sql = knex.raw(`        SELECT * FROM pbx_obd_participant as cp 
     JOIN pbx_obd as oc on oc.id =cp.obd_id
     WHERE cp.status='1' and oc.status='1' and oc.cust_id = ${outboundcdrId} and oc.id = ${id};`);

  sql
    .then((response) => {
      if (response.length) {
        res.send({
          status_code: 200,
          response: response[0],
        });
      } else {
        res.status(202).send({ status_code: 202, message: "No Data Found." });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function getOBDreportFilter(req, res) {
  let data = req.body.filters;

  let user_id = req.body.customer_id;
  let rangeFrom = data.by_date ? data.by_date[0] : null;
  let rangeTo = data.by_date ? data.by_date[1] : null;
  rangeFrom = rangeFrom
    ? "'" + moment(rangeFrom).format("YYYY-MM-DD") + "'"
    : null;
  rangeTo = rangeTo ? "'" + moment(rangeTo).format("YYYY-MM-DD") + "'" : null;
  data.by_name = data.by_name != "" ? "'" + data.by_name + "'" : null;
  data.by_caller = data.by_caller != "" ? "'" + data.by_caller + "'" : null;

  let sql = knex.raw(
    "Call pbx_getreportByFilter(" +
      rangeFrom +
      "," +
      rangeTo +
      "," +
      data.by_name +
      "," +
      user_id +
      "," +
      data.by_caller +
      ")"
  );

  sql
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getOBDReport(req, res) {
  let user_id = req.query.customerId;
  let sql =
    knex.raw(`SELECT cdr.caller,cdr.callee,cdr.instance_id,cdr.obd_name, pc.status,DATE_FORMAT(cdr.session_start, '%d/%m/%Y %H:%i:%s') AS session_start FROM pbx_obd_cdr cdr \
    JOIN pbx_obd_participant part on part.instance_id = cdr.instance_id \
     left join pbx_obd pc on pc.instance_id = cdr.instance_id  \
    WHERE cdr.cust_id = ${user_id}  and cdr.instance_id !='' 
    GROUP by cdr.instance_id ORDER by cdr.session_start DESC;`);
  sql
    .then((response) => {
      if (response.length) {
        res.send({
          status_code: 200,
          response: response[0],
        });
      } else {
        res.status(202).send({ status_code: 202, message: "No Data Found." });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}
// function obdreportstatusNotlive(req, res){
//     let user_id = req.query.customerId;
//     let sql = knex.raw(`SELECT cdr.caller,cdr.instance_id,cdr.conf_name,DATE_FORMAT(cdr.session_start, '%Y/%m/%d %H:%i:%s') AS session_start,part.status from pbx_obd_cdr as cdr \
//      join pbx_obd_participant as part on cdr.instance_id = part.instance_id WHERE cdr.instance_id is NOT null AND cdr.cust_id=${user_id} GROUP by cdr.instance_id order by cdr.instance_id`)
//     // let sql = knex.raw('cdr.conf_name','cdr.instance_id').from(table.tbl_pbx_conference_outbound_cdr + ' as cdr')
//     // .leftJoin(table.tbl_pbx_outbound_conference_participant + ' as part','part.instance_id','cdr.instance_id')
//     // .sql.groupBy('cdr.instance_id')
//     // .where('cdr.cust_id',user_id)
//     sql.then((response) => {
//         if(response.length){
//             res.send({
//                 status_code: 200,
//                 response: response[0]
//             })
//         }else{
//             res.status(202).send({ status_code: 202, message: "No Data Found." });
//         }
//     }).catch((err) => {
//         res.send({ code: err.errno, message: err.sqlMessage });
//     })
// }

function getOBDassocieateCDR(req, res) {
  let obdcdrId = parseInt(req.query.obd_id);
  // let outboundcdrId = parseInt(req.query.outbound_id);
  let sql = knex.raw(`select cdr.*, pc.status from pbx_obd_participant as oc  \
    join pbx_obd_cdr as cdr on oc.instance_id = cdr.instance_id \
    left join pbx_obd pc on pc.instance_id = cdr.instance_id \
    where oc.instance_id = ${obdcdrId} group by cdr.callee  order by cdr.session_start desc`);
  // let sql = knex(table.pbx_obd + ' as oc').select('cdr.*')
  //     .leftJoin(table.tbl_pbx_obd_cdr + ' as cdr', 'oc.instance_id', 'cdr.instance_id')
  //     .where('oc.instance_id', obdcdrId)
  sql
    .then((response) => {
      if (response) {
        res.send({ response: response[0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getOBDRecording(req, res) {
  let id = req.query.obd_id;
  let sql = knex
    .from(table.tbl_pbx_recording)
    .select(
      "*",
      "src",
      "dest",
      "id",
      knex.raw('DATE_FORMAT(created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'CONCAT("/assets/prompts/",customer_id,"/recording/",file_name) as file_path'
      )
    )
    .where("type", "Outbound Dialer")
    .andWhere("customer_id", id)
    .orderBy("id", "desc");
  sql.then((response) => {
    res.send({ response });
  });
}

function getOBDRecordingByFilter(req, res) {
  let data = req.body.filters;
  let rangeFrom = data.by_range ? data.by_range[0] : null;
  let rangeTo = data.by_range ? data.by_range[1] : null;
  rangeFrom = rangeFrom ? moment(rangeFrom).format("YYYY-MM-DD") : null;
  rangeTo = rangeTo ? moment(rangeTo).format("YYYY-MM-DD") : null;
  var filterCaller = data.by_caller ? data.by_caller : null;
  var filterCallee = data.by_callee ? data.by_callee : null;
  let id = req.query.obd_id;
  let sql = knex
    .from(table.tbl_pbx_recording)
    .select(
      "*",
      "src",
      "dest",
      "id",
      knex.raw('DATE_FORMAT(created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
      knex.raw(
        'CONCAT("/assets/prompts/",customer_id,"/recording/",file_name) as file_path'
      )
    )
    .where("customer_id", data.user_id)
    .andWhere("type", "Outbound Dialer")
    .orderBy("id", "desc");
  if (data.by_range != "") {
    sql = sql
      .andWhere(knex.raw("DATE(created_at)"), ">=", "" + rangeFrom + "")
      .andWhere(knex.raw("DATE(created_at)"), "<=", "" + rangeTo + "");
  }
  if (filterCaller) {
    sql = sql.andWhere("src", "like", "%" + filterCaller + "%");
  }
  if (filterCallee) {
    sql = sql.andWhere("dest", "like", "%" + filterCallee + "%");
  }

  sql.then((response) => {
    res.send({ response });
  });
}

function deleteOBDRecording(req, res) {
  var filePath = "";
  filePath = path.join(__dirname, "../upload/", +req.body.id + "/recording/");
  fs.unlink(filePath + req.body.filename, function (err, files) {
    if (err) {
      console.log("Unable to scan directory:" + err);
      return res.send({
        code: 400,
        message: "Unable to scan directory:" + err,
      });
    } else {
      let sql = knex
        .from(table.tbl_pbx_recording)
        .del()
        .where("file_name", "=", "" + req.body.filename + "");

      sql
        .then((response) => {
          return res.send({
            code: 200,
            message: "Recording deleted successfully",
          });
        })
        .catch((err) => {
          {
            console.log(err);
            throw err;
          }
        });
    }
  });
}


async function insertDidInObd(req, res){        
  req.body.did_random = req.body.did_random == true ? '1': '0'  
    knex(table.pbx_obd).update({DID_caller_id: "" + req.body.caller_id_pstn + "", callerid_as_random: req.body.did_random})
    .where('cust_id', req.body.customer_id).andWhere('id',req.body.obd_id).then((response) => {          
        res.json(response)
    })
}

module.exports = {
  getIvr,
  viewSMSActive,
  createIVR,
  getObdByCustomer,
  getOdbById,
  updateObd,
  deleteObd,
  getObdByFilter,
  getObdParticipants,
  partiallyUpdateOC,
  getobdCDR,
  getobdApiCDR,
  getWhatsappTemp,
  getObdCDRByFilter,
  getObdApiCDRByFilter,
  getOBDReport,
  getOBDassocieateCDR,
  getOBDreportFilter,
  getStatusOBD,
  partiallyUpdateOCStop,
  livecallforOBD,
  getOBDRecording,
  getOBDRecordingByFilter,
  deleteOBDRecording,
  insertDidInObd,
};
