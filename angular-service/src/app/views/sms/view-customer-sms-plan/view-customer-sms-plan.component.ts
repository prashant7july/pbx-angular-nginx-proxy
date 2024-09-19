import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
//import { ServerService } from '../server.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, ServerDetail, IP_RegEx, invalidIP, duplicatePort, formError, passwordError, usernameError, existNumberInBlackList } from '../../../core';
import { ServerService } from '../../server/server.service';
import { SmsService } from '../sms.service';
import { UserService } from '../../user/user.service';
import { Location } from '@angular/common'

@Component({
  selector: 'app-view-customer-sms-plan',
  templateUrl: './view-customer-sms-plan.component.html',
  styleUrls: ['./view-customer-sms-plan.component.css']
})
export class ViewCustomerSmsPlanComponent implements OnInit {
  smsForm: FormGroup;
  serverData: any = {};
  customer_id = "";

  constructor(
    // public dialogRef: MatDialogRef<SmsDialog>, @Inject(MAT_DIALOG_DATA) public data: ServerDetail,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private serverService: ServerService,
    public commonService: CommonService,
    private smsService: SmsService,
    private userService: UserService,
    private _location: Location

  ) {
    this.smsForm = this.fb.group({
      'name': [{value:'', disabled:true}],  // 'first_name': [{value:'' , disabled:true}],
      'validity':  [{value:'', disabled:true}], 
      'charge':  [{value:'', disabled:true}], 
      'no_of_sms':  [{value:'', disabled:true}], 
      'remaining_sms' : [{value:'',disabled:true}]
      // 'provider': ['', Validators.required],
      // 'description': ['', Validators.required],

    });
    this.customer_id = localStorage.getItem('id');
  }

  ngOnInit() {
        this.smsService.getCustomerSMSid(this.customer_id ).subscribe(data => {
          console.log(data)
          if (data['response'].id) {
              this.smsService.getSMSPlanByID(data['response']['id']).subscribe(data => {
              this.serverData = data[0];
              this.getRemainingSMS();
            })
          }else{
            this.toastr.error('Error !','Unable to access SMS Plan Because of SMS Type Custom');
            this._location.back();
            // this.router.navigate(['sms/customer-sms-template']);
          }
        })
  }

  public onNoClick(e){

  }

  private getRemainingSMS(){
    this.userService.getCustomerRemainingSMS(this.customer_id).subscribe(data => {
      if (data) {
        this.serverData['remaining_sms'] = data;
        this.smsForm.get('remaining_sms').setValue(data);
        this.smsForm.updateValueAndValidity();
       console.log(this.smsForm.value)
      }
    });
  }
}
