import { Component, OnInit } from '@angular/core';
import { Errors, CommonService, invalidForm, didUpdated, errorMessage, maxChanelMessage } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DidService } from '../did.service';

@Component({
  selector: 'app-manage-did',
  templateUrl: './manage-did.component.html',
  styleUrls: ['./manage-did.component.css']
})
export class ManageDidComponent implements OnInit {
  didId = "";
  errors: Errors = { errors: {} };
  didForm: FormGroup;
  submitted = false;
  error = "";
  didData: any = {};
  isMonthlyRate: boolean;
  isSellingRate: boolean;
  maxLimit = "";
  providerList = "";
  countryList = "";
  billingType = "";
  userRole = "";

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    private didService: DidService,
    private router: Router,
  ) {
    this.didForm = this.fb.group({
      'did_number': [""],
      'billing': [Validators.required],
      'provider': ["", Validators.required],
      'country': ["", Validators.required],
      'concurrent_call': ['2', Validators.required],
      'activated': ['1'],
      'fixrate': ['', Validators.required],
      'connect_charge': ['0', Validators.required],
      'selling_rate': ['', Validators.required],
    });
  }

  ngOnInit() {
    this.didId = this.route.snapshot.queryParams.id;
    this.userRole = localStorage.getItem('type');// use to hide/disabled button when u r login with any internal user

    this.didService.getDIDById(this.didId).subscribe(data => {
      this.didData = data[0];
      this.maxLimit = this.didData.max_concurrent;
      this.billingType = this.didData.billingtype;
      this.manageRateByRes(this.billingType);
    }, err => {
      // this.toastr.error('Error!',"Can't get the details", {timeOut: 2000});
      this.errors = err.message;
    });

    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
    }, err => {
      this.error = err.message;
    });

    //get Providers list
    this.commonService.getProviders().subscribe(data => {
      this.providerList = data.response;
    }, err => {
      this.error = err.message;
    });

    //manage selling and month rate inputs

    // if(this.billingType=='1'){
    //   this.isMonthlyRate = true;
    //   this.isSellingRate = true;
    //   this.didForm.controls.fixrate.enable(); 
    //   this.didForm.controls.selling_rate.enable(); 
    // }else if(this.billingType=='2'){
    //   this.isMonthlyRate = true;
    //   this.isSellingRate = false;
    //   this.didForm.controls.fixrate.enable(); 
    //   this.didForm.controls.selling_rate.disable();
    // }else if(this.billingType=='3'){
    //   this.isMonthlyRate = false;
    //   this.isSellingRate = true;
    //   this.didForm.controls.fixrate.disable(); 
    //   this.didForm.controls.selling_rate.enable();
    // }else{
    //   this.isMonthlyRate = false;
    //   this.isSellingRate = false;
    //   this.didForm.controls.fixrate.disable(); 
    //   this.didForm.controls.selling_rate.disable();
    // }
  }

  get billing() { return this.didForm.get('billing'); }
  get provider() { return this.didForm.get('provider'); }
  get country() { return this.didForm.get('country'); }
  get concurrent_call() { return this.didForm.get('concurrent_call'); }

  get fixrate() { return this.didForm.get('fixrate'); }
  get connect_charge() { return this.didForm.get('connect_charge'); }
  get selling_rate() { return this.didForm.get('selling_rate'); }

  manageRate(event) {
    var billingType = event.target.value;
    if (billingType == '1') {
      this.isMonthlyRate = true;
      this.isSellingRate = true;
      this.didForm.controls.fixrate.enable();
      this.didForm.controls.selling_rate.enable();
    } else if (billingType == '2') {
      this.isMonthlyRate = true;
      this.isSellingRate = false;
      this.didForm.controls.fixrate.enable();
      this.didForm.controls.selling_rate.disable();
    } else if (billingType == '3') {
      this.isMonthlyRate = false;
      this.isSellingRate = true;
      this.didForm.controls.fixrate.disable();
      this.didForm.controls.selling_rate.enable();
    } else {
      this.isMonthlyRate = false;
      this.isSellingRate = false;
      this.didForm.controls.fixrate.disable();
      this.didForm.controls.selling_rate.disable();
    }
  }

  manageRateByRes(billingType) {
    if (billingType == '1') {
      this.isMonthlyRate = true;
      this.isSellingRate = true;
      this.didForm.controls.fixrate.enable();
      this.didForm.controls.selling_rate.enable();
    } else if (billingType == '2') {
      this.isMonthlyRate = true;
      this.isSellingRate = false;
      this.didForm.controls.fixrate.enable();
      this.didForm.controls.selling_rate.disable();
    } else if (billingType == '3') {
      this.isMonthlyRate = false;
      this.isSellingRate = true;
      this.didForm.controls.fixrate.disable();
      this.didForm.controls.selling_rate.enable();
    } else {
      this.isMonthlyRate = false;
      this.isSellingRate = false;
      this.didForm.controls.fixrate.disable();
      this.didForm.controls.selling_rate.disable();
    }
  }

  maxChanelLimit(event) {
    if (event.target.value > 30) {
      this.toastr.error('', maxChanelMessage, { timeOut: 2000 });
      this.maxLimit = '30';
    } else {
      return true;
    }
  }

  submitDIDForm() {
    //console.log(this.findInvalidControls());

    if (this.didForm.valid) {
      this.submitted = true;
      const credentials = this.didForm.value;

      credentials.id = this.didId;

        credentials.didType = Number(credentials.didType),
        credentials.did_number = Number(credentials.did_number),
        credentials.billing = Number(credentials.billing),
        credentials.concurrent_call = Number(credentials.concurrent_call),
        credentials.fixrate = Number(credentials.fixrate),
        credentials.connect_charge = Number(credentials.connect_charge),
        credentials.group = Number(credentials.group)

        console.log(credentials,"--------credentials");
        return;
        
      if (credentials.concurrent_call > 30) {
        this.toastr.error('', maxChanelMessage, { timeOut: 2000 });
        this.maxLimit = '30';
        return;
      } else {
        //post data -------------//
        this.didService.createDID('updateDID', credentials)
          .subscribe(data => {
            this.toastr.success('Success!', didUpdated, { timeOut: 2000 });
            this.router.navigateByUrl('did/view');
          }, err => {
            this.errors = err;
            this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
          });
        //------------------------//
      }
    } else {
      this.toastr.error('Error!', invalidForm, { timeOut: 2000 });
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.didForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancelForm() {
    this.didForm.reset();
    this.router.navigateByUrl('did/view');
  }
}
