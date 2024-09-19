import { Component, OnInit, Inject, } from '@angular/core';
import { SupportUserService } from '../support-user-service'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { formError,formErrorforSupport, Errors, ProductService, CommonService, ExcelService, Name_RegEx, contactGroupNameDuplicate, contactGroupCreated, supportGroupUpdated, supportGroupNameDuplicate } from '../../../core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Page } from '../../../core/models';
import { support } from 'src/app/core/models/All_support';
import { ToastrService } from 'ngx-toastr';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { id } from '@swimlane/ngx-charts/release/utils';
import { UserService } from "src/app/views/user/user.service";

declare const ExcelJS: any;

@Component({
  selector: 'app-view-supportGroup',
  templateUrl: './view-supportGroup.component.html',
  styleUrls: ['./view-supportGroup.component.css']
})
export class ViewSupportUserComponent implements OnInit {

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
  supportMenu: any = '';


  constructor(
    public SupportUserService: SupportUserService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private toastr: ToastrService

  ) { }

  ngOnInit() {
    
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.supportMenu = this.menus.find((o) => o.url == '/support-user/supportgroup/view');
    this.filterForm = this.fb.group({
      'name': [""],
    });

    this.displayAllRecord();
  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 10 },
      { field: 'product_name', headerName: 'Product', hide: false, width: 15 },

    ];
    if (this.isFilter) {
      this.filterObj = this.filterForm.value
    } else {
      this.filterObj = {};
    }
    this.SupportUserService.getsupportList(this.filterObj).subscribe(pagedData => {
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
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Product', key: 'product_name', width: 80 }
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
        Name: this.exportData[i].name,
        Product: this.exportData[i].product_name,
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
      FileSaver.saveAs(blob, 'supportGroup');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Name", "Product"];
    var rows = [];
    this.exportData.forEach(element => {
      let strCode = element.code;
      //let strCode1 = strCode.replace(/<[^>]*>/g, '');
      const e11 = [element.name, element.product_name];
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
    doc.save('SupportGroup.pdf');
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

      if(this.supportMenu.all_permission == '0' && this.supportMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }

      if (this.supportMenu.modify_permission) {
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
        if (this.supportMenu.delete_permission) {
          finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
        }
      }
      if (this.supportMenu.add_permission) {
        finalBtn += "<i class='fa fa-universal-access list-button' style='cursor:pointer; display: inline' data-action-type='addContact' title='Add User'></i>";
      }
      if (this.supportMenu.view_permission && pagedData[i]['flag'] == 1) {
        finalBtn += "<i class='fa fa-users list-button'  style='cursor:pointer; display: inline' data-action-type='associateContact' title='Associate User' ></i>";
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
        return this.editsupportGroup(data);
      case "delete":
        return this.deletesupportGroup(data);
      case "addContact":
        return this.addContactInGroup(data);
      case "associateContact":
        return this.showAssociateUsers(data);

      case "active":

    }
  }
  //  updateSupportGroupe() {}
  addSupportGroup() {
    this.openDialog(null)
    // this.router.navigate(['config/addCircle'], { queryParams: { id: null } });
  }

  showAssociateUsers(data) {
    this.router.navigate(['support-user/groupUsers'], { queryParams: { gId: data.id, gName: data.name } });
  }

  editsupportGroup(data: any) {
    this.openDialog(data);
  }

  openDialog(data?): void {
    // alert(id);

    const dialogRef = this.dialog.open(viewsupportGroupDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  deletesupportGroup(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Support Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.SupportUserService.deletesupportGroup({ id: event.id }).subscribe(data => {
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
          }
          else if (data['code'] == 202) {
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
            this.errors = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Support Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'> Support Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }
  assignSupportGroup() {
    this.openassignDialog()
  }

  addContactInGroup(event) {
    this.openAddContactDialog(event.id)
  }
  //open assign model window


  openassignDialog(data?): void {
    // alert(id);assignSupportGroup

    const dialogRef = this.dialog.open(assignSupportGroup, { width: '80%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openAddContactDialog(id?): void {
    this.SupportUserService.getAllUserInGroup(id).subscribe(data => {
      if (data.length == 0) {
        const dialogRef = this.dialog.open(AddUserInGroupDialog, {
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
          // this.showNotInsertedValue = false;
          console.log('Dialog closed');
        });
      } else {
        this.toastr.error('Alert!', 'Use Edit button for manage users', { timeOut: 2000 });
      }
    });
  }

  //open modelwindow
  showInfo() {
    const dialogRefInfo = this.dialog.open(SupportInfoDialog, {
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

//view SupportGroup
@Component({
  selector: 'viewsupportGroup-dialog',
  templateUrl: './view-supportGroup-dialog.html',
})

export class viewsupportGroupDialog {

  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  // templateUrl: 'view-dialog.html'
  supportGroupForm: FormGroup;
  page = new Page();
  rows = new Array<support>();
  group_name = "";
  checkForm: any;
  selectedValue: any;
  isEdit: boolean = false;
  errorField: any;
  supportMenu: any;
  menus: any;
  supportGroupData: any;
  product_list = []
  userList: any[] = [];
  isContactSection: boolean = false;
  public placeholder: string = 'Select Support Manager';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public fields: Object = { text: 'name', value: 'id' };

  constructor(
    public dialogRef: MatDialogRef<viewsupportGroupDialog>, @Inject(MAT_DIALOG_DATA) public data: support,
    private router: Router,
    private fb: FormBuilder,
    public supportUserService: SupportUserService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public productService: ProductService,
    public userService: UserService
  ) {
    this.supportGroupForm = this.fb.group({
      'name': [""],
      'product_id': [""],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.supportMenu = this.menus.find((o) => o.url == '/support-user/supportgroup/view');
  }

  get name() { return this.supportGroupForm.get('name'); }
  get product() { return this.supportGroupForm.get('product_id'); }

  ngOnInit() {

    if(this.supportMenu.all_permission == '0' && this.supportMenu.view_permission == '1'){
      this.supportGroupForm.disable();
    }

    this.productService.getProductInfo().subscribe(data => {
      this.product_list = data.response ? data.response : [];
      if (this.product_list.length > 0 && !this.data) this.supportGroupData.product_id = this.product_list[0]['id']
    });
    this.supportGroupData = this.data;
    this.isEdit = true;
    if (!this.data) {
      this.supportGroupData = {
        name: '',
        product_id: ''
      };
    }

    if (this.data.id) {
      this.isContactAttachWithGroup();
      //  this.contactListService.getContactGroupByID(this.data.id).subscribe(data => {
      //    this.contactData = data[0];
      //  }, err => {
      //    this.error = err.message;
      //  });
    }
  }


  public findInvalidControls() {
    const invalid = [];
    const controls = this.supportGroupForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }


  submitSupportGroup() {
    this.checkForm = this.findInvalidControls();
    if (this.supportGroupForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.supportGroupForm.value;
      if (this.data) {
        if (credentials.hasOwnProperty('contacts')) {
          credentials.id = this.data.id;
          credentials.customer_id = localStorage.getItem('id');
          this.supportUserService.updateSupportGroupWithUsers(credentials)
            .subscribe(data => {
              if (data['code'] == 200) {
                this.toastr.success('Success!', supportGroupUpdated, { timeOut: 2000 });
                this.submitted = false;
                this.reloadFeature();
              } else if (data['code'] == 1062) {
                this.toastr.error('Error!', supportGroupNameDuplicate, { timeOut: 2000 });
                this.submitted = false;
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                this.submitted = false;
              }
            });
        } else {
          credentials.id = this.data.id;
          this.supportUserService.updatesupportGroup(credentials)
            .subscribe(data => {
              if (data['code'] == 200) {
                this.toastr.success(data['message'], 'Success!', { timeOut: 2000 });
                this.reloadFeature();
              }
              else {
                this.toastr.error(data['message'], 'Error!', { timeOut: 2000 });
              }
            });
        }

      } else {
        this.supportUserService.addsupportGroup(credentials)
          .subscribe(data => {
            if (data['code'] == 200) {
              this.toastr.success('Success!', "Support Group added successfully", { timeOut: 2000 });
              this.reloadFeature();
            }
            else {
              this.toastr.error('Error!', 'Support Group Name already exist', { timeOut: 2000 });
            }
          });
      }

    } 
    else {
      // this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
      this.toastr.error('Error!', formErrorforSupport,{ timeOut: 2000 });
    }
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  reloadFeature() {
    this.supportGroupForm.reset();
    this.supportUserService.updateGridList();
    this.dialogRef.close();
  }

  public isContactAttachWithGroup() {
    this.supportUserService.checkUserInGroup(this.data.id).subscribe(data => {
      if (data.length > 0) {
        this.supportGroupForm.addControl('contacts', new FormControl(null, Validators.required));
        this.getUserList(data);
      }
    }, err => {
      this.error = err.message;
    });
  }

  public getUserList(contacts) {
    this.userService.getAllSupportUser().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.userList.push({ id: data[i].id, name: data[i].username });
      }
      this.isContactSection = true;
      this.getMappingContact(contacts);
    }, err => {
      this.error = err.message;
    });
  }

  public getMappingContact(contacts) {
    let contactArray = []
    contacts.forEach(element => {
      contactArray.push(element.support_user_id)
    });
    this.supportGroupData.contacts = contactArray;
  }

}


// info Dialog
@Component({
  selector: 'supportInfoDialog',
  templateUrl: 'supportInfoDialog.html',
})

export class SupportInfoDialog {
  constructor(public dialogRef: MatDialogRef<SupportInfoDialog>,) { }
  cancleDialog(): void {
    this.dialogRef.close();
  }

}


// Assign Support Group
@Component({
  selector: 'assignSupportGroup',
  templateUrl: './assignSupportGroup.html',
})

export class assignSupportGroup {
  assignSupportForm: FormGroup;
  supportGroupData: any;
  supportId: any;
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  page = new Page();
  rows = new Array<support>();
  isEdit: boolean = false;
  errorField: any;
  data: any;
  dialog: any;
  group_name = "";
  selectedValue: any;
  allSupportUser: any;


  constructor(
    public dialogRef: MatDialogRef<assignSupportGroup>, @Inject(MAT_DIALOG_DATA) public support: support,
    private router: Router,
    private fb: FormBuilder,
    public supportUserService: SupportUserService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public productService: ProductService,
    public userService: UserService
  ) {
    this.assignSupportForm = this.fb.group({
      'name': [""],
      'support_user': [""],
    });
  }

  get name() { return this.assignSupportForm.get('name'); }
  get product() { return this.assignSupportForm.get('product'); }

  ngOnInit() {
    this.supportUserService.getsupportList({}).subscribe(data => {
      this.selectedValue = data;
    })

    this.userService.getAllSupportUser().subscribe(data => {
      this.allSupportUser = data;
    })
    // this.productService.getProductInfo().subscribe(data => {
    //   this.selectedValue = data.response;
    // });
    this.supportGroupData = this.data;
    this.isEdit = true;
    if (!this.data) {
      this.supportGroupData = {
        name: '',
        product: ''
      };
    }
  }

  submitAssignGroup() {
    if (this.assignSupportForm.valid) {

      let createupportGroupData = this.assignSupportForm.value;
      // updatesupportGroupData.id = this.supportId;
      // we can pass form data on Service now.
      this.supportUserService.createSupportUser(createupportGroupData).subscribe((data) => {

        if (data.code == '200') {
          this.toastr.success('Success!', data['message'], { timeOut: 2000 });
        }
         else {
          this.toastr.warning('Warning!', data['message'], { timeOut: 2000 });
        }
        //this.router.navigate(['support-user/view-supportgroup'] );
        this.dialogRef.close();

      });
    }
  }

  cancelForm() {
    this.assignSupportForm.reset();
    this.router.navigate(['support-user/view-supportgroup'])
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.assignSupportForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }
}

@Component({
  selector: 'add-user-in-group-dialog',
  templateUrl: 'add-user-in-group-dialog.html',
})

export class AddUserInGroupDialog {
  contactGroupForm: FormGroup;
  submitted = false;
  checkForm: any;
  selectedValue: any;
  error = '';
  countryID: any = {};
  customerId = '';
  extensionId = '';
  contactData: any = {};
  errorField = '';
  contactList: any[] = [];
  public placeholder: string = 'Select Support Manager';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public fields: Object = { text: 'name', value: 'id' };

  constructor(
    public dialogRef: MatDialogRef<AddUserInGroupDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private supportUserService: SupportUserService,
    public userService: UserService

  ) {
    this.contactGroupForm = this.formBuilder.group({
      'contacts': ['', [Validators.required]],

    });

  }

  get contacts() { return this.contactGroupForm.get('contacts'); }


  ngOnInit() {
    this.supportUserService.getsupportList({}).subscribe(data => {
      this.selectedValue = data;
    })
    this.customerId = localStorage.getItem('id');
    this.userService.getAllSupportUser().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.contactList.push({ id: data[i].id, name: data[i].username });
      }
    }, err => {
      this.error = err.message;
    });

  }

  submitContactListForm() {
    this.checkForm = this.findInvalidControls();
    if (this.contactGroupForm.valid) {
      this.submitted = true;
      const credentials = this.contactGroupForm.value;
      credentials.group_id = this.data['id'];
      this.supportUserService.addassigngroup(credentials)
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
    this.supportUserService.updateGridList();
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
}