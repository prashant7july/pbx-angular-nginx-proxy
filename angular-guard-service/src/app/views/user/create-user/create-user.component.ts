import { Component, OnInit } from '@angular/core';
import { Errors, CommonService, ProductService, GST_RegEx,UserName_RegEx, EMAIL_RegEx, Number_RegEx,Decimal_RegEx,invalidIP,duplicateIP,formError, mailSendError, checkCompany, userCreated, invalidFormError, checkUsername, emailExist, Name_RegEx, productExist, IP_RegEx, number_range_regex } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import { DidService } from '../../DID/did.service';
import { PlatformLocation } from '@angular/common';
import { PackageService } from '../../package/package.service';
import { CallplanService } from '../../call-plan/callplan.service';
import {ConfigService} from '../../config/config.service'
import { DateAdapter } from '@angular/material';



@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  isExternalUser = false;    
  isCredtiLimit = false;
  gatewayForm: FormGroup;
  selectedValue = [];
  serverForm: FormGroup;
  pbxPackageList = [];
  PBXPackageFilter:any;
  filterPackage:any;
  ocPackageList = [];
  OCPackageFilter:any;
  filterPackageTwo:any;
  error = '';
  errors: Errors = { errors: {} };
  userForm: FormGroup;
  submitted = false;
  textboxval = '';
  buttonDisabled = false;
  products = [];
  checkForm: any;
  internalUser :any;
  userName = "";
  countryList = "";
  countryspace = [];
  CountryFilter:any;
  filter:any;
  statesList = '';
  statespace = [];
  StateFilter:any;
  filters:any;
  countryCode = "+91";
  timeZone:any = [];
  TimeZoneFilter:any;
  filterTimeZone:any;
  emailContentData: any = {};
  customerName: any = {};
  companyName = "";
  emailId = "";
  goNextPesonalInfo = false;
  goNextCompanyInfo = true;
  credit_value = '0';
  isOCSelect = false;
  isPBXSelect = false;
  circleToggle = false;
  URL = "";
  isState = true;
  managerArr = [];
  AcountFilter:any;
  filterAccount:any;
  pbxSelectedValue = '';
  ocSelectedValue = '';
  circleList: any;
  CircleFilter:any;
  filterCircle:any;
  hide = true;
  holdDefaultbillingType : any =  "";
  dialoutGroupList : any = []; 
  threshold_balance_notification : any = []; 
  DialoutFilter:any;
  filterDial:any;
  Li = false;
  isLi =true;
  isCircle = true;   
  isIndia: boolean = true;
  minDate: Date;
  api_hits: boolean = false
  dunning: boolean = false
  public pbx:boolean = false;
  public outbound:boolean = false;

  public fields: Object = { text: 'name', value: 'id' };
  public fields1: Object = { text: 'state_name', value: 'id' };    
  public fields2: Object = { text: 'gmtzone', value: 'id' };
  public fields3: Object = { text: 'name', value: 'id' };
  public fields9: Object = { text: 'name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder: string = 'Select Country *';
  public placeholder1: string = 'Select State *';
  public placeholder2: string = 'Select Time Zone';    
  public placeholder3: string = 'Select Account Manager *';     
  public placeholder4: string = 'Dialout Group *';
  public placeholder5: string = 'Select Circle Name';     
  public placeholder6: string = 'Select PBX Package';
  public placeholder7: string = 'Select OC Package';
  private regex: RegExp = new RegExp(/^[0-9]{0,6}(?:[.][0-9]{0,2})?$/);  


  constructor(
    private didService: DidService,
    private productService: ProductService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,   
    private platformLocation: PlatformLocation,
    private callplanService: CallplanService,
    public ConfigService :ConfigService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.minDate = new Date(); // Set the maximum date to the current date
    this.minDate.setDate(this.minDate.getDate() + 1); // Set the maximum date to yesterday
    this.userForm = this.formBuilder.group({    
      'product_name': [""],
      'pbx_package_name': [""],
      'oc_package_name': [""],
      'f_name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'l_name': ['', Validators.pattern(Name_RegEx)],
      'email': ['', [Validators.required, Validators.pattern(EMAIL_RegEx)]],
      'username': ['', [Validators.required, Validators.minLength(8)]],
      'mobile': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'company': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'company_address': [''],
      'company_phone': ['', [Validators.minLength(10), Validators.maxLength(15), Validators.min(1000000000)]],
      'user_type': ["1"],
      'domain': [''],
      'status': ["1"],
      'account_manager': ["", [Validators.required]],
      'country': [99, [Validators.required]],
      'states': [179, [Validators.required]],
      'country_code': [''],
      'time_zone': [49, [Validators.required]],
      'billing_type': ["1", [Validators.required]],
      'balance': ['0.00', [Validators.required]],
      'credit_limit': ["0.00", [Validators.required]],
      'gst_number': ['', Validators.pattern(GST_RegEx)],
      'isCircle' : [],
      'isSetDate' : [],
      'circle' :[],
      'plugin' :[],
      'enterprise_directory' :[true],
      'intercom_calling' :[true],
      'apiToken' : [],
      'token': [''],
      'extension_length_limit' : [''],
      'monthly_international_threshold' : [''],
      'threshold' : [''],
      'invoice_day': [2],
      'advance_payment': ['0.00', [Validators.required]],
      'callback_url': [''],
      'dialout_group': ['', Validators.required],
      'is_notification_email' : [false],
      'notification_email' : [''],
      'ip': ['', [ Validators.pattern(IP_RegEx), Validators.maxLength(40)]],
      'cli_type':[''],
      'date' : [''],
      'request_hit':[0,[Validators.pattern(number_range_regex)]],
      'is_dunning':[],
      'pan_number' : '',
      'p_i_number' : '',
      'p_o_number' : '',
      'threshold_fifty' : '',
      'threshold_seventyFive' : '',
      'threshold_ninety' : '',
      // 'is_Li': [''],
      // 'Li':[''],
      // 'assigned_did': ['']
    });
    this.dateAdapter.setLocale('en-GB');
  }
  

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }
  private specialKeys: Array<string> = [
    'Backspace',
    'Tab',
    'End',
    'Home',
    'ArrowLeft',
    'ArrowRight',
    'Del',
    'Delete',
  ];
  numberOnly(event): boolean {
    let value = event.target.value;
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = value;
    const position = event.target.selectionStart;
    const next: string = [
      current.slice(0, position),
      event.key == 'Decimal' ? '.' : event.key,
      current.slice(position),
    ].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
  inputValue: string = '';
  isPatternMatched: boolean = false;
  isPatternMatchedd: boolean = false;
  isPatternMatcheddd: boolean = false;
  // checkPattern(event) {
  //   let value = event.target.value;
  //   const pattern = /^[1-9]\d{0,5}(\.\d{1,2})?$/; // Example pattern: up to 4 digits
  //   this.isPatternMatched = pattern.test(value);
  //   if(this.isPatternMatched  == false){  
  //     this.userForm.get('balance').reset();
  //   }
  // }
  // checkPatternn(event) {
  //   let value = event.target.value;
  //   const pattern = /^[0-9]{0,6}(?:[.][0-9]{0,2})?$/; // Example pattern: up to 4 digits
  //   this.isPatternMatchedd = pattern.test(value);
  //   if(this.isPatternMatchedd  == false){
  //     this.userForm.get('credit_limit').reset();
  //   }
  // }
  // checkPatternnn(event) {
  //   let value = event.target.value;
  //   const pattern = /^[0-9]{0,6}(?:[.][0-9]{0,2})?$/; // Example pattern: up to 4 digits
  //   this.isPatternMatcheddd = pattern.test(value);
  //   if(this.isPatternMatcheddd  == false){ 
  //      this.userForm.get('advance_payment').reset();
  //    }

  // }

  decimalNumber(event){
    let flags = 0;
    if(event.key == '.'){
    
      if(event.key){
        flags++;
      }
      if(flags > 2){
        this.userForm.get('balance').setValue('')
      }    
    }
    
  }
  resellerAccountID:any
  resellerAccountname:any;
  resellerAccounttype:any;
  accManager:any


  ngOnInit() {
    this.resellerAccountID = localStorage.getItem("id");
    this.resellerAccountname = localStorage.getItem("user_name");
    this.resellerAccounttype = localStorage.getItem("type");
    this.accManager ={ id : this.resellerAccountID,
      first_name: this.resellerAccountname,
      last_name: '',
      type : this.accManager,
      // role:4
    }

    this.URL = (this.platformLocation as any).location.origin;

    this.productService.getProductInfo().subscribe(data => {
      if(localStorage.getItem('ByReseller') == '3'){  
        this.restrictProduct(data.response);
      }else{
        this.selectedValue = data.response;
      }
    });

    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryspace = this.countryList = data.response;
      this.filter = this.CountryFilter = this.countryList.slice();
    });

    //get state list
    this.commonService.getIndiaStates().subscribe(data => {
      this.statespace = this.statesList = data.response;
      this.filters = this.StateFilter = this.statesList.slice();
    });
    
    //get active account manager
    if(this.resellerAccounttype == 3){                      
      this.managerArr.push(this.accManager)
    }else{
      this.userService.getInternalUser().subscribe(data => {
        this.internalUser = data.response;                
        
        for(let i = 0; i<this.internalUser.length; i++){
          if(this.internalUser[i]['role'] == '4'){
          this.managerArr.push(this.internalUser[i])
          // this.managerArr.push({ id: this.internalUser[i]['id'], name: this.internalUser[i]['first_name'] + ' ' + this.internalUser[i]['last_name'] })
          this.filterAccount = this.AcountFilter = this.managerArr.slice();
          }
        }
      });
    }

    //get time-zones
    this.commonService.getTimezone().subscribe(data => {
      this.timeZone = data.response;
      this.filterTimeZone = this.TimeZoneFilter = this.timeZone.slice();
    });
   //get dialout group/rule
    this.ConfigService.getDialOutGroupList({}).subscribe(pagedData =>{
      this.dialoutGroupList = pagedData;
      this.filterDial = this.DialoutFilter = this.dialoutGroupList.slice();
    });     

    this.getCircle();  //get circle list
    this.setToken();
    //get DID for india
      // this.didService.getDIDByCountry(99).subscribe(data => {
      //   this.indianDID = data[0].did;
      //   this.isIndia = true;
      //   this.indianDIDId.push(data[0].id+'-'+data[0].did+'-'+data[0].did_type);
      // });
      this.userForm.controls.Li.disable();

  }

  restrictProduct(value){
    this.userService.getResellerProduct(localStorage.getItem('id')).subscribe((data) => {      
      data[0].product.split(',').forEach(item => {
        value.forEach(item2 => {
          if(item == item2.id){
            this.selectedValue.push(item2)
          }
        })
      })       
    })
  }
  get company_phone() { return this.userForm.get('company_phone'); }
  get billing_type() { return this.userForm.get('billing_type'); }
  get balance() { return this.userForm.get('balance'); }
  get credit_limit() { return this.userForm.get('credit_limit'); }
  get advance_payment() { return this.userForm.get('advance_payment'); }
  get company() { return this.userForm.get('company'); }
  get time_zone() { return this.userForm.get('time_zone'); }
  get country() { return this.userForm.get('country'); }
  get f_name() { return this.userForm.get('f_name'); }
  get l_name() { return this.userForm.get('l_name'); }
  get email() { return this.userForm.get('email'); }
  get username() { return this.userForm.get('username'); }
  get mobile() { return this.userForm.get('mobile'); }
  get user_type() { return this.userForm.get('user_type'); }
  get account_manager() { return this.userForm.get('account_manager'); }
  get gst_number() { return this.userForm.get('gst_number'); }
  get states() { return this.userForm.get('states'); }
  get pbx_package_name() { return this.userForm.get('pbx_package_name'); }
  get oc_package_name() { return this.userForm.get('oc_package_name'); }
  get extension_length_limit() { return this.userForm.get('extension_length_limit'); }
  get notification_email() { return this.userForm.get('notification_email'); }
  get is_notification_email() { return this.userForm.get('is_notification_email'); }
  get plugin() { return this.userForm.get('plugin'); }
  get request_hit() { return this.userForm.get('request_hit'); }
  get date() { return this.userForm.get('date'); }
  static ssss :any;
  checkPattern(event) {
    let value = event.target.value;
    const pattern = /^(?:[1-9]\d{0,5}|0)(?:\.\d{1,2})?$|^0$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if(this.isPatternMatchedd  == false){
      let res= value.substr(value.length - 1);
      let array = value.split(".");
      if(res!=".") 
        {
          if(array[0].length>6)
          { 
            let result= array[0].substring(0,6)
            this.userForm.controls.balance.setValue(result);
          }
          else
          {
            let res=value.includes(".");
            if(res && array[1].length>2) 
            {
               let valu=array[0]+"."+ array[1].substring(0,2)
               this.userForm.controls.balance.setValue(valu);
            }
            else{
              let Res= value.substring(0, value.length - 1);
            this.userForm.controls.balance.setValue(Res);
            }
          }
          CreateUserComponent.ssss = value
        }
        else{
          if(array[0].length<6)
      { 
        this.userForm.controls.balance.setValue(value);
      }
          
        }
      //this.userForm.get('credit_limit').reset();
    }
    else{
      if (value) 
    {
      let res=value.includes(".");
      if(res== false && CreateUserComponent.ssss)
      {
        let Res=CreateUserComponent.ssss.includes(".");
        if(Res)
        {
          let array = CreateUserComponent.ssss.split(".");
          this.userForm.controls.balance.setValue(array[0]);
          value=array[0];
        }
      }
      CreateUserComponent.ssss = value
      // strValue was non-empty string, true, 42, Infinity, [], ...
     }
    }
   
  }
  checkPatternn(event) {
    let value = event.target.value;
    const pattern = /^(?:[1-9]\d{0,5}|0)(?:\.\d{1,2})?$|^0$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if(this.isPatternMatchedd  == false){
      let res= value.substr(value.length - 1);
      let array = value.split(".");
      if(res!=".") 
        {
          if(array[0].length>6)
          { 
            let result= array[0].substring(0,6)
            this.userForm.controls.advance_payment.setValue(result);
          }
          else
          {
            let res=value.includes(".");
            if(res && array[1].length>2) 
            {
               let valu=array[0]+"."+ array[1].substring(0,2)
               this.userForm.controls.advance_payment.setValue(valu);
            }
            else{
              let Res= value.substring(0, value.length - 1);
            this.userForm.controls.advance_payment.setValue(Res);
            }
          }
          CreateUserComponent.ssss = value
        }
        else{
          if(array[0].length<6)
      { 
        this.userForm.controls.advance_payment.setValue(value);
      }
          
        }
      //this.userForm.get('credit_limit').reset();
    }
    else{
      if (value) 
    {
      let res=value.includes(".");
      if(res== false && CreateUserComponent.ssss)
      {
        let Res=CreateUserComponent.ssss.includes(".");
        if(Res)
        {
          let array = CreateUserComponent.ssss.split(".");
          this.userForm.controls.advance_payment.setValue(array[0]);
          value=array[0];
        }
      }
      CreateUserComponent.ssss = value
      // strValue was non-empty string, true, 42, Infinity, [], ...
     }
    }
   
  }
  checkPatternnn(event) {
    let value = event.target.value;
    const pattern = /^(?:[1-9]\d{0,5}|0)(?:\.\d{1,2})?$|^0$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if(this.isPatternMatchedd  == false){
      let res= value.substr(value.length - 1);
      let array = value.split(".");
      if(res!=".") 
        {
          if(array[0].length>6)
          { 
            let result= array[0].substring(0,6)
            this.userForm.controls.credit_limit.setValue(result);
          }
          else
          {
            let res=value.includes(".");
            if(res && array[1].length>2) 
            {
               let valu=array[0]+"."+ array[1].substring(0,2)
               this.userForm.controls.credit_limit.setValue(valu);
            }
            else{
              let Res= value.substring(0, value.length - 1);
            this.userForm.controls.credit_limit.setValue(Res);
            }
          }
          CreateUserComponent.ssss = value
        }
        else{
          if(array[0].length<6)
      { 
        this.userForm.controls.credit_limit.setValue(value);
      }
          
        }
      //this.userForm.get('credit_limit').reset();
    }
    else{
      if (value) 
    {
      let res=value.includes(".");
      if(res== false && CreateUserComponent.ssss)
      {
        let Res=CreateUserComponent.ssss.includes(".");
        if(Res)
        {
          let array = CreateUserComponent.ssss.split(".");
          this.userForm.controls.credit_limit.setValue(array[0]);
          value=array[0];
        }
      }
      CreateUserComponent.ssss = value
      // strValue was non-empty string, true, 42, Infinity, [], ...
     }
    }
   
  }
  

  getPackageByProduct(product) {
    let myproduct = product.source.value;
  

    if (myproduct == 1 && product.checked == true) {
      this.productService.getPbxPackageInfoForCustomerCreation().subscribe(data => {
        this.pbxPackageList = data.response;
        this.filterPackage = this.PBXPackageFilter = this.pbxPackageList.slice();
        this.holdDefaultbillingType = data.response;
        this.isPBXSelect = true;
        this.buttonDisabled = false;
        this.pbxSelectedValue = undefined;
        this.userForm.controls.pbx_package_name.setValidators(Validators.required);
        this.userForm.controls.pbx_package_name.updateValueAndValidity();
        this.userForm.controls.extension_length_limit.setValue(4)
        this.userForm.controls.extension_length_limit.setValidators(Validators.required);
        this.userForm.controls.extension_length_limit.updateValueAndValidity();
      });
    }else if(myproduct == 1 && product.checked == false){
      this.userForm.controls.pbx_package_name.reset;
      this.isPBXSelect = false;
      this.circleToggle = false;
      this.userForm.controls.circle.clearValidators();
      this.userForm.controls.circle.updateValueAndValidity();
      this.userForm.get('circle').setValue('');
      this.userForm.controls.pbx_package_name.clearValidators();
      this.userForm.controls.pbx_package_name.updateValueAndValidity();
      this.userForm.controls.extension_length_limit.clearValidators();
      this.userForm.controls.extension_length_limit.updateValueAndValidity();
    } 
    if (myproduct == 2 && product.checked == true) {
        this.productService.getOcPackageInfo().subscribe(data => {
        this.ocPackageList = data.response;
        this.filterPackageTwo = this.OCPackageFilter = this.ocPackageList.slice();
        this.buttonDisabled = false;
        this.ocSelectedValue = undefined;
        this.userForm.controls.oc_package_name.setValidators(Validators.required);
        this.userForm.controls.oc_package_name.updateValueAndValidity();
        this.isOCSelect = true;
      });
    }else if(myproduct == 2 && product.checked == false){
      this.userForm.controls.oc_package_name.reset;
      this.userForm.controls.oc_package_name.clearValidators();
      this.userForm.controls.oc_package_name.updateValueAndValidity();
      this.isOCSelect = false;
    }
    
    
    var elements = (<HTMLInputElement[]><any>document.getElementsByName("product_name"));
 
    var response_arr = ''; 
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName == 'INPUT') {
          if (elements[i].checked == true) {
             response_arr = elements[i].value;            
          }
        }
      }
      if(response_arr.length == 0){
        this.buttonDisabled = false;
      }

  }

  public setToken(){
    this.userForm.get('token').setValue((new Date().getTime()).toString(36) + Math.random().toString(36).substr(2)); 
  }

  usernamelength(e) {
    let max = 20;
    if (e.which < 0x20) {
      // e.which < 0x20, then it's not a printable character
      // e.which === 0 - Not a character
      return;     // Do nothing
    }
    if (e.target.value.length == max) {
      e.preventDefault();
    } else if (e.target.length > max) {
      // Maximum exceeded
      e.target.value = e.target.substring(0, max);
    }
  }

  validateForm(event) {
    let text = event.target.value;
    text = text.split(' '); //we split the string in an array of strings using whitespace as separator
    return (text.length == 1); //true when there is only one word, false else.
  }

  showProduct(customerType) {  
    let customer = customerType.value;
    if (customer == '4' || customer == '5') {
      this.buttonDisabled = true;
      this.isExternalUser = false;

      this.userForm.controls.account_manager.clearValidators();
      this.userForm.controls.account_manager.updateValueAndValidity();

      this.userForm.controls.time_zone.clearValidators();
      this.userForm.controls.time_zone.updateValueAndValidity();

      this.userForm.controls.company.clearValidators();
      this.userForm.controls.company.updateValueAndValidity();

      this.userForm.controls.billing_type.clearValidators();
      this.userForm.controls.billing_type.updateValueAndValidity();

      this.userForm.controls.balance.clearValidators();
      this.userForm.controls.balance.updateValueAndValidity();

      this.userForm.controls.credit_limit.clearValidators();
      this.userForm.controls.credit_limit.updateValueAndValidity();

    } else {
      this.isExternalUser = true;
      this.buttonDisabled = false;

      this.userForm.controls.account_manager.setValidators(Validators.required);
      this.userForm.controls.account_manager.updateValueAndValidity();

      this.userForm.controls.time_zone.setValidators(Validators.required);
      this.userForm.controls.time_zone.updateValueAndValidity();

      this.userForm.controls.company.setValidators(Validators.required);
      this.userForm.controls.company.updateValueAndValidity();

      this.userForm.controls.billing_type.setValidators(Validators.required);
      this.userForm.controls.billing_type.updateValueAndValidity();

      this.userForm.controls.balance.setValidators(Validators.required);
      this.userForm.controls.balance.updateValueAndValidity();

      this.userForm.controls.credit_limit.setValidators([Validators.required,Validators.pattern(Decimal_RegEx)]);
      this.userForm.controls.credit_limit.updateValueAndValidity();

    }
  }

  continue(event){    
    if(event == 1){
      this.isExternalUser = true;
    }
  }
 
  manageStates(e){
    let country_id = e.value;
    if(country_id != '99'){
      this.isState = false;
      this.userForm.controls.states.clearValidators();
      this.userForm.controls.states.updateValueAndValidity();
    }else{
      this.isState = true;
      this.userForm.controls.states.setValidators(Validators.required);
      this.userForm.controls.states.updateValueAndValidity();
    }
  }

  manageCircle(e){
    let country_id = e.value;
    if(country_id != '99'){
      this.isCircle = false;
      // this.userForm.controls.isCircle.clearValidators();
      // this.userForm.controls.isCircle.updateValueAndValidity();
    }else{
      this.isCircle = true ;
      // this.userForm.controls.isCircle.setValidators(Validators.required);
      // this.userForm.controls.isCircle.updateValueAndValidity();
    }
  }

  api_access(){           
    this.userForm.get('apiToken').value == true ? this.api_hits = true : this.api_hits = false;
  }
  // manageLi(e){
  //   let country_id =e.value;
  //   if(country_id  != '99'){
  //     this.isLi = false;
  //     this.userForm.controls.is_Li.clearValidators();
  //     this.userForm.controls.is_Li.updateValueAndValidity();
  //     this.userForm.controls.Li.clearValidators();
  //     this.userForm.controls.Li.updateValueAndValidity();
  //   }else{
  //     this.isLi = true;
  //     this.userForm.controls.is_Li.setValidators(Validators.required);
  //     this.userForm.controls.is_Li.updateValueAndValidity();
  //     this.userForm.controls.Li.setValidators(Validators.required);
  //     this.userForm.controls.Li.updateValueAndValidity();
  //   }
  // }

  showCreditBox(e) {
    let billing_type = e.value;
    if (billing_type == '1') {
      this.isCredtiLimit = false;
      this.userForm.controls.balance.setValidators([Validators.required]);
      this.userForm.controls.balance.updateValueAndValidity();
      this.credit_value = '0.00';

      this.userForm.controls.credit_limit.clearValidators();
      this.userForm.controls.credit_limit.updateValueAndValidity();
    } else {
      this.isCredtiLimit = true;
      this.userForm.controls.balance.setValidators([Validators.required]);
      this.userForm.controls.balance.updateValueAndValidity();

      this.userForm.controls.credit_limit.setValidators([Validators.required]);
      this.userForm.controls.credit_limit.updateValueAndValidity();
    }
  }

  personalInfo() {
    let infoField = ['f_name', 'email', 'username', 'country', 'mobile', 'time_zone', 'states'];
    this.wizardStepValivation(infoField, "personalInfo");
  }

  companyInfo() {
    let infoField = ['account_manager', 'company', 'company_phone', 'gst_number'];    
    this.wizardStepValivation(infoField, "companyInfo");
  }

  wizardStepValivation(fieldControl, step) {
    // this.userForm.controls['company'].setErrors({'incorrect': false});
    
    const invalidField = [];

    for (let i = 0; i < fieldControl.length; i++) {
      const controls = this.userForm.controls[fieldControl[i]];                        
      if (controls.invalid) {
        
        invalidField.push(fieldControl[i]);
      }
    }    
    
    
    if (invalidField.length == 0) {
      if (step == 'personalInfo') {
        this.goNextPesonalInfo = true;
        this.goNextCompanyInfo = false;
      } else {
        this.goNextCompanyInfo = true;
      }
    } else {
      if (step == 'personalInfo') {
        this.goNextPesonalInfo = false;
      } else {
        this.goNextCompanyInfo = false;
      }
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.userForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitUserForm() {
    this.checkForm = this.findInvalidControls();
    // this.userForm.removeControl('product_name');
    // this.userForm.updateValueAndValidity();
    if (this.userForm.dirty && this.userForm.valid) {
      this.submitted = true;
      var productArr = [];
      var elements = (<HTMLInputElement[]><any>document.getElementsByName("product_name"));
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName == 'INPUT') {
          if (elements[i].checked == true) {
            let response_arr = elements[i].value;
            productArr.push(response_arr[0]);
          }
        }
      }
      if(productArr.length == 0){  // Validate atleast one product
        this.toastr.error('Error!', productExist, { timeOut: 4000 });
        return;
      }
      const credentials = this.userForm.value;
      let threshold_fifty = this.userForm.get('threshold_fifty').value;
      let threshold_seventyFive = this.userForm.get('threshold_seventyFive').value;
      let threshold_ninety = this.userForm.get('threshold_ninety').value;

      if(threshold_fifty == true){
        this.threshold_balance_notification.push(50)      
      }
      if(threshold_seventyFive == true){
        this.threshold_balance_notification.push(75)        
      }
      if(threshold_ninety == true){
        this.threshold_balance_notification.push(90)        
      }

      let finalString = this.threshold_balance_notification.join(',');
      
      
      credentials['threshold_balance_notification'] = finalString;
      
      this.errors = { errors: {} };
      let user_id = localStorage.getItem("id");
      credentials.user_id = user_id;
      credentials.product_name = productArr;
      credentials['url']= this.URL;
     // credentials['token'] = (new Date().getTime()).toString(36) + Math.random().toString(36).substr(2); 
      this.userService.checkEmailValid(credentials).subscribe(emaildata => {
        if (emaildata.id != '') {
          this.toastr.error('Error!', emailExist, { timeOut: 4000 });
          this.emailId = "";
          return
        } else {
          this.userService.checkCompanyValid(credentials).subscribe(compdata => {
            if (compdata.id != '') {
              this.toastr.error('Error!', checkCompany, { timeOut: 4000 });
              this.emailId = "";
              return
            } else {
              this.userService.checkUsernameValid(credentials).subscribe(data => {
                if (data.id != '') {
                  this.toastr.error('Error!', checkCompany, { timeOut: 4000 })
                  this.companyName = "";
                  return
                } else {
                  // if(this.isIndia){
                  //   credentials['did_number'] = this.indianDIDId;
                  // }                  
                  this.userService.postUserData(credentials).subscribe(data => {                     
                    this.toastr.success('Registration Successful', userCreated, { timeOut: 4000 });
                    if (credentials.user_type == '1' || credentials.user_type == '2') {
                      // credentials['customer'] = data['user_id'];
                      // this.didService.assignDID('assignDID',credentials)
                      // .subscribe(data => {
                      //   this.router.navigateByUrl('user/view');
                      // });     
                      this.router.navigateByUrl('user/view');                 
                    } else {
                      this.router.navigateByUrl('user/view');
                    }
                  }, err => {
                    this.errors = err;
                    this.toastr.error('Error!', err.message, { timeOut: 4000 });
                  });
                }
              });
            }
          });
        }
      });
    } else {
      this.toastr.error('Error!', invalidFormError, { timeOut: 4000 });
    }
  }
  OCremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.ocPackageList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Packageremovedspace(event){
    
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.pbxPackageList.filter((data) =>{    
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
  Dialoutremovedspace(event){
    
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.dialoutGroupList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Accountremovedspace(event){
    
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.managerArr.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Timeremovedspace(event){
    
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.timeZone.filter((data) =>{    
      return data['gmtzone'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  countryremovedspace(event){
    
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryspace.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Stateremovedspace(event){
    
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.statespace.filter((data) =>{    
      return data['state_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  checkUsername() {
    let credentials = this.userForm.value;
    this.userService.checkUsernameValid(credentials).subscribe(data => {
      if (data.id >= 1) {
        this.toastr.error('Error!', checkUsername, { timeOut: 4000 })
        this.userName = "";
      }
    });
  }

  checkCompany() {
    let credentials = this.userForm.value;
    
    this.userService.checkCompanyValid(credentials).subscribe(data => {
      if (data.id >= 1) {
        this.toastr.error('Error!', checkCompany, { timeOut: 4000 })
        this.companyName = "";
      }
    });
  }

  checkEmail() {
    let credentials = this.userForm.value;
    this.userService.checkEmailValid(credentials).subscribe(data => {
      if (data.id >= 1) {
        this.toastr.error('Error!', emailExist, { timeOut: 4000 })
        this.emailId = "";
      }
    });
  }

  goNext(event) {
    this.buttonDisabled = true;
  }

  checkValidIP(keyword) {
    let mykeyword = this.serverForm.value.ip;
    let splitted = mykeyword.split(".", 4);
    let splittedV6 = mykeyword.split(":", 1);
    if (mykeyword.includes(".")) {
      if (splitted.length < 4) {
        this.toastr.error('Error!', invalidIP, { timeOut: 2000 });
        keyword.target.value = "";
        return;
      } else {
        for (let i = 0; i <= splitted.length; i++) {
          if (splitted[i] > 255) {
            this.toastr.error('Error!', invalidIP, { timeOut: 2000 });
            keyword.target.value = "";
            return;
          }
        }
      }
    } else if (mykeyword.includes(":")) {
      for (let i = 0; i <= splittedV6.length; i++) {
        if (splittedV6[i] == "") {
          this.toastr.error('Error!', invalidIP, { timeOut: 2000 });
          keyword.target.value = "";
          return;
        }
      }
    }
  }

  getCountryCode(event) {
    
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode = '+' + data.response[0].phonecode;
    });
    if(country_id != 99){
      this.isIndia = false;
      this.userForm.get('cli_type').setValue("");
    }else{
      this.isIndia = true;
    }
    //   this.didService.getDIDByCountry(country_id).subscribe(data => {
    //     this.indianDID = data[0].did;
    //     this.indianDIDId.push(data[0].id+'-'+data[0].did+'-'+data[0].did_type);
    //   });
    // }else{
    //   this.indianDID = '';
    //   this.indianDIDId = [];
    //   this.isIndia = false;
    // }   
  }

  public isChnageCircle(event){
    let isCircleEnable = event.checked;
    if (isCircleEnable == true) {
      this.userForm.controls.circle.setValidators(Validators.required);
      this.userForm.controls.circle.updateValueAndValidity(); 
      this.userForm.controls.pbx_package_name.clearValidators();
      this.userForm.controls.pbx_package_name.updateValueAndValidity();
      this.userForm.get('pbx_package_name').reset();
      this.pbxPackageList = []
    }else{
      this.userForm.controls.circle.clearValidators();
      this.userForm.controls.circle.updateValueAndValidity();
      this.userForm.get('circle').setValue('');
      this.userForm.controls.pbx_package_name.clearValidators();
      this.userForm.controls.pbx_package_name.updateValueAndValidity();
      this.userForm.get('pbx_package_name').reset();
      this.pbxPackageList = this.holdDefaultbillingType;
      this.filterPackage = this.PBXPackageFilter = this.pbxPackageList.slice();

    }
   }
   public isChnageDate(event){
    let isSetDateEnable = event.checked;
    if (isSetDateEnable == true) {
      this.userForm.controls.date.setValidators(Validators.required);
      this.userForm.controls.date.updateValueAndValidity();
    }else{
      this.userForm.controls.date.clearValidators();
      this.userForm.controls.date.updateValueAndValidity();
      this.userForm.get('date').setValue('');
    
    }
   }

  //  public onCircleSelect(event){
  //   let circleId = this.userForm.get('circle').value;
  //   // let circleId = event.value
  //   if(!this.userForm.get('circle').value){
  //    return;
  //   }
  //  this.productService.getPackageCircleBased(circleId).subscribe(data => {
  //    if(data.response.length == 0){
  //      this.pbxSelectedValue = '';
  //     //  this.pbxForm.controls.call_plan.setValidators(Validators.required);
  //     //  this.pbxForm.controls.call_plan.updateValueAndValidity();
  //      this.pbxPackageList = data.response;
  //      this.filterPackage = this.PBXPackageFilter = this.pbxPackageList.slice();

  //      return;
  //    }
  //    this.userForm.get("pbx_package_name").setValue("");
  //    this.userForm.updateValueAndValidity();
  //     this.pbxPackageList = []
  //    this.pbxPackageList = data.response;
  //    this.filterPackage = this.PBXPackageFilter = this.pbxPackageList.slice();
  //    this.pbxSelectedValue = data.response[0].id;
     
  //  }, err => {
  //    this.error = err.message;
  //  });
  // }
  
public onCircleSelect() {
  let circleId = this.userForm.get('circle').value;
  if(!this.userForm.get('circle').value){
    return;
   }
  // Clear the pbxPackageList array to reset it
  this.pbxPackageList = [];
  
  // Reset the value of the form control "pbx_package_name"
  this.userForm.get('pbx_package_name').setValue('');

  // Check if the circleId is valid, then fetch the data
  if (circleId) {
    this.productService.getPackageCircleBased(circleId).subscribe(data => {
      if(data.response.length == 0){
         this.pbxSelectedValue = '';
        //  this.pbxForm.controls.call_plan.setValidators(Validators.required);
        //  this.pbxForm.controls.call_plan.updateValueAndValidity();
         this.pbxPackageList = data.response;
         this.filterPackage = this.PBXPackageFilter = this.pbxPackageList.slice();
         return;
       }
      this.pbxPackageList = data.response;
      this.filterPackage = this.PBXPackageFilter = this.pbxPackageList.slice();
      this.pbxSelectedValue = data.response[0].id;
    }, err => {
      this.error = err.message;
    });
  }
}

  public getCircle(){ //get circle data
    this.callplanService.getCircle().subscribe(data => {
      this.circleList = data.response; 
      this.filterCircle = this.CircleFilter = this.circleList.slice();
    }, err => {
      this.errors = err.message;
    });
  }

  public changeDunning(event){    
    if(event.checked == true){
      this.dunning = true;
        this.userForm.get('is_notification_email').setValue(true);
        // this.userForm.controls.is_notification_email.disable();
      this.userForm.controls.is_notification_email.setValidators(Validators.required);
      this.userForm.controls.is_notification_email.updateValueAndValidity();
      this.userForm.controls.notification_email.setValidators(Validators.required);
      this.userForm.controls.notification_email.updateValueAndValidity();
    }else{
      this.dunning = false;
      this.userForm.controls.is_notification_email.setValue(false);
      this.userForm.controls.is_notification_email.enable();          
      this.userForm.controls.is_notification_email.updateValueAndValidity()
      this.userForm.controls.notification_email.clearValidators();  
      this.userForm.controls.notification_email.reset();  
      this.userForm.controls.notification_email.updateValueAndValidity();
    }   
  }

  public changeNotificationEmail(event) {    
    let isEmail = event.checked;
    if (isEmail == true) {
      this.userForm.controls.notification_email.setValidators([Validators.required,Validators.pattern(EMAIL_RegEx)]);
      // this.userForm.controls.notification_email.setValidators(Validators.pattern(EMAIL_RegEx));
      this.userForm.controls.notification_email.updateValueAndValidity();
    } else {     
      this.userForm.controls.notification_email.clearValidators();
      this.userForm.controls.notification_email.setValue('');
      this.userForm.controls.notification_email.updateValueAndValidity();
    }
  }
  public changeLi(e){
    let myKeyword= e.checked;
    if(myKeyword == true){
      this.userForm.controls.Li.updateValueAndValidity();
      this.Li = true;
      this.userForm.controls.Li.enable();
     } else{
      this.userForm.controls.Li.disable();
      this.Li =false;
      }
    }
}

