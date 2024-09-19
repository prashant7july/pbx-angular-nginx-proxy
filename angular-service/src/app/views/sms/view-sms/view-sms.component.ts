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
  selector: 'app-view-sms',
  templateUrl: './view-sms.component.html',
  styleUrls: ['./view-sms.component.css'],
})
export class ViewSmsComponent implements OnInit {

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
  providerList: any = [];
  menus: any;
  adminSMSPlanMenu: any = '';
  smsspace:any = [];

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Provider';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

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
      'by_name': [""],
      'by_provider': new FormControl([]),
    });

  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.adminSMSPlanMenu = this.menus.find((o) => o.url == '/sms/admin-sms-plan');
    this.smsService.viewAllSMSProvider(localStorage.getItem('id')).subscribe(datas => {
      // this.providerList = data;
      let data = datas;
      for (let i = 0; i < data.length; i++) {
       this.providerList.push({ id: data[i].id, name: data[i].provider });
        // this.smsspace = this.providerList.toString()
      }
    }, err => {
      this.error = err.message;
    });

    this.serverService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.providerList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }


  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 15 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'provider', headerName: 'Provider', hide: false, width: 15 },
      { field: 'name', headerName: 'Name', hide: false, width: 30 },
      { field: 'validity_name', headerName: 'Validity', hide: false, width: 20 },
      { field: 'charge', headerName: 'Charge', hide: false, width: 20 },
      { field: 'number_of_sms', headerName: 'SMS Limit', hide: false, width: 20 },

    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;

      this.smsService.filterSMSPlan(credentials).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.smsService.getSMSPlan().subscribe(data => {
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
        provider_name: this.exportData[i].provider,
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
      const e11 = [element.name, element.validity_name, element.charge, element.number_of_sms, element.provider]; //number_of_sms
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
    doc.save('SMS plan.pdf');
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {      
      let finalBtn = '';
      finalBtn += "<span>";

      if(this.adminSMSPlanMenu.all_permission == '0' && this.adminSMSPlanMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.adminSMSPlanMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      // if (data[i].status == 'Active') {
      //   data[i].status = "<span style='color:#379457;'><strong>" + data[i].status + "</strong></span>";
      //   finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>\
      // ";
      // } else {
      //   data[i].status = "<span style='color:#c69500;'><strong>" + data[i].status + "</strong></span>";
      //   finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\
      // ";
      // }     
      if (this.adminSMSPlanMenu.delete_permission) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      if(data[i].status == '1'){
        finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewUsers' title='View Customers'></i>";
      }
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
        return this.deleteSMSPlan(data);
      case "viewUsers":
        return this.showUsers(data);
    }
  }

  editData(event) {
    this.openDialog(event.id);
  }

  showUsers(data) {    
    this.router.navigate(['sms/admin-sms-plan/associate-users'], { queryParams: { smsId: data.id, smsName: data.name } });
  }


  deleteSMSPlan(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover SMS plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.smsService.deleteSMSPlan({ 'id': event.id }).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                html: "<span style='color:#FFFFFF;'>SMS plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> already exist in pakage.</span>",
                showConfirmButton: false,
                timer: 3000,
                background: '#000000'
              })
            return;
          } else {
            this.displayAllRecord();
          }
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
          html: "<span style='color:#FFFFFF;'>SMS plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>SMS plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }


  openDialog(id?): void {
    const dialogRef = this.dialog.open(SmsDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
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
    // const dialogRefInfo = this.dialog.open(InfoServerDialog, {
    //   width: '80%', disableClose: true, autoFocus:false,
    //   data: {
    //     customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
    //   }
    // });
    // dialogRefInfo.keydownEvents().subscribe(e => {
    //   if (e.keyCode == 27) {
    //     dialogRefInfo.close('Dialog closed');
    //   }
    // });
    // dialogRefInfo.afterClosed().subscribe(result => {
    //   console.log('Dialog closed');
    // });
  }

}

@Component({
  selector: 'sms-dialog',
  templateUrl: 'sms-plan-dialog.html',
})

export class SmsDialog {
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
  providerList = [];
  smsspace = [];
  ProviderFilter:any;
  filterProvider:any;
  menus:any;
  adminSMSPlanMenu:any;

  public fields: Object = { text: 'provider', value: 'id' };
  public placeholder: string = 'Select Provider';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  charge_label: string = "Monthly Charge";
  sms_limit_label: string = "Monthly SMS Limit";
  constructor(
    public dialogRef: MatDialogRef<SmsDialog>, @Inject(MAT_DIALOG_DATA) public data: ServerDetail,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private serverService: ServerService,
    public commonService: CommonService,
    private smsService: SmsService
  ) {
    this.smsForm = this.fb.group({
      'name': ['', [Validators.required]],
      'validity': ['1'],
      'charge': ['', Validators.required],
      'no_of_sms': ['', Validators.required],
      'provider': ['', Validators.required],
      'description': ['', Validators.required],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.adminSMSPlanMenu = this.menus.find((o) => o.url == '/sms/admin-sms-plan');
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {

    if(this.adminSMSPlanMenu.all_permission == '0' && this.adminSMSPlanMenu.view_permission == '1'){
      this.smsForm.disable();
    }

    //get SMS Providers list
    let customer_id = localStorage.getItem('id') ? localStorage.getItem('id') : '0';
    


    if (this.data.id) {
      this.smsService.viewAllSMSProvider(customer_id).subscribe(data => {            
        const list = data ? data : []
        this.smsspace = list;
        this.providerList = list;            
        this.filterProvider = this.ProviderFilter = this.providerList.slice()
        this.smsService.getSMSPlanByID(this.data.id).subscribe(data => {
          const detail = data[0]
          this.serverData = detail;
          this.validityChangeAction(this.serverData['validity']);
        }, err => {
          this.error = err.message;
        });
      }, err => {
        this.error = err.message;
      });
      
    } else {
      this.smsService.viewAllSMSProvider(customer_id).subscribe(data => {
        this.smsspace = this.providerList = data ? data : [];      
        this.filterProvider = this.ProviderFilter = this.providerList.slice()


        if (this.providerList.length > 0) this.serverData.provider = this.providerList[0]['id'];
      }, err => {
        this.error = err.message;
      });
    }
  }

  get name() { return this.smsForm.get('name'); }
  get validity() { return this.smsForm.get('validity'); }
  get charge() { return this.smsForm.get('charge'); }
  get no_of_sms() { return this.smsForm.get('no_of_sms'); }
  get provider() { return this.smsForm.get('provider'); }
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
      if (this.data.id) {
        credentials.id = this.data.id ? this.data.id : null;
        this.smsService.updateSMSPlan('updateServer', credentials).subscribe(data => {
          if (data) {
            this.toastr.success('Success!', "SMS Plan updated successfully !", { timeOut: 2000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
      }
      else {
        credentials.validity = credentials.validity ? credentials.validity : '1';        
        credentials.no_of_sms = credentials.validity =='3' ? 0 : credentials.no_of_sms;        
        credentials.provider_name = this.providerList.filter((item) => item.id == credentials.provider)[0]['provider']
        this.smsService.createSMSPlan('createServer', credentials).subscribe(data => {
          if (data) {
            this.toastr.success('Success!', "SMS Plan created successfully !", { timeOut: 2000 });
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
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.smsspace.filter((data) =>{    
      return data['provider'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
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

  selectService(service) {
    let myservice = service.value;
    if (myservice == 1) {
      this.smsForm.controls.user.disable();
      this.smsForm.controls.pswd.disable();
      this.user_pswd_Div = false;
    } else if (myservice == 2) {
      this.smsForm.controls.user.enable();
      this.smsForm.controls.pswd.enable();
      this.user_pswd_Div = true;
    }
  }

  public validityChangeAction(type) {
    switch (type) {
      case '1':  // Monthly
        this.charge_label = "Monthly Charge";
        this.sms_limit_label = "Monthly SMS Limit";
        this.smsForm.get('no_of_sms').enable();
        break;
      case '2':  // Yearly
        this.charge_label = "Yearly Charge";
        this.sms_limit_label = "Yearly SMS Limit";
        this.smsForm.get('no_of_sms').enable();
        break;
      case '3':  // Pay Per Use
        this.charge_label = "Per SMS Charge";
        this.sms_limit_label = "SMS Limit";
        this.smsForm.get('no_of_sms').setValue('');
        this.smsForm.get('no_of_sms').disable();
        this.smsForm.get('no_of_sms').updateValueAndValidity();
        break;
      default:

        break;
    }
  }
}