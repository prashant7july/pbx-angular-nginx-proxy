const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require('../helper/modulelogger');
/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/
function createCallQueue(req, res) {   
    let max_waiting_call = '';
    req.body.callqueue.max_waiting_call = req.body.callqueue.max_waiting_call ? "" + req.body.callqueue.max_waiting_call + "" : 0;
    // if (req.body.callqueue.max_waiting_call == '' || req.body.callqueue.max_waiting_call == '0' || req.body.callqueue.max_waiting_call == 0) {
    //     max_waiting_call = '0';
    // } else if (req.body.callqueue.max_waiting_call != '') {
    //     max_waiting_call = req.body.callqueue.max_waiting_call;
    // }

    let recording = '';
    if (!req.body.callqueue.recording || req.body.callqueue.recording == '0' || req.body.callqueue.recording == false || req.body.callqueue.recording == '') {
        recording = '0';
    } else if (req.body.callqueue.recording == '1' || req.body.callqueue.recording == true || req.body.callqueue.recording != '') {
        recording = '1';
    }

    // let welcome_prompt = '';
    // if (!req.body.callqueue.welcome_prompt || req.body.callqueue.welcome_prompt == '') {
    //     welcome_prompt = '0';
    // } else if (req.body.callqueue.welcome_prompt != '') {
    //     welcome_prompt = req.body.callqueue.welcome_prompt;
    // }

    let moh = '';
    if (!req.body.callqueue.moh || req.body.callqueue.moh == '') {
        moh = '0';
    } else if (req.body.callqueue.moh != '') {
        moh = req.body.callqueue.moh;
    }

    let ring_strategy = '';
    if (!req.body.callqueue.ring_strategy || req.body.callqueue.ring_strategy == '') {
        ring_strategy = '0';
    } else if (req.body.callqueue.ring_strategy != '') {
        ring_strategy = req.body.callqueue.ring_strategy;
    }

    // let periodic_announcement_prompt = '';
    // if (!req.body.callqueue.periodic_announcement_prompt || req.body.callqueue.periodic_announcement_prompt == '') {
    //     periodic_announcement_prompt = '0';
    // } else if (req.body.callqueue.periodic_announcement_prompt != '') {
    //     periodic_announcement_prompt = req.body.callqueue.periodic_announcement_prompt;
    // }

    let periodic_announcement = '';
    if (!req.body.callqueue.periodic_announcement || req.body.callqueue.periodic_announcement == '0' || req.body.callqueue.periodic_announcement == false || req.body.callqueue.periodic_announcement == '') {
        periodic_announcement = '0';
    } else if (req.body.callqueue.periodic_announcement == '1' || req.body.callqueue.periodic_announcement == true || req.body.callqueue.periodic_announcement != '') {
        periodic_announcement = '1';
    }

    let periodic_announcement_time = '';
    if (!req.body.callqueue.periodic_announcement || req.body.callqueue.periodic_announcement == '0' || req.body.callqueue.periodic_announcement == false || req.body.callqueue.periodic_announcement == '') {
        periodic_announcement_time = '0'
    } else if (req.body.callqueue.periodic_announcement == '1' || req.body.callqueue.periodic_announcement == true || req.body.callqueue.periodic_announcement != '') {
        periodic_announcement_time = req.body.callqueue.periodic_announcement_time ?  req.body.callqueue.periodic_announcement_time : "1";
    }

    let play_position_on_call = '';
    if (!req.body.callqueue.play_position_on_call || req.body.callqueue.play_position_on_call == '0' || req.body.callqueue.play_position_on_call == false || req.body.callqueue.play_position_on_call == '') {
        play_position_on_call = '0';
    } else if (req.body.callqueue.play_position_on_call == '1' || req.body.callqueue.play_position_on_call == true || req.body.callqueue.play_position_on_call != '') {
        play_position_on_call = '1';
    }

    let play_position_periodically = '0';
    if (!req.body.callqueue.play_position_periodically || req.body.callqueue.play_position_periodically == '0' || req.body.callqueue.play_position_periodically == false || req.body.callqueue.play_position_periodically == '') {
        play_position_periodically = '0';
    } else if ((req.body.callqueue.play_position_periodically == '1' || req.body.callqueue.play_position_periodically == true || req.body.callqueue.play_position_periodically != '')
        && (req.body.callqueue.play_position_on_call == '1' || req.body.callqueue.play_position_on_call == true || req.body.callqueue.play_position_on_call != '')) {
        play_position_periodically = '1';
    }

    let feedback_call = '';
    if (!req.body.callqueue.feedback_call || req.body.callqueue.feedback_call == '0' || req.body.callqueue.feedback_call == false || req.body.callqueue.feedback_call == '') {
        feedback_call = '0';
    } else if (req.body.callqueue.feedback_call == '1' || req.body.callqueue.feedback_call == true || req.body.callqueue.feedback_call != '') {
        feedback_call = '1';
    }

    let feedback_ivr = '';
    if (!req.body.callqueue.feedback_ivr || req.body.callqueue.feedback_ivr == '') {
        feedback_ivr = '0';
    } else if (req.body.callqueue.feedback_ivr != '') {
        feedback_ivr = req.body.callqueue.feedback_ivr;
    }

    let sticky_agent = '';
    if (!req.body.callqueue.sticky_agent || req.body.callqueue.sticky_agent == '0' || req.body.callqueue.sticky_agent == false || req.body.callqueue.sticky_agent == '') {
        sticky_agent = '0';
    } else if (req.body.callqueue.sticky_agent == '1' || req.body.callqueue.sticky_agent == true || req.body.callqueue.sticky_agent != '') {
        sticky_agent = '1';
    }
    
    let sticky_agent_type = '';
    if (!req.body.callqueue.sticky_agent_type || req.body.callqueue.sticky_agent_type == '') {
        sticky_agent_type = null;
    } else if (req.body.callqueue.sticky_agent_type != '') {
        sticky_agent_type = req.body.callqueue.sticky_agent_type;
    }

    let sms = '';
    if (!req.body.callqueue.sms || req.body.callqueue.sms == '0' || req.body.callqueue.sms == false || req.body.callqueue.sms == '') {
        sms = '0';
    } else if (req.body.callqueue.sms == '1' || req.body.callqueue.sms == true || req.body.callqueue.sms != '') {
        sms = '1';
    }
 
    let unauthorized_fail = '';
    if (!req.body.callqueue.unauthorized_fail || req.body.callqueue.unauthorized_fail == '0' || req.body.callqueue.unauthorized_fail == false || req.body.callqueue.unauthorized_fail == '') {
        unauthorized_fail = '0';
    } else if (req.body.callqueue.unauthorized_fail == '1' || req.body.callqueue.unauthorized_fail == true || req.body.callqueue.unauthorized_fail != '') {
        unauthorized_fail = '1';
    }

    req.body.callqueue.active_feature_value = req.body.callqueue.active_feature_value ? req.body.callqueue.active_feature_value : 0 ;
    req.body.callqueue.sticky_expire = req.body.callqueue.sticky_expire ? req.body.callqueue.sticky_expire : 0;

    console.log(knex.raw("Call pbx_save_callqueue(" + req.body.callqueue.id + ",'" + req.body.callqueue.name + "'," + req.body.callqueue.max_waiting_call + "," + req.body.callqueue.welcome_prompt + ",\
    " + moh + ",'" + recording + "','" + req.body.callqueue.agent + "','" + ring_strategy + "','" + periodic_announcement + "',\
    '" + periodic_announcement_time + "'," + req.body.callqueue.periodic_announcement_prompt + ",'" + play_position_on_call + "','" + play_position_periodically + "','1'," + req.body.callqueue.customer_id 
    + "," + feedback_call + "," + feedback_ivr + "," + sticky_agent + "," + sticky_agent_type  +  "," + sms + "," + unauthorized_fail + ",'" + req.body.callqueue.active_feature + "'," + req.body.callqueue.active_feature_value +",'"+req.body.callqueue.sticky_expire+"')"))

    let query = knex.raw("Call pbx_save_callqueue(" + req.body.callqueue.id + ",'" + req.body.callqueue.name + "'," + req.body.callqueue.max_waiting_call + "," + req.body.callqueue.welcome_prompt + ",\
     " + moh + ",'" + recording + "','" + req.body.callqueue.agent + "','" + ring_strategy + "','" + periodic_announcement + "',\
     '" + periodic_announcement_time + "'," + req.body.callqueue.periodic_announcement_prompt + ",'" + play_position_on_call + "','" + play_position_periodically + "','1'," + req.body.callqueue.customer_id 
     + "," + feedback_call + "," + feedback_ivr + "," + sticky_agent + "," + sticky_agent_type  +  "," + sms +  "," + unauthorized_fail + ",'" + req.body.callqueue.active_feature + "'," + req.body.callqueue.active_feature_value +",'"+req.body.callqueue.sticky_expire+"')")
    // const query = knex.raw(
    //     'CALL pbx_save_callqueue(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)',
    //     [
    //       req.body.callqueue.id,
    //       req.body.callqueue.name,
    //       req.body.callqueue.max_waiting_call,
    //       req.body.callqueue.welcome_prompt,
    //       moh, // Assuming moh is already defined elsewhere
    //       recording,
    //       req.body.callqueue.agent,
    //       ring_strategy,
    //       periodic_announcement,
    //       periodic_announcement_time,
    //       req.body.callqueue.periodic_announcement_prompt,
    //       play_position_on_call,
    //       play_position_periodically,
    //       '1', // Assuming '1' is a constant value for 'active' or similar
    //       req.body.callqueue.customer_id,
    //       feedback_call,
    //       feedback_ivr,
    //       sticky_agent,
    //       sticky_agent_type,
    //       sms,
    //       unauthorized_fail,
    //       req.body.callqueue.active_feature,
    //       req.body.callqueue.active_feature_value,
    //       req.body.callqueue.sticky_expire
    //     ]
    //   );
        query.then((response) => {            
            if (response) {
                let input = {
                    Name: req.body.callqueue.name,                    
                }

                if(req.body.callqueue.welcome_prompt_name != ""){
                    input["Welcome Prompt"] = req.body.callqueue.welcome_prompt_name;
                }
                if(req.body.callqueue.moh_name != ""){
                    input["MOH"] = req.body.callqueue.moh_name;
                }       

                input["Ring Strategy"] = ring_strategy == 0 ? "Ring All" : ring_strategy == 1 ? "Round Robin" : ring_strategy == 2 ? "Random" : ring_strategy == 3 ? "Longest Ideal Agent" : ring_strategy == 4 ? "Top-Down" : ring_strategy == 5 ? "Ring Progress" : "Sequentially By Agent Order"                
                if(req.body.callqueue.recording){
                    input["Recording"] = "1t"
                }
                if(req.body.callqueue.feedback_call){
                    input["FeedBack Call"] = "1t"
                    input["FeedBack IVR"] = req.body.callqueue.feedback_name;
                }
                if(req.body.callqueue.sticky_agent){
                    input["Sticky Agent"] = "1t";                    
                }
                input["Expiry Date"] = req.body.callqueue.sticky_expire;
                if(req.body.callqueue.sticky_agent && sticky_agent_type == 1){
                    input["Basic"] = "1t";
                }
                if(req.body.callqueue.sticky_agent && sticky_agent_type == 2){
                    input["Advance"] = "1t";
                }
                if(req.body.callqueue.sms){
                    input["SMS"] = "1t"
                }
                input["Agent"] = req.body.callqueue.agent;
                         
                
                createModuleLog(table.tbl_pbx_audit_logs,{
                    module_action_id: req.body.callqueue.id ? req.body.callqueue.id : response[0][0][0]['q_id'],
                    module_action_name: req.body.callqueue.name,
                    module_name: "call queue",
                    customer_id: req.body.callqueue.customer_id,
                    message: req.body.callqueue.id ? "Call Queue Updated" : "Call Queue Created",
                    features: "" + JSON.stringify(input) + ""
                })
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function viewCallqueue(req, res) {
    console.log(req.body,'----------viewcallquque');
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;

//   let sql =  knex.raw("Call pbx_get_callqueue(" + req.body.id + "," + req.body.name + "," + req.body.customer_id + ")")
  let sql = knex.raw('CALL pbx_get_callqueue(?, ?, ?)', [req.body.id, req.body.name, req.body.customer_id]);
  console.log(sql.toQuery(),'-----------vierw');
        sql.then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function deleteCallQueue(req, res) {
    knex.raw("Call pbx_delete_callqueue(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}



function getCallQueueByFilters(req, res) {
    let data = req.body.filters;
    console.log(req.body,'-----filter');
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_feedback_call = data.by_feedback_call ? ("'" + data.by_feedback_call + "'") : null;

    knex.raw("Call pbx_getCallQueueByFilters(" + req.body.id + "," + data.by_name + "," + data.by_feedback_call + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getTotalQueue(req, res) {
    let customerId = parseInt(req.query.customerId);
    knex(table.tbl_PBX_queue).count('id as count').where('status', '=', "1").andWhere('customer_id', '=', "" + customerId + "")
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCallQueueCount(req, res) {
    var call_queue_id = req.query.callQueue_id;
        var countQuery = knex.select(knex.raw('COUNT(dd.customer_id) as callQueue_count'))
            .from(table.tbl_DID_Destination + ' as dd')
            .where('dd.destination_id', call_queue_id).unionAll([
            knex.count('active_feature_value as callQueue_count').from(table.tbl_PBX_CALLGROUP)
            .where('active_feature_value',call_queue_id).andWhere('active_feature','4')]);    
    
    countQuery.then((response) => {        
        let count = response[0]['callQueue_count'] + response[1]['callQueue_count']
        if (response) {
            res.json({
                response : count
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getfeedbackIVR(req, res) {
    var customer_id = req.body.customer_id ? req.body.customer_id : null;
    var sql = knex.select('*')
        .from(table.tbl_Pbx_Ivr_Master + ' as im')
        .where('im.customer_id', customer_id)
        .andWhere('im.feedback_call', '=', '1')

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

module.exports = {
    createCallQueue, viewCallqueue, deleteCallQueue, getCallQueueByFilters,getTotalQueue, getCallQueueCount, getfeedbackIVR
};