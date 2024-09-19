var express = require('express');
const cronTest = express();
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const cron = require("node-cron");
const config = require('../config/app');
const pushEmail = require('./pushEmail');
const ejs = require('ejs');
const path = require('path');
const pdf = require('html-pdf');
const moment = require('moment');
const {infoLog} = require('../loggersFile/logger');
var debug = require('debug');

// ------------------------------------------------  THIRD CRON JOB IS USE FOR RESET BOOSTER PLAN ---------------------------------------------------------------------------------------
// ------------------------------------------------  First CRON JOB IS USE FOR all_service_charges(did, minute plan, pstn call charge, sms) PLAN -------------------------------------------
// ------------------------------------------------  SECOND CRON JOB IS USE FOR CONVERT INVOICE ITEM INTO SINGLE ENTRY THEN FIRED AN INVOICE MAIL TO USER -----------------------------------



cron.schedule("0 13 * * *", function () {  //for every day at 1:00 AM   */25 * * * * * 0 01 * * *
// cron.schedule("* * * * *", function () {

    var now = new Date();
    var n = now.getMonth() - 1;
    var currentDate = now.getDate();
    var months = ['December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var invoice_month = months[++n];
    var current_total_balance = 0;
    if (currentDate == 1) { // First date of month like : 1 sep/ 1 oct        
        knex.from(table.tbl_Customer)
            .select('id', 'email', 'company_name', 'invoice_day', 'balance', 'billing_type')
            .whereIn('role_id', ['1'])
            .andWhere('status', '=', '1')
            .then((response) => {
                for (let i = 0; i < response.length; i++) {
                    current_total_balance = response[i].balance;
                    generate_all_service_charges(response[i].id, response[i].balance, response[i].billing_type);
                }
            });

        const generate_all_service_charges = async (customer_id, current_balance, billing_type) => {
            var now = new Date();
            var currentDay = parseInt(now.getDate());
            var currentMonth = parseInt(now.getMonth() + 1);
            var currentYear = parseInt(now.getFullYear());
            var previousMonth = parseInt(now.getMonth());
            var current_total_balance = current_balance;

            // --------------------------------- SMS PLAN MODULE FOR CHARGE TABLE --------------------------------------------
            await knex.select('sms.charge as sms_charge', 'sms.name as sms_name', 'sms.validity as sms_validity', 'c.*', knex.raw('DATE_FORMAT(mcp.sms_active_at, "%m") as sms_activate_month'),
                knex.raw('DATE_FORMAT(mcp.sms_active_at, "%y") as sms_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,mcp.sms_active_at,NOW()) as expiry_date'))
                .from(table.tbl_Customer + ' as c')
                .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
                .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
                .leftJoin(table.tbl_pbx_SMS + ' as sms', 'sms.id', 'pf.sms_id')
                .where('c.id', '=', customer_id)
                .then((response) => {
                    let data = response[0] ? response[0] : '';
                    let sms_charge = data ? data.sms_charge : '';
                    let sms_name = data ? data.sms_name : '';
                    let sms_validity = data ? data.sms_validity : '';
                    //  let sms_active_date = data ? data.sms_active_at : new Date();
                    let sms_activate_month = data ? parseInt(data.sms_activate_month) : 0;
                    let sms_activate_year = data ? parseInt(data.sms_activate_year) : 0;
                    let sms_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (data['billing_type'] == '2') // check customer billing type Postpaid
                    {
                        if (sms_validity == '1' && sms_expiry) { // Monthly Validity
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: sms_charge,
                                charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                let current_time = new Date();
                                current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                let sql = knex(table.tbl_Map_customer_package).update({
                                    sms_active_at: "" + current_time + ""
                                }).where('customer_id', '=', "" + customer_id + "")
                                sql.then((response) => {
                                    ('customer is postpaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=' + sms_charge);
                                }).catch((err) => { (err) });
                            }).catch((err) => { (err) });
                        } else if (sms_validity == '2' && currentYear > sms_activate_year && currentMonth > sms_activate_month) {// Yearly Validity
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: sms_charge,
                                charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                let current_time = new Date();
                                current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                let sql = knex(table.tbl_Map_customer_package).update({
                                    sms_active_at: "" + current_time + ""
                                }).where('customer_id', '=', "" + customer_id + "")
                                sql.then((response) => {
                                    ('customer is postpaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=' + sms_charge);
                                }).catch((err) => { (err) });
                            }).catch((err) => { (err) });
                        } else {
                            ('sms have invalid validity type...it should be either monthly and yearly')
                        }
                    } else { // check customer billing type Prepaid billing_type = 1
                        let isCheckCustomerBalance = data ? data['balance'] : 0;
                        if (isCheckCustomerBalance && isCheckCustomerBalance > sms_charge) {  // customer have sufficient balance for next sms invoice
                            if (sms_validity == '1' && sms_expiry) { // Monthly Validity
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: sms_charge,
                                    charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    let current_time = new Date();
                                    current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                    let sql = knex(table.tbl_Map_customer_package).update({
                                        sms_active_at: "" + current_time + ""
                                    }).where('customer_id', '=', "" + customer_id + "")
                                    sql.then((response) => {
                                        update_user_current_balance('Charge for SMS', Number(sms_charge), customer_id);
                                        ('customer is prepaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=', sms_charge);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            } else if (sms_validity == '2' && currentYear > sms_activate_year && currentMonth > sms_activate_month) {// Yearly Validity
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: sms_charge,
                                    charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    let current_time = new Date();
                                    current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                    let sql = knex(table.tbl_Map_customer_package).update({
                                        sms_active_at: "" + current_time + ""
                                    }).where('customer_id', '=', "" + customer_id + "")
                                    sql.then((response) => {
                                        update_user_current_balance('Charge for SMS', Number(sms_charge), customer_id);
                                        ('customer is prepaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=', sms_charge);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            } else {
                                ('sms have invalid validity type with prepaid...it should be either monthly and yearly')
                            }
                        } else {  // customer have not sufficient balance for renew sms plan
                            let sql = knex(table.tbl_pbx_sms_api).update({
                                status: "0"
                            }).where('customer_id', '=', "" + customer_id + "")
                            sql.then((response) => {
                                ('customer is prepaid type but have not not sufficient balance for renew sms plan thats why i updated status = 0 in pbx_sms_api', response);
                                // ALSO NEED TO FIRE A EMAIL NOTIFICATION FOR THIS PLAN THAT THIS PLAN HAS BEEN STOP....SMTHN SMTHNG
                            }).catch((err) => { (err) });
                        }
                    }
                }).catch((err) => { (err) });

            // ------------------------- CALL CHARGES OF PSTN FOR SINGLE ENTRY IN CHARGE TABLE -------------------------------------
            await knex.from(table.tbl_Customer)
                .select('balance', knex.raw('MONTH(CURRENT_DATE()- INTERVAL 1 MONTH) as month'))
                .where('id', '=', customer_id)
                .then((result) => {
                    if (result[0]['balance'] < 0) {
                        cdr_amount = parseFloat(result[0]['balance']).toFixed(2);
                        knex(table.tbl_Charge).insert({
                            did_id: '', customer_id: customer_id, amount: cdr_amount,
                            charge_type: "2", description: 'Charge for Calls (PSTN) :- Month = ' + result[0]['month'], charge_status: 1,
                            invoice_status: 0, product_id: 1
                        }).then((resp) => {
                            ('CALL CHARGES OF PSTN for -Neg Balance type');
                            knex.from(table.tbl_Customer)
                                .where('id', '=', customer_id)
                                .update({ balance: 0 })
                                .then((resp) => {
                                    ('Set balance zero 0 in customer table');
                                }).catch((err) => { (err) });
                        }).catch((err) => { (err) });
                    }
                }).catch((err) => { (err) });

            // ------------------------------- MINUTE PLAN (BP, RP, TC) IN CHARGE TABLE -------------------------------
            await knex.select('pf.*', 'c.billing_type')
                .from(table.tbl_Customer + ' as c')
                .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
                .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
                .where('c.id', '=', customer_id)
                .then((response) => {
                    infoLog(response[0]);
                    let data = response[0] ? response[0] : '';
                    let isBundlePlan = data ? parseInt(data['is_bundle_type']) : 0;
                    let bundlePlanId = data ? data['bundle_plan_id'] : 0;
                    let isRoamingPlan = data ? parseInt(data['is_roaming_type']) : 0;
                    let roamingPlanId = data ? data['roaming_plan_id'] : 0;
                    let isTeleconsultPlan = data ? parseInt(data['teleconsultation']) : 0;
                    let teleconsultPlandId = data ? data['teleConsultancy_call_plan_id'] : 0;
                    let isOutBundlePlan = data ? parseInt(data['out_bundle_type']) : 0;
                    let outBundlePlanId = data ? data['out_bundle_call_plan_id'] : 0;
                    let customerBillingType = data ? data['billing_type'] : '1';

                    const planFunctions = {
                        "1111": manage_all_four_minute_plan,
                        "1110": manage_all_three_minute_plan,
                        "1101": manage_all_three_minute_plan,
                        "1011": manage_all_three_minute_plan,
                        "1000": manage_bungle_plan,
                        "0100": manage_outBundle_plan,
                        "0010": manage_roaming_plan,
                        "0001": manage_tc_plan,
                        "0111": manage_all_three_minute_plan,
                        "1010": manage_bundle_plan_and_roaming_plan,
                        "1001": manage_tc_plan_and_bundle_plan,
                        "0101": manage_outBundle_and_tc_plan,
                        "0011": manage_tc_plan_and_roaming_plan,
                        "1100": manage_bundle_and_outBundle_plan,
                        "0110": manage_outBundle_and_roaming_plan
                    };
                    let key = `${isBundlePlan}${isOutBundlePlan}${isRoamingPlan}${isTeleconsultPlan}`
                    const selectedFunction = planFunctions[key];
                    if (selectedFunction) {
                        selectedFunction(bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, customerBillingType, isBundlePlan, isRoamingPlan, isTeleconsultPlan, isOutBundlePlan)
                    }
                }).catch((err) => { (err) });

            //---------------------------------- DID IN CHARGE TABLE ----------------------------------------------
            await knex.from(table.tbl_DID)
                .select('id', 'fixrate', 'did')
                .where('customer_id', '=', customer_id).then((response) => {
                    const productId = response['product_id'] ? response['product_id'] : 0;
                    for (let j = 0; j < response.length; j++) {
                        knex.from(table.tbl_Uses).where('did_id', "" + response[j].id + "")
                            .select(knex.raw('DATE_FORMAT(`reservation_date`, "%m") as month'), 'id')
                            .andWhere('customer_id', "" + customer_id + "")
                            .first()
                            .orderBy('id', 'desc').then((resp) => {
                                var did_amount = 0;
                                reservation_month = resp ? parseInt(resp.month) : 0;
                                if (billing_type == '1') { // check customer billing type Prepaid
                                    if (current_total_balance > response[j].fixrate) {  // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        if (response[j].fixrate > 0) {
                                            knex(table.tbl_Charge).insert({
                                                did_id: response[j].id, customer_id: customer_id, amount: response[j].fixrate,
                                                charge_type: "1", description: 'Charge for DID - ' + response[j].did, charge_status: 0,
                                                invoice_status: 0, product_id: 1
                                            }).then((resp) => {
                                                (resp);
                                            }).catch((err) => { (err) });
                                        }
                                        update_user_current_balance('Charge for DID for update current balance', response[j].fixrate, customer_id);
                                    } else { // IF USER HAVE not SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_DID).update({
                                            activated: 0
                                        }).where('id', '=', "" + response[j].id + "")
                                        sql.then((response2) => {
                                            ('chages the status of did 1 to 0');
                                            // Fired the email Notification
                                        }).catch((err) => { (err) });
                                    }
                                } else { //check customer billing type Postpaid
                                    if (response[j].fixrate > 0) {
                                        knex(table.tbl_Charge).insert({
                                            did_id: response[j].id, customer_id: customer_id, amount: response[j].fixrate,
                                            charge_type: "1", description: 'Charge for DID - ' + response[j].did, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            (resp);
                                        }).catch((err) => { (err) });
                                    }
                                }
                            }).catch((err) => { (err) });
                    }
                });

            // ----------------------------- Add Charges For Feature Rate Plan in Charge table -----------------------------//         
            await knex.select('f.feature_rate_id')
                .from(table.tbl_Customer + ' as c')
                .join(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
                .join(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                .join(table.tbl_PBX_features + ' as f', 'f.id', 'p.feature_id')
                .where('c.id', customer_id)
                .then(async (response) => {
                    let total_balance = 0;
                    if (response.length && response[0]['feature_rate_id']) {
                        const featureRateId = response[0]['feature_rate_id'];

                        const responses = await knex.select('gfm.feature_plan_id', 'gfm.amount', 'gfr.feature_name', 'gfm.unit_Type', 'gfr.id')
                            .from(table.tbl_pbx_feature_plan + ' as fp')
                            .join(table.tbl_pbx_global_feature_mapping + ' as gfm', 'fp.id', 'gfm.feature_plan_id')
                            .join(table.tbl_Pbx_global_feature_rate + ' as gfr', 'gfr.id', 'gfm.global_feature_id')
                            .where('fp.id', featureRateId);
                        for (let i = 0; i < responses.length; i++) {
                            const feature = responses[i];
                            if (feature.id == 7) {
                                if (feature.unit_Type == 1) {
                                    const extension = await knex(table.tbl_Extension_master).select('ext_number').where('customer_id', customer_id);
                                    if (extension.length) {
                                        for (const item of extension) {
                                            await knex(table.tbl_Charge).insert({
                                                customer_id: customer_id,
                                                amount: feature.amount,
                                                charge_type: "8",
                                                description: `SIP Charge for - ${item.ext_number}`,
                                                charge_status: billing_type == '2' ? 0 : 1,
                                                invoice_status: billing_type == '2' ? 0 : 1,
                                                product_id: 1
                                            });
                                        }
                                        total_balance = total_balance + Number(extension.length * feature.amount);
                                    }
                                } else {
                                    const description = 'Charge for - Monthly Extension';
                                    await knex(table.tbl_Charge).insert({
                                        customer_id: customer_id,
                                        amount: feature.amount,
                                        charge_type: "9",
                                        description: description,
                                        charge_status: billing_type == '2' ? 0 : 1,
                                        invoice_status: billing_type == '2' ? 0 : 1,
                                        product_id: 1
                                    });
                                    total_balance = total_balance + Number(feature.amount);
                                }
                            } else {
                                const description = `Charge for - ${feature.feature_name}`;
                                await knex(table.tbl_Charge).insert({
                                    customer_id: customer_id,
                                    amount: feature.amount,
                                    charge_type: "9",
                                    description: description,
                                    charge_status: billing_type == '2' ? 0 : 1,
                                    invoice_status: billing_type == '2' ? 0 : 1,
                                    product_id: 1
                                });
                                total_balance = total_balance + Number(feature.amount);
                            }
                        }
                    }
                    if (billing_type != 2) {
                        await update_user_current_balance('', Number(total_balance), customer_id);
                    }
                });
        }

        const manage_all_three_minute_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType, isBundlePlan, isRoamingPlan, isTeleconsultPlan, isOutBundlePlan) => {
            console.log(isBundlePlan, "isBundlePlan", isRoamingPlan, "isRoamingPlan", isTeleconsultPlan, "isTc", isOutBundlePlan, "isOutbound", customer_id)
            
            if (isBundlePlan == 1) {
                infoLog(isBundlePlan)
                console.log(isBundlePlan, "isBUndlePlan")
                await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                    knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                    .from(table.tbl_Call_Plan + ' as cp')
                    .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                    .where('cp.id', bundlePlanId)
                    .limit(1)
                    .orderBy('cp.id', 'desc')
                    .then((response) => {  // For Budle plan    
                        infoLog(response)
                        if (response[0]) {
                            let data = response[0];
                            let bundleCharge = Number(response[0]['charge']);
                            let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                            let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                            extra_fee_charge_type_list.forEach((element1, i) => {
                                extra_fee_charge_list.forEach((element2, j) => {
                                    if (i === j && (element1 === '1' || element1 === '2')) {
                                        bundleCharge = Number(bundleCharge) + Number(element2)
                                    }
                                });
                            });
                            console.log(`bundle_charge => ${bundleCharge}`);
                            let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                            let minutePlanBundleName = response[0]['name'];
                            let bundlePlanValidity = response[0]['validity'];
                            let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                            let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                            let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                            let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                            let currentDate = new Date();
                            let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                            // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                            customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                            let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                            let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                            let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                            let customerBillingType = billingType;
                            console.log(isValidForCustomlPlan, bundlePlanValidity);
                            if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                                infoLog(bundlePlanValidity)
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                            charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp)
                                            ("-----------------------------------------------Yash")
                                                ('Payment adjusment for Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'BP',
                                                subscription_type_id: bundlePlanId
                                            }).then((resp) => {
                                                ("-----------------------------------------------Yash1")
                                                    ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + bundlePlanId + "")
                                            .then(async (response) => {
                                                reset_minute_plan_minutes(bundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                infoLog("in else code ")
                                    ("-------------------------------------------------------------------------------")
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp)
                                        ('Payment adjusment for Bundle Plan - WEEKLY', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('Payment adjusment for Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                                infoLog(isValidForCustomlPlan)
                                console.log("-------------------------------In Bundle Custom Case-------------------------------");
                                if (customerBillingType == '1') { // Prepaid type customer
                                    infoLog(customerBillingType)
                                    if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                            charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp)
                                            ('Payment adjusment for Bundle Plan - CUSTOM', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'BP',
                                                subscription_type_id: bundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + bundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(bundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp)
                                        console.log(`Charge added Successfully || Payment adjusment for Bundle Plan - ${resp}`);
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            console.log("History added Successfully.");
                                            reset_minute_plan_minutes(bundlePlanId);
                                        }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                    }).catch((err) => {
                                        console.log(`In Catch Condition ---> ${err}`);
                                    });
                                }
                            } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                                infoLog(bundlePlanValidity)
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: bundleCharge,
                                            charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp)
                                            ('Payment adjusment for Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'BP',
                                                subscription_type_id: bundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + bundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(bundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp)
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                                infoLog(`${bundlePlanValidity}>>>>>>>>>>> in year code`)
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: bundleCharge,
                                            charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp)
                                            ('Payment adjusment for Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'BP',
                                                subscription_type_id: bundlePlanId
                                            }).then((resp) => {
                                                infoLog(resp)
                                                ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + bundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(bundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp)
                                        ('Payment adjusment for Bundle Plan - yearly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else {
                                console.log(`Not generated today For Bundle plan => ${bundlePlanId}`)
                                return;
                            }
                        }
                    }).catch((err) => { (err) });
            }

            if (isRoamingPlan == 1) {
                infoLog(isRoamingPlan)
                console.log(isRoamingPlan, "isRoamingPlan")
                await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                    knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                    .from(table.tbl_Call_Plan + ' as cp')
                    .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                    .where('cp.id', roamingPlanId)
                    .limit(1)
                    .orderBy('cp.id', 'desc')
                    .then((response) => {  // For Roaming plan      
                        infoLog(`${response} in roaming code `)
                        if (response[0]) {
                            let data = response[0];
                            let roamingCharge = Number(response[0]['charge']);
                            let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                            let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                            extra_fee_charge_type_list.forEach((element1, i) => {
                                extra_fee_charge_list.forEach((element2, j) => {
                                    if (i === j && (element1 === '1' || element1 === '2')) {
                                        roamingCharge = Number(roamingCharge) + Number(element2)
                                    }
                                });
                            });
                            console.log(`roamingCharge => ${roamingCharge}`);
                            let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                            let minutePlanRoamingName = response[0]['name'];
                            let roamingPlanValidity = response[0]['validity'];
                            let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                            let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                            let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                            let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                            let currentDate = new Date();
                            let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                            // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                            customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                            let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                            let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                            let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                            let customerBillingType = billingType;
                            console.log(roamingPlanValidity, isValidForCustomlPlan, "<= For Roaming Plan")
                            infoLog(`${roamingPlanValidity}, roaming plan validity`);
                            if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                            charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp);
                                            ('Payment adjusment for Roaming plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'RP',
                                                subscription_type_id: roamingPlanId
                                            }).then((resp) => {
                                                infoLog(resp);
                                                ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + roamingPlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(roamingPlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {// Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                                infoLog(roamingPlanValidity);
                                console.log("-------------------------------In Roaming Custom Case-------------------------------");
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                            charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(roamingPlanValidity);                                           
                                            ('Payment adjusment for Roaming plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'RP',
                                                subscription_type_id: roamingPlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + roamingPlanId + "")
                                            .then((response) => {
                                                infoLog(response);
                                                reset_minute_plan_minutes(roamingPlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {// Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        console.log(`Charge added Successfully || Payment adjusment for Roaming Plan - ${resp}`);
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log("History added Successfully for Roaming Plan.");
                                            reset_minute_plan_minutes(roamingPlanId);
                                        }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                    }).catch((err) => { console.lof(`In Catch Condition ---> ${err}`); });
                                }
                            } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                                infoLog(roamingPlanValidity);
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: roamingCharge,
                                            charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp);
                                            ('Payment adjusment for Roaming plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'RP',
                                                subscription_type_id: roamingPlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + roamingPlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(roamingPlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {// Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                                infoLog(roamingPlanValidity);
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: roamingCharge,
                                            charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp);
                                            ('Payment adjusment for Roaming plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'RP',
                                                subscription_type_id: roamingPlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + roamingPlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(roamingPlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {// Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else {
                                console.log('not generated today For Roaming plan = ', roamingPlanId);
                                return;
                            }
                        }
                    }).catch((err) => { (err) });
            }

            if (isTeleconsultPlan == 1) {
                infoLog(`${isTeleconsultPlan} =>> In Tc Plan`);
                console.log(isTeleconsultPlan, "isTcPlan")
                await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                    knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                    .from(table.tbl_Call_Plan + ' as cp')
                    .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                    .where('cp.id', teleconsultPlandId)
                    .limit(1)
                    .orderBy('cp.id', 'desc')
                    .then((response) => {  // For TC plan   
                        infoLog(response[0]);
                        if (response[0]) {
                            let data = response[0];
                            let tcCharge = Number(response[0]['charge']);
                            let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                            let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                            extra_fee_charge_type_list.forEach((element1, i) => {
                                extra_fee_charge_list.forEach((element2, j) => {
                                    if (i === j && (element1 === '1' || element1 === '2')) {
                                        tcCharge = Number(tcCharge) + Number(element2)
                                    }
                                });
                            });
                            console.log(`TcCharge => ${tcCharge}`);
                            let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                            let minutePlanTCName = response[0]['name'];
                            let tcPlanValidity = response[0]['validity'];
                            let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                            let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                            let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                            let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                            let currentDate = new Date();
                            let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                            // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                            customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                            let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                            let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                            let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                            let customerBillingType = billingType;
                            console.log(tcPlanValidity, isValidForCustomlPlan, " <= For tc plan")
                            infoLog(tcPlanValidity);
                            if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + teleconsultPlandId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(teleconsultPlandId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else { // Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                        charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        ('Payment adjusment for TC Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'TC',
                                            subscription_type_id: teleconsultPlandId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                                infoLog(`${tcPlanValidity}>>>>>>>else if conditon`);
                                console.log("-------------------------------In TC Custom Case-------------------------------");
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + teleconsultPlandId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(teleconsultPlandId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else { // Postpaid type customer                                
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                        charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        console.log('Payment adjusment for TC Plan - yearly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'TC',
                                            subscription_type_id: teleconsultPlandId
                                        }).then((resp) => {
                                        infoLog(resp);
                                            console.log("History added Successfully for TC Plan.");
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                        }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }
                            } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                                infoLog(`${tcPlanValidity}>>>>>>>><<<<<<<<<<monthly`);
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + teleconsultPlandId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(teleconsultPlandId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else { // Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: tcCharge,
                                        charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        ('Payment adjusment for TC Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'TC',
                                            subscription_type_id: teleconsultPlandId
                                        }).then((resp) => {
                                        infoLog(resp);
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                                infoLog(`${tcPlanValidity}<><<><><<><><<<<><>yearly`);
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + teleconsultPlandId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(teleconsultPlandId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else { // Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: tcCharge,
                                        charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        ('Payment adjusment for TC Plan - yearly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'TC',
                                            subscription_type_id: teleconsultPlandId
                                        }).then((resp) => {
                                        infoLog(resp);
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else {
                                console.log('not generated today For tc plan = ', teleconsultPlandId);
                                return;
                            }
                        }
                    }).catch((err) => { (err) });
            }

            if (isOutBundlePlan == 1) {
                infoLog(`${isOutBundlePlan} > >> > > > > IN Outbound`);
                await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                    knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                    .from(table.tbl_Call_Plan + ' as cp')
                    .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                    .where('cp.id', outBundlePlanId)
                    .limit(1)
                    .orderBy('cp.id', 'desc')
                    .then((response) => {  // For Budle plan    
                        infoLog(response[0]);
                        if (response[0]) {
                            let data = response[0];
                            let outBundleCharge = Number(response[0]['charge']);
                            let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                            let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                            extra_fee_charge_type_list.forEach((element1, i) => {
                                extra_fee_charge_list.forEach((element2, j) => {
                                    if (i === j && (element1 === '1' || element1 === '2')) {
                                        outBundleCharge = Number(outBundleCharge) + Number(element2)
                                    }
                                });
                            });
                            console.log(`out bundle_charge => ${outBundleCharge}`);
                            let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                            let minutePlanOutBundleName = response[0]['name'];
                            let outBundlePlanValidity = response[0]['validity'];
                            let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                            let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                            let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                            let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                            let currentDate = new Date();
                            let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                            // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                            customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                            let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                            let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                            let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                            let customerBillingType = billingType;
                            console.log(isValidForCustomlPlan, outBundlePlanValidity);
                            if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                                infoLog(`${outBundlePlanValidity} In Weekly code`);
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                            charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp);
                                            ('Payment adjusment for out Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'OP',
                                                subscription_type_id: outBundlePlanId
                                            }).then((resp) => {
                                            infoLog(resp);  
                                                ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_Call_Plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + outBundlePlanId + "")
                                            .then(async (response) => {
                                                reset_minute_plan_minutes(outBundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        infoLog(resp);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            infoLog(resp);
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                                infoLog(`${outBundlePlanValidity} In custom validity code`);
                                console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                            charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp);
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'OP',
                                                subscription_type_id: outBundlePlanId
                                            }).then((resp) => {
                                                infoLog(resp);
                                                ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + outBundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(outBundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                infoLog(resp);
                                        console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                    infoLog(resp);
                                            console.log("History added Successfully.");
                                            reset_minute_plan_minutes(outBundlePlanId);
                                        }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                    }).catch((err) => {
                                        console.log(`In Catch Condition ---> ${err}`);
                                    });
                                }
                            } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                                infoLog(`${outBundlePlanValidity} In monthly validity code`);                        
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                            charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                    infoLog(resp);
                                            ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'OP',
                                                subscription_type_id: outBundlePlanId
                                            }).then((resp) => {
                                    infoLog(resp);
                                                ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + outBundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(outBundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                    infoLog(resp);
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                    infoLog(resp);
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                                infoLog(`${outBundlePlanValidity} In Yearly code`);
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                            charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            infoLog(resp);
                                            ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'OP',
                                                subscription_type_id: outBundlePlanId
                                            }).then((resp) => {
                                    infoLog(resp);
                                                ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + outBundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(outBundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                    infoLog(resp);
                                        ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                    infoLog(resp);
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else {
                                console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                                return;
                            }
                        }
                    }).catch((err) => { (err) });
            }

        }

        const manage_bundle_plan_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', bundlePlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Budle plan
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        (bundleCharge, "bundleCharge", subscriptionDate)
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('bundlePlanValidity', bundlePlanValidity)
                            ('isValidForWeeklPlan', isValidForWeeklyPlan)
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Bundle plan', bundlePlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });;

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', roamingPlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Roaming plan
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('roamingPlanValidity', roamingPlanValidity)
                            ('isValidForWeeklPlan', isValidForWeeklyPlan)

                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Roaming plan', bundlePlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_tc_plan_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', roamingPlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Roaming plan
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('roamingPlanValidity', roamingPlanValidity)
                            ('isValidForWeeklPlan', isValidForWeeklyPlan)

                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Roaming plan', roamingPlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;

                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

        }

        const manage_tc_plan_and_bundle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType) => {

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('bp.id', 'desc')

                // await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                //     knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                //     knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                //     knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                //     .from(table.tbl_pbx_bundle_plan + ' as bp')
                //     .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                //     .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                //     .where('bp.id', '=', teleconsultPlandId)
                //     .limit(1)
                //     .orderBy('bps.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;

                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', bundlePlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Budle plan
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        (bundleCharge, "bundleCharge", subscriptionDate)
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('bundlePlanValidity', bundlePlanValidity)
                            ('isValidForWeeklPlan', isValidForWeeklyPlan)
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Bundle plan', bundlePlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });;
        }

        const manage_bungle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            // let sql = knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
            //     knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
            //     knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
            //     knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            //     .from(table.tbl_pbx_bundle_plan + ' as bp')
            //     .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            //     .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            //     .where('bp.id', '=', bundlePlanId)            
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', bundlePlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Budle plan                                        
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        (`bundle_charge => ${bundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ("bundlePlanValidity", bundlePlanValidity);
                        ("isValidForCustomlPlan", isValidForCustomlPlan);
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly                                                        
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 1, // change charge status 0 to 1 because we have prepaid customer.
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                ("============================================================================================================")
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                ("in else condition postpaid")
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - custom', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        ("in custom case")
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Bundle plan', bundlePlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });;
        }

        const manage_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            ("IN Roaming Plan", roamingPlanId)
            // knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
            //     knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
            //     knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
            //     knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            //     .from(table.tbl_pbx_bundle_plan + ' as bp')
            //     .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            //     .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            //     .where('bp.id', '=', roamingPlanId)
            //     .limit(1)
            //     .orderBy('bps.id', 'desc')    

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', roamingPlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Roaming plan                    
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('roamingPlanValidity', roamingPlanValidity)
                            ("isValidForCustomlPlan", isValidForCustomlPlan)
                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly                            
                            (customerBillingType, "--------------")
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                ('in postpaid customer')
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Roaming plan', roamingPlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_tc_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                // await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                //     knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                //     knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                //     knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                //     .from(table.tbl_pbx_bundle_plan + ' as bp')
                //     .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                //     .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                //     .where('bp.id', '=', teleconsultPlandId)
                //     .limit(1)
                //     .orderBy('bps.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;

                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_all_four_minute_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType, isBundlePlan, isRoamingPlan, isTeleconsultPlan, isOutBundlePlan) => {            
            console.log(isBundlePlan, isRoamingPlan, isTeleconsultPlan, isOutBundlePlan)
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', bundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Budle plan                   
                    debug(response[0])
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`bundle_charge => ${bundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, bundlePlanValidity);
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        debug(resp)
                                        ("-----------------------------------------------Yash")
                                            ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ("-----------------------------------------------Yash1")
                                                ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                ("-------------------------------------------------------------------------------")
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    debug(resp)
                                    ('Payment adjusment for Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    debug(resp)
                                    console.log(`Charge added Successfully || Payment adjusment for Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(bundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                        debug(response)
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        debug(resp)
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Bundle plan => ${bundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', roamingPlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Roaming plan                  
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`roamingCharge => ${roamingCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(roamingPlanValidity, isValidForCustomlPlan, "<= For Roaming Plan")
                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    debug(resp)
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Roaming Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Roaming Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully for Roaming Plan.");
                                        reset_minute_plan_minutes(roamingPlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => { console.lof(`In Catch Condition ---> ${err}`); });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        debug(resp)
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        debug(resp)
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log('not generated today For Roaming plan = ', roamingPlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For TC plan                  
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`TcCharge => ${tcCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(tcPlanValidity, isValidForCustomlPlan, " <= For tc plan")
                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In TC Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer                                
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        console.log("History added Successfully for TC Plan.");
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });

        }

        const manage_outBundle_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', roamingPlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Roaming plan                  
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`roamingCharge => ${roamingCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(roamingPlanValidity, isValidForCustomlPlan, "<= For Roaming Plan")
                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Roaming Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Roaming Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully for Roaming Plan.");
                                        reset_minute_plan_minutes(roamingPlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => { console.lof(`In Catch Condition ---> ${err}`); });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log('not generated today For Roaming plan = ', roamingPlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_outBundle_and_tc_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For TC plan                  
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`TcCharge => ${tcCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(tcPlanValidity, isValidForCustomlPlan, " <= For tc plan")
                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In TC Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer                                
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        console.log("History added Successfully for TC Plan.");
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_bundle_and_outBundle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', bundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, bundlePlanValidity);
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                ("-------------------------------------------------------------------------------")
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(bundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Bundle plan => ${bundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_outBundle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const update_user_current_balance = async (service_type, service_charge, customer_id) => {
            current_total_balance = current_total_balance - service_charge;
            knex.from(table.tbl_Customer)
                .where('id', '=', customer_id).decrement('balance', service_charge)
                .then((resp) => {
                    ('Balance has been detected for ', service_type, ' with charge ', service_charge);
                }).catch((err) => { (err) });
        }

        const reset_minute_plan_minutes = (minutePlanId) => {
            let sql = knex(table.tbl_Call_Plan_Rate).update({
                used_minutes: 0
            }).where('call_plan_id', '=', "" + minutePlanId + "")
            sql.then((response) => {
                ('Reset the call rates minute for particular minute plan');
            }).catch((err) => { (err) });
        }
    }
    else {  // every day in months but not will run at 29,30,31 bcz of validity date should be less than 29        
        knex.from(table.tbl_Customer)
            .select('id', 'email', 'company_name', 'invoice_day', 'balance')
            .whereIn('role_id', ['1'])
            .andWhere('status', '=', '1')
            // .andWhere('id', '=', '1263')
            .then((response) => {
                for (let i = 0; i < response.length; i++) {
                    current_total_balance = response[i].balance;
                    generate_minute_service_charges(response[i].id, response[i].balance);
                }
            });

        const generate_minute_service_charges = async (customer_id, current_balance) => {
            var now = new Date();
            var currentDay = parseInt(now.getDate());
            var currentMonth = parseInt(now.getMonth() + 1);
            var currentYear = parseInt(now.getFullYear());
            var previousMonth = parseInt(now.getMonth());

            // --------------------------------- SMS PLAN MODULE FOR CHARGE TABLE --------------------------------------------
            await knex.select('sms.charge as sms_charge', 'sms.name as sms_name', 'sms.validity as sms_validity', 'c.*', knex.raw('DATE_FORMAT(mcp.sms_active_at, "%m") as sms_activate_month'),
                knex.raw('DATE_FORMAT(mcp.sms_active_at, "%y") as sms_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,mcp.sms_active_at,NOW()) as expiry_date'))
                .from(table.tbl_Customer + ' as c')
                .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
                .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
                .leftJoin(table.tbl_pbx_SMS + ' as sms', 'sms.id', 'pf.sms_id')
                .where('c.id', '=', customer_id)
                .then((response) => {
                    let data = response[0] ? response[0] : '';
                    let sms_charge = data ? data.sms_charge : '';
                    let sms_name = data ? data.sms_name : '';
                    let sms_validity = data ? data.sms_validity : '';
                    //  let sms_active_date = data ? data.sms_active_at : new Date();
                    let sms_activate_month = data ? parseInt(data.sms_activate_month) : 0;
                    let sms_activate_year = data ? parseInt(data.sms_activate_year) : 0;
                    let sms_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (data['billing_type'] == '2') // check customer billing type Postpaid
                    {
                        if (sms_validity == '1' && sms_expiry) { // Monthly Validity

                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: sms_charge,
                                charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                let current_time = new Date();
                                current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                let sql = knex(table.tbl_Map_customer_package).update({
                                    sms_active_at: "" + current_time + ""
                                }).where('customer_id', '=', "" + customer_id + "")
                                sql.then((response) => {
                                    ('customer is postpaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=' + sms_charge);
                                }).catch((err) => { (err) });
                            }).catch((err) => { (err) });
                        } else if (sms_validity == '2' && currentYear > sms_activate_year && currentMonth > sms_activate_month) {// Yearly Validity
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: sms_charge,
                                charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                let current_time = new Date();
                                current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                let sql = knex(table.tbl_Map_customer_package).update({
                                    sms_active_at: "" + current_time + ""
                                }).where('customer_id', '=', "" + customer_id + "")
                                sql.then((response) => {
                                    ('customer is postpaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=' + sms_charge);
                                }).catch((err) => { (err) });
                            }).catch((err) => { (err) });
                        } else {
                            ('sms have invalid validity type...it should be either monthly and yearly')
                        }
                    } else { // check customer billing type Prepaid billing_type = 1
                        let isCheckCustomerBalance = data ? data['balance'] : 0;
                        if (isCheckCustomerBalance && isCheckCustomerBalance > sms_charge) {  // customer have sufficient balance for next sms invoice
                            if (sms_validity == '1' && sms_expiry) { // Monthly Validity
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: sms_charge,
                                    charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    let current_time = new Date();
                                    current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                    let sql = knex(table.tbl_Map_customer_package).update({
                                        sms_active_at: "" + current_time + ""
                                    }).where('customer_id', '=', "" + customer_id + "")
                                    sql.then((response) => {
                                        update_user_current_balance('Charge for SMS', Number(sms_charge), customer_id);
                                        ('customer is prepaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=', sms_charge);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            } else if (sms_validity == '2' && currentYear > sms_activate_year && currentMonth > sms_activate_month) {// Yearly Validity
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: sms_charge,
                                    charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    let current_time = new Date();
                                    current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                    let sql = knex(table.tbl_Map_customer_package).update({
                                        sms_active_at: "" + current_time + ""
                                    }).where('customer_id', '=', "" + customer_id + "")
                                    sql.then((response) => {
                                        update_user_current_balance('Charge for SMS', Number(sms_charge), customer_id);
                                        ('customer is prepaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=', sms_charge);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            } else {
                                ('sms have invalid validity type with prepaid...it should be either monthly and yearly')
                            }
                        } else {  // customer have not sufficient balance for renew sms plan
                            let sql = knex(table.tbl_pbx_sms_api).update({
                                status: "0"
                            }).where('customer_id', '=', "" + customer_id + "")
                            sql.then((response) => {
                                ('customer is prepaid type but have not not sufficient balance for renew sms plan thats why i updated status = 0 in pbx_sms_api', response);
                                // ALSO NEED TO FIRE A EMAIL NOTIFICATION FOR THIS PLAN THAT THIS PLAN HAS BEEN STOP....SMTHN SMTHNG
                            }).catch((err) => { (err) });
                        }
                    }
                }).catch((err) => { (err) });

            //------------------------------- MINUTE PLAN (BP, RP, TC) IN CHARGE TABLE -------------------------------
            await knex.select('pf.*', 'c.billing_type as billing')
                .from(table.tbl_Customer + ' as c')
                .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
                .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
                .where('c.id', '=', customer_id)
                .then((response) => {
                    let data = response[0] ? response[0] : '';
                    let isBundlePlan = data ? parseInt(data['is_bundle_type']) : 0;
                    let bundlePlanId = data ? data['bundle_plan_id'] : 0;
                    let isRoamingPlan = data ? parseInt(data['is_roaming_type']) : 0;
                    let roamingPlanId = data ? data['roaming_plan_id'] : 0;
                    let isTeleconsultPlan = data ? parseInt(data['teleconsultation']) : 0;
                    let teleconsultPlandId = data ? data['teleConsultancy_call_plan_id'] : 0;
                    let isOutBundlePlan = data ? parseInt(data['out_bundle_type']) : 0;
                    let outBundlePlanId = data ? data['out_bundle_call_plan_id'] : 0;
                    let customerBillingType = data ? data['billing'] : '1';
                    const planFunctions = {
                        "1111": manage_all_four_minute_plan,
                        "1110": manage_all_three_minute_plan,
                        "1101": manage_all_three_minute_plan,
                        "1011": manage_all_three_minute_plan,
                        "1000": manage_bungle_plan,
                        "0100": manage_outBundle_plan,
                        "0010": manage_roaming_plan,
                        "0001": manage_tc_plan,  // Handle as needed
                        "0111": manage_all_three_minute_plan,
                        "1010": manage_bundle_plan_and_roaming_plan,
                        "1001": manage_tc_plan_and_bundle_plan,
                        "0101": manage_outBundle_and_tc_plan,
                        "0011": manage_tc_plan_and_roaming_plan,
                        "1100": manage_bundle_and_outBundle_plan,
                        "0110": manage_outBundle_and_roaming_plan
                    };
                    let key = `${isBundlePlan}${isOutBundlePlan}${isRoamingPlan}${isTeleconsultPlan}`
                    const selectedFunction = planFunctions[key];
                    if (selectedFunction) {
                        selectedFunction(bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, customerBillingType, isBundlePlan, isRoamingPlan, isTeleconsultPlan, isOutBundlePlan)
                    }
                }).catch((err) => { (err) });
        }


        const manage_all_three_minute_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType, isBundlePlan, isRoamingPlan, isTeleconsultPlan, isOutBundlePlan) => {
            console.log(isBundlePlan, "isBundlePlan", isRoamingPlan, "isRoamingPlan", isTeleconsultPlan, "isTc", isOutBundlePlan, "isOutbound", customer_id)
            if (isBundlePlan == 1) {
                console.log(isBundlePlan, "isBUndlePlan")
                await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                    knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                    .from(table.tbl_Call_Plan + ' as cp')
                    .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                    .where('cp.id', bundlePlanId)
                    .limit(1)
                    .orderBy('cp.id', 'desc')
                    .then((response) => {  // For Budle plan                   
                        if (response[0]) {
                            let data = response[0];
                            let bundleCharge = Number(response[0]['charge']);
                            let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                            let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                            extra_fee_charge_type_list.forEach((element1, i) => {
                                extra_fee_charge_list.forEach((element2, j) => {
                                    if (i === j && (element1 === '1' || element1 === '2')) {
                                        bundleCharge = Number(bundleCharge) + Number(element2)
                                    }
                                });
                            });
                            console.log(`bundle_charge => ${bundleCharge}`);
                            let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                            let minutePlanBundleName = response[0]['name'];
                            let bundlePlanValidity = response[0]['validity'];
                            let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                            let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                            let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                            let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                            let currentDate = new Date();
                            let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                            // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                            customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                            let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                            let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                            let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                            let customerBillingType = billingType;
                            console.log(isValidForCustomlPlan, bundlePlanValidity);
                            if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                            charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ("-----------------------------------------------Yash")
                                                ('Payment adjusment for Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'BP',
                                                subscription_type_id: bundlePlanId
                                            }).then((resp) => {
                                                ("-----------------------------------------------Yash1")
                                                    ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + bundlePlanId + "")
                                            .then(async (response) => {
                                                reset_minute_plan_minutes(bundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    ("-------------------------------------------------------------------------------")
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - WEEKLY', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('Payment adjusment for Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                                console.log("-------------------------------In Bundle Custom Case-------------------------------");
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                            charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - CUSTOM', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'BP',
                                                subscription_type_id: bundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + bundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(bundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log(`Charge added Successfully || Payment adjusment for Bundle Plan - ${resp}`);
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            console.log("History added Successfully.");
                                            reset_minute_plan_minutes(bundlePlanId);
                                        }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                    }).catch((err) => {
                                        console.log(`In Catch Condition ---> ${err}`);
                                    });
                                }
                            } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: bundleCharge,
                                            charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'BP',
                                                subscription_type_id: bundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + bundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(bundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: bundleCharge,
                                            charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'BP',
                                                subscription_type_id: bundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + bundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(bundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - yearly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else {
                                console.log(`Not generated today For Bundle plan => ${bundlePlanId}`)
                                return;
                            }
                        }
                    }).catch((err) => { (err) });
            }

            if (isRoamingPlan == 1) {
                console.log(isRoamingPlan, "isRoamingPlan")
                await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                    knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                    .from(table.tbl_Call_Plan + ' as cp')
                    .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                    .where('cp.id', roamingPlanId)
                    .limit(1)
                    .orderBy('cp.id', 'desc')
                    .then((response) => {  // For Roaming plan                  
                        if (response[0]) {
                            let data = response[0];
                            let roamingCharge = Number(response[0]['charge']);
                            let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                            let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                            extra_fee_charge_type_list.forEach((element1, i) => {
                                extra_fee_charge_list.forEach((element2, j) => {
                                    if (i === j && (element1 === '1' || element1 === '2')) {
                                        roamingCharge = Number(roamingCharge) + Number(element2)
                                    }
                                });
                            });
                            console.log(`roamingCharge => ${roamingCharge}`);
                            let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                            let minutePlanRoamingName = response[0]['name'];
                            let roamingPlanValidity = response[0]['validity'];
                            let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                            let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                            let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                            let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                            let currentDate = new Date();
                            let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                            // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                            customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                            let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                            let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                            let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                            let customerBillingType = billingType;
                            console.log(roamingPlanValidity, isValidForCustomlPlan, "<= For Roaming Plan")
                            if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                            charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'RP',
                                                subscription_type_id: roamingPlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + roamingPlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(roamingPlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {// Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                                console.log("-------------------------------In Roaming Custom Case-------------------------------");
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                            charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'RP',
                                                subscription_type_id: roamingPlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + roamingPlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(roamingPlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {// Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log(`Charge added Successfully || Payment adjusment for Roaming Plan - ${resp}`);
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log("History added Successfully for Roaming Plan.");
                                            reset_minute_plan_minutes(roamingPlanId);
                                        }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                    }).catch((err) => { console.lof(`In Catch Condition ---> ${err}`); });
                                }
                            } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: roamingCharge,
                                            charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'RP',
                                                subscription_type_id: roamingPlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + roamingPlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(roamingPlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {// Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                        reset_minute_plan_minutes(bundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: roamingCharge,
                                            charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'RP',
                                                subscription_type_id: roamingPlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + roamingPlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(roamingPlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {// Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else {
                                console.log('not generated today For Roaming plan = ', roamingPlanId);
                                return;
                            }
                        }
                    }).catch((err) => { (err) });
            }

            if (isTeleconsultPlan == 1) {
                console.log(isTeleconsultPlan, "isTcPlan")
                await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                    knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                    .from(table.tbl_Call_Plan + ' as cp')
                    .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                    .where('cp.id', teleconsultPlandId)
                    .limit(1)
                    .orderBy('cp.id', 'desc')
                    .then((response) => {  // For TC plan                  
                        if (response[0]) {
                            let data = response[0];
                            let tcCharge = Number(response[0]['charge']);
                            let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                            let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                            extra_fee_charge_type_list.forEach((element1, i) => {
                                extra_fee_charge_list.forEach((element2, j) => {
                                    if (i === j && (element1 === '1' || element1 === '2')) {
                                        tcCharge = Number(tcCharge) + Number(element2)
                                    }
                                });
                            });
                            console.log(`TcCharge => ${tcCharge}`);
                            let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                            let minutePlanTCName = response[0]['name'];
                            let tcPlanValidity = response[0]['validity'];
                            let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                            let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                            let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                            let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                            let currentDate = new Date();
                            let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                            // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                            customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                            let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                            let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                            let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                            let customerBillingType = billingType;
                            console.log(tcPlanValidity, isValidForCustomlPlan, " <= For tc plan")
                            if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + teleconsultPlandId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(teleconsultPlandId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else { // Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                        charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for TC Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'TC',
                                            subscription_type_id: teleconsultPlandId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                                console.log("-------------------------------In TC Custom Case-------------------------------");
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + teleconsultPlandId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(teleconsultPlandId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else { // Postpaid type customer                                
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                        charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for TC Plan - yearly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'TC',
                                            subscription_type_id: teleconsultPlandId
                                        }).then((resp) => {
                                            console.log("History added Successfully for TC Plan.");
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                        }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }
                            } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + teleconsultPlandId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(teleconsultPlandId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else { // Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: tcCharge,
                                        charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for TC Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'TC',
                                            subscription_type_id: teleconsultPlandId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + teleconsultPlandId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(teleconsultPlandId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else { // Postpaid type customer
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: tcCharge,
                                        charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for TC Plan - yearly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'TC',
                                            subscription_type_id: teleconsultPlandId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else {
                                console.log('not generated today For tc plan = ', teleconsultPlandId);
                                return;
                            }
                        }
                    }).catch((err) => { (err) });
            }

            if (isOutBundlePlan == 1) {
                await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                    knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                    .from(table.tbl_Call_Plan + ' as cp')
                    .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                    .where('cp.id', outBundlePlanId)
                    .limit(1)
                    .orderBy('cp.id', 'desc')
                    .then((response) => {  // For Budle plan                   
                        if (response[0]) {
                            let data = response[0];
                            let outBundleCharge = Number(response[0]['charge']);
                            let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                            let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                            extra_fee_charge_type_list.forEach((element1, i) => {
                                extra_fee_charge_list.forEach((element2, j) => {
                                    if (i === j && (element1 === '1' || element1 === '2')) {
                                        outBundleCharge = Number(outBundleCharge) + Number(element2)
                                    }
                                });
                            });
                            console.log(`out bundle_charge => ${outBundleCharge}`);
                            let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                            let minutePlanOutBundleName = response[0]['name'];
                            let outBundlePlanValidity = response[0]['validity'];
                            let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                            let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                            let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                            let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                            let currentDate = new Date();
                            let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                            planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                            // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                            customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                            let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                            let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                            let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                            let customerBillingType = billingType;
                            console.log(isValidForCustomlPlan, outBundlePlanValidity);
                            if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                            charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for out Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'OP',
                                                subscription_type_id: outBundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_Call_Plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + outBundlePlanId + "")
                                            .then(async (response) => {
                                                reset_minute_plan_minutes(outBundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                                console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                            charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'OP',
                                                subscription_type_id: outBundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + outBundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(outBundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            console.log("History added Successfully.");
                                            reset_minute_plan_minutes(outBundlePlanId);
                                        }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                    }).catch((err) => {
                                        console.log(`In Catch Condition ---> ${err}`);
                                    });
                                }
                            } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                            charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'OP',
                                                subscription_type_id: outBundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + outBundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(outBundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                                if (customerBillingType == '1') { // Prepaid type customer
                                    if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                        update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        knex(table.tbl_Charge).insert({
                                            did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                            charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                            knex(table.tbl_pbx_service_subscription_history).insert({
                                                customer_id: customer_id, subscription_type: 'OP',
                                                subscription_type_id: outBundlePlanId
                                            }).then((resp) => {
                                                ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                            }).catch((err) => { (err) });
                                        }).catch((err) => { (err) });

                                    } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                        knex(table.tbl_pbx_bundle_plan).update({
                                            status: '0'
                                        }).where('id', '=', "" + outBundlePlanId + "")
                                            .then((response) => {
                                                reset_minute_plan_minutes(outBundlePlanId);
                                                ('user minute plan has been removed due of balance', response);
                                                //    Email notification fired.................
                                            }).catch((err) => { (err) });
                                    }
                                } else {
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });
                                }
                            } else {
                                console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                                return;
                            }
                        }
                    }).catch((err) => { (err) });
            }

        }

        const manage_bundle_plan_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', bundlePlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Budle plan
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        (bundleCharge, "bundleCharge", subscriptionDate)
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('bundlePlanValidity', bundlePlanValidity)
                            ('isValidForWeeklPlan', isValidForWeeklyPlan)
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Bundle plan', bundlePlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });;

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', roamingPlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Roaming plan
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('roamingPlanValidity', roamingPlanValidity)
                            ('isValidForWeeklPlan', isValidForWeeklyPlan)

                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Roaming plan', bundlePlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_tc_plan_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', roamingPlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Roaming plan
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('roamingPlanValidity', roamingPlanValidity)
                            ('isValidForWeeklPlan', isValidForWeeklyPlan)

                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Roaming plan', roamingPlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;

                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

        }

        const manage_tc_plan_and_bundle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType) => {

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('bp.id', 'desc')

                // await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                //     knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                //     knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                //     knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                //     .from(table.tbl_pbx_bundle_plan + ' as bp')
                //     .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                //     .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                //     .where('bp.id', '=', teleconsultPlandId)
                //     .limit(1)
                //     .orderBy('bps.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;

                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', bundlePlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Budle plan
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        (bundleCharge, "bundleCharge", subscriptionDate)
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('bundlePlanValidity', bundlePlanValidity)
                            ('isValidForWeeklPlan', isValidForWeeklyPlan)
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Bundle plan', bundlePlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });;
        }

        const manage_bungle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            // let sql = knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
            //     knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
            //     knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
            //     knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            //     .from(table.tbl_pbx_bundle_plan + ' as bp')
            //     .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            //     .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            //     .where('bp.id', '=', bundlePlanId)
            ("IN Bundle Plan")
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', bundlePlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Budle plan                                        
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        (`bundle_charge => ${bundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ("bundlePlanValidity", bundlePlanValidity);
                        ("isValidForCustomlPlan", isValidForCustomlPlan);
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly                                                        
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 1, // change charge status 0 to 1 because we have prepaid customer.
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                ("============================================================================================================")
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                ("in else condition postpaid")
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - custom', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        ("in custom case")
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Bundle plan', bundlePlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });;
        }

        const manage_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            ("IN Roaming Plan", roamingPlanId)
            // knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
            //     knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
            //     knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
            //     knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            //     .from(table.tbl_pbx_bundle_plan + ' as bp')
            //     .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            //     .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            //     .where('bp.id', '=', roamingPlanId)
            //     .limit(1)
            //     .orderBy('bps.id', 'desc')    

            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', roamingPlanId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                .then((response) => {  // For Roaming plan                    
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        ('roamingPlanValidity', roamingPlanValidity)
                            ("isValidForCustomlPlan", isValidForCustomlPlan)
                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly                            
                            (customerBillingType, "--------------")
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                ('in postpaid customer')
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For Roaming plan', roamingPlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_tc_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'bp.id')
                .where('bp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('bp.id', 'desc')
                // await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                //     knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                //     knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                //     knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                //     .from(table.tbl_pbx_bundle_plan + ' as bp')
                //     .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                //     .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                //     .where('bp.id', '=', teleconsultPlandId)
                //     .limit(1)
                //     .orderBy('bps.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;

                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            ('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_all_four_minute_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType, isBundlePlan, isRoamingPlan, isTeleconsultPlan, isOutBundlePlan) => {
            console.log(isBundlePlan, isRoamingPlan, isTeleconsultPlan, isOutBundlePlan)
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', bundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`bundle_charge => ${bundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, bundlePlanValidity);
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ("-----------------------------------------------Yash")
                                            ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ("-----------------------------------------------Yash1")
                                                ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                ("-------------------------------------------------------------------------------")
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(bundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Bundle plan => ${bundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', roamingPlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Roaming plan                  
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`roamingCharge => ${roamingCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(roamingPlanValidity, isValidForCustomlPlan, "<= For Roaming Plan")
                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Roaming Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Roaming Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully for Roaming Plan.");
                                        reset_minute_plan_minutes(roamingPlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => { console.lof(`In Catch Condition ---> ${err}`); });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log('not generated today For Roaming plan = ', roamingPlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For TC plan                  
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`TcCharge => ${tcCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(tcPlanValidity, isValidForCustomlPlan, " <= For tc plan")
                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In TC Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer                                
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        console.log("History added Successfully for TC Plan.");
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });

        }

        const manage_outBundle_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${roamingPlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', roamingPlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Roaming plan                  
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    roamingCharge = Number(roamingCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`roamingCharge => ${roamingCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(roamingPlanValidity, isValidForCustomlPlan, "<= For Roaming Plan")
                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Roaming Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id: roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Roaming Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully for Roaming Plan.");
                                        reset_minute_plan_minutes(roamingPlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => { console.lof(`In Catch Condition ---> ${err}`); });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                    reset_minute_plan_minutes(roamingPlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        ('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log('not generated today For Roaming plan = ', roamingPlanId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_outBundle_and_tc_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${teleconsultPlandId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', teleconsultPlandId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For TC plan                  
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    tcCharge = Number(tcCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`TcCharge => ${tcCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(tcPlanValidity, isValidForCustomlPlan, " <= For tc plan")
                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In TC Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer                                
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id: teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        console.log("History added Successfully for TC Plan.");
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        ('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log('not generated today For tc plan = ', teleconsultPlandId);
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_bundle_and_outBundle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${bundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', bundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    bundleCharge = Number(bundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`bundle_charge => ${bundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        // customePlanApplyDate.setDate(customePlanApplyDate.getDate());
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, bundlePlanValidity);
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                ("-------------------------------------------------------------------------------")
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id: bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(bundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        ('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Bundle plan => ${bundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });

            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        // customePlanApplyDate.setDate(customePlanApplyDate.getDate())
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const manage_outBundle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, outBundlePlanId, currentDay, currentMonth, currentYear, customer_id, billingType) => {
            await knex.select('cp.charge', 'cp.name', 'cp.validity', 'cp.number_of_days', knex.raw('GROUP_CONCAT(fee.charge) as extra_fee_charge'), knex.raw(`(SELECT Concat(sub.apply_at, "," ,DATE_FORMAT(sub.apply_at, "%m"), ",",DATE_FORMAT(sub.apply_at, "%y"), ",", DATE_FORMAT(sub.apply_at, "%d"), ",", TIMESTAMPDIFF(MONTH,sub.apply_at,NOW())) from pbx_service_subscription_history as sub WHERE sub.subscription_type_id = ${outBundlePlanId} order by id DESC LIMIT 1) as subscription`),
                knex.raw('GROUP_CONCAT(fee.fee_type) as extra_fee_charge_type'))
                .from(table.tbl_Call_Plan + ' as cp')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as fee', 'fee.bundle_plan_id', 'cp.id')
                .where('cp.id', outBundlePlanId)
                .limit(1)
                .orderBy('cp.id', 'desc')
                .then((response) => {  // For Outbound Budle plan                   
                    if (response[0]) {
                        let data = response[0];
                        let outBundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']) : [];
                        extra_fee_charge_type_list.forEach((element1, i) => {
                            extra_fee_charge_list.forEach((element2, j) => {
                                if (i === j && (element1 === '1' || element1 === '2')) {
                                    outBundleCharge = Number(outBundleCharge) + Number(element2)
                                }
                            });
                        });
                        console.log(`out bundle_charge => ${outBundleCharge}`);
                        let subscriptionDate = data.subscription ? data.subscription.split(',') : 0;
                        let minutePlanOutBundleName = response[0]['name'];
                        let outBundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(subscriptionDate[3]) + 6 : 0;
                        let plan_activate_month = data ? parseInt(subscriptionDate[1]) : 0;
                        let plan_activate_year = data ? parseInt(subscriptionDate[2]) : 0;
                        let outBundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        let customePlanApplyDate = data ? new Date(subscriptionDate[0]) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        // planApplyDate.setDate(planApplyDate.getDate()); // It will check Every day
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + outBundlePlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? subscriptionDate[4] > 0 ? true : false : false;
                        let customerBillingType = billingType;
                        console.log(isValidForCustomlPlan, outBundlePlanValidity);
                        if (outBundlePlanValidity == 'weekly' && isValidForWeeklyPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_Call_Plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then(async (response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            console.log("-------------------------------In Out Bundle Custom Case-------------------------------");
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                        charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge, ref_id: outBundlePlanId,
                                    charge_type: "10", description: 'Charges for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log(`Charge added Successfully || Payment adjusment for Out Bundle Plan - ${resp}`);
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        console.log("History added Successfully.");
                                        reset_minute_plan_minutes(outBundlePlanId);
                                    }).catch((err) => { (`In Catch Condition ---> ${err}`) });
                                }).catch((err) => {
                                    console.log(`In Catch Condition ---> ${err}`);
                                });
                            }
                        } else if (outBundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else if (outBundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > outBundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Outbound Bundle plan', Number(outBundleCharge), customer_id);
                                    reset_minute_plan_minutes(outBundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                        charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        ('Payment adjusment for Out Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'OP',
                                            subscription_type_id: outBundlePlanId
                                        }).then((resp) => {
                                            ('Payment adjusment for Out Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { (err) });
                                    }).catch((err) => { (err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: '0'
                                    }).where('id', '=', "" + outBundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(outBundlePlanId);
                                            ('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { (err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: outBundleCharge,
                                    charge_type: "10", description: 'Payment adjusment for Outbound Bundle Plan -' + minutePlanOutBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    ('Payment adjusment for Out Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'OP',
                                        subscription_type_id: outBundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(outBundlePlanId);
                                        ('Payment adjusment for Out Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { (err) });
                                }).catch((err) => { (err) });
                            }
                        } else {
                            console.log(`Not generated today For Out Bundle plan => ${outBundlePlanId}`)
                            return;
                        }
                    }
                }).catch((err) => { (err) });
        }

        const update_user_current_balance = (service_type, service_charge, customer_id) => {
            ('current_total_balance', current_total_balance);
            ('service_charge', service_charge);
            current_total_balance = current_total_balance - service_charge;
            knex.from(table.tbl_Customer)
                .where('id', '=', customer_id).decrement('balance', service_charge)
                .then((resp) => {
                    ('Balance has been detected for ', service_type, ' with charge ', service_charge);
                }).catch((err) => { (err) });
        }

        const reset_minute_plan_minutes = (minutePlanId) => {
            let sql = knex(table.tbl_Call_Plan_Rate).update({
                used_minutes: 0
            }).where('call_plan_id', '=', "" + minutePlanId + "")
            sql.then((response) => {
                ('Reset the call rates minute for particular minute plan');
            }).catch((err) => { (err) });
        }


    }

});

cron.schedule("0 16 * * *", async function () {  //for every day at 3:00 AM   0 03 * * *  */25 * * * * *
    // cron.schedule("* * * * *", async function () {  //for every day at 3:00 AM   0 03 * * *  */25 * * * * * 
    try {
        var now = new Date();
        var n = now.getMonth() - 1;
        var currentDate = now.getDate();
        var months = ['December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var invoice_month = months[++n];

        const response = await knex.from(table.tbl_Customer)
            .select('id', 'email', 'company_name', 'invoice_day', 'balance', 'advance_payment', 'created_by', 'mobile', 'company_address', knex.raw('DATE_FORMAT(created_at, "%Y-%m-%d") as date'), 'created_at')
            .where('invoice_day', currentDate)
            .andWhere('status', '=', '1');

        for (let i = 0; i < response.length; i++) {
            const invoiceCheckRes = knex.from(table.tbl_Pbx_Invoice)
                .select('id')
                .where(knex.raw('DATE(invoice_date)'), '!=', knex.raw('CURDATE()'))
                .andWhere('customer_id', response[i].id);

            if ((await invoiceCheckRes).length == 0) {
                await processInvoice(response[i], invoice_month);
            }
        }

    } catch (err) {
        console.log("Error: ", error)
    }

    async function processInvoice(customerData, invoice_month) {
        try {
            let current_total_balance = 0;
            const InvoiceNumberDisplay = generateRandomNumber(6);
            const invoiceId = await createInvoice(customerData, InvoiceNumberDisplay);
            await updateChargesAndInvoice(customerData, invoiceId, invoice_month, current_total_balance, InvoiceNumberDisplay);
        } catch (error) {
            console.log("Error: ", error)
        }
    }

    async function createInvoice(customerData, InvoiceNumber) {
        const resp = await knex(table.tbl_Pbx_Invoice).insert({
            reference_num: '' + InvoiceNumber + '',
            customer_id: customerData.id,
        });
        return resp[0];
    }

    async function updateChargesAndInvoice(customerData, invoiceId, invoice_month, current_total_balance, invoiceNumber) {
        const sql = knex.from(table.tbl_Charge + ' as c')
            .select('c.*', knex.raw('DATE_FORMAT(c.created_at, "%d") as did_activate_day'))
            .where('customer_id', customerData.id)
            .andWhere('charge_status', 0)
            .andWhere('invoice_status', 0);
        const response2 = await sql;
        let allTypeChargeData = response2;
        let didRegularCount = 0; //DID
        let didRegularTotalRate = 0;  //DID
        let didRetroCount = 0; // DID -RETRO
        let SMSCount = 0;  //SMS
        let SMSTotalRate = 0;  //SMS
        let PSTNCount = 0;  //PSTN
        let PSTNTotalRate = 0;  // PSTN
        let boosterCount = 0;  // booster
        let boosterTotalRate = 0; // booster
        let bundleCount = 0;  // BUNDLE
        let bundleTotalRate = 0; // BUNDLE
        let roamingCount = 0;  // ROAMING
        let roamingTotalRate = 0;  // ROAMING
        let TCCount = 0;  // TC
        let TCTotalRate = 0;  //TC
        let SIPTotalRate = 0; //SIP
        let SIPCount = 0; //SIP
        let feature = '';
        let checkDuplicate = [];
        let featureCount = 0; // Feature Rate
        let outBundleCount = 0; // Outbound Bundle Plan
        let outBundleTotalRate = 0; // Outbound Bundle Plan

        for (let j = 0; j < allTypeChargeData.length; j++) {
            if (allTypeChargeData[j]['charge_type'] == '1' && allTypeChargeData[j]['did_activate_day'] == 1) { // DID                                           
                if (!checkDuplicate.includes(allTypeChargeData[j]['did_id'])) { // To handle did quantity in invoice
                    didRegularCount++;
                    checkDuplicate.push(allTypeChargeData[j]['did_id']);
                }
                didRegularTotalRate = didRegularTotalRate + allTypeChargeData[j]['amount'];
            } else if (allTypeChargeData[j]['charge_type'] == '1' && allTypeChargeData[j]['did_activate_day'] != 1) { // DID RETRO
                didRetroCount++;
                let retroDIDname = allTypeChargeData[j]['description'] ? (allTypeChargeData[j]['description']).split('-')[1] : '';
                // didRetroTotalRate++;
                knex(table.tbl_Invoice_Item).insert({
                    invoice_id: '' + invoiceId + '',
                    amount: allTypeChargeData[j]['amount'],
                    description: 'DID Retro rental charge :' + retroDIDname + '-' + '1',
                    item_type: '1'
                }).then((response3) => {
                    ('Data transfer from charge to invoice item for all retro did');
                }).catch(err => { (err) });
            } else if (allTypeChargeData[j]['charge_type'] == '2') { // PSTN
                PSTNCount++;
                PSTNTotalRate = PSTNTotalRate + allTypeChargeData[j]['amount'];
            } else if (allTypeChargeData[j]['charge_type'] == '3') { // SMS
                SMSCount++;
                SMSTotalRate = SMSTotalRate + allTypeChargeData[j]['amount'];
            } else if (allTypeChargeData[j]['charge_type'] == '4') { // Booster
                boosterCount++;
                boosterTotalRate = boosterTotalRate + allTypeChargeData[j]['amount'];
            } else if (allTypeChargeData[j]['charge_type'] == '5') { // Bundle
                bundleCount++;
                bundleTotalRate = bundleTotalRate + allTypeChargeData[j]['amount'];
            } else if (allTypeChargeData[j]['charge_type'] == '6') { // Roaming
                roamingCount++;
                roamingTotalRate = roamingTotalRate + allTypeChargeData[j]['amount'];
            } else if (allTypeChargeData[j]['charge_type'] == '7') { // TC
                TCCount++;
                TCTotalRate = TCTotalRate + allTypeChargeData[j]['amount'];
            } else if (allTypeChargeData[j]['charge_type'] == '8') { //SIP
                SIPCount++;
                SIPTotalRate = SIPTotalRate + allTypeChargeData[j]['amount'];
                feature = "SIP";
            } else if (allTypeChargeData[j]['charge_type'] == '10') { // Outbound Bundle
                outBundleCount++;
                outBundleTotalRate = outBundleTotalRate + allTypeChargeData[j]['amount'];
            } else if (allTypeChargeData[j]['charge_type'] == '9') {
                let retroDIDname = allTypeChargeData[j]['description'] ? (allTypeChargeData[j]['description']).split('-')[1] : '';
                knex(table.tbl_Invoice_Item).insert({
                    invoice_id: '' + invoiceId + '',
                    amount: allTypeChargeData[j]['amount'],
                    description: `${retroDIDname} - Feature Charge`,
                    item_type: '9'
                }).then((response) => {
                    ('Data transfer from charge to invoice item for all Feature Charges.');
                }).catch(err => { (err) });
            }
        }
        if (didRegularCount > 0) {
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: didRegularTotalRate,
                description: 'DID rental charge' + '-' + didRegularCount,
                item_type: '1'
            }).then((response3) => {
                ('Data transfer from charge to invoice item for all did');
            }).catch(err => { (err) });
        }
        if (PSTNCount > 0) {
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: PSTNTotalRate,
                description: 'PSTN Call charges',
                item_type: '2'
            }).then((response3) => {
                ('Data transfer from charge to invoice item for all pstn calls');
            }).catch(err => { (err) });
        }
        if (SMSCount > 0) {
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: SMSTotalRate,
                description: 'SMS charges' + '-' + SMSCount,
                item_type: '3'
            }).then((response3) => {
                console.log('Data transfer from charge to invoice item for all sms charges');
            }).catch(err => { (err) });
        }
        if (bundleCount > 0) {
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: bundleTotalRate,
                description: 'Bundle charges' + '-' + bundleCount,
                item_type: '5'
            }).then((response3) => {
                console.log('Data transfer from charge to invoice item for all bundle charges');
            }).catch(err => { (err) });
        }
        if (roamingCount > 0) {
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: roamingTotalRate,
                description: 'Roaming charges' + '-' + roamingCount,
                item_type: '6'
            }).then((response3) => {
                console.log('Data transfer from charge to invoice item for all roaming charges');
            }).catch(err => { (err) });
        }
        if (TCCount > 0) {
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: TCTotalRate,
                description: 'Tele Consultation charges' + '-' + TCCount,
                item_type: '7'
            }).then((response3) => {
                console.log('Data transfer from charge to invoice item for all tc charges');
            }).catch(err => { console.log(err) });
        }
        if (outBundleCount > 0) {
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: outBundleTotalRate,
                description: 'Outbound Bundle charges' + '-' + outBundleCount,
                item_type: '10'
            }).then((response) => {
                console.log('Data transfer from charge to invoice item for all outbound bundle charges', response);
            }).catch(err => { console.log(err) });
        }
        if (boosterCount > 0) {
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: boosterTotalRate,
                description: 'Booster charges' + '-' + boosterCount,
                item_type: '4'
            }).then((response3) => {
                console.log('Data transfer from charge to invoice item for all Booster charges');
            }).catch(err => { (err) });
        }
        if (SIPCount > 0) {
            ("in sip condition")
            await knex(table.tbl_Invoice_Item).insert({
                invoice_id: '' + invoiceId + '',
                amount: SIPTotalRate,
                description: 'Feature Charges' + '-' + feature,
                item_type: '8'
            }).then((response3) => {
                console.log('Data transfer from charge to invoice item for all SIP charges');
            }).catch(err => { (err) });
        }
        await update_invoice_with_single_entry(invoiceId, customerData.id, customerData.company_name, customerData.email, invoiceNumber, invoice_month, customerData.advance_payment, customerData.created_by, customerData.mobile, customerData.company_address, customerData.invoice_day, customerData.date);
    }

    function generateRandomNumber(length) {
        const numbs = "1234567890";
        let randomNum = '';
        for (let k = 0; k < length; k++) {
            const rnum = Math.floor(Math.random() * numbs.length);
            randomNum += numbs.substring(rnum, rnum + 1);
        }
        return randomNum;
    }

    async function update_invoice_with_single_entry(invoiceId, customer_id, company_name, customer_email, InvoiceNumberDisplay, invoice_month, cust_advance_payment, created_by, mobile, address, invoice_day, customer_created) {
        let dates = new Date();
        let full_date = moment(dates.setDate(invoice_day)).format("YYYY-MM-DD");
        let sql = knex.raw(`select '${full_date}' - INTERVAL 1 MONTH as invoice_period, sum(amount) as amount from pbx_invoice_item where invoice_id = ${invoiceId}`);
        sql.then((response4) => {
            let paid_status = '2';
            var gst_on_amount = 0.00;
            var amount_with_gst = 0.00;
            var cgst_on_amount = 0.00;
            var sgst_on_amount = 0.00;
            var fare_amount = 0.00;
            let invoice_period_day = customer_created;
            if (response4[0][0]['amount'] > 0) {
                paid_status = '2';
                fare_amount = response4[0][0]['amount'].toFixed(2);
                cgst_on_amount = ((response4[0][0]['amount'].toFixed(2) * config.cgst) / 100).toFixed(2);
                sgst_on_amount = ((response4[0][0]['amount'].toFixed(2) * config.sgst) / 100).toFixed(2);
                gst_on_amount = parseFloat(cgst_on_amount) + parseFloat(sgst_on_amount);
                amount_with_gst = parseFloat(response4[0][0]['amount'].toFixed(2)) + parseFloat(cgst_on_amount) + parseFloat(sgst_on_amount);
            } else {
                paid_status = '4';
            }
            knex.from(table.tbl_pbx_invoice_conf)
                .select('*')
                .where('id', created_by)
                .then(async (resp) => {  // get user due date record                    
                    let orgInfo = resp[0];
                    let currentDate = new Date();
                    let currentDate2 = new Date();
                    let current_time = new Date(currentDate.setDate(currentDate.getDate() + orgInfo.payment_day));
                    let current_time_one_less = new Date(currentDate2.setDate(currentDate2.getDate()));
                    let invoiceDueDate = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                    let invoiceDate = current_time_one_less.toISOString().split('T')[0] + ' ' + current_time_one_less.toTimeString().split(' ')[0];
                    console.log("amount =>", response4[0][0]['amount'].toFixed(2), "paid_status =>", paid_status, "cgst_percentage =>", config.cgst, "total_gst_percentage =>", config.gst, "amount_with_gst =>", amount_with_gst, "cgst_amount =>", cgst_on_amount, "sgst_amount =>", sgst_on_amount, "total_gst_amount =>", gst_on_amount, "invoice_period =>", invoice_period_day, "invoice_due_date =>", invoiceDueDate, "advance_balance =>", cust_advance_payment, "invoice_date =>", invoiceDate);
                    let sqls = knex.raw(`update pbx_invoice set amount= ${response4[0][0]['amount'].toFixed(2)}, paid_status= ${paid_status}, cgst_percentage= ${config.cgst}, total_gst_percentage= ${config.gst}, amount_with_gst= ${amount_with_gst}, cgst_amount= ${cgst_on_amount}, sgst_amount= ${sgst_on_amount}, total_gst_amount= ${gst_on_amount}, invoice_period= '${invoice_period_day}', invoice_due_date= '${invoiceDueDate}', advance_balance= ${cust_advance_payment}, invoice_date= '${invoiceDate}' where id = ${invoiceId}`)
                    sqls.then((response5) => {
                        let sql = knex(table.tbl_Charge)
                            .update({
                                charge_status: 1,
                                invoice_status: 1
                            })
                            .where('customer_id', '=', "" + customer_id + "")
                        sql.then((response6) => {
                            knex(table.tbl_Pbx_Invoice + ' as inv').select('inv.*', knex.raw('DATE_FORMAT(inv.invoice_period, "%e/%m/%y") as invoice_periods'), knex.raw('DATE_FORMAT(inv.invoice_due_date, "%e/%m/%y") as invoice_due_dates'), knex.raw('DATE_FORMAT(inv.invoice_date, "%e/%m/%y") as invoice_dates')).where('inv.id', invoiceId).then((response7) => {
                                console.log(response7, "Response 7")
                                let adjustment_payment = 0.00;
                                let final_payment = 0.00;
                                let remaining_advance_balance = 0.00;
                                if (response7[0]['amount_with_gst'] >= response7[0]['advance_balance']) {
                                    adjustment_payment = response7[0]['advance_balance'];
                                } else {
                                    adjustment_payment = response7[0]['amount_with_gst']
                                }
                                final_payment = parseFloat(Number(response7[0]['amount_with_gst'] - adjustment_payment).toFixed(2));
                                if (final_payment < 0) {
                                    remaining_advance_balance = Math.abs(final_payment);
                                    final_payment = Number(response7[0]['amount_with_gst']);
                                }
                                let invoice_period = response7[0]['invoice_periods'] + ' to ' + response7[0]['invoice_dates']
                                let date = new Date();
                                let InvoiceDetail = {
                                    phone: mobile,
                                    userName: company_name,
                                    email: customer_email,
                                    invoice: response7[0]['reference_num'],
                                    total_due_amount: response7[0]['amount_with_gst'].toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    invoice_period: invoice_period,
                                    due_date: response7[0]['invoice_due_dates'],
                                    remaining_advance_balance: remaining_advance_balance ? remaining_advance_balance : response7[0]['previous_invoice_balance'].toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    previous_balance: response7[0]['previous_invoice_balance'].toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    this_month_charge: response7[0]['amount_with_gst'].toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    adjustment: adjustment_payment.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    final_payment: final_payment.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    igst: response7[0]['sgst_amount'],
                                    cgst: response7[0]['cgst_amount'],
                                    total: response7[0]['amount_with_gst'].toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    sub_total: response7[0]['amount'].toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    date: response7[0]['invoice_dates'],
                                    payment_day: orgInfo.payment_day,
                                    payment_detail: orgInfo.payment_detail,
                                    extension: orgInfo.extension,
                                    mobile: orgInfo.mobile,
                                    a_email: orgInfo.email,
                                    gst: orgInfo.gstin,
                                    address: address
                                }
                                let newdata = {
                                    userName: company_name,
                                    email: customer_email,
                                    invoice_number: InvoiceNumberDisplay,
                                    amount: amount_with_gst.toFixed(2),
                                    fare_amount: fare_amount,
                                    gst_amount: gst_on_amount.toFixed(2),
                                    invoice_month: `${invoice_month}` + " " + date.getFullYear(),
                                    final_payment: final_payment.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    due_date: response7[0]['invoice_due_dates'],
                                    invoice_period: invoice_period,
                                    adjustment: adjustment_payment,
                                    sub_total: response7[0]['amount'],
                                    igst: response7[0]['sgst_amount'],
                                    cgst: response7[0]['cgst_amount']
                                };
                                knex(table.tbl_Invoice_Item + ' as inv_item').select('*').where('inv_item.invoice_id', invoiceId).then((response8) => {
                                    let obj = []
                                    response8.map(item => {
                                        obj.push({ item_type: item.item_type, description: item.description, amount: item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 }) });
                                    })
                                    InvoiceDetail.obj = obj;
                                    ejs.renderFile(path.join(__dirname, '../pdfGenerate', "pdf.ejs"), { InvoiceDetail }, (err, data) => {
                                        if (err) {
                                            ("error", err)
                                        } else {
                                            let options = {
                                                "height": "11.25in",
                                                "width": "8.5in",
                                                "header": {
                                                    "height": "20mm"
                                                },
                                                "footer": {
                                                    "height": "20mm",
                                                },
                                            };
                                            pdf.create(data, options).toFile(__dirname + `/../upload/Invoice_${customer_id}.pdf`, function (err, data) {
                                                if (err) {
                                                    ("error", err);
                                                } else {
                                                    console.log("File created successfully", data.filename.split('/')[1], "----", data.filename.split('/'));
                                                    pushEmail.getEmailContentUsingCategory('InvoiceCreation').then(val => {
                                                        pushEmail.sendmail({ data: newdata, val: val, username: company_name, email: customer_email, pdf_file: `Invoice_${customer_id}.pdf` }).then((data1) => {
                                                            console.log('email fired of customer with mail id= ', customer_email, "-----", data1);
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }).catch((err) => { (err) });
                            }).catch((err) => { (err) });
                        }).catch((err) => { (err) });
                    }).catch(err => { (err) });
                    console.log()
                }).catch(err => { (err) });
        }).catch(err => { (err) });
    }

});

cron.schedule("0 04 * * *", function () {  //for every day at 4:00 AM  */25 * * * * * 0 01 * * *
    ("running a task every day at 1:00 AM");
    var now = new Date();
    let sql = knex.from(table.tbl_Call_Plan_Rate)
        .select('*',)
        .where('expiry_date', 'like', "%" + now.toISOString().split('T')[0] + "%")
        (sql.toQuery());
    sql.then((response) => {
        (response);
        for (let i = 0; i < response.length; i++) {
            let actual_minutes = response[i]['actual_minutes'];
            if (actual_minutes == 0) { // its means its purchased by booster and add via booster plan.
                knex(table.tbl_Call_Plan_Rate)
                    .update({
                        booster_minutes: 0,
                        expiry_date: "0000-00-00 00:00:00.000000",
                        actual_minutes: 0,
                    })
                    .then((response) => {
                        ('update booster plan which have date of ', now.toISOString().split('T')[0]);
                    }).catch((err) => { (err) });
            } else {  // its means its add by admin call plan rates
                knex(table.tbl_Call_Plan_Rate)
                    .update({
                        booster_minutes: 0,
                        expiry_date: "0000-00-00 00:00:00.000000",
                        talktime_minutes: 0
                    })
                    .then((response) => {
                        ('update booster plan which have date of ', now.toISOString().split('T')[0]);
                    }).catch((err) => { (err) });
            }

        }
    }).catch((err) => { (err) });
});

cron.schedule("0 06 * * *", function () {  //for every day at 6:00 AM   */25 * * * * * 0 01 * * *
    // cron.schedule("* * * * *", function () {
    var payment_day;
    var late_fee = 0;
    let sql = knex.from(table.tbl_Pbx_Invoice)
        .where('paid_status', '2')
        .select(knex.raw('DATE_FORMAT(invoice_due_date, "%Y-%m-%d") as due_date'), 'customer_id', 'previous_remind_date', knex.raw('DATE_FORMAT(invoice_date, "%d") as inv_date'), 'paid_status', 'amount_with_gst', 'advance_balance', knex.raw('DATE_FORMAT(invoice_due_date, "%d-%m-%Y") as due'))
        (sql.toQuery());
    sql.then(async (response) => {
        await get_invoice_payment_day().then(response1 => {
            payment_day = response1['payment_day'];
            late_fee = response1['late_fee']
        });
        for (let i = 0; i < response.length; i++) {
            customer_invoice_reminder(response[i].previous_remind_date, response[i].due_date, response[i].customer_id, response[i].inv_date, payment_day, late_fee, response[i].paid_status, response[i].amount_with_gst, response[i].advance_balance, response[i].due);
        }
    })

    const customer_invoice_reminder = async (previous_reminder, due_date, customer, inv_date, payment_day, late_fee, paid_status, amount_with_gst, advance_balance, due) => {
        var now = new Date();
        var date = new Date();
        var currentDate = now.getDate();
        var cust_email;
        let flag = 0;
        var company;
        var account_number;
        var is_dunning;
        await getCustomerDetails(customer).then(response2 => {
            if (response2) {
                cust_email = response2['notification_email'] == '' ? response2['email'] : response2['notification_email'];
                company = response2['company_name'];
                account_number = response2['account_number'];
                is_dunning = 1;
            } else {
                is_dunning = 0;
            }
        });
        if (is_dunning == 1) {
            let due_dates = due_date.split('-')[2];
            due_dates = Number(due_dates) + 5;
            let manage_overdue_remind_day = now.setDate(due_dates);
            manage_overdue_remind_day = new Date(manage_overdue_remind_day);
            let finalover = manage_overdue_remind_day.toDateString().split(' ');
            finalover = `${finalover[3]}-0${new Date(manage_overdue_remind_day.toDateString()).getMonth() + 1}-${finalover[2]}`
            let current_date = `${date.getFullYear()}-0${date.getMonth() + 1}-${date.getDate()}`;
            let outgoing_stop_date = date.setDate((Number(due_date.split('-')[2]) + 6));
            let suspend_customer = date.setDate((Number(due_date.split('-')[2]) + 10));
            let final_payment = 0.00;
            let adjustment_payment = 0.00;
            let remaining_advance_balance = 0.00;
            if (Number(amount_with_gst) >= Number(advance_balance)) {
                adjustment_payment = advance_balance;
            } else {
                adjustment_payment = amount_with_gst
            }
            remaining_advance_balance = parseFloat(Math.abs(Number(amount_with_gst) - Number(advance_balance))).toFixed(2);
            final_payment = parseFloat(Number(amount_with_gst - adjustment_payment)).toFixed(2);
            final_payment = parseFloat((Number(final_payment) - Number(remaining_advance_balance))).toFixed(2);
            let amount = final_payment;
            if (moment(due_date, "YYYY-MM-DD").isSameOrAfter(current_date)) {
                // if(true){
                let remind_days = Math.round(Number(payment_day) / 3);
                let remind_date = previous_reminder == 0 ? Number(inv_date) + Number(remind_days) : previous_reminder + remind_days;
                remind_date = date.setDate(remind_date);
                if (paid_status == '2') {
                    if (new Date(remind_date).getDate() == currentDate) {
                        // if(true){
                        update_reminder_date(customer, new Date(remind_date).getDate());
                        let newdata = {
                            userName: "",
                            email: cust_email,
                            final_payment: final_payment.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                            due_date: due,
                            cust_company: company,
                            account: account_number,
                            single_amount: amount
                        }
                        await pushEmail.getEmailContentUsingCategory('InvoiceReminder').then(val => {
                            pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                                ('email fired of customer with mail id= ', "-----", data1);
                            });
                        });
                    } else {
                        ("No reminder for today.")
                    }
                } else {
                    ("invoice status paid.")
                }
            }
            else if (moment(current_date).isSameOrBefore(finalover)) {
                // else if(false){
                let remind_dates = (due_dates % 2 == 0) ? previous_reminder == due_dates ? date.setDate(previous_reminder + 1) : date.setDate(previous_reminder + 2) : date.setDate(previous_reminder + 2);
                if (paid_status == '2') {
                    // let amount = parseFloat((Number(final_payment) - Number(remaining_advance_balance))).toFixed(2);
                    // final_payment = parseFloat((Number(final_payment) - Number(remaining_advance_balance))).toFixed(2);
                    final_payment = parseFloat(Number(final_payment) + Number(late_fee)).toFixed(2);
                    if (new Date(remind_dates).getDate() == currentDate) {
                        // if(true){                 
                        update_reminder_date(customer, new Date(remind_dates).getDate());
                        let newdata = {
                            userName: "",
                            email: cust_email,
                            final_payment: final_payment.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                            cust_company: company,
                            account: account_number,
                            late_fee: late_fee,
                            single_amount: amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                        }
                        await pushEmail.getEmailContentUsingCategory('InvoiceOverDueReminder').then(val => {
                            pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                                ('email fired of customer with mail id= ', "-----");
                            });
                        });
                    } else {
                        ("No reminder for today with late fee.")
                    }
                } else {
                    ("invoice status paid with late fee.")
                }
            }
            else if (new Date(outgoing_stop_date).getDate() == currentDate) {
                // else if(true){
                let obj = {
                    email: cust_email,
                    amount_with_gst: amount_with_gst,
                    advance_balance: advance_balance,
                    late_fee: late_fee,
                    remaining_advance_balance: remaining_advance_balance,
                    company: company,
                    account: account_number
                }
                stopCustomerOutgoing(customer, obj);
            }
            else if (new Date(suspend_customer).getDate() == currentDate) {
                // else if(true){
                // let amount = parseFloat((Number(final_payment) - Number(remaining_advance_balance))).toFixed(2);  
                final_payment = parseFloat(Number(final_payment) + Number(late_fee)).toFixed(2);
                // final_payment = parseFloat(Math.abs(Number(final_payment) - Number(remaining_advance_balance))).toFixed(2);     
                knex.from(table.tbl_Customer).where('id', customer)
                    .update({ 'status': '5' }).then((response) => {
                        ("account suspended for Litigation.")
                        let newdata = {
                            userName: "",
                            email: cust_email,
                            final_payment: final_payment.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                            cust_company: company,
                            account: account_number,
                            late_fee: late_fee,
                            single_amount: amount
                        }
                        pushEmail.getEmailContentUsingCategory('ServiceTermination').then(val => {
                            pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                                ('email fired of customer with mail id= ', "-----");
                            });
                        });
                    }).catch((err) => { (err) });
            }
        }
    }

    const update_reminder_date = async (customer, reminder) => {
        await knex(table.tbl_Pbx_Invoice).where('customer_id', customer).update({ previous_remind_date: reminder }).then((response1) => {
            ("previous reminder date update.")
        }).catch((err) => { (err) });
    }

    const get_invoice_payment_day = async () => {
        return knex(table.tbl_pbx_invoice_conf).select('payment_day', 'late_fee').then((response) => {
            if (response) {
                return response[0];
            }
        }).catch((err) => { (err) });
    }

    const getCustomerDetails = async (customer) => {
        return knex.from(table.tbl_Customer).select('notification_email', 'company_name', 'account_number').where('id', customer).andWhere('dunning', '1').then((response) => {
            if (response.length) {
                return response[0];
            } else {
                return false
            }
        }).catch((err) => { (err) });
    }

    const stopCustomerOutgoing = async (customer, obj) => {
        await knex.from(table.tbl_Customer).where('id', customer)
            .update({ 'customer_outgoing': 1 }).then((response) => {
                ("outgoing stop for this customer due to unpaid invoice.");
                let final_payment = 0.00;
                let adjustment_payment = 0.00;
                if (obj.amount_with_gst >= obj.advance_balance) {
                    adjustment_payment = obj.advance_balance;
                } else {
                    adjustment_payment = obj.amount_with_gst
                }
                final_payment = parseFloat(Number(obj.amount_with_gst - adjustment_payment)).toFixed(2);
                final_payment = parseFloat(Number(final_payment) + Number(obj.late_fee)).toFixed(2);
                final_payment = parseFloat(Math.abs(Number(final_payment) - Number(obj.remaining_advance_balance))).toFixed(2);
                let amount = parseFloat(Number(obj.amount_with_gst - adjustment_payment)).toFixed(2)
                let newdata = {
                    userName: "",
                    email: obj.email,
                    final_payment: final_payment.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                    cust_company: obj.company,
                    account: obj.account_number,
                    late_fee: obj.late_fee,
                    single_amount: parseFloat(Math.abs(Number(amount) - Number(obj.remaining_advance_balance))).toFixed(2)
                }
                pushEmail.getEmailContentUsingCategory('OutgoingStop').then(val => {
                    pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                        console.log('email fired of customer with mail id= ', "-----", newdata);
                    });
                });
            }).catch((err) => { (err) });
    }
});
module.exports = cronTest;

