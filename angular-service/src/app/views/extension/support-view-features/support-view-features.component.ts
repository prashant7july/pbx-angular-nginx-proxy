import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PagedData, Page, ExtensionFeature } from '../../../core/models';
import { ExtensionService } from '../../extension/extension.service';
import { UserService } from '../../user/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService, ExcelService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tooltip, TooltipEventArgs } from '@syncfusion/ej2-popups';

declare const ExcelJS: any;

export var userId = '';
export var productId = '1';

@Component({
  selector: 'app-support-view-features',
  templateUrl: './support-view-features.component.html',
  styleUrls: ['./support-view-features.component.css']
})
export class SupportViewFeaturesComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  isFilter = false;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  userRole = false;
  showSearching = false;
  exportData: any = {};
  defaultPageSize = '10';
  companyList: any[] = [];
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';

  public tooltip: Tooltip;
  public companyInSelectedFilter  : any ;

  constructor(
    private router: Router,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public commonService: CommonService,
  ) {
    this.filterForm = this.formBuilder.group({
      'by_name': [""],
      'by_number': [""]
    });
  }

  ngOnInit() {
    let userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    this.userRole = localStorage.getItem('type') == '0' || localStorage.getItem('type') == '2' ? true : false;
    productId = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : '1';
    if (userType == '3') {
      this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.companyList.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
        }
      }, err => {
        this.error = err.message;
      });
    }
    else{
    this.userService.getCustomerCompany(productId).subscribe(datas => {
      let data = datas.response;
      for (let i = 0; i < data.length; i++) {
        this.companyList.push({ id: data[i].id,content:data[i], name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
      }
      let isPreSelectedCompanyId = localStorage.getItem('extension_selected_Comapany');
      if(isPreSelectedCompanyId) {
        this.companyInSelectedFilter = Number(isPreSelectedCompanyId);
        let obj = {};
        let managedObj = {};
        obj['id'] = isPreSelectedCompanyId;
        managedObj['itemData'] = obj;
        this.selectCompanyDiv(managedObj);
      }
      // this.selectedValue = data.response;
    }, err => {
      this.error = err.message;
    });
  }
  }

  Providerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  // ngAfterViewInit(){
  //   //Initialize Tooltip component
  //   this.tooltip = new Tooltip({
  //       // default content of tooltip
  //       content: 'Loading...',
  //       // set target element to tooltip
  //       target: '.e-dropdownlist',  
  //       // set position of tooltip
  //       //position: 'top center',
  //       // bind beforeRender event
  //       beforeRender: this.onBeforeRender
  //   });
  //   this.tooltip.appendTo('body');
  // }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: this.userRole, width: 100  },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'number', headerName: 'Number', hide: false, width: 150 },
      { field: 'name', headerName: 'Name', hide: false, width: 150 },
      { field: 'dnd', headerName: 'DND', hide: false, width: 80 },
      //{ field: 'black_list', headerName: 'Black List', hide: false, width: 10 },
      { field: 'call_transfer', headerName: 'Call Transfer', hide: false, width: 120 },
      { field: 'forward', headerName: 'Call Forward', hide: false, width: 120 },
      { field: 'voicemail', headerName: 'Voice Mail', hide: false, width: 120 },
      { field: 'speed_dial', headerName: 'Speed Dial', hide: false, width: 120 },
      { field: 'outbound', headerName: 'Outbound', hide: false, width: 120 },
      { field: 'recording', headerName: 'Recording', hide: false, width: 120 },
      { field: 'balance_restriction', headerName: 'Balance Restriction', hide: false, width: 150 },
      { field: 'multiple_registration', headerName: 'Multiple Registration', hide: false, width: 170 },

    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials['user_id'] = Number(userId);
      credentials['by_number'] = Number(credentials['by_number']);
      this.extensionService.filterExtensionFeatures(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.extensionService.getCustomerExtensionFeatures(userId).subscribe(pagedData => {
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
      pageSetup:{paperSize: 8, orientation:'landscape',fitToPage: true, fitToHeight: 1, fitToWidth: 1}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Number', key: 'Number', width: 15 },
      { header: 'Name', key: 'Name', width: 25 },
      { header: 'DND', key: 'DND', width: 10 },
      
      { header: 'Call Transfer', key: 'CallTransfer', width: 20 },
      { header: 'Call Forward', key: 'CallForward', width: 20 },
      { header: 'Voicemail', key: 'VoiceMail', width: 10 },
      { header: 'Speed Dial', key: 'SpeedDial', width: 10 },
      { header: 'Outbound', key: 'Outbound', width: 10 },
      { header: 'Recording', key: 'Recording', width: 10 },
      { header: 'Balance Restriction', key: 'BalanceRestriction', width: 20 },
      { header: 'Multiple Registration', key: 'MultipleRegistration', width: 20 },
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
        Number: this.exportData[i].number,
        Name: this.exportData[i].name,
        DND: this.exportData[i].dnd == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
       // BlackList: this.exportData[i].black_list == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
        CallTransfer: this.exportData[i].call_transfer == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
        CallForward: this.exportData[i].forward == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
        VoiceMail: this.exportData[i].voicemail == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
        SpeedDial: this.exportData[i].speed_dial == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
        Outbound: this.exportData[i].outbound == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
        Recording: this.exportData[i].recording == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
        BalanceRestriction: this.exportData[i].balance_restriction == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
        MultipleRegistration: this.exportData[i].multiple_registration == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes',
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
    worksheet.spliceRows(1, 0, new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'extension');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Number", "Name", "DND", "Call Transfer", "Call Forward", "Voicemail", "Speed Dial", "Outbound", "Recording", "Balance Restriction", "Multiple Registration"];
    var rows = [];
    this.exportData.forEach(element => {
      let dnd = element.dnd == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
     // let blacklist = element.black_list == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
      let calltransfer = element.call_transfer == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
      let callforward = element.forward == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
      let voicemail = element.voicemail == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
      let speeddial = element.speed_dial == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
      let outbound = element.outbound == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
      let recording = element.recording == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
      let balanceRestriction = element.balance_restriction == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';
      let multipleRegistration = element.multiple_registration == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' : 'Yes';

      const e11 = [element.number, element.name, dnd, calltransfer, callforward, voicemail, speeddial, outbound, recording, balanceRestriction, multipleRegistration];
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
        7: { cellWidth: 'wrap' },
        8: { cellWidth: 'wrap' },
        9: { cellWidth: 'wrap' },
        //10: { cellWidth: 'wrap' }
      },  // startY: 60
    });
    doc.save('extension.pdf');
  }


  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';

      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline' data-action-type='view' title='View'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;

      pagedData[i]['dnd'] = this.getUiByData(pagedData[i]['dnd']);
      pagedData[i]['black_list'] = this.getUiByData(pagedData[i]['black_list']);
      pagedData[i]['call_transfer'] = this.getUiByData(pagedData[i]['call_transfer']);
      pagedData[i]['forward'] = this.getUiByData(pagedData[i]['forward']);
      pagedData[i]['voicemail'] = this.getUiByData(pagedData[i]['voicemail']);
      pagedData[i]['speed_dial'] = this.getUiByData(pagedData[i]['speed_dial']);
      pagedData[i]['outbound'] = this.getUiByData(pagedData[i]['outbound']);
      pagedData[i]['recording'] = this.getUiByData(pagedData[i]['recording']);
      pagedData[i]['balance_restriction'] = this.getUiByData(pagedData[i]['balance_restriction']);
      pagedData[i]['multiple_registration'] = this.getUiByData(pagedData[i]['multiple_registration']);
    }
    return pagedData;
  }

  getUiByData(flag) {
    let activeInactive = '';
    activeInactive += "<span>";
    if (flag == '1') {
      activeInactive += "<img style='width: 15px;' src='assets/img/brand/check.svg' />";
    } else {
      activeInactive += "<img style='width: 15px;' src='assets/img/brand/cross.svg' />";
    }
    activeInactive += "</span>";
    return activeInactive;
  }

  editExtension(data) {
    this.router.navigate(['extension/supportViewFeatures/manage'], { queryParams: { id: data.id, customer_id: data.customer_id } });
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  selectCompanyDiv(e) {
    let myKeyword = e ? e['itemData'].id : 0;
    userId = myKeyword;
    localStorage.setItem('extension_selected_Comapany',myKeyword.toString());
    this.showSearching = true;
    this.displayAllRecord();
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "view":
        return this.editExtension(data);
    }
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoSupportExtensionFeaturesDialog, {
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

  // //beforeRender event of tooltip
  // onBeforeRender(args: TooltipEventArgs): void {
  //   // get the target element
  //   let listElement = document.getElementById('ddltooltip');
  //   let result: Object[] = listElement.ej2_instances[0].dataSource;
  //   // let i: number;
  //   // for (i = 0; i < result.length; i++) {
  //   //   if (result[i].text === args.target.textContent) {
  //   //     this.content = result[i].content;
  //   //     this.dataBind();
  //   //     break;
  //   //   }
  //   // }
  // }

  // ngOnDestroy() {
  //   this.tooltip.destroy();
  // }
}

@Component({
  selector: 'infoSupportExtensionFeatures-dialog',
  templateUrl: 'infoSupportExtensionFeatures-dialog.html',
})

export class InfoSupportExtensionFeaturesDialog {
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoSupportExtensionFeaturesDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

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
