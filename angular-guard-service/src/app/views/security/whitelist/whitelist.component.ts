import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService, ExcelService, invalidPhone, countryError, Name_RegEx, Number_RegEx } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { BlackListService } from '../../black-list/black-list.service';

declare const ExcelJS: any;


export interface WhiteList {
  id: string,
  customerId: number,
  extensionId: number
}


@Component({
  selector: 'app-whitelist',
  templateUrl: './whitelist.component.html',
  styleUrls: ['./whitelist.component.css']
})

export class WhitelistComponent implements OnInit {

  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  isFilter = false;
  filterForm: FormGroup;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  customerId = '';
  extensionId = '';
  exportData: any = {};
  defaultPageSize = '10';
  countryList = [];
  countryspace = [];
  CountryFilter:any;
  filter:any;
  public mode : string = 'CheckBox' ;
  public selectAllText: string = "Select All"
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  constructor(
    private fb: FormBuilder,
    private blackListService: BlackListService,
    public dialog: MatDialog,
    public commonService: CommonService,
    private excelService: ExcelService,
    private toastr: ToastrService,
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_number': [""],
      "by_country": new FormControl([]),
      'by_status': [""],
    });
  }
  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.blackListService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
     //get country list
     this.commonService.getCountryList().subscribe(data => {
      this.countryspace = this.countryList = data.response;
      this.countryList.unshift({ name: 'Select Country Name', id: 0 });
      this.filter = this.CountryFilter = this.countryList.slice();
    }, err => {
      this.error = err.message;
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'country', headerName: 'Country', hide: false, width: 15 },
      { field: 'phone_number', headerName: 'Phone Number', hide: false, width: 15 },
      { field: 'name', headerName: 'Name', hide: false, width: 20 },
      { field: 'status', headerName: 'Status', hide: false, width: 10 },      
  
    ];

    if (localStorage.getItem('type') != '6' || localStorage.getItem('type') == '1') {
      this.customerId = localStorage.getItem('id');
      this.extensionId = '0';
    } else if (localStorage.getItem('type') == '6') {
      this.customerId = '';
      this.extensionId = localStorage.getItem('id');
    }

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.blackListService.filterWhiteList(credentials, localStorage.getItem('id'), localStorage.getItem('type')).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.blackListService.getWhiteList({ id: null, phonenumber: null, 'customer_id': this.customerId, 'extension_id': this.extensionId, 'role': localStorage.getItem('type'), 'country': null }).subscribe(data => {
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
  
  exportToExcel(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup:{paperSize: 9, orientation:'landscape',fitToPage: true, fitToHeight: 5, fitToWidth: 7,views:[{showGridLines: true}]}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };    

    worksheet.columns = [
      { header: 'Country', key: 'country', width: 30 },
      { header: 'Phone Number', key: 'phone_number', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'status', key: 'status', width: 10 },
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
      // let reserved = (this.exportData[i].blocked == '1') ? 'Incoming' : (this.exportData[i].blocked == '2') ? 'Outgoing' :'Both'
      worksheet.addRow({
        country: this.exportData[i].country,
        phone_number: this.exportData[i].phone_number,
        name: this.exportData[i].name,
        // reserved_for: reserved,
        status: strStatus1
      });
    }
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
    
    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
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
    // this.excelService.exportAsExcelFile(arr, 'blacklist');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'whitelist');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Country", "Phone Number", "Name","Status"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      // let reserved = (element.blocked == '1') ? 'Incoming' : (element.blocked == '2') ? 'Outgoing' :'Both';
      const e11 = [element.country, element.phone_number, element.name, strStatus1];
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
    doc.save('whitelist.pdf');
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoBlackListDialog, {
    //   width: '80%', disableClose: true, autoFocus:false,
    //   data: {
    //     customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
    //     extensionId: localStorage.getItem('type') == '6' ? localStorage.getItem('id') : 0,
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

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      let finalBtn1 = '';
      finalBtn += "<span>";
      // data[i]['unblocked'] = data[i]['unblocked_for'];
      if (this.isCheckDelete(data[i])) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      } else {
        finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (data[i].status == 'Active' && this.isCheckDelete(data[i])) {
        data[i].status = "<span style='color:#379457;'><strong>" + data[i].status + "</strong></span>";
        finalBtn += "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>\
        ";
      } else if (data[i].status == 'Inactive' && this.isCheckDelete(data[i])) {
        data[i].status = "<span style='color:#c69500;'><strong>" + data[i].status + "</strong></span>";
        finalBtn += "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\
        ";
      }
      if (this.isCheckDelete(data[i])) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }

      finalBtn += "</span>";

      // finalBtn1 += "<span><center>";
      // if (data[i]['unblocked_for'] == '1') {
      //   finalBtn1 += "<i class='fa fa-arrow-down' display: inline' title='Incoming'></i>";
      // }
      // if (data[i]['unblocked_for'] == '2') {
      //   finalBtn1 += "<i class='fa fa-arrow-up' display: inline' title='Outgoing'></i>";
      // }
      // if (data[i]['unblocked_for'] == '3') {
      //   finalBtn1 += "<i class='fa fa-arrows-h' display: inline' title='Both'></i>";
      // }
      // finalBtn1 += "</center></span>";
      // data[i]['unblocked_for'] = finalBtn1;
      data[i]['action'] = finalBtn;
    }
    return data;
  }


  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editData(data);
      case "delete":
        return this.deleteData(data);
      case "active":
        return this.updateStatus(data);
      case "inactive":
        return this.updateStatus(data);
    }
  }

  editData(event) {
    this.openDialog(event.id, event);
  }

  deleteData(event) {
    if(!this.isCheckDelete(event)){
      this.toastr.error('Error!', "You have no permission..", { timeOut: 4000 });
      return;
    }
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html : "<span style='color:#FFFFFF;'>You will not be able to recover Blacklist Contact </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.blackListService.deleteWhiteListContact({ 'id': event.id }).subscribe(data => {
          this.displayAllRecord();
        },
          err => {
            this.error = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html : "<span style='color:#FFFFFF;'> Blacklist Contact </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'>  has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html : "<span style='color:#FFFFFF;'> Blacklist Contact </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }

  public isCheckDelete(data): boolean {
    let isCheck: boolean = true;
      let loginUserId = localStorage.getItem('id');
      if (loginUserId == (data['customer_id']).toString()) {
  
      } else {  // && 
        if(data['extension_id'].toString() == loginUserId){
          isCheck = true;
        }else{
          isCheck = false;
        }
      }
    return isCheck;
  }

  updateStatus(event) {
    let blackListContactStatus = '';
    let btnmessage = '';
    let action = event.status.match(/Active/g) ? 'Active' : 'Inactive';
    let id = event.id;
    if (action == 'Active') {
      blackListContactStatus = 're-activate';
      btnmessage = "Inactivate";
    } else {
      blackListContactStatus = 'inactivate';
      btnmessage = "Activate";
    }
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You can " + blackListContactStatus + " whitelist contact </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span><span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes,' + btnmessage + ' it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.blackListService.updateWhiteListContactStatus('updateBlackListContactStatus', id, action).subscribe(data => {
          this.displayAllRecord();
        }, err => {
          this.error = err.message;
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">' + btnmessage + 'd!</span>',
          html: "<span style='color:#FFFFFF;'>Blacklist Contact</span><span style ='color:red; font-weight :bold; font-size: 1.2em'> "+ event.name+"</span><span style='color:#FFFFFF;'>has been " + btnmessage + "d.</span>",
          type: 'success',
          background: '#000000',
          timer: 4000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html : "<span style='color:#FFFFFF;'>Blacklist contact </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 4000
        });
      }
    });
  }

  openDialog(id?, data?): void {    
    const dialogRef = this.dialog.open(WhitelistDialog, {
      width: '50%', disableClose: true,
      data: {
        id: id ? id : null,
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
        extensionId: localStorage.getItem('type') == '6' ? localStorage.getItem('id') : 0,
        customer_id_real : data ? data['customer_id'] : 0,
        extension_id_real :data ? data['extension_id'] : 0,
      }
    });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
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
  countryremovedspace = (event:any)=>{
    
    const mohspace = event.text.trim().toLowerCase()
    const mohfilterData = this.countryspace.filter((data:any) =>{
      return data['name'].toLowerCase().includes(mohspace);
    })
    event.updateData(mohfilterData);
  }
}

// @Component({
//   selector: 'infoBlackList-dialog',
//   templateUrl: 'infoBlackList-dialog.html',
// })

// export class InfoBlackListDialog {
//   constructor(
//     public dialogRefInfo: MatDialogRef<InfoBlackListDialog>, @Inject(MAT_DIALOG_DATA) public data: WhiteList,
//   ) { }

//   ngOnInit() {
//     const element = document.querySelector('#scrollId');
//     element.scrollIntoView();
//   }

//   cancleDialog(): void {
//     this.dialogRefInfo.close();
//   }
// }

@Component({
  selector: 'whitelist-dialog',
  templateUrl: 'whitelist-dialog.html',
})

export class WhitelistDialog {
  whiteListForm: FormGroup;
  submitted = false;
  checkForm: any;
  countryList = [];
  countryspace = [];
  CountryFilter:any;
  filter:any;
  countryCode = "";
  error = '';
  validNumber = false;
  countryID: any = {};
  numberFormat164 = false;
  blackListContactData: any = {};
  errorField: any;
  customerId = '';
  extensionId = '';
  validPhoneNumber = false;
  // unblockForCall = '1';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public popupWidth1: string = '200px';
  public fields2: Object = { text: 'feature', value: 'id' };
 

  constructor(
    public dialogRef: MatDialogRef<WhitelistDialog>, @Inject(MAT_DIALOG_DATA) public data: WhiteList,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    private blackListService: BlackListService
  ) {
    this.whiteListForm = this.formBuilder.group({
      'name': ['', Validators.pattern(Name_RegEx)],
      'phone': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'phone2': ['', [Validators.required, Validators.maxLength(15), Validators.min(1)]],
      'country': [99, Validators.required],
      'country_code': [''],
      'numberFormat': [''],
      'status': [''],
      // 'unblockFor': ['1']
    });
  }

  get phone() { return this.whiteListForm.get('phone'); }
  get phone2() { return this.whiteListForm.get('phone2'); }
  get country() { return this.whiteListForm.get('country'); }
  get name() { return this.whiteListForm.get('name'); }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.whiteListForm.controls.country.disable();
    this.whiteListForm.controls.phone.disable();
    this.whiteListForm.controls.phone2.enable();
    //get customer wise country
    if (localStorage.getItem('type') == '6') {
      this.commonService.customerWiseCountry(localStorage.getItem('id')).subscribe(data => {
        this.countryID = data.response[0];
        this.countryCode = '+' + data.response[0].phonecode
      }, err => {
        this.error = err.message;
      });
    } else if (localStorage.getItem('type') == '1') {
      this.commonService.getCustomerCountry(localStorage.getItem('id')).subscribe(data => {
        this.countryID = data.response[0];
        this.countryCode = '+' + data.response[0].phonecode
      }, err => {
        this.error = err.message;
      });
    }
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryspace = this.countryList = data.response;
      this.filter = this.CountryFilter = this.countryList.slice();
    }, err => {
      this.error = err.message;
    });


    if (this.data.id) {            
      this.blackListService.getWhiteList({ id: this.data.id, phonenumber: null, 'customer_id': this.data['customer_id_real'], 'extension_id': this.data['extensionId'], 'role': localStorage.getItem('type'), 'country': null }).subscribe(data => {
        this.blackListContactData = data[0];        
        this.countryCode = this.blackListContactData.country_code ? this.blackListContactData.country_code : '+91';
        // this.unblockForCall = this.blackListContactData.unblocked_for ? this.blackListContactData.unblocked_for : '1';
        if (this.blackListContactData.country_id != 0) {
          this.whiteListForm.controls.country.enable();
          this.whiteListForm.controls.phone.enable();
          this.whiteListForm.controls.phone2.disable();
          this.numberFormat164 = true;
        } else {
          this.whiteListForm.controls.country.disable();
          this.whiteListForm.controls.phone.disable();
          this.whiteListForm.controls.phone2.enable();
          this.numberFormat164 = false;
        }
      }, err => {
        this.error = err.message;
      });
    }

  }

  submitWhiteListForm() {
    this.checkForm = this.findInvalidControls();
    this.checkForm = this.checkForm[0] == 'phone2' || this.checkForm[0] == 'phone' ? invalidPhone : ''
    if (this.whiteListForm.valid) {
      this.submitted = true;
      const credentials = this.whiteListForm.value;
      credentials.role = Number(localStorage.getItem('type'));
      credentials.customer_id = Number(this.data['customerId']);
      credentials.extension_id = Number(this.data['extensionId']);
      credentials.id = this.data.id ? Number(this.data.id) : null;

      if (credentials.numberFormat && credentials.country == '') {
        this.toastr.error('Error!', countryError, { timeOut: 4000 });
        return;
      }
      if(credentials.phone){
        this.blackListService.getWhiteList({ 'id': credentials.id, 'phonenumber': "'"+credentials.country_code + credentials.phone+"'", 'customer_id': credentials.customer_id, 'extension_id': credentials.extension_id, 'role': localStorage.getItem('type'), 'country': credentials.country }).subscribe(data => {        
          if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
            this.whiteListForm.controls['phone'].setValue('');
            credentials.phone == '';
            return;        
          }else{
              credentials.country_name = this.countryList.filter(item => item.id == credentials.country)[0]['name'];
             this.blackListService.createWhiteListContact('createBlackListContact', credentials)
              .subscribe(data => {
                if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                this.cancelForm();
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
          });
        } 
      });
    }else{
        this.blackListService.getWhiteList({ 'id': credentials.id, 'phonenumber': "'"+credentials.phone2+"'", 'customer_id': credentials.customer_id, 'extension_id': credentials.extension_id, 'role': localStorage.getItem('type'), 'country': null }).subscribe(data => {
          if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted && !credentials.numberFormat) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
            this.whiteListForm.controls['phone2'].setValue('');
            credentials.phone2 == '';
            return;
          }else {
            this.blackListService.createWhiteListContact('createBlackListContact', credentials)
              .subscribe(data => {
                if (data['code'] == 200) {
                  this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                  this.cancelForm();
                }
                else {
                  this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                }
              });
          }
        });
      }
      } else {
        this.toastr.error('Error!', this.checkForm, { timeOut: 2000 });
      }
    }
    countryremovedspace = (event:any)=>{
      
      const mohspace = event.text.trim().toLowerCase()
      const mohfilterData = this.countryspace.filter((data:any) =>{
        return data['name'].toLowerCase().includes(mohspace);
      })
      event.updateData(mohfilterData);
    }

  cancelForm() {
    this.whiteListForm.reset();
    this.blackListService.updateGridList();
    this.dialogRef.close();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.whiteListForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  numberFormat(event) {
    let numberFormat = event.checked;
    if (numberFormat == true) {
      this.whiteListForm.controls.country.enable();
      this.whiteListForm.controls.phone.enable();
      this.whiteListForm.controls.phone2.disable();
      this.numberFormat164 = true;
    } else {
      this.whiteListForm.controls.country.disable();
      this.whiteListForm.controls.phone.disable();
      this.whiteListForm.controls.phone2.enable();
      this.numberFormat164 = false;
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
  
  public isCheckEditable(): boolean {
    let isCheck: boolean = true;
    if(this.data.id){
      let loginUserId = localStorage.getItem('id');
      if (loginUserId == (this.data['customer_id_real']).toString()) {
  
      } else {  // && 
        if(this.data['extension_id_real'].toString() == loginUserId){
          isCheck = true;
        }else{
          isCheck = false;
        }
      }
    } 
    return isCheck;
  }

}
