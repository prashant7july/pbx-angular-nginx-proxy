import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
//import { ServerService } from '../server.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, ServerDetail, IP_RegEx, invalidIP, duplicatePort, formError, passwordError, usernameError, existNumberInBlackList } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { ServerService } from '../../server/server.service';
import { SmsService } from '../sms.service';

@Component({
  selector: 'app-view-customer-template',
  templateUrl: './view-customer-template.component.html',
  styleUrls: ['./view-customer-template.component.css']
})
export class ViewCustomerTemplateComponent implements OnInit {

  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  filterForm: FormGroup;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  errors = "";
  exportData: any = {};
  defaultPageSize = '10';
  categoryList: any = "";
  selectCatogery = [];
  filterCategoryOne: any;
  CategoryOneFilter: any;
  public fields: Object = { text: 'category_name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder: string = 'Category';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private serverService: ServerService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public commonService: CommonService,
    private excelService: ExcelService,
    private smsService: SmsService
  ) {
    this.filterForm = this.fb.group({
      'by_category': [""],
      'by_status': [""],
    });

  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    //get SMS category list
    this.smsService.getSMSCategories().subscribe(data => {
      this.selectCatogery = this.categoryList = data;
      this.selectCatogery.unshift({ id: 0, category_name: 'default' })
      this.filterCategoryOne = this.CategoryOneFilter = this.categoryList.slice()
    }, err => {
      this.error = err.message;
    });

    this.serverService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  Accountremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.categoryList.filter((data) => {
      return data['category_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'category_name', headerName: 'Category', hide: false, width: 20 },
      { field: 'description', headerName: 'Description', hide: false, width: 30 },
      { field: 'status', headerName: 'Status', hide: false, width: 10 },
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.by_status = Number(credentials.by_status);
      credentials.customer_id = localStorage.getItem('id') ? Number(localStorage.getItem('id')) : 0;
      this.smsService.filterSMSTemplate(credentials).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      let customer_id = localStorage.getItem('id') ? localStorage.getItem('id') : '0';
      this.smsService.getSMSTemplates(customer_id).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
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
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      // { header: 'Service', key: 'Service', width: 15 },
      { header: 'Name', key: 'Name', width: 40 },
      { header: 'Validity', key: 'Validity', width: 20 },
      { header: 'Charge', key: 'Charge', width: 10 },
      { header: 'No Of SMS', key: 'number_of_sms', width: 10 },
      { header: 'Provider', key: 'provider_name', width: 15 }
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
        Name: this.exportData[i].name,
        Validity: this.exportData[i].validity_name,
        Charge: this.exportData[i].charge,
        number_of_sms: this.exportData[i].number_of_sms,
        provider_name: this.exportData[i].provider_name,
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

    // this.excelService.exportAsExcelFile(arr, 'server');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'sms');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Name", "Validity", "Charge", "No Of SMS", "Provider"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.name, element.validity_name, element.charge, element.number_of_sms, element.provider_name]; //number_of_sms
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
    doc.save('server.pdf');
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";

      if (data[i].status == 'Inactive') {
        data[i].status = "<span style='color:#c69500;'><strong>" + data[i].status + "</strong></span>";
        finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\
        ";
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      } else {
        data[i].status = "<span style='color:#379457;'><strong>" + data[i].status + "</strong></span>";
      }

      //finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";

      finalBtn += "</span>";

      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editData(data);
      case "delete":
        return this.deleteData(data);
      case "active":
        return this.updateStatus(data);
      case "inactive":
        return this.updateStatus(data);
    }
  }

  editData(event) {
    // this.openDialog(event.id);
    this.openDialog(event);
  }

  deleteData(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover SMS Template </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.id + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.smsService.deleteSMSTemplate({ id: event.id }).subscribe(data => {
          this.displayAllRecord();
        },
          err => {
            this.error = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> SMS Template </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.id + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>SMS Template </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.id + "</span> <span style='color:#FFFFFF'> is safe.</span> ",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(SmsTemplateDialog, { width: '60%', disableClose: true, data: data ? data : null });
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

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoSMSTemplateDialog, {
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

  updateStatus(event) {
    let smsTemplateStatus = '';
    let btnmessage = '';
    let action = event.status.match(/Active/g) ? 'Active' : 'Inactive';
    if (action == 'Active') {
      smsTemplateStatus = 're-activate';
      btnmessage = "Inactive";
    } else {
      smsTemplateStatus = 'inactive';
      btnmessage = "Activate";
    }
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You can " + smsTemplateStatus + " SMS template </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.category_name + "</span><span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes,' + btnmessage + ' it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.smsService.updateSMSTemplateStatus('updateSMSTemplateStatus', event.id, Number(action), event.category_id).subscribe(data => {
          this.checkMultipleStatus(event.id, Number(action), event.category_id);// for multiple status
          this.displayAllRecord();
        }, err => {
          this.error = err.message;
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">' + btnmessage + 'd!</span>',
          html: "<span style='color:#FFFFFF;'>SMS template</span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " + event.category_name + "</span><span style='color:#FFFFFF;'>has been " + btnmessage + "d.</span>",
          type: 'success',
          background: '#000000',
          timer: 4000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>SMS template </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.category_name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 4000
        });
      }
    });
  }

  checkMultipleStatus(id, action, email_category_id) {
    // this.emailTemplateService.checkMultipleStatus('checkMultipleStatus', id, action, email_category_id).subscribe(data => {
    //   this.displayAllRecord();
    // }, err => {
    //   this.error = err.message;
    // });
  }

}

@Component({
  selector: 'customer-sms-template',
  templateUrl: 'customer-sms-template-dialog.html',
})

export class SmsTemplateDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  smsForm: FormGroup;
  checkForm: any;
  // selectedValue = '';
  error = "";
  validPort: any = false;
  user_pswd_Div = false;
  validIP: any = false;
  serverData: any = {};
  errorField = '';
  categoryList: any = [];
  selectCatogery = [];
  filterCategory: any;
  CategoryFilter: any;
  isDisabledCategoryDropDown: boolean = false;
  public fields: Object = { text: 'category_name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder: string = 'Select Category';


  constructor(
    public dialogRef: MatDialogRef<SmsTemplateDialog>, @Inject(MAT_DIALOG_DATA) public data: ServerDetail,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private serverService: ServerService,
    public commonService: CommonService,
    private smsService: SmsService
  ) {
    this.smsForm = this.fb.group({
      'category': ['', Validators.required],
      'description': ['', Validators.required],

    });
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {

    //get SMS category list
    this.smsService.getSMSCategories().subscribe(data => {
      this.selectCatogery = this.categoryList = data;
      this.filterCategory = this.CategoryFilter = this.categoryList.slice();
    }, err => {
      this.error = err.message;
    });

    if (this.data) {
      this.serverData['description'] = this.data['description'];
      this.serverData['category'] = this.data['category_id'];
      this.isDisabledCategoryDropDown = true;
      // this.smsService.getSMSPlanByID(this.data.id).subscribe(data => {
      //   this.serverData = data[0];
      // }, err => {
      //   this.error = err.message;
      // });
    }
  }

  Accountremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.categoryList.filter((data) => {
      return data['category_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  get category() { return this.smsForm.get('category'); }
  get description() { return this.smsForm.get('description'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.smsForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }


  submitServerForm() {
    this.checkForm = this.findInvalidControls();
    if (this.smsForm.valid) {
      this.submitted = true;
      const credentials = this.smsForm.value;
      if (this.data) {
        credentials.id = this.data.id ? Number(this.data.id) : null;
        credentials.customer_id = Number(localStorage.getItem('id'));
        this.smsService.updateSMSTemplate('updateSMSTemplate', credentials).subscribe(data => {
          if (data) {
            this.toastr.success('Success!', "SMS Template updated successfully !", { timeOut: 2000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
      }
      else {
        credentials.status = 0;
        credentials.customer_id = Number(localStorage.getItem('id'));
        credentials.category_name = this.categoryList.filter(item => item.id == credentials.category)[0]['category_name'];
        this.smsService.createSMSTemplate('createSMSTemplate', credentials).subscribe(data => {
          if (data) {
            this.toastr.success('Success!', "SMS Template created successfully !", { timeOut: 2000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
      }
    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
  }

  cancelForm() {
    this.smsForm.reset();
    this.serverService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public getCharacterOfDescription() {
    let count = this.serverData['description'] ? (this.serverData['description']).length : 0;
    return count = 255 - count;
  }

}

@Component({
  selector: 'infoSMSTemaplate-dialog',
  templateUrl: 'infoSMSTemplate-dialog.html',
})

export class InfoSMSTemplateDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoSMSTemplateDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}