import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerData } from '../../../core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, ProductService, CommonService } from '../../../core';
// import { ContactListService } from '../contact-list.service';

@Component({
  selector: 'app-group-associate-rate',
  templateUrl: './group-associate-rate.component.html',
  styleUrls: ['./group-associate-rate.component.css']
})
export class GroupAssociateRateComponent implements OnInit {

  groupId = '';
  errors: Errors = { errors: {} };
  error = '';
  contactList = '';
  groupName = '';
  constructor(
    // private contactListService: ContactListService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    //this.groupId = this.route.snapshot.queryParams.gId;
    this.groupName = this.route.snapshot.queryParams.gName || '';
    this.route.data.subscribe(data => {
      console.log(data)
      this.contactList = data['contactData'];
    });
    // this.contactListService.getAllContactInGroup(this.groupId).subscribe(data => {
    //   this.contactList = data;
    //   console.log('this.contactList',data);
    //   console.log('this.contactList',this.contactList);
    // });
  }
}
