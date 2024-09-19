const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require('../helper/modulelogger');

function saveCallGroup(req, res) {
    let request = req.body;  
    request.id = req.body.id ? req.body.id : null;
    request.recording = (request.recording == true) ? '1' : '0';
    request.moh = (request.moh) ? request.moh : '0';
    request.sticky_agent = (request.sticky_agent == true) ? '1' : '0';
    request.prompt = request.prompt  ? request.prompt : 0;
    request.sticky_expire = request.sticky_expire ? request.sticky_expire : 0;
    request.active_feature_value = request.active_feature_value ? request.active_feature_value : 0;
    let unauthorized_fail = '';
    if (!request.unauthorized_fail || request.unauthorized_fail == '0' || request.unauthorized_fail == false || request.unauthorized_fail == '') {
        unauthorized_fail = '0';
    } else if (request.unauthorized_fail == '1' || request.unauthorized_fail == true || request.unauthorized_fail != '') {
        unauthorized_fail = '1';
    }
    input = {
        "Group Name": req.body.groupName
    }
    if(req.body.prompt_name != ""){
        input['Welcome Prompt'] = req.body.prompt_name;
    }

    input['Group Type'] = req.body.groupType == 1 ? 'Ring Group' : "Hunt Group";
    input['Group Exten'] = req.body.extNo;
    input['Ring Timeout'] = req.body.ringTimeout;
    if(req.body.recording){
        input['Recording'] = "1t";
    }
    if(req.body.sticky_agent){
        input['Sticky Agnet'] = "1t";
        input['Expiry Date'] = req.body.sticky_expire;
    }
    if(req.body.unauthorized_fail){
        input['Unauthorized Fail Over'] = "1t";
        input["Feature"] = req.body.feature_name;
        input['Value'] = req.body.feature_value;
    }
    input['Group SIP Ext'] = req.body.sipExt;    

    console.log(knex.raw("Call pbx_save_callgroup(" + request.id + ",'" + request.groupName + "'," + request.groupType + "," + request.extNo + ",'" + request.recording + "'," + request.ringTimeout + "," + request.moh + ",'" + request.sipExt + "'," + request.customer_id + ",'" + request.sticky_agent + "'," +  request.prompt + ",'" +  unauthorized_fail + "','" + request.active_feature + "','" + request.active_feature_value + "','"+request.sticky_expire+"')").toString());
    // knex.raw("Call pbx_save_callgroup(" + request.id + ",'" + request.groupName + "'," + request.groupType + "," + request.extNo + ",'" + request.recording + "'," + request.ringTimeout + "," + request.moh + ",'" + request.sipExt + "'," + request.customer_id + ",'" + request.sticky_agent + "'," +  request.prompt + ",'" +  unauthorized_fail + "','" + request.active_feature + "','" + request.active_feature_value + "','"+request.sticky_expire+"')")
    const query = knex.raw(
        'CALL pbx_save_callgroup(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          request.id,
          request.groupName,
          request.groupType,
          request.extNo,
          request.recording,
          request.ringTimeout,
          request.moh,
          request.sipExt,
          request.customer_id,
          request.sticky_agent,
          request.prompt,
          unauthorized_fail,
          request.active_feature,
          request.active_feature_value,
          request.sticky_expire
        ]
      );
    query.then((response) => {
        if (response) {
            createModuleLog(table.tbl_pbx_audit_logs, {
                module_action_id: request.id ? request.id : response[0][0][0]['cg_id'],
                module_action_name: request.groupName,
                module_name: "call group",
                message: request.id ? "Call Group Updated": "Call Group Created",
                customer_id: request.customer_id,
                features: "" + JSON.stringify(input) + ""                
            })
            res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function getCallgroup(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;
    // knex.raw("Call pbx_get_callgroup(" + req.body.id + "," + req.body.name + "," + req.body.customer_id + ")")
    const query = knex.raw(
        'CALL pbx_get_callgroup(?, ?, ?)',
        [
          req.body.id,
          req.body.name,
          req.body.customer_id
        ]
      );
        query.then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function deleteCallgroup(req, res) {
    knex.raw("Call pbx_delete_callgroup(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}
function getCallgroupByFilters(req, res) {

    let data = req.body.filters;
    data.name = data.name ? ("" + data.name + "") : null;
    data.group_type = data.group_type ? data.group_type : null;
    data.group_ext = data.group_ext ? data.group_ext : null;
    
    // knex.raw("Call pbx_getCallgroupByFilters(" + req.body.customer_id + "," + data.name + "," + data.group_type + ","+data.group_ext+")")
    const query = knex.raw(
        'CALL pbx_getCallgroupByFilters(?, ?, ?, ?)',
        [
          req.body.customer_id,
          data.name,
          data.group_type,
          data.group_ext
        ]
      );
    query.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getExten(req, res){    
    knex.raw("Call pbx_duplicateExtern(" + req.body.extenid + "," + req.body.customer_id + ")")
    .then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

// function getCallGroupCount(req, res) {
//     var call_group_id = Number(req.query.callGroup_id);

//     var countQuery =  knex.count('ivr_action as callGroup_count').from(table.tbl_pbx_ivr_detail).where('ivr_action', call_group_id).andWhere('ivr_action_desc','5').unionAll([
//         knex.count('destination_id as callGroup_count').from(table.tbl_DID_Destination).where('destination_id', call_group_id).andWhere('active_feature_id','5'),
//         knex.count('active_feature_value as callGroup_count').from(table.tbl_PBX_CALLGROUP).where('active_feature_value', call_group_id).andWhere('active_feature','5')
//     ])
//         // var countQuery = knex.select(knex.raw('COUNT(dd.customer_id) as callGroup_count'))
//         //     .from(table.tbl_DID_Destination + ' as dd')
//         //     .where('dd.destination_id', call_group_id);   
//     countQuery.then((response) => {
//         let count = response[0]['callGroup_count'] + response[1]['callGroup_count'] + response[2]['callGroup_count'];   
//         if (response) {
//             res.json({
//                 callGroup_count : count
//             });
//         } else {
//             res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
//         }
//     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
// }


function getCallGroupCount(req, res) {
    var call_group_id = Number(req.query.callGroup_id);
    var countQuery = knex.count('ivr_action as callGroup_count').from(table.tbl_pbx_ivr_detail)
        .where('ivr_action', call_group_id)
        .andWhere('ivr_action_desc', '5')
        .unionAll([
            knex.count('destination_id as callGroup_count').from(table.tbl_DID_Destination)
                .where('destination_id', call_group_id)
                .andWhere('active_feature_id', '5'),
            knex.count('active_feature_value as callGroup_count').from(table.tbl_PBX_CALLGROUP)
                .where('active_feature_value', call_group_id)
                .andWhere('active_feature', '5')
        ]);
    // New query to get details from pbx_speed_dial table
    var speedDialQuery = knex.select('*').from(table.tbl_Speed_Dial).where('number', call_group_id);
    // Executing both queries
    Promise.all([countQuery, speedDialQuery])
        .then((responses) => {
            let count = responses[0][0]['callGroup_count'] + responses[0][1]['callGroup_count'] + responses[0][2]['callGroup_count'];
            let speedDialData = responses[1]; // Data from the speed dial query
            if (responses) {
                res.json({
                    callGroup_count: count,
                    speedDialData: speedDialData // Include this data in the response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'No data found' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            throw err;
        });
}

module.exports = { saveCallGroup, getCallgroup, deleteCallgroup,getCallgroupByFilters, getExten, getCallGroupCount }