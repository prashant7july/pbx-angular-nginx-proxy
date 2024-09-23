import { Component, Inject, OnInit } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { Errors, CommonService,ExcelService ,Name_RegEx,ZEROTOFIVE_RegEx} from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { TeleConsultationService } from '../tele-consultation.service';
import { PromptsService } from '../../prompts/prompts.service';
import { ExtensionService } from '../../extension/extension.service';
import { formError, agentError } from '../../../core';
import { CallQueue } from 'src/app/core/models/callqueue.model';
import { ContactListService } from '../../contact-list/contact-list.service';
import { element } from 'protractor';
import { DidService } from '../../DID/did.service';
import { IVRService } from '../../smart_ivr/ivr.service';
import { Subscription } from 'rxjs';
import { BackendAPIIntegrationService } from 'src/app/core/services/backend-api-integration.service';


@Component({
  selector: 'app-tele-consultation-cdr',
  templateUrl: './tele-consultation-cdr.component.html',
  styleUrls: ['./tele-consultation-cdr.component.css']
})
export class TeleConsultationCdrComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
  filterForm: FormGroup;
  filterObj:any={};
  filter_list: any;
  globalRateList : any = "";
  

  constructor(
    public teleConsultationService :TeleConsultationService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) {
    
   }

  ngOnInit() {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_src': [""],
      'by_dest': [""],
        });
    this.teleConsultationService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'src', headerName: 'Caller', hide: false, width: 350 },
      { field: 'dest', headerName: 'Callee', hide: false, width: 344 },
      { field: 'start_time', headerName: 'Start Time', hide: false, width: 300 },
      // { field: 'end_time', headerName: 'End Time', hide: false, width: 20 },
      { field: 'used_minutes', headerName: 'Used Minutes', hide: false, width: 300 },
    ];
    if (this.isFilter) {
      let customerId = localStorage.getItem('id');
      const credentials = this.filterForm.value;
      credentials.customer_id = customerId;
      this.teleConsultationService.getUnauthCdrByFilter(credentials).subscribe(pagedData => {
        this.exportData = pagedData;        
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    }else {
      this.filterObj ={};
      let customerId = localStorage.getItem('id');
      this.teleConsultationService.getUnauthCDR({customerId}).subscribe(pagedData =>{
      this.exportData = pagedData;
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    }, err => {
        this.error = err.message;
      }
      ); 
    }
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }


  downloadPDF(): void{
    var doc = new jsPDF();
    var col = ["Caller", "Callee", "Start Time","Used Minutes"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status;
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.src, element.dest, element.start_time, element.used_minutes];
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

      },
    });
    doc.save('Unauthorize-CDR.pdf');

  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  
  exportToExcel(): void{
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup:{paperSize: 8, orientation:'landscape',fitToPage: true, fitToHeight: 1, fitToWidth:1}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'src', key: 'Caller', hide: false, width: 30 },
      { header: 'dest', key: 'Callee', hide: false, width: 20 },
      { header: 'start_time', key: 'StartTime', hide: false, width: 20 },
      { header: 'used_minutes', key: 'UsedMinutes', hide: false, width: 20 },
     
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
        Caller: this.exportData[i].src,
        Callee: this.exportData[i].dest,
        StartTime: this.exportData[i].start_time,
        UsedMinutes: this.exportData[i].used_minutes,
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

    // this.excelService.exportAsExcelFile(arr, 'gateway');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'Unauthorize-CDR');
    });
  }

  showInfo(){
    const dialogRefInfo = this.dialog.open(UnauthorizeCdrDialog, {
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

}

@Component({
  selector: 'tele-consultation-cdrinfo-dialog',
  templateUrl: 'tele-consultation-cdrinfo-dialog.html',
})

export class UnauthorizeCdrDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<UnauthorizeCdrDialog>,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}