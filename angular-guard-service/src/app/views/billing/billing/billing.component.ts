import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BillingService } from '../billing.service';
import { CommonService, ExcelService, BillingData } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../user/user.service';

declare const ExcelJS: any;
export var productId = '1';


@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  // companyData = "";
  companyData: any[] = [];
  exportData: any = {};
  defaultPageSize= '10';

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'company_name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';

  constructor(
    private router: Router,
    private billingService: BillingService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private userService: UserService
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_company': new FormControl([]),
      'by_number': [""],
      'by_country': new FormControl([]),
    });
  }

  ngOnInit() {
    this.displayAllRecord();
    //get company data
    let userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    if (userType == '3') {
      this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.companyData.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
        }
      }, err => {
        this.error = err.message;
      });
    }else{
    this.commonService.getCompany().subscribe(data => {
      this.companyData = data.response;
    }, err => {
      this.error = err.message;
    });

    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
    }, err => {
      this.error = err.message;
    });
  }
  }
  Providerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyData.filter((data) =>{    
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'date', headerName: 'Date', hide: false, width: 10},
      { field: 'country', headerName: 'Country', hide: false, width: 10 },
      { field: 'number', headerName: 'Number/Product Name', hide: false, width: 15 },
      { field: 'company', headerName: 'Company', hide: false, width: 10 },
      { field: 'description', headerName: 'Description', hide: false, width: 10 },
      { field: 'amountDisplay', headerName: 'Amount', hide: false, width: 10 }
    ];

    if (this.isFilter) {
      let role = Number(localStorage.getItem('type'));
      let ResellerID = Number(localStorage.getItem('id'));
      const credentials = this.filterForm.value;
      credentials.by_number = Number(this.filterForm.value.by_number);
      this.billingService.filterBillingInfo(credentials,role,ResellerID).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
      this.billingService.getBillingInfo({role,ResellerID}).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let managedBtn = (pagedData[i].description).split('-');
      // let finalBtn = '';
      // finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";

    
      // finalBtn += "</span>";
      pagedData[i]['description'] = managedBtn[0];
      pagedData[i]['number'] = pagedData[i]['number'] ? pagedData[i]['number'] : managedBtn[1];
      pagedData[i]['country'] = pagedData[i]['country'] ?  pagedData[i]['country'] :managedBtn[2];
      // pagedData[i]['description'] = pagedData[i].description;
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
      pageSetup:{paperSize: 8, orientation:'landscape',views:[{showGridLines: true}]}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };  
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Country', key: 'country', width: 30 },
      { header: 'Number', key: 'number', width: 18 },
      { header: 'Company', key: 'company', width: 30 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Amount', key: 'amount', width: 10 },
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
        date: this.exportData[i].date,
        country: this.exportData[i].country,
        number: this.exportData[i].number,
        company: this.exportData[i].company,
        description: this.exportData[i].description,
        amount: this.exportData[i].amountDisplay
      });
    }
    //for styleing gridlines
    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
      row.border =  {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });
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

    
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    //freeze first row and header will show in 2nd row
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    //this.excelService.exportAsExcelFile(arr, 'contactList');    
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'billing');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Date", "Country", "Number", "Company", "Description", "Amount"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.date, element.country, element.number, element.company, element.description, element.amountDisplay];
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
    doc.save('billing.pdf');
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
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
    const dialogRefInfo = this.dialog.open(InfoBillingDialog, {
      width: '80%', disableClose: true, autoFocus:false,
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
  selector: 'infoBilling-dialog',
  templateUrl: 'infoBilling-dialog.html',
})

export class InfoBillingDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoBillingDialog>, @Inject(MAT_DIALOG_DATA) public data: BillingData,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }
  
  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
