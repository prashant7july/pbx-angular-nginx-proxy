const { knex } = require("../config/knex.db");
const table = require("../config/table.macros.js");
var moment = require("moment");
const { eachOfLimit } = require("async");
const { log } = require("util");

function getcustomerdialoutdata(req, res) {
  var customer_id = req.query.customerId;
  let sql = knex.raw("Call pbx_customerdialout_ID_data(?)",[customer_id]);
  sql
    .then((response) => {
      if (response) {
        res.send({
          response: response,
          message: "Access group create successfully",
          code: 200,
        });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}
function getDialouFilter(req, res) {
  let data = req.body.filters;
  let customerID = req.body.customer_id;
  let exceptional_rule;
  if (data.exceptional_rule == "0") {
    exceptional_rule = 0;
  } else if (data.exceptional_rule == "") {
    exceptional_rule = null;
  } else {
    exceptional_rule = data.exceptional_rule;
  }
  // data.exceptional_rule =  data.exceptional_rule ? data.exceptional_rule : null;
  let sql = knex.raw(
    "Call pbx_customerdialout_ID(?, ?, ?)",[customerID, data.dialout_pattern, exceptional_rule]);
  sql
    .then((response) => {
      if (response) {
        res.send({
          response: response[0],
          message: "Access group create successfully",
          code: 200,
        });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function saveIntercomDialout(req, res) {
  let data = req.body.intercomList;
  if (data.only_extension == true) {
    data.only_extension = "1";
  } else {
    data.only_extension = "0";
  }
  if (data.cc_extension == true) {
    data.cc_extension = "1";
  } else {
    data.cc_extension = "0";
  }
  if (data.group_extension == true) {
    data.group_extension = "1";
  } else {
    data.group_extension = "0";
  }
  // data.cg_allow = data.cg_allow.length ? data.cg_allow : "";
  data.extension_list = data.extension_list.length ? data.extension_list : "";
  data.extension_cc_list = data.extension_cc_list.length
    ? data.extension_cc_list
    : "";
  data.extension_group_list = data.extension_group_list.length
    ? data.extension_group_list
    : "";
  // data.rule_type = data.rule_type.length ? data.rule_type : "";

  let features = {
    Name: data.name,
    "SIP ALlow": data.ext_names,
    "CG Allow": data.cg_names,
  };

  knex
    .from(table.tbl_pbx_intercom_dialout)
    .select("id")
    .where("name", data.name)
    .andWhere("customer_id", data.customer_id)
    .then((resp) => {
      if (resp.length > 0) {
        res.send({
          status_code: 409,
          message: "Duplicate Entry",
        });
      } else {
        let sql = knex(table.tbl_pbx_intercom_dialout).insert({
          name: data.name,
          group_type: "" + data.group_type + "",
          only_extension: "" + data.only_extension + "",
          group_extension: "" + data.group_extension + "",
          cc_extension: "" + data.cc_extension + "",
          extension_list: "" + data.extension_list + "",
          extension_cc_list: "" + data.extension_cc_list + "",
          extension_group_list: "" + data.extension_group_list + "",
          customer_id: "" + data.customer_id + "",
        });
        sql
          .then(async (response) => {
            let ext_list = data.extension_list.split(",").map(Number);
            let updateID = knex(table.tbl_Extension_master)
              .update({
                // product_id: request.product_name[i],
                intercom_dialout: response,
              })
              .whereIn("ext_number", ext_list);
            updateID.then((response3) => {});
            let logs_response = await knex("pbx_audit_logs").insert({
              module_name: "intercom dialout",
              module_action_name: data.name,
              module_action_id: response[0],
              message: "intercom dialout created.",
              customer_id: data.customer_id,
              features: JSON.stringify(features),
            });
            res.send({
              status_code: 200,
              message: "Intercom Dialout Created Successfully",
            });
          })
          .catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
          });
      }
    });
}
function getGroupType(req, res) {
  let sql = knex
    .from(table.tbl_pbx_intercom_dialout)
    .select("*")
    .where("customer_id", req.query.id);
  // .andWhere('group_type',req.query.checkValue)
  sql
    .then((response) => {
      res.send({
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
function getGroupCCType(req, res) {
  let sql = knex
    .from(table.tbl_PBX_CALLGROUP)
    .select("*")
    .where("customer_id", req.query.id);
  // .andWhere('group_type',req.query.checkCCValue)
  sql
    .then((response) => {
      res.send({
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

function updateIntercomDialout(req, res) {
  let data = req.body.intercomList;
  if (data.only_extension == true) {
    data.only_extension = "1";
  } else {
    data.only_extension = "0";
  }
  if (data.cc_extension == true) {
    data.cc_extension = "1";
  } else {
    data.cc_extension = "0";
  }
  if (data.group_extension == true) {
    data.group_extension = "1";
  } else {
    data.group_extension = "0";
  }
  data.extension_list = data.extension_list.length ? data.extension_list : "";
  data.extension_cc_list = data.extension_cc_list.length
    ? data.extension_cc_list
    : "";
  data.extension_group_list = data.extension_group_list.length
    ? data.extension_group_list
    : "";

  // data.cg_allow = data.cg_allow.length ? data.cg_allow : "";
  // data.sip_allow = data.sip_allow.length ? data.sip_allow : "";

  let features = {
    Name: data.name,
    "SIP ALlow": data.ext_names,
    "CG Allow": data.cg_names,
  };

  knex
    .from(table.tbl_pbx_intercom_dialout)
    .select("id")
    .where("name", data.name)
    .andWhere("id", "!=", data.dialout_id)
    .andWhere("customer_id", data.customer_id)
    .then((resp) => {
      if (resp.length > 0) {
        res.send({
          status_code: 409,
          message: "Duplicate Entry",
        });
      } else {
        let sql = knex(table.tbl_pbx_intercom_dialout)
          .update({
            name: data.name,
            group_type: "" + data.group_type + "",
            only_extension: "" + data.only_extension + "",
            group_extension: "" + data.group_extension + "",
            cc_extension: "" + data.cc_extension + "",
            extension_list: "" + data.extension_list + "",
            extension_cc_list: "" + data.extension_cc_list + "",
            extension_group_list: "" + data.extension_group_list + "",
            customer_id: "" + data.customer_id + "",
          })
          // .update({ name: data.name, sip_allow: "" + data.sip_allow + "", cg_allow: "" + data.cg_allow + "", customer_id: "" + data.customer_id + "" })
          .where("id", data.dialout_id);

        sql
          .then(async (response) => {
            let ext_list = data.extension_list.split(",").map(Number);
            let updateID = knex(table.tbl_Extension_master)
              .update({
                // product_id: request.product_name[i],
                intercom_dialout: data.dialout_id,
              })
              .whereIn("ext_number", ext_list);
            updateID.then((response3) => {});
            let logs_response = await knex("pbx_audit_logs").insert({
              module_name: "intercom dialout",
              module_action_name: data.name,
              module_action_id: data.dialout_id,
              message: "intercom dialout updated.",
              customer_id: data.customer_id,
              features: JSON.stringify(features),
            });
            res.send({
              status_code: 200,
              message: "Intercom Dialout Updated Successfully",
            });
          })
          .catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
          });
      }
    });
}

function getInternalDialout(req, res) {
  //   let sql =   knex.from(table.tbl_pbx_intercom_dialout)
  //     .select('*')
  //     .where('customer_id',req.query.id)
  let sql = knex.raw("Call pbx_get_intercom_dialout(" + req.query.id + ")");
  sql
    .then((response) => {
      response[0][0].map((data) => {
        let sql2 = knex
          .select("id")
          .from(table.tbl_Extension_master)
          .where("intercom_dialout", data.id);
        sql2
          .then((resp) => {
            if (resp.length > 0) {
              Object.assign(data, { mapped: 1 });
            }
          })
          .catch((err) => {
            console.log(err);
            res
              .status(401)
              .send({ error: "error", message: "DB Error: " + err.message });
            throw err;
          });
      });
      setTimeout(() => {
        res.send({
          response: response[0][0],
        });
      }, 500);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getInternalDialoutByFilter(req, res) {
  let name = req.body.credentials.name
    ? "" + req.body.credentials.name + ""
    : null;
  let sip = req.body.credentials.sip_allow
    ? req.body.credentials.sip_allow
    : null;
  // let callGroup = req.body.credentials.cg_allow ? req.body.credentials.cg_allow : null;

  // let sql = knex.raw(
  //   "Call pbx_get_intercom_dialout_by_filter(" +
  //     req.body.credentials.customer_id +
  //     "," +
  //     name +
  //     ",'" +
  //     sip +
  //     "')"
  // );
  let sql = knex.raw(
    'CALL pbx_get_intercom_dialout_by_filter(?, ?, ?)',
    [
      req.body.credentials.customer_id,
      name,
      sip
    ]
  );
  sql
    .then((response) => {
      response[0][0].map((data) => {
        let sql2 = knex
          .select("id")
          .from(table.tbl_Extension_master)
          .where("intercom_dialout", data.id);

        sql2
          .then((resp) => {
            if (resp.length > 0) {
              Object.assign(data, { mapped: 1 });
            }
          })
          .catch((err) => {
            console.log(err);
            res
              .status(401)
              .send({ error: "error", message: "DB Error: " + err.message });
            throw err;
          });
      });
      setTimeout(() => {
        res.send({
          response: response[0][0],
        });
      }, 500);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getIntercomById(req, res) {
  knex
    .from(table.tbl_pbx_intercom_dialout)
    .select("*")
    .where("id", req.query.id)
    .then((response) => {
      res.send({
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
function getIntercomByExtID(req, res) {
  var user_id = req.query.user_id;
  var sql = knex(table.tbl_Extension_master + " as e")
    .leftJoin(
      table.tbl_pbx_intercom_dialout + " as i",
      "i.id",
      "e.intercom_dialout"
    )
    .where("e.customer_id", "=", "" + user_id + "")
    .andWhere("i.id", req.query.id)
    .andWhere("e.plug_in", "=", "0")
    .select("e.*")
    .orderBy("e.id", "desc");

  // knex.from(table.tbl_pbx_intercom_dialout)
  //     .select('*')
  //     .where('id', req.query.id)
  sql
    .then((response) => {
      res.send({
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

function getIntercomByCustomer(req, res) {
  knex
    .from(table.tbl_pbx_intercom_dialout)
    .select("*")
    .where("customer_id", req.query.custId)
    .then((response) => {
      res.send({
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

function getIntercomIDCount(req, res) {
  let intercom_id = req.query.intercom_id;  
  let sql = knex.raw("Call pbx_get_extension_group_list(?)",[intercom_id])
  sql.then((response) => {
      if (response) {
          res.send({ response: response[0][0][0] });
      }
  }).catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
  });


}

function deleteIntercomRule(req, res) {
  let id = req.query.id;
 let sql = knex
    .from(table.tbl_pbx_intercom_dialout)
    .where("id", id)
    .del()
    sql.then((response) => {
      let inter = knex.from(table.tbl_pbx_intercom_dialout).select('*')
  .where('id', id);
inter.then((res) => {
});
// return
      // let inter = knex.from(table.tbl_pbx_intercom_dialout).select('*')
      // .where('id',id)
      // inter.than((res)=>{
      // })
      let sql2 =   knex
      .from(table.tbl_Extension_master)
      .select("*")
      .where("intercom_dialout", id)
      sql2.then((response) => {
            let updateID = knex(table.tbl_Extension_master)
        .update({
          intercom_dialout: '0',
        })
        .where("intercom_dialout", id);
      updateID.then((response3) => {});
        // res.send({
        //   response: response,
        // });
      })
      if (response) {
        res.send({
          status_code: 200,
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


function getAssociatedExtensions(req, res) {
  console.log(req.query,'----------asssso');
  let id = req.query.id;

  let sql = knex
    .from(table.tbl_pbx_intercom_dialout + " as pid")
    .join(
      table.tbl_Extension_master + " as ext",
      "ext.intercom_dialout",
      "pid.id"
    )
    .select("ext.ext_number", "ext.username", "pid.name")
    .where("pid.id", id);

  sql
    .then((response) => {
      res.send({
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

module.exports = {
  getIntercomByExtID,
  getcustomerdialoutdata,
  getGroupType,
  getGroupCCType,
  getDialouFilter,
  saveIntercomDialout,
  getInternalDialout,
  getIntercomById,
  updateIntercomDialout,
  getIntercomByCustomer,
  getInternalDialoutByFilter,
  deleteIntercomRule,
  getAssociatedExtensions,
  getIntercomIDCount
};
