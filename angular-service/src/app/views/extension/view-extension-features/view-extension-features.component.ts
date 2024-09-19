import { Component,OnInit,Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PagedData, Page, ExtensionFeature } from '../../../core/models';
import { ExtensionService } from '../../extension/extension.service';
import { ExcelService, CommonService  } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare const ExcelJS: any;

@Component({
  selector: 'app-view-extension-features',
  templateUrl: './view-extension-features.component.html',
  styleUrls: ['./view-extension-features.component.css']
})
export class ViewExtensionFeaturesComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData:any={}; 
  defaultPageSize = '10';

  constructor(
    private router: Router,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
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
    this.displayAllRecord();
  }


  displayAllRecord() {
    var user_id = localStorage.getItem("id");

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'id', headerName: 'ID', hide: true, width: 130 },
      { field: 'number', headerName: 'Number', hide: false, width: 120 },  
      { field: 'name', headerName: 'Name', hide: false, width: 150 },
      { field: 'admin', headerName: 'Admin', hide: false, width: 100 },
      { field: 'dnd', headerName: 'DND', hide: false, width: 70 },
      //{ field: 'black_list', headerName: 'Black List', hide: false, width: 10 },
      { field: 'call_transfer', headerName: 'Call Transfer', hide: false, width: 120 },
      { field: 'forward', headerName: 'Call Forward', hide: false, width: 120 },
      { field: 'voicemail', headerName: 'Voice Mail', hide: false, width: 100 },
      { field: 'speed_dial', headerName: 'Speed Dial', hide: false, width: 100 },
      { field: 'outbound', headerName: 'Outbound', hide: false, width: 100 },
      { field: 'recording', headerName: 'Recording', hide: false, width: 100 },
      { field: 'roaming', headerName: 'Roaming', hide: false, width: 100 },
      { field: 'ringtone', headerName: 'Ringtone', hide: false, width: 100 },
      { field: 'balance_restriction', headerName: 'Balance Restriction', hide: false, width: 150 },
      { field: 'multiple_registration', headerName: 'Multiple Registration', hide: false, width: 170},
      { field: 'find_me_follow_me', headerName: 'Find Me Follow Me', hide: false, width: 150 },
      { field: 'sticky_agent', headerName: 'Sticky Agent', hide: false, width: 120 },
    ];
    
    
    

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials['user_id'] = Number(user_id);
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
      this.extensionService.getCustomerExtensionFeatures(user_id).subscribe(pagedData => {
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
  
  exportToExcel():void {
    let worksheet:any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  
    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
     pageSetup:{paperSize: 8, orientation:'landscape'}
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
      { header: 'Admin', key: 'ADMIN', width: 10 },
      //{ header: 'Blacklist', key: 'BlackList', width: 10 },
      { header: 'Call Transfer', key: 'CallTransfer', width: 20 },
      { header: 'Call Forward', key: 'CallForward', width: 20 },
      { header: 'Voicemail', key: 'VoiceMail', width: 10 },
      { header: 'Speed Dial', key: 'SpeedDial', width: 10 },
      { header: 'Outbound', key: 'Outbound', width: 10 },
      { header: 'Recording', key: 'Recording', width: 10 },
      { header: 'Roaming', key: 'Roaming', width: 10 },
      { header: 'Ringtone', key: 'Ringtone', width: 10 },
      { header: 'Balance Restriction', key: 'BalanceRestriction', width: 20 },
      { header: 'Multiple Registration', key: 'MultipleRegistration', width: 20 },
      { header: 'Find Me Follow Me', key: 'FindMeFollowMe', width: 20 },
      { header: 'Sticky Agent', key: 'StickyAgent', width: 20 }
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
      worksheet.addRow({
        Number:this.exportData[i].number,
        Name:this.exportData[i].name,
        DND:this.exportData[i].dnd == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        ADMIN:this.exportData[i].admin == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        // BlackList:this.exportData[i].black_list == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        CallTransfer:this.exportData[i].call_transfer == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        CallForward:this.exportData[i].forward == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        VoiceMail:this.exportData[i].voicemail == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        SpeedDial:this.exportData[i].speed_dial == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        Outbound:this.exportData[i].outbound == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        Recording:this.exportData[i].recording == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        Roaming:this.exportData[i].roaming == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        Ringtone:this.exportData[i].ringtone == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        BalanceRestriction:this.exportData[i].balance_restriction == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        MultipleRegistration:this.exportData[i].multiple_registration == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        FindMeFollowMe:this.exportData[i].find_me_follow_me == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
        StickyAgent:this.exportData[i].sticky_agent == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes',
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

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'extension');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Number","Name","DND","Admin","Call Transfer","Call Forward","Voicemail","Speed Dial","Outbound","Recording","Roaming","Ringtone","Balance Restriction","Multiple Registration","Find Me Follow Me","Sticky Agent"];
    var rows = [];
    this.exportData.forEach(element => {
      let dnd=element.dnd == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let admin=element.admin == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      // let blacklist=element.black_list == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let calltransfer=element.call_transfer == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let callforward=element.forward == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let voicemail=element.voicemail == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let speeddial=element.speed_dial == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let outbound=element.outbound == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let recording=element.recording == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let roaming=element.roaming == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let ringtone=element.ringtone == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let balanceRestriction=element.balance_restriction == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let multipleRegistration=element.multiple_registration == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let FindMeFollowMe=element.find_me_follow_me == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      let StickyAgent=element.sticky_agent == "<span><img style='width: 15px;' src='assets/img/brand/cross.svg' /></span>" ? 'No' :'Yes';
      const e11= [element.number,element.name,dnd,admin, calltransfer,callforward,voicemail,speeddial,outbound,recording,roaming,ringtone,balanceRestriction,multipleRegistration, FindMeFollowMe, StickyAgent];
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
        3:{cellWidth: 'wrap'},
        4:{cellWidth: 'wrap'},
        5: {cellWidth: 'wrap'},
        6: {cellWidth: 'wrap'},
        7: {cellWidth: 'wrap'},
        8:{cellWidth: 'wrap'},
        9:{cellWidth: 'wrap'},
        10:{cellWidth: 'wrap'},
        11:{cellWidth: 'wrap'},
        12:{cellWidth: 'wrap'},
        13:{cellWidth: 'wrap'},
        14:{cellWidth: 'wrap'},
        15:{cellWidth: 'wrap'}
      },
      // startY: 60       
    });
    doc.save('extension.pdf');
  }


  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';

      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
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
      pagedData[i]['roaming'] = this.getUiByData(pagedData[i]['roaming']);
      pagedData[i]['balance_restriction'] = this.getUiByData(pagedData[i]['balance_restriction']);
      pagedData[i]['multiple_registration'] = this.getUiByData(pagedData[i]['multiple_registration']);
      pagedData[i]['admin'] = this.getUiByData(pagedData[i]['admin']);
      pagedData[i]['ringtone'] = this.getUiByData(pagedData[i]['ringtone']);
      pagedData[i]['sticky_agent'] = this.getUiByData(pagedData[i]['sticky_agent']);
      pagedData[i]['find_me_follow_me'] = this.getUiByData(pagedData[i]['find_me_follow_me']);
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
    // this.router.navigate(['extension/manage'], { queryParams: { id: data.id, customer_id: data.customer_id, action: 'viewFeature' } });
    this.router.navigate(['user/extension/viewFeatures/manage'], { queryParams: { id: data.id, customer_id: data.customer_id, action: 'viewFeature' } });
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editExtension(data);
    }
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoExtensionFeaturesDialog, {
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
  selector: 'infoExtensionFeatures-dialog',
  templateUrl: 'infoExtensionFeatures-dialog.html',
})

export class InfoExtensionFeaturesDialog {
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoExtensionFeaturesDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
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

