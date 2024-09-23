import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, formError, DIDPurchased, ProductService } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { DidService } from '../did.service';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-did-purchase',
  templateUrl: './did-purchase.component.html',
  styleUrls: ['./did-purchase.component.css']
})
export class DidPurchaseComponent implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  didForm: FormGroup;
  countryList:any = "";
  CountryFilter:any;
  filter:any;
  customerList = "";
  did: any[] = [];
  DIDsFilter:any;
  filterDID:any;
  selectedDid: any[] = [];
  isSelected: boolean = false;
  disableList: boolean;
  customerProduct: any;
  ProductFilter:any;
  filterProduct:any;
  customerInfo ;
  vmn_tag = false;
  didNum:any = "";
  didType:any = "";
  monthlyPrice:any = "";
  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';  
   public fields: Object = { text: 'name', value: 'id' }; 
   public fields1: Object = { text: 'label', value: 'value.id' };
   public fields6: Object = { text: 'state_name', value: 'id' };
   public fields7: Object = { text: 'name', value: 'id' };  
   public placeholder: string = 'Select Country';
   public placeholder2: string = 'Select DIDs';
   public placeholder1: string = 'Select Product';
   public placeholder4: string = 'Select OC Package';
   public popupHeight: string = '200px';
   public popupWidth: string = '200px';
 

  constructor(
    private didService: DidService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private productService: ProductService,
    private userService: UserService,
  ) {
    this.didForm = this.fb.group({
      'did_number': ["", [Validators.required]],
      'country': ["", Validators.required],
      'product_id': ["",  Validators.required]
    });
  }

  get did_number() { return this.didForm.get('did_number'); }
  get country() { return this.didForm.get('country'); }
  get product_id() { return this.didForm.get('product_id'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");    
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }
  Productremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.customerProduct.filter((data) =>{    
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
  Gatewayremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.countryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  ngOnInit() {
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filter = this.CountryFilter = this.countryList.slice();
    }, err => {
      this.error = err.message;
    });

    this.productService.getProductCustomerWise(localStorage.getItem('id')).subscribe(data => {
      this.customerProduct = data.response;
      this.filterProduct = this.ProductFilter = this.customerProduct.slice();
    });

    this.userService.getCustomerById(localStorage.getItem('id')).subscribe(data => {      
      this.customerInfo = data.response[0];
     
    })
  }

  getCountryDID(event) {
    this.didForm.get('did_number').reset();
    let didType = "";
    this.did = [];
    this.selectedDid = []; //for selected did price
    this.isSelected = false; //for selected did price table view
    this.disableList = false;        
    let obj= {
      customer_id: localStorage.getItem('id'),
      country_id: event.value
    }
    this.didService.getDIDByCountry(obj).subscribe(data => {      
      this.did = [];
      
      if (data != '') {
        for (let i = 0; i < data.length; i++) {
          if (data[i].did_type == '1' || data[i].did_type == '2') {
            didType = "DID";
          } else {
            didType = "TFN";
          }
          //****IMPORTANT****** */ did value combination: "did_id + did_number + did_type + did_selling_price (INR) + did_monthly_price (INR) + did_connect_price (INR) + billing type"
          this.did.push({ label: data[i].did + ' - ' + didType, value: { id: data[i].id + '-' + data[i].did + '-' + data[i].did_type + '-' + data[i].selling_rate + '-' + data[i].fixrate + '-' + data[i].connection_charge + '-' + data[i].billingtype + '-' + data[i].vmn, did: data[i].did }, type: didType })
          this.filterDID = this.DIDsFilter = this.did.slice();
        }
      } else {
        this.disableList = true;
        this.did.push({ label: 'No DID Found', value: '' });
        this.filterDID = this.DIDsFilter = this.did.slice();

      }
    });
  }

  submitDidForm() {
    let user_id = localStorage.getItem("id");
    let uemail = localStorage.getItem("uemail");
    let uname = localStorage.getItem("uname");
    let url = location.host;
    if (this.didForm.valid) {
      this.submitted = true;
      const credentials = this.didForm.value;
      
      credentials.customer = user_id;
      credentials['customer'] = Number(credentials['customer']);
      credentials.customerName = uname;
      credentials.customerEmail = uemail;
      credentials.url = url;
      let didList :any = credentials['did_number'] ? credentials['did_number'] : [];
      let charge = 0;
      didList.forEach(element => {
        charge += Number((element.split('-'))[4]);
      });        
      
      if((this.customerInfo['billing_type'] == '1' && (this.customerInfo['balance'] > charge)) || this.customerInfo['billing_type'] == '2' ){
      this.userService.getUserByType('0').subscribe(data => {
       let adminEmail = data.response[0].email;
       credentials['charge'] = this.monthlyPrice;
       credentials['charge'] = Number(credentials['charge']);
       credentials['type'] = this.didType;
       if(adminEmail){
        credentials.adminEmail = adminEmail;
        credentials.country_name = this.countryList.filter(item => item.id == credentials.country)[0]['name'];
         this.didService.assignDID('purchaseDID', credentials)
           .subscribe(data => {
             this.toastr.success('Success!', DIDPurchased, { timeOut: 2000 });
             if(this.customerInfo['billing_type'] == '1'){
             this.productService.SharingData.next(this.customerInfo['balance']-charge);
             }
             this.router.navigateByUrl('did/mydid-view');
           }, err => {
             this.errors = err;
           });
       }else{
        this.toastr.error('Error!', 'Admin has no mail Id !', { timeOut: 2000 });
       }      
      }, err => {
        this.error = err.message;
      });
    }else{
      this.toastr.error('You have insufficient balance.','Error!', { timeOut: 2000 })
    }
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
      let did_selling_price = splitData[3];
      let did_monthly_price = splitData[4];
      this.monthlyPrice = did_monthly_price;
      let did_connect_price = splitData[5];
      let did_billing = splitData[6];
      
      let vmn;                        
      if(splitData[7] !== 'undefined'){
        this.vmn_tag = true;        
        vmn = splitData[7] !== "null" ? splitData[7] : "";
      }else{
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
      newElement['vmn'] = vmn;

      this.selectedDid.push(newElement);
      this.isSelected = true;
    }
  }

  getDidType(e){    
    this.didType = e['itemData']['type'];      
  }

  cancelForm() {
    this.didForm.reset();
    this.router.navigateByUrl('did/mydid-view');
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoPurchaseDidDialog, {
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
  selector: 'infoPurchaseDid-dialog',
  templateUrl: 'infoPurchaseDid-dialog.html',
})

export class InfoPurchaseDidDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoPurchaseDidDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}