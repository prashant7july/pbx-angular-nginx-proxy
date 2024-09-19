import { Component, OnInit ,Inject,} from '@angular/core';
import {SupportUserService} from '../support-user-service'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {formError, Errors, ProductService,CommonService,ExcelService ,Name_RegEx} from '../../../core';
import { Router,NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page} from '../../../core/models';
import { assign} from 'src/app/core/models/AssignUser';
import { ToastrService } from 'ngx-toastr';
import { UserService } from "src/app/views/user/user.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assigngroup',
  templateUrl: './assigngroup.component.html',
  styleUrls: ['./assigngroup.component.css']
})
export class AssigngroupComponent implements OnInit {
  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
  filterForm: FormGroup;
  filterObj:any={};

  constructor(
    public SupportUserService :SupportUserService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog,
  ) { }

  ngOnInit()
    {
      this.filterForm = this.fb.group({
        'name': [""],
      });
      this.displayAllRecord();
    }
  
  displayAllRecord() {

  this.columnDefs = [
    { field: 'id', headerName: 'ID', hide: true, width: 10 },
    { field: 'support_user_id', headerName: 'Assign User', hide: true, width: 10 },
    { field: 'support_group_id', headerName: 'Support Group', hide: true, width: 15 },
    { field: 'customer_name', headerName: 'Support User', hide: false, width: 15 },
    { field: 'group_name', headerName: 'Support Group', hide: false, width: 15 },
   // { field: 'product_name', headerName: 'Product Name', hide: false, width: 15 },
    { field: 'action', headerName: 'Action', hide: false, width: 10 },
  ];
  if(this.isFilter){
      this.filterObj = this.filterForm.value
  } else {
    this.filterObj ={};
  }
  console.log(this.filterObj);
  this.SupportUserService.getGroupAssignUser(this.filterObj).subscribe(pagedData =>{
    this.exportData = pagedData;
    console.log(this.exportData);
    this.dataSource = [];
    
    pagedData = this.manageUserActionBtn(pagedData);
    this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
  }, err => {
      this.error = err.message;
    }
  );
  }
  resetTable() {
    this.isFilter = false;
    this.filterForm.reset();
    this.displayAllRecord();
  }
  
  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  manageUserActionBtn(pagedData) {

    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      // finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
  
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
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
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
    console.log(actionType);
    console.log(data);
    switch (actionType) {
      case "edit":
      return this.editAssignuser(data);
        case "delete":
      return this.deleteAssignuserp(data);
        case "active": 
        
     }
   }

   editAssignuser(data: any) {
    console.log(data);
    this.openDialog(data);
    //his.router.navigate(['config/manage-circle'], { queryParams: {id:data.id } });
  }

   addAssignUser(){
    this.openDialog(null)
    // this.router.navigate(['config/addCircle'], { queryParams: { id: null } });
  }
 
  
 openDialog(data?): void {
  const dialogRef = this.dialog.open(viewassigngroupDialog, { width: '80%', disableClose: true, data: data ? data : null });
  dialogRef.keydownEvents().subscribe(e => {
    if (e.keyCode == 27) {
      dialogRef.close('Dialog closed');
    }
  });
  dialogRef.afterClosed().subscribe(result => {
   console.log('Closed')
    this.displayAllRecord();
  });
}


deleteAssignuserp(event) {
   console.log(event);
  Swal.fire({
    title: '<span style="color:#FFFFFF;">Are you sure?</span>',
    text: 'You will not be able to recover this User in future!',
    type: 'warning',
    showCancelButton: true,
    background: '#000000',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, keep it',
    preConfirm: () => {
      this.SupportUserService.deleteAssignGroup({ id: event.id }).subscribe(data => {
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
          // this.toastr.error('Error!', data['message'], { timeOut: 2000 });
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
        text: 'Support User has been deleted.',
        type: 'success',
        background: '#000000'
      });
      this.displayAllRecord();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Cancelled</span>',
        text: 'Support User is safe :)',
        type: 'error',
        background: '#000000',
      });
    }
  })
}

assignSupportGroup(){
  this.openassignDialog()
}  
openassignDialog(data?): void {
  // alert(id);assignSupportGroup

  const dialogRef = this.dialog.open(viewassigngroupDialog, { width: '80%', disableClose: true, data: data ? data : null });
  dialogRef.keydownEvents().subscribe(e => {
    if (e.keyCode == 27) {
      dialogRef.close('Dialog closed');
    }
  });
  dialogRef.afterClosed().subscribe(result => {
  });
}

}


//ViewAssignGroup

@Component({
  selector: 'viewassigngroupDialog',
  templateUrl: './viewassigngroupDialog.html',
})
export class viewassigngroupDialog implements OnInit {
  assignSupportForm: FormGroup;
  supportGroupData:any;
  supportId: any;
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  page = new Page();
  rows = new Array<assign>();
  isEdit: boolean = false;
  errorField: any;
  dialog: any;
  group_name = "";
  // by_product= "";
  selectedValue: any;
  allSupportUser: any;
  assignData: any;
  supportGroupList: any;


  constructor(
    public dialogRef: MatDialogRef<viewassigngroupDialog>, @Inject(MAT_DIALOG_DATA) public data: assign,
    private router: Router,
     private fb: FormBuilder,
     public supportUserService :SupportUserService,
     private toastr: ToastrService,
     public commonService: CommonService,
     public userService:UserService

  ) {
    this.assignSupportForm = this.fb.group({
      'support_group_id' : [""],
      'support_user_id' : [""],
    });
   }
   
   get name() { return this.assignSupportForm.get('support_group_id'); }
   get product() { return this.assignSupportForm.get('support_user_id'); }

  ngOnInit() {

    this.supportUserService.getsupportList({}).subscribe(groupList=> {
      console.log(groupList);
      this.supportGroupList = groupList;
      console.log(this.selectedValue);
    })

    this.userService.getAllSupportUser().subscribe(userList=> {
      console.log(userList);
      this.allSupportUser = userList;
      // console.log(this.selectedValue);
    })

    console.log(this.data);
    this.isEdit = true;
      if (!this.data) {
        this.assignData = {
          support_group_id:'',
          support_user_id:''
        };
      } else {
        this.assignData = this.data;
      }
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  reloadFeature() {
    this.assignSupportForm.reset();
    this.supportUserService.updateGridList();
    this.dialogRef.close();
  }

  submitAssignGroup(){
    if (this.assignSupportForm.valid) {
      
      let createupportGroupData = this.assignSupportForm.value; 
      // updatesupportGroupData.id = this.supportId;
      // we can pass form data on Service now.
      const credentials = this.assignSupportForm.value;

      if(this.data){
        credentials.id = this.data.id;
        console.log(credentials);

        this.supportUserService.updateassignGroup(credentials).subscribe((data)=>{
          console.log(data);
              if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                console.log(data);
                this.reloadFeature();
              } else if(data['code'] == 1062){
                data['message'] = 'Duplicate Entry for Plan Name'
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
          })

      } else {
        this.supportUserService.addassigngroup(credentials).subscribe((data)=>{
          if (data['code'] == 200) {
            console.log(data);
            this.reloadFeature();
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
          } else if(data['code'] == 1062){
            data['message'] = 'Duplicate Entry for Plan Name'
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }


        })

      }


    }
  }

  cancelForm(){
    this.assignSupportForm.reset();
    this.router.navigate(['support-user/assigngroup'])
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
