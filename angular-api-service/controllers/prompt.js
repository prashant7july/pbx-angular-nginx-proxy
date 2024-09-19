const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require('../helper/modulelogger');

function updatePrompt(req, res) { 
    var data = req.body.prompt;
   let sql =  knex(table.tbl_pbx_prompt)
    .count('prompt_name as nameCount')
    .where('prompt_name', data.prompt_name)
    .andWhere('prompt_type', data.promtTypeId)
    .whereNot('id', data.id);
    sql.then((response) => {
        if (response[0].nameCount > 0) {
            res.json({
                code : 409, // 409 is given for duplicate name : - Nagender
                error_msg: 'Prompt Name is already Exist'
            });
        } else {
            knex(table.tbl_pbx_prompt).where('id', '=', "" + data.id + "")
            .update({ prompt_name: "" + data.prompt_name + "",
                      prompt_desc: "" + data.prompt_description + "" })
            .then((response) => {
                input = {
                    "Prompt Name": req.body.prompt.prompt_name,
                    "Prompt Description": req.body.prompt.prompt_description
                }
                createModuleLog(table.tbl_pbx_audit_logs,{
                    module_action_id: req.body.prompt.id,
                    module_action_name: req.body.prompt.prompt_name,
                    module_name: "prompt",
                    message: "Prompt Updated",
                    customer_id: req.body.prompt.customer_id,
                    features: "" + JSON.stringify(input) + ""
                })
                if (response === 1) {
                    res.json({
                        response
                    });
                } else {
                    res.status(401).send({ error: 'Success', message: 'Provider updated' });
                }
            }).catch((err) => { console.log(err); throw err });
        }
    })
}


function deletePrompt(req, res) {
    let id = parseInt(req.body.id);
    var sql = knex(table.tbl_pbx_prompt).where('id', '=', "" + id + "").andWhere('customer_id', req.body.customer_id)
        .del();
    sql.then((response) => {
        if (response == 1) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'Prompt not deleted' });
        }
    }).catch((err) => { console.log(err); throw err });
}

function getPromptById(req, res) {
    let id = parseInt(req.query.id);
    knex.select('prompt_name', 'prompt_type', 'file_path', 'id', 'customer_id', 'prompt_desc')
        .from(table.tbl_pbx_prompt)
        .where('id', '=', id)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

// function promptDetails(req, res) {
//     var sql = knex.select('prompt_name', 'prompt_type', 'file_path', 'id', 'customer_id', 'prompt_desc')
//         .from(table.tbl_pbx_prompt)
//         .where('customer_id', '=', req.body.user_id)
//         .andWhere('status', '=', '1')
//         .orderBy('id', 'desc');
//     sql.then(async(response) => {
//         let Map = [];
//         // let data.id = 680
//         Map = response ? response : null
//         Map.map((data) => {
//             let sql1 = knex.distinct().select('p.*').from(table.tbl_pbx_prompt + ' as p')
            
//                 // .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'ivr.welcome_prompt', 'p.id' ) 
//                 .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', function () {
//                     this.on(function () {
//                         this.on('ivr.welcome_prompt', '=', 'p.id');
//                         this.orOn('ivr.repeat_prompt', '=', 'p.id');
//                         this.orOn('ivr.invalid_sound', '=', 'p.id');
//                         this.orOn('ivr.timeout_prompt', '=', 'p.id');
//                     });
//                 })
//                 // .leftJoin(table.tbl_PBX_queue + ' as pq', 'pq.welcome_prompt', 'p.id')
//                 .leftJoin(table.tbl_PBX_queue + ' as pq', function () {
//                     this.on(function () {
//                         this.on('pq.welcome_prompt', '=', 'p.id');
//                         this.orOn('pq.moh', '=', 'p.id');
//                     });
//                 })
//                 .leftJoin(table.tbl_Time_Group + ' as t', 't.prompt_id', 'p.id')
//                 // .leftJoin(table.tbl_PBX_conference + ' as c', 'c.welcome_prompt', 'p.id')
//                 .leftJoin(table.tbl_PBX_conference + ' as c', function () {
//                     this.on(function () {
//                         this.on('c.welcome_prompt', '=', 'p.id');
//                         this.orOn('c.moh', '=', 'p.id');
//                     });
//                 })
//                 // .leftJoin(table.tbl_pbx_tc + ' as tc', 'tc.welcome_prompt', 'p.id')
//                 .leftJoin(table.tbl_pbx_tc + ' as tc', function () {
//                     this.on(function () {
//                         this.on('tc.welcome_prompt', '=', 'p.id');
//                         this.orOn('tc.moh', '=', 'p.id');
//                     });
//                 })
//                 .leftJoin(table.tbl_pbx_broadcast + ' as b', 'b.welcome_prompt', 'p.id')
//                 .leftJoin(table.tbl_PBX_CALLGROUP + ' as cg', 'cg.prompt', 'p.id')
//                 .where('ivr.welcome_prompt', data.id)
//                 .orWhere('ivr.repeat_prompt', data.id)
//                 .orWhere('ivr.invalid_sound', data.id)
//                 .orWhere('ivr.timeout_prompt', data.id)
//                 .orWhere('pq.welcome_prompt', data.id)
//                 .orWhere('pq.moh', data.id)
//                 .orWhere('t.prompt_id', data.id)
//                 .orWhere('c.welcome_prompt', data.id)
//                 .orWhere('c.moh', data.id)
//                 .orWhere('tc.welcome_prompt', data.id)
//                 .orWhere('tc.moh', data.id)
//                 .orWhere('b.welcome_prompt', data.id)
//                 .orWhere('cg.prompt', data.id);
//             sql1.then(async (responses) => {    
//                 if (responses.length) {
//                     await Object.assign(data, { flag: 1 });
//                 }
//             });
//         })
//     // setTimeout(() => {    
//     //     res.send({ response: Map });
//     // }, 500);  
//     //     res.send({
//     //         response: Map
//     //     });
//     }).catch((err) => { console.log(err); throw err });
// }




function getmappedPackagesById(req, res) {
    let userId = parseInt(req.query.id);
    console.log(userId,"---------");
    let promptId = parseInt(req.query.promptId);
    let type = parseInt(req.query.prompt_type);
    let sql = knex.from(table.tbl_pbx_prompt + ' as p')   
    if(req.query.prompt_type == '3' || req.query.prompt_type == '17') {
        sql.leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', function () {
            this.on(function () {
                this.on('ivr.welcome_prompt', '=', 'p.id');
                this.orOn('ivr.repeat_prompt', '=', 'p.id');
                this.orOn('ivr.invalid_sound', '=', 'p.id');
                this.orOn('ivr.timeout_prompt', '=', 'p.id');
            });
        })
        // sql.leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'ivr.welcome_prompt', 'p.id' );       
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(ivr.name)) as ivr_name'))
    }   
    if(req.query.prompt_type == '5' || req.query.prompt_type == '17' || req.query.prompt_type == '1') {
        // sql.leftJoin(table.tbl_PBX_queue + ' as pq', 'pq.welcome_prompt', 'p.id')
        sql.leftJoin(table.tbl_PBX_queue + ' as pq', function () {
            this.on(function () {
                this.on('pq.welcome_prompt', '=', 'p.id');
                this.orOn('pq.moh', '=', 'p.id');
            });
        })
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(pq.name)) as queue_name'))
    }
    if(req.query.prompt_type == '6' || req.query.prompt_type == '17')  {
        sql.leftJoin(table.tbl_Time_Group + ' as t', 't.prompt_id', 'p.id')
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(t.name)) as t_name'));
    }
    if(req.query.prompt_type == '4' || req.query.prompt_type == '17' || req.query.prompt_type == '1') {
        // sql.leftOuterJoin(table.tbl_PBX_conference + ' as c', 'c.welcome_prompt', 'p.id')   
        sql.leftJoin(table.tbl_PBX_conference + ' as c', function () {
            this.on(function () {
                this.on('c.welcome_prompt', '=', 'p.id');
                this.orOn('c.moh', '=', 'p.id');
            });
        })     
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(c.name)) as c_name'));                 
  }

    
    if(req.query.prompt_type == '10' || req.query.prompt_type == '17' || req.query.prompt_type == '1') {
        // sql.leftJoin(table.tbl_pbx_tc + ' as tc', 'tc.welcome_prompt', 'p.id')
        sql.leftJoin(table.tbl_pbx_tc + ' as tc', function () {
            this.on(function () {
                this.on('tc.welcome_prompt', '=', 'p.id');
                this.orOn('tc.moh', '=', 'p.id');
            });
        })
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(tc.name)) as tc_name'));         
    }
    if(req.query.prompt_type == '11' || req.query.prompt_type == '17') {
        sql.leftJoin(table.tbl_pbx_broadcast + ' as b', 'b.welcome_prompt', 'p.id')     
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(b.name)) as b_name'));    
    }
    if(req.query.prompt_type == '16' || req.query.prompt_type == '17') {    
        sql.leftJoin(table.tbl_PBX_CALLGROUP + ' as cg', 'cg.prompt', 'p.id')
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(cg.name)) as cg_name'));    
    }
    if(req.query.prompt_type == '17' || req.query.prompt_type == '1') {    
        sql.leftJoin(table.pbx_obd + ' as ob', 'ob.prompt', 'p.id')
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(ob.name)) as ob_name'));    
    }
    if(req.query.prompt_type == '17' || req.query.prompt_type == '1') {    
        sql.leftJoin(table.tbl_pbx_outbound_conference + ' as obc', 'obc.welcome_propmt', 'p.id')
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(obc.name)) as obc_name'));    
    }
    if(req.query.prompt_type == '17' || req.query.prompt_type == '1') {    
        sql.leftJoin(table.tbl_pbx_appointment + ' as app', function(){
            this.on(function (){
                this.on('app.welcome_prompt', '=', 'p.id');
                this.orOn('app.invalid_prompt', '=', 'p.id');
                this.orOn('app.timeout_prompt', '=', 'p.id');
            })
        })   
        sql.select('p.prompt_type',knex.raw(' GROUP_CONCAT(DISTINCT(app.name)) as ap_name'));    

    }
    if (req.query.prompt_type == '15') {
        // sql.leftJoin(table.tbl_pbx_tc + ' as tc', 'tc.welcome_prompt', 'p.id')
        sql.leftJoin(table.tbl_Extension_master + ' as em', function () {
          this.on(function () {
            this.on('em.ringtone_id', '=', 'p.id').andOn('em.customer_id', '=', userId);
          });
        })
        sql.select('p.prompt_type', knex.raw('GROUP_CONCAT(CONCAT(em.ext_number, "-", em.caller_id_name)) as ext_name'));
      }
    sql.where('p.id', '=', promptId)
    sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}  

async function promptDetails(req, res) {
    try {
        const response = await knex
            .select('prompt_name', 'prompt_type', 'file_path', 'id', 'customer_id', 'prompt_desc')
            .from(table.tbl_pbx_prompt)
            .where('customer_id', '=', req.body.user_id)
            .andWhere('status', '=', '1')
            .orderBy('id', 'desc');

        for (const data of response) {
            const conditions = [
                // Define conditions for each table
                { table: table.tbl_Pbx_Ivr_Master, fields: ['welcome_prompt', 'repeat_prompt', 'invalid_sound', 'timeout_prompt'] },
                { table: table.tbl_PBX_queue, fields: ['welcome_prompt', 'moh'] },
                { table: table.tbl_PBX_conference, fields: ['welcome_prompt', 'moh'] },
                { table: table.tbl_pbx_tc, fields: ['welcome_prompt', 'moh'] },
                { table: table.tbl_pbx_broadcast, fields: ['welcome_prompt'] },
                { table: table.tbl_PBX_CALLGROUP, fields: ['prompt'] },
                { table: table.tbl_Time_Group, fields: ['prompt_id'] },
                { table: table.tbl_pbx_appointment, fields: ['timeout_prompt','invalid_prompt','welcome_prompt']},
                { table: table.pbx_obd, fields: ['prompt']},
                { table: table.tbl_pbx_outbound_conference, fields: ['welcome_propmt']},
                { table: table.tbl_Extension_master, fields: ['ringtone_id']}
                // Add conditions for other tables
            ];

            let flag = 0;

            for (const condition of conditions) {
                const responses = await knex
                    .distinct()
                    .select('p.*')
                    .from(table.tbl_pbx_prompt + ' as p')
                    .leftJoin(condition.table, function () {
                        this.on(function () {
                            condition.fields.forEach(field => this.orOn(`${condition.table}.${field}`, '=', 'p.id'));
                        });
                    })
                    .where(builder => {
                        condition.fields.forEach(field => builder.orWhere(`${condition.table}.${field}`, data.id));
                    });

                if (responses.length > 0) {
                    flag = 1;
                    break; // If any condition is met, set flag and exit loop
                }
            }

            // Assign the flag property to the current data object
            data.flag = flag;
        }

        res.send({ response });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

// function getPromptByFilters(req, res) {
//     let data = req.body.filters;
//     let sql = knex.select('prompt_name', 'prompt_type', 'file_path', 'id', 'customer_id', 'prompt_desc')
//         .from(table.tbl_pbx_prompt)
//         .where('customer_id', '=', data.customer_id)
//         .andWhere('status', '=', '1')
//         .orderBy('id', 'desc');

//     if (data.by_name != '' && data.by_type == '') {
//         sql = sql.andWhere('prompt_name', 'like', "%" + data.by_name + "%");
//     } else if (data.by_name == '' && data.by_type != '') {
//         sql = sql.andWhere('prompt_type', '=', "" + data.by_type + "");
//     } else if (data.by_name != '' && data.by_type != '') {
//         sql = sql.andWhere('prompt_name', 'like', "%" + data.by_name + "%")
//             .andWhere('prompt_type', '=', "" + data.by_type + "");
//     } else {
//         sql = sql;
//     }
//     sql.then((response) => {
//         if (response) {
//             let Map = [];
//             // let data.id = 680
//             Map = response ? response : null
//             Map.map((data) => {
//                 let sql2 = knex.distinct().select('p.prompt_name').from(table.tbl_pbx_prompt + ' as p')
                
//                     // .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'ivr.welcome_prompt', 'p.id' ) 
//                     .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', function () {
//                         this.on(function () {
//                             this.on('ivr.welcome_prompt', '=', 'p.id');
//                             this.orOn('ivr.repeat_prompt', '=', 'p.id');
//                             this.orOn('ivr.invalid_sound', '=', 'p.id');
//                             this.orOn('ivr.timeout_prompt', '=', 'p.id');
//                         });
//                     })
//                     // .leftJoin(table.tbl_PBX_queue + ' as pq', 'pq.welcome_prompt', 'p.id')
//                     .leftJoin(table.tbl_PBX_queue + ' as pq', function () {
//                         this.on(function () {
//                             this.on('pq.welcome_prompt', '=', 'p.id');
//                             this.orOn('pq.moh', '=', 'p.id');
//                         });
//                     })
//                     .leftJoin(table.tbl_Time_Group + ' as t', 't.prompt_id', 'p.id')
//                     // .leftJoin(table.tbl_PBX_conference + ' as c', 'c.welcome_prompt', 'p.id')
//                     .leftJoin(table.tbl_PBX_conference + ' as c', function () {
//                         this.on(function () {
//                             this.on('c.welcome_prompt', '=', 'p.id');
//                             this.orOn('c.moh', '=', 'p.id');
//                         });
//                     })
//                     // .leftJoin(table.tbl_pbx_tc + ' as tc', 'tc.welcome_prompt', 'p.id')
//                     .leftJoin(table.tbl_pbx_tc + ' as tc', function () {
//                         this.on(function () {
//                             this.on('tc.welcome_prompt', '=', 'p.id');
//                             this.orOn('tc.moh', '=', 'p.id');
//                         });
//                     })
//                     .leftJoin(table.tbl_pbx_broadcast + ' as b', 'b.welcome_prompt', 'p.id')
//                     .leftJoin(table.tbl_PBX_CALLGROUP + ' as cg', 'cg.prompt', 'p.id')
//                     .where('ivr.welcome_prompt', data.id)
//                     .orWhere('ivr.repeat_prompt', data.id)
//                     .orWhere('ivr.invalid_sound', data.id)
//                     .orWhere('ivr.timeout_prompt', data.id)
//                     .orWhere('pq.welcome_prompt', data.id)
//                     .orWhere('pq.moh', data.id)
//                     .orWhere('t.prompt_id', data.id)
//                     .orWhere('c.welcome_prompt', data.id)
//                     .orWhere('c.moh', data.id)
//                     .orWhere('tc.welcome_prompt', data.id)
//                     .orWhere('tc.moh', data.id)
//                     .orWhere('b.welcome_prompt', data.id)
//                     .orWhere('cg.prompt', data.id);
//                 sql2.then(async (responses) => {   
//                     if (responses.length) {
//                         await Object.assign(data, { flag: 1 });
//                     }
//                 });
//             })
//             setTimeout(() => {     
//                 res.send({ response: Map });
//             }, 500);  
//             // res.json({
//             //     response
//             // });
//         } else {
//             res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
//         }
//     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
// }
async function getPromptByFilters(req, res) {
    try {
        const data = req.body.filters;                
        const response = await knex
            .select('prompt_name', 'prompt_type', 'file_path', 'id', 'customer_id', 'prompt_desc')
            .from(table.tbl_pbx_prompt)
            .where('customer_id', '=', data.customer_id)
            .andWhere('status', '=', '1')
            .andWhere(builder => {
                if (data.by_name !== '' && data.by_type === '') {
                    builder.andWhere('prompt_name', 'like', `%${data.by_name}%`);
                } else if (data.by_name === '' && data.by_type !== '') {
                    builder.andWhere('prompt_type', '=', `${data.by_type}`);
                } else if (data.by_name !== '' && data.by_type !== '') {
                    builder.andWhere('prompt_name', 'like', `%${data.by_name}%`)
                    builder.andWhere('prompt_type', '=', `${data.by_type}`);
                }
            })
            .orderBy('id', 'desc');                      
        for (const data of response) {
            const conditions = [
                // Define conditions for each table
                { table: table.tbl_Pbx_Ivr_Master, fields: ['welcome_prompt', 'repeat_prompt', 'invalid_sound', 'timeout_prompt'] },
                { table: table.tbl_PBX_queue, fields: ['welcome_prompt', 'moh'] },
                { table: table.tbl_PBX_conference, fields: ['welcome_prompt', 'moh'] },
                { table: table.tbl_pbx_tc, fields: ['welcome_prompt', 'moh'] },
                { table: table.tbl_pbx_broadcast, fields: ['welcome_prompt'] },
                { table: table.tbl_PBX_CALLGROUP, fields: ['prompt'] },
                { table: table.tbl_Time_Group, fields: ['prompt_id'] },
                { table: table.tbl_pbx_appointment, fields: ['timeout_prompt','invalid_prompt','welcome_prompt']},
                { table: table.pbx_obd, fields: ['prompt']},
                { table: table.tbl_pbx_outbound_conference, fields: ['welcome_propmt']},
                { table: table.tbl_Extension_master, fields: ['ringtone_id']}
                // Add conditions for other tables
            ];

            let flag = 0;

            for (const condition of conditions) {           
                const responses = await knex
                    .distinct()
                    .select('p.*')
                    .from(table.tbl_pbx_prompt + ' as p')
                    .leftJoin(condition.table, function () {
                        this.on(function () {
                            condition.fields.forEach(field => this.orOn(`${condition.table}.${field}`, '=', 'p.id'));
                        });
                    })
                    .where(builder => {
                        condition.fields.forEach(field => builder.orWhere(`${condition.table}.${field}`, data.id));
                    })                                                      
                if (responses.length > 0) {
                    flag = 1;
                    break; // If any condition is met, set flag and exit loop
                }
            }
            
            // Assign the flag property to the current data object
            data.flag = flag;
        }

        res.send({ response });
      
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }

}


function getMOHPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        .whereIn('prompt_type',['1','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getConferencePrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','4')
        .whereIn('prompt_type',['4','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getQueuePrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','5')
        .whereIn('prompt_type',['5','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc')
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getIVRPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','3')
        .whereIn('prompt_type',['3','17'])
        .andWhere('status', '=', '1')
        .orderBy('prompt_name', 'asc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getTimeGroupPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','6')
        .whereIn('prompt_type',['6','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getTimeGroupPromptForExtension(req, res) {
    let extensionId = req.query.customerId;
    var sql = knex.select('customer_id').from(table.tbl_Extension_master)
        .where('id', '=', extensionId)
    sql.then((response) => {
        if (response) {
            let customer_id = response ? response[0]['customer_id']  : 0 ;
            var sql2 = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
                .where('customer_id', '=', customer_id)
                // .andWhere('prompt_type', '=', '6')
                .whereIn('prompt_type',['6','17'])
                .andWhere('status', '=', '1')
                .orderBy('id', 'desc');
            sql2.then((response) => {
                res.json({
                    response
                })
            }).catch((err) => { console.log(err); throw err });
        }
    }).catch((err) => { console.log(err); throw err });
}


function getTCPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','10')
        .whereIn('prompt_type',['10','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getBCPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','11')
        .whereIn('prompt_type',['11','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getPromptAssociated(req, res) {
    let prompt_id = Number(req.query.prompt_id);
    let prompt_type = (req.query.prompt_type);
    if(prompt_type == '1'){ // MOH
        var countQuery = knex.select(knex.raw('COUNT(cl.id) as count'))
        .from(table.tbl_PBX_CALLGROUP + ' as cl')
        .leftJoin(table.tbl_PBX_queue + ' as q', 'q.moh', prompt_id)
        .leftJoin(table.tbl_PBX_conference + ' as conf', 'conf.moh', prompt_id)
        .where('cl.moh','=', prompt_id)
        .orWhere('q.moh', '=', prompt_id)
        .orWhere('conf.moh', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

 
      }else if(prompt_type == '2'){ //VOICE MAIL
        var countQuery = knex.select(knex.raw('COUNT(ivrd.ivr_id) as count'))
        .from(table.tbl_pbx_ivr_detail + ' as ivrd')
        // .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
        // .where('bc.welcome_prompt','=', prompt_id)
        .orWhere('ivrd.ivr_action', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        

    } else if (prompt_type == '3') { //IVR
        var countQuery = knex.select(knex.raw('COUNT(ivr.customer_id) as count'))
            .from(table.tbl_Pbx_Ivr_Master + ' as ivr')
            .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd','ivrd.ivr_id','ivr.id')
            .where('ivr.welcome_prompt','=', prompt_id)
            .orWhere('ivr.repeat_prompt', '=', prompt_id)
            .orWhere('ivr.invalid_sound', '=', prompt_id)
            .orWhere('ivr.timeout_prompt', '=', prompt_id)
            .orWhere('ivr.timeout_prompt', '=', prompt_id)
            .orWhere('ivrd.ivr_action', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
      
    }else if(prompt_type == '4'){ //CONFERENCE
        var countQuery = knex.select(knex.raw('COUNT(conf.customer_id) as count'))
            .from(table.tbl_PBX_conference + ' as conf')
            .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action',prompt_id)
            .where('conf.welcome_prompt', '=', prompt_id)
            .orWhere('ivrd.ivr_action', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

      }else if(prompt_type == '5'){ //QUEUE
        var countQuery = knex.select(knex.raw('COUNT(q.id) as count'))
            .from(table.tbl_PBX_queue + ' as q')
            .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
            .where('q.welcome_prompt', '=', prompt_id)
            .orWhere('ivrd.ivr_action', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
     
    }else if(prompt_type == '6'){ //TIME GROUP
        var countQuery = knex.select(knex.raw('COUNT(tg.id) as count'))
        .from(table.tbl_Time_Group + ' as tg')
        .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
        .where('tg.prompt_id', '=', prompt_id)
        .orWhere('ivrd.ivr_action', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

      }else if(prompt_type == '10'){ //TELE CONSULTATION
        var countQuery = knex.select(knex.raw('COUNT(tc.id) as count'))
        .from(table.tbl_pbx_tc + ' as tc')
        .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
        .where('tc.welcome_prompt','=', prompt_id)
        .orWhere('tc.periodic_announcement_prompt', '=', prompt_id)
        .orWhere('ivrd.ivr_action', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

      }else if(prompt_type == '11'){  //BROADCAST
        var countQuery = knex.select(knex.raw('COUNT(bc.id) as count'))
        .from(table.tbl_pbx_broadcast + ' as bc')
        .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
        .where('bc.welcome_prompt','=', prompt_id)
        .orWhere('ivrd.ivr_action', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    } else if (prompt_type == '15') {  //RINGTONE
        var countQuery = knex.select(knex.raw('COUNT(em.id) as count'))
            .from(table.tbl_Extension_master + ' as em')
            // .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
            .where('em.ringtone', '=', prompt_id);
            // .orWhere('ivrd.ivr_action', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (prompt_type == '16') {  //CALL GROUP
        var countQuery = knex.select(knex.raw('COUNT(cg.id) as count'))
            .from(table.tbl_PBX_CALLGROUP + ' as cg')
            .where('cg.prompt', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (prompt_type == '17') {  //GENERAL
        var countQuery = knex.select(knex.raw('COUNT(cg.id) as count'))
            .from(table.tbl_PBX_CALLGROUP + ' as cg')
            .where('cg.prompt', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if(prompt_type == '17' || prompt_type == '1') {
       // pagedData[i]['prompt_type_name'] = '';
      }
    }

function getCallGroupPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type', '=', '16')
        .whereIn('prompt_type',['16','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getGeneralPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        .andWhere('prompt_type', '=', '17').andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}


module.exports = {
    promptDetails, getPromptByFilters, getPromptById, deletePrompt, updatePrompt,getmappedPackagesById,
    getMOHPrompt,getConferencePrompt,getQueuePrompt,getIVRPrompt,getTimeGroupPrompt,getTimeGroupPromptForExtension,
    getTCPrompt, getBCPrompt,getPromptAssociated, getCallGroupPrompt, getGeneralPrompt
};
