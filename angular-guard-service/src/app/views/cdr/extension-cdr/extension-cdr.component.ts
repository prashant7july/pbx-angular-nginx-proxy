import { Component, OnInit ,Inject} from '@angular/core';
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

declare const ExcelJS: any;
@Component({
  selector: 'app-extension-cdr',
  templateUrl: './extension-cdr.component.html',
  styleUrls: ['./extension-cdr.component.css']
})
export class ExtensionCdrComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData = "";
  exportData: any = {};
  defaultPageSize='10';
  allCountryList="";
  terminatecause :any[] = [];
  teleconsultation : boolean = false;
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
    private cdrService: CdrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_sellcost': [""],
      'by_src': [""],
      'by_dest': [""],
      'by_destination': new FormControl([]),
      'by_callerid': [""],
      'by_terminatecause':new FormControl([]),
      'by_call_type':[""]
    });
   }

  ngOnInit() {
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.allCountryList = data.response;
    }, err => {
      this.error = err.message;
    });
    this.cdrService.getTerminateCause().subscribe(data => {
      // this.terminatecause = data;
      // let data = datas.response;
      for (let i = 0; i < data.length; i++) {
        this.terminatecause.push({ id: data[i].digit, name: data[i].digit + '-' + data[i].description });
      }
    }, err => {
      this.error = err.message;
    });

    let ext_id = localStorage.getItem('id');
    this.commonService.checkFeatureByPackage(ext_id).subscribe( data=>{
      if(data.teleconsultation == 1){
        this.teleconsultation =  true;
      }
      this.displayAllRecord();
    }, err => {
      this.error = err.message;
    });

    
  }

  displayAllRecord() {
    
    if(this.teleconsultation == false){
      this.columnDefs = [ 
        { field: 'id', headerName: 'ID', hide: true,  },
      { field: 'quality', headerName: 'Call Type & Quality',width : 170, hide: false,  },
      { field: 'startTime', headerName: 'Start Time', hide: false,width : 170  },
      { field: 'endTime', headerName: 'End Time', hide: false,width : 170  },
      // { field: 'src', headerName: 'Caller', hide: false, width : 150 }
      { field: 'dispDst', headerName: 'Callee', hide: false,width : 150  },
      { field: 'forward', headerName: 'Forward', hide: false, width : 150 },
      // { field: 'dispCallerId', headerName: 'Caller ID', hide: false, width : 150 },
      { field: 'sessionTime', headerName: 'Session Time', hide: false, width : 170 },
      { field: 'bridgeTime', headerName: 'Bridge Time', hide: false,  width : 170},
      // { field: 'dnid', headerName: 'DNID', hide: false,  },
      { field: 'sellCost', headerName: 'Buy Cost', hide: true, width : 100 },
      { field: 'used_minutes', headerName: 'Bundle Minutes', hide: false, width : 100 },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: false,width : 150  },
      { field: 'dispDestination', headerName: 'Country', hide: false,  },
      { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: false,  },
      { field: 'uuid', headerName: 'UUID', hide: false, width : 150 },
      { field: 'clr_mos', headerName: 'Caller MOS',width : 200, hide: false },
      { field: 'clr_jitter_min_variance', headerName: 'Caller Jitter Min Variance',width : 200, hide: false },
      { field: 'clr_jitter_max_variance', headerName: 'Caller Jitter Max Variance' ,width : 200, hide: false},
      { field: 'clr_jitter_loss_rate', headerName: 'Caller Jitter Loss Rate' ,width : 200, hide: false},
      { field: 'clr_jitter_burst_rate', headerName: 'Caller Jitter Burst Rate',width : 200, hide: false },
      { field: 'clr_mean_interval', headerName: 'Caller Mean Interval' ,width : 200, hide: false},
      { field: 'clr_quality_percentage', headerName: 'Caller Quality Percentage',width : 200, hide: false },
      { field: 'clr_read_codec', headerName: 'Caller Read Codec',width : 200,hide: false },
      { field: 'clr_write_codec', headerName: 'Caller Write Codec' ,width : 200, hide: false},
      { field: 'clr_local_media_ip', headerName: 'Caller Local Media IP',width : 200,hide: false },
      { field: 'clr_remote_media_ip', headerName: 'Caller Remote Media IP',width : 200,hide: false },
      { field: 'clr_remote_media_port', headerName: 'Caller Remote Media Port' ,width : 200, hide: false },
      { field: 'clr_user_agent', headerName: 'Caller User Agent' ,width : 200,hide: false},
      { field: 'cle_mos', headerName: 'Callee MOS' ,width : 200,hide: false},
      { field: 'cle_jitter_min_variance', headerName: 'Callee Jitter Min Variance' ,width : 200, hide: false },
      { field: 'cle_jitter_max_variance', headerName: 'Callee Jitter Max Variance',width : 200,hide: false},
      { field: 'cle_jitter_loss_rate', headerName: 'Callee Jitter Loss Rate' ,width : 200, hide: false},
      { field: 'cle_jitter_burst_rate', headerName: 'Callee Jitter Burst Rate' ,width : 200,hide: false},
      { field: 'cle_mean_interval', headerName: 'Callee Mean Interval' ,width : 200,hide: false},
      { field: 'cle_quality_percentage', headerName: 'Callee Quality Percentage' ,width : 200,hide: false},
      { field: 'cle_read_codec', headerName: 'Callee Read Codec',hide: false,width : 200, resizable: false },
      { field: 'cle_write_codec', headerName: 'Callee Write Codec' ,width : 200,hide: false},
      { field: 'cle_local_media_ip', headerName: 'Callee Local Media IP',width : 200,hide: false },
      { field: 'cle_remote_media_ip', headerName: 'Callee Remote Media IP' ,width : 200,hide: false},
      { field: 'cle_remote_media_port', headerName: 'Callee Remote Media Port' ,width : 200, hide: false},
      { field: 'cle_user_agent', headerName: 'Callee User Agent',width : 200,hide: false },
    ];
    }else{
      this.columnDefs = [
        { field: 'id', headerName: 'ID', hide: true,  },
        { field: 'quality', headerName: 'Call Type & Quality',width : 170, hide: false,  },
        { field: 'startTime', headerName: 'Start Time', hide: false,width : 170  },
        { field: 'endTime', headerName: 'End Time', hide: false,width : 170  },
        { field: 'src', headerName: 'Caller', hide: false, width : 150 },
        { field: 'dispDst', headerName: 'Callee', hide: false,width : 150  },
        { field: 'forward', headerName: 'Forward', hide: false, width : 150 },
        { field: 'dispCallerId', headerName: 'Caller ID', hide: false, width : 150 },
        { field: 'sessionTime', headerName: 'Session Time', hide: false, width : 170 },
        { field: 'bridgeTime', headerName: 'Bridge Time', hide: false,  width : 170},
        // { field: 'dnid', headerName: 'DNID', hide: false,  },
        { field: 'sellCost', headerName: 'Buy Cost', hide: false, width : 100 },
        { field: 'termDescription', headerName: 'Terminate Cause', hide: false,width : 150  },
        { field: 'dispDestination', headerName: 'Country', hide: false,  },
        { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: false,  },
        { field: 'uuid', headerName: 'UUID', hide: false, width : 150 },
        { field: 'clr_mos', headerName: 'Caller MOS',width : 200, hide: false },
        { field: 'clr_jitter_min_variance', headerName: 'Caller Jitter Min Variance',width : 200, hide: false },
        { field: 'clr_jitter_max_variance', headerName: 'Caller Jitter Max Variance' ,width : 200, hide: false},
        { field: 'clr_jitter_loss_rate', headerName: 'Caller Jitter Loss Rate' ,width : 200, hide: false},
        { field: 'clr_jitter_burst_rate', headerName: 'Caller Jitter Burst Rate',width : 200, hide: false },
        { field: 'clr_mean_interval', headerName: 'Caller Mean Interval' ,width : 200, hide: false},
        { field: 'clr_quality_percentage', headerName: 'Caller Quality Percentage',width : 200, hide: false },
        { field: 'clr_read_codec', headerName: 'Caller Read Codec',width : 200,hide: false },
        { field: 'clr_write_codec', headerName: 'Caller Write Codec' ,width : 200, hide: false},
        { field: 'clr_local_media_ip', headerName: 'Caller Local Media IP',width : 200,hide: false },
        { field: 'clr_remote_media_ip', headerName: 'Caller Remote Media IP',width : 200,hide: false },
        { field: 'clr_remote_media_port', headerName: 'Caller Remote Media Port' ,width : 200, hide: false },
        { field: 'clr_user_agent', headerName: 'Caller User Agent' ,width : 200,hide: false},
        { field: 'cle_mos', headerName: 'Callee MOS' ,width : 200,hide: false},
        { field: 'cle_jitter_min_variance', headerName: 'Callee Jitter Min Variance' ,width : 200, hide: false },
        { field: 'cle_jitter_max_variance', headerName: 'Callee Jitter Max Variance',width : 200,hide: false},
        { field: 'cle_jitter_loss_rate', headerName: 'Callee Jitter Loss Rate' ,width : 200, hide: false},
        { field: 'cle_jitter_burst_rate', headerName: 'Callee Jitter Burst Rate' ,width : 200,hide: false},
        { field: 'cle_mean_interval', headerName: 'Callee Mean Interval' ,width : 200,hide: false},
        { field: 'cle_quality_percentage', headerName: 'Callee Quality Percentage' ,width : 200,hide: false},
        { field: 'cle_read_codec', headerName: 'Callee Read Codec',hide: false,width : 200, resizable: false },
        { field: 'cle_write_codec', headerName: 'Callee Write Codec' ,width : 200,hide: false},
        { field: 'cle_local_media_ip', headerName: 'Callee Local Media IP',width : 200,hide: false },
        { field: 'cle_remote_media_ip', headerName: 'Callee Remote Media IP' ,width : 200,hide: false},
        { field: 'cle_remote_media_port', headerName: 'Callee Remote Media Port' ,width : 200, hide: false},
        { field: 'cle_user_agent', headerName: 'Callee User Agent',width : 200,hide: false },
  
      ];
    }
    var id = localStorage.getItem("id");
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.by_callerid = Number(credentials.by_callerid);
      credentials.by_dest = Number(credentials.by_dest);
      credentials.by_sellcost = Number(credentials.by_sellcost);
      credentials.by_src = Number(credentials.by_src);
      credentials.id = id;
      this.cdrService.getExtensionCdrByFilters(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.cdrService.getExtensionCdrInfo(id).subscribe(pagedData => {
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

      if(data[i]['call_type'] == 'intercom'){
        if(data[i]['clr_mos']>=4 && data[i]['clr_mos']<=5){
          finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: green' title='Intercom / "+data[i]['clr_mos']+"'></i>";
        }else if(data[i]['clr_mos']>=3.4 && data[i]['clr_mos']<4){
        finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: orange' display: inline' title='Intercom / "+data[i]['clr_mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrows-h' style='color: red' display: inline' title='Intercom / "+data[i]['clr_mos']+"'></i>";
      }
      }

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
      
      finalBtn += "</center></span>";

      data[i]['quality'] = finalBtn;
    }
    return data;
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

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  exportToExcel(){
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
      { header: 'Start Time', key: 'StartTime', width: 20 },
      { header: 'End Time', key: 'EndTime', width: 20 },
      { header: 'Caller', key: 'Source', width: 10 },
      { header: 'Callee', key: 'Dest', width: 15 },
      { header: 'Caller Id', key: 'Callerid', width: 10 },
      { header: 'Session Time', key: 'SessionTime', width: 15 },
      { header: 'Bridge Time', key: 'BridgeTime', width: 15 },    
      { header: 'DNID', key: 'DNID', width: 20 },
      { header: 'Buy Cost', key: 'SellCost', width: 10 },  
      { header: 'Terminate Cause', key: 'TerminateCause', width: 15 },
      { header: 'Country', key: 'Destination', width: 15 },      
      { header: 'Hangup Disposition', key: 'HangupDisposition', width: 20 },
      { header: 'UUID', key: 'UUID', width: 30 },
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
    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
      row.border =  {
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

  downloadPDF(){
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
        13: { cellWidth: 'auto' }    
      },
    });
    doc.save('cdr.pdf');
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoExtensionCdrDialog, {
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
  selector: 'infoExtensionCdr-dialog',
  templateUrl: 'infoExtensionCdr-dialog.html',
})

export class InfoExtensionCdrDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoExtensionCdrDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }
  
  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}