import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PackageService } from '../package.service';
import { CustomerData } from '../../../core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, ProductService, CommonService } from '../../../core';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  packageId: any;
  productId: any;
  errors: Errors = { errors: {} };
  error = '';
  customerList = '';
  groupName = '';

  constructor(
    private packageService: PackageService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.packageId = Number(this.route.snapshot.queryParams.pId);
    this.productId = Number(this.route.snapshot.queryParams.proId);
    this.groupName = this.route.snapshot.queryParams.pName;
    this.packageService.getPackageCustomer(Number(this.packageId), Number(this.productId)).subscribe(data => {
      this.customerList = data.response;
    });
  }

  openDialog(id): void {
    const dialogRef = this.dialog.open(CustomerDialog, {
      width: '80%',
      disableClose: true,
      data: { id: id }
    });
    dialogRef.afterClosed().subscribe();
  }

}


@Component({
  selector: 'customer-dialog',
  templateUrl: 'customer-details.html',
})

export class CustomerDialog {
  error = '';
  errors: Errors = { errors: {} };
  userForm: FormGroup;
  customer_id = "";
  userData: any = {};
  billingType = "";
  products = "";
  showPbx = false;
  showOc = false;
  product_id = "";
  str_array: any = [];
  packageData: any = [];
  ocPackage = '';
  products_arr = [];
  submitted = false;
  package_arr = [];
  isPbx = "";
  internalUser = "";
  countryList = "";
  countryCode = "";
  timeZone = "";
  emailContentData: any = {};
  customerName: any = {};
  companyName = "";
  emailId = "";
  userRole: number;
  isCredtiLimit = false;
  userType = "";

  constructor(
    public dialogRef: MatDialogRef<CustomerDialog>, @Inject(MAT_DIALOG_DATA) public data: CustomerData,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private userService: UserService,
    public commonService: CommonService,
  ) {
    this.userForm = this.formBuilder.group({
      'ocPackage': [''],
      'pbxPackage': [''],
      'f_name': [''],
      'l_name': [''],
      'email': [''],
      'username': [''],
      'mobile': [''],
      'company': [''],
      'company_address': [''],
      'company_phone': [''],
      'domain': [''],
      'id': [''],
      'status': [''],
      'account_manager': [''],
      'country': [""],
      'country_code': [''],
      'time_zone': [''],
      'billing_type': [""],
      'balance': ['0'],
      'credit_limit': ['0'],
      'gst_number': ['']
    });
  }

  get billing_type() { return this.userForm.get('billing_type'); }
  get balance() { return this.userForm.get('balance'); }
  get credit_limit() { return this.userForm.get('credit_limit'); }
  get company() { return this.userForm.get('company'); }
  get f_name() { return this.userForm.get('f_name'); }
  get l_name() { return this.userForm.get('l_name'); }
  get email() { return this.userForm.get('email'); }
  get username() { return this.userForm.get('username'); }
  get mobile() { return this.userForm.get('mobile'); }
  get user_type() { return this.userForm.get('user_type'); }
  get gst_number() { return this.userForm.get('gst_number'); }

  ngOnInit() {
    this.customer_id = this.data.id;
    this.userRole = parseInt(localStorage.getItem('type'));
    this.userService.getCustomerById(this.customer_id).subscribe(data => {

      data.response[0]['package_id'] = parseInt(data.response[0].package_id);
      data.response[0]['time_zone_id'] = parseInt(data.response[0].time_zone_id);
      this.userData = data.response[0];

      this.emailId = this.userData.email;
      this.userType = data.response[0].role;
      if (this.userData.billing_type == '1') {
        this.isCredtiLimit = false;
        this.userForm.controls.credit_limit.disable();
      } else {
        this.isCredtiLimit = true;
      }
      this.countryCode = this.userData.country_code;
      var products = this.userData.product_id;
      this.str_array = products.split(',');
      for (var i = 0; i < this.str_array.length; i++) {
        this.str_array[i] = this.str_array[i].replace(/^\s*/, "").replace(/\s*$/, "");
        this.products_arr.push(this.str_array[i]);
        if (this.str_array[i] == '1') {
          this.showPbx = true;
        }
        if (this.str_array[i] == '2') {
          this.showOc = true;
        }
      }
      if (this.userData.product_id == '1') {
        this.userService.getCustomerBillingTypePackage(this.userData.product_id, this.userData.package_id)
          .subscribe(datas => {
            this.billingType = datas.resp;
          }, err => {
            this.error = err.message;
          });
      }
    }, err => {
      this.error = err.message;
    });

    this.productService.getProductInfo().subscribe(data => {
      this.products = data.response;
    }, err => {
      this.error = err.message;
    });

    this.productService.getOcPackageInfo().subscribe(data => {
      this.ocPackage = data.response;
    }, err => {
      this.error = err.message;
    });

    this.userService.getInternalUser().subscribe(data => {
      this.internalUser = data.response;
    }, err => {
      this.error = err.message;
    });

    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
    }, err => {
      this.error = err.message;
    });

    this.commonService.getTimezone().subscribe(data => {
      this.timeZone = data.response;
    });
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

}