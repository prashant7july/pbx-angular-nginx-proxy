const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require("../helper/modulelogger");

function createCallRateGroup(req, res) {
    let modified_by = req.userId;
    let arr = req.body.callRateGroup;    

   let sql = knex.select('id').from(table.tbl_pbx_call_rate_group).where('name',req.body.callRateGroup.name).andWhere('customer_id',0)
   if(req.body.callRateGroup.id){
       sql.andWhere('id','!=',req.body.callRateGroup.id)
   }
    sql.then((responses) =>{
        if(responses.length == 0){
            knex.raw("Call pbx_save_callrategroup(" + req.body.callRateGroup.id + ",'" + req.body.callRateGroup.name + "'," + req.body.callRateGroup.minutes + ")")
                .then((response) => {
                    if (response) {                        
                        let input = {
                            "Call Rate Group": arr.name,
                            "Minutes": arr.minutes
                        }
                        createModuleLog(table.tbl_pbx_audit_logs, {
                                            module_name: "call rate group",
                                            module_action_id: arr?.id ? arr?.id: response[0][0][0].cg_id,
                                            module_action_name: req.body.callRateGroup.name,
                                            message:  arr?.id ? "Call Rate Group Updated" : "Call Rate Group Created",
                                            customer_id: modified_by,
                                            features: "" + JSON.stringify(input) + ""
                                        });
                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                    }
                }).catch((err) => {
                    res.send({ code: err.errno, message: err.sqlMessage });
                });
        }else{
            res.send({ code: 1062, message: 'Duplicate Entry' });
        }
    })
}

function viewCallRateGroup(req, res) {
    knex.raw("Call pbx_get_callrategroup()")
        .then((response) => {            
            if (response) {                
                response[0][0].map(data => {
                    knex.select('crg.id')
                    .from(table.tbl_pbx_call_rate_group + " as crg")
                    .leftJoin(table.tbl_Call_Plan_Rate + " as cpr", "crg.id", "cpr.group_id")
                    .leftJoin(table.tbl_Call_Plan + " as cp", "cp.id", "cpr.call_plan_id")
                    .leftJoin(table.tbl_Country + " as c", "c.id", "cpr.phonecode")
                    .leftJoin(table.tbl_Gateway + " as g", "g.id", "cpr.gateway_id")
                    .leftJoin(table.tbl_Provider + " as p", "p.id", "g.provider_id")
                    .where('cpr.is_group',"1").andWhere('cpr.group_id',data.id).then(responses =>{
                        if(responses.length){
                            Object.assign(data,{status: 1});
                        }
                    })
                })
                setTimeout(() => {
                    res.send({ response: response[0][0] });
                }, 500);
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getCallRateGroupByFilters(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_minute = data.by_minute ? ("" + data.by_minute + "") : null;
    knex.raw("Call pbx_getCallRateGroupByFilters(" + data.by_name + "," + data.by_minute + ")").then((response) => {
        if (response) {
            response[0][0].map(data => {
                knex.select('crg.id')
                .from(table.tbl_pbx_call_rate_group + " as crg")
                .leftJoin(table.tbl_Call_Plan_Rate + " as cpr", "crg.id", "cpr.group_id")
                .leftJoin(table.tbl_Call_Plan + " as cp", "cp.id", "cpr.call_plan_id")
                .leftJoin(table.tbl_Country + " as c", "c.id", "cpr.phonecode")
                .leftJoin(table.tbl_Gateway + " as g", "g.id", "cpr.gateway_id")
                .leftJoin(table.tbl_Provider + " as p", "p.id", "g.provider_id")
                .where('cpr.is_group',"1").andWhere('cpr.group_id',data.id).then(responses =>{
                    if(responses.length){
                        Object.assign(data,{status: 1});
                    }
                })
            })
            setTimeout(() => {
                res.send({ response: response[0][0] });
            }, 500);
            // res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

}

function getAllRatesFromGroup(req, res) {
    let groupId = parseInt(req.query.id);
    knex.raw("Call pbx_getAssociateCallRateFromGroup(" + groupId + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function ViewgetCallRateGroup(req,res){
let data =req.body.id;
let sql = knex(table.tbl_pbx_call_rate_group)
        .select('*')
        .where('id','like',data);
sql.then((response)=>{
    res.send({
        response : response[0]
    })
})
}

function getAssociateCallRates(req, res) {
    let data = req.body.data;
    data.id = data.id ? data.id : null;
    data.by_call_plan = data.by_call_plan ? data.by_call_plan.length ? "'" +data.by_call_plan+ "'" : null : null;
    data.by_gateway = data.by_gateway ? data.by_gateway.length ? "'" +data.by_gateway+ "'" : null : null;
    data.by_country = data.by_country ? data.by_country.length ? "'" +data.by_country+ "'" : null : null;
    data.by_provider = data.by_provider ? data.by_provider.length ? "'" +data.by_provider+ "'" : null : null;
    let sql = knex.raw("call pbx_associate_callRatesIn_Group("+ data.id +","+ data.by_call_plan +","+ data.by_gateway +","+ data.by_country +","+ data.by_provider +")");
    sql.then((response) => {
        if(response) {
            res.send({
                response: response[0][0]
            })
        }
    })
}

function checkCallRateMapping(req,res){
    let id = req.query.id;
  let sql =  knex.raw("call pbx_checkMappingCallRates(" + id + ")")
    sql.then((response) =>{
        res.send({
            response: response[0][0]
        })
    })
}

module.exports = {
    createCallRateGroup, viewCallRateGroup, getCallRateGroupByFilters, getAllRatesFromGroup,ViewgetCallRateGroup, getAssociateCallRates,checkCallRateMapping
}
