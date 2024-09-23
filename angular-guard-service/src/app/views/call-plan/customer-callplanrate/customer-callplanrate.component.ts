import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CallplanService } from '../callplan.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, CallPlanRate, invalidFileType, importUnsuccessfully, importSuccessfully } from '../../../core';
import { GatewayService } from '../../gateway/gateway.service';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../../environments/environment.prod';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MinutePlanService } from '../../customer-minute-plan/customer-minute-plan.service';
import { PackageService } from '../../package/package.service';
import { BundlePlanDialog } from '../../call-plan/bundle-plan/bundle-plan.component';
import {CallPlanDialog} from '../../call-plan/call-plan/call-plan.component'

declare const ExcelJS: any;
const URL = environment.api_url + 'uploadCsv/';
export var imagePath: any;
export var productId = '1';
@Component({
  selector: 'app-customer-callplanrate',
  templateUrl: './customer-callplanrate.component.html',
  styleUrls: ['./customer-callplanrate.component.css']
})
export class CustomerCallplanrateComponent implements OnInit {

  error = '';
  isFilter = false;
  isBundle = false;
  isRoaming = false;
  isTC = false;
  isOB = false;
  isStandard = false;
  noCallPlan = false;
  filterForm: FormGroup;
  selectedValue = "";
  standardId = "";
  columnDefs: any;
  columnDefs2: any;
  columnDefs3: any;
  columnDefs4: any;
  columnDefs5: any;
  dataSource: any = [];
  dataSource2: any = [];
  dataSource3: any = [];
  dataSource4: any = [];
  dataSource5: any = [];
  customerBundleInfo: any = [];
  customerOutBundleInfo: any = [];
  customerStandardBundleInfo: any = [];
  customerRoamingBundleInfo: any = [];
  customerTcBundleInfo: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  defaultPageSize2 = '10';
  defaultPageSize3 = '10';
  defaultPageSize4 = '10';
  defaultPageSize5 = '10';
  allCountryList:any = "";
  featureData: any = [];

  public mode : string = 'CheckBox' ;
  public selectAllText: string = "Select All"
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country Name and Dial Prefix';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  constructor(
    private fb: FormBuilder,
    private callplanService: CallplanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private minutePlanService : MinutePlanService,
    private packageService : PackageService
  ) {
    this.filterForm = this.fb.group({
      'by_dial_prefix':  new FormControl([]),
      'by_selling_rate': [""]
    });
  }

  ngOnInit() {


    this.packageService.getPbxFeatures(Number(localStorage.getItem('id')),Number(productId)).subscribe(packageData =>{
      
      this.featureData = packageData['response'][0];
      
      
      if(packageData['response'][0].call_plan_id == "" && packageData['response'][0].is_bundle_type == '0' && packageData['response'][0].is_roaming_type == '0' && packageData['response'][0].teleconsultation == '0' && packageData['response'][0].out_bundle_type == '0'){
        this.noCallPlan = true;
      }else{
        this.noCallPlan = false;
      }
      if(packageData['response'][0].call_plan_id != ""){
        this.isStandard = true;
      }

      if(packageData['response'][0].is_bundle_type == '1'){
        this.isBundle = true;
      }

      if(packageData['response'][0].is_roaming_type == '1'){
        this.isRoaming = true;
      }

      if(packageData['response'][0].teleconsultation == '1'){
        this.isTC = true;
      }
      if(packageData['response'][0].out_bundle_type == '1'){
        this.isOB = true;
      }

      
      

  })

    this.callplanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    this.displayAllRecord2();
    this.displayAllRecord3();
    this.displayAllRecord4();
    this.displayAllRecord5();
    this.callplanService.getCallPlan().subscribe(data => {
      this.selectedValue = data.response;
    });
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.allCountryList = data.response;
    }, err => {
      this.error = err.message;
    });

  }

  Accountremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.allCountryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 20 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'call_plan', headerName: 'Call Plan', hide: true, width: 20 },
      { field: 'dialPrefixName', headerName: 'Country Name and Dial Prefix', hide: false, width: 30 },
    //  { field: 'gatewayName', headerName: 'Gateway', hide: true, width: 20 },
      { field: 'sellingRate', headerName: 'Buying Rate', hide: false, width: 30 },
      // { field: 'dispSellingMinDuration', headerName: 'Selling Min Duration', hide: false, width: 30 },
      { field: 'dispSellingBillingBlock', headerName: 'Selling Billing Block', hide: false, width: 30 },
     
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.customer_id = localStorage.getItem('id');
      this.callplanService.filterCustomerCallPlanRate(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.callplanService.viewCustomerCallPlanRate({ id: Number(localStorage.getItem('id')) }).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });

      // let obj = {
      //   customer_id : localStorage.getItem('id'),
      //   by_destination : []          
      // }
      // this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
      //   this.exportData = pagedData;
      //    pagedData = this.manageUserActionBtn(pagedData);
      //   this.dataSource = [];
      //   this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      // });
    }
  }

  displayAllRecord2() {
    this.columnDefs2 = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'destination', headerName: 'Destination', hide: false, width: 20 },
      { field: 'dial_prefix', headerName: 'Dial Prefix', hide: false, width: 20 },
      { field: 'minutes', headerName: 'Actual Minutes', hide: false, width: 30 },
      { field: 'group_type', headerName: 'Type', hide: false, width: 30 },
      { field: 'group_name', headerName: 'Group Name', hide: false, width: 30 },
      { field: 'talktime_minutes', headerName: 'Total Minutes', hide: false, width: 30 },
      { field: 'used_minutes', headerName: 'Consumed Minutes', hide: false, width: 30 },
      {field: 'expiry_date' , headerName: 'Valid Upto' , hide:false , width : 30}
  
    ];
   
      // if (this.isFilter) {
      //   const credentials = this.filterForm.value;        
      //   this.minutePlanService.viewCustomerBundlePlan(credentials).subscribe(pagedData => {
      //     this.exportData = pagedData;
      //     pagedData = this.manageUserActionBtn(pagedData);          
      //     this.dataSource = [];
      //     this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      //   }, err => {
      //     this.error = err.message;
      //   });
      // } else {
        let obj = {
          customer_id : Number(localStorage.getItem('id')),
          by_destination : []          
        }
        this.minutePlanService.viewCustomerDidBundlePlan(obj).subscribe(pagedData => {
          this.exportData = pagedData;
           pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource2 = [];
          this.dataSource2.push({ 'fields': this.columnDefs2, 'data': pagedData });
        });
      // }
    
   
  }
  displayAllRecord5() {
    this.columnDefs5 = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'destination', headerName: 'Destination', hide: false, width: 20 },
      { field: 'dial_prefix', headerName: 'Dial Prefix', hide: false, width: 20 },
      { field: 'minutes', headerName: 'Actual Minutes', hide: false, width: 30 },
      { field: 'group_type', headerName: 'Type', hide: false, width: 30 },
      { field: 'group_name', headerName: 'Group Name', hide: false, width: 30 },
      { field: 'talktime_minutes', headerName: 'Total Minutes', hide: false, width: 30 },
      { field: 'used_minutes', headerName: 'Consumed Minutes', hide: false, width: 30 },
      {field: 'expiry_date' , headerName: 'Valid Upto' , hide:false , width : 30}
  
    ];
   
      // if (this.isFilter) {
      //   const credentials = this.filterForm.value;        
      //   this.minutePlanService.viewCustomerBundlePlan(credentials).subscribe(pagedData => {
      //     this.exportData = pagedData;
      //     pagedData = this.manageUserActionBtn(pagedData);          
      //     this.dataSource = [];
      //     this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      //   }, err => {
      //     this.error = err.message;
      //   });
      // } else {
        let obj = {
          customer_id : localStorage.getItem('id'),
          by_destination : []          
        }
        this.minutePlanService.viewCustomerOutgoingBundlePlan(obj).subscribe(pagedData => {
          this.exportData = pagedData;
           pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource5 = [];
          this.dataSource5.push({ 'fields': this.columnDefs2, 'data': pagedData });
        });
      // }
    
   
  }

  displayAllRecord3() {
    this.columnDefs3 = [
     { field: 'id', headerName: 'ID', hide: true, width: 10 },
     { field: 'destination', headerName: 'Destination', hide: false, width: 20 },
     { field: 'dial_prefix', headerName: 'Dial Prefix', hide: false, width: 20 },
     { field: 'minutes', headerName: 'Actual Minutes', hide: false, width: 30 },
     { field: 'group_type', headerName: 'Type', hide: false, width: 30 },
     { field: 'group_name', headerName: 'Group Name', hide: false, width: 30 },
     { field: 'talktime_minutes', headerName: 'Total Minutes', hide: false, width: 30 },
     { field: 'used_minutes', headerName: 'Consumed Minutes', hide: false, width: 30 },
     {field: 'expiry_date' , headerName: 'Valid Upto' , hide:false , width : 30}
   
    ];
   
      // if (this.isFilter) {
      //   const credentials = this.filterForm.value;
      //   this.minutePlanService.viewCustomerRoamingPlan(credentials).subscribe(pagedData => {
      //     this.exportData = pagedData;
      //     pagedData = this.manageUserActionBtn(pagedData);
      //     this.dataSource = [];
      //     this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      //   }, err => {
      //     this.error = err.message;
      //   });
      // } else {
       let obj = {
         customer_id : Number(localStorage.getItem('id')),
        by_destination : [],
         by_group_name : ''
       }
        this.minutePlanService.viewCustomerRoamingPlan(obj).subscribe(pagedData => {        
          this.exportData = pagedData;
           pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource3 = [];
          this.dataSource3.push({ 'fields': this.columnDefs3, 'data': pagedData });
        });
      // }
    
   
  }

  displayAllRecord4() {
    this.columnDefs4 = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'destination', headerName: 'Destination', hide: false, width: 20 },
      { field: 'dial_prefix', headerName: 'Dial Prefix', hide: false, width: 20 },
      { field: 'minutes', headerName: 'Actual Minutes', hide: false, width: 30 },
      { field: 'group_type', headerName: 'Type', hide: false, width: 30 },
      { field: 'group_name', headerName: 'Group Name', hide: false, width: 30 },
      { field: 'talktime_minutes', headerName: 'Total Minutes', hide: false, width: 30 },
      { field: 'used_minutes', headerName: 'Consumed Minutes', hide: false, width: 30 },
      {field: 'expiry_date' , headerName: 'Valid Upto' , hide:false , width : 30}
  
    ];
   
      // if (this.isFilter) {
      //   const credentials = this.filterForm.value;        
      //   credentials['flag'] = '1';
      //   this.minutePlanService.viewCustomerBundlePlan(credentials).subscribe(pagedData => {
      //     this.exportData = pagedData;
      //     pagedData = this.manageUserActionBtn(pagedData);          
      //     this.dataSource = [];
      //     this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      //   }, err => {
      //     this.error = err.message;
      //   });
      // } else {
        let obj = {
          customer_id : Number(localStorage.getItem('id')),
          by_destination : []    ,
          flag: true    
        }
        this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
          this.exportData = pagedData;
           pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource4 = [];
          this.dataSource4.push({ 'fields': this.columnDefs4, 'data': pagedData });
        });
      // }
    
   
  }



  // standardInfo(){
  //   setTimeout(() => {
      
  //     this.standardId = this.featureData['call_plan_id'];
  //     this.callplanService.filterBundlePlan({by_id: this.standardId}).subscribe(data => {
  //       this.customerStandardBundleInfo = data[0];

  //       console.log(this.customerStandardBundleInfo,"standard plan data");
  //     })
  //   }, 500);
  //   return this.infoBundlePlan({data : this.customerStandardBundleInfo, id : this.standardId, readonly : true});
  // }

  bundleInfo(){

    setTimeout(() => {
      let Id = this.featureData['bundle_plan_id'];
      this.callplanService.filterBundlePlan({by_id: Id}).subscribe(data => {
        this.customerBundleInfo = data[0];
        
      })
      return this.infoBundlePlan({data : this.customerBundleInfo, id : Id, readonly : true});
    }, 500);
  }

  outgoingInfo(){
    
    setTimeout(() => {
      let Id = this.featureData['out_bundle_call_plan_id'];
      this.callplanService.filterBundlePlan({by_id: Id}).subscribe(data => {
        this.customerOutBundleInfo = data[0];
        
        return this.infoBundlePlan({data : this.customerOutBundleInfo, id : Id, readonly : true});
      })
    }, 500);
  }

  romaingInfo(){
    
    setTimeout(() => {
      let Id = this.featureData['roaming_plan_id'];
      this.callplanService.filterBundlePlan({by_id: Id}).subscribe(data => {
        this.customerRoamingBundleInfo = data[0];
        
      })
      return this.infoBundlePlan({data : this.customerRoamingBundleInfo, id : Id, readonly : true});
    }, 500);
    
  }

  teleInfo(){
    
    setTimeout(() => {
      let Id = this.featureData['teleConsultancy_call_plan_id'];
      this.callplanService.filterBundlePlan({by_id: Id}).subscribe(data => {
        this.customerTcBundleInfo = data[0];
        
      })
      return this.infoBundlePlan({data : this.customerTcBundleInfo, id : Id, readonly : true});
    }, 500);
  }


  infoBundlePlan(event) {
    const dialogRef = this.dialog.open(CallPlanDialog, { width: '60%', disableClose: true, data: event });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  onPageSizeChanged2(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize2 = value;
  }
  onPageSizeChanged3(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize3 = value;
  }
  onPageSizeChanged4(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize4 = value;
  }
  onPageSizeChanged5(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize5 = value;
  }

  exportToExcel(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      // { header: 'Call Plan', key: 'CallPlan', width: 30 },
      { header: 'Dial Prefix', key: 'DialPrefix', width: 10 },
      { header: 'Buying Rate', key: 'SellingRate', width: 15 },
      // { header: 'Selling Min Duration', key: 'SellingMinDuration', width: 18 },
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
        // CallPlan: this.exportData[i].call_plan,
        DialPrefix: this.exportData[i].dial_prefix,
        SellingRate: this.exportData[i].sellingRate,
        SellingMinDuration: this.exportData[i].dispSellingMinDuration,
        SellingBillingBlock: this.exportData[i].dispSellingBillingBlock
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
    var col = ["Dial Prefix", "Buying Rate", "Selling Billing Block"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.dial_prefix, element.sellingRate, element.dispSellingMinDuration, element.dispSellingBillingBlock];
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
      },
    });
    doc.save('callPlanRate.pdf');
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline' data-action-type='view' title='View'></i>";
      finalBtn += "</span>";

      pagedData[i]['action'] = finalBtn;
    }

    return pagedData;
  }


  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "view":
        return this.viewCallPlanRate(data);
    }
  }


  viewCallPlanRate(event) {
    this.openDialog(event.id);
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(CustomerCallPlanRateDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCustomerCallPlanRateDialog, {
      width: '80%', disableClose: true, autoFocus: false,
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
}

//////info file
@Component({
  selector: 'infoCustomerCallPlanRate-dialog',
  templateUrl: 'infoCustomerCallPlanRate-dialog.html',
})

export class InfoCustomerCallPlanRateDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCustomerCallPlanRateDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}


@Component({
  selector: 'customercallplanrate-dialog',
  templateUrl: 'customercallplanrate-dialog.html',
})

export class CustomerCallPlanRateDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  callPlanRatesForm: FormGroup;
  checkForm: any;
  selectedValue: "";
  callPlanRateData: any = {};
  sessionId = "";
  sellingMinDuration = 0;
  errorField: any;
  dialPrefix = '';
  allGateway = '';
  defaultSellingBillingBlock = 60;
  sellingRate:any=0;

  constructor(
    public dialogRef: MatDialogRef<CustomerCallPlanRateDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private gatewayService: GatewayService,
  ) {
    this.callPlanRatesForm = this.fb.group({
      'call_plan': [''],
      'dial_prefix': [''],
      'buying_rate': [''],
      'selling_rate': [''],
      'selling_min_duration': ['0'],
      'selling_billing_block': [60],
      'gateway': ['']
    });
  }

  ngOnInit() {
    this.sessionId = this.route.snapshot.queryParams.id;
    this.callplanService.getCallPlan().subscribe(data => {
      this.selectedValue = data.response;
    });

    if (this.data.id) {
      this.callplanService.viewUserDetailCallPlanRate({ id: Number(this.data.id), role: Number(localStorage.getItem('type')), user_id: Number(localStorage.getItem('id')) }).subscribe(data => {
        this.callPlanRateData = data[0];
        this.dialPrefix = this.callPlanRateData.dPRefix;
        this.sellingRate = data[0].sellingRate;
        this.sellingMinDuration = data[0].selling_min_duration != '0' ? data[0].dispSellingMinDuration : '0';
        this.defaultSellingBillingBlock = data[0].dispSellingBillingBlock;
      });
    }

    this.gatewayService.getGateway({ id: null, ip: null, port: null, provider_id: null }).subscribe(data => {
      this.allGateway = data;
    });
  }

  cancelForm() {
    this.callPlanRatesForm.reset();
    this.callplanService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
}