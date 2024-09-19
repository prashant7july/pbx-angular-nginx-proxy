import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CdrService } from '../../cdr/cdr.service';
import { ReportService } from '../report.service';
import { Errors, CommonService, ExcelService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CallplanService } from '../../call-plan/callplan.service';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ToastrService } from 'ngx-toastr';

declare const ExcelJS: any;

@Component({
  selector: 'minute-plan-call-details',
  templateUrl: 'minute-plan-call-details.component.html',
  styleUrls: ['minute-plan-call-details.component.css'],
  providers: [CheckBoxSelectionService]
})
export class MinutePlanCallDetailsComponent implements OnInit {
  error = '';
  errors: Errors = { errors: {} };
  selectedValue = "";
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData = "";
  exportData: any = {};
  defaultPageSize = '10';
  allCountryList="";
  providerList="";
  terminatecause="";
  circleList : any ;
  companyList: any[] = [];
  callPlanList : any  = [];
  public mode ;
  public selectAllText: string
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Call Plan';

  public fields3: Object = { text: 'provider', value: 'id' };
  public placeholder3: string = 'Select Gateway';

  public fields4: Object = { text: 'name', value: 'phonecode' };
  public placeholder4: string = 'Select Country';

  public fields5: Object = { text: 'name', value: 'id' };
  public placeholder5: string = 'Select Circle';

  constructor(
    private router: Router,
    private cdrService: CdrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private callplanService:CallplanService,
    private reportService: ReportService,
    private toastr: ToastrService,

  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_plan_type' : [""],
      'by_company':  new FormControl([]),
      'by_callplan': new FormControl([]),
      'by_forward': [""],
      'by_sellcost': [""],
      'by_trunck': new FormControl([]),
      'by_src': [""],
      'by_dest': [""],
      'by_destination': [""],
      'by_callerid': [""],
      'by_terminatecause': [""],
      'by_circle':[""],
      'by_call_type': [""]
    });
  }
  get plan_type() { return this.filterForm.get('by_plan_type'); }
  get call_plan() { return this.filterForm.get('by_call_type'); }



  public changeCallPlan(data){
    if(!this.plan_type.value){
      this.toastr.error('Error!','Please select Plan Type First',  { timeOut: 2000 });
      return;
    }
    this.getCallPlanBytype(data);
    this.call_plan.setValue('');
  }
  public getCallPlanBytype(type){
    const credentials = this.filterForm.value;
    credentials['minute_paln_type'] = type;
    // if(type == '3') {  // its just for booster plan type bcz it has no validity
    //   this.validity.setValue('');
    //   this.validity.clearValidators();
    //   this.validity.updateValueAndValidity()
    //   this.callPlanGroupForm.updateValueAndValidity();
    // }
    this.callplanService.filterCallPlan(credentials).subscribe(res => {
       this.callPlanList = res;
    }, err => {
      this.errors = err.message;
    });

  }

  ngOnInit() {
    this.displayAllRecord();
    this.getCircle(); 
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
      this.callPlanList = data.response;
    });
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.allCountryList = data.response;
    }, err => {
      this.error = err.message;
    });

    this.commonService.getProviders().subscribe(data => {
      this.providerList = data.response;
    }, err => {
      this.error = err.message;
    });

    this.cdrService.getTerminateCause().subscribe(data => {
      this.terminatecause = data;
    }, err => {
      this.error = err.message;
    });

  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'quality', headerName: 'Call Type & Quality', hide: false, width: 150 },
      { field: 'company_name', headerName: 'Company', hide: false, width: 150 },
      // { field: 'buyCost', headerName: 'Buy Cost', hide: false, width: 100 },
      // { field: 'sellCost', headerName: 'Sell Cost', hide: false, width: 100 },      
      // { field: 'callCost', headerName: 'Call Cost', hide: false, width: 100 },      
      { field: 'src', headerName: 'Caller', hide: false, width: 150 },
      { field: 'provider', headerName: 'Gateway', hide: false, width: 200 },
      { field: 'dst', headerName: 'Callee', hide: false, width: 150 },
      { field: 'forward', headerName: 'Forward', hide: false, width: 150 },
      { field: 'callerid', headerName: 'Caller ID', hide: false, width: 150 },
      { field: 'name', headerName: 'Minute Plan', hide: false, width: 150 }, //minute plan
      { field: 'used_minutes', headerName: 'Consumed Minutes',hide: false,width: 150},
      { field: 'start_time', headerName: 'Start Time', hide: false, width: 170 },
      { field: 'end_time', headerName: 'End Time', hide: false, width: 170 },
      { field: 'session_time', headerName: 'Session Time', hide: false, width: 150 },
      { field: 'bridge_time', headerName: 'Bridge Time', hide: false, width: 150 },
      // {field: 'outgoing_minutes', headerName: 'Outgoing Minutes', hide: false,width: 200},
      // { field: 'dnid', headerName: 'DNID', hide: false, width: 10 },
      { field: 'description', headerName: 'Terminate Cause', hide: false, width: 250 },
      { field: 'country_name', headerName: 'Country', hide: false, width: 200 },
      { field: 'hangup_disposition', headerName: 'Hangup By', hide: false, width: 200 },
      
      // { field: 'clr_mos', headerName: 'Caller MOS',width : 200, hide: false },
      // { field: 'clr_jitter_min_variance', headerName: 'Caller Jitter Min Variance',width : 200, hide: false },
      // { field: 'clr_jitter_max_variance', headerName: 'Caller Jitter Max Variance' ,width : 200, hide: false},
      // { field: 'clr_jitter_loss_rate', headerName: 'Caller Jitter Loss Rate' ,width : 200, hide: false},
      // { field: 'clr_jitter_burst_rate', headerName: 'Caller Jitter Burst Rate',width : 200, hide: false },
      // { field: 'clr_mean_interval', headerName: 'Caller Mean Interval' ,width : 200, hide: false},
      // { field: 'clr_quality_percentage', headerName: 'Caller Quality Percentage',width : 200, hide: false },
      // { field: 'clr_read_codec', headerName: 'Caller Read Codec',width : 200,hide: false },
      // { field: 'clr_write_codec', headerName: 'Caller Write Codec' ,width : 200, hide: false},
      // { field: 'clr_local_media_ip', headerName: 'Caller Local Media IP',width : 200,hide: false },
      // { field: 'clr_remote_media_ip', headerName: 'Caller Remote Media IP',width : 200,hide: false },
      // { field: 'clr_remote_media_port', headerName: 'Caller Remote Media Port' ,width : 200, hide: false },
      // { field: 'clr_user_agent', headerName: 'Caller User Agent' ,width : 200,hide: false},

      // { field: 'cle_mos', headerName: 'Callee MOS' ,width : 200,hide: false},
      // { field: 'cle_jitter_min_variance', headerName: 'Callee Jitter Min Variance' ,width : 200, hide: false },
      // { field: 'cle_jitter_max_variance', headerName: 'Callee Jitter Max Variance',width : 200,hide: false},
      // { field: 'cle_jitter_loss_rate', headerName: 'Callee Jitter Loss Rate' ,width : 200, hide: false},
      // { field: 'cle_jitter_burst_rate', headerName: 'Callee Jitter Burst Rate' ,width : 200,hide: false},
      // { field: 'cle_mean_interval', headerName: 'Callee Mean Interval' ,width : 200,hide: false},
      // { field: 'cle_quality_percentage', headerName: 'Callee Quality Percentage' ,width : 200,hide: false},
      // { field: 'cle_read_codec', headerName: 'Callee Read Codec',hide: false,width : 200, resizable: false },
      // { field: 'cle_write_codec', headerName: 'Callee Write Codec' ,width : 200,hide: false},
      // { field: 'cle_local_media_ip', headerName: 'Callee Local Media IP',width : 200,hide: false },
      // { field: 'cle_remote_media_ip', headerName: 'Callee Remote Media IP' ,width : 200,hide: false},
      // { field: 'cle_remote_media_port', headerName: 'Callee Remote Media Port' ,width : 200, hide: false},
      // { field: 'cle_user_agent', headerName: 'Callee User Agent',width : 200,hide: false },
    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.reportService.getMinutePlanCallDetailsByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.reportService.getMinutePlanCallDetails().subscribe(pagedData => {        
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  public

  
  manageUserActionBtn(data) {    

    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      let a1 = data[i]['clr_quality_percentage'];
      if(a1){
      a1 = a1 + '%'
      }
      data[i]['clr_quality_percentage'] = a1;

      let a2 = data[i]['cle_quality_percentage'];
      if(a2){
      a2 = a2 + '%'
      }
      data[i]['cle_quality_percentage'] = a2;
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
      // if(data[i]['hangup_disposition']=='send_bye'){
      //   data[i]['hangup_disposition'] = 'Callee Hangup';
      // }else if(data[i]['hangup_disposition']=='recv_bye'){
      //   data[i]['hangup_disposition'] = 'Caller Hangup';
      // }else if(data[i]['hangup_disposition']=='send_refuse'){
      //   data[i]['hangup_disposition'] = 'System';
      // }else if(data[i]['hangup_disposition']=='s_end__cancel'){
      //   data[i]['hangup_disposition'] = 'Caller Cancel';
      // }else if(data[i]['hangup_disposition']=='recv_cancel'){
      //   data[i]['hangup_disposition'] = 'Callee Cancel/Busy';
      // }else if(data[i]['hangup_disposition']=='recv_bye'){
      //   data[i]['hangup_disposition'] = 'Caller Cancel/Busy';
      // }else{
      //   data[i]['hangup_disposition'] = '';
      // }
      finalBtn += "</center></span>";

      data[i]['quality'] = finalBtn;      
    }
    return data;
  }



  // manageUserActionBtn(data) {
  //   for (let i = 0; i < data.length; i++) {
  //     let finalBtn = '';
  //     let incoming_m = '';
  //     let outgoing_m = '';
  //     finalBtn += "<span><center>";
  //     if(data[i]['call_type'] == 'inbound'){
  //        incoming_m = data[i]['bridgeTime'];
  //        outgoing_m = '0';
  //       if(data[i]['clr_mos']>=4 && data[i]['clr_mos']<=5){
  //         finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: green' title='Inbound / "+data[i]['clr_mos']+"'></i>"; 
  //       }else if(data[i]['clr_mos']>=3.4 && data[i]['clr_mos']<4){
  //       finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: orange' display: inline' title='Inbound / "+data[i]['clr_mos']+"'></i>";
  //     }else{
  //       finalBtn += "<i class='fa fa-arrow-down' style='color: red' display: inline' title='Inbound / "+data[i]['clr_mos']+"'></i>";
  //     }
  //   }
  //     if(data[i]['call_type'] == 'outbound'){
  //       incoming_m = '0';
  //       outgoing_m = data[i]['bridgeTime'];
  //       if(data[i]['clr_mos']>=4 && data[i]['clr_mos']<=5){
  //         finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: green' title='Outbound / "+data[i]['clr_mos']+"'></i>";
  //       }else if(data[i]['clr_mos']>=3.4 && data[i]['clr_mos']<4){
  //       finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: orange' display: inline' title='Outbound / "+data[i]['clr_mos']+"'></i>";
  //     }else{
  //       finalBtn += "<i class='fa fa-arrow-up' style='color: red' display: inline' title='Outbound / "+data[i]['clr_mos']+"'></i>";
  //     }
  //     }
  //     if(data[i]['hangup_disposition']=='send_bye'){
  //       data[i]['hangup_disposition'] = 'Caller Hangup';
  //     }else if(data[i]['hangup_disposition']=='recv_bye'){
  //       data[i]['hangup_disposition'] = 'Callee Hangup';
  //     }else if(data[i]['hangup_disposition']=='send_refuse'){
  //       data[i]['hangup_disposition'] = 'System';
  //     }else if(data[i]['hangup_disposition']=='s_end__cancel'){
  //       data[i]['hangup_disposition'] = 'Caller Cancel';
  //     }else if(data[i]['hangup_disposition']=='recv_cancel'){
  //       data[i]['hangup_disposition'] = 'Callee Cancel/Busy';
  //     }else if(data[i]['hangup_disposition']=='recv_cancel'){
  //       data[i]['hangup_disposition'] = 'Callee Cancel/Busy';
  //     }else{
  //       data[i]['hangup_disposition'] = '';
  //     }
  //     finalBtn += "</center></span>";

  //     data[i]['quality'] = finalBtn;
  //     data[i]['incoming_minutes'] = incoming_m;
  //     data[i]['outgoing_minutes'] = outgoing_m;
  //     // data[i]['hangup_disposition'] = finalBtn;
  //   }
  //   return data;
  // }

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

  public getCircle(){ //get circle data
    this.callplanService.getCircle().subscribe(data => {
      this.circleList = data.response; 
    }, err => {
     // this.errors = err.message;
    });
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
      { header: 'Call Quality', key: 'CallQuality', width: 25 },
      { header: 'Company', key: 'Company', width: 25 },
      { header: 'Buy Cost', key: 'BuyCost', width: 10 },
      { header: 'Sell Cost', key: 'SellCost', width: 10 },   
      { header: 'Call Cost', key: 'CallCost', width: 10 },   
      { header: 'Gateway', key: 'Gateway', width: 10 },
      { header: 'Minute Plan', key: 'CallPlan', width: 10 },   
      { header: 'Start Time', key: 'StartTime', width: 25 },
      { header: 'End Time', key:'EndTime', width: 25 },
      { header: 'Caller', key: 'Source', width: 10 },
      { header: 'Callee', key: 'Dest', width: 15},
      { header: 'Session Time', key: 'SessionTime', width: 15 },
      // { header: 'Bridge Time', key: 'BridgeTime', width: 15 },
      {header: 'Incoming Minutes', key: 'incoming_minutes',width: 25},
      {header: 'Outgoing Minutes', key: 'outgoing_minutes',width: 25},
      { header: 'Caller Id', key: 'CallerId', width: 20 },
      { header: 'Forward', key: 'Forward', width: 20 },
      { header: 'Terminate Cause', key: 'TerminateCause', width: 20 },
      { header: 'Country', key: 'Destination', width: 15 },
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
        CallQuality: this.exportData[i].clr_mos,
        Company: this.exportData[i].company,
        BuyCost: this.exportData[i].buyCost,
        SellCost: this.exportData[i].sellCost,
        CallCost: this.exportData[i].callCost,
        Gateway: this.exportData[i].gatewayName,
        CallPlan: this.exportData[i].callPlanName,
        StartTime: this.exportData[i].startTime,
        EndTime: this.exportData[i].endTime,
        Source: this.exportData[i].src,
        Dest: this.exportData[i].dispDst,
        SessionTime: this.exportData[i].sessionTime,
        // BridgeTime: this.exportData[i].bridgeTime,
        incoming_minutes: this.exportData[i].incoming_minutes,
        outgoing_minutes: this.exportData[i].outgoing_minutes,
        CallerId: this.exportData[i].dispCallerId,
        Forward: this.exportData[i].forward,
        TerminateCause: this.exportData[i].termDescription,
        Destination: this.exportData[i].dispDestination,
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
      FileSaver.saveAs(blob, 'Minute plan details');
    });
  }

  downloadPDF() {
    var doc = new jsPDF('p', 'mm', 'a3');
    var col = ["Call Quality","Company", "Buy Cost", "Sell Cost","Call Cost","Gateway", "Minute Plan", "Start Time", "End Time", "Caller", "Callee", "Session Time",
      "Incoming minutes","Outgoing minutes", "Caller Id", "Forward", "Terminate Cause", "Country"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.clr_mos,element.company, element.buyCost, element.sellCost,element.callCost, element.gatewayName,element.callPlanName, element.startTime,
      element.endTime, element.src, element.dispDst, element.sessionTime, element.incoming_minutes,element.outgoing_minutes, element.dispCallerId, element.forward,
      element.termDescription, element.dispDestination];
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
        15: { cellWidth: 'wrap' },
        16: { cellWidth: 'wrap' },
        17: { cellWidth: 'wrap' },
        18: { cellWidth: 'wrap' },
      },
    });
    doc.save('Minute_plan_details.pdf');
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfomMinutePlanDialog, {
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

  advanceExportToExcel(){
    const dialogRefInfo = this.dialog.open(AdvanceExcelDialog, {
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
  selector: 'infoMinutePlanDetails-dialog',
  templateUrl: 'infoMinutePlanDetails-dialog.html',
})

export class  InfomMinutePlanDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfomMinutePlanDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
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
  styleUrls: ['minute-plan-call-details.component.css'],
  providers: [CheckBoxSelectionService]
})

export class AdvanceExcelDialog {
  columnList: any[] = [];
  selectedColumn : any;
  selectedDate : any ;
  public mode ;
  public selectAllText: string
  public fields: Object = { text: 'name', value: 'name' };
  public placeholder: string = 'Select Column *';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  exportData: any = {};

  constructor(
    public dialogRefInfo: MatDialogRef<AdvanceExcelDialog>,
     @Inject(MAT_DIALOG_DATA) public data: '',
     private cdrService: CdrService,
     private toastr: ToastrService,
     private reportService: ReportService

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
    this.columnList.push({ id: 3, name: 'Sell Cost'});
    this.columnList.push({ id: 4, name: 'Gateway'});
    this.columnList.push({ id: 5, name: 'Minute Plan'});
    this.columnList.push({ id: 6, name: 'Start Time'});
    this.columnList.push({ id: 7, name: 'End Time'});
    this.columnList.push({ id: 8, name: 'Caller'});
    this.columnList.push({ id: 9, name: 'Callee'});
    this.columnList.push({ id: 10, name: 'Session Time'});
    this.columnList.push({ id: 11, name: 'Incoming minutes'});
    this.columnList.push({ id: 11, name: 'Outgoing minutes'});
    this.columnList.push({ id: 12, name: 'Caller Id'});
    this.columnList.push({ id: 13, name: 'Terminate Cause'});
    this.columnList.push({ id: 14, name: 'Country'});

  }
  submitDialog():void {
    if (this.selectedColumn == undefined || this.selectedDate == undefined) {
      this.toastr.error('Date and Column field is mandatory.', 'Error!')
    } else {
      let credentials = {};
      credentials['by_date'] = this.selectedDate;
      this.cdrService.getAdminCdrByFilters(credentials,'','').subscribe(pagedData => {
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
        incoming_minutes: this.exportData[i].incoming_minutes,
        outgoing_minutes: this.exportData[i].outgoing_minutes,
        CallerId: this.exportData[i].dispCallerId,
        // DNID: this.exportData[i].dnid,
        TerminateCause: this.exportData[i].termDescription,
        Country: this.exportData[i].dispDestination,
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
      FileSaver.saveAs(blob, 'cdr');
    });
  }
 }
