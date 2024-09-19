import { Component, Inject, OnInit } from '@angular/core';
import { ConfigService } from '../../config/config.service'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { formError, Errors, CommonService, ExcelService, Name_RegEx } from '../../../core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Page } from '../../../core/models';
import { circle } from 'src/app/core/models/circle.model';
import { ToastrService } from 'ngx-toastr';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { ContactListService } from '../../contact-list/contact-list.service';

@Component({
  selector: 'app-smtp',
  templateUrl: './smtp.component.html',
  styleUrls: ['./smtp.component.css']
})
export class SmtpComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  filterForm: FormGroup;
  filterObj: any = {};
  minDate: Date;
  maxDate: Date;
  bsValue = new Date();
  bsRangeValue: Date[];
  menus: any;
  smtpMenu: any;


  constructor(
    public ConfigService: ConfigService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    private toastr: ToastrService,
    private contactService: ContactListService,
    public dialog: MatDialog
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    // this.minDate.setDate(this.minDate.getDate() );
    this.maxDate.setDate(this.maxDate.getDate());
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      'host': [""],
      'port': [""],
      'name': [""],
      'username': [""],

    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.smtpMenu = this.menus.find((o) => o.url == '/config/smtp');
    this.displayAllRecord();
  }
  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 5 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Service/Name', hide: false, width: 10 },
      // { field: 'service', headerName: 'Service', hide: false, width: 15 },
      { field: 'host', headerName: 'Host', hide: false, width: 10 },
      { field: 'port', headerName: 'Port', hide: false, width: 10 },
      { field: 'username', headerName: 'Username', hide: false, width: 10 },
      { field: 'status', headerName: 'Status', hide: false, width: 10 },
      { field: 'created_at', headerName: 'Create Date', hide: false, width: 10 },
    ];


    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.ConfigService.getSmtpListByFilter(credentials).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.ConfigService.getSmtpList().subscribe(data => {
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
  manageUserActionBtn(pagedData) {

    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      if (this.smtpMenu.all_permission == '0' && this.smtpMenu.view_permission == '1') {
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.smtpMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
        // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
        finalBtn += "</span>";
      }
      if (pagedData[i].status == '0' && this.smtpMenu.modify_permission == '1') {
        pagedData[i].status = "<span style='color:#c69500;'><strong>Inactive</strong></span>";
        // finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\";
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";

      } else if (pagedData[i].status == '0' && this.smtpMenu.modify_permission == '0') {
        pagedData[i].status = "<span style='color:#c69500;'><strong>Inactive</strong></span>";
      } else {

        pagedData[i].status = "<span style='color:#379457;'><strong>Active</strong></span>";
      }
      pagedData[i]['action'] = finalBtn;

    }
    return pagedData;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "delete":
        return this.deleteSmtp(data);
      case "edit":
        return this.editSmtp(data);
    }
  }


  editSmtp(data) {
    this.openDialog(data);
  }

  deleteSmtp(data) {
    let event = data;
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'>You will not be able to recover SMTP </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
        event.name +
        "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.ConfigService.deleteSmtp({ id: event.id }).subscribe(
          (data) => {
            this.displayAllRecord();
          },
          (err) => {
            this.error = err.message;
          }
        );
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html:
            "<span style='color:#FFFFFF;'> SMTP </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            event.name +
            "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: "success",
          background: "#000000",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html:
            "<span style='color:#FFFFFF;'>SMTP </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            event.name +
            "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: "error",
          background: "#000000",
        });
      }
    });
  }

  addSmtp() {
    this.openDialog(null)
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddSMTP, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

}


@Component(
  {
    selector: 'addSmtp-dialog',
    templateUrl: 'addSmtp-dialog.html',
  })

export class AddSMTP {
  smtpForm: FormGroup;
  c_name = "";
  description = "";
  dialoutGroupList = [];
  DialFilter: any;
  filterDial: any;
  editdata: boolean = false;
  hide1 = true;
  disable: boolean = false;
  menus: any;
  smtpMenu: any;

  rules: string[] = [];
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Dialout Group';
  public popupHeight: string = '200px';
  public popupWidth: string = '300px';
  placeholder5 = 'DID as caller id';
  didList = []
  public fields2: Object = { text: 'didDisplay', value: 'id' };
  DIDFilter: any;
  filterDID: any;
  hideRandom = false;
  promise;
  clr_id_as_random: any;


  constructor(
    public dialogRef: MatDialogRef<AddSMTP>, @Inject(MAT_DIALOG_DATA) public data: circle,
    private router: Router,
    private fb: FormBuilder,
    public ConfigService: ConfigService,
    private toastr: ToastrService,
    public commonService: CommonService,
  ) {
    this.smtpForm = this.fb.group({
      'host': [""],
      'port': ["", [Validators.maxLength(5), Validators.max(65535)]],
      'name': [""],
      'username': [""],
      'password': [""],
      'status': [""],

    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.smtpMenu = this.menus.find((o) => o.url == '/config/smtp');
  }

  get host() { return this.smtpForm.get('host'); }
  get port() { return this.smtpForm.get('port'); }
  get name() { return this.smtpForm.get('name'); }
  get username() { return this.smtpForm.get('username'); }
  get password() { return this.smtpForm.get('password'); }
  get status() { return this.smtpForm.get('status'); }


  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    if (this.smtpMenu.all_permission == '0' && this.smtpMenu.view_permission == '1') {
      this.smtpForm.disable();
    }
    if (this.data) {

      this.ConfigService.getSmtpByList(this.data.id).subscribe(data => {
        setTimeout(() => {
          this.smtpForm.get('host').setValue(data.host);
          this.smtpForm.get('port').setValue(data.port);
          this.smtpForm.get('name').setValue(data.name);
          this.smtpForm.get('username').setValue(data.username);
          this.smtpForm.get('password').setValue(data.password);
          this.smtpForm.get('status').setValue(data.status == '1' ? true : false);
        }, 500);
        this.disable = data.status == '1' ? true : false;
      })

    }
  }


  submitSmtpForm() {
    if (this.smtpForm.valid) {
      let credentials = this.smtpForm.value;
      credentials.port = Number(this.smtpForm.value.port);
      if (this.data) {
        credentials['id'] = this.data.id;
        credentials['cust_id'] = localStorage.getItem('id');        
        this.ConfigService.updateSmtp(credentials).subscribe(data => {
          if (data.status_code == 200) {
            this.toastr.success('Success!', "SMTP Updated Successfully.", { timeOut: 2000 });
            this.dialogRef.close();
            this.ConfigService.updateGridList();
          } else if (data.status_code == 409) {
            this.toastr.error('Error!', data.message, { timeOut: 4000 });
          } else {
            this.toastr.error('Error!', "Something wrong happened.", { timeOut: 4000 });
          }
        })
      } else {
        credentials['cust_id'] = localStorage.getItem('id');
        this.ConfigService.addSmtp(credentials).subscribe(data => {

          if (data.status_code == 200) {
            this.toastr.success('Success!', "SMTP Created Successfully.", { timeOut: 2000 });
            this.dialogRef.close();
            this.ConfigService.updateGridList();
          } else if (data.status_code == 409) {
            this.toastr.error('Error!', data.message, { timeOut: 4000 });
          } else {
            this.toastr.error('Error!', "Something wrong happened.", { timeOut: 4000 });
          }
        })
      }
    }


  }

  myFunction() {
    let x = document.getElementById("password");
    const type = x.getAttribute("type") === "password" ? "text" : "password";
    x.setAttribute("type", type);

  }
  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  cancelForm() {
    this.smtpForm.reset();
    this.ConfigService.updateGridList();
    this.dialogRef.close();
  }

  groupremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.didList.filter((data) => {
      return data['didDisplay'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

}


