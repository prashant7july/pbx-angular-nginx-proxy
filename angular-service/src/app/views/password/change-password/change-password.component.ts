import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Errors, CommonService, UserService, PASSWORD_RegEx, mailSendError, oldPasswordMismatch, passwordMismatch, errorMessage, passwordChanged } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmailService } from '../../../core/services/email.service';
import { ExtensionService } from '../../extension/extension.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  values = '';
  submitted = false;
  errors: Errors = { errors: {} };
  changePasswordForm: FormGroup;
  // username = "";
  emailContentData: any = {};
  customerName: any = {};
  errorField: any;
  ifextension:boolean = false;
  // pswdPattern ='(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userService: UserService,
    public commonService: CommonService,
    private emailService: EmailService,
    private extensionService: ExtensionService
  ) {
    this.changePasswordForm = this.fb.group({
      'password': ['', Validators.required],
      'newPassword': ['', [Validators.required, Validators.pattern(PASSWORD_RegEx)]],
      'confirmPassword': ['', [Validators.required, Validators.pattern(PASSWORD_RegEx)]],
      'username': [localStorage.getItem('uname'), Validators.required],
      'ext_number': [localStorage.getItem('ext_number'), Validators.required],
      // 'pass_word': [localStorage.getItem('password'), Validators.required],
    });
  }

  ngOnInit() {
  }

  // convenience getter for easy access to form fields
  get f() { return this.changePasswordForm.controls; }

  get password() {
    return this.changePasswordForm.get('password');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }
  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }

  checkPassword(value: string): void {
    const type = localStorage.getItem('type');

    const credentials = this.changePasswordForm.value;
    const ext_name = localStorage.getItem('ext_name');
    if(Number(type) == 6){
      credentials.username = localStorage.getItem('ext_number');
    }
    else{
    credentials.username = localStorage.getItem('uname');
    }
    this.userService.attemptAuth(credentials).subscribe(data => {
      if (data['code'] == 404) {
        this.errorField = data['message'];
        this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
        this.changePasswordForm.controls['password'].setValue('');
        return;
      }
    }, err => {
      this.toastr.error('Error!', oldPasswordMismatch, { timeOut: 2000 });
      this.errors = err.message;
    });
  }

  passwordMatch(control: AbstractControl) {
    let paswd = control.root.get('newPassword');
    if (paswd && control.value != paswd.value) {
      return {
        passwordMatch: false
      };
    }
    return null;
  }

  submitChangePassword() {
    this.submitted = true;
    if (this.changePasswordForm.invalid) {
      return;
    }
    const credentials = this.changePasswordForm.value;

    if (credentials.newPassword !== credentials.confirmPassword) {
      this.toastr.error('Error!', passwordMismatch, { timeOut: 2000 });
      return;
    }
    credentials['email'] = localStorage.getItem('uemail');
    if (localStorage.getItem('type') != '6') {
      this.userService.changePassword(credentials).subscribe(data => {
        this.toastr.success('Success!', passwordChanged, { timeOut: 2000 });
        this.cancleForm();
      }, err => {
        this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
        this.errors = err.message;
      });
    }
    else {
      this.extensionService.updateExtensionPassword(credentials).subscribe(data => {
        this.toastr.success('Success!', passwordChanged, { timeOut: 2000 });
        this.cancleForm();
      }, err => {
        this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
        this.errors = err.message;
      });
    }
  }
  cancleForm() {
    if (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2') {
      this.router.navigateByUrl('/')//navigate to admin dashboard
    } else if (localStorage.getItem('type') === '1') {
      this.router.navigateByUrl('dashboard/customerDashboard');//navigate to customer dashboard
    } else if (localStorage.getItem('type') === '4') {
      this.router.navigateByUrl('dashboard/internalUserDashboard');//navigate to internal user dashboard
    } else if (localStorage.getItem('type') === '5') {
      this.router.navigateByUrl('dashboard/supportDashboard');//navigate to  support dashboard
    } else if (localStorage.getItem('type') === '6') {
      this.router.navigateByUrl('dashboard/extensionDashboard');//navigate to extension dashboard
    }

    this.changePasswordForm.reset();
  }
}
