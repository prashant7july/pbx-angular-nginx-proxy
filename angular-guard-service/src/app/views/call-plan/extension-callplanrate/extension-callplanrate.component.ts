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

declare const ExcelJS: any;


@Component({
  selector: 'app-extension-callplanrate',
  templateUrl: './extension-callplanrate.component.html',
  styleUrls: ['./extension-callplanrate.component.css']
})
export class ExtensionCallplanrateComponent implements OnInit {

  error = '';
  isFilter = false;
  filterForm: FormGroup;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  allCountryList:any = "";

  public mode : string = 'CheckBox' ;
  public selectAllText: string = "Select All"
  // public fields: Object = { text: 'name', value: 'phonecode' };
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country/Dial Prefix';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  constructor(
    private fb: FormBuilder,
    private callplanService: CallplanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
  ) {
    this.filterForm = this.fb.group({
      'by_dial_prefix':  new FormControl([]),
      'by_selling_rate': [""]
    });
  }

  ngOnInit() {
    this.callplanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
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
  Extensionremovedspace(event){
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
      { field: 'dialPrefixName', headerName: 'Country/Dial Prefix Name', hide: false, width: 30 },
      { field: 'gatewayName', headerName: 'Gateway', hide: true, width: 20 },
      { field: 'sellingRate', headerName: 'Buying Rate', hide: false, width: 30 },
      // { field: 'dispSellingMinDuration', headerName: 'Selling Min Duration', hide: false, width: 30 },
      { field: 'dispSellingBillingBlock', headerName: 'Selling Billing Block', hide: false, width: 30 },
     
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.id = Number(localStorage.getItem('id'));
      credentials.by_selling_rate = Number(credentials.by_selling_rate);
      
      this.callplanService.filterExtensionCallPlanRate(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.callplanService.viewExtensionCallPlanRate({ id: Number(localStorage.getItem('id')) }).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
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
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Call Plan', key: 'CallPlan', width: 30 },
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
        CallPlan: this.exportData[i].call_plan,
        DialPrefix: this.exportData[i].dial_prefix,
        SellingRate: this.exportData[i].sellingRate,
        SellingMinDuration: this.exportData[i].dispSellingMinDuration,
        SellingBillingBlock: this.exportData[i].dispSellingBillingBlock
      });
    }
    // worksheet.eachRow(function (row, _rowNumber) {
    //   row.eachCell(function (cell, _colNumber) {
    //     cell.border = {
    //       top: { style: 'thin', color: { argb: '000000' } },
    //       left: { style: 'thin', color: { argb: '000000' } },
    //       bottom: { style: 'thin', color: { argb: '000000' } },
    //       right: { style: 'thin', color: { argb: '000000' } }
    //     };
    //   });
    // });
    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
      row.border =  {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
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
    var col = ["Call Plan", "Dial Prefix", "Buying Rate",  "Selling Billing Block"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.call_plan, element.dial_prefix, element.sellingRate, element.dispSellingMinDuration, element.dispSellingBillingBlock];
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
    const dialogRef = this.dialog.open(ExtensionCallPlanRateDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
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
    const dialogRefInfo = this.dialog.open(InfoExtensionCallPlanRateDialog, {
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
  selector: 'infoExtensionCallPlanRate-dialog',
  templateUrl: 'infoExtensionCallPlanRate-dialog.html',
})

export class InfoExtensionCallPlanRateDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoExtensionCallPlanRateDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
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
  selector: 'extensioncallplanrate-dialog',
  templateUrl: 'extensioncallplanrate-dialog.html',
})

export class ExtensionCallPlanRateDialog {
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
    public dialogRef: MatDialogRef<ExtensionCallPlanRateDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private gatewayService: GatewayService,
  ) {
    this.callPlanRatesForm = this.fb.group({
      'call_plan': ['', Validators.required],
      'dial_prefix': ['', Validators.required],
      'buying_rate': ['', Validators.required],
      'selling_rate': ['', Validators.required],
      'selling_min_duration': ['0'],
      'selling_billing_block': [60],
      'gateway': ['', Validators.required]
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