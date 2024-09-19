const { response } = require('express');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const { createModuleLog } = require('../helper/modulelogger');
const pushEmail = require('./pushEmail');

function createExtension(req, res) {
    var finalCall = 0;
    let profile_img = "assets/uploads/Profile-Image.png";
    let url = req.protocol + '://' + req.get('host');
    var data = req.body.extension;

    if (data.misscall_notify === true || data.misscall_notify == '1') {
        data.misscall_notify = '1';
    } else {
        data.misscall_notify = '0';
    }
    if (data.plug_in === true || data.plug_in == '1') {
        data.plug_in = '1';
    } else {
        data.plug_in = '0';
    }
    if (data.bal_restriction === true || data.bal_restriction == '1') {
        data.bal_restriction = '1';
    } else {
        data.bal_restriction = '0';
    }
    if (data.multiple_reg === true || data.multiple_reg == '1') {
        data.multiple_reg = '1';
    } else {
        data.multiple_reg = '0';
    }
    if (data.voice_mail === true || data.voice_mail == '1') {
        data.voice_mail = '1';
    } else {
        data.voice_mail_pwd = "";
        data.voice_mail = '0';
    }
    if (data.outbound === true || data.outbound == '1') {
        data.outbound = '1';
    } else {
        data.outbound = '0';
    }

    if (data.recording === true || data.recording == '1') {
        data.recording = '1';
    } else {
        data.recording = '0';
    }

    if (data.billing_type == 'Enterprise with pool') {
        data.billing_type = '2';
    } else if (data.billing_type == 'Enterprise without pool') {
        data.billing_type = '3';

    } else {
        data.billing_type = '1';
    }

    if (data.call_forward == true || data.call_forward == '1') {
        data.call_forward = '1';
    } else {
        data.call_forward = '0';
    }

    if (data.speed_dial == true || data.speed_dial == '1') {
        data.speed_dial = '1';
    } else {
        data.speed_dial = '0';
    }

    data.black_list = '1';

    if (data.call_transfer == true || data.call_transfer == '1') {
        data.call_transfer = '1';
    } else {
        data.call_transfer = '0';
    }

    if (data.dnd == true || data.dnd == '1') {
        data.dnd = '1';
    } else {
        data.dnd = '0';
    }

    data.token = data.token ? data.token : '';

    if (data.apiToken === true || data.apiToken == '1') {
        data.apiToken = '1';
    } else {
        data.apiToken = '0';
    }

    if (data.roaming === true || data.roaming == '1') {
        data.roaming = '1';
    } else {
        data.roaming = '0';
    }

    if (data.outbound_sms_notification === true || data.outbound_sms_notification == '1') {
        data.outbound_sms_notification = '1';
    } else {
        data.outbound_sms_notification = '0';
    }

    if (data.mobile == '' || !data.mobile) {
        data.mobile = '';
    }

    if (data.admin === true || data.admin == '1') {
        data.admin = '1';
    } else {
        data.admin = '0';
    }

    if (data.find_me_follow_me === true || data.find_me_follow_me == '1') {
        data.find_me_follow_me = '1';
    } else {
        data.find_me_follow_me = '0';
    }


    if (data.ringtone === true || data.ringtone == '1') {
        data.ringtone = '1';
    } else {
        data.ringtone = '0';
    }

    if (data.sticky_agent === true || data.sticky_agent == '1') {
        data.sticky_agent = '1';
    } else {
        data.sticky_agent = '0';
    }

    if (data.click_to_call == true || data.click_to_call == '1') {
        data.click_to_call = '1';
    } else {
        data.click_to_call = '0';
    }
    if (data.call_waiting == true || data.call_waiting == '1') {
        data.call_waiting = '1';
    } else {
        data.call_waiting = '0';
    }
    if (data.call_persistent == true || data.call_persistent == '1') {
        data.call_persistent = '1';
    } else {
        data.call_persistent = '0';
    }

    if (data.is_callerId_from_extNumber === true || data.is_callerId_from_extNumber == '1') {
        data.is_callerId_from_extNumber = '1';
    } else {
        data.is_callerId_from_extNumber = '0';
    }

    if (data.is_email_from_notificationemail === true || data.is_email_from_notificationemail == '1') {
        data.is_email_from_notificationemail = '1';
    } else {
        data.is_email_from_notificationemail = '0';
    }

    if (data.intercom_calling == true || data.intercom_calling == '1') {
        data.intercom_calling = '1';
    } else {
        data.intercom_calling = '0';
    }

    if (data.whatsapp == true || data.whatsapp == '1') {
        data.whatsapp = '1';
    } else {
        data.whatsapp = '0';
    }
    if (!data.voice_mail_pwd) {
        data.voice_mail_pwd = '12345678'
    }
    // data.c2c_value = data.c2c_value ? data.c2c_value : '0';
    data.favorite_contact = data.favorite_contact ? data.favorite_contact : '0';
    data.favorite = data.favorite ? data.favorite : '0';
    if (data.eType == '1') {
        knex(table.tbl_Extension_master).insert({
            package_id: "" + data.extUserPackage + "", customer_id: "" + data.user_id + "", ext_number: "" + data.extension_number + "",
            username: "" + data.ext_name + "", password: "" + data.web_pass + "", email: "" + data.email + "",
            send_misscall_notification: "" + data.misscall_notify + "", balance_restriction: "" + data.bal_restriction + "",
            caller_id_name: "" + data.caller_id_name + "", sip_password: "" + data.sip_pass + "",
            ring_time_out: "" + data.ring_time_out + "", dial_time_out: data.dial_time_out, external_caller_id: "" + data.external_caller_id + "", dtmf_type: "" + data.dtmf_type + "",
            caller_id_header_type: "" + data.header_type + "", caller_id_header_value: "" + data.callerID_headervalue + "", multiple_registration: "" + data.multiple_reg + "",
            codec: "" + data.codec + "", voicemail: "" + data.voice_mail + "", dnd: "" + data.dnd + "", vm_password: "" + data.voice_mail_pwd + "", outbound: "" + data.outbound + "",
            recording: "" + data.recording + "", forward: "" + data.call_forward + "", speed_dial: "" + data.speed_dial + "", black_list: "" + data.black_list + "",
            call_transfer: "" + data.call_transfer + "", billing_type: "" + data.billing_type + "", total_min_bal: data.minute_balance, token: data.token,
            api_token: data.apiToken, roaming: data.roaming, outbound_sms_notification: "" + data.outbound_sms_notification + "",
            dial_prefix: "" + data.dial_prefix + "", mobile: "" + data.mobile + "", admin: "" + data.admin + "", find_me_follow_me: "" + data.find_me_follow_me + "",
            ringtone: "" + data.ringtone + "", sticky_agent: "" + data.sticky_agent + "", click_to_call: "" + data.click_to_call + "",
            //  c2c_value: "" + data.c2c_value + "",
            is_callerId_from_extNumber: "" + data.is_callerId_from_extNumber + "",
            is_email_from_notificationemail: "" + data.is_email_from_notificationemail + "", profile_img: "" + profile_img + "", plug_in: "" + data.plug_in + "", call_waiting: "" + data.call_waiting + "", call_persistent: "" + data.call_persistent + "",
            intercom_calling: "" + data.intercom_calling + "", whatsapp: "" + data.whatsapp + "", intercom_dialout: "" + data.intercom_dialout + ""
        })
            .then((response) => {
                let a = knex.raw("Call getSIPRates('" + data.user_id + "' )");
                a.then((result) => {
                    if (result[0][0][0] && result[0][0][0]['unit_Type'] == 1) {
                        let sipData = result[0][0][0];

                        let rate = sipData.feature_rate;

                        if (sipData.billing_type == '2') { //postpaid
                            let sql = knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: data.user_id, amount: sipData.feature_rate,
                                charge_type: "8", description: 'SIP charge for - ' + data.extension_number, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            })
                            sql.then((resp) => {
                                res.json({
                                    resp

                                })
                            })
                        } else {
                            //prepaid
                            let sql1 = knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: data.user_id, amount: sipData.feature_rate,
                                charge_type: "8", description: 'SIP charge for -' + data.extension_number, charge_status: 1,
                                invoice_status: 0, product_id: 1
                            });
                            sql1.then((resp) => {
                                let query = knex(table.tbl_Customer).where('id', '=', "" + data.user_id + "")
                                    .update({
                                        balance: knex.raw(`?? - ${rate}`, ['balance'])
                                    });
                                query.then((result1) => {
                                    res.json({
                                        result1
                                    });
                                })
                            })
                        }
                    } else {
                        let input = {
                            "Extension Type": req.body.extension.eType == '1' ? "Single Extension" : "Range Extension",
                            "Extension Number": req.body.extension.extension_number,
                            "Extension Name": req.body.extension.ext_name,
                            "Web Password": req.body.extension.web_pass,
                        }
                        if (req.body.extension.is_email_from_notificationemail == true) {
                            input["Set Email from Notification Email"] = '1t';
                        }
                        input['Email'] = req.body.extension.email;
                        input['Mobile Number'] = req.body.extension.mobile;
                        if (req.body.extension.is_callerId_from_extNumber == true) {
                            input['Set Caller Id from Ext. Number'] = '1t';
                        }
                        input['Caller ID Name'] = req.body.extension.caller_id_name;
                        input['SIP Password'] = req.body.extension.sip_pass;
                        input['Ring Time Out (In Sec.)'] = req.body.extension.ring_time_out;
                        input['Dial Time Out (In Sec.)'] = req.body.extension.dial_time_out;
                        input['DTMF Type'] = req.body.extension.dtmf_type == '0' ? 'RFC2833' : req.body.extension.dtmf_type == '1' ? "SIP Info" : req.body.extension.dtmf_type == '2' ? "In Band" : "Auto";
                        input['Caller ID Header Type'] = req.body.extension.header_type == '0' ? "None" : req.body.extension.header_type == '1' ? "P-Asserted-Identity" : "Remote-Party-ID";
                        if (req.body.extension.voice_mail == true) {
                            input['Voicemail'] = '1t';
                        }
                        if (req.body.extension.admin != false) {
                            input['Admin'] = '1t';
                        }
                        if (req.body.extension.bal_restriction == 1) {
                            input['Balance Restriction'] = '1t';
                        }
                        if (req.body.extension.call_forward == true || req.body.extension.call_forward == '1') {
                            input['Call Forward'] = '1t';
                        }
                        if (req.body.extension.call_transfer == true || req.body.extension.call_transfer == '1') {
                            input['Call Transfer'] = '1t';
                        }
                        if (req.body.extension.dnd == true) {
                            input['Do Not Disturb'] = '1t';
                        }
                        if (req.body.extension.find_me_follow_me == true || req.body.extension.find_me_follow_me == '1') {
                            input['Find me Follow me'] = '1t';
                        }
                        if (req.body.extension.intercom_calling == true) {
                            input['Intercom Calling'] = '1t';
                        }
                        if (req.body.extension.multiple_reg == 1) {
                            input['Multiple Registration'] = '1t';
                        }
                        if (req.body.extension.misscall_notify == true || req.body.extension.misscall_notify == '1') {
                            input['Missed Call Alert(MCA)'] = '1t'
                        }
                        if (req.body.extension.outbound_sms_notification == true || req.body.extension.outbound_sms_notification == '1') {
                            input['Outbound SMS Notification'] = '1t';
                        }
                        if (req.body.extension.recording == true || req.body.extension.recording == '1') {
                            input['Recording'] = '1t';
                        }
                        if (req.body.extension.roaming == true || req.body.extension.roaming == '1') {
                            input['Roaming'] = '1t';
                        }
                        if (req.body.extension.ringtone == true || req.body.extension.ringtone == '1') {
                            input['Ringtone'] = '1t';
                        }
                        if (req.body.extension.speed_dial == true || req.body.extension.speed_dial == '1') {
                            input['Speed Dial'] = '1t';
                        }
                        if (req.body.extension.sticky_agent == true || req.body.extension.sticky_agent == '1') {
                            input['Sticky Agent'] = '1t';
                        }
                        if (req.body.extension.plug_in == true || req.body.extension.plug_in == '1') {
                            input['Plug In'] = '1t';
                        }
                        if (req.body.extension.call_waiting == 1) {
                            input['Call Waiting'] = '1t';
                        }
                        if (req.body.extension.call_persistent == 1) {
                            input['Call Persistent'] = '1t';
                        }
                        if (req.body.extension.whatsapp == true || req.body.extension.whatsapp == '1') {
                            input['Whatsapp'] = '1t';
                        }
                        createModuleLog(table.tbl_pbx_audit_logs, {
                            module_action_id: response[0],
                            module_action_name: req.body.extension.ext_name,
                            module_name: "extension",
                            message: "Extension Created",
                            customer_id: req.body.extension.user_id,
                            features: "" + JSON.stringify(input) + ""
                        })
                        return res.json({ "code": 200, "message": "extension created" })
                    }

                })


                // res.json({
                //     response
                // });
                let newdata = { userName: data.extension_number, email: data.email, url: url }
                pushEmail.getEmailContentUsingCategory('ExtensionCreation').then(val => {
                    pushEmail.sendmail({ data: newdata, val: val, username: data.extension_number, password: data.web_pass, email: data.email, ext_name: data.ext_name }).then((data1) => {
                        // res.json({ data1 })
                    })
                })
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    } else {
        if (data.billing_type == '3') {
            data.minute_balance = data.minute_balance / data.extension_number.length;
        }
        for (let i = 0; i < data.extension_number.length; i++) {

            if (i == (data.extension_number.length - 1)) {
                finalCall = 1;
            }
            var extensionNumber = data.extension_number[i];
            var ext_name = data.extension_number[i];
            var caller_id_name = data.extension_number[i];
            var external_caller_id = data.extension_number[i];
            // var callerID_headervalue = data.extension_number[i];
            var callerID_headervalue = data.callerID_headervalue;
            var web_pass = secure_password_generator(8);
            var sip_pass = sipPassword();
            var token = (new Date().getTime()).toString(36) + Math.random().toString(36).substr(2);

            let sql = knex(table.tbl_Extension_master).insert({
                package_id: "" + data.extUserPackage + "",
                customer_id: "" + data.user_id + "", ext_number: "" + extensionNumber + "",
                username: "" + ext_name + "", password: "" + web_pass + "",
                send_misscall_notification: "" + data.misscall_notify + "", balance_restriction: "" + data.bal_restriction + "", caller_id_name: "" + caller_id_name + "",
                sip_password: "" + sip_pass + "", ring_time_out: "" + data.ring_time_out + "", dial_time_out: "" + data.dial_time_out + "",
                external_caller_id: "" + external_caller_id + "", dtmf_type: "" + data.dtmf_type + "", caller_id_header_type: data.header_type, caller_id_header_value: "" + callerID_headervalue + "",
                multiple_registration: "" + data.multiple_reg + "", codec: "" + data.codec + "", voicemail: "" + data.voice_mail + "", dnd: "" + data.dnd + "", vm_password: "" + data.voice_mail_pwd + "", outbound: "" + data.outbound + "",
                recording: "" + data.recording + "", forward: "" + data.call_forward + "", speed_dial: "" + data.speed_dial + "", black_list: "" + data.black_list + "", call_transfer: "" + data.call_transfer + "",
                billing_type: "" + data.billing_type + "", total_min_bal: data.minute_balance, token: token,
                api_token: data.apiToken, roaming: data.roaming, outbound_sms_notification: "" + data.outbound_sms_notification + "",
                dial_prefix: "" + data.dial_prefix + "", mobile: "" + data.mobile + "", admin: "" + data.admin + "", find_me_follow_me: "" + data.find_me_follow_me + "", ringtone: "" + data.ringtone + "",
                sticky_agent: "" + data.sticky_agent + "", click_to_call: "" + data.click_to_call + "",
                //  c2c_value: "" + data.c2c_value + "",
                plug_in: "" + data.plug_in + "", intercom_calling: "" + data.intercom_calling + "", whatsapp: "" + data.whatsapp + "", intercom_dialout: "" + data.intercom_dialout + ""
            })
            sql.then((response) => {

                let a = knex.raw("Call getSIPRates('" + data.user_id + "' )");
                a.then((result) => {
                    if (result[0][0][0] && result[0][0][0]['unit_Type'] == 1) {
                        let sipData = result[0][0][0];

                        if (sipData.billing_type == '2') { //postpaid
                            let sql = knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: data.user_id, amount: sipData.feature_rate,
                                charge_type: "8", description: 'SIP charge for - ' + extensionNumber, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            })
                            sql.then((resp) => {
                                // res.json({
                                //     resp

                                // })
                            })
                        } else {
                            //prepaid
                            let sql1 = knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: data.user_id, amount: sipData.feature_rate,
                                charge_type: "8", description: 'SIP charge for -' + extensionNumber, charge_status: 1,
                                invoice_status: 0, product_id: 1
                            });
                            sql1.then((resp) => {
                                let query = knex(table.tbl_Customer).where('id', '=', "" + data.user_id + "")
                                    .update({
                                        balance: knex.raw(`?? - ${rate}`, ['balance'])
                                    });
                                query.then((result1) => {
                                    // res.json({
                                    //     result1
                                    // });
                                })
                            })
                        }
                    }
                });

            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }

        if (finalCall == 1) {
            res.status(200).send({ error: 'Success', message: 'Extension created sucessfully.' });
        } else {
            res.status(401).send({ error: 'error', message: 'Something went wrong.' });
        }

    }
}

function updateExtension(req, res) {
    let profileImg = req.body.extension.profile_img;
    var data = req.body.extension;

    if (data.misscall_notify === true || data.misscall_notify == '1') {
        data.misscall_notify = '1';
    } else {
        data.misscall_notify = '0';
    }
    if (data.plug_in === true || data.plug_in == '1') {
        data.plug_in = '1';
    } else {
        data.plug_in = '0';
    }
    if (data.bal_restriction === true || data.bal_restriction == '1') {
        data.bal_restriction = '1';
    } else {
        data.bal_restriction = '0';
    }
    if (data.multiple_reg == true || data.multiple_reg == '1') {
        data.multiple_reg = '1';
    } else {
        data.multiple_reg = '0';
    }
    if (data.voice_mail === true || data.voice_mail == '1') {
        data.voice_mail = '1';
    }
    else if (data.voice_mail === false || data.voice_mail == '0' || data.voice_mail == '') {
        data.voice_mail = '0';
        data.voice_mail_pwd = "12345678";

    } else {
        data.voice_mail_pwd = "";
        data.voice_mail = '0';
    }


    if (data.outbound == true || data.outbound == '1') {
        data.outbound = '1';
    } else {
        data.outbound = '0';
    }

    if (data.recording == true || data.recording == '1') {
        data.recording = '1';
    } else {
        data.recording = '0';
    }

    if (data.call_forward == true || data.call_forward == '1') {
        data.call_forward = '1';
    } else {
        data.call_forward = '0';
    }

    if (data.speed_dial == true || data.speed_dial == '1') {
        data.speed_dial = '1';
    } else {
        data.speed_dial = '0';
    }

    if (data.black_list == true || data.black_list == '1') {
        data.black_list = '1';
    } else {
        data.black_list = '0';
    }

    if (data.call_transfer == true || data.call_transfer == '1') {
        data.call_transfer = '1';
    } else {
        data.call_transfer = '0';
    }

    if (data.dnd == true || data.dnd == '1') {
        data.dnd = '1';
    } else {
        data.dnd = '0';
    }
    data.token = data.token ? data.token : '';

    if (data.apiToken === true || data.apiToken == '1') {
        data.apiToken = '1';
    } else {
        data.apiToken = '0';
    }

    if (data.roaming === true || data.roaming == '1') {
        data.roaming = '1';
    } else {
        data.roaming = '0';
    }

    if (data.outbound_sms_notification === true || data.outbound_sms_notification == '1') {
        data.outbound_sms_notification = '1';
    } else {
        data.outbound_sms_notification = '0';
    }

    if (data.admin === true || data.admin == '1') {
        data.admin = '1';
    } else {
        data.admin = '0';
    }

    if (data.find_me_follow_me === true || data.find_me_follow_me == '1') {
        data.find_me_follow_me = '1';
    } else {
        data.find_me_follow_me = '0';
    }

    if (data.ringtone === true || data.ringtone == '1') {
        data.ringtone = '1';
    } else {
        data.ringtone = '0';
    }

    if (data.sticky_agent === true || data.sticky_agent == '1') {
        data.sticky_agent = '1';
    } else {
        data.sticky_agent = '0';
    }

    if (data.click_to_call == true || data.click_to_call == '1') {
        data.click_to_call = '1';
    } else {
        data.click_to_call = '0';
    }
    if (data.call_waiting == true || data.call_waiting == '1') {
        data.call_waiting = '1';
    } else {
        data.call_waiting = '0';
    }
    if (data.call_persistent == true || data.call_persistent == '1') {
        data.call_persistent = '1';
    } else {
        data.call_persistent = '0';
    }
    if (data.whatsapp == true || data.whatsapp == '1') {
        data.whatsapp = '1';
    } else {
        data.whatsapp = '0';
    }
    // if (data.is_email_from_notificationemail === true || data.is_email_from_notificationemail == '1') {
    //     data.is_email_from_notificationemail = true;
    // } else {
    //     data.is_email_from_notificationemail = false;
    // }  

    if (data.intercom_calling != '') {
        data.intercom_calling = '1';
    } else {
        data.intercom_calling = '0';
    }

    var ext_id = data.id;
    let sql = knex(table.tbl_Extension_master).where('id', '=', "" + ext_id + "")
        .update({
            username: "" + data.ext_name + "", password: "" + data.web_pass + "", email: "" + data.email + "",
            send_misscall_notification: "" + data.misscall_notify + "", balance_restriction: "" + data.bal_restriction + "",
            caller_id_name: "" + data.caller_id_name + "", sip_password: "" + data.sip_pass + "",
            ring_time_out: "" + data.ring_time_out + "", dial_time_out: data.dial_time_out, external_caller_id: "" + data.external_caller_id + "", dtmf_type: "" + data.dtmf_type + "",
            caller_id_header_type: "" + data.header_type + "", caller_id_header_value: "" + data.callerID_headervalue + "", multiple_registration: "" + data.multiple_reg + "",
            codec: "" + data.codec + "", voicemail: "" + data.voice_mail + "", vm_password: "" + data.voice_mail_pwd + "", dnd: "" + data.dnd + "", outbound: "" + data.outbound + "", recording: "" + data.recording + "",
            forward: "" + data.call_forward + "", speed_dial: "" + data.speed_dial + "", black_list: "" + data.black_list + "", call_transfer: "" + data.call_transfer + "", total_min_bal: data.minute_balance,
            api_token: data.apiToken, roaming: data.roaming, outbound_sms_notification: "" + data.outbound_sms_notification + "",
            dial_prefix: "" + data.dial_prefix + "", mobile: "" + data.mobile + "", admin: "" + data.admin + "", find_me_follow_me: "" + data.find_me_follow_me + "", ringtone: "" + data.ringtone + "",
            sticky_agent: "" + data.sticky_agent + "", click_to_call: "" + data.click_to_call + "",
            // c2c_value: "" + data.c2c_value + "",
            plug_in: "" + data.plug_in + "", call_waiting: "" + data.call_waiting + "", call_persistent: "" + data.call_persistent + "", whatsapp: "" + data.whatsapp + "", intercom_calling: "" + data.intercom_calling + "", intercom_dialout: "" + data.intercom_dialout + ""
        });
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function UpdateProfile(req, res) {
    let data = req.body.crdentials;
    if (req.body.role === '6') {
        knex(table.tbl_Extension_master).where('id', '=', "" + data.user_id + "")
            .update({ profile_img: "" + data.profile_img + "" }).then((response) => {
                if (response) {
                    res.json({
                        response
                    });
                } else {
                    res.status(401).send({ error: 'error', message: 'DB Error' });
                }
            });
    }
}

function secure_password_generator(len) {
    var length = (len) ? (len) : (8);
    var string_lower = "abcdefghijklmnopqrstuvwxyz";
    var string_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var numeric = '0123456789';
    var punctuation = '!#$%&\*+,-./:<=>?@[\]^_{|}~'; // remove ;'"`() from this punctuation
    var password = "";
    var character = "";
    var crunch = true;
    while (password.length < length) {
        var entity1 = Math.ceil(string_lower.length * Math.random() * Math.random());
        var entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
        var entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
        var entity4 = Math.ceil(string_UPPER.length * Math.random() * Math.random());
        character += string_lower.charAt(entity1);
        character += string_UPPER.charAt(entity4);
        character += numeric.charAt(entity2);
        character += punctuation.charAt(entity3);
        password = character;
    }
    password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');
    return password.substr(0, len);
}

function sipPassword() {
    var length = 8,
        charset = "0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function getAllExtensionNumber(req, res) {
    var user_id = req.query.user_id;
    var sql = knex(table.tbl_Extension_master)
        .select('id', 'ext_number')
    sql.then((response) => {
        res.json({
            response: response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getRoaming(req, res) {
    let data = req.query.id;
    let sql = knex.select('f.is_roaming_type')
        .from(table.tbl_PBX_features + ' as f')
        .leftJoin(table.tbl_Package + ' as p', 'f.id', 'p.feature_id')
        // .leftJoin(table.tbl_Extension_master + ' as e','e.package_id','p.id')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.package_id', 'p.id')
        .where('map.customer_id', '=', "" + data + "")
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Contact list ' }); throw err });
}

function getAllExtension(req, res) {
    var user_id = req.query.user_id;
    var sql = knex(table.tbl_Extension_master)
        .where('customer_id', '=', "" + user_id + "")
        .andWhere('plug_in', '=', '0')
        .select('*')
        .orderBy('id', 'desc')
    // .orderBy('id', 'asc')
    // .orderBy('username', 'asc')
    sql.then(async (response) => {
        let Map = response ? response : null;
        await Map.map((data) => {
            let sql = knex(table.tbl_mapped_featured_detail).where(knex.raw('locate(' + data.ext_number + ',ext_number)'))
                .select('id')
            sql.then((response1) => {
                response1 = response1 ? response1 : [];
                if (response1) {
                    if (response1.length) {
                        Object.assign(data, { flag: '1' })
                    }
                    knex(table.tbl_pbx_min_ext_mapping + ' as pmem').leftJoin(table.tbl_Country + ' as c', 'pmem.destination', 'c.phonecode')
                        .select('*')
                        .where('pmem.extension_id', data.id)
                        .then(responses => {
                            let data = response1.concat(responses);
                            if (data.length) {
                                Object.assign(data, { flag: '1' })
                            }
                        })
                }
            })
        })
        setTimeout(() => {
            res.send({ response: Map });
        }, 600);
        // res.json({
        //     response: response
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}
function getAllIntercomExtension(req, res) {
    var user_id = req.query.user_id;
    var sql = knex(table.tbl_Extension_master)
        .where('customer_id', '=', "" + user_id + "")
        .andWhere('plug_in', '=', '0')
        .andWhere('intercom_dialout', '=','0')
        .select('*')
        .orderBy('id', 'desc')
    // .orderBy('id', 'asc')
    // .orderBy('username', 'asc')
    sql.then(async (response) => {
        let Map = response ? response : null;
        await Map.map((data) => {
            let sql = knex(table.tbl_mapped_featured_detail).where(knex.raw('locate(' + data.ext_number + ',ext_number)'))
                .select('id')
            sql.then((response1) => {
                response1 = response1 ? response1 : [];
                if (response1) {
                    if (response1.length) {
                        Object.assign(data, { flag: '1' })
                    }
                    knex(table.tbl_pbx_min_ext_mapping + ' as pmem').leftJoin(table.tbl_Country + ' as c', 'pmem.destination', 'c.phonecode')
                        .select('*')
                        .where('pmem.extension_id', data.id)
                        .then(responses => {
                            let data = response1.concat(responses);
                            if (data.length) {
                                Object.assign(data, { flag: '1' })
                            }
                        })
                }
            })
        })
        setTimeout(() => {
            res.send({ response: Map });
        }, 600);
        // res.json({
        //     response: response
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getAllExtensionsForCustomer(req, res) {
    var user_id = req.query.user_id;
    var sql = knex(table.tbl_Extension_master)
        .where('customer_id', '=', "" + user_id + "")
        .select('*')
        .orderBy('id', 'desc')
    // .orderBy('ext_number', 'asc')g
    // .orderBy('username', 'asc')

    sql.then(async (response) => {
        let Map = response ? response : null;
        await Map.map((data) => {
            let sql = knex(table.tbl_mapped_featured_detail).where(knex.raw('locate(' + data.ext_number + ',ext_number)'))
                .select('id')
            sql.then((response1) => {
                response1 = response1 ? response1 : [];
                if (response1) {
                    if (response1.length) {
                        Object.assign(data, { flag: '1' })
                    }
                    knex(table.tbl_pbx_min_ext_mapping + ' as pmem').leftJoin(table.tbl_Country + ' as c', 'pmem.destination', 'c.phonecode')
                        .select('*')
                        .where('pmem.extension_id', data.id)
                        .then(responses => {
                            let data = response1.concat(responses);
                            if (data.length) {
                                Object.assign(data, { flag: '1' })
                            }
                        })
                }
            })
        })
        setTimeout(() => {
            res.send({ response: Map });
        }, 600);
        // res.json({
        //     response: response
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getAllExtensionWithPlugin(req, res) {
    var user_id = req.query.user_id;
    var sql = knex(table.tbl_Extension_master)
        .where('customer_id', '=', "" + user_id + "")
        .andWhere('plug_in', '=', '0')
        .select('*')
        .orderBy('ext_number', 'asc')
    sql.then(async (response) => {
        let Map = response ? response : null;
        await Map.map((data) => {
            let sql = knex(table.tbl_mapped_featured_detail).where(knex.raw('locate(' + data.ext_number + ',ext_number)'))
                .select('id')
            sql.then((response1) => {
                response1 = response1 ? response1 : [];
                if (response1) {
                    if (response1.length) {
                        Object.assign(data, { flag: '1' })
                    }
                    knex(table.tbl_pbx_min_ext_mapping + ' as pmem').leftJoin(table.tbl_Country + ' as c', 'pmem.destination', 'c.phonecode')
                        .select('*')
                        .where('pmem.extension_id', data.id)
                        .then(responses => {
                            let data = response1.concat(responses);
                            if (data.length) {
                                Object.assign(data, { flag: '1' })
                            }
                        })
                }
            })
        })
        setTimeout(() => {
            res.send({ response: Map });
        }, 600);
        // res.json({
        //     response: response
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

async function getPluginExtByCustomerId(req, res) {
    var user_id = req.query.user_id;
    let sql1 = await knex(table.tbl_pbx_plugin).select('ext_number').where('customer_id', user_id).then((response) => {
        return response;
    })
    let ext_number = [];
    sql1.map(data => {
        if (data.ext_number != "") {
            ext_number.push({ ext_number: data.ext_number, flag: '1' });
        }
    })
    var sql = knex(table.tbl_Extension_master)
        .where('customer_id', '=', "" + user_id + "")
        .andWhere('plug_in', '=', '1')
        .select('ext_number')
        .orderBy('id', 'desc')
    sql.then((response) => {
        response.map(data => {
            ext_number.filter(num => {
                if (num.ext_number === data.ext_number) {
                    Object.assign(data, { flag: '1' })
                }
            })
        })
        res.json({
            response: response,
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getExtensionByExtId(req, res) {
    knex.raw("Call pbx_getExtensionByExtId(" + req.query.ext_id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function verifyExtension(req, res) {
    let extension = req.body.extension;
    let sql = knex.from(table.tbl_Extension_master).where('customer_id', "" + req.body.user_id + "").andWhere('ext_number', "" + extension + "")
        .select('id', 'ext_number');
    sql.then((response) => {
        if (response.length >= 1) {
            const ext = response[0];
            res.json({
                ext_id: ext.id,
                ext_number: ext.ext_number
            });
        } else {
            res.json({
                ext_id: '',
                ext_number: ''
            });
        }
    });
}

// function verifyExtensionn(req, res) {
//     console.log(req.body,"--body--");
//     let data = req.body;

//     let from = parseInt(data.from);
//     let to = parseInt(data.to);

    
//         console.log("code reach here");
//         while(from <= to){
//             let sql = knex.from(table.tbl_Extension_master).where('customer_id', "" + req.body.user_id + "").andWhere('ext_number', "" + from + "")
//                 .select('id', 'ext_number');
//             sql.then((response) => {
//                 if (response.length >= 1) {
//                     const ext = response[0];
//                     res.json({
//                         ext_id: ext.id,
//                         ext_number: ext.ext_number
//                     });
//                 } else {
//                     res.json({
//                         ext_id: '',
//                         ext_number: ''
//                     });
//                 }
//             });
//     }
//     // let extension = req.body.extension;
// }

// async function verifyExtensionn(req, res) {
//     // console.log(req.body, "--body--");
//     let data = req.body.credentials;

//     console.log(data);
//     let from = parseInt(data.from);
//     let to = parseInt(data.to);

//     let results = [];

//     try {
//         while (from <= to) {
//             let sql = knex.from(table.tbl_Extension_master)
//                 .where('customer_id', data.user_id)
//                 .andWhere('ext_number', from.toString())
//                 .select('id', 'ext_number');

//             let response = await sql;
//             if (response.length >= 1) {
//                 const ext = response[0];
//                 results.push({
//                     ext_id: ext.id,
//                     ext_number: ext.ext_number
//                 });
//             } else {
//                 results.push({
//                     ext_id: '',
//                     ext_number: from
//                 });
//             }

//             from++;
//         }

//         res.json(results);
//     } catch (error) {
//         console.error("Error verifying extensions:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// }


async function verifyExtensionn(req, res) {
    let data = req.body.credentials;
    let from = parseInt(data.from);
    let to = parseInt(data.to);
    let results = [];
    let extensionNumbers = [];
    for (let i = from; i <= to; i++) {
        extensionNumbers.push(i.toString());
    }
    try { 
        let sql = knex.from(table.tbl_Extension_master)
            .where('customer_id', data.user_id)
            .whereIn('ext_number', extensionNumbers)
            .select('id', 'ext_number');

        let response = await sql; 
        let existingExtensions = new Set(response.map(ext => ext.ext_number));
        for (let i = from; i <= to; i++) {
            let extNumber = i.toString();
            if (existingExtensions.has(extNumber)) {
                let ext = response.find(ext => ext.ext_number === extNumber);
                results.push({
                    ext_id: ext.id,
                    ext_number: ext.ext_number
                });
            } else {
                results.push({
                    ext_id: '',
                    ext_number: extNumber
                });
            }
        }
        res.json(results);
    } catch (error) {
        console.error("Error verifying extensions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


function getExtensionLimit(req, res) {
    if (req.query.role == '1' || req.query.role == '5' || req.query.role == '4') {
        let sql = knex.select('pf.billing_type', 'pf.minute_balance', 'mcp.package_id', 'p.feature_id', 'pf.extension_limit', 'pf.recording', 'pf.CID_routing',
            'pf.outbound_call', 'pf.voicemail', 'pf.forward', 'pf.speed_dial', 'pf.black_list', 'pf.call_transfer', 'mcp.customer_id', 'pf.is_bundle_type', 'pf.outbound_call',
            'pf.is_sms as sms', 'pf.miss_call_alert', 'pf.geo_tracking', 'pf.is_roaming_type as roaming', 'pf.find_me_follow_me', 'pf.custom_prompt', 'pf.sticky_agent', 'cust.plugin', 'pf.click_to_call', 'p.mapped', 'pf.teleconsultation as tc', 'pf.whatsapp', 'cust.intercom_calling')
            .from(table.tbl_Map_customer_package + ' as mcp')
            .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
            .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
            .leftJoin(table.tbl_Customer + ' as cust', 'cust.id', 'mcp.customer_id')
            .where('mcp.customer_id', '=', "" + req.query.user_id + "").andWhere('mcp.product_id', '=', "1")
        sql.then((response) => {
            const ext = response[0];
            res.json({
                ext
            });
        });
    } else if (req.query.role == '6') {
        knex.select('customer_id', 'admin').from(table.tbl_Extension_master)
            .where('id', '=', "" + req.query.user_id + "")
            .then((response) => {
                let customerId = Object.values(JSON.parse(JSON.stringify(response)));
                let lastCustomerId = customerId[0].customer_id;
                let adminExtension = customerId[0].admin;
                knex.select('mcp.package_id', 'p.feature_id', 'pf.extension_limit', 'pf.recording',
                    'pf.outbound_call', 'pf.voicemail', 'pf.forward', 'pf.speed_dial', 'pf.black_list', 'pf.call_transfer', 'mcp.customer_id')
                    .from(table.tbl_Map_customer_package + ' as mcp')
                    .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                    .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
                    .where('mcp.customer_id', '=', "" + lastCustomerId + "").andWhere('mcp.product_id', '=', "1")
                    .then((response) => {
                        const ext = response[0];
                        ext['admin'] = Number(adminExtension);
                        res.json({
                            ext
                        });
                    });
            });
    } else {
        res.json({ response })
    }
}

function getTotalExtension(req, res) {
    let customerId = parseInt(req.query.customerId);
    let sql = knex(table.tbl_Extension_master).count('id as count').where('status', '=', "1").andWhere('customer_id', '=', "" + customerId + "");
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getMonthlyTotalExtension(req, res) {
    req.query.customerId = req.query.customerId ? req.query.customerId : null;
    if (req.query.role == 3) {
        knex.raw("Call pbx_getResellerMonthlyTotalExtension(" + req.query.customerId + ")")
            .then((response) => {
                if (response) {
                    res.send({ response: response[0][0] });
                }
            }).catch((err) => {
                res.send({ response: { code: err.errno, message: err.sqlMessage } });
            });
    }
    else {
        knex.raw("Call pbx_getMonthlyTotalExtension(" + req.query.customerId + ")")
            .then((response) => {
                if (response) {
                    res.send({ response: response[0][0] });
                }
            }).catch((err) => {
                res.send({ response: { code: err.errno, message: err.sqlMessage } });
            });
    }
}

function deleteExtension(req, res) {
    let id = parseInt(req.query.id);
    knex(table.tbl_Extension_master).where('id', '=', "" + id + "").del()
        .then((response) => {
            knex(table.tbl_pbx_min_ext_mapping)
                .where('extension_id', 'like', "" + id + "%").del()
                .then((response) => {
                    res.json({
                        response
                    });
                });
        });
}
function inactiveExtension(req, res) {
    let userTypeVal = '';
    if (req.body.role == '1') { userTypeVal = 'ExtensionInactiveStatus' }
    else if (req.body.role == '2') { userTypeVal = 'ResellerInactiveStatus' }
    else userTypeVal = 'InternalUserInactiveStatus';
    knex(table.tbl_Extension_master).where('id', '=', "" + req.body.id + "").update({ status: "0" })
        .then((response) => {
            //if (req.body.role == '4' || req.body.role == '5') {
            let newdata = { userName: req.body.name, email: req.body.email }
            pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
                pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                    //res.json({ data1 })
                })
            })
            // }
            res.json({ response });
        });
}
function activeExtension(req, res) {
    if (req.body.role == '1') { userTypeVal = 'ExtensionInactiveStatus' }
    else if (req.body.role == '2') { userTypeVal = 'ResellerInactiveStatus' }
    else userTypeVal = 'InternalUserInactiveStatus';
    knex(table.tbl_Extension_master).where('id', '=', "" + req.body.id + "").update({ status: "1" })
        .then((response) => {
            if (response) {
                //if (req.body.role == '4' || req.body.role == '5') {
                let newdata = { userName: req.body.name, email: req.body.email }
                pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
                    pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                        //res.json({ data1 })
                    })
                })
                // }
                res.json({ response });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        });
}






function getExtensionById(req, res) {
    let id = parseInt(req.query.id);
    let sql = knex.from(table.tbl_Extension_master + ' as e')
        .where('e.id', '=', "" + id + "")
        .select('e.*', 'f.minute_plan', 'f.is_bundle_type', 'f.outbound_call', 'c.phonecode', knex.raw('if(l.username !="","Registered","Un-Registered") as registered_status'))
        // knex.raw('IF(l.username = "" , 0, 1) as ext_registered')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'e.dial_prefix')
        .leftJoin(table.tbl_location + ' as l', 'l.username', 'e.ext_number')
        .leftJoin(table.tbl_Package + ' as p', 'p.id', 'e.package_id')
        .leftJoin(table.tbl_PBX_features + ' as f', 'f.id', 'p.feature_id')
    sql.then((response) => {
        let arr = []
        response.map(element => {
            arr.push(element.admin, element.balance_restriction, element.forward, element.call_transfer, element.outbound, element.find_me_follow_me,
                element.multiple_registration, element.recording, element.roaming, element.ringtone
                , element.sticky_agent, element.click_to_call, element.send_misscall_notification
            )
        })
        res.json({
            response: response,
            all_feature: arr
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function onlyOutboundStatus(req, res) {
    let id = parseInt(req.query.id);
    let sql = knex.select('e.outbound')
        .from(table.tbl_Extension_master + ' as e')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'e.customer_id')
        .where('e.id', '=', "" + id + "")
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getDidListById(req, res) {
    let id = parseInt(req.query.userId);
    let sql = knex.select('*')
        .from(table.tbl_DID)
        .where('customer_id', '=', "" + id + "")
    // .andWhere('activated', '=', 1)
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}



function getExtensionByFilters(req, res) {
    let count = 0;
    let data = req.body.filters;
    let sql = knex.from(table.tbl_Extension_master)
        .select('*')
    sql.orderBy('ext_number', 'asc');
    // sql.orderBy('id', 'desc');

    if (data.by_username != '') {
        sql = sql.andWhere('username', 'like', "%" + data.by_username + "%");
    }
    if (data.by_roaming != '') {
        sql = sql.andWhere('roaming', '=', data.by_roaming);
    }
    if (data.user_id != '') {
        sql = sql.andWhere('customer_id', 'like', "%" + data.user_id + "%");
    }

    if (data.by_type != '' && data.hasOwnProperty('by_type')) {
        let subquery = knex.raw("select JSON_UNQUOTE(json_extract(favorite,'$.ext_number')) fav from extension_master where customer_id =" + data.user_id + " and ext_number=" + data.by_id);
        subquery.then((response) => {
            let fav_Contact = (response[0][0]['fav']) ? (response[0][0]['fav']).split(',') : [''];
            if (fav_Contact) {
                count++;
                sql = data.by_type == 'favorite' ? sql.whereIn('ext_number', fav_Contact) : sql.whereNotIn('ext_number', fav_Contact);
                sql.then((response) => {
                    if (response) {

                        res.json({
                            response
                        });
                    } else {
                        res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

            } else {
                sql.then((response) => {
                    if (response) {

                        res.json({
                            response
                        });
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
    if (data.by_number != '') {
        sql = sql.andWhere('ext_number', 'like', "%" + data.by_number + "%");
    }

    if (count > 0 && data.hasOwnProperty('by_type')) {
        sql.then((response) => {
            if (response) {

                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (count == 0 && !data.hasOwnProperty('by_type')) {
        sql.then(async (response) => {
            if (response) {
                let Map = response ? response : null;
                await Map.map((data) => {
                    let sql = knex(table.tbl_mapped_featured_detail).where(knex.raw('locate(' + data.ext_number + ',ext_number)'))
                        .select('id')
                    sql.then((response1) => {
                        response1 = response1 ? response1 : [];
                        if (response1) {
                            if (response1.length) {
                                Object.assign(data, { flag: '1' })
                            }
                            knex(table.tbl_pbx_min_ext_mapping + ' as pmem').leftJoin(table.tbl_Country + ' as c', 'pmem.destination', 'c.phonecode')
                                .select('*')
                                .where('pmem.extension_id', data.id)
                                .then(responses => {
                                    let data = response1.concat(responses);
                                    if (data.length) {
                                        Object.assign(data, { flag: '1' })
                                    }
                                })
                        }
                    })
                })
                setTimeout(() => {
                    res.send({ response: Map });
                }, 500);

                // res.json({
                //     response
                // });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (count == 0 && data.hasOwnProperty('by_type') && data['by_type'] == '') {
        sql.then((response) => {
            if (response) {

                res.json({
                    response
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else {

    }
}

function getExtensionSetting(req, res) {
    knex.raw("Call pbx_getExtensionSetting(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function updateExtensionSettings(req, res) {

    req.body.extension.dnd = (req.body.extension.dnd == true || req.body.extension.dnd == '1') ? '1' : '0';
    req.body.extension.callForward = (req.body.extension.callForward == true || req.body.extension.callForward == '1') ? '1' : '0';
    req.body.extension.ringtone = req.body.extension.ringtone ? req.body.extension.ringtone : 0;
    knex.raw("Call pbx_saveExtensionSettings(" + req.body.extension.id + "," + req.body.extension.dnd + ",'" + req.body.extension.callForward + "'," + req.body.extension.ringtone + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function updateExtension_FMFM_Settings(req, res) {
    req.body.extension.caller_id_1 = req.body.extension.caller_id_1 ? req.body.extension.caller_id_1 : 0;
    req.body.extension.caller_id_2 = req.body.extension.caller_id_2 ? req.body.extension.caller_id_2 : 0;
    req.body.extension.caller_id_3 = req.body.extension.caller_id_3 ? req.body.extension.caller_id_3 : 0;
    knex.raw("Call pbx_saveExtension_FMFM_Settings(" + req.body.extension.id + "," + req.body.extension.ring_timeout + ",'" + req.body.extension.find_me_follow_me_type_1 + "'," + req.body.extension.caller_id_1 + ",'" + req.body.extension.find_me_follow_me_type_2 + "'," + req.body.extension.caller_id_2 + ",'" + req.body.extension.find_me_follow_me_type_3 + "'," + req.body.extension.caller_id_3 + ")")
        .then((response) => {
            if (response) {
                let input = {};
                input['Ring Timeout'] = req.body.extension.ring_timeout;
                input[req.body.extension.find_me_follow_me_type_1 + 1] = '1t';
                input[req.body.extension.find_me_follow_me_type_1 + ' Value1'] = req.body.extension.caller_id_name1;
                input[req.body.extension.find_me_follow_me_type_1 + 2] = '1t';
                input[req.body.extension.find_me_follow_me_type_2 + ' Value2'] = req.body.extension.caller_id_name2;
                input[req.body.extension.find_me_follow_me_type_1 + 3] = '1t';
                input[req.body.extension.find_me_follow_me_type_3 + ' Value3'] = req.body.extension.caller_id_name3;
                createModuleLog(table.tbl_pbx_audit_logs, {
                    module_action_id: response[0][0][0]['f_id'],
                    module_action_name: "",
                    module_name: "fmfm",
                    message: "Find Me Follow Me Configured",
                    customer_id: req.body.extension.id,
                    features: JSON.stringify(input)
                })
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function getExtensionNameandNumber(req, res) {
    let id = parseInt(req.query.id);
    let sql = knex.select('e.customer_id')
        .from(table.tbl_Extension_master + ' as e')
        .leftOuterJoin(table.tbl_Customer + ' as c', 'e.customer_id', 'c.id')
        .where('e.id', '=', "" + id + "");

    sql.then((response) => {
        if (response.length > 0) {
            let customerId = Object.values(JSON.parse(JSON.stringify(response)));
            let lastCustomerId = customerId[0].customer_id;

            knex.select('id', 'ext_number', 'caller_id_name'
                , knex.raw('CONCAT(ext_number, \'-\',caller_id_name) as extension'))
                .from(table.tbl_Extension_master)
                .where('customer_id', '=', "" + lastCustomerId + "")
                .andWhere('dnd', '=', 0)
                .whereNot('id', '=', "" + id + "")
                .orderBy('ext_number', 'asc')
                .then((response) => {
                    res.json({
                        response
                    });
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }
    });
}

function updateExtensionPassword(req, res) {
    const passwordInput = req.body.newPassword;
    knex(table.tbl_Extension_master).where('username', '=', "" + req.body.username + "")
        .update({ password: passwordInput }).then((response) => {
            if (response > 0) {
                pushEmail.getExtensionName(req.body.email).then((data) => {
                    pushEmail.getEmailContentUsingCategory('ChangePassword').then(val => {
                        pushEmail.sendmail({ data: data, val: val }).then((data1) => {
                            res.json({ data1 })
                        })
                    })
                })
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function extensionEmailExist(req, res) {

    knex(table.tbl_Extension_master).count('id', { as: 'count' }).where('email', '=', "" + req.uemail + "")
        .then((response) => {
            if (response[0].count > 0) {
                pushEmail.getExtensionName(req.body.email).then((data) => {
                    pushEmail.getEmailContentUsingCategory('ForgetPassword').then(val => {
                        pushEmail.sendmail({ data: data, val: val, action: req.body.action, mailList: req.body.mailList }).then((data1) => {
                            res.json({ data1 })
                        })
                    })
                })
            } else {
                res.json({ response })
            }
        }).catch((err) => { console.log(err); throw err });
}

function getExtensionName(req, res) {
    knex(table.tbl_Extension_master).where('email', '=', "" + req.uemail + "")
        .select('username as name')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        }).catch((err) => {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            throw err
        });
}

function verifyEmail(req, res) {
    let keyword = req.body.email;
    knex.from(table.tbl_Extension_master).where('email', "" + keyword + "")
        .select('id')
        .then((response) => {
            if (response.length > 0) {
                const extension = response[0];
                res.json({
                    email: extension.id
                });
            } else {
                res.json({
                    user_id: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCustomerExtensionFeatures(req, res) {
    let id = parseInt(req.query.customerId);
    knex.select('id', 'ext_number as number', 'username as name', 'balance_restriction', 'multiple_registration',
        'voicemail', 'dnd', 'outbound', 'recording', 'black_list', 'call_transfer',
        'forward', 'speed_dial', 'customer_id', 'roaming', 'admin', 'ringtone', 'sticky_agent', 'find_me_follow_me')
        .from(table.tbl_Extension_master)
        .where("customer_id", "=", "" + req.userId + "")
        .orderBy('ext_number', 'asc')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Features not available' }); throw err });

}

function getExtensionFeaturesByFilters(req, res) {
    let data = req.body.filters;
    let id = parseInt(req.query.customerId);

    let sql =
        knex.select('id', 'ext_number as number', 'username as name', 'balance_restriction', 'multiple_registration',
            'voicemail', 'dnd', 'outbound', 'recording', 'black_list', 'call_transfer',
            'forward', 'speed_dial', 'customer_id')
            .from(table.tbl_Extension_master)
            .where("customer_id", "=", "" + req.userId + "")
            .orderBy('ext_number', 'desc')

    if (data.by_name != '' && data.by_number == '') {
        sql = sql.andWhere('username', 'like', "%" + data.by_name + "%");
    } else if (data.by_name == '' && data.by_number != '') {
        sql = sql.andWhere('ext_number', 'like', "%" + data.by_number + "%");
    } else if (data.by_name != '' && data.by_number != '') {
        sql = sql.andWhere('username', 'like', "%" + data.by_name + "%")
            .andWhere('ext_number', 'like', "%" + data.by_number + "%");
    } else {
        sql = sql;
    }
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getExtensionForSupport(req, res) {

    let data = req.body.filters;
    // data.by_number = (data.by_number).length ? ("'" + data.by_number + "'") : null;

    let sql = knex.from(table.tbl_Extension_master)
        .select('id', 'ext_number', 'username', 'caller_id_name', 'external_caller_id',
            'email', 'codec', 'customer_id')
        .where('status', '=', "1")
        .andWhere('customer_id', '=', "" + data.user_id + "")
        .orderBy('ext_number', 'desc')

    if (data.by_username != '') {
        sql = sql.andWhere('username', 'like', "%" + data.by_username + "%");
    }
    if (data.by_external_callerId != '') {
        sql = sql.andWhere('external_caller_id', 'like', "%" + data.by_external_callerId + "%");
    }
    // if (data.by_number != '') {
    //     // whereIn('ext_number', data.by_number)

    //     sql = sql.andWhere('ext_number', 'like', "%" + data.by_number + "%");
    // }
    if (data.by_number != null) {
        sql = sql.whereIn('ext_number', data.by_number);
    }

    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function verifyExtUsername(req, res) {
    let username_keyword = req.body.username;
    knex.select('c.id as id')
        .from(table.tbl_Customer + ' as c')
        .where(knex.raw('BINARY(c.username)'), '=', "" + username_keyword + "")
        .andWhere('status', '!=', '2')
        .union(
            knex.raw("select e.id as id from " + table.tbl_Extension_master + " as e \
        where e.username  ='"+ username_keyword + "'"))
        .then((response) => {
            if (response.length > 0) {
                const user = response[0];
                res.json({
                    user_id: user.id
                });
            } else {
                res.json({
                    user_id: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updatePackageMinuteBal(req, res) {
    knex(table.tbl_PBX_features).where('id', '=', "" + req.body.id + "")
        .update({ minute_balance: req.body.balance }).then((response) => {
            res.json({ response });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateExtensionMinute(req, res) {
    knex(table.tbl_Extension_master).where('id', '=', "" + req.body.addExt_id + "")
        .update({ total_min_bal: req.body.newMinuteForAddExt })
        .then((response) => {
            knex(table.tbl_Extension_master).where('id', '=', "" + req.body.deductExt_id + "")
                .update({ total_min_bal: req.body.newMinuteForDeductExt }).then((response) => {
                    res.json({ response });
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deductCustomExtensionMinute(req, res) {
    let sql = knex(table.tbl_Extension_master).where('id', '=', "" + req.body.deduct_ext.id + "")
        .update({ total_min_bal: knex.raw(`?? - ${req.body.deduct_ext_minutes}`, ['total_min_bal']) });

    sql.then((response) => {
        res.json({ response });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deductAllExtensionMinute(req, res) {
    for (let i = 0; i < req.body.ext_id.length; i++) {
        knex.select('id', 'total_min_bal').from(table.tbl_Extension_master)
            .where('id', '=', "" + req.body.ext_id[i] + "").then((response) => {

                if (response[0]['total_min_bal'] > req.body.deduct_minutes_all) {
                    let sql = knex(table.tbl_Extension_master).where('id', '=', "" + response[0]['id'] + "")
                        .update({ total_min_bal: knex.raw(`?? - ${req.body.deduct_minutes_all}`, ['total_min_bal']) });

                    sql.then((response) => {
                        res.json({ response });
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
    res.status(200).send({ error: '', message: 'Success!!!' });
}

function getExtensionCount(req, res) {
    let extn_id = req.query.extension_id;
    let extn_num = req.query.extension_number;
    let sql = knex.raw("Call pbx_get_extension_existance(" + extn_id + "," + extn_num + ")")
    console.log(sql.toQuery(),'-------------');
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });


}

function getDestinationDID(req, res) {
    knex.raw("Call pbx_getDestinationDID(" + req.query.id + ")")
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function bulkExtensionUpdate(req, res) {    
    var finalCall = 0;
    var data = req.body.extension;
    if (data.misscall_notify === true || data.misscall_notify == '1') {
        data.misscall_notify = '1';
    } else {
        data.misscall_notify = '0';
    }
    if (data.multiple_reg === true || data.multiple_reg == '1') {
        data.multiple_reg = '1';
    } else {
        data.multiple_reg = '0';
    }
    if (data.voice_mail === true || data.voice_mail == '1') {
        data.voice_mail = '1';
    } else {
        data.voice_mail_pwd = "";
        data.voice_mail = '0';
    }
    if (data.outbound === true || data.outbound == '1') {
        data.outbound = '1';
    } else {
        data.outbound = '0';
    }

    if (data.recording === true || data.recording == '1') {
        data.recording = '1';
    } else {
        data.recording = '0';
    }

    if (data.call_forward == true || data.call_forward == '1') {
        data.call_forward = '1';
    } else {
        data.call_forward = '0';
    }

    if (data.speed_dial == true || data.speed_dial == '1') {
        data.speed_dial = '1';
    } else {
        data.speed_dial = '0';
    }

    data.black_list = '1';

    if (data.call_transfer == true || data.call_transfer == '1') {
        data.call_transfer = '1';
    } else {
        data.call_transfer = '0';
    }

    if (data.dnd == true || data.dnd == '1') {
        data.dnd = '1';
    } else {
        data.dnd = '0';
    }

    if (data.roaming === true || data.roaming == '1') {
        data.roaming = '1';
    } else {
        data.roaming = '0';
    }

    if (data.bal_restriction === true || data.bal_restriction == '1') {
        data.bal_restriction = '1';
    } else {
        data.bal_restriction = '0';
    }

    if (data.outbound_sms_notification === true || data.outbound_sms_notification == '1') {
        data.outbound_sms_notification = '1';
    } else {
        data.outbound_sms_notification = '0';
    }

    if (data.sticky_agent === true || data.sticky_agent == '1') {
        data.sticky_agent = '1';
    } else {
        data.sticky_agent = '0';
    }

    if (data.admin === true || data.admin == '1') {
        data.admin = '1';
    } else {
        data.admin = '0';
    }

    if (data.find_me_follow_me === true || data.find_me_follow_me == '1') {
        data.find_me_follow_me = '1';
    } else {
        data.find_me_follow_me = '0';
    }

    if (data.ringtone === true || data.ringtone == '1') {
        data.ringtone = '1';
    } else {
        data.ringtone = '0';
    }

    if (data.active_inactive === true || data.active_inactive == '1') {
        data.status = '1';
    } else {
        data.status = '0';
    }

    if (data.intercom_calling === true || data.intercom_calling == '1') {
        data.intercom_calling = '1';
    } else {
        data.intercom_calling = '0';
    }

    if (data.call_waiting === true || data.call_waiting == '1') {
        data.call_waiting = '1';
    } else {
        data.call_waiting = '0';
    }
   
    if (data.ext_group != null && data.ext_group.length) {
        let sql = knex(table.tbl_Extension_master).whereIn('intercom_dialout', data.ext_group);
        sql.then((response) => {            
            return updateExtensions(response.map(item => item.id), data, res);
        })
    } else {
        updateExtensions(data.extIds, data, res);
    }
}
function updateExtensions(extensionNumbers, data, res) {    
    const updatePromises = extensionNumbers.map((extensionNumber) => {
        return knex(table.tbl_Extension_master)
            .update({
                send_misscall_notification: "" + data.misscall_notify + "",
                ring_time_out: "" + data.ring_time_out + "",
                dtmf_type: "" + data.dtmf_type + "",
                caller_id_header_type: "" + data.header_type + "",
                multiple_registration: "" + data.multiple_reg + "",
                codec: "" + data.codec + "",
                voicemail: "" + data.voice_mail + "",
                dnd: "" + data.dnd + "",
                outbound: "" + data.outbound + "",
                recording: "" + data.recording + "",
                forward: "" + data.call_forward + "",
                speed_dial: "" + data.speed_dial + "",
                outbound_sms_notification: "" + data.outbound_sms_notification + "",
                call_transfer: "" + data.call_transfer + "",
                roaming: "" + data.roaming + "",
                balance_restriction: "" + data.bal_restriction + "",
                sticky_agent: "" + data.sticky_agent + "",
                admin: "" + data.admin + "",
                ringtone: "" + data.ringtone + "",
                find_me_follow_me: "" + data.find_me_follow_me + "",
                status: "" + data.status + "",
                intercom_calling: "" + data.intercom_calling + "",
                call_waiting: "" + data.call_waiting + ""
            })
            .where('id', extensionNumber)
            .catch((err) => {
                console.error(err);
                throw new Error('DB Error: ' + err.message);
            });
    });
    Promise.all(updatePromises)
    .then(() => {
        res.status(200).send({ error: 'Success', message: 'Bulk Extension updated successfully.' });
    })
    .catch((err) => {
        res.status(401).send({ error: 'error', message: err.message });
    });
}

function getExtensionForRealtimeDashboard(req, res) {
    var user_id = req.query.user_id;
    let sql = knex.from(table.tbl_Extension_master)
        .where('status', '=', "1")
        .andWhere('customer_id', '=', "" + user_id + "")
        .select('*')
        .orderBy('ext_number', 'asc')
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function makeFavoriteContactByExtension(req, res) {
    let data = req.body;
    let sql = knex.from(table.tbl_Extension_master).count('id', { as: 'count' }).where('favorite', 'like', "%" + data.ext_number + "%").andWhere('id', data.id);
    sql.then((response) => {
        if (response[0].count == 0) { // Not EXIST
            let sql2 = knex.raw('select *, json_extract(favorite,"$.ext_number") favorite from extension_master  where id =' + data.id);
            sql2.then((response2) => {
                if (response2) {
                    let fav_contact_list = response2[0][0].favorite ? (((response2[0][0].favorite).replace(/"/g, '')).split(',')) : [];
                    fav_contact_list.push(data.ext_number);
                    let obj = {};
                    obj['ext_number'] = (fav_contact_list).toString();
                    knex.raw("Call pbx_save_extension_favorite_contact(" + data.id + ",'" + JSON.stringify(obj) + "','" + 'make_favorite' + "')")
                        .then((response3) => {
                            if (response3) {
                                res.send({ response: response3[0][0] });
                            }
                        }).catch((err) => {
                            res.send({ response: { code: err.errno, message: err.sqlMessage } });
                        });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {   // aLREADY eXIST
            let sql2 = knex.raw('select *, json_extract(favorite,"$.ext_number") favorite from extension_master  where id =' + data.id);
            sql2.then((response2) => {
                if (response2) {
                    let fav_contact_list = response2[0][0].favorite ? (((response2[0][0].favorite).replace(/"/g, '')).split(',')) : [];
                    fav_contact_list = fav_contact_list.filter(item => item != data.ext_number);
                    let obj = {};
                    obj['ext_number'] = (fav_contact_list).toString();
                    knex.raw("Call pbx_save_extension_favorite_contact(" + data.id + ",'" + JSON.stringify(obj) + "','" + 'make_unfavorite' + "')")
                        .then((response3) => {
                            if (response3) {
                                res.send({ response: response3[0][0] });
                            }
                        }).catch((err) => {
                            res.send({ response: { code: err.errno, message: err.sqlMessage } });
                        });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getExtension_FMFM_Setting(req, res) {
    knex.raw("Call pbx_getExtension_FMFM_Setting(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function assignBundlePlanMinuteForExtension(req, res) {  //tbl_pbx_min_ext_mapping    
    let data = req.body.minutManageForm;
    let customer_id = req.query.customer_id || 0;
    let managedArray = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < (data[i].ext).length; j++) {
            let obj = {};
            obj['country'] = data[i].country;
            obj['extension_id'] = (data[i].ext)[j].id;
            obj['minutes'] = (data[i].ext)[j].minutes;
            managedArray.push(obj);
        }
    }
    if (managedArray.length) {
        for (let k = 0; k < managedArray.length; k++) {
            knex(table.tbl_pbx_min_ext_mapping)
                .insert({
                    destination: managedArray[k].country,
                    extension_id: managedArray[k].extension_id,
                    assingn_minutes: managedArray[k].minutes,
                    customer_id: customer_id
                })
                .then((response) => {
                    res.status(201).send({ message: 'Minute Assign Successfully!' });
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message, error_code: err.errno, }); throw err });
        }
    } else {
        res.status(201).send({ message: 'No Minute assingn to extension !' });
    }
}

function getExtensionAssignMinutes(req, res) {
    var destList = req.body.destList;
    let sql = knex.from(table.tbl_pbx_min_ext_mapping + ' as emp')
        .leftJoin(table.tbl_Extension_master + ' as e', 'e.id', 'emp.extension_id')
        .where('emp.customer_id', req.body.customer_id)
        .whereIn('emp.destination', destList)
        .andWhere('emp.id', req.body.id)
        .andWhere('emp.assingn_minutes', '!=', '0').andWhere('e.ext_number', '!=', '')
        .select('emp.id', 'emp.destination', 'emp.customer_id', 'emp.assingn_minutes', 'emp.plan_type', 'emp.created_at', 'emp.updated_at', 'e.ext_number as extension_id', 'emp.used_minutes', knex.raw('IF(emp.used_minutes != 0, "1", "0") as checks'))
        .orderBy('emp.id', 'asc');
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getExtensionAssignMinutesByExtnId(req, res) {
    var ext_number = req.body.ext_number;
    var ext_id;
    knex(table.tbl_Extension_master).select('id').where('ext_number', ext_number)
        .then((response) => {
            if (response[0]) {
                let sql = knex(table.tbl_mapped_featured_detail).where(knex.raw('locate(' + ext_number + ',ext_number)')).distinct()
                    .select('feature_id', 'feature_name')
                sql.then((response1) => {
                    response1 = response1 ? response1 : [];
                    if (response1) {
                        knex(table.tbl_pbx_min_ext_mapping + ' as pmem').leftJoin(table.tbl_Country + ' as c', 'pmem.destination', 'c.phonecode')
                            .select('pmem.assingn_minutes', 'c.name', knex.raw('IF(pmem.plan_type = "1", "Bundle", IF(pmem.plan_type = "2", "Roaming", IF(pmem.plan_type = "3", "Booster", "Teleconsultancy"))) as plan_type'))
                            .where('pmem.extension_id', response[0]['id']).then((response2) => {
                                if (response2) {
                                    response2 = response2 ? response2 : [];
                                    const data = response1.concat(response2);
                                    res.send({
                                        response: data
                                    })
                                }
                            })
                    }
                })
            }
        })
}

function adjustBundlePlanMinuteForExtension(req, res) { //tbl_pbx_min_ext_mapping
    let data = req.body.minutManageForm;
    // return;
    let customer_id = req.query.customer_id || 0;
    let managedArray = [];
    let destinationIds = [];
    let allRecord = 0;
    let deduct_minutes = 0;
    let destination;
    let ext_id = [];
    for (let i = 0; i < data.length; i++) {
        destinationIds.push((data[i].country).replace('+', ''))
        destination = (data[i].country).replace('+', '');
        for (let j = 0; j < (data[i].ext).length; j++) {
            let obj = {};
            if (data[i].ext[j].minutes != 0) {
                obj['country'] = data[i].country;
                obj['extension_id'] = (data[i].ext)[j].id;
                obj['used_minutes'] = (data[i].ext)[j].used_minutes,
                    obj['manage_minutes'] = (data[i].ext)[j].minutes
                obj['id'] = data[i].id;
                obj['type'] = data[i].type;
                obj['gateway_id'] = data[i].gateway_id;
                managedArray.push(obj);
                deduct_minutes = deduct_minutes + Number((data[i].ext)[j].minutes);
            }
            ext_id.push((data[i].ext)[j].id);
            // else{
            //     deduct_minutes = deduct_minutes + Number((data[i].ext)[j].remain_minutes) - Number((data[i].ext)[j].used_minutes);
            // }
        }
    }
    knex(table.tbl_pbx_min_ext_mapping).select(knex.raw('sum(assingn_minutes) as minutes')).whereIn('extension_id', ext_id).andWhere('customer_id', customer_id).andWhere('destination', destination)
        .then(async (response) => {
            if (response[0]['minutes'] != null) {
                let minute1;
                let minute2;
                if (Number(response[0]['minutes']) > deduct_minutes) {
                    minute1 = Number(response[0]['minutes']) - deduct_minutes;
                    knex(table.tbl_Call_Plan_Rate).increment('actual_minutes', minute1).where('dial_prefix', data[0].country).andWhere('customer_id', customer_id).andWhere('call_plan_id', data[0].call_plan_id).andWhere('plan_type', data[0]['type'])
                        .then((response1) => {
                        }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
                } else if (Number(response[0]['minutes']) < deduct_minutes) {
                    minute2 = deduct_minutes - Number(response[0]['minutes'])
                    let sql = knex.raw(`update pbx_call_plan_rates set actual_minutes = actual_minutes - ${minute2} where dial_prefix = '${data[0].country}' and customer_id = '${customer_id}' and call_plan_id = ${data[0].call_plan_id} and plan_type = '${data[0]['type']}'`)
                    sql.then((response2) => {
                    }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
                }
            } else {
                knex.raw(`update pbx_call_plan_rates set actual_minutes = actual_minutes - ${deduct_minutes} where dial_prefix = '${data[0].country}' and customer_id = '${customer_id}' and call_plan_id = ${data[0].call_plan_id} and plan_type = '${data[0]['type']}'`)
                    .then((response3) => {
                    }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
            }
            await knex(table.tbl_pbx_min_ext_mapping)
                .where('id', data[0]['id'])
                .del().then(async (responses) => {
                    if (managedArray.length) {
                        for (let i = 0; i < managedArray.length; i++) {
                            let isMinuteMappingExist;
                            allRecord++;
                            let destination = managedArray[i].country ? (managedArray[i].country).replace('+', '') : 0;    // JUST CONVERT +91 TO 91                            
                            await knex(table.tbl_pbx_min_ext_mapping)
                                .insert({
                                    id: managedArray[i].id,
                                    destination: destination,
                                    extension_id: managedArray[i].extension_id,
                                    assingn_minutes: managedArray[i].manage_minutes,
                                    customer_id: customer_id,
                                    plan_type: managedArray[i].type,
                                    used_minutes: managedArray[i].used_minutes,
                                    gateway_id: managedArray[i].gateway_id
                                }).then((response2) => {
                                }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err });
                            if (allRecord === managedArray.length) {
                                res.send({
                                    message: 'Minute Adjustment Successfully!',
                                    code: 200
                                });
                            }
                        }
                    } else {
                        res.send({
                            message: 'Minute Adjustment Successfully!',
                            code: 200
                        });
                    }

                }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })

            // knex(table.tbl_pbx_min_ext_mapping)
            // .where('id', data[0]['id'])
            // .del().then(async (responses) => {
            //     if(managedArray.length){
            //         for (let i = 0; i < managedArray.length; i++) {
            //             let isMinuteMappingExist;
            //             allRecord++;
            //             let destination = managedArray[i].country ? (managedArray[i].country).replace('+', '') : 0;    // JUST CONVERT +91 TO 91                            
            //             await knex(table.tbl_pbx_min_ext_mapping)
            //                 .insert({
            //                     id: managedArray[i].id,
            //                     destination: destination,
            //                     extension_id: managedArray[i].extension_id,
            //                     assingn_minutes: managedArray[i].manage_minutes,
            //                     customer_id: customer_id,
            //                     plan_type: managedArray[i].type,
            //                     used_minutes: managedArray[i].used_minutes,
            //                     gateway_id : managedArray[i].gateway_id
            //                 }).then((response2) => {
            //                 }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err });
            //             if (allRecord === managedArray.length) {
            //                let querys = knex(table.tbl_Call_Plan_Rate).where('dial_prefix',data[0].country).andWhere('customer_id',customer_id).andWhere('call_plan_id',data[0].call_plan_id).andWhere('plan_type',data[0]['type'])                                                
            //                 .increment("deduct_minute", deduct_minutes == 0 ? data[0]['remaining_minutes']: deduct_minutes)
            //                 console.log(querys.toQuery(),"querys")
            //                 querys.then(response4 => {
            //                     console.log(response4,"response4")
            //                     if(response4){
            //                         res.send({
            //                             message: 'Minute Adjustment Successfully!',
            //                             code: 200
            //                         });
            //                     }
            //                 }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
            //             }
            //         }
            //     }else{
            //         res.send({
            //             message: 'Minute Adjustment Successfully!',
            //             code: 200
            //         });
            //     }

            // }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
        }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
}

function getExtensionMinute(req, res) {
    let request = req.query;
    let sql = knex(table.tbl_pbx_min_ext_mapping).select('*').where('customer_id', request.cust_id).andWhere('extension_id', request.ext_id).andWhere('destination', request.destination);
    sql.then((response) => {
        if (response.length) {
            res.send({
                status_code: 200,
                response: response
            });
        } else {
            res.send({
                status_code: 201
            })
        }
    }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
}

function freeMinutesFromExtension(req, res) {
    let data = req.body;
    let query = knex(table.tbl_pbx_min_ext_mapping).where('customer_id', data.customer_id).andWhere('extension_id', data.ext_id).andWhere('destination', data.dial_prefix).andWhere('gateway_id', data.gateway_id).del();
    query.then((response) => {
        if (response) {
            let sql = knex(table.tbl_Call_Plan_Rate).increment('actual_minutes', data.minutes).where('dial_prefix', '+' + data.dial_prefix).andWhere('customer_id', data.customer_id).andWhere('gateway_id', data.gateway_id).andWhere('plan_type', '5');
            sql.then((response1) => {
                res.send({
                    status_code: 200,
                    response: response
                })
            }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
        }
    }).catch((err) => { console.log(err); res.status(401).send({ code: err.errno, error: 'error', message: 'DB Error: ' + err.message }); throw err })
}


function setAdvanceService(req, res) {
    let cust_id = req.body.credentials.customer_id;
    let extension = req.body.credentials.sip ? req.body.credentials.sip : "";
    let callGroup = req.body.credentials.cg ? req.body.credentials.cg : "";
    let speedDial = req.body.credentials.speed_dial ? req.body.credentials.speed_dial : "";
    let advanceFeature = req.body.credentials.extType ? req.body.credentials.extType : "";
    let feature = req.body.credentials.feature ? req.body.credentials.feature : "";
    let count = 0;    
    if(req.body.credentials.ext_list != null){
        applyServiceOnSipOrCg(req.body.credentials.ext_list, req.body.credentials, cust_id, extension, callGroup, speedDial, feature, res);
    }else{
        knex(table.tbl_Extension_master).whereIn('intercom_dialout', req.body.credentials.ext_group_id).then((response) => {
            return applyServiceOnSipOrCg(response.map(item => item.id), req.body.credentials, cust_id, extension, callGroup, speedDial, feature, res);
        })
    }    

}

function applyServiceOnSipOrCg(extList, credentials, cust_id, extension, callGroup, speedDial, feature, res){
    let count = 0;
    for (let i = 0; i < extList.length; i++) {
        let sql2 = knex.from(table.tbl_Speed_Dial).select('id').where('extension_id', extList[i]).andWhere('digit', 'like', "%" + speedDial + "%")
        sql2.then((response) => {
            if (response.length > 0) {
                knex.from(table.tbl_Speed_Dial).where('extension_id',extList[i]).andWhere('digit', 'like', "%" + speedDial + "%").del()
                    .then((responses) => {
                        let sql = knex.table(table.tbl_Speed_Dial).insert({
                            customer_id: cust_id,
                            extension_id: extList[i],
                            digit: '*' + speedDial,
                            number: feature == '0' ? credentials.sip_number : callGroup,
                            // feature_select: req.body.credentials.feature_select,
                            country_id: feature == '0' ? 0 : -1
                        })
                        sql.then((respon) => {
                            count++;
                            if (count == extList.length) {
                                res.send({
                                    status_code: 200
                                })
                            }
                        })
                    })
            } else {
                let sql = knex.table(table.tbl_Speed_Dial).insert({
                    customer_id: cust_id,
                    extension_id: extList[i],
                    digit: '*' + speedDial,
                    number: feature == '0' ? credentials.sip_number : callGroup,
                    // feature_select: req.body.credentials.feature_select,
                    country_id: feature == '0' ? 0 : -1
                })
                sql.then((respon) => {
                    count++;
                    if (count == extList.length) {
                        res.send({
                            status_code: 200
                        })
                    }
                })
            }

        })



        let sql = knex.table(table.tbl_Speed_Dial).insert({
            customer_id: cust_id,
            extension_id: extList[i],
            digit: speedDial,
            number: feature == '0' ? extension : callGroup,

        })
    }
}


function bulkDeleteExtension(req, res) {

    let data = req.body.credentials;        
    if (data.int_group_id != null && data.int_group_id != "") { 
        let sql21 = knex(table.tbl_Extension_master).whereIn('intercom_dialout',data.int_group_id)
        sql21.then(response =>{      
            return  deleteExtByInetrcom(response.map(item => item.ext_number), data, res); 
        })
    }else{
        deleteExtByInetrcom(data.ext_numbers.map(Number), data, res);
    }
}

function deleteExtByInetrcom(ext_numbers, data, res) {
    let promises = [];
  
    ext_numbers.forEach((item, index) => {
      let sql = knex
        .from(table.tbl_mapped_featured_detail)
        .select("ext_number", "table_name")
        .whereRaw(`FIND_IN_SET('${item}', ext_number )`);
  
      promises.push(
        sql.then((response) => {
          if (response.length > 0) { 
            console.log(response,"----response----")
            let updatePromises = response.map((value) => {
              switch (value.table_name) {
                case "pbx_callgroup":
                  return knex.raw(` UPDATE pbx_callgroup
                                      SET sip = (
                                      CASE
                                      WHEN FIND_IN_SET('${item}', sip) > 0 THEN
                                      TRIM(BOTH ',' FROM REPLACE(CONCAT(',', sip, ','), CONCAT(',','${item}',','), ','))
                                      ELSE sip
                                      END
                                  )`);
                case "did_destination":
                  return knex.raw(` UPDATE did_destination
                                      SET destination_id = (
                                      CASE
                                      WHEN FIND_IN_SET(${data.extIds != null ? data.extIds[index]: item}, destination_id) > 0 THEN
                                      TRIM(BOTH ',' FROM REPLACE(CONCAT(',', destination_id, ','), CONCAT(',',${data.extIds != null ? data.extIds[index] : item},','), ','))
                                      ELSE destination_id
                                      END
                                  )
                                  WHERE destination_id LIKE '%${data.extIds != null ? data.extIds[index] : item}%'`);
  
                case "pbx_queue":
                  return knex.raw(` UPDATE pbx_queue
                                  SET agent = (
                                  CASE
                                  WHEN FIND_IN_SET('${item}', agent) > 0 THEN
                                  TRIM(BOTH ',' FROM REPLACE(CONCAT(',', agent, ','), CONCAT(',','${item}',','), ','))
                                  ELSE agent
                                  END
                              )`);
  
                case "time_group":
                  return knex.raw(` UPDATE time_group
                                  SET active_feature_value = (
                                  CASE
                                  WHEN FIND_IN_SET(${data.extIds != null ? data.extIds[index] : item}, active_feature_value) > 0 THEN
                                  TRIM(BOTH ',' FROM REPLACE(CONCAT(',', active_feature_value, ','), CONCAT(',',${data.extIds != null ? data.extIds[index] : item},','), ','))
                                  ELSE active_feature_value
                                  END
                              ) WHERE active_feature_value LIKE '%${data.extIds != null ? data.extIds[index] : item}%'`);
  
                case "pbx_ivr_detail":
                  return knex.raw(` UPDATE pbx_ivr_detail
                                          SET ivr_action = (
                                          CASE
                                          WHEN FIND_IN_SET(${data.extIds != null ? data.extIds[index] : item}, ivr_action) > 0 THEN
                                          TRIM(BOTH ',' FROM REPLACE(CONCAT(',', ivr_action, ','), CONCAT(',',${data.extIds != null ? data.extIds[index] : item},','), ','))
                                          ELSE ivr_action
                                          END
                                      ) WHERE ivr_action LIKE '%${data.extIds != null ? data.extIds[index] : item}%'`);
                case "pbx_broadcast_mapping":
                  return knex.raw(` UPDATE pbx_broadcast_mapping
                                  SET ref_id = (
                                  CASE
                                  WHEN FIND_IN_SET(${data.extIds != null ? data.extIds[index] : item}, ref_id) > 0 THEN
                                  TRIM(BOTH ',' FROM REPLACE(CONCAT(',', ref_id, ','), CONCAT(',',${data.extIds != null ? data.extIds[index] : item},','), ','))
                                  ELSE ref_id
                                  END
                              ) WHERE ref_id LIKE '%${data.extIds != null ? data.extIds[index] : item}%'`);
                case "pbx_appointment_mapping":
                    console.log(data.extIds,"-----------------------------------------")
                 return knex.raw(` UPDATE pbx_broadcast_mapping
                              SET ref_id = (
                              CASE
                              WHEN FIND_IN_SET(${data.extIds != null ? data.extIds[index] : item}, ref_id) > 0 THEN
                              TRIM(BOTH ',' FROM REPLACE(CONCAT(',', ref_id, ','), CONCAT(',',${data.extIds != null ? data.extIds[index] : item},','), ','))
                              ELSE ref_id
                              END
                          ) WHERE ref_id LIKE '%${data.extIds != null ? data.extIds[index] : item}%'`);
                case "pbx_plugin_action":
                  return knex.raw(` UPDATE pbx_plugin_action
                          SET action_value = "" , action_value_id = "" WHERE action_value_id LIKE '%${data.extIds != null ? data.extIds[index] : item}%'`);
              }
            });
            return Promise.all(updatePromises).then(() => {
              return knex
                .table(table.tbl_mapped_featured_detail)
                .whereRaw(`FIND_IN_SET('${item}', "'" + ext_number + "'")`)
                .del();
            });
          } else {
            return Promise.resolve();
          }
        })
      );
    });
  
    Promise.all(promises)
      .then(() => {
        return knex
          .table(table.tbl_Extension_master)
          .whereIn("ext_number", ext_numbers)
          .del();
      })
      .then(() => {
        if (data.int_group_id != null && data.int_group_id != "") {
            
            knex(table.tbl_pbx_intercom_dialout).update({"extension_list": ""}).whereIn('id',data.int_group_id).then(resp => {
                res.send({ status_code: 200 });
            })
        }
        else{
            res.send({ status_code: 200 });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(401).send({
          code: err.errno,
          error: "error",
          message: "DB Error: " + err.message,
        });
      });
  }



module.exports = {
    createExtension, getAllExtension, verifyExtension, getExtensionById, onlyOutboundStatus, updateExtension, getAllExtensionNumber,
    getExtensionLimit, getMonthlyTotalExtension, getTotalExtension, deleteExtension,
    getExtensionSetting, updateExtensionSettings, getExtensionNameandNumber, getExtensionByFilters,
    updateExtensionPassword, extensionEmailExist, getExtensionName, verifyEmail,
    getCustomerExtensionFeatures, getExtensionFeaturesByFilters, getExtensionForSupport,
    verifyExtUsername, updatePackageMinuteBal, updateExtensionMinute, deductCustomExtensionMinute,
    deductAllExtensionMinute, getExtensionCount, getDestinationDID, bulkExtensionUpdate, getExtensionForRealtimeDashboard,
    makeFavoriteContactByExtension, updateExtension_FMFM_Settings, getExtension_FMFM_Setting,
    assignBundlePlanMinuteForExtension, getExtensionAssignMinutes, adjustBundlePlanMinuteForExtension,
    getExtensionAssignMinutesByExtnId, inactiveExtension, activeExtension, getDidListById, UpdateProfile, getExtensionByExtId, getAllExtensionWithPlugin, getPluginExtByCustomerId, getRoaming, getAllExtensionsForCustomer,
    getExtensionMinute, freeMinutesFromExtension, setAdvanceService, bulkDeleteExtension,getAllIntercomExtension,verifyExtensionn
};
