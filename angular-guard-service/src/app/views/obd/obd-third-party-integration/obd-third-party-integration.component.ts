import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import {OBDService} from '../obd.service';
import { CommonService, Errors, ExcelService, formError, ServerDetail } from '../../../core';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-obd-third-party-integration',
  templateUrl: './obd-third-party-integration.component.html',
  styleUrls: ['./obd-third-party-integration.component.css']
})
export class ObdThirdPartyIntegrationComponent implements OnInit {

  filterForm: FormGroup;
  defaultPageSize = '10';
  columnDefs: any;
  exportData: any = {};
  dataSource: any = [];
  afterDelete: boolean = false;
  isFilter = false;


  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private obdServices: OBDService,
    public commonService: CommonService,
  ) { }

  
  ngOnInit() {
    this.filterForm = this.fb.group({
      'name': [""]      
    });    
    this.obdServices.displayAllRecord().subscribe(() => {
      this.displayAllRecord();
    });    
  }

  displayAllRecord() {    
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'provider_name', headerName: 'Name', width: 150, hide: false },
      { field: 'url', headerName: 'URL', width: 200, hide: false },
      { field: 'auth_url', headerName: 'Auth URL', width: 200, hide: false },
      { field: 'parameter', headerName: 'Parameter', width: 200, hide: false },
    ];  
    let customer_id = localStorage.getItem('id');
    if(!this.isFilter){
      this.obdServices.getApiIntegration(customer_id).subscribe((res) => {                 
        this.exportData = res;
          res = this.manageUserActionBtn(res);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, 'data': res });
      })    
    }else{
      let credentials = this.filterForm.value;      
      this.obdServices.getIntegrationByFilter(customer_id, credentials).subscribe((res) => {        
        res = this.manageUserActionBtn(res);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': res});
      })

    }
  }

  manageUserActionBtn(data) {    
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';      
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
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
      case "edit":
        return this.editApiIntegration(data);
      case "delete":
        return this.deleteApiIntegration(data);
      //   case "start":
      //     return this.startSchedular(data,'0');   
      //   case "stop":
      //       return this.stopSchedular(data,'1');
      //   case "add":
      //       return this.addContact(data);
      //       case "view":
      //         return this.LivestatusOC(data);
    }
  }

  editApiIntegration(event) {
    this.openDialog(event.id);
  } 
  
  deleteApiIntegration(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      // tslint:disable-next-line:max-line-length
      html: '<span style=\'color:#FFFFFF;\'>You will not be able to recover API Integration </span><span style =\'color:red; font-weight :bold; font-size: 1.2em\'>' + event.provider_name + '</span> <span style=\'color:#FFFFFF;\'> in future!</span>',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.obdServices.deleteApiIntegration(localStorage.getItem('id'), event.id).subscribe(data => {          
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
          // tslint:disable-next-line:max-line-length
          html: '<span style=\'color:#FFFFFF;\'>API Integration </span><span style =\'color:red; font-weight :bold; font-size: 1.2em\'>' + event.provider_name + '</span> <span style=\'color:#FFFFFF;\'> has been deleted.</span>',
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          // tslint:disable-next-line:max-line-length
          html: '<span style=\'color:#FFFFFF;\'>API Integration </span><span style =\'color:red; font-weight :bold; font-size: 1.2em\'>' + event.provider_name + '</span> <span style=\'color:#FFFFFF;\'> is safe.</span>',
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    });
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(AddIntegrationDialog, { width: '200%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

}

@Component({
  selector: 'add-integration-dialog',
  templateUrl: './add-integration-dialog.html',
  providers: []
})

export class AddIntegrationDialog {

  apiIntegrationForm: FormGroup;  
  apiIntegration;
  checkForm: any;
  provider_name: any;
  provider_url: any;
  provider_auth_url: any;
  url_details: any;

  constructor (
    public dialogRef: MatDialogRef<AddIntegrationDialog>, @Inject(MAT_DIALOG_DATA) public data:any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public obdServices: OBDService
  ) {
    this.apiIntegrationForm = this.fb.group({
      provider: ['', [Validators.required]],
      url: ['', [Validators.required]],     
      url_detail: ['', [Validators.required]],
      auth_url: ['',[Validators.required]],
      parameterForm: new FormArray([])
    })    
    if (!this.data.id) {
      this.addNewParameter();
    }
  }

  get provider() { return this.apiIntegrationForm.get('provider'); }
  get url() { return this.apiIntegrationForm.get('url'); }
  get auth_url() { return this.apiIntegrationForm.get('auth_url'); }




  ngOnInit(){         
    if (this.data.id) {
      let customer_id = localStorage.getItem('id');            
      this.obdServices.getApiIntegrationById(customer_id, this.data.id).subscribe(data => {
        this.apiIntegration = data.data;  
        this.provider_name = this.apiIntegration.provider_name
        this.provider_url = this.apiIntegration.url;
        this.provider_auth_url = this.apiIntegration.auth_url;    
        this.url_details = this.apiIntegration.url_details          
        if (data) {
          this.setDefaultValue(data); // set default value in form
        }
      }, err => {
        // this.error = err.message;
      });
    }
  }

  public setDefaultValue(response) {

    const { mapping } = response;
    const header = mapping[0].header ? mapping.map(item => item.header) : [];
    const headerValue = mapping[0].header_value ? mapping.map(item => item.header_value) : [];    
    const control = this.apiIntegrationForm.controls.parameterForm as FormArray;
    header.forEach((element1, i) => {
      headerValue.forEach((element2, j) => {        
          if (i === j) {
            const obj = {};
            // @ts-ignore
            obj.header = element1;
            // @ts-ignore
            obj.header_value = element2;                        
            control.push(this.fb.group(obj));
          }        
      });
    });
  }

  createParameter() {
    return this.fb.group({
      header: ['', Validators.required],
      header_value: ['', Validators.required]      
    });
  }

  addNewParameter(): void {
    const fb = this.apiIntegrationForm.get('parameterForm') as FormArray;
    if (fb.length > 9) {
      this.toastr.error('Max 10 parameter allowed only !', 'Error!', { timeOut: 2000 });
      return;
    }
    const formGroupArray = this.createParameter();
    fb.push(formGroupArray);
  }

  removeParameter(index) {
    const fb = this.apiIntegrationForm.get('parameterForm') as FormArray;
    fb.removeAt(index);
    this.apiIntegrationForm.updateValueAndValidity();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.apiIntegrationForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(` ${name}`);
      }
    }
    return invalid;
  }

  submitAPIForm(){
    this.checkForm = this.findInvalidControls();
      if (this.apiIntegrationForm.valid) {
        // this.submitted = true;
        if (this.data) {
          const credentials = this.apiIntegrationForm.value;
          credentials.id = this.data.id ? this.data.id : null;
          credentials.customer_id = localStorage.getItem('id');
          this.obdServices.postApiIntegration(credentials).subscribe((data: any) => {
            if (data.status_code == 200) {
              this.toastr.success('API Integration Updated Successfully!', 'Success!', { timeOut: 2000 });
              this.cancelForm();
            } else {
              this.toastr.error('Error!', data.message, { timeOut: 2000 });
            }
          });
        } else {
          const credentials = this.apiIntegrationForm.value;
          credentials.customer_id = localStorage.getItem('id');
          this.obdServices.postApiIntegration(credentials).subscribe((res) => {
            if(res.status_code == 200){
              this.toastr.success('API Integration Created Successfully!', 'Success!', { timeOut: 2000 });
              this.cancelForm();
            }else{
              this.toastr.error('Error!', res.message, { timeOut: 2000 });
            }
          })
        }
      } else {
        this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
      }
  }

  cancelForm() {
    this.apiIntegrationForm.reset();
    this.obdServices.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  validateUrl(form, event){
    if(!(/^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/g.test(event.target.value))){
      this.apiIntegrationForm.get(form).setValue('');
      this.toastr.error(`Invalid ${form.toUpperCase()}`, 'Error!', { timeOut: 2000 });
    }    
  }
}
