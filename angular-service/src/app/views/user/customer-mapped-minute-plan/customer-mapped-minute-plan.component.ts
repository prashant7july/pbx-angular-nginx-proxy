import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerData, PackageData, PagedData } from '../../../core/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, ProductService, CommonService } from '../../../core';
import { BundlePlanDialog } from '../../call-plan/bundle-plan/bundle-plan.component';
import { PackageService } from '../../package/package.service';
import { FeaturesService } from '../../feature/feature.service';
import { InvoiceService } from '../../invoice/invoice.service';
import { DidService } from '../../DID/did.service';
import { UserService } from '../user.service';
import { SmsService } from '../../sms/sms.service';
import { CallplanService } from '../../call-plan/callplan.service';
import { CallPlanDialog } from '../../call-plan/call-plan/call-plan.component'

export var productId = '1';
@Component({
  selector: 'app-customer-mapped-minute-plan',
  templateUrl: './customer-mapped-minute-plan.component.html',
  styleUrls: ['./customer-mapped-minute-plan.component.css']
})
export class CustomerMappedMinutePlanComponent implements OnInit {

  groupId = '';
  errors: Errors = { errors: {} };
  error = '';
  contactList = '';
  companyName = '';
  bundlePlan: any;
  roamingPlan: any;
  tcPlan: any;
  OutgoingPlan: any;
  cust_id: any;
  featurePlanRateId: any;
  destination_promise: any;
  defaultPageSize = '10';
  resizable = true;
  pagedData: any;
  validity: any;
  charge: any;
  limit: any;
  remaining: any;
  columnDefs2 = [];
  columnDefs3 = [];
  columnDefs = [];
  dataSource2 = [];
  dataSource3 = [];
  dataSource = [];
  invoiceData = [];
  userData = [];
  DidData = [];
  serverData = [];
  dialoutData = [];
  dialoutData1: any;
  dialoutData2: any;
  dialoutData3: any;
  dialoutData4: any;
  dialoutData5: any;
  totalHit: any;
  callPlanName: any;
  consumeHit: any;
  globalRateList: any[] = [];
  public fields: Object = { text: 'name', value: 'id' };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private packageService: PackageService,
    private featureService: FeaturesService,
    private invoiceService: InvoiceService,
    private didService: DidService,
    private userService: UserService,
    private smsService: SmsService,
    private callPlanService: CallplanService


  ) { }

  ngOnInit() {
    this.companyName = this.route.snapshot.queryParams.company || '';
    this.cust_id = this.route.snapshot.queryParams.custId;
    this.route.data.subscribe(data => {
      
      

      this.bundlePlan = data['planData']['response']['0'];
      this.roamingPlan = data['planData']['response']['1'];
      this.tcPlan = data['planData']['response']['2'];
      this.OutgoingPlan = data['planData']['response']['3'];


    });

    this.userService.getTopDialOut(this.cust_id).subscribe(data => {
      this.dialoutData = data;
      this.dialoutData1 = data[0];
      this.dialoutData2 = data[1];
      this.dialoutData3 = data[2];
      this.dialoutData4 = data[3];
      this.dialoutData5 = data[4];

    })


    this.smsService.getCustomerSMSid(this.cust_id).subscribe(data => {
      if (data['response'].id != "" && data['response'].id != 'null') {
        if (data['response'].id) {
          this.smsService.getSMSPlanByID(data['response']['id']).subscribe(data => {
            this.serverData = data[0];

            if (this.serverData['validity'] == '1') {
              this.validity = 'Monthly';
              this.limit = this.serverData['number_of_sms'];
              // this.remaining = '';
              this.charge = this.serverData['charge'];
            } else if (this.serverData['validity'] == '2') {
              this.validity = 'Yearly';
              this.limit = this.serverData['num_of_sms'];
              // this.remaining = '';
              this.charge = this.serverData['charge'];
            } else if (this.serverData['validity'] == '3') {
              this.validity = 'Pay Per Use';
              this.limit = 'N/A';
              this.remaining = 'N/A';
              this.charge = this.serverData['charge'];
            } else {
              this.validity = 'Custom';
              this.limit = 'N/A';
              this.remaining = 'N/A';
              this.charge = 'N/A';

            }
            this.getRemainingSMS();
          })
        }
      }
    })



    this.packageService.getPbxFeatures(Number(this.cust_id), Number(productId)).subscribe(packageData => {
      this.featurePlanRateId = packageData['response'][0]['feature_rate_id'];


      this.getData(this.featurePlanRateId)

      this.callPlanService.getCallPlan().subscribe(data => {

        let standard = data.response.filter(item => item.id == packageData['response'][0]['call_plan_id']);
        if(standard[0]){
          this.callPlanName = standard[0]['name'];
        }


      })
    })




    this.userService.getCustomerById(this.cust_id).subscribe(Data => {

      this.userData = Data['response'][0];
      this.totalHit = this.userData['total_hit'];
      this.consumeHit = this.userData['consume_hit'];
    })

    this.featureService.getDefaultGlobalFeatureRate({}).subscribe(pagedData => {
      this.globalRateList = pagedData;


    }, err => {
      this.error = err.message;
    })

    this.invoiceService.getAllInvoicesOfCustomerOfYear(this.cust_id).subscribe(pagedData => {
      this.invoiceData = pagedData;
      this.manageUserActionBtn(pagedData)
      this.displayAllRecord();
    });




    this.didService.getCustomerDID(this.cust_id, null).subscribe(pagedData => {
      this.DidData = pagedData;
      this.dataSource3 = [];
      this.dataSource3.push({ 'fields': this.columnDefs3, 'data': this.DidData });
      this.displayAllRecordDID()
    });

  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
     
      if(pagedData[i]['paid_status'] == '1'){

        pagedData[i]['paid_status'] = 'Paid';

      }
      else if(pagedData[i]['paid_status'] == '2'){

        pagedData[i]['paid_status'] = 'Not Paid';

      }else if(pagedData[i]['paid_status'] == '3'){

        pagedData[i]['paid_status'] = 'Overdue';

      }else if(pagedData[i]['paid_status'] == '4'){

        pagedData[i]['paid_status'] = 'No need to pay';

      }else if(pagedData[i]['paid_status'] == '5'){

        pagedData[i]['paid_status'] = 'Previous balance remaining';

      }else{
        pagedData[i]['paid_status'] = '';
      }
      pagedData[i]['action'] = finalBtn;

    }
    return pagedData;
  }

  private getRemainingSMS() {
    this.userService.getCustomerRemainingSMS(this.cust_id).subscribe(data => {
      if (data) {


        // this.serverData['remaining_sms'] = data ? data : 'N/A';
        this.remaining = data ? data : 'N/A';
      }
    });
  }

  public displayAllRecord1() {
    this.columnDefs2 = [
      { field: 'feature_name', headerName: 'Feature', hide: false, width: 150 },
      { field: 'feature_limit', headerName: 'Feature Limit', hide: false, width: 150 },
      { field: 'feature_rate', headerName: 'Amount(in ₹)', hide: false, width: 150 },
    ];
    this.dataSource2 = [];
    this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.globalRateList });

  }
  public displayAllRecordDID() {
    this.columnDefs3 = [
      { field: 'didDisplay', headerName: 'DID', hide: false, width: 150 },
      { field: 'country', headerName: 'Country', hide: false, width: 150 },
      { field: 'provider', headerName: 'Provider', hide: false, width: 150 },
      { field: 'max_concurrent', headerName: 'Max CC', hide: false, width: 150 },
      { field: 'did_group', headerName: 'Group', hide: false, width: 150 },
      { field: 'did_type', headerName: 'DID Type', hide: false, width: 150 },
      { field: 'fixrate', headerName: 'Monthly Price', hide: false, width: 150 },
      { field: 'selling_rate', headerName: 'Buying Rate', hide: false, width: 150 },
      { field: 'vmn_num', headerName: 'VMN', hide: false, width: 150 },
      { field: 'activated', headerName: 'Status', hide: false, width: 150 },
    ];
    this.dataSource3 = [];
    this.dataSource3.push({ 'fields': this.columnDefs3, 'data': this.DidData });

  }
  public displayAllRecord() {
    this.columnDefs = [
      { field: 'invoice_date', headerName: 'Invoice Date', hide: false, width: 10 },
      { field: 'reference_num', headerName: 'Invoice Number', hide: false, width: 10 },
      { field: 'amount', headerName: 'Amount (Without GST)', hide: false, width: 15 },
      { field: 'amount_with_gst', headerName: 'Amount (With GST)', hide: false, width: 15 },
      { field: 'paid_status', headerName: 'Status', hide: false, width: 10 },
    ];
    this.dataSource = [];
    this.dataSource.push({ 'fields': this.columnDefs, 'data': this.invoiceData });

  }
  getData(data) {

    if (this.featurePlanRateId != "") {
      this.featureService.getGlobalFeatureRate({ featurePlanRateId: Number(data) }).subscribe(featureData => {

        this.pagedData = featureData;
        this.displayAllRecord1();
      })
    }
  }



  public showDialog(data) {
    const dialogRef = this.dialog.open(CallPlanDialog, { width: '60%', disableClose: true, data: { id: data ? data.id : null, data: data, readonly: true } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

}
