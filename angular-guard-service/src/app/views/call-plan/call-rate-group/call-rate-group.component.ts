import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { CallplanService } from '../callplan.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, CallPlanRate, invalidFileType, importUnsuccessfully, importSuccessfully, Number_RegEx, Number_Not_Start_Zero_RegEx } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
import { UserTypeConstants } from 'src/app/core/constants';
import { UserService } from '../../user/user.service';
import { CallRateGroup } from 'src/app/core/models/call_rate_group.model';

@Component({
  selector: 'app-call-rate-group',
  templateUrl: './call-rate-group.component.html',
  styleUrls: ['./call-rate-group.component.css']
})
export class CallRateGroupComponent implements OnInit {

  error = '';
  isFilter = false;
  filterForm: FormGroup;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  loginUserType = localStorage.getItem('type');
  accountManagerCustomerList: "";
  menus: any;
  callRateGroupMenu: any = '';
  showNotInsertedValue = false;
 

  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Call Plan';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  constructor(
    private fb: FormBuilder,
    private callplanService: CallplanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private userService: UserService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.filterForm = this.fb.group({
      // 'by_call_plan':  new FormControl([]),
      'by_name': [""],
      'by_minute': [""],
    });
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.callRateGroupMenu = this.menus.find((o) => o.url == '/callPlan/call-rate-group');
    this.callplanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 20 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Group Name', hide: false, width: 20 },
      { field: 'minutes', headerName: 'Minutes', hide: false, width: 30 },

    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;      
      credentials.by_minute = Number(this.filterForm.value.by_minute);      
      this.callplanService.filterCallRateGroup(credentials).subscribe(pagedData => {
        this.exportData = pagedData;                
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } 
    else {
      this.callplanService.viewCallRateGroup({ id: null, name: null }).subscribe(pagedData => {        
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
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Call Plan', key: 'CallPlan', width: 30 },
      { header: 'Dial Prefix', key: 'DialPrefix', width: 10 },
      { header: 'Gateway', key: 'Gateway', width: 25 },
      { header: 'Buying Rate', key: 'BuyingRate', width: 15 },
      { header: 'Selling Rate', key: 'SellingRate', width: 15 },
      { header: 'Selling Min Duration', key: 'SellingMinDuration', width: 18 },
      { header: 'Selling Billing Block', key: 'SellingBillingBlock', width: 18 },
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
        CallPlan: this.exportData[i].call_plan,
        DialPrefix: this.exportData[i].dial_prefix,
        Gateway: this.exportData[i].gatewayName,
        BuyingRate: this.exportData[i].buying_rate,
        SellingRate: this.exportData[i].selling_rate,
        SellingMinDuration: this.exportData[i].selling_min_duration,
        SellingBillingBlock: this.exportData[i].selling_billing_block
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
    // this.excelService.exportAsExcelFile(arr, 'callPlanRate');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'callPlanRate');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Call Plan", "Dial Prefix", "Gateway", "Buying Rate", "Selling Rate", "Selling Min Duration", "Selling Billing Block"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.call_plan, element.dial_prefix, element.gatewayName, element.buying_rate, element.selling_rate, element.selling_min_duration, element.selling_billing_block];
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
    doc.save('callPlanRate.pdf');
  }


  manageUserActionBtn(data:any) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";

      if(this.callRateGroupMenu.all_permission == '0' && this.callRateGroupMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if(this.callRateGroupMenu.modify_permission){
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if(this.callRateGroupMenu.delete_permission){
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
        if(data[i]['status'] == 1){
        finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewRates' title='View Call Rates'></i>";
      }
      data[i]['action'] = finalBtn;
    }
        
    return data;
  }


  manageAction(e) {
    let data = e.data;        
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editcallgroup(data);
      case "delete":
        return this.deleteCallPlanRate(data);
      case "viewRates":
        return this.viewAssociateRates(data);
    }
  }
  editcallgroup(event) {  
    this.openDialog(event.id);    
  }

  public viewAssociateRates(data) {
    this.router.navigate(['callPlan/call-rate-group/call-rates-associate-group'],{queryParams:{gId:data.id}})
  }

  deleteCallPlanRate(event) {
    // this.callplanService.getUsersInMinutePlan(mid)
    this.callplanService.getAllRatesInGroup(event.id).subscribe(data => {      
      let isExist = data.length > 0 ? true : false;
      if (isExist) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'>Call Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF'> can't be deleted because it is associated with  call plan.</span> ",
          type: 'error',
          background: '#000000',
          timer: 6000
        });
      }
      else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html: "<span style='color:#FFFFFF;'>You will not be able to recover Call rate Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.callplanService.deleteCallRateGroup(Number(event.id)).subscribe(data => {
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
              html: "<span style='color:#FFFFFF;'> Call rate Group  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 3000
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html: "<span style='color:#FFFFFF;'> Call rate Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
              type: 'error',
              background: '#000000',
              timer: 3000
            });
          }
        })
      }
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

  openDialog(id?): void {
    const dialogRef = this.dialog.open(CallRateGroupDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {      
    });
  }

  importFile() {
    const dialogRef11 = this.dialog.open(CallRateGroupDialog, {
      width: '60%', disableClose: true,
      data: {}
    });
    dialogRef11.afterClosed().subscribe(result => {      
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(CallRateGroupDialog, {
      width: '80%', disableClose: true, autoFocus:false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0
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

  showAssociateContacts(data) {    
    this.router.navigate(['callPlan/call-rate-group/groupRates'], { queryParams: { gId: data.id, gName: data.id } });
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }

}


//------------------------------  Add call rate group By. (Nagender Pratap Chauhan 19-04-2021) ------------------------------------------------------------//

@Component({
  selector: 'callrategroup-dialog',
  templateUrl: 'add-call-rate-group-dialog.html',
})

export class CallRateGroupDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  callPlanGroupForm: FormGroup;
  checkForm: any;
  selectedValue = [];
  callPlanRateData: any = {};
  errorField: any;
  defaultSellingBillingBlock = 60;
  userRole = localStorage.getItem('type');
  nameData = '';
  minutesData = '';
  callGroupData: any = [{}];
  error = '';
  callPlanData: any = {};
  callPlanName = "";
  menus: any;
  callRateGroupMenu: any = '';
  



  constructor(
    public dialogRef: MatDialogRef<CallRateGroupDialog>, @Inject(MAT_DIALOG_DATA) public data: CallRateGroup,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
  ) {
    this.callPlanGroupForm = this.fb.group({
      'name': ['', Validators.required],
      'minutes': ['', [ Validators.required]],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.callRateGroupMenu = this.menus.find((o) => o.url == '/callPlan/call-rate-group');
  }

  get name() { return this.callPlanGroupForm.get('name'); }
  get minutes() { return this.callPlanGroupForm.get('minutes'); }

  // numberOnly(event){
  //   const charCode = (event.which) ? event.which : event.keyCode;
  //   if (charCode ==  187 || charCode == 190 || charCode  == 189) {
  //     return false;
  //   }
  //   return true;

  // }

  ngOnInit() {

    if(this.callRateGroupMenu.all_permission == '0' && this.callRateGroupMenu.view_permission == '1'){
      this.callPlanGroupForm.disable();
    }

    
    
    if (this.data.id) {
      const user_id = localStorage.getItem("id");

      this.callplanService.ViewgetCallRateGroup(this.data).subscribe(data => {
        this.callGroupData = data;
        this.nameData = this.callGroupData.name;
        this.minutesData = this.callGroupData.minutes; 
      }, err => {
        this.error = err.message;
      });

    }
  }

  submitcallRateGroup() {
    if (this.callPlanGroupForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.callPlanGroupForm.value;
      credentials.id = this.data.id ? this.data.id : null;      
      credentials.minutes = Number(this.callPlanGroupForm.value.minutes);
      this.callplanService.viewCallRateGroup({ 'id': credentials.id, 'name': credentials.name }).subscribe(data => {  
        
              
        // if (data['length']) {          
        //   if(data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted){
        //     this.errorField = data[0].MESSAGE_TEXT;
        //     this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
        //   }      
        // } else{
      this.callplanService.createCallRateGroup(credentials)
        .subscribe(data => {          
          if (data['code'] == 200) {
            this.toastr.success(data['message'], 'Success!', { timeOut: 2000 });
            this.cancelForm();
          } 
          else if (data['code'] == 1062) {
            data['message'] = 'Call Rate Group Name already exist !'
            this.toastr.error(data['message'], 'Error!', { timeOut: 2000 });
          }
          else {
            this.toastr.error(data['message'], 'Error!', { timeOut: 2000 });
          }
        });
    // }
  });
  }
}


  cancelForm() {
    this.callPlanGroupForm.reset();
    this.callplanService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }


  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
  get UserTypeAccountManager() {
    return UserTypeConstants.ACCOUNT_MANAGER;
  }
  get UserTypeSupportManager() {
    return UserTypeConstants.SUPPORT_MANAGER;
  }

}