import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
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
import { ConfigService } from '../config.service';

declare const ExcelJS: any;
@Component({
  selector: 'app-whitelist-ip',
  templateUrl: './whitelist-ip.component.html',
  styleUrls: ['./whitelist-ip.component.css']
})
export class WhitelistIpComponent implements OnInit {

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
  selectedValue = '';
  errors = "";
  exportData: any = {};
  defaultPageSize = '10';
  menus: any;
  whiteListIpMenu: any = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private serverService: ServerService,
    private configService: ConfigService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public commonService: CommonService,
    private excelService: ExcelService,
  ) {
    this.filterForm = this.fb.group({
      'by_ip': [""],
      'by_status': [""],
    });

  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.whiteListIpMenu = this.menus.find((o) => o.url == '/config/whitelist-ip');
    //get services
    this.configService.getWhiteListAPI({}).subscribe(data => {
      this.selectedValue = data.response;
    }, err => {
      this.errors = err.message;
    });

    this.serverService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      // { field: 'service', headerName: 'Service', hide: false, width: 15 },
      { field: 'ip', headerName: 'IP', hide: false, width: 20 },
      { field: 'description', headerName: 'Description', hide: false, width: 10 },
      // { field: 'proto', headerName: 'Proto', hide: false, width: 10 },
      { field: 'ip_status', headerName: 'Status', hide: false, width: 20 },

    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.configService.getWhiteListAPI(credentials).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.configService.getWhiteListAPI({}).subscribe(data => {
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
      { header: 'IP', key: 'IP', width: 40 },
      { header: 'Mask', key: 'Mask', width: 10 },
      { header: 'Proto', key: 'Proto', width: 20 },
      { header: 'Status', key: 'Status', width: 10 }
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
      let strStatus = this.exportData[i].status == '1' ? 'Active' : 'Inactive';
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Service: this.exportData[i].service,
        IP: this.exportData[i].ip,
        Mask: this.exportData[i].mask,
        Proto: this.exportData[i].proto,
        Status: strStatus
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
      FileSaver.saveAs(blob, 'white-list-ip');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["IP", "Mask", "Proto", "Status"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status == '1' ? 'Active' : 'Inactive';
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.ip, element.mask, element.proto, strStatus];
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
        // 4: { cellWidth: 'wrap' }
      },
    });
    doc.save('white-list-ip.pdf');
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      if(this.whiteListIpMenu.all_permission == '0' && this.whiteListIpMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.whiteListIpMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (data[i].ip_status == 'Active') {
        data[i].ip_status = "<span style='color:#379457;'><strong>" + data[i].ip_status + "</strong></span>";
        //         finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>\
        // ";
      } else {
        data[i].ip_status = "<span style='color:#c69500;'><strong>" + data[i].ip_status + "</strong></span>";
        //   finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\
        // ";
      }
      if (this.whiteListIpMenu.delete_permission) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
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
        return this.deleteData(data);
      // case "active":
      //   return this.updateStatus(data);
      // case "inactive":
      //   return this.updateStatus(data);
    }
  }

  editData(event) {
    this.openDialog(event);
  }

  deleteData(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Whitelist IP </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> (" + event.ip + ")</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.configService.deleteWhiteListAPI({ 'id': event.id }).subscribe(data => {
          this.toastr.success('Success!', data['message'], { timeOut: 2000 });
          this.toastr.info('Success!', data['server_message'], { timeOut: 4000 });
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
          html: "<span style='color:#FFFFFF;'> Whitelist IP </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> (" + event.ip + ")</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Whitelist IP </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> (" + event.ip + ")</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }

  updateStatus(event) {
    let serverStatus = '';
    let btnmessage = '';
    let action = event.status.match(/Active/g) ? 'Active' : 'Inactive';
    if (action == 'Active') {
      serverStatus = 're-activate';
      btnmessage = "Inactivate";
    } else {
      serverStatus = 'inactivate';
      btnmessage = "Activate";
    }
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: 'You can ' + serverStatus + ' this server in future!',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes,' + btnmessage + ' it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.serverService.updateServerStatus('updateServerStatus', event.id, action).subscribe(data => {
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
          text: 'Server has been ' + btnmessage + 'd.',
          type: 'success',
          background: '#000000'
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: 'Server is safe :)',
          type: 'error',
          background: '#000000',
        });
      }
    });
  }


  openDialog(id?): void {
    const dialogRef = this.dialog.open(ipDialog, { width: '60%', disableClose: true, data: id ? id : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {      
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

export var SERVICE;
@Component({
  selector: 'ip-dialog',
  templateUrl: 'ip-dialog.html',
})

export class ipDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  serverForm: FormGroup;
  checkForm: any;
  selectedValue = '';
  error = "";
  validPort: any = false;
  user_pswd_Div = false;
  validIP: any = false;
  serverData: any = {};
  errorField = '';
  menus: any;
  whiteListIpMenu: any;


  constructor(
    public dialogRef: MatDialogRef<ipDialog>, @Inject(MAT_DIALOG_DATA) public data: ServerDetail,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private serverService: ServerService,
    public commonService: CommonService,
    public configService: ConfigService
  ) {
    this.serverForm = this.fb.group({
      'ip': ['', [Validators.required, Validators.pattern(IP_RegEx), Validators.maxLength(40)]],
      // 'port': ['0', [Validators.required, Validators.maxLength(5), Validators.max(65535)]],
      'description': ['', [Validators.required]],
      'status': [false, [Validators.required]]
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.whiteListIpMenu = this.menus.find((o) => o.url == '/config/whitelist-ip');
  }

  ngOnInit() {

    if(this.whiteListIpMenu.all_permission == '0' && this.whiteListIpMenu.view_permission == '1'){
      this.serverForm.disable();
    }
    //get services
    this.serverService.getServices().subscribe(data => {
      this.selectedValue = data.response;
    }, err => {
      this.errors = err.message;
    });

    if (this.data) {
      // let obj = {};
      // Object.assign(obj,this.data.id,obj)
      let data = this.data;
      let statusValue = data['status'] == '1' ? true : false;
      this.serverForm.patchValue(this.data);
      this.serverForm.get('status').setValue(statusValue)
    }
  }

  get ip() { return this.serverForm.get('ip'); }
  get description() { return this.serverForm.get('description'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.serverForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid; 
  }

  checkValidIP(keyword)    { 
    let mykeyword = this.serverForm.value.ip;
    let splitted = mykeyword.split(".", 4);
    let splittedV6 = mykeyword.split(":", 1);
    if (mykeyword.includes(".")) {
      if (splitted.length < 4) {
        this.toastr.error('Error!', invalidIP, { timeOut: 2000 });
        keyword.target.value = "";
        return;
      } else {
        for (let i = 0; i <= splitted.length; i++) {
          if (splitted[i] > 255) {
            this.toastr.error('Error!', invalidIP, { timeOut: 2000 });
            keyword.target.value = "";
            return;
          }
        }
      }
    } else if (mykeyword.includes(":")) {
      for (let i = 0; i <= splittedV6.length; i++) {
        if (splittedV6[i] == "") {
          this.toastr.error('Error!', invalidIP, { timeOut: 2000 });
          keyword.target.value = "";
          return;
        }
      }
    }
  }

  submitServerForm() {
    this.checkForm = this.findInvalidControls();
    if (this.serverForm.valid) {
      this.submitted = true;
      const credentials = this.serverForm.value;
      if (!credentials.ip.includes(".") && !credentials.ip.includes(":")) { 
        this.toastr.error('Error!', invalidIP, { timeOut: 2000 });
        return;
      }
      credentials.id = this.data ? this.data.id : null;
      this.configService.createWhiteListIp('createWhiteListIp', credentials)
        .subscribe(data => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.toastr.info('Success!', data['server_message'], { timeOut: 4000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', 'IP already exists', { timeOut: 2000 });
          }
        });
    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
  }

  cancelForm() {
    this.serverForm.reset();
    this.serverService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

}