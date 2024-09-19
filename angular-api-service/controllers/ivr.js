const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require('../helper/modulelogger');

function createIVR(req,res){
    console.log(req.body,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    var figJson = JSON.stringify(req.body.finalFig);
    // console.log(knex(table.tbl_PBX_IVR).insert({
    //     prompt_id:""+ req.body.ivr_prompt +"" ,name: ""+ req.body.ivr_prompt +"",description: ""+ req.body.description +"",
    //    design:"'"+ figJson +"'" , customer_id: ""+ req.body.customer_id +"", status:'1'
    //  }).toString());

    knex(table.tbl_PBX_IVR).insert({
       prompt_id:""+ req.body.ivr_prompt +"" ,name: ""+ req.body.ivr_prompt +"",description: ""+ req.body.description +"",
       design:"'"+ figJson +"'" , customer_id: ""+ req.body.customer_id +"", status:'1'
    })
        .then((response) => {
            if (response.length > 0) {              
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'IVR Creation error' });
            }
        }).catch((err) => { console.log(err); throw err });
}

function getIVRAction(req, res) {    
    var user_id = req.query.user_id;
    var action = req.query.action;
    if (action == '3') { //Conference
        var sql = knex.select('id', 'name').from(table.tbl_PBX_conference)
            // .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('name', 'asc');
     }else if (action == '1') { //SIP
        var sql = knex.select('id',  knex.raw('CONCAT(ext_number, \'-\',caller_id_name) as name')).from(table.tbl_Extension_master)
            .where('status', '=', "1")
            .andWhere('plug_in','=','0')
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('name', 'asc');
    }else if (action == '4') { //Queue
        var sql = knex.select('id', 'name').from(table.tbl_PBX_queue)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('name', 'asc');
    } else if (action == '5') { //Call Group
        var sql = knex.select('id', 'name').from(table.tbl_PBX_CALLGROUP)
            .where('customer_id', '=', "" + user_id + "")
            .orderBy('name', 'asc');
    }else if (action == '6') { //Voicemail extension
        var sql = knex.select('id', knex.raw('CONCAT(ext_number, \'-\',caller_id_name) as name')).from(table.tbl_Extension_master)
            .where('status', '=', "1")
            .andWhere('voicemail','=','1')
            .andWhere('plug_in','=','0')
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('name', 'asc');
    }else if (action == '8') { //contact list
        var sql = knex.select('id', knex.raw('CONCAT(name, \' - \',phone_number1) as name')).from(table.tbl_Contact_list)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('name', 'asc');
    }else if (action == '11') { //PROMPTS
        var sql = knex.select('id',  'prompt_name as name').from(table.tbl_pbx_prompt)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .andWhere('prompt_type', '=', "" + '3' + "")
            .orderBy('name', 'asc');
    }else if (action == '12') { //PLAYBACK
        var sql = knex.select('id',  'prompt_name as name').from(table.tbl_pbx_prompt)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('name', 'asc');
    }else if (action == '2') { //ivr but get only multilevel-ivr
        console.log("multivelevl ivr");
        var sql = knex.select('id',  'name').from(table.tbl_Pbx_Ivr_Master)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .andWhere('is_multilevel_ivr', '=', "1")
            .orderBy('name', 'asc');
    }else if (action == '2a') { //ivr but get parent IVR
        var sql = knex.select('id',  'name').from(table.tbl_Pbx_Ivr_Master)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .andWhere('is_multilevel_ivr', '!=', "1")
            .orderBy('name', 'asc');
    }  
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function createBasicIVR(req,res){    

    console.log(req.body.ivr,"-----creating ivr-----");
     let isfeedbackCall = req.body.ivr.feedbackIVR;  // feedback call
     let is_selection_dtmf = req.body.ivr.selection_dtmf_required;  // feedback call is_selection_dtmf
     let is_direct_ext_dial = req.body.ivr.directExtenDial;  // feedback call is_selection_dtmf
     let is_multilevel_ivr = req.body.ivr.multilevel_ivr;  // feedback call multilevel_ivr
     
     if (isfeedbackCall === true) {
        isfeedbackCall = '1';
     } else {
        isfeedbackCall = '0';
     }
     if (is_selection_dtmf === true) {
        is_selection_dtmf = '1';
     } else {
        is_selection_dtmf = '0';
     }
     if (is_direct_ext_dial === true) {
        is_direct_ext_dial = '1';
     } else {
        is_direct_ext_dial = '0';
     }
     if (is_multilevel_ivr === true) {
        is_multilevel_ivr = '1';
     } else {
        is_multilevel_ivr = '0';
     }
 
    knex.raw("Call pbx_saveBasicIVR(" + req.body.ivr.id + ","+  isfeedbackCall  + "," + is_selection_dtmf  + "," +  is_direct_ext_dial + "," +  is_multilevel_ivr + "," + req.body.ivr.customer_id+",'" + req.body.ivr.name + "',null,null,\
   null, " + req.body.ivr.welcome_prompt +"," + req.body.ivr.repeat_prompt +"," + req.body.ivr.invalid_prompt +"," + req.body.ivr.timeout_prompt + "," + req.body.ivr.inter_digit_timeout + "," + req.body.ivr.digit_timeout + "," + req.body.ivr.max_timeout_try + ",\
    " + req.body.ivr.max_invalid_try + ",null,'en','0',null, null,null,'1','1','" + req.body.arr_val + "')")
        .then((response) => {
            input = {
                Name: req.body.ivr.name,
                "Welcome Prompt": req.body.ivr.welcome_name,
                "Prompt": req.body.ivr.repeat_name,
                "Invalid Prompt": req.body.ivr.invalid_name,
                "Timeout Prompt": req.body.ivr.timeout_name,
                "Digits Timeout(Sec)": req.body.ivr.digit_timeout,
                "Intermediate Digits Timeout(Sec)": req.body.ivr.inter_digit_timeout,
                "Max Timeout Try": req.body.ivr.max_timeout_try,
                "Max Invalid Try": req.body.ivr.max_invalid_try,                
            }
            if(req.body.ivr.directExtenDial){
                input["Direct Exten Dial"]= "1t";
            }
            if(req.body.ivr.multilevel_ivr){
                input["Multilevel IVR"]= "1t";
            }
            let i=0;
            while(req.body.ivr.hasOwnProperty(`action${i}`)){
                if(req.body.ivr[`action${i}`] != 0){
                    input[`Digit${i}`] = i;
                    input[`Feature${i}`] = req.body.ivr[`action${i}`] == 5 ? "Call Group" : req.body.ivr[`action${i}`] == 3 ? "Conference" : req.body.ivr[`action${i}`] == 8 ? "Enterprise PSTN" : req.body.ivr[`action${i}`] == 9 ? "Custom PSTN" : req.body.ivr[`action${i}`] == 7 ? "Hangup" : req.body.ivr[`action${i}`] == 2 ? "IVR" : req.body.ivr[`action${i}`] == 11 ? "Prompt" : req.body.ivr[`action${i}`] == 12 ? "Playback call" : req.body.ivr[`action${i}`] == 4 ? "Queue" : req.body.ivr[`action${i}`] == 10 ? "Repeat" : req.body.ivr[`action${i}`] == 1 ? "SIP" : req.body.ivr[`action${i}`] == 14 ? "Back to Main Ivr" : "Voicemail";
                    input[`Value${i}`] = req.body.ivr[`action${i}`] == 9 ? req.body.ivr[`country_code${i}`] + req.body.ivr[`value${i}_Number`] : req.body.ivr[`value_name${i}`];
                }
                i++;
            }
            
            createModuleLog(table.tbl_pbx_audit_logs,{
                module_action_id: req.body.ivr.id ? req.body.ivr.id : response[0][0][0]['cntVal'],
                module_action_name: req.body.ivr.name,
                module_name: "ivr",
                message: req.body.ivr.id ? "Ivr Updated" : "Ivr Created",
                customer_id: req.body.ivr.customer_id,
                features: "" + JSON.stringify(input) + ""
            })
            

            console.log(input,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

            if (response) {                
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function viewBasicIVR(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;
    knex.raw("Call pbx_get_basicIVR(" + req.body.id + "," + req.body.name + ","+ req.body.customer_id+")")
        .then((response) => {            
            if (response) {
                let ivrData = [] = response[0][0];
                if(ivrData.length == 1 && ivrData[0].feedback_call == '1' && ivrData[0].is_selection_dtmf == '0' ){
                  let obj = response[0][0][0];
                  obj['dtmf'] = [];
                  res.send({ response: obj });
                }else{
                    let dtmfList = [];
                    let ivrObj = {};
                    let ivrBasicInfo = ivrData[0];
                    ivrObj['id'] = ivrBasicInfo.id;
                    ivrObj['name'] = ivrBasicInfo.name;
                    ivrObj['welcome_prompt'] = ivrBasicInfo.welcome_prompt;
                    ivrObj['invalid_sound'] = ivrBasicInfo.invalid_sound;
                    ivrObj['timeout_prompt'] = ivrBasicInfo.timeout_prompt;
                    ivrObj['repeat_prompt'] = ivrBasicInfo.repeat_prompt;
                    ivrObj['is_direct_ext_dial'] = ivrBasicInfo.is_direct_ext_dial;
                    ivrObj['is_multilevel_ivr'] = ivrBasicInfo.is_multilevel_ivr;
                    ivrObj['timeout'] = ivrBasicInfo.timeout;
                    ivrObj['digit_timeout'] = ivrBasicInfo.digit_timeout;
                    ivrObj['max_timeout'] = ivrBasicInfo.max_timeout;
                    ivrObj['invalid_count'] = ivrBasicInfo.invalid_count;
                    ivrObj['feedback_call'] = ivrBasicInfo.feedback_call;
                    ivrObj['is_selection_dtmf'] = ivrBasicInfo.is_selection_dtmf;

                    ivrData.forEach(element => {
                        let obj = {};
                        obj['ivr_digit'] = element.ivr_digit;
                        obj['ivr_action'] = element.ivr_action;
                        obj['ivr_action_desc'] = element.ivr_action_desc;
                        obj['ivr_param'] = element.ivr_param;
                        obj['country_id'] = element.country_id;
                        obj['phoneNumber'] = element.phoneNumber;
                        obj['country_code'] = element.country_code;
                        dtmfList.push(obj)
                    });
                    ivrObj['dtmf'] = dtmfList;
                    res.send({ response: ivrObj });
                }
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}


function getBasicIVRByFilters(req, res) {
    let data = req.body.filters;
    var flags = "";
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_ivr_category = data.by_ivr_category ? data.by_ivr_category : null;
   let sql = knex.raw("Call pbx_getBasicIVRByFilter(" + data.by_name + ","+ data.user_id+ "," + data.by_ivr_category + ")")
   sql.then(async (response) => {
            if (response) {
                let Map = response ? response[0] : null;            
                await Map[0].map((data) =>{
                    let sql1 = knex.select('*').from(table.tbl_Pbx_Ivr_Master + ' as ivr')
                    .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_Action', 'ivr.id')
                    .where('ivrd.ivr_id',data.id);
                sql1.then((responses)=>{                      
                    if(responses.length){                        
                        flags = 0;  
                        Object.assign(data,{flag: 1 });                    
                    }
                    else{
                        let sql2 = knex.select(knex.raw('*')).from(table.tbl_pbx_ivr_detail + ' as ivrd')
                        .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'ivr.id', 'ivrd.ivr_id')
                        .where('ivrd.ivr_param', 'Like', '%ivr_%')
                        .andWhere('ivrd.ivr_Action', data.id)
                        sql2.then((response2)=>{                                
                            if(response2.length){
                                flags = 1;
                                Object.assign(data,{flag: 1});                    
                            }
                        })
                    }
                })                                    


                })
                setTimeout(() => {
                    if(flags == 0 || flags == 1){
                        res.json({
                            response: Map[0]
                        })
                    }else{
                        res.json({
                            response
                        })
                    }
                }, 1000);  
                // res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function deleteBasicIVR(req, res) {
    knex.raw("Call pbx_delete_basicIVR(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function getIVRMaster(req, res) {
    var flags = "";
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;

    knex.raw("Call pbx_get_IVRMaster(" + req.body.id + "," + req.body.name + ","+ req.body.customer_id+")")
        .then(async(response) => {            
            if (response[0][0] != undefined) {                
                let Map = response ? response[0] : null;            
                await Map[0].map((data) =>{                    
                    let sql1 = knex.select('*').from(table.tbl_Pbx_Ivr_Master + ' as ivr')
                    .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_Action', 'ivr.id')
                    .where('ivrd.ivr_id',data.id);
                sql1.then((responses)=>{                      
                    if(responses.length){                        
                        flags = 0;  
                        Object.assign(data,{flag: 1 });                    
                    }
                    else{
                        let sql2 = knex.select(knex.raw('*')).from(table.tbl_pbx_ivr_detail + ' as ivrd')
                        .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'ivr.id', 'ivrd.ivr_id')
                        .where('ivrd.ivr_param', 'Like', '%ivr_%')
                        .andWhere('ivrd.ivr_Action', data.id)
                        sql2.then((response2)=>{                                
                            if(response2.length){
                                flags = 1;
                                Object.assign(data,{flag: 1});                    
                            }
                        })
                    }
                })                                    


                })
                setTimeout(() => {
                    if(flags == 0 || flags == 1){
                        res.json({
                            response: Map[0]
                        })
                    }else{
                        res.json({
                            response
                        })
                    }
                }, 1000);  
                // setTimeout(() => {  
                //     res.send({ response: Map[0] });
                // }, 500);  
            }else{                    
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {            
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getIVRCount(req, res) {
    let ivr_id = req.query.ivr_id;
   // let conf_feature_type = '13';
    let conf_feature_type = '2';
    knex.raw("Call pbx_get_feature_mapping(" + ivr_id + ",'" + conf_feature_type + "')")
    .then((response) => {
        if (response) {
            res.send(response[0][0][0]);
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });
    // var ivr_id = req.query.ivr_id;
    // let customer_id = req.query.cId;
    //     var countQuery = knex.select(knex.raw('COUNT(dd.customer_id) as ivr_count'))
    //         .from(table.tbl_DID_Destination + ' as dd')
    //         .where('dd.destination_id', ivr_id)
    //         .andWhere('dd.customer_id',customer_id);
   
    // countQuery.then((response) => {
    //     if (response) {
    //         res.json({
    //             response
    //         });
    //     } else {
    //         res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
    //     }
    // }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAllAssociateIVR(req, res) {
    var ivrId = parseInt(req.query.id);
    var isParentIVR = req.query.is_parentIVR;
    if (isParentIVR  == 'true') {
        let sql = knex.select(knex.raw('distinct(ivr.name)')).from(table.tbl_Pbx_Ivr_Master + ' as ivr')
            .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_Action', 'ivr.id')
            .where('ivrd.ivr_id', ivrId)
            .orderBy('ivr.name', 'asc');
        sql.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }

        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else {
        let sql = knex.select(knex.raw('distinct(ivr.name)')).from(table.tbl_pbx_ivr_detail + ' as ivrd')
            .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'ivr.id', 'ivrd.ivr_id')
            .where('ivrd.ivr_param', 'Like', '%ivr_%')
            .andWhere('ivrd.ivr_Action', ivrId)
            .orderBy('ivr.name', 'asc');
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
}


module.exports = { createIVR, getIVRAction, createBasicIVR, viewBasicIVR, getBasicIVRByFilters, deleteBasicIVR, getIVRMaster, getIVRCount,
                    getAllAssociateIVR};