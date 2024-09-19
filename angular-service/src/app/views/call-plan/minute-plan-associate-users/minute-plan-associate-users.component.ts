import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, ProductService, CommonService } from '../../../core';

@Component({
  selector: 'app-minute-plan-associate-users',
  templateUrl: './minute-plan-associate-users.component.html',
  styleUrls: ['./minute-plan-associate-users.component.css']
})
export class MinutePlanAssociateUsersComponent implements OnInit {

  featurePlanId = '';
  errors: Errors = { errors: {} };
  error = '';
  userList = '';
  MinutePlanName = '';
  packageName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {    
    this.MinutePlanName = this.route.snapshot.queryParams.mName || '';        
    this.route.data.subscribe(data => {      
      this.userList = data['planData']['types'];
      this.packageName = data['planData']['departments'];
    });    
  }

  viewpackage(e) {
    var text = "Are You Sure! edit this package";
    if(confirm(text) == true){
      let productid = localStorage.getItem('product_id')
      this.router.navigate(['package/view'], { queryParams: { proId: productid, pId: e.id } });
    }    
  }
}
