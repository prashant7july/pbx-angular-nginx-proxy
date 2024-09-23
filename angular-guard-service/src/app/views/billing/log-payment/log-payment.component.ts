import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BillingService } from '../billing.service';
import { Errors, CommonService, ExcelService, BillingData, invalidFormError ,amountZero} from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UserService } from '../../user/user.service';
import { ToastrService } from 'ngx-toastr';
export var productId = '1';

export interface LogPayment {
  id: string,
}

@Component({
  selector: 'app-log-payment',
  templateUrl: './log-payment.component.html',
  styleUrls: ['./log-payment.component.css']
})
export class LogPaymentComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData: any[]= [];
  exportData: any = {};
  defaultPageSize = '10';

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'company_name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';


  constructor(
    private router: Router,
    private billingService: BillingService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public userService: UserService
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_company': new FormControl([]),
      'by_paymentType' : [""]
    });
  }

  ngOnInit() {
    this.userService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
    //get company data
    let userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    if (userType == '3') {
      this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.companyData.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
        }
      }, err => {
        this.error = err.message;
      });
    }else{
    this.commonService.getCompany().subscribe(data => {
      this.companyData = data.response;
    }, err => {
      this.error = err.message;
    });
  }
  }
  Providerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyData.filter((data) =>{    
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  exportToExcel(): void {
    // debugger
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: 'landscape', views: [{ showGridLines: true }] }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: ' Date', key: 'date', width: 20 },
      { header: 'Company', key: 'company', width: 30 },
      { header: 'Payment Type', key: 'payment_type', width: 30 },
      { header: 'Added Commission', key: 'added_commission', width: 30 },
      // { header: 'Description', key: 'description', width: 30 },
      { header: 'Transaction Mode', key: 'txn_mode', width: 30 },
      { header: 'Amount', key: 'amount', width: 10 },
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
        date: this.exportData[i].paymentDateDisplay,
        company: this.exportData[i].company_name,
        payment_type: this.exportData[i].paymentTypeDisplay,
        added_commission: this.exportData[i].addedCommissionDisplay,
        // description: this.exportData[i].description,
        txn_mode: this.exportData[i].txn_mode,
        amount: this.exportData[i].amountDisplay,
      });
    }
    //for styleing gridlines
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });
    // worksheet.eachRow(function (row, _rowNumber) {
    //   row.eachCell(function (cell, _colNumber) {
    //     cell.border = {
    //       top: { style: 'thin', color: { argb: '000000' } },
    //       left: { style: 'thin', color: { argb: '000000' } },
    //       bottom: { style: 'thin', color: { argb: '000000' } },
    //       right: { style: 'thin', color: { argb: '000000' } }
    //     };
    //   });
    // });


    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    //freeze first row and header will show in 2nd row
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    //this.excelService.exportAsExcelFile(arr, 'contactList');    
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'logPayment');
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'paymentDateDisplay', headerName: 'Date', hide: false, width: 10 },
      { field: 'company_name', headerName: 'Company', hide: false, width: 10 },
      { field: 'paymentTypeDisplay', headerName: 'Payment Type', hide: false, width: 10 },
      { field: 'addedCommissionDisplay', headerName: 'Added Commission', hide: false, width: 10 },
      { field: 'txn_mode', headerName: 'Transaction Mode', hide: false, width: 10 },
      { field: 'amountDisplay', headerName: 'Amount', hide: false, width: 10 },
      { field: 'action', headerName: 'Action', hide: true, width: 10 }
    ];

    if (this.isFilter) {
      let role = Number(localStorage.getItem('type'));
      let ResellerID = Number(localStorage.getItem('id'));
      const credentials = this.filterForm.value;      
      credentials.by_paymentType = Number(this.filterForm.value.by_paymentType);
      this.userService.filterAddBalance(credentials,role,ResellerID).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      let role = Number(localStorage.getItem('type'));
      let ResellerID = Number(localStorage.getItem('id'));
      this.userService.getAddBalance({ id: null,role,ResellerID }).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      });
    }
  }

  

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Payment Date", "Company", "Payment Type", "Added Commission", "'Transaction Mode", "Amount"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.paymentDateDisplay, element.company_name, element.paymentTypeDisplay, element.addedCommissionDisplay,  element.txn_mode, element.amountDisplay];
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
        4: { cellWidth: 'wrap' },
        5: { cellWidth: 'wrap' },
        6: { cellWidth: 'wrap' }
      },
    });
    doc.save('logPayment.pdf');
  }


  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
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
    }
  }

  editData(event) {
    this.openDialog(event.id);
  }

  deleteData(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: 'You will not be able to recover this Payment in future!',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.userService.deleteAddBalance({ 'id': event.id }).subscribe(data => {
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
          text: 'Payment has been deleted.',
          type: 'success',
          background: '#000000'
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: 'Payment contact is safe :)',
          type: 'error',
          background: '#000000',
        });
      }
    })
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(AddUserBalanceDialog, {
      width: '60%', disableClose: true,
      data: {
        id: id ? id : null,
      }
    });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
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
    const dialogRefInfo = this.dialog.open(InfoLogPaymentDialog, {
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
  selector: 'infoLogPayment-dialog',
  templateUrl: 'infoLogPayment-dialog.html',
})

export class InfoLogPaymentDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoLogPaymentDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}


//add balance dialog
@Component({
  selector: 'addUserBalance-dialog',
  templateUrl: 'addUserBalance-dialog.html',
})

export class AddUserBalanceDialog {
  addBalanceForm: FormGroup;
  minDate: Date;
  submitted = false;
  checkForm = '';
  errors: Errors = { errors: {} };
  logPaymentData: any = {};
  paymentDate: Date;

  constructor(
    private router: Router,
    public dialogRefBalance: MatDialogRef<AddUserBalanceDialog>, @Inject(MAT_DIALOG_DATA) public data: LogPayment,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    private toastr: ToastrService,
    private userService: UserService,
  ) {
    this.minDate = new Date();
    this.addBalanceForm = this.formBuilder.group({
      'payment_date': ['', Validators.required],
      'amount': ['', [Validators.required, Validators.maxLength(5), Validators.minLength(1)]],
      'description': [''],
      'agent_commission': [''],
      'payment_type': ['1', Validators.required],
    });
  }

  get payment_date() { return this.addBalanceForm.get('payment_date'); }
  get amount() { return this.addBalanceForm.get('amount'); }
  get payment_type() { return this.addBalanceForm.get('payment_type'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.addBalanceForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  ngOnInit() {
    if (this.data.id) {
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
      this.userService.getAddBalance({ id: this.data.id,role,ResellerID }).subscribe(data => {
        this.logPaymentData = data[0];
        this.paymentDate = new Date(this.logPaymentData.payment_date);
      }, err => {
        this.errors = err.message;
      });
    }
  }


  submitAddBalanceForm() {
    if (this.addBalanceForm.valid) {
      this.submitted = true;
      const credentials = this.addBalanceForm.value;
      credentials.customer_id = this.logPaymentData.customer_id;
      credentials.id = this.data.id;
      if (credentials.amount == 0) {
        this.toastr.error('Error!', amountZero, { timeOut: 2000 });
        return;
      }
      this.userService.createAddBalance(credentials).subscribe(data => {
        if (data['code'] == 200) {
          this.toastr.success('Success!', data['message'], { timeOut: 2000 });
          this.cancelForm();
        }
        else {
          this.toastr.error('Error!', data['message'], { timeOut: 2000 });
        }
      });
    } else {
      this.toastr.error('Error!', invalidFormError, { timeOut: 2000 });
    }
  }

  onNoClick(e): void {
    this.dialogRefBalance.close();
    e.preventDefault();
  }

  cancelForm() {
    this.dialogRefBalance.close();
    this.addBalanceForm.reset();
    this.userService.updateGridList();
  }
}