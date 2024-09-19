const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function getPluginByCustomer(req, res) {
    let user_id = req.body.id
    let id = req.body.data_id;
    let sql = knex.select('p.id', 'p.name', 'p.description', 'p.call_type', knex.raw('if(p.status = "1", "Active", "Inactive") as status'), 'ppa.action_value', 'ppa.action_type').from(table.tbl_pbx_plugin + ' as p')
        .leftJoin(table.tbl_plugin_action + ' as ppa', 'ppa.plugin_id', 'p.id')
        .where('p.customer_id', user_id)
        .andWhere('ppa.default_action', '1')
        .orderBy('p.id','desc')
    if (id) {
        sql.andWhere('p.id', id);
    }
    sql.then((response) => {
        res.send({
            response: response
        });
    }).catch((err) => { console.log(err); throw err });
}

// , knex.raw('if(pd.otp_verification = "ON", "true", "false") as otp_verification'),
function getPluginByID(req, res) {
    let user_id = req.body.cust_id
    let id = req.body.id;
    var obj = {};
    let sql = knex(table.tbl_pbx_plugin).select('').where('id', id).andWhere('customer_id', user_id);
    sql.then(async (response) => {
        Object.assign(obj, response);
        if (response) {
            await knex.select('pd.id','pd.otp_verification', 'c.name', 'pd.dest_prefix','pd.country_code').from(table.tbl_pbx_plugin_destination + ' as pd').leftJoin(table.tbl_Country + ' as c', 'c.id', 'pd.country_code').where('pd.plugin_id', id).then((response2) => {
                Object.assign(obj, { destination: response2 })

            })
            await knex(table.tbl_plugin_action).select('*').where('plugin_id', id).then((response3) => {
                for (let i = 0; i < response3.length; i++) {
                    if (response3[i]['default_action'] == '1') {
                        Object.assign(obj[0], { default_action_type: response3[i]['action_type'], default_action_value: response3[i]['action_type'] != '3' ? response3[i]['action_value_id'] : response3[i]['action_value'], default_action_name: response3[i]['action_name'], default_country_code: response3[i]['dest_prefix'], default_action_value_name: response3[i]['action_value'] })
                        delete response3[i]['action_type'];
                        delete response3[i]['action_value_id'];
                        delete response3[i]['action_name'];
                        delete response3[i]['plugin_id'];
                        // delete response3[i]['id'];
                        delete response3[i]['default_action'];
                    }
                }
                Object.assign(obj, { action: response3 })
            })
        }
    }).then((response) => {
        res.send({
            obj
        })

    })
}


function createPlugin(req, res) {  

    let id = req.body.customer_id;
    action_value = req.body.action_value;
    let actionValue = "";
    let status = "";
    let state = "";
    if(req.body.default_state == '1'){
        state = "open"
    }else{
        state = "close"
    }
    if(req.body.status == true){
        status = '1'
    }else{
        status = '0'
    }
    if (req.body.action_type == "3") {
        actionValue =  req.body.phonee;
    } else {
        actionValue = req.body.action_value;
    }

    if(req.body.language == 'English'){
        req.body.language = 'en';
    }
    let destination = [];
    let plug_Action = [];
    req.body.name = req.body.name ? "" + req.body.name + "" : null;
    req.body.description = req.body.description ? "" + req.body.description + "" : "";

    knex.select('p.name')
    .from(table.tbl_pbx_plugin + ' as p')
    .where('p.customer_id',id)
    .andWhere('p.name',req.body.name)
    .then((resp)=>{
        if(resp.length){
            res.send({
                status_code: 409
            })
        }else{
        let sql = knex(table.tbl_pbx_plugin).insert({
            name: req.body.name, description: req.body.description,
            call_type: req.body.call_type, lang: req.body.language, plugin_default_state: state,
            display_delay_time: req.body.display_time, expand_delay_time: req.body.expand_time, status: status, customer_id: req.body.customer_id, auth_token: req.body.auth_token, footer_name: req.body.footer_name, plugin_color: req.body.value , ext_number: req.body.ext_number
        })
        sql.then((response) => {        
            req.body.destiantionList.map(data => {
                destination.push({ dest_prefix: data.codes, otp_verification: data.otps == "false"? "OFF" : "ON", customer_id: req.body.customer_id , country_code: data.c_code})
            })
            destination.map(item => Object.assign(item, { plugin_id: response[0] }));
            let sql1 = knex(table.tbl_pbx_plugin_destination).insert(destination)
            sql1.then((response1 => {
                let sql3 = knex(table.tbl_plugin_action).insert({
                    action_name: req.body.action_name, action_type: req.body.action_type,
                    action_value: actionValue , default_action: '1',dest_prefix: req.body.action_type != 3 ? "" : req.body.country_code, plugin_id: response[0], action_value_id: req.body.actionValId
                });
                sql3.then((response2) => {
                    if (req.body.pluginAction.length != 0) {
                        req.body.pluginAction.map(data => {
                            Object.assign(data.action_value, { value: actionValue })
                            plug_Action.push({ action_name: data.name, action_type: data.action_type, action_value: data.action_type != 3 ? data.action_value : data.country_code,action_value_id: data.action_type != 3 ? data.action_value_id : "" ,dest_prefix: data.action_type != 3 ? "" : data.country  ,plugin_id: response[0] })
                        })
                        knex(table.tbl_plugin_action).insert(plug_Action).then((response3) => {
                            res.send({
                                status_code: 200
                            })
                        })
                    } else {
                        res.send({
                            status_code: 200
                        })
                    }
                })
            }))
        })
    }
        
    })

    
}

function deletePlugin(req, res) {
    let id = req.query.id;
    knex.raw('call pbx_delete_plugin("' + id + '")')
        .then((response) => {
            res.send(response[0][0]);
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}




function getPluginByFilter(req, res) {
    let user_id = req.query.cust_id
    let id = req.body.data_id;
    let name =  req.query.by_name;
    let sql = knex.select('p.id', 'p.name', 'p.description', 'p.call_type', knex.raw('if(p.status = "1", "Active", "Inactive") as status'), 'ppa.action_value', 'ppa.action_type').from(table.tbl_pbx_plugin + ' as p')
        .leftJoin(table.tbl_plugin_action + ' as ppa', 'ppa.plugin_id', 'p.id')
        .where('p.customer_id', user_id)
        .andWhere('ppa.default_action', '1')
        .andWhere('p.name','like',"%" +name+ "%")
        .orderBy('p.id','desc')
    if (id) {
        sql.andWhere('p.id', id);
    }
    sql.then((response) => {
        res.send({
            response: response
        });
    }).catch((err) => { console.log(err); throw err });

}


function getCountryByDest(req, res) {
    knex(table.tbl_Country).select('name').where('phonecode', req.query.code)
        .then((response) => {
            res.send(response);
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function updatePluginDetails(req, res) {
    let id = req.body.customer_id;
    let data = req.body;  
    let actionValue = data.action_type != "3" ? data.action_value : (data.phonee);
    let status = "";
    if(data.default_state == '1'){
        state = "open"
    }else{
        state = "close"
    }
    if(data.status == true){
        status = '1'
    }else{
        status = '0'
    }
    if(data.language == 'English'){
        data.language = 'en';
    }
// let otpsss= req.body.destiantionList;
// for (let index = 0; index < array.length; index++) {
//     const element = array[index];
    
// }
     knex.select('p.name')
    .from(table.tbl_pbx_plugin + ' as p')
    .where('p.customer_id',id)
    .andWhere('p.name',req.body.name)
    .andWhere('p.id','!=',req.body.plugin_id)
    .then((resp)=>{
        if(resp.length){
            res.send({
                status_code: 409
            })
        }else{
    let sql = knex(table.tbl_pbx_plugin).update({
        name: data.name, description: data.description, status: status, call_type: data.call_type , plugin_default_state: state,
        display_delay_time: data.display_time, expand_delay_time: data.expand_time, lang:  data.language , footer_name:  data.footer_name, plugin_color: data.value, ext_number: data.ext_number
    }).where('id', data.plugin_id).andWhere('customer_id', data.customer_id);    
    sql.then((response) => {
        let destination = [];
        let plug_Action = [];
        knex(table.tbl_pbx_plugin_destination).where('plugin_id', data.plugin_id).del().then(response2 => {
            if (data.destiantionList.length !== 0) {
                data.destiantionList.map(item => {
                    destination.push({ dest_prefix: item.codes, otp_verification: item.otps == "false"? "OFF" : "ON", customer_id: data.customer_id, plugin_id: data.plugin_id , country_code: item.c_code})
                })                
                knex(table.tbl_pbx_plugin_destination).insert(destination).then(response3 => {
                })
            }
        })
         knex(table.tbl_plugin_action).where('plugin_id', data.plugin_id).del().then(response4 => {
            let sql2 =   knex(table.tbl_plugin_action).insert({
                action_name: data.action_name, action_type: data.action_type,
                action_value: actionValue, default_action: '1',dest_prefix: data.action_type != 3 ? "" : data.country_code, plugin_id: data.plugin_id ,action_value_id: data.actionValId
            })
            sql2.then(response5 => {
                if (data.pluginAction.length !== 0) {
                    data.pluginAction.map(item => { 
                        item.country = item.country ? item.country : "";
                        plug_Action.push({ action_name: item.name, action_type: item.action_type, action_value: item.action_type != 3 ? item.action_value : item.country_code,action_value_id: item.action_type != 3 ? item.action_value_id : "", dest_prefix: item.country ,plugin_id: data.plugin_id })
                    })                    
                    knex(table.tbl_plugin_action).insert(plug_Action).then(response6 => {
                        res.send({
                            status_code: 200
                        })
                    })
                }
                else {
                    res.send({
                        status_code: 200
                    })
                }
            })
        })
    })
}
    })

}

module.exports = { getPluginByCustomer, createPlugin, deletePlugin, getPluginByFilter, getPluginByID, getCountryByDest, updatePluginDetails };
