import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BillingService } from '../billing.service';
import { CommonService, ExcelService, BillingData } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';
import { ToastrService } from 'ngx-toastr';



declare const ExcelJS: any;

@Component({
  selector: 'app-customer-billing',
  templateUrl: './customer-billing.component.html',
  styleUrls: ['./customer-billing.component.css']
})
export class CustomerBillingComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  countryList = "";
  // maxDate: Date;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';

  constructor(
    private router: Router,
    private billingService: BillingService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""]
    });
  }

  ngOnInit() {
    this.displayAllRecord();
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'date', headerName: 'Date', hide: false, width: 10 },
      { field: 'country', headerName: 'Country', hide: false, width: 10 },
      { field: 'number', headerName: 'Number/Product Name', hide: false, width: 10 },
      { field: 'description', headerName: 'Description', hide: false, width: 10 },
      { field: 'amountDisplay', headerName: 'Amount', hide: false, width: 10 }
    ];
    var user_id = localStorage.getItem("id");
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.user_id = Number(user_id);
      this.billingService.filterCustomerBillingInfo(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.billingService.getCustomerBillingInfo(user_id).subscribe(pagedData => {
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

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let managedBtn = (pagedData[i].description).split('-');
      pagedData[i]['description'] = managedBtn[0];
      pagedData[i]['number'] = pagedData[i]['number'] ? pagedData[i]['number'] : managedBtn[1];
      pagedData[i]['country'] = pagedData[i]['country'] ? pagedData[i]['country'] : managedBtn[2];
    }
    return pagedData;
  }

  exportToExcel(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 5, fitToWidth: 7, views: [{ showGridLines: true }] }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Date', key: 'Date', width: 20 },
      { header: 'Country', key: 'Country', width: 30 },
      { header: 'Number', key: 'Number', width: 18 },
      { header: 'Description', key: 'Description', width: 30 },
      { header: 'Amount', key: 'Amount', width: 10 },
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
        Date: this.exportData[i].date,
        Country: this.exportData[i].country,
        Number: this.exportData[i].number,
        Description: this.exportData[i].description,
        Amount: this.exportData[i].amountDisplay
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
    worksheet.spliceRows(1, 0, new Array(offset));
    // this.excelService.exportAsExcelFile(arr, 'customerBilling');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'customerBilling');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Date", "Country", "Number", "Description", "Amount"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.date, element.country, element.number, element.description, element.amountDisplay];
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
        5: { cellWidth: 'wrap' }
      },
    });
    doc.save('customerBilling.pdf');
  }
  advanceExportToExcel() {
    const dialogRefInfo = this.dialog.open(BillingAdvanceExcelDialog, {
      width: '60%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0, exportData: this.exportData
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

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCustomerBillingDialog, {
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

}


@Component({
  selector: 'infoCustomerBilling-dialog',
  templateUrl: 'infoCustomerBilling-dialog.html',
})

export class InfoCustomerBillingDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCustomerBillingDialog>, @Inject(MAT_DIALOG_DATA) public data: BillingData,
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
  selector: 'advance-excel-dialog',
  templateUrl: 'advance-excel-dialog.html',
  styleUrls: ['./customer-billing.component.css'],
  providers: [CheckBoxSelectionService]
})

export class BillingAdvanceExcelDialog {
  [x: string]: any;
  columnList: any[] = [];
  selectedColumn: any;
  selectedDate: any;
  public mode;
  public selectAllText: string
  public fields: Object = { text: 'name', value: 'name' };
  public placeholder: string = 'Select Column *';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  exportData: any = {};
  caller: object = {};
  isShowLocation: boolean = false;

  constructor(
    private billingService: BillingService,
    public dialogRefInfo: MatDialogRef<BillingAdvanceExcelDialog>,
    @Inject(MAT_DIALOG_DATA) public data: '',
    //  private cdrService: CdrService,
    private toastr: ToastrService,
    //  private extensionService: ExtensionService,

  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    this.mode = 'CheckBox';
    this.selectAllText = 'Select All';
    element.scrollIntoView();
    this.insertValueInColumnList();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }

  insertValueInColumnList() {
    // this.columnList.push({ id: 1, name: 'Company'});
    this.columnList.push({ id: 1, name: 'Country' });
    // this.columnList.push({ id: 2, name: 'Number'});
    this.columnList.push({ id: 3, name: 'Description' });
    this.columnList.push({ id: 4, name: 'Amount' });
  }

  submitDialog(): void {
    var user_id = localStorage.getItem("id");
    if (this.selectedColumn == undefined || this.selectedDate == undefined) {
      this.toastr.error('Date and Column field is mandatory.', 'Error!')
    } else {
      let credentials = {};
      credentials['user_id'] = Number(user_id);
      // let credentials = {};
      credentials['by_date'] = this.selectedDate;
      credentials['by_columns'] = this.selectedColumn;
      this.billingService.filterCustomerBillingInfo(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        this.downloadCSV();
        this.dialogRefInfo.close();
      });
    }
  }

  downloadCSV() {
    let selectedColumn: any = [];
    selectedColumn = this.selectedColumn;
    //  if(selectedColumn.includes('Caller Media')){
    //  }
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
    let tableColumn = [];
    this.columnList.forEach(function (item) {
      selectedColumn.forEach(item2 => {
        if (item['name'] == item2) {
          if (item['name'] == 'Start Time') {
            tableColumn.push("Start Date");
            tableColumn.push(item2);
            return;
          } else if (item['name'] == 'End Time') {
            tableColumn.push("End Date");
            tableColumn.push(item2);
            return;
          } else {
            tableColumn.push(item2);
            return;
          }
        }
      });
    });
    let mapTableColumn = tableColumn.map(item => {
      let obj = {};
      obj['header'] = item;
      obj['key'] = item.replace(/\s+/g, '');
      obj['width'] = 15;
      return obj;
    });
    worksheet.columns = mapTableColumn;
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
        Country: this.exportData[i].country,
        // Number: this.exportData[i].number,
        Description: this.exportData[i].description,
        Amount: this.exportData[i].amountDisplay
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
      FileSaver.saveAs(blob, 'Billing');
    });
  }
}
