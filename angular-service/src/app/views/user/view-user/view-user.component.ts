import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../user.service';
import Swal from 'sweetalert2';
import { EmailService } from '../../../core/services/email.service';
import { DateAdapter } from '@angular/material';

import {
  Errors, ProductService, ExcelService, EMAIL_RegEx, invalidIP, amountZero, packageExtensionLimitError,
  GST_RegEx, Number_RegEx, Name_RegEx, userUpdated, mailSendError, checkCompany, Decimal_RegEx,
  errorMessage, invalidFormError, CommonService, emailExist, CallPlanRate, amountIssue, hasNoInvoice, hasNoCallPlan, mailSent, IP_RegEx, number_range_regex
} from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { PackageService } from '../../package/package.service';
import { GatewayService } from '../../gateway/gateway.service';
import { DashboardService } from '../../dashboard/dashboard.service';
// import { CallplanService } from '../../call/callplan.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { CallplanService } from '../../call-plan/callplan.service';
import { UserTypeConstants } from 'src/app/core/constants';
import { SmsService } from '../../sms/sms.service';
import { ConfigService } from '../../config/config.service';
import { UserService as userServicee } from 'src/app/core/services/user.service';
import { toObjectLowerCase } from '@syncfusion/ej2-angular-richtexteditor';
export var productId = '1';

export interface CustomerData {
  id: string,
  balance: number,
  company_name: string;
}

declare const ExcelJS: any;

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css']
})
export class ViewUserComponent implements OnInit {
  userData = '';
  error = '';
  allCustomer = true;
  activeCustomer = false;
  inactiveCustomer = false;
  customerStatus = "2"; //show all customer data
  productId = '1';
  filterForm: FormGroup;
  emailContentData: any = {};
  customerName: any = {};
  isFilter = false;
  showAccountManagerCustomerlisting = "";
  selectedValue = "";
  viewFrom = '';
  internalUser: any;
  userRole: string;
  userType: string;
  rowData: any;
  columnDefs: any;
  dataSource: any = [];
  companyData: any[] = [];
  isReset = false;
  exportData: any = {};
  defaultPageSize = '10';
  role = false;
  isOCSelect = false;
  isPBXSelect = false;
  pbxPackageList: any = '';
  PBXFilter: any;
  filterPBX: any;
  ocPackageList: any = '';
  OCFilter: any;
  filterOC: any;
  customerNameList = [];
  packageList = [];
  productList = [];
  managerArr: any = [];
  AcountFilter: any;
  filterAccount: any;
  circleList: any = [];
  CircleFilter: any;
  filterCircle: any;
  menus: any;
  customerMenu: any = '';
  status: any = '';
  ByAdmin: any;

  // public mode ;
  // public selectAllText: string
  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'company_name', value: 'id' };
  public fields1: Object = { text: 'name', value: 'id' };
  public fields6: Object = { text: 'state_name', value: 'id' };
  public fields7: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public placeholder7: string = 'Select PBX Package';
  public placeholder4: string = 'Select OC Package';
  public popupHeight: string = '200px';
  public popupWidth: string = '220px';

  public fields2: Object = { text: 'gmtzone', value: 'id' };
  public placeholder2: string = 'Select Account Manager';
  public placeholder8: string = 'Select Time Zone';
  public fields3: Object = { text: 'name', value: 'id' };
  public placeholder3: string = 'Select Circle';

  constructor(private userService: UserService, private route: ActivatedRoute,
    private router: Router, private fb: FormBuilder, public commonService: CommonService,
    private productServe: ProductService,
    public dialog: MatDialog, private toastr: ToastrService, private callplanService: CallplanService,
    private productService: ProductService,
    private smsService: SmsService,
    private userServicee: userServicee,

  ) {
    this.filterForm = this.fb.group({
      'by_company': new FormControl([]),
      'by_email': [""],
      'by_status': [""],
      'by_account_manager': new FormControl([]),
      'by_billing_type': [""],
      'by_product': [""],
      'by_oc': [""],
      'by_pbx': [""],
      'by_name': [""],
      'by_circle': new FormControl([]),
      'by_username': [""]
    });
  }


  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }


  ngOnInit() {
    // this.mode = 'CheckBox';
    // this.selectAllText= 'Select All';
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.customerMenu = this.menus.find((o) => o.url == '/user');
    this.viewFrom = this.route.snapshot.queryParams.viewFrom ? this.route.snapshot.queryParams.viewFrom : '';
    this.customerStatus = this.route.snapshot.queryParams.customerStatus;
    this.userRole = localStorage.getItem('type');
    this.userType = localStorage.getItem('type');
    this.role = (localStorage.getItem('type') == '4' || localStorage.getItem('type') == '5') ? true : false;
    if (this.viewFrom === 'AdminDashboard') {
      this.productId = this.route.snapshot.queryParams.productId;
    } else if (this.viewFrom == '') {
      this.productId = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : '1';
    }

    if (this.customerStatus == "inactive") {
      this.customerStatus = "0";
    } else if (this.customerStatus == "active") {
      this.customerStatus = "1";
    } else if (this.customerStatus == "other") {
      this.customerStatus = "3";
    } else {
      this.customerStatus = "2";
    }

    this.getCircle();
    //get company data
    let userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    if (localStorage.getItem('type') != '4' && userType != '3') {
      this.commonService.getAllCustomerCompany().subscribe(data => {
        this.companyData = data.response;
      }, err => {
        this.error = err.message;
      });
    }

    else if (userType == '3') {
      this.userService.getCustomerCompanyReseller(id, productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.companyData.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
        }
      }, err => {
        this.error = err.message;
      });
    } else {
      this.userService.getAccountManagerCustomercompany(localStorage.getItem('id')).subscribe(data => {
        this.companyData = data.response;
      }, err => {
        this.error = err.message;
      });
    }

    //get active account manager
    this.userService.getInternalUser().subscribe(data => {
      this.internalUser = data.response;
      for (let i = 0; i < this.internalUser.length; i++) {
        if (this.internalUser[i]['role'] == '4') {
          // this.managerArr.push(this.internalUser[i])
          this.managerArr.push({ id: this.internalUser[i]['id'], name: this.internalUser[i]['first_name'] + ' ' + this.internalUser[i]['last_name'] })
          this.filterAccount = this.AcountFilter = this.managerArr.slice();

        }
      }
    }, err => {
      this.error = err.message;
    });

    this.userService.displaySavedRecord.subscribe(() => {
      this.selectCustomer();
    });
    // get products for filter drop-down
    this.productService.getProductInfo().subscribe(data => {
      this.productList = data.response;
    });

  }

  Circleremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.circleList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  OCSelectremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.ocPackageList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Packageremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.pbxPackageList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.companyData.filter((data) => {
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Accountremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.managerArr.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }


  selectCustomer() {
    var customer = this.customerStatus;
    if (customer >= "0" || customer <= "3") {
      this.displayAllRecord(Number(customer), this.productId);
    }
  }

  public getCircle() { //get circle data
    this.callplanService.getCircle().subscribe(data => {
      this.circleList = data.response;
      this.filterCircle = this.CircleFilter = this.circleList.slice()
    }, err => {
      // this.errors = err.message;
    });
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  displayAllRecord(customerStatus, productId) {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 30 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'company_name', headerName: 'Company', hide: false, width: 15 },
      { field: 'name', headerName: 'Name', hide: false, width: 15 },
      { field: 'username', headerName: 'Username', hide: false, width: 15 },
      { field: 'email', headerName: 'Email', hide: false, width: 15 },
      { field: 'mobileDisplay', headerName: 'Mobile', hide: false, width: 15 },
      { field: 'product_name', headerName: 'Product', hide: false, width: 5 },
      { field: 'package_name', headerName: 'Package', hide: false, width: 10 },
      { field: 'user_type', headerName: 'User Type', hide: true, width: 10 },
      { field: 'balanceDisplay', headerName: 'Balance', hide: this.role, width: 12 },
      { field: 'billingTypeDisplay', headerName: 'Billing Type', hide: this.role, width: 10 },
      { field: 'status_text', headerName: 'Status', hide: false, width: 10 },
    ];

    if (customerStatus == "2") {
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        if (localStorage.getItem('type') != '3' && localStorage.getItem('type') != '4' && localStorage.getItem('type') != '5') {
          this.userService.filterUsers(credentials).subscribe(data => {
            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          }, err => {
            this.error = err.message;
          });
        }
        else if (localStorage.getItem('type') == '3') {
          let productIdd = localStorage.getItem('id')
          this.userService.getUsersForResellerByFilters(credentials, localStorage.getItem('id')).subscribe(data => {
            // this.userService.getAllResellerData(productIdd).subscribe(data => {
            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          }, err => {
            this.error = err.message;
          });
        }
        else if (localStorage.getItem('type') == '4') {
          // when u r login with account manager
          this.showAccountManagerCustomerlisting = "view";
          this.userService.filterAccountManagerUsers(credentials, localStorage.getItem('id')).subscribe(data => {
            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          }, err => {
            this.error = err.message;
          });
        } else if (localStorage.getItem('type') == '5') {
          // when u r login with support
          this.showAccountManagerCustomerlisting = "view";
          this.userService.filterSupportUsers(credentials, productId).subscribe(data => {
            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          }, err => {
            this.error = err.message;
          });
        }
      }
      else if (localStorage.getItem('type') == '3') {
        let productIdd = localStorage.getItem('id')
        this.userService.getAllReseller(localStorage.getItem('id')).subscribe(data => {
          // this.userService.getAllResellerData(productIdd).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        }, err => {
          this.error = err.message;
        });
      }
      else {
        if (localStorage.getItem('type') != '4' && localStorage.getItem('type') != '5') {
          this.userService.getAllUser().subscribe(data => {
            let account_managers = this.internalUser ? this.internalUser : [];
            data.forEach((elementj, indexj) => {
              data[indexj]['account_manager_name'] = "";
              account_managers.forEach((elementk, indexk) => {
                if (elementj['account_manager_id'] == elementk['id']) {
                  data[indexj]['account_manager_name'] = elementk['first_name'];
                  return;
                }
              });
            });

            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          }, err => {
            this.error = err.message;
          });
        } else if (localStorage.getItem('type') == '4') {
          this.showAccountManagerCustomerlisting = "view";
          this.userService.getAllUserForAccountManager(localStorage.getItem('id')).subscribe(data => {
            this.exportData = data;
            this.customerNameList = data;
            this.packageList = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          }, err => {
            this.error = err.message;
          });
        } else if (localStorage.getItem('type') == '5') {
          this.showAccountManagerCustomerlisting = "view";
          this.userService.getAllUserForSupport(productId).subscribe(data => {
            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          }, err => {
            this.error = err.message;
          });
        }
      }
    } else if (customerStatus >= "0" || customerStatus <= "3") {
      const credentials = this.filterForm.value;
      credentials.productId = productId;
      if (this.isFilter && !this.isReset) { //filter coming from whole data
        // credentials.by_status = customerStatus;
        this.userService.getAllUserStatusWiseFilters(credentials).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        }, err => {
          this.error = err.message;
        });
      } else if (!this.isFilter && this.isReset) { //reset also shown data according to whole data
        this.userService.getAllUser().subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        }, err => {
          this.error = err.message;
        });
      } else { //data coming status wise
        this.userService.getAllUserStatusWise(customerStatus, Number(productId)).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        }, err => {
          this.error = err.message;
        });
      }
    }
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
    if (this.userRole == '0') {
      worksheet.columns = [
        { header: 'Company', key: 'Company', width: 35 },
        { header: 'Name', key: 'Name', width: 25 },
        { header: 'Username', key: 'Username', width: 20 },
        { header: 'Email', key: 'Email', width: 30 },
        { header: 'Mobile', key: 'Mobile', width: 15 },
        { header: 'Product', key: 'Product', width: 25 },
        { header: 'Package', key: 'Package', width: 25 },
        { header: 'Balance', key: 'Balance', width: 15 },
        { header: 'Billing Type', key: 'BillingType', width: 10 },
        { header: 'AccountManager', key: 'AccountManager', width: 25 },
        { header: 'Status', key: 'Status', width: 28 }
      ];
    } else {
      worksheet.columns = [
        { header: 'Company', key: 'Company', width: 35 },
        { header: 'Name', key: 'Name', width: 25 },
        { header: 'Username', key: 'Username', width: 20 },
        { header: 'Email', key: 'Email', width: 30 },
        { header: 'Mobile', key: 'Mobile', width: 15 },
        { header: 'Product', key: 'Product', width: 25 },
        { header: 'Package', key: 'Package', width: 25 },
        { header: 'Status', key: 'Status', width: 28 }
      ];
    }
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
      if (this.userRole == '0') {
        worksheet.addRow({
          Company: this.exportData[i].company_name,
          Name: this.exportData[i].name,
          Username: this.exportData[i].username,
          Email: this.exportData[i].email,
          Mobile: this.exportData[i].mobileDisplay,
          Product: this.exportData[i].product_name,
          Package: this.exportData[i].package_name,
          Balance: this.exportData[i].balanceDisplay,
          BillingType: this.exportData[i].billingTypeDisplay,
          AccountManager: this.exportData[i].account_manager_name,
          Status: strStatus1
        });
      } else {
        worksheet.addRow({
          Company: this.exportData[i].company_name,
          Name: this.exportData[i].name,
          Username: this.exportData[i].username,
          Email: this.exportData[i].email,
          Mobile: this.exportData[i].mobileDisplay,
          Product: this.exportData[i].product_name,
          Package: this.exportData[i].package_name,
          Status: strStatus1
        });
      }
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
    worksheet.spliceRows(1, 0, new Array(offset))
    // this.excelService.exportAsExcelFile(arr, 'customer');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'user');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    if (this.userRole == '0') {
      var col = ["Company", "Name", "Username", "Email", "Mobile", "Product", "Package", "Balance", "Billing Type", "Status"];
      var rows = [];
      this.exportData.forEach(element => {
        let strStatus = element.status_text;
        let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
        const e11 = [element.company_name, element.name, element.username, element.email, element.mobileDisplay, element.product_name, element.package_name, element.balanceDisplay, element.billingTypeDisplay, strStatus1];
        rows.push(e11);
      });
    } else {
      var col = ["Company", "Name", "Username", "Email", "Mobile", "Product", "Package", "Status"];
      var rows = [];
      this.exportData.forEach(element => {
        let strStatus = element.status_text;
        let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
        const e11 = [element.company_name, element.name, element.username, element.email, element.mobileDisplay, element.product_name, element.package_name, strStatus1];
        rows.push(e11);
      });
    }
    doc.autoTable(col, rows, {
      theme: 'grid',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      styles: {
        overflow: 'linebreak',
        fontSize: 5.8
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
        7: { cellWidth: 'auto' }
      },
    });
    doc.save('customer.pdf');
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {


      let finalBtn = '';
      finalBtn += "<span>";
      if (this.customerMenu.all_permission == '0' && this.customerMenu.view_permission == '1') {
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.showAccountManagerCustomerlisting == '') {
        if (this.customerMenu.modify_permission) {
          finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
          finalBtn += "<i class='fa fa-envelope edit-button' style='cursor:pointer; display: inline' data-action-type='send_mail' title='Send Mail'></i>";
          // finalBtn += "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login' title='login'></i>";
          finalBtn += "</span>";



          finalBtn += "<i class='fa fa-inr add-balance-button' style='cursor:pointer; display: inline' data-action-type='add-balance' title='Manage Balance'></i>";
          finalBtn += "<i class='fa fa-envelope-open edit-button' style='cursor:pointer; display: inline' data-action-type='sms-package' title='SMS Package'></i>";
          // if (this.customerMenu.delete_permission) {
          //   finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
          // }
          // finalBtn += "<i class='fa fa-list edit-button' style='cursor:pointer; display: inline' data-action-type='rates' title='Call Plan Rates'></i>";
          // if(pagedData[i]['flag'] == 1){
          // }
          if (pagedData[i].status == '1') {
            pagedData[i].status_text = "<span style='color:#379457;'><strong>" + pagedData[i].status_text + "</strong></span>";
            finalBtn += "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login' title='login'></i>";
            finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>";
          } else if (pagedData[i].status == '0') {
            pagedData[i].status_text = "<span style='color:#c69500;'><strong>" + pagedData[i].status_text + "</strong></span>";
            finalBtn += "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login' title='login'></i>";
            finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'</i>";

          } else if (pagedData[i].status == '3') {
            pagedData[i].status_text = "<span style='color:#f5302e;'><strong>" + pagedData[i].status_text + "</strong></span>";
          } else {
            pagedData[i].status_text = "<span style='color:#000000;'><strong>" + pagedData[i].status_text + "</strong></span>";
          }

        }
      }
      // finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline;' data-action-type='view' title='View'></i>";
      finalBtn += "<i class='fa fa-info-circle list-button' style='cursor:pointer; display: inline' data-action-type='minute-plan' title='Customer Information'></i>";
      finalBtn += "<i class='fa fa-files-o list-button' style='cursor:pointer; display: inline' data-action-type='view_package' title='View Package'></i>";
      finalBtn += "<i class='fa fa-list edit-button' style='cursor:pointer; display: inline' data-action-type='rates' title='Call Plan Rates'></i>";
      finalBtn += "<i class='fa fa-briefcase list-button' style='cursor:pointer; display: inline' data-action-type='newRates' title='New Call Rates'></i>";

      if (this.showAccountManagerCustomerlisting == 'view') {
        if (pagedData[i].status == '1') {
          pagedData[i].status_text = "<span style='color:#379457;'><strong>" + pagedData[i].status_text + "</strong></span>";
        } else if (pagedData[i].status == '0') {
          pagedData[i].status_text = "<span style='color:#c69500;'><strong>" + pagedData[i].status_text + "</strong></span>";
        } else if (pagedData[i].status == '3') {
          pagedData[i].status_text = "<span style='color:#f5302e;'><strong>" + pagedData[i].status_text + "</strong></span>";
        } else {
          pagedData[i].status_text = "<span style='color:#000000;'><strong>" + pagedData[i].status_text + "</strong></span>";
        }


        if (this.userRole === UserTypeConstants.ACCOUNT_MANAGER && pagedData[i]['flag'] == 1) {
          finalBtn += "<i class='fa fa-table list-button' style='cursor:pointer; display: inline' data-action-type='view_call_plan' title='View Call Plan'></i>";
        }
        if (this.userRole === UserTypeConstants.ACCOUNT_MANAGER && pagedData[i]['has_invoice'] != 0) {
          finalBtn += "<i class='fa fa-money list-button' style='cursor:pointer; display: inline' data-action-type='view_customer_invoice' title='View Invoice'></i>";
        }

      }
      finalBtn += "</span>";
      // finalBtn += "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login' title='login'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  selectProductDiv(product) {
    let myproduct = product.target.value;
    if (myproduct === '1') {
      this.productId = '1';
      this.selectCustomer();
    } else if (myproduct === '2') {
      this.productId = '2';
      this.selectCustomer();
    }
  }

  editCustomer(data) {
    this.openDialog(data.id);
  }

  viewCallPlan(data) {
    this.openDialogCallPlan(data.id);
  }

  viewCustomerInvoice(data) {
    if (!data.has_invoice) {
      this.toastr.error('Error!', hasNoInvoice, { timeOut: 4000 });
    } else {
      // this.router.navigate(['invoice/view'], { queryParams: { id: data.invoice_id } });
      this.router.navigate(['invoice/view-invoice'], { queryParams: { id: data.id } });
    }
  }

  viewCustomerSMSPackage(data) {
    this.openDialogForSMSPackage(data.id);
  }

  sendCustomerWelcomeMail(data) {
    this.userService.getLogo(data.id, localStorage.getItem('type')).subscribe(values => {
      data['logo_path'] = values['logo_path'][0]['logo_img'];
      data['template'] = "InternalUserCreation";
      this.userService.postUserMail(data).subscribe(datas => {
        if (datas['status'] == 200) {
          this.toastr.success('Success!', mailSent, { timeOut: 2000 });
        } else {
          this.toastr.error('Error!', 'Something went wrong !', { timeOut: 2000 });
        }
      })
    })

  }

  goToCreate() {
    this.router.navigate(['user/view/create']);
  }


  viewPackage(data) {
    this.userService.getCustomerPackage(Number(data.id)).subscribe(data => {
      if (data && (localStorage.getItem('type') == UserTypeConstants.CUSTOMER)) {
        this.router.navigate(['package/customerView'], { queryParams: { proId: data[0].product_id, pId: data[0].id } });
      } else if (data && (localStorage.getItem('type') == UserTypeConstants.ACCOUNT_MANAGER)) {
        this.router.navigate(['user/view/package/customerView'], { queryParams: { proId: data[0].product_id, pId: data[0].id } });
      } else if (data && (localStorage.getItem('type') == UserTypeConstants.SUPPORT_MANAGER)) {
        this.router.navigate(['user/view/package/customerView'], { queryParams: { proId: data[0].product_id, pId: data[0].id } });
      }
    });
  }



  deleteExtension(event) {
    this.userService.PaidStatusCustomerInvoice(event.id).subscribe(data => {
      let flag = 0;
      data.response.map(event => {
        if (event['paid_status'] == 2 || event['paid_status'] == 3) {
          // this.toastr.error('Error!', "Please change the paid status!", { timeOut: 2000 });

          flag = 1;
          return
        }
      })
      if (flag == 1) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'> Extension </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.company_name + " </span><span style='color:#FFFFFF'> can't be deleted because </span> <span style='color:#FFFFFf;'> it is associate with either DID Destination or Features.</span>",
          type: 'error',
          background: '#000000',
          timer: 5000
        });
      }

    })
  }

  deleteCustomer(data, action) {
    let flag = 0;
    let flags = 0;
    let Status = 0;
    if (action == 'delete') {
      if (Number(data['balance']) < 0) {
        flags = 1;
      }
      // if(Number(data['status']) == 4){
      //   Status = 1;
      // }
      this.userService.PaidStatusCustomerInvoice(data.id).subscribe(status => {
        flag = 0;
        status.response.map(event => {
          if (event['paid_status'] == 2 || event['paid_status'] == 3 || event['charge_status'] == 1 || event['charge_status'] == 0 || event['invoice_status'] == 1) {
            flag = 1;
            return
          }
        })
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html: "<span style='color:#FFFFFF;'>You will not be able to recover account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
          type: 'warning', showCancelButton: true, background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.userService.deleteCustomer({ action: action, id: data.id, role: data.role_id, email: data.email, name: data.name, product_id: data.product_id, flag: flag, flags: flags, Status: Status }).subscribe(data => {
              this.selectCustomer();
            })
          }, allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (flag == 1 || flags == 1 || Status == 1) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">cancelled!</span>',
              html: "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'>can not be deleted because of having outstanding balance.</span>",
              type: 'success',
              background: '#000000',
              timer: 3000
            });
          }
          else if (result.value) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Deleted!</span>',
              html: "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 3000
            });
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html: "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
              type: 'error',
              background: '#000000',
              timer: 3000
            });
          }
        });
        // }
      });
    }
    else if (action == 'inactive') {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You can re-activate account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'>  in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, inactive it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.userService.deleteCustomer({ action: action, id: data.id, role: data.role, email: data.email, name: data.name, product_id: data.product_id }).subscribe(data => {
            this.selectCustomer();
          });
        }, allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Inactivated!</span>',
            html: "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'> has been inactivated.</span>",
            type: 'success',
            background: '#000000',
            timer: 3000
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'>account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
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
        html: "<span style='color:#FFFFFF;'>You can inactivate account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, active it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.userService.deleteCustomer({ action: action, id: data.id, role: data.role, email: data.email, name: data.name }).subscribe(data => {
            this.selectCustomer();
          });
        }, allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Activated!</span>',
            html: "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'> has been activated.</span>",
            type: 'success',
            background: '#000000',
            timer: 3000
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.company_name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: 'error',
            background: '#000000',
            timer: 3000
          });
        }
      });
    }
    // })
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editCustomer(data);
      case "delete":
        return this.deleteCustomer(data, actionType);
      case "active":
        return this.deleteCustomer(data, actionType);
      case "inactive":
        return this.deleteCustomer(data, actionType);
      case "view":
        return this.editCustomer(data);
      case "view_package":
        return this.viewPackage(data);
      case "add-balance":
        return this.addBalance(data);
      case "view_call_plan":
        return this.viewCallPlan(data);
      case "view_customer_invoice":
        return this.viewCustomerInvoice(data);
      case "sms-package":
        return this.viewCustomerSMSPackage(data);
      case "send_mail":
        return this.sendCustomerWelcomeMail(data);
      case "minute-plan":
        return this.showAssociatedMinutePlan(data);
      case "rates":
        return this.showCallPlanRates(data);
      case "newRates":
        return this.addNewCallRates(data);
      case "login":
        {
          // this.userService.getUserInfo(data.id).subscribe( async parseData =>{
          // this.status = await parseData[0].status;
          // });
          // setTimeout(() => {
          // }, 500);      
          let ip = localStorage.getItem('ip')
          let role = localStorage.getItem('type');
          var user_id = data.username;
          var pass = data.password;
          let body = {
            ip: 'null',
            username: user_id,
            password: pass,
            loginType: 'byAdmin',
            flag: '1',
          };
          let reseller = localStorage.getItem('ByReseller') ? '1' : '0';

          if (reseller == '1') {
            body['adminLogin'] = '1';
          }

          let subadmin = localStorage.getItem('BySub') ? '1' : '0';

          if (subadmin == '1') {
            body['subadminLogin'] = '1'
          }

          if (localStorage.getItem('type') == '2' && !localStorage.getItem('BySub')) {
            body['subAdminId'] = localStorage.getItem('id');
          }

          if (localStorage.getItem('type') == '3' && !localStorage.getItem('ByReseller')) {
            body['resellerId'] = localStorage.getItem('id');
          }

          // if(role == '0'){
          //   body['flag'] = 1;
          // }
          // else{
          //   body['flag'] = 0;
          // }

          // if(role == '0'){
          //   this.status = 1;
          // }else{
          //   this.status = 0;
          // }
          //signout api
          this.userServicee.attemptAuth(body).subscribe(data => {
            // return  
            if (data['code'] == 200) {
              this.userServicee.purgeAuth();
              let ip = localStorage.getItem('ip');
              window.localStorage.clear();
              localStorage.setItem('ip', ip);
              this.dialog.closeAll();
              this.userServicee.setAuth(data);
              if (body['adminLogin']) {
                localStorage.setItem('ByAdmin', '1');
                localStorage.setItem('ByReseller', '1');
              }
              if (body['subadminLogin'] == '1') {
                localStorage.setItem('ByAdmin', '1');
                localStorage.setItem('BySubadmin', '1');
              }
              if (body['subAdminId']) {
                localStorage.setItem('subAdminId', body['subAdminId']);
              }
              if (body['resellerId']) {
                localStorage.setItem('resellerId', body['resellerId']);
              }
              localStorage.setItem('ByAdmin', '1');
              this.toastr.success('Success!', "Login Successfully!", { timeOut: 2000 });

              let menuList = JSON.parse(localStorage.getItem('menu'));
              let newV = menuList.find(e => { return e.menuname === 'Dashboard' })
              setTimeout(() => {
                // this.router.navigateByUrl(newV.url);
                //redirect to any page
                window.location.href = newV.url;
              }, 500);
            }

            // refresh

          });
        }
    }
  }

  addNewCallRates(data) {
    const dialogRef = this.dialog.open(NewCallRatesDialog, { width: '60%', disableClose: true, data: data });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });

  }

  addBalance(data) {
    this.openDialogAddBalance(data.id, data.balance, data.company_name, data.comission, data.created_by, data.product_id);
  }

  resetTable() {
    this.isFilter = false;
    this.isReset = true;
    this.selectCustomer();
  }

  public showAssociatedMinutePlan(data) {
    this.router.navigate(['user/view/minute-plan-associate'], { queryParams: { custId: data.id, company: data.company_name } });
  }

  public showCallPlanRates(data) {
    this.router.navigate(['user/view/call-plan-rates'], { queryParams: { custId: data.id, company: data.company_name } });
  }

  filterData() {
    this.isFilter = true;
    this.isReset = false;
    this.selectCustomer();
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(UserDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openDialogAddBalance(id, balance, company_name, commission, created_by, product): void {
    const dialogRefBalance = this.dialog.open(AddUserBalanceDialog, { width: '60%', disableClose: true, data: { id: id, balance: balance, company_name: company_name, commission: commission, created_by, product } });
    dialogRefBalance.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefBalance.close('Dialog closed');
      }
    });
    dialogRefBalance.afterClosed().subscribe(result => {
    });
  }

  openDialogCallPlan(id?): void {
    this.callplanService.viewCustomerCallPlanRate({ id: Number(id) }).subscribe(pagedData => {
      if (pagedData[0] != undefined && pagedData[0].hasOwnProperty('id')) {
        this.router.navigate(['callPlan/view'], { queryParams: { cId: id } });
      } else {
        this.toastr.error('Error!', hasNoCallPlan, { timeOut: 2000 });
        return;
      }
    });
  }

  openDialogForSMSPackage(id?): void {
    this.smsService.getCustomerSMSid(id).subscribe(data => {
      if (data['response'].id != null) {
        const dialogRef = this.dialog.open(ViewCustomerSMSPackageDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
        dialogRef.keydownEvents().subscribe(e => {
          if (e.keyCode == 27) {
            dialogRef.close('Dialog closed');
          }
        });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else {
        this.toastr.error('Error!', 'Customer has no SMS package', { timeOut: 2000 });
      }
    })

  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoUserDialog, {
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
    });
  }

  getPackageByProduct(product) {
    let myproduct = product.source.value;
    this.filterForm.get('by_oc').setValue('');
    this.filterForm.get('by_pbx').setValue('');
    if (myproduct == 1) {
      if (this.userType == UserTypeConstants.ACCOUNT_MANAGER) {
        this.productServe.getAccountManagerPbxPackageInfo(localStorage.getItem('id')).subscribe(data => {
          this.pbxPackageList = data.response;
          this.filterPBX = this.PBXFilter = this.pbxPackageList.slice();
          this.isPBXSelect = true;
          this.isOCSelect = false;
        });
      } else {
        this.productServe.getPbxPackageInfo().subscribe(data => {
          this.pbxPackageList = data.response;
          this.filterPBX = this.PBXFilter = this.pbxPackageList.slice();
          this.isPBXSelect = true;
          this.isOCSelect = false;
        });
      }
    }
    if (myproduct == 2) {
      if (this.userType == UserTypeConstants.ACCOUNT_MANAGER) {
        this.productServe.getAccountManagerOCPackageInfo(localStorage.getItem('id')).subscribe(data => {
          this.ocPackageList = data.response;
          this.filterOC = this.OCFilter = this.ocPackageList.slice()
          this.isOCSelect = true;
          this.isPBXSelect = false;
        });
      } else {
        this.productServe.getOcPackageInfo().subscribe(data => {
          this.ocPackageList = data.response;
          this.filterOC = this.OCFilter = this.ocPackageList.slice()
          this.isOCSelect = true;
          this.isPBXSelect = false;
        });
      }
    }
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

//Help Document dialog
@Component({
  selector: 'infoUser-dialog',
  templateUrl: 'infoUser-dialog.html',
})

export class InfoUserDialog {
  role: any;

  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoUserDialog>, @Inject(MAT_DIALOG_DATA) public data: CustomerData,
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

//create user dialog
@Component({
  selector: 'user-dialog',
  templateUrl: 'user-dialog.html',
})

export class UserDialog {
  error = '';
  errors: Errors = { errors: {} };
  userForm: FormGroup;
  serverForm: FormGroup;
  customer_id = "";
  userData: any = {};
  billingType: any = "";
  PBXPFilter: any;
  filterPBXP: any;
  products = [];
  showPbx = false;
  showOc = false;
  product_id = "";
  active_products: any = [];
  packageData: any = [];
  ocPackage: any = '';
  products_arr = [];
  submitted = false;
  package_arr = [];
  dataSource = [];
  columnDefs = [];
  defaultPageSize = '0';
  isPbx = "";
  internalUser = "";
  managerArr = [];
  AcountFilter: any;
  filterAccount: any;
  countryList = "";
  filterCountry: any;
  countryCode = "";
  timeZone: any = "";
  TimeZoneFilter: any;
  filterTimeZone: any;
  emailContentData: any = {};
  customerName: any = {};
  companyName = "";
  emailId = "";
  userRole: number;
  userType = "";
  isCredtiLimit = false;
  userOldPackage: any;
  pckgValue: any;
  oldExtensionLimitValue: any = 0;
  newExtensionLimitValue: any = 0;
  totalCustomerExtension: any = 0;
  pckgExtLimit = false;
  isPbxAssign: boolean;
  pbx_package_id: any = 0;
  oc_package_id = '';
  isPackageChange = false;
  isState = true;
  is_plugin = false;
  statesList = '';
  filterState: any;
  packageID: any;
  pbxData: any;
  cust_state: any;
  circleList: any = [];
  CircleFilter: any;
  filterCircle: any;
  product_name: any = "";
  holdDefaultbillingType = "";
  packageType = "";
  hide = true;
  invoiceStatus: any;
  dialoutGroupList: any = [];
  callPlanData: any = [];
  threshold_balance_notification: any = [];
  DialoutFilter: any;
  filterDial: any;
  Li = false;
  isCircle = true;
  isLi = true;
  isIntercom = false;
  isEnterprise = false;
  isIndia: boolean = true;
  ReadCountry = true;
  cli_type_tog = false;
  dialout_id = 0;
  account_managerID = 0;
  minDate: Date;
  billingBind: any;
  assignDefaultDate: any;
  disabled: boolean = false;
  defaultDate: boolean = false;
  dynamicColorCoding: boolean = false;
  todayDate: Date;
  api_hits: boolean = false;
  isDisabled: boolean = true;
  isFifty: boolean = false;
  isSeventyFive: boolean = false;
  isNinety: boolean = false;
  consume_hit;
  credit_value = '0';
  storeCircle: boolean;
  resellerAccountID: any
  resellerAccountname: any;
  resellerAccounttype: any;
  accManager: any
  menus: any
  customerMenu: any



  public fields: Object = { text: 'name', value: 'id' };
  public placeholder8: string = 'Select Time Zone';
  public placeholder9: string = 'Select Circle Name';
  public placeholder10: string = 'Dialout Group';
  public placeholder11: string = 'Select PBX Package';
  public placeholder12: string = 'Select OC Package';
  public fields2: Object = { text: 'name', value: 'id' };
  public fields6: Object = { text: 'state_name', value: 'id' };
  public field1: Object = { text: 'first_name', value: 'id' };
  public fields1: Object = { text: 'name', value: 'id' };
  public fields7: Object = { text: 'gmtzone', value: 'id' };
  public placeholder: string = 'Country';
  public placeholder6: string = 'State';
  public placeholder1: string = 'Account Manager';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  private regex: RegExp = new RegExp(/^[0-9]{0,6}(?:[.][0-9]{0,2})?$/);
  defaultDateSet: string = '00/00/0000'
  dunning: boolean;
  email_disable: boolean;




  constructor(
    public dialogRef: MatDialogRef<UserDialog>, @Inject(MAT_DIALOG_DATA) public data: CustomerData,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private toastr: ToastrService,
    private userService: UserService,
    public commonService: CommonService,
    private emailService: EmailService,
    private packageService: PackageService,
    private callplanService: CallplanService,
    private customerdashboardService: DashboardService,
    public ConfigService: ConfigService,
    private router: Router,
    private callPlanService: CallplanService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.minDate = new Date(); // Set the maximum date to the current date
    this.minDate.setDate(this.minDate.getDate() + 1); // Set the maximum date to yesterday
    this.todayDate = new Date();
    this.userForm = this.formBuilder.group({
      // 'product_name': ["",Validators.required],
      'oc_package_name': [''],
      'pbx_package_name': [''],
      'f_name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'l_name': ['', Validators.pattern(Name_RegEx)],
      'email': ['', [Validators.required, Validators.pattern(EMAIL_RegEx)]],
      'username': ['', [Validators.required, Validators.minLength(8)]],
      'mobile': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'company': ['', [Validators.required]],
      'company_address': [''],
      'company_phone': ['', [Validators.minLength(10), Validators.maxLength(15), Validators.min(1000000000)]],
      'domain': [''],
      'id': [''],
      'status': [''],
      'account_manager': [''],
      'country': [""],
      'states': [''],
      'country_code': [''],
      'time_zone': [''],
      'billing_type': ['', [Validators.required]],
      'balance': ['0.00'],
      'credit_limit': ['0.00', [Validators.required]],
      'gst_number': ['', Validators.pattern(GST_RegEx)],
      'isCircle': [''],
      'isSetDate': [''],
      'plugin': [],
      'circle': [],
      'apiToken': [],
      'token': [''],
      'extension_length_limit': [''],
      'monthly_international_threshold': [''],
      'threshold': [''],
      'invoice_day': [''],
      'advance_payment': ['0.00', [Validators.required]],
      'callback_url': [''],
      'dialout_group': [''],
      'is_notification_email': [],
      'notification_email': [''],
      'ip': ['', [Validators.pattern(IP_RegEx), Validators.maxLength(40)]],
      'is_Li': [''],
      'Li': [''],
      'cli_type': [''],
      'intercom_calling': [''],
      'enterprise_directory': [''],
      'pan_number': [''],
      'p_i_number': [''],
      'p_o_number': [''],
      'date': [''],
      'threshold_fifty': [''],
      'threshold_seventyFive': [''],
      'threshold_ninety': [''],
      'request_hit': [0, [Validators.pattern(number_range_regex)]],
      'is_dunning': []
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.customerMenu = this.menus.find((o) => o.url == '/user/view');
    this.dateAdapter.setLocale('en-GB');
  }

  get billing_type() { return this.userForm.get('billing_type'); }
  //get balance() { return this.userForm.get('balance'); }
  get credit_limit() { return this.userForm.get('credit_limit'); }
  get company() { return this.userForm.get('company'); }
  get company_phone() { return this.userForm.get('company_phone'); }
  get f_name() { return this.userForm.get('f_name'); }
  get l_name() { return this.userForm.get('l_name'); }
  get email() { return this.userForm.get('email'); }
  get username() { return this.userForm.get('username'); }
  get mobile() { return this.userForm.get('mobile'); }
  get user_type() { return this.userForm.get('user_type'); }
  get gst_number() { return this.userForm.get('gst_number'); }
  get extension_length_limit() { return this.userForm.get('extension_length_limit'); }
  get notification_email() { return this.userForm.get('notification_email'); }
  get is_notification_email() { return this.userForm.get('is_notification_email'); }
  get ip() { return this.userForm.get('ip'); }
  get is_li() { return this.userForm.get('is_li'); }
  get li() { return this.userForm.get('li'); }
  get plugin() { return this.userForm.get('plugin'); }
  get request_hit() { return this.userForm.get('request_hit'); }
  get advance_payment() { return this.userForm.get('advance_payment'); }
  get date() { return this.userForm.get('date'); }
  get iscircle() { return this.userForm.get('isCircle'); }



  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }
  inputValue: string = '';
  isPatternMatchedd: boolean = false;
  isPatternMatcheddd: boolean = false;
  ischeak: boolean = false;
  static ssss: any;
  checkPatternn(event) {
    let value = event.target.value;
    const pattern = /^(?:[1-9]\d{0,5}|0)(?:\.\d{1,2})?$|^0$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if (this.isPatternMatchedd == false) {
      let res = value.substr(value.length - 1);
      let array = value.split(".");
      if (res != ".") {
        if (array[0].length > 6) {
          let result = array[0].substring(0, 6)
          this.userForm.controls.advance_payment.setValue(result);
        }
        else {
          let res = value.includes(".");
          if (res && array[1].length > 2) {
            let valu = array[0] + "." + array[1].substring(0, 2)
            this.userForm.controls.advance_payment.setValue(valu);
          }
          else {
            let Res = value.substring(0, value.length - 1);
            this.userForm.controls.advance_payment.setValue(Res);
          }
        }
        UserDialog.ssss = value
      }
      else {
        if (array[0].length < 6) {
          this.userForm.controls.advance_payment.setValue(value);
        }

      }
      //this.userForm.get('credit_limit').reset();
    }
    else {
      if (value) {
        let res = value.includes(".");
        if (res == false && UserDialog.ssss) {
          let Res = UserDialog.ssss.includes(".");
          if (Res) {
            let array = UserDialog.ssss.split(".");
            this.userForm.controls.advance_payment.setValue(array[0]);
            value = array[0];
          }
        }
        UserDialog.ssss = value
        // strValue was non-empty string, true, 42, Infinity, [], ...
      }
    }

  }

  checkPatternnn(event) {
    let value = event.target.value;
    const pattern = /^(?:[1-9]\d{0,5}|0)(?:\.\d{1,2})?$|^0$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if (this.isPatternMatchedd == false) {
      let res = value.substr(value.length - 1);
      let array = value.split(".");
      if (res != ".") {
        if (array[0].length > 6) {
          let result = array[0].substring(0, 6)
          this.userForm.controls.credit_limit.setValue(result);
        }
        else {
          let res = value.includes(".");
          if (res && array[1].length > 2) {
            let valu = array[0] + "." + array[1].substring(0, 2)
            this.userForm.controls.credit_limit.setValue(valu);
          }
          else {
            let Res = value.substring(0, value.length - 1);
            this.userForm.controls.credit_limit.setValue(Res);
          }
        }
        UserDialog.ssss = value
      }
      else {
        if (array[0].length < 6) {
          this.userForm.controls.credit_limit.setValue(value);
        }

      }
      //this.userForm.get('credit_limit').reset();
    }
    else {
      if (value) {
        let res = value.includes(".");
        if (res == false && UserDialog.ssss) {
          let Res = UserDialog.ssss.includes(".");
          if (Res) {
            let array = UserDialog.ssss.split(".");
            this.userForm.controls.credit_limit.setValue(array[0]);
            value = array[0];
          }
        }
        UserDialog.ssss = value
        // strValue was non-empty string, true, 42, Infinity, [], ...
      }
    }

  }
  // checkPatternnn(event) {
  //   let value = event.target.value;
  //   const pattern = /^[0-9]{0,6}(?:[.][0-9]{0,2})?$/; // Example pattern: up to 6 digits
  //   this.isPatternMatcheddd = pattern.test(value);
  //   // if(this.isPatternMatcheddd  == false){ 
  //   //   //  this.userForm.get('advance_payment').reset();
  //   //    this.toastr.error('Error!', "Worng Balance", { timeOut: 2000 });
  //   //    return;

  //   //  }

  // }

  private specialKeys: Array<string> = [
    'Backspace',
    'Tab',
    'End',
    'Home',
    'ArrowLeft',
    'ArrowRight',
    'Del',
    'Delete',
  ];
  numberOnly(event): boolean {
    let value = event.target.value;
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = value;
    const position = event.target.selectionStart;
    const next: string = [
      current.slice(0, position),
      event.key == 'Decimal' ? '.' : event.key,
      current.slice(position),
    ].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  ngOnInit() {

    if (this.customerMenu.all_permission == '0' && this.customerMenu.view_permission == '1') {
      this.userForm.disable();
    }
    this.resellerAccountID = localStorage.getItem("id");
    this.resellerAccountname = localStorage.getItem("user_name");
    this.resellerAccounttype = localStorage.getItem("type");
    this.accManager = {
      id: this.resellerAccountID,
      name: this.resellerAccountname
    }

    this.customer_id = this.data.id;
    this.userRole = parseInt(localStorage.getItem('type'));
    this.getCircle();  //get circle list

    //get state list
    this.commonService.getIndiaStates().subscribe(data => {
      this.statesList = data.response;
      this.filterState = this.statesList.slice();
    });

    //get dialout group/rule
    this.ConfigService.getDialOutGroupList({}).subscribe(pagedData => {
      this.dialoutGroupList = pagedData;
      this.filterDial = this.DialoutFilter = this.dialoutGroupList.slice();
    });




    //get country
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filterCountry = this.countryList.slice();

      //get time zone
      this.commonService.getTimezone().subscribe(data => {
        this.timeZone = data.response;
        this.filterTimeZone = this.TimeZoneFilter = this.timeZone.slice();
        let role = localStorage.getItem('type');
        let ResellerID = localStorage.getItem('id');
        // if(role == '3')
        // this.userService.getInternalUserReseller(role,ResellerID).subscribe(data =>{

        // })
        if (this.resellerAccounttype == 3) {
          this.accManager = localStorage.getItem('user_name');
          this.loadCustomerData()
        }
        else {
          this.userService.getInternalUser().subscribe(data => {
            this.internalUser = data.response;
            const managers = []
            for (let i = 0; i < this.internalUser.length; i++) {
              if (this.internalUser[i]['role'] == '4') {
                // this.managerArr.push(this.internalUser[i])
                managers.push({ id: this.internalUser[i]['id'], name: this.internalUser[i]['first_name'] + ' ' + this.internalUser[i]['last_name'] })

              }
            }
            this.filterAccount = this.AcountFilter = this.managerArr.slice();
            this.managerArr = managers
            this.loadCustomerData()
          }, err => {
            this.error = err.message;
          });
        }
      }, err => {
        this.error = err.message;
      });
    }, err => {
      this.error = err.message;
    });





    //get oc packages
    this.productService.getOcPackageInfo().subscribe(data => {
      this.ocPackage = data.response;
    }, err => {
      this.error = err.message;
    });

    this.displayAllRecord();

  }

  public displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'standard_plan', headerName: 'Standard Plan', hide: false, width: 200 },
      { field: 'did_bundle_plan', headerName: 'DID Bundle Plan', hide: false, width: 200 },
      { field: 'Outgoing_bundle_plan', headerName: 'Outgoing Bundle Plan', hide: false, width: 200 },
      { field: 'roaming_bundle_plan', headerName: 'Roaming Plan', hide: false, width: 200 },
      { field: 'tc_plan', headerName: 'Tele Consultancy Plan', hide: false, width: 220 },
    ];

    this.packageService.getPbxFeatures(Number(this.customer_id), 1).subscribe(packageData => {


      // this.getData(featurePlanRateId)
      this.callPlanService.getCallPlan().subscribe(data => {


        let standard = data.response.filter(item => item.id == packageData['response'][0]['call_plan_id']);
        if (standard[0]) {
          // this.callPlanData.push({ standard_plan : standard[0]['name']})
          Object.assign(this.callPlanData[0], { standard_plan: standard[0]['name'] })


        }
      })


    })

    this.userService.getCustomerAssociateMinutePlan(this.customer_id).subscribe(minuteData => {
      // this.callPlanData['bundle_plan'] = minuteData['response']['0'][0].name;
      this.callPlanData.push({
        did_bundle_plan: minuteData['response']['0'][0].name,
        roaming_bundle_plan: minuteData['response']['1'][0].name,
        tc_plan: minuteData['response']['2'][0].name,
        Outgoing_bundle_plan: minuteData['response']['3'][0].name
      });
      // this.callPlanData.push({roaming_bundle_plan: minuteData['response']['1'][0].name});
      // this.callPlanData.push({tc_plan: minuteData['response']['2'][0].name});
      // this.callPlanData.push({Outgoing_bundle_plan: minuteData['response']['3'][0].name});


      this.manageUserActionBtn(this.callPlanData)
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': this.callPlanData });
    })


  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-eye edit-button ' style='cursor:pointer; display: inline' data-action-type='Details' title='Details'></i>";
      finalBtn += "</span>";
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "Details":
        return this.callPlanDetails();
    }
  }

  callPlanDetails() {
    this.router.navigate(['user/view/minute-plan-associate'], { queryParams: { custId: this.customer_id } });
    this.dialogRef.close();
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  loadCustomerData() {
    this.userService.getCustomerById(this.customer_id).subscribe(async data => {
      this.storeCircle = data.response[0].circle_id != 0

      // if(data.response[0].date == '1899-11-29T18:38:50.000Z' || data.response[0].date == null){
      //   // this.todayDate = new Date(data.response[0].date)
      // }else{
      this.todayDate = data.response[0].date;
      // }

      if (data.response[0].date == '00/00/0000') {
        this.defaultDate = true;
        this.assignDefaultDate = '';


      }
      this.billingBind = data['response']['0']['billing_type'];
      if (data.response[0]['country_id'] !== null, data.response[0]['cli_type'] !== null, data.response[0]['package_name'] !== null, data.response[0]['account_manager_id'] !== null, data.response[0]['circle_id'] !== null) {
        this.ReadCountry = true;
      }
      else {
        this.ReadCountry = false;
      }
      this.cust_state = parseInt(data.response[0]['state_id']);
      this.invoiceStatus = data.response[0]['invoice_status'] ? data.response[0]['invoice_status'] : '1'; // 1= paid , 2 = unpaid
      var pack_arr = data.response[0]['package_id'].split(',');
      if (data.response[0]['country_id'] == 99) {
        this.isIndia = true;
      } else {
        this.isIndia = false;
      }

      this.cli_type_tog = data.response[0]['cli_type'] == 1 ? true : false;

      for (let i = 0; i < pack_arr.length; i++) {
        this.userService.getPackageProductWise(pack_arr[i])
          .subscribe(response => {
            if (response.response[0]['product_id'] == 1) {
              setTimeout(() => {
                this.pbx_package_id = Number(response.response[0]['id']);
              }, 500);
              let isBundle = data.response[0].is_associate_with_bundle_plan;
              if (isBundle === 1) {  //Bifurcation of bundle plan or non-bundle plan
                this.userService.getCustomerBillingTypePackage(response.response[0]['product_id'], response.response[0]['id'])
                  .subscribe(datas => {
                    this.billingType = datas.resp;

                    this.filterPBXP = this.PBXPFilter = this.billingType.slice();
                    this.holdDefaultbillingType = datas.resp;
                  });
              }
              else {
                this.pbxData = response.response[0]['product_id'];
                this.packageID = response.response[0]['id']

                if (this.storeCircle == true) {
                  this.onCircleSelect()
                }
                else {


                  this.userService.getCustomerBillingTypeAndWithOutBundlePackage(response.response[0]['product_id'], response.response[0]['id'])
                    .subscribe(datas => {

                      this.billingType = datas.resp;
                      this.filterPBXP = this.PBXPFilter = this.billingType.slice();
                      this.holdDefaultbillingType = datas.resp;
                    });
                }
              }
              // this.userService.getCustomerBillingTypePackage(response.response[0]['product_id'], this.pbx_package_id)
            } else if (response.response[0]['product_id'] == 2) {
              this.oc_package_id = response.response[0]['id'];
              this.productService.getPbxPackageInfo().subscribe(data => {
                this.billingType = data.response;
                this.filterPBXP = this.PBXPFilter = this.billingType.slice();

              });
            }
          });
      }

      //get products and mark check
      this.productService.getProductInfo().subscribe(datas => {
        if (localStorage.getItem('ByReseller') == '3' || data.response[0].created_by != 2) {
          this.restrictProduct(datas.response, data.response[0].created_by);
        } else {
          this.products = datas.response;
          for (var i = 0; i < this.products.length; i++) {
            if (this.active_products[i] == '1') {
              this.products[0]['active'] = true;
            }
            if (this.active_products[i] == '2') {
              this.products[1]['active'] = true;
            }
          }
        }
      });

      data.response[0]['time_zone_id'] = parseInt(data.response[0].time_zone_id);
      const userdata = data.response[0]

      this.userData = userdata;

      let threshold = this.userData.threshold_balance_notification ? this.userData.threshold_balance_notification.split(',') : '';

      if (threshold.includes('50')) {
        this.isFifty = true;
      } else {
        this.isFifty = false;
      }
      if (threshold.includes('75')) {
        this.isSeventyFive = true;
      } else {
        this.isSeventyFive = false;
      }
      if (threshold.includes('90')) {
        this.isNinety = true;
      } else {
        this.isNinety = false;
      }

      this.consume_hit = this.userData.consume_hit;
      this.userData.is_Li = this.userData.is_Li = '1' ? true : false;
      // this.userData.plugin = this.userData.plugin = 'Y' ? true : false;
      this.userData.is_circle = this.userData.is_circle == '1' ? true : false;
      this.userData.is_SetDate = this.userData.is_SetDate == '1' ? true : false;
      this.userData.circle_id = Number(this.userData.circle_id);
      this.userData.apiToken = Number(this.userData.api_token);
      this.userData.is_notification_email = Number(this.userData.is_email_notification);
      this.userData.dunning = Number(this.userData.dunning);
      if (this.userData.dunning == true || this.userData.dunning == '1') {
        this.email_disable = true;
      }
      this.userData.intercom_calling = this.userData.intercom_calling == '1' ? true : false;
      this.userData.enterprise_directory = this.userData.enterprise_directory == '1' ? true : false;
      setTimeout(() => {
        this.dialout_id = Number(this.userData.dialout_group);
      }, 500);


      if (this.userData.is_notification_email == 1) this.changeNotificationEmail({ 'checked': true })
      this.packageService.getPackageExtensionCount({ package_id: this.userOldPackage }).subscribe(data => {
        this.oldExtensionLimitValue = data[0].extensionCount;
        //this.selectPBXPackage({ value: this.userOldPackage }); // new chages on 31 march by nagender for extension limit issue while update customer

      });

      this.customerdashboardService.getTotalExtension(this.data.id).subscribe(data => {
        this.totalCustomerExtension = data[0].count;
      });

      this.emailId = this.userData.email;
      // this.userType = data.response[0].role;
      this.userType = data.response[0].role_id;
      if (this.userData.billing_type == '1') {
        this.isCredtiLimit = false;
        this.userForm.controls.credit_limit.disable();
      } else {
        this.isCredtiLimit = true;
      }

      // if (this.userData.billing_type == '1') {   // show package type
      //   this.packageType = 'Standard';
      // }else if(this.userData.billing_type == '2'){
      //   this.packageType = 'Enterprise with pool';
      // }else{
      //   this.packageType = 'Enterprise without pool';
      // }

      if (this.userData.pckg_billing_type == '1') {   // show package type
        this.packageType = 'Standard';
      } else if (this.userData.pckg_billing_type == '2') {
        this.packageType = 'Enterprise pool';
      } else {
        this.packageType = 'Enterprise bucket';
      }


      this.countryCode = this.userData.country_code;
      if (this.userData.country_id == '99') {
        this.isState = true;
      } else {
        this.isState = false;
      }

      if (this.userData.plugin == "Y") {
        this.is_plugin = true;
      } else {
        this.is_plugin = false;
      }

      if (this.userData.intercom_calling == '1') {
        this.isIntercom = true;
      } else {
        this.isIntercom = false;
      }

      if (this.userData.enterprise_directory == "1") {
        this.isEnterprise = true;
      } else {
        this.isEnterprise = false;
      }


      // this.countryCode = this.userData.country_code;
      // if(this.userData.country_code == '99'){
      //   this.isCircle = true;
      // }else{
      //   this.isCircle = false;
      // }

      // this.countryCode = this.userData.country_code;
      // if(this.userData.country_code == '99'){
      //   this.isLi = true;
      // }else{
      //   this.isLi = false;
      // }

      var products = this.userData.product_id;
      this.active_products = products.split(','); //active product

      for (var i = 0; i < this.active_products.length; i++) {
        this.active_products[i] = this.active_products[i].replace(/^\s*/, "").replace(/\s*$/, "");
        this.products_arr.push(this.active_products[i]);
        if (this.active_products[i] == '1') {
          this.showPbx = true;
        }
        if (this.active_products[i] == '2') {
          this.showOc = true;
        }


      }
      //   if (this.isPbxAssign) {
      //     this.userService.getCustomerBillingTypePackage('1', this.pbx_package_id)
      //       .subscribe(datas => {
      //         this.billingType = datas.resp;
      //       });
      //   }
      let reminder = Number(this.userData.consume_hit / this.userData.total_hit) * 100;
      if (reminder == 25) {
        this.dynamicColorCoding = true;
      }
    });
  }

  restrictProduct(value, created_by) {
    let id = localStorage.getItem('id') == '2' ? created_by : localStorage.getItem('id');
    this.userService.getResellerProduct(id).subscribe(async (data) => {
      await data[0].product.split(',').forEach(item => {
        value.forEach(item2 => {
          if (item == item2.id) {
            this.products.push(item2)
          }
        })
      })
    })
    setTimeout(() => {
      for (var i = 0; i < this.products.length; i++) {
        if (this.active_products[i] == '1') {
          this.products[0]['active'] = true;
        }
        if (this.active_products[i] == '2') {
          this.products[1]['active'] = true;
        }
      }
    }, 1000);
  }

  Dialoutremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.dialoutGroupList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Circleremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.circleList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Managerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.managerArr.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  PBXremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.billingType.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Packageremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.ocPackage.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Timeremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.timeZone.filter((data) => {
      return data['gmtzone'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  checkValidIP(keyword) {
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


  chooseProduct(product) {
    let myproduct = product.source.value;
    let isChecked = product.checked;
    if (isChecked == true) {
      this.products_arr.push(myproduct);
    } else {
      this.products_arr = this.products_arr.filter(item => item !== myproduct);
    }
    if (myproduct == '1' && isChecked == true) {
      this.showPbx = true;
      this.userService.getCustomerBillingTypeAndWithOutBundlePackage(this.pbxData, this.packageID)
        .subscribe(datas => {
          this.billingType = datas.resp;
          this.filterPBXP = this.PBXPFilter = this.billingType.slice();
          this.holdDefaultbillingType = datas.resp;
        });
      this.userForm.get('pbx_package_name').setValidators(Validators.required);
      this.userForm.updateValueAndValidity();
    } else if (myproduct == '1' && isChecked == false) {
      // this.userForm.controls.pbx_package_name.reset;
      this.showPbx = false;
      this.userData.is_circle = false;
      this.userForm.controls.circle.clearValidators();
      this.userForm.controls.circle.updateValueAndValidity();
      this.userForm.get('circle').setValue('');
      this.userForm.controls.pbx_package_name.clearValidators();
      this.userForm.controls.pbx_package_name.updateValueAndValidity();
      this.userForm.get('pbx_package_name').reset();
      this.billingType = [];
      // this.userForm.get('pbx_package_name').clearValidators();
      // this.userForm.get('pbx_package_name').updateValueAndValidity();
      this.userForm.updateValueAndValidity();
    }
    if (myproduct == '2' && isChecked == true) {
      this.showOc = true;
      this.userForm.get('oc_package_name').setValidators(Validators.required);
      this.userForm.updateValueAndValidity();
    } else if (myproduct == '2' && isChecked == false) {
      this.userForm.get('oc_package_name').clearValidators();
      this.userForm.get('oc_package_name').updateValueAndValidity();
      this.userForm.updateValueAndValidity();
      this.showOc = false;
    }
  }

  api_access() {
    if (this.userForm.get('apiToken').value == true) {
      this.api_hits = true;
    } else {
      this.api_hits = false;
      this.userForm.get('request_hit').setValue('');
    }
  }

  handleSpace(e: any) {
    if (e.which === 32 && !e.target.value.length)
      e.preventDefault();
  }

  submitUserForm() {
    let flagss = 0;
    if (this.products_arr.length < 1) {
      this.toastr.error('Error!', 'Please select at least one product', { timeOut: 4000 });
      return;
    }
    // if(this.isPatternMatcheddd  == false){ 
    //   //  this.userForm.get('advance_payment').reset();
    //    this.toastr.error('Error!', "Balance Range should be 0 to 999999.99", { timeOut: 4000 });
    //    return;
    //  }    
    if (this.userForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.userForm.value;
      let threshold_fifty = this.userForm.get('threshold_fifty').value;
      let threshold_seventyFive = this.userForm.get('threshold_seventyFive').value;
      let threshold_ninety = this.userForm.get('threshold_ninety').value;

      if (threshold_fifty == true) {
        this.threshold_balance_notification.push(50)
      }
      if (threshold_seventyFive == true) {
        this.threshold_balance_notification.push(75)
      }
      if (threshold_ninety == true) {
        this.threshold_balance_notification.push(90)
      }

      let finalString = this.threshold_balance_notification.join(',');


      credentials['threshold_balance_notification'] = finalString;

      credentials.billing_type = this.userData.billing_type;
      if ((this.newExtensionLimitValue <= this.totalCustomerExtension) && this.isPackageChange) {
        this.toastr.error('Error!', packageExtensionLimitError, { timeOut: 4000 });
        return;
      }
      if (credentials.request_hit < this.consume_hit) {
        return this.toastr.error('Error!', 'Consume Hit can not be more than API Hit.', { timeOut: 2000 });
      }
      this.userService.checkEmailValid(credentials).subscribe(data => {
        if (data['id'] != '') {
          this.toastr.error('Error!', emailExist, { timeOut: 4000 });
          this.emailId = "";
          return
        } else {
          this.userService.checkCompanyValid(credentials).subscribe(data => {
            if (data['id'] != '') {
              this.toastr.error('Error!', checkCompany, { timeOut: 4000 });
              // this.emailId = "";
              // this.companyName = "";
              this.userForm.get('company').reset(); //formfields reset of company while company name has been duplicate.

              return
            } else {
              credentials.product_name = this.products_arr;
              credentials['user_type'] = this.userType;
              credentials['user_id'] = localStorage.getItem('id');
              if(this.userData){
                credentials['pbx_package_name'] = this.userData.package_id;
              }
              credentials['monthly_international_threshold'] = credentials['monthly_international_threshold'] ? Number(credentials['monthly_international_threshold']) : 0;
              this.userService.postUserData(credentials).subscribe(data => {
                this.toastr.success('Success!', userUpdated, { timeOut: 2000 });
                this.userService.updateGridList();
                this.dialogRef.close();
              }, err => {
                this.errors = err;
                this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
              });



              //   this.userService.PaidStatusCustomerInvoice(credentials.id).subscribe(status =>{
              //     flagss = 0;
              //     status.response.map(event =>{
              //       if(event['paid_status'] == 2 || event['paid_status'] == 3 || event['charge_status'] == 1 || event['charge_status'] == 0 || event['invoice_status'] == 1){    
              //       flagss = 1;
              //       return         
              //       }
              //     }) 
              //     if (flagss == 1) {
              //       this.toastr.error('Error!', "Outstanding balance", { timeOut: 2000 });
              //       this.dialogRef.close();
              //       return;                 
              //     }
              //     else{
              //   this.userService.postUserData(credentials).subscribe(data => {
              //     this.dialogRef.close();
              //     this.toastr.success('Success!', userUpdated, { timeOut: 2000 });
              //     this.userService.updateGridList();
              // }, err => {
              //     this.errors = err;
              //     this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
              //   });
              // }
              // });
            }
          });
        }
      });
    } else {
      this.toastr.error('Error!', invalidFormError, { timeOut: 2000 });
    }
  }

  getCountryCode(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }

  showCreditBox(e) {
    let billing_type = e.value;
    if (billing_type == '1') {
      this.isCredtiLimit = false;
      this.userForm.controls.balance.setValidators(Validators.required);
      this.userForm.controls.balance.updateValueAndValidity();
      this.userForm.controls.credit_limit.disable();

      this.userForm.controls.credit_limit.clearValidators();
      this.userForm.controls.credit_limit.updateValueAndValidity();
    } else {
      this.isCredtiLimit = true;
      this.userForm.controls.balance.setValidators(Validators.required);
      this.userForm.controls.balance.updateValueAndValidity();
      this.credit_value = '0.00';
      this.userForm.controls.credit_limit.setValidators(Validators.required);
      this.userForm.controls.credit_limit.updateValueAndValidity();
      this.userForm.controls.credit_limit.enable();
    }
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  selectPBXPackage(event) {
    this.pckgValue = event.value;

    this.packageService.getPackageInfoById(this.pckgValue, 1).subscribe(data => {
      this.newExtensionLimitValue = data.response[0].extension_limit;
      this.isPackageChange = true;
    });
  }

  public isChnageCircle(event) {
    let isCircleEnable = event.checked;
    if (isCircleEnable == true) {
      this.userForm.get('circle').setValue('');
      this.userForm.controls.circle.setValidators(Validators.required);
      this.userForm.controls.circle.updateValueAndValidity();
      // this.userForm.controls.pbx_package_name.clearValidators();
      // this.userForm.controls.pbx_package_name.updateValueAndValidity();
      // this.userForm.get('pbx_package_name').reset();
      // this.billingType = [];
    } else {
      this.userForm.controls.circle.clearValidators();
      this.userForm.controls.circle.updateValueAndValidity();
      this.userForm.get('circle').setValue('');
      // this.userForm.controls.pbx_package_name.clearValidators();
      // this.userForm.controls.pbx_package_name.updateValueAndValidity();
      // this.userForm.get('pbx_package_name').reset();
      this.billingType = [];

      this.userService.getCustomerBillingTypeAndWithOutBundlePackage(this.pbxData, this.packageID)
        .subscribe(datas => {
          this.billingType = datas.resp;
          this.filterPBXP = this.PBXPFilter = this.billingType.slice();
          this.holdDefaultbillingType = datas.resp;
        });
      this.billingType = this.holdDefaultbillingType;

    }
  }
  public isChnageDate(event) {
    let isSetDateEnable = event.checked;
    if (isSetDateEnable == true) {
      this.userForm.controls.date.setValidators(Validators.required);
      this.userForm.controls.date.updateValueAndValidity();
    } else {
      this.userForm.controls.date.clearValidators();
      this.userForm.controls.date.updateValueAndValidity();
      this.userForm.get('date').setValue('');

    }
  }

  public onCircleSelect() {
    // let circleId = event.value;
    let circleId = this.userForm.get('circle').value;

    this.billingType = []
    this.userForm.get('pbx_package_name').setValue('');
    // let circleId = this.userForm.get('circle').value;
    if (circleId) {
      this.productService.getPackageCircleBased(circleId).subscribe(data => {

        if (data.response.length == 0) {
          this.pbx_package_id = 0;
          //  this.pbxForm.controls.call_plan.setValidators(Validators.required);
          //  this.pbxForm.controls.call_plan.updateValueAndValidity();
          this.billingType = data.response;
          this.filterPBXP = this.PBXPFilter = this.billingType.slice();

          return;
        }
        this.billingType = data.response;
        this.filterPBXP = this.PBXPFilter = this.billingType.slice();
        this.pbx_package_id = Number(data.response[0].id);
      }, err => {
        this.error = err.message;
      });
    }
  }

  public getCircle() { //get circle data
    this.callplanService.getCircle().subscribe(data => {
      this.circleList = data.response;
      this.filterCircle = this.CircleFilter = this.circleList.slice()
    }, err => {
      this.errors = err.message;
    });
  }

  public closedUserInfoDailogBox() {
    // this.dialog.closeAll();
    this.dialogRef.close();
  }

  public refreshToken() {
    this.userForm.get('token').setValue((new Date().getTime()).toString(36) + Math.random().toString(36).substr(2));
  }

  public changeNotificationEmail(event) {
    let isEmail = event.checked;
    if (isEmail == true) {
      this.userForm.controls.notification_email.setValidators([Validators.pattern(EMAIL_RegEx), Validators.required]);
      this.userForm.controls.notification_email.updateValueAndValidity();
    } else {
      this.userForm.controls.notification_email.clearValidators();
      this.userForm.controls.notification_email.setValue('');
      this.userForm.controls.notification_email.updateValueAndValidity();
    }
  }

  public changeDunning(event) {
    if (event.checked == true) {
      this.dunning = true;
      this.userForm.get('is_notification_email').setValue(true);
      // this.userForm.controls.is_notification_email.disable();
      this.userForm.controls.is_notification_email.setValidators(Validators.required);
      this.userForm.controls.is_notification_email.updateValueAndValidity();
      this.userForm.controls.notification_email.setValidators(Validators.required);
      this.userForm.controls.notification_email.updateValueAndValidity();
    } else {
      this.dunning = false;
      this.userForm.controls.is_notification_email.setValue(false);
      this.userForm.controls.is_notification_email.enable();
      this.userForm.controls.is_notification_email.updateValueAndValidity()
      this.userForm.controls.notification_email.clearValidators();
      this.userForm.controls.notification_email.reset();
      this.userForm.controls.notification_email.updateValueAndValidity();
    }
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

  public changeLi(e) {
    let myKeyword = e.checked;
    if (myKeyword == true) {
      this.userForm.controls.Li.updateValueAndValidity();
      this.Li = true;
      this.userForm.controls.Li.enable();
    } else {
      this.userForm.controls.Li.disable();
      this.Li = false;
    }
  }
}

//add balance dialog
@Component({
  selector: 'addUserBalance-dialog',
  templateUrl: 'addUserBalance-dialog.html',
})

export class AddUserBalanceDialog {
  addBalanceForm: FormGroup;
  // minDate: Date;
  submitted = false;
  checkForm = '';
  lastBalance: any = 0;
  today: Date;
  maxDate: Date;
  minDate: Date;
  companyName: string = "";
  agentCommission;

  constructor(
    private router: Router,
    public dialogRefBalance: MatDialogRef<AddUserBalanceDialog>, @Inject(MAT_DIALOG_DATA) public data: CustomerData,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    private toastr: ToastrService,
    private userService: UserService,
  ) {
    // this.minDate = new Date();
    this.today = new Date();
    this.minDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.maxDate = this.today //new Date(this.today.getFullYear(), this.today.getMonth(), 25);    

    this.addBalanceForm = this.formBuilder.group({
      'payment_date': ['', Validators.required],
      'old_amount': [''],
      'amount': [0, [Validators.required, Validators.maxLength(7), Validators.minLength(1), Validators.pattern('^[+-]?([0-9]*[.])?[0-9]+$')]],
      'description': [''],
      'agent_commission': [''],
      'payment_type': ['1', Validators.required],
      'company_name': ['']
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
    this.lastBalance = this.data.balance;

    this.companyName = this.data.company_name + '(Ref. Code: ' + this.data.id + ')';
    this.agentCommission = this.data["commission"] != null && this.data["commission"] != "" ? true : false;
    this.addBalanceForm.get('agent_commission').setValue(this.agentCommission)
  }


  submitAddBalanceForm() {
    if (this.addBalanceForm.valid) {
      this.submitted = true;
      const credentials = this.addBalanceForm.value;
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
      credentials.commission = Number(this.data['commission']);
      credentials.created_by = Number(this.data['created_by']);
      credentials.product = Number(this.data['product']);
      credentials.payment_type = Number(credentials.payment_type);
      credentials.amount = Number(credentials.amount);
      credentials.old_amount = Number(credentials.old_amount);
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

  public setBlankAmount(item) {
    this.addBalanceForm.get('amount').setValue(0);
    this.addBalanceForm.get('amount').clearValidators();
    this.addBalanceForm.get('amount').updateValueAndValidity();
    //  if(item.value == '2'){
    //   this.addBalanceForm.get('amount').setValidators(Validators.pattern('^[+-]?([0-9]*[.])?[0-9]+$'));
    //   this.addBalanceForm.get('amount').updateValueAndValidity();
    //  }

  }
}

//view call plan dialog
@Component({
  selector: 'viewCallPlan-dialog',
  templateUrl: 'view-callPlan-dialog.html',
})

export class ViewManagerCustomerCallPlanDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  callPlanRatesForm: FormGroup;
  checkForm: any;
  selectedValue: "";
  callPlanRateData: any = {};
  sessionId = "";
  sellingMinDuration = 0;
  errorField: any;
  dialPrefix = '';
  allGateway = '';
  defaultSellingBillingBlock = 60;
  sellingRate: any = 0;

  constructor(
    public dialogRef: MatDialogRef<ViewManagerCustomerCallPlanDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private gatewayService: GatewayService,
  ) {
    this.callPlanRatesForm = this.fb.group({
      'call_plan': [''],
      'dial_prefix': [''],
      'buying_rate': [''],
      'selling_rate': [''],
      'selling_min_duration': ['0'],
      'selling_billing_block': [60],
      'gateway': ['']
    });
  }

  ngOnInit() {
    this.sessionId = this.route.snapshot.queryParams.id;
    this.callplanService.getCallPlan().subscribe(data => {
      this.selectedValue = data.response;
    });

    if (this.data.id) {
      let customerId = this.data.id
      this.callplanService.viewCustomerCallPlanRate({ id: Number(customerId) }).subscribe(pagedData => {
        this.callPlanRateData = pagedData[0];
        this.dialPrefix = this.callPlanRateData.dPRefix;
        this.sellingRate = pagedData[0].sellingRate;
        this.sellingMinDuration = pagedData[0].selling_min_duration != '0' ? pagedData[0].dispSellingMinDuration : '0';
        this.defaultSellingBillingBlock = pagedData[0].dispSellingBillingBlock;
      });

    }

    this.gatewayService.getGateway({ id: null, ip: null, port: null, provider_id: null }).subscribe(data => {
      this.allGateway = data;
    });
  }

  cancelForm() {
    this.callPlanRatesForm.reset();
    this.callplanService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
}

//view customer sms plan dialog
@Component({
  selector: 'view-sms-package-dialog',
  templateUrl: 'view-sms-package-dialog.html',
})

export class ViewCustomerSMSPackageDialog {
  smsForm: FormGroup;
  serverData: any = {};
  // customer_id = "";
  providerList = "";

  constructor(
    public dialogRef: MatDialogRef<ViewCustomerSMSPackageDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private smsService: SmsService,
    private userService: UserService
  ) {
    this.smsForm = this.fb.group({
      'name': [{ value: '', disabled: true }],  // 'first_name': [{value:'' , disabled:true}],
      'validity': [{ value: '', disabled: true }],
      'charge': [{ value: '', disabled: true }],
      'no_of_sms': [{ value: '', disabled: true }],
      'remaining_sms': [{ value: '', disabled: true }],
      'provider': [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.smsService.getCustomerSMSid(this.data['id']).subscribe(data => {
      if (data['response'].id != null) {
        this.smsService.getSMSPlanByID(data['response']['id']).subscribe(data => {
          this.serverData = data[0];
        })
      } else {
        this.toastr.error('Error!', 'Customer has no SMS package', { timeOut: 2000 });
        this.smsForm.reset();
        this.callplanService.updateGridList();
        this.dialogRef.close();
      }
    })

    //get SMS Providers list
    let customer_id = localStorage.getItem('id');
    this.smsService.getSMSApi(customer_id).subscribe(data => {
      this.providerList = data;
    });
    this.getRemainingSMS();
  }

  cancelForm() {
    this.smsForm.reset();
    this.callplanService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public resetSMSPackage() {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>', text: 'You want to reset SMS package!', type: 'warning', showCancelButton: true, background: '#000000', confirmButtonText: 'Yes, Reset it!', cancelButtonText: 'No, keep it',
      preConfirm: () => {
        let customer_id = this.data ? this.data['id'] : localStorage.getItem('id');
        this.userService.resetCustomerSMSPackage(customer_id).subscribe(data => {
          if (data) {
            if (this.serverData.validity == '1' || this.serverData.validity == '2') {  // 1= monthlu ,2 = yearly
              let credentials = {};
              credentials['customer_id'] = this.data ? this.data['id'] : localStorage.getItem('id');
              credentials['amount'] = this.serverData['charge'] ? this.serverData['charge'] : 0;
              credentials['charge_type'] = 3; // for SMS
              credentials['description'] = 'Charge for SMS Reset Limit'; // for SMS
              this.userService.createSMSCharge(credentials).subscribe(data => {
                this.dialogRef.close();
                this.smsForm.reset();
                this.userService.updateGridList();
              })
            } else {
              this.dialogRef.close();
              this.smsForm.reset();
              this.userService.updateGridList();
            }
          }
        });
      }, allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({ title: '<span style="color:#FFFFFF;">Reset!</span>', text: 'SMS package has been reset.', type: 'success', background: '#000000' });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({ title: '<span style="color:#FFFFFF;">Cancelled</span>', text: 'SMS package is not reset.', type: 'error', background: '#000000', });
      }
    });

  }

  private getRemainingSMS() {
    let customer_id = this.data ? this.data['id'] : localStorage.getItem('id');
    this.userService.getCustomerRemainingSMS(customer_id).subscribe(data => {
      if (data) {
        this.serverData['remaining_sms'] = data;
        this.smsForm.get('remaining_sms').setValue(data);
        this.smsForm.updateValueAndValidity();
      }
    });
  }
}

@Component({
  selector: 'addNewRates-dialog',
  templateUrl: 'addNewRates-dialog.html',
})

export class NewCallRatesDialog {
  addRatesForm: FormGroup;
  serverData: any = {};
  // customer_id = "";
  providerList = "";

  constructor(
    public dialogRef: MatDialogRef<NewCallRatesDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private smsService: SmsService,
    private userService: UserService
  ) {
    this.addRatesForm = this.fb.group({
      'name': [{ value: '', disabled: true }],  // 'first_name': [{value:'' , disabled:true}],
      'validity': [{ value: '', disabled: true }],

    });
  }

  ngOnInit() {
    this.callplanService.getNewRates(this.data.id).subscribe(data => {
      console.log(data, "-----data-----");

    })


  }

  submitCallRateForm() {

  }


  cancleDialog(): void {
    this.dialogRef.close();
  }

}
