import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { ProductService, CommonService, Errors, mailSendError, packageUpdated, invalidFormError, errorMessage, duplicatePackage } from '../../../core';
import { PackageService } from '../package.service';
import { EmailService } from '../../../core/services/email.service';


@Component({
  selector: 'app-custom-package-update',
  templateUrl: './custom-package-update.component.html',
  styleUrls: ['./custom-package-update.component.css']
})
export class CustomPackageUpdateComponent implements OnInit {
  customerPbxForm: FormGroup;
  customerOcForm: FormGroup;
  customers = '';
  error = '';
  productId = '';
  packageId = '';
  bundleID:any = '';
  outbundleID:any = '';
  romingID:any = '';
  tcID:any = '';
  isDisabled = false
  Bundle_type:any;
  Roaming_type:any;
  TC_type:any;
  old_package = '';
  new_package = '';
  masterSelect = false;
  isReadonly = true;
  isSelected: boolean;
  submitted = false;
  pbxDiv = false;
  ocDiv = false;
  formValid = false;
  errors: Errors = { errors: {} };
  customerName: any = {};
  emailContentData: any = {};

  old_bundle_id : any ;
  old_out_bundle_id : any;
  old_roaming_id : any ;
  old_tc_id : any ;

  update_bundle_id : any ;
  update_out_bundle_id : any ;
  update_roaming_id : any ;
  update_tc_id : any ;

  is_bundle_type : any ;
  out_bundle_type : any ;
  is_roaming_type : any;
  teleconsultation : any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private packageService: PackageService,
    private productService: ProductService,
    public commonService: CommonService,
    private emailService: EmailService
  ) {
    this.customerPbxForm = this.fb.group({
      'user': [''],
      'pbx_id': [''],
      'package_id': [''],
      'package_old_name': ['', Validators.required],
      'allCheck': ['']
    });
    this.customerOcForm = this.fb.group({
      'user': [''],
      'oc_id': [''],
      'package_id': [''],
      'package_old_name_oc': ['', Validators.required],
      'allCheck': ['']
    });
  }

  get package_old_name() { return this.customerPbxForm.get('package_old_name'); }
  get package_old_name_oc() { return this.customerOcForm.get('package_old_name_oc'); }

  ngOnInit() {

    this.masterSelect = false;
    this.packageId = this.route.snapshot.queryParams.pId;
    this.productId = this.route.snapshot.queryParams.proId;
    this.bundleID = this.route.snapshot.queryParams.check
    this.outbundleID = this.route.snapshot.queryParams.outbundlecheck
    this.romingID = this.route.snapshot.queryParams.checkroming
    this.tcID = this.route.snapshot.queryParams.checkTC
    this.Bundle_type = this.route.snapshot.queryParams.bundleType
    this.Roaming_type = this.route.snapshot.queryParams.roamingType
    this.TC_type = this.route.snapshot.queryParams.TCType

  if ((this.bundleID == 'true') || (this.outbundleID == 'true') || (this.romingID == 'true') || (this.tcID == 'true')) {
    this.isDisabled = true
  }
  else{
    this.isDisabled = false
  }

    if (this.productId === '1') {
      this.pbxDiv = true;
      this.ocDiv = false;
    } else if (this.productId === '2') {
      this.ocDiv = true;
      this.pbxDiv = false;
    } else {
      this.pbxDiv = false;
      this.ocDiv = false;
    }

    this.packageService.getPackageCustomer(Number(this.packageId), Number(this.productId)).subscribe(data => {
      this.customers = data.response;
      var localdata = JSON.parse(localStorage.getItem('data'));
      if (this.productId === '1') {
        this.old_package = localdata.package_name;
      } else if (this.productId === '2') {
        this.old_package = localdata.package_name_oc;
      }

    }, err => {
      this.error = err.message;
    });
  }
  allUserCheck(event) {
    var count = 0;
    this.packageId = this.route.snapshot.queryParams.pId;
    this.productId = this.route.snapshot.queryParams.proId;
    let allChecked = event.checked;
    if (allChecked == true || allChecked == "true") {
      var elements = (<HTMLInputElement[]><any>document.getElementsByName("user"));
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].type == "checkbox") {
          if (elements[i].checked) {
            count = count + 1;
          } else {
            elements[i].checked = true;
          }
        }
      }
      this.isReadonly = true;
      this.isSelected = true;
      this.formValid = true;
      var data = JSON.parse(localStorage.getItem('data'));
      if (this.productId === '1') {
        this.old_package = data.package_name;
      } else if (this.productId === '2') {
        this.old_package = data.package_name_oc;
      }
    } else {
      var data = JSON.parse(localStorage.getItem('data'));
      if (this.productId === '1') {
        this.old_package = data.package_name;
      } else if (this.productId === '2') {
        this.old_package = data.package_name_oc;
      }
      this.isReadonly = true;
      this.isSelected = false;
      this.formValid = false;
    }
  }

  change(event) {

    var count = 0;
    var inputTypes = 0;
    var elements = (<HTMLInputElement[]><any>document.getElementsByTagName("INPUT") && <HTMLInputElement[]><any>document.getElementsByName("user"));
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].tagName == 'INPUT') {
        inputTypes = inputTypes + 1;
        if (elements[i].type == "checkbox") {
          if (elements[i].checked) {
            count = count + 1;
          }
        }
      }
    }
    if (inputTypes >= 1 && count < inputTypes && count != 0) {
      this.isReadonly = false;
      this.old_package = "";
    } else {
      this.isReadonly = true;
      var data = JSON.parse(localStorage.getItem('data'));
      if (data.package_name) {
        this.old_package = data.package_name;
      } else {
        this.old_package = data.package_name_oc;
      }
    }
    if (inputTypes === count) {
      this.masterSelect = true;
      this.isReadonly = true;
      var data = JSON.parse(localStorage.getItem('data'));
      if (data.package_name) {
        this.old_package = data.package_name;
      } else {
        this.old_package = data.package_name_oc;
      }

    } else {
      this.formValid = false;
      this.masterSelect = false;
      //this.isReadonly = true;
      // var data = JSON.parse(localStorage.getItem('data'));
      // if(data.package_name){
      //   this.old_package = data.package_name;
      // }else{
      //   this.old_package = data.package_name_oc;
      // }

    }

    if (count > 0) {
      this.formValid = true;
    } else {
      this.formValid = false;
    }
  }

  async updatePbxForm() {
    if (this.customerPbxForm.valid) {
      let pack_data = JSON.parse(localStorage.getItem('data'));

      this.old_bundle_id = localStorage.getItem('old_bundle_id');
      this.old_out_bundle_id = localStorage.getItem('old_out_bundle_id');
      this.old_roaming_id = localStorage.getItem('old_roaming_id');
      this.old_tc_id = localStorage.getItem('old_tc_id');
     
      this.update_bundle_id  = pack_data['bundle_plan_id'];
      this.update_out_bundle_id  = pack_data['out_bundle_call_plan_id'];
      this.update_roaming_id = pack_data['roaming_plan_id'];
      this.update_tc_id = pack_data['teleConsultancy_call_plan_id'];

      this.is_bundle_type  = localStorage.getItem('is_bundle');
      this.out_bundle_type  = localStorage.getItem('out_bundle');
      this.is_roaming_type = localStorage.getItem('is_roaming');
      this.teleconsultation = localStorage.getItem('is_tc');

      this.submitted = true;
      this.errors = { errors: {} };
      var customerArr = [];
      var elements = (<HTMLInputElement[]><any>document.getElementsByName("user"));

      for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName == 'INPUT') {
          if (elements[i].checked == true) {
            let response_arr = elements[i].id.split("-");
            customerArr.push(response_arr[0]);
          }
        }
      }
      const credentials = this.customerPbxForm.value;
      credentials.bundleB = this.Bundle_type;
      credentials.roamingR = this.Roaming_type;
      credentials.TCT = this.TC_type;
      credentials.form_data = pack_data;
      credentials.customer_id = customerArr;
      let isNeedToResetRatesOfBundle = this.old_bundle_id != this.update_bundle_id && this.is_bundle_type == '1';
      let isNeedToResetRatesOfOutBundle = this.old_out_bundle_id != this.update_out_bundle_id && this.out_bundle_type == '1';
      let isNeedToResetRatesOfRoaming = this.old_roaming_id != this.update_roaming_id && this.is_roaming_type == '1';
      let isNeedToResetRatesOfTC = this.old_tc_id != this.update_tc_id && this.teleconsultation == '1';
      await this.resetMinutePlanCallRates(isNeedToResetRatesOfBundle, this.old_bundle_id);
      await this.resetMinutePlanCallRates(isNeedToResetRatesOfOutBundle, this.old_out_bundle_id);
      await this.resetMinutePlanCallRates(isNeedToResetRatesOfRoaming,this.old_roaming_id );
      await this.resetMinutePlanCallRates(isNeedToResetRatesOfTC, this.old_tc_id);

      credentials['bundlePlanName'] = pack_data['bundlePlanName']
      credentials['outBundlePlanName'] = pack_data['outBundlePlanName']
      credentials['roamingPlanName'] = pack_data['roamingPlanName']
      credentials['tcPlanName'] = pack_data['tcPlanName']
      credentials['featureRateName'] = pack_data['featureRateName']
      credentials['smsName'] = pack_data['smsName']
      credentials['circleName'] = pack_data['circleName']
      credentials['callPlanName'] = pack_data['callPlanName']
    

      
      if (credentials.allCheck == true || credentials.allCheck == "true") {        
        var route = "customUpdatePbxFeature";
        this.packageService.customPostPbxFeature(route, credentials).subscribe(data => {
          this.toastr.success('Success!', packageUpdated, { timeOut: 2000 });
          localStorage.removeItem('data');
          this.router.navigateByUrl('package/manage');
        }, err => {
          this.errors = err;
          this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
        });
      } else {
        var route = "customCreatePbxFeature";
        this.productService.checkValidPackage(credentials.package_old_name, '1').subscribe(data => {
          if (data.package_id >= 1) {
            this.toastr.error('Error!', duplicatePackage, { timeOut: 4000 });
          } else {
            this.packageService.customPostPbxFeature(route, credentials).subscribe(data => {
              this.toastr.success('Success!', packageUpdated, { timeOut: 2000 });
              localStorage.removeItem('data');
              this.router.navigateByUrl('package/manage');
            }, err => {
              this.errors = err;
              this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
            });
          }
        }, err => {
          this.error = err.message;
        });
      }
    } else {
      this.toastr.error('Info!', invalidFormError, { timeOut: 2000 });
    }
  }

  updateOcForm() {
    if (this.customerOcForm.valid) {
      let pack_data = JSON.parse(localStorage.getItem('data'));
      this.submitted = true;
      this.errors = { errors: {} };
      var customerArr = [];
      var elements = (<HTMLInputElement[]><any>document.getElementsByName("user"));

      for (let i = 0; i < elements.length; i++) {
        if (elements[i].checked == true) {
          customerArr.push(elements[i].value);
        }

      }
      const credentials = this.customerOcForm.value;
      credentials.form_data = pack_data;
      credentials.customer_id = customerArr;

      if (credentials.allCheck == true || credentials.allCheck == "true") {
        var route = "customUpdateOcFeature";
        this.packageService.customPostOcFeature(route, credentials)
          .subscribe(data => {
            this.commonService.getCustomerNameandEmail(credentials.customer_id).subscribe(data => {
              this.customerName = data.response[0];
              this.commonService.getEmailContentUsingCategory('OCPackageUpdation').subscribe(data => {
                if (data) {
                  this.emailContentData = data.response[0];
                  for (let i = 0; i < this.customerName.length; i++) {
                    this.emailService.sendEmail({
                      to: this.customerName[i].email,  //localStorage.getItem('uemail'),
                      subject: this.emailContentData.title,
                      text: this.emailContentData.content,
                      url: this.emailContentData.image,
                      category_id: this.emailContentData.email_category_id,
                      features: this.customerOcForm.value,
                      customer: 'customerOC',
                      userName: this.customerName[i].name //first name and last name
                    }).subscribe(data => {
                    }, err => {
                      this.toastr.error('Error!', mailSendError, { timeOut: 2000 });
                      this.errors = err.message;
                    });
                  }
                }
              });
            });
            this.toastr.success('Success!', packageUpdated, { timeOut: 2000 });
            localStorage.removeItem('data');
            this.router.navigateByUrl('package/manage');
          }, err => {
            this.errors = err;
            this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
          });
      } else {
        var route = "customCreateOcFeature";
        this.productService.checkValidPackage(credentials.package_old_name_oc, '2').subscribe(data => {
          if (data.package_id >= 1) {
            this.toastr.error('Error!', duplicatePackage, { timeOut: 4000 })
          } else {
            this.packageService.customPostOcFeature(route, credentials).subscribe(data => {
              this.toastr.success('Success!', packageUpdated, { timeOut: 2000 });
              localStorage.removeItem('data');
              this.router.navigateByUrl('package/manage');
            }, err => {
              this.errors = err;
              this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
            });
          }
        }, err => {
          this.error = err.message;
        });
      }
    } else {
      this.toastr.error('Info!', invalidFormError, { timeOut: 2000 });
    }
  }

  checkValidPackage(keyword, product) {
    let mykeyword = keyword.target.value;
    this.productService.checkValidPackage(mykeyword, product).subscribe(data => {
      if (data.package_id >= 1) {
        this.toastr.error('Error!', duplicatePackage, { timeOut: 4000 })
      }
    });
  }

  public resetMinutePlanCallRates(isNeedToResetRatesOfBundle, minute_plan_id){    
    if(isNeedToResetRatesOfBundle){
      this.packageService.removeAssociateBoosterFromMinutePlan(minute_plan_id)
      .subscribe(data => {
        // this.toastr.success('Success!', packageUpdated,{ timeOut: 2000 });
        this.router.navigateByUrl('package/manage');
      }, err => {
        this.errors = err;
        this.toastr.error('Error!',errorMessage,  { timeOut: 2000 });
      });
    }else{
      return;
    }
  }


}
