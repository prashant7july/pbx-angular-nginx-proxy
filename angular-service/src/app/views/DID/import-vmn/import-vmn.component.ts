import { Component, OnInit, ChangeDetectorRef, Inject, DebugElement } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationEnd } from '@angular/router';
import { DidService } from '../did.service'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { num_not_start_with_ziro, CommonService, Errors } from '../../../core';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-import-vmn',
  templateUrl: './import-vmn.component.html',
  styleUrls: ['./import-vmn.component.css']
})
export class ImportVmnComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  rowData: any;
  dataSource: any = [];
  isFilter = false;
  columnDefs: any = [];
  defaultPageSize = '10';
  exportData;
  menus: any;
  vmnMenu: any;
  constructor(
    private didService: DidService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private toastr: ToastrService,
    public commonService: CommonService,
    public route: Router
  ) {
    this.filterForm = this.fb.group({
      'by_vmn': [""]
    });
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.vmnMenu = this.menus.find((o) => o.url == '/did/import-vmn');
    this.didService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'action', headerName: 'Action', hide: false, width: 120 },
      { field: 'vmn_num', headerName: 'VMN', hide: false, width: 120 }
    ];

    if (this.isFilter) {
      this.didService.vmnDetail({ 'vmn': Number(this.filterForm.value.by_vmn) }).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data.response });
      })
    } else {
      this.didService.getVMNDetails('').subscribe(pagedData => {
        this.exportData = pagedData.response;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData.response });
      });
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.response.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      if(this.vmnMenu.all_permission == '0' && this.vmnMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if(this.vmnMenu.modify_permission){
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if(this.vmnMenu.delete_permission){
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      if (data.response[i]['did_id'] != 0) {
        finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='associateDID' title='View DID'></i>";
      }
      data.response[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editAccessData(data);
      case "delete":
        return this.deleteAccessGroup(data);
      case "associateDID":
        return this.associateDIDList(data);
    }
  }

  editAccessData(event) {
    this.openDialog(event.id);
  }

  deleteAccessGroup(event) {    
    if (event.did_id != 0) {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Oopss...</span>',
        html: "<span style='color:#FFFFFF;'>Vmn Number </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.vmn_num + "</span> <span style='color:#FFFFFF'> can't be deleted because it is associated with DID.</span> ",
        type: 'error',
        background: '#000000',
        timer: 6000
      });
    } else {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html: "<span style='color:#FFFFFF;'>You will not be able to recover VMN Number </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.vmn_num + "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: 'warning',
        showCancelButton: true,
        background: '#000000',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        preConfirm: () => {
          this.didService.deleteVmn({ 'id': event.id }).subscribe(data => {
            this.displayAllRecord();
            if (data) {
              this.toastr.success('Successfully !', "VMN Number Delete", { timeOut: 2000 });
            }
            else {
              this.toastr.error('Error!', data['message'], { timeOut: 2000 });
            }
          });
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Deleted!</span>',
            html: "<span style='color:#FFFFFF;'> VMN Number </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.vmn_num + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
            type: 'success',
            background: '#000000',
            timer: 4000
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html: "<span style='color:#FFFFFF;'> VMN Number </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.vmn_num + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: 'error',
            background: '#000000',
            timer: 4000
          });
        }
      })
    }
  }

  associateDIDList(data) {
    this.route.navigate(['did/vmn-associate-did'], { queryParams: { did_id: data.did_id, vmn_number: data.vmn_num } });
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }
  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(ImportVMNDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
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


@Component({
  selector: 'import-vmn-dialog',
  templateUrl: 'Import-VMN-dialog.html',
})
export class ImportVMNDialog {
  importVMNForm: FormGroup;
  errors: Errors = { errors: {} };
  VmnNumber: any;
  menus: any;
  vmnMenu: any;
  defaultPageSize = '10';


  constructor(
    public dialogRef: MatDialogRef<ImportVMNDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private didService: DidService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toastr: ToastrService
  ) {
    this.importVMNForm = this.fb.group({
      'vmn_number': ["", [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(num_not_start_with_ziro)]],
    });
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.vmnMenu = this.menus.find((o) => o.url == '/did/import-vmn');
  }

  ngOnInit() {

    if(this.vmnMenu.all_permission == '0' && this.vmnMenu.view_permission == '1'){
      this.importVMNForm.disable();
    }
    if (this.data.id) {
      let id = this.data.id
      this.didService.vmnDetail({ 'id': id }).subscribe(data => {
        this.VmnNumber = data.response[0]['vmn_num'];
      });
    }
  }

  submitVMN() {
    if (this.data.id) {
      let obj = {
        vmn_number: Number(this.importVMNForm.value.vmn_number),
        id: this.data.id
      }
      this.didService.createVMNNumber(obj).subscribe(data => {
        this.toastr.success('Success!', 'VMN Number Updated.', { timeOut: 2000 });
        this.dialogRef.close();
      }, err => {
        this.errors = err;
        this.toastr.error('Error!', 'Number already in system!', { timeOut: 2000 });
      });
    } else {
      let VmnForm = this.importVMNForm.value;
      VmnForm.vmn_number = Number(VmnForm.vmn_number);
      this.didService.createVMNNumber(VmnForm).subscribe(data => {
        this.toastr.success('Success!', 'VMN Number Import Successfully', { timeOut: 2000 });
        this.dialogRef.close();
      }, err => {
        this.errors = err;
        this.toastr.error('Error!', 'Number already in system!', { timeOut: 2000 });
      });
    }

  }

  cancleDialog(): void {
    this.dialogRef.close();
  }
}