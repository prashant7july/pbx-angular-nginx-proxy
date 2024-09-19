const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');


function createWhatsappTemplate(req, res){    
    let data = req.body.credentials
    let sql = knex(table.tbl_pbx_whatsapp_template).insert({name: data.name, description: data.description, text: data.text, customer_id: data.user_id, social_channel_id: data.social_channel});
    sql.then((response) => {
        if(response){
            res.send({
                code: 200,
                response
            })
        }
    }).catch((err) => {
        res.send({  code: err.errno, message: err.sqlMessage } );
    })
}


function getTemplate(req, res){      
    let user_id = req.query.customer_id;           
    let sql = knex(table.tbl_pbx_whatsapp_template + ' as wt').select('wt.*').where('wt.customer_id',user_id);
    if(req.body.credentials != '' && req.body.credentials != 1 && req.body.credentials != 2 && req.body.credentials != 3){
        sql.andWhere('wt.name', 'like', "%" + req.body.credentials.name + "%");
    }else if(req.body.credentials == 1){
        sql.join(table.tbl_pbx_socialMedia_channel + ' as sc', ' sc.id', 'wt.social_channel_id').join(table.tbl_pbx_whatsapp_provider + ' as wp', 'wp.id', 'sc.whatsapp_provider').andWhere('wp.id',1);
    }else if(req.body.credentials == 2){
        sql.join(table.tbl_pbx_socialMedia_channel + ' as sc', ' sc.id', 'wt.social_channel_id').join(table.tbl_pbx_whatsapp_provider + ' as wp', 'wp.id', 'sc.whatsapp_provider').andWhere('wp.id',2);
    }else if(req.body.credentials == 3){
        sql.join(table.tbl_pbx_socialMedia_channel + ' as sc', ' sc.id', 'wt.social_channel_id').join(table.tbl_pbx_whatsapp_provider + ' as wp', 'wp.id', 'sc.whatsapp_provider').andWhere('wp.id',3);
    }
    sql.then((response) => {        
            res.send({
                response
            })        
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    })
}

function deleteTemplate(req, res){
    let data = req.body.credentials;    
    let sql = knex(table.tbl_pbx_whatsapp_template).where('id',data).del();
    sql.then((response) => {        
        if (response) {
            res.json({
                response: response,
                code: 200
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    })
}

function getTemplateById(req, res){    
    let data = req.query;
    let sql = knex(table.tbl_pbx_whatsapp_template).select('*').where('id',data.id);
    sql.then((response) => {        
        if(response){
            res.send({
                response
            })
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    })
}

function updateTemplateDetail(req, res){
    let data = req.body.credentials;    
    let sql = knex(table.tbl_pbx_whatsapp_template).update({name: data.name, text: data.text, description: data.description}).where('id',data.id).where('customer_id',data.user_id);
    sql.then((response) => {     
            res.send({
                code: 200
            })        
    }).catch((err) => {      
        console.log(err)  
        res.send({ code: err.errno, message: err.sqlMessage });
    })
}


// Social Media Channel ----------------------------------------

function providerList(req, res){
    let sql = knex(table.tbl_pbx_whatsapp_provider).select().then((response) => {
        res.send({
            response
        })
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    })
}

function createSocialMediaChannel(req, res){
    let data = req.body.credentials;
    let sql = knex(table.tbl_pbx_socialMedia_channel).insert({channel_name: data.channel_name, description: data.description, whatsapp_provider: data.provider, access_key: data.access_key,
                    channel_user_id: data.caller_id, mehery_domain: data.mehry_domain, namespace: data.namespace, outbound_prepend_digit: data.prepend_digit, outbound_strip_digit: data.strip_digit, customer_id: data.user_id});
    sql.then((response) => {        
        res.send({
            status_code: 200,
            response
        })
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    })    
}
function updateSocialMediaChannel(req, res){
    let data = req.body.credentials;
    let sql = knex(table.tbl_pbx_socialMedia_channel).update({channel_name: data.channel_name, description: data.description, whatsapp_provider: data.provider, access_key: data.access_key,
                    channel_user_id: data.caller_id, mehery_domain: data.mehry_domain, namespace: data.namespace, outbound_prepend_digit: data.prepend_digit, outbound_strip_digit: data.strip_digit, customer_id: data.user_id})
                    .where('id',data.id).where('customer_id',data.user_id);
    sql.then((response) => {    
        res.send({
            status_code: 200,
            response
        })
    }).catch((err) => {
        console.log(err)
        res.send({ code: err.errno, message: err.sqlMessage });
    })    
}

function getMediaChannel(req, res){
    let user_id = req.query.customerId;
    let sql = knex(table.tbl_pbx_socialMedia_channel + ' as sm').select('sm.*').where('customer_id', user_id).orderBy('sm.id', 'desc');
 
    sql.then((response) => {
        // if(response.length){
            res.send({
                status_code: 200,
                response
            })
        // }else{
        //     res.status(202).send({ status_code: 202, message: "No Data Found." });
        // }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    })
}
function deleteSocialGroup(req, res){
    let data = req.body.credentials;    
    let sql = knex(table.tbl_pbx_socialMedia_channel).where('id',data).del();
    sql.then((response) => {        
        if (response) {
            res.json({
                response: response,
                code: 200
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    })
}
function getSocialById(req, res){    
    let data = req.query;
    let sql = knex(table.tbl_pbx_socialMedia_channel).select('*').where('id',data.id);
    sql.then((response) => {        
        if(response){
            res.send({
                response
            })
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    })
}
function getSocialFilter(req,res){
    let data = req.body.filters
    let customer_id = req.body.customer_id
    let sql = knex(table.tbl_pbx_socialMedia_channel).select('*').where('customer_id',customer_id);
    if(data.channel_name != null){
        sql.andWhere('channel_name', 'like', '%' +data.channel_name+ '%');
    }
    sql.then((response) =>{
        res.send({
            response: response
        });
    })
}




module.exports = {
    createWhatsappTemplate, getTemplate, deleteTemplate, getTemplateById, updateTemplateDetail, providerList, createSocialMediaChannel, getMediaChannel,deleteSocialGroup,getSocialById,updateSocialMediaChannel,getSocialFilter
}