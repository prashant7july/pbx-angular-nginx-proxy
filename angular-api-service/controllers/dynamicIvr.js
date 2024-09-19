const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');


/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/

function getDynamicIvrList(req,res){

    let customer_id = req.query.customer_id;
    let sql = knex.from(table.tbl_pbx_dynamic_ivr)
    .select('*', knex.raw('DATE_FORMAT(created_at, "%d/%m/%Y %H:%i:%s") as created_at'))
    .where('customer_id',customer_id)
    console.log(sql.toQuery())
    sql.then((response)=>{
        res.send({
            status_code : 200,
            response: response
        })
    }).catch((err) => { 
        console.log(err); res.status(401)
        .send({ error: 'error', message: 'DB Error: ' + err.message });
         throw err
         });
   
}


function filterDynamicIvrList(req,res){

    console.log(req,"----request on filter dynamic ivr");

    let data = req.body.filters;
    let customer_id = req.body.id;

    let sql = knex.from(table.tbl_pbx_dynamic_ivr)
    .select('*', knex.raw('DATE_FORMAT(created_at, "%d/%m/%Y %H:%i:%s") as created_at'))
    .where('customer_id',customer_id)
    
    if(data.by_name != null){
        sql.andWhere('name','like',"%" + data.by_name + "%")
    }
    console.log(sql.toQuery())
    sql.then((response)=>{
        res.send({
            status_code : 200,
            response: response
        })
    }).catch((err) => { 
        console.log(err); res.status(401)
        .send({ error: 'error', message: 'DB Error: ' + err.message });
         throw err
         });

}


function saveDynamicIvr(req,res){
    let data = req.body.credentials;

    knex.table(table.tbl_pbx_dynamic_ivr).select('id').where('name','like',data.name).andWhere('customer_id',data.customer_id)
    .then((response)=>{
        if(response.length > 0){
            res.send({
                status:409,
                message: "Name already exists."
            })
        }else{
            knex.table(table.tbl_pbx_dynamic_ivr).insert({
                name: data.name,
                prompt : data.prompt,
                dtmf: data.dtmf,
                recording: data.recording,
                url_api: data.url_api,
                url_api_action : data.url_api_action,
                url_api_response: url_api_response,
                customer_id :  data.customer_id
            }).then((response2)=>{
                res.send({
                    status:200,
                    message: "Dynamic IVR created successfully."
                })
            }).catch((err) => { 
                console.log(err); res.status(401)
                .send({ error: 'error', message: 'DB Error: ' + err.message });
                 throw err
                 });
        }

    })


    

}


module.exports = {
    getDynamicIvrList,filterDynamicIvrList,saveDynamicIvr
}