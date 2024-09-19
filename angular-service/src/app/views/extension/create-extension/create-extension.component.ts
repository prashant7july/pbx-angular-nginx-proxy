import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Errors, CommonService, GatewayService, PASSWORD_RegEx, alpha__numeric_only, EMAIL_RegEx, invalidForm, ExtensionService, extensionCreated, rangeError, errorMessage, duplicateExtension, codecError, checkExtensionLimit, emailExist, checkExtUsername, Number_RegEx ,plus_number_RegEx} from '../../../core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../profile/profile.service';
import { CallplanService } from '../../call-plan/callplan.service';
import { UserTypeConstants } from 'src/app/core/constants';
import { CustomerDialoutDialog } from '../../customer-dialoutRule/customer-dialout-rule/customer-dialout-rule.component';
import { CustomerDialoutServiceService } from '../../customer-dialoutRule/customer-dialout-service.service';
@Component({
  selector: 'app-create-extension',
  templateUrl: './create-extension.component.html',
  styleUrls: ['./create-extension.component.css']
})

export class CreateExtensionComponent implements OnInit {
  submitted = false;
  checkForm: any;
  errors: Errors = { errors: {} };
  extensionForm: FormGroup;
  error = '';
  theCheckbox = true;
  sourceCodec: any[] = [];
  targetCodec: any[] = [];
  isExtNumber: boolean;
  isVMpwd: boolean;
  allowExtensionLimit: any;
  totalUserExtension: any;
  callerIdHeaderValue = '';
  securePassword = '';
  sipPwd = "";
  VMPwd = "";
  userId = "";
  ext_from = "";
  ext_to = "";
  isVoicemail = "";
  isOutbound = "";
  isRecording = "";
  isForward = "";
  isSpeedDial = "";
  isBlackList = "";
  isCallTransfer = "";
  isStickyAgent: any;
  isClick2Call = "";
  isWhatsapp = "";
  doNotDisturb = "";
  featureDiv: boolean;
  emailId = "";
  userName = "";
  hide = true;
  hide1 = true;
  hide2 = true;
  userRole = "";
  extPackage = "";
  pkg_minute_balance: number;
  minute_balance: number;
  assigned_minute_balance: number = 0;
  billing_type = "";
  isWithOutPool = false;
  billing_name = '';
  featureId = "";
  isCheckAllFeatureSetting = "";
  remianExtension: any;
  isExtLimit = false;
  isShowAPIToken: boolean = false;
  isPlayPosition: boolean = false;
  isPlugIn: boolean = false;
  readonly:boolean = false;
  readonlyy:boolean = false;
  hideToken = false;
  countryList = [];
  CountryFilter:any;
  filter:any;
  isMissCallAlert: any;
  isShowSMS = "";
  countryCode = "";
  enableC2C: any;
  countryID: any = {};
  isRoaming: any;
  isFindMeFollowMe = "";
  isCustomPrompt = "";
  missCallAlert: any;
  isIntercom = false;
  isMCA = false;
  isBundlePlan = false;
  isOutboundCall = false;
  extensionLengthLimit: number = 4;
  alreadtExistExrension = [];
  intercomList = [];
  email_available_from_notification: string = "";
  __extensionFromChangeSubscription : any ;
  __extensionToChangeSubscription : any;
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private gatewayService: GatewayService,
    private extensionService: ExtensionService,
    public commonService: CommonService,
    private profileService: ProfileService,
    private callplanService: CallplanService,
    private customerDialoutService : CustomerDialoutServiceService
  ) {
    this.extensionForm = this.fb.group({
      'plan': [""],
      'eType': ['1', Validators.required],
      'extension_number': ['', [Validators.required, Validators.minLength(2)]],  // Validators.maxLength(4)
      'extension_from': ['', [Validators.required, Validators.minLength(2)]],//, Validators.maxLength(4)
      'extension_to': ['', [Validators.required, Validators.minLength(2)]], // , Validators.maxLength(4) 
      'ext_name': ['', Validators.required],
      'web_pass': ['', [Validators.required, Validators.pattern(PASSWORD_RegEx)]],
      'email': ['', [Validators.required, Validators.pattern(EMAIL_RegEx)]],
      'misscall_notify': [''],
      'bal_restriction': [''],
      'caller_id_name': ['', Validators.required],
      'sip_pass': ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(alpha__numeric_only)]],
      'ring_time_out': ['30', [Validators.min(5), Validators.max(60)]],
      'dial_time_out': ['30', [Validators.min(5), Validators.max(60)]],
      'external_caller_id': [''],
      'dtmf_type': ['0'],
      'header_type': ['0'],
      'callerID_headervalue': ['0',Validators.pattern(plus_number_RegEx)],
      'multiple_reg': [''],
      'dial_out': [''],
      'voice_mail': [''],
      'voice_mail_pwd': [''],
      'c2c_value':[''],
      'outbound': [''],
      'recording': [''],
      'call_forward': [''],
      'speed_dial': [''],
      'black_list': [''], // bcz now all extension have default blacklist functionality 
      'call_transfer': [''],
      'ext_minute_bal': [0],
      'dnd': [''],
      'isCheckAllFeatureSettings': [''],
      'token': [''],
      'apiToken': [''],
      'roaming': [''],
      'dial_prefix': [''],
      'mobile': ['', [Validators.pattern(Number_RegEx)]],
      'outbound_sms_notification': [''],
      'admin': [''],
      'find_me_follow_me': [''],
      'ringtone': [''],
      'sticky_agent': [''],
      'click_to_call': [''],  
      'plug_in': [''],
      'call_waiting': [''],
      'call_persistent': [''],
      'is_callerId_from_extNumber': [false],
      'is_email_from_notificationemail': [false],
      'intercom_calling':[true],
      'whatsapp': [''],
      'intercom_dialout': [''],
    });
  }

  get ext_name() { return this.extensionForm.get('ext_name'); }
  get voice_mail_pwd() { return this.extensionForm.get('voice_mail_pwd'); }
  get caller_id_name() { return this.extensionForm.get('caller_id_name'); }
  get sip_pass() { return this.extensionForm.get('sip_pass'); }
  get ring_time_out() { return this.extensionForm.get('ring_time_out'); }
  get dial_time_out() { return this.extensionForm.get('dial_time_out'); }
  get plan() { return this.extensionForm.get('plan'); }
  get eType() { return this.extensionForm.get('eType'); }
  get extension_number() { return this.extensionForm.get('extension_number'); }
  get extension_from() { return this.extensionForm.get('extension_from'); }
  get extension_to() { return this.extensionForm.get('extension_to'); }
  get web_pass() { return this.extensionForm.get('web_pass'); }
  get email() { return this.extensionForm.get('email'); }
  get external_caller_id() { return this.extensionForm.get('external_caller_id'); }
  get mobile() { return this.extensionForm.get('mobile'); }
  get callerID_headervalue() { return this.extensionForm.get('callerID_headervalue'); }
  get call_waiting() { return this.extensionForm.get('call_waiting'); }
  get call_persistent() { return this.extensionForm.get('call_persistent'); }
  // get click_to_call() { return this.extensionForm.get('click_to_call'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    let user_id = localStorage.getItem("id");
    this.userRole = localStorage.getItem("type");
    this.callerIdHeaderValue = "Same as Caller Id";
    this.isVMpwd = true;
    this.isExtNumber = true;
    this.extensionForm.controls.extension_from.disable(); // when not range
    this.extensionForm.controls.extension_to.disable(); // when not range    \
    this.extensionForm.get('c2c_value').clearValidators();
    this.extensionForm.get('intercom_dialout').setValue(0);
    // get all voice codec--------------// __contactChangeSubscription
    // this.__extensionFromChangeSubscription = this.extensionForm.get('extension_from').valueChanges.subscribe(res=>{
    //   if(res){
    //     let data = res ? (res.split(''))[0]: '1';
    //     let extensionNumber = res ? Number(res): '';
    //     if(data == '0'){
    //       this.toastr.error('Error!', "Extension From Number can't start with zero", { timeOut: 4000 });
    //       this.extension_from.setValue('');
    //       // this.ext_from = '';
    //     }
    //     if(extensionNumber){
    //       let is_ext_number_emergency = extensionNumber > 99 ? extensionNumber < 200 ? true: false : false;
    //       if(is_ext_number_emergency){ // check that extension number should not start with zero
    //         this.toastr.error('Error!', "Extension Number not allowed between 99 to 200", { timeOut: 4000 });
    //         this.extension_from.setValue('');
    //         return;
    //       }
    //     }
    //   } 
    // });
    // this.__extensionToChangeSubscription = this.extensionForm.get('extension_to').valueChanges.subscribe(res=>{
    //   if(res){
    //     let data = res ? (res.split(''))[0]: '1';
    //     let extensionNumber = res ? Number(res): '';

    //     if(data == '0'){
    //       this.toastr.error('Error!', "Extension To Number can't start with zero", { timeOut: 4000 });
    //       this.extension_to.setValue('');
    //       this.ext_to = '';
    //     }
    //     if(extensionNumber){
    //       let is_ext_number_emergency = extensionNumber > 99 ? extensionNumber < 200 ? true: false : false;
    //       if(is_ext_number_emergency){ // check that extension number should not start with zero
    //         this.extension_to.setValue('');
    //         this.toastr.error('Error!', "Extension Number not allowed between 99 to 200", { timeOut: 4000 });
    //         return;
    //       }
    //     }
    //   } 
    // })
    this.gatewayService.getCodecInfo().subscribe(data => {
      for (let i = 0; i < data.response.length; i++) {
        if (data.response[i].id == '6' || data.response[i].id == '7') {
          this.targetCodec.push({ id: data.response[i].id, codec: data.response[i].codec });
        } else {
          this.sourceCodec.push({ id: data.response[i].id, codec: data.response[i].codec });
        }
      }
      //this.sourceCodec = data.response;      
    }, err => {
      this.errors = err.message;
    });
    //---------//
    this.callplanService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filter = this.CountryFilter = this.countryList.slice();
    });

    // get assined extension limit---------//
    this.extensionService.getMyExtensionLimit(user_id, localStorage.getItem('type')).subscribe(data => {
      this.featureId = data.ext.feature_id;
      this.extPackage = data.ext.package_id;
      this.allowExtensionLimit = data.ext.extension_limit;
      this.isVoicemail = data.ext.voicemail;
      this.isOutbound = data.ext.outbound_call;
      this.isRecording = data.ext.recording;
      this.isForward = data.ext.forward;
      this.isSpeedDial = data.ext.speed_dial;
      this.isBlackList = data.ext.black_list;
      this.isCallTransfer = data.ext.call_transfer;
      this.pkg_minute_balance = data.ext.minute_balance;
      this.billing_type = data.ext.billing_type;
      this.isMissCallAlert = Number(data.ext.miss_call_alert);
      this.isRoaming = data.ext.roaming;
      this.isShowSMS = data.ext.sms;
      this.isFindMeFollowMe = data.ext.find_me_follow_me;
      this.isCustomPrompt = data.ext.custom_prompt;
      this.isStickyAgent = Number(data.ext.sticky_agent);
      this.isClick2Call = (data.ext.click_to_call);
      this.isWhatsapp = data.ext.whatsapp;
      this.doNotDisturb = data.ext.dnd;
      this.extensionForm.get('black_list').setValue(this.isBlackList)
      this.missCallAlert = Number(data.ext.miss_call_alert)

      if(this.isShowSMS == '1' && this.missCallAlert == '1'){
        this.isMCA = true;
      }else{
        this.isMCA = false;
      }

      this.isBundlePlan = data.ext.is_bundle_plan == '1' ? true : false;
      this.isOutboundCall = data.ext.outbound_call == '1' ? true : false;
      
        
      
      // if (this.isOutbound == '1' || this.isRecording == '1') {   // As per discussion with virendra sir i commented it
      //   this.featureDiv = true;
      // } else {
      //   this.featureDiv = false;
      // }
      if (this.isVoicemail == "1") {
        this.extensionForm.controls.voice_mail_pwd.enable(); //when not range
      } else {
        this.extensionForm.controls.voice_mail_pwd.disable();
      }  


      if (this.billing_type == '3') {
        this.isWithOutPool = true;
        this.billing_name = 'Enterprise without pool';
      }

      if (this.billing_type == '2') {
        this.billing_name = 'Enterprise with pool';
      }

      if (this.billing_type == '1') {
        this.billing_name = 'Package';
      }

    });

    this.customerDialoutService.getIntercomByCustomer(localStorage.getItem('id')).subscribe(data=>{
    
      this.intercomList = data;
      this.intercomList.unshift({name:'All', id: 0})
    })

    //-------------------------------------//
    // get user extension limit -----------//
    this.extensionService.getMyExtension(user_id).subscribe(data => {
      
      let minute = 0;
      this.totalUserExtension = data.response.length;
      for (let i = 0; i < this.totalUserExtension; i++) {
        this.assigned_minute_balance = this.assigned_minute_balance + parseFloat(data.response[i].total_min_bal);
      }
      this.minute_balance = this.pkg_minute_balance - this.assigned_minute_balance;


    });
    //-------------------------------------//
    this.commonService.getCustomerCountry(localStorage.getItem('id')).subscribe(data => {
      this.countryID = data.response[0];
      this.countryCode = '+' + data.response[0].phonecode
    }, err => {
      this.error = err.message;
    });
    // -------------------------------------------------------//
    this.remianExtension = parseInt(this.allowExtensionLimit) - parseInt(this.totalUserExtension);
    if (this.remianExtension == '0') {
      this.toastr.error('Error!', checkExtensionLimit, { timeOut: 4000 });
      this.isExtLimit = true;
    }
    // -------------------------------------------------------//
    //this.targetCodec = [];//initialize list 2;
    this.secure_password_generator(8); // web password
    this.sipPassword(); //SIP password
    this.VMPassword(); //VM password
    this.setToken();
    this.userId = localStorage.getItem("id");

    this.userRole = localStorage.getItem('type');
    this.profileService.getUserInfo('getUserInfo', Number(localStorage.getItem('id'))).subscribe(data => {
      if (data) {
        let userData = data.response[0];   //api_token        
        if(userData.intercom_calling == '1'){          
          this.isIntercom = true;
        }else{
          this.extensionForm.get('intercom_calling').setValue(false);
          this.isIntercom = false;
        }
        this.isShowAPIToken = userData['api_token'] == '1' ? true : false;
        this.extensionLengthLimit = userData['extension_length_limit'];
        this.email_available_from_notification = userData['notification_email'];
        this.isPlugIn = userData['plugin'] == 'Y' ? true :false;
      
        // this.extensionForm.get('ext_number').setValidators(Validators.maxLength(this.extensionLengthLimit));
        // this.extensionForm.get('ext_number').updateValueAndValidity();
      }
    }, err => {
      this.errors = err.message;
    });
  }

  public isChnageToggle(event){
    let isSetToggleEnable = event.checked;
    if (isSetToggleEnable == true) {
      // this.extensionForm.controls.date.setValidators(Validators.required);
      // this.extensionForm.controls.date.updateValueAndValidity();
    }else{
      this.extensionForm.controls.call_persistent.clearValidators();
      this.extensionForm.controls.call_persistent.updateValueAndValidity();
      this.extensionForm.get('call_persistent').reset();
    
    }
   }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.countryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Intercomremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.intercomList.filter((data) =>{
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  secure_password_generator(len) {
    let length = (len) ? (len) : (8);
    let string_lower = "abcdefghijklmnopqrstuvwxyz";
    let string_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numeric = '0123456789';
    let punctuation = '!#$%&\*+,-./:<=>?@[\]^_{|}~'; // remove ;'"`() from this punctuation
    let password = "";
    let character = "";
    while (password.length < length) {
      let entity1 = Math.ceil(string_lower.length * Math.random() * Math.random());
      let entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
      let entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
      let entity4 = Math.ceil(string_UPPER.length * Math.random() * Math.random());
      //let hold = string_lower.charAt( entity1 );
      //hold = (password.length%2==0)?(hold.toUpperCase()):(hold);
      character += string_lower.charAt(entity1);
      character += string_UPPER.charAt(entity4);
      character += numeric.charAt(entity2);
      character += punctuation.charAt(entity3);
      password = character;
    }
    password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');
    return this.securePassword = password.substr(0, len);
  }

  sipPassword() {
    let length = 8,
      charset = "0123456789abcdefghijklmnopqrstuvwxyz",
      retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return this.sipPwd = retVal;
  }

  VMPassword() {
    let length = 8,
      charset = "0123456789",
      retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return this.VMPwd = retVal;
  }

  toggleVisibility(e) {
    let value = e.checked;
    if (value === true) {
      this.theCheckbox = false;
      this.callerIdHeaderValue = "";
    } else {
      this.callerIdHeaderValue = "Same as Caller Id";
      this.theCheckbox = true;
    }
  }

  showExtType(event) {
    let extType = event.value;
    if (extType == "1") {
      this.extensionForm.controls.extension_from.disable(); //when not range
      this.extensionForm.controls.extension_to.disable(); //when not range
      this.extensionForm.controls.extension_number.enable(); //when not range
      this.extensionForm.controls.web_pass.enable(); //when not range
      this.extensionForm.controls.email.enable(); //when not range
      this.extensionForm.controls.caller_id_name.enable(); //when not range
      if (this.isVoicemail == "1") {
        this.extensionForm.controls.voice_mail_pwd.enable(); //when not range
      } else {
        this.extensionForm.controls.voice_mail_pwd.disable();
      }
      this.extensionForm.controls.sip_pass.enable(); //when not range
      this.extensionForm.controls.ext_name.enable(); //when not range
      this.extensionForm.controls.mobile.enable();//when not range
      this.isExtNumber = true;
      this.extension_from.setValue('');
      this.extension_to.setValue('');
    } else {
      this.extensionForm.controls.extension_from.enable(); //when range
      this.extensionForm.controls.extension_to.enable(); //when range
      this.extensionForm.controls.extension_number.disable(); //when range
      this.extensionForm.controls.web_pass.disable(); //when range
      this.extensionForm.controls.email.disable(); //when range
      this.extensionForm.controls.caller_id_name.disable(); //when range
      this.extensionForm.controls.voice_mail_pwd.disable(); //when range
      this.extensionForm.controls.sip_pass.disable(); //when range
      this.extensionForm.controls.ext_name.disable(); //when range
      this.extensionForm.controls.mobile.disable();//when not range
      this.extensionForm.controls.plug_in.disable(); // when not range
      this.extension_number.setValue('');
      this.isExtNumber = false;
    }
  }

  showVoiceMailPwd(event) {
    let voice_mail = event.checked;
    if (voice_mail == true) {
      this.extensionForm.controls.voice_mail_pwd.setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(16)]);
      this.extensionForm.controls.voice_mail_pwd.updateValueAndValidity();
      // this.extensionForm.controls.voice_mail_pwd.enable();
      this.isVMpwd = true;
    } else {
      this.extensionForm.controls.voice_mail_pwd.clearValidators();
      this.extensionForm.controls.voice_mail_pwd.updateValueAndValidity();
      this.extensionForm.get('voice_mail_pwd').reset();
      // this.extensionForm.controls.voice_mail_pwd.disable();
      this.isVMpwd = false;
    }
  }

  setCallerIdName(event) {
    let action = event.checked;
    if (action == true) {
      this.readonlyy = true;
      let ext_number = (this.extensionForm.controls.extension_number.value).toString();
      if (ext_number) this.extensionForm.controls.caller_id_name.setValue((this.userId).toString() + (this.extensionForm.controls.extension_number.value).toString()); this.extensionForm.controls.caller_id_name.updateValueAndValidity();
    } else {
      this.readonlyy = false;
      this.extensionForm.controls.caller_id_name.setValue('');
    }
  }

  setEmailId(event) {
    let action = event.checked;
    if (action == true) {
      this.readonly = true;
      if (this.email_available_from_notification) this.extensionForm.controls.email.setValue(this.email_available_from_notification); this.extensionForm.controls.email.updateValueAndValidity();

    } else {
      this.readonly = false;
      this.extensionForm.controls.email.setValue('')
    }
  }

  public setToken() {
    this.extensionForm.get('token').setValue((new Date().getTime()).toString(36) + Math.random().toString(36).substr(2));
  }

  submitExtensionForm() {

    let user_id = localStorage.getItem("id");
    let codecValue: any = [];
    let extensionNumber: any = [];
    const credentials = this.extensionForm.value;
    let is_ext_number_Invalid = this.extension_number.value;
    let is_ext_number_emergency = this.extension_number.value;
    is_ext_number_Invalid = (is_ext_number_Invalid.split(''))[0] === '0';
    is_ext_number_emergency = Number(is_ext_number_emergency);
    is_ext_number_emergency = is_ext_number_emergency > 99 ? is_ext_number_emergency < 200 ? true: false : false;
    let remianExtension = parseInt(this.allowExtensionLimit) - parseInt(this.totalUserExtension);
    if (remianExtension == 0) {
      this.toastr.error('Error!', checkExtensionLimit + remianExtension + ")", { timeOut: 4000 });
      return;
    }
    if(is_ext_number_Invalid){ // check that extension number should not start with zero
      this.toastr.error('Error!', "Extension Number can't start with zero", { timeOut: 4000 });
      this.extensionForm.controls.extension_number.setValue('');
      return;
    }
    if(is_ext_number_emergency){ // check that extension number should not start with zero
      this.toastr.error('Error!', "Extension Number not allowed between 99 to 200", { timeOut: 4000 });
      this.extensionForm.controls.extension_number.setValue('');
      return;
    }

    if (credentials.eType == '2') {
      let extensionNumberFrom = credentials.extension_from;
      let dataFrom = extensionNumberFrom ? (extensionNumberFrom.split(''))[0] : '1';
      if (dataFrom == '0') {
        this.toastr.error('Error!', "Extension From Number can't start with zero", { timeOut: 4000 });
        this.extension_from.setValue('');
      }
      let is_ext_number_emergency_from = extensionNumberFrom > 99 ? extensionNumberFrom < 200 ? true: false : false;
      if(is_ext_number_emergency_from){ // check that extension number should not start with zero
        this.extension_from.setValue('');
        this.toastr.error('Error!', "Extension From not allowed between 99 to 200", { timeOut: 4000 });
        return;
      }
      let extensionNumberTo = credentials.extension_to;
      let dataTo = extensionNumberTo ? (extensionNumberTo.split(''))[0]: '1';
        if(dataTo == '0'){
          this.toastr.error('Error!', "Extension To Number can't start with zero", { timeOut: 4000 });
          this.extension_to.setValue('');
          this.ext_to = '';
        }
      let is_ext_number_emergency_to = extensionNumberTo > 99 ? extensionNumberTo < 200 ? true: false : false;
      if(is_ext_number_emergency_to){ // check that extension number should not start with zero
        this.extension_to.setValue('');
        this.toastr.error('Error!', "Extension To not allowed between 99 to 200", { timeOut: 4000 });
        return;
      }
    }
    //credentials['token'] =  (new Date().getTime()).toString(36) + Math.random().toString(36).substr(2);   // random number
    //  return;  
    if (this.extensionForm.valid) {
      this.submitted = true;

      // if (this.targetCodec.length > 0) {
      //   for (let i = 0; i < this.targetCodec.length; i++) {
      //     codecValue.push(this.targetCodec[i].codec);
      //   }
      // credentials.codec = codecValue; jst commented bcz of remove codec aftr virendra sir discussion at 9 december
      credentials.codec = [];
      credentials.user_id = user_id;
      credentials.extUserPackage = this.extPackage;
      if (this.billing_type == '2') {
        // ------------------------------
        credentials.minute_balance = this.minute_balance;
        // ------------------------------
      } else if (this.billing_type == '3' || this.billing_type == '1') {
        credentials.minute_balance = credentials.ext_minute_bal;
      }
      credentials.billing_type = this.billing_type;

      // if (this.theCheckbox === true) {
      //   credentials.callerID_headervalue = credentials.caller_id_name;
      // }
      //manage extension number        
      if (credentials.eType == '1') {
        credentials.extension_number = user_id + '' + credentials.extension_number;
      } else {
        this.checkRangeMaxExtLimit();
        let fromExt = parseInt(user_id + '' + credentials.extension_from);
        let toExt = parseInt(user_id + '' + credentials.extension_to);
        while (fromExt <= toExt) {
          extensionNumber.push(fromExt);
          fromExt++;
        } 
        // credentials.extension_number = extensionNumber;
        credentials.extension_number =  this.removeExistExtension(extensionNumber);
      }
     
      if (this.extensionForm.get('is_callerId_from_extNumber').value == '1' || this.extensionForm.get('is_callerId_from_extNumber').value == true) {
        credentials.caller_id_name = (this.userId).toString() + (this.extensionForm.controls.extension_number.value).toString();
      }
      if (credentials['is_email_from_notificationemail'] == true || credentials['is_email_from_notificationemail'] == '1') {
          this.saveExtn(credentials); 
      } else {
        this.extensionService.checkEmailValid(credentials['email']).subscribe(data => {
          if (data.email >= 1) {
            this.toastr.error('Error!', emailExist, { timeOut: 4000 })
            this.emailId = "";
            return;
          } else {
             this.saveExtn(credentials); // need to check
          }
        }, err => {
          this.error = err.message;
        });
      }
    } else {
      this.toastr.error('Error!', invalidForm, { timeOut: 4000 });
    }

  }

  public saveExtn(credentials) {
    this.extensionService.createExtension('createExtension', credentials)
      .subscribe(data => {
        if (this.billing_type == '3') {
          this.minute_balance = this.minute_balance - parseFloat(credentials.ext_minute_bal);
        }
        this.toastr.success('Success!', extensionCreated, { timeOut: 4000 });
        this.router.navigateByUrl('extension/view');
      }, err => {
        this.errors = err;
        this.toastr.error('Error!', errorMessage, { timeOut: 4000 });
      });
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.extensionForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  checkExt(keyword) {
    let remianExtension: any;
    let mykeyword = keyword.target.value;
    let user_id = localStorage.getItem("id");
    let finalKey = user_id + '' + mykeyword;
    // check extension limit

    remianExtension = parseInt(this.allowExtensionLimit) - parseInt(this.totalUserExtension);
    if (remianExtension == '0') {
      this.toastr.error('Error!', checkExtensionLimit + remianExtension + ")", { timeOut: 4000 });
      keyword.target.value = "";
      this.extensionForm.controls.extension_number.setValue('');
      return false;
    }
    // check duplicacy 
    this.extensionService.checkValidExt(finalKey, user_id).subscribe(data => {
      if (data.ext_id >= 1) {
        this.toastr.error('Error!', duplicateExtension, { timeOut: 4000 });
        keyword.target.value = "";
        this.extensionForm.controls.extension_number.setValue('');
        return false;
      }
    }, err => {
      this.error = err.message;
      // this.toastr.error('Error!', err.message, { timeOut: 2000 });
    });
  }

  checkMinuteBal(keyword) {
    let mykeyword = keyword.target.value;
    if (this.minute_balance < parseFloat(mykeyword)) {
      this.toastr.error('Error!', "You have insufficient balance.", { timeOut: 4000 });
      keyword.target.value = "0";
      return false;
    }
  }

  checkRangeMaxExtLimit() {
    const credentials = this.extensionForm.value;
    let to = credentials.extension_to;
    let from = credentials.extension_from;
    let range = (parseInt(to) - parseInt(from)) + 1;
    let remianExtension = parseInt(this.allowExtensionLimit) - parseInt(this.totalUserExtension);
    if (remianExtension < range) {
      this.toastr.error('Error!', checkExtensionLimit + " " + remianExtension, { timeOut: 4000 });
      this.ext_to = '';
      return false;
    } else {
      return this.checkRangeExt();
    }
  }

  checkRangeExt() {
    let from: any;
    let user_id = localStorage.getItem("id");
    const credentials = this.extensionForm.value;
    let to = user_id + '' + credentials.extension_to;
    from = user_id + '' + credentials.extension_from;

    credentials['to'] = user_id + '' + credentials.extension_to;
    credentials['from'] = user_id + '' + credentials.extension_from;
    credentials['user_id'] = user_id;

    if (parseInt(to) > parseInt(from)) {
      
      this.extensionService.checkValidExtt(credentials).subscribe(data =>{
        data.map(item =>{
          if (item.ext_id >= 1) {
                  this.alreadtExistExrension.push(Number(item.ext_number));
                }
        })

      })
      // while (from <= to) {
      //   this.extensionService.checkValidExt(from, user_id).subscribe(data => {
      //     if (data.ext_id >= 1) {
      //       this.alreadtExistExrension.push(Number(data.ext_number));
      //     }
      //   });
      //   from++;
      // }
    } else {
      this.toastr.error('Error!', rangeError, { timeOut: 4000 });
      this.ext_from = "";
      this.ext_to = "";
      return;
    }
  }

  checkEmail(keyword) {
    let mykeyword = keyword.target.value;
    this.extensionService.checkEmailValid(mykeyword).subscribe(data => {
      if (data.email >= 1) {
        this.toastr.error('Error!', emailExist, { timeOut: 4000 })
        this.emailId = "";
      }
    }, err => {
      this.error = err.message;
    });
  }

  // checkExtUsername(keyword) {
  //   let mykeyword = keyword.target.value;
  //     this.extensionService.checkExtUsernameValid(mykeyword).subscribe(data => {
  //       if (data.user_id >= 1) {
  //         this.toastr.error('Error!', checkExtUsername, { timeOut: 4000 })
  //         this.userName = "";
  //       }
  //     });
  // }

  public checkAllFeatureSettings(isCheck: boolean) {
    if (isCheck) {
      this.extensionForm.get('outbound').setValue(1);
      if (this.isRecording) this.extensionForm.get('recording').setValue(1);
      this.extensionForm.get('call_forward').setValue(1);
      this.extensionForm.get('speed_dial').setValue(1);
      this.extensionForm.get('call_transfer').setValue(1);
      this.extensionForm.get('bal_restriction').setValue(1);
      this.extensionForm.get('multiple_reg').setValue(1);
      this.extensionForm.get('misscall_notify').setValue(1);
      this.extensionForm.get('outbound_sms_notification').setValue(1);
      this.extensionForm.get('admin').setValue(1); 
      this.extensionForm.get('click_to_call').setValue(1);
      this.extensionForm.get('call_waiting').setValue(1);
      this.extensionForm.get('call_persistent').setValue(0);
      if (this.isCustomPrompt) this.extensionForm.get('ringtone').setValue(1);

      if (this.isRoaming) this.extensionForm.get('roaming').setValue(1);
      if (this.isFindMeFollowMe) this.extensionForm.get('find_me_follow_me').setValue(1);
      if (this.isStickyAgent) this.extensionForm.get('sticky_agent').setValue(1);
      this.extensionForm.get('plug_in').setValue(0);
      if (this.isWhatsapp) this.extensionForm.get('whatsapp').setValue(1);
      // if (this.isClick2Call) this.extensionForm.get('click_to_call').setValue(1);
      // this.extensionForm.get('dnd').setValue(1);
    } else {
      this.extensionForm.get('outbound').setValue(0);
      if (this.isRecording) this.extensionForm.get('recording').setValue(0);
      this.extensionForm.get('call_forward').setValue(0);
      this.extensionForm.get('speed_dial').setValue(0);
      this.extensionForm.get('call_transfer').setValue(0);
      this.extensionForm.get('bal_restriction').setValue(0);
      this.extensionForm.get('multiple_reg').setValue(0);
      this.extensionForm.get('misscall_notify').setValue(0);
      this.extensionForm.get('outbound_sms_notification').setValue(0);
      this.extensionForm.get('admin').setValue(0);
      this.extensionForm.get('click_to_call').setValue(0);
      this.extensionForm.get('call_waiting').setValue(0);
      this.extensionForm.get('call_persistent').setValue(0);
      if (this.isCustomPrompt) this.extensionForm.get('ringtone').setValue(0);


      if (this.isRoaming) this.extensionForm.get('roaming').setValue(0);
      if (this.isFindMeFollowMe) this.extensionForm.get('find_me_follow_me').setValue(0);
      if (this.isStickyAgent) this.extensionForm.get('sticky_agent').setValue(0);
      if (this.isWhatsapp) this.extensionForm.get('whatsapp').setValue(0);
      // if (this.isClick2Call) this.extensionForm.get('click_to_call').clearValidators();
      // if (this.isClick2Call) this.extensionForm.get('c2c_value').clearValidators();
      // this.extensionForm.get('dnd').setValue(0);

    }
  }

  public plugInCheck(isCheck: boolean){
    if (isCheck) {
    //   this.extensionForm.get('outbound').setValue(1);
    //   if (this.isRecording) this.extensionForm.get('recording').setValue(1);
    //   this.extensionForm.get('call_forward').setValue(1);
    //   this.extensionForm.get('speed_dial').setValue(1);
    //   this.extensionForm.get('call_transfer').setValue(1);
    //   this.extensionForm.get('bal_restriction').setValue(1);
    //   this.extensionForm.get('multiple_reg').setValue(1);
    //   this.extensionForm.get('misscall_notify').setValue(1);
    //   this.extensionForm.get('outbound_sms_notification').setValue(1);
    //   this.extensionForm.get('admin').setValue(1);
    //   if (this.isCustomPrompt) this.extensionForm.get('ringtone').setValue(1);

    //   if (this.isRoaming) this.extensionForm.get('roaming').setValue(1);
    //   if (this.isFindMeFollowMe) this.extensionForm.get('find_me_follow_me').setValue(1);
    //   if (this.isStickyAgent) this.extensionForm.get('sticky_agent').setValue(1);
    //   this.extensionForm.get('plug_in').setValue(0);
    //   // if (this.isClick2Call) this.extensionForm.get('click_to_call').setValue(1);
    //   // this.extensionForm.get('dnd').setValue(1);
    // } else {
      this.extensionForm.get('isCheckAllFeatureSettings').setValue(false);
      this.extensionForm.get('outbound').setValue(0);
      if (this.isRecording) this.extensionForm.get('recording').setValue(0);
      this.extensionForm.get('call_forward').setValue(0);
      this.extensionForm.get('speed_dial').setValue(0);
      this.extensionForm.get('call_transfer').setValue(0);
      this.extensionForm.get('bal_restriction').setValue(0);
      this.extensionForm.get('multiple_reg').setValue(0);
      this.extensionForm.get('misscall_notify').setValue(0);
      this.extensionForm.get('outbound_sms_notification').setValue(0);
      this.extensionForm.get('admin').setValue(0);
      if (this.isCustomPrompt) this.extensionForm.get('ringtone').setValue(0);
      this.extensionForm.get('dnd').setValue(0);
      this.extensionForm.get('click_to_call').setValue(0);
      this.extensionForm.get('call_waiting').setValue(0);
      this.extensionForm.get('call_persistent').setValue(0);

      if (this.isRoaming) this.extensionForm.get('roaming').setValue(0);
      if (this.isFindMeFollowMe) this.extensionForm.get('find_me_follow_me').setValue(0);
      if (this.isStickyAgent) this.extensionForm.get('sticky_agent').setValue(0);
      if(this.isWhatsapp) this.extensionForm.get('whatsapp').setValue(0);
      // if (this.isClick2Call) this.extensionForm.get('click_to_call').clearValidators();
      // if (this.isClick2Call) this.extensionForm.get('c2c_value').clearValidators();
      // this.extensionForm.get('dnd').setValue(0);

    }
    // if(isCheck){
    //   this.extensionForm.get('isCheckAllFeatureSettings').setValue(false);
    // }
  }

  getCountryCode(event) {
    // let country_id = event.target.value;
    if (event) {
      let country_id = event;
      this.commonService.getCountryById(country_id).subscribe(data => {
        this.countryCode = '+' + data.response[0].phonecode;
      }, err => {
        this.error = err.message;
      });
    }
  }

  public manageSelectAllBtn() {
    let outbound = this.isOutbound ? this.extensionForm.get('outbound').value : true;
    let recording = this.isRecording ? this.extensionForm.get('recording').value : true;
    let call_forward = this.isForward ? this.extensionForm.get('call_forward').value : true;
    let speed_dial = this.isSpeedDial ? this.extensionForm.get('speed_dial').value : true;
    let call_transfer = this.isCallTransfer ? this.extensionForm.get('call_transfer').value : true;
    let misscall_notify = this.isMissCallAlert ? this.extensionForm.get('misscall_notify').value : true;
    let roaming = this.isRoaming ? this.extensionForm.get('roaming').value : true;
    let bal_restriction = this.extensionForm.get('bal_restriction').value;
    let outbound_sms_notification = this.isShowSMS ? this.extensionForm.get('outbound_sms_notification').value : true;
    let sticky_agent = this.isStickyAgent ? this.extensionForm.get('sticky_agent').value : true;
    // let c_2_c = this.isClick2Call ? this.extensionForm.get('click_to_call').value : true;
    let multiple_reg = this.extensionForm.get('multiple_reg').value;
    let admin = this.extensionForm.get('admin').value;
    let clickTocall = this.extensionForm.get('click_to_call').value;
    let whatsapp = this.extensionForm.get('whatsapp').value;

    let find_me_follow_me = this.isFindMeFollowMe ? this.extensionForm.get('find_me_follow_me').value : true;
    let ringtone = this.isCustomPrompt ? this.extensionForm.get('ringtone').value : true;
    let d_n_d = this.doNotDisturb ? this.extensionForm.get('dnd').value : true;
    

    // let voice_mail = this.extensionForm.get('voice_mail').value;
    if (outbound && recording && call_forward && speed_dial && call_transfer && misscall_notify && roaming && bal_restriction && outbound_sms_notification && multiple_reg && admin && ringtone && find_me_follow_me && sticky_agent && clickTocall && whatsapp) {
      this.extensionForm.get('isCheckAllFeatureSettings').setValue(true);
    } else {
      this.extensionForm.get('isCheckAllFeatureSettings').setValue(false);
    }

    if (outbound || recording || call_forward || speed_dial || call_transfer || misscall_notify || roaming || bal_restriction || outbound_sms_notification || multiple_reg || admin || ringtone || find_me_follow_me || sticky_agent  || d_n_d || whatsapp) {
      this.extensionForm.get('plug_in').setValue(false);
    } 
  }

  public removeExistExtension(allExtension){
    let allRangeExtensionList = allExtension;
    let unique1 = allRangeExtensionList.filter((o) => this.alreadtExistExrension.indexOf(o) === -1);
    let unique2 = this.alreadtExistExrension.filter((o) => allRangeExtensionList.indexOf(o) === -1);
    const unique = unique1.concat(unique2);
    return unique;
  }

  cancleForm() {
    this.router.navigateByUrl('user/extension/view');
  }

  ngOnDestroy(): void {
    // this.__extensionFromChangeSubscription.unsubscribe();
    // this.__extensionToChangeSubscription.unsubscribe();
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
  get UserTypeAccountManager() {
    return UserTypeConstants.ACCOUNT_MANAGER;
  }
  get UserTypeSupportManager() {
    return UserTypeConstants.SUPPORT_MANAGER;
  }

  // showPlayPosition(event){
  //   let playPosition = event.checked;
  //   if (playPosition == true) {
  //     this.extensionForm.controls.c2c_value.enable();
  //     this.extensionForm.controls.c2c_value.setValidators([Validators.required]);
  //     this.isPlayPosition = true;
  //   } else {
  //     this.extensionForm.controls.c2c_value.disable();
  //     this.isPlayPosition = false;
  //   }

  // }

}