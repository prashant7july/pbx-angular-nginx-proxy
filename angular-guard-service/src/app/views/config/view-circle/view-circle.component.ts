import { Component, OnInit, Inject, } from '@angular/core';
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


@Component({
  selector: 'app-view-circle',
  templateUrl: './view-circle.component.html',
  styleUrls: ['./view-circle.component.css']
})
export class ViewCircleComponent implements OnInit {
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
  displayData:boolean = false;
  //rows = new Array<circle>();


  constructor(
    public ConfigService: ConfigService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private configService: ConfigService,
  ) { }

  ngOnInit() {


    this.filterForm = this.fb.group({
      'name': [""],
    });

    this.displayAllRecord();

  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 5 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 5 },
      {
        field: 'description',
        headerName: 'Description',
        width: 35,
        flex: 1,
        wrapText: true,
        autoHeight: true,
        sortable: true,
        resizable: true,
        // wrapText: true,
        // cellRenderer: 'showMultiline',
        //  cellStyle: { 'white-space': 'normal', 'line-height': 1.5 },
        //  rowHeight: 50,
        //   autoHeight: true
      },

    ];

    if (this.isFilter) {
      this.filterObj = this.filterForm.value
    } else {
      this.filterObj = {};
    }
    this.ConfigService.getcircleList(this.filterObj).subscribe(pagedData => {
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
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 15 },
      { header: 'Description', key: 'Description', width: 80 },
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
        name: this.exportData[i].name,
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

    // this.excelService.exportAsExcelFile(arr, 'server');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'circle');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Name", "Description"];
    var rows = [];
    this.exportData.forEach(element => {
      let strCode = element.code;
      // let strCode1 = strCode.replace(/<[^>]*>/g, '');
      const e11 = [element.name, element.description];
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
        1: { cellWidth: 'auto' },
        // 2: {cellWidth: 'wrap'},
        // 3:{cellWidth: 'wrap'}
      },
    });
    doc.save('Circle.pdf');
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


  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {       
        let finalBtn = '';
        let descField = "";
        finalBtn += "<span>";
        // finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
        // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
        if(pagedData[i]['status'] == 1){
          finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewUsers' title='View Customers'></i>";
        }
        finalBtn += "</span>";
        // descField = `<div style="white-space': 'normal; line-height: 1.6;">${pagedData[i].description}</div>`;
        descField = pagedData[i].description;
        pagedData[i]['action'] = finalBtn;
        pagedData[i]['description'] = descField;
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
        return this.editCircle(data);
      case "delete":
        return this.deleteCircle(data);
      case "active":
        return this.updateCircle();
      case "inactive":
        return this.updateCircle();
      case "viewUsers":
        return this.showCustomer(data);
    }
  }
  updateCircle() { }

  showCustomer(data) {
    this.router.navigate(['config/circle/circleCustomer'], { queryParams: { gId: data.id, gName: data.name } });
  }

  addCircle() {
    this.openDialog(null)
    // this.router.navigate(['config/addCircle'], { queryParams: { id: null } });
  }

  editCircle(data: any) {
    this.openDialog(data);
    //his.router.navigate(['config/manage-circle'], { queryParams: {id:data.id } });
  }

  openDialog(data?): void {
    // alert(id);

    const dialogRef = this.dialog.open(Circle, { width: '80%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  deleteCircle(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: 'You will not be able to recover this Circle in future!',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.ConfigService.deleteCircle({ id: event.id }).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                text: 'This is Circle is already exist in other.',
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
          text: 'Circle has been deleted.',
          type: 'success',
          background: '#000000'
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: 'Circle is safe :)',
          type: 'error',
          background: '#000000',
        });
      }
    })
  }

  //open modelwindow
  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCircleDialog, {
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

//view Circle

@Component(
  {
    selector: 'viewCircle-dialog',
    templateUrl: 'viewCircle-dialog.html',
  })

export class Circle {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  templateUrl: 'view-dialog.html'
  circleForm: FormGroup;
  page = new Page();
  rows = new Array<circle>();
  c_name = "";
  description = "";
  isEdit: boolean = false;
  errorField: any;
  circleData: any;
  constructor(
    public dialogRef: MatDialogRef<Circle>, @Inject(MAT_DIALOG_DATA) public data: circle,
    private router: Router,
    private fb: FormBuilder,
    public ConfigService: ConfigService,
    private toastr: ToastrService,
    public commonService: CommonService,
  ) {
    this.circleForm = this.fb.group({
      'name': [""],
      'description': [""],
    });
  }

  get name() { return this.circleForm.get('name'); }
  get decription() { return this.circleForm.get('decscription'); }

  ngOnInit() {
    this.circleData = this.data;
    this.isEdit = true;
    if (!this.data) {
      this.circleData = {
        name: '',
        description: ''
      };
    }

  }


  public findInvalidControls() {
    const invalid = [];
    const controls = this.circleForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }


  submitCircle() {
    if (this.circleForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      let cArry = (this.circleForm.get('name').value).split(' ');
      let covertUppr = cArry.reduce((a, e) => { a.push(e.charAt(0).toUpperCase() + e.substr(1)); return a; }, []);
      this.circleForm.get('name').setValue(covertUppr.join(' '));
      const credentials = this.circleForm.value;
      if (this.data) {
        credentials.id = this.data.id;
        this.ConfigService.updateCircle(credentials)
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
        this.ConfigService.addCircle(credentials)
          .subscribe(data => {
            if (data['code'] == 200) {
              this.toastr.success('Success!', data['message'], { timeOut: 2000 });
              this.reloadFeature();
            }
            else {
              this.toastr.error('Error!', 'Circle Name already exist', { timeOut: 2000 });
            }
          });


      }


    }
  }
  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  reloadFeature() {
    this.circleForm.reset();
    this.ConfigService.updateGridList();
    this.dialogRef.close();
  }
}

//InfoCircleDialog
@Component({
  selector: 'infoCircle-dialog',
  templateUrl: 'infoCircle-dialog.html',
})

export class InfoCircleDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoCircleDialog>, @Inject(MAT_DIALOG_DATA) public data: Circle,
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

// manage circle

@Component({
  selector: 'manage-circle',
  templateUrl: 'manage-circle.html',
})

export class ManageCircle {

  circleForm: FormGroup;
  circleData: any;
  circleId: any;
  constructor(
    private fb: FormBuilder,
    public configService: ConfigService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private CommonService: CommonService,

  ) {
    this.route.queryParams.subscribe(params => {
      this.circleData = params['circleData'];
    });

  }

  ngOnInit() {

    // this.isEdit = true;
    // this.configService.getCircleById(this.circleId).subscribe(data => {
    //   this.circleData = data[0]; 
    // });

    this.circleForm = this.fb.group({
      'name': ["", [Validators.required, Validators.pattern("[a-zA-Z ]+")]],
      'description': [""],
    });

  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.circleForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancelForm() {
    this.circleForm.reset();
    this.router.navigate(['config/circle'])
  }


}

