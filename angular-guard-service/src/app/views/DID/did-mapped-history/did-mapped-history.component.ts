import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AllDID } from '../../../core/models';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { DidService } from '../did.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { didUpdated, Errors, CommonService, ExcelService, invalidFileType, rangeError, invalidForm, spaceError, didCreated, errorMessage, maxChanelMessage, duplicateDID, duplicateDIDInRange, num_not_start_with_ziro, importSuccessfully, importUnsuccessfully } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-did-mapped-history',
  templateUrl: './did-mapped-history.component.html',
  styleUrls: ['./did-mapped-history.component.css']
})
export class DidMappedHistoryComponent implements OnInit {

  error = '';
  filterForm: FormGroup;
  countryList:any = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  userRole = '';
  rowData: any;
  companyData = [];
  exportData: any = {};
  defaultPageSize = '10';
  providerList = '';

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';

  constructor(
    private router: Router,
    private didService: DidService,
    private fb: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      'by_did': [""],
      'by_country': new FormControl([]),
      'by_company': new FormControl([]),
      'by_type' : ['filter']
    });
  }

  ngOnInit() {

    //get Providers list
    this.commonService.getProviders().subscribe(data => {
      this.providerList = data.response;
    }, err => {
      this.error = err.message;
    });

    this.didService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.userRole = localStorage.getItem('type');
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
    });

    //get company data
    this.commonService.getAllCustomerCompany().subscribe(data => {
      // this.companyData = data.response;
      data = data.response;
      for (let i = 0; i < data.length; i++) {
        this.companyData.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
      }
    }, err => {
      this.error = err.message;
    });

  }
  Companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.companyData.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  displayAllRecord() {
    var user_id = localStorage.getItem("id");
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'did_type', headerName: 'DID Type', hide: false, width: 10 },
      { field: 'didDisplay', headerName: 'DID', hide: false, width: 10 },
      { field: 'country', headerName: 'Country', hide: false, width: 10 },
      { field: 'provider', headerName: 'Provider', hide: false, width: 10 },
      // { field: 'company_name', headerName: 'Assigned to', hide: false, width: 10 },
      // { field: 'reservation_date', headerName: 'Reservation Date', hide: false, width: 10 },
      // { field: 'release_date', headerName: 'Release Date', hide: false, width: 10 },
   

    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.by_did = Number(this.filterForm.value.by_did);      
      this.didService.filterMappedDIDHistory(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.didService.getMappedDIDHistory().subscribe(pagedData => {
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
      pageSetup:{paperSize: 8, orientation:'landscape',fitToPage: true, fitToHeight: 5, fitToWidth: 7}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'DID', key: 'Did', width: 20 },
      { header: 'Country', key: 'Country', width: 30 },
      { header: 'Provider', key: 'Provider', width: 25 },
      { header: 'Group', key: 'did_group', width: 25 },      
      { header: 'Max CC', key: 'MaxCC', width: 15 },
      { header: 'DID Type', key: 'DidType', width: 30 },
      { header: 'Assigned to', key: 'ReservedFor', width: 25 },
      { header: 'Feature For', key: 'FeatureFor', width: 25 },
      { header: 'Monthly Rate', key: 'MonthlyRate', width: 25 },
      { header: 'Selling Rate', key: 'SellingRate', width: 25 },
      { header: 'Status', key: 'Status', width: 10 },
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
      let strStatus = this.exportData[i].status;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Did: this.exportData[i].did,
        Country: this.exportData[i].country,
        Provider: this.exportData[i].provider,
        did_group: this.exportData[i].did_group,
        MaxCC: this.exportData[i].max_concurrent,
        DidType: this.exportData[i].did_type,
        ReservedFor: this.exportData[i].company,
        FeatureFor: this.exportData[i].active_feature,
        MonthlyRate: this.exportData[i].fixrate,
        SellingRate: this.exportData[i].selling_rate,
        Status: strStatus1
      });
    }
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
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    // this.excelService.exportAsExcelFile(arr, 'did');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'did');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["DID", "Country", "Provider", "Group", "Max CC", "DID Type", "Assigned to", "Feature For", "Monthly Rate", "Selling Rate","Status"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.did, element.country, element.provider, element.did_group, element.max_concurrent, element.did_type, element.company, element.active_feature, element.fixrate, element.selling_rate, strStatus1];
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
        6: { cellWidth: 'wrap' },
        7: { cellWidth: 'wrap' }
      },
    });
    doc.save('did.pdf');
  }


  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='history' title='History'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }


  

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "history":
         return this.showDIDhistory(data);
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

  public showDIDhistory(data){
    const dialogRef = this.dialog.open(InfoDidHistoryDialog, { width: '80%', disableClose: true, data: data });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log('Dialog closed');
      this.displayAllRecord();
    });
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoDidDialog, {
    //   width: '80%', disableClose: true, autoFocus:false,
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

@Component({
  selector: 'InfoDidHistory-dialog',
  templateUrl: 'InfoDidHistory-dialog.html',
})

export class InfoDidHistoryDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoDidHistoryDialog>, @Inject(MAT_DIALOG_DATA) public data: AllDID,
    private didService: DidService, private fb: FormBuilder) { }

  filterForm: FormGroup;
  didHistoryList : any;
  ngOnInit() {
    // const element = document.querySelector('#scrollId');
    // element.scrollIntoView();
    this.filterForm = this.fb.group({
      'by_did': [""],
      'by_country': new FormControl([]),
      'by_company': new FormControl([]),
      'by_type' : ['']
    });
    if (this.data.id) {
      const credentials = this.filterForm.value;
      credentials['by_did'] = Number(this.data['did']);
      this.didService.filterMappedDIDHistory(credentials).subscribe(pagedData => {
        this.didHistoryList = pagedData ? pagedData : [];
      });
    }
  }
  

  cancleDialog(e): void {
    this.dialogRefInfo.close();
    e.preventDefault();
  }
}

