const config = require("../config/app");
const { knex } = require("../config/knex.db");
const table = require("../config/table.macros");
const { createModuleLog } = require('../helper/modulelogger');

const createApiIntegration = async (req, res) => {           
    let formArray = [];
    let obj = {}
    for (let i = 0; i < req.body.parameterForm.length; i++) {
        obj[req.body.parameterForm[i].header] = req.body.parameterForm[i].header_value;
    }
    formArray.push({ auth_parameters: "" + JSON.stringify(obj) + "", customer_id: req.body.customer_id, provider_name: req.body.provider, url: req.body.url, auth_url: req.body.auth_url, url_details: req.body.url_detail });
    let sql
    if (req.body.id) {
        sql = knex(table.tbl_pbx_obd_api_details).where('id', req.body.id).del().then((response) => {            
            console.log(response)
        })
    }
    await knex(table.tbl_pbx_obd_api_details).insert(formArray).then(async (response) => {
        if (response.length) {            
       knex(table.pbx_obd)
        .where('provider_id',req.body.id)
        .update({
            provider_id: response[0]
        }).then((resp) => {
            res.status(200).send({
                status_code: 200,
                message: "Success."
            })
        })                                
        }
    }).catch((err) => {        
        res.send({
            status_code: 400,
            message: err.sqlMessage
        })
    });
}

const getApiIntegration = (req, res) => {
    let customer_id = req.query.customer_id;
    let sql = knex(table.tbl_pbx_obd_api_details).where('customer_id', customer_id);
    sql.orderBy('id','desc')
    sql.then((response) => {   
        // response.map(item => {
        //     item['auth_parameter'] = item.auth_parameters;
        //     delete item.auth_parameters;
        // })
        res.send({
            response: response
        })
    }).catch((err) => {
        res.send({
            status_code: 400,
            message: err.sqlMessage
        })
    })
}

const getApiIntegrationById = (req, res) => {
    let customer_id = req.query.customer_id;
    let id = req.query.id;
    let sql = knex(table.tbl_pbx_obd_api_details).where('id', id).andWhere('customer_id', customer_id)
    sql.then((response) => {
        if (response.length) {
            let param = JSON.parse(response[0].auth_parameters);
            let modifyArray = []
            for (const property in param) {
                modifyArray.push({ 'header': property, "header_value": param[property] })
            }
            // console.log(modifyArray)
            res.json({
                response,
                modifyArray
            })
        }
    }).catch((err) => {
        res.json({
            status_code: 400,
            message: err.sqlMessage
        })
    })
}

const deleteApiIntegration = (req, res) => {    
    let sql = knex(table.tbl_pbx_obd_api_details).where('customer_id',req.query.customer_id).andWhere('id',req.query.id).del();
    sql.then((response) => {        
        if(response){
            res.send({
                code: 200
            })
        }
    })
}

const getApiIntegrationByFilter = (req, res) => {
    let customer_id = req.query.customer_id;
    let data = req.body;    
    let sql = knex(table.tbl_pbx_obd_api_details).where('customer_id', customer_id);
    if(data.name != ''){
        sql.andWhere('provider_name', 'like', "%" + data.name + "%");
    }
    sql.orderBy('id','desc')
    sql.then((response) => {        
        res.send({
            response: response
        })
    }).catch((err) => {
        res.send({
            status_code: 400,
            message: err.sqlMessage
        })
    })
}

module.exports = {
    createApiIntegration, getApiIntegration, getApiIntegrationById, deleteApiIntegration, getApiIntegrationByFilter
}