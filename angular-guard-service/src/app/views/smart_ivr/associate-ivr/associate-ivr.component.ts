import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, ProductService, CommonService } from '../../../core';

@Component({
  selector: 'app-associate-ivr',
  templateUrl: './associate-ivr.component.html',
  styleUrls: ['./associate-ivr.component.css']
})
export class AssociateIvrComponent implements OnInit {

  groupId = '';
  errors: Errors = { errors: {} };
  error = '';
  contactList = '';
  ivrName = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.ivrName = this.route.snapshot.queryParams.ivrName || '';
    this.route.data.subscribe(data => {
      this.contactList = data['ivrdata'];
    });
  }
}
