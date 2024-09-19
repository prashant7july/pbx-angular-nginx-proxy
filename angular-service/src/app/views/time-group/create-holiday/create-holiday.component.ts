import { Component, OnInit, Inject } from '@angular/core';
import { Errors, CommonService, ExcelService, minTime, formError, Name_RegEx } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { Holiday } from '../../../core/models';
import { TimeGroupService } from '../time-group.service';
import Swal from 'sweetalert2';
import { DateAdapter } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { Router,NavigationEnd } from '@angular/router';
import * as XLSX from 'xlsx';

declare const ExcelJS: any;

@Component({
  selector: 'app-create-holiday',
  templateUrl: './create-holiday.component.html',
  styleUrls: ['./create-holiday.component.css']
})
export class CreateHolidayComponent implements OnInit {
  errors: Errors = { errors: {} };
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  errorField = "";
  isFilter = false;
  filterForm: FormGroup;
  userRole = "";
  hideAction: any = false;
  exportData: any = {};
  todayDate = new Date();
  defaultPageSize = '10';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private apiService: ApiService,
    public commonService: CommonService,
    private timeGroupService: TimeGroupService,
    public dialog: MatDialog,
    private excelService: ExcelService,

  ) {
    this.todayDate = new Date();
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_range': [""]
    });
  }

  ngOnInit() {
    this.userRole = localStorage.getItem('type');
    this.hideAction = localStorage.getItem('type') == '6' ? true : false;
    this.timeGroupService.setPage.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: this.hideAction, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10},
      { field: 'dateDisplay', headerName: 'Date', hide: false, width: 20 },
      { field: 'holiday', headerName: 'Holiday', hide: false, width: 30},
      { field: 'fullDayDisplay', headerName: 'Full Day', hide: false, width: 10 },
      { field: 'start_time', headerName: 'Start Time', hide: false, width: 20},
      { field: 'end_time', headerName: 'End Time', hide: false, width: 20 },
     
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.customer_id = Number(localStorage.getItem('id'));
      credentials.role = Number(localStorage.getItem('type'));
      this.timeGroupService.filterHoliday(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.errors = err.message;
      });
    } else {
      this.timeGroupService.viewHoliday({ id: null, holiday: null, date: null, customer_id: Number(localStorage.getItem('id')), role: Number(localStorage.getItem('type')) }).subscribe(pagedData => {
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
      pageSetup:{paperSize: 8, orientation:'landscape',fitToPage: true, fitToHeight: 1, fitToWidth:1}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    
    worksheet.columns = [
      { header: 'Date', key: 'Date', width: 20 },
      { header: 'Holiday', key: 'Holiday', width: 25 },
      { header: 'Full Day', key: 'FullDay', width: 10 },
      { header: 'Start Time', key: 'StartTime', width: 10 },
      { header: 'End Time', key: 'EndTime', width: 10 }
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
        Date: this.exportData[i].dateDisplay,
        Holiday: this.exportData[i].holiday,
        FullDay: this.exportData[i].fullDayDisplay,
        StartTime: this.exportData[i].start_time,
        EndTime: this.exportData[i].end_time,
      });
    }
    worksheet.eachRow(function (row, _rowNumber) {
      row.eachCell(function (cell, _colNumber) {
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        };
      });
    });
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    // this.excelService.exportAsExcelFile(arr, 'holiday');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'holiday');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Date", "Holiday", "Full Day", "Start Time", "End Time"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.dateDisplay, element.holiday, element.fullDayDisplay, element.start_time, element.end_time];
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
        4: { cellWidth: 'wrap' }
      },
    });
    doc.save('holiday.pdf');
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";

      finalBtn += "</span>";

      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editHoliday(data);
      case "delete":
        return this.deleteHoliday(data);
    }
  }


  openDialog(id?): void {
    const dialogRef = this.dialog.open(HolidayDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  editHoliday(event) {
    this.openDialog(event.id);
  }

  deleteHoliday(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html : "<span style='color:#FFFFFF;'>You will not be able to recover holiday</span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.holiday+"</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.timeGroupService.deleteHoliday({ id: event.id }).subscribe(data => {
          this.displayAllRecord();
        },
          err => {
            this.errors = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html : "<span style='color:#FFFFFF;'>Holiday </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.holiday+"</span> <span style='color:#FFFFFF;'> has been deleted</span>",
          type: 'success',
          background: '#000000',
          timer:2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html :  "<span style='color:#FFFFFF;'>Holiday </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.holiday+"</span> <span style='color:#FFFFFF;'> is safe :)</span>",
          type: 'error',
          background: '#000000',
          timer:2000,
        });
      }
    })
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoHolidayDialog, {
      width: '80%', disableClose: true, autoFocus:false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
        extensionId: localStorage.getItem('type') == '6' ? localStorage.getItem('id') : 0,
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

  //------------------------------------------ import csv functionality-----------------------------------
  openDialogImportToExcel(id?): void {
    const dialogRef = this.dialog.open(ImportXLDialog, { width: '60%', disableClose: true });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }
 
}

@Component({
  selector: 'infoHoliday-dialog',
  templateUrl: 'infoHoliday-dialog.html',
})

export class InfoHolidayDialog {
  role: any;
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoHolidayDialog>, @Inject(MAT_DIALOG_DATA) public data: Holiday,
  ) { }

  ngOnInit() {
    this.role = localStorage.getItem('type');
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

@Component({
  selector: 'holiday-dialog',
  templateUrl: 'holiday-dialog.html'
})

export class HolidayDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  holidayForm: FormGroup;
  checkForm: any;
  todayDate: Date;
  startTime: any;
  finishTime: Date;
  data1: any;
  endTimeValue: any;
  showFullday = false;
  holidayData: any = {};
  fullDayExists = false;
  hoildayFormExist = false;
  holidayId = "";
  holidayName: any;
  errorField = "";
  minDate: Date;

  constructor(
    public dialogRef: MatDialogRef<HolidayDialog>, @Inject(MAT_DIALOG_DATA) public data: Holiday,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private apiService: ApiService,
    public commonService: CommonService,
    private timeGroupService: TimeGroupService,
    private dateAdapter: DateAdapter<Date>,
    public dialog: MatDialog
  ) {
    this.todayDate = new Date();
    this.minDate = new Date();
    this.startTime = new Date();
    this.finishTime = new Date();

    this.holidayForm = this.fb.group({
      'holiday': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'date': ['', Validators.required],
      'start_time': ['', Validators.required],
      'end_time': ['', Validators.required],
      'fullDay': ['']
    });
    this.dateAdapter.setLocale('en-GB');
  }

  get holiday() { return this.holidayForm.get('holiday'); }
  get date() { return this.holidayForm.get('date'); }
  get start_time() { return this.holidayForm.get('start_time'); }
  get end_time() { return this.holidayForm.get('end_time'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.holidayForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  ngOnInit() {
    this.startTime = this.startTime.getHours() + ':' + (this.startTime.getMinutes());
    this.holidayForm.controls.start_time.enable();
    this.holidayForm.controls.end_time.enable();
    this.endTime(this.finishTime);

    if (this.data.id) {
    console.log('dispaly');
    
      this.timeGroupService.viewHoliday({ id: this.data.id, holiday: null, date: null, customer_id: Number(localStorage.getItem('id')), role: Number(localStorage.getItem('type')) }).subscribe(data => {
        if (data) {
          this.holidayData = data[0];
          this.holidayName = data[0].holiday;
          this.startTime = data[0].start_time;
          this.endTimeValue = data[0].end_time;
          this.todayDate = new Date(data[0].date);
          this.fullDayExists = true;
          if (data[0].full_day === 1) {
            this.holidayForm.controls.start_time.disable();
            this.holidayForm.controls.end_time.disable();
            this.showFullday = true;
          } else {
            this.holidayForm.controls.start_time.enable();
            this.holidayForm.controls.end_time.enable();
            this.showFullday = false;
          }
        } else {
          this.fullDayExists = false;
        }
      }, err => {
        this.errors = err.message;
      });
    }
  }

  showFullDay(event) {
    let fullday = event.checked;
    if (fullday == true) {
      this.holidayForm.controls.start_time.disable();
      this.holidayForm.controls.end_time.disable();
      this.showFullday = true;
    } else {
      this.holidayForm.controls.start_time.enable();
      this.holidayForm.controls.end_time.enable();
      this.showFullday = false;
    }
  }

  submitHoliday() {
    this.checkForm = this.findInvalidControls();
    if (this.holidayForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.holidayForm.value;

      if (credentials.start_time >= credentials.end_time) {
        this.toastr.error('Error!', minTime, { timeOut: 2000 });
        this.holidayForm.controls['end_time'].setValue(this.startTime);
        return;
      }
      if (this.showFullday == false) {
        // credentials.fullDay = '0';
        credentials.fullDay = 0;
      } else {
        credentials.fullDay = 1;
      }
      credentials.customer_id = Number(localStorage.getItem('id'));
      credentials.id = Number(this.data.id) ? Number(this.data.id) : null;
      let curDate = credentials.date;
      this.timeGroupService.viewHoliday({ 'id': null, 'holiday': null, 'date': curDate, 'customer_id': Number(localStorage.getItem('id')), 'role': Number(localStorage.getItem('type')) }).subscribe(data => {
        if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
          this.errorField = data[0].MESSAGE_TEXT;
          this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
        } else {
          this.timeGroupService.createHoliday('createHoliday', credentials)
            .subscribe(data => {
              if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                this.cancelHoliday();
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            });
        }
      });
    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  cancelHoliday() {
    this.holidayForm.reset();
    this.timeGroupService.updateGridList();
    this.dialogRef.close();
    this.todayDate = new Date();
    this.startTime = new Date();
    this.finishTime = new Date();
    this.endTime(this.finishTime);
    this.hoildayFormExist = false;
    this.showFullday = false;
    this.holidayForm.controls.start_time.enable();
    this.holidayForm.controls.end_time.enable();
  }

  endTime(value: Date): void {
    this.data1 = new Date(value.getTime() + 59 * 60000);
    let data2 = this.data1.getHours() + ':' + (this.data1.getMinutes());
    this.endTimeValue = data2;
  }

  onTimeSelect(e) {
    var initialDate = e;
    var theAdd = new Date(1900, 0, 1, initialDate.split(":")[0], initialDate.split(":")[1]);
    theAdd.setMinutes(theAdd.getMinutes() + 15);
    let setFinTime = theAdd.getHours() + ":" + theAdd.getMinutes();
    this.endTimeValue = setFinTime;
  }

}

@Component({
  selector: 'importXL-dialog',
  templateUrl: 'importXL-dialog.html'
})

export class ImportXLDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  holidayForm: FormGroup;
  checkForm: any;
  data1: any;
  endTimeValue: any;
  showFullday = false;
  holidayData: any = {};
  hoildayFormExist = false;
  holidayId = "";
  holidayName: any;
  errorField = "";
  minDate: Date;
  csvFile: any;
  imageSource: any



  constructor(
    public dialogRef: MatDialogRef<ImportXLDialog>, @Inject(MAT_DIALOG_DATA) public data: Holiday,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    private timeGroupService: TimeGroupService,
    public dialog: MatDialog
  ) {
  
    this.holidayForm = this.fb.group({
      'holiday': ['', [Validators.required]],
    });
  }


  public findInvalidControls() {
    const invalid = [];
    const controls = this.holidayForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  ngOnInit() { 

  }


  // submitHoliday() {
  //   this.checkForm = this.findInvalidControls();
  //   if (this.holidayForm.valid) {
  //     this.submitted = true;
  //     this.errors = { errors: {} };
  //     const credentials = this.holidayForm.value;

   
  //   } else {
  //     this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
  //   }
  // }

  cancelHoliday() {
    this.holidayForm.reset();
    this.timeGroupService.updateGridList();
    this.dialogRef.close();
  }

  public onFileChange(event) {
    if (event.target.files.length > 0) {
      let fileName = "";
      let fileExtension ;
     this.csvFile = event.target.files[0];
     fileName = this.csvFile['name'];
     fileExtension = fileName.split('.').pop();
     if(fileExtension == 'xlsx' || fileExtension == 'xls' || fileExtension == 'csv'){
      
     }else{
      this.toastr.error('Error!', `File Format should be correct`, { timeOut: 5000 });
      this.holidayForm.get('holiday').setValue('');
      this.csvFile = "";
     }
      
    }
  }

  public importToExcel() {
    let arrayBuffer;
    let exceljsondata;
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      arrayBuffer = fileReader.result;
      var data = new Uint8Array(arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      exceljsondata = XLSX.utils.sheet_to_json(worksheet, { raw: false })  /// sheet_to_json(worksheet, { raw: true });  //{ raw: true, defval: "" }
      console.log(exceljsondata);
     
      for (let i = 0; i < exceljsondata.length; i++) {
        var count = 1;
        let str = exceljsondata[i].Date;
        let darr = str.split("/");    // ["29", "1", "2016"]
        let dobj = new Date(parseInt(darr[2]),parseInt(darr[1])-1,parseInt(darr[0]));
        console.log(dobj);
        this.timeGroupService.viewHoliday({ 'id': null, 'holiday': null, 'date': (dobj).toISOString(), 'customer_id': Number(localStorage.getItem('id')), 'role': Number(localStorage.getItem('type')) }).subscribe(data => {
          console.log('>>>>>>>>>>>>>>>>>>>'+data)
          if (data && data[0].lastInserted >= 1) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
          } else {
            console.log('come!!!!!!!.....',count,exceljsondata.length);
            if (count == exceljsondata.length) {
              let isCheckColumn =   this.isCheckColumnSequence(exceljsondata);
              let isCheckHolidayName =   this.isCheckHolidayNameForSpecialCharacter(exceljsondata);
              console.log(isCheckColumn)
              console.log(isCheckHolidayName)
              if(isCheckColumn && isCheckHolidayName){
                this.timeGroupService.createHolidayfromExcel('createHoliday', exceljsondata,localStorage.getItem('id'))
                .subscribe(data => {
                  if (data['code'] == 200) {
                    this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                    this.cancelHoliday();
                  }
                  else {
                    this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                  }
                });
              }
            }
            count++;
            console.log('come count!!!!!!!.....',count);
          }
        })
      }
    }
  fileReader.readAsArrayBuffer(this.csvFile);
}

  public isCheckColumnSequence(excelData) {
    let isCheck:boolean = true;
    let singleRow = excelData[0];
    console.log(singleRow)
    for (let i in singleRow) {
      console.log(i)
      if ((i == 'Holiday' || i == 'Date' || i == 'Start Time' || i == 'End Time' || i == 'Full Day' || i == 'Holiday ' || i == 'Date ' || i == 'Start Time ' || i == 'End Time ' || i == 'Full Day ' ||  i == ' Full Day' || i == ' Holiday' || i == ' Date' || i == ' Start Time' || i == ' End Time' )) {
        continue;
      } else {
        console.log(i);
        this.toastr.error('Error!', `Excel file column should be same...${i} is wrong column name`, { timeOut: 5000 });
        isCheck = false;
       break; // return;
      }
    }
    return isCheck; 
  }

  public openSampleImage(){
    this.imageSource  = '../../assets/img/holidayCSV.png'; 
  }

  public isCheckHolidayNameForSpecialCharacter(hoidays) {
    let isCheck: boolean = true;
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/); //unacceptable chars
    hoidays.forEach(element => {
      if (pattern.test(element['Holiday'])) {
        this.toastr.error('Error!', `Special character are not allowed on name`, { timeOut: 5000 });
        isCheck = false;
        return false;
      }
    });
    return isCheck;
  }

}