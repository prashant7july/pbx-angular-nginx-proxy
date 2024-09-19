import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerData } from '../../../core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, ProductService, CommonService } from '../../../core';


@Component({
  selector: 'app-group-associate-user',
  templateUrl: './group-associate-user.component.html',
  styleUrls: ['./group-associate-user.component.css']
})
export class GroupAssociateUserComponent implements OnInit {

  groupId = '';
  errors: Errors = { errors: {} };
  error = '';
  contactList = '';
  groupName = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    //this.groupId = this.route.snapshot.queryParams.gId;
    this.groupName = this.route.snapshot.queryParams.gName || '';
    this.route.data.subscribe(data => {
      this.contactList = data['contactData'];
    });
  }


}
