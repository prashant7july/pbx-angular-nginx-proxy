import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactListService } from '../contact-list.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, invalidFileType, Number_RegEx, EMAIL_RegEx, Name_RegEx, importUnsuccessfully, importSuccessfully, sameNumber, phonebookLimitExceed, formError, contactGroupUpdated,contactGroupNameDuplicate, contactGroupCreated } from '../../../core';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../../environments/environment.prod';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { ContactGroup } from 'src/app/core/models/contactGroup.model';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { async } from 'rxjs/internal/scheduler/async';

declare const ExcelJS: any;

@Component({
  selector: 'app-view-contact-group',
  templateUrl: './view-contact-group.component.html',
  styleUrls: ['./view-contact-group.component.css'],
})
export class ViewContactGroupComponent implements OnInit {

  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  numberExists = false;
  isFilter = false;
  filterForm: FormGroup;
  userRole = '';
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  customerId = '';
  extensionId = '';
  blackList: any = '';
  contactCount: any = 0;
  exportData: any = {};
  showNotInsertedValue = false;
  excelValue: any = {};
  defaultPageSize = '10';

  constructor(
    private fb: FormBuilder,
    private contactListService: ContactListService,
    public commonService: CommonService,
    public dialog: MatDialog,
    public router:Router,
    private toastr: ToastrService,
    private excelService: ExcelService,
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      // 'by_number': [""],
      // 'by_email': [""]
    });
  }

  ngOnInit() {
  

    this.contactListService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.showNotInsertedValue = false;
  }

  displayAllRecord() {
    this.showNotInsertedValue = false;
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 30 },
      { field: 'description', headerName: 'Description', hide: false, width: 30 },
  
    ];


    if (this.isFilter) {
      const credentials = this.filterForm.value;
      let customerId = localStorage.getItem('id');
      this.contactListService.filterContactGroups(customerId,credentials ).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.contactCount = data ? data.length : 0;
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      let customerId = localStorage.getItem('id');
      this.contactListService.getContactGroups(customerId)
        .subscribe(data => {
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
      { header: 'Description', key: 'description', width: 30 },
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
        description: this.exportData[i].description,
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
      FileSaver.saveAs(blob, 'Contact_Group');
    });

  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Name", "Description"];
    var rows = [];
    this.exportData.forEach(element => {
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
        1: { cellWidth: 'wrap' },
        2: { cellWidth: 'wrap' },
        3: { cellWidth: 'wrap' }
      },
    });
    doc.save('Contact_Group.pdf');
  }

  manageUserActionBtn(data) {
   for (let i = 0; i < data.length; i++) {
      let contacts = (data[i].contact_id) ? (data[i].contact_id).split(",") : [];
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      if(data[i]['flag'] == 1){
      finalBtn += "<i class='fa fa-users list-button'  style='cursor:pointer; display: inline' data-action-type='associateContact' title='Associate Contact' ></i>";
      }
      if(!contacts.length){
      finalBtn += "<i class='fa fa-universal-access list-button' style='cursor:pointer; display: inline' data-action-type='addContact' title='Add Contact'></i>";
      }
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";

      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "addContact":
      return this.addContactInGroup(data);
      case "edit":
        return this.editData(data);
      case "associateContact": 
        return this.showAssociateContacts(data);
      case "delete":
        return this.deleteData(data);
      // case "copyToBlackListData":
      //   return this.copyToBlackListData(data);
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
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      // html: "<span style='color:#FFFFFF';>You will not be able to recover Contact Group </span>" <span style ='color:red; font-weight :bold; font-size: 1.2em' >"+event.name+"</span> "<span>in future!</span>",
      html : "<span style='color:#FFFFFF;'>You will not be able to recover Contact Group</span> <span style='color:red; font-weight:bold; font-size:1.2em'>"+event.name+ "</span>  <span style='color:#FFFFFF;'>in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.contactListService.deleteContactGroup({ id: event.id }).subscribe(data => {  
         if(data['code'] == 202){
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
         }
          else {
            this.displayAllRecord();
          }
        },
          err => {
            // this.errors = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html : " <span style='color:#FFFFFF;'> Contact group </span> <span style='color:red; font-size:1.2em; font-weight: bold;'>"+event.name+" </span> <span style='color:#FFFFFF'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer:2000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html : "<span style='color:#FFFFFF';>Contact group </span> <span style='color:red; font-weight:bold; font-size:1.3em'>"+event.name+ "</span> <span style='color:#FFFFFF';> is safe </span> ",
          type: 'error',
          background: '#000000',
          timer:2000
        });
      }
    })
  }
  // importFile() {
  //   const dialogRef11 = this.dialog.open(ImportDialog, {
  //     width: '60%', disableClose: true,
  //     data: {
  //       customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
  //       extensionId: localStorage.getItem('type') == '6' ? localStorage.getItem('id') : 0,
  //     }
  //   });

  //   dialogRef11.afterClosed().subscribe(result => {
  //     this.showNotInsertedValue = false;
  //     console.log('Dialog closed');
  //   });
  // }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoGroupDialog, {
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
      // console.log(data.response);
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
          text: 'You want to blacklist this contact in future!',
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, blacklist it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.contactListService.copyToBlackList({ data: event }).subscribe(data => {
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
              text: 'Contact has been blacklisted.',
              type: 'success',
              background: '#000000'
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              text: 'Contact is safe :)',
              type: 'error',
              background: '#000000',
            });
          }
        })
      }
    }, err => {
      console.log(err);
      this.error = err.message;
    });
  }

  addContactInGroup(event) {
    this.openAddContactDialog(event)
  }

  editData(event) {
    this.showNotInsertedValue = false
    this.openDialog(event.id);
  }

  showAssociateContacts(data) {
   this.router.navigate(['contactList/group/groupContacts'], { queryParams: { gId: data.id , gName : data.name } });
 }
  
  openDialog(id?): void {
    const dialogRef = this.dialog.open(AddContactGroupDialog, {
      width: '60%', disableClose: true,
      data: {
        id: id ? id : null,
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
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

  openAddContactDialog(event): void {
    this.contactListService.getAllContactInGroup(event.id).subscribe(data => {
     if(data.length == 0){
      const dialogRef = this.dialog.open(AddContactInGroupDialog, {
        width: '60%', disableClose: true,
        data: {
          id: event ? event.id : null,
          name: event ? event.name: null,
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
     }else{
      this.toastr.error('Alert!', 'Use Edit button for manage contacts', { timeOut: 2000 });
     }
    });
    
  }
 

}

@Component({
  selector: 'info-dialog',
  templateUrl: 'info-contact-group-dialog.html',
})

export class InfoGroupDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoGroupDialog>, @Inject(MAT_DIALOG_DATA) public data,
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
  selector: 'add-contact-group-dialog',
  templateUrl: 'add-contact-group-dialog.html',
  providers: [CheckBoxSelectionService]
})

export class AddContactGroupDialog {
  contactGroupForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = '';
  // validNumber = "";
  countryID: any = {};
  customerId = '';
  extensionId = '';
  contactData: any = {};
  errorField = '';
  contactList: any[] = [];
  isContactSection : boolean = false;
  public placeholder: string = 'Select Contact';
  public popupHeight:string = '200px';
  public popupWidth:string = '250px';
  public fields: Object = { text: 'showDisplay', value: 'id' };
  public mode ;
  public selectAllText: string

  constructor(
    public dialogRef: MatDialogRef<AddContactGroupDialog>, @Inject(MAT_DIALOG_DATA) public data : any,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private contactListService: ContactListService
  ) {
    this.contactGroupForm = this.formBuilder.group({
      'name': ['', [Validators.required]],
      'description': [''],
      // 'contacts': [''],
    });
    this.customerId = localStorage.getItem('id');
  }

  get name() { return this.contactGroupForm.get('name'); }
  get description() { return this.contactGroupForm.get('description'); }


  ngOnInit() {
    this.mode = 'CheckBox';
    this.selectAllText= 'Select All';
     if (this.data.id) {
     this.isContactAttachWithGroup();
      this.contactListService.getContactGroupByID(this.data.id).subscribe(data => {        
        this.contactData = data[0];
      }, err => {
        console.log(err)
        this.error = err.message;
      });
    }

  }

  submitContactListForm() {
    this.checkForm = this.findInvalidControls();
    if (this.contactGroupForm.valid) {
      this.submitted = true;
      let groupName = this.contactGroupForm.value.name;    
      this.contactGroupForm.value.name = groupName.replace(/^./, groupName[0].toUpperCase())
      const credentials = this.contactGroupForm.value;
      credentials.customer_id = Number(this.customerId);
      credentials.id = Number(this.data.id) ? Number(this.data.id) : null;  
      // this.isGroupNameExit(credentials.name,credentials.customer_id);
      this.contactListService.checkGroupNameExist(credentials.name,credentials.customer_id, credentials.id).subscribe(data => {
        if(data.length == 0){
          if (this.data.id) { 
            let name = [];
            console.log(this.contactList,"contact list")
            if(credentials.contacts){
              credentials.contacts.map(item => {
                  name.push(this.contactList.filter(value => value.id == item)[0]['showDisplay'])
                })            
              credentials.contact_name = name
            }
            if(credentials.hasOwnProperty('contacts')){                    
              this.contactListService.updateContactGroupWithContacts('updateContact', credentials)
              .subscribe(data => {
                if (data['code'] == 200) {
                  this.toastr.success('Success!', contactGroupCreated, { timeOut: 2000 });
                  this.submitted = false;
                  this.cancelForm();
                } else if (data['code'] == 1062) {
                  this.toastr.error('Error!', contactGroupNameDuplicate, { timeOut: 2000 });
                  this.submitted = false;
                }
                else {
                  this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                  this.submitted = false;
                }
              });
            }else{
              this.contactListService.updateContactGroup('updateContact', credentials)
              .subscribe(data => {
                if (data['code'] == 200) {
                  this.toastr.success('Success!', contactGroupUpdated, { timeOut: 2000 });
                  this.cancelForm();
                } else if (data['code'] == 1062) {
                  this.toastr.error('Error!', contactGroupNameDuplicate, { timeOut: 2000 });
                }
                else {
                  this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                }
              });
            }
          }
          else{
            this.contactListService.createContactGroup('Contact', credentials)
              .subscribe(data => {
                if (data['code'] == 200) {
                  this.toastr.success('Success!', contactGroupCreated, { timeOut: 2000 });
                  this.cancelForm();
                } else if (data['code'] == 1062) {
                  this.toastr.error('Error!', contactGroupNameDuplicate, { timeOut: 2000 });
                }
                else {
                  this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                }
              });
          }
        }else{
         this.toastr.error('Error!', contactGroupNameDuplicate, { timeOut: 2000 });
       }
      });
    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
  }

  cancelForm() {
    this.contactGroupForm.reset();
    this.contactListService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.contactGroupForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  public  isContactAttachWithGroup(){    
     this.contactListService.checkContactInGroup(this.data.id).subscribe(data => {
       if(data.length > 0){
          this.contactGroupForm.addControl('contacts', new FormControl(null, Validators.required));
          this.getContactList(data);
       }
      
    }, err => {
      this.error = err.message;
    });
  }

  public getContactList(contacts){    
    this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, 'customer_id': this.customerId, 'extension_id': this.extensionId, 'role': localStorage.getItem('type') }).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.contactList.push({ id: data[i].id, name: data[i].name, showDisplay: data[i].name + ' - ' + data[i].phoneNumber1Display });
      }
      this.isContactSection = true;
      this.getMappingContact(contacts);
    }, err => {
      this.error = err.message;
    });
  }

  public getMappingContact(contacts){
    let contactArray = []
    contacts.forEach(element => {
      contactArray.push(element.contact_id)
    });    
    this.contactData.contacts = contactArray;
    // this.contactGroupForm.get('contacts').setValue(contactArray);
  }
}

@Component({
  selector: 'add-contact-in-group-dialog',
  templateUrl: 'add-contact-in-group-dialog.html',
  providers: [CheckBoxSelectionService]
})

export class AddContactInGroupDialog {
  contactGroupForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = '';
  // validNumber = "";
  countryID: any = {};
  customerId = '';
  extensionId = '';  
  errorField = '';
  contactList: any[] = [];
  public placeholder: string = 'Select Contact';
  public popupHeight:string = '200px';
  public popupWidth:string = '250px';
  public fields: Object = { text: 'showDisplay', value: 'id' };
  public __contactChangeSubscription;
  public mode ;
  public selectAllText: string

  constructor(
    public dialogRef: MatDialogRef<AddContactGroupDialog>, @Inject(MAT_DIALOG_DATA) public data : any,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private contactListService: ContactListService
  ) {
    this.contactGroupForm = this.formBuilder.group({
      'contacts': ['', [Validators.required]],
     
    });
    
  }

  get contacts() { return this.contactGroupForm.get('contacts'); }


  ngOnInit() {
    this.mode = 'CheckBox';
    this.selectAllText= 'Select All';
    this.customerId = localStorage.getItem('id');
    this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, 'customer_id': this.customerId, 'extension_id': this.extensionId, 'role': localStorage.getItem('type') }).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.contactList.push({ id: data[i].id, name: data[i].name, showDisplay : data[i].name + ' - ' + data[i].phoneNumber1Display});
      }
    }, err => {
      this.error = err.message;
    });

    this.__contactChangeSubscription = this.contactGroupForm.get('contacts').valueChanges.subscribe(contactID =>{    
   })
  }

  submitContactListForm() {
    if(!this.contactGroupForm.get('contacts').value){
      this.toastr.error('Error!', 'Please select at least one contact..', { timeOut: 2000 });
      return;
    }
    this.checkForm = this.findInvalidControls();
    if (this.contactGroupForm.valid) {
      this.submitted = true;
      const credentials = this.contactGroupForm.value;
      credentials.group_id = this.data['id'];
      credentials.group_name = this.data['name'];
      credentials.customer_id = localStorage.getItem('id');
      // credentials.id = this.data.id ? this.data.id : null;
      let name = [];
      credentials.contacts.map(item => {
        name.push(this.contactList.filter(value => value.id == item)[0]['showDisplay'])
      })            
      credentials.contact_name = name
      this.contactListService.addContactInGroup(credentials)
        .subscribe(data => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.submitted = false;
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
            this.submitted = false;
          }
        });
    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
  }

  cancelForm() {
    this.contactGroupForm.reset();
    this.contactListService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.contactGroupForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  public isChageContacts(data){
    this.contactGroupForm.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.__contactChangeSubscription.unsubscribe();
  }
}

