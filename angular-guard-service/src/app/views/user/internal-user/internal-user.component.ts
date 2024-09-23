import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../user.service';
import { InternalUserData, Role } from '../../../core/models';
import Swal from 'sweetalert2';
import { EmailService } from '../../../core/services/email.service';
import { ToastrService } from 'ngx-toastr';
import { emailExist, Errors, ProductService, ExcelService, EMAIL_RegEx, Name_RegEx, Number_RegEx, CommonService, userUpdated, mailSendError, errorMessage, invalidFormError,mailSent } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
// import {  loginservice } from 'src/app/core/services/login.service';
import { refreshBegin } from '@syncfusion/ej2-angular-richtexteditor';
import { UserService as userServicee } from 'src/app/core/services/user.service';
import { PermissionService } from '../../permission/permission.service';

declare const ExcelJS: any;


@Component({
  selector: 'app-internal-user',
  templateUrl: './internal-user.component.html',
  styleUrls: ['./internal-user.component.css']
})
export class InternalUserComponent implements OnInit {
  error = "";
  filterForm: FormGroup;
  emailContentData: any = {};
  customerName: any = {};
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  userType = '';
  exportData: any = {};
  defaultPageSize = '10';
  menus: any;
  role = false;
  status: any = '';
  internaluserViewMenu: any = '';
  public fields: Object = { text: 'name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder: string = 'Select Country';
  // loginService: any;
  constructor(
    private userService: UserService,
    // private loginservice: loginservice,
    private userServicee: userServicee,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog,
    private toastr: ToastrService,
  ) {

    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_mobile': [""],
      'by_email': [""],
      'by_status': [""],
      'by_user_role': [""],
      'by_permission': [""],
    });
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.internaluserViewMenu = this.menus.find((o) => o.url == '/support-user/internaluser/view');
    this.userType = localStorage.getItem('type');
    this.userService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 13 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'company', headerName: 'Company', hide: false, width: 15 },
      { field: 'name', headerName: 'Name', hide: false, width: 15 },
      { field: 'username', headerName: 'Username', hide: false, width: 10 },
      { field: 'permission', headerName: 'Permission Name', hide: false, width: 10 },
      { field: 'email', headerName: 'Email', hide: false, width: 15 },
      { field: 'mobileDisplay', headerName: 'Mobile', hide: false, width: 15 },
      { field: 'user_type', headerName: 'Usertype', hide: false, width: 12 },
      { field: 'status_text', headerName: 'Status', hide: false, width: 10 }      
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.userService.filterInternalUsers(credentials).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.userService.getInternalUser().subscribe(data => {
        this.exportData = data.response;
        data = this.manageUserActionBtn(data.response);
        this.dataSource = [];        
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
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
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Company', key: 'Company', width: 35 },
      { header: 'Name', key: 'Name', width: 25 },
      { header: 'Username', key: 'Username', width: 20 },
      { header: 'Email', key: 'Email', width: 30 },
      { header: 'Mobile', key: 'Mobile', width: 15 },
      { header: 'Usertype', key: 'Usertype', width: 18 },
      { header: 'Status', key: 'Status', width: 25 },
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
      let strStatus = this.exportData[i].status_text;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Company: this.exportData[i].company,
        Name: this.exportData[i].name,
        Username: this.exportData[i].username,
        Email: this.exportData[i].email,
        Mobile: this.exportData[i].mobileDisplay,
        Usertype: this.exportData[i].user_type,
        Status: strStatus1
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
    // worksheet.eachRow(function (row, _rowNumber) {
    //   row.eachCell(function (cell, _colNumber) {
    //       cell.border = {
    //           top: { style: 'thin' ,color:{argb:'000000'}},
    //           left: { style: 'thin',color:{argb:'000000'} },
    //           bottom: { style: 'thin',color:{argb:'000000'} },
    //           right: { style: 'thin',color:{argb:'000000'} }
    //        };
    //     });
    // });
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    // this.excelService.exportAsExcelFile(arr11, 'internalUser');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'user');
    });

  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Company", "Name", "Username", "Email", "Mobile", "Usertype", "Status"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status_text;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.company, element.name, element.username, element.email, element.mobileDisplay, element.user_type, strStatus1];
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
    doc.save('internalUser.pdf');
  }

  manageUserActionBtn(pagedData) {
    
    for (let i = 0; i < pagedData.length; i++) {
      if(pagedData[i].permission_id){
        pagedData[i].permission_type = pagedData[i].permission_id;
        
      }
      let finalBtn = '';
      finalBtn += "<span>";
      if(this.internaluserViewMenu.all_permission == '0' && this.internaluserViewMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.internaluserViewMenu.delete_permission) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      if (this.internaluserViewMenu.modify_permission) {
        finalBtn += "<i class='fa fa-envelope edit-button' style='cursor:pointer; display: inline' data-action-type='send_mail' title='Send Mail'></i>";
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
        if (pagedData[i].status == "1") {
          pagedData[i].status_text = "<span style='color:#379457;'><strong>" + pagedData[i].status_text + "</strong></span>";
          finalBtn += "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login'  title='login'></i>";
          
          finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>";
        } else {
          pagedData[i].status_text = "<span style='color:#c69500;'><strong>" + pagedData[i].status_text + "</strong></span>";
          finalBtn += "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login'  title='login'></i>";
          
          finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'</i>";
        }
      }
      if (pagedData[i].status == "1") {
        pagedData[i].status_text = "<span style='color:#379457;'><strong>" + pagedData[i].status_text + "</strong></span>";
      }else{
        pagedData[i].status_text = "<span style='color:#c69500;'><strong>" + pagedData[i].status_text + "</strong></span>";
      }
        
      
      // if (this.internaluserViewMenu.delete_permission) {
      //   finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      // }

      // finalBtn += "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login'  title='login'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  sendCustomerWelcomeMail(data) {     
    this.userService.getLogo(data.id, localStorage.getItem('type')).subscribe(values => {      
      data['logo_path'] = values['logo_path'][0]['logo_img'];
      if(data.role == '2'){
        data['template'] = 'SubAdminCreation'
      }else{
        data['template'] = 'internalUserCreation'
      }
      this.userService.postUserMail(data).subscribe(datas => {
        if (datas['status'] == 200) {
          this.toastr.success('Success!', mailSent, { timeOut: 2000 });
        } else {
          this.toastr.error('Error!', 'Something went wrong !', { timeOut: 2000 });
        }
      })
    })

  }

  editInternalUser(data) {
    this.openDialog(data.id);
  }

  deleteInternalUser(data, action) {
    if (action == 'delete') {
      // this.userService.isSupportContactAssociateWithGroup(data.id).subscribe(data => {
      //   if (data.length) {
      //     Swal.fire({
      //       title: '<span style="color:#FFFFFF;">Oopss...</span>',
      //       text: "This Contact can't be deleted because it is associate with group.",
      //       type: 'error',
      //       background: '#000000',
      //     });
      //   }else{
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You will not be able to recover account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.userService.deleteInternalUser({ action: action, id: data.id, email: data.email, name: data.name, role: data.role }).subscribe(data => {
            this.displayAllRecord();
          });
        }, allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Deleted!</span>',
            html: "<span style='color:#FFFFFF;'> Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
            type: 'success',
            background: '#000000',
            timer: 3000
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: 'error',
            background: '#000000',
          });
        }
      });
      //   }
      // })
    }
    else if (action == 'inactive') {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You can re-activate user </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'>  in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, inactive it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.userService.deleteInternalUser({ action: action, id: data.id, email: data.email, name: data.name, role: data.role }).subscribe(data => {
            this.displayAllRecord();
          });
        }, allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Inactivated!</span>',
            html: "<span style='color:#FFFFFF;'>User </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> has been inactivated.</span>",
            type: 'success',
            background: '#000000',
            timer: 3000
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'>User </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> is safe</span>",
            type: 'error',
            background: '#000000',
            timer: 3000
          });
        }
      });
    }
    else {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You can inactivate user </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, active it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.userService.deleteInternalUser({ action: action, id: data.id, email: data.email, name: data.name, role: data.role }).subscribe(data => {
            this.displayAllRecord();
          });
        }, allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Activated!</span>',
            html: "<span style='color:#FFFFFF;'>User </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> has been activated.</span>",
            type: 'success',
            background: '#000000',
            timer: 3000
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'>User </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: 'error',
            background: '#000000',
            timer: 3000
          });
        }
      });
    }
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  manageAction(e) {
    let data = e.data;

    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editInternalUser(data);
      case "send_mail":
        return this.sendCustomerWelcomeMail(data);
      case "login":
        return this.loginUser(data)
        // {          
        //   let role = localStorage.getItem('type');          
        //   var permissionID = data.permission_id;                    
        //   var user_id = data.username;
        //   var pass = data.password;
        //   let body = {                        
        //     ip: 'null',
        //     username: user_id ,
        //     password: pass ,
        //     loginType: 'byAdmin',
        //     permission_type: data.permission_id,          
        //     flag: '1',
        //   };
        //   // if(role == '0'){
        //   //   body['flag'] = 1;
        //   // }
        //   // else{
        //   //   body['flag'] = 0;
        //   // }
        //   //signout api                                        
        //   this.userServicee.attemptAuth(body).subscribe(data => {
        //     if (data['code'] == 200) {               
        //       localStorage.setItem('permission_type',permissionID);                            
        //       this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });              
        //       let menuList = JSON.parse(localStorage.getItem('menu'));              
        //       let newV = menuList.find(e => { return e.menuname === 'Dashboard' })                  
        //       this.router.navigateByUrl(newV.url);          
        //       // this.router.navigate(newV.url)    
        //     }
        //     else if(data['code'] == 404){
        //       this.toastr.error('Error!', "Inactive User, can't be Access.", { timeOut: 4000 });
        //     }            
        //   });
        // }        
      case "delete":
        if (data.role == '4') {
          return this.userService.getAssignedUser(data.id).subscribe(result => {
            if (result.response.length > 0) {
              this.toastr.error('Error!', 'Can not delete. This manager is assigned to customer.', { timeOut: 4000 });
              return false;
            } else {
              return this.deleteInternalUser(data, actionType);
            }
          });
        } else if (data.role == '5') {
          return this.userService.isSupportContactAssociateWithGroup(data.id).subscribe(datas => {
            if (datas.length) {
              this.toastr.error('Error!', 'Can not delete. This Support is associate with group.', { timeOut: 4000 });
              return false;
            }
            else {
              return this.deleteInternalUser(data, actionType);
            }
          });
          //return this.deleteInternalUser(data, actionType);
        }

      case "active":
        return this.deleteInternalUser(data, actionType);
      case "inactive":
        return this.deleteInternalUser(data, actionType);
    }
  }

  

  openDialog(id?): void {
    const dialogRef = this.dialog.open(InternalUserDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.key == 'Escape') {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  goToCreate() {
    this.router.navigate(['support-user/internaluser/view/create']);
  }

  loginUser(data){
    let role = localStorage.getItem('type');          
    var permissionID = data.permission_id;                    
    var user_id = data.username;
    var pass = data.password;
    let body = {                        
      ip: 'null',
      username: user_id ,
      password: pass ,
      loginType: 'byAdmin',
      permission_type: data.permission_id,          
      flag: '1',
    };                                      
    this.userServicee.attemptAuth(body).subscribe(data => {                
      if (data['code'] == 200) {            
        this.userServicee.purgeAuth();   
        let ip = localStorage.getItem('ip');
        window.localStorage.clear();
        localStorage.setItem('ip', ip);
        this.dialog.closeAll();
        this.userServicee.setAuth(data);
        localStorage.setItem('permission_type',permissionID);                            
        this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });     
        localStorage.setItem('ByAccount', '1');
        localStorage.setItem('BySupport', '2');
        localStorage.setItem('BySub', '3');
        let menuList = JSON.parse(localStorage.getItem('menu'));              
        let newV = menuList.find(e => { return e.menuname === 'Dashboard' })                
        setTimeout(() => {
          // this.router.navigateByUrl(newV.url);
          //redirect to any page
          window.location.href = newV.url;
        }, 500);                  
      }      
      else if(data['code'] == 404){
        this.toastr.error('Error!', "Inactive User, can't be Access.", { timeOut: 4000 });
      }            
    });
  }


  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoInternalUserDialog, {
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
  selector: 'infoInternalUser-dialog',
  templateUrl: 'infoInternalUser-dialog.html',
})

export class InfoInternalUserDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoInternalUserDialog>, @Inject(MAT_DIALOG_DATA) public data: InternalUserData,
  ) { }

  ngOnInit() {
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
  selector: 'internal-user-dialog',
  templateUrl: 'internal-user-dialog.html',
})

export class InternalUserDialog {
  error = '';
  errors: Errors = { errors: {} };
  userForm: FormGroup;
  customer_id = "";
  userData: any = {};
  billingType = "";
  products = "";
  isPBX = false;
  isOC = false;
  submitted = false;
  checkForm: any;
  countryList = "";
  CountryFilter:any;
  filterCountry:any;
  countryCode = "";
  timeZone = "";
  emailContentData: any = {};
  customerName: any = {};
  userRole = '';
  permissionArr: any;
  PermissionFilter:any;
  filterPermission:any;
  emailId = '';
  currentUser = '';
  permission_name: any;;
  public fields: Object = { text: 'name', value: 'id' };
  public fields6: Object = { text: 'permission_name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder: string = 'Select Country';
  DataBind: any;
  menus: any;
  internaluserViewMenu: any;


  constructor(
    public dialogRef: MatDialogRef<InternalUserDialog>, @Inject(MAT_DIALOG_DATA) public data: InternalUserData,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private productService: ProductService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private emailService: EmailService,
    private permissionService: PermissionService,

  ) {
    this.userForm = this.formBuilder.group({
      'f_name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'l_name': ['', Validators.pattern(Name_RegEx)],
      'email': ['', [Validators.required, Validators.pattern(EMAIL_RegEx)]],
      'username': ['', [Validators.required, Validators.minLength(8)]],
      'mobile': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'company': [''],
      'id': [''],
      'status': [""],
      'country': [""],
      'country_code': [''],
      'permission_type': [''],
    });
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.internaluserViewMenu = this.menus.find((o) => o.url == '/support-user/internaluser/view');
  }

  get f_name() { return this.userForm.get('f_name'); }
  get l_name() { return this.userForm.get('l_name'); }
  get email() { return this.userForm.get('email'); }
  get username() { return this.userForm.get('username'); }
  get mobile() { return this.userForm.get('mobile'); }
  get permission_type() { return this.userForm.get('permission_type'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {

    if(this.internaluserViewMenu.all_permission == '0' && this.internaluserViewMenu.view_permission == '1'){
      this.userForm.disable();
    }
    this.customer_id = this.data.id;
    this.userService.getInternalUserById(this.customer_id).subscribe(data => {
      this.userData = data.response[0];
      setTimeout(() => {
        this.DataBind = this.userData.country_id 
        this.permission_name = this.userData.permission_id;
      }, 1000);  
         
      this.userRole = this.userData.role_id;           //this.userData.role;
      this.emailId = this.userData.email;
      this.currentUser = localStorage.getItem('type');

      this.countryCode = this.userData.country_code;
    }, err => {
      this.error = err.message;
    });

    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filterCountry = this.CountryFilter = this.countryList.slice();
    }, err => {
      this.error = err.message;
    });

    //get time-zones
    this.commonService.getTimezone().subscribe(data => {
      this.timeZone = data.response;
    }, err => {
      this.error = err.message;
    });
    this.permissionService.getPermissionList({ 'id': localStorage.getItem('id') }).subscribe(pagedData => {
      this.permissionArr = pagedData;
      this.filterPermission = this.PermissionFilter = this.permissionArr.slice();
      
    });
  }
  Permissionremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.permissionArr.filter((data) =>{    
      return data['permission_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  

  getCountryCode(event) {
    let country_id = event['itemData'].id;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.userForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitUserForm() {
    this.checkForm = this.findInvalidControls();
    if (this.userForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.userForm.value;
      credentials['user_type'] = this.userRole;
      credentials['billing_type'] = '1';
      credentials['balance'] = '0';
      credentials['credit_limit'] = '0';
      credentials['user_id'] = localStorage.getItem('id');
      credentials['company_address'] = null
      credentials['company_phone'] = null
      credentials['domain'] = null
      credentials['time_zone'] = null
      credentials['gst_number'] = null
      credentials['package_name'] = null;
      credentials['product_name'] = null;

      this.userService.checkEmailValid(credentials).subscribe(data => {
        if (data['id'] != '') {
          this.toastr.error('Error!', emailExist, { timeOut: 4000 });
          this.emailId = "";
          return
        } else {
          this.userService.postUserData(credentials).subscribe(data => {    //mayank
            this.toastr.success('Success!', userUpdated, { timeOut: 2000 });
            this.userService.updateGridList();  ////////for table refresh
            this.dialogRef.close();
          }, err => {
            this.errors = err;
            this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
          });
        }
      });
    } else {
      this.toastr.error('Error!', invalidFormError, { timeOut: 2000 });
    }
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  checkEmail() {
    let credentials = this.userForm.value;
    this.userService.checkEmailValid(credentials).subscribe(data => {
      if (data.id >= 1) {
        this.toastr.error('Error!', emailExist, { timeOut: 4000 })
        this.emailId = "";
      }
    });
  }

}
