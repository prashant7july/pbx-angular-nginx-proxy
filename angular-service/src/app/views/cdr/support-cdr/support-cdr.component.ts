import { Component, OnInit,Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CdrService } from '../cdr.service';
import { CommonService, ExcelService } from '../../../core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CallplanService } from '../../call-plan/callplan.service';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';
import { ToastrService } from 'ngx-toastr';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

declare const ExcelJS: any;


@Component({
  selector: 'app-support-cdr',
  templateUrl: './support-cdr.component.html',
  styleUrls: ['./support-cdr.component.css'],
  providers: [CheckBoxSelectionService]
})
export class SupportCdrComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData = "";
  exportData: any = {};
  selectedValue = "";
  providerList:any="";
  defaultPageSize = '10';
  allCountryList:any="";
  terminatecause = [];
  companyList: any[] = [];
  public mode ;
  public selectAllText: string
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  
  public fields2: Object = { text: 'name', value: 'phonecode' };
  public placeholder2: string = 'Select Country';

  public fields3: Object = { text: 'name', value: 'id' };
  public placeholder3: string = 'Select Terminate Cause';

  public fields4: Object = { text: 'provider', value: 'id' };
  public placeholder4: string = 'Select Gateway';

  constructor(
    private router: Router,
    private cdrService: CdrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private callplanService:CallplanService
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_company': new FormControl([]),
      'by_uuid' : [""],
      'by_callplan': [""],
      'by_sellcost': [""],
      'by_trunck': new FormControl([]),
      'by_src': [""],
      'by_dest': [""],
      'by_destination': new FormControl([]),
      'by_callerid': [""],
      'by_terminatecause': new FormControl([]),
      'by_call_type': [""],
      'by_callcost' : [""]
    });
  }

  ngOnInit() {
    this.cdrService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    this.mode = 'CheckBox';
    this.selectAllText= 'Select All';
    this.commonService.getCompany().subscribe(datas => {
      // this.companyData = data.response;
      let data = datas.response;
      for (let i = 0; i < data.length; i++) {
        this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
      }
    }, err => {
      this.error = err.message;
    });

    this.callplanService.getCallPlan().subscribe(data => {
      this.selectedValue = data.response;
    });

    this.commonService.getProviders().subscribe(data => {
      this.providerList = data.response;
    }, err => {
      this.error = err.message;
    });

    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.allCountryList = data.response;
    }, err => {
      this.error = err.message;
    });

      //get country list
      this.cdrService.getTerminateCause().subscribe(data => {
        // this.terminatecause = data;
        for (let i = 0; i < data.length; i++) {
          this.terminatecause.push({ id: data[i].digit, name: data[i].digit + '-' + data[i].description });
        }
      }, err => {
        this.error = err.message;
      });
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterDatas = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterDatas);
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterDatas = this.providerList.filter((data) =>{    
      return data['provider'].toLowerCase().includes(textValue);
    })
    event.updateData(filterDatas);
  }
  Countryremoved(event){
    const textValue = event.text.trim().toLowerCase();
   const filterDatas = this.allCountryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterDatas);
  }
  Countryspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterDatas = this.terminatecause.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterDatas);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true  },
      { field: 'quality', headerName: 'Call Type & Quality',width : 150, hide: false  },
      { field: 'company', headerName: 'Company',width : 150, hide: false  },
      { field: 'uuid', headerName: 'UUID',width : 150,  hide: false  },
      { field: 'startTime', headerName: 'Start Time',width : 170,  hide: false  },
      { field: 'endTime', headerName: 'End Time',width : 170,  hide: false  },
      { field: 'sellCost', headerName: 'Buy Cost',width : 100,  hide: true  },
      { field: 'callCost', headerName: 'Call Cost', hide: false, width: 100 },  
      { field: 'used_minutes', headerName: 'Bundle Minutes' , hide: false, width: 150}, 
      { field: 'gatewayName', headerName: 'Gateway',width : 150,  hide: false  },
      { field: 'callPlanName', headerName: 'Call Plan',width : 150,  hide: false  },
      { field: 'src', headerName: 'Caller',width : 150,  hide: false  },
      { field: 'dispDst', headerName: 'Callee',width : 150,  hide: false  },
      { field: 'forward', headerName: 'Forward',width : 150,  hide: false  },
      { field: 'dispCallerId', headerName: 'Caller ID',width : 150,  hide: false  },
      // { field: 'codec', headerName: 'Codec',width : 170,  hide: false  },
      { field: 'sessionTime', headerName: 'Session Time',width : 170,  hide: false  },
      { field: 'bridgeTime', headerName: 'Bridge Time',width : 170,  hide: false  },
      // { field: 'dnid', headerName: 'DNID', hide: false  },
      { field: 'dispDestination', headerName: 'Country',width : 150,  hide: false  },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: false  },
      { field: 'sip_endpoint_disposition', headerName: 'Sip Endpoint Disposition', hide: true  },
      { field: 'sip_current_application', headerName: 'Sip Current Application', hide: true  },
      { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: false  },


      { field: 'clr_mos', headerName: 'Caller MOS',width : 200, hide: false },
      { field: 'clr_jitter_min_variance', headerName: 'Caller Jitter Min Variance',width : 200, hide: false },
      { field: 'clr_jitter_max_variance', headerName: 'Caller Jitter Max Variance' ,width : 200, hide: false},
      { field: 'clr_jitter_loss_rate', headerName: 'Caller Jitter Loss Rate' ,width : 200, hide: false},
      { field: 'clr_jitter_burst_rate', headerName: 'Caller Jitter Burst Rate',width : 200, hide: false },
      { field: 'clr_mean_interval', headerName: 'Caller Mean Interval' ,width : 200, hide: false},
      { field: 'clr_quality_percentage', headerName: 'Caller Quality Percentage',width : 200, hide: true },
      { field: 'clr_read_codec', headerName: 'Caller Read Codec',width : 200,hide: false },
      { field: 'clr_write_codec', headerName: 'Caller Write Codec' ,width : 200, hide: false},
      { field: 'clr_local_media_ip', headerName: 'Caller Media IP',width : 200,hide: false },
      { field: 'clr_remote_media_ip', headerName: 'Caller Signalling IP',width : 200,hide: false },
      { field: 'clr_remote_media_port', headerName: 'Caller Remote Media Port' ,width : 200, hide: true },
      { field: 'clr_user_agent', headerName: 'Caller User Agent' ,width : 200,hide: false},

      { field: 'cle_mos', headerName: 'Callee MOS' ,width : 200,hide: false},
      { field: 'cle_jitter_min_variance', headerName: 'Callee Jitter Min Variance' ,width : 200, hide: false },
      { field: 'cle_jitter_max_variance', headerName: 'Callee Jitter Max Variance',width : 200,hide: false},
      { field: 'cle_jitter_loss_rate', headerName: 'Callee Jitter Loss Rate' ,width : 200, hide: false},
      { field: 'cle_jitter_burst_rate', headerName: 'Callee Jitter Burst Rate' ,width : 200,hide: false},
      { field: 'cle_mean_interval', headerName: 'Callee Mean Interval' ,width : 200,hide: false},
      { field: 'cle_quality_percentage', headerName: 'Callee Quality Percentage' ,width : 200, hide: true},
      { field: 'cle_read_codec', headerName: 'Callee Read Codec',hide: false,width : 200, resizable: false },
      { field: 'cle_write_codec', headerName: 'Callee Write Codec' ,width : 200, hide: false},
      { field: 'cle_local_media_ip', headerName: 'Callee Media IP',width : 200, hide: false },
      { field: 'cle_remote_media_ip', headerName: 'Callee Signalling IP' ,width : 200, hide: false},
      { field: 'cle_remote_media_port', headerName: 'Callee Remote Media Port' ,width : 200, hide: true},
      { field: 'cle_user_agent', headerName: 'Callee User Agent',width : 200,hide: false },
    ];
    var user_id = localStorage.getItem("id");
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.cdrService.getSupportCdrByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;        
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.cdrService.getSupportCdrInfo(user_id, 0).subscribe(pagedData => {
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

        if(data[i]['clr_mos']>=4 && data[i]['clr_mos']<=5){
          finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: green' title='Inbound / "+data[i]['clr_mos']+"'></i>";
        }else if(data[i]['clr_mos']>=3.4 && data[i]['clr_mos']<4){
        finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: orange' display: inline' title='Inbound / "+data[i]['clr_mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-down' style='color: red' display: inline' title='Inbound / "+data[i]['clr_mos']+"'></i>";
      }
    }
      if(data[i]['call_type'] == 'outbound'){
        if(data[i]['clr_mos']>=4 && data[i]['clr_mos']<=5){
          finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: green' title='Outbound / "+data[i]['clr_mos']+"'></i>";
        }else if(data[i]['clr_mos']>=3.4 && data[i]['clr_mos']<4){
        finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: orange' display: inline' title='Outbound / "+data[i]['clr_mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-up' style='color: red' display: inline' title='Outbound / "+data[i]['clr_mos']+"'></i>";
      }
      }
      
      finalBtn += "</center></span>";

      if(data[i]['hangup_disposition']=='send_bye'){
        data[i]['hangup_disposition'] = 'Caller Hangup';
      }else if(data[i]['hangup_disposition']=='recv_bye'){
        data[i]['hangup_disposition'] = 'Callee Hangup';
      }else if(data[i]['hangup_disposition']=='send_refuse'){
        data[i]['hangup_disposition'] = 'System';
      }else if(data[i]['hangup_disposition']=='s_end__cancel'){
        data[i]['hangup_disposition'] = 'Caller Cancel';
      }else if(data[i]['hangup_disposition']=='recv_cancel'){
        data[i]['hangup_disposition'] = 'Callee Cancel/Busy';
      }else if(data[i]['hangup_disposition']=='recv_cancel'){
        data[i]['hangup_disposition'] = 'Callee Cancel/Busy';
      }else{
        data[i]['hangup_disposition'] = '';
      }
      
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

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoSupportCdrDialog, {
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

  downloadPDF(): void {
    var doc = new jsPDF('p', 'mm', 'a3');
    var col = ["Company", "UUID","Start Time","End Time","Buy Cost","Gateway","Call Plan","Caller","Callee","Forward","Caller ID","Terminate Cause","Bridge Time","Country"]
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.company, element.uuid,element.startTime,element.endTime,element.sellCost,element.gatewayName,element.callPlanName,element.src,element.dispDst,
        element.forward,element.dispCallerId,element.termDescription,element.bridgeTime,element.dispDestination]
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
        7: { cellWidth: 'wrap' },
        8: { cellWidth: 'wrap' },
        9: { cellWidth: 'wrap' },
        10: { cellWidth: 'wrap' },
        11: { cellWidth: 'wrap' },
        12: { cellWidth: 'wrap' },
        13: { cellWidth: 'wrap' },
        14: { cellWidth: 'wrap' },
  
      },
    });
    doc.save('cdr.pdf');
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
      { header: 'Company', key: 'company', width: 25 },
      { header: 'UUID', key: 'uuid', width: 25 },
      { header: 'Start Time', key: 'startTime', width: 10 },
      { header: 'End Time', key: 'endTime', width: 15 },
      { header: 'Gateway', key: 'gatewayName', width: 20 },
      { header: 'Call Plan', key: 'callPlanName', width: 15 },
      { header: 'Caller', key: 'src', width: 15 },    
      { header: 'Callee', key: 'dispDst', width: 20 },
      { header: 'Forward', key: 'forward', width: 10 },  
      { header: 'Caller ID', key: 'dispCallerId', width: 20 },
      { header: 'Country', key: 'dispDestination', width: 15 },      
      { header: 'Buy Cost', key: 'sellCost', width: 25 },
      { header: 'Session Time', key: 'sessionTime', width: 25 },
      {header: 'Terminate Cause', key: 'termDescription', width:25},
      {header: 'Bridge Time', key: 'bridgeTime', width:25},
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
        company: this.exportData[i].company,
        uuid: this.exportData[i].uuid,
        startTime: this.exportData[i].startTime,
        endTime: this.exportData[i].endTime,        
        gatewayName: this.exportData[i].gatewayName,
        callPlanName: this.exportData[i].callPlanName,
        src: this.exportData[i].src,
        dispDst: this.exportData[i].dispDst,
        forward: this.exportData[i].forward,
        dispCallerId: this.exportData[i].dispCallerId,
        dispDestination: this.exportData[i].dispDestination,
        sellCost: this.exportData[i].sellCost,
        sessionTime: this.exportData[i].sessionTime,
        termDescription: this.exportData[i].termDescription,
        bridgeTime: this.exportData[i].bridgeTime,
     

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
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'cdr');
    });
  }

  advanceExportToExcel(){
    const dialogRefInfo = this.dialog.open(SupportAdvanceExcelDialog, {
      width: '60%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,exportData : this.exportData
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
  selector: 'advance-excel-dialog',
  templateUrl: 'advance-excel-dialog.html',
  styleUrls: ['./support-cdr.component.css'],
  providers: [CheckBoxSelectionService]
})

export class SupportAdvanceExcelDialog {
  columnList: any[] = [];
  selectedColumn : any;
  selectedDate : any ;
  ColumnData: any;
  public mode ;
  public selectAllText: string
  public fields: Object = { text: 'name', value: 'name' };
  public placeholder: string = 'Select Column *';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  exportData: any = {};
  caller :object = {};

  constructor(
    public dialogRefInfo: MatDialogRef<SupportAdvanceExcelDialog>,
     @Inject(MAT_DIALOG_DATA) public data: '',
     private cdrService: CdrService,
     private toastr: ToastrService,

  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    this.mode = 'CheckBox';
    this.selectAllText= 'Select All';
    element.scrollIntoView();
    this.insertValueInColumnList();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }

  insertValueInColumnList(){
    this.columnList.push({ id: 1, name: 'Company'});
    this.columnList.push({ id: 2, name: 'Buy Cost'});
    this.columnList.push({ id: 4, name: 'Gateway'});
    this.columnList.push({ id: 5, name: 'Call Plan'});
    this.columnList.push({ id: 6, name: 'Start Time'});
    this.columnList.push({ id: 7, name: 'End Time'});
    this.columnList.push({ id: 8, name: 'Caller'});
    this.columnList.push({ id: 9, name: 'Callee'});
    this.columnList.push({ id: 10, name: 'Session Time'});
    this.columnList.push({ id: 11, name: 'Bridge Time'});
    this.columnList.push({ id: 12, name: 'Caller Id'});
    this.columnList.push({ id: 13, name: 'Terminate Cause'});
    this.columnList.push({ id: 14, name: 'Country'});
    this.columnList.push({ id: 15, name: 'Caller MOS'});
    this.columnList.push({ id: 16, name: 'Caller Jitter Min Variance'});
    this.columnList.push({ id: 17, name: 'Caller Jitter Max Variance'});
    this.columnList.push({ id: 18, name: 'Caller Jitter Loss Rate'});
    this.columnList.push({ id: 19, name: 'Caller Jitter Burst Rate'});
    this.columnList.push({ id: 20, name: 'Caller Mean Interval'});
    this.columnList.push({ id: 21, name: 'Caller Read Codec'});
    this.columnList.push({ id: 22, name: 'Caller Media IP'});
    this.columnList.push({ id: 23, name: 'Caller Signalling IP'});
    // this.columnList.push({ id: 24, name: 'Caller Remote Media Port'});
    this.columnList.push({ id: 25, name: 'Caller User Agent'});
    this.columnList.push({ id: 26, name: 'Callee MOS'});
    this.columnList.push({ id: 27, name: 'Callee Jitter Min Variance'});
    this.columnList.push({ id: 28, name: 'Callee Jitter Max Variance'});
    this.columnList.push({ id: 29, name: 'Callee Jitter Loss Rate'});
    this.columnList.push({ id: 30, name: 'Callee Jitter Burst Rate'});
    this.columnList.push({ id: 31, name: 'Callee Mean Interval'});
    // this.columnList.push({ id: 32, name: 'Callee Quality Percentage'});
    this.columnList.push({ id: 33, name: 'Callee Read Codec'});
    this.columnList.push({ id: 34, name: 'Callee Write Codec'});
    this.columnList.push({ id: 35, name: 'Callee Media IP'});
    this.columnList.push({ id: 36, name: 'Callee Signalling IP'});
    // this.columnList.push({ id: 37, name: 'Callee Remote Media Port'});
    this.columnList.push({ id: 38, name: 'Callee User Agent'});

  }
  submitDialog():void {
    if (this.selectedColumn == undefined || this.selectedDate == undefined) {
      this.toastr.error('Date and Column field is mandatory.', 'Error!')
    } else {
      let credentials = {};
      credentials['by_date'] = this.selectedDate;
      credentials['by_columns'] = this.selectedColumn;
      this.cdrService.getSupportCdrByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        this.downloadCSV();
        this.dialogRefInfo.close();
      });
    }
  } 


  downloadCSV(){
     let selectedColumn : any = [];
    selectedColumn = this.selectedColumn;
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
          if(item['name'] == 'Start Time'){
            tableColumn.push("Start Date");
            tableColumn.push(item2);
            return;
          }else if(item['name'] == 'End Time'){
            tableColumn.push("End Date");
            tableColumn.push(item2);
            return;
          }else{
            tableColumn.push(item2);
            return;
          }
        }
      });
    });
    let mapTableColumn = tableColumn.map(item=>{
        let obj = {};
        obj['header']=item;
        obj['key']=item.replace(/\s+/g, '');
        obj['width']=15;   
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
        Company: this.exportData[i].company,
        BuyCost: this.exportData[i].buyCost,
        SellCost: this.exportData[i].sellCost,
        CallCost: this.exportData[i].callCost,
        Gateway: this.exportData[i].gatewayName,
        CallPlan: this.exportData[i].callPlanName,
        StartDate: ((this.exportData[i].startTime).split(' '))[0],
        StartTime: ((this.exportData[i].startTime).split(' '))[1],
        EndDate: ((this.exportData[i].endTime).split(' '))[0],
        EndTime:  ((this.exportData[i].endTime).split(' '))[1],
        Caller: this.exportData[i].src,
        Callee: this.exportData[i].dispDst,
        SessionTime: this.exportData[i].sessionTime,
        BridgeTime: this.exportData[i].bridgeTime,
        CallerId: this.exportData[i].dispCallerId,
        // DNID: this.exportData[i].dnid,
        TerminateCause: this.exportData[i].termDescription,
        Country: this.exportData[i].dispDestination,
        CallerMos: this.exportData[i].clr_mos,
        CallerJitterMinVariance: this.exportData[i].clr_jitter_min_variance,
        CallerJitterMaxVariance: this.exportData[i].clr_jitter_max_variance,
        CallerJitterLossRate: this.exportData[i].clr_jitter_loss_rate,
        CallerJitterBurstRate: this.exportData[i].clr_jitter_burst_rate,
        CallerMeanInterval: this.exportData[i].clr_mean_interval,
        CallerQualityPercentage: this.exportData[i].clr_quality_percentage,
        CallerReadCodec: this.exportData[i].clr_read_codec,
        CallerWriteCodec: this.exportData[i].clr_write_codec,
        CallerLocalMediaIp: this.exportData[i].clr_local_media_ip,
        CallerRemoteMediaIp: this.exportData[i].clr_remote_media_ip,
        CallerRemoteMediaPort: this.exportData[i].clr_remote_media_port,
        CallerUserAgent: this.exportData[i].clr_user_agent,
        CalleeMos: this.exportData[i].cle_mos,
        CalleeJitterMinVariance: this.exportData[i].cle_jitter_min_variance,
        CalleeJitterMaxVariance: this.exportData[i].cle_jitter_max_variance,
        CalleeJitterLossRate: this.exportData[i].cle_jitter_loss_rate,
        CalleeJitterBurstRate: this.exportData[i].cle_jitter_burst_rate,
        CalleeMeanInterval: this.exportData[i].cle_mean_interval,
        CalleeQualityPercentage: this.exportData[i].cle_quality_percentage,
        CalleeReadCodec: this.exportData[i].cle_read_codec,
        CalleeWriteCodec: this.exportData[i].cle_write_codec,
        CalleeLocalMediaIp: this.exportData[i].cle_local_media_ip,
        CalleeRemoteMediaIp: this.exportData[i].cle_remote_media_ip,
        CalleeRemoteMediaPort: this.exportData[i].cle_remote_media_port,
        CalleeUserAgent: this.exportData[i].cle_user_agent,

      });
      // if(selectedColumn.includes('Caller Media')){
      //   worksheet.addRow({
      //     clr_mos: this.exportData[i].clr_mos
      //   })
      // }
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
      FileSaver.saveAs(blob, 'cdr');
    });
  }
}

@Component({
  selector: 'infoSupportCdr-dialog',
  templateUrl: 'infoSupportCdr-dialog.html',
})

export class InfoSupportCdrDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoSupportCdrDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }
  
  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}