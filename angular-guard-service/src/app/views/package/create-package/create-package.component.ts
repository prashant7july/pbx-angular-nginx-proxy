import { Component, OnInit } from '@angular/core';
import { Errors, CommonService, ProductService, duplicatePackage, phoneBookLimit, invalidFormError, packageCreated, retryMessage, minutePlan,Number_one_to_twohun,Number_one_to_hundered } from '../../../core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { PackageService } from '../package.service';
import { EmailService } from '../../../core/services/email.service';
import { CallplanService } from '../../call-plan/callplan.service';
import { FeaturesService } from '../../feature/feature.service';

@Component({
  selector: 'app-create-package',
  templateUrl: './create-package.component.html',
  styleUrls: ['./create-package.component.css']
})
export class CreatePackageComponent implements OnInit {
  error = '';
  submitted = false;
  selectedValue = '';
  pbxDiv = false;
  ocDiv = false;
  voiceMailTextBox = false;
  errors: Errors = { errors: {} };
  pbxForm: FormGroup;
  ocForm: FormGroup;
  pbxPackageName = "";
  ocPackageName = "";
  maxRetrylimit = "1";
  voicemail_limit = "10";
  fileDurationDays = "30";
  // defaultInputValue = 1;
  fileStorageSize = "1";
  customerName: any = {};
  emailContentData: any = {};
  gatewayGroup = '';
  callPlans: any = '';
  CallPlanFilter: any;
  filterCallPlan: any;
  myproduct = '';
  primaryCallPlan = '';
  primaryGatewayGroup = '';
  phonebookLimit = '50';
  billingType = '';
  isOutbound = false;
  isStorage = false;
  isMinuteBal = false;
  disableOutbound = false;
  isPrompt = false;
  isRenew = true;
  //isBlacklist = false;
  isCallBarging = false;
  isCallGroup = false;
  isPaging = false;
  isCallTransfer = false;
  isClick2Call = false;
  isConference = false;
  isFindMeFolloeMe = false;
  isForward = false;
  isIvr = false;
  isMusicOnHold = false;
  isOnetoOneVideoCall = false;
  isQueue = false;
  isRecording = false;
  isSpeeddial = false;
  isCircle = false;
  packageValidity = 0;
  circleList: any;
  CircleFilter: any;
  filterCircle: any;
  isFeatureRate = false;
  globalFeatureRateList: any;
  FeatureRateFilter: any;
  filterFeature: any;
  isCustomACL = false;
  isCallerID = false;
  isTrunk = false;
  isTeleConsultancy = false;
  isSMS = false;
  isMCA = false;
  isTeleConsultancyShow = false;
  SMSList: any;
  SMSFilter: any;
  filterSMS: any;
  isFeedbackCall = false;
  isStickyAgent = false;
  isGeoTracking = false;
  isMissCallAlert = false;
  isBroadcast = false;
  isPlayback = false;
  isAppointment = false;
  isWhatsApp = false;
  isMinutePlan = false;
  isOutboundConf = false;
  isOBD = false;  
  isDynamicIvr = false;  
  isVoicebot = false;  
  bundlePlanList: any;
  BundlePlanFilter: any;
  filterBundle: any;
  roamingPlanList: any;
  RoamingPlanFilter: any;
  filterRoaming: any;
  tcCallPlanist: any;
  outbundlePlanList: any;
  TCPlanFilter: any;
  filterTC: any;
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Provider';
  public placeholder1: string = 'DID Bundle Minute Plan';
  public placeholder2: string = 'Roaming Minute Plan';
  public placeholder3: string = 'TC Minute Plan';
  public placeholder8: string = 'Outgoing Bundle Minute Plan';
  public placeholder4: string = 'Feature Rate';
  public placeholder5: string = 'Circle Name';
  public placeholder6: string = 'Call Plan';
  public placeholder7: string = 'SMS';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  public __featureChangeSubscription;
  public __circleChangeSubscription;
  public __smsChangeSubscription;
  MOHselected = [];
  check_bundle: boolean = false;
  check_roaming:boolean = false;
  check_tc:boolean = false;
  check_outgoing: boolean = false;

  // globalFeatureRateId: any;

  constructor(
    private productService: ProductService,
    private packageService: PackageService,
    private router: Router,
    private fb: FormBuilder,
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
      'extension_limit': [10, [Validators.required,Validators.min(1)]],
      'voice_mail': [0],
      'vm_limit': [10, Validators.min(1)],
      'file_storage_duration': [30,[Validators.required, Validators.min(1)]],
      'billing_type': [1],
      'package_name': ['', Validators.required],
      // 'package_duration': ['', Validators.required],
      'package_duration': [''],
      'storage': [''],
      'custom_prompts': [''],
      'file_storage_size': [1,[Validators.required,Validators.pattern(Number_one_to_hundered)]],
      'queue': [''],
      'gateway_group': [1],
      'call_plan': [],
      'minute_balance': [100],
      'is_auto_renewal': [1],
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
      'teleConsultancy': [false],
      'teleConsultancy_call_plan_id': [''],
      'isSms': [''],
      'sms': [''],
      'broadcast': [''],
      'subscription': ['1'],
      'feedback_call': [''],
      'sticky_agent': [''],
      'geo_tracking': [''],
      'miss_call_alert': [''],
      'playback': [''],
      'appointment': [''],
      'whatsapp': [''],
      'is_minute_plan': [''],
      // 'minute_plan_type' : [''],
      'is_bundle': [''],
      'out_bundle': [''],
      'is_roaming': [false],
      'bundle_plan_id': [''],
      'out_bundle_call_plan_id': [''],
      'roaming_plan_id': [''],
      "outbound_conference": [''],
      "outbound_broadcast": [''],
      'obd_channal_limit': [''],
      'cps': [''],
      'dynamic_ivr': [''],
      'voicebot': [''],
      // 'isSMSType' : ['']

    });
    this.ocForm = this.fb.group({
      'campaign_limit': ['0',],
      'participant_limit': ['0'],
      'retry': ['0'],
      'oc_recording': [''],
      'schedule_campaign': [''],
      'mute': [''],
      'package_name_oc': ['', Validators.required],
      'package_duration_oc': ['', Validators.required]
    });
  }


  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }
  selectedId:any;
  maskArray:any;
  defaultInputValue:any;
  public isChnage(event){
    let isSetobdEnablee = event.isTrusted;
    let isSetDateEnable = event.checked;
    if (isSetDateEnable == true || isSetobdEnablee == true) {
      this.pbxForm.controls.cps.setValidators(Validators.required);
      this.pbxForm.controls.cps.updateValueAndValidity();
      this.selectedId = 1;
      this.pbxForm.controls.obd_channal_limit.setValidators([Validators.required,Validators.pattern(Number_one_to_twohun)]);
      this.pbxForm.controls.obd_channal_limit.updateValueAndValidity();
    this.defaultInputValue = 1;

    }else{
      this.pbxForm.controls.cps.clearValidators();
      this.pbxForm.controls.cps.updateValueAndValidity();
      // this.selectedId = 1;
      this.pbxForm.get('cps').setValue('');
      this.pbxForm.controls.obd_channal_limit.clearValidators();
      this.pbxForm.controls.obd_channal_limit.updateValueAndValidity();
      this.pbxForm.get('obd_channal_limit').setValue('');
    
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
  ngOnInit() {
    this.maskArray = [
      { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }
   ]
   this.selectedId = 1;
    this.productService.getProductInfo().subscribe(data => {
      this.selectedValue = data.response;
    }, err => {
      this.error = err.message;
    });

    // this.packageService.getGatewayGroup().subscribe(data => {
    //   this.gatewayGroup = data.response;
    // }, err => {
    //   this.error = err.message;
    // });

    this.packageService.getCallPlanList().subscribe(data => {
      this.callPlans = data.response;
      this.filterCallPlan = this.CallPlanFilter = this.callPlans.slice();
      this.primaryCallPlan = data.response[0].id;
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

    this.getCircle();
    this.getFeaturePlanRate();
    this.getSMS();
    // this.getTCCallPlan();
  }
  smsremovespace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.SMSList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  timeGroupDataremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.globalFeatureRateList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Bundleremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.bundlePlanList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Roamingremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.roamingPlanList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Minuteremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.tcCallPlanist.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  OBremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.outbundlePlanList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  circleremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.circleList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Callremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.callPlans.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  // get vm_limit() { return this.pbxForm.get('vm_limit'); }
  get package_name() { return this.pbxForm.get('package_name'); }
  get package_duration() { return this.pbxForm.get('package_duration'); }
  get concurrent_call() { return this.pbxForm.get('concurrent_call'); }
  get phone_book() { return this.pbxForm.get('phone_book'); }
  get ring_time_out() { return this.pbxForm.get('ring_time_out'); }
  get extension_limit() { return this.pbxForm.get('extension_limit'); }
  get file_storage_duration() { return this.pbxForm.get('file_storage_duration'); }
  get vm_limit() { return this.pbxForm.get('vm_limit'); }
  get file_storage_size() { return this.pbxForm.get('file_storage_size'); }
  get is_minute_plan() { return this.pbxForm.get('is_minute_plan'); }
  get is_bundle() { return this.pbxForm.get('is_bundle'); }
  get out_bundle() { return this.pbxForm.get('out_bundle'); }
  get is_roaming() { return this.pbxForm.get('is_roaming'); }
  get teleConsultancy() { return this.pbxForm.get('teleConsultancy'); }
  get package_name_oc() { return this.ocForm.get('package_name_oc'); }
  get package_duration_oc() { return this.ocForm.get('package_duration_oc'); }
  get obd_channal_limit() { return this.pbxForm.get('obd_channal_limit'); }
  get cps() { return this.pbxForm.get('cps'); }




  selectProductDiv(product) {

    this.myproduct = product.value;
    if (this.myproduct == '1') {
      this.pbxDiv = true;
      this.ocDiv = false;
    } else if (this.myproduct == '2') {
      this.ocDiv = true;
      this.pbxDiv = false;
    } else {
      this.pbxDiv = true;
      this.ocDiv = false;
    }
  }

  activeStorage(values: any) {
    let isChecked = values.checked;
    if (isChecked === false) {
      this.isStorage = false;
      this.pbxForm.get('file_storage_duration').setValue(30); 
      this.pbxForm.get('file_storage_size').setValue(1); 
      this.isIvr = false;
      this.isPrompt = false;
      this.isRecording = false;
      this.isMusicOnHold = false;
      this.isQueue = false;
      this.isBroadcast = false; // new add field
      this.isAppointment = false; // new add field
      this.isConference = false;
      this.isOutboundConf = false;
      this.isPlayback = false;
      this.isOBD = false;
      this.isDynamicIvr = false;
      this.pbxForm.get('teleConsultancy').setValue(false);
      this.changeMinutePlanType(false, '4');
    } else {
      this.isStorage = true;
      this.pbxForm.controls.file_storage_duration.clearValidators();
      this.pbxForm.controls.file_storage_duration.updateValueAndValidity();
      this.pbxForm.controls.file_storage_size.clearValidators();
      this.pbxForm.controls.file_storage_size.updateValueAndValidity();
      // this.pbxForm.get('file_storage_duration').setValue('30'); 
      // this.pbxForm.get('file_storage_size').setValue('1'); 
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
    let isChecked = values.checked;
    if (isChecked === false) {
      this.isOutbound = false;
      this.pbxForm.controls.circle.clearValidators();
      this.pbxForm.controls.circle.updateValueAndValidity();
      this.pbxForm.controls.call_plan.clearValidators();
      this.pbxForm.controls.call_plan.updateValueAndValidity();
      this.pbxForm.get('isCircle').setValue('');
      this.pbxForm.get('circle').setValue('');
      this.pbxForm.get('call_plan').setValue('');

    } else {
      this.pbxForm.controls.call_plan.setValidators(Validators.required);
      this.pbxForm.controls.call_plan.updateValueAndValidity();
      this.isOutbound = true;
    }
  }

  maxtrylimit(event) {
    if (event.target.value > 3) {
      this.toastr.error('', retryMessage, { timeOut: 2000 });
      this.maxRetrylimit = '3';
    } else {
      return true;
    }
  }

  IVRtoggle(values: any) {
    let isChecked = values.checked;
    if (isChecked == true) {
      this.isStorage = true;
      this.isPrompt = true;
    }
  }

  Queuetoggle(values: any) {
    let isChecked = values.checked;
    if (isChecked == true) {
      this.isStorage = true;
      this.isPrompt = true;
    }
  }

  promptoggle(values: any) {
    let isChecked = values.checked;
    if (isChecked != true) {
      this.isIvr = false;
      this.isQueue = false;
      this.isTeleConsultancy = false;
      this.isBroadcast = false; // new add field
      this.isAppointment = false; // new add field
      // this.isRecording = false;
      this.isMusicOnHold = false;
      this.isOutboundConf = false;
      this.isPlayback = false;
      this.isConference = false;
      this.isOBD = false;
      this.pbxForm.get('teleConsultancy').setValue(false);
      this.changeMinutePlanType(false, '4');
    }
  }
  uncheckTCtoggle(values: any) {
    let isChecked = values.checked;
    if (isChecked != true) {
      this.pbxForm.get('teleConsultancy').setValue(false);
    }
  }

  teleConsultancyToggle(values: any) {
    let isChecked = values.checked;
    if (isChecked == true) {
      this.isStorage = true;
      this.isPrompt = true;
    }
  }




  selectAllFeatures() {
    this.isOutbound = true;
    this.isStorage = true;
    this.isPrompt = true;
    this.isTrunk = true;
    this.isRenew = true;
    this.isMissCallAlert = true;
    this.isMinutePlan = true;
    //this.isBlacklist = true;
    this.isFeatureRate = true;
    this.isCallBarging = true;
    this.isCallGroup = true;
    this.isPaging = true;
    this.isCallTransfer = true;
    this.isClick2Call = true;
    this.isConference = true;
    this.isFindMeFolloeMe = true;
    this.isForward = true;
    this.isIvr = true;
    this.isMusicOnHold = true;
    this.isOnetoOneVideoCall = true;
    this.isQueue = true;
    this.isRecording = true;
    this.isSpeeddial = true;
    this.isCircle = true;
    // this.isFeatureRate = true;
    this.isCustomACL = true;
    this.isCallerID = true;
    this.isSMS = true;   
    this.isFeedbackCall = true;
    this.isStickyAgent = true;
    this.isGeoTracking = true;
    // this.isMissCallAlert = true;
    this.isBroadcast = true;
    this.isPlayback = true;
    this.isAppointment = true;
    this.isWhatsApp = true;
    this.isOutboundConf = true;
    this.isOBD = true;
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
    this.pbxForm.controls.bundle_plan_id.setValidators(Validators.required);
    this.pbxForm.controls.bundle_plan_id.updateValueAndValidity();
    this.pbxForm.get('roaming_plan_id').setValidators(Validators.required);
    this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
    this.pbxForm.get('teleConsultancy_call_plan_id').setValidators(Validators.required);
    this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
    this.pbxForm.get('out_bundle_call_plan_id').setValidators(Validators.required);
    this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();
    this.pbxForm.updateValueAndValidity();

    this.pbxForm.controls.obd_channal_limit.setValidators([Validators.required,Validators.pattern(Number_one_to_twohun)]);
    this.pbxForm.controls.obd_channal_limit.updateValueAndValidity();

    this.selectedId = 1;
    this.defaultInputValue = 1;


  }

  unselectAllFeatures() {
    this.isOutbound = false;
    this.pbxForm.controls.call_plan.clearValidators();
    this.pbxForm.controls.call_plan.updateValueAndValidity();
    this.pbxForm.get('call_plan').setValue('');
    this.pbxForm.controls.circle.clearValidators();
    this.pbxForm.controls.circle.updateValueAndValidity();
    this.pbxForm.get('circle').setValue('');
    this.isStorage = false;
    this.isSMS = false;
    this.isPrompt = false;
    this.isRenew = false;
    this.isMissCallAlert = false;
    this.isMinutePlan = false;
    this.isTrunk = false;
    //this.isBlacklist = false;
    this.isCallBarging = false;
    this.isCallGroup = false;
    this.isPaging = false;
    this.isCallTransfer = false;
    this.isClick2Call = false;
    this.isConference = false;
    this.isFindMeFolloeMe = false;
    this.isForward = false;
    this.isIvr = false;
    this.isMusicOnHold = false;
    this.isOnetoOneVideoCall = false;
    this.isFeatureRate = false;
    this.isQueue = false;
    this.isRecording = false;
    this.isSpeeddial = false;
    this.isCircle = false;
    // this.isFeatureRate = false;
    this.isCustomACL = false;
    this.isCallerID = false;
    // this.isSMS = false;   
    this.isFeedbackCall = false;
    this.isStickyAgent = false;
    this.isGeoTracking = false;
    // this.isMissCallAlert = false;
    this.isBroadcast = false;
    this.isPlayback = false;
    this.isAppointment = false;
    this.isWhatsApp = false;
    this.isOutboundConf = false;
    this.isOBD = false;
    this.isDynamicIvr = false;
    this.isVoicebot = false;
    this.pbxForm.get('bundle_plan_id').setValue('');
    this.pbxForm.get('bundle_plan_id').clearValidators();
    this.pbxForm.get('bundle_plan_id').updateValueAndValidity();
    this.pbxForm.get('is_bundle').setValue('');
    this.pbxForm.get('is_bundle').clearValidators();
    this.pbxForm.get('is_bundle').updateValueAndValidity();

    this.pbxForm.get('roaming_plan_id').setValue('');
    this.pbxForm.get('roaming_plan_id').clearValidators();
    this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
    this.pbxForm.get('is_roaming').setValue('');
    this.pbxForm.get('is_roaming').clearValidators();
    this.pbxForm.get('is_roaming').updateValueAndValidity();

    this.pbxForm.get('teleConsultancy_call_plan_id').setValue('');
    this.pbxForm.get('teleConsultancy_call_plan_id').clearValidators();
    this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
    this.pbxForm.get('teleConsultancy').setValue('');
    this.pbxForm.get('teleConsultancy').clearValidators();
    this.pbxForm.get('teleConsultancy').updateValueAndValidity();

    this.pbxForm.get('out_bundle_call_plan_id').setValue('');
    this.pbxForm.get('out_bundle_call_plan_id').clearValidators();
    this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();
    this.pbxForm.get('out_bundle').setValue('');
    this.pbxForm.get('out_bundle').clearValidators();
    this.pbxForm.get('out_bundle').updateValueAndValidity();
  }

  submitPbxForm() {
    if (this.pbxForm.dirty && this.pbxForm.valid) {      
      this.submitted = true;
      this.errors = { errors: {} };    
      const credentials = this.pbxForm.value;
      credentials.check_roaming = this.check_roaming;
      credentials.check_bundle = this.check_bundle;
      credentials.check_tc = this.check_tc;
      credentials.check_outgoing = this.check_outgoing;      
      credentials['isSMSTypCustom'] = credentials.sms == 0 ? 1 : 0;
      credentials['file_storage_duration'] = Number(credentials['file_storage_duration']);
      credentials['file_storage_size'] = Number(credentials['file_storage_size']);
      credentials['phone_book'] = Number(credentials['phone_book']);
      credentials['subscription'] = Number(credentials['subscription']);
      if (credentials.phone_book < 50) {
        this.toastr.error('Error!', phoneBookLimit, { timeOut: 2000 });
        return; 
      }
      if (credentials.is_minute_plan == 1 && (credentials.is_bundle == 0 && credentials.out_bundle == 0 && credentials.is_roaming == 0 && credentials.teleConsultancy == 0 )) {
        this.toastr.error('Error!', minutePlan, { timeOut: 2000 });
        return;
      }
      this.productService.checkValidPackage(credentials.package_name, this.myproduct).subscribe(data => {
        if (data.package_id >= 1) {
          this.toastr.error('Error!', duplicatePackage, { timeOut: 4000 })
          this.pbxPackageName = "";
          this.ocPackageName = "";
        } else {
          this.packageService.postPbxFeature('createPackage', credentials)
            .subscribe(data => {
              this.toastr.success('Success!', packageCreated, { timeOut: 2000 });
              this.router.navigateByUrl('package/manage');
            });
        }
      })
    } else {
      this.toastr.error('Info!', invalidFormError, { timeOut: 2000 });
    }
  }

  submitOcForm() {
    if (this.ocForm.dirty && this.ocForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.ocForm.value;
      this.productService.checkValidPackage(credentials.package_name_oc, this.myproduct).subscribe(data => {
        if (data.package_id >= 1) {
          this.toastr.error('Error!', duplicatePackage, { timeOut: 4000 })
          this.pbxPackageName = "";
          this.ocPackageName = "";
        } else {
          this.packageService.postOcFeature('createPackage', credentials).subscribe(data => {
            this.toastr.success('Success!', packageCreated, { timeOut: 2000 });
            this.router.navigateByUrl('package/manage');
          }, err => {
            this.errors = err;
          });
        }
      })
    } else {
      this.toastr.error('Info!', invalidFormError, { timeOut: 2000 });
    }
  }

  billingTypeAction(e) {
    this.billingType = e.value;
    if (this.billingType == "2" || this.billingType == "3") {
      this.isMinuteBal = true;
      this.isOutbound = true;
      this.disableOutbound = true;
      // this.isTeleConsultancy = true;
      // this.isTeleConsultancyShow = true;
    } else {
      this.isMinuteBal = false;
      this.isOutbound = false;
      this.disableOutbound = false;
      // this.isTeleConsultancy = false;
      // this.pbxForm.get('teleConsultancy').setValue(false);
      // this.isTeleConsultancyShow = false;
    }
  }



  // checkValidPackage(keyword, product) {
  //   let mykeyword = keyword.target.value;
  //   this.productService.checkValidPackage(mykeyword, product).subscribe(data => {
  //     if (data.package_id >= 1) {
  //       this.toastr.error('Error!', duplicatePackage, { timeOut: 4000 })
  //       this.pbxPackageName = "";
  //       this.ocPackageName = "";
  //     }
  //   });
  // }

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
      this.pbxForm.controls.circle.setValidators(Validators.required);
      this.pbxForm.controls.circle.updateValueAndValidity();
    } else {
      this.pbxForm.controls.circle.clearValidators();
      this.pbxForm.controls.circle.updateValueAndValidity();
      this.pbxForm.get('circle').setValue('');
      // this.pbxForm.controls.call_plan.clearValidators();
      // this.pbxForm.controls.call_plan.updateValueAndValidity();
      // this.pbxForm.get('call_plan').setValue('');
      this.pbxForm.get('call_plan').reset();
      // this.callPlans = []
        this.packageService.getCallPlanList().subscribe(data => {
          this.pbxForm.controls.call_plan.clearValidators();
          this.pbxForm.controls.call_plan.updateValueAndValidity();
          this.pbxForm.get('call_plan').setValue('');
          this.pbxForm.controls.call_plan.setValidators(Validators.required);
          this.pbxForm.controls.call_plan.updateValueAndValidity();
          
        this.callPlans = data.response;
        // this.filterCall = this.CallPlanFilter = this.callPlans.slice();
      }, err => {
        this.error = err.message;
      });
    }
  }

  public onCircleSelect(event) {    
    // let circleId = this.pbxForm.get('circle').value;
    let circleId = event.value
    if (circleId) {
      this.pbxForm.get('call_plan').reset();
      this.pbxForm.get('call_plan').updateValueAndValidity();
      this.packageService.getCallPlanWithCircle(circleId).subscribe(data => {
        if (data.response.length == 0) {
          this.primaryCallPlan = '';
          this.pbxForm.controls.call_plan.setValidators(Validators.required);
          this.pbxForm.controls.call_plan.updateValueAndValidity();
          this.callPlans = data.response;
          this.filterCallPlan = this.CallPlanFilter = this.callPlans.slice();

          return;
        }
        this.callPlans = data.response;                
        this.filterCallPlan = this.CallPlanFilter = this.callPlans.slice();

        this.primaryCallPlan = data.response[0].id;
      }, err => {
        this.error = err.message;
      });
    } else {
      this.pbxForm.get('call_plan').reset();
      this.pbxForm.get('call_plan').updateValueAndValidity();
      this.packageService.getCallPlanList().subscribe(data => {
        this.callPlans = data.response;
        this.filterCallPlan = this.CallPlanFilter = this.callPlans.slice();

        this.primaryCallPlan = data.response[0].id;
      }, err => {
        this.error = err.message;
      });
    }

  }

  public getFeaturePlanRate() { //get Feature Rate
    this.featuresService.getFeaturePlan({}).subscribe(data => {
      this.globalFeatureRateList = data;
      this.filterFeature = this.FeatureRateFilter = this.globalFeatureRateList.slice();
    }, err => {
      this.errors = err.message;
    });
  }

  public getSMS() {
    this.packageService.getSMS().subscribe(data => {
    this.SMSList = data;
     this.SMSList.unshift({id:0 ,name:'Custom' })

      this.filterSMS = this.SMSFilter = this.SMSList.slice();
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
    this.callplanService.filterBundlePlanForPackage(creadentials).subscribe(data => {
      if (type == '1') { // Bundle
        // this.bundlePlanList = data;
        let bundleData = data ? data : [];
        this.bundlePlanList = bundleData.sort((a, b) => a.name.localeCompare(b.name));

        this.filterBundle = this.BundlePlanFilter = this.bundlePlanList.slice();
      } else if (type == '2') {  //  ROAMING
        let roamingData = data ? data : [];
        this.roamingPlanList = roamingData.sort((a, b) => a.name.localeCompare(b.name));
        this.filterRoaming = this.RoamingPlanFilter = this.roamingPlanList.slice();
        // this.roamingPlanList = data;
      } else if (type == '4') {  // TC
        let tcData = data ? data : [];
        this.tcCallPlanist = tcData.sort((a, b) => a.name.localeCompare(b.name));
        this.filterTC = this.TCPlanFilter = this.tcCallPlanist.slice();
      } 
      else if (type == '5') {  // TC
        let obData = data ? data : [];
        this.outbundlePlanList = obData.sort((a, b) => a.name.localeCompare(b.name));
        this.filterTC = this.TCPlanFilter = this.outbundlePlanList.slice();
      }else {

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
      this.pbxForm.controls.featureRate.clearValidators();
      this.pbxForm.controls.featureRate.updateValueAndValidity();
      this.pbxForm.get('featureRate').setValue('');
    }
  }

  // public smsToggle(event) {
  //   let isSMSEnable = event.checked;
  //   if (isSMSEnable == true) {
  //     this.isMCA = true;
  //     this.pbxForm.controls.sms.setValidators(Validators.required);
  //     this.pbxForm.get('sms').setValue('0');
  //     this.pbxForm.controls.sms.updateValueAndValidity();
  //   } else {
  //     this.isMCA = false;
  //     this.pbxForm.controls.sms.clearValidators();
  //     this.pbxForm.controls.sms.updateValueAndValidity();
  //     this.pbxForm.get('sms').setValue('');
  //     this.pbxForm.get('miss_call_alert').setValue(false);
  //   }
  // }
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
    if (checked) this.getBundlePlan(type);
    if (type == '1' && checked) {      
      this.pbxForm.controls.bundle_plan_id.setValidators(Validators.required);
      this.pbxForm.controls.bundle_plan_id.updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    } else if (type == '1' && !checked) {
      this.pbxForm.controls.bundle_plan_id.clearValidators();
      this.pbxForm.controls.bundle_plan_id.updateValueAndValidity();
      this.pbxForm.controls.bundle_plan_id.setValue('');
      this.pbxForm.updateValueAndValidity();
    }
    else if (type == '2' && checked) {            
      this.check_roaming = true;
      this.pbxForm.get('roaming_plan_id').setValidators(Validators.required);
      this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    } else if (type == '2' && !checked) {   
      this.check_roaming = false;   
      this.pbxForm.get('roaming_plan_id').setValue('');
      this.pbxForm.get('roaming_plan_id').clearValidators();
      this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    }
    else if (type == '4' && checked) {
      this.check_tc = true;
      this.pbxForm.get('teleConsultancy_call_plan_id').setValidators(Validators.required);
      this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    } else if (type == '4' && !checked) {
      this.check_tc = false;
      this.pbxForm.get('teleConsultancy_call_plan_id').setValue('');
      this.pbxForm.get('teleConsultancy_call_plan_id').clearValidators();
      this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    }
    else if (type == '5' && checked) {
      this.check_outgoing = true;
      this.pbxForm.get('out_bundle_call_plan_id').setValidators(Validators.required);
      this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    } else if (type == '5' && !checked) {
      this.check_outgoing = false;
      this.pbxForm.get('out_bundle_call_plan_id').setValue('');
      this.pbxForm.get('out_bundle_call_plan_id').clearValidators();
      this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();
      this.pbxForm.updateValueAndValidity();
    }
    // if(type == '1' && !checked) {
    //   this.pbxForm.get('bundle_plan_id').setValue(''); this.pbxForm.get('bundle_plan_id').clearValidators(); this.pbxForm.get('bundle_plan_id').updateValueAndValidity();
    // }
    // if(type == '2' && !checked) {
    //   this.pbxForm.get('roaming_plan_id').setValue('');this.pbxForm.get('roaming_plan_id').clearValidators(); this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
    // }
  }

  public changeMinutePlan(data) {
    if (!data.checked) {
      this.pbxForm.get('is_bundle').setValue('');
      this.pbxForm.get('out_bundle').setValue('');
      this.pbxForm.get('is_roaming').setValue('');
      this.pbxForm.get('teleConsultancy').setValue('');
      this.pbxForm.get('bundle_plan_id').setValue('');
      this.pbxForm.get('roaming_plan_id').setValue('');
      this.pbxForm.get('teleConsultancy_call_plan_id').setValue('');
      this.pbxForm.get('bundle_plan_id').clearValidators();
      this.pbxForm.get('roaming_plan_id').clearValidators();
      this.pbxForm.get('teleConsultancy_call_plan_id').clearValidators();
      this.pbxForm.get('bundle_plan_id').updateValueAndValidity();
      this.pbxForm.get('roaming_plan_id').updateValueAndValidity();
      this.pbxForm.get('teleConsultancy_call_plan_id').updateValueAndValidity();
      this.pbxForm.get('out_bundle_call_plan_id').setValue('');
      this.pbxForm.get('out_bundle_call_plan_id').clearValidators();
      this.pbxForm.get('out_bundle_call_plan_id').updateValueAndValidity();

    } else {      
      this.check_bundle = true;      
      this.pbxForm.get('out_bundle').setValue(true);      
      this.getBundlePlan('5');  // Bundle Plan
      this.pbxForm.controls.out_bundle_call_plan_id.setValidators(Validators.required);
      this.pbxForm.controls.out_bundle_call_plan_id.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.__featureChangeSubscription.unsubscribe();
    this.__circleChangeSubscription.unsubscribe();
    this.__smsChangeSubscription.unsubscribe();
  }
}