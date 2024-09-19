import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, formError, DIDassign, ProductService, BoosterPlanAssign } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../user/user.service';
import { MinutePlanService } from '../customer-minute-plan.service';
import { DidService } from '../../DID/did.service';

@Component({
  selector: 'app-assign-booster-plan',
  templateUrl: './assign-booster-plan.component.html',
  styleUrls: ['./assign-booster-plan.component.css']
})
export class AssignBoosterPlanComponent implements OnInit {

  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  assignDIDForm: FormGroup;
  customerList = "";
  filterCustomer:any;
  boosterList = [];
  boosterListVariable = []
  boosterPlan:any;
  
  BoosterFilter:any;
  selectedDid : any[] = [];
  customerCompany = '';
  disableList: boolean;
  isSelected: boolean = false;
  customerProduct: any;
  menus: any;
  assignBoosterMenu: any;
  customerInfo ;
  public mode ;
  public selectAllText: string
//   public mode = 'CheckBox';;
//  public selectAllText: string = 'Select All'; 
  public fields: Object = { text: 'label', value: 'id' };
  public fields6: Object = { text: 'state_name', value: 'id' };
  // public fields3: Object = { text: 'name', value: 'id' };  
  public placeholder: string = 'Select Booster plan';
  public placeholder7: string = 'Select PBX Package';
  public placeholder4: string = 'Select OC Package';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  public fields2: Object = { text: 'gmtzone', value: 'id' };
  public placeholder2: string = 'Select Account Manager';
  public placeholder8: string = 'Select Time Zone';
  public fields3: Object = { text: 'name', value: 'id' };
  public placeholder3: string = 'Select Circle';

  constructor(
    private didService: DidService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    public userService: UserService,
    public dialog: MatDialog,
    private minutePlanService: MinutePlanService,
    ) {
    this.assignDIDForm = this.fb.group({
      'plan_type': ['',[Validators.required]],
      'booster_plan': ["", [Validators.required]],
      'customer': ["", Validators.required],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.assignBoosterMenu = this.menus.find((o) => o.url === '/callPlan/assign-booster');
   
  }

  get booster_plan() { return this.assignDIDForm.get('booster_plan'); }
  get customer() { return this.assignDIDForm.get('customer'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    if(this.assignBoosterMenu.all_permission == '0' && this.assignBoosterMenu.view_permission == '1'){
      this.assignDIDForm.disable();
    }
    let productId = localStorage.getItem('product_id');
  }
  
  getBoosterPlan(event?){
    this.boosterList = [];
    this.minutePlanService.viewBoosterPlanByType({}).subscribe(data => {
      if(data!= ''){
      this.disableList = false;
      for(let i=0; i<data.length; i++){      
        this.boosterList.push({ label: data[i].name , value: { id: data[i].id + '-' + data[i].name + '-' + data[i].validity + '-' + data[i].charge + '-' + data[i].extra_charge } });
        this.boosterListVariable.push({ label: data[i].name , value: { id: data[i].id + '-' + data[i].name + '-' + data[i].validity + '-' + data[i].charge + '-' + data[i].extra_charge } });
        this.boosterPlan = this.BoosterFilter = this.boosterListVariable.slice()          
      }  
    }else{
      this.disableList = true;
      this.boosterList.push({label:'No Booster Plan Found', value:''});      
    }
    });
  }


  submitAssignDIDForm() {  
    let obj = {};
    if (this.assignDIDForm.valid) {
      this.submitted = true;
      const credentials = this.assignDIDForm.value;
      obj['customer_id'] = credentials['customer'];
      obj['purchase_date'] = new Date();
      obj['charge_status'] = this.customerInfo['billing_type'] == '1' ? 1 : 0;
      obj['role_id'] = Number(localStorage.getItem('type'));
      obj['process_by'] = Number(localStorage.getItem('id'));
      obj['booster_info'] = credentials['booster_plan'];
      obj['adminEmail'] = localStorage.getItem('uemail');
      obj['booster_for'] = Number(credentials['plan_type'])
      let boosterList :any = credentials['booster_plan'] ? credentials['booster_plan'] : [];
      let charge = 0;
      boosterList.forEach(element => {
      charge += Number((element.split('-'))[3]);
      });      
      if ((this.customerInfo['billing_type'] == '1' && (this.customerInfo['balance'] > charge)) || this.customerInfo['billing_type'] == '2') {        
        this.minutePlanService.purchaseBoosterPlan(obj).subscribe(data => {
          this.toastr.success('Success!', BoosterPlanAssign, { timeOut: 2000 });
       // this.router.navigateByUrl('callPlan/bundle-plan');
          this.router.navigateByUrl('callPlan/callplan');
        });
      } else {
        this.toastr.error('Customer have insufficient balance.', 'Error!', { timeOut: 2000 })
      }
    }else{
      this.toastr.error('Error!',formError,{timeOut:2000});
    }
  }

  showDidSellingPrice(e) {    
    this.selectedDid = [];
    this.isSelected = false;
    for (let i = 0; i < e.value.length; i++) {      
      var newElement = {};
      var didId = e.value[i];
      
      var splitData = didId.toString().split('-');
      let booster_id = splitData[0]; // not needed
      let booster_name = splitData[1];
      let booster_validity = splitData[2];
      let booster_charges = splitData[3];
      let booster_extra_charges = splitData[4];
      let booster_number_of_days = splitData[5];
      newElement['id'] = booster_id;
      newElement['name'] = booster_name;
      newElement['validity'] = booster_validity;  
      newElement['charges'] = booster_charges;
      newElement['extra_charges'] = booster_extra_charges;
      let days= '';
      if(booster_validity == 'custom'){
        days = booster_number_of_days
      }else if(booster_validity == 'monthly'){
        days = '30'
      }else{
        days = '7'
      }
      newElement['number_of_days'] = days;
      this.selectedDid.push(newElement);
      this.isSelected = true;
      let type = Number(this.assignDIDForm.get('plan_type').value);
      let obj = {
        booster_Type : type
      }
      this.minutePlanService.getCustomerAccordingByBoosterType(obj).subscribe(data => {
        this.customerList = data;    
        this.filterCustomer = this.customerList.slice();  
      }, err => {
        this.error = err.message;
      });

    }
  }

  cancelForm() {
    this.assignDIDForm.reset();
    // this.router.navigateByUrl('callPlan/bundle-plan');
    this.router.navigateByUrl('callPlan/callPlan');
  }

  showInfo() {    
  }

  public changedCustomer(){
    let customer_id = this.assignDIDForm.get('customer').value;
    this.userService.getCustomerById(customer_id).subscribe(data => {      
      this.customerInfo = data.response[0];
      
    })
  }

  public changeCallPlan(data){
    this.boosterList = [];
    this.boosterListVariable = [];
    this.selectedDid = [];
    this.assignDIDForm.get('customer').setValue('');
    this.assignDIDForm.get('booster_plan').setValue('');
    if(!this.assignDIDForm.get('plan_type')){
      this.toastr.error('Error!','Please select Plan Type First',  { timeOut: 2000 });
      return;
    }
    let obj = {
      type :data
    }
    this.minutePlanService.viewBoosterPlanByType(obj).subscribe(data => {
      if(data!= ''){
      this.disableList = false;
      for(let i=0; i<data.length; i++){      
        this.boosterList.push({ label: data[i].name , value: { id: data[i].id + '-' + data[i].name + '-' + data[i].validity + '-' + data[i].charge + '-' + data[i].extra_charge + '-' + data[i].number_of_days } });
        this.boosterListVariable.push({ label: data[i].name , value: { id: data[i].id + '-' + data[i].name + '-' + data[i].validity + '-' + data[i].charge + '-' + data[i].extra_charge + '-' + data[i].number_of_days } });
        this.boosterPlan = this.BoosterFilter = this.boosterListVariable.slice()    
              

      }  
    }else{
      this.disableList = true;
      this.boosterList.push({label:'No Booster Plan Found', value:''});      
    }
    });
   }

}
