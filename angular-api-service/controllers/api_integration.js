const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const axios = require("axios");


const api_integration = async (req, res) => {
    let ref_id = req.body['REF_ID'].split(',');
    let term_code
    if (req.body['A_DIAL_STATUS'] == 'Connected') {
        term_code = 200;
    } else if (req.body['A_DIAL_STATUS'] == 'User Not Responding') {
        term_code = 486;
    } else if (req.body['A_DIAL_STATUS'] == 'Timeout') {
        term_code = 487;
    } else {
        term_code = 400;
    }
    console.log(req.body, ">>>>>>>>>>>>>>>>>>>>>>", ref_id, "term_code", term_code)
    let data = req.body;

    if (ref_id[1] != undefined && ref_id[2] != undefined) {
        let sql = knex.raw("call switch_obd_instance_id_hangup(" + ref_id[0] + ", " + ref_id[1] + ", '" + ref_id[2] + "', " + term_code + ", " + null + ")").then((response) => {
            console.log(response)
        })
    }
    let sql2 = knex.raw('call pbx_create_ObdApiCdr("' + data.SERVICE_TYPE + '", "' + data.EVENT_TYPE + '", "' + data.CALL_ID + '", "' + data.DNI + '", "' + data.A_PARTY_NO + '", "' + data.CALL_START_TIME + '", "' + data.A_PARTY_DIAL_START_TIME + '", "' + data.A_PARTY_DIAL_END_TIME + '", "' + data.A_PARTY_CONNECTED_TIME + '", "' + data.A_DIAL_STATUS + '", "' + data.A_PARTY_END_TIME + '", "' + data.B_PARTY_NO + '", "' + data.B_PARTY_DIAL_START_TIME + '", "' + data.B_PARTY_DIAL_END_TIME + '", "' + data.B_PARTY_CONNECTED_TIME + '", "' + data.B_PARTY_END_TIME + '", "' + data.B_DIAL_STATUS + '", "' + ref_id[0] + '", "' + data.RecordVoice + '", "' + data.DISCONNECTED_BY + '", "' + ref_id[1] + '")');
    let response = await sql2;

    let sql3 = knex(table.tbl_Customer + ' as c').leftJoin(table.pbx_obd + ' as obd', 'c.id', 'obd.cust_id').where('obd.id', ref_id[0]).select('c.callback_url');
    let webhook_url = await sql3;
    if (webhook_url[0]['callback_url'] != "") {
        const url = webhook_url[0]['callback_url'];
        axios.post(url, req.body)
            .then(response => {
                console.log('Webhook sent successfully');
                console.log('Response:', response.data);
            })
            .catch(error => {
                console.error('Error sending webhook:', error.message);
            });
    }

    res.send({
        response
    })   
}

module.exports = {
    api_integration
}
