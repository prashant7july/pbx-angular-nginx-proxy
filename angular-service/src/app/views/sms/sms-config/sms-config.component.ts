import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AllGlobalRate, } from 'src/app/core/models/all_globalRate.model';
import { Page } from '../../../core/models';
import { SmsService } from '../sms.service';
import { DidService } from '../../DID/did.service';
@Component({
  selector: 'app-sms-config',
  templateUrl: './sms-config.component.html',
  styleUrls: ['./sms-config.component.css']
})
export class SmsConfigComponent implements OnInit {

  error = '';
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  filterObj: any = {};
  rateplanForm: FormGroup;
  categoryList: any;
  isShowClickToCall : boolean = false;
  tele_consultancy: boolean = false;

  constructor(
    private smsService: SmsService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private didService: DidService,

  ) {
    this.rateplanForm = this.fb.group({
      isCheckAllConfig: [''],
      smsConfigForm: new FormArray([]),   // this.fb.array([])
    });
  }

  ngOnInit() {
    //get active feature
    this.didService.getActiveFeature(localStorage.getItem('id')).subscribe(data => {
      
      this.tele_consultancy = data[0].tele_consultancy;

      if(data[0].tele_consultancy == '1'){
        this.tele_consultancy = true;
      }
      if (data[0].click_to_call == '1') {
        this.isShowClickToCall = true;
      }
    });

    this.smsService.getSMSCategories().subscribe(data => {
      this.categoryList = data;
      if (data) {
        this.smsService.getSMSService(localStorage.getItem('id')).subscribe(data2 => {
          if (data2.length) {
            this.setDefaultValue(data2); // set default value in form
          } else {
            this.setDefaultValue(data); // set default value in form
          }
        });
      }
    }, err => {
      this.error = err.message;
    });
  }

  public setDefaultValue(data) {
    let control = <FormArray>this.rateplanForm.controls.smsConfigForm;
    data.forEach(x => {      

      if((x.category_name =="TC SMS Package" || x.name =="TC SMS Package") && !this.tele_consultancy){
        return;
      }
      if((x.category_name =="C2C module OTP" ||  x.name =="C2C module OTP") &&   !this.isShowClickToCall){
        return;
      }
      control.push(
        this.fb.group({
        name: x.category_name ? x.category_name : x.name,
        value: x.value ? Number(x.value) : '',
      })
      );
    });
    this.manageSelectAllBtn();
  }

  submitRatePlan() {
    const credentials = this.rateplanForm.value;
    credentials['customer_id'] = Number(localStorage.getItem('id'));
    this.smsService.createSMSService(credentials).subscribe((data) => {
      if (data['code'] == 200) {
        this.toastr.success('Success!', data['message'], { timeOut: 2000 });
        // this.router.navigate(['/sms/customer-sms-plan'])
      }
      else {
        this.toastr.error('Error!', data['message'], { timeOut: 2000 });
      }
    })
  }
  show(e) {
  }

  public getfeatureRateControls() {
    return (this.rateplanForm.get('smsConfigForm') as FormArray).controls;
  }

  public checkAllConfig(isCheck: boolean) {
    if (isCheck) {
      this.getfeatureRateControls().forEach(x => {
        let element = (x as FormGroup).controls;
        element.value.setValue(1);
      });
    } else {
      this.getfeatureRateControls().forEach(x => {
        let element = (x as FormGroup).controls;
        element.value.setValue(0);
      });
    }
  }

    
  public manageSelectAllBtn(){
    let control = <FormArray>this.rateplanForm.controls.smsConfigForm;
    let configArray : Array<any> = control.value;
    let checked = configArray.filter(item=>{  if(item.value == 1 || item.value == true) { return item;} });  

    if(checked.length == configArray.length){
      this.rateplanForm.get('isCheckAllConfig').setValue(true);
    }else{
      this.rateplanForm.get('isCheckAllConfig').setValue(false);
    }
  }

}
