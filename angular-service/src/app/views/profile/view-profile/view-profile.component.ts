import { Component, OnInit } from '@angular/core';
import { Errors, CommonService} from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';    
import { ProfileService } from '../profile.service';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../user/user.service';
import { UserTypeConstants } from 'src/app/core/constants/userType.constant';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css']
})
export class ViewProfileComponent implements OnInit {
  selectedValue = '';
  error = '';
  action:any;
  errors: Errors = { errors: {} };
  userForm: FormGroup;
  submitted = false;
  textboxval='';
  buttonDisabled: true;
  userData :  any={};
  userRole= '1';
  companyData:  any={};
  checkForm:any;
  timeZone = "";
  countryList = "";
  countryCode = "";
  timeZoneId:any;
  isShowAPIToken : boolean = false;

  // public EMAIL_REGEXP = "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}";
  constructor( 
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private profileService :ProfileService,
    private companyService: CompanyService,
    public commonService:CommonService, 
    )
    {  
      this.userForm = this.formBuilder.group({
      'first_name': [{value:'' , disabled:true}],
      'last_name': [{value:'' , disabled:true}],
      'email': [{value:'' , disabled:true}],
      'username': [{value:'' , disabled:true}],
      'mobile': [{value:'' , disabled:true}],
      'account_no':[{value:0 , disabled:true}],
      'company_name': [{value:'' , disabled:true}],
      'company_address': [{value:'' , disabled:true}],
      'company_phone': [{value:'' , disabled:true}],
      'domain': [{value:'' , disabled:true}],
      'country': [{value:'' , disabled:true}],
      'country_code': [{value:'' , disabled:true}],
      'time_zone': [{value:'' , disabled:true}],
      'token': [{value:'' , disabled:true}],
      'threshold': [{value:'' , disabled:true}],
      'email_notification': [{value:'' , disabled:true}],
      'sms_notification': [{value:'' , disabled:true}],
    });
  }

  ngOnInit() {

    this.userRole = localStorage.getItem('type');
    let user_id =  localStorage.getItem('id')
    

    this.profileService.getUserInfo('getUserInfo',Number(user_id)).subscribe(data => {    
      if(data){
        this.userData=data.response[0]; 
        this.countryCode = this.userData.country_code;
        this.timeZoneId = parseInt(data.response[0].time_zone_id);
        this.isShowAPIToken = (this.userData['api_token'] == '1') ? true : false;
        this.userData['is_sms_notification'] = Number(this.userData['is_sms_notification'])
        this.userData['is_email_notification'] = Number(this.userData['is_email_notification'])
      }
    }, err => {
      this.errors = err.message;
    });

    this.companyService.getCompanyInfo().subscribe(data => {
      if(data){
        this.companyData=data.response[0];
      }
    }, err => {
      this.errors = err.message;
    });

    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
    }, err => {
      this.error = err.message;
    });

  //get time-zones
  this.commonService.getTimezone().subscribe(data => {
    this.timeZone = data.response;
  }, err => {
    this.error = err.message;
  });
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
  

  
  
}
