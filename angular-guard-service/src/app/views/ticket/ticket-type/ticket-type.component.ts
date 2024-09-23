import { Component, OnInit, Inject, } from '@angular/core';
import { TicketService } from '../ticket.service';
import { TicketType } from '../../../core/models/ticket_type.model';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { formError, Errors, CommonService, ExcelService, Name_RegEx, ProductService } from '../../../core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Page } from '../../../core/models';
import { ToastrService } from 'ngx-toastr';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-ticket-type',
  templateUrl: './ticket-type.component.html',
  styleUrls: ['./ticket-type.component.css']
})
export class TicketTypeComponent implements OnInit {
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
  menus: any;
  ticketMenu: any = '';
  packageMenu: any = '';

  constructor(
    public TicketService: TicketService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.ticketMenu = this.menus.find((o) => o.url == '/ticket/ticket-type/view');
    this.filterForm = this.fb.group({
      'name': [""],
    });

    this.displayAllRecord();
  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: this.ticketMenu.modify_permission == '0' ? true : false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Ticket Type', hide: false, width: 10 },
      { field: 'product_name', headerName: 'Product', hide: false, width: 10 },
      { field: 'product_id', headerName: 'Product Id', hide: true, width: 10 },
      { field: 'description', headerName: 'Description', hide: false, width: 15 },

    ];
    if (this.isFilter) {
      this.filterObj = this.filterForm.value
    } else {
      this.filterObj = {};
    }
    let role = Number(localStorage.getItem('type'));
    let ResellerID = Number(localStorage.getItem('id'));
    let queryParams =  {}
    queryParams['role'] = role;
    queryParams['ResellerID'] = ResellerID;
    queryParams['filterObj'] =  this.filterObj.name;    
    // this.TicketService.getticketList(this.filterObj).subscribe(pagedData => { // before
      this.TicketService.getticketList(queryParams).subscribe(pagedData => {
      this.exportData = pagedData;
      this.dataSource = [];

      pagedData = this.manageUserActionBtn(pagedData);
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    }, err => {
      this.error = err.message;
    }
    );
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
      { header: 'Ticket Type', key: 'name', width: 25 },
      { header: 'Product Name', key: 'product_id', width: 80 },
      { header: 'Description', key: 'description', width: 80 }
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
      let strCode = this.exportData[i].code;
      //let strCode1 = strCode.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Name: this.exportData[i].ticket_name,
        ProductName: this.exportData[i].product_name,
        Description: this.exportData[i].description
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
    worksheet.spliceRows(1, 0, new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'featureCode');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'tickettype');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Ticket Type", "Product Name", "Description"];
    var rows = [];
    this.exportData.forEach(element => {
      let strCode = element.code;
      //let strCode1 = strCode.replace(/<[^>]*>/g, '');
      const e11 = [element.name, element.product_name, element.description,];
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
        3: { cellWidth: 'wrap' }
      },
    });
    doc.save('TicketType.pdf');
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

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoticketDialog, {
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

  manageUserActionBtn(pagedData) {

    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      if (this.ticketMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (pagedData[i].reserved == '1') {
        pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
        finalBtn += "<i class='fa fa-rocket views-button' style='cursor:pointer; display: inline;' data-action-type='release' title='Release'></i>\
      ";
      } else {
        if (pagedData[i].status == 'Active') {
          pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
          finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>\
        ";
        }
        // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      finalBtn += "</span>";

      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editTicket(data);
      case "delete":
      // return this.updateCircle();
      //   case "inactive":

    }
  }
  addTicketType() {
    this.openDialog(null)
    // this.router.navigate(['config/addCircle'], { queryParams: { id: null } });
  }
  editTicket(data: any) {
    this.openDialog(data);
    //his.router.navigate(['config/manage-circle'], { queryParams: {id:data.id } });
  }

  openDialog(data?): void {
    // alert(id);

    const dialogRef = this.dialog.open(addTicketTypeDialog, { width: '50%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }
}
//Add Ticket Type
@Component(
  {
    selector: 'addTicketTypeDialog',
    templateUrl: 'addTicketTypeDialog.html',
  })
export class addTicketTypeDialog {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  ticketForm: FormGroup;
  page = new Page();
  rows = new Array<TicketType>();
  // name = "";
  // description = "";
  isEdit: boolean = false;
  errorField: any;
  ticketData: any;
  productList = [];
  constructor(
    public dialogRef: MatDialogRef<addTicketTypeDialog>, @Inject(MAT_DIALOG_DATA) public data: TicketType,
    private router: Router,
    private fb: FormBuilder,
    public TicketService: TicketService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private productService: ProductService,
  ) {
    this.ticketForm = this.fb.group({
      'name': [""],
      'product_id': [""],
      'description': [""],
    });
  }
  get name() { return this.ticketForm.get('name'); }
  get product() { return this.ticketForm.get('product_id'); }
  get decription() { return this.ticketForm.get('decscription'); }

  ngOnInit() {

    this.productService.getProductInfo().subscribe(data => {
      this.productList = data.response ? data.response : [];
      if (this.productList.length > 0 && (!this.data)) this.ticketData.product_id = this.productList[0]['id'];
    });

    this.ticketData = this.data;
    this.isEdit = true;
    if (!this.data) {
      this.ticketData = {
        name: '',
        product_id: '',
        description: ''
      };
    }

  }
  public findInvalidControls() {
    const invalid = [];
    const controls = this.ticketForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }
  submitTicket() {
    if (this.ticketForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.ticketForm.value;
    
      let strArray = credentials.name.split(" ");
      let cpt = ""
      strArray.forEach(function (entry) {
        // cpt += entry.charAt(0).toUpperCase() + entry.slice(1)+ ' ';
        let space = strArray.length > 1 ? ' ' : '';
        cpt += entry.charAt(0).toUpperCase() + entry.slice(1) + space;
      });
      credentials.name = cpt.trim();

      if (this.data) {
        credentials.id = this.data.id;
        this.TicketService.updateTicket(credentials)
          .subscribe(data => {
            if (data['code'] == 200) {
              this.toastr.success('Success!', data['message'], { timeOut: 2000 });
              this.reloadFeature();
            }
            else {
              this.toastr.error('Error!', data['message'], { timeOut: 2000 });
            }
          });

      } else {
        credentials['role'] = Number(localStorage.getItem('type'));
        credentials['user_id'] = Number(localStorage.getItem('id'));
        this.TicketService.addTicket(credentials)
          .subscribe(data => {
            if (data['code'] == 200) {
              this.toastr.success('Success!', data['message'], { timeOut: 2000 });
              this.reloadFeature();
            }
            else {
              this.toastr.error('Error!', data['message'], { timeOut: 2000 });
            }
          });


      }

      //   credentials.id = this.data.id ? this.data.id : null;
    }
  }
  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  reloadFeature() {
    this.ticketForm.reset();
    this.TicketService.updateGridList();
    this.dialogRef.close();
  }

}

//Edit Ticket Type

@Component(
  {
    selector: 'manage-ticketTypeDialog',
    templateUrl: 'manage-ticketTypeDialog.html',
  })
export class manageTicketDialog {
  TicketForm: FormGroup;
  ticketeData: any;
  ticketId: any;
  constructor(
    private fb: FormBuilder,
    public TicketService: TicketService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private CommonService: CommonService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.ticketeData = params['ticketeData'];
    });
  }

  ngOnInit() {
    this.TicketForm = this.fb.group({
      'name': ["", [Validators.required, Validators.pattern("[a-zA-Z ]+")]],
      'description': [""],
    });
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.TicketForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitTicket() {
    if (this.TicketForm.valid) {
      let ticketName = this.TicketForm.value.name;

      this.TicketForm.value.name = ticketName.replace(/^./, ticketName[0].toUpperCase())

      let updateticketeData = this.TicketForm.value;
      updateticketeData.id = this.ticketId;
      // we can pass form data on Service now.
      this.TicketService.updateTicket(updateticketeData).subscribe((data) => {

        this.toastr.success('Success!', data['message'], { timeOut: 2000 });
        this.router.navigate(['ticket/ticket-type']);

      });

    }

  }

  cancelForm() {
    this.TicketForm.reset();
    this.router.navigate(['ticket/ticket-type'])
  }
}

// info Dialog
@Component({
  selector: 'InfoticketDialog',
  templateUrl: 'InfoticketDialog.html',
})

export class InfoticketDialog {
  // dialogRefInfo: any;


  constructor(public dialogRef: MatDialogRef<InfoticketDialog>,) { }

  cancleDialog(): void {
    this.dialogRef.close();
  }

}