const Knex = require('knex');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require("../helper/modulelogger");

function createCallPlan(req, res) {
    let arr = req.body.callPlan;    
    
    if (req.body.callPlan.isPlanType == '1') {
        req.body.callPlan.bundle_type = req.body.callPlan.bundle_type;
    } else {
        req.body.callPlan.bundle_type = '0';
    }

    if (req.body.callPlan.booster_for == '1') {
        req.body.callPlan.bundle_type_booster = req.body.callPlan.bundle_type_booster;
    } else {
        req.body.callPlan.bundle_type_booster = '0';
    }

    let modified_by = req.userId;
    let type = '0';
    if (!req.body.callPlan.type || req.body.callPlan.type == '0' || req.body.callPlan.type == '') {
        type = '0';
    } else if (req.body.callPlan.type == '1') {
        type = '1';
    }

    if (req.body.callPlan.isCircle === true || req.body.callPlan.isCircle == '1') {
        req.body.callPlan.isCircle = '1';
    } else {
        req.body.callPlan.isCircle = '0';
    }
    if (req.body.callPlan.isMinutePlan === true || req.body.callPlan.isMinutePlan == '1') {
        req.body.callPlan.isMinutePlan = '1';
    } else {
        req.body.callPlan.isMinutePlan = '0';
    }
    if (req.body.callPlan.is_visible_customer === true || req.body.callPlan.is_visible_customer == '1') {
        req.body.callPlan.is_visible_customer = '1';
    } else {
        req.body.callPlan.is_visible_customer = '0';
    }

    let validity ;
    if(arr.validity == null || !arr.validity){
        validity = "";
    }else{
        validity = arr.validity;
    }
    arr.type = type
    arr.isCircle = req.body.callPlan.isCircle;
    arr.isMinutePlan = req.body.callPlan.isMinutePlan;
    arr.is_visible_customer = req.body.callPlan.is_visible_customer;

    let is_overuse;
    let numberOfDays = '';
    let operation = req.body.callPlan.id ? 'update' : 'create';
    let extra_fee_list = req.body.callPlan.fee_type_charges
    if (!req.body.callPlan.is_overuse || req.body.callPlan.is_overuse == '0' || req.body.callPlan.is_overuse == false || req.body.callPlan.is_overuse == '') {
        is_overuse = '0';
    } else if (req.body.callPlan.is_overuse == '1' || req.body.callPlan.is_overuse == true || req.body.callPlan.is_overuse != '') {
        is_overuse = '1';
    }
    if (req.body.callPlan.validity == 'custom') {
        numberOfDays = req.body.callPlan.number_of_days;
    }
    else {
        numberOfDays = 0;
    }    
    req.body.callPlan.base_charge = req.body.callPlan.base_charge ? req.body.callPlan.base_charge : '0.00'        
    let sql = knex.raw("Call pbx_save_callplan(" + req.body.callPlan.id + ",'" + req.body.callPlan.name + "','" + type + "','" + req.body.callPlan.isCircle + "','" + req.body.callPlan.circle + "','" + req.body.callPlan.isMinutePlan + "','" + req.body.callPlan.isPlanType + "','" + req.body.callPlan.is_visible_customer + "'," + "'1','" + req.body.callPlan.base_charge + "','" + validity + "','" + is_overuse + "'," + numberOfDays + ",'" + req.body.callPlan.booster_for + "')")
    sql.then((response) => {
        if (response) {
            if (operation === 'create') {
                let insertedId = response[0][0][0].Id;

                const mapped_list = []
                extra_fee_list.map(item => {
                    mapped_list.push({ bundle_plan_id: insertedId, fee_type: item.fee_type != "" ? item.fee_type : '', charge: (item.fee_type && item.fee_type != '') ? item.charge : 0 });
                });
                let sql2 = knex(table.tbl_pbx_bundle_plan_extra_fee_map).insert(mapped_list);
                sql2.then((response) => {                   
                    if (response) {                        
                        res.send({
                            response: response,
                            message: 'Call Plan created successfully.',
                            code: 200
                        });
                    }
                }).catch((err) => {
                    res.status(200).send({
                        code: err.errno,
                        error: 'error', message: 'DB Error: ' + err.message
                    }); throw err
                });
            } else {
                const mapped_list = extra_fee_list.map(item =>
                    ({ bundle_plan_id: req.body.callPlan.id, fee_type: item.fee_type, charge: item.charge }));
                let sql = knex(table.tbl_pbx_bundle_plan_extra_fee_map).where('bundle_plan_id', '=', "" + req.body.callPlan.id + "")
                sql.del();

                sql.then((response) => {
                    if (response) {
                        let sql2 = knex(table.tbl_pbx_bundle_plan_extra_fee_map).insert(mapped_list);
                        sql2.then((response) => {
                            if (response) {
                                res.send({
                                    response: response,
                                    message: 'Call Plan updated successfully.',
                                    code: 200
                                });
                            }
                        }).catch((err) => {
                            res.status(200).send({
                                code: err.errno,
                                error: 'error', message: 'DB Error: ' + err.message
                            }); throw err
                        });
                    } else {
                        res.status(200).send({ error: 'error', message: 'DB Error' });
                    }
                }).catch((err) => { res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            }
            let input = {
                Name: req.body.callPlan.name,
                "LC Type": req.body.callPlan.type == '0' ? 'LCR - According to the buyer price' : 'LCD - According to the seller price',
            }
            if(req.body.callPlan.isCircle == '1'){
                input['Circle'] = '1t';
                input['Circle Name'] = req.body.callPlan.circle_name;
            }
            if(req.body.callPlan.isMinutePlan == '1'){
                input["Minute Plan"] = '1t';                    
                req.body.callPlan.isPlanType == '1' ? input['DID Bundle'] = '1t' : req.body.callPlan.isPlanType == '2' ? input['Roaming'] = '1t' : req.body.callPlan.isPlanType == '4' ? input['TeleConsultancy'] = '1t' : req.body.callPlan.isPlanType == '5' ? input['Outgoing Bundle'] = '1t' : input['Booster'] = '1t';
                input["Validity"] = req.body.callPlan.validity,
                input["Base Price"] = req.body.callPlan.base_charge
            }
            
            if(req.body.callPlan.isPlanType == '3'){
                input['Booster For'] = req.body.callPlan.booster_for == '4' ? 'TeleConsultancy' : req.body.callPlan.booster_for == '5' ? 'Outgoing Bundle' : req.body.callPlan.booster_for == '2' ? "Roaming" :  "DID Bundle";                        
            }
                               
            if(req.body.callPlan.is_overuse){
                input["Overuse"] = '1t';
            }

            if(req.body.callPlan.is_visible_customer == true) {
                input['Visible to Customer Portal'] = '1t';
            }

            if(req.body.callPlan.recurring  == true){
                input["Recurring Charge"] = '1t';
                input["Recurring Charge1"] = req.body.callPlan.charge1;
            }
            if(req.body.callPlan.monthlySupport == true){
                input["Monthly Support Charge"] = '1t';
                input["Monthly Charge2"] = req.body.callPlan.charge2;
            }
            if(req.body.callPlan.NocSupport == true){
                input["NOC Support Charge"] = '1t';
                input["Noc Charge"] = req.body.callPlan.charge3;
            }
            if(req.body.callPlan.OneTimeSupport == true){
                input["One Time Charge"] = '1t';
                input["One Time Charge"] = req.body.callPlan.charge4;
            }

            createModuleLog(table.tbl_pbx_audit_logs, {
                module_action_id: arr.id ? arr.id : response[0][0][0].Id,
                module_action_name: req.body.callPlan.name,
                module_name: "call plan",
                message: arr?.id
                    ? "Call Plan Updated"
                    : "Call Plan Created",
                customer_id: modified_by,
                features: "" + JSON.stringify(input) + "",
            });
            // res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}


function getExtraFeeMapping(req, res) {

    let id = req.body.id;

    let sql = knex.from(table.tbl_pbx_bundle_plan_extra_fee_map)
        .select('id', 'bundle_plan_id', knex.raw('group_concat(fee_type) as extra_fee'), knex.raw('group_concat(charge) as fee_charge'))
        .where('bundle_plan_id', id)

    sql.then((response) => {
        res.json({
            response: response
        })

    })

}

function viewCallPlanDetails(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    knex.raw("Call pbx_get_callplanDetails(" + req.body.id + ")")
        .then((response) => {
            res.send({
                response: response[0][0]
            })
        })


}

function viewCallPlan(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;
    knex.raw("Call pbx_get_callplan(?, ?)",[req.body.id, req.body.name])
        .then(async (response) => {

            if (response[0][0]) {

                let Map = [];
                Map = response ? response[0] : null
                await Map[0].map((data) => {
                    let sql2 = knex.raw("Call pbx_getCallPlanRateByFilters(?, ?, ?, ?, ?, ?, ?, ?)",[data.id, null, null, null, null, null, null, null ])
                    sql2.then(async (response2) => {
                        if (response2[0][0].length) {
                            Object.assign(data, { flag: 1 });
                        }
                        let sql4 = knex(table.tbl_Call_Plan + ' as cp')
                            .leftJoin(table.tbl_PBX_features + ' as f', function () {
                                this.on(function () {
                                    this.on('f.bundle_plan_id', '=', 'cp.id')
                                    this.orOn('f.roaming_plan_id', '=', 'cp.id')
                                    this.orOn('f.teleConsultancy_call_plan_id', '=', 'cp.id')
                                    this.orOn('f.out_bundle_call_plan_id', '=', 'cp.id')
                                    this.orOn('f.call_plan_id', '=', 'cp.id')
                                })
                            })
                            .join(table.tbl_Package + ' as p', 'p.feature_id', 'f.id')
                            .where('f.call_plan_id', data.id)
                            .orWhere('f.bundle_plan_id', data.id)
                            .orWhere('f.roaming_plan_id', data.id)
                            .orWhere('f.teleConsultancy_call_plan_id', data.id)
                            .orWhere('f.out_bundle_call_plan_id', data.id)
                            .select('p.name', 'f.id');

                        sql4.then(response3 => {

                            if (response3.length) {
                                Object.assign(data, { status: 1 });
                            }
                            // else{
                            //     Object.assign(data, { status: 0 });
                            // }
                        })

                        let sql5 = knex(table.tbl_Call_Plan + ' as cp')
                            .leftJoin(table.tbl_PBX_features + ' as f', function () {
                                this.on(function () {
                                    this.on('f.bundle_plan_id', '=', 'cp.id')
                                    this.orOn('f.roaming_plan_id', '=', 'cp.id')
                                    this.orOn('f.teleConsultancy_call_plan_id', '=', 'cp.id')
                                    this.orOn('f.out_bundle_call_plan_id', '=', 'cp.id')
                                    this.orOn('f.call_plan_id', '=', 'cp.id')
                                })
                            })
                            .join(table.tbl_Package + ' as p', 'p.feature_id', 'f.id')
                            .join(table.tbl_Map_customer_package + ' as mcp', 'mcp.package_id', 'p.id')
                            .join(table.tbl_Customer + ' as c', 'c.id', 'mcp.customer_id')
                            .where('f.call_plan_id', data.id)
                            .orWhere('f.bundle_plan_id', data.id)
                            .orWhere('f.roaming_plan_id', data.id)
                            .orWhere('f.teleConsultancy_call_plan_id', data.id)
                            .orWhere('f.out_bundle_call_plan_id', data.id)
                            .select('p.name', 'f.id');
                        sql5.then(response4 => {

                            if (response4.length) {
                                Object.assign(data, { associate: 1 });
                            }
                            // else{
                            //     Object.assign(data, { status: 0 });
                            // }
                        })
                    })
                })
                setTimeout(() => {
                    res.json({
                        response: Map[0]
                    })
                }, 1000);
            } else {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function deleteCallPlan(req, res) {
    let modified_by = req.userId;
    knex.raw("Call pbx_delete_callplan(?)",[req.query[Object.keys(req.query)[0]]])
        .then((response) => {
            if (response) {
                createModuleLog(table.tbl_pbx_call_plan_list_detail_history, {
                    call_id: req.query[Object.keys(req.query)[0]],
                    action: "Call Plan List Detail deleted",
                    modified_by,
                    data: "" + JSON.stringify(response) + "",
                });
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}



function getcallPlan(req, res) {
    knex.from(table.tbl_Call_Plan).where('status', "1").orderBy('name', 'asc')
        .select('*')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getCallPlanByFilter(req, res) {
    let data = req.body.filters;
    data.by_type = data.by_type ? ("'" + data.by_type + "'") : null;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_circle = (data.by_circle).length ? ("'" + data.by_circle + "'") : null;
    data.by_minute_plan_type = data.minute_paln_type ? ("" + data.minute_paln_type + "") : null;
    data.by_validity = data.by_validity ? ("'" + data.by_validity + "'") : null;
    data.by_bundle_type = data.by_bundle_type ? ("'" + data.by_bundle_type + "'") : null;
    let sql = knex.raw("Call pbx_getCallPlanByFilter(?, ?, ?, ?, ?, ?)",[data.by_type, data.by_name, data.by_circle, data.by_minute_plan_type, data.by_validity, data.by_bundle_type])
    sql.then(async (response) => {
        
        if (response) {
            let Map = [];
            Map = response ? response[0] : null
            await Map[0].map(async (data) => {
                let sql2 = knex.raw("Call pbx_getCallPlanRateByFilters(?, ?, ?, ?, ?, ?, ?, ?)",[data.id, null, null, null, null, null, null, null])                
                sql2.then((response2) => {
                    
                    if (response2[0][0].length) {
                        Object.assign(data, { flag: 1 });
                    }
                    let sql4 = knex(table.tbl_Call_Plan + ' as cp')
                        .leftJoin(table.tbl_PBX_features + ' as f', function () {
                            this.on(function () {
                                this.on('f.bundle_plan_id', '=', 'cp.id')
                                this.orOn('f.roaming_plan_id', '=', 'cp.id')
                                this.orOn('f.teleConsultancy_call_plan_id', '=', 'cp.id')
                                this.orOn('f.out_bundle_call_plan_id', '=', 'cp.id')
                                this.orOn('f.call_plan_id', '=', 'cp.id')
                            })
                        })
                        .join(table.tbl_Package + ' as p', 'p.feature_id', 'f.id')
                        .where('f.call_plan_id', data.id)
                        .orWhere('f.bundle_plan_id', data.id)
                        .orWhere('f.roaming_plan_id', data.id)
                        .orWhere('f.teleConsultancy_call_plan_id', data.id)
                        .orWhere('f.out_bundle_call_plan_id', data.id)
                        .select('p.name', 'f.id');

                    sql4.then(response3 => {
                        
                        if (response3.length) {
                            Object.assign(data, { status: 1 });
                        }
                        // else{
                        //     Object.assign(data, { status: 0 });
                        // }
                    })

                    let sql5 = knex(table.tbl_Call_Plan + ' as cp')
                        .leftJoin(table.tbl_PBX_features + ' as f', function () {
                            this.on(function () {
                                this.on('f.bundle_plan_id', '=', 'cp.id')
                                this.orOn('f.roaming_plan_id', '=', 'cp.id')
                                this.orOn('f.teleConsultancy_call_plan_id', '=', 'cp.id')
                                this.orOn('f.out_bundle_call_plan_id', '=', 'cp.id')
                                this.orOn('f.call_plan_id', '=', 'cp.id')
                            })
                        })
                        .join(table.tbl_Package + ' as p', 'p.feature_id', 'f.id')
                        .join(table.tbl_Map_customer_package + ' as mcp', 'mcp.package_id', 'p.id')
                        .join(table.tbl_Customer + ' as c', 'c.id', 'mcp.customer_id')
                        .where('f.call_plan_id', data.id)
                        .orWhere('f.bundle_plan_id', data.id)
                        .orWhere('f.roaming_plan_id', data.id)
                        .orWhere('f.teleConsultancy_call_plan_id', data.id)
                        .orWhere('f.out_bundle_call_plan_id', data.id)
                        .select('p.name', 'f.id');
                    sql5.then(response4 => {
                        
                        if (response4.length) {
                            Object.assign(data, { associate: 1 });
                        }
                        // else{
                        //     Object.assign(data, { status: 0 });
                        // }
                    })
                })

                // await knex(table.tbl_Call_Plan + ' as cp')
                //     .join(table.tbl_PBX_features + ' as f', 'f.call_plan_id', 'cp.id')
                //     .join(table.tbl_Package + ' as p' , 'p.feature_id', 'f.id')
                //     .where('f.call_plan_id',data.id)
                //     .select('p.name', 'f.id').then(response3 => {                            
                //         if(response3.length){
                //             Object.assign(data, { status: 1 });
                //         }
                //     }) 
            })
            setTimeout(() => {
                res.json({
                    response: Map[0]
                })
            }, 1000);
            // res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCallPlanIsExist(req, res) {
    let callPlanId = req.body.id ? req.body.id : null;
    knex.from(table.tbl_Call_Plan).where('id', callPlanId)
        .select('*')
        .then((response) => {
            if (response.length > 0) {
                knex.select('*').from(table.tbl_PBX_features)
                    .where('call_plan_id', '=', "" + callPlanId + "")
                    .then((response) => {
                        let featureId = response[0].id;
                        if (response.length > 0) {
                            knex.select('*').from(table.tbl_Package)
                                .where('feature_id', featureId)
                                .then((response) => {
                                    let PackageId = response[0].id;
                                    if (response.length > 0) {
                                        knex.select('*').from(table.tbl_Map_customer_package)
                                            .where('package_id', PackageId)
                                            .then((response) => {
                                                if (response.length > 0) {
                                                    res.send({
                                                        code: 200,
                                                        msg: 'Call plan associate with customer'
                                                    });
                                                } else {
                                                    res.send({
                                                        code: 401,
                                                        msg: ''
                                                    });
                                                }
                                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Call plan does not exist in package' }); throw err });

                                    } else {
                                        res.send({
                                            code: 401,
                                            msg: ''
                                        });
                                    }

                                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Call plan does not exist in package' }); throw err });
                        } else {
                            res.send({
                                code: 401,
                                msg: ''
                            });
                        }
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Features not available' }); throw err });

            } else {
                res.send({
                    code: 401,
                    msg: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getManagerCustomerscallPlan(req, res) {   // ----on progress --------

    //     let accountManagerId = req.query.manager_id;
    //    let sql = knex.raw("Call pbx_get_planType_accountmanager(" + accountManagerId + ")") 
    //     sql.then((response) => {
    //         if (response) {
    //             res.send({ response: response[0][0] });
    //         }
    //     }).catch((err) => {
    //         res.send({ response: { code: err.errno, message: err.sqlMessage } });
    //     });




    let managerId = req.query.manager_id;
    var sql = knex.select(knex.raw('DISTINCT(cp.id)'), 'cp.name')
        .from(table.tbl_Call_Plan + ' as cp')

        // left outer join pbx_feature as f on f.call_plan_id = cr.call_plan_id

        // .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')


        .leftJoin(table.tbl_Call_Plan_Rate + ' as cr', 'cr.call_plan_id', 'cp.id')
        .leftJoin(table.tbl_PBX_features + ' as f', function () {
            this.on(function () {
                this.on('f.bundle_plan_id', '=', 'cp.id')
                // .orOn('f.roaming_plan_id', '=', 'bp.id')
                // .orOn('f.teleConsultancy_call_plan_id', '=', 'bp.id')
                // .orOn('f.call_plan_id', '=', 'cp.id')
            })
        })
        // .leftJoin(table.tbl_PBX_features + ' as f', 'f.call_plan_id', 'cp.id')
        .leftJoin(table.tbl_Package + ' as pc', 'pc.feature_id', 'f.id')
        .leftJoin(table.tbl_Product + ' as pr', 'pr.id', 'pc.product_id')
        .leftJoin(table.tbl_Map_customer_package + ' as mp', 'mp.product_id', 'pr.id')
        .leftJoin(table.tbl_Customer + ' as cus', 'cus.id', 'mp.customer_id')
        .where('cp.status', "1")
        .andWhere('cus.account_manager_id', managerId)
        .orderBy('cp.name', 'asc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getManagerCustomerscallPlanRoaming(req, res) {   // ----on progress --------
    let managerId = req.query.manager_id;
    var sql = knex.select(knex.raw('DISTINCT(cp.id)'), 'cp.name')
        .from(table.tbl_Call_Plan + ' as cp')
        .leftJoin(table.tbl_Call_Plan_Rate + ' as cr', 'cr.call_plan_id', 'cp.id')
        .leftJoin(table.tbl_PBX_features + ' as f', function () {
            this.on(function () {
                this.on('f.roaming_plan_id', '=', 'cp.id')
            })
        })
        .leftJoin(table.tbl_Package + ' as pc', 'pc.feature_id', 'f.id')
        .leftJoin(table.tbl_Product + ' as pr', 'pr.id', 'pc.product_id')
        .leftJoin(table.tbl_Map_customer_package + ' as mp', 'mp.product_id', 'pr.id')
        .leftJoin(table.tbl_Customer + ' as cus', 'cus.id', 'mp.customer_id')
        .where('cp.status', "1")
        .andWhere('cus.account_manager_id', managerId)
        .orderBy('cp.name', 'asc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}
function getManagerCustomerscallPlanTC(req, res) {   // ----on progress --------
    let managerId = req.query.manager_id;
    var sql = knex.select(knex.raw('DISTINCT(cp.id)'), 'cp.name')
        .from(table.tbl_Call_Plan + ' as cp')
        .leftJoin(table.tbl_Call_Plan_Rate + ' as cr', 'cr.call_plan_id', 'cp.id')
        .leftJoin(table.tbl_PBX_features + ' as f', function () {
            this.on(function () {
                this.on('f.teleConsultancy_call_plan_id', '=', 'cp.id')
            })
        })
        .leftJoin(table.tbl_Package + ' as pc', 'pc.feature_id', 'f.id')
        .leftJoin(table.tbl_Product + ' as pr', 'pr.id', 'pc.product_id')
        .leftJoin(table.tbl_Map_customer_package + ' as mp', 'mp.product_id', 'pr.id')
        .leftJoin(table.tbl_Customer + ' as cus', 'cus.id', 'mp.customer_id')
        .where('cp.status', "1")
        .andWhere('cus.account_manager_id', managerId)
        .orderBy('cp.name', 'asc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}
function getManagerCustomerscallPlanStandard(req, res) {   // ----on progress --------
    let managerId = req.query.manager_id;
    var sql = knex.select(knex.raw('DISTINCT(cp.id)'), 'cp.name')
        .from(table.tbl_Call_Plan + ' as cp')
        .leftJoin(table.tbl_Call_Plan_Rate + ' as cr', 'cr.call_plan_id', 'cp.id')
        .leftJoin(table.tbl_PBX_features + ' as f', function () {
            this.on(function () {
                this.on('f.call_plan_id', '=', 'cp.id')
            })
        })
        .leftJoin(table.tbl_Package + ' as pc', 'pc.feature_id', 'f.id')
        .leftJoin(table.tbl_Product + ' as pr', 'pr.id', 'pc.product_id')
        .leftJoin(table.tbl_Map_customer_package + ' as mp', 'mp.product_id', 'pr.id')
        .leftJoin(table.tbl_Customer + ' as cus', 'cus.id', 'mp.customer_id')
        .where('cp.status', "1")
        .andWhere('cus.account_manager_id', managerId)
        .orderBy('cp.name', 'asc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}
// function TCPackageDestination(req,res){
//  let sql = knex.select('country.id', 'country.nicename as name')
//     .from('pbx_call_plan_rates as cpr')
//     .innerJoin('pbx_call_plan as cp', 'cpr.call_plan_id', 'cp.id')
//     .leftJoin('pbx_call_rate_group as crg', 'crg.id', 'cpr.group_id')
//     .leftJoin('country', 'country.phonecode', 'cpr.dial_prefix')
//     .innerJoin('pbx_feature as f', 'f.teleConsultancy_call_plan_id', 'cp.id')
//     .innerJoin('package as pckg', 'pckg.feature_id', 'f.id')
//     .innerJoin('map_customer_package AS mcp', 'mcp.package_id', 'pckg.id')
//     .where('cp.plan_type', '4')
//     .andWhere('cpr.customer_id', req.query.customer_id)
//     .groupBy('cpr.id')
//     .orderBy('cpr.id', 'desc')
//     console.log(sql.toQuery(),'-----------country');
//     sql.then((response) => {
//         res.json({
//             response
//         });
//     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
// }
function TCPackageDestination(req, res) {
    let sql = knex.select(knex.raw('DISTINCT country.id, country.nicename as name'))
        .from('pbx_call_plan_rates as cpr')
        .innerJoin('pbx_call_plan as cp', 'cpr.call_plan_id', 'cp.id')
        .leftJoin('pbx_call_rate_group as crg', 'crg.id', 'cpr.group_id')
        .leftJoin('country', 'country.phonecode', 'cpr.dial_prefix')
        .innerJoin('pbx_feature as f', 'f.teleConsultancy_call_plan_id', 'cp.id')
        .innerJoin('package as pckg', 'pckg.feature_id', 'f.id')
        .innerJoin('map_customer_package AS mcp', 'mcp.package_id', 'pckg.id')
        .where('cp.plan_type', '4')
        .andWhere('cpr.customer_id', req.query.customer_id)
        .groupBy('cpr.id')
        .orderBy('cpr.id', 'desc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => {
        console.log(err);
        res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        throw err;
    });
}

function deleteCallRateGroup(req, res) {    
    let modified_by = req.userId;
    knex.raw("Call pbx_delete_callrate_group(?)",[req.query[Object.keys(req.query)[0]]])
        .then((response) => {
            createModuleLog(table.tbl_pbx_call_rate_group_detail_history, {
                group_id: req.query[Object.keys(req.query)[0]],
                action: "Call Rate Group Detail deleted",
                modified_by,
                data: "" + JSON.stringify(response) + "",
            });
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function getAssociatePackage(req, res) {

    let call_plan_id = req.body.id;
    let flag = req.body.flag;
    let sql = knex.select('c.company_name', 'c.email', 'c.mobile', 'pckg.name as package', 'cp.name as callplan', 'pckg.id')  //'cp.id as callPlanId'
        .from(table.tbl_Call_Plan_Rate + ' as cpr')
        .leftJoin(table.tbl_Call_Plan + ' as cp', 'cp.id', 'cpr.call_plan_id')
        .leftJoin(table.tbl_PBX_features + ' as f', function () {
            this.on(function () {
                this.on('f.bundle_plan_id', '=', 'cp.id')
                this.orOn('f.roaming_plan_id', '=', 'cp.id')
                this.orOn('f.teleConsultancy_call_plan_id', '=', 'cp.id')
                this.orOn('f.out_bundle_call_plan_id', '=', 'cp.id')
                this.orOn('f.call_plan_id', '=', 'cp.id')
            })
        })
        .leftJoin(table.tbl_Package + ' as pckg', 'pckg.feature_id', 'f.id')
        .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'mcp.package_id', 'pckg.id')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'mcp.customer_id')
        .where('f.call_plan_id', call_plan_id)
        .orWhere('f.bundle_plan_id', call_plan_id)
        .orWhere('f.roaming_plan_id', call_plan_id)
        .orWhere('f.teleConsultancy_call_plan_id', call_plan_id)
        .orWhere('f.out_bundle_call_plan_id', call_plan_id)

    if (flag == '0') {
        sql.groupBy('pckg.id')
    }
    if (flag == '1') {
        sql.groupBy('c.company_name')
    }

    sql.then(function (response) {

        res.send({
            response
        })
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function checkRatesAssociated(req, res) {

    let callPlanId = req.query.id;

    let sql = knex.from(table.tbl_Call_Plan_Rate)
        .select('id')
        .where('call_plan_id', callPlanId)
        .andWhere('customer_id', '!=', 0)


    sql.then((response) => {
        res.send({
            response
        })
    })

}

// function getCallRateGroupCount(req, res) {
//     var bc_id = req.query.callRateGroup_id;//broabcast_id: 
//         var countQuery = knex.select(knex.raw('COUNT(dd.customer_id) as broadcast_count'))
//             .from(table.tbl_DID_Destination + ' as dd')
//             .where('dd.destination_id', bc_id);
//     countQuery.then((response) => {
//         if (response) {
//             res.json({
//                 response
//             });
//         } else {
//             res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
//         }
//     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
// }

function getNewRates(req,res){
    let customerId = parseInt(req.query.id);

    let minutePlanPromise = knex.select('cpr.*', 'cp.name', 'cp.plan_type', 'g.ip', 'crg.name as group_name', knex.raw('DATE_FORMAT(cpr.expiry_date,"%d-%m-%Y ") as expiry_date' ), knex.raw('IF( crg.name != "", crg.name,"-") as group_name'))  //'cp.id as callPlanId'
        .from(table.tbl_Call_Plan_Rate + ' as cpr')
        .leftJoin(table.tbl_Call_Plan + ' as cp', 'cp.id', 'cpr.call_plan_id')
        .leftJoin(table.tbl_PBX_features + ' as f', function () {
            this.on(function () {
                this.on('f.bundle_plan_id', '=', 'cp.id')
                this.orOn('f.roaming_plan_id', '=', 'cp.id')
                this.orOn('f.teleConsultancy_call_plan_id', '=', 'cp.id')
                this.orOn('f.out_bundle_call_plan_id', '=', 'cp.id')
            })
        })
        .leftJoin(table.tbl_Package + ' as pckg', 'pckg.feature_id', 'f.id')
        .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'mcp.package_id', 'pckg.id')
        .leftJoin(table.tbl_Gateway + ' as g', 'g.id', 'cpr.gateway_id')
        .leftJoin(table.tbl_pbx_call_rate_group + ' as crg', 'crg.id', 'cpr.group_id')
        .where('cpr.customer_id', '=', customerId)
        .groupBy('cpr.id');

        console.log(minutePlanPromise.toQuery());



    let standardPromise = knex.select('cpr.*', 'cp.name', 'cp.plan_type', 'g.ip')  //'cp.id as callPlanId'
        .from(table.tbl_Call_Plan_Rate + ' as cpr')
        .leftJoin(table.tbl_Call_Plan + ' as cp', 'cp.id', 'cpr.call_plan_id')
        .leftJoin(table.tbl_PBX_features + ' as f', function () {
            this.on(function () {
                this.on('f.call_plan_id', '=', 'cp.id')
            })
        })
        .leftJoin(table.tbl_Package + ' as pckg', 'pckg.feature_id', 'f.id')
        .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'mcp.package_id', 'pckg.id')
        .leftJoin(table.tbl_Gateway + ' as g', 'g.id', 'cpr.gateway_id')
        .where('mcp.customer_id', customerId)
        .groupBy('cpr.id');


    Promise.all([minutePlanPromise, standardPromise]).then((response) => {
        res.json({
            response: response,
        });
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

}



module.exports = {
    createCallPlan, viewCallPlan,
    deleteCallPlan, getcallPlan, getCallPlanByFilter, getCallPlanIsExist, getManagerCustomerscallPlan, getManagerCustomerscallPlanRoaming,
    getManagerCustomerscallPlanTC, getManagerCustomerscallPlanStandard,
    deleteCallRateGroup, getAssociatePackage, getExtraFeeMapping, viewCallPlanDetails, checkRatesAssociated,getNewRates,TCPackageDestination
};