import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
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
declare const ExcelJS: any;
@Component({
  selector: 'app-customer-feedback-report',
  templateUrl: './customer-feedback-report.component.html',
  styleUrls: ['./customer-feedback-report.component.css']
})
export class CustomerFeedbackReportComponent implements OnInit {

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
  allCountryList:any="";
  terminatecause : any = [];
  tcList : any =[];

  public mode : string = 'CheckBox' ;
  public selectAllText: string = "Select All"
  public fields: Object = { text: 'name', value: 'phonecode' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Terminate Cause';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public cdrService:CdrService
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      // 'by_sellcost': [""],
      'by_src': [""],
      'by_dest': [""],
      'by_destination': [""],
      'by_callerid': [""],
      'by_terminatecause': [""],
      'by_call_type' : [""]
      // 'by_tc': [""],
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
    this.cdrService.getTerminateCause().subscribe(data => {
      // this.terminatecause = data;
      for (let i = 0; i < data.length; i++) {
        this.terminatecause.push({ id: data[i].digit, name: data[i].digit + '-' + data[i].description });
      }
    }, err => {
      this.error = err.message;
    });
    let customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
  }

  Accountremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.terminatecause.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.allCountryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'quality', headerName: 'Call Type & Quality', hide: false, width: 160 },
      // { field: 'tc_name', headerName: 'TC Name', hide: false, width: 10 },
      { field: 'startTime', headerName: 'Start Time', hide: false, width: 150 },
      { field: 'endTime', headerName: 'End Time', hide: false, width: 150 },
      { field: 'src', headerName: 'Caller', hide: false, width: 150 },
      { field: 'dispDst', headerName: 'Callee', hide: false, width: 150 },
      { field: 'dispCallerId', headerName: 'Caller ID', hide: false, width: 150 },
      { field: 'sessionTime', headerName: 'Session Time', hide: false, width: 150 },
      { field: 'bridgeTime', headerName: 'Bridge Time', hide: false, width: 150 },
      { field: 'dtmf', headerName: 'DTMF', hide: false, width: 120 },
      // { field: 'sellCost', headerName: 'Buy Cost', hide: false, width: 10 },
      // { field: 'callCost', headerName: 'Call Cost', hide: false, width: 10 },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: false, width: 150 },
      { field: 'dispDestination', headerName: 'Country', hide: false, width: 150 },
      { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: false, width: 180 },
      { field: 'uuid', headerName: 'UUID', hide: false, width: 100 },
    ];
    var user_id = localStorage.getItem("id");
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.by_callerid = Number(credentials.by_callerid);
      credentials.by_dest = Number(credentials.by_dest);
      credentials.by_src = Number(credentials.by_src);      
      credentials.customer_id = Number(user_id);
      this.cdrService.getFeedbackReportByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.cdrService.getFeedbackReportInfo(user_id, 0).subscribe(pagedData => {
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
    //   finalBtn += "<span><center>";
    //   if(data[i]['call_type'] == 'inbound'){

    //     if(data[i]['clr_mos']>=4 && data[i]['clr_mos']<=5){
    //       finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: green' title='Inbound/ "+data[i]['clr_mos']+"'></i>";
    //     }else if(data[i]['clr_mos']>=3.4 && data[i]['clr_mos']<4){
    //     finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: orange' display: inline' title='Inbound/ "+data[i]['clr_mos']+"'></i>";
    //   }else{
    //     finalBtn += "<i class='fa fa-arrow-down' style='color: red' display: inline' title='Inbound/ "+data[i]['clr_mos']+"'></i>";
    //   }
    // }
    //   if(data[i]['call_type'] == 'outbound'){
    //     if(data[i]['clr_mos']>=4 && data[i]['clr_mos']<=5){
    //       finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: green' title='Inbound/ "+data[i]['clr_mos']+"'></i>";
    //     }else if(data[i]['clr_mos']>=3.4 && data[i]['clr_mos']<4){
    //     finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: orange' display: inline' title='Inbound/ "+data[i]['clr_mos']+"'></i>";
    //   }else{
    //     finalBtn += "<i class='fa fa-arrow-up' style='color: red' display: inline' title='Inbound/ "+data[i]['clr_mos']+"'></i>";
    //   }
    //   }

    //   if(data[i]['call_type'] == 'intercom'){
    //     if(data[i]['clr_mos']>=4 && data[i]['clr_mos']<=5){
    //       finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: green' title='Intercom/ "+data[i]['clr_mos']+"'></i>";
    //     }else if(data[i]['clr_mos']>=3.4 && data[i]['clr_mos']<4){
    //     finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: orange' display: inline' title='Intercom/ "+data[i]['clr_mos']+"'></i>";
    //   }else{
    //     finalBtn += "<i class='fa fa-arrows-h' style='color: red' display: inline' title='Intercom/ "+data[i]['clr_mos']+"'></i>";
    //   }
    //   }


      let clr_mos = parseFloat(data[i]['clr_mos']);
      let cle_mos = parseFloat(data[i]['cle_mos']);
      var result = 0
      if(clr_mos && cle_mos > 0){
        result = (clr_mos + cle_mos)/2;
        
      }else if(clr_mos == 0 && cle_mos > 0){
        result = cle_mos
      }else if(cle_mos == 0 && clr_mos > 0 ){
        result = clr_mos
      }else {
        result = 0;
      }
      finalBtn += "<span><center>";
      // actionBtn += "<span><center>";
      if(data[i]['call_type'] == 'inbound'){

        if(result>=4 && result<=5){
          finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: green' title='Inbound / "+result+"'></i>";
        }else if(result>=3.4 && result<4){
        finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: orange' display: inline' title='Inbound / "+result+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-down' style='color: red' display: inline' title='Inbound / "+result+"'></i>";
      }
    }
      if(data[i]['call_type'] == 'outbound'){
        if(result>=4 && result<=5){
          finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: green' title='Outbound / "+result+"'></i>";
        }else if(result>=3.4 && result<4){
        finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: orange' display: inline' title='Outbound / "+result+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-up' style='color: red' display: inline' title='Outbound / "+result+"'></i>";
      }
      }

      if(data[i]['call_type'] == 'intercom'){
        if(result>=4 && result<=5){
          finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: green' title='Intercom / "+result+"'></i>";
        }else if(result>=3.4 && result<4){
        finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: orange' display: inline' title='Intercom / "+result+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrows-h' style='color: red' display: inline' title='Intercom / "+result+"'></i>";
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
      FileSaver.saveAs(blob, 'customer-feedback_report');
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
        fontSize: 5.8
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
        10: { cellWidth: 'wrap' },
        11: { cellWidth: 'wrap' },
        12: { cellWidth: 'wrap' },
        13: { cellWidth: 'wrap' }       
      },
    });
    doc.save('customer-feedback-report.pdf');
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoCustomerCdrDialog, {
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
