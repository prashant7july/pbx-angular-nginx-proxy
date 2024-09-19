const { select } = require('async');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');    

function getReseller(req,res) {
    let customer_id = req.query['id'];    
    let product_id = req.query.id;
    if (product_id == '1' || product_id == 1) {
        let sql = knex(table.tbl_Customer + ' as c').join(table.tbl_pbx_roles + ' as pr', 'c.role_id', 'pr.user_type').leftJoin(table.tbl_pbx_user_permission_map + ' as pp','pp.user_id','c.id').join(table.tbl_pbx_permission + ' as p','pp.permission_id','p.id').leftJoin(table.tbl_pbx_reseller_info + ' as re','re.reseller_id','c.id')
        .select('re.product_id','re.reseller_type_id','c.*', 'c.status as status','p.permission_name', knex.raw('CONCAT(c.first_name, \" \" ,c.last_name) as name,    IF (c.status = "0","Inactive", IF (c.status = "1","Active", IF (c.status = "2","Deleted", IF (c.status = "3","Expired", IF (c.status = "4","Suspended for Underpayment", "Suspended for Litigation"))))) as status_text'), 'pr.rolename as user_type')
        .where('c.role_id','=','3').andWhere('re.product_id',1).whereNot('c.status','2').orderBy('c.id','desc')
        sql.then((response) => { 
            if(response) res.json({response:response});
        }).catch((err) => { console.log(err); throw err });
    }
    else{
        let sql = knex(table.tbl_Customer + ' as c').join(table.tbl_pbx_roles + ' as pr', 'c.role_id', 'pr.user_type').leftJoin(table.tbl_pbx_user_permission_map + ' as pp','pp.user_id','c.id').leftJoin(table.tbl_pbx_reseller_info + ' as re','re.reseller_id','c.id')
        .select('re.product_id','re.reseller_type_id','c.id','c.username','c.email','c.mobile','c.company_address','c.status as status', knex.raw('CONCAT(c.first_name, \" \" ,c.last_name) as name,    IF (c.status = "0","Inactive", IF (c.status = "1","Active", IF (c.status = "2","Deleted", IF (c.status = "3","Expired", IF (c.status = "4","Suspended for Underpayment", "Suspended for Litigation"))))) as status_text'), 'pr.rolename as user_type')
        .where('c.role_id','=','3').andWhere('re.product_id',2).whereNot('c.status','2').andWhere('pp.permission_id','=',0).orderBy('c.id','desc')
        sql.then((response) => { 
            if(response) res.json({response:response});
        }).catch((err) => { console.log(err); throw err });
    }
}
function getResellerRupeeID(req,res){
    let cust_id = req.query.id;
    let sql = knex(table.tbl_pbx_reseller_info + ' as re').leftJoin(table.tbl_Customer + ' as c','c.id','re.reseller_id')
    .select('c.id','c.first_name','re.product_id','re.balance','re.reseller_type_id')
        .where('c.id',cust_id)
        sql.then((response) =>{
            res.json({
                response
            })
        }).catch((err) => { console.log(err); throw err });
}
function getResellerID(req,res) {
    let customer_id = req.query['id']; 
    let sql = knex(table.tbl_Customer + ' as c').join(table.tbl_pbx_reseller_info + ' as pi','c.id','pi.reseller_id').join(table.tbl_pbx_roles + ' as pr', 'c.role_id', 'pr.user_type').leftJoin(table.tbl_pbx_permission + ' as p','c.permission_id','p.id')
    .select('pi.id as PID','pi.reseller_id','pi.product_id','pi.balance as Rbalance','pi.commission_per','pi.reseller_type_id','c.*', 'c.status as status','p.permission_name', knex.raw('CONCAT(c.first_name, \" \" ,c.last_name) as name, if(c.status = "1", "Active", "Inactive") as status_text'), 'pr.rolename as user_type')
    .where('c.role_id','=','3').andWhere('c.id',customer_id).whereNot('c.status','2').orderBy('c.id','desc')
    sql.then((response) => { 
        let pbx_detail = response.filter(item => item.product_id == '1');
        let out_detail = response.filter(item => item.product_id == '2');
        let allDetail = [];
        allDetail.push({pbx_detail: pbx_detail[0], out_detail: out_detail[0]})        
        // if(out_detail.length){
        //     allDetail.push({out_detail: out_detail[0]});
        // }
        // if(pbx_detail.length){
        //     allDetail.push({pbx_detail: pbx_detail[0]});
        // }
        // if(pbx_detail.length && out_detail.length){
        // allDetail.push({pbx_detail: pbx_detail[0], out_detail: out_detail[0]})        
        // }
        if(response){
         res.json({response:allDetail});
        }
        // if(response) res.json({response:response});
    }).catch((err) => { console.log(err); throw err });
}




function getResellerByFilter(req, res) {
    let data = req.body.data;
    if (req.body.product_id == '1' || req.body.product_id == 1) {
        let sql = knex(table.tbl_Customer + ' as c').join(table.tbl_pbx_roles + ' as pr', 'c.role_id', 'pr.user_type').leftJoin(table.tbl_pbx_user_permission_map + ' as pp','pp.user_id','c.id').join(table.tbl_pbx_permission + ' as p','pp.permission_id','p.id').leftJoin(table.tbl_pbx_reseller_info + ' as re','re.reseller_id','c.id')
        .select('re.product_id','re.reseller_type_id','c.*', 'c.status as status','p.permission_name', knex.raw('CONCAT(c.first_name, \" \" ,c.last_name) as name, if(c.status = "1", "Active", "Inactive") as status_text'),'pr.rolename as user_type')
        .where('c.role_id','=','3').andWhere('re.product_id',1).whereNot('c.status','2').orderBy('c.id','desc')
        if(data.permission_name){
            sql.andWhere('p.permission_name',"like","%"+data.permission_name+"%");
        }
        if(data.by_name){
            sql.andWhere('c.first_name',"like","%"+data.by_name+"%");
        }
        if(data.by_mobile){
            sql.andWhere('c.mobile','like',"%"+data.by_mobile+"%")
        }
        if(data.by_email){
            sql.andWhere('c.email','like',"%"+data.by_email+"%")
        }
        if(data.by_status){
            sql.andWhere('c.status',""+data.by_status+"")
        }
        sql.then((response) => {        
            res.json({
                response
            })
        }).catch((err) => { console.log(err); throw err });
    }
    else{
        let sql = knex(table.tbl_Customer + ' as c').join(table.tbl_pbx_roles + ' as pr', 'c.role_id', 'pr.user_type').leftJoin(table.tbl_pbx_user_permission_map + ' as pp','pp.user_id','c.id').leftJoin(table.tbl_pbx_reseller_info + ' as re','re.reseller_id','c.id')
        .select('re.product_id','re.reseller_type_id','c.id','c.username','c.email','c.mobile','c.company_address', 'c.status as status', knex.raw('CONCAT(c.first_name, \" \" ,c.last_name) as name, if(c.status = "1", "Active", "Inactive") as status_text'),'pr.rolename as user_type')
        .where('c.role_id','=','3').andWhere('re.product_id',2).whereNot('c.status','2').andWhere('pp.permission_id','=',0).orderBy('c.id','desc')
        // if(data.permission_name){
        //     sql.andWhere('p.permission_name',"like","%"+data.permission_name+"%");
        // }
        if(data.by_name){
            sql.andWhere('c.first_name',"like","%"+data.by_name+"%");
        }
        if(data.by_mobile){
            sql.andWhere('c.mobile','like',"%"+data.by_mobile+"%")
        }
        if(data.by_email){
            sql.andWhere('c.email','like',"%"+data.by_email+"%")
        }
        if(data.by_status){
            sql.andWhere('c.status',""+data.by_status+"")
        }
        sql.then((response) => {        
            res.json({
                response
            })
        }).catch((err) => { console.log(err); throw err });
    }
}

function getResellerProduct(req, res) {
    knex.from(table.tbl_pbx_reseller_info).select(knex.raw('Group_concat(product_id) as product')).where('reseller_id',req.query.id).then((response) => {        
        if(response){
            res.send({
                response
            })
        }
    }).catch((err) => { console.log(err); throw err });
}
module.exports = {getReseller,getResellerRupeeID,getResellerID, getResellerByFilter, getResellerProduct};