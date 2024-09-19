import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx,Number_RegEx,Contact_RegEx, importSuccessfully, importUnsuccessfully, invalidFileType } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OBDService } from '../obd.service';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';

declare const ExcelJS: any;

@Component({
  selector: 'app-obd-cdr',
  templateUrl: './obd-cdr.component.html',
  styleUrls: ['./obd-cdr.component.css']
})
export class ObdCdrComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  filterObj: any = {};
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  filterForm: FormGroup;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private OBDService: OBDService,
  ) { }
  ngOnInit() {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_callee': [""],
      'by_date': [""],
    });

    this.OBDService.displayAllRecord().subscribe(() =>{
      this.displayAllRecord();
    })
  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: true, width: 200 },
      { field: 'id', headerName: 'ID', hide: true, width: 100 },
      { field: 'session_start', headerName: 'Session Start', hide: false, width: 250 },
      { field: 'obd_name', headerName: 'OBD Name', hide: false, width: 280 },
      { field: 'caller', headerName: 'Caller', hide: false, width: 250 },
      { field: 'callee', headerName: 'Lead', hide: false, width: 250 },
      { field: 'dtmf_store', headerName: 'DTMF', hide: false, width: 150 },
      { field: 'hangup_cause', headerName: 'Hangup Cause', hide: false, width: 300 },
    ];
    const credentials = this.filterForm.value;
    let user_id = localStorage.getItem('id');
    credentials['user_id'] = user_id;
    if(this.isFilter){
      this.OBDService.getObdCDRByFilter(credentials).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
      })
    }else{
      const user_id = localStorage.getItem('id');
      this.OBDService.getobdCDR(user_id).subscribe((datas => {
        this.exportData = datas
        datas = this.manageUserActionBtn(datas);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': datas});
      })),err => {
        this.error = err.message;
      }
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
  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let schedularBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
      if (pagedData[i]['is_scheduler_type'] == '0' && pagedData[i]['status'] == '0') { //schedular
        schedularBtn += "<span>";
        schedularBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='start' title='Start Schedular'>Start</button> ";
        schedularBtn += "</span>";
      } else if (pagedData[i]['is_scheduler_type'] == '0' && pagedData[i]['status'] == '1') { //schedular
        schedularBtn += "<span>";
        schedularBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='stop' title='Stop Schedular'>Stop</button> ";
        schedularBtn += "</span>";
      } else {
        schedularBtn += "<p>" + pagedData[i]['conf_schedule_time'] + "</p>";
        // data[i]['description'] = finalBtn;
      }
      pagedData[i]['conf_schedule_time'] = schedularBtn;
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
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
      { header: 'Session Start', key: 'session_start', width: 25 },
      { header: 'OBD Name', key: 'obd_name', width: 25 },
      { header: 'Caller', key: 'caller', width: 25 },
      { header: 'Lead', key: 'callee', width: 25 },      
      { header: 'DTMF', key: 'dtmf_store', width: 25 },
      { header: 'Hangup Cause', key: 'hangup_cause', width: 50 }     
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
        session_start: this.exportData[i].session_start,
        obd_name: this.exportData[i].obd_name,
        caller: this.exportData[i].caller,
        callee: this.exportData[i].callee,        
        dtmf_store: this.exportData[i].dtmf_store,
        hangup_cause: this.exportData[i].hangup_cause       
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
      FileSaver.saveAs(blob, 'OBD cdr');
    });
  }






}
