import { Component, Inject, OnInit } from '@angular/core';
import { FeaturesService } from '../feature.service';
import { Router,NavigationEnd } from '@angular/router';
import { Errors, CommonService,ExcelService ,Name_RegEx} from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AllGlobalRate,  } from 'src/app/core/models/all_globalRate.model';

@Component({
  selector: 'app-upgrade-feature-rate-plan',
  templateUrl: './upgrade-feature-rate-plan.component.html',
  styleUrls: ['./upgrade-feature-rate-plan.component.css']
})
export class UpgradeFeatureRatePlanComponent implements OnInit {

  error = '';
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
  filterObj:any={};
  rateplanForm : FormGroup;
  feature_list: any;

  constructor(
    public FeaturesService :FeaturesService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog ,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<UpgradeFeatureRatePlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { 
    this.rateplanForm = this.fb.group({
       featureRateForm: new FormArray([]),   // this.fb.array([])
    });
  }

  ngOnInit() {
    console.log(this.data)
    var defaultGlobalFeatureRateList = [];
    var globalFeatureRateList = [];
    this.FeaturesService.getDefaultGlobalFeatureRate({}).subscribe(data => {
      defaultGlobalFeatureRateList = data;
      if(defaultGlobalFeatureRateList.length > 0){
        this.FeaturesService.getGlobalFeatureRate({featurePlanRateId:Number(this.data['id'])}).subscribe(data => {
          globalFeatureRateList = data;
          let managedArray = [];
          console.log(data);
          if(globalFeatureRateList.length > 0){
              let deniedModuleSet = globalFeatureRateList.reduce((a,c) => a.add(c.global_feature_id), new Set());
              defaultGlobalFeatureRateList = defaultGlobalFeatureRateList.filter(v => !deniedModuleSet.has(v.id));
              let datas = defaultGlobalFeatureRateList;
              this.feature_list = defaultGlobalFeatureRateList ? defaultGlobalFeatureRateList : [];
              this.setDefaultValue(); // set default value in form

          }
         
        });
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
    console.log(this.rateplanForm.value)
    if (this.rateplanForm.valid) {
      const credentials = this.rateplanForm.value;
        console.log(credentials);
        credentials['featurePlanRateId'] = this.data['id'];
        this.FeaturesService.upgradeFeaturePlanRate(credentials).subscribe((data) => {
          if (data['code'] == 200) {
            this.dialogRef.close();
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
          } 
          else {
            this.dialogRef.close();
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
    }
  }

  public getfeatureRateControls() {
    console.log((this.rateplanForm.get('featureRateForm') as FormArray).controls);
    return (this.rateplanForm.get('featureRateForm') as FormArray).controls;
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

}
