import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerData } from 'src/app/core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors,ProductService, CommonService } from 'src/app/core';

@Component({
  selector: 'app-group-associate-customer',
  templateUrl: './group-associate-customer.component.html',
  styleUrls: ['./group-associate-customer.component.css']
})
export class GroupAssociateCustomerComponent implements OnInit {

  groupId = '';
  errors: Errors = { errors: {} };
  error = '';
  customerList = '';
  groupName = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.groupId = this.route.snapshot.queryParams.gId;
    this.groupName = this.route.snapshot.queryParams.gName || '';
    this.route.data.subscribe(data => {
      console.log("2222222222222222222223456ttttttttttttttttttttttttttttt",data)
      this.customerList = data['customerData'];
    });
    // this.contactListService.getAllContactInGroup(this.groupId).subscribe(data => {
    //   this.contactList = data;
    //   console.log('this.contactList',data);
    //   console.log('this.contactList',this.contactList);
    // });
  }

}
