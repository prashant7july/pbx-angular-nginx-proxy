import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactListService } from '../contact-list.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, invalidFileType, Number_RegEx, EMAIL_RegEx, Name_RegEx, importUnsuccessfully,alreadyExist,countrycodeerror, importSuccessfully, sameNumber, phonebookLimitExceed, formError, ExtensionService } from '../../../core';
import { FileUploader, FileSelectDirective ,FileItem} from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../../environments/environment.prod';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { UserService } from '../../user/user.service';
import { isLeapYear } from 'ngx-bootstrap/chronos/units/year';
import { async } from '@angular/core/testing';


declare const ExcelJS: any;


export interface ContactList {
  id: string,
  customerId: number,
  extensionId: number
}

const URL = environment.api_url + 'uploadCsv/';
// const URL = 'http://localhost:3000'+ '/uploadCsv';  // this url is use for import the excel sheet on our local machine

export var imagePath: any;

@Component({
  selector: 'app-view-contactlist',
  templateUrl: './view-contactlist.component.html',
  styleUrls: ['./view-contactlist.component.css']
})
export class ViewContactlistComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  numberExists = false;
  isFilter = false;
  flag : boolean = false;
  filterForm: FormGroup;
  userRole = '';
  columnDefs: any;
  // dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  customerId = '';
  extensionId = '';
  blackList: any = '';
  phoneBook: any = 0;
  contactCount: any = 0;
  exportData: any = {};
  showNotInsertedValue = false;
  excelValue: any = {};
  defaultPageSize = '10'; 
  clicktocall:any ;
  Minute_Plan:any;
  Outbound_Call:any;
  Is_Bundle:any;
  public __myVar ;
  dataSource: any[];
  elementt: any;
  constructor(
    private fb: FormBuilder,
    private contactListService: ContactListService,
    public commonService: CommonService,
    public dialog: MatDialog,
    public userService: UserService,
    private toastr: ToastrService,
    private excelService: ExcelService,
    private extensionService:ExtensionService
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_number': [""],
      'by_email': [""]
    });



  }


  ngOnInit() {
    if (localStorage.getItem('type') != '6' || localStorage.getItem('type') == '1') {
      this.customerId = localStorage.getItem('id');
      this.extensionId = '0';
    } else if (localStorage.getItem('type') == '6') {
      this.customerId = '';
      this.extensionId = localStorage.getItem('id');
    }



    this.extensionService.getExtensionById(this.extensionId).subscribe( (data2) => {
      this.clicktocall =   data2.response[0].click_to_call;
      this.Minute_Plan = data2.response[0].minute_plan;
      this.Is_Bundle = data2.response[0].is_bundle_type;
      this.Outbound_Call = data2.response[0].outbound_call;
  
      
      if(data2){
      data2 = this.manageUserActionBtn(data2);
      }


      });

      this.contactListService.displayAllRecord.subscribe(() => {
        this.displayAllRecord();
        });




    this.showNotInsertedValue = false;


    setTimeout(()=>{
      this.flag = true;
    }, 10000)


  }


  displayAllRecord() {
    this.showNotInsertedValue = false;
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 15 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 30 },
      { field: 'email', headerName: 'Email', hide: false, width: 30 },
      { field: 'country', headerName: 'Country', hide: false, width: 15 },
      { field: 'display_list_phone_number', headerName: 'Phone Number', hide: false, width: 30 },

    ];

    this.commonService.getBlacklistFeatures({ id: Number(localStorage.getItem('id')), product_id: 1, role: Number(localStorage.getItem('type')) }).subscribe((data) => {
      this.blackList = data.response[0].black_list == 0 ? 'none' : 'inline';
      this.phoneBook = data.response[0].phone_book;
    })

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      let role = Number(localStorage.getItem('type'));
      let id = Number(localStorage.getItem('id'));
      credentials.by_number = Number(credentials.by_number)
      console.log(credentials,'----------cdre',credentials.by_number);
      // return

      this.contactListService.filterContactList(credentials, id, role).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        
        this.contactCount = data ? data.length : 0;
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    }
     else {
      console.log('display');
      
      this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, 'customer_id': Number(this.customerId), 'extension_id': Number(this.extensionId), 'role': Number(localStorage.getItem('type')) }).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.contactCount = data ? data.length : 0;
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
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };

    // worksheet.mergeCells('A1:C1');
    // worksheet.getCell('A1').value = title;
    // worksheet.getCell('A1').alignment = { horizontal:'center'} ;
    // worksheet.getCell('A1').font = { name: 'Comic Sans MS', family: 4, size: 16, underline: 'double', bold: true };
    // let titleRow = worksheet.addRow([title]);
    // titleRow.font = { name: 'Comic Sans MS', family: 4, size: 16, underline: 'double', bold: true }
    // let logo = workbook.addImage({
    //   base64: logoFile.logoBase64,
    //   extension: 'png',
    // });
    // worksheet.addImage(logo, 'A1:B1');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Country', key: 'country', width: 30 },
      { header: 'Phone Number', key: 'phoneNumber', width: 35 },
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
        email: this.exportData[i].email,
        country: this.exportData[i].country,
        phoneNumber: this.exportData[i].display_list_phone_number
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
    //this.excelService.exportAsExcelFile(arr, 'contactList');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'contactList');
    });

  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Name", "Email", "Country", "Phone Number"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.name, element.email, element.country, element.display_list_phone_number];
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
    doc.save('contactList.pdf');
  }


  manageUserActionBtn(data) {
    console.log(data,'-------contact');
    
    
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-ban copyToBlackListData-button'  style='cursor:pointer; display: " + this.blackList + "' data-action-type='copyToBlackListData' title='CopyToBlackListData' ></i>";
      finalBtn += "<i id="+data[i].id+" class='fa fa-trash-o delete-button '  style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      if((localStorage.getItem('type') == '6' && this.clicktocall == '1') && ((this.Minute_Plan == 1 && this.Is_Bundle == 1) || (this.Outbound_Call == 1))){
      finalBtn += "<i class='fa fa-phone edit-button' style='cursor:pointer; display: inline' data-action-type='c2c' title='Click to call' ></i>";
      }

      finalBtn += "</span>";

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
      case "copyToBlackListData":
        return this.copyToBlackListData(data);
      case "c2c":
        return this.click2Call(data);
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




  deleteData(event) {
    this.contactListService.isContactAssociate(event.id).subscribe(data => {
      if (data.length) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html : " <span style='color:#FFFFFF;'> Contact </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'>  can't be deleted because it is associate with group. </span>",
          type: 'error',
          background: '#000000',
          timer:3000
        });
      }
      else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html : "<span style='color:#FFFFFF;'>You will not be able to recover Contact </span> <span style= 'color:red; font-weight : bold; font-size : 1.2em'>" +event.name+ "</span> <span style='color:#FFFFFF;'> in future! </span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.contactListService.deleteContact({ 'id': event.id }).subscribe(data => {
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
                this.resetTable();
              }
            });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result.value) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Deleted!</span>',
              html :  "<span style='color:#FFFFFF;'>Contact </span> <span style='color:red; font-weight : bold; font-size : 1.2em'>" +event.name +"</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer:2000
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html : " <span style='color:#FFFFFF;'>Contact </span> <span style='color:red; font-weight : bold; font-size : 1.2em'> " +event.name+ "</span> <span style='color:#FFFFFF;'>is safe</span>",
              type: 'error',
              background: '#000000',
              timer:2000
            });
          }

        })
      }
    })
  }

  importFile() {
    const dialogRef11 = this.dialog.open(ImportDialog, {
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
      this.showNotInsertedValue = false;
      console.log('Dialog closed');
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoDialog, {
      width: '80%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
        extensionId: localStorage.getItem('type') == '6' ? localStorage.getItem('id') : 0,
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

  copyToBlackListData(event) {
    this.commonService.checkNumberExistInBlackList({ data: event }).subscribe(data => {
      if (data.response) {
        this.numberExists = true;
        Swal.fire({
          type: 'error',
          text: data.response['message'],
          background: '#000000',
        });
      } else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html : "<span style='color:#FFFFFF;'>You want to blacklist Contact</span> <span style= 'color:red; font-weight : bold; font-size : 1.2em'>" +event.name+ "</span><span style='coloe:#FFFFFF';> ?</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, blacklist it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.contactListService.copyToBlackList({ data: event }).subscribe(data => {
              if(data[0]['MYSQL_SUCCESSNO'] == 200){

              }
            },
              err => {
                this.error = err.message;
              });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result.value) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Copied!</span>',
              html : " <span style='color:#FFFFFF;'>Contact </span> <span style='color:red; font-weight : bold; font-size : 1.2em'> " +event.name+ "</span> <span style='color:#FFFFFF;'> has been blacklisted.</span>",
              type: 'success',
              background: '#000000',
              timer: 4000
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html : " <span style='color:#FFFFFF;'>Contact </span> <span style='color:red; font-weight : bold; font-size : 1.2em'> " +event.name+ "</span> <span style='color:#FFFFFF;'> is safe..</span>",
              type: 'error',
              background: '#000000',
              timer: 4000
            });
          }
        })
      }
    }, err => {
      this.error = err.message;
    });
  }

  click2Call(event) {
    this.userService.getCustomerById(event['customer_id']).subscribe(data => {
      let customerInfo = data.response[0];
      this.extensionService.getExtensionById(event['extension_id']).subscribe(data2 => {
        this.extensionService.checkContactExistInBlackList({ data: event }).subscribe(data3 => {
          if (data3['code'] == 200 && data3.response[0]['blocked_for'] != '1') {
            this.toastr.error('Error!', data3['message'], { timeOut: 4000 });
            return;
          }
          let extensionInfo = data2.response[0];
          let isOutBoundEnable = extensionInfo['outbound'] == 1 ? true : false;
          let obj = {};
          obj['application'] = "click2call";
          obj['cust_id'] = event['customer_id'];
          obj['extension'] = extensionInfo['ext_number'];
          obj['destination_number'] = (event['display_list_phone_number']).replace(/ /g, '');
          obj['callback_url'] = customerInfo['callback_url'] ? customerInfo['callback_url'] : 'no';
          obj['token_id'] = extensionInfo['token']; //token_id
          if (!isOutBoundEnable) {
            this.toastr.error('Error!', 'Please enable Dial-Out first for C2C!', { timeOut: 4000 });
            return;
          }
          if (extensionInfo['registered_status'] != 'Registered') {
            this.toastr.error('Error!', 'Please register this extension firstly', { timeOut: 4000 });
            return;
          }
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Are you sure?</span>',
            text: 'You want to make a click to call!',
            type: 'warning',
            showCancelButton: true,
            background: '#000000',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            preConfirm: () => {
              this.contactListService.click2Call(obj).subscribe(data => {
                // if (data['status'] == 200) {
                  this.toastr.success('success!', (data['data'].toString()).replace('_', ' '), { timeOut: 4000 });
                  this.getC2CStatus(data['uuid']);
                  this.elementt = document.getElementById(event.id) as HTMLElement;
                  this.elementt.setAttribute('style', 'cursor:none !important; color:grey; data-action-type : none');
                  setTimeout(() => {                    
                    this.elementt.setAttribute('style', 'cursor:pointer ; data-action-type : ');
                }, 30000);
              //   } else {
              //     this.toastr.error('Error!', data['data']['message'], { timeOut: 4000 });
              //     this.getC2CStatus(data['uuid']);
              //   }
              },
                err => {
                  this.error = err.message;
                });
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.value) {
              Swal.fire({
                title: '<span style="color:#FFFFFF;">Success!</span>',
                text: 'Click to call done.',
                type: 'success',
                background: '#000000'
              });

            } else if (result.dismiss === Swal.DismissReason.cancel) {
              Swal.fire({
                title: '<span style="color:#FFFFFF;">Cancelled</span>',
                text: 'Click to call not done :)',
                type: 'error',
                background: '#000000',
              });
            }
          })
        })
      })
    })
  }

  editData(event) {
    this.showNotInsertedValue = false
    this.openDialog(event.id);
  }

  openDialog(id?): void {
    if(!id){
       if (this.phoneBook <= this.contactCount) {
       this.toastr.error('Error!', phonebookLimitExceed, { timeOut: 4000 });
       return;
    }
    }
    const dialogRef = this.dialog.open(ContactlistDialog, {
      width: '60%', disableClose: true,
      data: {
        id: id ? id : null,
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
        extensionId: localStorage.getItem('type') == '6' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.showNotInsertedValue = false;
      console.log('Dialog closed');
    });
  }

  public getC2CStatus(uuid){
    let count = 0;
    this.__myVar = setInterval(()=>{
      this.contactListService.getclick2CallStatus(uuid).subscribe(data => {
         if(data['status_code'] == 200){
          let statusData = data['data'] ? data['data']: [];
          switch (statusData.length) {
            case 0:   // Only Agent
              this.toastr.error('Error', "You do not have any Call Plan Rate for this destination.", { timeOut: 4000 });
              clearInterval(this.__myVar);
              break;
            case 1:   // Only Agent
              let data = statusData[0];
              if (data['current_status'] == 'CHANNEL_CREATE') { // channel create
                this.toastr.info('Agent is Calling!', "Agent", { timeOut: 4000 });
                break;
              }
              if (data['current_status'] == 'CHANNEL_HANGUP'){
              if (data['terminatecause'] == 415) { // service not implemented
                this.toastr.error(data['description'], "Agent!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }
              else if (data['terminatecause'] == 408) { //  Request Timeout
                this.toastr.error(data['description'], "Agent!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }
             else if (data['terminatecause'] == 486) { // Agent Busy
                this.toastr.error(data['description'], "Agent!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }
              else if (data['terminatecause'] == 487) { // No Answer
                this.toastr.error(data['description'], "Agent!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }else{
                this.toastr.error(data['description'], "Agent!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }
            }

            case 2:
              let data2 = statusData[1];
              if (data2['current_status'] == 'CHANNEL_BRIDGE') {
                this.toastr.info('Agent Answer!', "Agent", { timeOut: 4000 });
                this.toastr.success('Lead Answer!', "Lead", { timeOut: 4000 });
                break;
              }
              if (data2['current_status'] == 'CHANNEL_ANSWER') {
                this.toastr.success('Call Connected!', "Success", { timeOut: 4000 });
                break;
              }
              if (data2['current_status'] == 'CHANNEL_HANGUP'){
              if (data2['terminatecause'] == 480) { // Lead Busy
                this.toastr.success(data2['description'], "Lead!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }
              else if (data2['terminatecause'] == 608) { // CALL HANGUP
                this.toastr.error(data2['description'], "Lead!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }
              else if (data2['terminatecause'] == 408) { //  Request Timeout
                this.toastr.error(data['description'], "Lead!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }else {
                this.toastr.error(data2['description'], "Lead!", { timeOut: 4000 });
                clearInterval(this.__myVar);
                break;
              }
            }

            default:
              let data3 = statusData[2];
              this.toastr.error(data3['description'], "Lead!", { timeOut: 4000 });
              clearInterval(this.__myVar);
              break;

          }
        }else{
          this.toastr.error('Error!', data['message'], { timeOut: 4000 });
          clearInterval(this.__myVar);
          return;
        }
      },
        err => {
          this.error = err.message;
          clearInterval(this.__myVar);
        });
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.__myVar); // nagender
  }

}

@Component({
  selector: 'import-dialog',
  templateUrl: 'import-dialog.html',
})

export class ImportDialog {
  text = '';
  basic = false;
  advance = false;
  importAdvanceFile = false;
  showNotInsertedValue: any;
  duplicateCount: any;
  myFile: any;
  submitbybasic:any ;
  checkmessage:any;
  checkWrongCode:any;
  checkcountrycode:any;
  imageSource1: any;
  excelValue: any = {};
  imageSource: any
  checkInvalid: boolean = false;
  success: boolean = false;
  public uploader: FileUploader = new FileUploader({
    url: URL, itemAlias: 'file',
    allowedFileType: ['xls', 'xlsx', 'csv'], method: 'post'
  });

  constructor(
    public dialogRef11: MatDialogRef<ImportDialog>, @Inject(MAT_DIALOG_DATA) public data: ContactList,
    private contactListService: ContactListService,
    private toastr: ToastrService,

  ) { 
  
  }
  onUploadFailed(item: FileItem, filter: any, options: any): void {
    this.checkInvalid = true;
  }


  openPrediction1() {
    this.text = '...';
    this.basic = true;
    this.advance = false;
  }

  openPrediction2() {
    this.text = '...';
    this.advance = true;
    this.basic = false;
  }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => {
      this.checkInvalid = false;
      file.withCredentials = false;
    };

    this.uploader.onWhenAddingFileFailed = this.onUploadFailed.bind(this);
    // this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
    //   this.basicFile()
    //   this.toastr.error('Error!', invalidFileType, { timeOut: 2000 });
    // }
    this.uploader.onCompleteItem = (item: any, response: string, status: any, headers: any) => {
      let aaa = JSON.parse(response);
      this.duplicateCount = JSON.parse(response).duplicateCount;
      this.checkcountrycode = (aaa.message == "No insertion- Country Code does not Exist.");
      this.checkmessage = (aaa.message == "No insertion- value already exists");
      this.checkWrongCode = (aaa.message =="Some data has wrong country code." );
      this.excelValue = aaa.value ? aaa.value : '';
      this.submitbybasic = JSON.parse(response).notInsertedData
      this.showNotInsertedValue = this.excelValue != '' ? true : false;
      this.success = aaa.success ? true : false;
      imagePath = URL + item.file.name;
    };

    this.uploader.onCompleteAll = () => {
      this.contactListService.updateGridList();
      // this.dialogRef.close();
      this.showNotInsertedValue = this.excelValue != '' ? true : false;
      if (!this.showNotInsertedValue) {
        this.toastr.success('Success!', importSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
      } 
      else if(this.checkmessage == true) {
        this.toastr.error('Error!', alreadyExist, { timeOut: 2000 });
        this.cancleDialog();

      }
      if(this.success == true ){
        this.toastr.success('Success!', importSuccessfully, { timeOut: 2000 });
      }

      if(this.checkcountrycode == true){
        this.cancleDialog();
        this.toastr.error('Errro!',countrycodeerror, {timeOut: 2000 });
      }
      // else {
      //   this.toastr.error('Error!', importUnsuccessfully, { timeOut: 2000 });
      // }

      if(this.duplicateCount.length > 0){
        this.toastr.error('Error!', `${this.duplicateCount.length} Numbers Are Dupicate.`, { timeOut: 2000 });
      }

      if(this.checkWrongCode == true){
        this.toastr.error('Errro!','Some data has wrong Country Code', {timeOut: 2000 });
      }
    }
  }
  onshowmsg(){
    if(this.checkInvalid == false){
      this.basicFile(); 
      this.uploader.queue.forEach(item => item.upload())
    }else{
      this.toastr.error('Error!', invalidFileType, { timeOut: 2000 });
    }
  }
  onshowmsadvance(){
    if(this.checkInvalid == false){
      this.advanceFile(); 
      this.uploader.queue.forEach(item => item.upload());
    }else{
      this.toastr.error('Error!', invalidFileType, { timeOut: 2000 });
    }
  }

  basicFile() {
    this.importAdvanceFile = false;
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('customer_id', this.data['customerId']); //note comma separating key and value
      form.append('extension_id', this.data['extensionId']); //note comma separating key and value
      form.append('role', localStorage.getItem('type'));
      form.append('id', null);
      form.append('type', 'basic');
    };
    // this.cancleDialog();
  }

  advanceFile() {
    this.importAdvanceFile = true;
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('customer_id', this.data['customerId']); //note comma separating key and value
      form.append('extension_id', this.data['extensionId']); //note comma separating key and value
      form.append('role', localStorage.getItem('type'));
      form.append('id', null);
      form.append('type', 'advance');
    };
    // this.cancleDialog();
  }
  

  cancleDialog(): void {
    this.dialogRef11.close();
    this.showNotInsertedValue = false;
    this.importAdvanceFile = false;
    this.contactListService.updateGridList();
    // e.preventDefault();
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
      { header: 'Name', key: 'Name', width: 25 },
      { header: 'Email', key: 'Email', width: 30 },
      { header: 'Phone_number1', key: 'Phone_number1', width: 30 },
      { header: 'Phone_number2', key: 'Phone_number2', width: 30 },
      { header: 'Organization', key: 'Organization', width: 30 },
      { header: 'Designation', key: 'Designation', width: 30 },
      // { header: 'Country', key: 'country', width: 30 },
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
        Name: '',
        Email: '',
        Phone_number1: '',
        Phone_number2: '',
        Organization: '',
        Designation: ''
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
      FileSaver.saveAs(blob, 'sample_basic_contactList');
    });

  }

  downloadAdvanceExcelSample(): void {
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
      { header: 'Email', key: 'Email', width: 30 },
      { header: 'Phone_number1', key: 'Phone_number1', width: 30 },
      { header: 'Phone_number2', key: 'Phone_number2', width: 30 },
      { header: 'Organization', key: 'Organization', width: 30 },
      { header: 'Designation', key: 'Designation', width: 30 },
      { header: 'Country_code', key: 'Country_code', width: 30 },
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
        Name: '',
        Email: '',
        Phone_number1: '',
        Phone_number2: '',
        Organization: '',
        Designation: '',
        Country_code: ''
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
      FileSaver.saveAs(blob, 'sample_advance_contactList');
    });

  }
}


@Component({
  selector: 'info-dialog',
  templateUrl: 'info-dialog.html',
})

export class InfoDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoDialog>, @Inject(MAT_DIALOG_DATA) public data: ContactList,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
    // e.preventDefault();
  }
}

@Component({
  selector: 'contactlist-dialog',
  templateUrl: 'contactlist-dialog.html',
})

export class ContactlistDialog {
  contactListForm: FormGroup;
  submitted = false;
  checkForm: any;
  countryList = [];
  CountrydataFilter = [];
  CountryFilter:any;
  filter:any[]=[];
  countryCode = "";
  error = '';
  // validNumber = "";
  countryID: any = {};
  customerId = '';
  extensionId = '';
  contactData: any = {};
  errorField = '';
  phoneNum2 = false;
  phoneNum1 = false;
  isloading  = false;
  dataSource: any = [];
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  DataBind: string;


  constructor(
    public dialogRef: MatDialogRef<ContactlistDialog>, @Inject(MAT_DIALOG_DATA) public data: ContactList,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private contactListService: ContactListService
  ) {
    this.contactListForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'email': ['', [Validators.required, Validators.pattern(EMAIL_RegEx)]],
      'phone1': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'phone2': ['', Validators.pattern(Number_RegEx)],
      'organization': [''],
      'designation': ['', Validators.pattern(Name_RegEx)],
      'country': ['', Validators.required],
      'country_code': ['']
    });
  }

  get name() { return this.contactListForm.get('name'); }
  get email() { return this.contactListForm.get('email'); }
  get phone1() { return this.contactListForm.get('phone1'); }
  get phone2() { return this.contactListForm.get('phone2'); }
  get country() { return this.contactListForm.get('country'); }
  get designation() { return this.contactListForm.get('designation'); }
  get country_code() { return this.contactListForm.get('country_code'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }
  ngOnInit() {
    
    //get customer wise country
    setTimeout(() => {
      
    if (localStorage.getItem('type') == '6') {
      this.commonService.customerWiseCountry(localStorage.getItem('id')).subscribe(data => {
        this.countryID = data.response[0];
        let code = this.contactListForm.get('phone1').value;
        if(code == null || code == ""){
        this.countryCode = '+' + data.response[0].phonecode
        }
      }, err => {
        this.error = err.message;
      });

    } else if ((localStorage.getItem('type') == '1') && this.countryCode == '') {
      this.commonService.getCustomerCountry(localStorage.getItem('id')).subscribe(data => {
        this.countryID = data.response[0];
        let code = this.contactListForm.get('phone1').value;
        if(code == null || code == ""){
        this.countryCode = '+' + data.response[0].phonecode
        }
      }, err => {
        this.error = err.message;
      });
    }
  }, 1000);

    //get country list
    setTimeout(() => {
      
    this.commonService.getCountryList().subscribe( async data => {
      this.CountrydataFilter = this.countryList = await data.response;
      this.filter = this.CountryFilter = this.countryList.slice();
      this.getContactList();
    }, err => {
      this.error = err.message;
    });
  }, 200);

  }

  getContactList = () => {
    if (this.data.id) {
      this.contactListService.getContactList({ id: this.data.id, phonenumber1: null, phonenumber2: null, 'customer_id': this.data['customerId'], 'extension_id': this.data['extensionId'], 'role': localStorage.getItem('type') }).subscribe(data => {
        this.contactData = data[0];
        this.countryCode = this.contactData.country_code;
      }, err => {
        this.error = err.message;
      });
    }
  }

  submitContactListForm() {
    this.checkForm = this.findInvalidControls();
    if (this.contactListForm.valid) {
      this.submitted = true;
      const credentials = this.contactListForm.value;
      credentials.role = Number(localStorage.getItem('type'));
      credentials.customer_id = Number(this.data['customerId']);
      credentials.extension_id = this.data['extensionId'];
      credentials.id = Number(this.data.id) ? Number(this.data.id) : null;
      credentials.phone1 = Number(credentials.phone1)
      credentials.phone2 = Number(credentials.phone2)
      console.log(credentials,'--------------contact',Number(credentials.phone1),credentials.phone2);
      // return
      
      if (credentials.phone1 != credentials.phone2) {

        this.contactListService.getContactList({ id: null, phonenumber1: credentials.country_code + credentials.phone1, phonenumber2: null, 'customer_id': this.data['customerId'], 'extension_id': this.data['extensionId'], 'role': localStorage.getItem('type') }).subscribe(data => {
          if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
            this.contactListForm.controls['phone1'].setValue('');
            credentials.phone1 = '';
            return;
          } else {
            this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: credentials.country_code + credentials.phone2, 'customer_id': this.data['customerId'], 'extension_id': this.data['extensionId'], 'role': localStorage.getItem('type') }).subscribe(data => {
              if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
                this.errorField = data[0].MESSAGE_TEXT;
                this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
                this.contactListForm.controls['phone2'].setValue('');
                credentials.phone2 = '';
                return;
              } else {
                credentials.country_name = this.countryList.filter(item => item.id == credentials.country)[0]['name'];
                this.contactListService.createContact('createContact', credentials)
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
        });
      } else {
        this.toastr.error('Error!', sameNumber, { timeOut: 2000 });
      }
    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
    // }
  }
  Countryremovedspace = (event:any) => {
    const countryspace = event.text.trim().toLowerCase();
    const countryFilter = this.CountrydataFilter.filter((data) =>{
      return data['name'].toLowerCase().includes(countryspace);
    })
    
    event.updateData(countryFilter);
  }

  cancelForm() {
    this.contactListForm.reset();
    this.contactListService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.contactListForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  getCountryCode(event) {
    // let country_id = event.value;
    let country_id = event['itemData'].id;
    if (event) {
      this.commonService.getCountryById(country_id).subscribe(data => {
        this.countryCode = '+' + data.response[0].phonecode;
      }, err => {
        this.error = err.message;
      });
    }
  }
}

