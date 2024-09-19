import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Errors, UserService, mailSendError, CommonService } from '../../../core';
import { Role } from '../../../core/models';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { EmailService } from '../../../core/services/email.service';
import { ExtensionService } from '../../extension/extension.service';
import { PlatformLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  localIPAddress: string;
  errors: Errors = { errors: {} };
  authForm: FormGroup;
  submitted = false;
  error = '';
  showMsg = false;
  msg = '';
  boxcolor = '';
  emailContentData: any = {};
  customerName: any = {};
  evalUser: boolean = false;
  extensionName: any = {};
  URL = "";
  logoUrl = "";
  is_poweredBy;
  powered_by = "";
  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private elementRef: ElementRef,
    private emailService: EmailService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private platformLocation: PlatformLocation,
    private titleService: Title
  ) {
    this.authForm = this.formBuilder.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
      // 'recaptcha': [''],
    });
  }

  // export class MyComponentComponent implements OnInit {
  //   localIPAddress: string;
  //   constructor(private http: HttpClient) { }
  //   ngOnInit(): void {
  //     this.getLocalIPAddress();
  //   }
  //   getLocalIPAddress(): void {
  //     this.http.get('https://api.ipify.org/?format=json').subscribe((response: any) => {
  //       this.localIPAddress = response.ip;
  //     });
  //   }
  // }
  captchaResponse: any;

  resolved(captchaResponse: any) {
    // debugger
    this.captchaResponse = captchaResponse;
    // console.log(`Resolved captcha with response: ${this.captchaResponse}`);
  }
  ngOnInit() {
    // console.log('Form submitted with captcha response:', this.captchaResponse);
    this.userService.getProductProfile(0,2).subscribe(data => {            
      if(data.logo_img){
        this.logoUrl = data.logo_img
      }else{
        this.logoUrl = "assets/img/brand/ECTL_logo_new.png"
      }
      this.titleService.setTitle(data.title)
      this.is_poweredBy = data.is_poweredBy;
      this.powered_by = data.is_poweredBy == 0 ? "assets/img/brand/ECTL_logo_new.png" : data.powered_by;
    });
    this.URL = (this.platformLocation as any).location.origin;
    if (localStorage.getItem('isAuthenticated')) {
      this.router.navigateByUrl('/');
    }
    // this.userService.getSystemIP().subscribe(data => {
    //   localStorage.get('ip', data);
    // });
  }

  // convenience getter for easy access to form fields
  get f() { return this.authForm.controls; }

  login() {
    const ip = 'https://api.ipify.org/?format=json'
    this.http.get(ip).subscribe((response: any) => {
  
      localStorage.setItem('ip',response.ip)            
    });
    this.submitted = true;
    // stop here if form is invalid
    if (this.authForm.invalid) {
      return;
    } else {
      this.errors = { errors: {} };
      const credentials = this.authForm.value;
      credentials['ip'] = localStorage.getItem('ip');
      this.userService.attemptAuth(credentials).subscribe(data => {           
       if (data['code'] == 200) {
        // localStorage.setItem('ext_name',data['ext_name']);
          this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
          let menuList = JSON.parse(localStorage.getItem('menu'));
          let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
          this.router.navigateByUrl(newV.url);
        }else if(data['code'] == 'subadmin'){
          this.toastr.error('Error!', data['message'], { timeOut: 4000 });
        }
        else {
          this.toastr.error('Error!', data['message'], { timeOut: 2000 });
        }
      });
    }
  }

  toggleShow() {
    this.evalUser = !this.evalUser;
  }

  forgetPassword() {30
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Forgot Password <br/> <span style="font-size: 18px;">Enter your email to recover your password</span> </span>',
      input: 'text', inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true, confirmButtonText: 'Submit',
      background: '#000000', showLoaderOnConfirm: true,
      preConfirm: (email) => {
        if (!email) {
          Swal.showValidationMessage('Request failed: Email required')
          return;
        }
        else {
          return this.userService.emailExist({ email: email, action: 'admin',}).subscribe(data => {
            if (!("response" in data)) {
              Swal.fire({ type: 'success', text: 'Request Passed: Your credential has been sent!', showConfirmButton: false, timer: 3000 })
            }
            else {
              Swal.fire(
                { type: 'error', text: 'Request Failed: Invalid email!', showConfirmButton: false, timer: 3000 })
            }
          });
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({ title: ``, timer: 3000 })
      }
    })
  }

  extensionForgetPassword() {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Forgot Password <br/> <span style="font-size: 18px;">Enter your email to recover your password</span> </span>',
      input: 'text', inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true, confirmButtonText: 'Submit',
      background: '#000000', showLoaderOnConfirm: true,
      preConfirm: (email) => {
        if (!email) {
          Swal.showValidationMessage('Request failed: Email required')
          return;
        }
        else {
          return this.extensionService.extensionEmailExist({ email: email, action: 'extension', mailList: this.URL + "/auth/forgetPassword?action=" }).subscribe(data => {
            if (!("response" in data)) {
              Swal.fire({ type: 'success', text: 'Request Passed: Your credential has been sent!', showConfirmButton: false, timer: 3000 })
            }
            else {
              Swal.fire(
                { type: 'error', text: 'Request Failed: Invalid email!', showConfirmButton: false, timer: 3000 })
            }
          });
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: ``,
          timer: 3000
        })
      }
    })
  }

}
