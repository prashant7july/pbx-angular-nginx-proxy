import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, ExcelService, Name_RegEx, invalidForm, errorMessage, provderCreated, duplicateprovder, CommonService, provderUpdated, providerInUse } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { ProviderService } from '../provider.service';
import { Page, ProviderDetail } from '../../../core/models';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../../environments/environment.prod';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';

declare const ExcelJS: any;
const URL = environment.api_url + 'uploadCsv/';
export var imagePath: any;

@Component({
  selector: 'app-create-provider',
  templateUrl: './create-provider.component.html',
  styleUrls: ['./create-provider.component.css']
})
export class CreateProviderComponent implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  providerForm: FormGroup;
  page = new Page();
  rows = new Array<ProviderDetail>();
  providerName = "";
  errorControl = "";
  provider_id = '';
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  menus: any;
  providerMenu: any = '';

  public uploader: FileUploader = new FileUploader({
    url: URL, itemAlias: 'file',
    allowedFileType: ['xls', 'xlsx', 'csv'], method: 'post'
  });

  constructor(
    private providerService: ProviderService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
  ) {
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.providerMenu = this.menus.find((o) => o.url == '/config/provider');
    this.providerService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log('File Upload:uploaded:', item, status, response);
      console.log(URL);
      imagePath = URL + item.file.name;
      // this.imagePath1 = item.file.name;
      // this.uploadImageFile = item.file.name;//when image uploaded show imge on frontend
      console.log('imagePath', imagePath);
      console.log('Import uploaded successfully');
      // alert('File uploaded successfully');
    };
    this.uploader.onCompleteAll = () => {
      this.displayAllRecord();
    }
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'provider', headerName: 'Provider', hide: false, width: 100 },

    ];
    this.providerService.viewProviderDetails('','').subscribe(pagedData => {
      this.exportData = pagedData;
      pagedData = this.manageUserActionBtn(pagedData);
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    });
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
      { header: 'Provider', key: 'Provider', width: 30 }
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
        Provider: this.exportData[i].provider
      });
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

    // this.excelService.exportAsExcelFile(arr, 'provider');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'provider');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Provider"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.provider];
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
        0: { cellWidth: 'wrap' }
      },
    });
    doc.save('provider.pdf');
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      if(this.providerMenu.all_permission == '0' && this.providerMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.providerMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (this.providerMenu.delete_permission) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      if(pagedData[i].did_id  != null || pagedData[i].gateways != null){ 
      finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='ViewAssociate' title='View Associate'></i>";      
      }
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  verifyProvider(keyword) {
    let mykeyword = keyword.target.value;
    this.providerService.verifyProvider(mykeyword).subscribe(data => {
      if (data.provider >= 1) {
        this.toastr.error('Error!', "Provide is already exists", { timeOut: 4000 })
        this.providerName = "";
      }
    }, err => {
      this.error = err.message;
    });
  }

  editProvider(data) {
    this.openDialog(data.id);
    this.provider_id = data.id;
  }

  deleteProvider(data) {
    // this.providerService.isProviderInUse(data.id).subscribe(apiData => {
    //   if(apiData.ids < 1){
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover provider </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " + data.provider + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.providerService.deleteProvider(data.id).subscribe(data => {
          
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
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Provider </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " + data.provider + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Provider </span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " + data.provider + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    });
    // }else{
    //   this.toastr.error('Error!', providerInUse, { timeOut: 8000 });
    // }        
    // });
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editProvider(data);
      case "delete":
        return this.deleteProvider(data);
      case "ViewAssociate":
        return this.viewAssociate(data);
    }
  }

  viewAssociate(data){
    
    this.router.navigate(['config/associateProvider'], { queryParams:  data });
    
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(ProviderDialog, { width: '40%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoProviderDialog, {
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
  selector: 'infoProvider-dialog',
  templateUrl: 'infoProvider-dialog.html',
})

export class InfoProviderDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoProviderDialog>, @Inject(MAT_DIALOG_DATA) public data: ProviderDetail,
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
  selector: 'provider-dialog',
  templateUrl: 'provider-dialog.html',
})
export class ProviderDialog {
  errors: Errors = { errors: {} };
  providerForm: FormGroup;
  submitted = false;
  providerName = "";
  error = '';
  provider_id = '';
  providerData: any = {};
  providerMenu : any;
  menus:any;

  constructor(
    public dialogRef: MatDialogRef<ProviderDialog>, @Inject(MAT_DIALOG_DATA) public data: ProviderDetail,
    private providerService: ProviderService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog
  ) {
    this.providerForm = this.fb.group({
      'provider': ["", Validators.required]
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.providerMenu = this.menus.find((o) => o.url == '/config/provider');
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  get provider() { return this.providerForm.get('provider'); }

  ngOnInit() {

    if(this.providerMenu.all_permission == '0' && this.providerMenu.view_permission == '1'){
      this.providerForm.disable();
    }
    this.provider_id = this.data.id;
    if (this.provider_id) {
      this.providerService.getProviderById(this.provider_id).subscribe(data => {
        this.providerData = data.response[0];
        this.providerName = this.providerData.provider;
      });
    }
  }

  submitProviderForm() {
    if (this.providerForm.valid) {
      this.submitted = true;
      const credentials = this.providerForm.value;
      //check provider
      this.providerService.verifyProvider(credentials.provider).subscribe(data => {
        if (data.provider >= 1 && this.provider_id != data.provider) {
          this.toastr.error('Error!', duplicateprovder, { timeOut: 4000 })
          this.providerName = "";
        } else {
          let path = this.data.id ? 'updateProvider' : 'createProvider';
          credentials['id'] = this.data.id ? this.data.id : '';
          this.providerService.createProvider(path, credentials)
            .subscribe(data => {
              let msg = this.data.id ? provderUpdated : provderCreated;
              this.toastr.success('Success!', msg, { timeOut: 2000 });
              this.providerService.updateGridList();
              this.dialogRef.close();
            }, err => {
              this.error = err;
              this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
            });
        }
      }, err => {
        this.error = err.message;
      });
    }
    else {
      this.toastr.error('Error!', invalidForm, { timeOut: 2000 });
    }
  }

  verifyProvider(keyword) {
    let mykeyword = keyword.target.value;
    this.providerService.verifyProvider(mykeyword).subscribe(data => {
      if (data.provider >= 1 && this.provider_id != data.provider) {
        this.toastr.error('Error!', "Provide is already exists", { timeOut: 4000 })
        this.providerName = "";
      }
    }, err => {
      this.error = err.message;
    });
  }
}
