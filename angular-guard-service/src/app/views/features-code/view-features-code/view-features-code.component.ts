import { Component, OnInit,Inject } from '@angular/core';
import { FeaturesCodeService } from '../features-code.service';
import { Router,NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Errors, CommonService,ExcelService, ExtensionService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare const ExcelJS: any;

@Component({
  selector: 'app-view-features-code',
  templateUrl: './view-features-code.component.html',
  styleUrls: ['./view-features-code.component.css']
})

export class ViewFeaturesCodeComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
  isCallTransfer : boolean = false;
  isCallForward : boolean = false;
  isVoicemail : boolean = false;
  isAdminExtension : boolean = false;
 
  constructor(
    private featuresCodeService: FeaturesCodeService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private extensionService: ExtensionService
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_type': [""]
    });   
  }

  ngOnInit() {
    if (localStorage.getItem('type') == '1' || localStorage.getItem('type') == '6') {
      this.extensionService.getMyExtensionLimit(localStorage.getItem('id'), localStorage.getItem('type')).subscribe(data => {
        this.isCallTransfer = data.ext.call_transfer === 1 ? true : false;
        this.isCallForward = data.ext.forward === 1 ? true : false;
        this.isVoicemail = data.ext.voicemail === 1 ? true : false;
        this.isAdminExtension = data.ext.admin === 1 ? true : false;
        this.displayAllRecord();
      })
    } else {
      this.displayAllRecord();
    }
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'code', headerName: 'Code', hide: false, width: 10 },
      { field: 'type', headerName: 'Type', hide: false, width: 12 },
      { field: 'name', headerName: 'Name', hide: false, width: 18 },
      {
        field: 'description', headerName: 'Description', tooltipField: 'description', hide: false, width: 45,
      },
    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.featuresCodeService.filterFeatureCode(credentials).subscribe(data => {
        this.exportData = data;
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else { 
      this.featuresCodeService.getFeatureCode().subscribe(data => {
        this.exportData = data;
        if(localStorage.getItem('type') == '0'){
          this.exportData = data;
        }
       else if(localStorage.getItem('type') == '1' || localStorage.getItem('type') == '2'  ){
           data = this.manageFeatureListingForCustomerPortal(this.exportData);
           this.exportData = data;
        }else if(localStorage.getItem('type') == '6'){
          data = this.manageFeatureListingForExtensionPortal(this.exportData);
          this.exportData = data;
        }else{
          return;
        }

        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    }
  }
  

  manageFeatureListingForCustomerPortal(data) {  
    let arr = [];
    data.forEach(item => {
      if((item['name'] === 'Call Transfer' && !this.isCallTransfer) || (item['name'] === 'Enable and Disable Call Forward' && !this.isCallForward)|| (item['name'] === 'Voicemail' && !this.isVoicemail)){
         return;
      }else{
       arr.push(item);
      }
    });
    return arr;
  }

  manageFeatureListingForExtensionPortal(data) {  
    let arr = [];
    data.forEach(item => {
      if((item['name'] === 'Call Transfer' && !this.isCallTransfer) || (item['name'] === 'Attended Call Transfer'&& !this.isCallTransfer) || (item['name'] === 'Enable and Disable Call Forward' && !this.isCallForward)|| (item['name'] === 'Voicemail' && !this.isVoicemail) || (item['name'] === 'Eavesdrop/Whispering/Spy' && !this.isAdminExtension) ||  (item['name'] === 'Self Care IVR' && !this.isAdminExtension) || (item['name'] === "Check other user's Voicemail" && !this.isAdminExtension) || (item['name'] === 'Send to Voicemail' && !this.isVoicemail)){
         return;
      }else{
       arr.push(item);
      }
    });
    return arr;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  exportToExcel():void { 
    let worksheet:any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup:{paperSize: 8, orientation:'landscape',fitToPage: true, fitToHeight: 1, fitToWidth: 1}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };

    worksheet.columns = [
      { header: 'Code', key: 'Code', width: 15 },
      { header: 'Type', key: 'Type', width: 20 },
      { header: 'Name', key: 'Name', width: 25 },
      { header: 'Description', key: 'Description', width: 80 }
    ];

    worksheet.getRow(1).font={
      bold:true,
    }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'FFFF00'}
    };
    for(let i=0;i<this.exportData.length;i++){
      let strCode = this.exportData[i].code;
      let strCode1 = strCode.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Code:strCode1,
        Type:this.exportData[i].type,
        Name:this.exportData[i].name,
        Description:this.exportData[i].description,
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
    worksheet.spliceRows(1,0,new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'featureCode');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'featureCode');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Code","Type","Name","Description"];
    var rows = [];
    this.exportData.forEach(element => {
      debugger
      let strCode = element.code;
      let strCode1 = strCode.replace(/<[^>]*>/g, '');
      const e11= [strCode1,element.type,element.name,element.description];
      rows.push(e11);
    });
    doc.autoTable(col, rows,{
      theme: 'grid',      
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      styles: {
        overflow: 'linebreak',
        fontSize: 6
      },     
      columnStyles: {
        0: {cellWidth: 'wrap'},
        1: {cellWidth: 'wrap'},
        2: {cellWidth: 'wrap'},
        3:{cellWidth: 'wrap'}
      },
    });
    doc.save('featureCode.pdf');
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
    const dialogRefInfo = this.dialog.open(InfoFeatureCodeDialog, {
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
  selector: 'infoFeatureCode-dialog',
  templateUrl: 'infoFeatureCode-dialog.html',
})

export class InfoFeatureCodeDialog {
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoFeatureCodeDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) {}
 
  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      document.getElementsByTagName("app-website-nav")[0].scrollIntoView();
    });
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
