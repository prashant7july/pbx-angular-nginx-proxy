import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, CallPlanRate, invalidFileType, importUnsuccessfully, importSuccessfully, Number_RegEx, Number_Not_Start_Zero_RegEx, ProductService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
import { UserTypeConstants } from 'src/app/core/constants';
import { UserService } from '../../user/user.service';
import { MinutePlanService } from '../customer-minute-plan.service';
import { BundlePlan } from 'src/app/core/models/bundle.model';


@Component({
  selector: 'app-booster-minutes',
  templateUrl: './booster-minutes.component.html',
  styleUrls: ['./booster-minutes.component.css']
})
export class BoosterMinutesComponent implements OnInit {

  
//------------------------------  Add Booster Minute By. (Nagender Pratap Chauhan 02-06-2021) ------------------------------------------------------------//

error = '';
isFilter = false;
filterForm: FormGroup;
selectedValue = "";
columnDefs: any;
dataSource: any = [];
rowData: any;
exportData: any = {};
defaultPageSize = '10';
loginUserType = localStorage.getItem('type');// admin, manager, support, customer etc
accountManagerCustomerList: "";
customerInfo ;
adminEmail : string;
constructor(
  private fb: FormBuilder,
  private minutePlanService: MinutePlanService,
  public commonService: CommonService,
  public dialog: MatDialog,
  private excelService: ExcelService,
  private userService: UserService,
  private route : ActivatedRoute,
  private router : Router,
  private toastr: ToastrService,
  private productService: ProductService
) {
  this.filterForm = this.fb.group({
     'by_name' : [""],
     'by_plan_type' : [""],
     'by_validity' : [""]
  });
}

ngOnInit() {   
  this.userService.getCustomerById(localStorage.getItem('id')).subscribe(data => {
    this.customerInfo = data.response[0];
    this.displayAllRecord();
  });

  this.userService.getUserByType('0').subscribe(data => {
    let adminEmail = data.response[0].email;
    if(adminEmail)  this.adminEmail = adminEmail ;
  })

}

displayAllRecord() {
  this.columnDefs = [
    { field: 'id', headerName: 'ID', hide: true, width: 10 },
    { field: 'name', headerName: 'Name', hide: false, width: 25 },
   { field: 'validity', headerName: 'Validity', hide: false, width: 30 },
   { field: 'number_of_days', headerName: 'Number of days', hide: false, width: 30 },
    { field: 'charge', headerName: 'Charge', hide: false, width: 30 },
    { field: 'boosterForDisplay', headerName: 'Type', hide: false, width: 30 },
    { field: 'action', headerName: 'Action', hide: false, width: 20 },
  ];
 
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.minutePlanService.filterCustomerBoosterPlan(credentials).subscribe(pagedData => {
      
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        if(this.customerInfo['is_associate_with_bundle_plan_real'] && this.customerInfo['is_associate_with_roaming_plan'] && this.customerInfo['is_associate_with_out_bundle_plan'] && this.customerInfo['is_associate_with_tc_plan']){
          pagedData = pagedData ? pagedData.filter(item=> ( item['booster_for'] === '1' ||  item['booster_for'] === '2' || item['booster_for'] === '5' || item['booster_for'] === '4')) : []; // just for fetch Roaming 
         }else if(this.customerInfo['is_associate_with_roaming_plan']){
          pagedData = pagedData ? pagedData.filter(item=> (  item['booster_for'] === '2')) : []; // just for fetch Roaming 
         }else if (this.customerInfo['is_associate_with_bundle_plan_real']){
          pagedData = pagedData ? pagedData.filter(item=> (  item['booster_for'] === '1')) : []; // just for fetch Bundle 
         }else if (this.customerInfo['is_associate_with_out_bundle_plan']){
          pagedData = pagedData ? pagedData.filter(item=> (  item['booster_for'] === '5')) : []; // just for fetch Outgoing Bundle 
         }else if (this.customerInfo['is_associate_with_tc_plan']){
          pagedData = pagedData ? pagedData.filter(item=> (  item['booster_for'] === '4')) : []; // just for fetch Outgoing Bundle 
         }else{
          pagedData = pagedData ? pagedData : [];
         }
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      let obj = {
        customer_id : Number(localStorage.getItem('id'))
      }
      this.minutePlanService.viewCustomerBoosterPlan(obj).subscribe(async pagedData => {
        this.exportData = await pagedData;
         pagedData = this.manageUserActionBtn(pagedData);        
         let arrayofBooster = [];
         pagedData.forEach((item) => {
          if(this.customerInfo['is_associate_with_bundle_plan_real'] == 1){
            if(item.booster_for === '1') arrayofBooster.push(item);            
          }
          if(this.customerInfo['is_associate_with_roaming_plan'] == 1){
            if(item.booster_for === '2') arrayofBooster.push(item);
          }
          if(this.customerInfo['is_associate_with_out_bundle_plan'] == 1){
            if(item.booster_for === '5') arrayofBooster.push(item);
          }
          if(this.customerInfo['is_associate_with_tc_plan'] == 1){
            if(item.booster_for === '4') arrayofBooster.push(item);
          }
         });
         pagedData = arrayofBooster;               
        //  pagedData = pagedData ? pagedData.filter(item=> ( (this.customerInfo['is_associate_with_bundle_plan_real'] ? item['booster_for'] === '1': item['booster_for'] === '0')|| (this.customerInfo['is_associate_with_roaming_plan']  ? item['booster_for'] === '2': item['booster_for'] === '2'))) : []; // just for fetch Bundle and Roaming booster plan
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  
 
}

onPageSizeChanged(newPageSize) {
  let value = newPageSize.value;
  this.defaultPageSize = value;
}

exportToExcel(): void {
  let worksheet: any;
  let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
  let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

  worksheet = workbook.addWorksheet('My Sheet', {
    properties: {
      defaultRowHeight: 100,
    },
    pageSetup:{paperSize: 9, orientation:'landscape',fitToPage: true, fitToHeight: 5, fitToWidth: 7}
  });
  worksheet.pageSetup.margins = {
    left: 0.7, right: 0.7,
    top: 0.75, bottom: 0.75,
    header: 0.3, footer: 0.3
  };
  worksheet.columns = [
    { header: 'Call Plan', key: 'CallPlan', width: 30 },
    { header: 'Dial Prefix', key: 'DialPrefix', width: 10 },
    { header: 'Gateway', key: 'Gateway', width: 25 },
    { header: 'Buying Rate', key: 'BuyingRate', width: 15 },
    { header: 'Selling Rate', key: 'SellingRate', width: 15 },
    { header: 'Selling Min Duration', key: 'SellingMinDuration', width: 18 },
    { header: 'Selling Billing Block', key: 'SellingBillingBlock', width: 18 },
  ];
  worksheet.getRow(1).font = {
    bold: true,
  }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFF00' }
  };
  for (let i = 0; i < this.exportData.length; i++) {
    worksheet.addRow({
      CallPlan: this.exportData[i].call_plan,
      DialPrefix: this.exportData[i].dial_prefix,
      Gateway: this.exportData[i].gatewayName,
      BuyingRate: this.exportData[i].buying_rate,
      SellingRate: this.exportData[i].selling_rate,
      SellingMinDuration: this.exportData[i].selling_min_duration,
      SellingBillingBlock: this.exportData[i].selling_billing_block
    });
  }
  worksheet.eachRow(function (row, _rowNumber) {
    row.eachCell(function (cell, _colNumber) {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });
  });
  //To repeate header row on each page
  worksheet.pageSetup.printTitlesRow = '1:2';
  let offset = this.exportData.length; // to offset by 3 rows
  worksheet.spliceRows(1, 0, new Array(offset));
  // this.excelService.exportAsExcelFile(arr, 'callPlanRate');
  workbook.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], { type: blobType });
    FileSaver.saveAs(blob, 'callPlanRate');
  });
}

downloadPDF(): void {
  var doc = new jsPDF();
  var col = ["Call Plan", "Dial Prefix", "Gateway", "Buying Rate", "Selling Rate", "Selling Min Duration", "Selling Billing Block"];
  var rows = [];
  this.exportData.forEach(element => {
    const e11 = [element.call_plan, element.dial_prefix, element.gatewayName, element.buying_rate, element.selling_rate, element.selling_min_duration, element.selling_billing_block];
    rows.push(e11);
  });
  doc.autoTable(col, rows, {
    theme: 'grid',
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
    styles: {
      overflow: 'linebreak',
      fontSize: 6
    },
    columnStyles: {
      0: { cellWidth: 'wrap' },
      1: { cellWidth: 'wrap' },
      2: { cellWidth: 'wrap' },
      3: { cellWidth: 'wrap' },
      4: { cellWidth: 'wrap' },
      5: { cellWidth: 'wrap' },
      6: { cellWidth: 'wrap' }
    },
  });
  doc.save('callPlanRate.pdf');
}

manageUserActionBtn(pagedData) {
  for (let i = 0; i < pagedData.length; i++) {
    let finalBtn = '';
    let totalCharges = 0;
    let chargeList :any = pagedData[i].extra_charge ? (pagedData[i].extra_charge).split(',') : [];
    chargeList.forEach(element => {
      totalCharges += parseFloat(element); 
    });
    totalCharges += parseFloat(pagedData[i].charge);
    finalBtn += "<span>";
    finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='info' title='Call Rates'></i>";
    finalBtn += "<i class='fa fa-shopping-cart  edit-button' style='cursor:pointer; display: inline' data-action-type='purchase' title='Purchase'></i>";
    finalBtn += "</span>";
    pagedData[i]['action'] = finalBtn;
    pagedData[i]['charge'] = totalCharges;

    if(pagedData[i]['validity'] == 'monthly'){
      pagedData[i]['number_of_days'] = '30'
    }else if(pagedData[i]['validity'] == 'weekly'){
      pagedData[i]['number_of_days'] = '7'
    }
  }
  return pagedData;
}


manageAction(e) {
  let data = e.data;
  let actionType = e.event.target.getAttribute("data-action-type");
  switch (actionType) {
    case "edit":
      return this.editBundlePlan(data);
    case "purchase":
      return this.purchaseBoosterPlan(data);
    case "info":
      return this.callRateInfo(data);
    }
}


editBundlePlan(event) {
  this.openDialog(event);
}

callRateInfo(event) {  
 const dialogRef = this.dialog.open(BoosterAssociateRatesDialog, { width: '60%', disableClose: true, data:event });
  dialogRef.keydownEvents().subscribe(e => {
    if (e.keyCode == 27) {
      dialogRef.close('Dialog closed');
    }
  });
  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed');
  });
}

purchaseBoosterPlan(event) {
  let obj = event;
   if((this.customerInfo['billing_type'] == '1' && (this.customerInfo['balance'] > event.charge)) || this.customerInfo['billing_type'] == '2' ){
   obj['customer_id'] = Number(localStorage.getItem('id'));
   obj['purchase_date'] = new Date();
   obj['charge_status'] = this.customerInfo['billing_type'] == '1' ? 1 :0;
   obj['role_id'] = Number(localStorage.getItem('type'));
   obj['process_by'] = Number(localStorage.getItem('id'));
   obj['adminEmail'] = this.adminEmail ? this.adminEmail : '';
   obj['booster_for'] = Number(obj['booster_for'])

  //  obj['customer_id'] = credentials['customer'];
  //  obj['purchase_date'] = new Date();
  //  obj['charge_status'] = this.customerInfo['billing_type'] == '1' ? 1 : 0;
  //  obj['role_id'] = Number(localStorage.getItem('type'));
  //  obj['process_by'] = Number(localStorage.getItem('id'));
  //  obj['booster_info'] = credentials['booster_plan'];
  //  obj['adminEmail'] = localStorage.getItem('uemail');
  //  obj['booster_for'] = Number(credentials['plan_type'])
  Swal.fire({
    title: '<span style="color:#FFFFFF;">Are you sure?</span>',
    text: `You will be charge ${event.charge} for this booster plan!`,
    type: 'warning',
    showCancelButton: true,
    background: '#000000',
    confirmButtonText: 'Yes, purchase it!',
    cancelButtonText: 'No, keep it',
    preConfirm: () => {
      this.minutePlanService.purchaseBoosterPlan(obj).subscribe(data => {
        this.displayAllRecord();
        this.productService.getProductCustomerWise(localStorage.getItem('id')).subscribe(data => {
          let billing_Type = data.response[0] ? data.response[0]['billing_type'] : 1;
          let customerSelectedValue = data.response[0];
          if(billing_Type == 1){
            this.productService.SharingData.next(customerSelectedValue['balance']); 
          }
          // if(billing_Type == 2) {
          //    customerSelectedValue['balance'] = customerSelectedValue['balance'] + customerSelectedValue['credit_limit'];
          //    this.productService.SharingData.next(customerSelectedValue['balance']); 
          // }
        })

      },
        err => {
          this.error = err.message;
        });
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.value) {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Purchased!</span>',
        text: 'Booster Plan has been purchased.',
        type: 'success',
        background: '#000000'
      });

    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Cancelled</span>',
        text: 'Booster Plan did not purchased :)',
        type: 'error',
        background: '#000000',
      });
    }
  })
  }else{
     this.toastr.error('You have insufficient balance.','Error!', { timeOut: 2000 })
   }
 }

resetTable() {
  this.isFilter = false;
  this.displayAllRecord();
}

filterData() {
  this.isFilter = true;
  this.displayAllRecord();
}


openDialog(data): void {
  // const dialogRef = this.dialog.open(BundlePlanDialog, { width: '60%', disableClose: true, data: { id: data ? data.id : null, data: data } });
  // dialogRef.keydownEvents().subscribe(e => {
  //   if (e.keyCode == 27) {
  //     dialogRef.close('Dialog closed');
  //   }
  // });
  // dialogRef.afterClosed().subscribe(result => {
  //   console.log('Dialog closed');
  // });
}


showInfo() {
  const dialogRefInfo = this.dialog.open(InfoBoosterMinuteDialog, {
    width: '80%', disableClose: true, autoFocus:false,
    data: {
      customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0
    }
  });
  dialogRefInfo.keydownEvents().subscribe(e => {
    if (e.keyCode == 27) {
      dialogRefInfo.close('Dialog closed');
    }
  });
  dialogRefInfo.afterClosed().subscribe(result => {
    console.log('Dialog closed');
  });
}

get UserTypeAdmin() {
  return UserTypeConstants.ADMIN;
}

}

//------------------------------   Booster call rates associate By. (Nagender Pratap Chauhan 23-04-2021) ------------------------------------------------------------//

@Component({
  selector: 'booster-associate-rates-dialog',
  templateUrl: 'booster-associate-rates-dialog.html',
})

export class BoosterAssociateRatesDialog {
  
  filterForm: FormGroup;
  callPlanRateList : any  = [];
 

  constructor(
    public dialogRef: MatDialogRef<BoosterAssociateRatesDialog>, @Inject(MAT_DIALOG_DATA) public data: BundlePlan,
    private toastr: ToastrService,
    private minutePlanService: MinutePlanService,
    public  commonService: CommonService,
  ) {

  }
  
  ngOnInit() {
    if (this.data.id) {
      this.minutePlanService.getBoosterAssociateRates(this.data.id).subscribe(pagedData => {
       this.callPlanRateList = pagedData;
       

      })
    }

  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
}

//------------------------------   Booster help button. (Nagender Pratap Chauhan 18-10-2021) ------------------------------------------------------------//

@Component({
  selector: 'infoBoosterMinutes-dialog',
  templateUrl: 'infoBoosterMinutes-dialog.html',
})

export class InfoBoosterMinuteDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoBoosterMinuteDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}