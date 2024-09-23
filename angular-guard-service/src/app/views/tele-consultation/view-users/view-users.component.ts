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
  userList = '';
  TCPlanName = '';

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.TCPlanName = this.route.snapshot.queryParams.tcpName || '';
    this.route.data.subscribe(data => {
      this.userList = data['packageData']['response'];
    });
  }
}
