import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CdrService } from '../cdr.service';
import { CommonService, ExcelService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../user/user.service';
import { CallplanService } from '../../call-plan/callplan.service';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';


declare const ExcelJS: any;

@Component({
  selector: 'app-account-manager-cdr',
  templateUrl: './account-manager-cdr.component.html',
  styleUrls: ['./account-manager-cdr.component.css'],
  providers: [CheckBoxSelectionService]
})
export class AccountManagerCdrComponent implements OnInit {

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
  selectedValue:any="";
  providerList="";
  terminatecause = [];
  TerminateFilter:any;
  TerminateVause:any;
  companyList: any[] = [];
  public mode ;
  public selectAllText: string
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Call Plan';

  public fields3: Object = { text: 'name', value: 'phonecode' };
  public fields5: Object = { text: 'name', value: 'id' };
  public placeholder5: string = 'Select Terminate Cause';
  public placeholder3: string = 'Select Country';

  constructor(
    private router: Router,
    private cdrService: CdrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private userService:UserService,
    private callplanService: CallplanService,
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_company':  new FormControl([]),
      'by_callplan':  new FormControl([]),
      'by_sellcost': [""],
      'by_trunck': [""],
      'by_src': [""],
      'by_dest': [""],
      'by_destination':  new FormControl([]),
      'by_callerid': [""],
      'by_terminatecause': [""],
      'by_call_type' : [""]
    });
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
      this.cdrService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    this.mode = 'CheckBox';
    this.selectAllText= 'Select All';
    this.displayAllRecord();
    this.userService.getAccountManagerCustomercompany(localStorage.getItem('id')).subscribe(datas => {
      let data = datas.response;
      for (let i = 0; i < data.length; i++) {
        this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
      }
    }, err => {
      this.error = err.message;
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

    // this.cdrService.getTerminateCause().subscribe(data => {
    //   this.terminatecause = data;
    //   this.TerminateVause = this.TerminateFilter = this.terminatecause.slice();
    // }, err => {
    //   this.error = err.message;
    // });
    this.cdrService.getTerminateCause().subscribe(data => {
      let datas = data
      // this.terminatecause = data;
      for (let i = 0; i < datas.length; i++) {
        this.terminatecause.push({ id: datas[i].digit, name: datas[i].digit + '-' + datas[i].description });
      }
    }, err => {
      this.error = err.message;
    });

    // this.callplanService.getManagerCustomersCallPlan(localStorage.getItem('id')).subscribe(data => {  // get call plan
    //   this.selectedValue = data.response;
    // });
    forkJoin([
      this.callplanService.getManagerCustomersCallPlan(localStorage.getItem('id')),
      this.callplanService.getManagerCustomerscallPlanRoaming(localStorage.getItem('id')),  
      this.callplanService.getManagerCustomerscallPlanTC(localStorage.getItem('id')),
      this.callplanService.getManagerCustomerscallPlanStandard(localStorage.getItem('id'))
    ]).subscribe(([apiResponse1, apiResponse2,apiResponse3,apiResponse4]) => {
      this.selectedValue = apiResponse1.response.concat(apiResponse2.response,apiResponse3.response,apiResponse4.response);        
    }, (error) => {
      console.error(error);
    });
  }
  Countryspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.terminatecause.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedValue.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Countryremoved(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.allCountryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  CountryspaceTerminate(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.terminatecause.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
 

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width : 200  },
      { field: 'quality', headerName: 'Call Type & Quality', hide: false,width : 160  },
      { field: 'company', headerName: 'Company', hide: false,width : 150  },,
      { field: 'sellCost', headerName: 'Buy Cost', hide: false,width : 100  },
      { field: 'callCost', headerName: 'Call Cost', hide: false, width: 100 },  
      { field: 'used_minutes', headerName: 'Bundle Minutes' , hide: false, width: 150},
      { field: 'gatewayName', headerName: 'Gateway', hide: false, width : 150 },
      { field: 'callPlanName', headerName: 'Call Plan', hide: false, width : 150 },
      { field: 'startTime', headerName: 'Start Time', hide: false, width : 170 },
      { field: 'endTime', headerName: 'End Time', hide: false,width : 170  },
      { field: 'src', headerName: 'Caller', hide: false,width : 150  },
      { field: 'dispDst', headerName: 'Callee', hide: false,  },
      { field: 'forward', headerName: 'Forward', hide: false, width: 150 },
      { field: 'dispCallerId', headerName: 'Caller ID', hide: false,  },
      { field: 'sessionTime', headerName: 'Session Time', hide: false,width : 150  },
      { field: 'bridgeTime', headerName: 'Bridge Time', hide: false, width : 150 },
      // { field: 'dnid', headerName: 'DNID', hide: false,  },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: false },
      { field: 'dispDestination', headerName: 'Country',width : 150,  hide: false},
      { field: 'hangup_disposition', headerName: 'Hangup By', hide: false, width: 150 },
   

      { field: 'clr_mos', headerName: 'Caller MOS',width : 200, hide: false },
      { field: 'clr_jitter_min_variance', headerName: 'Caller Jitter Min Variance',width : 200, hide: false },
      { field: 'clr_jitter_max_variance', headerName: 'Caller Jitter Max Variance' ,width : 200, hide: false},
      { field: 'clr_jitter_loss_rate', headerName: 'Caller Jitter Loss Rate' ,width : 200, hide: false},
      { field: 'clr_jitter_burst_rate', headerName: 'Caller Jitter Burst Rate',width : 200, hide: false },
      { field: 'clr_mean_interval', headerName: 'Caller Mean Interval' ,width : 200, hide: false},
      { field: 'clr_quality_percentage', headerName: 'Caller Quality Percentage',width : 200, hide: false },
      { field: 'clr_read_codec', headerName: 'Caller Read Codec',width : 200,hide: false },
      { field: 'clr_write_codec', headerName: 'Caller Write Codec' ,width : 200, hide: false},
      { field: 'clr_local_media_ip', headerName: 'Caller Media IP',width : 200,hide: false },
      { field: 'clr_remote_media_ip', headerName: ' Caller Signalling IP',width : 200, hide: false },
      { field: 'clr_remote_media_port', headerName: 'Caller Remote Media Port' ,width : 200, hide: false },
      { field: 'clr_user_agent', headerName: 'Caller User Agent' ,width : 200, hide: false},

      { field: 'cle_mos', headerName: 'Callee MOS' ,width : 200,hide: false},
      { field: 'cle_jitter_min_variance', headerName: 'Callee Jitter Min Variance' ,width : 200, hide: false },
      { field: 'cle_jitter_max_variance', headerName: 'Callee Jitter Max Variance',width : 200,hide: false},
      { field: 'cle_jitter_loss_rate', headerName: 'Callee Jitter Loss Rate' ,width : 200, hide: false},
      { field: 'cle_jitter_burst_rate', headerName: 'Callee Jitter Burst Rate' ,width : 200,hide: false},
      { field: 'cle_mean_interval', headerName: 'Callee Mean Interval' ,width : 200,hide: false},
      { field: 'cle_quality_percentage', headerName: 'Callee Quality Percentage' ,width : 200,hide: false},
      { field: 'cle_read_codec', headerName: 'Callee Read Codec',hide: false,width : 200, resizable: false },
      { field: 'cle_write_codec', headerName: 'Callee Write Codec' ,width : 200,hide: false},
      { field: 'cle_local_media_ip', headerName: 'Callee Local Media IP', width : 200, hide: false },
      { field: 'cle_remote_media_ip', headerName: 'Callee Signalling IP' ,width : 200, hide: false},
      { field: 'cle_remote_media_port', headerName: 'Callee Remote Media Port' ,width : 200, hide: false},
      { field: 'cle_user_agent', headerName: 'Callee User Agent',width : 200, hide: false },
    ];
    var user_id = localStorage.getItem("id");
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.customer_id = user_id;
      this.cdrService.getAccountManagerCdrByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;                
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.cdrService.getAccountManagerCdrInfo(user_id, 0).subscribe(pagedData => {
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
      { header: 'Company', key: 'Company', width: 25 },,
      { header: 'Buy Cost', key: 'SellCost', width: 10 },
      { header: 'Gateway', key: 'Gateway', width: 10 },
      { header: 'Call Plan', key: 'CallPlan', width: 10 },
      { header: 'Start Time', key: 'StartTime', width: 25 },
      { header: 'End Time', key: 'EndTime', width: 25 },
      { header: 'Caller', key: 'Source', width: 10 },
      { header: 'Callee', key: 'Dest', width: 15 },
      { header: 'Caller Id', key: 'CallerID', width: 20 },
      { header: 'Session Time', key: 'SessionTime', width: 15 },
      { header: 'Bridge Time', key: 'BridgeTime', width: 15 },
      { header: 'DNID', key: 'dnid', width: 20 },
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
        Company: this.exportData[i].company,
        SellCost: this.exportData[i].sellCost,
        Gateway: this.exportData[i].gatewayName,
        CallPlan: this.exportData[i].callPlanName,
        StartTime: this.exportData[i].startTime,
        EndTime: this.exportData[i].endTime,
        Source: this.exportData[i].src,
        Dest: this.exportData[i].dispDst,
        CallerID: this.exportData[i].dispCallerId,
        SessionTime: this.exportData[i].sessionTime,
        BridgeTime: this.exportData[i].bridgeTime,
        dnid: this.exportData[i].dnid,
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
      FileSaver.saveAs(blob, 'cdr');
    });
  }
  downloadPDF() {
    var doc = new jsPDF();
    var col = ["Company", "Buy Cost", "Gateway", "Call Plan", "Start Time", "End Time", "Caller", "Callee", "Caller Id",
      "Session Time", "Bridge Time", "DNID", "Terminate Cause", "Destination"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.company,element.sellCost, element.gatewayName, element.callPlanName, element.startTime, element.endTime, element.src, element.dispDst, element.distCallerId, element.sessionTime, element.bridgeTime,
      element.dnid, element.termDescription, element.dispDestination];
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
        13: { cellWidth: 'auto' }
      },
    });
    doc.save('cdr.pdf');
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoAccountManagerCdrDialog, {
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
    });
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

  advanceExportToExcel(){
    const dialogRefInfo = this.dialog.open(AccountManagerAdvanceExcelDialog, {
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
    });
  }

}


@Component({
  selector: 'advance-excel-dialog',
  templateUrl: 'advance-excel-dialog.html',
  styleUrls: ['./account-manager-cdr.component.css'],
  providers: [CheckBoxSelectionService]
})

export class AccountManagerAdvanceExcelDialog {
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
  caller :object = {};

  constructor(
    public dialogRefInfo: MatDialogRef<AccountManagerAdvanceExcelDialog>,
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
    // this.columnList.push({ id: 3, name: 'Sell Cost'});
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
    this.columnList.push({ id: 22, name: 'Caller Local Media IP'});
    this.columnList.push({ id: 23, name: 'Caller Signalling IP'});
    this.columnList.push({ id: 24, name: 'Caller Remote Media Port'});
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
    this.columnList.push({ id: 36, name: 'Callee Remote Media IP'});
    this.columnList.push({ id: 37, name: 'Callee Remote Media Port'});
    this.columnList.push({ id: 38, name: 'Callee User Agent'});

  }
  submitDialog():void {    
    if (this.selectedColumn == undefined || this.selectedDate == undefined) {
      this.toastr.error('Date and Column field is mandatory.', 'Error!')
    } else {
      let credentials = {};
      credentials['by_date'] = this.selectedDate;
      this.cdrService.getAccountManagerCdrByFilters(credentials).subscribe(pagedData => {
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
        CallerLocalMediaIP: this.exportData[i].clr_local_media_ip,
        CallerRemoteMediaIP: this.exportData[i].clr_remote_media_ip,
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
        CalleeLocalMediaIP: this.exportData[i].cle_local_media_ip,
        CalleeRemoteMediaIP: this.exportData[i].cle_remote_media_ip,
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
  selector: 'infoAccountManagerCdr-dialog',
  templateUrl: 'infoAccountManagerCdr-dialog.html',
})

export class InfoAccountManagerCdrDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoAccountManagerCdrDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }

}