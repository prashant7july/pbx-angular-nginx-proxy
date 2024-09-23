import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PackageService } from '../package.service';

@Component({
  selector: 'app-customer-view',
  templateUrl: './customer-view.component.html',
  styleUrls: ['./customer-view.component.css']
})
export class CustomerViewComponent implements OnInit {
  data: any = {};
  pbxDiv = false;
  ocDiv = false;
  packageData = '';
  error = '';
  isOutbound : boolean;
  isCircle : any;
  isSMS : any;
  custom: { id: number; name: string; };
  Custom = 'Custom'
  userRole: any;
  constructor(
    private PackagetService: PackageService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.userRole = localStorage.getItem('type');    
    var packageId = this.route.snapshot.queryParams.pId;
    var productId = this.route.snapshot.queryParams.proId;
    if (productId === '1') {
      this.pbxDiv = true;
      this.ocDiv = false;
    } else if (productId === '2') {
      this.ocDiv = true;
      this.pbxDiv = false;
    } else {
      this.pbxDiv = true;
      this.ocDiv = false;
    }
    this.PackagetService.getPackageInfoById(packageId, productId).subscribe(data => {
      this.packageData = data.response;
      this.data = this.packageData[0];
      if(this.data["billing_type"] == '1'){
        this.data["billing_type"] = 'Standard';
      }else if(this.data["billing_type"] == '2'){
        // this.data["billing_type"] = 'Enterprise with pool';
        this.data["billing_type"] = '';
      }else{
        this.data["billing_type"] = 'Enterprise Bucket';
      }
      this.isOutbound = this.data.outbound_call;
      this.isCircle = Number(this.data.is_circle);
      // if(this.isSMS == ''){
      //   this.isSMS = JSON.stringify(this.data.Custom)
    //  this.SMSList.unshift({id:0 ,name:'Custom' })
      // }else{
      this.isSMS = Number(this.data.is_sms);
      // }
    }, err => {
      this.error = err.message;
    });
  }
  
  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCustomerPackageDialog, {
      width: '80%', disableClose: true,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
    });

    dialogRefInfo.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }
}

@Component({
  selector: 'infoCustomerPackage-dialog',
  templateUrl: 'infoCustomerPackage-dialog.html',
})

export class InfoCustomerPackageDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCustomerPackageDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) {}
 
  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }
  
  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
