const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const { from } = require('form-data');
const { response } = require('express');
const e = require('express');
/**
* @param req
* @param res
* @returns {*}
*/



function createAccessRestriction(req, res) {    
    let allow_ip_restriction = ''
    if (!req.body.allow_ip_restriction || req.body.allow_ip_restriction == '' || req.body.allow_ip_restriction == 'false') {
        allow_ip_restriction = 'N'
    }
    else {
        allow_ip_restriction = 'Y'
    }
    // if(req.body.allow_ip_restriction == true){
    //     allow_ip_restriction = 'Y';
    // }else{
    //     allow_ip_restriction = 'N'
    // }
    let type = '1';
    let data = req.body;    
    // .where('cidr',req.body.cidr)
    // .select(knex.raw('COUNT(cidr) as cidr'))).toString(),"+++++++++++++query>>>>>>>>>>>>>>>>>>>>");
    // knex(table.tbl_pbx_acl_node)
    // .where('cidr',req.body.cidr)
    // .select(knex.raw('COUNT(cidr) as cidr')).then((response1)=>                
            let sql = knex.raw("Call pbx_acl('" + req.body.cidr + "'," + req.body.mask_bit + ",'" + type + "','" + req.body.acl_desc + "','" + req.body.restriction_type + "','" + req.body.access_type + "','" + allow_ip_restriction + "'," + data.user_id + " )");
            sql.then((response) => {                
                if (response) {
                    res.send({
                        response: response,
                        message: 'Access group create successfully',
                        code: 200
                    });
                }
            }).catch((err) => {
                res.send({ code: err.errno, message: err.sqlMessage });
            });

}

function ValidateIP(req,res) {
    let data = req.body.cond;
    let sql = knex(table.tbl_pbx_acl_node).select('cidr')    
    .where('customer_id','=',data.user_id)
    if(!data.id){
        sql.andWhere('cidr','like',data.cidr)
    }else{     
        sql.andWhereNot('id',data.id)   
        sql.andWhere('cidr','like',data.cidr)      
    }
    sql.then((response)=>{        
        if(response.length){
            res.send({
                code:409,
                message:'IP already Exist'
            });
        }
        else{
            res.send({response : response})        
        }
    })
}
function viewAccessCategory(req, res) {
    let customer_id = req.query.customerId;
    knex.select('id', 'cidr', 'mask_bit', 'allow_ip_restriction', 'access_type', 'restriction_type', 'acl_desc')
        .from(table.tbl_pbx_acl_node + ' as ar')
        .where('customer_id', '=', "" + customer_id + "")
        .orderBy('ar.id', 'desc')
        .then((response) => {            
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Contact list ' }); throw err });

}
function getAccessFilter(req, res) {    
    let data = req.body.filters;        
    let customer_id = req.body.customer_id;      
    data.cidr = data.cidr ?  data.cidr : null;    
    if(data.restriction_type == 'ALL'){
        restriction_type = "ALL"
    }else if(data.restriction_type == 'WEB'){
        restriction_type = "WEB"
    }else if(data.restriction_type == 'REGISTRATION'){
        restriction_type = "REGISTRATION"
    }else if(data.restriction_type == 'PSTN'){
        restriction_type = "PSTN"
    }else{
        restriction_type = "null";
    }

    let user;
    let customer;
    let extension;
    let datas = data.access_type=="null" ? [] : data.access_type;  
    user = datas[0] !=undefined ? "'"+datas[0]+"'" : "null";
    customer = datas[1] != undefined ? "'"+datas[1]+"'" : "null";
    extension = datas[2] != undefined ? "'"+datas[2]+"'" : "null"; 
       
    if(data.allow_ip_restriction == 'Y')
    {
        data.allow_ip_restriction = "Y"
    }
    else if(data.allow_ip_restriction == 'N')
    {
        data.allow_ip_restriction = "N"
    }   
    let sql = knex(table.tbl_pbx_acl_node).select('*').where('customer_id',customer_id);
    if(data.cidr != null){
        sql.andWhere('cidr', 'like', '%' +data.cidr+ '%');
    }
    if(restriction_type != "null"){
        sql.andWhere('restriction_type','like',"%"+restriction_type+"%");
    }
    if(data.allow_ip_restriction != "") {
        sql.andWhere('allow_ip_restriction',data.allow_ip_restriction);
    }
    if(data.access_type != ""){
        sql.andWhere(knex.raw("(locate("+user+",access_type) or locate("+customer+",access_type) or locate("+extension+",access_type))"));
    }        
    sql.then((response) =>{
        res.send({
            response: response
        });
    })
}


function deleteAccessGroup(req, res) {
    let data = req.query.id;
    let sql = knex(table.tbl_pbx_acl_node).where('id', "=", "" + data + "").del();
    sql.then((response) => {
        res.send({
            message: "Deleted Successfully.",
            data: response
        })
    })

}
function viewAccessGroupById(req,res){
let data =req.body.id;
let sql = knex(table.tbl_pbx_acl_node)
        .select('*')
        .where('id','like',data);
sql.then((response)=>{    
    res.send({
        response : response[0]
    })
})
}
function updateAccessGroup(req, res) {    
    let data = req.body.id ? req.body.id : 0;
    let cidr = '';
    if (!req.body.cidr || req.body.cidr == '') {
        cidr = '';
    } else {
        cidr = req.body.cidr;
    }
    let mask_bit = '';
    if (!req.body.mask_bit || req.body.mask_bit == '') {
        mask_bit = '';
    } else {
        mask_bit = req.body.mask_bit;
    }
    let acl_desc = '';
    if (!req.body.acl_desc || req.body.acl_desc == '') {
        acl_desc = '';
    } else {
        acl_desc = req.body.acl_desc;
    }
    let allow_ip_restriction = ''
    if (!req.body.allow_ip_restriction || req.body.allow_ip_restriction == '' || req.body.allow_ip_restriction == 'false') {
        allow_ip_restriction = 'N'
    }
    else {
        allow_ip_restriction = 'Y'
    }
    // let allow_ip_restriction = '';
    // if (!req.body.allow_ip_restriction || req.body.allow_ip_restriction == '') {
    //     allow_ip_restriction = '';
    // } else {
    //     allow_ip_restriction = req.body.allow_ip_restriction;
    // }
    let restriction_type = '';
    if (!req.body.restriction_type || req.body.restriction_type == '') {
        restriction_type = '';
    } else {
        restriction_type = req.body.restriction_type;
    }
    let access_type = '';
    if (!req.body.access_type || req.body.access_type == '') {
        access_type = '';
    } else {
        access_type = req.body.access_type;
    }
    let sql = knex(table.tbl_pbx_acl_node)
    .where('id', '=', "" + data + "")
    .update({ cidr: "" + cidr + "", mask_bit: "" + mask_bit + "",acl_desc: "" + acl_desc + "",allow_ip_restriction: "" + allow_ip_restriction + "",restriction_type : "" + restriction_type + "",access_type:"" + access_type + ""});
    sql.then((response) => {
        if (response) {
            knex(table.tbl_pbx_acl_node).select('*').where('id','=',"" + data + "")
            .then((response1)=>{     
                res.send({
                    response: response1,
                    message: 'Access group update successfully',
                    code: 200
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




module.exports = {
    createAccessRestriction, viewAccessCategory, getAccessFilter, deleteAccessGroup,updateAccessGroup,viewAccessGroupById,ValidateIP
};