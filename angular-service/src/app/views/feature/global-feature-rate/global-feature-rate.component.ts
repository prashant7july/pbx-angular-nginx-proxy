import { Component, OnInit ,Inject,} from '@angular/core';
import { FeaturesService } from '../feature.service';
import { Router,NavigationEnd } from '@angular/router';
import { Errors, CommonService,ExcelService ,Name_RegEx} from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AllGlobalRate,  } from 'src/app/core/models/all_globalRate.model';
import { Page} from '../../../core/models';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { InfoCircleDialog } from '../../config/view-circle/view-circle.component';

@Component({
  selector: 'app-global-feature-rate',
  templateUrl: './global-feature-rate.component.html',
  styleUrls: ['./global-feature-rate.component.css']
})
export class GlobalFeatureRateComponent implements OnInit {

  error = '';
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
  filterObj:any={};
  rateplanForm : FormGroup;
  feature_list: any;
  menus: any;
  globalFeatureMenu: any;

  constructor(
    public FeaturesService :FeaturesService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog ,
    private toastr: ToastrService,

  ) { 
    this.rateplanForm = this.fb.group({
       featureRateForm: new FormArray([]),   // this.fb.array([]) 
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.globalFeatureMenu = this.menus.find((o) => o.url === '/feature/globalRate');
  }

  ngOnInit() {

    
    if(this.globalFeatureMenu.all_permission == '0' && this.globalFeatureMenu.view_permission == '1'){
      this.rateplanForm.disable();
    }
  
    this.FeaturesService.getDefaultGlobalFeatureRate({}).subscribe(data => {
      this.feature_list = data;
      if(data){
        this.setDefaultValue(); // set default value in form
      }
    }); 
  }
 
  public setDefaultValue(){
    let control = <FormArray>this.rateplanForm.controls.featureRateForm;
    this.feature_list.forEach(x => {
      control.push(this.fb.group(x));
    });
    
  }

  submitRatePlan() {
    
    if (this.rateplanForm.valid) {
      const credentials = this.rateplanForm.value;
        
        this.FeaturesService.updateGlobalRate(credentials).subscribe((data) => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            // this.feature_list = [];
            // this.ngOnInit();
          } 
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        })
    }
  }

  public getfeatureRateControls() {
    return (this.rateplanForm.get('featureRateForm') as FormArray).controls;
  }

}


//global rate dilog

@Component(
  {
  selector: 'global-rate-dialog',
  templateUrl: 'global-rate-dialog.html',
})

export class GlobalRateDilog {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  globatrateForm: FormGroup;
  page = new Page();
  rows = new Array<AllGlobalRate>();
  feature_name = "";
  feature_limit = "";
  feature_rate = "";
 

  isEdit: boolean = false;
  featureRateData:any;
  errorField: any;
  exportData: any;
  dialog: any;
  constructor(
    public dialogRef: MatDialogRef<GlobalRateDilog>, @Inject(MAT_DIALOG_DATA) public data: AllGlobalRate,
    private router: Router,
    private fb: FormBuilder,
    public FeaturesService :FeaturesService,
    private toastr: ToastrService,
    public commonService: CommonService,
  ) {
    this.globatrateForm = this.fb.group({
      'feature_name' : ["" , [Validators.required]],
      'feature_limit' : [""],
      'feature_rate' : ["" , Validators.required],
       
    });
  }

  get name() { return this.globatrateForm.get('feature_name'); }
  get limit() { return this.globatrateForm.get('feature_limit'); }
  get rate() { return this.globatrateForm.get('feature_rate'); }

ngOnInit() {

          
    if (this.data.id) {
      this.isEdit = true;
      this.FeaturesService.getrateById(this.data.id).subscribe(data => {
        
        this.featureRateData = data[0] 
        
        // this.globatrateForm.controls.name.enable();

        // this.globatrateForm.get
        // this.feature_rate=this.feature_rate
        // this.didData = data[0];
        // this.maxLimit = this.didData.max_concurrent;
        // this.billingType = (this.didData.billingtype).toString();
        // this.didGroup = this.didData.did_group;
        // this.manageRateByRes(this.billingType);
      }, err => {
        this.errors = err.message;
      });
    }
}
public findInvalidControls() {
  const invalid = [];
  const controls = this.globatrateForm.controls;
  for (const name in controls) {
    if (controls[name].invalid) {
      invalid.push(name);
    }
  }
  return invalid;
}

submitGlobaRate() {
  if (this.globatrateForm.valid) {
    this.submitted = true;
    this.errors = { errors: {} };
    const credentials = this.globatrateForm.value;

    credentials.id = this.data.id ? this.data.id : null;
   
    this.FeaturesService.updateGlobalRate(credentials)
    .subscribe(data => {
      if (data['code'] == 200) {
        this.toastr.success('Success!', data['message'], { timeOut: 2000 });
        this.reloadFeature();
      }
      else {
        this.toastr.error('Error!', data['message'], { timeOut: 2000 });
      }
    });

  }
}
  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  reloadFeature() {
    this.globatrateForm.reset();
    this.FeaturesService.updateGridList();
    this.dialogRef.close();
  }

  }
  
  @Component({
    selector: 'globalrateInfo-dialog.html',
    templateUrl: 'globalrateInfo-dialog.html',
  })
  
  export class GlobalRateInfoDialog{
  
    error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  globatrateForm: FormGroup;
  page = new Page();
  rows = new Array<AllGlobalRate>();
  feature_name = "";
  feature_limit = "";
  feature_rate = "";
  circleForm: FormGroup;
    //dialogRefInfo: any;
    dialog: any;

    constructor(
    private fb: FormBuilder,
    public FeaturesService :FeaturesService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialogRefInfo: MatDialogRef<GlobalRateInfoDialog>, @Inject(MAT_DIALOG_DATA) public data: AllGlobalRate,
     
    ) { }
  
    ngOnInit() { }
  
    
    cancleDialog(): void {
      this.dialogRefInfo.close();
    }
    }
  
  
  

