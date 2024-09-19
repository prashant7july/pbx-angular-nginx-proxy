const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var express = require('express');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var moment = require('moment');
const importExcel = express();
const path = require('path');
const { createModuleLog } = require("../helper/modulelogger.js")
const { uploadToMinio, fetchExcel } = require('../controllers/minIo');
const minioClient = require('../config/minIo.config');
const fs = require('fs');

importExcel.use(express.json({ type: "application/json" }));
importExcel.use(express.urlencoded({ extended: false }));

console.log('inside import file');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploadExcelImport/')
        // DIR = path.join(__dirname, '../', 'uploadExcelImport/');  // this url is use for import the excel sheet on our local machine
        // cb(null, DIR)
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({
    storage: storage
}).single('file');

importExcel.post('/uploadCsv', async function (req, res) {
    upload(req, res, function (err) {
        var data = req.body;
        if (err) {
            console.log('if error occurs');
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        console.log('file passed');
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx'
            || req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'csv') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        
        if (data.type == 'advance') {

            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {

                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }
                    let contactData = await knex.from(table.tbl_Contact_list).where('customer_id', data.customer_id).select('phone_number1', 'phone_number2')

                    var mergedArray = contactData.reduce((acc, row) => {
                        if (row.phone_number1) {
                            acc.push(row.phone_number1.substring(3));
                        }
                        if (row.phone_number2) {
                            acc.push(row.phone_number2.substring(3));
                        }
                        return acc;
                    }, []);


                    let validArr = []; let invalidArr = [];


                    for (let i = 0; i < result.length; i++) {
                        let email = result[i].email != '' ? validateEmailAddress(result[i].email) : false;
                        let mobile = result[i].phone_number1 != '' ? validateMobile(result[i].phone_number1) : false;
                        let mobile1 = validateMobile(result[i].phone_number2);
                        let conCode = result[i].country_code != '' ? validateCountryCode(result[i].country_code) : false;
                        var phonecode = result[i]['dial prefix'] != '' ? await getCountryIdUsingdialPrefix(result[i]['dial prefix']) : false;
                        if (email && (mobile && mobile1) && conCode && result[i].name != '') {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }

                    }
                    // duplicateCount = mergedArray.filter((value, index) => {result[index].phone_number1 == value || result[index].phone_number2});
                    let duplicateCount = [];

                    for (i = 0; i < mergedArray.length; i++) {
                        for (j = 0; j < result.length; j++) {
                            if (mergedArray[i] == result[j].phone_number1 || mergedArray[i] == result[j].phone_number2) {
                                duplicateCount.push(mergedArray[i]);
                            }
                        }
                    }

                    let count = 0;
                    for (let j = 0; j < validArr.length; j++) {
                        count = count + 1;
                        let sql = knex.select('id as country_id', 'phonecode as country_code').from(table.tbl_Country)
                            .where('phonecode', '=', "" + validArr[j].country_code + "")
                        sql.then((response) => {

                            if (response.length > 0) {
                                let cont = Object.values(JSON.parse(JSON.stringify(response)));

                                let countryId = cont[0].country_id;
                                let countryCode = cont[0].country_code;
                                let phno1 = '+' + countryCode + validArr[j].phone_number1;
                                let phno2 = validArr[j].phone_number2 != '' ? '+' + countryCode + validArr[j].phone_number2 : '';

                                // delete validArr[j]['country_code']; //delet bcz we dont have country code in contact table
                                if (data.role == '1') {
                                    knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                        .where('phone_number1', '=', "" + phno1 + "").orWhere('phone_number2', '=', "" + phno1 + "")
                                        .andWhere('customer_id', '=', "" + data.customer_id + "").andWhere('extension_id', '=', 0)
                                        .then((response) => {


                                            if (response.length == 0) {
                                                console.log('if p1 not exist');

                                                if (phno2 != '') {


                                                    knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                        .where('phone_number1', '=', "" + phno1 + "").orWhere('phone_number2', '=', "" + phno1 + "")
                                                        .andWhere('customer_id', '=', "" + data.customer_id + "").andWhere('extension_id', '=', 0)
                                                        .then((response1) => {


                                                            if (response1.length == 0) {
                                                                let sql = knex(table.tbl_Contact_list).insert({
                                                                    name: "" + validArr[j].name + "", email: "" + validArr[j].email + "", phone_number1: "" + phno1 + "",
                                                                    phone_number2: "" + phno2 + "", organization: "" + validArr[j].organization + "",
                                                                    designation: "" + validArr[j].designation + "", customer_id: "" + data.customer_id + "", extension_id: "" + data.extension_id + "",
                                                                    country_id: "" + countryId + "", status: "1"
                                                                })
                                                                sql.then((response) => {
                                                                    if (response.length > 0) {
                                                                        res.json({
                                                                            response: response,
                                                                            notInsertedData: invalidArr,
                                                                            duplicateCount: duplicateCount
                                                                        });
                                                                    } else {
                                                                        res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists' });
                                                                    }
                                                                }).catch((err) => { { console.log(err); throw err } });
                                                            } else {
                                                                console.log('1no insertion- value already exists');
                                                                invalidArr.push(validArr[j]);
                                                                res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                            }
                                                        }).catch((err) => { { console.log(err); throw err } });
                                                } else {
                                                    let sql2 = knex(table.tbl_Contact_list).insert({
                                                        name: "" + validArr[j].name + "", email: "" + validArr[j].email + "", phone_number1: "" + phno1 + "",
                                                        phone_number2: "" + phno2 + "", organization: "" + validArr[j].organization + "",
                                                        designation: "" + validArr[j].designation + "", customer_id: "" + data.customer_id + "", extension_id: "" + data.extension_id + "",
                                                        country_id: "" + countryId + "", status: "1"
                                                    })
                                                    sql2.then((response) => {
                                                        if (response.length > 0) {
                                                            res.json({
                                                                response: response,
                                                                notInsertedData: invalidArr,
                                                                duplicateCount: duplicateCount
                                                            });
                                                        } else {
                                                            console.log('2no insertion- value already exists');
                                                            invalidArr.push(validArr[j]);
                                                            res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                        }
                                                    }).catch((err) => { { console.log(err); throw err } });
                                                }
                                            } else {
                                                invalidArr.push(validArr[j]);



                                                if (count == invalidArr.length) {
                                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                }
                                            }
                                        }).catch((err) => { { console.log(err); throw err } });
                                } else if (data.role == '6') {
                                    knex(table.tbl_Extension_master).select('customer_id').where('id', '=', "" + data.extension_id + "")
                                        .then((response) => {
                                            if (response.length >= 0) {
                                                let cust = Object.values(JSON.parse(JSON.stringify(response)));

                                                let custId = cust[0].customer_id;
                                                knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                    .where('phone_number1', '=', "" + phno1 + "").orWhere('phone_number2', '=', "" + phno1 + "")
                                                    .andWhere('customer_id', '=', "" + custId + "").andWhere('extension_id', '=', "" + data.extension_id + "")
                                                    .then((response) => {
                                                        if (response.length == 0) {

                                                            if (phno2 != '') {
                                                                knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                                    .where('phone_number1', '=', "" + phno2 + "").orWhere('phone_number2', '=', "" + phno2 + "")
                                                                    .andWhere('customer_id', '=', "" + custId + "").andWhere('extension_id', '=', "" + data.extension_id + "")
                                                                    .then((response1) => {
                                                                        if (response1.length == 0) {
                                                                            knex(table.tbl_Contact_list).insert({
                                                                                name: "" + validArr[j].name + "", email: "" + validArr[j].email + "", phone_number1: "" + phno1 + "",
                                                                                phone_number2: "" + phno2 + "", organization: "" + validArr[j].organization + "",
                                                                                designation: "" + validArr[j].designation + "", customer_id: "" + custId + "", extension_id: "" + data.extension_id + "",
                                                                                country_id: "" + countryId + "", status: "1"
                                                                            }).then((response) => {
                                                                                if (response.length > 0) {
                                                                                    res.json({
                                                                                        response: response,
                                                                                        notInsertedData: invalidArr,
                                                                                        duplicateCount: duplicateCount
                                                                                    });
                                                                                } else {
                                                                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists' });
                                                                                }
                                                                            }).catch((err) => { { console.log(err); throw err } });
                                                                        } else {
                                                                            console.log('1no insertion- value already exists');
                                                                            invalidArr.push(validArr[j]);
                                                                            res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                                        }
                                                                    }).catch((err) => { { console.log(err); throw err } });
                                                            } else {
                                                                knex(table.tbl_Contact_list).insert({
                                                                    name: "" + validArr[j].name + "", email: "" + validArr[j].email + "", phone_number1: "" + phno1 + "",
                                                                    phone_number2: "" + phno2 + "", organization: "" + validArr[j].organization + "",
                                                                    designation: "" + validArr[j].designation + "", customer_id: "" + custId + "", extension_id: "" + data.extension_id + "",
                                                                    country_id: "" + countryId + "", status: "1"
                                                                }).then((response) => {
                                                                    if (response.length > 0) {
                                                                        res.json({
                                                                            response: response,
                                                                            notInsertedData: invalidArr,
                                                                            duplicateCount: duplicateCount
                                                                        });
                                                                    } else {
                                                                        console.log('2no insertion- value already exists');
                                                                        invalidArr.push(validArr[j]);
                                                                        res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                                    }
                                                                }).catch((err) => { { console.log(err); throw err } });
                                                            }
                                                        } else {

                                                            invalidArr.push(validArr[j]);

                                                            res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                        }
                                                    }).catch((err) => { { console.log(err); throw err } });
                                            } else {
                                                invalidArr.push(validArr[j]);
                                                res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                            }
                                        }).catch((err) => { { console.log(err); throw err } });
                                }
                            } else {
                                invalidArr.push(validArr[j]);
                                if (invalidArr.length == result.length) {
                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- Country Code does not Exist.', value: invalidArr });
                                } else {
                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- Country Code does not Exist.', value: invalidArr, success: true });
                                }
                                // res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                            }
                        }).catch((err) => { { console.log(err); throw err } });
                    }
                    if (invalidArr.length == result.length) {
                        res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        } else if (data.type == 'basic') {

            let customer_id = data['role'] == '1' ? data['customer_id'] : data['extension_id'];
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, function (err, result) {

                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }


                    let validArr = []; let invalidArr = [];
                    for (let i = 0; i < result.length; i++) {
                        let email = result[i].email != '' ? validateEmailAddress(result[i].email) : false;
                        let mobile = result[i].phone_number1 != '' ? validateMobile(result[i].phone_number1) : false;
                        let mobile1 = validateMobile(result[i].phone_number2);
                        let country = result[i].country_code != undefined ? true : false;
                        if (email && (mobile && mobile1) && result[i].name != '' && !country) {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }
                    }
                    // validArr.filter(function(item) {
                    //     let check = item.country_code;
                    //     // return ;
                    // });


                    if (data['role'] == '1') {  // customer contact
                        knex.select('country_id', 'country_code').from(table.tbl_Customer)
                            .where('id', '=', "" + data.customer_id + "")
                            .then((response) => {


                                if (response.length > 0) {
                                    let customer = Object.values(JSON.parse(JSON.stringify(response)));
                                    let countryId = customer[0].country_id;
                                    let countryCode = customer[0].country_code;
                                    let validArr1 = validArr.map(function (el) {
                                        var o = Object.assign({}, el);
                                        o.name = el.name;
                                        o.email = el.email;
                                        o.customer_id = data.customer_id;
                                        o.extension_id = data.extension_id;
                                        o.country_id = countryId;
                                        o.phone_number1 = countryCode + el.phone_number1;
                                        o.phone_number2 = el.phone_number2 != '' ? countryCode + el.phone_number2 : '';
                                        o.organization = el.organization;
                                        o.designation = el.designation;
                                        return o;
                                    });

                                    for (let i = 0; i < validArr1.length; i++) {
                                        console.log(knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                            .where('phone_number1', '=', validArr1[i].phone_number1)
                                            .orWhere('phone_number2', '=', validArr1[i].phone_number1).toString());
                                        knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                            .where('phone_number1', '=', validArr1[i].phone_number1)
                                            .orWhere('phone_number2', '=', validArr1[i].phone_number1)
                                            .then((response) => {


                                                if (response.length == 0) {

                                                    if (validArr1[i].phone_number2 != '') {
                                                        knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                            .where('phone_number1', '=', validArr1[i].phone_number2)
                                                            .orWhere('phone_number2', '=', validArr1[i].phone_number2)
                                                            .then((response1) => {


                                                                if (response1.length == 0) {
                                                                    knex(table.tbl_Contact_list).insert(validArr1[i])
                                                                        .then((response) => {
                                                                            if (response.length > 0) {
                                                                                res.json({
                                                                                    response
                                                                                });
                                                                            } else {
                                                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error' });
                                                                            }
                                                                        }).catch((err) => { { console.log(err); throw err } });
                                                                } else {
                                                                    console.log('no insertion');
                                                                    invalidArr.push(validArr1[i]);
                                                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                                                }
                                                            }).catch((err) => { { console.log(err); throw err } });
                                                    } else {
                                                        let sqlq = knex(table.tbl_Contact_list).insert(validArr1[i])
                                                        sqlq.then((response) => {
                                                            if (response.length > 0) {
                                                                res.json({
                                                                    response
                                                                });
                                                            } else {
                                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error' });
                                                            }
                                                        }).catch((err) => { { console.log(err); throw err } });
                                                    }
                                                } else {
                                                    console.log('no insertion- value already exists');
                                                    invalidArr.push(validArr1[i]);
                                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                    // res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                                }
                                            }).catch((err) => { { console.log(err); throw err } });
                                    }
                                    if (invalidArr.length == result.length) {
                                        res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                    }
                                } else {
                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                }
                            }).catch((err) => { { console.log(err); throw err } });
                    } else {  //  extension contact
                        knex.select('c.country_id', 'c.country_code', 'c.id').from(table.tbl_Extension_master + ' as ext')
                            .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'ext.customer_id')
                            .where('ext.id', '=', "" + data.extension_id + "")
                            .then((response) => {
                                if (response.length > 0) {
                                    let customer = Object.values(JSON.parse(JSON.stringify(response)));
                                    let countryId = customer[0].country_id;
                                    let countryCode = customer[0].country_code;
                                    let validArr1 = validArr.map(function (el) {
                                        var o = Object.assign({}, el);
                                        o.name = el.name;
                                        o.email = el.email;
                                        o.customer_id = customer[0].id;
                                        o.extension_id = data.extension_id;
                                        o.country_id = countryId;
                                        o.phone_number1 = countryCode + el.phone_number1;
                                        o.phone_number2 = el.phone_number2 != '' ? countryCode + el.phone_number2 : '';
                                        o.organization = el.organization;
                                        o.designation = el.designation;
                                        return o;
                                    });

                                    for (let i = 0; i < validArr1.length; i++) {
                                        console.log(knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                            .where('phone_number1', '=', validArr1[i].phone_number1)
                                            .orWhere('phone_number2', '=', validArr1[i].phone_number1).toString());
                                        knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                            .where('phone_number1', '=', validArr1[i].phone_number1)
                                            .orWhere('phone_number2', '=', validArr1[i].phone_number1)
                                            .then((response) => {


                                                if (response.length == 0) {
                                                    console.log('if p1 not exist');
                                                    if (validArr1[i].phone_number2 != '') {
                                                        knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                            .where('phone_number1', '=', validArr1[i].phone_number2)
                                                            .orWhere('phone_number2', '=', validArr1[i].phone_number2)
                                                            .then((response1) => {


                                                                if (response1.length == 0) {
                                                                    knex(table.tbl_Contact_list).insert(validArr1[i])
                                                                        .then((response) => {
                                                                            if (response.length > 0) {
                                                                                res.json({
                                                                                    response
                                                                                });
                                                                            } else {
                                                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error' });
                                                                            }
                                                                        }).catch((err) => { { console.log(err); throw err } });
                                                                } else {
                                                                    console.log('no insertion');
                                                                    invalidArr.push(validArr1[i]);
                                                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                                                }
                                                            }).catch((err) => { { console.log(err); throw err } });
                                                    } else {
                                                        knex(table.tbl_Contact_list).insert(validArr1[i])
                                                            .then((response) => {
                                                                if (response.length > 0) {
                                                                    res.json({
                                                                        response
                                                                    });
                                                                } else {
                                                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error' });
                                                                }
                                                            }).catch((err) => { { console.log(err); throw err } });
                                                    }
                                                } else {
                                                    console.log('no insertion- value already exists');
                                                    invalidArr.push(validArr1[i]);
                                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                                }
                                            }).catch((err) => { { console.log(err); throw err } });
                                    }
                                    if (invalidArr.length == result.length) {
                                        res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                    }
                                } else {
                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                }
                            }).catch((err) => { { console.log(err); throw err } });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        } else if (data.type == "advanceCallPlanRate") {
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }


                    var validArr = []; var invalidArr = [];
                    for (let i = 0; i < result.length; i++) {
                        let dialP = result[i].dial_prefix != '' ? validateCountryCode(result[i].dial_prefix) : false;
                        let sellingDur = result[i].selling_min_duration != 0 ? validateSellingDur(result[i].selling_min_duration) : true;
                        let sellingBill = validateSellingBill(result[i].selling_billing_block) ? true : false;
                        let callPlan = result[i]['call_plan'] != '' ? await validateCallPlan(result[i]['call_plan']) : false;
                        let planType = result[i]['plan_type'] != '' ? result[i]['plan_type'] == '0' ? true : false : false;
                        var phonecode = result[i].dial_prefix != '' ? await getCountryIdUsingdialPrefix(result[i]['dial_prefix']) : false;

                        if (planType && dialP && sellingDur && sellingBill && callPlan && result[i].buying_rate != '' && result[i].selling_rate != '' && result[i].gateway != '' && (phonecode != '' && phonecode != false)) {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }
                    }


                    for (let i = 0; i < validArr.length; i++) {
                        validArr[i].dial_prefix = '+' + validArr[i].dial_prefix;
                        knex.select('id').from(table.tbl_Call_Plan)
                            .where('name', '=', "" + validArr[i].call_plan + "")
                            .then((response) => {
                                if (response.length > 0) {

                                    let callPlan = Object.values(JSON.parse(JSON.stringify(response)));
                                    let callPlanId = callPlan[0].id
                                    knex.select('g.id').from(table.tbl_Gateway + ' as g')
                                        .leftOuterJoin(table.tbl_Provider + ' as p', 'p.id', 'g.provider_id')
                                        .where('provider', '=', "" + validArr[i].gateway + "")
                                        .then((response) => {
                                            if (response.length > 0) {

                                                let gateway = Object.values(JSON.parse(JSON.stringify(response)));
                                                let gatewayId = gateway[0].id

                                                knex.select('id').from(table.tbl_Call_Plan_Rate)
                                                    .where('dial_prefix', '=', "" + validArr[i].dial_prefix + "")
                                                    .andWhere('gateway_id', '=', "" + gatewayId + "")
                                                    .then((response) => {
                                                        if (response.length == 0) {
                                                            console.log(' inside if dial prefix exist');
                                                            console.log(knex(table.tbl_Call_Plan_Rate).insert({
                                                                call_plan_id: "" + callPlanId + "", dial_prefix: "" + validArr[i].dial_prefix + "", buying_rate: "" + validArr[i].buying_rate + "",
                                                                selling_rate: "" + validArr[i].selling_rate + "", selling_min_duration: "" + validArr[i].selling_min_duration + "",
                                                                selling_billing_block: "" + validArr[i].selling_billing_block + "", gateway_id: "" + gatewayId + "", status: "1", plan_type: "" + validArr[i].plan_type + "",
                                                                phonecode: phonecode
                                                            }).toString());

                                                            knex(table.tbl_Call_Plan_Rate).insert({
                                                                call_plan_id: "" + callPlanId + "", dial_prefix: "" + validArr[i].dial_prefix + "", buying_rate: "" + validArr[i].buying_rate + "",
                                                                selling_rate: "" + validArr[i].selling_rate + "", selling_min_duration: "" + validArr[i].selling_min_duration + "",
                                                                selling_billing_block: "" + validArr[i].selling_billing_block + "", gateway_id: "" + gatewayId + "", status: "1", plan_type: "" + validArr[i].plan_type + "",
                                                                phonecode: phonecode
                                                            }).then((response) => {
                                                                if (response.length > 0) {
                                                                    res.json({
                                                                        response: response
                                                                    });
                                                                } else {
                                                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists' });
                                                                }
                                                            }).catch((err) => {
                                                                res.status(401).send({ error: 'Unauthorized', message: 'No insertion- error get during insert call plan rate data' });
                                                                console.log(err); throw err
                                                            });
                                                        } else {
                                                            console.log(' inside not if dial prefix exist');

                                                            invalidArr.push(validArr[i]);

                                                            res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error1', value: invalidArr });
                                                        }
                                                    }).catch((err) => { { console.log(err); throw err } });
                                            } else {
                                                console.log(' ggggggggggginside not if dial prefix exist');
                                                console.log('gggggggggvalidArrrrr', validArr[i]);
                                                invalidArr.push(validArr[i]);
                                                console.log('gggggginvalidrrrrrrrrrArr', invalidArr);
                                                res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error2', value: invalidArr });
                                            }
                                        }).catch((err) => { { console.log(err); throw err } });
                                } else {
                                    console.log(' cccccccccccccccggggggggggginside not if dial prefix exist');
                                    console.log('ccccccccccccgggggggggvalidArrrrr', validArr[i]);
                                    invalidArr.push(validArr[i]);
                                    console.log('ccccccccccccccgggggginvalidrrrrrrrrrArr', invalidArr);
                                    res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error3', value: invalidArr });
                                }
                            }).catch((err) => { { console.log(err); throw err } });
                        console.log(' 1111111cccccccccccccccggggggggggginside not if dial prefix exist');
                        console.log('1111111111ccccccccccccgggggggggvalidArrrrr', validArr[i]);
                        //  invalidArr.push(validArr[i]);
                        console.log('1111111111ccccccccccccccgggggginvalidrrrrrrrrrArr', invalidArr);
                        //res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error4', value: invalidArr });
                    }

                    if (invalidArr.length == result.length) {
                        res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corrupted excel file" });
            }
        } else if (data.type == 'basicDID') {   // DID IMPORT CODE
            console.log('sssssssssssssssss');
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {
                    console.log('$$$$$$$$$$$$$$');
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }

                    console.log('data@@@@@@@@', result);
                    let validArr = []; let invalidArr = [];
                    for (let i = 0; i < result.length; i++) {
                        let didNumber = result[i]['did number'] != '' ? await validateDIDNumber(result[i]['did number']) : false;
                        let billingType = result[i]['billing type'] != '' ? await validateBillingType(result[i]['billing type']) : false;
                        let didGroup = result[i]['did group'] != '' ? await validateDIDgroup(result[i]['did group']) : false;
                        let provider = result[i]['provider'] != '' ? await validateProvider(result[i]['provider']) : false;
                        let country = result[i]['country'] != '' ? await validateCountry(result[i]['country']) : false;
                        let maxConcurrentCall = result[i]['max cc'] != '' ? await validatemaxConcurrentCall(result[i]['max cc']) : false;
                        let connectCharge = result[i]['connect charge'] != '' ? await validatemaxConcurrentCall(result[i]['connect charge']) : false;
                        let monthlyRate = result[i]['monthly rate'] != '' ? await validatemaxConcurrentCall(result[i]['monthly rate']) : false;
                        let sellingRate = result[i]['selling rate'] != '' ? await validatemaxConcurrentCall(result[i]['selling rate']) : false;
                        // console.log(didNumber, billingType, didGroup, provider, country, maxConcurrentCall, connectCharge, monthlyRate, sellingRate);
                        if (didNumber && billingType && didGroup && provider && country && maxConcurrentCall && connectCharge && (result[i]['billing type'] == '1' ? (monthlyRate && sellingRate) : result[i]['billing type'] == '2' ? monthlyRate : result[i]['billing type'] == '3' ? sellingRate : true)) {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }
                    }
                    console.log('validArr====', validArr);
                    console.log('invalidArr====', invalidArr);
                    var count = 0;
                    //point need to be clear activated, did type(tollfree, number)

                    for (let i = 0; i < validArr.length; i++) {
                        let providerId = await getProviderId(validArr[i]['provider']);
                        let countryId = await getCountryId(validArr[i]['country']);
                        let sellingRate = validArr[i]['selling rate'] ? validArr[i]['selling rate'] : 0;
                        let monthlyRate = validArr[i]['monthly rate'] ? validArr[i]['monthly rate'] : 0;

                        console.log('providerId====', providerId);
                        console.log('countryId====', countryId);
                        let sql = await knex(table.tbl_DID).insert({
                            did: "" + validArr[i]['did number'] + "", billingtype: "" + validArr[i]['billing type'] + "", provider_id: "" + providerId + "",
                            country_id: "" + countryId + "", max_concurrent: validArr[i]['max cc'], activated: "" + "1" + "",
                            customer_id: data.customer_id, fixrate: monthlyRate, connection_charge: validArr[i]['connect charge'],
                            selling_rate: sellingRate, did_type: "" + "1" + "", create_method: "2", did_group: validArr[i]['did group']
                        })
                        // log
                        sql.then((response) => {
                            count++;
                            console.log('count', count)
                            if (count == result.length) {
                                res.json({ response });
                                return;
                            }
                            if (count == validArr.length) {
                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                            }
                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message, status: '409' }); throw err });
                    }
                    if (invalidArr.length == result.length) {
                        res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        } else if (data.type == 'basicCallPlanRate') { // basicCallPlanRate
            let ratesParameter = data.rateValue.split(',');
            let check = true;
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }

                    if (!result.length) {
                        return res.status(401).send({ error: 'Unauthorized', message: 'Invalid input.' });
                    }

                    if (ratesParameter[0] == 0) {
                        if ((result[0]['selling billing block'] == undefined && result[0]['area code'] == undefined)) {
                            return res.status(401).send({ error: 'Unauthorized', message: 'Unauthorized File.' });
                        }
                    } else if (['1', '2', '3', '4', '5'].includes(ratesParameter[0])) {
                        if (!result[0]['talktime minutes']) {
                            return res.status(401).send({ error: 'Unauthorized', message: 'Unauthorized File.' });
                        }
                    }

                    const uniquePrefixes = new Set();
                    const uniqueResults = [];
                    for (const item of result) {
                        const prefix = ratesParameter[0] == 0 ? item['dial prefix'].concat(item['area code']) : item['dial prefix'];
                        if (!uniquePrefixes.has(prefix)) {
                            uniquePrefixes.add(prefix);
                            uniqueResults.push(item);
                        }
                    }
                    result = uniqueResults;

                    let value = [];
                    for (let i = 0; i < result.length; i++) {
                        let checkRates = await checkDuplicateCallRates(result[i]['dial prefix'], ratesParameter[0] == 0 ? result[i]['area code'] : "", ratesParameter[1], ratesParameter[4])
                        if (checkRates) {
                            value.push({ 'talktime_minutes': result[i]['talktime minutes'], 'dial prefix': result[i]['dial prefix'], 'buying rate': result[i]['buying rate'], 'selling rate': result[i]['selling rate'], 'selling billing block': result[i]['selling billing block'], 'area code': result[i]['area code'] });
                        }
                    }
                    if (value.length == 0) {
                        check = false;
                    }

                    var validArr = []; var invalidArr = [];
                    if (check == true) {
                        for (let i = 0; i < value.length; i++) {
                            let dialP = value[i]['dial prefix'] != '' ? validateCountryCode(value[i]['dial prefix']) : false;
                            let planType = ratesParameter[0] != '' ? true : false;
                            var phonecode = value[i]['dial prefix'] != '' ? await getCountryIdUsingdialPrefix(value[i]['dial prefix']) : false;
                            var is_group = ratesParameter[2] == true ? 1 : 0;
                            value[i]['talktime_minutes'] = is_group == 1 ? 0 : value[i]['talktime_minutes'] != undefined ? value[i]['talktime_minutes'] : 0;
                            value[i]['area_code'] = value[i]['area code'] && value[i]['area code'] != undefined ? value[i]['area code'] : "";
                            delete value[i]['area code'];
                            value[i]['selling_billing_block'] = ratesParameter[0] == '0' ? value[i]['selling billing block'] && value[i]['selling billing block'] != 0 && value[i]['selling billing block'] != undefined ? value[i]['selling billing block'] : 60 : '0';
                            delete value[i]['selling billing block'];
                            value[i]['plan_type'] = ratesParameter[0];
                            value[i]['gateway'] = ratesParameter[1];
                            value[i]['is_group'] = ratesParameter[2];
                            value[i]['group_id'] = ratesParameter[3] != "" ? ratesParameter[3] : 0;
                            value[i]['call_plan'] = ratesParameter[4];
                            value[i]['booster_for'] = ratesParameter[5] != "" ? ratesParameter[5] : 0;
                            value[i]['phonecode'] = phonecode;
                            console.log(planType, dialP, value[i]['buying rate'] != '', value[i]['selling rate'] != '', ratesParameter[1] != '', phonecode)
                            if (planType && dialP && value[i]['buying rate'] != '' && value[i]['selling rate'] != '' && (value[i]['buying rate'] <= value[i]['selling rate']) && ratesParameter[1] != '' && (phonecode != '' && phonecode != false)) {
                                validArr.push(value[i]);
                            } else {
                                invalidArr.push(value[i]);
                            }
                        }
                    } else {
                        return res.status(401).send({ error: 'Unauthorized', message: 'Call Rates Creation error', value: invalidArr });
                    }

                    var count = 0;
                    if (validArr.length) {
                        for (let i = 0; i < validArr.length; i++) {
                            validArr[i]['dial prefix'] = '+' + validArr[i]['dial prefix'];
                            let sql = knex.raw("Call pbx_save_callplanrate(" + null + "," + validArr[i]['call_plan'] + ",'" + validArr[i]['dial prefix'] + validArr[i]['area_code'] + "'," + validArr[i]['buying rate'] + "," + validArr[i]['selling rate'] + "," + 0 + "," + validArr[i]['selling_billing_block'] + ",'1', " + validArr[i]['gateway'] + "," + validArr[i]['phonecode'] + ",'" + validArr[i]['area_code'] + "','" + is_group + "'," + validArr[i]['group_id'] + "," + validArr[i]['talktime_minutes'] + "," + 0 + ",'" + validArr[i].plan_type + "'," + validArr[i]['booster_for'] + ", " + 0 + "," + 0 + ")")
                            sql.then((response) => {
                                count++;
                                if (count == value.length) {
                                    return res.status(200).send({ status_code: 200, message: response[0][0][0].MESSAGE_TEXT });
                                }
                                if (count == validArr.length) {
                                    res.status(201).send({ status_code: 201, message: 'File Imported successfully without some value.' });
                                }
                            }).catch((err) => {
                                console.log(err, "ERROR")
                                res.send({ status_code: err.errno, message: err.sqlMessage });
                            });
                        }
                    }
                    if (invalidArr.length == value.length) {
                        res.status(401).send({ error: 'Unauthorized', message: 'Call Rates Creation error', value: invalidArr });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corrupted excel file" });
            }
        } else if (data.type == 'OBD') {
            console.log("data.obdData Above", data.obdData);
            // return;            
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {
                    if (result.length < 1) {
                        return res.json({ error_code: 404, err_desc: "Empty excel file" });
                    }
                    else {
                        let arr = [];
                        for (let i = 0; i < result.length; i++) {
                            arr.push(result[i].number);
                        }
                        let arr2 = arr.filter((item,
                            index) => arr.indexOf(item) === index);


                        let validArr = []; let invalidArr = [];
                        for (let i = 0; i < arr2.length; i++) {
                            let checkNumber = validatieNumbertt(arr2[i]);
                            if (checkNumber) {
                                validArr.push({ contact: arr2[i] })
                            } else {
                                invalidArr.push(arr2[i]);
                            }
                        }
                        // for (let i = 0; i < arr2.length; i++) {
                        //     if (arr2[i].length == 1) {
                        //         validArr.push(arr2[i]);
                        //     } else {
                        //         invalidArr.push(arr2[i]);
                        //     }
                        // }
                        if (invalidArr.length) {
                            return res.json({ err_code: 404, err_desc: "Corupted excel file" });
                        } else {

                            if (!data.flag) {
                                console.log("data.obdData", data.obdData);
                                let OBD_data = data.obdData.split(',');
                                const sqll = knex.from(table.pbx_obd).select('name').where('name', 'Like', OBD_data[0]).andWhere('cust_id', '=', data.customer_id)
                                sqll.then(resp => {
                                    if (resp.length > 0) {
                                        res.status(412).send({ status_code: 412, error: 'Unauthorized', message: 'Duplicate Name' });
                                    } else {
                                        console.log(OBD_data[4], ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                                        OBD_data[6] = OBD_data[6] == 'true' ? '1' : '0';
                                        OBD_data[4] = OBD_data[4] == 'true' ? '1' : '0';
                                        OBD_data[5] = OBD_data[5] == 'true' ? '1' : '0';
                                        OBD_data[11] = OBD_data[11] == 'true' ? '1' : '0';
                                        OBD_data[7] = OBD_data[7] ? OBD_data[7] : '1';
                                        let call_connection_type = OBD_data[14] != '' && OBD_data[14] != undefined ? '2' : '1';
                                        let start_date = OBD_data[3];
                                        let obd_schedule_time = start_date ? moment(start_date).format('YYYY/MM/DD HH:mm:ss') : "";
                                        const sql = knex(table.pbx_obd).insert({
                                            name: "" + OBD_data[0] + "",
                                            prompt: "" + OBD_data[1] + "",
                                            is_scheduler_type: "" +
                                                OBD_data[2] != "" ? '1' : '0' + "",
                                            schedule_time: "" + obd_schedule_time + "",
                                            cust_id: "" + data.customer_id + "",
                                            dtmf: "" + OBD_data[6] + "",
                                            dtmf_selection: "" + OBD_data[7] + "",
                                            recording: "" + OBD_data[5] + "",
                                            is_sms: OBD_data[4] + "",
                                            ivr_value: "" + OBD_data[8] + "",
                                            is_whatsapp: "" + OBD_data[11] + "",
                                            whatsapp_template: "" + OBD_data[12] + "",
                                            call_connection_type: "" + call_connection_type + "",
                                            provider_id: call_connection_type == '2' ? "" + OBD_data[14] + "" : 0,
                                            sms_temp: OBD_data[15] + ""

                                        });
                                        // let input = {
                                        //     Name: OBD_data[0],
                                        //     "Prompt Name": OBD_data[16],
                                        //     "DID Caller ID": OBD_data[17],
                                        // };

                                        // if (OBD_data[8] == 2) {
                                        //     input['Select IVR'] = "1t";
                                        //     input['IVR Value'] = OBD_data[19];
                                        // } if (OBD_data[8] == 1) {
                                        //     input['Save DTMF'] = "1t";
                                        // } if (OBD_data[5] == 1) {
                                        //     input['SMS'] = "1t";
                                        // } if (OBD_data[7] == 1) {
                                        //     input['DTMF'] = "1t";
                                        // } if (OBD_data[2] == 1) {
                                        //     input["Systematically Scheduler"] = "1t";
                                        //     input["Schedule Time"] = obd_schedule_time
                                        // } if (OBD_data[2] == (0 || '')) {
                                        //     input['Manual Scheduler'] = "1t";
                                        // } if (OBD_data[6] == 1) {
                                        //     input['Recording'] = "1t";
                                        // }
                                        // if (OBD_data[12] == 1) {
                                        //     input['Whatsapp'] = "1t";
                                        //     input['Whatsapp Template'] = OBD_data[17];
                                        // }
                                        // if (OBD_data[15] != '' && OBD_data[15] != undefined) {
                                        //     input['API'] = "1t";
                                        //     input['API Intigration'] = OBD_data[20];
                                        // } else {
                                        //     input['Gateway'] = "1t";
                                        // }
                                        sql.then(response => {
                                            //   let sql2 = knex.from(table.pbx_obd_participants).select('contact').where('contact',arr2).andWhere('obd_id',response[0])
                                            // console.log(sql2.toQuery());
                                            // sql2.then(response2 =>{
                                            //     if(response2 > 0){
                                            //         return res.json({ err_code: 404 ,err_desc: "File Contains Duplicate Number" });
                                            // //     }else{
                                            // console.log("input > ", input, "response[0]", response);
                                            // createModuleLog(table.tbl_pbx_audit_logs, {
                                            //     module_action_id: response[0],
                                            //     module_action_name: OBD_data[0],
                                            //     module_name: "obd",
                                            //     message: "OBD Created",
                                            //     customer_id: data.customer_id,
                                            //     features: "" + JSON.stringify(input) + ""
                                            // })
                                            let obd_particaipant = [];
                                            arr2.map(number => {

                                                obd_particaipant.push({ contact: number, obd_id: response[0] })
                                            });
                                            const sql1 = knex(table.pbx_obd_participants).insert(obd_particaipant).then(responses => {
                                                res.send({
                                                    status_code: 200,
                                                    response
                                                })
                                            }).catch((err) => {
                                                res.send({ code: err.errno, message: err.sqlMessage });
                                            })
                                            //     }
                                            // }).catch((err) => {
                                            //     res.send({ code: err.errno, message: err.sqlMessage });
                                            // }) 
                                        }).catch((err) => {
                                            res.send({ code: err.errno, message: err.sqlMessage });
                                        })

                                    }
                                })
                            } else {
                                let sql2 = knex.from(table.pbx_obd_participants).select('contact').whereIn('contact', arr2).andWhere('obd_id', data.obdId)

                                sql2.then(response2 => {

                                    let duplicates = [];
                                    for (let i = 0; i < response2.length; i++) {
                                        duplicates.push(response2[i]['contact']);
                                    }

                                    if (response2.length > 0) {
                                        let newArr = arr2.filter(val => !duplicates.includes(val));
                                        let obd_particaipant = [];
                                        newArr.map(number => {
                                            obd_particaipant.push({ contact: number, obd_id: data.obdId })
                                        })
                                        const sql1 = knex(table.pbx_obd_participants).insert(obd_particaipant)

                                        sql1.then(responses => {
                                            res.json({
                                                status_code: 200,
                                                message: duplicates.length,
                                                responses
                                            })
                                        }).catch((err) => {
                                            res.send({ code: err.errno, message: err.sqlMessage });
                                        })
                                    } else {
                                        let obd_particaipant = [];
                                        arr2.map(number => {
                                            obd_particaipant.push({ contact: number, obd_id: data.obdId })
                                        });
                                        const sql1 = knex(table.pbx_obd_participants).insert(obd_particaipant)

                                        sql1.then(responses => {
                                            res.json({
                                                status_code: 200,
                                                responses
                                            })
                                        }).catch((err) => {
                                            res.send({ code: err.errno, message: err.sqlMessage });
                                        })
                                    }
                                }).catch((err) => {
                                    res.send({ code: err.errno, message: err.sqlMessage });
                                })
                            }
                        }
                    }
                })

            } catch (e) {
                console.log(e, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        } else if (data.type == 'outboundConference') {
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {
                    if (result.length < 1) {
                        return res.json({ error_code: 404, err_desc: "Empty excel file" });
                    } else {
                        let arr = [];
                        for (let i = 0; i < result.length; i++) {
                            arr.push(result[i].number);
                        }
                        let arr2 = arr.filter((item,
                            index) => arr.indexOf(item) === index);

                        let validArr = []; let invalidArr = [];
                        for (let i = 0; i < arr2.length; i++) {
                            let checkNumber = validatieNumbertt(arr2[i]);
                            if (checkNumber) {
                                validArr.push({ contact: arr2[i] })
                            } else {
                                invalidArr.push(arr2[i]);
                            }
                        }

                        //     let obd_particaipant = [];
                        //     let invalidArr = [];  
                        //     for (let i = 0; i < arr2.length; i++) {    
                        //         let checkNumber = validatieNumbertt(arr2[i].number);

                        //       if (checkNumber) {                            
                        //           obd_particaipant.push({ contact: arr2[i].number})
                        //       } else {
                        //           invalidArr.push(arr2[i]);
                        //       }
                        //   }   
                        if (invalidArr.length) {
                            console.log(invalidArr, "invalid array");
                            return res.json({ err_code: 404, err_desc: "Corupted excel file" });
                        }
                        else {

                            if (!data.flag) {
                                let Outbound_data = data.outboundData.split(',');
                                console.log("Outbound_data >>>>", Outbound_data);
                                const sqll = knex.from(table.tbl_pbx_outbound_conference).select('name').where('name', 'Like', Outbound_data[0]).andWhere('cust_id', '=', data.customer_id)
                                sqll.then(resp => {
                                    if (resp.length > 0) {
                                        res.status(412).send({ status_code: 412, error: 'Unauthorized', message: 'Duplicate Name' });
                                    } else {
                                        // Outbound_data[7] = Outbound_data[7] == 'true' ? '1' : '0';
                                        // Outbound_data[5] =  Outbound_data[5] == 'true' ? '1' : '0';
                                        // Outbound_data[6]= Outbound_data[6] == 'true' ? '1' : '0';
                                        // Outbound_data[12]= Outbound_data[12] == 'true' ? '1' : '0';
                                        let start_date = Outbound_data[6];
                                        let conf_schedule_time = start_date ? moment(start_date).format('YYYY/MM/DD HH:mm:ss') : "";
                                        const sql = knex(table.tbl_pbx_outbound_conference).insert({
                                            name: Outbound_data[0],
                                            welcome_propmt: Outbound_data[2] == '' ? '0' : Outbound_data[2],
                                            cust_id: data.customer_id,
                                            recording: Outbound_data[1] == 'true' ? '1' : '0',
                                            DID_caller_id: Outbound_data[4],
                                            is_scheduler_type: Outbound_data[3] == '' ? '0' : '1',
                                            conf_schedule_time: conf_schedule_time
                                        });
                                        let input = {
                                            Name: Outbound_data[0],
                                            "Prompt Name": Outbound_data[8],
                                            "DID Caller ID": Outbound_data[9],
                                        };
                                        if (Outbound_data[3] == 1) {
                                            input["Systematically Scheduler"] = "1t";
                                            input["Schedule Time"] = conf_schedule_time
                                        } if (Outbound_data[3] == (0 || '')) {
                                            input['Manual Scheduler'] = "1t";
                                        } if (Outbound_data[1] == 1) {
                                            input['Recording'] = "1t";
                                        }

                                        sql.then(response => {
                                            //   let sql2 = knex.from(table.pbx_obd_participants).select('contact').where('contact',arr2).andWhere('obd_id',response[0])
                                            // console.log(sql2.toQuery());
                                            // sql2.then(response2 =>{
                                            //     if(response2 > 0){
                                            //         return res.json({ err_code: 404 ,err_desc: "File Contains Duplicate Number" });
                                            //     }else{
                                            createModuleLog(table.tbl_pbx_audit_logs, {
                                                module_action_id: response[0],
                                                module_action_name: Outbound_data[0],
                                                module_name: "obd",
                                                message: "Outbound Conference Created",
                                                customer_id: data.customer_id,
                                                features: "" + JSON.stringify(input) + ""
                                            })
                                            let outbound_particaipant = [];
                                            arr2.map(number => {
                                                outbound_particaipant.push({ contact: number, conf_id: response[0] })
                                            });
                                            const sql1 = knex(table.tbl_pbx_outbound_conference_participant).insert(outbound_particaipant)
                                            sql1.then(responses => {

                                                res.send({
                                                    status_code: 200,
                                                    response
                                                })
                                            }).catch((err) => {
                                                res.send({ code: err.errno, message: err.sqlMessage });
                                            })
                                            //     }
                                            // }).catch((err) => {
                                            //     res.send({ code: err.errno, message: err.sqlMessage });
                                            // }) 
                                        }).catch((err) => {
                                            res.send({ code: err.errno, message: err.sqlMessage });
                                        })

                                    }
                                })
                            } else {

                                let sql2 = knex.from(table.tbl_pbx_outbound_conference_participant).select('contact').whereIn('contact', arr2).andWhere('conf_id', data.outboundData)

                                sql2.then(response2 => {
                                    console.log(arr2, "mainarray");
                                    let duplicates = [];
                                    for (let i = 0; i < response2.length; i++) {
                                        duplicates.push(response2[i]['contact']);
                                    }
                                    console.log(duplicates, "duplicates array")
                                    if (response2.length > 0) {
                                        let newArr = arr2.filter(val => !duplicates.includes(val));
                                        let outbound_particaipant = [];
                                        newArr.map(number => {
                                            outbound_particaipant.push({ contact: number, conf_id: data.outboundData })
                                        })
                                        const sql1 = knex(table.tbl_pbx_outbound_conference_participant).insert(outbound_particaipant)

                                        sql1.then(responses => {
                                            res.json({
                                                status_code: 200,
                                                message: duplicates.length,
                                                responses
                                            })
                                        }).catch((err) => {
                                            res.send({ code: err.errno, message: err.sqlMessage });
                                        })
                                    } else {
                                        let outbound_particaipant = [];
                                        arr2.map(number => {
                                            outbound_particaipant.push({ contact: number, conf_id: data.outboundData })
                                        });
                                        const sql1 = knex(table.tbl_pbx_outbound_conference_participant).insert(outbound_particaipant)

                                        sql1.then(responses => {
                                            res.json({
                                                status_code: 200,
                                                responses
                                            })
                                        }).catch((err) => {
                                            res.send({ code: err.errno, message: err.sqlMessage });
                                        })
                                    }
                                }).catch((err) => {
                                    res.send({ code: err.errno, message: err.sqlMessage });
                                })
                            }
                        }

                    }





                    //   if(!invalidArr.length){
                    //     let Outbound_data = data.outboundData.split(',');
                    //     const sql11 = knex.from(table.tbl_pbx_outbound_conference).select('name').where('name', 'like', Outbound_data[0]).andWhere('cust_id', '=', data.customer_id)
                    //     sql11.then(resp => {
                    //         if (resp.length > 0) {
                    //             res.status(412).send({ status_code: 412, error: 'Unauthorized', message: 'Duplicate Name' });
                    //         } else {
                    //             let start_date = Outbound_data[6];
                    //             let conf_schedule_time = start_date ? moment(start_date).format('YYYY-MM-DD HH:mm:ss') : "";
                    //             const sql = knex(table.tbl_pbx_outbound_conference).insert({ name: Outbound_data[0], welcome_propmt: Outbound_data[2] == '' ? '0' : Outbound_data[2], cust_id: data.customer_id, recording: Outbound_data[1] == 'true' ? '1' : '0', DID_caller_id: Outbound_data[4], is_scheduler_type: Outbound_data[3] == '' ? '0' : '1', conf_schedule_time: conf_schedule_time });
                    //             sql.then(response => {     
                    //                 obd_particaipant.map(item => {
                    //                     Object.assign(item,{conf_id: response[0]});
                    //                 })                                                                                                                                                 
                    //             const sql1 = knex(table.tbl_pbx_outbound_conference_participant).insert(obd_particaipant).then(responses => {
                    //                 res.send({
                    //                     status_code: 200,
                    //                     response
                    //                 })
                    //             }).catch((err) => {
                    //                 res.send({ code: err.errno, message: err.sqlMessage });
                    //             })
                    //         }).catch((err) => {
                    //             res.send({ code: err.errno, message: err.sqlMessage });
                    //         })
                    //     }
                    // })
                    //   }else{
                    //     res.json({ status_code: 401, response: "Invalid Length Of Contact."})
                    //   }                                        
                })
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        } else if (data.type == 'extension') {
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {
                    if (result.length < 1) {
                        return res.json({ error_code: 404, err_desc: "Empty excel file" });
                    }
                    let validArr = []; let invalidArr = [];
                    let customer_id = data['customer_id'];
                    let cust_detail = await getCustomerDetail(customer_id);
                    knex.from(table.tbl_Extension_master).select('id').where('customer_id', customer_id)
                        .then(async (respon) => {
                            if (respon.length > 0) {
                                let extLength = cust_detail[0]['extension_limit'] - respon.length
                                if (extLength < result.length) {
                                    return res.json({ status_code: 490, err_desc: "Extension Limit Exceed", limit: cust_detail[0]['extension_limit'] });
                                } else {
                                    for (let i = 0; i < result.length; i++) {
                                        let makeExtNumber = result[i]['extension number'].substring(0, cust_detail[0]['extension_length_limit']);

                                        let ext_number = result[i]['extension number'] != '' ? await verifyExtension(customer_id + makeExtNumber, customer_id) : false;
                                        let email = result[i].email != '' ? validateEmailAddress(result[i].email) : false;
                                        let duplicate_email = email == true ? await verifyEmail(result[i]['email']) : false;
                                        let web_pass = result[i]['web password'] != "" ? validateWebPassword(result[i]['web password']) : false;
                                        let sip_pass = result[i]['sip password'] != "" ? sipPassword(result[i]['sip password']) : false;
                                        result[i]['dial_prefix'] = cust_detail != false ? cust_detail[0]['country_code'] : 0;
                                        result[i]['package_id'] = cust_detail != false ? cust_detail[0]['package_id'] : 0;
                                        result[i]['intercom_calling'] = cust_detail != false ? cust_detail[0]['intercom_calling'] : 0;
                                        console.log(ext_number, email, duplicate_email, web_pass, sip_pass, cust_detail != false);
                                        if (ext_number && email && duplicate_email && web_pass && sip_pass && cust_detail != false) {
                                            validArr.push({ ext_number: (customer_id + makeExtNumber), username: result[i]['extension name'], email: result[i]['email'], caller_id_name: result[i]['caller id'], sip_password: result[i]['sip password'], password: result[i]['web password'], speed_dial: result[i]['speed dial'] == 0 && cust_detail[0]['speed_dial'] == 0 ? '0' : '1', recording: result[i]['recording'] == 0 && cust_detail[0]['recording'] == 0 ? '0' : '1', voicemail: result[i]['voicemail'] == 0 ? 0 : 1, multiple_registration: result[i]['multiple registration'] == 0 ? '0' : '1', dial_time_out: result[i]['dial timeout'], ring_time_out: result[i]['ring timeout'], package_id: result[i]['package_id'], dial_prefix: result[i]['dial_prefix'], dtmf_type: '0', caller_id_header_type: '0', caller_id_header_value: 0, intercom_calling: result[i]['intercom_calling'], customer_id: customer_id, vm_password: '12345678', dnd: result[i]['dnd'] == 0 ? 0 : 1 });
                                        } else {
                                            invalidArr.push(result[i]);
                                        }
                                    }
                                    if (validArr.length) {
                                        knex(table.tbl_Extension_master).insert(validArr).then((response) => {
                                            if (response.length) {
                                                res.json({
                                                    status_code: 200,
                                                    response
                                                })
                                            }
                                        }).catch((err) => { { console.log(err); throw err } });
                                    }
                                    if (invalidArr.length == result.length) {
                                        res.status(401).send({ status_code: 401, error: 'Unauthorized', message: 'Extension Creation error', value: invalidArr });
                                    }
                                }
                            } else if (result.length > cust_detail[0]['extension_limit']) {

                                res.json({
                                    status_code: 490,
                                    limit: cust_detail[0]['extension_limit']
                                })
                            } else {

                                for (let i = 0; i < result.length; i++) {
                                    let makeExtNumber = result[i]['extension number'].substring(0, cust_detail[0]['extension_length_limit']);
                                    console.log(makeExtNumber, "makeExtNumber");
                                    let ext_number = result[i]['extension number'] != '' ? await verifyExtension(customer_id + makeExtNumber, customer_id) : false;
                                    let email = result[i].email != '' ? validateEmailAddress(result[i].email) : false;
                                    let duplicate_email = email == true ? await verifyEmail(result[i]['email']) : false;
                                    let web_pass = result[i]['web password'] != "" ? validateWebPassword(result[i]['web password']) : false;
                                    let sip_pass = result[i]['sip password'] != "" ? sipPassword(result[i]['sip password']) : false;
                                    result[i]['dial_prefix'] = cust_detail != false ? cust_detail[0]['country_code'] : 0;
                                    result[i]['package_id'] = cust_detail != false ? cust_detail[0]['package_id'] : 0;
                                    result[i]['intercom_calling'] = cust_detail != false ? cust_detail[0]['intercom_calling'] : 0;
                                    console.log(ext_number, email, duplicate_email, web_pass, sip_pass, cust_detail != false);
                                    if (ext_number && email && duplicate_email && web_pass && sip_pass && cust_detail != false) {
                                        validArr.push({ ext_number: (customer_id + makeExtNumber), username: result[i]['extension name'], email: result[i]['email'], caller_id_name: result[i]['caller id'], sip_password: result[i]['sip password'], password: result[i]['web password'], speed_dial: result[i]['speed dial'] == 0 && cust_detail[0]['speed_dial'] == 0 ? '0' : '1', recording: result[i]['recording'] == 0 && cust_detail[0]['recording'] == 0 ? '0' : '1', voicemail: result[i]['voicemail'] == 0 ? 0 : 1, multiple_registration: result[i]['multiple registration'] == 0 ? '0' : '1', dial_time_out: result[i]['dial timeout'], ring_time_out: result[i]['ring timeout'], package_id: result[i]['package_id'], dial_prefix: result[i]['dial_prefix'], dtmf_type: '0', caller_id_header_type: '0', caller_id_header_value: 0, intercom_calling: result[i]['intercom_calling'], customer_id: customer_id, vm_password: '12345678', dnd: result[i]['dnd'] == 0 ? 0 : 1 });
                                    } else {
                                        invalidArr.push(result[i]);
                                    }
                                }
                                if (validArr.length) {
                                    knex(table.tbl_Extension_master).insert(validArr).then((response) => {
                                        if (response.length) {
                                            res.json({
                                                status_code: 200,
                                                response
                                            })
                                        }
                                    }).catch((err) => { { console.log(err); throw err } });
                                }
                                if (invalidArr.length == result.length) {
                                    res.status(401).send({ status_code: 401, error: 'Unauthorized', message: 'Extension Creation error', value: invalidArr });
                                }
                            }
                        })
                })
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        }
    });
});

function validateEmailAddress(email) {
    var expression = /^(("[\w-\s]+")|([a-zA-Z0-9]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[a-zA-Z0-9-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/;
    if (expression.test(String(email).toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

function validateMobile(mobilenumber) {
    var regmm = /^([1-9][0-9]{9})*$/;
    var regmob = new RegExp(regmm);
    if (regmob.test(mobilenumber)) {
        return true;
    } else {
        return false;
    }
}
function validatieNumbertt(number) {
    // var regmm = /^\d+$/;    
    var regmm = /^(?!0{2})((\+)[1-9][0-9]|[1-9][0-9]|0[1-9])[0-9]{6,13}$/;
    if (regmm.test(number)) {
        return true;
    } else {
        return false;
    }
}

function validateCountryCode(code) {
    var regmm = /^[1-9][\d]{0,4}$/;
    var regmob = new RegExp(regmm);
    if (regmob.test(code)) {
        return true;
    } else {
        return false;
    }
}

function validateSellingDur(code) {
    var regmm = /^[0-9][\d]{0,1}$/;
    var regmob = new RegExp(regmm);
    if (regmob.test(code)) {
        return true;
    } else {
        return false;
    }
}

function validateSellingBill(code) {
    var regmm = /^[1-9][\d]{0,2}$/;
    var regmob = new RegExp(regmm);
    if (regmob.test(code)) {
        return true;
    } else {
        return false;
    }
}

function validateDIDNumber(number) {
    if (number.length >= 5) {
        return true;
    } else {
        return false;
    }
}

function validateBillingType(type) {
    if (type == 1 || type == 2 || type == 3 || type == 4) { // 1 = fixed per month + dialroute, 2 = fixed per month,  3 = dialroute, 4 = free
        return true;
    } else {
        return false;
    }
}

function validateDIDgroup(type) {
    if (type == 0 || type == 1 || type == 2 || type == 3) { // 0 = general, 1 = premium , 2 = private , 3 = VMN
        return true;
    } else {
        return false;
    }
}

function validatemaxConcurrentCall(data) {
    if (data >= 0) {
        return true;
    } else {
        return false;
    }
}

async function validateProvider(name) {
    var providerId = "";
    var returnResponse = false;
    await knex.from(table.tbl_Provider).where('provider', "" + name + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                providerId = providerData['id'];
                if (providerId == '' || providerId == undefined || providerId == null) {
                    return returnResponse = false;
                } else {
                    return returnResponse = true;
                    // return true;
                }
            } else {

            }
        }).catch((err) => { console.log(err); throw err });
    return returnResponse;
}

async function getProviderId(name) {
    var providerId = "";
    await knex.from(table.tbl_Provider).where('provider', "" + name + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                providerId = providerData['id'];
                if (providerId == '' || providerId == undefined || providerId == null) {
                    return providerId;
                }
            } else {

            }
        }).catch((err) => { console.log(err); throw err });
    return providerId;
}

async function validateCountry(name) {
    var countryId = "";
    var returnResponse = false;
    await knex.from(table.tbl_Country).where('name', "" + name + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                countryId = providerData['id'];
                if (countryId == '' || countryId == undefined || countryId == null) {
                    return returnResponse = false;
                } else {
                    return returnResponse = true;
                    // return true;
                }
            } else {

            }
        }).catch((err) => { console.log(err); throw err });
    return returnResponse;
}

async function getCountryId(name) {
    var countryId = "";
    await knex.from(table.tbl_Country).where('name', "" + name + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                countryId = providerData['id'];
                if (countryId == '' || countryId == undefined || countryId == null) {
                    return countryId;
                }
            } else {
                return null;
            }
        }).catch((err) => { console.log(err); throw err });
    return countryId;
}

async function validateCallPlan(call_plan) {
    var callPlanId = "";
    var returnResponse = false;
    await knex.from(table.tbl_Call_Plan)
        .where('name', '=', "" + call_plan + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const countryData = response[0];
                callPlanId = countryData['id'];
                if (callPlanId == '' || callPlanId == undefined || callPlanId == null) {
                    return returnResponse = false;
                } else {
                    return returnResponse = true;
                }
            } else {

            }
        }).catch((err) => { console.log(err); throw err });
    return returnResponse;
}

async function getCountryIdUsingdialPrefix(dp) {
    var countryId = "";
    await knex.from(table.tbl_Country).where('phonecode', "" + dp + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                countryId = providerData['id'];
                if (countryId == '' || countryId == undefined || countryId == null) {
                    return countryId = false;
                }
            } else {
                return null;
            }
        }).catch((err) => { console.log(err); throw err });
    return countryId;
}

async function checkDuplicateCallRates(dial_prefix, area_code, gateway, call_plan) {
    console.log((knex.from(table.tbl_Call_Plan_Rate)
        .select('id')
        .where('dial_prefix', "" + '+' + dial_prefix + area_code + "")
        .andWhere('status', '=', '1')
        .andWhere('gateway_id', '=', gateway)
        .andWhere('call_plan_id', '=', call_plan)
        .whereNot('id', null)).toQuery())
    return knex.from(table.tbl_Call_Plan_Rate)
        .select('id')
        .where('dial_prefix', "" + '+' + dial_prefix + area_code + "")
        .andWhere('status', '=', '1')
        .andWhere('gateway_id', '=', gateway)
        .andWhere('call_plan_id', '=', call_plan)
        .whereNot('id', null)
        .then((response) => {
            if (response.length) {
                return false;
            } else {
                return true;
            }
        })
}

async function getGroupId(gname) {
    var gId = "";
    // var returnResponse = false;
    await knex.from(table.tbl_pbx_call_rate_group)
        .where('name', '=', "" + gname + "")
        .select('id')
        .then((response) => {

            if (response.length === 1) {
                const groupData = response[0];
                gId = groupData['id'];
                if (gId == '' || gId == undefined || gId == null) {
                    return gId = false;
                }
            } else {
                gId = false;
            }
        }).catch((err) => { console.log(err); throw err });
    return gId;
}

function validatieNumber(number) {
    var regmm = /^\d+$/;
    if (regmm.test(number)) {
        return true;
    } else {
        return false;
    }
}

async function verifyExtension(ext_number, customer_id) {
    const response = await knex.from(table.tbl_Extension_master).where('customer_id', "" + customer_id + "").andWhere('ext_number', "" + ext_number + "")
        .select('id', 'ext_number');
    if (response.length >= 1) {
        return false;
    } else {
        return true;
    }
}

async function verifyEmail(email) {
    const response = await knex.from(table.tbl_Extension_master).where('email', "" + email + "")
        .select('id');
    if (response.length > 0) {
        return false;
    } else {
        return true;
    }
}

function sipPassword(sip_pass) {
    const passwordRegex = /^(?=.*[0-9a-zA-Z]).{6,}$/;
    return passwordRegex.test(sip_pass);
}

function validateWebPassword(password) {
    // Regular expression for password validation
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    // Test the password against the regex
    return passwordRegex.test(password);
}

async function getCustomerDetail(customer) {
    const response = await knex.select('mcp.package_id', 'pf.recording', 'pf.voicemail', 'pf.speed_dial', 'cust.extension_length_limit', 'pf.extension_limit')
        .from(table.tbl_Map_customer_package + ' as mcp')
        .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
        .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id', 'mcp.customer_id')
        .where('mcp.customer_id', '=', "" + customer + "").andWhere('mcp.product_id', '=', "1");
    if (response.length > 0) {
        return response;
    } else {
        return false;
    }
}



module.exports = importExcel;
