import { Component, OnInit } from '@angular/core';
import { Errors, Name_RegEx, CommonService, invalidPhone, EMAIL_RegEx, Number_RegEx, profileUpdated, formError, errorMessage, checkUsername, emailExist,NotificationExist, ExtensionService, EmitterService } from '../../../core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../profile.service';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../user/user.service';
import { environment } from '../../../../environments/environment';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { renderContainerHelper } from '@syncfusion/ej2-angular-diagrams';

const URL = environment.api_url + 'profile';
export let imagePath: any;
let _validFileExtensions = [".png", ".jpg", ".jpeg"];

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  selectedValue = '';
  fileToUpload: File = null;
  imageURL: string;
  error = '';
  action: any;
  errors: Errors = { errors: {} };
  userForm: FormGroup;
  submitted = false;
  textboxval = '';
  buttonDisabled: true;
  userData: any = {};
  userRole = '1';
  companyData: any = {};
  checkForm: any;
  timeZone = "";
  countryList = "";
  countryCode = "";
  timeZoneId: any;
  imagePath1 = "";
  pageloader: boolean;
  isImg: any = false;
  imageFile = "";
  isMCA = false;
  isSMSEnable:any;
  isSMSNotificationShow: boolean = false;

  public uploader: FileUploader = new FileUploader({
    url: URL, itemAlias: 'profileImg',
    allowedFileType: ['image'], method: 'post',
    maxFileSize: 1024 * 1024 * 1
  });
  hide = true;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private profileService: ProfileService,
    private companyService: CompanyService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private extensionService: ExtensionService,
    private emitter: EmitterService,
  ) {
    this.userForm = this.formBuilder.group({
      'first_name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'last_name': ['', Validators.pattern(Name_RegEx)],
      'email': ['', [Validators.required, Validators.pattern(EMAIL_RegEx)]],
      'username': ['', [Validators.required, Validators.minLength(4)]],
      'mobile': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'account_no': [0, Validators.maxLength(15)],
      'company_name': ['', Validators.required],
      'company_address': [''],
      'company_phone': ['', [Validators.minLength(10), Validators.maxLength(15), Validators.min(1000000000)]],
      'domain': [''],
      'country': [""],
      'country_code': [''],
      'time_zone': [""],
      'profileImg': [''],
      'token': [""],
      'email_notification': [''],
      'notification_email': [''],
      'sms_notification': [''],
      'logoImg': [''],
      'threshold': [''],

    });
  }

  ngOnInit() {

    this.userRole = localStorage.getItem('type');
    this.companyService.getCompanyInfo().subscribe(data => {
      if (data) {
        this.companyData = data.response[0];
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

    this.profileService.getUserInfo('getUserInfo', Number(localStorage.getItem('id'))).subscribe(data => {
      if (data) {
        this.userData = data.response[0];
        if(this.userRole == '3'){
          this.userForm.get('company_name').setValue(this.userData.username);
        }
        this.userData['is_sms_notification'] = Number(this.userData['is_sms_notification'])
        this.userData['is_email_notification'] = Number(this.userData['is_email_notification'])
        if (this.userData['is_email_notification'] == 1) {
     this.isMCA = true
     this.userForm.controls.notification_email.setValidators([Validators.required,Validators.pattern(EMAIL_RegEx)]);
     this.userForm.controls.notification_email.updateValueAndValidity();
        }
        else{
          this.isMCA = false;
          this.userForm.controls.notification_email.clearValidators();
          this.userForm.controls.notification_email.updateValueAndValidity();

        }
        
        this.countryCode = this.userData.country_code;
        this.timeZoneId = parseInt(data.response[0].time_zone_id);
      }
    }, err => {
      this.errors = err.message;
    });

    this.extensionService.getMyExtensionLimit(localStorage.getItem('id'), localStorage.getItem('type')).subscribe(data => {
      this.isSMSNotificationShow = data.ext.sms
    });

    //--------------------------uploader---------------//
    this.uploader.onAfterAddingFile = (file) => {
      this.isImg = true;
      this.uploadProfile();
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      imagePath = URL + item.file.name;
      var res = JSON.parse(response);
      this.imageFile = res["file"];
      this.imagePath1 = item.file.name;
    };
    this.uploader.onCompleteAll = () => {
      this.pageloader = false;
    }
  }

  get company_phone() { return this.userForm.get('company_phone'); }
  get first_name() { return this.userForm.get('first_name'); }
  get last_name() { return this.userForm.get('last_name'); }
  get email() { return this.userForm.get('email'); }
  get notification_email() { return this.userForm.get('notification_email'); }
  get username() { return this.userForm.get('username'); }
  get mobile() { return this.userForm.get('mobile'); }
  get account_no() { return this.userForm.get('account_no'); }
  get company_name() { return this.userForm.get('company_name'); }
  get company_address() { return this.userForm.get('company_address'); }
  get domain() { return this.userForm.get('domain'); }


  public smsToggle(event) {
    this.isSMSEnable = event.checked;
    this.isMCA = this.isSMSEnable;
    if (this.isSMSEnable == true) {
     this.userForm.controls.notification_email.setValidators([Validators.required,Validators.pattern(EMAIL_RegEx)]);
      this.userForm.controls.notification_email.updateValueAndValidity();
    } else {
      this.isMCA = false;
      this.userForm.controls.notification_email.clearValidators();
      this.userForm.controls.notification_email.updateValueAndValidity();
    }
  }

  // logoUpload(event){
  //   let logo = event
  //   let data;
  //   this.profileService.setLogo(data).subscribe(data => {      
  //   })
  // }


  // For Image upload 

  ImgUpload() {
    var user_id = localStorage.getItem("id");
    var role = localStorage.getItem('type');
    let credential = {};
    credential['user_id'] = user_id;
    if (this.isImg == true) {
      credential['profile_img'] = "assets/uploads/" + this.imageFile;
    } else {
      credential['profile_img'] = "assets/uploads/Profile-Image.png";
    }
    localStorage.setItem("userImg", credential['profile_img']);
    this.profileService.profileupdate(role, credential)
      .subscribe(data => {
      });
  }

  Validate(event: any) {
    // for file preview  
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
          this.userData.profile_img = reader.result as string;
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
  }
  data(event: any) {
    const reader = new FileReader();
    const [file] = event.target.files;
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.userData.profile_img = reader.result as string;
    }
  }
  uploadProfile() {
    this.uploader.uploadAll();
  }
  submitUserForm() {
    if (this.isImg == true) {
      this.ImgUpload();
      this.emitter.updateImage();
    }
    this.checkForm = this.findInvalidControls();
    this.checkForm = this.checkForm[0] == 'company_phone' || this.checkForm[0] == 'mobile' ? invalidPhone : ''
    if (this.userForm.valid) {
      this.submitted = true;
      var user_id = localStorage.getItem("id");
      const credentials = this.userForm.value;
      credentials.user_id = user_id;

      credentials.id = user_id;
      var role = localStorage.getItem('type');
      if(role == '3'){
        credentials.company_name = credentials.username;
      }
      
      this.userService.checkEmailValid(credentials).subscribe(data => {
        if (data['email'] != '') {
          this.toastr.error('Error!', emailExist, { timeOut: 4000 });
          return
        } 
        // else if(data['notification_email'] != ''){
        //   this.toastr.error('Error!', NotificationExist, { timeOut: 4000 });
        //   return
        // }
        else {

          this.profileService.editUser('updateUser', this.userRole, credentials)
            .subscribe(data => {
              this.toastr.success('Success!', profileUpdated, { timeOut: 2000 });
              if (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2' ||  localStorage.getItem('type') === '3') {
                this.router.navigateByUrl('/'); //navigate to admin dashboard
              } else if (localStorage.getItem('type') === '1') {
                this.router.navigateByUrl('dashboard/customerDashboard');//navigate to customer dashboard
              } else if (localStorage.getItem('type') === '4') {
                this.router.navigateByUrl('dashboard/internalUserDashboard');//navigate to internalUser dashboard
              } else if (localStorage.getItem('type') === '5') {
                this.router.navigateByUrl('dashboard/supportDashboard');//navigate to internalUser dashboard
              }
            });
        }
      });
      // this.userService.verifynotificationEmail(credentials).subscribe(data => {
      //   if (data['id'] != '') {
      //     this.toastr.error('Error!', NotificationExist, { timeOut: 4000 });
      //     return
      //   } else {

      //     this.profileService.editUser('updateUser', this.userRole, credentials)
      //       .subscribe(data => {
      //         this.toastr.success('Success!', profileUpdated, { timeOut: 2000 });
      //         if (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2') {
      //           this.router.navigateByUrl('/'); //navigate to admin dashboard
      //         } else if (localStorage.getItem('type') === '1') {
      //           this.router.navigateByUrl('dashboard/customerDashboard');//navigate to customer dashboard
      //         } else if (localStorage.getItem('type') === '4') {
      //           this.router.navigateByUrl('dashboard/internalUserDashboard');//navigate to internalUser dashboard
      //         } else if (localStorage.getItem('type') === '5') {
      //           this.router.navigateByUrl('dashboard/supportDashboard');//navigate to internalUser dashboard
      //         }
      //       });
      //   }
      // });
    } else {
      this.toastr.error('Error!', this.checkForm, { timeOut: 2000 });
    }
  }

  checkUsername(keyword) {
    let mykeyword = keyword.target.value;
    if (mykeyword.length >= 6) {
      this.userService.checkUsernameValid(mykeyword).subscribe(data => {
        if (data.user_id >= 1) {
          this.toastr.error('Error!', checkUsername, { timeOut: 2000 });
          keyword.target.value = "";
        }
      }, err => {
        this.error = err.message;
      });
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

  getCountryCode(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }

  public refreshToken() {
    this.userForm.get('token').setValue((new Date().getTime()).toString(36) + Math.random().toString(36).substr(2));
  }
}
