const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const { eachOfLimit } = require('async');


function addOC(req, res) {
    let data = req.body;
    let recording = ''
    if (!req.body.recording || req.body.recording == '' || req.body.recording == 'false') {
        recording = '0'
    }
    else {
        recording = '1'
    }
    let start_date = req.body.conf_schedule_time;
    let conf_schedule_time = start_date ? moment(start_date).format('YYYY-MM-DD HH:mm:ss') : "";
    let is_scheduler_type = req.body.is_scheduler_type;
    let sql = knex(table.tbl_pbx_outbound_conference).insert({
        name: "" + data.name + "",
        recording: "" + recording + "",
        welcome_propmt: "" + req.body.welcome_prompt + "",
        conf_schedule_time: "" + conf_schedule_time + "",
        is_scheduler_type: "" + is_scheduler_type + "",
        DID_caller_id: "" + data.DID_caller_id + "",
        cust_id: "" + req.body.customerId + "",
    });
    sql.then((response) => {
        let sql2 = knex(table.tbl_pbx_outbound_conference).select('*')
            .where('id', '=', response)
        sql2.then((response2) => {
            let sql3 = knex(table.tbl_pbx_outbound_conference_participant).insert({
                contact: "" + data.contact + "",
                conf_id: "" + response + ""
            })
            sql3.then((response3) => {
            })
        })
        if (response2) {
            res.send({
                response: response,
                message: 'Outbound Conference create successfully',
                code: 200
            });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}
function viewOC(req, res) {
    var body = req.body;
    let customerId = parseInt(req.query.customer_id);
    let isFilter = Object.keys(body).length == 0 ? false : true;
    var sql = knex.from(table.tbl_pbx_outbound_conference + ' as oc')
        .select('oc.*')
        .where('cust_id', '=', customerId)
        .orderBy('oc.id', 'desc');
    if (isFilter) {
        sql.where('name', 'like', '%' + body.name + '%')
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}
function getConferenceCount(req, res) {
    var bc_id = req.query.broadcast_id;//broabcast_id: 
    var countQuery = knex.select(knex.raw('COUNT(dd.customer_id) as broadcast_count'))
        .from(table.tbl_DID_Destination + ' as dd')
        .where('dd.destination_id', bc_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
// function deleteOC(req, res) {
//     let data = req.query.id;    
//     let sql = knex.raw(`DELETE  ocp,oc from pbx_outbound_conference_participant as ocp INNER JOIN pbx_outbound_conference as oc ON ocp.conf_id =oc.id WHERE oc.id=${data}`)
//     sql.then((response) => {
//         res.send({
//             message: "Deleted Successfully.",
//             data: response
//         })
//     })

// }
function getStatusOC(req, res) {
    let sql = knex.from(table.tbl_pbx_outbound_conference)
        .select('status')
        .where('id', req.query.OC_id)
    sql.then(response => {
        res.send({ response })
    })

}
function getOCRecordingList(req, res) {
    let sql = knex.from(table.tbl_pbx_recording + ' as r')
        .select('r.*', 'r.src as extension', 'r.dest as callee_ext', knex.raw('DATE_FORMAT(r.created_at, "%d/%m/%Y %H:%i:%s") as time'), knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'), 'r.type as call_type')
        // let sql = knex.select('*').from(table.tbl_pbx_recording)
        .where('customer_id', req.body.id)
        .andWhere('r.type', 'Outbound Conference')
        .orderBy('r.id', 'desc')
    sql.then(response => {
        res.send({ response })
    })
}

function deleteRecording(req, res) {
    let data = req.query.id;
    let sql = knex(table.tbl_pbx_recording).where('id', "=", "" + data + "").del();
    sql.then((response) => {
        res.send({
            message: "Deleted Successfully.",
            data: response
        })
    })

}
function filterRecordingList(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_range ? data.by_range[0] : null;
    let rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? moment(rangeFrom).format('YYYY-MM-DD') : null;
    rangeTo = rangeTo ? moment(rangeTo).format('YYYY-MM-DD') : null;
    var filterCaller = data.by_src ? data.by_src : null;
    var filterCallee = data.by_dest ? data.by_dest : null;


    //   if (data.role == '1' && data.type == 'normalRecording') {
    var customer_id = data.user_id;
    var sql = knex.from(table.tbl_pbx_recording + ' as r')
        .select('r.*', 'r.src as extension', 'r.dest as callee_ext', knex.raw('DATE_FORMAT(r.created_at, "%d/%m/%Y %H:%i:%s") as time'), knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'), 'r.type as call_type')
        .where('r.customer_id', customer_id)
        .andWhere('r.type', 'Outbound Conference')
        .orderBy('r.id', 'desc')
    if (data.by_range != '') {
        sql = sql.andWhere(knex.raw('DATE(r.created_at)'), '>=', "" + rangeFrom + "")
            .andWhere(knex.raw('DATE(r.created_at)'), '<=', "" + rangeTo + "");
    }
    if (filterCaller) {
        sql = sql.andWhere('r.src', 'like', "%" + filterCaller + "%");
    }
    if (filterCallee) {
        sql = sql.andWhere('r.dest', 'like', "%" + filterCallee + "%");
    }

    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
    // }
}
function deleteOC(req, res) {
    let data = req.body;

    let sql2 = knex(table.tbl_pbx_outbound_conference).where('id', '=', req.query.id)
    sql2.del();
    sql2.then((response) => {
        if (response) {
            knex(table.tbl_pbx_outbound_conference_participant).where('conf_id', req.query.id).del()
                .then(responses => {
                    res.json({
                        code: 200
                    });
                })
        } else {
            res.json({
                code: 400
            });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
function partiallyUpdateOCStop(req, res) {
    let status = req.body.status;
    let id = req.query.id;

    if (status == 1) {
        let sql = knex(table.tbl_pbx_outbound_conference)
            .update('stop', '1')
            .where('id', '=', "" + id + "");
        sql.then((response) => {
            if (response) {
                res.send({
                    response: response,
                    message: 'Outbound Conference status Updated Successfully',
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
    } else {
        let sql = knex(table.tbl_pbx_outbound_conference)
            .update('stop', '0')
            .where('id', '=', "" + id + "");
        sql.then((response) => {
            if (response) {
                res.send({
                    response: response,
                    message: 'Outbound Conference status Updated Successfully',
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

function updateOCGroup(req, res) {
    let welcomeData = req.body.welcome_prompt == '' ? '0' : req.body.welcome_prompt
    let data = req.body.id;
    let recording = ''
    if (!req.body.recording || req.body.recording == '' || req.body.recording == 'false') {
        recording = '0'
    }
    else {
        recording = '1'
    }
    let start_date = req.body.conf_schedule_time;
    let conf_schedule_time = start_date ? start_date : "";

    let is_scheduler_type = req.body.is_scheduler_type;
    knex.from(table.tbl_pbx_outbound_conference).where('id', '=', "" + data + "")
        .select('conf_schedule_time')
        .then((response) => {
            if (response.length > 0) {
                let conf = Object.values(JSON.parse(JSON.stringify(response)));
                let lastStartDate = conf[0].conf_schedule_time;
                let conf_schedule_time = '';
                if (lastStartDate == start_date) {
                    conf_schedule_time = start_date;
                }
                else {
                    conf_schedule_time = start_date ? moment(start_date).format('YYYY/MM/DD HH:mm:ss') : "";
                }

                if (conf_schedule_time == 'Invalid date') {
                    conf_schedule_time = lastStartDate;
                }
                let sql = knex(table.tbl_pbx_outbound_conference).update({
                    name: "" + req.body.name + "",
                    recording: "" + recording + "",
                    welcome_propmt: "" + welcomeData + "",
                    conf_schedule_time: "" + conf_schedule_time + "",
                    is_scheduler_type: "" + is_scheduler_type + "",
                    DID_caller_id: "" + req.body.DID_caller_id + "",
                    cust_id: "" + req.body.customerId + "",
                })
                    .where('id', '=', "" + data + "");
                sql.then((response) => {
                    let contactList = []
                    let sql1 = knex(table.tbl_pbx_outbound_conference_participant).where('conf_id', data).del()
                    sql1.then(response2 => {
                        // if (req.body.contact.length !== 0) {
                        req.body.contact.map(item => {
                            contactList.push({ conf_id: data, contact: item.contact });
                        })

                        let sql2 = knex(table.tbl_pbx_outbound_conference_participant).insert(contactList);


                        if (response == 1 && contactList.length != 0) {
                            sql = sql2

                        } else {

                        }
                        let input = {
                            "Name": "" + req.body.name + "",
                            "Welcome Propmt": "" + req.body.welcome_prompt_name + "",
                            "Conference Schedule Time": "" + conf_schedule_time + "",
                            "Scheduler Type": "" + is_scheduler_type + "",
                            "DID Caller Id": "" + req.body.did_name + "",
                        }
                        if (recording) {
                         input["Recording"] = "1t";   
                        }
                        sql.then(response3 => {
                            createModuleLog(table.tbl_pbx_audit_logs, {
                                module_action_id: response3,
                                module_action_name: req.body.callPlan.name,
                                module_name: "outbound conference",
                                message: arr?.id
                                    ? "Outbound Conference Updated"
                                    : "Outbound Conference Updated",
                                customer_id: modified_by,
                                features: "" + JSON.stringify(input) + "",
                            });
                            if (response) {
                                res.send({
                                    response: response,
                                    message: 'Outbound Conference Updated successfully',
                                    code: 200
                                });
                            }
                        })
                        // }
                    })
                }).catch((err) => {
                    res.send({ code: err.errno, message: err.sqlMessage });
                });
            }
        }).catch((err) => { console.log(err); throw err });
}


function viewOCGroupById(req, res) {
    let data = req.body.id;
    var obj = {};
    let sql = knex(table.tbl_pbx_outbound_conference).select('id', 'name', 'recording', 'welcome_propmt', 'is_scheduler_type', 'DID_caller_id', knex.raw('DATE_FORMAT(conf_schedule_time, "%Y/%m/%d %H:%i:%s") as conf_schedule_time')).where('id', data)
    sql.then(async (response) => {
        Object.assign(obj, { OC: response });
        if (response) {
            await knex.select('ocp.id', 'ocp.contact', 'ocp.num_of_tires', 'ocp.dialed_status').from(table.tbl_pbx_outbound_conference_participant + ' as ocp').leftJoin(table.tbl_pbx_outbound_conference + ' as oc', 'oc.id', 'ocp.conf_id').where('ocp.conf_id', data).then((response2) => {
                Object.assign(obj, { OCC: response2 })
            })
        }
    }).then((response) => {
        res.send({
            obj
        })

    })
}

function partiallyUpdateOC(req, res) {
    let data = req.body;
    let id = req.query.id;
    let sql = knex(table.tbl_pbx_outbound_conference)
        .update(data)
        .where('id', '=', "" + id + "");
    sql.then((response) => {
        if (response) {
            res.send({
                response: response,
                message: 'Outbound Conference status Updated Successfully',
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
function isOCExist(req, res) {
    let bc_name = req.query.bc_name;
    let customer_id = req.query.customer_id;
    let bc_id = req.query.bc_id ? req.query.bc_id : null;
    var countQuery = knex.select(knex.raw('COUNT(oc.id) as OC_count'))
        .from(table.tbl_pbx_outbound_conference + ' as oc')
        .where('oc.name', bc_name)
        .andWhere('oc.cust_id', customer_id)
        .whereNot('oc.id', bc_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response: response[0]
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
function outboundcdr(req, res) {
    let user_id = req.query.customerId;
    let sql = knex.raw("Call pbx_getOCCdrVIEW(" + user_id + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });




    // let user_id = req.query.customerId;
    // const dateFormat = '%d/%m/%Y %H:%i:%s';
    // let sql = knex(table.tbl_pbx_conference_outbound_cdr)
    // .select(knex.raw(`DATE_FORMAT(
    //     IF(session_start >= LAST_DAY(NOW()) + INTERVAL 1 DAY - INTERVAL 2 MONTH, session_start, NULL),
    //     ?
    //   ) as session_start`, [dateFormat]))
    // .select('instance_id','callee','conf_name','caller','hangup_cause','terminatecause').where('cust_id', user_id)
    // .orderBy('id','desc')
    // sql.then((response) => {
    //     if(response.length){
    //         res.send({
    //             status_code: 200,
    //             response
    //         })
    //     }else{
    //         res.status(202).send({ status_code: 202, message: "No Data Found." });
    //     }
    // }).catch((err) => {
    //     res.send({ code: err.errno, message: err.sqlMessage });
    // })
}
function livecallforOC(req, res) {
    let id = req.query.id;
    let outboundcdrId = parseInt(req.query.outbound_id);
    let sql = knex.raw(`        SELECT * FROM pbx_outbound_conference_participant as cp 
         JOIN pbx_outbound_conference as oc on oc.id =cp.conf_id
         WHERE cp.status='1' and oc.status='1' and oc.cust_id = ${outboundcdrId} and oc.id = ${id};`)
    sql.then((response) => {
        if (response.length) {
            res.send({
                status_code: 200,
                response: response[0]
            })
        } else {
            res.status(202).send({ status_code: 202, message: "No Data Found." });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    })
}
function outboundreport(req, res) {
    let user_id = req.query.customerId;
    // let sql = knex(table.tbl_pbx_conference_outbound_cdr + ' as repo').select('repo.instance_id','repo.session_start','repo.status')
    // sql.groupBy('repo.instance_id')
    // sql.orderBy('instance_id','desc')
    // .where('repo.cust_id', user_id)
    // .whereNotNull("repo.instance_id")
    let sql = knex.raw(`SELECT cdr.caller,cdr.instance_id,cdr.conf_name, pc.status,DATE_FORMAT(cdr.session_start, '%d/%m/%Y %H:%i:%s') AS session_start FROM pbx_conference_outbound_cdr cdr \
        JOIN pbx_outbound_conference_participant part on part.instance_id = cdr.instance_id \
         left join pbx_outbound_conference pc on pc.instance_id = cdr.instance_id  \
        WHERE cdr.cust_id = ${user_id}  and cdr.instance_id !='' 
        GROUP by cdr.instance_id ORDER by cdr.session_start DESC;`)
    sql.then((response) => {
        if (response.length) {
            res.send({
                status_code: 200,
                response: response[0]
            })
        } else {
            res.status(202).send({ status_code: 202, message: "No Data Found." });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    })
}
function outboundreportstatusNotlive(req, res) {
    let user_id = req.query.customerId;
    let sql = knex.raw(`SELECT cdr.caller,cdr.instance_id,cdr.conf_name,DATE_FORMAT(cdr.session_start, '%d/%m/%Y %H:%i:%s') AS session_start,part.status from pbx_conference_outbound_cdr as cdr \
         join pbx_outbound_conference_participant as part on cdr.instance_id = part.instance_id WHERE cdr.instance_id is NOT null AND cdr.cust_id=${user_id} GROUP by cdr.instance_id order by cdr.instance_id`)
    // let sql = knex.raw('cdr.conf_name','cdr.instance_id').from(table.tbl_pbx_conference_outbound_cdr + ' as cdr')
    // .leftJoin(table.tbl_pbx_outbound_conference_participant + ' as part','part.instance_id','cdr.instance_id')
    // .sql.groupBy('cdr.instance_id')
    // .where('cdr.cust_id',user_id)
    sql.then((response) => {
        if (response.length) {
            res.send({
                status_code: 200,
                response: response[0]
            })
        } else {
            res.status(202).send({ status_code: 202, message: "No Data Found." });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    })
}
function getoutboundcdrFilter(req, res) {
    let data = req.body.filters;
    let user_id = req.body.customer_id;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_name = data.by_name != "" ? "'" + data.by_name + "'" : null;
    data.by_callee = data.by_callee != "" ? "'" + data.by_callee + "'" : null;
    let sql = knex.raw("Call pbx_getOCCdrByFilter(" + rangeFrom + "," + rangeTo + "," + data.by_name + "," + user_id + "," + data.by_callee + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getreportFilter(req, res) {
    let data = req.body.filters;
    let user_id = req.body.customer_id;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_name = data.by_name != "" ? "'" + data.by_name + "'" : null;
    data.by_caller = data.by_caller != "" ? "'" + data.by_caller + "'" : null;
    let sql = knex.raw("Call pbx_getOCreportByFilter(" + rangeFrom + "," + rangeTo + "," + data.by_name + "," + user_id + "," + data.by_caller + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}
function getreportFilterTwo(req, res) {
    let data = req.body.filters;
    let user_id = req.body.customer_id;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_name = data.by_name != "" ? "'" + data.by_name + "'" : null;
    data.by_caller = data.by_caller != "" ? "'" + data.by_caller + "'" : null;
    let sql = knex.raw("Call pbx_getOCTworeportByFilter(" + rangeFrom + "," + rangeTo + "," + data.by_name + "," + user_id + "," + data.by_caller + ")")
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}







function getoutboundCDR(req, res) {
    let outboundcdrId = parseInt(req.query.outbound_id);
    let sql = knex.raw(`select cdr.*, pc.status from pbx_outbound_conference_participant as oc  \
join pbx_conference_outbound_cdr as cdr on oc.instance_id = cdr.instance_id \
left join pbx_outbound_conference pc on pc.instance_id = cdr.instance_id \
where oc.instance_id = ${outboundcdrId} group by cdr.callee  order by cdr.session_start desc`)
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

//     function getoutboundCDR(req, res) {
//         let outboundcdrId = parseInt(req.query.outbound_id);
//    let sql = knex(table.tbl_pbx_outbound_conference + ' as oc').select('cdr.*')
//    .leftJoin(table.tbl_pbx_conference_outbound_cdr + ' as cdr','oc.instance_id','cdr.instance_id')
//    .where('oc.instance_id',outboundcdrId)
//    .groupBy('cdr.callee') .orderBy('cdr.session_start','desc')
//    sql.then((response) => {
//             if (response) {
//                 res.send({ response: response });
//             }
//         }).catch((err) => {
//             res.send({ response: { code: err.errno, message: err.sqlMessage } });
//         });
//     }

function getoutboundCDRAssociate(req, res) {
    let outboundcdrId = parseInt(req.query.outbound_id);
    let sql = knex(table.tbl_pbx_outbound_conference_participant + ' as oc').select('cdr.*')
        .leftJoin(table.tbl_pbx_conference_outbound_cdr + ' as cdr', 'oc.instance_id', 'cdr.instance_id')
        .where('oc.instance_id', outboundcdrId)
        .groupBy('cdr.callee').orderBy('cdr.session_start', 'desc')
    sql.then((response) => {
        if (response) {
            res.send({ response: response });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}
function getstatusById(req, res) {
    let statusId = parseInt(req.query.id);
    let sql = knex(table.tbl_pbx_outbound_conference).select('status')
        .where('id', statusId)
    sql.then((response) => {
        if (response) {
            res.send({ response: response });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}
function getoutboundParticipants(req, res) {
    let id = req.query.id;
    let sql = knex.select('contact', 'id', 'conf_id', 'num_of_tires', 'dialed_status')
        .from(table.tbl_pbx_outbound_conference_participant)
        .where('conf_id', id)
        .orderBy('id', 'desc')

    sql.then(response => {
        res.send({ response })
    })

}






module.exports = {
    addOC, viewOC, getConferenceCount, deleteOC, viewOCGroupById, updateOCGroup, partiallyUpdateOC, getOCRecordingList, deleteRecording, filterRecordingList,
    isOCExist, outboundcdr, getoutboundcdrFilter, outboundreport, getoutboundCDR, getreportFilter, getstatusById, outboundreportstatusNotlive, getreportFilterTwo, getoutboundCDRAssociate, getoutboundParticipants, partiallyUpdateOCStop, getStatusOC, livecallforOC
}