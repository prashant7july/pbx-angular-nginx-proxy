import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, formError, DIDassign, ProductService } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { DidService } from '../did.service';
import { UserService } from '../../user/user.service';
import { isClipEffect } from 'html2canvas/dist/types/render/effects';

@Component({
  selector: 'app-assign-did',
  templateUrl: './assign-did.component.html',
  styleUrls: ['./assign-did.component.css']
})
export class AssignDidComponent implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  assignDIDForm: FormGroup;
  countryList:any = "";
  CountryFilter: any;
  filterCountry: any;
  customerList = "";
  did = [];
  filterDID: any;
  DIDsFilter: any;
  selectedDid: any[] = [];
  customerCompany = '';
  disableList: boolean;
  isSelected: boolean = false;
  customerProduct: any;
  ProductFilter: any;
  filterProduct: any;
  allCustomer: any;
  CustomerFilter: any;
  filterCustomer: any;
  vmn_tag = false;
  didType:any = "";
  is_vmn = [];
  is_product: boolean = false;
  public mode = 'CheckBox';
  check_pbx: boolean = false;
  monthlyPrice: any = '';
  menus: any;
  assignDidMenu: any;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public fields5: Object = { text: 'name', value: 'id' };
  public fields1: Object = { text: 'label', value: 'value.id' };
  public fields2: Object = { text: 'company_name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';  
  public placeholder: string = 'Select Country';
  public placeholder4: string = 'Select Product';
  public placeholder1: string = 'Select DIDs';
  public placeholder2: string = 'Select Product';
  public placeholder3: string = 'Select Customer';

  constructor(
    private didService: DidService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    public userService: UserService,
    public dialog: MatDialog,
    private productService: ProductService,
  ) {
    this.assignDIDForm = this.fb.group({
      'did_number': ["", [Validators.required]],
      'customer': ["", Validators.required],
      'country': ["", Validators.required],
      'product_id': ["", Validators.required]
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.assignDidMenu = this.menus.find((o) => o.url === '/did/assign');

  }

  get did_number() { return this.assignDIDForm.get('did_number'); }
  get customer() { return this.assignDIDForm.get('customer'); }
  get country() { return this.assignDIDForm.get('country'); }
  get product_id() { return this.assignDIDForm.get('product_id'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {

    if(this.assignDidMenu.all_permission == '0' && this.assignDidMenu.view_permission == '1'){
      this.assignDIDForm.disable();
    }
    let productId = localStorage.getItem('product_id');
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filterCountry = this.CountryFilter = this.countryList.slice();
    }, err => {
      this.error = err.message;
    });

    //get customer list
    this.didService.getCustomerList().subscribe(data => {
      this.customerList = data;
    }, err => {
      this.error = err.message;
    });

    this.userService.getCustomerCompany(productId).subscribe(data => {

      this.customerCompany = data.response;
    });

    this.userService.getProduct().subscribe(data => {
      this.customerProduct = data.response;
      this.filterProduct = this.ProductFilter = this.customerProduct.slice();
    });
  }

  getCountryDID(event) {
    this.assignDIDForm.get('did_number').reset();
    this.assignDIDForm.get('customer').reset();    
    let didType = "";
    let country_id = event.value;
    let obj= {
      customer_id: null,
      country_id: event.value
    }
    this.didService.getDIDByCountry(obj).subscribe(data => {
      this.did = [];
      if (data != '') {
        this.disableList = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i].did_type == '1' || data[i].did_type == '2') {
            didType = "DID";
          } else {
            didType = "TFN";
          }
          this.did.push({ label: data[i].did + ' - ' + didType, value: { id: data[i].id + '-' + data[i].did + '-' + data[i].did_type + '-' + data[i].selling_rate + '-' + data[i].fixrate + '-' + data[i].connection_charge + '-' + data[i].billingtype + '-' + data[i].did_group + '-' + data[i].vmn, did: data[i].did } })
          this.filterDID = this.DIDsFilter = this.did.slice();
        }
      } else {
        this.disableList = true;
        this.did.push({ label: 'No DID Found', value: '' });
        this.filterDID = this.DIDsFilter = this.did.slice();

      }
    });
  }

  getDidType(e){
    let type ;
     type = e.itemData.label.split('-')[1];
    this.didType = type;
      
  }

  getProductWiseCustomer(e, flag) {
    this.assignDIDForm.get('customer').reset();
    this.is_product = true;
    if (e.value) {
      this.assignDIDForm.get('did_number').setValue('');
      if (e.value === 1) {
        this.check_pbx = true;
      } else {
        this.check_pbx = false;
      }
    }
    let obj = {};
    if (flag === true) {
      obj['id'] = !e.value ? 1 : e.value;
      obj['check_vmn'] = 0;
    } else {
      obj['id'] = e;
      obj['check_vmn'] = 1;
    }
    this.didService.getProductWiseCustomer(obj).subscribe(data => {
      this.allCustomer = data.response;
      this.filterCustomer = this.CustomerFilter = this.allCustomer.slice();
    });
  }
  productremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.customerProduct.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.countryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  DIDsremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.did.filter((data) =>{    
      return data['label'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Productremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.customerProduct.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Customerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.allCustomer.filter((data) =>{    
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  didremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.did.filter((data) =>{    
      return data['label'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }






  submitAssignDIDForm() {

    let uemail = localStorage.getItem("uemail");
    let url = location.host;

    

    if (this.assignDIDForm.valid) {
      this.submitted = true;
      const credentials = this.assignDIDForm.value;
      credentials['c_id'] = Number(localStorage.getItem('id'));
      credentials.adminEmail = uemail;
      credentials.url = url;

      this.userService.getCustomerById(credentials['customer']).subscribe(data => {
        
        
        credentials['customerEmail'] = data.response[0].email;
        let userData = data.response[0];
        let didList: any = credentials['did_number'] ? credentials['did_number'] : [];
        let charge = 0;
        didList.forEach(element => {
          charge += Number((element.split('-'))[4]);
        });
        if ((userData['billing_type'] == '1' && (Number(userData['balance']) > charge)) || userData['billing_type'] == '2') {
          credentials['charge'] = Number(this.monthlyPrice);
          credentials['type'] = this.didType;
          this.didService.assignDID('assignDID', credentials)
            .subscribe(data => {
              this.toastr.success('Success!', DIDassign, { timeOut: 2000 });
              this.router.navigateByUrl('did/view');
            });
        } else {
          this.toastr.error('You have insufficient balance.', 'Error!', { timeOut: 2000 })
        }
      })
    } else {
      this.toastr.error('Error!', formError, { timeOut: 2000 });
    }
  }

  showDidSellingPrice(e) {
    var did_typ = '';
    this.selectedDid = [];
    this.isSelected = false;
    for (let i = 0; i < e.value.length; i++) {      
      var newElement = {};
      var didId = e.value[i];
      var splitData = didId.toString().split('-');
      let did_id = splitData[0]; // not needed
      let did_num = splitData[1];
      let did_kind = splitData[2]; // not needed
      if (did_kind == '1' || did_kind == '2') {
        did_typ = "DID";
      } else {
        did_typ = "Tollfree";
      }
      this.didType = did_typ;
      
      let did_selling_price = splitData[3];
      let did_monthly_price = splitData[4];
      this.monthlyPrice = did_monthly_price;
      let did_connect_price = splitData[5];
      let did_billing = splitData[6];
      let did_group = splitData[7];
      var vmn;
      if (splitData[8] !== 'undefined') {
        this.vmn_tag = true;
        vmn = splitData[8] !== "null" ? splitData[8] : "";
      } else {
        this.vmn_tag = false
      }

      switch (did_billing) {
        case '1':
          did_billing = 'Fix per month + Dialoutrate';
          break;
        case '2':
          did_billing = 'Fix per month';
          break;
        case '3':
          did_billing = 'Only dialout rate';
          break;
        case '4':
          did_billing = 'Free';
          break;
      }

      newElement['did'] = did_num;
      newElement['selling_price'] = did_selling_price;
      newElement['connect_price'] = did_connect_price;
      newElement['monthly_price'] = did_monthly_price;
      newElement['billing_type'] = did_billing;
      newElement['did_type'] = did_typ;
      newElement['did_group'] = did_group;
      newElement['vmn'] = vmn;

      this.selectedDid.push(newElement);
      this.isSelected = true;
    }
  }


  selectVmnGroup(e) {
    this.assignDIDForm.get('customer').reset();
    this.is_vmn = [];
    if (this.check_pbx == true) {
      e.value.map(data => {
        this.is_vmn.push(data.split('-')[7]);
      });
      this.is_vmn.includes('VMN') ? this.getProductWiseCustomer(1, false) : this.getProductWiseCustomer(1, true);
    }
  }

  cancelForm() {
    this.assignDIDForm.reset();
    this.router.navigateByUrl('did/view');
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoAssignDidDialog, {
      width: '80%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRefInfo.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefInfo.close('Dialog closed');
      }
    });
    dialogRefInfo.afterClosed().subscribe(result => {
    });
  }
}

@Component({
  selector: 'infoAssignDid-dialog',
  templateUrl: 'infoAssignDid-dialog.html',
})

export class InfoAssignDidDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoAssignDidDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}