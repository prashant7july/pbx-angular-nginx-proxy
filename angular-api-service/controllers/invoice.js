const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const { nextTick } = require('async');

function viewAllInvoice(req, res) {
    req.query.id = req.query.id ? req.query.id : null;
    knex.raw("Call pbx_get_invoice(" + req.query.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        });
}


function getInvoiceDetail(req, res) {
    req.body.id = req.query.id;
    knex.raw("Call pbx_get_invoice_item(" + req.query.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getInvoiceCdrDetail(req, res){
    knex.raw("Call pbx_get_cdr_records_by_customer(" + req.query.id + ")")
    .then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllInvoicesOfCustomer(req, res){
    req.query.id = req.query.id ? req.query.id : null;
    knex.raw("Call pbx_get_customer_invoice(" + req.query.id + ","+req.query.role+")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getAllInvoicesOfCustomerOfYear(req, res){
    req.query.id = req.query.id ? req.query.id : null;
    knex.raw("Call pbx_get_customer_invoice_of_year(" + req.query.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getAllInvoicesOfManagerCustomer(req, res){
    req.query.id = req.query.id ? req.query.id : null;
    req.query.c_id = req.query.c_id ? req.query.c_id : null;
    knex.raw("Call pbx_get_manager_customer_invoice(" + req.query.id + "," + req.query.c_id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getInvoicesOfManagerCustomerByFilters(req, res) {
    let data = req.body.filters;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    data.reference_num = data.reference_num  ? ("'" + data.reference_num + "'") : null;
    data.by_country = data.by_country  ? ("'" + data.by_country + "'") : null;
    data.paid_status = data.paid_status  ? ("'" + data.paid_status + "'") : null;
    data.customer_status = data.customer_status  ? ("'" + data.customer_status + "'") : null;
    data.amount = data.amount ? ("'" + data.amount + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    data.account_manager_id = data.account_manager_id ? ("'" + data.account_manager_id + "'") : null;

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    knex.raw("Call getAccountManagerInvoiceByFilter(" + rangeFrom + "," + rangeTo + "," + data.paid_status + ", " + data.by_company + ", " + data.by_country + ", " + data.reference_num+", " + data.amount + ", " + data.by_product + ", " + data.account_manager_id + "," + data.customer_status + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        // console.log(err);
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
} 

function getInvoiceByFilters(req, res) {
    let data = req.body.filters;
    if(data.by_company){
        data.by_company = (data.by_company).length ? ("'" +data.by_company+ "'") : null;
        }else{
            data.by_company = null
        }
    // data.by_company = data.by_company  ? ("'" + data.by_company + "'") : null;
    // data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    // let rangeFrom = data.by_date  ? data.by_date[0].split('T')[0] : null;
    // let rangeTo = data.by_date  ? data.by_date[1].split('T')[0] : null;
    data.reference_num = data.reference_num  ? ("'" + data.reference_num + "'") : null;
    data.by_country = data.by_country  ? ("'" + data.by_country + "'") : null;
    data.paid_status = data.paid_status  ? ("'" + data.paid_status + "'") : null;
    data.customer_status = data.customer_status  ? ("'" + data.customer_status + "'") : null;
    data.amount = data.amount ? ("'" + data.amount + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    data.customer_id = data.customer_id ? ("'" + data.customer_id + "'") : null;
    let start_date = data.by_date ? data.by_date[0] : null;
    let end_date = data.by_date ? data.by_date[1] : null;
    rangeFrom = start_date ? ("'" + moment(start_date).format('YYYY-MM-DD') + "'") : null;
    rangeTo = end_date ? ("'" + moment(end_date).format('YYYY-MM-DD') + "'") : null;


    knex.raw("Call getInvoiceFilter(" + rangeFrom + ", " + rangeTo + "," + data.paid_status + "," + data.by_company + ", " + data.by_country + ", " + data.reference_num+", " + data.amount + ", " + data.by_product + ", " + data.customer_id + "," + data.customer_status + ","+req.body.role+")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        // console.log(err);
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}


function saveAdminPaymentLog(req,res){
    
    let data = req.body.credentials;
    let paymentMode = data.paymentMode == '1' || data.paymentMode == '' ? 'Cash' : data.paymentMode == '2' ? 'DD' : data.paymentMode == '3' ? 'Cheque' : 'UPI';
    let transaction_date = moment(data.transaction_date).format('YYYY-MM-DD HH:mm:ss');


    let sql = knex.table(table.tbl_Epayment_Log)
    .insert({
        cust_id: data.customer_id,
        amount: data.amount_to_pay,
        paymentmethod : paymentMode,
        invoice_number : data.invoice_number,
        dd_number : data.dd_number,
        cheque_number : data.cheque_number,
        upi_id : data.upi_number,
        bank_name : data.bank_name,
        transaction_date : transaction_date,
        transaction_detail : data.desc,
        currency : "INR"
    })
    sql.then((response)=>{
        if(response){ 
            knex.table(table.tbl_Epayment_Log).update({status: "TXN_SUCCESS"}).where('id',response[0])
            .then((resp2) =>{
                if(data.paid == '1'){
                    knex.table(table.tbl_Pbx_Invoice).where('reference_num',data.invoice_number).update({paid_status : '1'})
                    .then((resp)=>{
                        console.log("paid");
                    })
                }
                res.send({
                    status_code : 200
                })
            })
        }else{
            knex.table(table.tbl_Epayment_Log).update({status: "TXN_FAILURE"}).where('id',response[0])
            .then((resp2)=>{
                res.send({
                    status_code : 402
                })
            }).catch((err) =>{
                res.send({ response: { code: err.errno, message: err.sqlMessage } });
            })
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getPreviousLogPayments(req,res){
    
    let invoice_number = req.query.id;

    let sql = knex.from(table.tbl_Epayment_Log).select(knex.raw('sum(amount) as total')).where('invoice_number',invoice_number)
    sql.then((response)=>{
        if(response.length > 0){
            res.send({
                response: response
            })
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

module.exports = { viewAllInvoice, getInvoiceDetail, getInvoiceCdrDetail, getInvoicesOfManagerCustomerByFilters, getInvoiceByFilters, getAllInvoicesOfCustomer, getAllInvoicesOfManagerCustomer ,getAllInvoicesOfCustomerOfYear
,saveAdminPaymentLog,getPreviousLogPayments}
