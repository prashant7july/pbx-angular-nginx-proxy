import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService, ExcelService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CallplanService } from '../../call-plan/callplan.service';
import { CdrService } from '../../cdr/cdr.service';
import { SmsService } from '../sms.service';
declare const ExcelJS: any;

@Component({
  selector: 'app-view-customer-sms-report',
  templateUrl: './view-customer-sms-report.component.html',
  styleUrls: ['./view-customer-sms-report.component.css']
})
export class ViewCustomerSmsReportComponent implements OnInit {

  error = '';
  smsList = "";
  smsCategoryList:any = "";
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData = "";
  exportData: any = {};
  defaultPageSize = '10';
  BindData: any = "";
  public fields: Object = { text: 'category_name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder: string = 'Category';
 

  constructor(
    private router: Router,
    private cdrService: CdrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private callplanService:CallplanService,
    private smsService: SmsService
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_company': [""],
      'by_smsplan': [""],
      'by_smscategory': [""],
      'by_smsvalidity':[""]
    });
  }

  ngOnInit() {
    this.displayAllRecord();
    this.commonService.getCompany().subscribe(data => {
      this.companyData = data.response;
    }, err => {
      this.error = err.message;
    });

    this.smsService.getSMSPlan().subscribe(data => {  // SMS LIST
     this.smsList = data;
    });

    this.smsService.getSMSCategories().subscribe(data => {
      this.smsCategoryList = data;
    });
 
 

  }

  Accountremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.smsCategoryList.filter((data) =>{    
      return data['category_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 80 },
      { field: 'id', headerName: 'ID', hide: true, minWidth: 10 },
      { field: 'sentTime', headerName: 'Date', hide: false, minWidth: 25 },  
      { field: 'destination', headerName: 'SMS Sent', hide: false, minWidth: 15 },
      { field: 'category_name', headerName: 'SMS Category', hide: false, minWidth: 18 },  
      { field: 'msg', headerName: 'Message', hide: false, minWidth: 18 },  
      { field: 'amount', headerName: 'SMS Amount', hide: false, minWidth: 10 },
    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials['customer_id'] = Number(localStorage.getItem('id'));
      this.smsService.getCustomerSMSReportByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.smsService.getCustomerSMSReportInfo(0,localStorage.getItem('id')).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }
  manageUserActionBtn(pagedData) {
    
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let actionBtn = '';
        this.BindData = pagedData;
        finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='history' title='Information'></i>";
        pagedData[i]['action'] = finalBtn;            
        if(pagedData[i]['msg']){                              
        actionBtn += "<span title='"+ pagedData[i]['msg'] +"'>"+pagedData[i]['msg']+"</span>";
        pagedData[i]['custom_msg'] = actionBtn;
        }
        else{
          actionBtn += "<span>--</span>";
          pagedData[i]['custom_msg'] = actionBtn;
        }      
    }
    return pagedData;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "history":
         return this.showsmsmessage(data);
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


  exportToExcel() {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Date', key: 'sentTime', width: 25 },
      { header: 'SMS Sent', key: 'destination', width: 15 },  
      { header: 'SMS Category', key: 'category_name', width: 25 },  
      { header: 'SMS Amount', key: 'amount', width: 15 },
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
        sentTime: this.exportData[i].sentTime,
        destination: this.exportData[i].destination,
        category_name: this.exportData[i].category_name,
        amount: this.exportData[i].amount,
      });
    }
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset))
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'SMS_report');
    });
  }

  downloadPDF() {
    var doc = new jsPDF('p', 'mm', 'a3');
    var col = ["Date", "SMS Sent", "SMS Category","Message","SMS Amount"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.sentTime,  element.destination, element.category_name,element.msg,element.amount];
      rows.push(e11);
    });
    doc.autoTable(col, rows, {
      theme: 'grid',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      styles: { 
        overflow: 'linebreak',
        fontSize: 5
      }, 
      columnStyles: {
        0: { cellWidth: 'wrap' },
        1: { cellWidth: 'wrap' },
        2: { cellWidth: 'wrap' },
        3: { cellWidth: 'wrap' },
        4: { cellWidth: 'wrap' },
        5: { cellWidth: 'wrap' },
        6: { cellWidth: 'wrap' },
      },
    });
    doc.save('SMS_report.pdf');
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoSMSReportDialog, {
      width: '80%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
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
  showsmsmessage(data){
    const dialogRef = this.dialog.open(SMSMsgReportDialog, { width: '60%', disableClose: true, data: data });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
@Component({
  selector: 'SMSMsgReport-dialog',
  templateUrl: 'SMSMsgReport-dialog.html',
})

export class SMSMsgReportDialog {
  BindData: any = "";
  tooltipContent : any = "";
  constructor(
    private router: Router,
    private smsService: SmsService,
    public dialogRefInfo: MatDialogRef<SMSMsgReportDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }    

  ngOnInit() {    
    if (this.data.id) {
      const credentials = this.data.id;      
      this.smsService.getmessage(credentials).subscribe(pagedData => {                
        this.BindData = pagedData;
        });        
    }
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'infoSMSReport-dialog',
  templateUrl: 'infoSMSReport-dialog.html',
})

export class InfoSMSReportDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoSMSReportDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}