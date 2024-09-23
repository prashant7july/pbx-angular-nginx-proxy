import { Component, Inject, OnInit } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup ,Validator } from '@angular/forms';
// import { CdrService } from '../cdr.service';
import { CommonService, ExcelService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdrService } from '../../cdr/cdr.service';
import { TeleConsultationService } from '../../tele-consultation/tele-consultation.service';
import { BroadcastService } from '../broadcast.service';
declare const ExcelJS: any;

@Component({
  selector: 'app-view-bc-cdr',
  templateUrl: './view-bc-cdr.component.html',
  styleUrls: ['./view-bc-cdr.component.css']
})
export class ViewBcCdrComponent implements OnInit {

  error = '';
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData = "";
  exportData: any = {};
  defaultPageSize = '10';
  allCountryList:any = "";
  terminatecause: any = [];
  bcList : any =[];
  suppressColumnFit: boolean= true;
  public mode : string = 'CheckBox' ;
  public selectAllText: string = "Select All"
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Terminate Cause';

  public fields3: Object = { text: 'name', value: 'id' };
  public placeholder3: string = 'Select Broadcast';

  constructor(
    private router: Router,
    private cdrService: CdrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public broadcastService:BroadcastService
  ) {
    var ex = '^\d+(?:\.\d{1,2})?$';
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_sellcost': [""],
      'by_src': [""],
      'by_dest': [""],
      'by_destination':  new FormControl([]),
      'by_callerid': [""],
      'by_terminatecause': new FormControl([]),
      'by_bc': new FormControl([]),
    });
  }

  ngOnInit() {
    this.displayAllRecord();
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.allCountryList = data.response;
    }, err => {
      this.error = err.message;
    });
    // this.commonService.getCountryList().subscribe(data => {
    //   this.allCountryList = data.response;
    //   for (let i = 0; i < data.length; i++) {
    //     this.allCountryList.push({ id: data[i].id, name: data[i].id });
    //   }
    // }, err => {
    //   this.error = err.message;
    // });
    this.cdrService.getTerminateCause().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.terminatecause.push({ id: data[i].digit, name: data[i].digit + '-' + data[i].description });
      }
    }, err => {
      this.error = err.message;
    });
    let customerId = localStorage.getItem('type') == '1' ? Number(localStorage.getItem('id')) : 0;
    this.broadcastService.getBC({}, customerId).subscribe(pagedData =>{
      this.bcList = pagedData.response;
    }, err => {
        this.error = err.message;
      }
    ); 
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.allCountryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Terminateremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.terminatecause.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Broadcastremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.bcList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'quality', headerName: 'Call Type & Quality', hide: false  },
      { field: 'bc_name', headerName: 'Broadcast Name', hide: false, },
      { field: 'startTime', headerName: 'Start Time', hide: false, },
      { field: 'endTime', headerName: 'End Time', hide: false, },
      { field: 'src', headerName: 'Caller', hide: false, },
      { field: 'dispDst', headerName: 'Callee', hide: false, },
      { field: 'forward', headerName: 'Forward', hide: false, },
      { field: 'dispCallerId', headerName: 'Caller ID', hide: false, },
      { field: 'sessionTime', headerName: 'Session Time', hide: false, },
      { field: 'bridgeTime', headerName: 'Bridge Time', hide: false, },
      // { field: 'dnid', headerName: 'DNID', hide: false, },
      // { field: 'sellCost', headerName: 'Buy Cost', hide: false, },
      // { field: 'callCost', headerName: 'Call Cost', hide: false, },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: false, },
      { field: 'dispDestination', headerName: 'Country', hide: false, },
      { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: false, },
      { field: 'uuid', headerName: 'UUID', hide: false, },
    ];
    var user_id = localStorage.getItem("id");
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.customer_id = user_id;
      this.broadcastService.getBCCdrByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.broadcastService.getBCCdrInfo(user_id, 0).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span><center>";
      if(data[i]['call_type'] == 'inbound'){

        if(data[i]['mos']>=4 && data[i]['mos']<=5){
          finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: green' title='Inbound/ "+data[i]['mos']+"'></i>";
        }else if(data[i]['mos']>=3.4 && data[i]['mos']<4){
        finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: orange' display: inline' title='Inbound/ "+data[i]['mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-down' style='color: red' display: inline' title='Inbound/ "+data[i]['mos']+"'></i>";
      }
    }
      if(data[i]['call_type'] == 'outbound'){
        if(data[i]['mos']>=4 && data[i]['mos']<=5){
          finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: green' title='Outbound/ "+data[i]['mos']+"'></i>";
        }else if(data[i]['mos']>=3.4 && data[i]['mos']<4){
        finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: orange' display: inline' title='Outbound/ "+data[i]['mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-up' style='color: red' display: inline' title='Outbound/ "+data[i]['mos']+"'></i>";
      }
      }

      if(data[i]['call_type'] == 'intercom'){
        if(data[i]['mos']>=4 && data[i]['mos']<=5){
          finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: green' title='Intercom/ "+data[i]['mos']+"'></i>";
        }else if(data[i]['mos']>=3.4 && data[i]['mos']<4){
        finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: orange' display: inline' title='Intercom/ "+data[i]['mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrows-h' style='color: red' display: inline' title='Intercom/ "+data[i]['mos']+"'></i>";
      }
      }
      
      finalBtn += "</center></span>";

      data[i]['quality'] = finalBtn;
    }
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
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
   
    worksheet.columns = [
      { header: 'Start Time', key: 'StartTime', width: 25 },
      { header: 'End Time', key: 'EndTime', width: 25 },
      { header: 'Caller', key: 'Source', width: 10 },
      { header: 'Callee', key: 'Dest', width: 15 },
      { header: 'Caller Id', key: 'Callerid', width: 20 },
      { header: 'Session Time', key: 'SessionTime', width: 15 },
      { header: 'Bridge Time', key: 'BridgeTime', width: 15 },    
      { header: 'DNID', key: 'DNID', width: 20 },
      { header: 'Buy Cost', key: 'SellCost', width: 10 },  
      { header: 'Terminate Cause', key: 'TerminateCause', width: 20 },
      { header: 'Country', key: 'Destination', width: 15 },      
      { header: 'Hangup Disposition', key: 'HangupDisposition', width: 25 },
      { header: 'UUID', key: 'UUID', width: 25 },
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
        StartTime: this.exportData[i].startTime,
        EndTime: this.exportData[i].endTime,
        Source: this.exportData[i].src,
        Dest: this.exportData[i].dispDst,        
        CallerId: this.exportData[i].dispCallerId,
        SessionTime: this.exportData[i].sessionTime,
        BridgeTime: this.exportData[i].bridgeTime,
        DNID: this.exportData[i].dnid,
        SellCost: this.exportData[i].sellCost,
        TerminateCause: this.exportData[i].termDescription,
        Destination: this.exportData[i].dispDestination,
        HangupDisposition: this.exportData[i].hangup_disposition,
        UUID: this.exportData[i].uuid,
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
      FileSaver.saveAs(blob, 'Broadcast_report');
    });
  }

  downloadPDF() {
    var doc = new jsPDF();
    var col = ["Start Time", "End Time","Caller", "Callee","Caller Id", "Session Time", "Bridge Time",
    "DNID", "Buy Cost", "Terminate Cause", "Country","Hangup Disposition","UUID"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.startTime, element.endTime,element.src, element.dispDst,element.dispCallerId,element.sessionTime, element.bridgeTime,
        element.dnid, element.sellCost, element.termDescription, element.dispDestination, element.hangup_disposition,element.uuid];
      rows.push(e11);
    });
    doc.autoTable(col, rows, {
      theme: 'grid',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      styles: {
        overflow: 'linebreak',
        fontSize: 5.8,
        columnWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
        7: { cellWidth: 'auto' },
        8: { cellWidth: 'auto' },
        9: { cellWidth: 'auto' },
        10: { cellWidth: 'auto' },
        11: { cellWidth: 'auto' },
        12: { cellWidth: 'auto' },
        13: { cellWidth: 'auto' }             },
    });
    doc.save('Broadcast_report.pdf');
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoBroadcastCDRDialog, {
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
  selector: 'infoBroadcastCDR-dialog',
  templateUrl: 'infoBroadcastCDR-dialog.html',
})

export class InfoBroadcastCDRDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoBroadcastCDRDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}


