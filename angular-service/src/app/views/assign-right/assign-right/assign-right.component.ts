import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors,ProductService, CommonService, RINGTIMEOUT_RegEx, SIPError, formError } from '../../../core';
import { AssignrightService } from '../assign-right.service';

export interface AssignRights { userid: string, pkgid: string }

@Component({
  selector: 'app-assign-right',
  templateUrl: './assign-right.component.html',
  styleUrls: ['./assign-right.component.css']
})
export class AssignRightComponent implements OnInit {

  error = '';
  isFilter = false;
  filterForm: FormGroup;

  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  viewButton: boolean = true;
  editButton: boolean = true;
  deleteButton: boolean = true;
  packageList = '';
  selectedValue= '';

  constructor(
    private assignRightService: AssignrightService,
     public dialog: MatDialog,
     private productService:ProductService,
     private commonService:CommonService,
     private fb: FormBuilder) 
     {
      this.filterForm = this.fb.group({
        'by_company': [""],
        'by_package': [""]
      });
     }

  ngOnInit() {
    //this.displayAllRecord();
    this.assignRightService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.productService.getPbxPackageInfo().subscribe(data => {
      this.packageList = data.response;
    });
    this.commonService.getAllCustomerCompany().subscribe(data => {
      this.selectedValue = data.response;
    });
  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'userid', headerName: 'User Id', hide: true, width: 10 },
      { field: 'customer', headerName: 'Company', hide: false, width: 20 },
      { field: 'pkgid', headerName: 'Package Id', hide: true, width: 10 },
      { field: 'packagename', headerName: 'Package Name', hide: false, width: 20 },
      { field: 'action', headerName: 'Action', hide: false, width: 10 },

    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.assignRightService.getAssignRightsFilter(credentials).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    } else {
    this.assignRightService.getAssignRights().subscribe(pagedData => {
      pagedData = this.manageUserActionBtn(pagedData);
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    });
  }
  }


  manageUserActionBtn(data) {
    Object.keys(data).forEach(value => {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";

      data[value]['action'] = finalBtn;
    })
    return data;
  }
  editData(event) {
    this.openDialog(event);
  }

  deleteData(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: 'You will not be able to recover this Assign Rights in future!',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.assignRightService.deleteAssignRights({ userid: event.userid, pkgid: event.pkgid }).subscribe(data => {
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
          text: 'Assign Rights has been deleted.',
          type: 'success',
          background: '#000000'
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: 'Assign Right is safe :)',
          type: 'error',
          background: '#000000',
        });
      }
    })
  }

  openDialog(val?): void {
    const dialogRef = this.dialog.open(AssignRightsDialog, {
      width: '60%', disableClose: true,
      data: val ? {
        userid: val['userid'] ? val.userid : null,
        pkgid: val['pkgid'] ? val.pkgid : null
      } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    if (actionType === 'edit') {
      this.editData(data);
    }
    if (actionType === 'delete') {
      this.deleteData(data);
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

}

@Component({
  selector: 'assignright-dialog',
  templateUrl: 'assignright-dialog.html',
  styleUrls: ['./assign-right.component.css']
})
export class AssignRightsDialog {

  assignRightsForm: FormGroup;
  userPackageValue: any;
  packageList: any;
  add1 = true;
  isDuplicate = false;
  submitted = false;
  checkForm: any;
  dynamicPkgHtml: any = '';
  error = '';
  errorField: any;
  errors: Errors = { errors: {} };
  gridData: any = [];
  assignRightsData: any = {};
  dataSource1: any = [];
  pageSize: number = 10;
  storedData: any = [];
  checkboxButton: boolean = true

  constructor(
    public dialogRef: MatDialogRef<AssignRightsDialog>, @Inject(MAT_DIALOG_DATA) public data: AssignRights,
    private formBuilder: FormBuilder, private assignRightService: AssignrightService,
    private toastr: ToastrService, public commonService: CommonService) {
    this.assignRightsForm = this.formBuilder.group({
      'userName': [''],
      'pkgName': [''],
    });
  }


  columnDefs = [
    { headerName: 'Id', field: 'id', hide: true },
    { headerName: 'Menu Name', field: 'menuname', width: 20 },
    { field: 'action', headerName: 'Action', hide: false, width: 50 }
  ];

  get userName() { return this.assignRightsForm.get('userName'); }
  get pkgName() { return this.assignRightsForm.get('pkgName'); }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  ngOnInit() {

    this.assignRightService.getUserPackageDetails({ pkgid: null, prodid: null }).subscribe(userData => {
      this.userPackageValue = userData;

      if (this.data) {
        this.assignRightsData.userName = this.data.userid;
        this.assignRightService.getSavedAssignRights({ userid: this.data.userid, pkgid: this.data.pkgid }).subscribe(getData => {
          this.storedData = getData;
          this.getGridListData(this.data.userid);
        });
      }
    });
  }

  getGridListData(evalue) {
    let val = this.userPackageValue.find(o => o.userid == evalue);
    this.assignRightsData.pkgName = val.pkgid;
    this.assignRightService.getUserPackageDetails({ pkgid: val.pkgid, prodid: val.prodid }).subscribe(data => {
      if (!data['code']) {
        Object.keys(data).forEach(value => {
          let val = '';
          data[value]['addpermission'] = 0;
          data[value]['editpermission'] = 0;
          data[value]['deletepermission'] = 0;
          data[value]['viewpermission'] = 0;

          if (this.storedData.length > 0) {
            val = this.storedData.find(o => o.menuid == data[value]['id']);
            data[value]['addpermission'] = val['addpermission'];
            data[value]['editpermission'] = val['editpermission'];
            data[value]['deletepermission'] = val['deletepermission'];
            data[value]['viewpermission'] = val['viewpermission'];
          }
        })
        this.gridData = data;
        Object.keys(data).forEach(value => {
          let finalBtn = '';
          if (data[value].hasOwnProperty('addpermission') && (data[value]['addpermission'] == true)) {
            finalBtn += '<span style="margin-right:20px">Add: <input id="' + data[value]['id'] + '_addpermission" type="checkbox" checked></span>'
          }
          else {
            finalBtn += '<span style="margin-right:20px">Add: <input id="' + data[value]['id'] + '_addpermission" type="checkbox"></span>'
          }

          if (data[value].hasOwnProperty('editpermission') && (data[value]['editpermission'] == true)) {
            finalBtn += '<span style="margin-right:20px">Edit: <input id="' + data[value]['id'] + '_editpermission" type="checkbox" checked></span>'
          }
          else {
            finalBtn += '<span style="margin-right:20px">Edit: <input id="' + data[value]['id'] + '_editpermission" type="checkbox"></span>'
          }

          if (data[value].hasOwnProperty('deletepermission') && (data[value]['deletepermission'] == true)) {
            finalBtn += '<span style="margin-right:20px">Delete: <input id="' + data[value]['id'] + '_deletepermission" type="checkbox" checked></span>'
          }
          else {
            finalBtn += '<span style="margin-right:20px">Delete: <input id="' + data[value]['id'] + '_deletepermission" type="checkbox"></span>'
          }

          if (data[value].hasOwnProperty('viewpermission') && (data[value]['viewpermission'] == true)) {
            finalBtn += '<span style="margin-right:20px">View: <input id="' + data[value]['id'] + '_viewpermission" type="checkbox" checked></span>'
          }
          else {
            finalBtn += '<span style="margin-right:20px">View: <input id="' + data[value]['id'] + '_viewpermission" type="checkbox"></span>'
          }
          data[value]['action'] = finalBtn;
        });

        this.dataSource1 = [];
        this.dataSource1.push({ 'fields': this.columnDefs, 'data': data });
      }
      else {
        this.toastr.error('Error!', data['message'], { timeOut: 2000 });
      }
    });

  }

  displayList(e) {
    this.getGridListData(e.value);
  }


  submitAssignRightsForm() {
    const credentials = this.assignRightsForm.value;
    credentials['griddata'] = this.gridData;

    for (let i = 0; i < this.gridData.length; i++) {
      delete this.gridData[i]['action'];
    }

    this.assignRightService.saveAssignRights(credentials)
      .subscribe(data => {
        if (data['code'] == 200) {
          this.toastr.success('Success!', data['message'], { timeOut: 2000 });
          this.assignRightsForm.reset();
          this.assignRightService.updateGridList();
          this.dialogRef.close();
        }
        else {
          this.toastr.error('Error!', data['message'], { timeOut: 2000 });
        }
      });


  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.assignRightsForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancelForm() {
    this.assignRightsForm.reset();
  }

  manageAction(e) {
    let data = e.event.target;
    let fields = data.id.split('_');
    for (let i = 0; i < this.gridData.length; i++) {
      if (this.gridData[i].id == parseInt(fields[0])) {
        this.gridData[i][fields[1]] = data.checked;
      }
    }
  }


}