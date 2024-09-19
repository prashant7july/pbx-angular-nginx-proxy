const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');

async function createAddBalance(req, res) {
    let paymentDate = moment(req.body.payment_date).format('YYYY-MM-DD HH:mm:ss');
    req.body.agent_commission = req.body.agent_commission ? 1 : 0;        
    let balance;
    if (req.body.agent_commission == 1) {
        balance = await manageResellerCommissionBalance(req.body);        
    }    
    let total_balance = req.body.agent_commission == 1 ? balance.total_balance : req.body.amount;        
    let sql = knex.raw("Call pbx_save_logpayment(" + req.body.id + "," + req.body.customer_id + ",'" + paymentDate + "'," + total_balance + ",'" + req.body.description + "'," + req.body.agent_commission + ",'" + req.body.payment_type + "',0,0,0,0,'1')")    
    sql.then(async (response) => {
        if (req.body.agent_commission == 1) {
            const pbxProduct = req.body.product.includes('1');
            const outboundProduct = req.body.product.includes('2');            
            let pbxUpdate;
            let outboundUpdate;
            if(pbxProduct){                            
               pbxUpdate = await knex(table.tbl_pbx_reseller_info).increment('balance',balance.pbx_balance_percent).where('reseller_id', req.body.created_by).andWhere('product_id',1);               
            }
            if(outboundProduct){
               outboundUpdate = await knex(table.tbl_pbx_reseller_info).increment('balance',balance.outbound_balance_percent).where('reseller_id', req.body.created_by).andWhere('product_id',2);
            }            
        }
        if (response) {
            res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
        }
    }).catch((err) => {        
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}

// async function manageResellerCommissionBalance(value){    
//     let commission = value.commission.split(',');    
//     let balance_percent = (Number(commission[0])/100)*Number(value.amount);        
//     return [Number(value.amount) - balance_percent, balance_percent];

// }

async function manageResellerCommissionBalance(value) {
    let commission = value.commission.split(',');

    // Define commission rates based on product type
    let pbxCommissionRate;
    let outboundCommissionRate;

    if (value.product === '1,2') {
        pbxCommissionRate = Number(commission[0]) / 100;
        outboundCommissionRate = Number(commission[1]) / 100;
    } else if (value.product === '1') {
        pbxCommissionRate = Number(commission[0]) / 100;
        outboundCommissionRate = 0; // No outbound commission
    } else if (value.product === '2') {
        pbxCommissionRate = 0; // No PBX commission
        outboundCommissionRate = Number(commission[0]) / 100;
    } else {
        throw new Error('Invalid product');
    }

    // Calculate PBX and outbound commission amounts
    let pbxCommission = pbxCommissionRate * Number(value.amount);
    let outboundCommission = outboundCommissionRate * Number(value.amount);

    // Calculate total balance after deducting both commissions
    let totalBalance = Number(value.amount) - pbxCommission - outboundCommission;

    return {
        total_balance: totalBalance,
        pbx_balance_percent: pbxCommission,
        outbound_balance_percent: outboundCommission
    };
}



function createAddResellerBalance(req, res) {
    // let paymentDate =  req.body.payment_date.split('T');
    // let paymentDate1 = paymentDate[1].split('Z');
    // let datestring = paymentDate[0] + ' ' + paymentDate1[0] ; // just commented bcz we are getting current time 
    let paymentDate = moment(req.body.payment_date).format('YYYY-MM-DD HH:mm:ss');
    req.body.agent_commission = req.body.agent_commission ? 1 : 0;
    knex.raw("Call pbx_save_reseller_logpayment(" + req.body.id + "," + req.body.customer_id + ",'" + paymentDate + "'," + req.body.amount + ",\
    '" + req.body.description + "'," + req.body.agent_commission + ",'" + req.body.payment_type + "',0,0,0,0,'1')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function viewAddBalance(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    knex.raw("Call pbx_get_addBlanace(?, ?, ?)",[req.body.id, req.body.role, req.body.ResellerID])
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function deleteAddBalance(req, res) {
    knex.raw("Call pbx_delete_addBalance(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function getAddBalanceByFilters(req, res) {
    let data = req.body.filters;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    data.by_paymentType = data.by_paymentType ? ("'" + data.by_paymentType + "'") : null;

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;

    knex.raw("Call pbx_getAddBalanceByFilters(?, ?, ?, ?, ?, ?)", [rangeFrom, rangeTo, data.by_company, data.by_paymentType, req.body.role, req.body.ResellerID]).then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}


module.exports = {
    createAddBalance, createAddResellerBalance, viewAddBalance, deleteAddBalance, getAddBalanceByFilters
};