import { Component, OnInit, ChangeDetectorRef, Inject, DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AllDID } from '../../../core/models';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { DidService } from '../did.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { didUpdated, Errors, CommonService, ExcelService, invalidFileType, rangeError, invalidForm, spaceError, didCreated, errorMessage, maxChanelMessage, duplicateDID, duplicateDIDInRange, num_not_start_with_ziro, importSuccessfully, importUnsuccessfully, Number_RegEx } from '../../../core';
import * as jsPDF from 'jspdf'
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../../environments/environment.prod';

declare const ExcelJS: any;
const URL = environment.api_url + 'uploadCsv/';
// const URL = 'http://localhost:3000'+ '/uploadCsv';   


export var imagePath: any;

@Component({
  selector: 'app-view-did',
  templateUrl: './view-did.component.html',
  styleUrls: ['./view-did.component.css']
})
export class ViewDidComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  countryList: any = "";
  filterCountry: any;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  userRole = '';
  rowData: any;
  companyData = [];
  exportData: any = {};
  defaultPageSize = '10';
  providerList: any = '';
  providerspace = [];
  ProviderFilter: any;
  filterProvider: any;
  menus: any;
  didViewMenu: any = '';

  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public fields1: Object = { text: 'provider', value: 'id' };
  public placeholder: string = 'Select Company';
  public placeholder1: string = 'Select Provider';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public popupWidth1: string = '170px';

  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';

  constructor(
    private router: Router,
    private didService: DidService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public commonService: CommonService,
    public dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      'by_did': [""],
      'by_country': new FormControl([]),
      'by_status': [""],
      'by_company': new FormControl([]),
      'by_did_type': [""],
      'by_provider': [""],
      'by_group': [""]
    });
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.didViewMenu = this.menus.find((o) => o.url == '/did/view');
    //get Providers list
    this.commonService.getProviders().subscribe(data => {
      this.providerspace = this.providerList = data.response;
      this.providerspace.unshift({ id: 0, provider: 'default' })

      this.filterProvider = this.ProviderFilter = this.providerList.slice();
    }, err => {
      this.error = err.message;
    });

    this.didService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.userRole = localStorage.getItem('type');
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filterCountry = this.countryList.slice();
    });

    //get company data
    this.commonService.getAllCustomerCompany().subscribe(data => {
      // this.companyData = data.response;
      data = data.response;
      for (let i = 0; i < data.length; i++) {
        this.companyData.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')' });
      }
    }, err => {
      this.error = err.message;
    });

  }


  Providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.providerList.filter((data) => {
      return data['provider'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  companyremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.companyData.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    var user_id = localStorage.getItem("id");
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 120 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'didDisplay', headerName: 'DID', hide: false, width: 150 },
      { field: 'country', headerName: 'Country', hide: false, width: 150 },
      { field: 'provider', headerName: 'Provider', hide: false, width: 150 },
      { field: 'did_group', headerName: 'Group', hide: false, width: 120 },
      { field: 'max_concurrent', headerName: 'Max CC', hide: false, width: 80 },
      { field: 'did_type', headerName: 'DID Type', hide: false, width: 120 },
      { field: 'company', headerName: 'Assigned to', hide: false, width: 100 },
      { field: 'active_feature', headerName: 'Feature For', hide: false, width: 100 },
      { field: 'fixrate', headerName: 'Monthly Rate', hide: false, width: 130 },
      { field: 'selling_rate', headerName: 'Selling Rate', hide: false, width: 120 },
      { field: 'vmn_num', headerName: 'VMN', hide: false, width: 120 },
      { field: 'status', headerName: 'Status', hide: false, width: 120 },

    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.didService.filterDID(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.didService.getDID(null, user_id).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
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
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'DID', key: 'Did', width: 20 },
      { header: 'Country', key: 'Country', width: 30 },
      { header: 'Provider', key: 'Provider', width: 25 },
      { header: 'Group', key: 'did_group', width: 25 },
      { header: 'Max CC', key: 'MaxCC', width: 15 },
      { header: 'DID Type', key: 'DidType', width: 30 },
      { header: 'Assigned to', key: 'ReservedFor', width: 25 },
      { header: 'Feature For', key: 'FeatureFor', width: 25 },
      { header: 'Monthly Rate', key: 'MonthlyRate', width: 25 },
      { header: 'Selling Rate', key: 'SellingRate', width: 25 },
      { header: 'Status', key: 'Status', width: 10 },
      { header: 'VMN', key: 'Vmn', width: 25 }
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
      let strStatus = this.exportData[i].status;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Did: this.exportData[i].did,
        Country: this.exportData[i].country,
        Provider: this.exportData[i].provider,
        did_group: this.exportData[i].did_group,
        MaxCC: this.exportData[i].max_concurrent,
        DidType: this.exportData[i].did_type,
        ReservedFor: this.exportData[i].company,
        FeatureFor: this.exportData[i].active_feature,
        MonthlyRate: this.exportData[i].fixrate,
        SellingRate: this.exportData[i].selling_rate,
        Vmn: this.exportData[i].vmn_num,
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
    // this.excelService.exportAsExcelFile(arr, 'did');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'did');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["DID", "Country", "Provider", "Group", "Max CC", "DID Type", "Assigned to", "Feature For", "Monthly Rate", "Selling Rate", "Status", "VMN"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.did, element.country, element.provider, element.did_group, element.max_concurrent, element.did_type, element.company, element.active_feature, element.fixrate, element.selling_rate, strStatus1, element.vmn_num];
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
        6: { cellWidth: 'wrap' },
        7: { cellWidth: 'wrap' }
      },
    });
    doc.save('did.pdf');
  }


  manageUserActionBtn(pagedData) {
    console.log(pagedData,"--d-d---");
    
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";

      if(this.didViewMenu.all_permission == '0' && this.didViewMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.didViewMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      
      if (pagedData[i].reserved == '1') {
        pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
        finalBtn += "<i class='fa fa-rocket views-button' style='cursor:pointer; display: inline;' data-action-type='release' title='Release'></i>\
      ";
      } else {
        if (pagedData[i].status == 'Active') {
          pagedData[i].status = "<span style='color:#379457;'><strong>" + pagedData[i].status + "</strong></span>";
          finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>\
        ";
        } else {
          pagedData[i].status = "<span style='color:#c69500;'><strong>" + pagedData[i].status + "</strong></span>";
          finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\
        ";
        }
      }
        if (this.didViewMenu.delete_permission && pagedData[i].reserved == '0') {
          finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
        }
      }
      finalBtn += "</span>";

      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  editDID(data) {
    // this.router.navigate(['did/manage'], { queryParams: { id: data.id } });
    this.openDialog(data.id);
  }

  deleteDID(data, action) {
    // alert(action);  
    if (action == 'delete') {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You will not be able to recover DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.didService.deleteDID(action, data.id).subscribe(data => {
            this.displayAllRecord();
          }, err => {
            this.error = err.message;
          });
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Deleted!</span>',
            html: "<span style='color:#FFFFFF;'> DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
            type: 'success',
            background: '#000000',
            timer: 3000
          });

        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: 'error',
            background: '#000000',
            timer: 3000
          });
        }
      });
    } else if (action == 'inactive') {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You can re-activate DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'>  in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, inactive it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.didService.deleteDID(action, data.id).subscribe(data => {
            this.displayAllRecord();
          }, err => {
            this.error = err.message;
          });
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Inactivated!</span>',
            html: "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> has been inactivated.</span>",
            type: 'success',
            background: '#000000',
            timer: 3000
          });

        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> is safe</span>",
            type: 'error',
            background: '#000000',
            timer: 3000
          });
        }
      });

    } else {

      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You can inactivate DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, active it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.didService.deleteDID(action, data.id).subscribe(data => {
            this.displayAllRecord();
          }, err => {
            this.error = err.message;
          });
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Activated!</span>',
            html: "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> has been activated.</span>",
            type: 'success',
            background: '#000000',
            timer: 3000
          });

        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: 'error',
            background: '#000000',
            timer: 3000
          });
        }
      });
    }
  }


  releaseDID(data) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>DID release may affect customer\'s destination services like IVR, Conference etc.</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, release it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.didService.releaseDID(data.id, data.customer_id, data.fixrate, data.product_id, Number(data.did), data.country).subscribe(data => {
          if (data.response == 200) {
            this.displayAllRecord();
          }
        }, err => {
          this.error = err.message;
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Released!</span>',
          html: "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> has been released.</span>",
          type: 'success',
          background: '#000000',
          timer: 4000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.did + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 4000

        });
      }
    });
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editDID(data);
      case "delete":
        return this.deleteDID(data, actionType);
      case "active":
        return this.deleteDID(data, actionType);
      case "inactive":
        return this.deleteDID(data, actionType);
      case "release":
        return this.releaseDID(data);
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

  openDialog(id?): void {
    const dialogRef = this.dialog.open(DIDDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.displayAllRecord();
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoDidDialog, {
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

  public importFile() {
    const dialogRef11 = this.dialog.open(ImportDID, {
      width: '60%', disableClose: true,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
        extensionId: localStorage.getItem('type') == '6' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRef11.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef11.close('Dialog closed');
      }
    });
    dialogRef11.afterClosed().subscribe(result => {
      // this.showNotInsertedValue = false;      
    });
  }

}

@Component({
  selector: 'infoDid-dialog',
  templateUrl: 'infoDid-dialog.html',
})

export class InfoDidDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoDidDialog>, @Inject(MAT_DIALOG_DATA) public data: AllDID,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'did-dialog',
  templateUrl: 'did-dialog.html',
})

export class DIDDialog {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  didForm: FormGroup;
  isDIDNumber: boolean;
  did_from = "";
  did_to = "";
  countryList = [];
  CountryFilter: any;
  filterCountry: any;
  isMonthlyRate: boolean;
  isSellingRate: boolean;
  maxLimit = "";
  providerList = [];
  ProviderFilter: any;
  filterProviderTwo: any;
  didData: any = {};
  billingType: any = "";
  didGroup: any;
  isEdit: boolean = false;
  vmn: boolean = false;
  vmnList = []
  selectVmn = false;
  filterVmn: any[];
  customNumber = false;
  vmnNumber: any;
  editVMN: boolean = false;
  isRange: boolean = false;
  didCountry: any;  
  CheckCountryBind:any;
  CountryBind:any;
  menus:any;
  didViewMenu:any;
  user:any;
  ProviderBind:any;

  public fields: Object = { text: 'provider', value: 'id' };
  public fields1: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'vmn_num', value: 'vmn_num' };
  public placeholder: string = 'Select Provider';
  public placeholder1: string = 'Select Country';
  public placeholder2: string = 'Select VMN Number';
  public popupHeight: string = '200px';
  public popupWidth: string = '220px';
  constructor(
    public dialogRef: MatDialogRef<DIDDialog>, @Inject(MAT_DIALOG_DATA) public data: AllDID,
    private didService: DidService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
  ) {
    this.didForm = this.fb.group({
      'didType': ['1'],
      'did_number': ["", [Validators.required, Validators.minLength(5), Validators.maxLength(15), Validators.pattern(num_not_start_with_ziro)]],
      'billing': ['', Validators.required],
      'provider': ["", Validators.required],
      'country': ['99', Validators.required],
      'concurrent_call': ['2', Validators.required],
      'activated': [''],
      'did_range_from': ["", [Validators.required, Validators.minLength(5), Validators.maxLength(15), Validators.pattern(num_not_start_with_ziro)]],
      'did_range_to': ["", [Validators.required, Validators.minLength(5), Validators.maxLength(15), Validators.pattern(num_not_start_with_ziro)]],
      'fixrate': ['', Validators.required],
      'connect_charge': ['0', Validators.required],
      'selling_rate': ['', Validators.required],
      'group': ['0', Validators.required],
      'is_did_range': [false],
      'vmn': ['',Validators.required],
      'number': ["", [Validators.required, Validators.minLength(10), Validators.maxLength(15), Validators.pattern(num_not_start_with_ziro)]]
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.didViewMenu = this.menus.find((o) => o.url == '/did/view');
  }

  get did_number() { return this.didForm.get('did_number'); }
  get billing() { return this.didForm.get('billing'); }
  get provider() { return this.didForm.get('provider'); }
  get country() { return this.didForm.get('country'); }
  get concurrent_call() { return this.didForm.get('concurrent_call'); }
  get did_range_from() { return this.didForm.get('did_range_from'); }
  get did_range_to() { return this.didForm.get('did_range_to'); }
  get fixrate() { return this.didForm.get('fixrate'); }
  get connect_charge() { return this.didForm.get('connect_charge'); }
  get selling_rate() { return this.didForm.get('selling_rate'); }
  get group() { return this.didForm.get('group'); }
  get virtual_number() { return this.didForm.get('vmn'); }
  get number() { return this.didForm.get('number'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.user = localStorage.getItem('type');
    if(this.didViewMenu.all_permission == '0' && this.didViewMenu.view_permission == '1'){
      this.didForm.disable();
      this.editVMN = true;
    }
    let vmnCheck = this.didForm.get('country').value;
    
    if(vmnCheck =='99' && this.isRange == false){      
      this.vmn = true;
    }
  
    this.didForm.controls.did_range_from.disable(); //when not range
    this.didForm.controls.did_range_to.disable(); //when not range
    this.didForm.controls.number.disable();
    this.isDIDNumber = true;
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response ? data.response : [];
      

      this.filterCountry = this.CountryFilter = this.countryList.slice();
      if (this.countryList.length > 0 && (!this.data['id']))
      if (!this.CheckCountryBind) {
        this.CountryBind = this.countryList[97]['id'];
      }
      
    }, err => {
      this.error = err.message;
    });

    if (this.data.id) {   
      this.didForm.get('vmn').clearValidators();
      this.didForm.get('vmn').updateValueAndValidity();       
      this.isEdit = true;
      this.didService.getDIDById(this.data.id).subscribe(data => {
        this.CheckCountryBind = data[0].id;
        this.didData = data[0];
        if(this.didData.did_group == '3'){
          this.isRange = false;
          this.vmn = true;
        }
        this.maxLimit = this.didData.max_concurrent;
        this.billingType = (this.didData.billingtype).toString();        
        this.didGroup = (this.didData.did_group).toString();
        if (this.didData.vmn_num !== null) {
          this.editVMN = true;
          this.selectVmn = true;          
          this.vmnNumber = this.didData.vmn_num;
        }
        this.manageRateByRes(this.billingType); 
        setTimeout(() => {
          this.ProviderBind = data[0]['provider_id']
          if(this.CheckCountryBind){
          this.CountryBind  = this.didData.country_id;
          }

        }, 500);             
      }, err => {
        this.errors = err.message;
      });
    }    
    this.didData.did_type = '1'; // used for set default value DID Number     
    this.commonService.getProviders().subscribe(data => {
      this.providerList = data.response;
      this.filterProviderTwo = this.ProviderFilter = this.providerList.slice();
      if (this.providerList.length > 0 && (!this.data['id'])) 
      this.didData.provider_id = this.providerList[0]['id'];
      this.filterProviderTwo = this.ProviderFilter = this.providerList.slice();

    }, err => {
      this.error = err.message;
    });
    this.didService.getVMNDetails(null).subscribe(data => {
      this.vmnList = data.response;
      this.filterVmn = this.vmnList.slice();
    });
  }
  providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.providerList.filter((data) => {
      return data['provider'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  vmnremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.vmnList.filter((data) => {
      return data['vmn_num'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  manageRateByRes(billingType) {
    if (billingType == '1') {
      this.isMonthlyRate = true;
      this.isSellingRate = true;
      this.didForm.controls.fixrate.enable();
      this.didForm.controls.selling_rate.enable();
    } else if (billingType == '2') {
      this.isMonthlyRate = true;
      this.isSellingRate = false;
      this.didForm.controls.fixrate.enable();
      this.didForm.controls.selling_rate.disable();
    } else if (billingType == '3') {
      this.isMonthlyRate = false;
      this.isSellingRate = true;
      this.didForm.controls.fixrate.disable();
      this.didForm.controls.selling_rate.enable();
    } else {
      this.isMonthlyRate = false;
      this.isSellingRate = false;
      this.didForm.controls.fixrate.disable();
      this.didForm.controls.selling_rate.disable();
    }
  }

  maxChanelLimit(event) {
    if (event.target.value > 30) {
      this.toastr.error('', maxChanelMessage, { timeOut: 2000 });
      this.maxLimit = '30';
    } else {
      return true;
    }
  }

  checkRangeDID() {
    var from: any;
    const credentials = this.didForm.value;
    var to = credentials.did_range_to;
    var from = credentials.did_range_from;
    var finalRange = parseInt(to) - parseInt(from);

    if (parseInt(to) > parseInt(from) && finalRange < 100) {
      while (from <= to) {
        this.didService.checkValidDID(from).subscribe(data => {
          if (data.did_id >= 1) {
            this.toastr.error('Error!', duplicateDIDInRange, { timeOut: 4000 });
            this.did_from = "";
            this.did_to = "";
            return false;
          }
        }, err => {
          this.error = err.message;
          this.toastr.error('Error!', err.message, { timeOut: 2000 });
        });
        from++;
      }
    } else {
      this.toastr.error('Error!', rangeError, { timeOut: 4000 });
      this.did_from = "";
      this.did_to = "";
      return;
    }

  }

  showDIDType(event) {  
    if(event.checked){            
      this.isRange = true;
    }else{      
      this.isRange = false;
    }    
    let isTypeRange = event.checked;
    if (isTypeRange) {      
      this.didForm.controls.group.reset();
      this.didForm.controls.vmn.reset();
      this.didForm.controls.number.reset();
      this.didForm.controls.did_range_from.enable(); //when range
      this.didForm.controls.did_range_to.enable(); //when range
      this.didForm.controls.did_number.disable(); //when range
      this.isDIDNumber = false;
    } else {
      this.didForm.controls.did_range_from.disable(); //when not range
      this.didForm.controls.did_range_to.disable(); //when not range
      this.didForm.controls.did_number.enable(); //when not range
      this.isDIDNumber = true;
    }
  }


  public findInvalidControls() {
    const invalid = [];
    const controls = this.didForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitDIDForm() {
    var didNumber: any = [];
    if (this.didForm.valid) {
      this.submitted = true;
      const credentials = this.didForm.value;

      if (Number(this.didForm.value.billing) == 2 ) {
        credentials.fixrate = Number(this.didForm.value.fixrate);  
        credentials.selling_rate = 0; 
      }else if(Number(this.didForm.value.billing) == 3){
        credentials.selling_rate = Number(this.didForm.value.selling_rate);  
        credentials.fixrate = 0; 
      }else if(Number(this.didForm.value.billing) == 4){
        credentials.selling_rate = 0;  
        credentials.fixrate = 0; 
      }else{
        credentials.fixrate = Number(this.didForm.value.fixrate);  
        credentials.selling_rate = Number(this.didForm.value.selling_rate); 
      }
      if (Number(credentials.group) == 3) {
        credentials.vmn = Number(this.didForm.value.vmn);   
      } 
      credentials.billing = Number(this.didForm.value.billing);
      credentials.concurrent_call = Number(this.didForm.value.concurrent_call);
      credentials.connect_charge = Number(this.didForm.value.connect_charge);
      credentials.didType = Number(this.didForm.value.didType);
      credentials.did_number = Number(this.didForm.value.did_number);
      credentials.group = Number(this.didForm.value.group);           
      if (credentials.is_did_range == false) {
        credentials.did_number = credentials.did_number;
      } else {
        while (credentials.did_range_from <= credentials.did_range_to) {
          didNumber.push(parseInt(credentials.did_range_from));
          credentials.did_range_from++;
        }
        credentials.did_number = didNumber;
      }      
      if (credentials.concurrent_call > 30) {
        this.toastr.error('', maxChanelMessage, { timeOut: 2000 });
        this.maxLimit = '30';
      } else {
        let path = this.data.id ? 'updateDID' : 'createDID';
        credentials['id'] = this.data.id ? this.data.id : '';
        if (credentials['number']) {
          credentials['vmn'] = Number(credentials['number']);
          credentials['number'] = '';
        }
        if (credentials['did_number'] == credentials['vmn']) {
          this.toastr.error('Error!', ' VMN and DID can not be same.', { timeOut: 2000 });
          return;
        }        
        if (credentials['number'] == "") {
          this.didService.getVMNDetails(credentials.vmn).subscribe(data => {
            if (data.response.length > '0') {
              this.toastr.error('Error!', errorMessage + ' VMN/DID number already in system!! ', { timeOut: 2000 });
              return;
            } else {
              this.didService.createDID(path, credentials)
                .subscribe(data => {
                  let msg = this.data.id ? didUpdated : didCreated;
                  this.toastr.success('Success!', msg, { timeOut: 2000 });
                  this.dialogRef.close();
                }, err => {
                  this.errors = err;
                  this.toastr.error('Error!', errorMessage + ' DID may be already in system!! ', { timeOut: 2000 });
                });
            }
          })
        } else {
          this.didService.createDID(path, credentials)
            .subscribe(data => {
              let msg = this.data.id ? didUpdated : didCreated;
              this.toastr.success('Success!', msg, { timeOut: 2000 });
              this.dialogRef.close();
            }, err => {
              this.errors = err;
              this.toastr.error('Error!', errorMessage + ' DID may be already in system!! ', { timeOut: 2000 });
            });
        }
      }
    } else {
      this.toastr.error('Error!', invalidForm, { timeOut: 2000 });
    }
  }

  manageRate(event) {
    var billingType = event.value;
    if (billingType == '1') {
      this.isMonthlyRate = true;
      this.isSellingRate = true;
      this.didForm.controls.fixrate.enable();
      this.didForm.controls.selling_rate.enable();
    } else if (billingType == '2') {
      this.isMonthlyRate = true;
      this.isSellingRate = false;
      this.didForm.controls.fixrate.enable();
      this.didForm.controls.selling_rate.disable();
    } else if (billingType == '3') {
      this.isMonthlyRate = false;
      this.isSellingRate = true;
      this.didForm.controls.fixrate.disable();
      this.didForm.controls.selling_rate.enable();
    } else {
      this.isMonthlyRate = false;
      this.isSellingRate = false;
      this.didForm.controls.fixrate.disable();
      this.didForm.controls.selling_rate.disable();
    }
  }

  getDIDGroup(event) {        
    this.didForm.get('group').setValue('');    
    this.didForm.get('vmn').setValue('');
      this.didForm.get('number').setValue('');
    let country = event['itemData'] ? event['itemData'].id : "";
    if (country == '99' && this.isRange == false) {      
      this.vmn = true;
    } 
    else {      
      this.vmn = false;
      this.customNumber = false;      
      this.selectVmn = false;
    }
  }
  checkDID(keyword) {
    let mykeyword = keyword.target.value;
    // check duplicacy 
    this.didService.checkValidDID(mykeyword).subscribe(data => {
      if (data.did_id >= 1) {
        this.toastr.error('Error!', duplicateDID, { timeOut: 4000 });
        keyword.target.value = "";
        return false;
      }
    });
  }

  cancelForm() {
    this.didForm.reset();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  onSelect(e) {
    if (e.value === '3') {
      this.didForm.get('vmn').setValue('');
      this.didForm.get('number').setValue('');
      this.didForm.controls.vmn.enable();
      this.didForm.controls.number.enable();
      this.selectVmn = true;
      this.didService.getVMNDetails('0').subscribe(data => {
        this.vmnList = data.response;
        this.vmnList.unshift({ id: '0', vmn_num: 'Custom' });
        this.filterVmn = this.vmnList.slice();
      })
    } else {       
      this.didForm.get('vmn').setValue('');
      this.didForm.get('number').setValue('');
      this.didForm.controls.vmn.disable();
      this.didForm.controls.number.disable();
      this.customNumber = false;
      this.selectVmn = false;
    }
  }

  getCustomValue(e) {    
    if (e.value == 'Custom') {
      this.customNumber = true;
      this.didForm.controls.number.enable();
    } else {
      this.didForm.controls.number.disable();
      this.customNumber = false;
    }
  }
}

@Component({
  selector: 'importXL-did',
  templateUrl: 'importXL-did.html',
})

export class ImportDID {
  text = '';
  basic = false;
  importAdvanceFile = false;
  showNotInsertedValue: any;
  imageSource1: any;
  excelValue: any = {};
  imageSource: any;
  statusCode: string = "";

  public uploader: FileUploader = new FileUploader({
    url: URL, itemAlias: 'file',
    allowedFileType: ['xls', 'xlsx', 'csv'], method: 'post'
  });

  constructor(
    public dialogRef11: MatDialogRef<ImportDID>, @Inject(MAT_DIALOG_DATA) public data,
    private didService: DidService,
    private toastr: ToastrService,

  ) { }


  openPrediction1() {
    this.text = '...';
    this.basic = true;
  }

  openPrediction2() {
    this.text = '...';
    // this.advance = true;
    this.basic = false;
  }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };


    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
      this.toastr.error('Error!', invalidFileType, { timeOut: 2000 });
    }

    this.uploader.onCompleteItem = (item: any, response: string, status: any, headers: any) => {
      let aaa = JSON.parse(response);
      this.excelValue = aaa.value ? aaa.value : '';
      this.statusCode = aaa.status ? aaa.status : '';
      this.showNotInsertedValue = this.excelValue != '' ? true : false;
    };

    this.uploader.onCompleteAll = () => {
      
      this.didService.updateGridList();
      this.showNotInsertedValue = this.excelValue != '' ? true : false;
      if (!this.showNotInsertedValue) {
        if (this.statusCode == '409') {
          this.toastr.error('Error!', duplicateDID, { timeOut: 2000 });
          return;
        }
        this.toastr.success('Success!', importSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
      } else {
        if (this.statusCode == '409') {
          this.toastr.error('Error!', duplicateDID, { timeOut: 2000 });
          return;
        }
        this.toastr.error('Error!', importUnsuccessfully, { timeOut: 2000 });
      }
    }
  }

  basicFile() {
    this.importAdvanceFile = false;
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('customer_id', this.data['customerId']); //note comma separating key and value
      form.append('role', localStorage.getItem('type'));
      form.append('id', null);
      form.append('type', 'basicDID');
    };
  }


  downloadExcelSample(): void {
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
      { header: 'DID Number', key: 'Name', width: 25 },
      { header: 'Billing Type', key: 'Email', width: 30 },
      { header: 'DID Group', key: 'Phone_number1', width: 30 },
      { header: 'Provider', key: 'Phone_number2', width: 30 },
      { header: 'Country', key: 'Organization', width: 30 },
      { header: 'VMN', key: 'vmn', width: 30 },
      { header: 'Max CC', key: 'Designation', width: 30 },
      { header: 'Connect charge', key: 'Connect charge', width: 30 },
      { header: 'Monthly rate', key: 'Monthly rate', width: 30 },
      { header: 'Selling rate', key: 'Selling rate', width: 30 },
    ];
    worksheet.getRow(1).font = {
      bold: true,
    }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
    };
    // for (let i = 0; i < this.exportData.length; i++) {
    worksheet.addRow({
      DID_Number: '',
      Billing_Type: '',
      DID_Group: '',
      Provider: '',
      Country: '',
      Vmn: '',
      Max_CC: '',
      Connect_charge: '',
      Monthly_rate: '',
      Selling_rate: ''
    });
    // }
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

    // let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(1));
    //this.excelService.exportAsExcelFile(arr, 'contactList');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'sample_DIDList');
    });

  }

  cancleDialog(): void {
    this.dialogRef11.close();
    this.showNotInsertedValue = false;
    this.importAdvanceFile = false;
    this.didService.updateGridList();
    // e.preventDefault();
  }
}