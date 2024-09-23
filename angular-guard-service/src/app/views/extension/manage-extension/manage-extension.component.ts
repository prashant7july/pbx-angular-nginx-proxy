import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Errors, CommonService, GatewayService, formError, alpha__numeric_only, PASSWORD_RegEx, ExtensionService, rangeError, errorMessage, duplicateExtension, codecError, checkExtensionLimit, invalidForm, emailExist, checkExtUsername, Number_RegEx, invalidPhone, profileUpdated, extensionUpdate, plus_number_RegEx, EmitterService } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserTypeConstants } from 'src/app/core/constants';
import { ProfileService } from '../../profile/profile.service';
import { CallplanService } from '../../call-plan/callplan.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../user/user.service';
import { FileSelectDirective } from 'ng2-file-upload/file-upload/file-select.directive'
import { Location } from '@angular/common';
import { CustomerDialoutDialog } from '../../customer-dialoutRule/customer-dialout-rule/customer-dialout-rule.component';
import { CustomerDialoutServiceService } from '../../customer-dialoutRule/customer-dialout-service.service';
// import{FileUploadModule } from 'ng2-file-upload'
export let source: any = [];
export let target: any = [];
const URL = environment.api_url + 'profile';
export let imagePath: any;
let _validFileExtensions = [".png", ".jpg", ".jpeg"];

@Component({
  selector: 'app-manage-extension',
  templateUrl: './manage-extension.component.html',
  styleUrls: ['./manage-extension.component.css']
})
export class ManageExtensionComponent implements OnInit {
  // userData: any = {};
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
  VMPwd = "";
  ext_from = "";
  ext_to = "";
  extensionId = "";
  extensionData: any = {};
  extType = "";
  isVoicemail: boolean;
  isPlayPosition: boolean = false;
  readonlyy:boolean = false;
  readonly:boolean = false;
  isOutbound = "";
  isRecording = "";
  iscallpersistent:any;
  isRoaming = "";
  isForward = "";
  isClickToCall = "";
  isAdmin = "";
  isSpeedDial = "";
  isBlackList = "";
  isCallTransfer = "";
  isClick2Call: boolean;
  PlugIn = "";
  featureDiv: boolean;
  emailId = "";
  userRole = "6";
  userName = "";
  hide = true;
  hide1 = true;
  hide2 = true;
  actionList = "";
  pkg_minute_balance: number;
  minute_balance: number;
  assigned_minute_balance: number = 0;
  billing_type = "";
  isWithOutPool = false;
  isWithPool = false;
  billing_name = '';
  featureId = "";
  previous_bal = "";
  clicktocall: any;
  iscallwaiting:any;
  plugin_tog: any;
  isCheckAllFeatureSetting = "";
  isShowAPIToken: boolean;
  isPlugIn: boolean = false;
  hideToken = false;
  countryList = [];
  filter: any;
  extensionList = [];
  intercomList: any = [];
  filterExt: any;
  isMissCallAlert: any;
  isStickyAgent: any;
  intercomDialout: any;
  isShowSMS = "";
  isMCA = false;
  isBundlePlan = false;
  isOutboundCall = false;
  isIntercom = false;
  countryCode = "";
  isImg: boolean = false;
  pageloader: boolean;
  imageFile = "";
  imagePath1 = "";
  // countryCode = "";
  selectAll:boolean = false;
  countryID: any = {};
  coustomerId;
  isFindMeFollowMe = "";
  isCustomPrompt = "";
  isWhatsapp: any;
  doNotDisturb = "";
  extnumber:any;
  miss: boolean =false;
  notificationmail:any;
  extensionLengthLimit: number = 4;
  email_available_from_notification: string = "";
  disableEmail: any;
  public fields: Object = { text: 'name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public placeholder2: string = 'Select Country';
  public uploader: FileUploader = new FileUploader({
    url: URL, itemAlias: 'profileImg',
    allowedFileType: ['image'], method: 'post',
    maxFileSize: 1024 * 1024 * 1
  });
  checkdata: boolean;
  constructor(
    private location: Location,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private gatewayService: GatewayService,
    private extensionService: ExtensionService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private callplanService: CallplanService,
    private emitter: EmitterService,
    private customerDialoutService : CustomerDialoutServiceService
  ) {
    this.extensionForm = this.fb.group({
      'plan': [""],
      'eType': [""],
      'extension_number': ['', Validators.required],
      'ext_name': ['', Validators.required],
      'web_pass': ['', [Validators.required, Validators.pattern(PASSWORD_RegEx)]],
      'email': ['', [Validators.required, Validators.email]],
      'misscall_notify': [''],
      'bal_restriction': [''],
      // 'caller_id_name': ['', Validators.pattern(Name_RegEx)],
      'caller_id_name': ['', Validators.required],
      'sip_pass': ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(alpha__numeric_only)]],
      'ring_time_out': ['', [Validators.min(5), Validators.max(60)]],
      'dial_time_out': ['', [Validators.min(5), Validators.max(60)]],
      // 'external_caller_id': ['', Validators.pattern(Name_RegEx)],
      'external_caller_id': [''],
      'dtmf_type': ['0'],
      'header_type': ['0'],
      'callerID_headervalue': ['0'],
      'multiple_reg': [''],
      'dial_out': [''],
      'voice_mail': [''],
      'voice_mail_pwd': [''],
      'c2c_value': [''],
      'outbound': [''],
      'recording': [''],
      'call_forward': [''],
      'speed_dial': [''],
      'black_list': ['1'], // by default blacklist funtionality will be enable so its default value is 1.
      'call_transfer': [''],
      'add_minute_bal': [0],
      'dnd': [''],
      'isCheckAllFeatureSettings': [''],
      'apiToken': [''],
      'roaming': [''],
      'token': [''],
      'dial_prefix': [''],
      'mobile': ['', [Validators.pattern(Number_RegEx)]],
      'outbound_sms_notification': [''],
      'admin': [''],
      'find_me_follow_me': [''],
      // 'call_min_details' : [''],
      'ringtone': [''],
      'sticky_agent': [''],
      'click_to_call': [''],
      'plug_in': [''],
      'call_waiting':[''],
      'call_persistent':[''],
      'is_callerId_from_extNumber': [''],
      'is_email_from_notificationemail': [''],
      'profile_img': [''],
      'intercom_calling':[''],
      'whatsapp': [''],
      'intercom_dialout': [''],
    });
    this.coustomerId = localStorage.getItem('id');
  }

  get ext_name() { return this.extensionForm.get('ext_name'); }
  get voice_mail_pwd() { return this.extensionForm.get('voice_mail_pwd'); }
  get caller_id_name() { return this.extensionForm.get('caller_id_name'); }
  get sip_pass() { return this.extensionForm.get('sip_pass'); }
  get ring_time_out() { return this.extensionForm.get('ring_time_out'); }
  get dial_time_out() { return this.extensionForm.get('dial_time_out'); }
  get plan() { return this.extensionForm.get('plan'); }
  get extension_number() { return this.extensionForm.get('extension_number'); }
  get web_pass() { return this.extensionForm.get('web_pass'); }
  get email() { return this.extensionForm.get('email'); }
  get mobile() { return this.extensionForm.get('mobile'); }
  get callerID_headervalue() { return this.extensionForm.get('callerID_headervalue'); }
  //get external_caller_id() { return this.extensionForm.get('external_caller_id'); }
  ngOnInit() {
    this.userRole = localStorage.getItem('type');
    this.extensionId = this.route.snapshot.queryParams.id;
    // let user_id = localStorage.getItem("id");
    let user_id = this.route.snapshot.queryParams.customer_id;    
    let customer_id = this.route.snapshot.queryParams.cid == undefined ? user_id : this.route.snapshot.queryParams.cid;

    this.route.queryParams.subscribe(params => {
      if (params['intercomList']) {
        this.intercomList = JSON.parse(params['intercomList']);
      }
      console.log(this.intercomList); 
    });


    

    //only to view feature or list
    this.actionList = this.route.snapshot.queryParams.action;
    this.callerIdHeaderValue = "Same as Caller Id";
    this.isVMpwd = true;
    this.isExtNumber = true;
    let codecArr: any = [];
    this.targetCodec = [];
    target = [];//initialize list 2;
    this.sourceCodec = [];
    source = [];//initialize list 2;
    //this.extensionForm.controls.extension_from.disable(); // when not range
    //this.extensionForm.controls.extension_to.disable(); // when not range    

    if (this.userRole == '1') {
      this.commonService.getCustomerCountry(this.coustomerId).subscribe(data => {
        this.countryID = data.response[0] ? data.response[0].id : 99;
        // this.countryCode = '+' + data.response[0].phonecode
      }, err => {
        this.error = err.message;
      });
    } else {
      this.countryID = 99;    
    }

    this.callplanService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filter = this.countryList.slice();
    });

    // this.customerDialoutService.getIntercomByCustomer(localStorage.getItem('id')).subscribe(data=>{
      
    //   this.intercomList = data;
    //   this.intercomList.unshift({name:'All', id: 0})
    //   console.log(this.intercomList,"intercom list0");


    // })

    this.extensionService.getExtensionById(this.extensionId).subscribe(data => {
      this.intercomDialout =  Number(data['response'][0].intercom_dialout);
      this.extnumber = data['response'][0]['is_callerId_from_extNumber'];
      this.notificationmail = data['response'][0]['is_email_from_notificationemail'];
      if(data['response'][0]['is_callerId_from_extNumber'] == 1 || data['response'][0]['is_callerId_from_extNumber'] == true){
        this.readonlyy = true;
      }
      if(data['response'][0]['is_email_from_notificationemail'] == 1 || data['response'][0]['is_email_from_notificationemail'] == true){
        this.readonly = true;
      }

      
        const select_all = data.all_feature.map(element =>{return Number(element)});
      if(!select_all.includes(0)){
        this.selectAll = true;
          this.extensionForm.get('isCheckAllFeatureSettings').setValue(this.selectAll);
          this.extensionForm.get('isCheckAllFeatureSettings').updateValueAndValidity();
      }
      this.extensionData = data.response[0];      
      this.userName = this.extensionData.username
      this.emailId = this.extensionData.email;
      this.previous_bal = this.extensionData.total_min_bal;
      this.extensionData.roaming = Number(this.extensionData.roaming);
      this.extensionData.admin = Number(this.extensionData.admin);
      this.extensionData.api_token = Number(this.extensionData.api_token);
      this.extensionData.dial_prefix = this.extensionData.dial_prefix ? Number(this.extensionData.dial_prefix) : this.countryID;
      this.extensionData.outbound_sms_notification = Number(this.extensionData.outbound_sms_notification);
      this.extensionData.find_me_follow_me = Number(this.extensionData.find_me_follow_me);
      this.clicktocall = parseInt(this.extensionData.click_to_call);   
      this.iscallwaiting = parseInt(this.extensionData.call_waiting);      
      this.iscallpersistent = parseInt(this.extensionData.call_persistent);      
      // setTimeout(() => {
      //   this.isClick2Call = this.extensionData.click_to_call;
      // }, 500);
      // this.isWhatsapp = Number(this.extensionData.whatsapp);
      // this.PlugIn = this.extensionData.plug_in;
      this.plugin_tog = Number(this.extensionData.plug_in);
      this.extensionForm.get('intercom_calling').setValue(Number(this.extensionData.intercom_calling))      
      this.extensionForm.get('whatsapp').setValue(Number(this.extensionData.whatsapp));
      
      
      if(this.plugin_tog){
        this.extensionForm.get('isCheckAllFeatureSettings').disable();
        this.extensionForm.get('outbound').disable();
        this.extensionForm.get('recording').disable();
        this.extensionForm.get('call_forward').disable();
        this.extensionForm.get('speed_dial').disable();
        this.extensionForm.get('call_transfer').disable();
        this.extensionForm.get('bal_restriction').disable();
        this.extensionForm.get('multiple_reg').disable();
        this.extensionForm.get('misscall_notify').disable();
        this.extensionForm.get('outbound_sms_notification').disable();
        this.extensionForm.get('admin').disable();
        this.extensionForm.get('ringtone').disable();
        this.extensionForm.get('dnd').disable();
        this.extensionForm.get('click_to_call').disable();
        this.extensionForm.get('call_waiting').disable();
        this.extensionForm.get('roaming').disable();
        this.extensionForm.get('find_me_follow_me').disable();
        this.extensionForm.get('sticky_agent').disable();
        this.miss = true;
      }else{
        this.miss = false;
      }

      this.countryCode = this.extensionData.phonecode;
      // if(this.extensionData.caller_id_name){
      //   this.readonlyy = true
      // }else{
      //   this.readonlyy = false
      // }

      if (this.extensionData.voicemail == '1') {
        this.isVMpwd = true;
        this.extensionForm.controls.voice_mail_pwd.enable();
        this.extensionForm.controls.voice_mail_pwd.setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(8)]);
        this.extensionForm.controls.voice_mail_pwd.updateValueAndValidity();
      } else {
        this.isVMpwd = false;
        this.extensionForm.controls.voice_mail_pwd.disable();
        this.extensionForm.controls.voice_mail_pwd.updateValueAndValidity();
      }



      if (this.isClick2Call == true) {
        this.extensionForm.controls.c2c_value.enable();
        this.isPlayPosition = true;
      } else {
        this.extensionForm.controls.c2c_value.disable();
        this.isPlayPosition = false;
      }
      // this.isOutbound = this.extensionData.outbound;     
      // this.isRecording = this.extensionData.recording;
      // if (this.isOutbound == '1' || this.isRecording == '1') {
      //   this.featureDiv = true;
      // } else {
      //   this.featureDiv = false;
      // }

      codecArr = this.extensionData.codec == '' ? '' : this.extensionData.codec.split(',');
      for (let i = 0; i < codecArr.length; i++) {
        target.push({ id: i + 1, codec: codecArr[i] });
      }
      this.targetCodec = target;
      //sourceCodec//initialize list 1;
      this.gatewayService.getCodecInfo().subscribe(data => {
        source = data.response;

        for (let i = 0; i < target.length; i++) {
          for (let j = 0; j < source.length; j++) {
            if (target[i].codec == source[j].codec) {
              source.splice(j, 1);
            }
          }
        }
        this.sourceCodec = source;
        this.manageSelectAllBtn();
      });
    }, err => {
      this.errors = err.message;
    });
    //-------------------------------------//    

    this.extensionService.getDidListById(customer_id).subscribe(data => {
      
      this.extensionList = data.response;
      this.filterExt = this.extensionList.slice();
      this.filterExt.unshift({id: '0' , did: 'Select'})
      this.extensionList.unshift({id: '0' , did: 'Select'})

    });
    //----------------------------------------------------


    // //sourceCodec//initialize list 1;
    // this.gatewayService.getCodecInfo().subscribe(data => {
    //   source = data.response;

    //   for (let i = 0; i < target.length; i++) {
    //     for (let j = 0; j < source.length; j++) {
    //       if (target[i].codec == source[j].codec) {
    //         source.splice(j, 1);
    //       }
    //     }
    //   }
    //   this.sourceCodec = source;
    // });

    //get assined extension limit---------//
    this.extensionService.getMyExtensionLimit(user_id, localStorage.getItem('type')).subscribe(data => {
      this.allowExtensionLimit = data.ext.extension_limit;
      if (data.ext.voicemail == '1') {
        this.isVoicemail = true;
      } else {
        this.isVoicemail = false;
      }
      this.isOutbound = data.ext.outbound_call;
      this.isRecording = data.ext.recording;
      this.isForward = data.ext.forward;
      this.isClickToCall = data.ext.click_to_call
      this.isSpeedDial = data.ext.speed_dial;
      this.isBlackList = data.ext.black_list;
      this.isCallTransfer = data.ext.call_transfer;
      this.isMissCallAlert = Number(data.ext.miss_call_alert);
      this.isStickyAgent = Number(data.ext.sticky_agent);
      this.isShowSMS = data.ext.sms;
      this.isRoaming = data.ext.roaming;

      this.isFindMeFollowMe = data.ext.find_me_follow_me;
      this.pkg_minute_balance = parseFloat(data.ext.minute_balance);
      this.billing_type = data.ext.billing_type;
      this.featureId = data.ext.feature_id;
      this.isCustomPrompt = data.ext.custom_prompt;
      this.isClick2Call = data.ext.click_to_call == 0 ? false: true;
      this.isWhatsapp = data.ext.whatsapp;

      if(this.isShowSMS == '1' && this.isMissCallAlert == '1'){
        this.isMCA = true;
      }else{
        this.isMCA = false;
      }

      this.isBundlePlan = data.ext.is_bundle_plan == '1' ? true : false;
      this.isOutboundCall = data.ext.outbound_call == '1' ? true : false;


      if(data.ext.plugin == "Y")
      {
       this.PlugIn="1"
      }
      else{
        this.PlugIn="0"
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

      if (this.isVoicemail == true) {
        this.extensionForm.controls.voice_mail_pwd.enable(); //when not range
        //  this.extensionForm.controls.voice_mail_pwd.setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(8)]);
        this.extensionForm.controls.voice_mail_pwd.updateValueAndValidity();
      } else {
        //  this.extensionForm.controls.voice_mail_pwd.setValue('');
        this.extensionForm.controls.voice_mail_pwd.disable();
      }

      if (this.isOutbound || this.isRecording || this.isForward || this.isSpeedDial || this.isBlackList || this.isCallTransfer || this.iscallwaiting || this.isWhatsapp) {
        this.featureDiv = true;
      } else {
        this.featureDiv = false;
      }

      // get user extension limit -----------//
      this.extensionService.getMyExtension(user_id).subscribe(data => {
        let minute = 0;
        this.totalUserExtension = data.response.length;
        for (let i = 0; i < this.totalUserExtension; i++) {
          minute = minute + (parseFloat(data.response[i].total_min_bal) - parseFloat(data.response[i].used_min));
        }
        this.minute_balance = this.pkg_minute_balance - minute;
      });
      //-------------------------------------//  
      let userId  = localStorage.getItem('cid') == 'undefined' ? localStorage.getItem('id') : localStorage.getItem('cid');
      this.profileService.getUserInfo('getUserInfo', Number(userId)).subscribe(data => {
        if (data) {
          let userData = data.response[0];   //api_token
          if(userData.intercom_calling == '1'){
            this.isIntercom = true;
          }else{
            this.isIntercom = false;
          }
          this.isShowAPIToken = userData['api_token'] == '1' ? true : false;
          this.email_available_from_notification = userData['notification_email'];          
          // if(userData['notification_email']){
          //   this.readonly = true;
          // }          
          this.isPlugIn = userData['plugin'] == 'Y' ? true : false;
          this.disableEmail = userData['notification_email'] == '' ? true : false
        }
      }, err => {
        this.errors = err.message;
      });

    });
    this.isExtNumber = true;

    // this.manageSelectAllBtn();
    //--------------------------uploader---------------//
    this.uploader.onAfterAddingFile = (file) => {
      this.isImg = true;
      file.withCredentials = false;
      this.uploadProfile();
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      imagePath = URL + item.file.name;
      var res = JSON.parse(response);
      this.imageFile = res["file"];
      this.imagePath1 = item.file.name;
    };
    this.uploader.onCompleteAll = () => {

      this.pageloader = false;
      // this.toastr.success('Success!', '', { timeOut: 2000 });

    }
    //-------------------------------------------------//
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

  uploadProfile() {

    this.uploader.uploadAll();
  }
  showVoiceMailPwd(event) {
    let voice_mail = event.checked;
    if (voice_mail == true) {
      this.extensionForm.controls.voice_mail_pwd.enable();
      this.extensionForm.controls.voice_mail_pwd.setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(8)]);
      this.extensionForm.controls.voice_mail_pwd.updateValueAndValidity();
      this.isVMpwd = true;
    } else {
      this.extensionForm.controls.voice_mail_pwd.setValue('');
      this.extensionForm.controls.voice_mail_pwd.disable();
      this.isVMpwd = false;
    }
  }
  goBack() {
    let user_id = this.route.snapshot.queryParams.customer_id;
    // this.router.navigate(['user/extension/view'],{queryParams: {user_id: user_id}});
    this.router.navigate(['extension/supportViewExtension'],{queryParams: {id: user_id}});
  }

  submitExtensionForm() {
    let codecValue: any = [];
    this.checkForm = this.findInvalidControls();
    if (this.extensionForm.valid) {
      this.submitted = true;
      const credentials = this.extensionForm.value;
      // credentials['token'] =  (new Date().getTime()).toString(36) + Math.floor(10000000 + Math.random() * 90000000); // random number
      // if (this.targetCodec.length > 0) {
      //   for (let i = 0; i < this.targetCodec.length; i++) {
      //     codecValue.push(this.targetCodec[i].codec);
      //   }
      credentials.codec = codecValue;
      credentials.id = this.extensionId;
      credentials.minute_balance = parseFloat(this.previous_bal) + parseFloat(credentials.add_minute_bal);

      //post data -------------//
      this.saveExtn(credentials);

      // if (credentials['is_email_from_notificationemail'] == true || credentials['is_email_from_notificationemail'] == '1') {
      // } else {
      //   this.extensionService.checkEmailValid(credentials['email']).subscribe(data => {
      //     if (data.email >= 1) {
      //       this.toastr.error('Error!', emailExist, { timeOut: 4000 })
      //       this.emailId = "";
      //       return;
      //     } else {
      //       this.saveExtn(credentials)
      //     }
      //   });
      // }

    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }

  }

  public saveExtn(credentials) {    
    this.extensionService.createExtension('updateExtension', credentials)
      .subscribe(data => {
        if (this.billing_type == '3') {
          let remainMinutBal = this.minute_balance - parseFloat(credentials.add_minute_bal);
          // this.extensionService.updatePackageMinuteBal(remainMinutBal, this.featureId).subscribe(data => {
          //   this.minute_balance = remainMinutBal;
          // });
          this.minute_balance = remainMinutBal;
        }
        this.toastr.success('Success!', extensionUpdate, { timeOut: 4000 });
        if (this.userRole == '1' && this.actionList == 'viewList') {
          // this.router.navigateByUrl('extension/view');
          this.router.navigateByUrl('user/extension/view');
        } else if (this.userRole == '1' && this.actionList == 'viewFeature') {
          // this.router.navigateByUrl('extension/viewFeatures');
          this.router.navigateByUrl('user/extension/viewFeatures');
        } else if (this.userRole == '6') {
          localStorage.setItem('uname', credentials.ext_name);
          let a = new Promise((resolve, reject) => { 
            resolve(this.router.navigateByUrl('dashboard/extensionDashboard'))
           })
           a.then(response => {
          window.location.reload();
           })
          
        }
      }, err => {
        this.errors = err;
        this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
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

  checkRangeMaxExtLimit(e) {
    const credentials = this.extensionForm.value;
    let to = e.value;
    let from = credentials.extension_from;
    let range = parseInt(to) - parseInt(from);
    let remianExtension = parseInt(this.allowExtensionLimit) - parseInt(this.totalUserExtension);
    if (remianExtension < range) {
      this.toastr.error('Error!', checkExtensionLimit, { timeOut: 4000 });
      e.value = "";
      return false;
    } else {
      this.checkRangeExt();
    }
  }

  checkRangeExt() {
    let from: any;
    let user_id = localStorage.getItem("id");
    const credentials = this.extensionForm.value;
    let to = user_id + '' + credentials.extension_to;
    from = user_id + '' + credentials.extension_from;

    if (to > from) {
      while (from <= to) {
        this.extensionService.checkValidExt(from, user_id).subscribe(data => {
          if (data.ext_id >= 1) {
            this.toastr.error('Error!', duplicateExtension, { timeOut: 4000 });
            this.ext_from = "";
            this.ext_to = "";
            return false;
          }
        }, err => {
          this.error = err.message;
          this.toastr.error('Error!', err.message, { timeOut: 2000 });
        });
        from++;
      }
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

  cancleForm() {
    if (this.userRole == '1') {
      this.router.navigateByUrl('user/extension/view');
    } else if (this.userRole == '6') {
      this.router.navigateByUrl('dashboard/extensionDashboard');
    } else {
      this.router.navigateByUrl('extension/supportViewExtension');
    }
  }

  checkMinuteBal(keyword) {
    let mykeyword = keyword.target.value;
    if (this.minute_balance < parseFloat(mykeyword)) {
      this.toastr.error('Error!', "You have insufficient balance.", { timeOut: 4000 });
      keyword.target.value = "0";
      return false;
    }
  }

  public checkadmin(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }
    else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin1(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin2(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin3(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin4(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin5(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin6(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin7(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin8(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin9(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin10(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin11(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }
  public checkadmin12(checkadmin:boolean){
    if(checkadmin){
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(1);
    }else{
    this.extensionForm.get('isCheckAllFeatureSettings').setValue(0);

    }
  }

  public checkAllFeatureSettings(isCheck: boolean) {
    if (isCheck) {
      this.extensionData.outbound = 1;
      if (this.isRecording) this.extensionData.recording = 1;
      if (this.iscallwaiting) this.extensionData.call_waiting = 1;
      if (this.isWhatsapp) this.extensionData.whatsapp = 1;
      this.extensionData.forward = 1;
      // this.extensionData.click_to_call = 1;
      this.extensionData.speed_dial = 1;
      this.extensionData.call_transfer = 1;
      this.extensionData.forward = 1;
      // this.extensionData.click_to_call = 1;
      this.extensionData.balance_restriction = 1;
      this.extensionData.multiple_registration = 1;
      this.extensionData.send_misscall_notification = 1;
      this.extensionData.outbound_sms_notification = 1;
      this.extensionForm.get('admin').setValue(1);
      this.extensionForm.get('click_to_call').setValue(1);  
      this.extensionForm.get('call_waiting').setValue(1);
      this.extensionForm.get('call_persistent').setValue(0);
      // this.extensionForm.get('click_to_call').setValue(1);

      if (this.isCustomPrompt) this.extensionData.ringtone = 1;
      if (this.isRoaming) this.extensionData.roaming = 1;
      if (this.isFindMeFollowMe) this.extensionData.find_me_follow_me = 1;
      if (this.isStickyAgent) this.extensionData.sticky_agent = 1;
      this.extensionForm.get('plug_in').setValue(0);

      // if(this.isClick2Call) this.extensionData.click_to_call = 0;

    } else {
      this.extensionData.outbound = 0;
      if (this.isRecording) this.extensionData.recording = 0;
      if (this.iscallwaiting) this.extensionData.call_waiting = 0;
      if (this.isWhatsapp) this.extensionData.whatsapp = 0;
      this.extensionData.forward = 0;
      // this.extensionData.click_to_call = 0;
      this.extensionForm.get('click_to_call').setValue(0);
      this.extensionForm.get('call_waiting').setValue(0);
      this.extensionForm.get('call_persistent').setValue(0);


      this.extensionData.speed_dial = 0;
      this.extensionData.call_transfer = 0;
      this.extensionData.forward = 0;
      // this.extensionData.click_to_call = 0;
      this.extensionData.balance_restriction = 0;
      this.extensionData.multiple_registration = 0;
      this.extensionData.send_misscall_notification = 0;
      this.extensionData.outbound_sms_notification = 0;
      this.extensionForm.get('admin').setValue(0);

      if (this.isCustomPrompt) this.extensionData.ringtone = 0;
      if (this.isRoaming) this.extensionData.roaming = 0;
      if (this.isFindMeFollowMe) this.extensionData.find_me_follow_me = 0;
      if (this.isStickyAgent) this.extensionData.sticky_agent = 0;
      // if(this.isClick2Call) this.extensionData.click_to_call = 0;

    }
  }

  public plugInCheck(isCheck: boolean) {
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
      if (this.iscallwaiting) this.extensionForm.get('call_waiting').setValue(0);
      if (this.isWhatsapp) this.extensionData.get('whatsapp').setValue(0);
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


      if (this.isRoaming) this.extensionForm.get('roaming').setValue(0);
      if (this.isFindMeFollowMe) this.extensionForm.get('find_me_follow_me').setValue(0);
      if (this.isStickyAgent) this.extensionForm.get('sticky_agent').setValue(0);
      // if (this.isClick2Call) this.extensionForm.get('click_to_call').clearValidators();
      // if (this.isClick2Call) this.extensionForm.get('c2c_value').clearValidators();
      // this.extensionForm.get('dnd').setValue(0);

    }
    // if(isCheck){
    //   this.extensionForm.get('isCheckAllFeatureSettings').setValue(false);
    // }
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
    let call_waiting = this.extensionForm.get('call_waiting').value;

    let find_me_follow_me = this.isFindMeFollowMe ? this.extensionForm.get('find_me_follow_me').value : true;
    let ringtone = this.isCustomPrompt ? this.extensionForm.get('ringtone').value : true;
    let d_n_d = this.doNotDisturb ? this.extensionForm.get('dnd').value : true;
    let whatsapp = this.isWhatsapp ? this.extensionForm.get('whatsapp').value : true;

    // let voice_mail = this.extensionForm.get('voice_mail').value;
    if (outbound && recording && call_forward && speed_dial && call_transfer && misscall_notify && roaming && bal_restriction && outbound_sms_notification && multiple_reg && admin && ringtone && find_me_follow_me && sticky_agent && clickTocall && call_waiting && whatsapp ) {
      this.extensionForm.get('isCheckAllFeatureSettings').setValue(true);
    } else {
      this.extensionForm.get('isCheckAllFeatureSettings').setValue(false);
    }

    if (outbound || recording || call_forward || speed_dial || call_transfer || misscall_notify || roaming || bal_restriction || outbound_sms_notification || multiple_reg || admin || ringtone || find_me_follow_me || sticky_agent  || d_n_d || call_waiting || whatsapp) {
      this.extensionForm.get('plug_in').setValue(false);
    } 
  }

  // public manageSelectAllBtn() {
  //   let outbound = this.extensionForm.get('outbound').value;
  //   let recording = this.extensionForm.get('recording').value
  //   let call_forward = this.extensionForm.get('call_forward').value;
  //   let speed_dial = this.extensionForm.get('speed_dial').value;
  //   let call_transfer = this.extensionForm.get('call_transfer').value;
  //   let misscall_notify = this.extensionForm.get('misscall_notify').value;
  //   let roaming = this.extensionForm.get('roaming').value;
  //   let bal_restriction = this.extensionForm.get('bal_restriction').value;
  //   let outbound_sms_notification = this.extensionForm.get('outbound_sms_notification').value;
  //   let multiple_reg = this.extensionForm.get('multiple_reg').value;
  //   let admin = this.extensionForm.get('admin').value;
  //   // let find_me_follow_me = this.extensionForm.get('find_me_follow_me').value;
  //   // let ringtone = this.extensionForm.get('ringtone').value;
  //   // let voice_mail = this.extensionForm.get('voice_mail').value;

  //   let sticky_agent = this.isStickyAgent ? this.extensionForm.get('sticky_agent').value : true;
  //   let find_me_follow_me = this.isFindMeFollowMe ? this.extensionForm.get('find_me_follow_me').value : true;
  //   let ringtone = this.isCustomPrompt ? this.extensionForm.get('ringtone').value : true;
  //   let d_n_d = this.doNotDisturb ? this.extensionForm.get('dnd').value : true;



  //   if (outbound && recording && call_forward && speed_dial && call_transfer && misscall_notify && roaming && bal_restriction && outbound_sms_notification && multiple_reg && admin && ringtone && find_me_follow_me && sticky_agent) {
  //     // this.extensionForm.get('isCheckAllFeatureSettings').setValue(this.selectAll);
  //     this.extensionForm.get('isCheckAllFeatureSettings').setValue(true);

  //   } else {
  //     // this.extensionForm.get('isCheckAllFeatureSettings').setValue(this.selectAll);
  //     this.extensionForm.get('isCheckAllFeatureSettings').setValue(false);

  //   }

  //   if (outbound || recording || call_forward || speed_dial || call_transfer || misscall_notify || roaming || bal_restriction || outbound_sms_notification || multiple_reg || admin || ringtone || find_me_follow_me || sticky_agent || d_n_d) {
  //     this.extensionForm.get('plug_in').setValue(false);
  //     // this.extensionForm.get('plug_in').setValue(this.plugin_tog);
  //   }
  //   this.findInvalidControls();
  // }
  


  setCallerIdName(event) {
    let action = event.checked;
    if (action == true) {
      this.readonlyy = true;
      let ext_number = (this.extensionForm.controls.extension_number.value).toString();
      if (ext_number) this.extensionForm.controls.caller_id_name.setValue((this.extensionForm.controls.extension_number.value).toString()); this.extensionForm.controls.caller_id_name.updateValueAndValidity();
    } else {
      this.readonlyy = false;
      this.extensionForm.controls.caller_id_name.setValue('')
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
  Validate(event: any) {
    // const oInput = fileEvent.target.files[0];
    const reader = new FileReader();
    const [file] = event.target.files;

    let sFileName = file.name;
    let blnValid = false;
    for (let j = 0; j < _validFileExtensions.length; j++) {
      let sCurExtension = _validFileExtensions[j];
      if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
        blnValid = true;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.extensionData.profile_img = reader.result as string;
        }
        break;
      }
    }
    if (!blnValid) {
      this.toastr.error('Error!', "Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "), { timeOut: 4000 });
      //alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
      event.srcElement.value = null;
      return false;
    }
    this.isImg = true;
  }

  ImgUpload() {
    var user_id = localStorage.getItem("id");
    var role = localStorage.getItem('type');
    var role = localStorage.getItem('type');
    var role = localStorage.getItem('type');
    var role = localStorage.getItem('type');
    var role = localStorage.getItem('type');

    let credential = {};
    credential['user_id'] = user_id;
    credential['user_id'] = user_id;
    credential['user_id'] = user_id;
    credential['user_id'] = user_id;
    credential['user_id'] = user_id;
    if (this.isImg == true) {
      credential['profile_img'] = "assets/uploads/" + this.imageFile;
    } else {
      credential['profile_img'] = "assets/uploads/Profile-Image.png";
    }
    localStorage.setItem("userImg", credential['profile_img']);

    // ----------Api for profileUpdate----------- //
    this.extensionService.profileupdate(role, credential)
      .subscribe(data => {
        // this.toastr.success('success!', imageUpload, { timeOut: 2000});
      });
  }

  submitUserForm() {
    if (this.isImg == true) {
      this.ImgUpload();
      this.emitter.updateImage();
    }
    // this.checkForm = this.findInvalidControls();
    // this.checkForm = this.checkForm[0] == 'company_phone'|| this.checkForm[0] == 'mobile' ? invalidPhone : '' 
    if (this.extensionForm.valid) {
      this.submitted = true;
      var user_id = localStorage.getItem("id");
      const credentials = this.extensionForm.value;
      credentials.user_id = user_id;
      // if(this.isImg==true){
      //   credentials.profile_img = "assets/uploads/"+this.imageFile;
      // }else{
      //   credentials.profile_img = "assets/uploads/Profile-Image.png";
      // }      
      // localStorage.setItem("userImg", credentials.profile_img);
      credentials.id = user_id;
      this.userService.checkEmailValid(credentials).subscribe(data => {
        if (data['id'] != '') {
          this.toastr.error('Error!', emailExist, { timeOut: 4000 });
          return
        } else {

          this.extensionService.createExtension('updateUser', credentials)
            .subscribe(data => {

              // this.toastr.success('Success!', profileUpdated, { timeOut: 2000 });
              if (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2') {
                this.router.navigateByUrl('user/extension/view'); //navigate to admin dashboard
              } else if (localStorage.getItem('type') === '1') {
                this.router.navigateByUrl('user/extension/view');//navigate to customer dashboard
              } else if (localStorage.getItem('type') === '4') {
                this.router.navigateByUrl('user/extension/view');//navigate to internalUser dashboard
              } else if (localStorage.getItem('type') === '5') {
                this.router.navigateByUrl('user/extension/view');//navigate to internalUser dashboard
              }
            });
        }
      });
    } else {
      this.toastr.error('Error!', this.checkForm, { timeOut: 2000 });
    }

  }


  getCountryCode(event) {
    // let country_id = event.target.value;
    if (event && event != undefined) {
      let country_id = event;
      this.commonService.getCountryById(country_id).subscribe(data => {
        this.countryCode = '+' + data.response[0].phonecode;
      }, err => {
        this.error = err.message;
      });
    }
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
  //     this.isPlayPosition = true;
  //   } else {
  //     this.extensionForm.controls.c2c_value.disable();
  //     this.isPlayPosition = false;
  //   }

  // }
}
