const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');

let EmailTemplate = require('email-templates').EmailTemplate;
let path = require('path');
let nodemailer = require("nodemailer");
const config = require('../config/app');
const { log } = require('console');

// const fs = require('fs');
// const util = require('util');
// const ejs = require('ejs');

// const fs = require('fs');
// let smtpTransport = require('nodemailer-smtp-transport');


function getSmtpDetails(data) {
    return nodemailer.createTransport({
        host: data[0]['host'],
        port: data[0]['port'],
        secure: true,
        service: data[0]['name'],
        // port: 587,
        // secure: false,
        pool: false,
        auth: {
            user: data[0]['username'],
            pass: data[0]['password']
        }
    });
}

function getCustomerNameandEmail(req) {
    return knex.raw("select CONCAT(first_name, \' \',last_name) as name,company_name,email \
     from " + table.tbl_Customer + "\
    where id in (" + req + ")").then((response) => {
        if (response) {
            return ({ userName: response[0][0].name, email: response[0][0].email, company_name: response[0][0].company_name });
        }
    })
}

function getExtensionName(req) {
    return knex(table.tbl_Extension_master).where('email', '=', "" + req + "").select('username as name')
        .then((response) => {
            if (response) {
                return ({ userName: response[0].name, email: req });
            }
        })
}

function getEmailContentUsingCategory(req) {
    return knex.select('e.id', 'e.name', 'e.title', 'e.image', 'e.content', 'e.email_category_id',
        'c.category_name as category_name')
        .from(table.tbl_Email_template + ' as e')
        .leftOuterJoin(table.tbl_Email_Category + ' as c', 'e.email_category_id', 'c.id')
        .where('c.category_name', '=', "" + req + "")
        .andWhere('e.status', '=', '1')
        .then((response) => {
            return response[0];
        })
}

function getCustomerName(req) {
    return knex(table.tbl_Customer).where('email', '=', "" + req + "").andWhere('status', '=', '1')
        .select(knex.raw('CONCAT(first_name, \' \',last_name) as name'))
        .then((response) => {
            return ({ userName: response[0].name, email: req });
        })
}

function getCustomerEmail(req) {
    return knex.select('id', 'email').from(table.tbl_Customer).where('first_name', '=', "" + req + "").andWhere('status', '=', '1')
        .then((response) => {
            return ({ userName: req, email: response[0].email });
            // return res.json({ response });
        })
}

async function sendmail2(req) {
    let data = await knex.from(table.tbl_pbx_smtp).select('*').where('status', '1');

    let trans = await getSmtpDetails(data);
    let templateDir = path.join(__dirname, "../", 'emailTemplate', 'testMailTemplate')
    let testMailTemplate = new EmailTemplate(templateDir);
    let locals = {
        action: req.action ? req.action : '',
        userName: req.data.userName ? req.data.userName : '',
        title: req.val.title,
        content: req.val.content ? req.val.content : '',
        url: req.val.image ? req.val.image : '',
        category_id: req.val.email_category_id ? req.val.email_category_id : '',
        ticket_number: req.ticket_number ? req.ticket_number : '',
        ticket_type: req.ticket_type_name ? req.ticket_type_name : '',
        product: req.product ? req.product : '',
        ticketMessage: req.ticketMessage ? req.ticketMessage : '',
        reply: req.reply ? req.reply : '',
        username: req.username ? req.username : '',
        password: req.password ? req.password : '',
        features: req.feature ? req.feature : '',
        customer: req.customer ? req.customer : '',
        loginURL: req.data.url ? req.data.url : '',
        invoice_number: req.data.invoice_number ? req.data.invoice_number : '',
        amount: req.data.amount ? req.data.amount : '',
        fare_amount: req.data.fare_amount ? req.data.fare_amount : '',
        gst_amount: req.data.gst_amount ? req.data.gst_amount : '',
        invoice_month: req.data.invoice_month ? req.data.invoice_month : '',
        didData: req.data.didDatas ? req.data.didDatas : [],
        customerName: req.data.cName ? req.data.cName : '',
        customerEmail: req.data.cEmail ? req.data.cEmail : '',
        customerOrganization: req.data.customerOrganization ? req.data.customerOrganization : '',
        didCountryName: req.data.countryName ? req.data.countryName : '',
        boosterDetail: req.boosterData ? req.boosterData : '',
        boostercustomerEmail: req.data.customerEmail ? req.data.customerEmail : '',
        charge: req.data.charge ? req.data.charge : '',
        url: req.data.url ? req.data.url : '',
        type: req.data.type ? req.data.type : '',
        conference_name: req.val.conference_name ? req.val.conference_name : '',
        start_time: req.val.start_time ? req.val.start_time : '',
        end_time: req.val.end_time ? req.val.end_time : '',
        admin_pin: req.val.admin_pin ? req.val.admin_pin : '',
        participant_pin: req.val.participant_pin ? req.val.participant_pin : ''
    };
    let mailList = [];

    return testMailTemplate.render(locals, function (err, temp) {
        if (err) { console.log("error", err); }
        else {

            trans.sendMail({
                from: trans.options.auth.user,
                to: req.data.email,
                subject: req.val.title,
                text: req.val.content,
                html: temp.html
            }, function (error, info) {
                if (error) {
                    knex.table(table.tbl_pbx_smtp_audit_log).insert({
                        service: data[0].name, subject: req.val.title, status: "" + error.response + "",
                    }).then((response) => {

                    }).catch((err) => {

                        resolve({
                            status: 400
                        })
                    })
                    return ({ success: false, msg: 'Mail not sent!', sendStatus: 500 });
                } else {
                    knex.table(table.tbl_pbx_smtp_audit_log).insert({
                        service: data[0].name, subject: req.val.title, status: "Success",
                    }).then((response) => {

                    }).catch((err) => {

                        resolve({
                            status: 400
                        })
                    })
                    trans.close();
                    return ({ success: true, msg: 'Mail sent', sendStatus: 200 });
                }
            })
        }
    })
}

async function sendmail(req) {
    let data = await knex.from(table.tbl_pbx_smtp).select('*').where('status', '1');
    let trans = getSmtpDetails(data);
    let templateDir = path.join(__dirname, "../", 'emailTemplate', 'testMailTemplate')

    let testMailTemplate = new EmailTemplate(templateDir);
    let locals = {
        action: req.action ? req.action : '',
        userName: req.data.userName ? req.data.userName : '',
        title: req.val.title ? req.val.title : '',
        content: req.val.content ? req.val.content : '',
        image: req.val.image ? req.val.image : '',
        category_id: req.val.email_category_id ? req.val.email_category_id : '',
        ticket_number: req.ticket_number ? req.ticket_number : '',
        ticket_type: req.ticket_type ? req.ticket_type : '',
        product: req.product ? req.product : '',
        ticketMessage: req.ticketMessage ? req.ticketMessage : '',
        reply: req.reply ? req.reply : '',
        username: req.username ? req.username : '',
        password: req.password ? req.password : '',
        features: req.feature ? req.feature : '',
        customer: req.customer ? req.customer : '',
        cust_company: req.data.cust_company ? req.data.cust_company : '',
        account: req.data.account ? req.data.account : '',
        loginURL: req.data.url ? req.data.url : '',
        invoice_number: req.data.invoice_number ? req.data.invoice_number : '',
        amount: req.data.amount ? req.data.amount : '',
        fare_amount: req.data.fare_amount ? req.data.fare_amount : '',
        gst_amount: req.data.gst_amount ? req.data.gst_amount : '',
        final_payment: req.data.final_payment ? req.data.final_payment : '',
        single_amount: req.data.single_amount ? req.data.single_amount : '',
        late_fee: req.data.late_fee ? req.data.late_fee : '',
        due_date: req.data.due_date ? req.data.due_date : '',
        invoice_period: req.data.invoice_period ? req.data.invoice_period : '',
        adjustment: req.data.adjustment ? req.data.adjustment : '',
        sub_total: req.data.sub_total ? req.data.sub_total : '',
        igst: req.data.igst ? req.data.igst : '',
        cgst: req.data.cgst ? req.data.cgst : '',
        invoice_month: req.data.invoice_month ? req.data.invoice_month : '',
        didData: req.data.didDatas ? req.data.didDatas : [],
        customerName: req.data.cName ? req.data.cName : '',
        customerEmail: req.data.cEmail ? req.data.cEmail : '',
        customerOrganization: req.data.customerOrganization ? req.data.customerOrganization : '',
        didCountryName: req.data.countryName ? req.data.countryName : '',
        boosterDetail: req.boosterData ? req.boosterData : '',
        boostercustomerEmail: req.data.customerEmail ? req.data.customerEmail : '',
        charge: req.data.charge ? req.data.charge : '',
        url: req.data.url ? req.data.url : '',
        type: req.data.type ? req.data.type : '',
        pdf_name: req.pdf_file,
        tcPkgName: req.data.pkg_name,
        tcPkgPrice: req.data.tc_pkg_price,
        minutes: req.data.minutes,
        expiry: req.data.tc_pkg_expiry,
        mailList: req.mailList + req.action + "&email=" + req.data.email,
        logo_img: req.data.logo_img ? req.data.logo_img : 'assets/img/brand/ECTL_logo_new.png',
        mailLists: req.mailLists
    };
    let mailList = [];
    return new Promise((resolve, reject) => {
        testMailTemplate.render(locals, function (err, temp) {

            if (err) {
                resolve({ success: false, msg: 'Template not rendering!', sendStatus: 500 });
            }
            else {

                if (locals.pdf_name) {
                    trans.sendMail({
                        from: trans.options.auth.user,
                        to: req.data.email,
                        subject: req.val.title,
                        text: req.val.content,
                        html: temp.html,
                        attachments: {
                            filename: 'Invoice.pdf',
                            path: `../api/upload/${locals.pdf_name}`
                        }
                    }, function (error, info) {
                        if (error) {
                            knex.table(table.tbl_pbx_smtp_audit_log).insert({
                                service: data[0].name, subject: req.val.title, status: "" + error.response + "",
                            }).then((response) => {

                            }).catch((err) => {

                                resolve({
                                    status: 400
                                })
                            })
                            resolve({ success: false, msg: 'Mail not sent!', sendStatus: 500 });
                        } else {
                            knex.table(table.tbl_pbx_smtp_audit_log).insert({
                                service: data[0].name, subject: req.val.title, status: "Success",
                            }).then((response) => {

                            }).catch((err) => {

                                resolve({
                                    status: 400
                                })
                            })
                            trans.close();
                            resolve({ success: true, msg: 'Mail sent', sendStatus: 200 });
                        }
                    })
                } else {

                    trans.sendMail({
                        from: trans.options.auth.user,
                        to: req.data.email,
                        subject: req.val.title,
                        text: req.val.content,
                        html: temp.html
                    }, function (error, info) {

                        if (error) {
                            console.log(error, "error");
                            let sql = knex.table(table.tbl_pbx_smtp_audit_log).insert({
                                service: data[0].name, subject: req.val.title, status: "" + error.response + "",
                            })
                            sql.then((response) => {

                            }).catch((err) => {

                                resolve({
                                    status: 400
                                })
                            })
                            resolve({ success: false, msg: 'Mail not sent!', sendStatus: 500 });
                        } else {
                            console.log("success");
                            knex.table(table.tbl_pbx_smtp_audit_log).insert({
                                service: data[0].name, subject: req.val.title, status: "Success",
                            }).then((response) => {

                            }).catch((err) => {

                                resolve({
                                    status: 400
                                })
                            })
                            trans.close();
                            resolve({ success: true, msg: 'Mail sent', sendStatus: 200 });
                        }
                    })
                }

            }
        })
    })
}

async function sendmail3(req) {
    let data = await knex.from(table.tbl_pbx_smtp).select('*').where('status', '1');

    let trans = getSmtpDetails(data);
    let templateDir = path.join(__dirname, "../", 'emailTemplate', 'testMailTemplate')
    let testMailTemplate = new EmailTemplate(templateDir);
    let locals = {
        action: req.action ? req.action : '',
        userName: req.data.userName ? req.data.userName : '',
        title: req.val.title,
        content: req.val.content ? req.val.content : '',
        url: req.val.image ? req.val.image : '',
        category_id: req.val.email_category_id ? req.val.email_category_id : '',
        ticket_number: req.ticket_number ? req.ticket_number : '',
        ticket_type: req.ticket_type ? req.ticket_type : '',
        product: req.product ? req.product : '',
        ticketMessage: req.ticketMessage ? req.ticketMessage : '',
        reply: req.reply ? req.reply : '',
        username: req.username ? req.username : '',
        password: req.password ? req.password : '',
        features: req.feature ? req.feature : '',
        customer: req.customer ? req.customer : '',
        loginURL: req.data.url ? req.data.url : '',
        invoice_number: req.data.invoice_number ? req.data.invoice_number : '',
        amount: req.data.amount ? req.data.amount : '',
        fare_amount: req.data.fare_amount ? req.data.fare_amount : '',
        gst_amount: req.data.gst_amount ? req.data.gst_amount : '',
        invoice_month: req.data.invoice_month ? req.data.invoice_month : '',
        didData: req.data.didDatas ? req.data.didDatas : [],
        customerName: req.data.cName ? req.data.cName : '',
        customerEmail: req.data.cEmail ? req.data.cEmail : '',
        customerOrganization: req.data.customerOrganization ? req.data.customerOrganization : '',
        didCountryName: req.data.countryName ? req.data.countryName : '',
        boosterDetail: req.boosterData ? req.boosterData : '',
        boostercustomerEmail: req.data.customerEmail ? req.data.customerEmail : '',
        charge: req.data.charge ? req.data.charge : '',
        url: req.data.url ? req.data.url : '',
        type: req.data.type ? req.data.type : '',
    };
    let mailList = [];


    return testMailTemplate.render(locals, function (err, temp) {
        if (err) { console.log("error", err); }
        else {
            if (req.data.flag) {
                trans.sendMail({
                    from: trans.options.auth.user,
                    to: req.data.email,
                    subject: req.val.title,
                    text: req.val.content,
                    html: temp.html
                }, function (error, info) {
                    if (error) {
                        knex.table(table.tbl_pbx_smtp_audit_log).insert({
                            service: data[0].name, subject: req.val.title, status: "" + error.response + "",
                        }).then((response) => {

                        }).catch((err) => {

                            resolve({
                                status: 400
                            })
                        })
                        return ({ success: false, msg: 'Mail not sent!', sendStatus: 500 });
                    } else {
                        knex.table(table.tbl_pbx_smtp_audit_log).insert({
                            service: data[0].name, subject: req.val.title, status: "Success",
                        }).then((response) => {

                        }).catch((err) => {

                            resolve({
                                status: 400
                            })
                        })
                        trans.close();
                        return ({ success: true, msg: 'Mail sent', sendStatus: 200 });
                    }
                })
            }
            else {
                trans.sendMail({
                    from: trans.options.auth.user,
                    to: req.data.email,
                    subject: req.val.title,
                    text: req.val.content,
                    html: temp.html
                }, function (error, info) {
                    if (error) {
                        knex.table(table.tbl_pbx_smtp_audit_log).insert({
                            service: data[0].name, subject: req.val.title, status: "" + error.response + "",
                        }).then((response) => {

                        }).catch((err) => {

                            resolve({
                                status: 400
                            })
                        })
                        return ({ success: false, msg: 'Mail not sent!', sendStatus: 500 });
                    } else {
                        knex.table(table.tbl_pbx_smtp_audit_log).insert({
                            service: data[0].name, subject: req.val.title, status: "Success",
                        }).then((response) => {

                        }).catch((err) => {

                            resolve({
                                status: 400
                            })
                        })
                        trans.close();
                        return ({ success: true, msg: 'Mail sent', sendStatus: 200 });
                    }
                })
            }
        }
    })
}



module.exports = { getEmailContentUsingCategory, getCustomerNameandEmail, getCustomerName, sendmail, getCustomerEmail, getExtensionName, sendmail2, sendmail3 }