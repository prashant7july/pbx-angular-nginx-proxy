const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var fs = require('fs');
var path = require('path');
const getSize = require('get-folder-size');
var moment = require('moment');
const Knex = require('knex');
const { abort } = require('process');
const { response } = require('express');

//show customer status dashboard product wise
function getStatusProductwiseDashboard(req, res) {
   let type = req.query.type;
   if (type == 3) {
  let sql = knex.select('m.product_id', knex.raw('SUM(IF(c.status = "1","1","0")) as active'),
       knex.raw('SUM(IF(c.status = "0","1","0")) as inactive'),
       knex.raw('SUM(IF(c.status = "3","1","0")) as expired'),
       knex.raw('SUM(IF(c.status = "4","1","0")) as suspendedForUnderpayment'),
       knex.raw('SUM(IF(c.status = "5","1","0")) as suspendedForLitigation'))
       .from(table.tbl_Customer + ' as c')
       .leftOuterJoin(table.tbl_Map_customer_package + ' as m', 'c.id', 'm.customer_id')
       .whereIn('c.role_id', ['1'])
       .whereIn('m.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.id}`))

    //    .andWhere('created_by',req.query.id)
       .groupBy('m.product_id')
       sql.then((response) => {
        //    if (response.length > 0) {
               res.json({
                   response
                });
            // }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
    else{
     let sql = knex.select('m.product_id', knex.raw('SUM(IF(c.status = "1","1","0")) as active'),
        knex.raw('SUM(IF(c.status = "0","1","0")) as inactive'),
        knex.raw('SUM(IF(c.status = "3","1","0")) as expired'),
        knex.raw('SUM(IF(c.status = "4","1","0")) as suspendedForUnderpayment'),
        knex.raw('SUM(IF(c.status = "5","1","0")) as suspendedForLitigation'))
        .from(table.tbl_Customer + ' as c')
        .leftOuterJoin(table.tbl_Map_customer_package + ' as m', 'c.id', 'm.customer_id')
        .whereIn('c.role_id', ['1'])
        .groupBy('m.product_id')
        sql.then((response) => {
            if (response.length > 0) {
                res.json({
                    response
                 });
             }
         }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}
// function getStatusProductwiseDashboard(req, res) {
//     let type = req.query.type;
//     // if (type == 0) {
//         let sql = knex.select('m.product_id', knex.raw('SUM(IF(c.status = "1","1","0")) as active'),
//         knex.raw('SUM(IF(c.status = "0","1","0")) as inactive'),
//         knex.raw('SUM(IF(c.status = "3","1","0")) as expired'),
//         knex.raw('SUM(IF(c.status = "4","1","0")) as suspendedForUnderpayment'),
//         knex.raw('SUM(IF(c.status = "5","1","0")) as suspendedForLitigation'))
//         .from(table.tbl_Customer + ' as c')
//         .leftOuterJoin(table.tbl_Map_customer_package + ' as m', 'c.id', 'm.customer_id')
//         sql.whereIn('c.role_id', ['1'])
//         if(type == 0) {
//             sql.andWhere('created_by','2');
//         }else if(type == 3){
//             // sql.whereIn('c.role_id', ['3'])
//              sql.andWhere('created_by',req.query.id)
//         }
//         sql.groupBy('m.product_id')
//         sql.then((response) => {
//             if (response.length > 0) {
//                 res.json({
//                     response
//                 });
//             }
//         }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
//     // }
// }
// function getExtensionstatusDasboard(req,res){
//     knex.raw('SUM(IF(c.status=1)) as active'),
//     knex.raw('SUM(IF(c.status=0)) as inactive')
//     .from(table.tbl_Extension_master + 'as c')
//     .then((response)=>{
//         if(response){
//         res.json({
//             response
//         });
        
//     }
// })
// }












function getMonthlyRevenue(req, res) {
    let type = req.query.type;
    if(type == 3){
        let todayDate = new Date();
        let lastMonth = todayDate.getMonth() + 1;
        let year = todayDate.getFullYear();;
        var sql =  knex.select('inv.id', 'cus.company_name', knex.raw('sum(Truncate(inv.amount_with_gst,2)) as revenueCost')).from(table.tbl_Pbx_Invoice + ' as inv')
            .leftJoin(table.tbl_Customer + ' as cus', 'inv.customer_id', 'cus.id')
            .where(knex.raw('month(invoice_date)'), '=', "" + lastMonth + "")
            .andWhere(knex.raw('year(invoice_date)'), '=', "" + year + "")
            .whereIn('inv.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.id}`))
            .groupBy('cus.company_name')
            .orderBy('revenueCost', 'desc').limit(5)
            sql.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err }); 
    }else{
    let todayDate = new Date();
    let lastMonth = todayDate.getMonth() + 1;
    let year = todayDate.getFullYear();;
    var sql =  knex.select('inv.id', 'cus.company_name', knex.raw('sum(Truncate(inv.amount_with_gst,2)) as revenueCost')).from(table.tbl_Pbx_Invoice + ' as inv')
        .leftJoin(table.tbl_Customer + ' as cus', 'inv.customer_id', 'cus.id')
        .where(knex.raw('month(invoice_date)'), '=', "" + lastMonth + "")
        .andWhere(knex.raw('year(invoice_date)'), '=', "" + year + "")
        .groupBy('cus.company_name')
        .orderBy('revenueCost', 'desc').limit(5)
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}


function getTotalMonthlyCalls(req, res) {
    // for customer only 
    if(req.query.role == '1'){
      let sql = knex(table.tbl_Pbx_CDR).count('id', { as: 'totalCall' })
        .whereIn('terminatecause', ['1010','1011','1012','1013','1014','1015','1016','1017','1018','1019','2000','404','88','608','408','400','401','420','603','609','403','415','500',
        '503','504','488','502','sip:200', '200','487', '484','480','477','486','21','1000','1001','1003','1004','1005','1006','1007','1008','1009'])
            .andWhere('customer_id', '=', "" + req.query.user_id + "")            
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            ).andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            sql.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }else{
        if(req.query.role == 3){
        // knex.raw("Call pbx_getTotalMonthlyCalls(" + req.query.role + ", " + req.query.user_id + ")")
        // .then((response) => {
        //     if (response) {
        //         res.send({ response: response[0][0] });
        //     }
        // }).catch((err) => {
        //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
        // });

       let sql = knex(table.tbl_Pbx_CDR + ' as cdr')
       .count('*', { as: 'totalCall' })
       .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
        .whereIn('terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009','404','88','608','408','400','401','609','403','402','500',
        '503','488','502','sip:200', '200','487', '480','486','21'])
            .andWhere('cdr.customer_id', '!=', "0")            
            .andWhere((builder) =>
                builder.where('cdr.call_type', '=', 'outbound')
                    .orWhere('cdr.call_type', '=', 'inbound')
            ).andWhere(knex.raw('MONTH(cdr.start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(cdr.start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
            sql.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
    else{
       let sql = knex(table.tbl_Pbx_CDR).count('id', { as: 'totalCall' })
       .whereIn('terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009','404','88','608','408','400','401','609','403','402','500',
       '503','488','502','sip:200', '200','487', '480','486','21'])
           .andWhere('customer_id', '!=', "0")            
           .andWhere((builder) =>
               builder.where('call_type', '=', 'outbound')
                   .orWhere('call_type', '=', 'inbound')
           ).andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
           .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
           sql.then((response) => {
               res.json({
                   response
               });
           }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

}

function getTotalMonthlyIncomingCalls(req, res) {
    // knex.raw("Call pbx_getTotalMonthlyInCalls()")
    // .then((response) => {
    //     if (response) {
    //         res.send({ response: response[0][0] });
    //     }
    // }).catch((err) => {
    //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
    // });
    if(req.query.role == 3){
       let sql = knex(table.tbl_Pbx_CDR + ' as cdr')
       .count('*', { as: 'totalCall' })
       .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
        .whereIn('terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009','404','88','608','408','400','401','609','403','402','500',
        '503','488','502','sip:200', '200','487', '480','486','21'])
            .andWhere('cdr.customer_id', '!=', "0")            
            .andWhere((builder) =>
                builder.where('cdr.call_type', '=', 'inbound')
                    // .orWhere('cdr.call_type', '=', 'inbound')
            ).andWhere(knex.raw('MONTH(cdr.start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(cdr.start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
            sql.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }else{
   let sql = knex(table.tbl_Pbx_CDR).count('id', { as: 'count' })
    .whereIn('terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009','404','88','608','408','400','401','609','403','402','500',
    '503','488','502','sip:200', '200','487', '480','486','21'])
        .andWhere('customer_id', '!=', "0")            
        .andWhere('call_type', '=', 'inbound')
        .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
        .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getTotalMonthlyOutgoingCalls(req, res) {
    if(req.query.role == 3){
        let sql = knex(table.tbl_Pbx_CDR + ' as cdr')
        .count('*', { as: 'totalCall' })
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
         .whereIn('terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009','404','88','608','408','400','401','609','403','402','500',
         '503','488','502','sip:200', '200','487', '480','486','21'])
             .andWhere('cdr.customer_id', '!=', "0")            
             .andWhere((builder) =>
                 builder.where('cdr.call_type', '=', 'outbound')
                     // .orWhere('cdr.call_type', '=', 'inbound')
             ).andWhere(knex.raw('MONTH(cdr.start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
             .andWhere(knex.raw('YEAR(cdr.start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
             .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
             sql.then((response) => {
                 res.json({
                     response
                 });
             }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
     }else{
    knex(table.tbl_Pbx_CDR).count('id', { as: 'count' }).where('call_type', '=', 'outbound')
        .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
        .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
        .whereIn('terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009','404','88','608','408','400','401','609','403','402','500',
    '503','488','502','sip:200', '200','487', '480','486','21'])
        .andWhere('customer_id','!=','0')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getTotalMonthlyCallDuration(req, res) {
    if (req.query.role == 3) {
        let sql = knex.select(knex.raw('SEC_TO_TIME(SUM(cdr.bridge_time)) as duration')).from(table.tbl_Pbx_CDR + ' as cdr')
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
        .whereIn('cdr.call_type',['inbound','outbound'])
        .andWhere(knex.raw('MONTH(cdr.start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
        .andWhere(knex.raw('YEAR(cdr.start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
        .andWhere('cdr.customer_id','!=','0')
        .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err }); 
    }
    else{
   let sql = knex.select(knex.raw('SEC_TO_TIME(SUM(bridge_time)) as duration')).from(table.tbl_Pbx_CDR)
        .whereIn('call_type',['inbound','outbound'])
        .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
        .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
        .andWhere('customer_id','!=','0')
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getAnsweredCalls(req, res) { 
    if (req.query.role == '0' || req.query.role == '2') {
        var sql = knex(table.tbl_Pbx_CDR).count('id', { as: 'answeredCount' })
            .whereIn('terminatecause',['sip:200','200'])
            .where("bridge_time", ">=", "0")
            .andWhere((builder) =>
                builder.whereIn('call_type',['inbound','outbound'])
            ).andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .andWhere('customer_id','!=','0')
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
       let query = knex(table.tbl_Pbx_CDR).count('id', { as: 'answeredCount' })
            .whereIn('terminatecause', ['sip:200','200']) 
            .andWhere("bridge_time", ">=", "0")
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.whereIn('call_type',['inbound','outbound'])
            ).andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'));
           query.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
    else if (req.query.role == '3') {
        let query = knex(table.tbl_Pbx_CDR + ' as cdr').count('*', { as: 'answeredCount' })
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
             .whereIn('cdr.terminatecause', ['sip:200','200']) 
             .andWhere("cdr.bridge_time", ">=", "0")
            //  .andWhere('cdr.customer_id', '=', "" + req.query.user_id + "")
             .andWhere((builder) =>
                 builder.whereIn('cdr.call_type',['inbound','outbound'])
             ).andWhere(knex.raw('MONTH(cdr.start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
             .andWhere(knex.raw('YEAR(cdr.start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
             .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
            query.then((response) => {
                 res.json({
                     response
                 });
             }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
     }else{
        res.json({
            response
        });
    }
}


function getFailedCalls(req, res) { 
    if (req.query.role == '0' || req.query.role == '2') {
     let sql = knex(table.tbl_Pbx_CDR).count('id', { as: 'failedCount' })
            .whereIn('terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009'
            ,'1010','1011','1012','1013','1014','1015','1016','1017','1018','1019','2000','404','88','608','408','400','401','415','477','484','488','603','609','403','402','500'
             ,'502','503','504'])
            .whereIn('call_type',['inbound','outbound'])
            .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .andWhere('customer_id','!=','0')
            sql.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
    else if (req.query.role == '3') {
       let sql = knex(table.tbl_Pbx_CDR + ' as cdr').count('*', { as: 'failedCount' })
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
            .whereIn('cdr.terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009'
            ,'1010','1011','1012','1013','1014','1015','1016','1017','1018','1019','2000','404','88','608','408','400','401','415','477','484','488','603','609','403','402','500'
             ,'502','503','504'])
            .whereIn('cdr.call_type',['inbound','outbound'])
            .andWhere(knex.raw('MONTH(cdr.start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(cdr.start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .andWhere('cdr.customer_id','!=','0')
            .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
            sql.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }  else if (req.query.role == '1') {
        knex(table.tbl_Pbx_CDR).count('id', { as: 'failedCount' })
        .whereIn('terminatecause', ['1000','1001','1002','1003','1004','1005','1006','1007','1008','1009'
        ,'1010','1011','1012','1013','1014','1015','1016','1017','1018','1019','2000','404','88','608','408','400','401','415','477','484','488','603','609','403','402','500'
         ,'502','503','504'])
                    // .where((builder) =>
            //      builder.where('terminatecause', '=', '88')
            //             .orWhere('terminatecause', '=', '6')) // changed as per virendra sir at 17-06-2021 9:53 
            .andWhere('customer_id', '=', "" + req.query.user_id + "")            
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            ).andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getForwaredCalls(req, res) {
    if (req.query.role == '0' || req.query.role == '2') {
        knex(table.tbl_Pbx_CDR).count('id', { as: 'forwardedCount' })
            .where('is_forward','=','1') 
            // .where('terminatecause', '16') 
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound'))
            .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
        knex(table.tbl_Pbx_CDR).count('id', { as: 'forwardedCount' })
            //    .where('sip_current_application', 'call_forward') 
            .where('is_forward', '=','1') 
            // .where('terminatecause', '16') 
             .andWhere('customer_id', '=', "" + req.query.user_id + "")
            // .andWhere((builder) =>
            //     builder.where('call_type', '=', 'outbound')
            //         .orWhere('call_type', '=', 'inbound'))
            .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getNotAnsweredCalls(req, res) {
    if (req.query.role == '0' || req.query.role == '2') {
        knex(table.tbl_Pbx_CDR).count('id', { as: 'noansweredCount' })
            // .where('terminatecause', '19')
            .whereIn('terminatecause', ['487','480'])
            .andWhere('bridge_time', '>=', '0')
            .andWhere((builder) =>
                builder.whereIn('call_type', ['inbound','outbound'])
            )  
            .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
   else if (req.query.role == '3') {
        knex(table.tbl_Pbx_CDR + ' as cdr').count('*', { as: 'noansweredCount' })
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
            // .where('terminatecause', '19')
            .whereIn('cdr.terminatecause', ['487','480'])
            .andWhere('cdr.bridge_time', '>=', '0')
            .andWhere((builder) =>
                builder.whereIn('cdr.call_type', ['inbound','outbound'])
            )  
            .andWhere(knex.raw('MONTH(cdr.start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(cdr.start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
        knex(table.tbl_Pbx_CDR).count('id', { as: 'noansweredCount' })
            // .where('terminatecause', '19')
            .whereIn('terminatecause', ['487','480'])
            .andWhere('bridge_time', '>=', '0')
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.whereIn('call_type', ['inbound','outbound'])
                )
             .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getBusyCalls(req, res) {
    if (req.query.role == '0' || req.query.role == '2') {
       let sql = knex(table.tbl_Pbx_CDR).count('id', { as: 'busyCount' })
            // .where('terminatecause', '17')
            .whereIn('terminatecause', ['486'])
            .andWhere((builder) =>
                builder.whereIn('call_type', ['inbound','outbound'])
            ) .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            sql.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }  else if (req.query.role == '3') {
        let sql = knex(table.tbl_Pbx_CDR + ' as cdr').count('*', { as: 'busyCount' })
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
             // .where('terminatecause', '17')
             .whereIn('cdr.terminatecause', ['486'])
             .andWhere((builder) =>
                 builder.whereIn('cdr.call_type', ['inbound','outbound'])
             ) .andWhere(knex.raw('MONTH(cdr.start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
             .andWhere(knex.raw('YEAR(cdr.start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
             sql.then((response) => {
                 res.json({
                     response
                 });
             }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
     }else if (req.query.role == '1') {
      let sql = knex(table.tbl_Pbx_CDR).count('id', { as: 'busyCount' })
            // .where('terminatecause', '17')
            .whereIn('terminatecause', ['486'])
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.whereIn('call_type', ['inbound','outbound'])
            ) .andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            sql.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}


function getRejectedCalls(req, res) {
    if (req.query.role == '0' || req.query.role == '2') {
        knex(table.tbl_Pbx_CDR).count('id', { as: 'rejectedCount' })
             .where('terminatecause', '21')
          //  .whereIn('terminatecause', ['486','21'])
            .andWhere((builder) =>
                builder.whereIn('call_type', ['inbound','outbound'])
            ).andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
        knex(table.tbl_Pbx_CDR).count('id', { as: 'rejectedCount' })
             .where('terminatecause', '21')
           // .whereIn('terminatecause', ['486','21'])
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.whereIn('call_type', ['inbound','outbound'])
            ).andWhere(knex.raw('MONTH(start_time)'), knex.raw('MONTH(CURRENT_DATE())'))
            .andWhere(knex.raw('YEAR(start_time)'), knex.raw('YEAR(CURRENT_DATE())'))
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getMinuteConsumedAnsweredCalls(req, res) {
    if (req.query.role == '0' || req.query.role == '2') {
        knex(table.tbl_Pbx_CDR).select('id', 'bridge_time')
            .where('terminatecause', '16')
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
        knex(table.tbl_Pbx_CDR).select('id', 'bridge_time')
            .where('terminatecause', '16')
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
}

function getMinuteConsumeFailedCalls(req, res) {
    if (req.query.role == '0' || req.query.role == '2') {
        knex(table.tbl_Pbx_CDR).select('id', 'bridge_time')
            .where('terminatecause', '41')
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
        knex(table.tbl_Pbx_CDR).select('id', 'bridge_time')
            .where('terminatecause', '41')
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
}

function getMinuteConsumeNotAnsweredCalls(req, res) {
    if (req.query.role == '0' || req.query.role == '2') {
        knex(table.tbl_Pbx_CDR).select('id', 'bridge_time')
            .where('terminatecause', '19')
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
        knex(table.tbl_Pbx_CDR).select('id', 'bridge_time')
            .where('terminatecause', '19')
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
}

function getDiskSpaceUsage(req, res) {
    let id = parseInt(req.query.id);
    var filePath = path.join(__dirname, '../upload/', "" + id + "");
    let sizeinGB = 0;
    getSize(filePath, (err, size) => {
        if (err) { return res.send({ code: 200, response: 0 });}
        sizeinGB = (size / 1073741824).toFixed(2);
        return res.send({ code: 200, response: sizeinGB });
    });
}

function getCallsPerTenant(req, res) {
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD');
    // moment(req.query.date).subtract(1, "days").format('YYYY-MM-DD');
    if (req.query.role == 3) {
        let sql = knex.select('cus.company_name', knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
        .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
        .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
        .andWhere('cd.call_type','!=','intercom')
        .whereIn('cd.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
        .groupBy('cd.customer_id')
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }else{
   let sql = knex.select('cus.company_name', knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
        .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
        .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
        .andWhere('cd.call_type','!=','intercom')
        .groupBy('cd.customer_id')
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getCallsPerHours(req, res) {
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD'); //moment(req.query.date).subtract(1, "days").format('YYYY-MM-DD');
    let customerId = req.query.user_id == 0 ? null : req.query.user_id;
    // if (!customerId) {  // Before reseller code
        if (!customerId && req.query.userr_id == '2') { // After reseller code
        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.call_type','!=','intercom')
            .andWhere('customer_id','!=','0')
            .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'))
        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
    else if(req.query.role == 3){
        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
        .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
        .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
        .andWhere('cd.call_type','!=','intercom')
        .andWhere('cd.customer_id','!=','0')
        .andWhere('cd.customer_id',req.query.user_id)
        .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'))
        .whereIn('cd.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.userr_id}`))
    query.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } 
    else {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.customer_id', '=', "" + customerId + "")
            .andWhere('cd.call_type','!=','intercom')
            .andWhere('customer_id','!=','0')
            .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));

        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }

}

function getAsrCallsPerHours(req, res) {
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD'); //moment(req.query.date).subtract(1, "days").format('YYYY-MM-DD');
    let customerId = req.query.customerId == 0 ? null : req.query.customerId;

    if (!customerId && req.query.role == '0') {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere("cd.bridge_time", ">", "0")
            .andWhere((builder) =>
                builder.where('cd.call_type', '!=', 'intercom')
            )
            .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));
           
        query.then((response) => {
            let sql = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
                .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
                .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
                .andWhere("cd.bridge_time", ">", "0")
                .andWhere((builder) =>
                    builder.where('cd.call_type', '!=', 'intercom')
                )
                .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));

            sql.then((resp) => {

                res.json({
                    totalCall: response,
                    coneectedCall: resp
                });
            })

        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    } 
    
   else if (req.query.role == 3) {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere("cd.bridge_time", ">", "0")
            .andWhere((builder) =>
                builder.where('cd.call_type', '!=', 'intercom')
            )
        .whereIn('cd.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
            .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));
           
        query.then((response) => {
            let sql = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
                .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
                .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
                .andWhere("cd.bridge_time", ">", "0")
                .andWhere((builder) =>
                    builder.where('cd.call_type', '!=', 'intercom')
                )
        .whereIn('cd.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
                .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));

            sql.then((resp) => {

                res.json({
                    totalCall: response,
                    coneectedCall: resp
                });
            })

        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
    else {

        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.customer_id', '=', "" + customerId + "")
            .andWhere((builder) =>
                builder.where('cd.call_type', '!=', 'intercom')
            )
            .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));
        query.then((response) => {
            let sql = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
                .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
                .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
                .andWhere("cd.bridge_time", ">", "0")
                .andWhere('cd.customer_id', '=', "" + customerId + "")
                .andWhere((builder) =>
                    builder.where('cd.call_type', '!=', 'intercom')
                )
                .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));
            sql.then((resp) => {
                res.json({
                    totalCall: response,
                    coneectedCall: resp
                });
            })

        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
}

function getAcdCallsPerHours(req, res) {
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD'); //moment(req.query.date).subtract(1, "days").format('YYYY-MM-DD');
    let customerId = req.query.customerId == 0 ? null : req.query.customerId;

    if (!customerId && req.query.role == '0') {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('SUM(cd.bridge_time) as totalMinutes'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere("cd.bridge_time", ">", "0")
            .andWhere((builder) =>
                builder.where('cd.call_type', '!=', 'intercom')
            )
            .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));
        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        //console.log(query.toString());
    }
    else if (req.query.role == 3) {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('SUM(cd.bridge_time) as totalMinutes'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere("cd.bridge_time", ">", "0")
            .andWhere((builder) =>
                builder.where('cd.call_type', '!=', 'intercom')
            )
            .whereIn('cd.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
            .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));
        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        //console.log(query.toString());
    } else {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls'), knex.raw('SUM(cd.bridge_time) as totalMinutes'), knex.raw('DATE_FORMAT(cd.start_time, "%k") as start_Hour')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.customer_id', '=', "" + customerId + "")
            .andWhere("cd.bridge_time", ">", "0")
            .andWhere('cd.call_type', '!=', 'intercom')
            .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'));
        //console.log(query.toString());
        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        //console.log(query.toString());
    }
}

function getTotalCallsPerTenant(req, res) {
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD'); //moment(req.query.date).subtract(1, "days").format('YYYY-MM-DD');
    if (req.query.role == 3) {
        let sql = knex.select(knex.raw('count(cdr.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cdr')
       .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','cdr.customer_id')
        .where(knex.raw('DATE(cdr.start_time)'), "" + selected_date + "")
        .andWhere('cdr.customer_id','!=','0')
        .andWhere('cdr.call_type','!=','intercom')
        .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }else{
  let sql = knex.select(knex.raw('count(id) as totalCalls')).from(table.tbl_Pbx_CDR)
        .where(knex.raw('DATE(start_time)'), "" + selected_date + "")
        .andWhere('customer_id','!=','0')
        .andWhere('call_type','!=','intercom')
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }

}

function getTotalCallsPerHours(req, res) {
    // let selected_date = moment(req.query.date,'YYYY-MM-DD').utc().format();  // moment(req.query.date).subtract(1, "days").format('YYYY-MM-DD');
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD');
    let customerId = req.query.user_id == 0 ? null : req.query.user_id;
    // if (!customerId) { // before reseller code 
        if (!customerId && req.query.userr_id == '2') { // after reseller code
        let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.call_type','!=','intercom')
            .andWhere('customer_id','!=','0')
            query.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }else if(req.query.role == '3'){
            let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.call_type','!=','intercom')
            .andWhere('cd.customer_id','!=','0')
            .andWhere('cd.customer_id',req.query.user_id)
            .whereIn('cd.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.userr_id}`))
            query.then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.customer_id', '=', "" + customerId + "")
            .andWhere('cd.call_type','!=','intercom')
            .andWhere('customer_id','!=','0')
        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getTotalAsrCallsPerHours(req, res) {
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD');    // moment(req.query.date).subtract(1, "days").format('YYYY-MM-DD');
    let customerId = req.query.customerId == 0 ? null : req.query.customerId;
    if (!customerId && req.query.role == '0') {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere("cd.call_type", "!=", "intercom")
            .andWhere('cd.customer_id','!=','0');

        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
   else if (req.query.role == 3) {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere("cd.call_type", "!=", "intercom")
            .andWhere('cd.customer_id','!=','0')
            .whereIn('cd.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))

        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else {
        let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere("cd.call_type", "!=", "intercom")
            .andWhere('cd.customer_id', '=', "" + customerId + "")
            .andWhere('cd.customer_id','!=','0');


        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getTotalAcdCallsPerHours(req, res) {
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD');    // moment(req.query.date).subtract(1, "days").format('YYYY-MM-DD');
    let customerId = req.query.customerId == 0 ? null : req.query.customerId;
    // if (!customerId) { // Before reseller code
        if (!customerId && req.query.role == '0') { // After reseller code
        let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.bridge_time', '>', '0')
            .andWhere('cd.call_type','!=','intercom');
        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
    else if (req.query.role == '3') { // After reseller code
        let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.bridge_time', '>', '0')
            .andWhere('cd.call_type','!=','intercom')
            .whereIn('cd.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }  
    else {

        let query = knex.select(knex.raw('count(cd.id) as totalCalls')).from(table.tbl_Pbx_CDR + ' as cd')
            .leftJoin(table.tbl_Customer + ' as cus', 'cd.customer_id', 'cus.id')
            .where(knex.raw('DATE(cd.start_time)'), "" + selected_date + "")
            .andWhere('cd.customer_id', '=', "" + customerId + "")
            .andWhere('cd.bridge_time', '>', '0')
            .andWhere('cd.call_type','!=','intercom');

        query.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getTotalRevenue(req, res) {
    let type = req.query.type;
    if (type == 3) {
        let todayDate = new Date();
        let lastMonth = todayDate.getMonth() + 1;
        let year = todayDate.getFullYear();
        let sql = knex.select(knex.raw('sum(voice.amount_with_gst) as totalRevenue')).from(table.tbl_Pbx_Invoice + ' as voice' )
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id','voice.customer_id')
            .where(knex.raw('month(voice.invoice_date)'), '=', "" + lastMonth + "")
            .andWhere(knex.raw('year(voice.invoice_date)'), '=', "" + year + "")
            .whereIn('voice.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.id}`))
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            throw err
        });
        
    }
    else{
    // CONCAT("Rs. ", FORMAT(balance, 2, "en_IN")) 
    let todayDate = new Date();
    let lastMonth = todayDate.getMonth() + 1;
    let year = todayDate.getFullYear();
    //console.log(  knex.select(knex.raw(' CONCAT("Rs. ",FORMAT(sum(amount),2, "en_IN")) as totalRevenue')).from(table.tbl_Pbx_Invoice)
    //.where(knex.raw('month(start_time)'), '=' , lastMonth).toString());
    let sql = knex.select(knex.raw('sum(amount_with_gst) as totalRevenue')).from(table.tbl_Pbx_Invoice)
        .where(knex.raw('month(invoice_date)'), '=', "" + lastMonth + "")
        .andWhere(knex.raw('year(invoice_date)'), '=', "" + year + "");
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => {
        res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        throw err
    });
}
}

function getTotalActiveExtension(req, res) {
    let query = knex(table.View_Subscriber).count('id', { as: 'count' });
    query.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    // console.log(query.toString())
}
function getTotalActiveResellerExtension(req, res) {
    let query = knex(table.View_Subscriber + ' as sub').select('sub.*').count('sub.id', { as: 'count' })
    .leftJoin(table.tbl_Customer + ' as cust','cust.id','sub.customer_id').where('cust.created_by',req.query.ResellerID);
    query.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    // console.log(query.toString())
}
function ActiveExtensions(req, res) {
    let customerId = parseInt(req.query.customerId);
    let query = knex(table.tbl_Extension_master).where('status',"1").count('status', { as: 'count' })
    .andWhere('customer_id','=', ""+ customerId + "")
    query.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    // })
}
function inactiveExtensions(req,res){
    let customerId = parseInt(req.query.customerId);
    let query = knex(table.tbl_Extension_master).where('status',"0").count('status', { as: 'count' })
    .andWhere('customer_id','=', ""+ customerId + "")
    query.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getPbxTotalIvrByCustomer(req, res) {
    let customerId = parseInt(req.query.customerId);
    knex(table.tbl_Pbx_Ivr_Master).count('id as count').where('customer_id', '=', "" + customerId + "")

        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getActiveExtension(req, res) {
    let query = knex(table.tbl_location).count('*', { as: 'count' });
    query.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
function getActiveResellerExtension(req, res) {
    let query = knex(table.tbl_location + ' as l').count('*', { as: 'count' }).leftJoin(table.View_Subscriber + ' as sub','sub.username','l.username')
    .leftJoin(table.tbl_Customer + ' as cust','cust.id','sub.customer_id').where('cust.created_by',req.query.ResellerID);
    query.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
function getRegisExtension(req, res) {
    let customerId=parseInt(req.query.user_id)
    // let query = knex(table.View_Subscriber).select('customer_id')
    // query.then((response) => {
        // if(response){
            // select count(distinct l.username) as `count` from location as l LEFT JOIN extension_master as ex_m on l.username = ex_m.ext_number where ex_m.customer_id  = 2127
            let query = knex(table.tbl_location + ' as l').countDistinct('l.username', { as: 'count' })
            .leftJoin(table.tbl_Extension_master + ' as ex', 'ex.ext_number','l.username' )
            .andWhere('customer_id','=', "" + customerId + "")
            query.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    //console.log(query.toString())
// }
    // });
}


function getDateWiseMinuteConsumedAnsweredCalls(req, res) {
    let selected_date = moment.utc(req.query.date).format('YYYY-MM-DD');
    //console.log(table.tbl_Pbx_CDR);
    //console.log(selected_date);
    if (req.query.role == '0' || req.query.role == '2') {
        var sql = knex(table.tbl_Pbx_CDR).select(knex.raw('SUM(bridge_time) as bridge_time'), knex.raw('DATE_FORMAT(start_time, "%k") as start_Hour'))
            .where('terminatecause', '200')
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .andWhere(knex.raw('DATE(start_time)'), "" + selected_date + "")
            .andWhere('customer_id','!=','0')
            .groupBy(knex.raw('DATE_FORMAT(start_time, "%k")'))
            // console.log(sql.toQuery(),'admin');
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
   else if (req.query.role == '3') {
        var sql = knex(table.tbl_Pbx_CDR + ' as cdr').select(knex.raw('SUM(cdr.bridge_time) as bridge_time'), knex.raw('DATE_FORMAT(cdr.start_time, "%k") as start_Hour'))
        .leftJoin(table.tbl_Customer + ' as cus', 'cdr.customer_id', 'cus.id')
            .where('cdr.terminatecause', '200')
            .andWhere((builder) =>
                builder.where('cdr.call_type', '=', 'outbound')
                    .orWhere('cdr.call_type', '=', 'inbound')
            )
            .andWhere(knex.raw('DATE(cdr.start_time)'), "" + selected_date + "")
            .andWhere('cdr.customer_id','!=','0')
        .whereIn('cdr.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.user_id}`))
            .groupBy(knex.raw('DATE_FORMAT(cdr.start_time, "%k")'))
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
     else if (req.query.role == '1') {
        var sql = knex(table.tbl_Pbx_CDR).select('id', knex.raw('SUM(bridge_time) as bridge_time'), knex.raw('DATE_FORMAT(start_time, "%k") as start_Hour'))
            .where('terminatecause', '200')
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .andWhere(knex.raw('DATE(start_time)'), "" + selected_date + "")
            .groupBy(knex.raw('DATE_FORMAT(start_time, "%k")'));
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }else{
        res.json({
            response
        });
    }
}

function getDateWiseMinuteConsumeFailedCalls(req, res) {
    let selected_date = moment(req.query.date).format('YYYY-MM-DD');
    if (req.query.role == '0' || req.query.role == '2') {
        var sql = knex(table.tbl_Pbx_CDR).select('id', 'bridge_time', knex.raw('DATE_FORMAT(start_time, "%k") as start_Hour'))
            .where('terminatecause', '41')
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')

            )
            .andWhere(knex.raw('DATE(start_time)'), "" + selected_date + "")
            .groupBy(knex.raw('DATE_FORMAT(start_time, "%k")'));
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
        var sql = knex(table.tbl_Pbx_CDR).select('id', 'bridge_time', knex.raw('DATE_FORMAT(start_time, "%k") as start_Hour'))
            .where('terminatecause', '41')
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .andWhere(knex.raw('DATE(start_time)'), "" + selected_date + "")
            .groupBy(knex.raw('DATE_FORMAT(start_time, "%k")'));
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
}

function getDateWiseMinuteConsumeNotAnsweredCalls(req, res) {
    let selected_date = moment(req.query.date).format('YYYY-MM-DD');
    if (req.query.role == '0' || req.query.role == '2') {
        var sql = knex(table.tbl_Pbx_CDR).select('id', 'bridge_time', knex.raw('DATE_FORMAT(start_time, "%k") as start_Hour'))
            .where('terminatecause', '19')
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')
            )
            .andWhere(knex.raw('DATE(start_time)'), "" + selected_date + "")
            .groupBy(knex.raw('DATE_FORMAT(start_time, "%k")'));
        // console.log(sql.toString());
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (req.query.role == '1') {
        var sql = knex(table.tbl_Pbx_CDR).select('id', 'bridge_time', knex.raw('DATE_FORMAT(start_time, "%k") as start_Hour'))
            .where('terminatecause', '19')
            .andWhere('customer_id', '=', "" + req.query.user_id + "")
            .andWhere((builder) =>
                builder.where('call_type', '=', 'outbound')
                    .orWhere('call_type', '=', 'inbound')

            )
            .where(knex.raw('DATE(start_time)'), "" + selected_date + "")
            .groupBy(knex.raw('DATE_FORMAT(start_time, "%k")'));
        //console.log(sql.toString());
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
}

function getRegisteredExtension(req, res) {
    let customerId = parseInt(req.query.customerId);
    let sql = knex(table.tbl_pbx_sip_location + ' as sip')
             .leftJoin(table.tbl_Extension_master + ' as ex', 'ex.ext_number','sip.username' )
             .select('sip.*','ex.username as sipUsername')
             .where('sip.username', 'like','' + customerId + '%')
        // .orderBy()
          //   sql = sql.andWhere('d.did', 'like', "%" + data.by_did + "%");
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
function FilterRegisteredExtension(req, res) {
    let customerId = parseInt(req.body.filters.user_id);
    let data = req.body.filters
    let sql = knex(table.tbl_pbx_sip_location + ' as sip')
             .leftJoin(table.tbl_Extension_master + ' as ex', 'ex.ext_number','sip.username' )
             .select('sip.*','ex.username as sipUsername')
             .where('sip.username', 'like','' + customerId + '%')
             .andWhere('sip.username', 'like', "%" + data.by_number + "%")
             .andWhere('ex.username', 'like', "%" + data.by_username + "%")
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
function FilterRegisteredAllExtension(req, res) {
    let customerId = parseInt(req.body.filters.user_id);
    let data = req.body.filters;
    let sql = knex.from(table.tbl_Extension_master)
         .where('status', '=', "1")
         .andWhere('customer_id', '=', "" + customerId + "")
         .andWhere('live_status',data.registered_type)
         .select('*')
         .orderBy('ext_number', 'asc')
         sql.then((response) => {
             res.json({
                 response
             });
         }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCustomerFullDetails(req, res) {
    const returnCdrCustomerIds = () => {
        if(req.query.role == 3){
            let customerIDs = knex(table.tbl_pbx_realtime_cdr + ' as r').leftJoin(table.tbl_Customer + ' as c','c.id','r.customer_id').distinct('r.customer_id').where('r.customer_id', '!=', 0)
            .andWhere('c.created_by',req.query.ResellerID);
            return customerIDs.then((response) => {
             let ids;
             ids = response ? response.map(item => item.customer_id) : [];
             return ids;
             }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }
        else{
            let customerIDs = knex(table.tbl_pbx_realtime_cdr).distinct('customer_id').where('customer_id', '!=', 0);
            return customerIDs.then((response) => {
                let ids;
                ids = response ? response.map(item => item.customer_id) : [];
                return ids;
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }
    }

    const returnExtCustomerIds = () => {
       let customerIDs = knex(table.tbl_location).distinct( knex.raw('SUBSTR(username,1,LENGTH(username)-4) as customer_id'))   //SUBSTRING(username,1,LENGTH(username) - 4));
       return customerIDs.then((response) => {
        let ids;
        ids = response ? response.map(item => Number(item.customer_id)) : [];
        return ids;
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }

    const manageCustomersID = (livecallsCustIDs, regExtCustsIDs) => {
        let array1 = livecallsCustIDs.filter(function(obj) { 
            return regExtCustsIDs.indexOf(obj) == -1; 
        });
        let array2 = livecallsCustIDs.filter(value => regExtCustsIDs.includes(value));
        let commonIds = [...array1,...array2];
        return commonIds;
     }

     const getCustomers = (ids) => {
if (req.query.role == 3){
    let customers = knex(table.tbl_Customer + ' as c').select('c.id', 'c.first_name','c.balance', 'c.company_name').where('c.created_by',req.query.ResellerID).whereIn('c.id',ids)
    .orderBy('c.id','asc');
    return customers.then((response) => {
        let data;
        data = response ? response : [];
        return data;
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
else{

    let customers = knex(table.tbl_Customer + ' as c').select('c.id', 'c.first_name','c.balance', 'c.company_name').whereIn('c.id',ids)
    .orderBy('c.id','asc');
    return customers.then((response) => {
        let data;
        data = response ? response : [];
        return data;
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
     }

    const getCustomerExtensions = (id) => {
        let sqlData = knex.raw("Call pbx_getCustomerExtensionDetails(" + id + "," + '@total_extensions' + "," + '@total_registered_extensions' + ")")
        return  sqlData.then((response) => {        
            let rtnData;
            if (response) {
                let sql2 = knex.select(knex.raw('@total_extensions  as total_extensions' + "," + '@total_registered_extensions as total_registered_extensions'))
                return sql2.then((response2) => {                
                    rtnData = response2[0];
                    return rtnData;
                    // res.send({ response: response2[0] });
                })
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
    }

    const getCustomerLiveCalls = (id) => {
      var dataArr;
      return knex.raw("Call pbx_getCustomerLiveCalls(" + id + ")")
            .then((response) => {
                dataArr = response[0][0][0] ? response[0][0][0]['live_Calls'] : 0;
                // console.log(dataArr);
                return dataArr = response[0][0][0] ? response[0][0][0]['live_Calls'] : 0;
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }


    const getrealtimeRegistrations =  (customerList) => {
            return customerList.map( (item) => {
                let obj = item;
                // obj['registered_extension'] =  getCustomerExtensions(obj['id']);
                // obj['live_calls'] =  a;   // getCustomerLiveCalls(obj['id']);
                return obj;
            }
            );
    }



    const executeCustomers = async () => {
        try{
            const livecallsCustIDs = await returnCdrCustomerIds();
            const regExtCustsIDs = await returnExtCustomerIds();
            const filtersCustomerIds = await manageCustomersID(livecallsCustIDs,regExtCustsIDs);
            const customerList = await getCustomers(filtersCustomerIds);
            const response = getrealtimeRegistrations(customerList);

     res.json({
        response 
        });
           
        }
        catch (error) {
            res.send({ response: { code: error.errno, message: error.sqlMessage } });
          }
    }

     executeCustomers();


    // let sql = knex(table.tbl_Customer + ' as c').select('c.first_name','c.id','c.balance',
    //           Knex.raw('GROUP_CONCAT(cdr.id) as registered_extension'),
    //           Knex.raw('GROUP_CONCAT(ex.ext_number) as registered_extension'))
    //          .leftJoin(table.tbl_Extension_master + ' as ex', 'ex.customer_id','c.id')
    //          .leftJoin(table.tbl_pbx_realtime_cdr + ' as cdr', 'cdr.customer_id','c.id')
    //          .groupBy('ex.customer_id') 
    //          .where('c.role_id', '=', "1")
    //          .orderBy('c.id','desc');

    // sql.then((response) => {
    //     res.json({
    //         response
    //     });
    // }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    // console.log( knex.raw("Call pbx_getCustomerExtensionDetails(" + 333 + "," + '@total_extensions' + "," + '@total_registered_extensions' +");SELECT " + '@total_extensions' + "," + '@total_registered_extensions' +";").toString())
   
    // knex.raw("Call pbx_getAdminRealtimeRegistration()")
    //     .then((response) => {
    //         if (response) {
    //             res.send({ response: response[0][0] }); 
    //         }
    //     }).catch((err) => {
    //         res.send({ response: { code: err.errno, message: err.sqlMessage } });
    //     });

//    knex.raw("Call pbx_getCustomerExtensionDetails(" + 333 + "," + '@total_extensions' + "," + '@total_registered_extensions' + ")")
//     .then((response) => {
//         if (response) {
//             knex.select(knex.raw('@total_extensions  as total_extensions' + "," + '@total_registered_extensions as total_registered_extensions')).then((response2) => {
//                 res.send({ response: response2[0] }); 
//             })
//         }
//     }).catch((err) => {
//         res.send({ response: { code: err.errno, message: err.sqlMessage } });
//     });
}

function getAllCallDetails(req, res) {
    let currentDate = moment(new Date()).format('YYYY-MM-DD')
    let sql = knex(table.tbl_pbx_realtime_cdr + ' as c')
        .select('c.*', knex.raw('DATE_FORMAT(c.start_time, "%d/%m/%Y %H:%i:%s") as start_time'))
        .where('c.current_status', '!=', "CHANNEL_HANGUP")
        .andWhere('c.start_time', '>=',currentDate)        
        // if(req.query.role == 3){
        //     sql.whereIn('c.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.id}`))
        // }
        sql.orderBy('c.start_time', 'desc');  
    sql.then((response) => {        
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
function getAllResellerCallDetails(req, res) {
    let currentDate = moment(new Date()).format('YYYY-MM-DD')
    let sql = knex(table.tbl_pbx_realtime_cdr + ' as c')
        .select('c.*', knex.raw('DATE_FORMAT(c.start_time, "%d/%m/%Y %H:%i:%s") as start_time'))
        .where('c.current_status', '!=', "CHANNEL_HANGUP")
        .andWhere('c.start_time', '>=',currentDate)        
        if(req.query.role == 3){
            sql.whereIn('c.customer_id',knex.raw(`SELECT id FROM customer WHERE created_by = ${req.query.ResellerID}`))
        }
        sql.orderBy('c.start_time', 'desc');    
    sql.then((response) => {        
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCustomerCallDetails(req, res) {
    let customerId = parseInt(req.query.customerId);
    let currentDate = moment(new Date()).format('YYYY-MM-DD')
    let sql = knex(table.tbl_pbx_realtime_cdr + ' as c')
             .select('c.*',knex.raw('DATE_FORMAT(c.start_time, "%d/%m/%Y %H:%i:%s") as start_time'))
             .where('c.customer_id', '=', "" + customerId + "")
            //  .where('c.start_time', '>=',currentDate)   
             .andWhere('c.current_status', '!=', "CHANNEL_HANGUP") 
             .orderBy('c.start_time','desc');    
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCustomerExtensionInfo(req, res) {    
    let customerId = parseInt(req.query.customerId);
    const totalSql = knex(table.tbl_Extension_master).count('id', { as: 'total_extensions' })
                    .where('status', '=', "1")
                    .andWhere('customer_id', '=', "" + customerId + "");
    const registerSql = knex(table.tbl_pbx_sip_location + ' as sip').count('*', { as: 'total_extensions' })
                    .leftJoin(table.tbl_Extension_master + ' as ex', 'ex.ext_number','sip.username' )
                    .where('sip.username', 'like','' + customerId + '%');

    Promise.all([totalSql,registerSql]).then((results)=>{
        const [ totalResult, regResult ] = results;
        res.send({ response: {total_extensions: totalResult[0].total_extensions, total_registered_extensions: regResult[0].total_extensions} });
    }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
    // let sql = knex.raw("Call pbx_getCustomerExtensionDetails(" + customerId + "," + '@total_extensions' + "," + '@total_registered_extensions' + ")")
    // sql.then((response) => {
    //     if (response) {
    //         let sql2 = knex.select(knex.raw('@total_extensions  as total_extensions' + "," + '@total_registered_extensions as total_registered_extensions'))
    //          sql2.then((response2) => { 
    //          res.send({ response: response2[0] });
    //         })
    //     }
    // }).catch((err) => {
    //     res.send({ response: { code: err.errno, message: err.sqlMessage } });
    // });
}

function getCustomerInvoiceDetail(req, res) {
    let customerId = req.query.customerId == 0 ? null : req.query.customerId;
    let query = knex.select('i.*', knex.raw('DATE_FORMAT(i.invoice_date, "%M %d %Y") as invoice_date'), knex.raw('DATE_FORMAT(i.invoice_period, "%M %d %Y") as invoice_period'),
        knex.raw('DATE_FORMAT(i.invoice_due_date, "%M %d %Y") as invoice_due_date'), 'c.balance', 'c.credit_limit',
        knex.raw('if(i.paid_status = "1","Paid",if(i.paid_status = "2","Unpaid",if(i.paid_status = "3","Overdue","Do not pay"))) as paid_status')
    )
        .from(table.tbl_Invoice_Item + ' as inv')
        .first()
        .leftJoin(table.tbl_Pbx_Invoice + ' as i', 'i.id', 'inv.invoice_id')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'i.customer_id')
        .where('i.customer_id', customerId)
        // .andWhere('cd.customer_id', '=', "" + customerId + "")
        // .andWhere("cd.bridge_time", ">", "0")
        // .groupBy(knex.raw('DATE_FORMAT(cd.start_time, "%k")'))
        .orderBy('i.id', 'desc')
    query.then((response) => {
        if(response){
        var obj = response;
        let invoiceId = response['id'];
        var didCharges = 0;
        var PSTNCharges = 0;
        knex.raw("Call pbx_get_invoice_item(" + invoiceId + ")")
            .then((response2) => {
                if (response2) {
                    let data = response2[0][0] ? response2[0][0] : [];
                    data.forEach(element => {
                        if (element['item_type'] == '1') {  //DID
                            didCharges += element['amount']
                            didCharges = Math.round(didCharges * 100) / 100;
                        }
                        if (element['item_type'] == '2') {  //PSTN
                            PSTNCharges += element['amount']
                            PSTNCharges = Math.round(PSTNCharges * 100) / 100;
                        }
                    });
                    obj['pstn_charges'] = PSTNCharges;
                    const newObj = {...obj, did_charges: didCharges};
                    res.json({
                        newObj
                    });
                }
            }).catch((err) => {
                res.send({ response: { code: err.errno, message: err.sqlMessage } });
            });
        }else{
            res.json('');

        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}



module.exports = {
    getStatusProductwiseDashboard, getMonthlyRevenue, getTotalMonthlyCalls, getTotalMonthlyIncomingCalls,
    getTotalMonthlyOutgoingCalls, getTotalMonthlyCallDuration, getAnsweredCalls, getNotAnsweredCalls, getFailedCalls,
    getMinuteConsumedAnsweredCalls, getMinuteConsumeFailedCalls, getMinuteConsumeNotAnsweredCalls, getBusyCalls, getRejectedCalls,
    getDiskSpaceUsage, getCallsPerTenant, getCallsPerHours, getTotalCallsPerTenant, getTotalCallsPerHours, getTotalRevenue,
    getTotalActiveExtension, getActiveExtension,getActiveResellerExtension, getDateWiseMinuteConsumedAnsweredCalls, getDateWiseMinuteConsumeFailedCalls,
    getDateWiseMinuteConsumeNotAnsweredCalls, getPbxTotalIvrByCustomer, getAsrCallsPerHours, getTotalAsrCallsPerHours,
    getAcdCallsPerHours, getTotalAcdCallsPerHours, getRegisteredExtension,FilterRegisteredExtension,FilterRegisteredAllExtension, getCustomerFullDetails, getCustomerCallDetails,
    getAllCallDetails,getAllResellerCallDetails, getCustomerExtensionInfo, getForwaredCalls, getCustomerInvoiceDetail,ActiveExtensions,inactiveExtensions,getRegisExtension,getTotalActiveResellerExtension
};
