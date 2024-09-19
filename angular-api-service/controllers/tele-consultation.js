const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
var contacts = require('./contactList');
let pushEmail = require('./pushEmail');
const { response } = require('express');
function viewAllSMS(req, res) {
    var sql = knex.from(table.tbl_pbx_SMS)
        .select('*');
    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
}

async function addTCPackage(req, res) {    
    let data = req.body;  
    let cp_id = [];
    try {
        const getID = await knex.distinct('r.id')
          .from(table.tbl_Call_Plan_Rate + ' as r')
          .join(table.tbl_Call_Plan + ' as c', 'c.plan_type', 'r.plan_type')
          .where('r.customer_id', data.customerId)
          .andWhere('r.phonecode', data.country)
          .andWhere('c.plan_type', '4');
      
        cp_id.push(getID[0].id);
      } catch (error) {
        console.error(error);
      }
    
    let create_date = data.by_date[0].split('T')[0];
    let expiry_date = data.by_date[1].split('T')[0];        
    let tc_minute = [];
    let mapped = '';
    if(data.contact){
        mapped = '1';
    }else{
        mapped = '0';
    }
    // let date = new Date();
    // let fullDate = `${date.getDate()}-${(date.getMonth()+2)}-${date.getFullYear()}`;
    // if (date.getMonth() == 11) {
    //     var expiry = `${date.getFullYear() + 1}-${(date.getMonth()+2)}-${date.getDate()}`;
    // } else {
    //     var expiry = `${date.getFullYear()}-${(date.getMonth()+2)}-${date.getDate()}`;
    // }
    let sql = knex(table.tbl_pbx_tc_plan).insert({ name: "" + data.name + "", price: "" + data.price, description: "" + data.description, customer_id: "" + data.customerId, destination: "" + data.country + "", mapped: "" + mapped + "", created_at: "" + create_date + "", expiry_date: ""+ expiry_date +"", minutes: "" + data.minutes + "" });    
    // return;
    sql.then((response) => {        
        if (response) {
            let sqls = knex(table.tbl_pbx_min_tc_mapping).select(knex.raw('sum(assign_minutes) as minutes'), 'total_minutes').where('destination', data.country).andWhere('customer_id', data.customerId);
            sqls.then((responses) => {                
                let minute = responses[0].minutes == null ? parseInt(Number(data.total_minutes) / Number(data.minutes)) : parseInt(Number(data.total_minutes) - responses[0]['minutes']) / Number(data.minutes);
                if(data.contact){
                data.contact.map(contact_id => {
                    if (minute != 0) {
                        minute--;
                        tc_minute.push({ total_minutes: cp_id, tc_plan_id: response[0], destination: data.country, contact_id: contact_id, assign_minutes: data.minutes, customer_id: data.customerId, plan_type: "4", created_at: "" + create_date + "", expiry_date: ""+ expiry_date +"" });
                    }
                })
            }
                let sql1 = knex(table.tbl_pbx_min_tc_mapping).insert(tc_minute);
                sql1.then((response1) => {                     
                    if(response1 && data.email_notification == '1'){    
                        data.contact.map(item => {
                            knex(table.tbl_Contact_list).where('id',item).select('*').then((resp) => {                                
                                let newdata = {      
                                    pkg_name: data.name,                          
                                    tc_pkg_price: data.price,
                                    minutes: data.minutes,
                                    tc_pkg_expiry: expiry_date,
                                    email: resp[0]['email']
                                }                            
                                // pushEmail.getEmailContentUsingCategory('TcPackageAssign').then(val => { 
                                //     pushEmail.sendmail({ data: newdata, val: val, username: resp[0]['name'] }).then((data1) => {
                                //     });
                                // });
                            })                            
                        })
                       
                    }
                    res.send({
                        response: response,
                        message: 'TC Package create successfully',
                        code: 200
                    });
                }).catch((err) => {
                    console.log(err);
                    res.status(200).send({
                        code: err.errno,
                        error: 'error', message: 'DB Error: ' + err.message
                    }); throw err
                });
            })
        }
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });
}

function addContact(req,res){
    let data = req.body;  
    let tc_minute = [];
            let sqls = knex(table.tbl_pbx_min_tc_mapping).select(knex.raw('sum(assign_minutes) as minutes'), 'total_minutes').where('destination', data.destination).andWhere('customer_id', data.customerId);
            sqls.then((responses) => {                
                let minute = responses[0].minutes == null ? parseInt(Number(data.total_minutes) / Number(data.minutes)) : parseInt(Number(data.total_minutes) - responses[0]['minutes']) / Number(data.minutes);
                if(data.contact){
                data.contact.map(contact_id => {
                    if (minute != 0) {
                        minute--;
                        tc_minute.push({ total_minutes: data.total_minutes, tc_plan_id: data.id, destination: data.destination, contact_id: contact_id, assign_minutes: data.minutes, customer_id: data.customerId, plan_type: "4",created_at: data.create_date, expiry_date : data.expiry_date});
                    }
                })
            }
                let sql = knex(table.tbl_pbx_min_tc_mapping).insert(tc_minute);
                sql.then((response) => {   
                    knex(table.tbl_pbx_tc_plan).where('id', data.id).update({ mapped: '1' })
                    .then((rep) =>{
                        res.send({
                            response: response,
                            message: 'Contact added successfully',
                            code: 200
                        });
                    })
                   
                }).catch((err) => {                    
                    res.status(200).send({
                        code: err.errno,
                        error: 'error', message: 'DB Error: ' + err.message
                    }); throw errapp-view-tc-subscriber-info
                });
            });
}
        
function viewTCPackage(req, res) {
    var body = req.body;    
    let customerId = parseInt(req.query.customer_id);
    var sql = knex.from(table.tbl_pbx_tc_plan + ' as tcp')
    sql.leftJoin(table.tbl_Country + ' as cnt', 'cnt.id', 'tcp.destination')
    sql.select('tcp.name', 'tcp.price', 'tcp.description', 'tcp.id', 'cnt.name as country', 'tcp.mapped', 'cnt.phonecode as destination', 'tcp.destination', 'tcp.minutes');
    sql.where('tcp.customer_id', '=', customerId)
    sql.orderBy('tcp.id','desc');
    if (body.assign_minute) {
        sql.andWhere('tcp.mapped', '!=', '1');
        sql.select('tcp.price', 'tcp.id', 'tcp.name');
    }
    if (body.name) {
        sql.andWhere('tcp.name', 'like', "%" + body.name + "%")
    }
    if( body.by_country && body.by_country.length){
        sql.whereIn('tcp.destination',body.by_country)
    }    
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function updateTCPackage(req, res) {
    let body = req.body;     
    let tcPackage = {}  
    if(body.by_date.length || body.by_date != ""){        
        var create_date =  body.by_date[0].split('T')[0];
        var expiry_date = body.by_date[1].split('T')[0]; 
    }

    let sql = knex(table.tbl_pbx_tc_plan)
    .where("name", "=", "" + body.name + "")
    .whereNot("id", body.id);
    sql.then((response) => {
        if (response.length == 0) {
            let sql1 = knex(table.tbl_pbx_tc_plan).where('id', '=', "" + body.id + "");
            tcPackage.name = body.name;
            tcPackage.price = body.price;
            tcPackage.destination = body.country;
            tcPackage.customer_id = body.customerId
            tcPackage.description = body.description
            tcPackage.id = body.id;
            if(body.by_date.length || body.by_date != ""){
                tcPackage.created_at = create_date;
                tcPackage.expiry_date = expiry_date
            }            
            body.customer_id = body.customerId;
            body.destination = body.country;
            delete body.country;
            delete body.id;
            delete body.customerId;
            sql1.update(tcPackage);
            sql1.then((response1) => {
                res.json({
                    response: response,
                    code: 200,
                });

            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.json({
                response: response,
                code: 201,
                message: `Plan name already exist`
            });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getMyAssignedMinutes(req, res) {
    let customerId = parseInt(req.query.customer_id);
    var sql = knex.distinct()
        .from(table.tbl_pbx_tc_plan_mapping + ' as tcplm')
        .sum('tcplm.minutes as minutes')
        .where('tcplm.customer_id', '=', customerId)
        .orderBy('tcplm.id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function assignMinuteToUser(req, res) {
    let data = req.body.minutManageForm;
    let customer_id = req.body.customerId || 0;
    let managedArray = [];
    let destinationIds = [];
    let allRecord = 0;
    for (let i = 0; i < data.length; i++) {
        destinationIds.push((data[i].country).replace('+', ''))
        for (let j = 0; j < (data[i].ext).length; j++) {
            let obj = {};
            obj['country'] = data[i].country;
            obj['contact_name'] = (data[i].ext)[j].c_name;
            obj['contact_id'] = (data[i].ext)[j].c_id;
            obj['manage_minutes'] = (data[i].ext)[j].minutes,
                obj['used_minutes'] = (data[i].ext)[j].used_minutes,
                obj['id'] = data[i].id;
            obj['type'] = data[i].type;
            managedArray.push(obj);
        }
    }
    knex(table.tbl_pbx_min_tc_mapping)
        .where('id', data[0]['id']).andWhere('tc_plan_id', req.body.name)
        .del().then(async (responses) => {
            for (let i = 0; i < managedArray.length; i++) {
                let isMinuteMappingExist;
                allRecord++;
                let destination = managedArray[i].country ? (managedArray[i].country).replace('+', '') : 0;    // JUST CONVERT +91 TO 91                            
                await knex(table.tbl_pbx_min_tc_mapping)
                    .insert({
                        id: managedArray[i].id,
                        destination: destination,
                        contact_id: managedArray[i].contact_id,
                        contact_name: managedArray[i].contact_name,
                        assign_minutes: managedArray[i].manage_minutes,
                        customer_id: customer_id,
                        tc_plan_id: Number(req.body.name),
                        plan_price: Number(req.body.price),
                        used_minute: managedArray[i].used_minutes,
                        plan_type: "" + managedArray[i].type + ""
                    }).then((response) => {
                        if (response) {
                            knex(table.tbl_pbx_tc_plan).update({ mapped: '1' })
                                .where('id', req.body.name).then((responses) => {
                                })
                        }
                    }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err });
                if (allRecord === managedArray.length) {
                    res.send({
                        message: 'Minute Adjustment Successfully!',
                        code: 200
                    });
                }
            }
        }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
}

function viewAssignUsers(req, res) {
    var data = req.body;
    let customerId = parseInt(req.query.customer_id);
    // let isFilter = Object.keys(body).length == 0 ? false : true;
    let sql = knex.from(table.tbl_pbx_min_tc_mapping + ' as tcpm')
        .leftJoin(table.tbl_pbx_tc_plan + ' as tcp', 'tcp.id', 'tcpm.tc_plan_id')
        .select(knex.raw('GROUP_CONCAT(tcpm.contact_name) as name'), 'tcpm.id');
    sql.distinct('tcp.name as plan_name');
    sql.where('tcpm.customer_id', customerId);
    if (data.name) {
        sql.andWhere('tcp.name', 'like', "%" + data.name + "%");
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });

    // var sql = knex.from(table.tbl_pbx_tc_plan_mapping + ' as tcpm')
    //     .select('tcpm.id','tcpm.tc_plan_id', 'tcpm.user_id', 'tcp.name as plan_name', 'cl.name', 'tcpm.used_minute',
    //     knex.raw('GROUP_CONCAT( distinct mtc.destination) as destination'),
    //     knex.raw('GROUP_CONCAT( distinct mtc.assign_minutes) as minutes'))
    //     .leftJoin(table.tbl_pbx_tc_plan + ' as tcp', 'tcp.id', 'tcpm.tc_plan_id')
    //     .leftJoin(table.tbl_Contact_list + ' as cl', 'cl.id', 'tcpm.user_id')
    //     .leftJoin(table.tbl_pbx_min_tc_mapping + ' as mtc', 'mtc.tc_plan_mapped_id', 'tcpm.id')
    //     .where('tcp.customer_id', '=', customerId)
    //     .groupBy('tcpm.id');
    // if (isFilter) {
    //     sql.where('tcp.name', 'like', '%' + body.name + '%')
    // }
}

function updateassignMinuteToUser(req, res) {
    let data = req.body;
    let sql = knex(table.tbl_pbx_tc_plan_mapping).where('id', '=', "" + data.id + "");
    sql.update({
        tc_plan_id: "" + data.name + "",
        user_id: "" + data.user_id,
        minutes: "" + data.assign_minute,
    });
    sql.then((response) => {
        if (response) {
            let sql2 = knex(table.tbl_pbx_min_tc_mapping).where('tc_plan_mapped_id', '=', "" + data.id + "")
            sql2.del();
            sql2.then((response2) => {
                if (response2) {
                    let managedArray = data.minutManageForm;
                    let insertedPlanId = data.id;
                    const contactsToInsert = managedArray.map(contact =>
                        ({ destination: contact['destination'], contact_id: data.user_id, tc_plan_id: data.name, assign_minutes: contact['minutes'], customer_id: data.customerId, tc_plan_mapped_id: insertedPlanId }));
                    let sql2 = knex(table.tbl_pbx_min_tc_mapping).insert(contactsToInsert);
                    sql2.then((response) => {
                        if (response) {
                            res.send({
                                response: response,
                                message: 'Assign Minutes to user update successfully',
                                code: 200
                            });
                        }
                    }).catch((err) => {
                        console.log(err);
                        res.status(200).send({
                            code: err.errno,
                            error: 'error', message: 'DB Error: ' + err.message
                        }); throw err
                    });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }
        // res.json({
        //     response: response,
        //     message: 'Assign Minutes to user update successfully',
        //     code: 200
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function addTC(req, res) {
    let data = req.body;
    console.log(data,'---------addtc');
    let max_waiting_call = '';
    req.body.max_waiting_call = req.body.max_waiting_call ? "" + req.body.max_waiting_call + "" : 0;


    let recording = '';
    if (!req.body.recording || req.body.recording == '0' || req.body.recording == false || req.body.recording == '') {
        recording = '0';
    } else if (req.body.recording == '1' || req.body.recording == true || req.body.recording != '') {
        recording = '1';
    }

    let moh = '';
    if (!req.body.moh || req.body.moh == '') {
        moh = '0';
    } else if (req.body.moh != '') {
        moh = req.body.moh;
    }

    let ring_strategy = '';
    if (!req.body.ring_strategy || req.body.ring_strategy == '') {
        ring_strategy = '0';
    } else if (req.body.ring_strategy != '') {
        ring_strategy = req.body.ring_strategy;
    }

    let periodic_announcement = '';
    if (!req.body.periodic_announcement || req.body.periodic_announcement == '0' || req.body.periodic_announcement == false || req.body.periodic_announcement == '') {
        periodic_announcement = '0';
    } else if (req.body.periodic_announcement == '1' || req.body.periodic_announcement == true || req.body.periodic_announcement != '') {
        periodic_announcement = '1';
    }

    let periodic_announcement_time = '';
    if (!req.body.periodic_announcement || req.body.periodic_announcement == '0' || req.body.periodic_announcement == false || req.body.periodic_announcement == '') {
        periodic_announcement_time = '0'
    } else if (req.body.periodic_announcement == '1' || req.body.periodic_announcement == true || req.body.periodic_announcement != '') {
        periodic_announcement_time = req.body.periodic_announcement_time ? req.body.periodic_announcement_time : "1";
    }

    let play_position_on_call = '';
    if (!req.body.play_position_on_call || req.body.play_position_on_call == '0' || req.body.play_position_on_call == false || req.body.play_position_on_call == '') {
        play_position_on_call = '0';
    } else if (req.body.play_position_on_call == '1' || req.body.play_position_on_call == true || req.body.play_position_on_call != '') {
        play_position_on_call = '1';
    }

    let play_position_periodically = '0';
    if (!req.body.play_position_periodically || req.body.play_position_periodically == '0' || req.body.play_position_periodically == false || req.body.play_position_periodically == '') {
        play_position_periodically = '0';
    } else if ((req.body.play_position_periodically == '1' || req.body.play_position_periodically == true || req.body.play_position_periodically != '')
        && (req.body.play_position_on_call == '1' || req.body.play_position_on_call == true || req.body.play_position_on_call != '')) {
        play_position_periodically = '1';
    }

    let is_extension = '0';
    if (!req.body.is_extension || req.body.is_extension == '0' || req.body.is_extension == false || req.body.is_extension == '') {
        is_extension = '0';
    } else if ((req.body.is_extension == '1' || req.body.is_extension == true || req.body.is_extension != '')
        && (req.body.is_extension == '1' || req.body.is_extension == true || req.body.is_extension != '')) {
        is_extension = '1';
    }

    let is_pstn = '';
    if (!req.body.is_pstn || req.body.is_pstn == '0' || req.body.is_pstn == false || req.body.is_pstn == '') {
        is_pstn = '0';
    } else if (req.body.is_pstn == '1' || req.body.is_pstn == true || req.body.is_pstn != '') {
        is_pstn = '1';
    }

    let unauthorized_fail = '';
    if (!req.body.unauthorized_fail || req.body.unauthorized_fail == '0' || req.body.unauthorized_fail == false || req.body.unauthorized_fail == '') {
        unauthorized_fail = '0';
    } else if (req.body.unauthorized_fail == '1' || req.body.unauthorized_fail == true || req.body.unauthorized_fail != '') {
        unauthorized_fail = '1';
    }

    let free_time = '';
    if (!req.body.free_time || req.body.free_time == '') {
        free_time = 0;
    } else if (req.body.free_time != '') {
        free_time = req.body.free_time;
    }

    let exhaust_announcement = '';
    if (!req.body.exhaust_announcement || req.body.exhaust_announcement == '') {
        exhaust_announcement = 0;
    } else if (req.body.exhaust_announcement != '') {
        exhaust_announcement = req.body.exhaust_announcement;
    }

    let tc_caller_id = '';
    if (!req.body.tc_caller_id || req.body.tc_caller_id == '0' || req.body.tc_caller_id == false || req.body.tc_caller_id == '') {
        tc_caller_id = '0';
    } else if (req.body.tc_caller_id == '1' || req.body.tc_caller_id == true || req.body.tc_caller_id != '') {
        tc_caller_id = '1';
    }

  let sql2 =   knex.select('id').from(table.tbl_pbx_tc).where('name', 'like', '' + data.name + '').andWhere('customer_id',req.body.customerId);
  
    sql2.then((response3) =>{
        if(response3.length > 0){
            
            res.status(200).send({
                code: 402,
                error: 'error', message: 'Duplicate name ' 
            }); throw err
        }else{
            let sql = knex(table.tbl_pbx_tc).insert({
                name: "" + data.name + "",
                // max_waiting_call: "" + req.body.max_waiting_call + "",
                welcome_prompt: "" + req.body.welcome_prompt + "",
                moh: "" + moh + "",
                ring_strategy: "" + ring_strategy + "",
                recording: "" + recording + "",
                periodic_announcement: "" + periodic_announcement + "",
                periodic_announcement_time: "" + periodic_announcement_time + "",
                periodic_announcement_prompt: "" + req.body.periodic_announcement_prompt + "",
                play_position_on_call: "" + play_position_on_call + "",
                play_position_periodically: "" + play_position_periodically + "",
                is_extension: "" + is_extension + "",
                is_pstn: "" + is_pstn + "",
                customer_id: "" + req.body.customerId + "",
                unauthorized_fail: "" + unauthorized_fail + "",
                active_feature: "" + req.body.active_feature + "",
                active_feature_value: "" + req.body.active_feature_value + "",
                free_minutes: free_time,
                exhausted_announcement_time: exhaust_announcement,
                callerid_as_DID: tc_caller_id,
                callerid: req.body.callerid
            });
        
            sql.then((response) => {
                if (response) {
                    let managedArray = [];
                    let extensionList = req.body.extension;
                    let pstnList = req.body.pstn;
                    let userList = req.body.user_ids;
        
                    for (let i = 0; i < extensionList.length; i++) {
                        let obj = {};
                        obj.id = extensionList[i];
                        obj.type = "E";
                        managedArray.push(obj);
                    }
                    for (let i = 0; i < pstnList.length; i++) {
                        let obj = {};
                        obj.id = pstnList[i];
                        obj.type = "P";
                        managedArray.push(obj);
                    }
                    for (let i = 0; i < userList.length; i++) {
                        let obj = {};
                        obj.id = userList[i];
                        obj.type = "U";
                        managedArray.push(obj);
                    }
        
                    if (userList.length != 0 && (extensionList.length != 0 || pstnList.length != 0)) {
                        const contactsToInsert = managedArray.map(contact =>
                            ({ tc_id: response, type: contact.type, ref_id: contact.id }));
                        let sql2 = knex(table.tbl_pbx_tc_mapping).insert(contactsToInsert);
                        sql2.then((response) => {
                            if (response) {
                                res.send({
                                    response: response,
                                    message: 'Add TC successfully',
                                    code: 200
                                });
                            }
                        }).catch((err) => {
                            console.log(err);
                            res.status(200).send({
                                code: err.errno,
                                error: 'error', message: 'DB Error: ' + err.message
                            }); throw err
                        });
                    }
                }
            }).catch((err) => {
                console.log(err);
                res.status(200).send({
                    code: err.errno,
                    error: 'error', message: 'DB Error: ' + err.message
                }); throw err
            });
        }
    })
}

function viewTC(req, res) {
    var body = req.body;
    let customerId = parseInt(req.query.customer_id);
    let isFilter = Object.keys(body).length == 0 ? false : true;
    var sql = knex.from(table.tbl_pbx_tc + ' as tc')
        .select('tc.id', 'tc.name', 'tc.max_waiting_call', 'tc.moh', 'tc.welcome_prompt','tc.callerid',
            knex.raw('IF (tc.recording = "0","Off","On") AS recordingDisplay'),
            knex.raw('IF (tc.recording = "0",0,1) AS recording'),
            knex.raw('IF (tc.ring_strategy = "0","Ring All", IF (tc.ring_strategy = "1","Round Robin","Random")) AS ring_strategy'),
            knex.raw('IF (tc.ring_strategy = "0","0", IF (tc.ring_strategy = "1","1","2")) AS ringStrategyDisplay'),
            knex.raw('IF (tc.periodic_announcement = "0",0,1) as periodic_announcement'),
            knex.raw('IF (periodic_announcement = "0","Off","On") as periodicAnnouncementDisplay'),
            knex.raw('IF (tc.periodic_announcement_time = "0","", IF (tc.periodic_announcement_time = "1", "15", IF(tc.periodic_announcement_time = "2", "30","60"))) as periodic_announcement_time1'),
            knex.raw('IF (tc.periodic_announcement_time = "0","0", IF(tc.periodic_announcement_time = "1", "1", IF(tc.periodic_announcement_time = "2", "2","3"))) as periodicAnnouncementTimeDisplay'),
            knex.raw('IF (tc.play_position_on_call = "0",0,1) as play_position_on_call'),
            knex.raw('IF (tc.play_position_on_call = "0","Off","On") as playPositionOnCallDisplay'),
            knex.raw('IF (tc.play_position_periodically = "0",0,1) as play_position_periodically'),
            'tc.periodic_announcement_prompt', 'tc.periodic_announcement_time'
        )
        .where('customer_id', '=', customerId)
        .orderBy('tc.id', 'desc');
    if (isFilter) {
        sql.where('name', 'like', '%' + body.name + '%')
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewSingleTCFullDetails(req, res) {
    var body = req.body;
    let tcId = parseInt(req.query.tc_id);
    var sql = knex.from(table.tbl_pbx_tc + ' as tc')
        .select('tc.id', 'tc.name', 'tc.max_waiting_call', 'tc.moh', 'tc.welcome_prompt', 'tc.unauthorized_fail', 'tc.active_feature', 'tc.active_feature_value', 'tc.free_minutes', 'tc.exhausted_announcement_time', 'tc.callerid_as_DID','tc.callerid',
            knex.raw('IF (tc.recording = "0","Off","On") AS recordingDisplay'),
            knex.raw('IF (tc.recording = "0",0,1) AS recording'),
            knex.raw('IF (tc.unauthorized_fail = "0",0,1) AS unauthorized_fail'),
            knex.raw('IF (tc.ring_strategy = "0","Ring All", IF (tc.ring_strategy = "1","Round Robin","Random")) AS ring_strategy'),
            knex.raw('IF (tc.ring_strategy = "0","0", IF (tc.ring_strategy = "1","1","2")) AS ringStrategyDisplay'),
            knex.raw('IF (tc.periodic_announcement = "0",0,1) as periodic_announcement'),
            knex.raw('IF (periodic_announcement = "0","Off","On") as periodicAnnouncementDisplay'),
            knex.raw('IF (tc.periodic_announcement_time = "0","", IF (tc.periodic_announcement_time = "1", "15", IF(tc.periodic_announcement_time = "2", "30","60"))) as periodic_announcement_time1'),
            knex.raw('IF (tc.periodic_announcement_time = "0","0", IF(tc.periodic_announcement_time = "1", "1", IF(tc.periodic_announcement_time = "2", "2","3"))) as periodicAnnouncementTimeDisplay'),
            knex.raw('IF (tc.play_position_on_call = "0",0,1) as play_position_on_call'),
            knex.raw('IF (tc.play_position_on_call = "0","Off","On") as playPositionOnCallDisplay'),
            knex.raw('IF (tc.play_position_periodically = "0",0,1) as play_position_periodically'),
            'tc.periodic_announcement_prompt', 'tc.periodic_announcement_time', 'tc.is_extension', 'tc.is_pstn',
            knex.raw('GROUP_CONCAT(tcm.ref_id) as ref_id'),
            knex.raw('GROUP_CONCAT(tcm.type) as ref_type'))
        .leftJoin(table.tbl_pbx_tc_mapping + ' as tcm', 'tcm.tc_id', tcId)
        .where('tc.id', '=', tcId);
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function updateTC(req, res) {
    let data = req.body;
    let max_waiting_call = '';
    req.body.max_waiting_call = req.body.max_waiting_call ? "" + req.body.max_waiting_call + "" : 0;

    let recording = '';
    if (!req.body.recording || req.body.recording == '0' || req.body.recording == false || req.body.recording == '') {
        recording = '0';
    } else if (req.body.recording == '1' || req.body.recording == true || req.body.recording != '') {
        recording = '1';
    }

    let moh = '';
    if (!req.body.moh || req.body.moh == '') {
        moh = '0';
    } else if (req.body.moh != '') {
        moh = req.body.moh;
    }

    let ring_strategy = '';
    if (!req.body.ring_strategy || req.body.ring_strategy == '') {
        ring_strategy = '0';
    } else if (req.body.ring_strategy != '') {
        ring_strategy = req.body.ring_strategy;
    }

    let periodic_announcement = '';
    if (!req.body.periodic_announcement || req.body.periodic_announcement == '0' || req.body.periodic_announcement == false || req.body.periodic_announcement == '') {
        periodic_announcement = '0';
    } else if (req.body.periodic_announcement == '1' || req.body.periodic_announcement == true || req.body.periodic_announcement != '') {
        periodic_announcement = '1';
    }

    let periodic_announcement_time = '';
    if (!req.body.periodic_announcement || req.body.periodic_announcement == '0' || req.body.periodic_announcement == false || req.body.periodic_announcement == '') {
        periodic_announcement_time = '0'
    } else if (req.body.periodic_announcement == '1' || req.body.periodic_announcement == true || req.body.periodic_announcement != '') {
        periodic_announcement_time = req.body.periodic_announcement_time ? req.body.periodic_announcement_time : "1";
    }

    let play_position_on_call = '';
    if (!req.body.play_position_on_call || req.body.play_position_on_call == '0' || req.body.play_position_on_call == false || req.body.play_position_on_call == '') {
        play_position_on_call = '0';
    } else if (req.body.play_position_on_call == '1' || req.body.play_position_on_call == true || req.body.play_position_on_call != '') {
        play_position_on_call = '1';
    }

    let play_position_periodically = '0';
    if (!req.body.play_position_periodically || req.body.play_position_periodically == '0' || req.body.play_position_periodically == false || req.body.play_position_periodically == '') {
        play_position_periodically = '0';
    } else if ((req.body.play_position_periodically == '1' || req.body.play_position_periodically == true || req.body.play_position_periodically != '')
        && (req.body.play_position_on_call == '1' || req.body.play_position_on_call == true || req.body.play_position_on_call != '')) {
        play_position_periodically = '1';
    }

    let is_extension = '0';
    if (!req.body.is_extension || req.body.is_extension == '0' || req.body.is_extension == false || req.body.is_extension == '') {
        is_extension = '0';
    } else if ((req.body.is_extension == '1' || req.body.is_extension == true || req.body.is_extension != '')
        && (req.body.is_extension == '1' || req.body.is_extension == true || req.body.is_extension != '')) {
        is_extension = '1';
    }

    let is_pstn = '';
    if (!req.body.is_pstn || req.body.is_pstn == '0' || req.body.is_pstn == false || req.body.is_pstn == '') {
        is_pstn = '0';
    } else if (req.body.is_pstn == '1' || req.body.is_pstn == true || req.body.is_pstn != '') {
        is_pstn = '1';
    }

    let unauthorized_fail = '';
    if (!req.body.unauthorized_fail || req.body.unauthorized_fail == '0' || req.body.unauthorized_fail == false || req.body.unauthorized_fail == '') {
        unauthorized_fail = '0';
    } else if (req.body.unauthorized_fail == '1' || req.body.unauthorized_fail == true || req.body.unauthorized_fail != '') {
        unauthorized_fail = '1';
    }

    let free_time = '';
    if (!req.body.free_time || req.body.free_time == '') {
        free_time = 0;
    } else if (req.body.free_time != '') {
        free_time = req.body.free_time;
    }

    let exhaust_announcement = '';
    if (!req.body.exhaust_announcement || req.body.exhaust_announcement == '') {
        exhaust_announcement = 0;
    } else if (req.body.exhaust_announcement != '') {
        exhaust_announcement = req.body.exhaust_announcement;
    }

    let tc_caller_id = '';
    if (!req.body.tc_caller_id || req.body.tc_caller_id == '0' || req.body.tc_caller_id == false || req.body.tc_caller_id == '') {
        tc_caller_id = '0';
    } else if (req.body.tc_caller_id == '1' || req.body.tc_caller_id == true || req.body.tc_caller_id != '') {
        tc_caller_id = '1';
    }

    let sql = knex(table.tbl_pbx_tc)
        .update({
            name: "" + data.name + "",
            // max_waiting_call: "" + req.body.max_waiting_call + "",
            welcome_prompt: "" + req.body.welcome_prompt + "",
            moh: "" + moh + "",
            ring_strategy: "" + ring_strategy + "",
            recording: "" + recording + "",
            periodic_announcement: "" + periodic_announcement + "",
            periodic_announcement_time: "" + periodic_announcement_time + "",
            periodic_announcement_prompt: "" + req.body.periodic_announcement_prompt + "",
            play_position_on_call: "" + play_position_on_call + "",
            play_position_periodically: "" + play_position_periodically + "",
            is_extension: "" + is_extension + "",
            is_pstn: "" + is_pstn + "",
            unauthorized_fail: "" + unauthorized_fail + "",
            active_feature: "" + req.body.active_feature + "",
            active_feature_value: "" + req.body.active_feature_value + "",
            free_minutes: free_time,
            exhausted_announcement_time: exhaust_announcement,
            callerid_as_DID: tc_caller_id,
            callerid: req.body.callerid
        })
        .where('id', '=', "" + req.body.id + "");

    sql.then((response) => {
        let tcId = req.body.id ? req.body.id : 0;
        if (response) {
            let sql2 = knex(table.tbl_pbx_tc_mapping).where('tc_id', '=', "" + tcId + "")
            sql2.del();
            sql2.then((response) => {
                if (response) {
                    let managedArray = [];
                    let extensionList = req.body.extension;
                    let pstnList = req.body.pstn;
                    let userList = req.body.user_ids;
                    for (let i = 0; i < extensionList.length; i++) {
                        let obj = {};
                        obj.id = extensionList[i];
                        obj.type = "E";
                        managedArray.push(obj);
                    }
                    for (let i = 0; i < pstnList.length; i++) {
                        let obj = {};
                        obj.id = pstnList[i];
                        obj.type = "P";
                        managedArray.push(obj);
                    }
                    for (let i = 0; i < userList.length; i++) {
                        let obj = {};
                        obj.id = userList[i];
                        obj.type = "U";
                        managedArray.push(obj);
                    }
                    if (userList.length != 0 && (extensionList.length != 0 || pstnList.length != 0)) {
                        const contactsToInsert = managedArray.map(contact =>
                            ({ tc_id: req.body.id, type: contact.type, ref_id: contact.id }));
                        let sql3 = knex(table.tbl_pbx_tc_mapping).insert(contactsToInsert);
                        sql3.then((response) => {
                            if (response) {
                                res.send({
                                    response: response,
                                    message: 'Update TC successfully',
                                    code: 200
                                });
                            }
                        }).catch((err) => {
                            console.log(err);
                            res.status(200).send({
                                code: err.errno,
                                error: 'error', message: 'DB Error: ' + err.message
                            }); throw err
                        });
                    }
                } else {
                    res.status(200).send({ error: 'error', message: 'DB Error' });
                }

            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });



        }
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });
}

function deleteTC(req, res) {
    knex.raw("Call pbx_delete_tc(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function deleteTCMinuteMapping(req, res) {
    var mappingID = req.query[Object.keys(req.query)[0]];
    let sql = knex(table.tbl_pbx_tc_plan_mapping).where('id', '=', "" + mappingID + "")
    sql.del();
    sql.then((response) => {
        if (response) {
            res.json({
                response: response,
                message: 'Minute Mapping deleted'
            });
        } else {
            res.status(200).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteTCPlan(req, res) {
    var tcPlanID = req.query[Object.keys(req.query)[0]];
    let sql2 = knex(table.tbl_pbx_tc_plan).where('id', '=', "" + tcPlanID + "");
    sql2.del();
    sql2.then((response) => {
        if (response) {
            knex(table.tbl_pbx_min_tc_mapping).where('tc_plan_id', tcPlanID)
                .del().then((responses) => {
                    // if(responses){
                    res.json({
                        response: response,
                        message: 'TC Plan deleted'
                    });
                    // }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.status(200).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewTCPlanAssociateUsers(req, res) {
    var body = req.body;
    let tcId = parseInt(req.query.tcPlan_id);
    var sql = knex.from(table.tbl_pbx_min_tc_mapping + ' as tcm')
        .select('tcm.contact_name')
        .where('tcm.tc_plan_id', '=', tcId);
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewAssignMinuteUsers(req, res) {
    var data = req.body;
    let userId = data['user_ID'];
    let planId = data['tc_PlanID'];
    var sql = knex.from(table.tbl_pbx_tc_plan_mapping + ' as tcp')
        .select('*')
        .where('tcp.tc_plan_id', '=', planId)
        .andWhere('tcp.user_id', '=', userId)
        .whereNot('tcp.id', data['id']);
    sql.then((response) => {
        res.json({
            response: response,
            message: "User have already assign minutes"
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewTC_CDR(req, res) {
    knex.raw("Call pbx_getTCCdrInfo(" + req.query.user_id + "," + req.query.limit_flag + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getTC_CdrByFilters(req, res) {
    let data = req.body.filters;
    // let rangeFrom = data.by_date ? data.by_date[0].split('T')[0] : null;
    // let rangeTo = data.by_date ? data.by_date[1].split('T')[0] : null;
    data.by_buycost = null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    data.by_terminatecause = data.by_terminatecause ? ("'" + data.by_terminatecause + "'") : null;
    data.by_tc = data.by_tc ? ("'" + data.by_tc + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    
    //  knex.raw("Call pbx_getTCCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + ","+ data.by_tc +")").then((response) => {
    knex.raw("Call pbx_getTCCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + "," + data.by_buycost + "," + data.by_sellcost + "," + data.by_src + "," + data.by_dest + "," + data.by_destination + "," + data.by_callerid + "," + data.by_terminatecause + "," + data.by_tc + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getTeleConsultancyAssignMinutes(req, res) {

}

function getTCCdr(req, res) {

    var sql = knex.from(table.pbx_tc_unauth_call + ' as tc')
        .select('tc.id', 'tc.src', 'tc.dest', 'tc.used_minutes', knex.raw("DATE_FORMAT(tc.start_time,'%Y-%m-%d %h:%m:%s') as start_time"))
        .where('tc.customer_id', '=', req.body.customerId)
        .whereRaw('tc.start_time >= last_day(now()) + interval 1 day - interval 2 month')
        .orderBy('tc.id', 'desc')
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getUnauthCdrByFilter(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    let sql = knex.raw("call pbx_getUnauthCdrByFilter(" + data.customer_id + "," + rangeFrom + "," + data.by_src + "," + data.by_dest + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getMappedContacts(req, res) {
    let id = req.body.id;
    var sql = knex.from(table.tbl_pbx_min_tc_mapping + ' as tc')
        .select('c.id as contact_id', 'c.phone_number1', 'tc.assign_minutes', 'tc.tc_min_id', 'tc.tc_plan_id', 'c.name as contact_name', knex.raw("DATE_FORMAT(tc.created_at,'%Y-%m-%d %h:%m:%s') as created_at"))
        .leftJoin(table.tbl_Contact_list + ' as c', 'c.id', 'tc.contact_id')
        .where('tc.tc_plan_id', '=', id)
        .orderBy('tc.tc_min_id', 'desc')
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getMappedTcHistory(req, res) {
    let id = req.body.credentials.tc_plan_id;
    let cid = req.body.credentials.contact_id;
    let cust_id = req.body.credentials.customer_id;
    var sql = knex.from(table.pbx_tc_history + ' as tch')
        .select('c.phone_number1 as contact_number', 'tch.assign_minutes', 'tch.id', 'tch.used_minutes', knex.raw("DATE_FORMAT(tch.date,'%Y-%m-%d %h:%m:%s') as date"))
        .leftJoin(table.tbl_Contact_list + ' as c', 'c.id', 'tch.contact_id')
        .where('tch.plan_id', '=', id)
        .andWhere('tch.customer_id', '=', cust_id)
        .andWhere('c.id', '=', cid)
        .orderBy('tch.id', 'desc')
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getMappedContactsByFilter(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_number = data.by_number ? ("'" + data.by_number + "'") : null;
    let sql = knex.raw("call pbx_getMappedContactsByFilter(" + data.contact_id + "," + data.by_name + "," + data.by_number + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getTcPlanById(req, res) {
    let customer_id = req.body.customer_id;
    let sql = knex(table.tbl_pbx_min_tc_mapping + ' as mtm')
    .join(table.tbl_pbx_tc_plan + ' as tc','tc.id','mtm.tc_plan_id')
        .andWhere('tc.customer_id', customer_id)
        .select(knex.raw('GROUP_CONCAT(mtm.contact_id) as contact_id'), 'mtm.destination','mtm.used_minute','tc.minutes', 'mtm.assign_minutes', knex.raw('sum(mtm.assign_minutes) as total_minutes'), knex.raw('CONCAT(DATE_FORMAT(tc.created_at, "%Y-%m-%d"), " : " , DATE_FORMAT(tc.expiry_date, "%Y-%m-%d")) as dates'));
    if (req.body.tc_pkg_id) {
        sql.where('mtm.tc_plan_id', req.body.tc_pkg_id);
    } else {
        sql.where('mtm.destination', req.body.dest);
    }   
    sql.then((response) => {   
        res.json({
            response: response
        })
    })
}
function remaingMinutes(req, res) {
    let customer_id = req.body.customer_id;
    let sql1 = knex.select(knex.raw('SUM(min.assign_minutes) as minutes')).from(table.tbl_pbx_min_tc_mapping + ' as min').join(table.tbl_Call_Plan_Rate + ' as r','min.total_minutes','r.id')
    .where('r.customer_id',customer_id)
    .andWhere('min.destination',req.body.dest)
    sql1.then((response) => {   
        res.json({
            response: response
        })
    })
}

function getRemainingContactMinutes(req,res){
    let customer_id = req.body.customer_id;
    let sql = knex(table.tbl_pbx_min_tc_mapping + ' as mtm')
    .join(table.tbl_pbx_tc_plan + ' as tc','tc.id','mtm.tc_plan_id')
        .where('mtm.tc_plan_id', req.body.tc_pkg_id)           
        .andWhere('tc.customer_id', customer_id)
        .andWhere('mtm.contact_id',req.body.cont_id)
        .select( 'mtm.assign_minutes')
    sql.then((response) => {            
        res.json({
            response: response
        })
    })}

function getSubscriberInfoByFilter(req,res){        
    let data = req.body.filters;
    let id = data.id;
    let by_name = data.by_name ? ("" + data.by_name + "") : null;
    let by_destination = data.by_destination != '' ? ("" + data.by_destination + "") : null;
    let by_expiry = data.by_expiry ? ("'" + data.by_expiry + "'") : null;
    let rangeFrom = data.by_expiry ? data.by_expiry[0] : null;
    let rangeTo = data.by_expiry ? data.by_expiry[1] : null;
    rangeFrom = rangeFrom ? ("" + moment(rangeFrom).format('YYYY-MM-DD') + "") : null;
    rangeTo = rangeTo ? ("" + moment(rangeTo).format('YYYY-MM-DD') + "") : null;
//    let sql = knex.raw("call getSubscriberInfoByFilter(" + data.id +","+  data.by_name + ","+  data.by_destination + ","+  data.by_expiry + ")")  
var sql = knex.from(table.tbl_pbx_tc_plan + ' as tcp')
.select('tcp.id',' tcp.name as package_name','tcp.price','cn.name as country','tcm.destination','tcm.contact_id','tcm.assign_minutes','tcm.used_minute','c.phone_number1 as phone','c.name', knex.raw("DATE_FORMAT(tcm.expiry_date,'%Y-%m-%d %h:%m:%s') as date") )
.leftJoin(table.tbl_pbx_min_tc_mapping + ' as tcm','tcm.tc_plan_id','tcp.id')
.leftJoin(table.tbl_Contact_list + ' as c','c.id','tcm.contact_id')
.leftJoin(table.tbl_Country  + ' as cn','cn.id','tcm.destination')
.where('tcp.customer_id', '=', id)

if (by_name) {
    sql = sql.andWhere('tcp.name', 'like', "%" + by_name + "%");
}    
if (by_destination) {
    sql = sql.andWhere(knex.raw(`tcm.destination in (${by_destination})` ));
}    
if (data.by_expiry != '') {
    sql = sql.andWhere(knex.raw('DATE(tcm.expiry_date)'), '>=', "" + rangeFrom + "")
        .andWhere(knex.raw('DATE(tcm.expiry_date)'), '<=', "" + rangeTo + "");
}

sql.then((response) => {
    if (response) {
        res.send({ response: response });
    }
}).catch((err) => {
    res.send({ response: { code: err.errno, message: err.sqlMessage } });
});
}

function getSubscriberInfo(req,res){
    let id = req.body.Id;
    var sql = knex.from(table.tbl_pbx_tc_plan + ' as tcp')
.select('tcp.id',' tcp.name as package_name','tcp.price','cn.name as country','tcm.destination','tcm.contact_id','tcm.assign_minutes','tcm.used_minute','c.phone_number1 as phone','c.name', knex.raw("DATE_FORMAT(tcm.expiry_date,'%Y-%m-%d %h:%m:%s') as date"))
.innerJoin(table.tbl_pbx_min_tc_mapping + ' as tcm','tcm.tc_plan_id','tcp.id')
.innerJoin(table.tbl_Contact_list + ' as c','c.id','tcm.contact_id')
.innerJoin(table.tbl_Country  + ' as cn','cn.id','tcm.destination')
.where('tcp.customer_id', '=', id)
sql.then((response) => {
    res.json({
        response
    });
}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

   
}

function deleteSubscriber(req,res){
    let data = req.body;

    // let sql = knex.raw("call pbx_deleteSubscriber(" + data.cust_id +","+  data.c_id + ","+  data.id + ")")  
// let sql = knex(table.tbl_pbx_tc_plan).where( 'id', data.id).del();  
    // sql.then((response) => {    
        let sql1 = knex(table.tbl_pbx_min_tc_mapping ).where('tc_plan_id',data.id)
        .andWhere('contact_id',data.c_id).del();
        sql1.then((response2)=>{
            knex.from(table.tbl_pbx_min_tc_mapping).count('tc_min_id as count').where('tc_plan_id',data.id)
            .then((resp) =>{
                if(resp[0]['count'] == 0){
                    knex.from(table.tbl_pbx_tc_plan).where('id',data.id).update('mapped','0')
                    .then((respo) =>{
                        res.send({
                            respo
                        })
                    })
                }else{
                    res.json({
                        response2
                    });
                }
            })
           
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function addMinutes(req,res){
    let contactId = req.body.contact_id;
    let minutes = req.body.minutes;
    

    let sql = knex.from(table.tbl_pbx_min_tc_mapping).where('contact_id',contactId).update('assign_minutes', knex.raw(`assign_minutes + ${minutes}`))
    .then((response)=>{
        res.send({
            status_code : 200
        })
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getCallerId(req,res){
    console.log(req.query.id,"--customer id--");

    let id = req.query.id ;

    let sql = knex.from(table.tbl_DID).select('*').where('customer_id',id)
    .then((response)=>{
        res.send({
            response: response
        })
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


module.exports = {
    viewTCPackage, addTCPackage, updateTCPackage, getMyAssignedMinutes, deleteTCPlan,
    assignMinuteToUser, viewAssignUsers, updateassignMinuteToUser, deleteTCMinuteMapping, viewTCPlanAssociateUsers, viewAssignMinuteUsers,
    addTC, viewTC, viewSingleTCFullDetails, updateTC, deleteTC,    
    viewTC_CDR, getTC_CdrByFilters, getTeleConsultancyAssignMinutes,getTCCdr,getUnauthCdrByFilter,getMappedContacts,getMappedTcHistory,getMappedContactsByFilter, getTcPlanById,remaingMinutes, getSubscriberInfo,getSubscriberInfoByFilter
    ,deleteSubscriber,addContact,addMinutes,getRemainingContactMinutes,getCallerId
}