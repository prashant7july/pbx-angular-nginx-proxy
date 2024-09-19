import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService, formError, Name_RegEx, PagedData } from 'src/app/core';
import Swal from 'sweetalert2';
import { DidService } from '../DID/did.service';
import { TimeGroupService } from '../time-group/time-group.service';
import { ImGroupService } from './im-group.service';
import { ExtensionService } from 'src/app/core';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import {ImGroupModule} from './im-group.module'



export interface ImGroup {
  id: string,
  customerId: number,
}

@Component({
  selector: 'app-im-group',
  templateUrl: './im-group.component.html',
  styleUrls: ['./im-group.component.css']
})
export class ImGroupComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  filterForm: FormGroup;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  extList: any = [];
  filterExtension:any;
  rowData: any;
  pageSize: number = 10;
  maxDate: Date;
  customerId: any;
  extensionId: any;
  bsValue = new Date();
  bsRangeValue: Date[];
  todayDate = new Date();
  defaultPageSize = '10';
  dialogRef: any;
  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';
  public fields1: Object = { text: 'name', value: 'company_name' };
  public fields: Object = { text: 'ext_number', value: 'ext_number' };
  public placeholder: string = 'Extension List';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';
 
  constructor(
    private cdref: ChangeDetectorRef,
    private fb: FormBuilder,
    private imGroupService: ImGroupService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public commonService: CommonService,
    public didService: DidService,
    public extensionService: ExtensionService
  ) {
    this.maxDate = new Date();
    this.todayDate.setDate(this.todayDate.getDate() + 0);
    this.bsRangeValue = [this.bsValue, this.todayDate];

    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_sip': [""],
     
    });
  }

  companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.extList.filter((data) =>{    
      return data['ext_number'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  ngOnInit() {

    this.imGroupService.setPage.subscribe(() => {
      this.setPage();
    });

   

  }

  setPage(){
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 10 },
      // { field: 'message', headerName: 'Message', hide: false width: 15 },
      { field: 'sip', headerName: 'Extension List', hide: false, width: 15 },
    ];

    let customer_id = localStorage.getItem('id');
    let extension_id = localStorage.getItem('id')
    if(this.isFilter){
      let credentials = this.filterForm.value;
      console.log(credentials,"crednetials")
      credentials.by_sip = credentials.by_sip != "" ?  credentials.by_sip.map(item => Number(item)): "";
      // credentials.id = extension_id;
      this.imGroupService.filterImGroup(credentials, Number(localStorage.getItem('id'))).subscribe(data =>{
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    }else{
    this.imGroupService.viewImGroup({'extension_id': extension_id}).subscribe(PagedData =>{
      PagedData = this.manageUserActionBtn(PagedData);
      this.dataSource = [];
      this.dataSource.push({'fields': this.columnDefs, 'data': PagedData});
    }, err =>{
      this.error = err.message;
    });
  }

    this.extensionService.getExtensionByExtensionId(extension_id).subscribe(data =>{
      this.extList =   data.response;
      this.filterExtension = this.extList.slice();
     
    });

  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";

      data[i]['action'] = finalBtn;
    }

    return data;
  }

  manageAction(e) {
    // debugger
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {      
      case "edit":
        return this.editImGroup(data);        
      case "delete":
        // debugger
        return this.deleteImGroup(data);
    }
  }

  editImGroup(event) {
    this.openDialog(event.id);
  }

  deleteImGroup(event) {
    // debugger

    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover IM-Group </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+ "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.imGroupService.deleteImGroup(event.id).subscribe(data => {
          // debugger
          this.setPage();
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
          html: "<span style='color:#FFFFFF;'> IM-Group </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer:2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>IM-Group </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: 'error',
          background: '#000000',
          timer:2000
        });
      }
    })
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(ImGroupDialog,
      {
        width: '80%', disableClose: true,
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
      console.log('Dialog closed');
    });
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  onNoClick(e): void {
  this.dialogRef.close();
    e.preventDefault();
  }

  

  resetTable(e) {
    this.isFilter = false;
    this.setPage();
  }

  filterData() {
    this.isFilter = true;
    this.setPage();
  }


}

@Component({
  selector: 'imgroup-dialog',
  templateUrl: 'imgroup-dialog.html',
})

export class ImGroupDialog {
  imGroupForm: FormGroup;
  submitted = false;
  checkForm: any;
  filter:any[]=[];
  error = '';
  customerId = '';
  errorField = '';
  isloading  = false;
  Sip_List: any = [];
  errors: { errors: {}; };
  timeGroupName: string;
  imName: any;
  groupExtensions: any = [];
  filterList:any;
  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';
  public fields1: Object = { text: 'name', value: 'company_name' };
  public fields: Object = { text: 'ext_number', value: 'ext_number' };
  public placeholder: string = 'Extension List';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';
 
  constructor(
    public dialogRef: MatDialogRef<ImGroupDialog>, @Inject(MAT_DIALOG_DATA) public data: ImGroup,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private imGroupService: ImGroupService,
    private extensionService: ExtensionService
  ){
    this.imGroupForm = this.formBuilder.group({
      'name': ['', [Validators.required]],
      'sip': ['', [Validators.required]],
    })
  }
  get name() {return this.imGroupForm.get('name');}
  get sip() {return this.imGroupForm.get('sip');}
  get message() {return this.imGroupForm.get('message');}

  companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.Sip_List.filter((data) =>{    
      return data['ext_number'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  ngOnInit(){
    let extension_id = localStorage.getItem('id');
    this.extensionService.getExtensionByExtensionId(extension_id).subscribe(data =>{
      this.Sip_List = data.response;
      this.filterList = this.Sip_List.slice();
    })

    if(this.data.id){
      this.imGroupService.getGroupById(this.data.id).subscribe(data=>{
        this.imName = data.name
        // this.groupExtensions =  data.sip.split(',');
        this.groupExtensions = data.sip.split(',');
      })
     
    }
  }

  submitImGroupForm() {
    const credentials = this.imGroupForm.value    
    credentials.ext_name = Number(localStorage.getItem('id'));
    credentials.id = this.data.id;
    let name = this.imGroupForm.get('name').value;
    let sip = this.imGroupForm.get('sip').value;
    credentials.sip = credentials.sip.map(item => Number(item));           
    if((!name || name == '')  && !sip){
      this.toastr.error('Error!','Fill the form correctly',{timeOut: 2000})
      return;
    }
    if(!name){
      this.toastr.error('Error!', 'Fill the form correctly', { timeOut: 2000 });
      return;
    }
    if(!sip || sip == ''){
      this.toastr.error('Error!', 'Fill the form correctly', { timeOut: 2000 });
      return;
    }

    

    if(!this.data.id){
    this.imGroupService.createImGroup(credentials)
                .subscribe(data => {
                  if (data['status_code'] == 200) {
                    this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                    this.imGroupForm.reset();
                    this.imGroupService.updateGridList();
                    this.dialogRef.close();
                  }
                  else if(data['status_code'] == 403){
                    
                    
                    this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                  }
                });
            }else{
              this.imGroupService.createImGroup(credentials)
                .subscribe(data => {
                  if (data['status_code'] == 200) {
                    this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                    this.imGroupForm.reset();
                    this.imGroupService.updateGridList();
                    this.dialogRef.close();
                  }
                  else {
                    this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                  }
                });
            }
          }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.imGroupForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }
  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
}