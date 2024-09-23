import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
  selector: 'app-view-admin-sms-report',
  templateUrl: './view-admin-sms-report.component.html',
  styleUrls: ['./view-admin-sms-report.component.css']
})
export class ViewAdminSmsReportComponent implements OnInit {

  error = '';
  smsList:any = "";
  smsCategoryList = "";
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData:any = "";
  exportData: any = {};
  defaultPageSize = '10';
 
  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'company_name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select SMS Plan';

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
      'by_company': new FormControl([]),
      'by_smsplan': new FormControl([]),
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
  Customerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyData.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.smsList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, minWidth: 10 },
      { field: 'sentTime', headerName: 'Date', hide: false, minWidth: 25 },   
      { field: 'sourceName', headerName: 'Customer', hide: false, minWidth: 15 },
      { field: 'destination', headerName: 'SMS Sent', hide: false, minWidth: 7 },
      { field: 'category_name', headerName: 'SMS Category', hide: false, minWidth: 35 },      
      { field: 'smsType', headerName: 'SMS Plan', hide: false, minWidth: 15 },    
      { field: 'smsValidity', headerName: 'SMS Validity', hide: false, minWidth: 12 }, 
      { field: 'amount', headerName: 'SMS Amount', hide: false, minWidth: 6 }, 
    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.smsService.getAdminSMSReportByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.smsService.getAdminSMSReportInfo(0).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }


  manageUserActionBtn(data) {
    
    return data;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
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
      { header: 'Customer', key: 'sourceName', width: 15 },
      { header: 'SMS Sent', key: 'destination', width: 15 },   
      { header: 'SMS Category', key: 'category_name', width: 25 },   
      { header: 'SMS Plan', key: 'smsType', width: 15 },
      { header: 'SMS Validity', key: 'smsValidity', width: 15 },   
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
        sourceName: this.exportData[i].sourceName,
        destination: this.exportData[i].destination,
        category_name: this.exportData[i].category_name,
        smsType: this.exportData[i].smsType,
        smsValidity: this.exportData[i].smsValidity,
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
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'SMS Report');
    });
  }

  downloadPDF() {
    var doc = new jsPDF('p', 'mm', 'a3');
    var col = ["Date","Customer", "SMS Sent", "SMS Category","SMS Plan", "SMS Validity", "SMS Amount"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.sentTime, element.sourceName, element.destination, element.category_name,element.smsType, element.smsValidity,element.amount];
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
    doc.save('SMS report.pdf');
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoAdminCdrDialog, {
    //   width: '80%', disableClose: true, autoFocus: false,
    //   data: {
    //     customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
    //   }
    // });
    // dialogRefInfo.keydownEvents().subscribe(e => {
    //   if (e.keyCode == 27) {
    //     dialogRefInfo.close('Dialog closed');
    //   }
    // });
    // dialogRefInfo.afterClosed().subscribe(result => {
    //   console.log('Dialog closed');
    // });
  }


}
