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
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-dialout-group',
  templateUrl: './dialout-group.component.html',
  styleUrls: ['./dialout-group.component.css']
})
export class DialoutGroupComponent implements OnInit {
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
  dialOutGrpMenu: any = '';


  constructor(
    public ConfigService: ConfigService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.dialOutGrpMenu = this.menus.find((o) => o.url == '/config/dialout-group');

    this.filterForm = this.fb.group({
      'name': [""],
    });

    this.displayAllRecord();

  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 5 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 15 },
      { field: 'description', headerName: 'Description', hide: false, width: 15 },

    ];

    if (this.isFilter) {
      this.filterObj = this.filterForm.value
    } else {
      this.filterObj = {};
    }
    this.ConfigService.getDialOutGroupList(this.filterObj).subscribe(pagedData => {
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
      //let strCode1 = strCode.replace(/<[^>]*>/g, '');
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
      finalBtn += "<span>";

      if(this.dialOutGrpMenu.all_permission == '0' && this.dialOutGrpMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.dialOutGrpMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (this.dialOutGrpMenu.delete_permission) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      if(pagedData[i]['flag'] == 1){
      finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewUsers' title='View Customers'></i>";
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
        return this.editDialOutGroup(data);
      case "delete":
        return this.deleteDialOutGroup(data);
      case "viewUsers":
        return this.showCustomer(data);
    }
  }
  updateCircle() { }

  showCustomer(data) {
    
    this.router.navigate(['config/dialout-group/group-associate-customer'], { queryParams: { gId: data.id, gName: data.name } });
  }

  addCircle() {
    this.openDialog(null)
  }

  editDialOutGroup(data: any) {
    this.openDialog(data);
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddDialoutGroup, { width: '40%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  deleteDialOutGroup(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Dialout group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.ConfigService.deleteDialOutGroup({ id: event.id }).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                text: data['message'],
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
          html: "<span style='color:#FFFFFF;'> Dialout group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Dialout group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoCircleDialog, {
    //   width: '80%', disableClose: true, autoFocus: false,
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

@Component(
  {
    selector: 'addDialoutGroup-dialog',
    templateUrl: 'addDialoutGroup-dialog.html',
  })

export class AddDialoutGroup {
  dialoutForm: FormGroup;
  c_name = "";
  description = "";
  dialOutGrpMenu: any;
  menus : any;
  constructor(
    public dialogRef: MatDialogRef<AddDialoutGroup>, @Inject(MAT_DIALOG_DATA) public data: circle,
    private router: Router,
    private fb: FormBuilder,
    public ConfigService: ConfigService,
    private toastr: ToastrService,
    public commonService: CommonService,
  ) {
    this.dialoutForm = this.fb.group({
      'id': [""],
      'name': ["", Validators.required],
      'description': [""],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.dialOutGrpMenu = this.menus.find((o) => o.url == '/config/dialout-group');
  }

  get name() { return this.dialoutForm.get('name'); }
  get decription() { return this.dialoutForm.get('decscription'); }

  ngOnInit() {

    
    if(this.dialOutGrpMenu.all_permission == '0' && this.dialOutGrpMenu.view_permission == '1'){
      this.dialoutForm.disable();
    }
    if (this.data) {
      this.dialoutForm.patchValue(this.data);
    }
    
  }


  submitDialOutGroup() {
    if (this.dialoutForm.valid) {
      const credentials = this.dialoutForm.value;
      this.ConfigService.addDialOutGroup(credentials)
        .subscribe(data => {
          //console.log(data);
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.cancelForm();
          } else if (data['code'] == 1062) {
            data['message'] = 'Group name is already exist!'
            this.toastr.error(data['message'], 'Error!', { timeOut: 2000 });
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });

      // if(this.data){
      //   credentials.id = this.data.id;
      //   this.ConfigService.updateCircle(credentials)
      //   .subscribe(data => {
      //     //console.log(data);
      //     if (data['code'] == 200) {
      //       this.toastr.success('Success!', data['message'], { timeOut: 2000 });
      //       this.cancelForm();
      //     }
      //     else {
      //       this.toastr.error('Error!', data['message'], { timeOut: 2000 });
      //     }
      //   });

      // } else {
      //   this.ConfigService.addCircle(credentials)
      //   .subscribe(data => {
      //     if (data['code'] == 200) {
      //       this.toastr.success('Success!', data['message'], { timeOut: 2000 });
      //       this.cancelForm();
      //     }
      //     else {
      //       this.toastr.error('Error!', 'Circle Name already exist', { timeOut: 2000 });
      //     }
      //   });


      // }


    }
  }
  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  cancelForm() {
    this.dialoutForm.reset();
    this.ConfigService.updateGridList();
    this.dialogRef.close();
  }
}