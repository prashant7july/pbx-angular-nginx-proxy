import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonService, Errors, ExcelService, formError, ServerDetail } from '../../../core';
import 'jspdf-autotable';
import { ServerService } from '../../server/server.service';
import { SmsService } from '../sms.service';
import { UserTypeConstants } from 'src/app/core/constants/userType.constant';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-view-api-config',
  templateUrl: './view-api-config.component.html',
  styleUrls: ['./view-api-config.component.css']
})
export class ViewApiConfigComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  filterForm: FormGroup;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize = 10;
  errors = '';
  exportData: any = {};
  defaultPageSize = '10';
  providerList = '';
  loginUserType = localStorage.getItem('type');
  customersObservable: Observable<any[]>;
  menus: any;
  apiAdminMenu: any = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private serverService: ServerService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public commonService: CommonService,
    private excelService: ExcelService,
    private smsService: SmsService,
    private httpClient: HttpClient
  ) {
    this.filterForm = this.fb.group({
      // 'by_name': [""],
      by_provider: [''],
    });

  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.apiAdminMenu = this.menus.find((o) => o.url === '/sms/admin-sms-api');
    this.commonService.getProviders().subscribe(data => {    // get Providers list
      this.providerList = data.response;
    }, err => {
      this.error = err.message;
    });

    this.serverService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 15 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      // { field: 'provider_name', headerName: 'Provider', hide: false, width: 15 },
      { field: 'provider', headerName: 'Provider', hide: false, width: 15 },
      { field: 'url', headerName: 'URL', hide: false, width: 30 },

    ];
    if (this.isFilter) {
      const customerId = localStorage.getItem('id') ? localStorage.getItem('id') : '0';
      const credentials = this.filterForm.value;
      this.smsService.filterSMSApi(credentials, customerId).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data });
      }, err => {
        this.error = err.message;
      });
    } else {
      const customerId = localStorage.getItem('id') ? localStorage.getItem('id') : '0';
      this.smsService.getSMSApi(customerId).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data });
      }, err => {
        this.error = err.message;
      });
    }
  }

  onPageSizeChanged(newPageSize) {
    this.defaultPageSize = newPageSize.value;
  }

  manageUserActionBtn(data) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += '<span>';

      if(this.apiAdminMenu.all_permission == '0' && this.apiAdminMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.apiAdminMenu.modify_permission) {
        // tslint:disable-next-line:max-line-length
        finalBtn += '<i class=\'fa fa-pencil-square-o edit-button\' style=\'cursor:pointer; display: inline\' data-action-type=\'edit\' title=\'Edit\'></i>';
      }
      // tslint:disable-next-line:max-line-length
      finalBtn += '<i class=\'fa fa-envelope-o edit-button\' style=\'cursor:pointer; display: inline\' data-action-type=\'sendSMS\' title=\'Send SMS\'></i>';
      if(data[i]['flag'] == 1){
      finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewSMS' title='View SMS Plan'></i>";
      }
      if (this.apiAdminMenu.delete_permission) {
        // tslint:disable-next-line:max-line-length
        finalBtn += '<i class=\'fa fa-trash-o delete-button\' style=\'cursor:pointer; display: inline\' data-action-type=\'delete\' title=\'Delete\'></i>';
      }

      finalBtn += '</span>';
      data[i].action = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    const data = e.data;
    const actionType = e.event.target.getAttribute('data-action-type');
    switch (actionType) {
      case 'edit':
        return this.editData(data);
      case 'delete':
        return this.deleteSMSApi(data);
      case 'sendSMS':
        return this.sendSMS(data);
      case 'viewSMS':
        return this.associateInSMS(data);
    }
  }

  editData(event) {
    this.openDialog(event.id);
  }

  deleteSMSApi(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      // tslint:disable-next-line:max-line-length
      html: '<span style=\'color:#FFFFFF;\'>You will not be able to recover SMS API </span><span style =\'color:red; font-weight :bold; font-size: 1.2em\'>' + event.provider + '</span> <span style=\'color:#FFFFFF;\'> in future!</span>',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.smsService.deleteSMSApi({ id: event.id }).subscribe(data => {
          if (Number(data.code) === 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                // tslint:disable-next-line:max-line-length
                html: '<span style=\'color:#FFFFFF;\'>SMS API </span><span style =\'color:red; font-weight :bold; font-size: 1.2em\'>' + event.provider + '</span> <span style=\'color:#FFFFFF;\'> already exist in plan.</span>',
                showConfirmButton: false,
                timer: 3000,
                background: '#000000',
              });
            return;
          } else {
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
          // tslint:disable-next-line:max-line-length
          html: '<span style=\'color:#FFFFFF;\'>SMS API </span><span style =\'color:red; font-weight :bold; font-size: 1.2em\'>' + event.provider + '</span> <span style=\'color:#FFFFFF;\'> has been deleted.</span>',
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          // tslint:disable-next-line:max-line-length
          html: '<span style=\'color:#FFFFFF;\'>SMS API </span><span style =\'color:red; font-weight :bold; font-size: 1.2em\'>' + event.provider + '</span> <span style=\'color:#FFFFFF;\'> is safe.</span>',
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    });
  }



  sendSMS(event) {
    this.smsService.getSMSApiByID(event.id).subscribe(data => {
      if (data) {

        let url = '';
        let params = '';
        const dataObject = {};
        const paramsObject = {};

        data.mapping.map((obj) => {
          params = `${params}&${obj.header}=${obj.header_value}`;
          paramsObject[obj.header] = obj.header_value;
        });

        // @ts-ignore
        dataObject.url = event.url;
        // @ts-ignore
        dataObject.params = paramsObject;
        params = params.substring(1);
        url = `${url}${event.url}?${params}`;
        // this.smsService.sendSms(params)
        // this.customersObservable = this.httpClient.get<any[]>(url);
        this.customersObservable = this.smsService.sendSms(dataObject);
        this.customersObservable.subscribe((res: any) => {
          if (res.status === 200) {
            this.toastr.success(res.message, 'Success!', { timeOut: 2000 });
          } else {
            this.toastr.error(res.message, 'Error!', { timeOut: 2000 });
          }
        });        
      }
    });

  }


  associateInSMS(event) {            
    this.router.navigate(['sms/admin-sms-api/customer-sms-api/view-providers'], { queryParams: { providerId: event.id, providerName: event.provider } })
  }


  openDialog(id?): void {
    const isAdminLogin = localStorage.getItem('type') === UserTypeConstants.ADMIN;
    if (!isAdminLogin && !id && this.exportData.length > 0) {
      this.toastr.error('You are not authorize to add more than 1 SMS API into an account', 'Error!', { timeOut: 2000 });
      return;
    }
    const dialogRef = this.dialog.open(ApiConfigDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode === 27) {
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

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoServerDialog, {
    //   width: '80%', disableClose: true, autoFocus:false,
    //   data: {
    //     customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
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

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'api-config-dialog',
  templateUrl: 'api-config-dialog.html',
})

// tslint:disable-next-line:component-class-suffix
export class ApiConfigDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  smsAPIForm: FormGroup;
  checkForm: any;
  error = '';
  validPort: any = false;
  // tslint:disable-next-line:variable-name
  user_pswd_Div = false;
  validIP: any = false;
  serverData: any = {};
  errorField = '';
  providerList = '';
  menus: any;
  apiAdminMenu: any;


  constructor(
    public dialogRef: MatDialogRef<ApiConfigDialog>, @Inject(MAT_DIALOG_DATA) public data: ServerDetail,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private serverService: ServerService,
    public commonService: CommonService,
    private smsService: SmsService
  ) {
    this.smsAPIForm = this.fb.group({
      provider: ['', [Validators.required]],
      url: ['', [Validators.required]],
      //  'assign': new FormArray([]),
      parameterForm: new FormArray([]),
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.apiAdminMenu = this.menus.find((o) => o.url === '/sms/admin-sms-api');


    if (!this.data.id) {
      this.addNewParameter();
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {

    
    if(this.apiAdminMenu.all_permission == '0' && this.apiAdminMenu.view_permission == '1'){
      this.smsAPIForm.disable();
    }

    // get Providers list
    this.commonService.getProviders().subscribe(data => {
      this.providerList = data.response;
    }, err => {
      this.error = err.message;
    });

    if (this.data.id) {
      this.smsService.getSMSApiByID(this.data.id).subscribe(data => {
        this.serverData = data.data;
        if (data) {
          this.setDefaultValue(data); // set default value in form
        }
      }, err => {
        this.error = err.message;
      });
    }
  }

  public setDefaultValue(response) {

    const { mapping } = response;
    const header = mapping[0].header ? mapping.map(item => item.header) : [];
    const headerValue = mapping[0].header_value ? mapping.map(item => item.header_value) : [];
    const isType = mapping[0].isType ? mapping.map(item => item.isType) : [];
    const control = this.smsAPIForm.controls.parameterForm as FormArray;
    header.forEach((element1, i) => {
      headerValue.forEach((element2, j) => {
        isType.forEach((element3, k) => {
          if (i === j && i === k) {
            const obj = {};
            // @ts-ignore
            obj.header = element1;
            // @ts-ignore
            obj.header_value = element2;
            // @ts-ignore
            obj.isType = Number(element3);
            control.push(this.fb.group(obj));
          }
        });
      });
    });
  }

  addNewParameter(): void {
    const fb = this.smsAPIForm.get('parameterForm') as FormArray;
    if (fb.length > 9) {
      this.toastr.error('Max 10 parameter allowed only !', 'Error!', { timeOut: 2000 });
      return;
    }
    const formGroupArray = this.createParameter();

    fb.push(formGroupArray);

  }

  removeParameter(index) {
    const fb = this.smsAPIForm.get('parameterForm') as FormArray;
    fb.removeAt(index);
    this.smsAPIForm.updateValueAndValidity();
  }

  createParameter() {
    return this.fb.group({
      header: ['', Validators.required],
      header_value: ['', Validators.required],
      isType: [0]
    });
  }

  get url() { return this.smsAPIForm.get('url'); }
  get provider() { return this.smsAPIForm.get('provider'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.smsAPIForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitAPIForm() {
    this.checkForm = this.findInvalidControls();
    const arrayForm = this.smsAPIForm.get('parameterForm').value;
    const ischeckMultipleMessage = arrayForm.filter(x => Number(x.isType) === 1).length;
    const ischeckMultipleMobile = arrayForm.filter(x => Number(x.isType) === 2).length;
    if (ischeckMultipleMessage < 2 && ischeckMultipleMobile < 2) {
      if (this.smsAPIForm.valid) {
        this.submitted = true;
        const credentials = this.smsAPIForm.value;
        if (this.data.id) {
          credentials.id = this.data.id ? this.data.id : null;
          credentials.customer_id = Number(localStorage.getItem('id'));
          this.smsService.updateSMSApi('updateSmsApi', credentials).subscribe((data: any) => {
            if (Number(data.code) === 200) {
              this.toastr.success('SMS API Updated Successfully !', 'Success!', { timeOut: 2000 });
              this.cancelForm();
            } else {
              this.toastr.error('Error!', data.message, { timeOut: 2000 });
            }
          });
        } else {
          credentials.customer_id = Number(localStorage.getItem('id'));
          this.smsService.createSmsApi('createSmsApi', credentials).subscribe((data: any) => {
            if (Number(data.code) === 200) {
              this.toastr.success('SMS API Created Successfully !', 'Success!', { timeOut: 2000 });
              this.cancelForm();
            } else {
              this.toastr.error('Error!', data.message, { timeOut: 2000 });

            }
          });
        }
      } else {
        this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
      }
    } else {
      this.toastr.error('Error!', 'Multiple Message and Phone Field Not allowed.', { timeOut: 2000 });
    }
  }

  cancelForm() {
    this.smsAPIForm.reset();
    this.serverService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }



}
