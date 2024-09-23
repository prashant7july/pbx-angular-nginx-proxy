import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerData } from '../../../core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, ProductService, CommonService } from '../../../core';
import { UserService } from '../../user/user.service';
import { FeaturesService } from '../feature.service';

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.css']
})
export class PackageListComponent implements OnInit {

  featurePlanId = '';
  errors: Errors = { errors: {} };
  error = '';
  packageList = '';
  groupName = '';

  constructor(
    private featureService: FeaturesService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.groupName = this.route.snapshot.queryParams.fName || '';
    this.route.data.subscribe(data => {
      this.packageList = data['packageData']['response'];
    });
    // this.featurePlanId = this.route.snapshot.queryParams.fId;
    // this.featureService.getFeaturePlanPackages(this.featurePlanId).subscribe(data => {
    //   this.packageList = data.response;
    //   console.log('this.packageList',this.packageList);
    // });
  }

  // openDialog(id): void {
  //   const dialogRef = this.dialog.open(CustomerDialog, {
  //     width: '80%',
  //     disableClose: true,
  //     data: { id: id }
  //   });
  //   dialogRef.afterClosed().subscribe();
  // }


}
