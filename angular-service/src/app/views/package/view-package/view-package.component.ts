import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Errors, CommonService, ProductService, phoneBookLimit, oldExtensionLimit, oldMinuteLimit, retryMessage, duplicatePackage, packageUpdated, invalidFormError, errorMessage, minutePlan,Number_one_to_twohun,Number_one_to_hundered } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { PackageService } from '../package.service';
import { EmailService } from '../../../core/services/email.service';
import { CallplanService } from '../../call-plan/callplan.service';
import { FeaturesService } from '../../feature/feature.service';

@Component({
  selector: 'app-view-package',
  templateUrl: './view-package.component.html',
  styleUrls: ['./view-package.component.css']
})
export class ViewPackageComponent implements OnInit {
  maskArray:any;
  data: any = {};
  packageData = '';
  error = '';
  pbxDiv = false;
  ocDiv = false;
  voiceMailTextBox = true;
  pbxForm: FormGroup;
  ocForm: FormGroup;
  errors: Errors = { errors: {} };
  submitted = false;
  nextButton = true;
  submitButton = false;
  packageId = '';
  productId = '';
  bundleID = '';
  maxRetrylimit = "";
  isStorage: boolean;
  customerName: any = {};
  emailContentData: any = {};
  isOutbound: boolean;
  gatewayGroup = '';
  callPlans:any = '';
  CallPlanFilter:any;
  filterCall:any;
  oldExtensionLimitValue: any = 0;
  billingType = '';
  isMinuteBal = false;
  isPrompt = false;
  oldMinuteBal = 0;
  isCircle: boolean;
  circleList: any;
  CircleFilter:any;
  filterCircle:any;
  circleId: any;
  isFeatureRate: boolean;
  globalFeatureRateList: any;
  FeatureRateFilter;any;
  filterRate:any;
  globalFeatureRateId: any;
  isCustomACL: boolean;
  isCallerID: boolean;
  isTrunk: boolean;
  SMSList: any;
  isMCA = false;
  storageSize = false;
  minuteDisable = false;
  bundleDisable = false;
  outbundleDisable = false;
  romingDisable = false;
  TCDisable = false;
  bundleVariable = false;
  outbundleVariable = false;
  addTC:any;
  addBundle:any;
  addRoaming:any;
  romingVariable = false;
  TCvariable = false;
  SMSFilter:any;
  filterSMS:any;
  isTeleConsultancy: boolean;
  isSMS: boolean;
  isTeleConsultancyShow: boolean;
  isBroadcast: boolean;
  smsId: any;
  isFeedbackCall: boolean;
  isStickyAgent: boolean;
  isGeoTracking: boolean;
  isMissCallAlert: boolean;
  isAppointment: boolean;
  isWhatsApp: boolean;
  isOutboundConf : boolean;
  isOBD : boolean;
  isDynamicIvr : boolean;
  isVoicebot : boolean;
  isMinutePlan: boolean;
  isBundle: boolean;
  OutBundle: boolean;
  isRoaming: boolean;
  bundlePlanList: any;
  outbundlePlanList:any;
  BundlePlanFilter:any;
  filterBundle:any;
  roamingPlanList: any;
  RoamingPlanFilter:any;
  filterRoaming:any;
  tcCallPlanist: any;
  TCPlanFilter:any;
  filterTC:any;
  selectedbundlePlanId: any;
  selectedbundlePlanObject: any;
  call_plan_Bind:any;
  disabledBundleBox: boolean = true;

  selectedRoamingPlanId: any;
  selectedRoamingPlanObject: any;
  disabledRoamingBox: boolean = true;

  selectedTCPlanId: any;
  selectedTCPlanObject: any;
  disabledTCBox: boolean = true;
  loadFirstTime: boolean = true;
  playbacktoggle:boolean = false;
  roamingData: any
  bundleDataa: any
  cpsdata:any;
  obdchannallimit:any;
  bundlePrmoise : any
  outbundlePrmoise : any
  roamingPromise : any;
  TCPromise : any;
  callPlanData: any;
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Provider';  
  public placeholder1: string = 'DID Bundle Minute Plan';
  public placeholder8: string = 'Outgoing Bundle Minute Plan';
  public placeholder2: string = 'Roaming Minute Plan';
  public placeholder3: string = 'TC Minute Plan'; 
  public placeholder4: string = 'Feature Rate';
  public placeholder5: string = 'Circle Name';
  public placeholder6: string = 'Call Plan';
  public placeholder7: string = 'SMS';
  public popupHeight: string = '200px';    
  public popupWidth: string = '250px';

  public __featureChangeSubscription;
  public __circleChangeSubscription;
  public __smsChangeSubscription;
  type: any;
  check_bundle;
  check_roaming;
  check_tc;
  check_outgoing;
  is_Roaming: boolean = false;
  is_Bundle: boolean = false;
  is_Tc: boolean = false;
  is_OutGoing: boolean = false;


  constructor(
    private productService: ProductService,
    private packageService: PackageService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private emailService: EmailService,
    private callplanService: CallplanService,
    private featuresService: FeaturesService

  ) {
    this.pbxForm = this.fb.group({
      //'black_list': [''],
      'pbx_recording': [''],
      'ivr': [''],
      'call_transfer': [''],
      'forward': [''],
      'outbound': [''],
      'click2call': [''],
      'music_on_hold': [''],
      'speed_dial': [''],
      //'ring_group': [''],
      'conference': [''],
      'call_group': [''],
      'call_barging': [''],
      'concurrent_call': [10, [Validators.required,Validators.maxLength(3), Validators.minLength(1), Validators.min(1)]],
      'phone_book': [50, [Validators.required,Validators.maxLength(3), Validators.minLength(1), Validators.min(1)]],
      'ring_time_out': [60, [Validators.maxLength(2), Validators.minLength(1), Validators.min(1)]],
      'extension_limit': [10,[Validators.required,Validators.min(1)]],
      'queue': [''],
      'vm_limit': [10, Validators.min(1)],
      'file_storage_duration': [30,[Validators.required, Validators.min(1)]],
      'billing_type': [1],
      'package_name': ['', Validators.required],
      'package_duration': [''],
      'pbx_id': [''],
      'package_id': [''],
      'storage': ['1'],
      'custom_prompts': [''],
      'file_storage_size': [1,[Validators.required,Validators.pattern(Number_one_to_hundered)]],
      'gateway_group': [''],
      'call_plan': ['1'],
      'minute_balance': [0],
      'is_auto_renewal': [''],
      'find_me_follow_me': [''],
      'one_to_one_video_call': [''],
      'isCircle': [''],
      'circle': [''],
      'isFeatureRate': [''],
      'featureRate': [''],
      'custom_acl': [''],
      'caller_id': [''],
      'sip_trunk': [''],
      'paging': [''],
      'teleConsultancy': [''],
      'teleConsultancy_call_plan_id': [''],
      'isSms': [''],
      'sms': [''],
      'broadcast': [''],
      'subscription': [1],
      'feedback_call': [''],
      'sticky_agent': [''],
      'geo_tracking': [''],
      'miss_call_alert': [''],
      'playback': [''],
      'appointment': [''],
      'whatsapp': [''],
      'is_minute_plan': [''],
      'is_bundle': [''],
      'out_bundle': [''],
      'is_roaming': [''], 
      'bundle_plan_id': [''],
      'out_bundle_call_plan_id': [''],
      'roaming_plan_id': [''],
      "outbound_conference": [''],
      "outbound_broadcast": [''],
      'obd_channal_limit': [''],
      'cps': [''],
      'dynamic_ivr': [''],
      'voicebot': ['']

    });
    this.ocForm = this.fb.group({
      'campaign_limit': ['0', Validators.required],
      'participant_limit': ['0', Validators.required],
      'retry': ['0', Validators.required],
      'oc_recording': [''],
      'schedule_campaign': [''],
      'mute': [''],
      'package_name_oc': ['', Validators.required],
      'package_duration_oc': [''],
      'oc_id': [''],
      'package_id': [''],
     

    });
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }
  
  ngOnInit() {
    this.maskArray = [
       { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }
    ]
    
    this.packageId = this.route.snapshot.queryParams.pId;
    this.productId = this.route.snapshot.queryParams.proId;
    if (this.productId === '1') {
      this.pbxDiv = true;
      this.ocDiv = false;
    } else if (this.productId === '2') {
      this.ocDiv = true;
      this.pbxDiv = false;
    } else {
      this.pbxDiv = true;
      this.ocDiv = false;
    }
    // this.allPackageService.getPackageInfoById(packageId, productId).subscribe(data => {
    //   this.packageData = data.response;
    //   this.data = this.packageData[0];
    // }, err => {
    //   this.error = err.message;
    // });
    this.getBundlePlanNotReserved(this.type)
    // this.getBundlePlan(this.type)
this.customOninit();


    // this.packageService.getGatewayGroup().subscribe(data => {
    //   this.gatewayGroup = data.response;
    // }, err => {
    //   this.error = err.message;
    // });
    this.getCircle();
    this.getFeaturePlanRate();
    this.getSMS();
    this.getTCCallPlan();
    // this.packageService.getCallPlan().subscribe(data => {
    //   this.callPlans = data.response;
    // });
   
    this.packageService.getCallPlanList().subscribe(data => {
      this.callPlans = data.response;
      this.filterCall = this.CallPlanFilter = this.callPlans.slice();
    }, err => {
      this.error = err.message;
    });
  

    this.__featureChangeSubscription = this.pbxForm.get('isFeatureRate').valueChanges.subscribe(featureID => {
      if (featureID) {
        this.pbxForm.controls.featureRate.setValidators(Validators.required);
        this.pbxForm.controls.featureRate.updateValueAndValidity();
      } else {
        this.pbxForm.controls.featureRate.clearValidators();
        this.pbxForm.controls.featureRate.updateValueAndValidity();
        this.pbxForm.get('featureRate').setValue('');
      }
    });
    this.__circleChangeSubscription = this.pbxForm.get('isCircle').valueChanges.subscribe(circleID => {
      if (circleID) {
        this.pbxForm.controls.circle.setValidators(Validators.required);
        this.pbxForm.controls.circle.updateValueAndValidity();
      } else {
        this.pbxForm.controls.circle.clearValidators();
        this.pbxForm.controls.circle.updateValueAndValidity();
        this.pbxForm.get('circle').setValue('');
        // this.pbxForm.get('call_plan').setValue('');
      }
    });

    this.__smsChangeSubscription = this.pbxForm.get('isSms').valueChanges.subscribe(smsID => {
      if (smsID) {
        this.pbxForm.controls.sms.setValidators(Validators.required);
        this.pbxForm.controls.sms.updateValueAndValidity();
      } else {
        this.pbxForm.controls.sms.clearValidators();
        this.pbxForm.controls.sms.updateValueAndValidity();
        this.pbxForm.get('sms').setValue('');
      }
    });
  }
  public getBundlePlanNotReserved(type) {
    let creadentials = {};
    creadentials['by_plan_type'] = Number(type) // bundle or roaming
    this.callplanService.filterBundlePlanForPackage(creadentials).subscribe(data => {
      if (type == '1') {        
        let bundleData = data ? data : [];
        this.bundlePlanList = bundleData.sort((a, b) => a.name.localeCompare(b.name)); 
        this.bundlePrmoise.then((result) => {
          this.pbxForm.get('bundle_plan_id').setValue(Number(result));
        })              
        // this.filterBundle = this.bundlePlanList.slice();
        this.filterBundle = this.BundlePlanFilter = this.bundlePlanList.slice();
        

        if (this.selectedbundlePlanObject) this.bundlePlanList.push(this.selectedbundlePlanObject)

        // this.filterBundle = this.bundlePlanList.slice();
        this.filterBundle = this.BundlePlanFilter = this.bundlePlanList.slice();


      }
      else if (type == '5') {        
        let outbundleData = data ? data : [];
        this.outbundlePlanList = outbundleData.sort((a, b) => a.name.localeCompare(b.name)); 
        this.outbundlePrmoise.then((result) => {
          this.pbxForm.get('out_bundle_call_plan_id').setValue(Number(result));
        })              
        // this.filterBundle = this.bundlePlanList.slice();
        this.filterBundle = this.BundlePlanFilter = this.outbundlePlanList.slice();
        

        if (this.selectedbundlePlanObject) this.outbundlePlanList.push(this.selectedbundlePlanObject)

        // this.filterBundle = this.bundlePlanList.slice();
        this.filterBundle = this.BundlePlanFilter = this.outbundlePlanList.slice();


      } else if (type == '2') {        
        let roamingData = data ? data : [];
        this.roamingPlanList = roamingData.sort((a, b) => a.name.localeCompare(b.name));    
        this.roamingPromise.then((result) => {
          this.pbxForm.get('roaming_plan_id').setValue(Number(result));
        })       
        if (this.selectedRoamingPlanObject) this.roamingPlanList.push(this.selectedRoamingPlanObject)
        this.filterRoaming = this.RoamingPlanFilter = this.roamingPlanList.slice();
        // this.filterRoaming = this.RoamingPlanFilter = this.roamingPlanList.slice();

      } else if (type == '4') {
        let tcData = data ? data : [];
        this.tcCallPlanist = tcData.sort((a, b) => a.name.localeCompare(b.name));
        this.TCPromise.then((result) => {
          this.pbxForm.get('teleConsultancy_call_plan_id').setValue(Number(result));
        }) 
      // this.filterTC = this.tcCallPlanist.slice();
      this.filterTC = this.TCPlanFilter = this.tcCallPlanist.slice();


        if (this.selectedTCPlanObject) this.tcCallPlanist.push(this.selectedTCPlanObject)
      this.filterTC = this.TCPlanFilter = this.tcCallPlanist.slice();

      }
    }, err => {
      this.errors = err.message;
    });
  }
  
  customOninit(){
    this.packageService.getPackageInfoById(this.packageId, this.productId).subscribe(data => {
      if (data.response[0]['minute_plan'] == 1 && data.response[0]['user_count'] != 0) {
        this.minuteDisable = true
      }
      if(data.response[0]['is_bundle_type'] == 1 && data.response[0]['user_count'] != 0){
        this.bundleDisable = true
      } 
      if(data.response[0]['bundle_plan_id'] != 0 && data.response[0]['user_count'] != 0){
        this.bundleDisable = true
      }
      if(data.response[0]['out_bundle_type'] == 1 && data.response[0]['user_count'] != 0){
        this.outbundleDisable = true
      } 
      if(data.response[0]['out_bundle_call_plan_id'] != 0 && data.response[0]['user_count'] != 0){
        this.outbundleDisable = true
      }
      if(data.response[0]['is_roaming_type'] != 0 && data.response[0]['user_count'] != 0){
        this.romingDisable = true
      }
      if(data.response[0]['roaming_plan_id'] != 0 && data.response[0]['user_count'] != 0){
        this.romingDisable = true
      }
      if(data.response[0]['teleconsultation'] == 1 && data.response[0]['user_count'] != 0){
        this.TCDisable = true
      }
      if(data.response[0]['teleConsultancy_call_plan_id'] != 0 && data.response[0]['user_count'] != 0){
        this.TCDisable = true
      }
      

      if(data.response[0]['playback'] == true || data.response[0]['playback'] == 1){
        this.playbacktoggle = true;
      }
      

      this.data = data.response[0];
      this.check_bundle = this.data.bundle_plan_id;
      this.check_roaming = this.data.roaming_plan_id;
      this.check_outgoing = this.data.out_bundle_call_plan_id;
      this.check_tc = this.data.teleConsultancy_call_plan_id;
      
      if(this.productId == '1'){
        if(JSON.parse(this.data.obd_cps) == 0){
          this.cpsdata = 1
        }
        else{
          this.cpsdata = JSON.parse(this.data.obd_cps);
        }
        this.isCallerID = this.data.CID_routing == '1' ? true : false;
        if(JSON.parse(this.data.obd_channel) == 0){
          this.obdchannallimit = 1
        }
        else{
          this.obdchannallimit = JSON.parse(this.data.obd_channel);
        }
      }
      this.data.subscription = Number(this.data.subscription);         
      this.roamingData = this.data.roaming_plan_id;  
      this.bundlePrmoise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.data.bundle_plan_id);
        }, 1000);
      }) 
      this.outbundlePrmoise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.data.out_bundle_call_plan_id);
        }, 1000);
      })  
      this.roamingPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.data.roaming_plan_id);
        }, 1000);
      }) 
      this.TCPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.data.teleConsultancy_call_plan_id);
        }, 1000);
      })
      // this.bundleDataa = Number(this.data.bundle_plan_id)
      this.selectedbundlePlanId = this.data['bundle_plan_id'] ? this.data['bundle_plan_id'] : 0;
      this.selectedbundlePlanId = this.data['out_bundle_call_plan_id'] ? this.data['out_bundle_call_plan_id'] : 0;
      this.selectedRoamingPlanId = this.data['roaming_plan_id'] ? this.data['roaming_plan_id'] : 0;
      this.selectedTCPlanId = this.data['teleConsultancy_call_plan_id'] ? this.data['teleConsultancy_call_plan_id'] : 0;

      localStorage.setItem('old_bundle_id', this.selectedbundlePlanId); // set value for manage booster with associated with minute plan
      localStorage.setItem('old_out_bundle_id', this.selectedbundlePlanId); // set value for manage booster with associated with minute plan
      localStorage.setItem('old_roaming_id', this.selectedRoamingPlanId); // set value for manage booster with associated with roaming plan
      localStorage.setItem('old_tc_id', this.selectedTCPlanId); // set value for manage booster with associated with tc plan

      localStorage.setItem('is_bundle', this.data['is_bundle_type']); // set value for manage booster with associated with minute plan
      localStorage.setItem('out_bundle', this.data['out_bundle_type']); // set value for manage booster with associated with minute plan
      localStorage.setItem('is_roaming', this.data['is_roaming_type']); // set value for manage booster with associated with roaming plan
      localStorage.setItem('is_tc', this.data['teleconsultation']); // set value for manage booster with associated with tc plan


      if (this.data.billing_type == "2" || this.data.billing_type == "3") {
        this.isMinuteBal = true;
        this.isTeleConsultancyShow = true;
      } else {
        this.isMinuteBal = false;
        this.isTeleConsultancyShow = false;
      }
      this.data.product = this.productId;
      this.oldMinuteBal = this.data.minute_balance;
      // this.data['gateway_group_id'] = parseInt(this.data.gateway_group_id);      
      setTimeout(() => {
        this.callPlanData = parseInt(this.data.call_plan_id);              
      }, 1000);
      this.isStorage = this.data.storage;
      this.isOutbound = this.data.outbound_call;
      this.isPrompt = this.data.custom_prompt;
      this.maxRetrylimit = this.data.max_retry;
      
      
      this.oldExtensionLimitValue = this.data.extension_limit;
      this.isCircle = this.data.is_circle == '1' ? true : false;
      this.isFeatureRate = this.data.is_feature_rate == '1' ? true : false;
      this.circleId = Number(this.data.circle_id);
      this.globalFeatureRateId = this.data.feature_rate_id ? Number(this.data.feature_rate_id) : '';
    
      
      this.isTrunk = this.data.sip_trunk == '1' ? true : false;
      this.isCustomACL = this.data.custom_acl == '1' ? true : false;
      this.isTeleConsultancy = this.data.teleconsultation == '1' ? true : false;
      this.isSMS = this.data.is_sms == '1' ? true : false;
      this.smsId = this.data.sms_id ? Number(this.data.sms_id) : '';
      this.isBroadcast = this.data.broadcasting == '1' ? true : false;
      this.isFeedbackCall = this.data.feed_back_call == '1' ? true : false;
      this.isStickyAgent = this.data.sticky_agent == '1' ? true : false;
      this.isGeoTracking = this.data.geo_tracking == '1' ? true : false;
      this.isMissCallAlert = this.data.miss_call_alert == '1' ? true : false;
      this.isAppointment = this.data.appointment == '1' ? true : false;
      this.isWhatsApp = this.data.whatsapp == '1' ? true : false;
      this.isMinutePlan = this.data.minute_plan == '1' ? true : false;
      this.isBundle = this.data.is_bundle_type == '1' ? true : false;
      this.OutBundle = this.data.out_bundle_type == '1' ? true : false;
      this.isRoaming = this.data.is_roaming_type == '1' ? true : false;            
      this.isOutboundConf = this.data.outbound_conference == '1' ? true : false;            
      this.isOBD = this.data.obd == '1' ? true : false;    
      this.isDynamicIvr = this.data.dynamic_ivr == '1' ? true : false;    
      this.isVoicebot = this.data.voicebot == '1' ? true : false;    
      if (this.isBundle) this.getBundlePlan('1'); //this.changeMinutePlanType(true,'1'); this.disabledBundleBox = true; 
      if (this.OutBundle) this.getBundlePlan('5'); //this.changeMinutePlanType(true,'1'); this.disabledBundleBox = true; 
      if (this.isRoaming) this.getBundlePlan('2'); //this.changeMinutePlanType(true,'2'); this.disabledRoamingBox = true;
      if (this.isTeleConsultancy) this.getBundlePlan('4'); // this.changeMinutePlanType(true,'4'); this.disabledTCBox = true;
      if (!this.isBundle) this.data.bundle_plan_id = ""; this.changeMinutePlanType(false, '1'); this.disabledBundleBox = true;
      if (!this.OutBundle) this.data.out_bundle_call_plan_id = ""; this.changeMinutePlanType(false, '5'); this.disabledBundleBox = true;
      if (!this.isRoaming) this.data.roaming_plan_id = ""; this.changeMinutePlanType(false, '2'); this.disabledRoamingBox = true;
      if (!this.isTeleConsultancy) this.data.teleConsultancy_call_plan_id = ""; this.changeMinutePlanType(false, '4'); this.disabledTCBox = true;

      this.onCircleSelect(this.data.circle_id);
      // if(this.data.user_count > 1){
      //   this.pbxForm.get('is_minute_plan').disable();
      // }
    });
  }
  smsremovespace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.SMSList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  timeGroupDataremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.globalFeatureRateList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Bundleremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.bundlePlanList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  OutBundleremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.outbundlePlanList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Roamingremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.roamingPlanList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  TCremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.tcCallPlanist.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Circleremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.circleList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  CallPlanremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.callPlans.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);  
  }
  checkBundlehere(event){
   
    if(event.checked == true){
      this.bundleVariable = true
    }
    else{
    this.bundleVariable = false
    }
  }
  checkoutBundle(event){
  
    if(event.checked == true){
    this.outbundleVariable = true
    }
    else{
    this.outbundleVariable = false
    }
  }
  checkoutRoaming(event){
  
    if(event.checked == true){
    this.romingVariable = true
    }
    else{
    this.romingVariable = false
    }
  }
  checkoutTC(event){
   
    if(event.checked == true){
    this.TCvariable = true
    }
    else{
    this.TCvariable = false
    }
  }
  bundlechange(event){    
    if(event.e.isTrusted == true){
    this.bundleVariable = true
    }
  } 
  outbundlechange(event){
    if(event.e.isTrusted == true){
    this.outbundleVariable = true
    }
  } 

  checkBundle(event){          
    this.is_Bundle = this.check_bundle == event ? false : true;
  }

  checkTc(event){    
    this.is_Tc = this.check_tc == event ? false : true;
  }
  
  checkRoaming(event){   
    this.is_Roaming = this.check_roaming == event ? false : true;
  }

  checkOutgoing(event){
    this.is_OutGoing = this.check_outgoing == event ? false : true;
  }
  
  romingchange(event){    
    if(event.e.isTrusted == true){
    this.romingVariable = true
    }
  }
  TCchange(event){
    if(event.e.isTrusted == true){
    this.TCvariable = true
    }
  }


  get vm_limit() { return this.pbxForm.get('vm_limit'); }
  get package_name() { return this.pbxForm.get('package_name'); }
  get package_duration() { return this.pbxForm.get('package_duration'); }
  get concurrent_call() { return this.pbxForm.get('concurrent_call'); }
  get phone_book() { return this.pbxForm.get('phone_book'); }
  get ring_time_out() { return this.pbxForm.get('ring_time_out'); }
  get extension_limit() { return this.pbxForm.get('extension_limit'); }
  get file_storage_duration() { return this.pbxForm.get('file_storage_duration'); }
  get file_storage_size() { return this.pbxForm.get('file_storage_size'); }
  get is_minute_plan() { return this.pbxForm.get('is_minute_plan'); }
  get is_bundle() { return this.pbxForm.get('is_bundle'); }
  get out_bundle() { return this.pbxForm.get('out_bundle'); }
  get is_roaming() { return this.pbxForm.get('is_roaming'); }
  get teleConsultancy() { return this.pbxForm.get('teleConsultancy'); }
  get obd_channal_limit() { return this.pbxForm.get('obd_channal_limit'); }
  get cps() { return this.pbxForm.get('cps'); }
  get package_name_oc() { return this.ocForm.get('package_name_oc'); }
  get package_duration_oc() { return this.ocForm.get('package_duration_oc'); }

  public isChnage(event){
    let isSetobdEnable = event.checked;
    let isSetobdEnablee = event.isTrusted;
    if (isSetobdEnable == true || isSetobdEnablee == true) {
      this.pbxForm.controls.cps.setValidators(Validators.required);
      this.pbxForm.controls.cps.updateValueAndValidity();
      this.cpsdata = 1
      this.pbxForm.controls.obd_channal_limit.setValidators([Validators.required, Validators.pattern(Number_one_to_twohun)]);
      this.pbxForm.controls.obd_channal_limit.updateValueAndValidity();
      this.obdchannallimit = 1

    }
    else{
      this.pbxForm.controls.cps.clearValidators();
      this.pbxForm.controls.cps.updateValueAndValidity();
      this.pbxForm.controls.obd_channal_limit.clearValidators();
      this.pbxForm.controls.obd_channal_limit.updateValueAndValidity();
      this.pbxForm.get('cps').reset();
      this.pbxForm.get('obd_channal_limit').reset();
    
    }
   }

   public isChnagee(event){
    let isSetobdEnable = event.checked;
    let isSetobdEnablee = event.isTrusted;
    if (isSetobdEnable == true || isSetobdEnablee == true) {
      // this.pbxForm.controls.cps.setValidators(Validators.required);
      // this.pbxForm.controls.cps.updateValueAndValidity();
      // this.cpsdata = 1
      this.pbxForm.controls.obd_channal_limit.setValidators([Validators.required, Validators.pattern(Number_one_to_twohun)]);
      this.pbxForm.controls.obd_channal_limit.updateValueAndValidity();
      // this.obdchannallimit = 1

    }
    else{
      this.pbxForm.controls.cps.clearValidators();
      this.pbxForm.controls.cps.updateValueAndValidity();
      this.pbxForm.controls.obd_channal_limit.clearValidators();
      this.pbxForm.controls.obd_channal_limit.updateValueAndValidity();
      this.pbxForm.get('cps').reset();
      this.pbxForm.get('obd_channal_limit').reset();
    
    }
   }
   public isChnageOFF(event){
    let isSetDateEnable = event.checked;
    let isSetobdEnablee = event.isTrusted;
    if (isSetobdEnablee != false) {
        this.pbxForm.controls.cps.clearValidators();
      this.pbxForm.controls.cps.updateValueAndValidity();
      this.pbxForm.controls.obd_channal_limit.clearValidators();
      this.pbxForm.controls.obd_channal_limit.updateValueAndValidity();
      this.pbxForm.get('cps').reset();
      this.pbxForm.get('obd_channal_limit').reset();
    }
   }

  IVRtoggle(values: any) {
    let isChecked = values.checked;
    if (isChecked == true) {
      this.isStorage = true;
      this.isPrompt = true;
    }
  }

  selectAllFeatures() {
    //this.data.black_list = true;
    this.isMinutePlan = true;
    // this.isCircle = true;
    this.isPrompt = true;
    this.data.barging = true;
    this.data.call_group = true;
    this.data.call_transfer = true;
    this.data.click_to_call = true;
    this.data.conference = true;
    this.data.isPrompt = true;
    this.data.find_me_follow_me = true;
    this.data.forward = true;
    this.data.ivr = true;
    this.data.music_on_hold = true;
    this.data.one_to_one_video_call = true;
    this.isOutbound = true;
    this.data.paging = true;
    this.data.queue = true;
    this.data.recording = true;
    this.data.speed_dial = true;
    this.isStorage = true;
    this.playbacktoggle = true;
    this.isCircle = true;
    this.isFeatureRate = true;
    this.isCallerID = true;
    this.isCustomACL = true;
    this.isSMS = true;   
    this.isFeedbackCall = true;
    this.isStickyAgent = true;
    this.isGeoTracking = true;
    this.isMissCallAlert = true;
    this.isBroadcast = true;
    this.data.playback = true;
    this.isAppointment = true;
    this.isWhatsApp = true;
    this.isOutboundConf = true;
    this.isOBD = true;
    this.isTrunk = true;  
    this.isDynamicIvr = true;  
    this.isVoicebot = true;  
    this.pbxForm.get('is_bundle').setValue(true);
    this.getBundlePlan(1);
    this.pbxForm.get('out_bundle').setValue(true);
    this.getBundlePlan(5);
    this.pbxForm.get('is_roaming').setValue(true);
    this.getBundlePlan(2);
    this.pbxForm.get('teleConsultancy').setValue(true);
    this.getBundlePlan(4);
    this.isBundle = true;
    this.OutBundle = true;
    this.isRoaming = true;
    this.isTeleConsultancy = true;
    this.cpsdata = 1
    this.obdchannallimit = 1
    this.pbxForm.controls.bundle_plan_id.setValidators(Validators.required);
    this.pbxForm.controls.bundle_plan_id.updateValueAndValidity();
    this.pbxForm.get('roaming_plan_id').setValidators(Validators.required);
    this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
    this.pbxForm.get('out_bundle_call_plan_id').setValidators(Validators.required);
    this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();
    this.pbxForm.get('teleConsultancy_call_plan_id').setValidators(Validators.required);
    this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
    this.pbxForm.updateValueAndValidity();
    // this.pbxForm.controls.call_plan.setValidators(Validators.required);
    // this.pbxForm.controls.call_plan.updateValueAndValidity();
  }

  unselectAllFeatures() {
    if(this.minuteDisable == true){
    this.isMinutePlan = true;
    }
    else{
      this.isMinutePlan = false;
    }
    if(this.bundleDisable == true){
      this.isBundle = true;
      }
      else{
        this.isBundle = false;
        this.pbxForm.get('bundle_plan_id').setValue('');
        this.pbxForm.get('bundle_plan_id').clearValidators();
        this.pbxForm.get('bundle_plan_id').updateValueAndValidity();
        this.pbxForm.get('is_bundle').setValue('');
        this.pbxForm.get('is_bundle').clearValidators();
        this.pbxForm.get('is_bundle').updateValueAndValidity();
      }
      if(this.outbundleDisable == true){
        this.OutBundle = true;
        }
        else{
          this.OutBundle = false;
          this.pbxForm.get('out_bundle_call_plan_id').setValue('');
          this.pbxForm.get('out_bundle_call_plan_id').clearValidators();
          this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();
          this.pbxForm.get('out_bundle').setValue('');
          this.pbxForm.get('out_bundle').clearValidators();
          this.pbxForm.get('out_bundle').updateValueAndValidity();
        }
      if(this.romingDisable == true){
        this.isRoaming = true;
        }
        else{
          this.isRoaming = false;
          this.pbxForm.get('roaming_plan_id').setValue('');
          this.pbxForm.get('roaming_plan_id').clearValidators();
          this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
          this.pbxForm.get('is_roaming').setValue('');
          this.pbxForm.get('is_roaming').clearValidators();
          this.pbxForm.get('is_roaming').updateValueAndValidity();
        }
        if(this.TCDisable == true){
          this.isTeleConsultancy = true;
          }
          else{
            this.isTeleConsultancy = false;
            this.pbxForm.get('teleConsultancy_call_plan_id').setValue('');
            this.pbxForm.get('teleConsultancy_call_plan_id').clearValidators();
            this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
            this.pbxForm.get('teleConsultancy').setValue('');
            this.pbxForm.get('teleConsultancy').clearValidators();
            this.pbxForm.get('teleConsultancy').updateValueAndValidity();
          }
    
    this.isMissCallAlert = false;
    //this.data.black_list = false;
    this.isCircle = false;
    this.isTrunk = false;
    this.data.barging = false;
    this.data.call_group = false;
    this.data.call_transfer = false;
    this.data.click_to_call = false;
    this.data.conference = false;
    this.isPrompt = false    
    this.playbacktoggle = false;    
    this.data.isPrompt = false;
    this.data.find_me_follow_me = false;
    this.data.forward = false;
    this.data.ivr = false;
    // this.pbxForm.get('ivr').setValue(''); 
    // this.pbxForm.get('music_on_hold').setValue('');  
    // this.pbxForm.get('conference').setValue('');  
    // this.pbxForm.get('queue').setValue(''); 
    // this.pbxForm.get('playback').setValue(''); 


    this.data.music_on_hold = false;
    this.data.one_to_one_video_call = false;
    this.isOutbound = false;
    this.data.paging = false;
    this.data.queue = false;
    this.data.recording = false;
    this.data.speed_dial = false;
    this.isStorage = false;
    // this.isCircle = false;
    this.isFeatureRate = false;
    this.isCallerID = false;
    this.isCustomACL = false;
    this.isSMS = false;   
    this.isFeedbackCall = false;
    this.isStickyAgent = false;
    this.isGeoTracking = false;
    this.isBroadcast = false;
    this.data.playback = false;
    this.isAppointment = false;
    this.isWhatsApp = false;
    this.isOutboundConf = false;
    this.isOBD = false;   
    this.isDynamicIvr = false;   
    this.isVoicebot = false;   
  
    // this.isBundle = false;
    // this.isRoaming = false;
    // this.isTeleConsultancy = false;

  }
  


  updatePbxForm() {
    if (this.pbxForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.pbxForm.value;
      credentials.billing_type = Number(credentials.billing_type);
      credentials['file_storage_duration'] = Number(credentials['file_storage_duration']);
      credentials['file_storage_size'] = Number(credentials['file_storage_size']);
      credentials['phone_book'] = Number(credentials['phone_book']);
      credentials.checkbundle = this.addBundle
      credentials.checkroaming = this.addRoaming
      credentials.checkTC = this.addTC
      credentials.is_Roaming = this.is_Roaming;
      credentials.is_Bundle = this.is_Bundle;
      credentials.is_Tc = this.is_Tc;
      credentials.is_Outgoing = this.is_OutGoing;
      credentials['isSMSTypCustom'] = credentials.sms == 0 ? 1 : 0;
      if (credentials.phone_book < 50) {
        this.toastr.error('Error!', phoneBookLimit, { timeOut: 2000 });
        return;
      }
      if (credentials.extension_limit < this.oldExtensionLimitValue) {
        this.toastr.error('Error!', oldExtensionLimit, { timeOut: 2000 });
        return;
      }
      if (credentials.is_minute_plan == 1 && (credentials.is_bundle == 0 && credentials.out_bundle == 0 && credentials.is_roaming == 0 && credentials.teleConsultancy == 0)) {
        this.toastr.error('Error!', minutePlan, { timeOut: 2000 });
        return;
      }
      if (credentials.is_bundle == '1' || credentials.is_bundle == true) {
        if (!credentials.bundle_plan_id) {
          this.toastr.error('Error!', 'Please select Bundle plan', { timeOut: 2000 });
          return;
        }
      }
      if (credentials.out_bundle == '1' || credentials.out_bundle == true) {
        if (!credentials.out_bundle_call_plan_id) {
          this.toastr.error('Error!', 'Please select Outgoing Bundle plan', { timeOut: 2000 });
          return;
        }
      }
      if (credentials.is_roaming == '1' || credentials.is_roaming == true) {
        if (!credentials.roaming_plan_id) {
          this.toastr.error('Error!', 'Please select Roaming plan', { timeOut: 2000 });
          return;
        }
      }
      if (credentials.teleConsultancy == '1' || credentials.teleConsultancy == true) {
        if (!credentials.teleConsultancy_call_plan_id) {
          this.toastr.error('Error!', 'Please select teleConsultancy plan', { timeOut: 2000 });
          return;
        }
      }
      console.log(this.roamingPlanList,"--bundle--",this.roamingPlanList);
      
      credentials['bundlePlanName'] = credentials['bundle_plan_id'] != "" && credentials['bundle_plan_id'] != null ? this.bundlePlanList.filter(item=>item.id == credentials['bundle_plan_id'])[0]['name'] : '';      
      credentials['outBundlePlanName'] = credentials['out_bundle_call_plan_id'] != "" && credentials['out_bundle_call_plan_id'] != null ? this.outbundlePlanList.filter(item => item.id == credentials['out_bundle_call_plan_id'])[0]['name'] : '';
      credentials['roamingPlanName'] = credentials['roaming_plan_id'] != "" && credentials['roaming_plan_id'] != null ? this.roamingPlanList.filter(item=>item.id == credentials['roaming_plan_id'])[0]['name'] : '';
      credentials['tcPlanName'] = credentials['teleConsultancy_call_plan_id'] != "" && credentials['teleConsultancy_call_plan_id'] != null ? this.tcCallPlanist.filter(item=>item.id == credentials['teleConsultancy_call_plan_id'])[0]['name'] : '';
      credentials['featureRateName'] = credentials['featureRate'] != "" && credentials['featureRate'] != null ? this.globalFeatureRateList.filter(item=>item.id == credentials['featureRate'])[0]['name'] : '';
      credentials['smsName'] = credentials['sms'] != "" && credentials['sms'] != null ? this.SMSList.filter(item=>item.id == credentials['sms'])[0]['name'] : '';
      credentials['circleName'] = credentials['circle'] != "" && credentials['circle'] != null ? this.circleList.filter(item=>item.id == credentials['circle'])[0]['name'] : '';
      credentials['callPlanName'] = credentials['call_plan'] != "" && credentials['call_plan'] != null ? this.callPlans.filter(item=>item.id == credentials['call_plan'])[0]['name'] : '';

      this.packageService.postPbxFeature('updateFeature', credentials)
        .subscribe(data => {
          this.toastr.success('Success!', packageUpdated, { timeOut: 2000 });
          this.router.navigateByUrl('package/manage');
        }, err => {
          this.errors = err;
          this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
        });
    } else {
      this.toastr.error('Info!', invalidFormError, { timeOut: 2000 });
    }
  }

  updateOcForm() {
    if (this.ocForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.ocForm.value;
      this.packageService.postOcFeature('updateFeature', credentials)
        .subscribe(data => {
          this.toastr.success('Success!', packageUpdated, { timeOut: 2000 });
          this.router.navigateByUrl('package/manage');
        }, err => {
          this.errors = err;
          this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
        });
    } else {
      this.toastr.error('Info!', invalidFormError, { timeOut: 2000 });
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.pbxForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  checkValidPackage(keyword, product) {
    let mykeyword = keyword.target.value;

    this.productService.checkValidPackage(mykeyword, product).subscribe(data => {
      if (data.package_id >= 1) {
        this.toastr.error('Error!', duplicatePackage, { timeOut: 4000 })
        keyword.target.value = "";
      }
    }, err => {
      this.error = err.message;
    });
  }

  maxtrylimit(event) {

    if (event.target.value > 3) {
      this.toastr.error('', retryMessage, { timeOut: 2000 });
      this.maxRetrylimit = '3';
    } else {
      return true;
    }
  }

  choosePbxCustomer(productId, packageId) {
    if (this.pbxForm.valid) {
      const credentials = this.pbxForm.value;
      credentials.is_Roaming = this.is_Roaming;
      credentials.is_Bundle = this.is_Bundle;
      credentials.is_Tc = this.is_Tc;
      credentials.is_Outgoing = this.is_OutGoing;
      credentials['isSMSTypCustom'] = credentials.sms == 0 ? 1 : 0;
      if (credentials.phone_book < 50) {
        this.toastr.error('Error!', phoneBookLimit, { timeOut: 2000 });
        return;
      }
      if (credentials.extension_limit < this.oldExtensionLimitValue) {
        this.toastr.error('Error!', oldExtensionLimit, { timeOut: 2000 });
        return; 
      }

       if(credentials['is_minute_plan']){
        if(!credentials['is_bundle'] && !credentials['out_bundle'] && !credentials['is_roaming'] && !credentials['teleConsultancy']){
          this.toastr.error('Error!', 'Atleast one minute plan should be selected.', { timeOut: 2000 });
          return;
        }
      }

      // if(credentials.minute_balance < this.oldMinuteBal && this.isMinuteBal == true){
      //   this.toastr.error('Error!', oldMinuteLimit, { timeOut: 2000 });
      //   return;
      // }

      if(credentials.is_bundle == '1' || credentials.is_bundle == true ){
        if(!credentials.bundle_plan_id){
          this.toastr.error('Error!', 'Please select Bundle plan', { timeOut: 2000 });
         return;
          
        }
      }
      if (credentials.out_bundle == '1' || credentials.out_bundle == true) {
        if (!credentials.out_bundle_call_plan_id) {
          this.toastr.error('Error!', 'Please select Outgoing Bundle plan', { timeOut: 2000 });
          return;
        }
      }
      if(credentials.is_roaming == '1' || credentials.is_roaming == true){
        if(!credentials.roaming_plan_id){ 
        this.toastr.error('Error!', 'Please select Roaming plan', { timeOut: 2000 });
        return;
        }
      }
        if (credentials.teleConsultancy == '1' || credentials.teleConsultancy == true) {
        if (!credentials.teleConsultancy_call_plan_id) {
          this.toastr.error('Error!', 'Please select teleConsultancy plan', { timeOut: 2000 });
          return;
        }
      }
    
      console.log(credentials,"---credentials---");
            
             
      credentials['bundlePlanName'] = credentials['bundle_plan_id'] != "" && credentials['bundle_plan_id'] != null ? this.bundlePlanList.filter(item=>item.id == credentials['bundle_plan_id'])[0]['name'] : '';
      credentials['outBundlePlanName'] = credentials['out_bundle_call_plan_id'] != "" && credentials['out_bundle_call_plan_id'] != null ? this.outbundlePlanList.filter(item => item.id == credentials['out_bundle_call_plan_id'])[0]['name'] : '';
      
      credentials['roamingPlanName'] = credentials['roaming_plan_id'] != "" && credentials['roaming_plan_id'] != null ? this.roamingPlanList.filter(item=>item.id == credentials['roaming_plan_id'])[0]['name'] : '';
      credentials['tcPlanName'] = credentials['teleConsultancy_call_plan_id'] != "" && credentials['teleConsultancy_call_plan_id'] != null ? this.tcCallPlanist.filter(item=>item.id == credentials['teleConsultancy_call_plan_id'])[0]['name'] : '';
      credentials['featureRateName'] = credentials['featureRate'] != "" && credentials['featureRate'] != null ? this.globalFeatureRateList.filter(item=>item.id == credentials['featureRate'])[0]['name'] : '';
      credentials['smsName'] = credentials['sms'] != "" && credentials['sms'] != null ? this.SMSList.filter(item=>item.id == credentials['sms'])[0]['name'] : '';
      credentials['circleName'] = credentials['circle'] != "" && credentials['circle'] != null ? this.circleList.filter(item=>item.id == credentials['circle'])[0]['name'] : '';
      credentials['callPlanName'] = credentials['call_plan'] != "" && credentials['call_plan'] != null ? this.callPlans.filter(item=>item.id == credentials['call_plan'])[0]['name'] : '';


      localStorage.setItem('data', JSON.stringify(credentials));
      this.router.navigate(['package/updatePackage'], { queryParams: { proId: productId, pId: packageId, check: this.bundleVariable, outbundlecheck: this.outbundleVariable,checkroming: this.romingVariable, checkTC: this.TCvariable,bundleType:this.addBundle,roamingType:this.addRoaming,TCType:this.addTC } });
    } else {
      this.toastr.error('Info!', invalidFormError, { timeOut: 2000 });
    }
  }

  chooseOcCustomer(productId, packageId) {
    if (this.ocForm.valid) {
      const credentials = this.ocForm.value;
      localStorage.setItem('data', JSON.stringify(credentials));
      this.router.navigate(['package/updatePackage'], { queryParams: { proId: productId, pId: packageId } });
    } else {
      this.toastr.error('Info!', invalidFormError, { timeOut: 2000 });
    }
  }

  activeStorage(values: any) {
    // let isChecked = values.checked;
    // if (isChecked === false) {
    //   this.isStorage = false;
    // } else {
    //   this.isStorage = true;
    // }
    // this.storageSize = true;
    let isChecked = values.checked;
    if (isChecked === false) {
      this.isStorage = false;
      this.pbxForm.get('file_storage_duration').setValue('30'); 
      this.pbxForm.get('file_storage_size').setValue('1');  
      // this.data.ivr = false;
      this.isPrompt = false;
      // this.data.recording = false; 
      // this.data.music_on_hold = false;
      // this.data.queue = false;
      // this.playbacktoggle = false;
      // this.isOutboundConf = false;
      // this.data.conference = false;
      // this.isBroadcast = false; // new add field
      // this.isAppointment = false; // new add field 
    this.pbxForm.get('appointment').setValue(''); 
    this.pbxForm.get('pbx_recording').setValue('');   
    this.pbxForm.get('music_on_hold').setValue('');  
    this.pbxForm.get('conference').setValue('');  
    this.pbxForm.get('queue').setValue(''); 
    this.pbxForm.get('playback').setValue(''); 
    this.pbxForm.get('broadcast').setValue('');
    this.pbxForm.get('outbound_conference').setValue('');
    this.pbxForm.get('ivr').setValue('');
      this.pbxForm.get('teleConsultancy').setValue(false);
      this.isOBD = false
      this.isDynamicIvr = false
      this.changeMinutePlanType(false, '4');
      this.toastr.info('Some changes occurs in package which affects some features', 'Package Modify!', { timeOut: 4000 });
    } else {
      this.isStorage = true;
    }
  }

  activeRecording(values: any) {
    let isChecked = values.checked;
    if (isChecked == true) {
      this.isStorage = true;
    }
  }

  activeMusicOnHold(values: any) {
    let isChecked = values.checked;
    if (isChecked == true) {
      this.isStorage = true;
    }
  }

  activeOutbound(values: any) {  
    let select = values.isTrusted
    let isChecked = values.checked;    
    if (isChecked === false || select == false) {
      this.isOutbound = false;
      this.pbxForm.controls.circle.clearValidators();
      this.pbxForm.controls.circle.updateValueAndValidity();
      this.pbxForm.controls.call_plan.clearValidators();
      this.pbxForm.controls.call_plan.updateValueAndValidity();
      this.pbxForm.get('isCircle').setValue('');
      this.pbxForm.get('circle').setValue('');
      this.pbxForm.get('call_plan').setValue('');
      this.pbxForm.get('click2call').setValue('');
    } else {
      this.pbxForm.controls.call_plan.value ? this.data.call_plan_id = this.pbxForm.controls.call_plan.value: this.data.call_plan_id = '';
      this.pbxForm.controls.call_plan.setValidators(Validators.required);
      this.pbxForm.controls.call_plan.updateValueAndValidity();
      this.isOutbound = true;

    }
  }
  public activeOutboundOFF(event){
    let isSetDateEnable = event.checked;
    let isSetobdEnablee = event.isTrusted;
    if (isSetobdEnablee != false) {
      this.pbxForm.controls.call_plan.clearValidators();
      this.pbxForm.controls.call_plan.updateValueAndValidity();
      this.pbxForm.get('call_plan').setValue('');
    }
   }

  billingTypeAction(e) {
    this.billingType = e.value;
    if (this.billingType == "2" || this.billingType == "3") {
      this.isMinuteBal = true;
      this.isOutbound = true;
      // this.isTeleConsultancy = true;
      this.isTeleConsultancyShow = true;
    } else {
      this.isMinuteBal = false;
      this.isOutbound = false;
      // this.isTeleConsultancy = false;
      this.pbxForm.get('teleConsultancy').setValue(false);
      this.isTeleConsultancyShow = false;
    }
  }

  public getCircle() { //get circle data
    this.callplanService.getCircle().subscribe(data => {
      this.circleList = data.response;      
      this.filterCircle = this.CircleFilter = this.circleList.slice();
    }, err => {
      this.errors = err.message;
    });
  }

  public isChnageCircle(event) {
    let isCircleEnable = event.checked;
    if (isCircleEnable == true) {
      this.circleId = '';
      this.pbxForm.controls.circle.setValidators(Validators.required);
      this.pbxForm.controls.circle.updateValueAndValidity();
      this.callPlans = []
    } else {
      this.pbxForm.controls.call_plan.clearValidators();
      this.pbxForm.controls.call_plan.updateValueAndValidity();
      this.pbxForm.get('call_plan').reset();
      this.pbxForm.controls.circle.clearValidators();
      this.pbxForm.controls.circle.updateValueAndValidity();
      this.pbxForm.get('circle').setValue('');
      // this.pbxForm.get('call_plan').setValue('');
      // this.pbxForm.get('call_plan').reset();
      // this.callPlans = []


      this.packageService.getCallPlanList().subscribe(data => {
        this.pbxForm.controls.call_plan.clearValidators();
        this.pbxForm.controls.call_plan.updateValueAndValidity();
        this.pbxForm.get('call_plan').setValue('');
        this.pbxForm.controls.call_plan.setValidators(Validators.required);
        this.pbxForm.controls.call_plan.updateValueAndValidity();
        this.callPlans = data.response;
        this.filterCall = this.CallPlanFilter = this.callPlans.slice();
      }, err => {
        this.error = err.message;
      });
    }
  }

  public onCircleSelect(e) {  
    let circleId = e.value ? e.value : e;
    if (circleId) {
      if(e.value){
      this.pbxForm.get('call_plan').reset();
      this.pbxForm.get('call_plan').updateValueAndValidity();
      }
      this.packageService.getCallPlanWithCircle(circleId).subscribe(data => {    
        this.pbxForm.controls.call_plan.setValidators(Validators.required);
        this.pbxForm.controls.call_plan.updateValueAndValidity();
        
        if (data.response.length == 0) {
          // this.data.call_plan_id = '';
          this.pbxForm.controls.call_plan.setValidators(Validators.required);
          this.pbxForm.controls.call_plan.updateValueAndValidity();
          this.callPlans = data.response;                
          return;
        }
        this.callPlans = data.response;      
          this.data.call_plan_id = this.loadFirstTime ? this.data.call_plan_id : this.data.call_plan_id;                
        this.loadFirstTime = false;
      }, err => {
        this.error = err.message;
      });
    } else {
      this.pbxForm.get('call_plan').reset();
      this.pbxForm.get('call_plan').updateValueAndValidity();
      this.packageService.getCallPlanList().subscribe(data => {
        this.callPlans = data.response;        
      this.filterCall = this.CallPlanFilter = this.callPlans.slice();
      }, err => {
        this.error = err.message;
      });
    }
  }

  public getFeaturePlanRate() { //get Feature Rate
    this.featuresService.getFeaturePlan({}).subscribe(data => {
      this.globalFeatureRateList = data;
      this.filterRate = this.FeatureRateFilter = this.globalFeatureRateList.slice();
    }, err => {
      this.errors = err.message;
    });
  }

  public getSMS() {
    this.packageService.getSMS().subscribe(data => {
      this.SMSList = data;
      this.filterSMS = this.SMSFilter = this.SMSList.slice();
      // this.SMSList.unshift({ id: 0, name: "Custom", description: "Custom" });
     this.SMSList.unshift({id:0 ,name:'Custom' })

      // this.SMSList.push({id:0,name: "Custom",description: "Custome"})
    });
  }

  public getTCCallPlan() {
    this.packageService.getTCCallPlanList().subscribe(data => {
      let tcData = data ? data : [];
      this.tcCallPlanist = tcData.sort((a, b) => a.name.localeCompare(b.name));
      this.filterTC = this.TCPlanFilter = this.tcCallPlanist.slice();
      // this.tcCallPlanist = data;
    });
  }

  public getBundlePlan(type) {
    let creadentials = {};
    creadentials['by_plan_type'] = type // bundle or roaming
    this.callplanService.filterBundlePlan(creadentials).subscribe(data => {
      if (type == '1') {        
        let bundleData = data ? data : [];
        this.bundlePlanList = bundleData.sort((a, b) =>        
          a.name.localeCompare(b.name)
        );
        // this.filterBundle = this.bundlePlanList.slice();
        this.bundlePrmoise.then((result) => {
          this.pbxForm.get('bundle_plan_id').setValue(Number(result));
        }) 
        
        this.filterBundle = this.BundlePlanFilter = this.bundlePlanList.slice();
        this.selectedbundlePlanObject = this.bundlePlanList.find(item => item.id == this.selectedbundlePlanId);        
        
        // this.filterBundle = this.bundlePlanList.slice();
        this.filterBundle = this.BundlePlanFilter = this.bundlePlanList.slice();

        this.changeMinutePlanType(true, '1'); this.disabledBundleBox = true;
      }
      else if (type == '5') {        
        let outbundleData = data ? data : [];
        this.outbundlePlanList = outbundleData.sort((a, b) =>        
          a.name.localeCompare(b.name)
        );
        // this.filterBundle = this.bundlePlanList.slice();
        this.outbundlePrmoise.then((result) => {
          this.pbxForm.get('out_bundle_call_plan_id').setValue(Number(result));
        }) 
        
        this.filterBundle = this.BundlePlanFilter = this.outbundlePlanList.slice();
        this.selectedbundlePlanObject = this.outbundlePlanList.find(item => item.id == this.selectedbundlePlanId);        
        
        // this.filterBundle = this.bundlePlanList.slice();
        this.filterBundle = this.BundlePlanFilter = this.outbundlePlanList.slice();

        this.changeMinutePlanType(true, '5'); this.disabledBundleBox = true;
      } else if (type == '2') {        
        let roamingData = data ? data : [];        
        this.roamingPlanList = roamingData.sort((a, b) => a.name.localeCompare(b.name));  
        this.roamingPromise.then((result) => {
          this.pbxForm.get('roaming_plan_id').setValue(Number(result));
        })       
        this.selectedRoamingPlanObject = this.roamingPlanList.find(item => item.id == this.selectedRoamingPlanId);
        this.filterRoaming = this.RoamingPlanFilter = this.roamingPlanList.slice();        
        // this.filterRoaming = this.RoamingPlanFilter = this.roamingPlanList.slice();

        this.changeMinutePlanType(true, '2'); this.disabledRoamingBox = true;
      } else if (type == '4') {  // TC
        let tcData = data ? data : [];
        this.tcCallPlanist = tcData.sort((a, b) => a.name.localeCompare(b.name));
        this.TCPromise.then((result) => {
          this.pbxForm.get('teleConsultancy_call_plan_id').setValue(Number(result));
        }) 
        // this.filterTC = this.tcCallPlanist.slice();
        this.filterTC = this.TCPlanFilter = this.tcCallPlanist.slice();
        
        
        this.selectedTCPlanObject = this.tcCallPlanist.find(item => item.id == this.selectedTCPlanId);        
        this.filterTC = this.TCPlanFilter = this.tcCallPlanist.slice();
        this.changeMinutePlanType(true, '4'); this.disabledTCBox = true;
      } else {

      }
    }, err => {
      this.errors = err.message;
    });
  }

 
 

  public isChnageFeatureRate(event) {
    let isFeatureRateEnable = event.checked;
    if (isFeatureRateEnable == true) {
      this.pbxForm.controls.featureRate.setValidators(Validators.required);
      this.pbxForm.controls.featureRate.updateValueAndValidity();
    } else {
      this.pbxForm.get('featureRate').setValue('');
      this.pbxForm.controls.featureRate.clearValidators();
      this.pbxForm.controls.featureRate.updateValueAndValidity();
    }
  }

  promptoggle(values: any) {
    let isChecked = values.checked;
    if (isChecked != true) {
      this.data.ivr = false;
      this.data.queue = false;
      // this.data.recording = false;
      this.data.music_on_hold = false;
      this.isOutboundConf = false;
      this.playbacktoggle = false;
      this.data.conference = false;
      this.isTeleConsultancy = false;
      this.isBroadcast = false; // new add field
      this.isAppointment = false; // new add field
      this.isOBD = false;
      this.pbxForm.get('teleConsultancy').setValue(false);
      this.changeMinutePlanType(false, '4');
      this.toastr.info('Some changes occurs in package which affects some features', 'Package Modify!', { timeOut: 4000 });
    }
  }
  uncheckTCtoggle(values: any) {
    let isChecked = values.checked;
    if (isChecked != true) {
      if(this.TCDisable == true){
        this.isTeleConsultancy = true;
        }
        else{
          this.isTeleConsultancy = false;
          this.pbxForm.get('teleConsultancy_call_plan_id').setValue('');
          this.pbxForm.get('teleConsultancy_call_plan_id').clearValidators();
          this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
          this.pbxForm.get('teleConsultancy').setValue('');
          this.pbxForm.get('teleConsultancy').clearValidators();
          this.pbxForm.get('teleConsultancy').updateValueAndValidity();
        }
      // this.pbxForm.get('teleConsultancy').setValue(false);
    }
  }

  Queuetoggle(values: any) {
    let isChecked = values.checked;
    if (isChecked == true) {
      this.isStorage = true;
      this.isPrompt = true;
    }
  }

  teleConsultancyToggle(values: any) {
    let isChecked = values.checked;
    if (isChecked == true) {
      this.isStorage = true;
      this.isPrompt = true;
    }
  }

  public smsToggle(event) {
    let isSMSEnable = event.checked;
    this.isMCA = true;
    if (isSMSEnable == true) {
      this.pbxForm.controls.sms.setValidators(Validators.required);
      this.pbxForm.controls.sms.updateValueAndValidity();
    } else {
      this.isMCA = false;
      this.pbxForm.controls.sms.clearValidators();
      this.pbxForm.controls.sms.updateValueAndValidity();
      this.pbxForm.get('sms').setValue('');
      this.pbxForm.get('miss_call_alert').setValue(false);
    }
  }


  public changeMinutePlanType(checked, type) {
    
    // if(checked) this.getBundlePlan(type);
    if (checked) this.getBundlePlanNotReserved(type);
    if (type == '1' && checked) {     
      this.disabledBundleBox = false;
      this.pbxForm.controls.bundle_plan_id.setValidators(Validators.required);
      this.pbxForm.controls.bundle_plan_id.updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    } else if (type == '1' && !checked) {        
      this.disabledBundleBox = false;
      this.pbxForm.controls.bundle_plan_id.clearValidators();
      this.pbxForm.controls.bundle_plan_id.updateValueAndValidity();
      this.pbxForm.controls.bundle_plan_id.setValue('');
      this.pbxForm.updateValueAndValidity();
    }
    else if (type == '2' && checked) {                
      this.disabledRoamingBox = false;
      this.pbxForm.get('roaming_plan_id').setValidators(Validators.required);
      this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    } else if (type == '2' && !checked) {      
      this.disabledRoamingBox = false;
      this.pbxForm.get('roaming_plan_id').setValue('');
      this.pbxForm.get('roaming_plan_id').clearValidators();
      this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    }
    else if (type == '4' && checked) {      
      this.disabledTCBox = false;
      this.pbxForm.get('teleConsultancy_call_plan_id').setValidators(Validators.required);
      this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    } else if (type == '4' && !checked) {      
      this.disabledTCBox = false;
      this.pbxForm.get('teleConsultancy_call_plan_id').setValue('');
      this.pbxForm.get('teleConsultancy_call_plan_id').clearValidators();
      this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    }
    else if (type == '5' && checked) {      
      this.disabledTCBox = false;
      this.pbxForm.get('out_bundle_call_plan_id').setValidators(Validators.required);
      this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    } else if (type == '5' && !checked) {      
      this.disabledTCBox = false;
      this.pbxForm.get('out_bundle_call_plan_id').setValue('');
      this.pbxForm.get('out_bundle_call_plan_id').clearValidators();
      this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    }
  }

  public changeMinutePlan(data) {
    this.disabledBundleBox = false;
    this.disabledRoamingBox = false;
    this.disabledTCBox = false;
    if (!data.checked ) {
      this.pbxForm.get('is_roaming').setValue('');
      this.pbxForm.get('is_bundle').setValue('');
      this.pbxForm.get('teleConsultancy').setValue('');
      this.pbxForm.get('bundle_plan_id').setValue('');
      this.pbxForm.get('roaming_plan_id').setValue('');
      this.pbxForm.get('bundle_plan_id').clearValidators();
      this.pbxForm.get('roaming_plan_id').clearValidators();
      this.pbxForm.get('teleConsultancy_call_plan_id').setValue('');
      this.pbxForm.get('is_roaming').clearValidators();
      this.pbxForm.get('is_bundle').clearValidators();
      this.pbxForm.get('teleConsultancy_call_plan_id').clearValidators();
      this.pbxForm.get('bundle_plan_id').updateValueAndValidity();
      this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
      this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
      this.pbxForm.get('is_roaming').updateValueAndValidity();
      this.pbxForm.get('is_bundle').updateValueAndValidity();
      this.pbxForm.get('teleConsultancy').updateValueAndValidity();
      this.pbxForm.get('out_bundle').setValue('');
      this.pbxForm.get('out_bundle').clearValidators();
      this.pbxForm.get('out_bundle').updateValueAndValidity();
      this.pbxForm.get('out_bundle_call_plan_id').setValue('');
      this.pbxForm.get('out_bundle_call_plan_id').clearValidators();
      this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();

    } else {      
      this.pbxForm.get('out_bundle').setValue(true);
      this.OutBundle = true;
      //this.getBundlePlan('1');  // Bundle Plan
      // this.getBundlePlanNotReserved('1');
      this.pbxForm.get('out_bundle').updateValueAndValidity();
      this.pbxForm.controls.out_bundle_call_plan_id.setValidators(Validators.required);
      this.pbxForm.controls.out_bundle_call_plan_id.updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();

      let creadentials = {};
      creadentials['by_plan_type'] = 5 // bundle or roaming
      this.callplanService.filterBundlePlanForPackage(creadentials).subscribe(data => {
        // if(type == '1') {
        let bundleData = data ? data : [];
        this.outbundlePlanList = bundleData.sort((a, b) => a.name.localeCompare(b.name));

        // this.filterBundle = this.bundlePlanList.slice();
        this.filterBundle = this.BundlePlanFilter = this.outbundlePlanList.slice();


        // }
      })
    }
  }

  ngOnDestroy(): void {
    this.__featureChangeSubscription.unsubscribe();
    this.__circleChangeSubscription.unsubscribe();
    this.__smsChangeSubscription.unsubscribe();
  }
}
