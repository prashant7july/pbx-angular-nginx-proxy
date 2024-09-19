import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { TicketServerResultService, ProductService } from '../../../core/services';
import { Ticket } from '../../../core/models';
import { UserService } from '../../user/user.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmailService } from '../../../core/services/email.service';
import { ExcelService, AccountManagerService, Errors, CommonService, textareaMessage, ticketCreated, assignedToError } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { TicketService } from '../ticket.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService, ImageSettingsModel } from '@syncfusion/ej2-angular-richtexteditor';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { UserTypeConstants } from 'src/app/core/constants';


declare const ExcelJS: any;


export var productId = '1';

@Component({
  selector: 'app-view-ticket',
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.css']
})
export class ViewTicketComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  filterForm: FormGroup;
  isFilter = false;
  userRole = "";
  selectedValue: any = [];
  productId = "";
  todayDate = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  hideAssignee = false;
  hideCompany = false;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  exportData: any = {};
  defaultPageSize = '10';
  productList = [];
  productspaceremoved = [];
  ProductFilter: any;
  filterProduct: any;
  companyList = [];
  customerId;
  assigneeUser;

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields4: Object = { text: 'name', value: 'id' };
  public fields: Object = { text: 'company_name', value: 'id' };
  public placeholder4: string = 'Product';
  public placeholder5: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  //public fields2: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Assignee';
  menus: any;
  ticketViewMenu: any = '';


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private ticketServerResultService: TicketServerResultService,
    private productService: ProductService,
    private userService: UserService,
    public dialog: MatDialog,
    private ticketService: TicketService,
    public commonService: CommonService,
    private excelService: ExcelService,
    private accountManagerService: AccountManagerService
  ) {
    this.filterForm = this.fb.group({
      'by_range': [""],
      'by_ticket': [""],
      'by_status': [""],
      'by_company': new FormControl([]),
      'by_product': [""],
      'by_type': [""],
      'by_assignee': new FormControl([]),
    });

    this.maxDate.setDate(this.maxDate.getDate() + 0);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.userRole = localStorage.getItem('type');
    this.menus = JSON.parse(localStorage.getItem('menu'));
    if (this.userRole == '0') {
      this.ticketViewMenu = this.menus.find((o) => o.url == '/ticket/view');
    } else {
      this.ticketViewMenu = this.menus.find((o) => o.url == '/ticket');
    }
    this.customerId = localStorage.getItem('id');
    this.hideAssignee = this.userRole == '4' ? true : false;
    this.hideCompany = this.userRole == '1' ? true : false;
    localStorage.setItem('addMessageText', 'false');


    this.userService.getCustomerCompany(productId).subscribe(data => {
      this.companyList = data.response;
    }, err => {
      this.error = err.message;
    });

    this.ticketService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    this.productService.getProductInfo().subscribe(data => {
      this.productspaceremoved = this.productList = data.response;
      this.filterProduct = this.ProductFilter = this.productList.slice();
    });
    this.accountManagerService.getAccountManagerInfo(this.userRole, this.customerId).subscribe(data => {
      if (this.userRole == '1') {
        this.assigneeUser = data.response[0].name;
        accountManagerId = data.response[0].id;
      } else if (this.userRole == '0' || this.userRole == '4' || this.userRole == '5') {
        this.assigneeUser = data.response;
      }
    }, err => {
      console.log(err);
    });

    if (this.userRole == '5') {
      productId = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : '1';
      this.userService.getCustomerCompany(productId).subscribe(data => {
        this.selectedValue = data.response;
      }, err => {
        this.error = err.message;
      });
    } else if (this.userRole == '4') {
      this.userService.getAccountManagerCustomercompany(localStorage.getItem('id')).subscribe(data => {
        this.selectedValue = data.response;
      }, err => {
        this.error = err.message;
      });
    } else {
      productId = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : '1';
      this.userService.getCustomerCompany(productId).subscribe(data => {
        this.selectedValue = data.response;
      }, err => {
        this.error = err.message;
      });
    }
  }
  Assigneeremovespace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.assigneeUser.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Productremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.productList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Companyremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedValue.filter((data) => {
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: true, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'created_at', headerName: 'Date', hide: false, width: 15 },
      { field: 'company_name', headerName: 'Company', hide: this.hideCompany, width: 20 },
      { field: 'product', headerName: 'Product', hide: false, width: 10 },
      { field: 'ticket_number', headerName: 'Ticket Number', hide: false, width: 10 },
      { field: 'ticket_type', headerName: 'Type', hide: false, width: 10 },
      { field: 'assignedTo', headerName: 'Assignee', hide: this.hideAssignee, width: 10 },
      { field: 'message', headerName: 'Message', hide: false, width: 10 },
      { field: 'status', headerName: 'Status', hide: false, width: 10 },

    ];

    if (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2' || localStorage.getItem('type') === '3') {
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
      if (this.isFilter) {
        const credentials = this.filterForm.value;        
        this.ticketServerResultService.filterTicket(credentials, Number(role), Number(ResellerID)).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        });
      }
      else {

        this.ticketServerResultService.viewTicket({ id: null, role: Number(role), ResellerID: Number(ResellerID) }).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        });
      }
    }

    else if (localStorage.getItem('type') === '1') {
      this.productId = localStorage.getItem('product_id');
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        credentials.customerId = Number(localStorage.getItem('id'));
        this.productService.getProductCustomerWise(localStorage.getItem('id')).subscribe(data => {
          this.selectedValue = data.response[0];
          credentials.productId = Number(data.response[0].id);
          credentials.by_ticket = Number(credentials.by_ticket);
          credentials.by_status = Number(credentials.by_status);
          this.ticketServerResultService.filterCustomerTicket(credentials).subscribe(data => {
            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          });
        });
      }
      else {
        this.ticketServerResultService.viewTicketProductandCustomerwise(Number(localStorage.getItem('id')), Number(this.productId), 0).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        });
      }
    }

    else if (localStorage.getItem('type') === '4') {
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        credentials.customerId = localStorage.getItem('id');
        this.ticketServerResultService.filterAccountManagerTicket({ credentials: credentials, accountManagerId: localStorage.getItem('id') }).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        });
      }
      else {
        this.ticketServerResultService.viewAccountManagerTicket({ accountManagerId: localStorage.getItem('id') }).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        });
      }
    }

    else if (localStorage.getItem('type') === '5') {
      this.productId = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : localStorage.getItem('product_id');
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        credentials.customerId = localStorage.getItem('id');
        this.ticketServerResultService.filterSupportTicket({ credentials: credentials, productId: this.productId }).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        });
      }
      else {
        if (this.productId == '1') {
          this.ticketServerResultService.viewTicketPBXForSupport(0).subscribe(data => {
            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          });
        }
        else if (this.productId == '2') {
          this.ticketServerResultService.viewTicketOC(0).subscribe(data => {
            this.exportData = data;
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
          });
        }
      }
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
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };

    if (localStorage.getItem('type') == '4') {
      worksheet.columns = [
        { header: 'Date', key: 'Date', width: 20 },
        { header: 'Company', key: 'Company', width: 30 },
        { header: 'Product', key: 'Product', width: 23 },
        { header: 'Ticket Number', key: 'TicketNumber', width: 15 },
        { header: 'Type', key: 'Type', width: 15 },
        //{ header: 'Message', key: 'Message', width: 60 },
        { header: 'Status', key: 'Status', width: 10 }
      ];
    } else if (localStorage.getItem('type') == '1') {
      worksheet.columns = [
        { header: 'Date', key: 'Date', width: 20 },
        { header: 'Product', key: 'Product', width: 23 },
        { header: 'Ticket Number', key: 'TicketNumber', width: 15 },
        { header: 'Type', key: 'Type', width: 15 },
        { header: 'Assignee', key: 'Assignee', width: 25 },
        // { header: 'Message', key: 'Message', width: 60 },
        { header: 'Status', key: 'Status', width: 10 }
      ];
    } else {
      worksheet.columns = [
        { header: 'Date', key: 'Date', width: 20 },
        { header: 'Company', key: 'Company', width: 30 },
        { header: 'Product', key: 'Product', width: 23 },
        { header: 'Ticket Number', key: 'TicketNumber', width: 15 },
        { header: 'Type', key: 'Type', width: 15 },
        { header: 'Assignee', key: 'Assignee', width: 25 },
        // { header: 'Message', key: 'Message', width: 60 },
        { header: 'Status', key: 'Status', width: 10 }
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
    if (this.userRole == '4') {
      for (let i = 0; i < this.exportData.length; i++) {
        let strStatus = this.exportData[i].status;
        let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
        let strMessage = this.exportData[i].message;
        let strMessage1 = strMessage.replace(/<[^>]*>/g, '');
        worksheet.addRow({
          Date: this.exportData[i].created_at,
          Company: this.exportData[i].company_name,
          Product: this.exportData[i].product,
          TicketNumber: this.exportData[i].ticket_number,
          Type: this.exportData[i].ticket_type,
          // Message: strMessage1,
          Status: strStatus1
        });
      }
    } else if (this.userRole == '1') {
      for (let i = 0; i < this.exportData.length; i++) {
        let strStatus = this.exportData[i].status;
        let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
        let strMessage = this.exportData[i].message;
        let strMessage1 = strMessage.replace(/<[^>]*>/g, '');
        worksheet.addRow({
          Date: this.exportData[i].created_at,
          Product: this.exportData[i].product,
          TicketNumber: this.exportData[i].ticket_number,
          Type: this.exportData[i].ticket_type,
          Assignee: this.exportData[i].assignedTo,
          // Message: strMessage1,
          Status: strStatus1
        });
      }
    } else {
      for (let i = 0; i < this.exportData.length; i++) {
        let strStatus = this.exportData[i].status;
        let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
        let strMessage = this.exportData[i].message;
        let strMessage1 = strMessage.replace(/<[^>]*>/g, '');
        worksheet.addRow({
          Date: this.exportData[i].created_at,
          Company: this.exportData[i].company_name,
          Product: this.exportData[i].product,
          TicketNumber: this.exportData[i].ticket_number,
          Type: this.exportData[i].ticket_type,
          Assignee: this.exportData[i].assignedTo,
          //  Message: strMessage1,
          Status: strStatus1
        });
      }
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
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    // this.excelService.exportAsExcelFile(arr, 'ticket');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'ticket');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    if (this.userRole == '4') {
      var col = ["Date", "Company", "Product", "TicketNumber", "Type", "Status"];
      var rows = [];
      this.exportData.forEach(element => {
        let strStatus = element.status;
        let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
        const e11 = [element.created_at, element.company_name, element.product, element.ticket_number, element.ticket_type, strStatus1];
        rows.push(e11);
      });
    } else if (this.userRole == '1') {
      var col = ["Date", "Product", "TicketNumber", "Type", "Assignee", "Status"];
      var rows = [];
      this.exportData.forEach(element => {
        let strStatus = element.status;
        let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
        const e11 = [element.created_at, element.product, element.ticket_number, element.ticket_type, element.assignedTo, strStatus1];
        rows.push(e11);
      });
    } else {
      var col = ["Date", "Company", "Product", "Ticket Number", "Type", "Assignee", "Status"];
      var rows = [];
      this.exportData.forEach(element => {
        let strStatus = element.status;
        let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
        const e11 = [element.created_at, element.company_name, element.product, element.ticket_number, element.ticket_type, element.assignedTo, strStatus1];
        rows.push(e11);
      });
    }
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
    doc.save('ticket.pdf');
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      pagedData[i]['message'] = pagedData[i]['message'].replace(/<[^>]*>/g, '');//handle spacing     
      pagedData[i]['message'] = pagedData[i]['message'].trim();
      if (pagedData[i].status == 'Open') {
        pagedData[i].status = "<span style='color:#f5302e;'><strong>" + pagedData[i].status + "</strong></span>";
      } else if (pagedData[i].status == 'Inprogress') {
        pagedData[i].status = "<span style='color:#c69500;'><strong>" + pagedData[i].status + "</strong></span>";
      } else if (pagedData[i].status == 'Close') {
        pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
      } else if (pagedData[i].status == 'New') {
        pagedData[i].status = "<span style='color:#0000CD;'><strong>" + pagedData[i].status + "</strong></span>";
      } else {
        pagedData[i].status = "<span style='color:#09c9f4;'><strong>" + pagedData[i].status + "</strong></span>";
      }
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    if (this.ticketViewMenu.add_permission) {
      return this.ticketEdit(data);
    } else {
      return false;
    }

  }

  ticketEdit(event) {
    localStorage.setItem('addMessageText', 'false');

    if (!event.id) {
      this.openDialog(event.id);
    }
    else {
      this.ticketService.updateTicketNewStatus({ id: event.id, user_id: localStorage.getItem('id'), role: localStorage.getItem('type') }).subscribe(data => {
        this.resetTable();
      }, err => {
        this.error = err.message;
      });
      this.router.navigate(['ticket/view/manage'], { queryParams: { id: event.id, customerId: event.customer_id } });
    }
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(TicketDialog, { width: '60%', disableClose: true, data: { id: null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe();
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
    const dialogRefInfo = this.dialog.open(InfoTicketDialog, {
      width: '80%', disableClose: true, autoFocus: false,
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
      console.log('Dialog closed');
    });
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
  Productremoved = (event: any) => {

    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.productspaceremoved.filter((data: any) => {
      return data['name'].toLowerCase().includes(promptspace);
    })

    event.updateData(promptData);
  }

}

@Component({
  selector: 'infoTicket-dialog',
  templateUrl: 'infoTicket-dialog.html',
})

export class InfoTicketDialog {
  role: any;
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoTicketDialog>, @Inject(MAT_DIALOG_DATA) public data: Ticket,
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

export declare var tinymce: any;
export var accountManagerId: any;

@Component({
  selector: 'ticket-dialog',
  templateUrl: 'ticket-dialog.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService],
})

export class TicketDialog {
  public value: string = null;
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  ticketForm: FormGroup;
  selectedValue = [];
  promptFilter = [];
  ProductselectFilter: any;
  filterSelectProduct: any;
  selectedaccountManagerValue = [];
  Assignremovedspace = [];
  AssignToFilter: any;
  filterAssignTo: any;
  showMsg = false;
  msg = '';
  boxcolor = '';
  userType: any;
  customerId: any;
  checkForm: any;
  emailContentData: any = {};
  managerInfo: any = {};
  ticketNumberDisplay = "";
  selectedCustomerValue = "";
  countryRemoved = [];
  CompanyFilter: any;
  filterSelectCompany: any;
  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'name' };
  public fields1: Object = { text: 'company_name', value: 'id' };
  public fields3: Object = { text: 'company_name', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  //public fields2: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Product';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder1: string = 'Select Company';
  public placeholder2: string = 'Assigned To';
  public tools: object = { type: 'Expand', items: ['Undo', 'Redo', '|', 'Formats', '|', 'Bold', 'Italic', 'Underline', '|', 'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|', 'Alignments', '|', 'Indent', 'Outdent', '|', 'CreateLink', 'Image'] };
  public quickTools: object = { image: ['Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension'] };
  public insertImageSettings: ImageSettingsModel = { allowedTypes: ['.jpeg', '.jpg', '.png'], display: 'inline', width: '50%', height: '50%', saveFormat: 'Blob', saveUrl: null, path: null, }
  flag: any = false;

  constructor(
    public dialogRef: MatDialogRef<TicketDialog>, @Inject(MAT_DIALOG_DATA) public data: Ticket,
    private ticketService: TicketService,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private accountManagerService: AccountManagerService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private emailService: EmailService,
    private userService: UserService,

  ) {
    this.ticketForm = this.fb.group({
      'message': [''],
      'ticket_type': ['0', Validators.required],
      'assigned_to': [''],
      'ticket_number': [{ value: '', disabled: true }],
      'product': ['', Validators.required],
      'customer': ['']
    });
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }
  resellerAccountID: any
  resellerAccountname: any;
  resellerAccounttype: any;
  accManager: any

  ngOnInit() {
    this.resellerAccountID = localStorage.getItem("id");
    this.resellerAccountname = localStorage.getItem("user_name");
    this.resellerAccounttype = localStorage.getItem("type");
    this.accManager = {
      id: this.resellerAccountID,
      name: this.resellerAccountname,
      last_name: '',
      type: this.accManager,
      // role:4
    }
    if (this.data['flag']) {

      let value =
        `<div>\
      <h4>Caller: ${this.data['caller']}</h4></br>\
      <h4>Callee: ${this.data['callee']}</h4></br>\
      <h4>UUID: ${this.data['UUID']}</h4></br>\
      <h4>Start Time: ${this.data['start_time']}</h4></br>\
      </div>`

      this.ticketForm.get('message').setValue(value);

    }

    this.userType = localStorage.getItem('type');
    this.customerId = localStorage.getItem('id');
    this.ticketNumber(); //for ticket number
    if (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2' || localStorage.getItem('type') === '3' || localStorage.getItem('type') === '4' || localStorage.getItem('type') === '5') {
      this.productService.getProductInfo().subscribe(data => {
        this.promptFilter = this.selectedValue = data.response ? data.response : [];
        this.filterSelectProduct = this.ProductselectFilter = this.selectedValue.slice();
        if (this.selectedValue.length > 0) this.ticketForm.get('product').setValue(this.selectedValue[0]['name']);
      }, err => {
        this.errors = err.message;
      });
    } else if (localStorage.getItem('type') === '1') {
      this.productService.getProductCustomerWise(localStorage.getItem('id')).subscribe(data => {
        this.promptFilter = this.selectedValue = data.response ? data.response : [];
        this.filterSelectProduct = this.ProductselectFilter = this.selectedValue.slice();
        if (this.selectedValue.length > 0) this.ticketForm.get('product').setValue(this.selectedValue[0]['name']);
      }, err => {
        this.errors = err.message;
      });

    }
    // if(this.resellerAccounttype == 3){                      
    //   this.accManager = localStorage.getItem('user_name');
    //   // this.selectedaccountManagerValue.push(this.accManager)
    // }else{
    this.accountManagerService.getAccountManagerInfo(this.userType, this.customerId).subscribe(data => {
      if (this.userType == '1') {
        this.Assignremovedspace = this.selectedaccountManagerValue = data.response[0].name;
        this.filterAssignTo = this.AssignToFilter = this.selectedaccountManagerValue.slice();
        accountManagerId = data.response[0].id;
      } else if (this.userType == '0' || this.userType == '4' || this.userType == '5') {
        this.Assignremovedspace = this.selectedaccountManagerValue = data.response ? data.response : []; //
        this.filterAssignTo = this.AssignToFilter = this.selectedaccountManagerValue.slice();
        if (this.selectedaccountManagerValue.length > 0) this.ticketForm.get('assigned_to').setValue(this.selectedaccountManagerValue[0]['id']);
      }
      else if (this.userType == '3') {
        this.Assignremovedspace = this.selectedaccountManagerValue = data.response ? data.response : []; //
        this.filterAssignTo = this.AssignToFilter = this.selectedaccountManagerValue.slice();
        if (this.selectedaccountManagerValue.length > 0) this.ticketForm.get('assigned_to').setValue(this.selectedaccountManagerValue[0]['id']);
      }
    }, err => {
      this.errors = err.message;
    });
    // }
  }

  get product() { return this.ticketForm.get('product'); }
  get ticket_type() { return this.ticketForm.get('ticket_type'); }

  submitTicketForm() {
    this.submitted = true;
    this.errors = { errors: {} };
    const credentials = this.ticketForm.value;
    // if(this.resellerAccounttype == 3){
    //   credentials.assigned_to = this.resellerAccountID
    // }

    if (credentials.message == "") {
      this.toastr.error('Error!', textareaMessage, { timeOut: 2000 });
      return;
    }
    if (this.userType == '1') {
      credentials.assigned_to = accountManagerId;
    }
    if (this.userType == '4' || this.userType == '5') {
      credentials.customer_id = Number(credentials.customer);
    } else {
      credentials.customer_id = Number(this.customerId);
    }
    credentials.ticket_number = this.ticketNumberDisplay;
    credentials.id = null;
    credentials.role = Number(localStorage.getItem('type'));
    if (this.userType == '0' && credentials.assigned_to == '') {
      this.toastr.error('Error!', assignedToError, { timeOut: 2000 });
      return;
    }
    if (this.userType == '5') {
      credentials['assignedPerson'] = credentials.customer;
    } else if (this.userType == '4') {
      credentials['assignedPerson'] = localStorage.getItem('id');
    } else {
      credentials['assignedPerson'] = credentials.assigned_to;
    }
    credentials.ticket_type = Number(credentials.ticket_type);
    if (credentials.ticket_type == 0) credentials['ticket_type_name'] = 'New Feature'
    else if (credentials.ticket_type == 1) credentials['ticket_type_name'] = 'Issue'
    else if (credentials.ticket_type == 2) credentials['ticket_type_name'] = 'Others'

    this.ticketService.postTicket(credentials).subscribe(data => {
      this.toastr.success('Success!', ticketCreated, { timeOut: 2000 });
      this.ticketForm.reset();
      this.cancelForm();
    });
  }

  ticketNumber() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXTZ";
    var numbs = "1234567890";
    var string_length = 2;
    var number_lehgth = 4;
    var randomstring = '';
    var randomNum = '';
    for (var i = 0; i < string_length; i++) {
      var rstring = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rstring, rstring + 1);
    }

    for (var i = 0; i < number_lehgth; i++) {
      var rnum = Math.floor(Math.random() * numbs.length);
      randomNum += numbs.substring(rnum, rnum + 1);
    }
    this.ticketNumberDisplay = localStorage.getItem('id') + randomstring + randomNum;
    return randomstring;
  }

  cancelForm() {
    this.ticketForm.reset();
    this.ticketService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  selectCustomer(e) {
    // let myKeyword = e == 'PBX' ? '1' : '2';
    let myKeyword = e['itemData'].name == 'PBX' ? '1' : '2';

    if (this.userType == '5') {

      this.userService.getCustomerCompany(myKeyword).subscribe(data => {
        this.countryRemoved = this.selectedCustomerValue = data.response;
        this.filterSelectCompany = this.CompanyFilter = this.selectedCustomerValue.slice();
      }, err => {
        this.error = err.message;
      });
    } else if (this.userType == '4') {
      this.userService.getAccountManagerProductCustomercompany(localStorage.getItem('id'), myKeyword).subscribe(data => {
        this.countryRemoved = this.selectedCustomerValue = data.response;
        this.filterSelectCompany = this.CompanyFilter = this.selectedCustomerValue.slice();

      }, err => {
        this.error = err.message;
      });
    }
  }


  productremovedspace = (event: any) => {

    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.promptFilter.filter((data: any) => {
      return data['name'].toLowerCase().includes(promptspace);
    })

    event.updateData(promptData);
  }
  Countryremovedspace = (event: any) => {

    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.countryRemoved.filter((data: any) => {
      return data['company_name'].toLowerCase().includes(promptspace);
    })

    event.updateData(promptData);
  }
  Assignedremovedspace = (event: any) => {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.Assignremovedspace.filter((data: any) => {
      return data['name'].toLowerCase().includes(promptspace);
    })

    event.updateData(promptData);
  }

}




