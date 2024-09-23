import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerData } from '../../../core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, ProductService, CommonService } from '../../../core';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {

  groupId = '';
  allData:boolean = false;
  errors: Errors = { errors: {} };
  error = '';
  contactList = [];
  callPlanList = [];
  packageList = [];
  groupName = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
   
    
    this.groupName = this.route.snapshot.queryParams.gName || '';
    this.route.data.subscribe(data => {
      this.createCustomerInfo(data);
      this.callPlanList = data['contactData']['callPlanInfo'] ? data['contactData']['callPlanInfo'] : []; 
      this.packageList = data['contactData']['packageInfo'] ? data['contactData']['packageInfo'] : [];      
    });
    

  }
  viewpackage(e) {
    var text = "Are You Sure! edit this package";
    if(confirm(text) == true){
      let productid = localStorage.getItem('product_id')
      this.router.navigate(['package/view'], { queryParams: { proId: productid, pId: e.id } });
    }
    else{
    }
  }

  public createCustomerInfo(dataList){
    let data = dataList['contactData'];
    let c_name = ((data['contactData'][0].company_name) != null) ? (data['contactData'][0].company_name).split(','): null;
    let fname =  ((data['contactData'][0].first_name) != null) ?  (data['contactData'][0].first_name).split(',') : null
    let lname = ((data['contactData'][0].last_name) != null) ? (data['contactData'][0].last_name).split(',')  : null;
    let email = ((data['contactData'][0].email) != null) ? (data['contactData'][0].email).split(',') : null;
    let mobile = ((data['contactData'][0].mobile) != null) ? (data['contactData'][0].mobile).split(',') :null;
    if (fname !=null){
    for(let i = 0 ; i < fname.length; i++){
      let obj = {};
      obj['company_name'] = c_name[i];
      obj['first_name'] = fname[i];
      obj['last_name'] = lname[i];
      obj['email'] = email[i];
      obj['mobile'] = mobile[i]; 
    this.contactList.push(obj);
    }
  }
  }
}
