const { features } = require("process");
const { knex } = require("../config/knex.db");
const table = require("../config/table.macros");
const { createModuleLog } = require("../helper/modulelogger");
let pushEmail = require("./pushEmail");

function callPlanName(id) {
  var a = knex(table.tbl_Call_Plan).select("name").where("id", id);
  return a.then((response) => {
    return response[0]["name"];
  });
}

function featureName(id) {
  var feature = knex(table.tbl_pbx_feature_plan).select("name").where("id", id);
  return feature.then((response) => {
    return response[0]["name"];
  });
}

function smsName(id) {
  var sms = knex(table.tbl_pbx_SMS).select("name").where("id", id);
  return sms.then((response) => {
    return response[0]["name"];
  });
}

// function minutePlanName(id,type) { //one to one mapping
//     var minute = knex(table.tbl_pbx_bundle_plan).select('name').where('id',id).andWhere('plan_type',type)
//     return minute.then((response) => {
//         return response[0]['name']
//     })

// }

function minutePlanName(id, type) {
  var minute = knex(table.tbl_Call_Plan + ' as cp').leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpefm', 'cp.id', 'bpefm.bundle_plan_id').distinct('cp.name').select(knex.raw('(cp.charge + sum(bpefm.charge)) as charge')).where('cp.id', id).andWhere('cp.plan_type', "" + type + "")
  return minute.then((response) => {
    if (response.length) {
      return response
    }
  })
}

//create---pkg_feat, pkg ->   **--its fresh package creation--**
function postPbxFeature(req, res) {
  let data = req.body.feature;
  let modified_by = req.userId;
  let black_list = "1";
  // if (black_list === true) {
  //     black_list = '1';
  // } else {
  //     black_list = '0';
  // }
  let vm_limit = data.vm_limit;
  if (vm_limit === "") {
    vm_limit = "10"; //default wiil be 10
  }
  if (vm_limit >= 1) {
    voice_mail = "1";
  } else {
    voice_mail = "0"; //default wiil be 1
  }

  let file_storage_duration = data.file_storage_duration;
  if (file_storage_duration === "") {
    file_storage_duration = "30"; //default wiil be 30
  }
  //change on 24 sept 2019
  let pbx_recording = data.pbx_recording;
  if (pbx_recording === true) {
    pbx_recording = "1";
  } else {
    pbx_recording = "0";
  }

  let customPrompt = data.custom_prompts;
  if (customPrompt === true) {
    customPrompt = "1";
  } else {
    customPrompt = "0";
  }

  let file_storage_size = data.file_storage_size;
  if (file_storage_size === "") {
    file_storage_size = "1"; //default wiil be 1
  }

  let storage = data.storage;
  if (storage === true) {
    storage = "1";
  } else {
    storage = "0";
    pbx_recording = "0";
    customPrompt = "0";
    file_storage_size = "1"; //default wiil be 1
    vm_limit = "10"; //default wiil be 10
    file_storage_duration = "30"; //default wiil be 30
  }
  //change on 24 sept 2019 end ----//
  let ivr = data.ivr;
  if (ivr === true) {
    ivr = "1";
  } else {
    ivr = "0";
  }

  let call_transfer = data.call_transfer;
  if (call_transfer === true) {
    call_transfer = "1";
  } else {
    call_transfer = "0";
  }

  let forward = data.forward;
  if (forward === true) {
    forward = "1";
  } else {
    forward = "0";
  }
  let call_plan = data.call_plan;
  let circle = data.circle;
  let featureRate = data.featureRate;
  let outbound = data.outbound;
  let sms = data.sms;
  let isSMSTypCustom = data.isSMSTypCustom; //isSMSTypCustom
  let bundle_plan_id = data.bundle_plan_id != "" ? data.bundle_plan_id : 0;
  let out_bundle_call_plan_id = data.out_bundle_call_plan_id != "" ? data.out_bundle_call_plan_id : 0;
  let roaming_plan_id = data.roaming_plan_id != "" ? data.roaming_plan_id : 0;
  let teleConsultancy_call_plan_id =
    data.teleConsultancy_call_plan_id != ""
      ? data.teleConsultancy_call_plan_id
      : 0;

  if (outbound === true) {
    outbound = "1";
    //let gateway_group = data.outbound;
  } else {
    outbound = "0";
    //let gateway_group = '';
    call_plan = "";
    circle = "";
  }
  let music_on_hold = data.music_on_hold;
  if (music_on_hold === true) {
    music_on_hold = "1";
  } else {
    music_on_hold = "0";
  }
  let paging = data.caller_id;
  if (paging === true) {
    paging = "1";
  } else {
    paging = "0";
  }
  let speed_dial = data.speed_dial;
  if (speed_dial === true) {
    speed_dial = "1";
  } else {
    speed_dial = "0";
  }
  let call_group = data.call_group;
  if (call_group === true) {
    call_group = "1";
  } else {
    call_group = "0";
  }

  let dynamic_ivr = data.dynamic_ivr;
  if (dynamic_ivr === true) {
    dynamic_ivr = "1";
  } else {
    dynamic_ivr = "0";
  }

  let voicebot = data.voicebot;
  if (voicebot === true) {
    voicebot = "1";
  } else {
    voicebot = "0";
  }

  let conference = data.conference;
  if (conference === true) {
    conference = "1";
  } else {
    conference = "0";
  }
  let queue = data.queue;
  if (queue === true) {
    queue = "1";
  } else {
    queue = "0";
  }
  let call_barging = data.call_barging;
  if (call_barging === true) {
    call_barging = "1";
  } else {
    call_barging = "0";
  }
  let concurrent_call = data.concurrent_call;
  if (concurrent_call === "") {
    concurrent_call = "0";
  }
  let obd_channal_limit = data.obd_channal_limit;
  if (obd_channal_limit === "" || obd_channal_limit === null) {
    obd_channal_limit = "0";
  }
  let cps = data.cps;
  if (cps === "" || cps === null) {
    cps = "0";
  }

  let phone_book = data.phone_book;
  if (phone_book === "") {
    phone_book = "0";
  }

  let ring_time_out = data.ring_time_out;
  if (ring_time_out === "") {
    ring_time_out = "0";
  }

  let extension_limit = data.extension_limit;
  if (extension_limit === "") {
    extension_limit = "0";
  }
  let click2call = data.click2call;
  if (click2call === true) {
    click2call = "1";
  } else {
    click2call = "0";
  }
  let oneToOneVideoCall = data.one_to_one_video_call;
  if (oneToOneVideoCall === true) {
    oneToOneVideoCall = "1";
  } else {
    oneToOneVideoCall = "0";
  }
  let findMeFollowMe = data.find_me_follow_me;
  if (findMeFollowMe === true) {
    findMeFollowMe = "1";
  } else {
    findMeFollowMe = "0";
  }
  let billing_type = data.billing_type;
  if (
    billing_type == "Enterprise with pool" ||
    billing_type == "Enterprise without pool"
  ) {
    outbound = "1";
  }

  let isCircle = data.isCircle;
  if (isCircle === true) {
    isCircle = "1";
  } else {
    isCircle = "0";
  }
  let isFeatureRate = data.isFeatureRate;
  if (isFeatureRate === true) {
    isFeatureRate = "1";
  } else {
    isFeatureRate = "0";
    featureRate = "";
  }
  let isCustomeACL = data.custom_acl;
  if (isCustomeACL === true) {
    isCustomeACL = "1";
  } else {
    isCustomeACL = "0";
  }
  let isCallerID = data.caller_id;
  if (isCallerID === true) {
    isCallerID = "1";
  } else {
    isCallerID = "0";
  }
  let isTrunk = data.sip_trunk;
  if (isTrunk === true) {
    isTrunk = "1";
  } else {
    isTrunk = "0";
  }

  let isBroadcast = data.broadcast;
  if (isBroadcast === true) {
    isBroadcast = "1";
  } else {
    isBroadcast = "0";
  }

  let isSMS = data.isSms; //isSms
  if (isSMS === true) {
    isSMS = "1";
  } else {
    isSMS = "0";
    sms = "";
    isSMSTypCustom = "0";
  }

  let isTeleConsultancy = data.teleConsultancy;
  if (isTeleConsultancy === true) {
    isTeleConsultancy = "1";
  } else {
    isTeleConsultancy = "0";
  }

  let isfeedbackCall = data.feedback_call; // feedback call
  if (isfeedbackCall === true) {
    isfeedbackCall = "1";
  } else {
    isfeedbackCall = "0";
  }

  let isStickyAgent = data.sticky_agent; // sticky agent
  if (isStickyAgent === true) {
    isStickyAgent = "1";
  } else {
    isStickyAgent = "0";
  }

  let isGeoTracking = data.geo_tracking; // geo tracking
  if (isGeoTracking === true) {
    isGeoTracking = "1";
  } else {
    isGeoTracking = "0";
  }

  let isMissCallAlert = data.miss_call_alert; // miss call alert
  if (isMissCallAlert === true) {
    isMissCallAlert = "1";
  } else {
    isMissCallAlert = "0";
  }

  let isPlayback = data.playback; //playback
  if (isPlayback === true) {
    isPlayback = "1";
  } else {
    isPlayback = "0";
  }

  let isAppointment = data.appointment; // Appointment
  if (isAppointment === true) {
    isAppointment = "1";
  } else {
    isAppointment = "0";
  }

  let isWhatsapp = data.whatsapp; // whatsapp
  if (isWhatsapp === true) {
    isWhatsapp = "1";
  } else {
    isWhatsapp = "0";
  }

  let isMinutePlan = data.is_minute_plan; // Minute Plan
  if (isMinutePlan === true) {
    isMinutePlan = "1";
  } else {
    isMinutePlan = "0";
  }

  let isBundle = data.is_bundle; // DID Bundle Type
  if (isBundle === true) {
    isBundle = "1";
  } else {
    isBundle = "0";
  }
  let OutBundle = data.out_bundle; // OutGoing  Bundle Type
  if (OutBundle === true) {
    OutBundle = "1";
  } else {
    OutBundle = "0";
  }

  let isRoaming = data.is_roaming; // Roaming Type
  if (isRoaming === true) {
    isRoaming = "1";
  } else {
    isRoaming = "0";
  }

  let isOutboundConf = data.outbound_conference; // Outbound Conference
  if (isOutboundConf === true) {
    isOutboundConf = "1";
  } else {
    isOutboundConf = "0";
  }

  let isOBD = data.outbound_broadcast; // Outbound Broadcast
  if (isOBD === true) {
    isOBD = "1";
  } else {
    isOBD = "0";
  }

  let isBooster = data.is_bundle ? "1" : data.is_roaming ? "1" : "0";

  let package_name = data.package_name;
  let package_duration =
    data.package_duration != "" ? data.package_duration : "0";
  let minute_balance = data.minute_balance;
  let isAutoRenewal = data.is_auto_renewal;
  if (isAutoRenewal === true) {
    isAutoRenewal = "1";
  } else {
    isAutoRenewal = "0";
  }

  let expired_at =
    package_duration != 0
      ? new Date(new Date().getTime() + package_duration * 24 * 60 * 60 * 1000)
      : new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
  let subscription = data.subscription;

  let sql = knex(table.tbl_PBX_features).insert({
    black_list: "" + black_list + "",
    voicemail: "" + voice_mail + "",
    ivr: "" + ivr + "",
    call_transfer: "" + call_transfer + "",
    forward: "" + forward + "",
    concurrent_call: "" + concurrent_call + "",
    recording: "" + pbx_recording + "",
    phone_book: "" + phone_book + "",
    outbound_call: outbound,
    click_to_call: "" + click2call + "",
    music_on_hold: "" + music_on_hold + "",
    paging: "" + paging + "",
    speed_dial: "" + speed_dial + "",
    ring_time_out: "" + ring_time_out + "",
    call_group: "" + call_group + "",
    conference: "" + conference + "",
    billing_type: "" + billing_type + "",
    barging: "" + call_barging + "",
    extension_limit: "" + extension_limit + "",
    file_storage_duration: "" + file_storage_duration + "",
    status: "1",
    voicemail_limit: "" + vm_limit + "",
    storage: "" + storage + "",
    custom_prompt: "" + customPrompt + "",
    file_storage_size: "" + file_storage_size + "",
    queue: "" + queue + "",
    minute_balance: "" + minute_balance + "",
    call_plan_id: "" + call_plan + "",
    find_me_follow_me: "" + findMeFollowMe + "",
    one_to_one_video_call: "" + oneToOneVideoCall + "",
    is_circle: "" + isCircle + "",
    circle_id: "" + circle + "",
    is_feature_rate: "" + isFeatureRate + "",
    feature_rate_id: "" + featureRate + "",
    custom_acl: "" + isCustomeACL + "",
    CID_routing: "" + isCallerID + "",
    broadcasting: "" + isBroadcast + "",
    is_sms: "" + isSMS + "",
    sms_id: "" + sms + "",
    teleconsultation: "" + isTeleConsultancy + "",
    subscription: "" + subscription + "",
    feed_back_call: "" + isfeedbackCall + "",
    sticky_agent: "" + isStickyAgent + "",
    geo_tracking: "" + isGeoTracking + "",
    miss_call_alert: "" + isMissCallAlert + "",
    playback: "" + isPlayback + "",
    is_sms_type_custom: "" + isSMSTypCustom + "",
    appointment: "" + isAppointment + "",
    whatsapp: "" + isWhatsapp + "",
    minute_plan: "" + isMinutePlan + "",
    is_bundle_type: "" + isBundle + "",
    out_bundle_type: "" + OutBundle + "",
    bundle_plan_id: "" + bundle_plan_id + "",
    out_bundle_call_plan_id: "" + out_bundle_call_plan_id + "",
    is_roaming_type: "" + isRoaming + "",
    roaming_plan_id: "" + roaming_plan_id + "",
    is_booster_plan: "" + isBooster + "",
    teleConsultancy_call_plan_id: "" + teleConsultancy_call_plan_id + "",
    sip_trunk: "" + isTrunk + "",
    outbound_conference: "" + isOutboundConf + "",
    obd: "" + isOBD + "",
    obd_channel: "" + obd_channal_limit + "",
    obd_cps: "" + cps + "",
    dynamic_ivr: "" + dynamic_ivr + "",
    voicebot: "" + voicebot + "",
  });
  sql
    .then((response) => {
      let lastInsertedId = response;
      knex(table.tbl_Package)
        .insert({
          name: knex.raw('TRIM("' + package_name + '")'),
          product_id: "1",
          feature_id: "" + lastInsertedId + "",
          duration: "" + package_duration + "",
          renew: "" + isAutoRenewal + "",
          expired_at: expired_at,
          status: "1",
        })
        .then(async (response2) => {
          // All features mapped into obj thn its stored in DB via JSON.stringify()
          let obj = [];
          let packageId = response2;

          let call_plan_name;
          let feature_plan_name;
          let sms_name;
          let bundle_name;
          let out_bundle_name;
          let roaming_name;
          let tc_name;
          if (call_plan) {
            call_plan_name = await callPlanName(call_plan);
          }
          if (featureRate) {
            feature_plan_name = await featureName(featureRate);
          }
          if (sms) {
            sms_name = await smsName(sms);
          }
          if (bundle_plan_id) {
            const bundle_data = await minutePlanName(bundle_plan_id, 1);
            bundle_name = bundle_data[0]['name'];
            obj.push({ minute_plan: bundle_name, charge: bundle_data[0]['charge'] == null ? 0 : bundle_data[0]['charge'], plan_type: '1', package_id: packageId });
          }
          if (roaming_plan_id) {
            const roaming_data = await minutePlanName(roaming_plan_id, 2);
            roaming_name = roaming_data[0]['name'];
            obj.push({ minute_plan: roaming_name, charge: roaming_data[0]['charge'] == null ? 0 : roaming_data[0]['charge'], plan_type: '2', package_id: packageId });
          }
          if (teleConsultancy_call_plan_id) {
            const tc_data = await minutePlanName(teleConsultancy_call_plan_id, 4);
            tc_name = tc_data[0]['name'];
            obj.push({ minute_plan: tc_name, charge: tc_data[0]['charge'] == null ? 0 : tc_data[0]['charge'], plan_type: '4', package_id: packageId });
          }
          if (out_bundle_call_plan_id) {
            const out_bundle_data = await minutePlanName(out_bundle_call_plan_id, 5);
            out_bundle_name = out_bundle_data[0]['name'];
            obj.push({ minute_plan: out_bundle_name, charge: out_bundle_data[0]['charge'] == null ? 0 : out_bundle_data[0]['charge'], plan_type: '5', package_id: packageId });
          }

          let allFeatures = {
            black_list: "" + black_list + "",
            voicemail: "" + voice_mail + "",
            ivr: "" + ivr + "",
            call_transfer: "" + call_transfer + "",
            forward: "" + forward + "",
            concurrent_call: "" + concurrent_call + "",
            recording: "" + pbx_recording + "",
            phone_book: "" + phone_book + "",
            outbound_call: outbound,
            click_to_call: "" + click2call + "",
            music_on_hold: "" + music_on_hold + "",
            paging: "" + paging + "",
            speed_dial: "" + speed_dial + "",
            ring_time_out: "" + ring_time_out + "",
            call_group: "" + call_group + "",
            conference: "" + conference + "",
            billing_type: "" + billing_type + "",
            barging: "" + call_barging + "",
            extension_limit: "" + extension_limit + "",
            file_storage_duration: "" + file_storage_duration + "",
            status: "1",
            voicemail_limit: "" + vm_limit + "",
            storage: "" + storage + "",
            custom_prompt: "" + customPrompt + "",
            file_storage_size: "" + file_storage_size + "",
            queue: "" + queue + "",
            minute_balance: "" + minute_balance + "",
            call_plan_id: "" + call_plan_name + "",
            find_me_follow_me: "" + findMeFollowMe + "",
            one_to_one_video_call: "" + oneToOneVideoCall + "",
            is_circle: "" + isCircle + "",
            circle_id: "" + circle + "",
            is_feature_rate: "" + isFeatureRate + "",
            feature_rate_id: "" + feature_plan_name + "",
            custom_acl: "" + isCustomeACL + "",
            CID_routing: "" + isCallerID + "",
            broadcasting: "" + isBroadcast + "",
            is_sms: "" + isSMS + "",
            sms_id: "" + sms_name + "",
            teleconsultation: "" + isTeleConsultancy + "",
            subscription: "" + subscription + "",
            feed_back_call: "" + isfeedbackCall + "",
            sticky_agent: "" + isStickyAgent + "",
            geo_tracking: "" + isGeoTracking + "",
            miss_call_alert: "" + isMissCallAlert + "",
            playback: "" + isPlayback + "",
            is_sms_type_custom: "" + isSMSTypCustom + "",
            appointment: "" + isAppointment + "",
            whatsapp: "" + isWhatsapp + "",
            minute_plan: "" + isMinutePlan + "",
            is_bundle_type: "" + isBundle + "",
            bundle_plan_id: "" + bundle_name + "",
            out_bundle_type: "" + OutBundle + "",
            out_bundle_call_plan_id: "" + out_bundle_name + "",
            is_roaming_type: "" + isRoaming + "",
            roaming_plan_id: "" + roaming_name + "",
            teleConsultancy_call_plan_id: "" + tc_name + "",
            outbound_conference: "" + isOutboundConf + "",
            obd: "" + isOBD + "",
            obd_channel: "" + obd_channal_limit + "",
            obd_cps: "" + cps + "",
            dynamic_ivr: "" + dynamic_ivr + "",
            voicebot: "" + voicebot + "",
          };
          let allFeature = knex(table.tbl_pbx_pkg_logs)
            .insert({
              package_id: packageId,
              product_id: "1",
              feature_id: "" + lastInsertedId + "",
              action: "New Package Created",
              assign_customer_id: "",
              all_features: "" + JSON.stringify(allFeatures) + "",
            })
            .returning("id")
          allFeature.then(async (id, response3) => {
            await createModuleLog(table.tbl_pbx_package_detail_history, {
              package_id: id, // it will be implemented later
              action: "New Package Detail Created",
              modified_by,
              data: "" + JSON.stringify(allFeatures) + "",
            });
            if (teleConsultancy_call_plan_id || bundle_plan_id || roaming_plan_id || out_bundle_call_plan_id) {
              await knex(table.tbl_pbx_minutePlan_history).insert(obj).then((response4) => {
                res.json({
                  response4,
                });
              }).catch((err) => {
                res
                  .status(401)
                  .send({ error: "error", message: "DB Error: " + err.message });
                throw err;
              })
            } else {
              res.json({
                response2,
              });
            }
          })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ error: "error", message: "DB Error: " + err.message });
              throw err;
            });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

//case:1existing pkg-update ---if assign pkg already to user --new pkg create
function customPostPbxFeature(req, res) {
  let data = req.body.feature.form_data;
  let custmerIds = req.body.feature.customer_id;
  let black_list = "1";
  // if (black_list === true || black_list === 1) {
  //     black_list = '1';
  // } else {
  //     black_list = '0';
  // }
  //--------------------------------------------------
  let vm_limit = data.vm_limit;
  if (vm_limit === "") {
    vm_limit = "10"; //default wiil be 10
  }
  if (vm_limit >= 1) {
    voice_mail = "1";
  } else {
    voice_mail = "0"; //default wiil be 1
  }

  let file_storage_duration = data.file_storage_duration;
  if (file_storage_duration === "") {
    file_storage_duration = "30"; //default wiil be 30
  }
  //change on 24 sept 2019
  let pbx_recording = data.pbx_recording;
  if (pbx_recording === true || pbx_recording === 1) {
    pbx_recording = "1";
  } else {
    pbx_recording = "0";
  }

  let customPrompt = data.custom_prompts;
  if (customPrompt === true || customPrompt === 1 || customPrompt == "true") {
    customPrompt = "1";
  } else {
    customPrompt = "0";
  }

  let file_storage_size = data.file_storage_size;
  if (file_storage_size === "") {
    file_storage_size = "1"; //default wiil be 1
  }

  let storage = data.storage;
  if (storage === true || storage === 1) {
    storage = "1";
  } else {
    storage = "0";
    pbx_recording = "0";
    customPrompt = "0";
    file_storage_size = "1"; //default wiil be 1
    vm_limit = "10"; //default wiil be 10
    file_storage_duration = "30"; //default wiil be 30
  }
  //change on 24 sept 2019 end ----//
  //---------------------------------------------------------------------
  let ivr = data.ivr;
  if (ivr === true || ivr === 1) {
    ivr = "1";
  } else {
    ivr = "0";
  }
  let call_transfer = data.call_transfer;
  if (call_transfer === true || call_transfer === 1) {
    call_transfer = "1";
  } else {
    call_transfer = "0";
  }

  let forward = data.forward;
  if (forward === true || forward === 1) {
    forward = "1";
  } else {
    forward = "0";
  }
  let call_plan = data.call_plan;
  let sms = data.sms;
  let circle = data.circle;
  let featureRate = data.featureRate;
  let SMS = data.sms;
  let outbound = data.outbound;
  let bundle_plan_id = data.bundle_plan_id != "" ? data.bundle_plan_id : 0;
  let roaming_plan_id = data.roaming_plan_id != "" ? data.roaming_plan_id : 0;
  let out_bundle_call_plan_id = data.out_bundle_call_plan_id != "" ? data.out_bundle_call_plan_id : 0;
  let teleConsultancy_call_plan_id =
    data.teleConsultancy_call_plan_id != ""
      ? data.teleConsultancy_call_plan_id
      : 0;        

  if (outbound === true || outbound === 1) {
    outbound = "1";
  } else {
    outbound = "0";
    call_plan = "";
    circle = "";
  }
  let music_on_hold = data.music_on_hold;
  if (music_on_hold === true || music_on_hold === 1) {
    music_on_hold = "1";
  } else {
    music_on_hold = "0";
  }
  let paging = data.caller_id;
  if (paging === true || paging === 1) {
    paging = "1";
  } else {
    paging = "0";
  }
  let speed_dial = data.speed_dial;
  if (speed_dial === true || speed_dial === 1) {
    speed_dial = "1";
  } else {
    speed_dial = "0";
  }
  let call_group = data.call_group;
  if (call_group === true || call_group === 1) {
    call_group = "1";
  } else {
    call_group = "0";
  }
  let conference = data.conference;
  if (conference === true || conference === 1) {
    conference = "1";
  } else {
    conference = "0";
  }
  let queue = data.queue;
  if (queue === true || queue === 1) {
    queue = "1";
  } else {
    queue = "0";
  }
  let call_barging = data.call_barging;
  if (call_barging === true || call_barging === 1) {
    call_barging = "1";
  } else {
    call_barging = "0";
  }
  let concurrent_call = data.concurrent_call;
  if (concurrent_call === "") {
    concurrent_call = "0";
  }
  let obd_channal_limit = data.obd_channal_limit;
  if (obd_channal_limit === "" || obd_channal_limit === null) {
    obd_channal_limit = "0";
  }
  let cps = data.cps;
  if (cps === "" || cps === null) {
    cps = "0";
  }
  let phone_book = data.phone_book;
  if (phone_book === "") {
    phone_book = "0";
  }
  let ring_time_out = data.ring_time_out;
  if (ring_time_out === "") {
    ring_time_out = "0";
  }
  let extension_limit = data.extension_limit;
  if (extension_limit === "") {
    extension_limit = "0";
  }
  let click2call = data.click2call;
  if (click2call === true || click2call === 1) {
    click2call = "1";
  } else {
    click2call = "0";
  }
  let oneToOneVideoCall = data.one_to_one_video_call;
  if (oneToOneVideoCall === true || oneToOneVideoCall === 1) {
    oneToOneVideoCall = "1";
  } else {
    oneToOneVideoCall = "0";
  }
  let findMeFollowMe = data.find_me_follow_me;
  if (findMeFollowMe === true || findMeFollowMe === 1) {
    findMeFollowMe = "1";
  } else {
    findMeFollowMe = "0";
  }
  let billing_type = data.billing_type;
  if (
    billing_type == "Enterprise with pool" ||
    billing_type == "Enterprise without pool"
  ) {
    outbound = "1";
  }
  let isCircle = data.isCircle;
  if (isCircle === true) {
    isCircle = "1";
  } else {
    isCircle = "0";
  }

  let isFeatureRate = data.isFeatureRate;
  if (isFeatureRate === true) {
    isFeatureRate = "1";
  } else {
    isFeatureRate = "0";
    featureRate = "";
  }

  let isCustomeACL = data.custom_acl;
  if (isCustomeACL === true) {
    isCustomeACL = "1";
  } else {
    isCustomeACL = "0";
  }
  let isCallerID = data.caller_id;
  if (isCallerID === true) {
    isCallerID = "1";
  } else {
    isCallerID = "0";
  }

  let isfeedbackCall = data.feedback_call; // feedback call
  if (isfeedbackCall === true) {
    isfeedbackCall = "1";
  } else {
    isfeedbackCall = "0";
  }

  let isStickyAgent = data.sticky_agent; // sticky agent
  if (isStickyAgent === true) {
    isStickyAgent = "1";
  } else {
    isStickyAgent = "0";
  }

  let isGeoTracking = data.geo_tracking; // geo tracking
  if (isGeoTracking === true) {
    isGeoTracking = "1";
  } else {
    isGeoTracking = "0";
  }

  let isMissCallAlert = data.miss_call_alert; // miss call alert
  if (isMissCallAlert === true) {
    isMissCallAlert = "1";
  } else {
    isMissCallAlert = "0";
  }

  let isPlayback = data.playback; //playback
  if (isPlayback === true) {
    isPlayback = "1";
  } else {
    isPlayback = "0";
  }

  let isAppointment = data.appointment; //Appointment
  if (isAppointment === true) {
    isAppointment = "1";
  } else {
    isAppointment = "0";
  }
  let isBroadcast = data.broadcast;
  if (isBroadcast === true) {
    isBroadcast = "1";
  } else {
    isBroadcast = "0";
  }
  let isSMS = data.isSms;
  if (isSMS === true) {
    isSMS = "1";
  } else {
    isSMS = "0";
  }
  let isSip_trunk = data.sip_trunk;
  if (isSip_trunk === true) {
    isSip_trunk = "1";
  } else {
    isSip_trunk = "0";
  }
  let isWhatsapp = data.whatsapp; // whatsapp
  if (isWhatsapp === true) {
    isWhatsapp = "1";
  } else {
    isWhatsapp = "0";
  }

  let isMinutePlan = data.is_minute_plan; // Minute Plan
  if (isMinutePlan === true) {
    isMinutePlan = "1";
  } else {
    isMinutePlan = "0";
  }

  let isBundle = data.is_bundle; // Bundle Type
  if (isBundle === true) {
    isBundle = "1";
  } else {
    isBundle = "0";
  }

  let isRoaming = data.is_roaming; // Roaming Type
  if (isRoaming === true) {
    isRoaming = "1";
  } else {
    isRoaming = "0";
  }

  let OutBundle = data.out_bundle; // out bundle Type
  if (OutBundle === true) {
    OutBundle = "1";
  } else {
    OutBundle = "0";
  }


  let isTc = data.teleConsultancy; // Tc Type
  if (isTc === true) {
    isTc = "1";
  } else {
    isTc = "0";
  }


  let isOutboundConf = data.outbound_conference; // Outbound Conference
  if (isOutboundConf === true) {
    isOutboundConf = "1";
  } else {
    isOutboundConf = "0";
  }

  let isOBD = data.outbound_broadcast; // Outbound broadcast
  if (isOBD === true) {
    isOBD = "1";
  } else {
    isOBD = "0";
  }

  let package_name = req.body.feature.package_old_name;
  let package_duration = data.package_duration;
  let minute_balance = data.minute_balance;
  let isAutoRenewal = data.is_auto_renewal;
  if (isAutoRenewal === true || isAutoRenewal === 1) {
    isAutoRenewal = "1";
  } else {
    isAutoRenewal = "0";
  }

  let expired_at =
    package_duration != 0
      ? new Date(new Date().getTime() + package_duration * 24 * 60 * 60 * 1000)
      : new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);

  let sql = knex(table.tbl_PBX_features).insert({
    black_list: "" + black_list + "",
    voicemail: "" + voice_mail + "",
    ivr: "" + ivr + "",
    call_transfer: "" + call_transfer + "",
    forward: "" + forward + "",
    concurrent_call: "" + concurrent_call + "",
    recording: "" + pbx_recording + "",
    phone_book: "" + phone_book + "",
    outbound_call: outbound,
    click_to_call: "" + click2call + "",
    music_on_hold: "" + music_on_hold + "",
    paging: "" + paging + "",
    speed_dial: "" + speed_dial + "",
    ring_time_out: "" + ring_time_out + "",
    call_group: "" + call_group + "",
    conference: "" + conference + "",
    billing_type: "" + data.billing_type + "",
    barging: "" + call_barging + "",
    extension_limit: "" + extension_limit + "",
    file_storage_duration: "" + file_storage_duration + "",
    status: "1",
    voicemail_limit: "" + vm_limit + "",
    storage: "" + storage + "",
    custom_prompt: "" + customPrompt + "",
    file_storage_size: "" + file_storage_size + "",
    queue: "" + queue + "",
    minute_balance: "" + minute_balance + "",
    call_plan_id: "" + call_plan + "",
    find_me_follow_me: "" + findMeFollowMe + "",
    one_to_one_video_call: "" + oneToOneVideoCall + "",
    is_circle: "" + isCircle + "",
    circle_id: "" + circle + "",
    is_feature_rate: "" + isFeatureRate + "",
    feature_rate_id: "" + featureRate + "",
    sms_id: "" + SMS + "",
    custom_acl: "" + isCustomeACL + "",
    CID_routing: "" + isCallerID + "",
    feed_back_call: "" + isfeedbackCall + "",
    sticky_agent: "" + isStickyAgent + "",
    geo_tracking: "" + isGeoTracking + "",
    miss_call_alert: "" + isMissCallAlert + "",
    playback: "" + isPlayback + "",
    appointment: "" + isAppointment + "",
    broadcasting: "" + isBroadcast + "",
    is_sms: "" + isSMS + "",
    sip_trunk: "" + isSip_trunk + "",
    whatsapp: "" + isWhatsapp + "",
    minute_plan: "" + isMinutePlan + "",
    is_bundle_type: "" + isBundle + "",
    bundle_plan_id: "" + bundle_plan_id + "",
    is_roaming_type: "" + isRoaming + "",
    roaming_plan_id: "" + roaming_plan_id + "",
    teleConsultancy_call_plan_id: "" + teleConsultancy_call_plan_id + "",
    outbound_conference: "" + isOutboundConf + "",
    obd: "" + isOBD + "",
    obd_channel: "" + obd_channal_limit + "",
    obd_cps: "" + cps + "",
    teleconsultation: "" + isTc + "",
    out_bundle_type: "" + OutBundle + "",
    out_bundle_call_plan_id: "" + out_bundle_call_plan_id + ""
  });
  sql
    .then((response) => {
      let lastInsertedId = response;
      knex(table.tbl_Package)
        .insert({
          name: knex.raw('TRIM("' + package_name + '")'),
          product_id: "1",
          feature_id: "" + lastInsertedId + "",
          duration: "" + package_duration + "",
          renew: "" + isAutoRenewal + "",
          expired_at: expired_at,
          status: "1",
        })
        .then(async (resp) => {
          let package_id = resp;
          let obj = {};

          let call_plan_name;
          let feature_plan_name;
          let sms_name;
          let bundle_name;
          let out_bundle_name;
          let roaming_name;
          let tc_name;
          if (call_plan) {
            call_plan_name = await callPlanName(call_plan);
          }
          if (featureRate) {
            feature_plan_name = await featureName(featureRate);
          }
          if (sms) {
            sms_name = await smsName(sms);
          }
          if (bundle_plan_id) {
            const bundle_data = await minutePlanName(bundle_plan_id, 1);
            bundle_name = bundle_data[0]['name'];
            obj.bundle_plan_name = bundle_name;
            obj.bundle_plan_charge = bundle_data[0]['charge'] == null ? 0 : bundle_data[0]['charge'];
          }
          if (roaming_plan_id) {
            const roaming_data = await minutePlanName(roaming_plan_id, 2);
            roaming_name = roaming_data[0]['name'];
            obj.roaming_plan_name = roaming_name;
            obj.roaming_plan_charge = roaming_data[0]['charge'] == null ? 0 : roaming_data[0]['charge'];
          }
          if (teleConsultancy_call_plan_id) {
            const tc_data = await minutePlanName(teleConsultancy_call_plan_id, 4);
            tc_name = tc_data[0]['name'];
            obj.tc_plan_name = tc_name;
            obj.tc_plan_charge = tc_data[0]['charge'] == null ? 0 : tc_data[0]['charge'];
          }
          if (out_bundle_call_plan_id) {
            const out_bundle_data = await minutePlanName(out_bundle_call_plan_id, 5);
            out_bundle_name = out_bundle_data[0]['name'];
            obj.outbound_bundle_plan_name = out_bundle_name;
            obj.outbound_bundle_plan_charge = out_bundle_data[0]['charge'] == null ? 0 : out_bundle_data[0]['charge'];
          }

          let allFeatures = {
            black_list: "" + black_list + "",
            voicemail: "" + voice_mail + "",
            ivr: "" + ivr + "",
            call_transfer: "" + call_transfer + "",
            forward: "" + forward + "",
            concurrent_call: "" + concurrent_call + "",
            recording: "" + pbx_recording + "",
            phone_book: "" + phone_book + "",
            outbound_call: outbound,
            click_to_call: "" + click2call + "",
            music_on_hold: "" + music_on_hold + "",
            paging: "" + paging + "",
            speed_dial: "" + speed_dial + "",
            ring_time_out: "" + ring_time_out + "",
            call_group: "" + call_group + "",
            conference: "" + conference + "",
            billing_type: "" + data.billing_type + "",
            barging: "" + call_barging + "",
            extension_limit: "" + extension_limit + "",
            file_storage_duration: "" + file_storage_duration + "",
            status: "1",
            voicemail_limit: "" + vm_limit + "",
            storage: "" + storage + "",
            custom_prompt: "" + customPrompt + "",
            file_storage_size: "" + file_storage_size + "",
            queue: "" + queue + "",
            minute_balance: "" + minute_balance + "",
            call_plan_id: "" + call_plan_name + "",
            find_me_follow_me: "" + findMeFollowMe + "",
            one_to_one_video_call: "" + oneToOneVideoCall + "",
            is_circle: "" + isCircle + "",
            circle_id: "" + circle + "",
            is_feature_rate: "" + isFeatureRate + "",
            feature_rate_id: "" + feature_plan_name + "",
            custom_acl: "" + isCustomeACL + "",
            CID_routing: "" + isCallerID + "",
            feed_back_call: "" + isfeedbackCall + "",
            sticky_agent: "" + isStickyAgent + "",
            geo_tracking: "" + isGeoTracking + "",
            miss_call_alert: "" + isMissCallAlert + "",
            playback: "" + isPlayback + "",
            appointment: "" + isAppointment + "",
            broadcasting: "" + isBroadcast + "",
            is_sms: "" + isSMS + "",
            sip_trunk: "" + isSip_trunk + "",
            whatsapp: "" + isWhatsapp + "",
            minute_plan: "" + isMinutePlan + "",
            is_bundle_type: "" + isBundle + "",
            bundle_plan_id: "" + bundle_name + "",
            out_bundle_type: "" + OutBundle + "",
            out_bundle_call_plan_id: "" + out_bundle_name + "",
            is_roaming_type: "" + isRoaming + "",
            roaming_plan_id: "" + roaming_name + "",
            teleConsultancy_call_plan_id: "" + tc_name + "",
            outbound_conference: "" + isOutboundConf + "",
            obd: "" + isOBD + "",
            obd_channel: "" + obd_channal_limit + "",
            obd_cps: "" + cps + "",
            teleconsultation: "" + isTc + ""
          };
          knex(table.tbl_pbx_pkg_logs)
            .insert({
              package_id: package_id,
              product_id: "1",
              feature_id: "" + lastInsertedId + "",
              action: "New Package Created with assign pckg to users",
              assign_customer_id: "" + custmerIds.toString() + "",
              all_features: "" + JSON.stringify(allFeatures) + "",
            })
            .then((response3) => {
              for (let i = 0; i < custmerIds.length; i++) {
                knex(table.tbl_Map_customer_package)
                  .where("customer_id", "=", "" + custmerIds[i] + "")
                  .update({ package_id: "" + package_id + "" })
                  .then((resp) => {
                    knex(table.tbl_Extension_master)
                      .where("customer_id", "=", "" + custmerIds[i] + "")
                      .update({
                        voicemail: 0,
                        outbound: 0,
                        recording: 0,
                        black_list: 1,
                        forward: 0,
                        speed_dial: 0,
                        call_transfer: 0,
                      })
                      .then((resp) => {
                        knex
                          .raw(
                            "Call pbx_insert_assignright(" +
                            custmerIds[i] +
                            ",'" +
                            package_id +
                            "',1)"
                          )
                          .then((response) => {
                            pushEmail
                              .getCustomerNameandEmail(custmerIds[i])
                              .then((data) => {
                                pushEmail
                                  .getEmailContentUsingCategory(
                                    "PBXPackageUpdation"
                                  )
                                  .then((val) => {
                                    console.log(req.body.feature,"-----feature array-----");
                                    pushEmail
                                      .sendmail({
                                        data: data,
                                        val: val,
                                        feature: req.body.feature,
                                        customer: "customerPBX",
                                      })
                                      .then((data1) => { });
                                  });
                              });
                            if (!response) {
                              res.send({
                                code: response[0][0][0].MYSQL_SUCCESSNO,
                                message: response[0][0][0].MESSAGE_TEXT,
                              });
                            }
                          })
                          .catch((err) => {
                            res.send({
                              code: err.errno,
                              message: err.sqlMessage,
                            });
                          });
                        //-------------------------------------------------------
                      })
                      .catch((err) => {
                        console.log(err);
                        res
                          .status(401)
                          .send({
                            error: "error",
                            message: "DB Error: " + err.message,
                          });
                        throw err;
                      });
                    //----------------------------------------------------------
                  })
                  .catch((err) => {
                    console.log(err);
                    res
                      .status(401)
                      .send({
                        error: "error",
                        message: "DB Error: " + err.message,
                      });
                    throw err;
                  });
              }
              res.status(200).send({ error: "success", message: "Success!!" });
            })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ error: "error", message: "DB Error: " + err.message });
              throw err;
            });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

//case:2
function customUpdatePbxFeature(req, res) {
  let custmerIds = req.body.feature.customer_id;
  let data = req.body.feature.form_data;
  
  let dataplan = req.body.feature;
  let black_list = "1";
  // if (black_list === true || black_list === 1) {
  //     black_list = '1';
  // } else {
  //     black_list = '0';
  // }
  //--------------------------------------------------
  let vm_limit = data.vm_limit;
  if (vm_limit === "") {
    vm_limit = "10"; //default wiil be 10
  }
  let voice_mail;
  if (vm_limit >= 1) {
    voice_mail = "1";
  } else {
    voice_mail = "0"; //default wiil be 1
  }

  let file_storage_duration = data.file_storage_duration;
  if (file_storage_duration === "") {
    file_storage_duration = "30"; //default wiil be 30
  }
  //change on 24 sept 2019
  let pbx_recording = data.pbx_recording;
  if (pbx_recording === true || pbx_recording === 1) {
    pbx_recording = "1";
  } else {
    pbx_recording = "0";
  }

  let customPrompt = data.custom_prompts;
  if (customPrompt === true || customPrompt === 1) {
    customPrompt = "1";
  } else {
    customPrompt = "0";
  }

  let file_storage_size = data.file_storage_size;
  if (file_storage_size === "") {
    file_storage_size = "1"; //default wiil be 1
  }

  let storage = data.storage;
  if (storage === true || storage === 1) {
    storage = "1";
  } else {
    storage = "0";
    pbx_recording = "0";
    customPrompt = "0";
    file_storage_size = "1"; //default wiil be 1
    vm_limit = "10"; //default wiil be 10
    file_storage_duration = "30"; //default wiil be 30
    voice_mail = "0";
  }
  //change on 24 sept 2019 end ----//
  //---------------------------------------------------------------------

  let ivr = data.ivr;
  if (ivr === true || ivr === 1) {
    ivr = "1";
  } else {
    ivr = "0";
  }
  let call_transfer = data.call_transfer;
  if (call_transfer === true || call_transfer === 1) {
    call_transfer = "1";
  } else {
    call_transfer = "0";
  }

  let forward = data.forward;
  if (forward === true || forward === 1) {
    forward = "1";
  } else {
    forward = "0";
  }
  let call_plan = data.call_plan;
  let circle = data.circle;
  let featureRate = data.featureRate;
  let outbound = data.outbound;
  let sms = data.sms;
  let isSMSTypCustom = data.isSMSTypCustom; //isSMSTypCustom
  // let bundle_plan_id = data.bundle_plan_id;
  // let roaming_plan_id = data.roaming_plan_id;
  // let teleConsultancy_call_plan_id = data.teleConsultancy_call_plan_id; 
  let bundle_plan_id = data.bundle_plan_id != "" ? data.bundle_plan_id : 0;
  let out_bundle_call_plan_id = data.out_bundle_call_plan_id != "" ? data.out_bundle_call_plan_id : 0;
  let roaming_plan_id = data.roaming_plan_id != "" ? data.roaming_plan_id : 0;
  let teleConsultancy_call_plan_id =
    data.teleConsultancy_call_plan_id != ""
      ? data.teleConsultancy_call_plan_id
      : 0;

  if (outbound === true || outbound === 1) {
    outbound = "1";
  } else {
    outbound = "0";
    call_plan = "";
    circle = "";
  }
  let music_on_hold = data.music_on_hold;
  if (music_on_hold === true || music_on_hold === 1) {
    music_on_hold = "1";
  } else {
    music_on_hold = "0";
  }
  let paging = data.caller_id;
  if (paging === true || paging === 1) {
    paging = "1";
  } else {
    paging = "0";
  }
  let speed_dial = data.speed_dial;
  if (speed_dial === true || speed_dial === 1) {
    speed_dial = "1";
  } else {
    speed_dial = "0";
  }
  let call_group = data.call_group;
  if (call_group === true || call_group === 1) {
    call_group = "1";
  } else {
    call_group = "0";
  }
  let dynamic_ivr = data.dynamic_ivr;
  if (dynamic_ivr === true || dynamic_ivr === 1) {
    dynamic_ivr = "1";
  } else {
    dynamic_ivr = "0";
  }

  let voicebot = data.voicebot;
  if (voicebot === true || voicebot === 1) {
    voicebot = "1";
  } else {
    voicebot = "0";
  }

  let conference = data.conference;
  if (conference === true || conference === 1) {
    conference = "1";
  } else {
    conference = "0";
  }
  let call_barging = data.call_barging;
  if (call_barging === true || call_barging === 1) {
    call_barging = "1";
  } else {
    call_barging = "0";
  }
  let concurrent_call = data.concurrent_call;
  if (concurrent_call === "") {
    concurrent_call = "0";
  }
  let obd_channal_limit = data.obd_channal_limit;
  if (obd_channal_limit === "" || obd_channal_limit === null) {
    obd_channal_limit = "0";
  }
  let cps = data.cps;
  if (cps === "" || cps === null) {
    cps = "0";
  }
  let phone_book = data.phone_book;
  if (phone_book === "") {
    phone_book = "0";
  }
  let ring_time_out = data.ring_time_out;
  if (ring_time_out === "") {
    ring_time_out = "0";
  }
  let extension_limit = data.extension_limit;
  if (extension_limit === "") {
    extension_limit = "0";
  }
  let click2call = data.click2call;
  if (click2call === true || click2call === 1) {
    click2call = "1";
  } else {
    click2call = "0";
  }
  let queue = data.queue;
  if (queue === true || queue === 1) {
    queue = "1";
  } else {
    queue = "0";
  }
  let oneToOneVideoCall = data.one_to_one_video_call;
  if (oneToOneVideoCall === true || oneToOneVideoCall === 1) {
    oneToOneVideoCall = "1";
  } else {
    oneToOneVideoCall = "0";
  }
  let findMeFollowMe = data.find_me_follow_me;
  if (findMeFollowMe === true || findMeFollowMe === 1) {
    findMeFollowMe = "1";
  } else {
    findMeFollowMe = "0";
  }
  let billing_type = data.billing_type;
  if (
    billing_type == "Enterprise with pool" ||
    billing_type == "Enterprise without pool"
  ) {
    outbound = "1";
  }

  let isCircle = data.isCircle;
  if (isCircle === true) {
    isCircle = "1";
  } else {
    isCircle = "0";
  }

  let isFeatureRate = data.isFeatureRate;
  if (isFeatureRate === true) {
    isFeatureRate = "1";
  } else {
    isFeatureRate = "0";
    featureRate = "";
  }
  let isCustomeACL = data.custom_acl;
  if (isCustomeACL === true) {
    isCustomeACL = "1";
  } else {
    isCustomeACL = "0";
  }
  let isCallerID = data.caller_id;
  if (isCallerID === true) {
    isCallerID = "1";
  } else {
    isCallerID = "0";
  }

  let isTrunk = data.sip_trunk;
  if (isTrunk === true) {
    isTrunk = "1";
  } else {
    isTrunk = "0";
  }

  let isBroadcast = data.broadcast; // Broadcast
  if (isBroadcast === true) {
    isBroadcast = "1";
  } else {
    isBroadcast = "0";
  }

  let isSMS = data.isSms; //isSms
  if (isSMS === true) {
    isSMS = "1";
  } else {
    isSMS = "0";
    sms = "";
    isSMSTypCustom = "0";
  }

  let isTeleConsultancy = data.teleConsultancy;
  if (isTeleConsultancy === true) {
    isTeleConsultancy = "1";
  } else {
    isTeleConsultancy = "0";
  }

  let isfeedbackCall = data.feedback_call; // feedback call
  if (isfeedbackCall === true) {
    isfeedbackCall = "1";
  } else {
    isfeedbackCall = "0";
  }

  let isStickyAgent = data.sticky_agent; // sticky agent
  if (isStickyAgent === true) {
    isStickyAgent = "1";
  } else {
    isStickyAgent = "0";
  }

  let isGeoTracking = data.geo_tracking; // geo tracking
  if (isGeoTracking === true) {
    isGeoTracking = "1";
  } else {
    isGeoTracking = "0";
  }

  let isMissCallAlert = data.miss_call_alert; // miss call alert
  if (isMissCallAlert === true) {
    isMissCallAlert = "1";
  } else {
    isMissCallAlert = "0";
  }

  let isPlayback = data.playback; //playback
  if (isPlayback === true) {
    isPlayback = "1";
  } else {
    isPlayback = "0";
  }

  let isAppointment = data.appointment; //Appointment
  if (isAppointment === true) {
    isAppointment = "1";
  } else {
    isAppointment = "0";
  }

  let isWhatsapp = data.whatsapp; // whatsapp
  if (isWhatsapp === true) {
    isWhatsapp = "1";
  } else {
    isWhatsapp = "0";
  }

  // let isMinutePlan = data.is_minute_plan;  // Minute Plan
  // if (isMinutePlan === true) {
  //     isMinutePlan = '1';
  // } else {
  //     isMinutePlan = '0';
  // }

  let isMinutePlan = "";
  if (data.is_minute_plan) {
    if (data.is_bundle || data.is_roaming || data.teleConsultancy || data.out_bundle) {
      isMinutePlan = "1";
    } else {
      isMinutePlan = "0";
    }
  } else {
    isMinutePlan = "0";
  }

  let isBundle = data.is_bundle; // Bundle Type
  if (isBundle === true) {
    isBundle = "1";
  } else {
    isBundle = "0";
  }
  let outBundle = data.out_bundle; // Bundle Type
  if (outBundle === true) {
    outBundle = "1";
  } else {
    outBundle = "0";
  }

  let isRoaming = data.is_roaming; // Roaming Type
  if (isRoaming === true) {
    isRoaming = "1";
  } else {
    isRoaming = "0";
  }

  let isOutboundConf = data.outbound_conference; // Outbound Conference
  if (isOutboundConf === true) {
    isOutboundConf = "1";
  } else {
    isOutboundConf = "0";
  }

  let isOBD = data.outbound_broadcast; // Outbound Broadcast
  if (isOBD === true) {
    isOBD = "1";
  } else {
    isOBD = "0";
  }
  // let isWhatsapp

  let isBooster = data.is_bundle ? "1" : data.is_roaming ? "1" : "0"; //
  let package_name = req.body.feature.package_old_name;
  let package_duration =
    data.package_duration != "" ? data.package_duration : 0;

  let package_id = data.package_id;
  let pbx_id = data.pbx_id;
  let minute_balance = data.minute_balance;
  let isAutoRenewal = data.is_auto_renewal;
  if (isAutoRenewal === true || isAutoRenewal === 1) {
    isAutoRenewal = "1";
  } else {
    isAutoRenewal = "0";
  }

  let expired_at =
    package_duration != 0
      ? new Date(new Date().getTime() + package_duration * 24 * 60 * 60 * 1000)
      : new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
  //let custmerIds = req.body.feature.customer_id;
  let subscription = data.subscription;
  let allCheck = req.body.feature.allCheck;

  if (allCheck == true || allCheck == "true") {
    var sql = knex(table.tbl_PBX_features)
      .where("id", "=", "" + pbx_id + "")
      .update({
        black_list: "" + black_list + "",
        voicemail: "" + voice_mail + "",
        ivr: "" + ivr + "",
        call_transfer: "" + call_transfer + "",
        forward: "" + forward + "",
        concurrent_call: "" + concurrent_call + "",
        recording: "" + pbx_recording + "",
        phone_book: "" + phone_book + "",
        outbound_call: "" + outbound + "",
        click_to_call: "" + click2call + "",
        music_on_hold: "" + music_on_hold + "",
        paging: "" + paging + "",
        speed_dial: "" + speed_dial + "",
        ring_time_out: "" + ring_time_out + "",
        call_group: "" + call_group + "",
        conference: "" + conference + "",
        billing_type: "" + data.billing_type + "",
        barging: "" + call_barging + "",
        extension_limit: "" + extension_limit + "",
        file_storage_duration: "" + file_storage_duration + "",
        voicemail_limit: "" + vm_limit + "",
        storage: "" + storage + "",
        custom_prompt: "" + customPrompt + "",
        file_storage_size: "" + file_storage_size + "",
        queue: "" + queue + "",
        minute_balance: "" + minute_balance + "",
        call_plan_id: "" + call_plan + "",
        find_me_follow_me: "" + findMeFollowMe + "",
        one_to_one_video_call: "" + oneToOneVideoCall + "",
        is_circle: "" + isCircle + "",
        circle_id: "" + circle + "",
        is_feature_rate: "" + isFeatureRate + "",
        feature_rate_id: "" + featureRate + "",
        custom_acl: "" + isCustomeACL + "",
        CID_routing: "" + isCallerID + "",
        broadcasting: "" + isBroadcast + "",
        is_sms: "" + isSMS + "",
        sms_id: "" + sms + "",
        teleconsultation: "" + isTeleConsultancy + "",
        subscription: "" + subscription + "",
        feed_back_call: "" + isfeedbackCall + "",
        sticky_agent: "" + isStickyAgent + "",
        geo_tracking: "" + isGeoTracking + "",
        miss_call_alert: "" + isMissCallAlert + "",
        playback: "" + isPlayback + "",
        is_sms_type_custom: "" + isSMSTypCustom + "",
        appointment: "" + isAppointment + "",
        whatsapp: "" + isWhatsapp + "",
        minute_plan: "" + isMinutePlan + "",
        is_bundle_type: "" + isBundle + "",
        bundle_plan_id: "" + bundle_plan_id + "",
        out_bundle_type: "" + outBundle + "",
        out_bundle_call_plan_id: "" + out_bundle_call_plan_id + "",
        is_roaming_type: "" + isRoaming + "",
        roaming_plan_id: "" + roaming_plan_id + "",
        is_booster_plan: "" + isBooster + "",
        teleConsultancy_call_plan_id: "" + teleConsultancy_call_plan_id + "",
        sip_trunk: "" + isTrunk + "",
        outbound_conference: "" + isOutboundConf + "",
        obd: "" + isOBD + "",
        obd_channel: "" + obd_channal_limit + "",
        obd_cps: "" + cps + "",
        dynamic_ivr: "" + dynamic_ivr + "",
        voicebot: "" + voicebot + "",
      });
  } else {
    res
      .status(401)
      .send({ error: "error", message: "Something went wrong!!!" });
  }

  sql
    .then((response) => {
      knex(table.tbl_Package)
        .where("id", "=", "" + package_id + "")
        .update({
          name: knex.raw('TRIM("' + package_name + '")'),
          duration: "" + package_duration + "",
          renew: "" + isAutoRenewal + "",
          expired_at: expired_at,
          mapped: "" + isMinutePlan + "",
        });
      sql
        .then(async (response) => {
          let obj = [];
          let call_plan_name;
          let feature_plan_name;
          let sms_name;
          let bundle_name;
          let outbundle_name
          let roaming_name;
          let tc_name;
          if (call_plan) {
            call_plan_name = await callPlanName(call_plan);
          }
          if (featureRate) {
            feature_plan_name = await featureName(featureRate);
          }
          if (sms) {
            sms_name = await smsName(sms);
          }                    
          if (bundle_plan_id && data.is_Bundle) {
            const bundle_data = await minutePlanName(bundle_plan_id, 1);
            bundle_name = bundle_data[0]['name'];   
            custmerIds.map(item => {
              obj.push({ minute_plan: bundle_name, charge: bundle_data[0]['charge'] == null ? 0 : bundle_data[0]['charge'], plan_type: '1', package_id: package_id, customer_id: item })
            })                       
            // obj.bundle_plan_name = bundle_name;
            // obj.bundle_plan_charge = bundle_data[0]['charge'] == null ? 0 : bundle_data[0]['charge'];
          }
          if (roaming_plan_id && data.is_Roaming) {
            const roaming_data = await minutePlanName(roaming_plan_id, 2);
            roaming_name = roaming_data[0]['name'];      
            custmerIds.map(item => {
              obj.push({ minute_plan: roaming_name, charge: roaming_data[0]['charge'] == null ? 0 : roaming_data[0]['charge'], plan_type: '2', package_id: package_id , customer_id: item })
            })
            // obj.roaming_plan_name = roaming_name;
            // obj.roaming_plan_charge = roaming_data[0]['charge'] == null ? 0 : roaming_data[0]['charge'];       
          }
          if (teleConsultancy_call_plan_id && data.is_Tc) {
            const tc_data = await minutePlanName(teleConsultancy_call_plan_id, 4);
            tc_name = tc_data[0]['name'];  
            custmerIds.map(item => {
              obj.push({ minute_plan: tc_name, charge: tc_data[0]['charge'] == null ? 0 : tc_data[0]['charge'], plan_type: '4', package_id: package_id , customer_id: item });            
            })                    
            // obj.tc_plan_name = tc_name;
            // obj.tc_plan_charge = tc_data[0]['charge'] == null ? 0 : tc_data[0]['charge'];
          }
          if (out_bundle_call_plan_id && data.is_Outgoing) {
            const out_bundle_data = await minutePlanName(out_bundle_call_plan_id, 5);
            outbundle_name = out_bundle_data[0]['name'];  
            custmerIds.map(item => {
              obj.push({ minute_plan: outbundle_name, charge: out_bundle_data[0]['charge'] == null ? 0 : out_bundle_data[0]['charge'], plan_type: '5', package_id: package_id , customer_id: item });                          
            })
            // obj.outbound_bundle_plan_name = outbundle_name;
            // obj.outbound_bundle_plan_charge = out_bundle_data[0]['charge'] == null ? 0 : out_bundle_data[0]['charge'];
          }
          
          let allFeatures = {
            black_list: "" + black_list + "",
            voicemail: "" + voice_mail + "",
            ivr: "" + ivr + "",
            call_transfer: "" + call_transfer + "",
            forward: "" + forward + "",
            concurrent_call: "" + concurrent_call + "",
            recording: "" + pbx_recording + "",
            phone_book: "" + phone_book + "",
            outbound_call: "" + outbound + "",
            click_to_call: "" + click2call + "",
            music_on_hold: "" + music_on_hold + "",
            paging: "" + paging + "",
            speed_dial: "" + speed_dial + "",
            ring_time_out: "" + ring_time_out + "",
            call_group: "" + call_group + "",
            conference: "" + conference + "",
            billing_type: "" + data.billing_type + "",
            barging: "" + call_barging + "",
            extension_limit: "" + extension_limit + "",
            file_storage_duration: "" + file_storage_duration + "",
            voicemail_limit: "" + vm_limit + "",
            storage: "" + storage + "",
            custom_prompt: "" + customPrompt + "",
            file_storage_size: "" + file_storage_size + "",
            queue: "" + queue + "",
            minute_balance: "" + minute_balance + "",
            call_plan_id: "" + call_plan_name + "",
            find_me_follow_me: "" + findMeFollowMe + "",
            one_to_one_video_call: "" + oneToOneVideoCall + "",
            is_circle: "" + isCircle + "",
            circle_id: "" + circle + "",
            is_feature_rate: "" + isFeatureRate + "",
            feature_rate_id: "" + feature_plan_name + "",
            custom_acl: "" + isCustomeACL + "",
            CID_routing: "" + isCallerID + "",
            broadcasting: "" + isBroadcast + "",
            is_sms: "" + isSMS + "",
            sms_id: "" + sms_name + "",
            teleconsultation: "" + isTeleConsultancy + "",
            subscription: "" + subscription + "",
            feed_back_call: "" + isfeedbackCall + "",
            sticky_agent: "" + isStickyAgent + "",
            geo_tracking: "" + isGeoTracking + "",
            miss_call_alert: "" + isMissCallAlert + "",
            playback: "" + isPlayback + "",
            is_sms_type_custom: "" + isSMSTypCustom + "",
            appointment: "" + isAppointment + "",
            whatsapp: "" + isWhatsapp + "",
            minute_plan: "" + isMinutePlan + "",
            is_bundle_type: "" + isBundle + "",
            bundle_plan_id: "" + bundle_name + "",
            out_bundle_type: "" + outBundle + "",
            out_bundle_call_plan_id: "" + outbundle_name + "",
            is_roaming_type: "" + isRoaming + "",
            roaming_plan_id: "" + roaming_name + "",
            is_booster_plan: "" + isBooster + "",
            teleConsultancy_call_plan_id: "" + tc_name + "",
            sip_trunk: "" + isTrunk + "",
            outbound_conference: "" + isOutboundConf + "",
            obd: "" + isOBD + "",
            obd_channel: "" + obd_channal_limit + "",
            obd_cps: "" + cps + "",
            dynamic_ivr: "" + dynamic_ivr + "",
            voicebot: "" + voicebot + "",
          };
          let updateExtObj = {};
          outbound == "0"
            ? (updateExtObj["outbound"] = 0)
            : (updateExtObj["outbound"] = 1);
          pbx_recording == "0"
            ? (updateExtObj["recording"] = 0)
            : (updateExtObj["recording"] = 1);
          forward == "0"
            ? (updateExtObj["forward"] = 0)
            : (updateExtObj["forward"] = 1);
          speed_dial == "0"
            ? (updateExtObj["speed_dial"] = 0)
            : (updateExtObj["speed_dial"] = 1);
          call_transfer == "0"
            ? (updateExtObj["call_transfer"] = 0)
            : (updateExtObj["call_transfer"] = 1);
          isStickyAgent == "0"
            ? (updateExtObj["sticky_agent"] = 0)
            : (updateExtObj["sticky_agent"] = 1);
          click2call == "0"
            ? (updateExtObj["click_to_call"] = "0")
            : (updateExtObj["click_to_call"] = "1");
          isWhatsapp == "0"
            ? (updateExtObj["whatsapp"] = "0")
            : (updateExtObj["whatsapp"] = "1");
          findMeFollowMe == "0"
            ? (updateExtObj["find_me_follow_me"] = 0)
            : (updateExtObj["find_me_follow_me"] = 1);
          voice_mail == "0"
            ? (updateExtObj["voicemail"] = 0)
            : (updateExtObj["voicemail"] = 0);

          let sql1 = knex(table.tbl_pbx_pkg_logs).insert({
            package_id: package_id,
            product_id: "1",
            feature_id: "" + pbx_id + "",
            action: "Existing Package Updated with customers",
            assign_customer_id: "" + custmerIds.toString() + "",
            all_features: "" + JSON.stringify(allFeatures) + "",
          });
          sql1
            .then(async (response3) => {
              for (let i = 0; i < custmerIds.length; i++) {
                let pro = knex.raw(
                  "Call pbx_insert_assignright(" +
                  custmerIds[i] +
                  ",'" +
                  package_id +
                  "',1)"
                );                
                pro
                  .then((response) => {                    
                    let sql = knex(table.tbl_Extension_master)
                      .where("customer_id", "=", custmerIds[i])
                      .update(updateExtObj);
                    // .update({
                    //     voicemail: 0, outbound: 0, recording: 0, black_list: 1, forward: 0, speed_dial: 0, call_transfer: 0
                    // });
                    sql
                      .then((resp) => {
                        let element = [];
                      //  for (let index = 0; index < custmerIds.length; index++) {
                          let bundle_plan_id = dataplan.form_data.bundle_plan_id.length == 0 ? "''" : dataplan.form_data.bundle_plan_id;
                          let out_bundle_call_plan_id = dataplan.form_data.out_bundle_call_plan_id.length == 0 ? "''" : dataplan.form_data.out_bundle_call_plan_id;
                          let roaming_plan_id = dataplan.form_data.roaming_plan_id.length == 0 ? "''" : dataplan.form_data.roaming_plan_id;
                          let teleConsultancy_call_plan_id = dataplan.form_data.teleConsultancy_call_plan_id.length == 0 ? "''" : dataplan.form_data.teleConsultancy_call_plan_id;
                          element = custmerIds[i];
                          let sql3 = knex.raw("Call pbx_check_all_plan_type(" + element + "," + bundle_plan_id + "," + teleConsultancy_call_plan_id + "," + roaming_plan_id + "," + out_bundle_call_plan_id + ")")
                          sql3.then(async (response) => {                           
                            // else {
                            //   res.json({
                            //     response,
                            //   });
                            // }  
                            //   if (response) { 
                            //     res.send({ response: response });
                            // }
                          }).catch((err) => {
                            res.send({ response: { code: err.errno, message: err.sqlMessage } });
                          });
                        // }
                        pushEmail
                          .getCustomerNameandEmail(custmerIds[i])
                          .then((data) => {
                            pushEmail
                              .getEmailContentUsingCategory(
                                "PBXPackageUpdation"
                              )
                              .then((val) => {                                
                                pushEmail
                                  .sendmail({
                                    data: data,
                                    val: val,
                                    feature: req.body.feature,
                                    customer: "customerPBX",
                                  })
                                  .then((data1) => { });
                              });
                          });
                      })
                      .catch((err) => {
                        console.log(err);
                        res
                          .status(401)
                          .send({
                            error: "error",
                            message: "DB Error: " + err.message,
                          });
                        throw err;
                      });
                  })
                  .catch((err) => {
                    console.log(err,"error")
                    res.send({ code: err.errno, message: err.sqlMessage });
                  });
              }
              if (data.is_Outgoing || data.is_Tc || data.is_Bundle || data.is_Roaming) {                              
                await knex(table.tbl_pbx_minutePlan_history).insert(obj).then((response) => {
                  console.log("Inserted")
                }).catch((err) => {
                  res
                    .status(401)
                    .send({ error: "error", message: "DB Error: " + err.message });
                  throw err;
                })
              }
              
              res.status(200).send({ error: "success", message: "Success!!" });
            })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ error: "error", message: "DB Error: " + err.message });
              throw err;
            });

          //-------------------------------------------------------

          //-------------------------------------------------------
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

//case:3  pkg ->   **-- its package update which not mapped with any customer--**
function updatePbxFeature(req, res) {
  let modified_by = req.userId;
  let black_list = "1";
  // if (black_list === true || black_list === 1) {
  //     black_list = '1';
  // } else {
  //     black_list = '0';
  // }

  //--------------------------------------------------
  let vm_limit = req.body.feature.vm_limit;
  if (vm_limit === "") {
    vm_limit = "10"; //default wiil be 10
  }
  if (vm_limit >= 1) {
    voice_mail = "1";
  } else {
    voice_mail = "0"; //default wiil be 1
  }

  let file_storage_duration = req.body.feature.file_storage_duration;
  if (file_storage_duration === "") {
    file_storage_duration = "30"; //default wiil be 30
  }
  //change on 24 sept 2019
  let pbx_recording = req.body.feature.pbx_recording;
  if (pbx_recording === true || pbx_recording === 1) {
    pbx_recording = "1";
  } else {
    pbx_recording = "0";
  }

  let customPrompt = req.body.feature.custom_prompts;
  if (customPrompt === true || customPrompt === 1) {
    customPrompt = "1";
  } else {
    customPrompt = "0";
  }

  let file_storage_size = req.body.feature.file_storage_size;
  if (file_storage_size === "") {
    file_storage_size = "1"; //default wiil be 1
  }

  let storage = req.body.feature.storage;
  if (storage === true || storage === 1) {
    storage = "1";
  } else {
    storage = "0";
    pbx_recording = "0";
    customPrompt = "0";
    file_storage_size = "1"; //default wiil be 1
    vm_limit = "10"; //default wiil be 10
    file_storage_duration = "30"; //default wiil be 30
    voice_mail = "0";
  }
  //change on 24 sept 2019 end ----//
  //---------------------------------------------------------------------

  let ivr = req.body.feature.ivr;
  if (ivr === true || ivr === 1) {
    ivr = "1";
  } else {
    ivr = "0";
  }
  let call_transfer = req.body.feature.call_transfer;
  if (call_transfer === true || call_transfer === 1) {
    call_transfer = "1";
  } else {
    call_transfer = "0";
  }

  let forward = req.body.feature.forward;
  if (forward === true || forward === 1) {
    forward = "1";
  } else {
    forward = "0";
  }
  let call_plan = req.body.feature.call_plan;
  let circle = req.body.feature.circle;
  let featureRate = req.body.feature.featureRate;
  let outbound = req.body.feature.outbound;
  let sms = req.body.feature.sms;
  let isSMSTypCustom = req.body.feature.isSMSTypCustom; //isSMSTypCustom
  let bundle_plan_id = req.body.feature.bundle_plan_id
    ? req.body.feature.bundle_plan_id
    : 0;
  let out_bundle_call_plan_id = req.body.feature.out_bundle_call_plan_id
    ? req.body.feature.out_bundle_call_plan_id
    : 0;
  let roaming_plan_id =
    req.body.feature.roaming_plan_id != ""
      ? req.body.feature.roaming_plan_id
      : 0;
  let teleConsultancy_call_plan_id =
    req.body.feature.teleConsultancy_call_plan_id != ""
      ? req.body.feature.teleConsultancy_call_plan_id
      : 0;

  if (outbound === true || outbound === 1) {
    outbound = "1";
  } else {
    outbound = "0";
    call_plan = "";
    circle = "";
  }
  let music_on_hold = req.body.feature.music_on_hold;
  if (music_on_hold === true || music_on_hold === 1) {
    music_on_hold = "1";
  } else {
    music_on_hold = "0";
  }
  let paging = req.body.feature.paging;
  if (paging === true || paging === 1) {
    paging = "1";
  } else {
    paging = "0";
  }
  let speed_dial = req.body.feature.speed_dial;
  if (speed_dial === true || speed_dial === 1) {
    speed_dial = "1";
  } else {
    speed_dial = "0";
  }
  let call_group = req.body.feature.call_group;
  if (call_group === true || call_group === 1) {
    call_group = "1";
  } else {
    call_group = "0";
  }

  let dynamic_ivr = req.body.feature.dynamic_ivr;
  if (dynamic_ivr === true || dynamic_ivr === 1) {
    dynamic_ivr = "1";
  } else {
    dynamic_ivr = "0";
  }

  let voicebot = req.body.feature.voicebot;
  if (voicebot === true || voicebot === 1) {
    voicebot = "1";
  } else {
    voicebot = "0";
  }
  let conference = req.body.feature.conference;
  if (conference === true || conference === 1) {
    conference = "1";
  } else {
    conference = "0";
  }
  let call_barging = req.body.feature.call_barging;
  if (call_barging === true || call_barging === 1) {
    call_barging = "1";
  } else {
    call_barging = "0";
  }
  let concurrent_call = req.body.feature.concurrent_call;
  if (concurrent_call === "") {
    concurrent_call = "0";
  }
  let obd_channal_limit = req.body.feature.obd_channal_limit;
  if (obd_channal_limit === "" || obd_channal_limit === null) {
    obd_channal_limit = "0";
  }
  let cps = req.body.feature.cps;
  if (cps === "" || cps === null) {
    cps = "0";
  }
  let phone_book = req.body.feature.phone_book;
  if (phone_book === "") {
    phone_book = "0";
  }
  let ring_time_out = req.body.feature.ring_time_out;
  if (ring_time_out === "") {
    ring_time_out = "0";
  }
  let extension_limit = req.body.feature.extension_limit;
  if (extension_limit === "") {
    extension_limit = "0";
  }
  let click2call = req.body.feature.click2call;
  if (click2call === true || click2call === 1) {
    click2call = "1";
  } else {
    click2call = "0";
  }

  let queue = req.body.feature.queue;
  if (queue === true || queue === 1) {
    queue = "1";
  } else {
    queue = "0";
  }

  let oneToOneVideoCall = req.body.feature.one_to_one_video_call;
  if (oneToOneVideoCall === true || oneToOneVideoCall === 1) {
    oneToOneVideoCall = "1";
  } else {
    oneToOneVideoCall = "0";
  }
  let findMeFollowMe = req.body.feature.find_me_follow_me;
  if (findMeFollowMe === true || findMeFollowMe === 1) {
    findMeFollowMe = "1";
  } else {
    findMeFollowMe = "0";
  }

  let billing_type = req.body.feature.billing_type;
  if (
    billing_type == "Enterprise with pool" ||
    billing_type == "Enterprise without pool"
  ) {
    outbound = "1";
  }

  let isCircle = req.body.feature.isCircle;
  if (isCircle === true) {
    isCircle = "1";
  } else {
    isCircle = "0";
  }
  let isFeatureRate = req.body.feature.isFeatureRate;
  if (isFeatureRate === true) {
    isFeatureRate = "1";
  } else {
    isFeatureRate = "0";
    featureRate = "";
  }
  let isCustomeACL = req.body.feature.custom_acl;
  if (isCustomeACL === true) {
    isCustomeACL = "1";
  } else {
    isCustomeACL = "0";
  }
  let isCallerID = req.body.feature.caller_id;
  if (isCallerID === true) {
    isCallerID = "1";
  } else {
    isCallerID = "0";
  }
  let isTrunk = req.body.feature.sip_trunk;
  if (isTrunk === true) {
    isTrunk = "1";
  } else {
    isTrunk = "0";
  }

  let isBroadcast = req.body.feature.broadcast;
  if (isBroadcast === true) {
    isBroadcast = "1";
  } else {
    isBroadcast = "0";
  }

  let isSMS = req.body.feature.isSms; //isSms
  if (isSMS === true) {
    isSMS = "1";
  } else {
    isSMS = "0";
    sms = "";
    isSMSTypCustom = "0";
  }

  let isTeleConsultancy = req.body.feature.teleConsultancy;
  if (isTeleConsultancy === true) {
    isTeleConsultancy = "1";
  } else {
    isTeleConsultancy = "0";
  }

  let isfeedbackCall = req.body.feature.feedback_call; // feedback call
  if (isfeedbackCall === true) {
    isfeedbackCall = "1";
  } else {
    isfeedbackCall = "0";
  }

  let isStickyAgent = req.body.feature.sticky_agent; // sticky agent
  if (isStickyAgent === true) {
    isStickyAgent = "1";
  } else {
    isStickyAgent = "0";
  }

  let isGeoTracking = req.body.feature.geo_tracking; // geo tracking
  if (isGeoTracking === true) {
    isGeoTracking = "1";
  } else {
    isGeoTracking = "0";
  }

  let isMissCallAlert = req.body.feature.miss_call_alert; // miss call alert
  if (isMissCallAlert === true) {
    isMissCallAlert = "1";
  } else {
    isMissCallAlert = "0";
  }

  let isPlayback = req.body.feature.playback; // Playback
  if (isPlayback === true) {
    isPlayback = "1";
  } else {
    isPlayback = "0";
  }

  let isAppointment = req.body.feature.appointment; // Appointment
  if (isAppointment === true) {
    isAppointment = "1";
  } else {
    isAppointment = "0";
  }
  let isWhatsapp = req.body.feature.whatsapp; // whatsapp
  if (isWhatsapp === true) {
    isWhatsapp = "1";
  } else {
    isWhatsapp = "0";
  }

  let isMinutePlan = req.body.feature.is_minute_plan; // Minute Plan
  if (isMinutePlan === true) {
    isMinutePlan = "1";
  } else {
    isMinutePlan = "0";
  }

  let isBundle = req.body.feature.is_bundle; // Bundle Type
  if (isBundle === true) {
    isBundle = "1";
  } else {
    isBundle = "0";
  }
  let outBundle = req.body.feature.out_bundle; // Bundle Type
  if (outBundle === true) {
    outBundle = "1";
  } else {
    outBundle = "0";
  }
  let isRoaming = req.body.feature.is_roaming; // Roaming Type
  if (isRoaming === true) {
    isRoaming = "1";
  } else {
    isRoaming = "0";
  }

  let isOutboundConf = req.body.feature.outbound_conference; // Outbound Conference
  if (isOutboundConf == true) {
    isOutboundConf = "1";
  } else {
    isOutboundConf = "0";
  }

  let isOBD = req.body.feature.outbound_broadcast; // Outbound Broadcast
  if (isOBD == true) {
    isOBD = "1";
  } else {
    isOBD = "0";
  }

  let package_name = req.body.feature.package_name;
  let package_duration =
    req.body.feature.package_duration != ""
      ? req.body.feature.package_duration
      : 0;
  let minute_balance = req.body.feature.minute_balance;
  let isAutoRenewal = req.body.feature.is_auto_renewal;
  if (isAutoRenewal === true || isAutoRenewal === 1) {
    isAutoRenewal = "1";
  } else {
    isAutoRenewal = "0";
  }
  let expired_at =
    package_duration != 0
      ? new Date(new Date().getTime() + package_duration * 24 * 60 * 60 * 1000)
      : new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
  let subscription = req.body.feature.subscription;
  let package_id = req.body.feature.package_id;
  let pbx_id = req.body.feature.pbx_id;

  knex(table.tbl_PBX_features)
    .where("id", "=", "" + pbx_id + "")
    .update({
      black_list: "" + black_list + "",
      voicemail: "" + voice_mail + "",
      ivr: "" + ivr + "",
      call_transfer: "" + call_transfer + "",
      forward: "" + forward + "",
      concurrent_call: "" + concurrent_call + "",
      recording: "" + pbx_recording + "",
      phone_book: "" + phone_book + "",
      outbound_call: "" + outbound + "",
      click_to_call: "" + click2call + "",
      music_on_hold: "" + music_on_hold + "",
      paging: "" + paging + "",
      speed_dial: "" + speed_dial + "",
      ring_time_out: "" + ring_time_out + "",
      call_group: "" + call_group + "",
      conference: "" + conference + "",
      billing_type: "" + billing_type + "",
      barging: "" + call_barging + "",
      extension_limit: "" + extension_limit + "",
      file_storage_duration: "" + file_storage_duration + "",
      voicemail_limit: "" + vm_limit + "",
      storage: "" + storage + "",
      custom_prompt: "" + customPrompt + "",
      file_storage_size: "" + file_storage_size + "",
      queue: "" + queue + "",
      minute_balance: "" + minute_balance + "",
      call_plan_id: "" + call_plan + "",
      find_me_follow_me: "" + findMeFollowMe + "",
      one_to_one_video_call: "" + oneToOneVideoCall + "",
      is_circle: "" + isCircle + "",
      circle_id: "" + circle + "",
      is_feature_rate: "" + isFeatureRate + "",
      feature_rate_id: "" + featureRate + "",
      custom_acl: "" + isCustomeACL + "",
      CID_routing: "" + isCallerID + "",
      broadcasting: "" + isBroadcast + "",
      is_sms: "" + isSMS + "",
      sms_id: "" + sms + "",
      teleconsultation: "" + isTeleConsultancy + "",
      subscription: "" + subscription + "",
      feed_back_call: "" + isfeedbackCall + "",
      sticky_agent: "" + isStickyAgent + "",
      geo_tracking: "" + isGeoTracking + "",
      miss_call_alert: "" + isMissCallAlert + "",
      is_sms_type_custom: "" + isSMSTypCustom + "",
      playback: "" + isPlayback + "",
      appointment: "" + isAppointment + "",
      whatsapp: "" + isWhatsapp + "",
      minute_plan: "" + isMinutePlan + "",
      is_bundle_type: "" + isBundle + "",
      bundle_plan_id: "" + bundle_plan_id + "",
      out_bundle_type: "" + outBundle + "",
      out_bundle_call_plan_id: "" + out_bundle_call_plan_id + "",
      is_roaming_type: "" + isRoaming + "",
      roaming_plan_id: "" + roaming_plan_id + "",
      teleConsultancy_call_plan_id: "" + teleConsultancy_call_plan_id + "",
      sip_trunk: "" + isTrunk + "",
      outbound_conference: "" + isOutboundConf + "",
      obd: "" + isOBD + "",
      obd_channel: "" + obd_channal_limit + "",
      obd_cps: "" + cps + "",
      dynamic_ivr: "" + dynamic_ivr + "",
      voicebot: "" + voicebot + "",
    })
    .then((response) => {
      knex(table.tbl_Package)
        .where("id", "=", "" + package_id + "")
        .update({
          name: knex.raw('TRIM("' + package_name + '")'),
          duration: "" + package_duration + "",
          renew: "" + isAutoRenewal + "",
          expired_at: expired_at,
        })
        .then(async (response) => {
          let obj = [];
          //---------------------------------------------------------
          // knex(table.tbl_Extension_master).where('customer_id', '=', custmerIds)
          //     .update({
          //         voicemail: 0, outbound: 0, recording: 0, black_list: 0, forward: 0, speed_dial: 0, call_transfer: 0
          //     }).then((resp) => {

          //     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
          //----------------------------------------------------------

          let call_plan_name;
          let feature_plan_name;
          let sms_name;
          let bundle_name;
          let outbundle_name;
          let roaming_name;
          let tc_name;
          if (call_plan) {
            call_plan_name = await callPlanName(call_plan);
          }
          if (featureRate) {
            feature_plan_name = await featureName(featureRate);
          }
          if (sms) {
            sms_name = await smsName(sms);
          }
          if (bundle_plan_id) {
            const bundle_data = await minutePlanName(bundle_plan_id, 1);
            bundle_name = bundle_data[0]['name'];
            if (req.body.feature.is_Bundle) {
              obj.push({ minute_plan: bundle_name, charge: bundle_data[0]['charge'] == null ? 0 : bundle_data[0]['charge'], plan_type: '1', package_id: package_id });
            }
            // obj.bundle_plan_name = bundle_name;
            // obj.bundle_plan_charge = bundle_data[0]['charge'] == null ? 0 : bundle_data[0]['charge'];
          }
          if (roaming_plan_id) {
            const roaming_data = await minutePlanName(roaming_plan_id, 2);
            roaming_name = roaming_data[0]['name'];
            if (req.body.feature.is_Roaming) {
              obj.push({ minute_plan: roaming_name, charge: roaming_data[0]['charge'] == null ? 0 : roaming_data[0]['charge'], plan_type: '2', package_id: package_id });
            }
            // obj.roaming_plan_name = roaming_name;
            // obj.roaming_plan_charge = roaming_data[0]['charge'] == null ? 0 : roaming_data[0]['charge'];       
          }
          if (teleConsultancy_call_plan_id) {
            const tc_data = await minutePlanName(teleConsultancy_call_plan_id, 4);
            tc_name = tc_data[0]['name'];
            if (req.body.feature.is_Tc) {
              obj.push({ minute_plan: tc_name, charge: tc_data[0]['charge'] == null ? 0 : tc_data[0]['charge'], plan_type: '4', package_id: package_id });
            }
            // obj.tc_plan_name = tc_name;
            // obj.tc_plan_charge = tc_data[0]['charge'] == null ? 0 : tc_data[0]['charge'];
          }
          if (out_bundle_call_plan_id) {
            const out_bundle_data = await minutePlanName(out_bundle_call_plan_id, 5);
            outbundle_name = out_bundle_data[0]['name'];
            if (req.body.feature.is_Outgoing) {
              obj.push({ minute_plan: outbundle_name, charge: out_bundle_data[0]['charge'] == null ? 0 : out_bundle_data[0]['charge'], plan_type: '5', package_id: package_id });
            }
            // obj.outbound_bundle_plan_name = outbundle_name;
            // obj.outbound_bundle_plan_charge = out_bundle_data[0]['charge'] == null ? 0 : out_bundle_data[0]['charge'];
          }

          let allFeatures = {
            black_list: "" + black_list + "",
            voicemail: "" + voice_mail + "",
            ivr: "" + ivr + "",
            call_transfer: "" + call_transfer + "",
            forward: "" + forward + "",
            concurrent_call: "" + concurrent_call + "",
            recording: "" + pbx_recording + "",
            phone_book: "" + phone_book + "",
            outbound_call: "" + outbound + "",
            click_to_call: "" + click2call + "",
            music_on_hold: "" + music_on_hold + "",
            paging: "" + paging + "",
            speed_dial: "" + speed_dial + "",
            ring_time_out: "" + ring_time_out + "",
            call_group: "" + call_group + "",
            conference: "" + conference + "",
            billing_type: "" + billing_type + "",
            barging: "" + call_barging + "",
            extension_limit: "" + extension_limit + "",
            file_storage_duration: "" + file_storage_duration + "",
            voicemail_limit: "" + vm_limit + "",
            storage: "" + storage + "",
            custom_prompt: "" + customPrompt + "",
            file_storage_size: "" + file_storage_size + "",
            queue: "" + queue + "",
            minute_balance: "" + minute_balance + "",
            call_plan_id: "" + call_plan_name + "",
            find_me_follow_me: "" + findMeFollowMe + "",
            one_to_one_video_call: "" + oneToOneVideoCall + "",
            is_circle: "" + isCircle + "",
            circle_id: "" + circle + "",
            is_feature_rate: "" + isFeatureRate + "",
            feature_rate_id: "" + feature_plan_name + "",
            custom_acl: "" + isCustomeACL + "",
            CID_routing: "" + isCallerID + "",
            broadcasting: "" + isBroadcast + "",
            is_sms: "" + isSMS + "",
            sms_id: "" + sms_name + "",
            teleconsultation: "" + isTeleConsultancy + "",
            subscription: "" + subscription + "",
            feed_back_call: "" + isfeedbackCall + "",
            sticky_agent: "" + isStickyAgent + "",
            geo_tracking: "" + isGeoTracking + "",
            miss_call_alert: "" + isMissCallAlert + "",
            is_sms_type_custom: "" + isSMSTypCustom + "",
            playback: "" + isPlayback + "",
            appointment: "" + isAppointment + "",
            whatsapp: "" + isWhatsapp + "",
            minute_plan: "" + isMinutePlan + "",
            is_bundle_type: "" + isBundle + "",
            bundle_plan_id: "" + bundle_name + "",
            out_bundle_type: "" + outBundle + "",
            out_bundle_call_plan_id: "" + outbundle_name + "",
            is_roaming_type: "" + isRoaming + "",
            roaming_plan_id: "" + roaming_name + "",
            teleConsultancy_call_plan_id: "" + tc_name + "",
            sip_trunk: "" + isTrunk + "",
            outbound_conference: "" + isOutboundConf + "",
            obd: "" + isOBD + "",
            obd_channel: "" + obd_channal_limit + "",
            obd_cps: "" + cps + "",
            dynamic_ivr: "" + dynamic_ivr + "",
            voicebot: "" + voicebot + "",
          };
          let allFeature = knex(table.tbl_pbx_pkg_logs)
            .insert({
              package_id: package_id,
              product_id: "1",
              feature_id: "" + pbx_id + "",
              action: "Updated Package which not associate any user",
              assign_customer_id: "",
              all_features: "" + JSON.stringify(allFeatures) + "",
            })
          allFeature.then(async (response3) => {
            await createModuleLog(table.tbl_pbx_package_detail_history, {
              package_id: pbx_id, // it will be implemented later
              action: "Package Detail Updated",
              modified_by,
              data: "" + JSON.stringify(allFeatures) + "",
            });
            if ((teleConsultancy_call_plan_id || bundle_plan_id || roaming_plan_id || out_bundle_call_plan_id) && obj.length) {
              await knex(table.tbl_pbx_minutePlan_history).insert(obj).then((response4) => {
                res.json({
                  response4,
                });
              }).catch((err) => {
                res
                  .status(401)
                  .send({ error: "error", message: "DB Error: " + err.message });
                throw err;
              })
            } else {
              res.json({
                response,
              });
            }
          })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ error: "error", message: "DB Error: " + err.message });
              throw err;
            });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function postOcFeature(req, res) {
  let campaign_limit = req.body.feature.campaign_limit;
  if (campaign_limit === "") {
    campaign_limit = "0";
  }
  let participant_limit = req.body.feature.participant_limit;
  if (participant_limit === "") {
    participant_limit = "0";
  }
  let retry = req.body.feature.retry;
  if (retry === "") {
    retry = "0";
  }
  let oc_recording = req.body.feature.oc_recording;
  if (oc_recording === true) {
    oc_recording = "1";
  } else {
    oc_recording = "0";
  }

  let schedule_campaign = req.body.feature.schedule_campaign;
  if (schedule_campaign === true) {
    schedule_campaign = "1";
  } else {
    schedule_campaign = "0";
  }

  let mute = req.body.feature.mute;
  if (mute === true) {
    mute = "1";
  } else {
    mute = "0";
  }
  let package_name = req.body.feature.package_name_oc;
  let package_duration = req.body.feature.package_duration_oc;
  let expired_at =
    package_duration != 0
      ? new Date(new Date().getTime() + package_duration * 24 * 60 * 60 * 1000)
      : new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
  knex(table.tbl_OC_features)
    .insert({
      campaign_list: "" + campaign_limit + "",
      participant_limit: "" + participant_limit + "",
      recording: "" + oc_recording + "",
      schedule_campaign: "" + schedule_campaign + "",
      max_retry: "" + retry + "",
      mute: "" + mute + "",
      status: "1",
    })
    .then((response) => {
      let lastInsertedId = response;
      knex(table.tbl_Package)
        .insert({
          name: knex.raw('TRIM("' + package_name + '")'),
          product_id: "2",
          feature_id: "" + lastInsertedId + "",
          duration: "" + package_duration + "",
          renew: "0",
          expired_at: expired_at,
          status: "1",
        })
        .then((resp) => {
          res.json({
            resp,
          });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function customPostOcFeature(req, res) {
  let data = req.body.feature.form_data;
  let custmerIds = req.body.feature.customer_id;
  let campaign_limit = data.campaign_limit;
  if (campaign_limit === "") {
    campaign_limit = "0";
  }
  let participant_limit = data.participant_limit;
  if (participant_limit === "") {
    participant_limit = "0";
  }
  let retry = data.retry;
  if (retry === "") {
    retry = "0";
  }
  let oc_recording = data.oc_recording;
  if (oc_recording == true || oc_recording == 1) {
    oc_recording = "1";
  } else {
    oc_recording = "0";
  }

  let schedule_campaign = data.schedule_campaign;
  if (schedule_campaign == true || schedule_campaign == 1) {
    schedule_campaign = "1";
  } else {
    schedule_campaign = "0";
  }

  let mute = data.mute;
  if (mute == true || mute == 1) {
    mute = "1";
  } else {
    mute = "0";
  }
  let package_name = req.body.feature.package_old_name_oc;
  let package_duration = data.package_duration_oc;
  let expired_at =
    package_duration != 0
      ? new Date(new Date().getTime() + package_duration * 24 * 60 * 60 * 1000)
      : new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);

  knex(table.tbl_OC_features)
    .insert({
      campaign_list: "" + campaign_limit + "",
      participant_limit: "" + participant_limit + "",
      recording: "" + oc_recording + "",
      schedule_campaign: "" + schedule_campaign + "",
      max_retry: "" + retry + "",
      mute: "" + mute + "",
      status: "1",
    })
    .then((response) => {
      let lastInsertedId = response;
      knex(table.tbl_Package)
        .insert({
          name: knex.raw('TRIM("' + package_name + '")'),
          product_id: "2",
          feature_id: "" + lastInsertedId + "",
          duration: "" + package_duration + "",
          renew: "0",
          expired_at: expired_at,
          status: "1",
        })
        .then((resp) => {
          let package_id = resp;
          for (let i = 0; i < custmerIds.length; i++) {
            knex(table.tbl_Map_customer_package)
              .where("customer_id", "=", "" + custmerIds[i] + "")
              .update({ package_id: "" + package_id + "" })
              .then((resp) => {
                pushEmail
                  .getCustomerNameandEmail(custmerIds[i])
                  .then((data) => {
                    pushEmail
                      .getEmailContentUsingCategory("OCPackageUpdation")
                      .then((val) => {
                        pushEmail
                          .sendmail({
                            data: data,
                            val: val,
                            feature: req.body.feature,
                            customer: "customerOC",
                          })
                          .then((data1) => { });
                      });
                  });
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(401)
                  .send({
                    error: "error",
                    message: "DB Error: " + err.message,
                  });
                throw err;
              });
          }
          res.status(200).send({ error: "success", message: "Success!!" });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function customUpdateOcFeature(req, res) {
  let data = req.body.feature.form_data;
  let campaign_limit = data.campaign_limit;
  if (campaign_limit === "") {
    campaign_limit = "0";
  }
  let participant_limit = data.participant_limit;
  if (participant_limit === "") {
    participant_limit = "0";
  }
  let retry = data.retry;
  if (retry === "") {
    retry = "0";
  }
  let oc_recording = data.oc_recording;
  if (oc_recording == true || oc_recording == 1) {
    oc_recording = "1";
  } else {
    oc_recording = "0";
  }

  let schedule_campaign = data.schedule_campaign;
  if (schedule_campaign == true || schedule_campaign == 1) {
    schedule_campaign = "1";
  } else {
    schedule_campaign = "0";
  }

  let mute = data.mute;
  if (mute == true || mute == 1) {
    mute = "1";
  } else {
    mute = "0";
  }

  let package_name = req.body.feature.package_old_name_oc;
  let package_duration = data.package_duration_oc;
  let expired_at =
    package_duration != 0
      ? new Date(new Date().getTime() + package_duration * 24 * 60 * 60 * 1000)
      : new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
  let package_id = data.package_id;
  let oc_id = data.oc_id;
  let allCheck = req.body.feature.allCheck;
  if (allCheck == true || allCheck == "true") {
    let sql = knex(table.tbl_OC_features)
      .where("id", "=", "" + oc_id + "")
      .update({
        campaign_list: "" + campaign_limit + "",
        participant_limit: "" + participant_limit + "",
        recording: "" + oc_recording + "",
        schedule_campaign: "" + schedule_campaign + "",
        max_retry: "" + retry + "",
        mute: "" + mute + "",
      });
  } else {
    res
      .status(401)
      .send({ error: "error", message: "Something went wrong!!!" });
  }

  sql
    .then((response) => {
      knex(table.tbl_Package)
        .where("id", "=", "" + package_id + "")
        .update({
          name: knex.raw('TRIM("' + package_name + '")'),
          duration: "" + package_duration + "",
          renew: "0",
          expired_at: expired_at,
        })
        .then((response) => {
          res.json({
            response,
          });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function updateOcFeature(req, res) {
  let campaign_limit = req.body.feature.campaign_limit;
  if (campaign_limit == "") {
    campaign_limit = "0";
  }
  let participant_limit = req.body.feature.participant_limit;
  if (participant_limit == "") {
    participant_limit = "0";
  }
  let retry = req.body.feature.retry;
  
  if (retry == "") {
    retry = "0";
  }
  let oc_recording = req.body.feature.oc_recording;
  if (oc_recording == true || oc_recording == "1") {
    oc_recording = "1";
  } else {
    oc_recording = "0";
  }

  let schedule_campaign = req.body.feature.schedule_campaign;
  if (schedule_campaign == true || schedule_campaign == 1) {
    schedule_campaign = "1";
  } else {
    schedule_campaign = "0";
  }

  let mute = req.body.feature.mute;
  if (mute == true || mute == 1) {
    mute = "1";
  } else {
    mute = "0";
  }
  let package_name = req.body.feature.package_name_oc;
  let package_duration = req.body.feature.package_duration_oc;
  let expired_at =
    package_duration != 0
      ? new Date(new Date().getTime() + package_duration * 24 * 60 * 60 * 1000)
      : new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
  let package_id = req.body.feature.package_id;
  let oc_id = req.body.feature.oc_id;
  let sql = knex(table.tbl_OC_features)
    .where("id", "=", "" + oc_id + "")
    .update({
      campaign_list: "" + campaign_limit + "",
      participant_limit: "" + participant_limit + "",
      recording: "" + oc_recording + "",
      schedule_campaign: "" + schedule_campaign + "",
      max_retry: "" + retry + "",
      mute: "" + mute + "",
    });

  sql
    .then((response) => {
      knex(table.tbl_Package)
        .where("id", "=", "" + package_id + "")
        .update({
          name: knex.raw('TRIM("' + package_name + '")'),
          duration: "" + package_duration + "",
          renew: "0",
          expired_at: expired_at,
        })
        .then((response) => {
          res.json({
            response,
          });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getPbxFeatures(req, res) {
  let sql = "";
  let customerId = parseInt(req.body.customerId);
  let productId = parseInt(req.body.productId);
  if (productId === 1) {
    knex
      .select("*")
      .from(table.tbl_PBX_features + " as f")
      .join(table.tbl_Package + " as p", "f.id", "p.feature_id")
      .join(table.tbl_Map_customer_package + " as mp", "mp.package_id", "p.id")
      .where("mp.customer_id", "=", "" + customerId + "")
      .andWhere("mp.product_id", "=", "" + productId + "")
      .then((response) => {
        res.json({
          response,
        });
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else if (productId === 2) {
    knex
      .select("*")
      .from(table.tbl_OC_features + " as f")
      .join(table.tbl_Package + " as p", "f.id", "p.feature_id")
      .join(table.tbl_Map_customer_package + " as mp", "mp.package_id", "p.id")
      .where("mp.customer_id", "=", "" + customerId + "")
      .andWhere("mp.product_id", "=", "" + productId + "")
      .then((response) => {
        res.json({
          response,
        });
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  }
  // sql.then((response) => {
  //     res.json({
  //         response
  //     });
  // }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getProductFeatures(req, res) {
  let customerId = parseInt(req.query.customerId);
  let productId = parseInt(req.query.productId);

  let sql = knex
    .select(
      "f.black_list",
      "f.ivr",
      "f.conference",
      "f.custom_prompt",
      "f.queue"
    )
    .from(table.tbl_PBX_features + " as f")
    .join(table.tbl_Package + " as p", "f.id", "p.feature_id")
    .join(table.tbl_Map_customer_package + " as mp", "mp.package_id", "p.id")
    .where("mp.customer_id", "=", "" + customerId + "")
    .andWhere("mp.product_id", "=", "" + productId + "");

  sql
    .then((response) => {
      if (response.length > 0) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getCustomerProductFeatures(req, res) {
  let customerId = parseInt(req.query.customerId);
  let sql = knex
    .select(
      "f.music_on_hold",
      "f.recording",
      "f.custom_prompt",
      "f.storage",
      "f.conference",
      "f.feed_back_call as feedback_call",
      "f.sticky_agent",
      "f.is_sms"
    )
    .from(table.tbl_PBX_features + " as f")
    .join(table.tbl_Package + " as p", "f.id", "p.feature_id")
    .join(table.tbl_Map_customer_package + " as mp", "mp.package_id", "p.id")
    .where("mp.customer_id", "=", "" + customerId + "");

  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getExtensionFeaturesBasedOnCustomer(req, res) {
  let extensionId = req.query.extensionId;
  var sql = knex
    .select("customer_id")
    .from(table.tbl_Extension_master)
    .where("id", "=", extensionId);
  sql
    .then((response) => {
      if (response) {
        let customer_id = response ? response[0]["customer_id"] : 0;
        let sql2 = knex
          .select(
            "f.music_on_hold",
            "f.recording",
            "f.custom_prompt",
            "f.storage",
            "f.conference",
            "f.feed_back_call as feedback_call",
            "f.sticky_agent",
            "f.is_sms"
          )
          .from(table.tbl_PBX_features + " as f")
          .join(table.tbl_Package + " as p", "f.id", "p.feature_id")
          .join(
            table.tbl_Map_customer_package + " as mp",
            "mp.package_id",
            "p.id"
          )
          .where("mp.customer_id", "=", "" + customer_id + "");
        sql2
          .then((response) => {
            if (response) {
              res.json({
                response,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            res
              .status(401)
              .send({ error: "error", message: "DB Error: " + err.message });
            throw err;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

function getBlacklistFeatures(req, res) {
  knex
    .raw(
      "Call pbx_getBlacklistFeatures(" +
      req.body.id +
      "," +
      req.body.product_id +
      "," +
      req.body.role +
      ")"
    )
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function checkFeatureByPackage(req, res) {
  let ext_id = req.query.id;
  knex
    .select("f.teleconsultation")
    .from(table.tbl_Extension_master + " as e")
    .join(table.tbl_Package + " as p", "p.id", "e.package_id")
    .join(table.tbl_PBX_features + " as f", "f.id", "p.feature_id")
    .where("e.id", "=", "" + ext_id + "")
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

module.exports = {
  customUpdateOcFeature,
  customPostOcFeature,
  customUpdatePbxFeature,
  customPostPbxFeature,
  postPbxFeature,
  postOcFeature,
  updatePbxFeature,
  updateOcFeature,
  getPbxFeatures,
  getProductFeatures,
  getCustomerProductFeatures,
  getBlacklistFeatures,
  getExtensionFeaturesBasedOnCustomer,
  checkFeatureByPackage,
};
