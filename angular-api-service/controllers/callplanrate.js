const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require("../helper/modulelogger");

async function createCallPlanRate(req, res) {
    let sql1 = await knex.select('id','booster_for','plan_type').from(table.tbl_Call_Plan).where('id',req.body.callPlanRate.call_plan)
    let sellingMinDuration = '0';
    let areaCode = '';
    let talktime_minutes = '';
    let type = req.body.callPlanRate.plan_type;
    let modified_by = req.userId;
    if(type != '0') req.body.callPlanRate.selling_billing_block = 0;
    if (req.body.callPlanRate.selling_min_duration == 0 || req.body.callPlanRate.selling_min_duration == '0' || !req.body.callPlanRate.selling_min_duration) {
        sellingMinDuration = '0';
    } else {
        sellingMinDuration = req.body.callPlanRate.selling_min_duration;
    }
    if (req.body.callPlanRate.area_code == '' || req.body.callPlanRate.area_code == null || !req.body.callPlanRate.area_code) {
        areaCode = "''";
    } else {
        areaCode = req.body.callPlanRate.area_code ;
    }
    let dialPrefix = req.body.callPlanRate.prefix + req.body.callPlanRate.dial_prefix;
    if (req.body.callPlanRate.isGroup === true || req.body.callPlanRate.isGroup == '1') {
        req.body.callPlanRate.isGroup = '1';
    } else {
        req.body.callPlanRate.isGroup = '0';
    }
    if (req.body.callPlanRate.group_id == '' || req.body.callPlanRate.group_id == null || !req.body.callPlanRate.group_id) {
        req.body.callPlanRate.group_id = 0;
    } else {
        req.body.callPlanRate.group_id = req.body.callPlanRate.group_id;
    }
    if (req.body.callPlanRate.talktime_minutes == '' || req.body.callPlanRate.talktime_minutes == null || !req.body.callPlanRate.talktime_minutes) {
        talktime_minutes = 0;
    } else {
        talktime_minutes = req.body.callPlanRate.talktime_minutes ;
    }
    let arr = req.body.callPlanRate;
    arr.selling_min_duration = sellingMinDuration;
    arr.area_code = areaCode;
    arr.talktime_minutes = talktime_minutes;        
   let sql = knex.raw("Call pbx_save_callplanrate(" + req.body.callPlanRate.id + "," + req.body.callPlanRate.call_plan + ",'" + dialPrefix + "'," + req.body.callPlanRate.buying_rate + ",\
    " + req.body.callPlanRate.selling_rate + "," + sellingMinDuration + "," + req.body.callPlanRate.selling_billing_block + ",'1', " + req.body.callPlanRate.gateway +  "," + req.body.callPlanRate.phonecode +  "," + areaCode + ",'" + req.body.callPlanRate.isGroup + "'," + req.body.callPlanRate.group_id + "," + talktime_minutes  + "," + 0 + ",'" + req.body.callPlanRate.plan_type + "','" +  sql1[0].booster_for +"'," + 0 + "," + 0 + ")")    
    sql.then((response) => {
            if (response) {         
                let input = {
                    "Plan Type" : req.body.callPlanRate.plan_type == '0' ? "Standard" : req.body.callPlanRate.plan_type == '1' ? "DID Bundle" : req.body.callPlanRate.plan_type == '2' ? "Roaming" : req.body.callPlanRate.plan_type == '3' ? "Booster" : req.body.callPlanRate.plan_type == '4' ? "TeleConsultancy" : "Outgoing Bundle"                    
                }                
                input["Country"] = req.body.callPlanRate.country_name;
                if(input['Plan Type'] == "Standard"){
                    input["Area code"] = req.body.callPlanRate.area_code;
                }
                input["Buting Rate"] = req.body.callPlanRate.buying_rate;
                input["Selling Rate"] = req.body.callPlanRate.selling_rate;
                input["Selling Billing Block"] = req.body.callPlanRate.selling_billing_block;
                input["Gateway"] = req.body.callPlanRate.gateway_name;
                if(req.body.callPlanRate.isGroup == true){
                    input["Group"] = '1t';
                    input["Group Name"] = req.body.callPlanRate.group_name;
                }
                if(input["Plan Type"] != "Standard")
                input["Talktime Minutes"] = req.body.callPlanRate.talktime_minutes;
                
                createModuleLog(table.tbl_pbx_audit_logs, {
                    module_action_id: arr.id ? arr.id : response[0][0][0].id,
                    module_action_name: input['Plan Type'],
                    module_name: "call plan rate",
                    message: arr?.id
                        ? "Call Plan Rate Updated"
                        : "Call Plan Rate Created",
                    customer_id: modified_by,
                    features: "" + JSON.stringify(input) + "",
                });
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            console.log(err,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function viewCallPlanRate(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.dial_prefix = req.body.dial_prefix ? req.body.dial_prefix : null;

    knex.raw("Call pbx_get_callplanrate(" + req.body.id + "," + req.body.dial_prefix + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function deleteCallPlanRate(req, res) {
    let modified_by = req.userId;
    knex.raw("Call pbx_delete_callplanrate(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                createModuleLog(table.tbl_pbx_call_rate_detail_history, {
									call_rate_id: req.query[Object.keys(req.query)[0]],
									action: "Call Rates Detail deleted",
									modified_by,
									data: "" + JSON.stringify(response) + "",
								});
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function getCallPlanRateByFilters(req, res) {
    let data = req.body.filters;    
    data.by_call_plan = (data.by_call_plan).length ? ("'" + data.by_call_plan + "'") : null;
    data.by_dial_prefix = data.by_dial_prefix ? ("" + data.by_dial_prefix + "") : null;
    data.by_buying_rate = data.by_buying_rate ? ("" + data.by_buying_rate + "") : null;
    data.by_selling_rate = data.by_selling_rate ? ("" + data.by_selling_rate + "") : null;
    data.by_call_group = (data.by_call_group).length ? ("'" + data.by_call_group + "'") : null;
    data.by_plan_type = (data.by_plan_type) ? ("'" + data.by_plan_type + "'") : null;
    // data.by_gateway = (data.by_gateway) ? ("'" + data.by_gateway + "'") : null;
    if(data.by_gateway == '' || !data.by_gateway){
        data.by_gateway = null
    }else{
        data.by_gateway = ("'" + data.by_gateway + "'");
    }
    // data.by_destination = data.by_destination.length ? '"' + data.by_destination + '"' : null;

    if(data.by_destination){
        let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+'+item) : "";
        data.by_destination = destination_data ? ("'" + destination_data + "'") : null;
    }else{
        data.by_destination = null;
    }  
    console.log(knex.raw("Call pbx_getCallPlanRateByFilters(" + data.by_call_plan + "," + data.by_dial_prefix + "," + data.by_buying_rate + "," + data.by_selling_rate  +  "," + data.by_call_group + "," + data.by_plan_type + "," + data.by_gateway + "," + data.by_destination + ")").toString());

    knex.raw("Call pbx_getCallPlanRateByFilters(" + data.by_call_plan + "," + data.by_dial_prefix + "," + data.by_buying_rate + "," + data.by_selling_rate +  "," + data.by_call_group + "," + data.by_plan_type  + "," + data.by_gateway + "," + data.by_destination + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

}

function checkUniqueGatewayPrefix(req, res) {
    
    let prefix = req.body.prefix + "" + req.body.dial_prefix;
    let gateway = req.body.gateway;
    let callPlan = req.body.call_plan;
    let call_plan_rate = req.body.id;
    let groupId = '';
    if(!req.body.group_id || req.body.group_id == "0"){
        groupId = null
    }else{
        groupId = req.body.group_id
    }
    let sql = knex.from(table.tbl_Call_Plan_Rate)
        .select('id')
        .where('dial_prefix', "" + prefix +  "")
        .andWhere('status', '=', '1')
        .andWhere('gateway_id', '=', gateway)
        .andWhere('call_plan_id', '=', callPlan)
        if(groupId != null){
            sql.andWhere('group_id', '=', groupId)
        }
        sql.whereNot('id', call_plan_rate);           
    sql.then((response) => {
        // if (response.length > 0 && response[0].id !== call_plan_rate) {
        if (response.length > 0) {
            const call_plan_res = response[0];
            res.json({
                id: call_plan_res.id
            });
        } else {
            res.json({
                id: ''
            });
        }
    }).catch((err) => { console.log(err); res.status(411).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewCustomerCallPlanRate(req, res) {

  let sql = knex.raw("Call pbx_get_Customercallplanrate(" + req.body.id + ")")
  sql.then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function getCustomerCallPlanRateByFilters(req, res) {
    let data = req.body.filters;
    // data.by_dial_prefix = data.by_dial_prefix ? ("" + data.by_dial_prefix + "") : null;
    data.by_dial_prefix = (data.by_dial_prefix).length ? ("'" + data.by_dial_prefix + "'") : null;
    data.by_selling_rate = data.by_selling_rate ? ("" + data.by_selling_rate + "") : null;

    // console.log(knex.raw("Call pbx_getCustomerCallPlanRateByFilters(" + data.by_dial_prefix + "," + data.by_selling_rate + ", "+ data.customer_id +")").toString());

    knex.raw("Call pbx_getCustomerCallPlanRateByFilters(" + data.by_dial_prefix + "," + data.by_selling_rate + ", "+ data.customer_id +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

}

function viewExtensionCallPlanRate(req, res) {

    knex.raw("Call pbx_get_Extensioncallplanrate(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function getExtensionCallPlanRateByFilters(req, res) {
    let data = req.body.filters;
    // data.by_dial_prefix = data.by_dial_prefix ? ("'" + data.by_dial_prefix + "'") : null;
    data.by_dial_prefix = (data.by_dial_prefix).length ? ("'" + data.by_dial_prefix + "'") : null;
    data.by_selling_rate = data.by_selling_rate ? ("" + data.by_selling_rate + "") : null;
    knex.raw("Call pbx_getExtensionCallPlanRateByFilters(" + data.by_dial_prefix + "," + data.by_selling_rate + ", "+ data.id +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

}


function viewUserDetailCallPlanRate(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    // console.log(knex.raw("Call pbx_get_callplanrate(" + req.body.id + "," + req.body.dial_prefix + ")").toString());

    knex.raw("Call pbx_get_userdetailscallplanrate(" + req.body.id + ","+ req.body.role +","+ req.body.user_id +")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function viewManagerCustomerCallPlanRate(req, res) {
    let accountManagerId = req.body.id;
    knex.raw("Call pbx_get_AccountManagercallplanrate(" + accountManagerId + ")") 
    .then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getManagerCustomerCallPlanRateByFilters(req, res) {
    let data = req.body;
    let a = [];
    // if([0] == false) {log("hello Yash",[0]);}
    let accountManagerId = data.customer_id ? ("" + data.customer_id + "") : null;
    // data.by_call_plan = data.by_call_plan ? ("" + data.by_call_plan + "") : null;
    data.by_call_plan = (data.by_call_plan).length ? ("'" + data.by_call_plan + "'") : null;
    data.by_dial_prefix = data.by_dial_prefix ? ("" + data.by_dial_prefix + "") : null;
    data.by_buying_rate = data.by_buying_rate ? ("" + data.by_buying_rate + "") : null;
    data.by_selling_rate = data.by_selling_rate ? ("" + data.by_selling_rate + "") : null;
    data.by_customer = data.by_customer ? ("" + data.by_customer + "") : null;    
    data.by_gateway = data.by_gateway.length ? '"' + data.by_gateway + '"' : null;
    data.by_destination = data.by_destination.length ? '"' + data.by_destination + '"' : null;
    data.by_plan_type = (data.by_plan_type) ? ("'" + data.by_plan_type + "'") : null;
    data.by_call_group = (data.by_call_group).length ? ("'" + data.by_call_group + "'") : null;
    let sql = knex.raw("Call pbx_getManagerCustomerCallPlanRateByFilters("+ data.by_call_plan + "," + data.by_dial_prefix + "," + data.by_buying_rate + "," + data.by_selling_rate +  "," + data.by_customer + "," + accountManagerId + "," + data.by_gateway + "," + data.by_destination + "," + data.by_plan_type  + "," + data.by_call_group  + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function checkUniqueCallGroup(req, res) {   
    console.log(req.body);
    
    let prefix = req.body.prefix + "" + req.body.dial_prefix;
    // let groupId = req.body.group_id;
    // let groupId = '';
    // if(!req.body.group_id || req.body.group_id == "0"){
        
    // }
    // let gateway = req.body.gateway;
    let callPlan = req.body.call_plan;
    let call_plan_rate = req.body.call_plan;
    if(req.body.group_id != '' &&  req.body.group_id != '0'){
        
        let sql = knex.from(table.tbl_Call_Plan_Rate)
        .select('id')
        .where('dial_prefix', "" + prefix +  "")
        .andWhere('status', '=', '1')
        .andWhere('group_id', '=', req.body.group_id)
        .andWhere('call_plan_id', '=', callPlan)        
        // .whereNot('id', call_plan_rate);
        console.log(sql.toQuery());
        
    sql.then((response) => {
        // if (response.length > 0 && response[0].id !== call_plan_rate) {
        if (response.length > 0) {
            const call_plan_res = response[0];
            res.json({
                id: call_plan_res.id
            });
        } else {
            res.json({
                id: ''
            });
        }
    }).catch((err) => { console.log(err); res.status(411).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err }); 
    }else{
        res.json({
            id: ''
        });
    }
} 

function GatewaUpdate(req,res){    
    let o_gid = req.body.old_GatewayId;    
    let n_gid = req.body.new_GatewayId;        
    let sql = knex(table.tbl_Call_Plan_Rate).update({gateway_id:n_gid})
        .whereIn('gateway_id',o_gid);
    sql.then((response) => {
            res.send({
                status_code: 200,
                response: response
            });        
    });
}

function deleteBundleRates(req,res){
let cust_id = '';
let callRatesList = req.body;
let dest = [];
if(callRatesList.length > 0){
    cust_id = callRatesList[0].customer_id;
}
for(let i = 0 ;i < callRatesList.length ; i ++){
    dest = callRatesList[i].dial_prefix.split('+');
  let sql =  knex.from(table.tbl_Call_Plan_Rate)
    .where('id',callRatesList[i].id)
    .del()
   sql.then((response) =>{
   let sql12 =  knex.from(table.tbl_pbx_min_ext_mapping)
    .select('ext_mnt_id')
    .where('id',callRatesList[i].id)
    sql12.then((respon)=>{
        if(respon.length != 0){
            let sqll= knex.from(table.tbl_pbx_min_ext_mapping)
             .where('destination',dest[1])
             .andWhere('gateway_id',callRatesList[i].gateway_id)
             .andWhere('customer_id',callRatesList[i].customer_id)
             .del()
             sqll.then((responses)=>{
                     createModuleLog(table.tbl_pbx_call_rate_detail_history, {
                                         call_rate_id: callRatesList[i].id,
                                         action: "Call Rates Detail deleted",
                                         modified_by : callRatesList[i].user_id,
                                         data: JSON.stringify([{
                                             call_plan_id: callRatesList[i].id,
                                             call_plan_name: callRatesList[i].name,
                                             customer_id: callRatesList[i].customer_id,
                                             talktime_minutes: callRatesList[i].talktime_minutes,
                                             gateway_id: callRatesList[i].gateway_id,
                                             gateway_name: callRatesList[i].ip,
                                             plan_type: callRatesList[i].plan_type,
                                             dialPrefix: callRatesList[i].dial_prefix,
                                             group_id: callRatesList[i].group_id,
                                             groupName: callRatesList[i].group_name,
                                             buying_rate: callRatesList[i].buying_rate,
                                             selling_rate: callRatesList[i].selling_rate
                                         }]),
                                     });   
                    knex.table(table.tbl_Call_Plan_Rate).where('call_plan_id',callRatesList[i].call_plan_id)
                    .andWhere('dial_prefix',callRatesList[i].dial_prefix)
                    .andWhere('gateway_id',callRatesList[i].gateway_id)
                    .andWhere('customer_id',0) 
                    .select('*')
                    .then((responses2)=>{
                        if(responses2){
                            knex.table(table.tbl_Call_Plan_Rate).where('call_plan_id',responses2.call_plan_id)
                            .andWhere('dial_prefix',responses2.dial_prefix)
                            .andWhere('gateway_id',responses2.gateway_id)
                            .andWhere('customer_id',0)
                            .update({
                                mapped : responses2.mapped - 1
                            }) 
                        }
                    }) .catch((err) => {
                        console.log(err);
                        res
                            .status(401)
                            .send({ error: "error", message: "DB Error: " + err.message });
                        throw err;
                    });
                              
                     res.send({ code: 200, message: "Call Rates Deleted" });
             });
        }else{
            createModuleLog(table.tbl_pbx_call_rate_detail_history, {
                call_rate_id: callRatesList[i].id,
                action: "Call Rates Detail deleted",
                modified_by : callRatesList[i].user_id,
                data: JSON.stringify([{
                    call_plan_id: callRatesList[i].id,
                    call_plan_name: callRatesList[i].name,
                    customer_id: callRatesList[i].customer_id,
                    talktime_minutes: callRatesList[i].talktime_minutes,
                    gateway_id: callRatesList[i].gateway_id,
                    gateway_name: callRatesList[i].ip,
                    plan_type: callRatesList[i].plan_type,
                    dialPrefix: callRatesList[i].dial_prefix,
                    group_id: callRatesList[i].group_id,
                    groupName: callRatesList[i].group_name,
                    buying_rate: callRatesList[i].buying_rate,
                    selling_rate: callRatesList[i].selling_rate
                }]),
            });

            knex.table(table.tbl_Call_Plan_Rate).where('call_plan_id',callRatesList[i].call_plan_id)
            .andWhere('dial_prefix',callRatesList[i].dial_prefix)
            .andWhere('gateway_id',callRatesList[i].gateway_id)
            .andWhere('customer_id',0) 
            .select('*')
            .then((responses2)=>{
                if(responses2){
                   let sql =  knex.table(table.tbl_Call_Plan_Rate).where('call_plan_id',responses2[0].call_plan_id)
                    .andWhere('dial_prefix',responses2[0].dial_prefix)
                    .andWhere('gateway_id',responses2[0].gateway_id)
                    .andWhere('customer_id',0)
                    .update({
                        mapped : responses2[0].mapped - 1
                    })
                    sql.then((respo)=>{

                    })
                }
            }) .catch((err) => {
                console.log(err);
                res
                    .status(401)
                    .send({ error: "error", message: "DB Error: " + err.message });
                throw err;
            });
            res.send({ code: 200, message: "Call Rates Deleted" });
        }
    })
    });
}

}


module.exports = {
    createCallPlanRate, viewCallPlanRate, getCallPlanRateByFilters,
    deleteCallPlanRate, checkUniqueGatewayPrefix,viewCustomerCallPlanRate,getCustomerCallPlanRateByFilters,
    viewExtensionCallPlanRate,getExtensionCallPlanRateByFilters,viewUserDetailCallPlanRate,viewManagerCustomerCallPlanRate,
    getManagerCustomerCallPlanRateByFilters, checkUniqueCallGroup, GatewaUpdate,deleteBundleRates
};