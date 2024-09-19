import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EmailService } from '../../../core/services/email.service';
import { Errors, UserService, mailSendError, CommonService, invalidPassword, PASSWORD_RegEx } from '../../../core';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  sessionId = "";
  errors: Errors = { errors: {} };
  submitted = false;
  error = '';
  showMsg = false;
  emailContentData: any = {};
  customerName: any = {};
  action = "";
  condition: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastr: ToastrService,
    private emailService: EmailService,
    public commonService: CommonService,) { }

  ngOnInit() {
    this.sessionId = this.route.snapshot.queryParams.param;
    this.action = this.route.snapshot.queryParams.action;
    let decode = atob(this.sessionId);
    const keyValuePairs = decode.split(',');
    const decodedObject = {};
    keyValuePairs.forEach(pair => {
      const [key, value] = pair.split('=');
      decodedObject[key] = value;
    });
    this.action = decodedObject['action'];
    this.sessionId = decodedObject['email'];
    let promise = new Promise((resolve) => {
      this.emailService.emailExpireToken(this.sessionId).subscribe(data => {
        if (data.code === 200) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Enter new password</span>',
            input: 'password',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit',
            background: '#000000',
            showLoaderOnConfirm: true,
            preConfirm: (password) => {
              var re = PASSWORD_RegEx;
              if (!re.test(password)) {
                Swal.showValidationMessage(
                  invalidPassword
                )
                return;
              }
              else {
                return this.userService.resetPassword(this.sessionId, password, this.action).subscribe(data => {
                  if (data) {
                    Swal.fire(
                      {
                        type: 'success',
                        text: 'New password updated',
                        showConfirmButton: false,
                        timer: 3000
                      })
                  }
                });
              }
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result) {
              Swal.fire({
                title: '<span style="color:#FFFFFF;">New password updated</span>',
                timer: 3000
              })
              this.router.navigateByUrl('auth/login');
            }
          })
        } else {
          Swal.fire({
            title: 'Error!',// title: 'Error!',
            // text: '<span style="color:red;">You Link has Expired \n Try Again! with a new Link.</span>',
            // background: '#000000',
            // timer: 5000
            html: '<span style="color:red;">Your Link has Expired<br>Try Again! with a new Link.</span>',
            background: '#000000',
            timer: 5000,
          })
          this.router.navigateByUrl('auth/login');
        }
      })
    })
  }

}
