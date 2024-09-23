import { Component, OnInit, Inject } from '@angular/core';
import { ResellerService } from './reseller.service';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService, emailExist, EMAIL_RegEx, errorMessage,amountZero, Errors,Percentage_RegEx,Percentage_RegEx2, invalidFormError, Name_RegEx, Number_RegEx, userUpdated ,GST_RegEx} from 'src/app/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EmailService } from 'src/app/core/services/email.service';
import { UserService as userServicee } from 'src/app/core/services/user.service';
import Swal from 'sweetalert2';
import { UserService } from '../user/user.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
import { PermissionService} from '../permission/permission.service';
import { MatSelectChange } from '@angular/material/select';
import { PermissionDetail } from 'src/app/core';
import { stringify } from '@angular/compiler/src/util';
import { DateAdapter } from '@angular/material';


export interface ResellerData {
  id: string,
  balance: number,
  first_name: string;
}


declare const ExcelJS: any;
@Component({
  selector: 'app-reseller',
  templateUrl: './reseller.component.html',
  styleUrls: ['./reseller.component.css']
})
export class ResellerComponent implements OnInit {
  filterForm: FormGroup;
  type = '3';
  columnDefs: { field: string; headerName: string; hide: boolean; width: number; }[];
  isFilter: any;
  filterObj: any;
  SupportUserService: any;
  exportData: any;
  dataSource: any[];
  error: any;
  // userService: any;
  internaluserViewMenu: any;
  menus: any;
  userType: string; 
  defaultPageSize = '10';
  rowData: any; 
  selectedProduct: string = '1';
  selectedValue:any
  constructor(
    private resellerService :ResellerService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private userService: userServicee,
    public commonService: CommonService,
    private userServices: UserService,
    private toastr: ToastrService,
    private permissionService : PermissionService,
  ) { 
    this.filterForm = this.fb.group({
      'by_name': [""],
      'permission_name': [""],
      'by_mobile': [""],
      'by_email': [""],
      'by_user_role': [""],
      'by_status': [""],
    });
  }

  ngOnInit() {
    this.SelectProduct(this.selectedProduct);
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.internaluserViewMenu = this.menus.find((o) => o.url == '/reseller');
    this.userType = localStorage.getItem('type');
    this.resellerService.displayAllRecord.subscribe(() => {      
      this.displayAllRecord();
    });
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  SelectProduct(event){
    this.selectedValue = event.value;
this.resellerService.getReseller(this.selectedProduct).subscribe(data => {  
  this.exportData = data;                
  data = this.manageUserActionBtn(data);
  this.dataSource = [];
  this.dataSource.push({ 'fields': this.columnDefs, 'data': data });        
})    

  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 12 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 15 },
      { field: 'username', headerName: 'Username', hide: false, width: 10 },
      { field: 'email', headerName: 'Email', hide: false, width: 15 },
      { field: 'mobile', headerName: 'Mobile', hide: false, width: 15 },
      { field: 'permission_name', headerName: 'Permission Name', hide: false, width: 12 },
      { field: 'company_address', headerName: 'Address', hide: false, width: 10},
      { field: 'status_text', headerName: 'Status', hide: false, width: 10 }
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.resellerService.filterReseller(credentials,this.selectedProduct).subscribe(data => {        
        this.exportData = data;                
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data }); 
        
      })  
    } else {  
        
      this.resellerService.getReseller(this.selectedProduct).subscribe(data => {  
        this.exportData = data;                
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });        
      })      
    }
  }    

  manageUserActionBtn(pagedData) {
    
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";      
      if(this.internaluserViewMenu.all_permission == '0' && this.internaluserViewMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.internaluserViewMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
        finalBtn += "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login'  title='login'></i>";
        // if (this.internaluserViewMenu.delete_permission) {
          //   finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
          // }
          if (pagedData[i].status == "1") {
            pagedData[i].status_text = "<span style='color:#379457;'><strong>" + pagedData[i].status_text + "</strong></span>";
            finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>";
          } else if(pagedData[i].status == '0') {
            pagedData[i].status_text = "<span style='color:#c69500;'><strong>" + pagedData[i].status_text + "</strong></span>";
            finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'</i>";
          }
          else if (pagedData[i].status == '3') {
            pagedData[i].status_text = "<span style='color:#f5302e;'><strong>" + pagedData[i].status_text + "</strong></span>";
          }
          else {
            pagedData[i].status_text = "<span style='color:#000000;'><strong>" + pagedData[i].status_text + "</strong></span>";
          }
          if (pagedData[i].reseller_type_id == '1') {
            finalBtn += "<i class='fa fa-inr add-balance-button' style='cursor:pointer; display: inline' data-action-type='add-balance' title='Manage Balance'></i>";
          }
        }            

      finalBtn += "<i class='fa fa-list list-button' style='cursor:pointer; display: inline' data-action-type='viewPermission' title='View Permission'></i>";

      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  editInternalUser(data) {    
    this.openDialog(data);
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "add-balance":
        return this.addBalance(data);
      case "edit":
        return this.editInternalUser(data.id);
      case "login":
        {
          var user_id = data.username;
          var pass = data.password;     
          
          let body = {
            ip: 'null',
            username: user_id,
            password: pass,
            loginType: 'byAdmin',
            flag: '1',
            permission_type : data.permission_id
          };
          this.userService.attemptAuth(body).subscribe(data => {   
            if (data['code'] == 200) {
              this.userService.purgeAuth();
              let ip = localStorage.getItem('ip');
              window.localStorage.clear();
              localStorage.setItem('ip', ip);
              this.dialog.closeAll();
              this.userService.setAuth(data);
              this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });
              localStorage.setItem('ByReseller', '3');
              let menuList = JSON.parse(localStorage.getItem('menu'));
              let newV = menuList.find(e =>
                 { return e.menuname === 'Dashboard' } 
                 )
              setTimeout(() => {
                // this.router.navigateByUrl(newV.url);
                //redirect to any page
                window.location.href = newV.url;
              }, 500);
            }
          })          
          break;
        }
      case "delete":
        if(data.role_id == '3') {          
          return this.deleteInternalUser(data, actionType);          
        }
      case "active":
        return this.deleteInternalUser(data, actionType);
      case "inactive":
        return this.deleteInternalUser(data, actionType);
      case "viewPermission":
        return this.viewPermission(data);
    }
  }
  addBalance(data) {
    this.openDialogAddBalance(data.id, data.balance, data.first_name);
  }

  viewPermission(data){
      this.viewPermissionDialog(data.id);
  }

  deleteInternalUser(data, action) {        
    if (action == 'delete') {     
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You will not be able to recover account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {           
          this.resellerService.deleteInternalUser({ action: action, id: data.id, email: data.email, name: data.name, role: data.role_id }).subscribe(data => {            
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
          this.resellerService.deleteInternalUser({ action: action, id: data.id, email: data.email, name: data.name, role: data.role }).subscribe(data => {
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
          this.resellerService.deleteInternalUser({ action: action, id: data.id, email: data.email, name: data.name, role: data.role }).subscribe(data => {
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
  

  openDialog(id?): void {    
    const dialogRef = this.dialog.open(ResellerDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {      
      if (e.key == 'Escape') {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {      
    });
  }

  viewPermissionDialog(id?): void {
    const dialogRef = this.dialog.open(permissionDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {      
      if (e.key == 'Escape') {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {      
    });
  }
  openDialogAddBalance(id, balance, first_name): void {
    const dialogRefBalance = this.dialog.open(AddResellerBalanceDialog, { width: '60%', disableClose: true, data: { id: id, balance: balance, first_name: first_name } });
    dialogRefBalance.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefBalance.close('Dialog closed');
      }
    });
    dialogRefBalance.afterClosed().subscribe(result => {
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
  goToAdd(){
    this.router.navigate(['support-user/internaluser/view/create'], { queryParams: {type: this.type}});
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoInternalUserDialog, {
      width: '80%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '0' ? localStorage.getItem('id') : 0,
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

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Name", "Username", "Email", "Mobile","Permission Name", "Usertype", "Company Address", "Status"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status_text;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.name, element.username, element.email, element.mobile,element.permission_name, element.user_type, element.company_address, strStatus1];
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
    doc.save('reseller.pdf');
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
      { header: 'Name', key: 'Name', width: 25 },
      { header: 'Username', key: 'Username', width: 20 },
      { header: 'Email', key: 'Email', width: 30 },
      { header: 'Mobile', key: 'Mobile', width: 15 },
      { header: 'Permission Name', key: 'Permission Name', width: 15 },
      { header: 'Usertype', key: 'Usertype', width: 18 },
      { header: 'Address', key: 'Address', width: 35 },
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
        Name: this.exportData[i].name,
        Username: this.exportData[i].username,
        Email: this.exportData[i].email,
        Mobile: this.exportData[i].mobile,
        // Permission_Name: this.exportData[i].permission_name,
        Usertype: this.exportData[i].user_type,
        Address: this.exportData[i].company_address,
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
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));    
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'reseller');
    });

  }

}


@Component({
  selector: 'addResellerBalance-dialog',
  templateUrl: './addResellerbalance-dialog.html',
})

export class AddResellerBalanceDialog {
  addResellerBalanceForm: FormGroup;
  // minDate: Date;
  submitted = false;
  checkForm = '';
  lastBalance: any = 0;
  today: Date;
  maxDate: Date;
  minDate: Date;
  ResellerName: string = "";
  customer_id:any

  constructor(
    private router: Router,
    public dialogRefBalance: MatDialogRef<AddResellerBalanceDialog>, @Inject(MAT_DIALOG_DATA) public data: ResellerData,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    private toastr: ToastrService,
    private userService: UserService,
    private resellerService : ResellerService,
    private dateAdapter: DateAdapter<Date>
  ) {
    // this.minDate = new Date();
    this.today = new Date();
    this.minDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.maxDate = this.today //new Date(this.today.getFullYear(), this.today.getMonth(), 25);

    this.addResellerBalanceForm = this.formBuilder.group({
      'payment_date': ['', Validators.required],
      'old_amount': [''],
      'amount': [0, [Validators.required, Validators.maxLength(7), Validators.minLength(1), Validators.pattern('^[+-]?([0-9]*[.])?[0-9]+$')]],
      'description': [''],
      'agent_commission': [''],
      'payment_type': ['1', Validators.required],
      'company_name': ['']
    });
    // this.menus = JSON.parse(localStorage.getItem('menu'));
    // this.customerMenu = this.menus.find((o) => o.url == '/user/view');
    this.dateAdapter.setLocale('en-GB');
  }

  get payment_date() { return this.addResellerBalanceForm.get('payment_date'); }
  get amount() { return this.addResellerBalanceForm.get('amount'); }
  get payment_type() { return this.addResellerBalanceForm.get('payment_type'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.addResellerBalanceForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  ngOnInit() {
    this.customer_id = this.data.id;  
    this.resellerService.getResellerRupeeID(this.customer_id).subscribe(data => {
      this.lastBalance = parseFloat(data[0].balance).toFixed(2);
      this.ResellerName = data[0].first_name;
     })
  }


  submitAddBalanceForm() {
    if (this.addResellerBalanceForm.valid) {
      this.submitted = true;
      const credentials = this.addResellerBalanceForm.value;
      credentials.customer_id = this.data.id ? this.data.id : null;
      credentials.id = null;
      let checkAmount = -1 * credentials.amount;
      if (credentials.amount == 0) {
        this.toastr.error('Error!', amountZero, { timeOut: 2000 });
        return;
      }

      // if(checkAmount > this.data.balance){
      //   this.toastr.error('Error!', amountIssue +' '+ this.data.balance, { timeOut: 2000 });
      //   return;
      // }  after discussion with virendra sir
      if (credentials.payment_type == '2') { //  just for send only negative value during payment type is correction.
        credentials.amount = credentials.amount * -1;
      }
      this.userService.createAddResellerBalance(credentials).subscribe(data => {
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
    this.addResellerBalanceForm.reset();
    this.userService.updateGridList();
  }

  public setBlankAmount(item) {
    this.addResellerBalanceForm.get('amount').setValue(0);
    this.addResellerBalanceForm.get('amount').clearValidators();
    this.addResellerBalanceForm.get('amount').updateValueAndValidity();
    //  if(item.value == '2'){
    //   this.addBalanceForm.get('amount').setValidators(Validators.pattern('^[+-]?([0-9]*[.])?[0-9]+$'));
    //   this.addBalanceForm.get('amount').updateValueAndValidity();
    //  }

  }
}



@Component({
  selector: 'InfoReseller-dialog',
  templateUrl: 'inforeseller-dialog.html',
})

export class InfoInternalUserDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoInternalUserDialog>, @Inject(MAT_DIALOG_DATA) public data:any,
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
  selector: 'reseller-dialog',
  templateUrl: 'reseller-dialog.html',
})

export class ResellerDialog {
  error = '';
  errors: Errors = { errors: {} };
  userForm: FormGroup;
  customer_id : any;
  userData: any;
  OCuserData: any = {};
  PBXuserData: any = {};
  PBX_reseller_type:any;
  OC_reseller_type:any;
  OCproduct_id:any;
  PBXproduct_id:any;
  billingType = "";
  products = [];
  managerArr = [];
  AccountManager:any;
  AccountFilter:any;
  isPBX = false;
  isOC = false;
  submitted = false;
  OCreadonly = false;
  PBXreadonly = false;
  checkForm: any;
  internalUser = "";
  countryList = "";
  filterCountry:any;
  countryCode = "";
  timeZone = "";
  permissionArr:any;
  emailContentData: any = {};
  customerName: any = {};
  userRole = '';
  permissionData:any;
  emailId = '';
  currentUser = '';
  selectedProduct = '';
  address = '';  
  Permmission = false
  prepaid = false;
  Commission = false;
  isBalanceDisabled: boolean = true;
  active_products: any = [];
  OCprepaid = false;
  OCCommission = false;
  EnablePermission : any;
  EnableOCPermission : any;
  is_notification:any;
  accountData:any;
  menus:any;
  PBXcommsion:any;
  internaluserViewMenu:any;
  isPatternMatched: boolean = false;
  isPatternMatchedd: boolean = false;
  isPatternMatcheddd: boolean = false;
  public fields: Object = { text: 'permission_name', value: 'id' };
  public fields1: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Choose Permission';
  public placeholder1: string = 'Account Manager';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  constructor(
    public dialogRef: MatDialogRef<ResellerDialog>, @Inject(MAT_DIALOG_DATA) public data: ResellerDialog,
    private formBuilder: FormBuilder,
    private router: Router,    
    private route: ActivatedRoute,        
    private toastr: ToastrService,
    public commonService: CommonService,
    private emailService: EmailService,
    public resellerService :ResellerService,
    private userService: UserService,
    private permissionService: PermissionService,

  ) {
    this.userForm = this.formBuilder.group({      
      'f_name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'l_name': ['', Validators.pattern(Name_RegEx)],
      'email': ['', [Validators.required, Validators.pattern(EMAIL_RegEx)]],
      'username': ['', [Validators.required, Validators.minLength(8)]],
      'mobile': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'company_address': [''],      
      'id': [''],
      'status': [""],
      'country': [""],
      'country_code': [''],
      'reseller_type' : [''],
      'ocreseller_type' : [''],
      'ocbalance': ['0'], 
      'commission': ['0',Validators.pattern(Percentage_RegEx)],
      'occommission': ['0',Validators.pattern(Percentage_RegEx)],
      'is_notification_email': [0],
      'notification_email': [''],


      'pbx_package_name': [""],
      'oc_package_name': [""],
 
      'company': [''],
      'company_phone': [''],
      'user_type': [""],
      'domain': [''],
      'account_manager': [""],
      'states': [179],
      'time_zone': [49],
      'billing_type': ["1"],
      'balance': ['0'],
      'credit_limit': ['0'],
      'gst_number': [''],
      'permission_type': [''],
      'address' : [''],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.internaluserViewMenu = this.menus.find((o) => o.url == '/reseller');
  }

  get f_name() { return this.userForm.get('f_name'); }
  get l_name() { return this.userForm.get('l_name'); }
  get email() { return this.userForm.get('email'); }
  get username() { return this.userForm.get('username'); }
  get mobile() { return this.userForm.get('mobile'); }
  get balance() { return this.userForm.get('balance'); }
  get commission() { return this.userForm.get('commission'); }
  get ocbalance() { return this.userForm.get('ocbalance'); }
  get occommission() { return this.userForm.get('occommission'); }
  get notification_email() { return this.userForm.get('notification_email'); }
  get is_notification_email() { return this.userForm.get('is_notification_email'); }
  get reseller_type() { return this.userForm.get('reseller_type'); }
  get ocreseller_type() { return this.userForm.get('ocreseller_type'); }
  get permission_type() { return this.userForm.get('permission_type'); }
  static ssss :any;
  checkPattern(event) {
    let value = event.target.value;
    const pattern = /^(?!0\d)(?:[1-9]\d{0,5}|0)?(?:\.\d{1,2})?$|^0\.\d{1,2}$/;
    // const pattern = /^(?:[1-9]\d{0,5}|0)(?:\.\d{1,2})?$|^0$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if(this.isPatternMatchedd  == false){
      let res= value.substr(value.length - 1);
      let array = value.split(".");
      if(res!=".") 
        {
          if(array[0].length>6)
          { 
            let result= array[0].substring(0,6)
            this.userForm.controls.balance.setValue(result);
          }
          else
          {
            let res=value.includes(".");
            if(res && array[1].length>2) 
            {
               let valu=array[0]+"."+ array[1].substring(0,2)
               this.userForm.controls.balance.setValue(valu);
            }
            else{
              let Res= value.substring(0, value.length - 1);
            this.userForm.controls.balance.setValue(Res);
            }
          }
          ResellerDialog.ssss = value
        }
        else{
          if(array[0].length<6)
      { 
        this.userForm.controls.balance.setValue(value);
      }
          
        }
      //this.userForm.get('credit_limit').reset();
    }
    else{
      if (value) 
    {
      let res=value.includes(".");
      if(res== false && ResellerDialog.ssss)
      {
        let Res=ResellerDialog.ssss.includes(".");
        if(Res)
        {
          let array = ResellerDialog.ssss.split(".");
          this.userForm.controls.balance.setValue(array[0]);
          value=array[0];
        }
      }
      ResellerDialog.ssss = value
      // strValue was non-empty string, true, 42, Infinity, [], ...
     }
    }
   
  }
  checkbalance(event) {
    let value = event.target.value;
    const pattern = /^(?!0\d)(?:[1-9]\d{0,5}|0)?(?:\.\d{1,2})?$|^0\.\d{1,2}$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if(this.isPatternMatchedd  == false){
      let res= value.substr(value.length - 1);
      let array = value.split(".");
      if(res!=".") 
        {
          if(array[0].length>6)
          { 
            let result= array[0].substring(0,6)
            this.userForm.controls.balance.setValue(result);
          }
          else
          {
            let res=value.includes(".");
            if(res && array[1].length>2) 
            {
               let valu=array[0]+"."+ array[1].substring(0,2)
               this.userForm.controls.balance.setValue(valu);
            }
            else{
              let Res= value.substring(0, value.length - 1);
            this.userForm.controls.balance.setValue(Res);
            }
          }
          ResellerDialog.ssss = value
        }
        else{
          if(array[0].length<6)
      { 
        this.userForm.controls.balance.setValue(value);
      }
          
        }
      //this.userForm.get('credit_limit').reset();
    }
    else{
      if (value) 
    {
      let res=value.includes(".");
      if(res== false && ResellerDialog.ssss)
      {
        let Res=ResellerDialog.ssss.includes(".");
        if(Res)
        {
          let array = ResellerDialog.ssss.split(".");
          this.userForm.controls.balance.setValue(array[0]);
          value=array[0];
        }
      }
      ResellerDialog.ssss = value
      // strValue was non-empty string, true, 42, Infinity, [], ...
     }
    }
   
  }
  checkocbalance(event) {
    let value = event.target.value;
    const pattern = /^(?!0\d)(?:[1-9]\d{0,5}|0)?(?:\.\d{1,2})?$|^0\.\d{1,2}$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if(this.isPatternMatchedd  == false){
      let res= value.substr(value.length - 1);
      let array = value.split(".");
      if(res!=".") 
        {
          if(array[0].length>6)
          { 
            let result= array[0].substring(0,6)
            this.userForm.controls.ocbalance.setValue(result);
          }
          else
          {
            let res=value.includes(".");
            if(res && array[1].length>2) 
            {
               let valu=array[0]+"."+ array[1].substring(0,2)
               this.userForm.controls.ocbalance.setValue(valu);
            }
            else{
              let Res= value.substring(0, value.length - 1);
            this.userForm.controls.ocbalance.setValue(Res);
            }
          }
          ResellerDialog.ssss = value
        }
        else{
          if(array[0].length<6)
      { 
        this.userForm.controls.ocbalance.setValue(value);
      }
          
        }
      //this.userForm.get('credit_limit').reset();
    }
    else{
      if (value) 
    {
      let res=value.includes(".");
      if(res== false && ResellerDialog.ssss)
      {
        let Res=ResellerDialog.ssss.includes(".");
        if(Res)
        {
          let array = ResellerDialog.ssss.split(".");
          this.userForm.controls.ocbalance.setValue(array[0]);
          value=array[0];
        }
      }
      ResellerDialog.ssss = value
      // strValue was non-empty string, true, 42, Infinity, [], ...
     }
    }
   
  }

  checkValidation(event){     
    if(event.target.value[0] == '.'){            
      this.userForm.get('commission').setValue('0'+event.target.value)
    }
    if(/^0\d/.test(event.target.value)){      
      this.userForm.get('commission').setValue(event.target.value.replace(/^0+/,""))
    }    
  }

  checkOcValidation(event){     
    if(event.target.value[0] == '.'){            
      this.userForm.get('occommission').setValue('0'+event.target.value)
    }
    if(/^0\d/.test(event.target.value)){      
      this.userForm.get('occommission').setValue(event.target.value.replace(/^0+/,""))
    }    
  }
  
  checkbalanceoc(event) {
    let value = event.target.value;
    const pattern = /^(?!0\d)(?:[1-9]\d{0,5}|0)?(?:\.\d{1,2})?$|^0\.\d{1,2}$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if(this.isPatternMatchedd  == false){
      let res= value.substr(value.length - 1);
      let array = value.split(".");
      if(res!=".") 
        {
          if(array[0].length>6)
          { 
            let result= array[0].substring(0,6)
            this.userForm.controls.ocbalance.setValue(result);
          }
          else
          {
            let res=value.includes(".");
            if(res && array[1].length>2) 
            {
               let valu=array[0]+"."+ array[1].substring(0,2)
               this.userForm.controls.ocbalance.setValue(valu);
            }
            else{
              let Res= value.substring(0, value.length - 1);
            this.userForm.controls.ocbalance.setValue(Res);
            }
          }
          ResellerDialog.ssss = value
        }
        else{
          if(array[0].length<6)
      { 
        this.userForm.controls.ocbalance.setValue(value);
      }
          
        }
      //this.userForm.get('credit_limit').reset();
    }
    else{
      if (value) 
    {
      let res=value.includes(".");
      if(res== false && ResellerDialog.ssss)
      {
        let Res=ResellerDialog.ssss.includes(".");
        if(Res)
        {
          let array = ResellerDialog.ssss.split(".");
          this.userForm.controls.ocbalance.setValue(array[0]);
          value=array[0];
        }
      }
      ResellerDialog.ssss = value
      // strValue was non-empty string, true, 42, Infinity, [], ...
     }
    }
   
  }

  updateNotificationEmail(value: boolean): void {
    if (this.PBXuserData.is_notification_email !== undefined) {
        this.PBXuserData.is_notification_email = value;
    } else {
        this.OCuserData.is_notification_email = value;
    }
}

  public changeNotificationEmail(event) {
    let isEmail = event.checked;
    if (isEmail == true) {
      // this.buttonDisabled = true;
      this.userForm.controls.notification_email.setValidators([Validators.pattern(EMAIL_RegEx), Validators.required]);
      this.userForm.controls.notification_email.updateValueAndValidity();
    } else {
      this.userForm.controls.notification_email.clearValidators();
      this.userForm.controls.notification_email.setValue('');
      this.userForm.controls.notification_email.updateValueAndValidity();
    }
  }

  ngOnInit() { 

    if(this.internaluserViewMenu.all_permission == '0' && this.internaluserViewMenu.view_permission == '1'){
      this.userForm.disable();
    }
 
    this.userService.getInternalUser().subscribe(data => {
      this.internalUser = data.response;
      const managers = []
      for (let i = 0; i < this.internalUser.length; i++) {
        if (this.internalUser[i]['role'] == '4') {
          // this.managerArr.push(this.internalUser[i])
          managers.push({ id: this.internalUser[i]['id'], name: this.internalUser[i]['first_name'] + ' ' + this.internalUser[i]['last_name'] })

        }
      }
      this.managerArr = managers
    }, err => {
      this.error = err.message;
    });
    this.permissionService.getProductInfo().subscribe(data => {
      this.selectedProduct = data.response;            
    });
     
    this.customer_id = this.data;  
    this.resellerService.getResellerID(this.customer_id['id']).subscribe(data => {                
      setTimeout(() => {
        // this.userData = data[0].out_detail ? data[0].out_detail : data[0].pbx_detail;
        if(!data[0].out_detail){
        this.userData = data[0].pbx_detail;
        }
        else if(!data[0].pbx_detail){
          this.userData = data[0].out_detail;
          }
          else{
             this.userData = data[0].out_detail;
          }
        // this.userData = data[0].out_detail;
        this.OCuserData = data[0].out_detail;
        this.PBXuserData = data[0].pbx_detail;
      // this.userData.push(this.OCuserData,this.PBXuserData);
      this.permissionService.getResellerPermission({ 'id': localStorage.getItem('id') }).subscribe(pagedData => {
        this.permissionArr = pagedData;
        if(this.PBXuserData == undefined){
            this.userForm.get('permission_type').setValue(this.permissionArr[0]['id']) ;
        }
      }); 
      if(data[0].out_detail){
        this.OCreadonly = true;
        this.userForm.get('ocbalance').setValue(parseFloat(this.OCuserData.Rbalance).toFixed(2))
        this.userForm.get('occommission').setValue(this.OCuserData.commission_per)
        this.OC_reseller_type = (data[0].out_detail.reseller_type_id)
        this.userForm.get('notification_email').setValue(this.OCuserData.notification_email);
        this.is_notification = parseInt(this.OCuserData.is_email_notification);
        this.accountData = this.OCuserData.account_manager_id;
      }
      if(data[0].pbx_detail){
        this.userForm.get('permission_type').setValue(this.PBXuserData.permission_id);
        this.PBXreadonly = true;
        this.PBX_reseller_type = (data[0].pbx_detail.reseller_type_id)
        this.userForm.get('balance').setValue(parseFloat(this.PBXuserData.Rbalance).toFixed(2))
        this.userForm.get('commission').setValue(this.PBXuserData.commission_per)
       this.PBXcommsion = this.PBXuserData.commission_per == '0.00';
        this.userForm.get('notification_email').setValue(this.PBXuserData.notification_email); 
        this.is_notification = parseInt(this.PBXuserData.is_email_notification);
        this.accountData = this.PBXuserData.account_manager_id;
    
      }
      
      if (this.PBX_reseller_type == 1 || this.PBX_reseller_type == '1') {
                this.prepaid = true;
                this.Commission = false;
      }
      else if(this.PBX_reseller_type == 2 || this.PBX_reseller_type == 3){
          this.Commission = true;
          this.prepaid = false;
      }
   
      if (this.OC_reseller_type == 1 || this.OC_reseller_type == '1') {
      this.userForm.get('ocbalance').setValue(parseFloat(this.OCuserData.Rbalance).toFixed(2))

        this.OCCommission = false;
        this.OCprepaid = true;

        }
        else if(this.OC_reseller_type == 2 || this.OC_reseller_type == 3){
      this.userForm.get('ocbalance').setValue(parseFloat(this.OCuserData.Rbalance).toFixed(2))

          this.OCprepaid = false;
        this.OCCommission = true;

        }

      // this.userForm.get('reseller_type').setValue(JSON.stringify(data[0].pbx_detail.reseller_type_id));
     
      if(data[0].pbx_detail){
      this.PBXproduct_id = data[0].pbx_detail.product_id;
      }
      if(data[0].out_detail){
         this.OCproduct_id = data[0].out_detail.product_id;
        }
;
      if(!data[0].out_detail){
        this.active_products.push(data[0].pbx_detail.product_id);
      }
      else if(!data[0].pbx_detail){
        this.active_products.push(data[0].out_detail.product_id);
        }
        else{
      this.active_products.push(data[0].out_detail.product_id, data[0].pbx_detail.product_id);
        }



      // this.active_products.push(data[0].out_detail.product_id, data[0].pbx_detail.product_id);
      this.permissionService.getProductInfo().subscribe(data => {
        this.products = data.response;
        for (var i = 0; i < this.products.length; i++) {
          // var n = this.products[i].includes(this.active_products[i]);
          if (this.active_products[i] == '1') {
            this.products[0]['active'] = true;
            this.EnablePermission = true;
          }
          if (this.active_products[i] == '2') {
            this.products[1]['active'] = true;
            this.EnableOCPermission = true;
          }
        }
      });            
      
      // this.userDataa = data[1];
      
      
      // setTimeout(() => {
        //   this.permissionData = this.userData.out_detail.permission_id;  
        // }, 500);
        


        if(!data[0].out_detail){
          this.userRole = data[0].pbx_detail.role_id;
        }
        else if(!data[0].pbx_detail){
          this.userRole = data[0].out_detail.role_id;
          }
          else{
            this.userRole = data[0].out_detail.role_id;

          }


        // this.userRole = data[0].out_detail.role_id;
      this.countryCode = this.userData.country_code;            
      }, 500);
      
      // this.emailId = this.userData.email;
      // this.countryCode = this.userData.country_code;            
    })
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filterCountry = this.countryList.slice();
    }, err => {
      this.error = err.message;
    });   
   
  }
  commissionn: string = "";

  // handleCommissionInput(){
  //   if (this.PBXuserData.commission_per == true) {
  //   this.PBXuserData.commission_per.replace(/^0+/, '');
  //   }
  // }
  // handleCommissionInput() {  
  //   let commissionValue = this.userForm.get('commission').value.replace(/^0+/, '');
  //   this.userForm.get('commission').setValue(commissionValue);
  // }
  Managerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.managerArr.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  showResellerType(type){
    // this.buttonDisabled = true;
    let SelectValue = type.value
    if(SelectValue == '1'){
      this.prepaid = true;
      this.Commission = false;
      // this.userForm.controls.balance.setValidators([]);
      // this.userForm.controls.balance.updateValueAndValidity();
      this.userForm.controls.commission.clearValidators();
      this.userForm.controls.commission.setValue(0);
      this.userForm.controls.commission.updateValueAndValidity();
   
    }
    else if(SelectValue == '2' || SelectValue == '3'){
      this.prepaid = false;
      this.Commission = true;
      // this.userForm.controls.commission.setValidators([Validators.required,Validators.pattern(Percentage_RegEx2)]);
      // this.userForm.controls.commission.updateValueAndValidity(); 
      this.userForm.controls.commission.setValue(0);
      // this.userForm.controls.commission.updateValueAndValidity();
      // this.userForm.controls.balance.clearValidators();
      // this.userForm.controls.balance.setValue('');
      // this.userForm.controls.balance.updateValueAndValidity();
    }
    // else{
    //   this.prepaid = false;
  
    // }
    
  }

  checkcommission(event){
    if (event.target.value[0] == '.') {
      this.userForm.controls.commission.setValidators([Validators.required,Validators.pattern(Percentage_RegEx2)]);
      this.userForm.controls.commission.updateValueAndValidity();  
        }
        else{
          this.userForm.controls.commission.setValidators([Validators.required,Validators.pattern(Percentage_RegEx)]);
          this.userForm.controls.commission.updateValueAndValidity();  
        }
  }
  showResellerOCType(type){
    // this.buttonDisabled = true;    
    let SelectValue = type.value
    if(SelectValue == '1'){
      this.OCprepaid = true;
      this.OCCommission = false;
      // this.userForm.controls.ocbalance.setValidators([]);
      // this.userForm.controls.ocbalance.updateValueAndValidity();
      this.userForm.controls.occommission.clearValidators();
      this.userForm.controls.occommission.setValue(0);
      this.userForm.controls.occommission.updateValueAndValidity();
  
    }
    else if(SelectValue == '2' || SelectValue == '3'){
      this.OCprepaid = false;
      this.OCCommission = true;
      // this.userForm.controls.occommission.setValidators([Validators.required,Validators.pattern(Percentage_RegEx)]);
      // this.userForm.controls.occommission.updateValueAndValidity();
      this.userForm.controls.occommission.setValue(0);
      // this.userForm.controls.occommission.updateValueAndValidity();
      // this.userForm.controls.ocbalance.clearValidators();
      // this.userForm.controls.ocbalance.setValue('');
      // this.userForm.controls.ocbalance.updateValueAndValidity();
    }
    // else{
    //   this.prepaid = false;
  
    // }
    
  }
  checkocommission(event){
    if (event.target.value[0] == '.') {
      this.userForm.controls.occommission.setValidators([Validators.required,Validators.pattern(Percentage_RegEx2)]);
      this.userForm.controls.occommission.updateValueAndValidity();  
        }
        else{
          this.userForm.controls.occommission.setValidators([Validators.required,Validators.pattern(Percentage_RegEx)]);
          this.userForm.controls.occommission.updateValueAndValidity();  
        }
  }
  getByProduct(e,j){
    let selectProductName = j.checked;
    if(e == 1 && selectProductName == true){
      this.EnablePermission = true;
      this.userForm.controls.permission_type.setValidators(Validators.required);
      this.userForm.controls.permission_type.updateValueAndValidity();
    }
    else if(e == 1 && selectProductName == false){
      this.EnablePermission = false;
      // this.userForm.controls.balance.clearValidators();
      // this.userForm.controls.balance.setValue('');
      // this.userForm.controls.balance.updateValueAndValidity();
      this.userForm.controls.reseller_type.clearValidators();
      this.userForm.controls.reseller_type.updateValueAndValidity();
      this.userForm.get('reseller_type').setValue('');

      this.userForm.controls.commission.clearValidators();
      this.userForm.controls.commission.setValue('');
      this.userForm.controls.commission.updateValueAndValidity();

      this.userForm.controls.permission_type.clearValidators();
      this.userForm.controls.permission_type.updateValueAndValidity();
      
      this.userForm.get('permission_type').setValue('');

    }
    else if(e == 2 && selectProductName == true){
      this.EnableOCPermission = true;
      // this.userForm.controls.permission_type.clearValidators();
      // this.userForm.controls.permission_type.updateValueAndValidity();
      
      // this.userForm.get('permission_type').setValue('');

    }
    else if(e == 2 && selectProductName == false){
      this.EnableOCPermission = false;
      // this.userForm.controls.ocbalance.clearValidators();
      // this.userForm.controls.ocbalance.setValue('');
      // this.userForm.controls.ocbalance.updateValueAndValidity();
      this.userForm.controls.ocreseller_type.clearValidators();
      this.userForm.controls.ocreseller_type.updateValueAndValidity();
      this.userForm.get('ocreseller_type').setValue('');

      this.userForm.controls.occommission.clearValidators();
      this.userForm.controls.occommission.setValue('');
      this.userForm.controls.occommission.updateValueAndValidity();
      // this.userForm.controls.permission_type.clearValidators();
      // this.userForm.controls.permission_type.updateValueAndValidity();
      
      // this.userForm.get('permission_type').setValue('');

    }
    // else{
    //   this.EnablePermission = false;
    // }
    
  }
  Permissionremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.permissionArr.filter((data) =>{    
      return data['permission_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  getCountryCode(event) {
    let country_id = event.value;
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
      var productArr = [];
      var elements = (<HTMLInputElement[]><any>document.getElementsByName("product_name"));
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName == 'INPUT') {
          if (elements[i].checked == true) {
            let response_arr = elements[i].value;
            productArr.push(response_arr[0]);
          }
        }
      } 

      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.userForm.value;  
      credentials.product_name = productArr;
      let user_id = localStorage.getItem("id");
      credentials.user_id = user_id;    
      credentials['user_type'] = this.userRole;
      credentials['id'] = this.data['id'];   
      if(this.PBXuserData != undefined){
        credentials['PBXid'] = this.PBXuserData.PID;
      }
      if(this.OCuserData != undefined){
      credentials['OCid'] = this.OCuserData.PID;
      }
      
      this.userService.checkEmailValid(credentials).subscribe(data => {
        if (data['id'] != '') {
          this.toastr.error('Error!', emailExist, { timeOut: 4000 });
          this.emailId = "";
          return;
        } else {          
          this.userService.postUserData(credentials).subscribe(data => {                 
              this.dialogRef.close();
              this.toastr.success('Success!', userUpdated, { timeOut: 2000 });                          
            this.resellerService.updateGridList();  ////////for table refresh
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

  cancelForm() {    
    this.userForm.reset();
    this.userService.updateGridList();
    this.dialogRef.close();
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

@Component({
  selector: "edit-permission-dialog",
  templateUrl: "edit-permission.html",
  styleUrls: ["./view-permission.component.scss"],
})
export class permissionDialog {
  errors: Errors = { errors: {} };
  permissionForm: FormGroup;
  allUrl: any;
  isSelected = false;
  selectedItem = [];
  selectedPermission: any;
  selectedPermissionId: any;
  completePermissions = false; 
  selectedUserType: any;
  selectedPbx: any;
  selectedOc: any;
  resellerList = [];


  constructor(
    public dialogRef: MatDialogRef<permissionDialog>,
    @Inject(MAT_DIALOG_DATA)  public data: PermissionDetail,
    private permissionService: PermissionService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.permissionForm = this.fb.group({
      permission_name: [
        "",
        [Validators.maxLength(30), Validators.minLength(1)],
      ],
      allCheck: [""],
      permissions: [""],
      complete_permissions: [""],
      user_type: [""],
      pbx: [""],
      oc: [""],
    });
  }

  get permission_name() {
    return this.permissionForm.get("permission_name");
  }

  ngOnInit() {
    this.permissionService.getAdminUrls().subscribe((data) => {
      const resList = data.response.sort((a, b) =>
        a.menuname > b.menuname ? 1 : -1
      );
      this.resellerList = data.response.sort((a, b) =>
      a.menuname > b.menuname ? 1 : -1
    );
      // const urlList = resList
      //   .filter((item) => item.id != 330)
      //   .filter((item) => item.parent_id != 330)
      //   .filter((item) => item.parent_id != 66)
      //   .filter((item) => item.id != 11)
      //   .filter((item) => item.id != 8)
      // const finalUrlList = [];
      // urlList.map((item, i) => {
      //   const menu = {
      //     ...item,
      //     addpermission: 0,
      //     deletepermission: 0,
      //     editpermission: 0,
      //     viewpermission: 0,
      //     allpermission: 0,
      //   };
      //   if (
      //     (menu.children == null || menu.children == "") &&
      //     menu.parent_id == 0
      //   ) {
      //     const childs = resList.filter((child) => child.parent_id == menu.id);
      //     if (childs.length == 0) {
      //       menu.children = "-";
      //     } else {
      //       menu.children = null;
      //     }
      //   }
      //   if (i > 0) {
      //     if (urlList[i - 1].menuname !== menu.menuname) {
      //       menu.menuname = menu.menuname;
      //     } else {
      //       menu.menuname = "";
      //     }
      //   }
      //   finalUrlList.push(menu);
      //   return item;
      // });

      // this.allUrl = finalUrlList;
      this.permissionService
        .getPermissionByUserId(this.data)
        .subscribe((data1) => {                    
          this.selectedPermission = data1[0]["permission_name"];
          this.selectedPermissionId = data1[0]["permission_id"];
          setTimeout(() => {
            this.selectedUserType = data1[0]["userType"] == '1' ? "1": "";            
          }, 500);
          this.selectedPbx = stringify(data1[0]["pbx"]) == '1' ? true : false;
          this.selectedOc = data1[0]["oc"] == '1' ? true : false;        
          if(data1[0]["userType"] == '0'){
            const urlList = resList
            .filter((item) => item.id != 330)
            .filter((item) => item.id != 328)
            .filter((item) => item.parent_id != 330)
            .filter((item) => item.parent_id != 328)
            .filter((item) => item.parent_id != 66)
            .filter((item) => item.id != 11)
            .filter((item) => item.id != 8)   
          const finalUrlList = [];
          urlList.map((item, i) => {
            const menu = {
              ...item,
              addpermission: 0,
              deletepermission: 0,
              editpermission: 0,
              viewpermission: 0,
              allpermission: 0,
            };
            if (
              (menu.children == null || menu.children == "") &&
              menu.parent_id == 0
            ) {
              const childs = resList.filter((child) => child.parent_id == menu.id);
              if (childs.length == 0) {
                menu.children = "-";
              } else {
                menu.children = null;
              }
            }
            if (i > 0) {
              if (urlList[i - 1].menuname !== menu.menuname) {
                menu.menuname = menu.menuname;
              } else {
                menu.menuname = "";
              }
            }
            finalUrlList.push(menu);
            return item;
          });
    
          this.allUrl = finalUrlList;
          }else{
               
               
          const urlList = this.resellerList
          .filter((item) => item.id != 330)
        .filter((item) => item.parent_id != 330)
        .filter((item) => item.parent_id != 66)
        .filter((item) => item.id != 11)
        .filter((item) => item.id != 8)
        .filter((item) => item.id != 44)
        .filter((item) => item.id != 51)
        .filter((item) => item.id != 52)
        .filter((item) => item.id != 55)
        .filter((item) => item.id != 332)
        .filter((item) => item.id != 333)
        .filter((item) => item.id != 91)
        .filter((item) => item.id != 92)
        .filter((item) => item.id != 93)
        .filter((item) => item.id != 95)
        .filter((item) => item.id != 349)
        .filter((item) => item.id != 350)
        .filter((item) => item.id != 351)
        .filter((item) => item.id != 365)
        .filter((item) => item.id != 4)
        .filter((item) => item.id != 34)
        .filter((item) => item.id != 35)
        .filter((item) => item.id != 256)
        .filter((item) => item.id != 375)
        .filter((item) => item.id != 50)
        .filter((item) => item.id != 53)
        .filter((item) => item.id != 54)
        .filter((item) => item.id != 96)
        .filter((item) => item.id != 97)
        .filter((item) => item.id != 98)
        .filter((item) => item.id != 99)
        .filter((item) => item.id != 3)
        .filter((item) => item.id != 371)
        .filter((item) => item.id != 124)
        .filter((item) => item.id != 126)
        .filter((item) => item.id != 128)
        .filter((item) => item.id != 130)
        .filter((item) => item.id != 383)
        .filter((item) => item.id != 384)
        .filter((item) => item.id != 100)
        .filter((item) => item.id != 101)
        .filter((item) => item.id != 102)
        .filter((item) => item.id != 345)
        .filter((item) => item.id != 352)
        .filter((item) => item.id != 355)
        .filter((item) => item.id != 328)
          
        const finalUrlList = [];
        urlList.map((item, i) => {
          const menu = {
            ...item,
            addpermission: 0,
            deletepermission: 0,
            editpermission: 0,
            viewpermission: 0,
            allpermission: 0,
          };
          if (
            (menu.children == null || menu.children == "") &&
            menu.parent_id == 0
          ) {
            const childs = this.resellerList.filter((child) => child.parent_id == menu.id);
            if (childs.length == 0) {
              menu.children = "-";
            } else {
              menu.children = null;
            }
          }
          if (i > 0) {
            if (urlList[i - 1].menuname !== menu.menuname) {
              menu.menuname = menu.menuname;
            } else {
              menu.menuname = "";
            }
          }
          finalUrlList.push(menu);
          return item;
        });
    
        this.allUrl = finalUrlList;  
          }
       
          if (data1) {
            this.makeCheckPermission(data1);
          }
        });
    });
    // this.permissionService.getAdminUrls().subscribe((data) => {
    //   const resList = data.response.sort((a, b) =>
    //     a.menuname > b.menuname ? 1 : -1
    //   );
    //   this.resellerList = data.response.sort((a, b) =>
    //   a.menuname > b.menuname ? 1 : -1
    // );
    
    
    // this.permissionService
    // .getPermissionById({ id: this.data.id })
    // .subscribe((data1) => {
    //     // this.selectedPermission = data1[0]["permission_name"];
    //     this.selectedPermissionId = data1[0]["permission_id"];
    //     this.selectedUserType = data1[0]["userType"] == '1' ? '1' : '';
    //     this.selectedPbx = data1[0]["pbx"] == '1' ? true : false;
    //     this.selectedOc = data1[0]["oc"] == '1' ? true : false;
        
        
    //     if(data1[0]["userType"] == '0'){
          
          
    //       const urlList = resList
    //       .filter((item) => item.id != 330)
    //       .filter((item) => item.parent_id != 330)
    //       .filter((item) => item.parent_id != 66)
    //       .filter((item) => item.id != 11)
    //       .filter((item) => item.id != 8);
    //     const finalUrlList = [];
    //     urlList.map((item, i) => {
    //       const menu = {
    //         ...item,
    //         addpermission: 0,
    //         deletepermission: 0,
    //         editpermission: 0,
    //         viewpermission: 0,
    //         allpermission: 0,
    //       };
    //       if (
    //         (menu.children == null || menu.children == "") &&
    //         menu.parent_id == 0
    //       ) {
    //         const childs = resList.filter((child) => child.parent_id == menu.id);
    //         if (childs.length == 0) {
    //           menu.children = "-";
    //         } else {
    //           menu.children = null;
    //         }
    //       }
    //       if (i > 0) {
    //         if (urlList[i - 1].menuname !== menu.menuname) {
    //           menu.menuname = menu.menuname;
    //         } else {
    //           menu.menuname = "";
    //         }
    //       }
    //       finalUrlList.push(menu);
    //       return item;
    //     });
  
    //     this.allUrl = finalUrlList;
    //     }else{
             
             
    //     const urlList = this.resellerList
    //     .filter((item) => item.id != 330)
    //     .filter((item) => item.parent_id != 330)
    //     .filter((item) => item.parent_id != 66)
    //     .filter((item) => item.id != 11)
    //     .filter((item) => item.id != 8)
    //     .filter((item) => item.id != 44)
    //     .filter((item) => item.id != 51)
    //     .filter((item) => item.id != 52)
    //     .filter((item) => item.id != 55)
    //     .filter((item) => item.id != 332)
    //     .filter((item) => item.id != 333)
    //     .filter((item) => item.id != 91)
    //     .filter((item) => item.id != 92)
    //     .filter((item) => item.id != 93)
    //     .filter((item) => item.id != 95)
    //     .filter((item) => item.id != 349)
    //     .filter((item) => item.id != 350)
    //     .filter((item) => item.id != 351)
    //     .filter((item) => item.id != 365)
    //     .filter((item) => item.id != 4)
    //     .filter((item) => item.id != 34)
    //     .filter((item) => item.id != 35)
    //     .filter((item) => item.id != 256)
    //     .filter((item) => item.id != 375)
    //     .filter((item) => item.id != 50)
    //     .filter((item) => item.id != 53)
    //     .filter((item) => item.id != 54)
    //     .filter((item) => item.id != 96)
    //     .filter((item) => item.id != 97)
    //     .filter((item) => item.id != 98)
    //     .filter((item) => item.id != 99)
    //     .filter((item) => item.id != 3)
    //     .filter((item) => item.id != 371)
    //     .filter((item) => item.id != 124)
    //     .filter((item) => item.id != 126)
    //     .filter((item) => item.id != 128)
    //     .filter((item) => item.id != 130)
    //     .filter((item) => item.id != 383)
    //     .filter((item) => item.id != 384)
    //     .filter((item) => item.id != 100)
    //     .filter((item) => item.id != 101)
    //     .filter((item) => item.id != 102)
        
    //   const finalUrlList = [];
    //   urlList.map((item, i) => {
    //     const menu = {
    //       ...item,
    //       addpermission: 0,
    //       deletepermission: 0,
    //       editpermission: 0,
    //       viewpermission: 0,
    //       allpermission: 0,
    //     };
    //     if (
    //       (menu.children == null || menu.children == "") &&
    //       menu.parent_id == 0
    //     ) {
    //       const childs = this.resellerList.filter((child) => child.parent_id == menu.id);
    //       if (childs.length == 0) {
    //         menu.children = "-";
    //       } else {
    //         menu.children = null;
    //       }
    //     }
    //     if (i > 0) {
    //       if (urlList[i - 1].menuname !== menu.menuname) {
    //         menu.menuname = menu.menuname;
    //       } else {
    //         menu.menuname = "";
    //       }
    //     }
    //     finalUrlList.push(menu);
    //     return item;
    //   });
  
    //   this.allUrl = finalUrlList;  
    //     }
    //     if (data1) {
    //       this.makeCheckPermission(data1);
    //     }
    //   });
        
    //   // this.allUrl = data.response;
    
    // });
  }

  makeCheckPermission(selectedUrl) {
    let complete_permissions = true
    const data = this.allUrl.map((url) => {
      const userPerm = selectedUrl.find((item) => item.id == url.id);
      if (userPerm) {
        const allpermission =
          userPerm.all_permission == 1 &&
          // userPerm.delete_permission == 1 &&
          // userPerm.modify_permission == 1 &&
          userPerm.view_permission == 1
            ? 1
            : 0;
            if(allpermission == 0){
              complete_permissions = false
            }
        return {
          ...url,
          addpermission: userPerm.add_permission,
          deletepermission: userPerm.delete_permission,
          editpermission: userPerm.modify_permission,
          viewpermission: userPerm.view_permission,
          allpermission,
        };
      } else {
        return {
          ...url,
          addpermission: 0,
          deletepermission: 0,
          editpermission: 0,
          viewpermission: 0,
          allpermission: 0,
        };
      }
    });
    this.allUrl = data;
    if(selectedUrl.length == this.allUrl.length){
      this.completePermissions = true;
    }else{    
      this.completePermissions = false;
    }
    // this.completePermissions = complete_permissions
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.permissionForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancelForm() {
    this.permissionForm.reset();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  allCheck(event, urlData) {
    const isChecked = event.target.checked;
    const allUrls = this.allUrl;
    const data = allUrls.map((url) => {
      if (url.id != urlData.id) return url;
      return {
        ...url,
        addpermission: isChecked ? 1 : 0,
        deletepermission: isChecked ? 1 : 0,
        editpermission: isChecked ? 1 : 0,
        viewpermission: isChecked ? 1 : 0,
        allpermission: isChecked ? 1 : 0,
      };
    });
    let childCheck = false;
    if (urlData.parent_id > 0) {
      data.map((url) => {
        if (urlData.parent_id == url.parent_id) {
          if (
            url.addpermission ||
            url.deletepermission ||
            url.editpermission ||
            url.viewpermission
          ) {
            childCheck = true;
          }
        }
      });
    }

    this.allUrl = data.map((url) => {
      if (urlData.parent_id == url.id) {
        return {
          ...url,
          addpermission: childCheck ? 1 : 0,
          deletepermission: childCheck ? 1 : 0,
          editpermission: childCheck ? 1 : 0,
          viewpermission: childCheck ? 1 : 0,
          allpermission: childCheck ? 1 : 0,
        };
      }
      return url;
    });
  }

  singleCheck(e, urlData, type) {
    const isChecked = e.target.checked;
    const allUrls = this.allUrl;
    const data = allUrls.map((url) => {
      if (url.id != urlData.id) return url;
      let addpermission = url.addpermission;
      let deletepermission = url.deletepermission;
      let editpermission = url.editpermission;
      let viewpermission = url.viewpermission;
      let extraPermissions = url.extraPermissions;
      if (type == "add") {
        addpermission = isChecked ? 1 : 0;
      }
      if (type == "delete") {
        deletepermission = isChecked ? 1 : 0;
      }
      if (type == "edit") {
        editpermission = isChecked ? 1 : 0;
      }
      if (type == "view") {
        viewpermission = isChecked ? 1 : 0;
      }
      if (addpermission || editpermission || deletepermission) {
        viewpermission = 1;
      }
      const allpermission =
        addpermission == 1 &&
        deletepermission == 1 &&
        editpermission == 1 &&
        viewpermission == 1
          ? 1
          : 0;
      return {
        ...url,
        addpermission,
        deletepermission,
        editpermission,
        viewpermission,
        allpermission,
        extraPermissions,
      };
    });
    let childCheck = false;
    if (urlData.parent_id > 0) {
      data.map((url) => {
        if (urlData.parent_id == url.parent_id) {
          if (
            url.addpermission ||
            url.deletepermission ||
            url.editpermission ||
            url.viewpermission
          ) {
            childCheck = true;
          }
        }
      });
    }
    this.allUrl = data.map((url) => {
      if (urlData.parent_id == url.id) {
        return {
          ...url,
          addpermission: childCheck ? 1 : 0,
          deletepermission: childCheck ? 1 : 0,
          editpermission: childCheck ? 1 : 0,
          viewpermission: childCheck ? 1 : 0,
          allpermission: childCheck ? 1 : 0,
        };
      }
      return url;
    });
  }

  completeCheck(event) {
    const isChecked = event.target.checked;
    const allUrls = this.allUrl;
    const data = allUrls.map((url) => {
      if (isChecked) {
        return {
          ...url,
          addpermission: 1,
          deletepermission: 1,
          editpermission: 1,
          viewpermission: 1,
          allpermission: 1,
        };
      } else {
        return {
          ...url,
          addpermission: 0,
          deletepermission: 0,
          editpermission: 0,
          viewpermission: 0,
          allpermission: 0,
        };
      }
    });
    this.allUrl = data;
  }

  updatePermission() {
    this.errors = { errors: {} };
    var permissionArr = [];
    var k = 0;

    this.allUrl.map((perm) => {
      const permission = {
        all: perm.allpermission == 1 ? true : false,
        add: perm.addpermission == 1 ? true : false,
        delete: perm.deletepermission == 1 ? true : false,
        modify: perm.editpermission == 1 ? true : false,
        view: perm.viewpermission == 1 ? true : false,
      };
      permissionArr.push({ id: perm.id, permission });
      return perm;
    });

    let credentials = this.permissionForm.value;
    credentials.permissionObj = permissionArr;
    credentials.permissionId = this.data;

    this.permissionService
      .updatePermission("permission/update", credentials)
      .subscribe(
        (data) => {
          this.toastr.success("Success!", '', { timeOut: 4000 });
          localStorage.removeItem("data");
          this.dialogRef.close();
        },
        (err) => {
          this.errors = err;
          this.toastr.error("Error!", errorMessage, { timeOut: 2000 });
        }
      );
  }
  search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].id === nameKey) {
        return myArray[i].id;
      }
    }
  }
}

