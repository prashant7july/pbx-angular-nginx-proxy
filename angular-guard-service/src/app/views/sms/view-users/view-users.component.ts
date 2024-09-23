import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerData } from '../../../core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, ProductService, CommonService } from '../../../core';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.css']
})
export class ViewUsersComponent implements OnInit {

  featurePlanId = '';
  errors: Errors = { errors: {} };
  error = '';
  userList = [];
  TCPlanName = '';
  packageDetail = '';
  callPlan = '';

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.TCPlanName = this.route.snapshot.queryParams.smsName || '';
    this.route.data.subscribe(data => {
      this.packageDetail = data['userData']['departments']
      this.userList = data['userData']['types'];
      if (this.userList[0]['first_name'] == null) this.userList.shift();
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
}
