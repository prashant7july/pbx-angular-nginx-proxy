
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService, formError, agentError, invalidFileType, importUnsuccessfully, importSuccessfully, Errors, OutboundSuccessfully, Contact_RegEx } from '../../../app/core';
import { OutboundService } from './outbound.service';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';
// import { environment } from '../../../..';
import { environment } from '../../../environments/environment.prod';
import Swal from 'sweetalert2';
import { timeout } from 'rxjs-compat/operator/timeout';
import { PackageService } from '../package/package.service';
export var productId = '1';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { log } from 'util';


// const URL = 'http://localhost:3000'+ '/uploadCsv';      
const URL = environment.api_url + 'uploadCsv/';


export var imagePath: any;
declare const ExcelJS: any;

@Component({
  selector: 'app-outbound-conference',
  templateUrl: './outbound-conference.component.html',
  styleUrls: ['./outbound-conference.component.css']
})
export class OutboundConferenceComponent implements OnInit {
  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  filterObj: any = {};
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  OutboundForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private OutboundService: OutboundService,

  ) { }

  ngOnInit() {
    this.OutboundForm = this.fb.group({
      'name': [""],
    });
    this.OutboundService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });




  }
  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 200 },
      { field: 'id', headerName: 'ID', hide: true, width: 100 },
      { field: 'name', headerName: 'Name', hide: false, width: 200 },
      { field: 'welcome_propmt', headerName: 'Welcome Propmt', hide: true, width: 200 },
      { field: 'conf_schedule_time', headerName: 'Scheduler Time', width: 260, hide: false },
      { field: 'scheduler_button', headerName: 'Schedular Action', hide: false, width: 400 },

    ];
    if (this.isFilter) {
      this.filterObj = this.OutboundForm.value
    } else {
      this.filterObj = {};
    }
    let customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
    this.OutboundService.getOC(this.filterObj, customerId).subscribe(pagedData => {
      this.exportData = pagedData.response;
      this.dataSource = [];
      pagedData = this.manageUserActionBtn(pagedData.response);
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    }, err => {
      this.error = err.message;
    }
    );
  }
  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  manageUserActionBtn(pagedData) {

    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let schedulerBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "<i class='fa fa-plus edit-button' style='cursor:pointer; display: inline' data-action-type='add' title='Add Contact'></i>";
      finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline;' data-action-type='view' title='View'></i>";


      finalBtn += "</span>";
      schedulerBtn += "<span>";
      schedulerBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='start' title='Start Schedular'>Start</button> ";
      schedulerBtn += "</span>";

      if (pagedData[i].stop == '0') {
        schedulerBtn += "<span>";
        schedulerBtn += "<button class='btn btn-sm btn-danger' style='cursor:pointer; display: inline' data-action-type='stop' title='Stop Schedular'>Stop</button> ";
        schedulerBtn += "</span>";
      } else {
        schedulerBtn += "<span>";
        schedulerBtn += "<button class='btn btn-sm btn-danger' style='cursor:not-allowed; display: inline'  title='Stop Schedular'>Stop</button> ";
        schedulerBtn += "</span>";
      }

      // if (pagedData[i]['is_scheduler_type'] == '0') { //schedular
      //   schedulerBtn += "<span>";
      //   schedulerBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='start' title='Start Schedular'>Start</button> ";
      //   schedulerBtn += "</span>";
      // } /* else if (pagedData[i]['is_scheduler_type'] == '0' && pagedData[i]['status'] == '1') { //schedular
      //   schedularBtn += "<span>";
      //   schedularBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='stop' title='Stop Schedular'>Stop</button> ";
      //   schedularBtn += "</span>";
      // } */ else {
      //   schedulerBtn += "<p>" + pagedData[i]['conf_schedule_time'] + "</p>";
      //   // data[i]['description'] = finalBtn;
      // }
      if (pagedData[i]['is_scheduler_type'] == '0') { //schedular
        schedulerBtn += "<p>" + "-" + "</p>";
      }
      else {
        schedulerBtn += "<p>" + pagedData[i]['conf_schedule_time'] + "</p>";
        // data[i]['description'] = finalBtn;
      }
      // pagedData[i]['conf_schedule_time'] = schedulerBtn;
      pagedData[i]['scheduler_button'] = schedulerBtn;
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editOC(data);
      case "view":
        return this.LivestatusOC(data);
      case "delete":
        return this.deleteOC(data);
      case "start":
        return this.startSchedular(data, '0');   // 1 = start schedular
      case "stop":
        return this.stopSchedular(data, '1'); // 0 = stop schedular
      case "add":
        return this.addContact(data);
    }
  }
  LivestatusOC(data) {
    this.livestatusDialog(data)
  }
  addContact(data) {
    this.importContactDialog(data);

  }
  public startSchedular(event, status) {
    // this.toastr.success('Success!', 'Your request has been accepted', { timeOut: 2000 });
    this.OutboundService.getStatusOC(event.id).subscribe(data => {
      if (data.status == '0') {
        // this.toastr.success('Success!', `Your <span style="color: blue">${event.name}</span> Conference has been accepted.`, { timeOut: 2000, enableHtml: true });
        // this.toastr.success('Success!', `Your ${event.name} Conference has been accepted.`, { timeOut: 2000 });
        this.toastr.success('Success!', 'Your request has been accepted', { timeOut: 2000 });


      }
      if (data.status == '1') {
        this.toastr.error('Error!', "Outbound Conference is in progress already.", { timeOut: 2000 });
      }
      else {
        let obj = {
          application: "call_OC",
          status: status,
          cust_id: (localStorage.getItem('id').toString()),
          outconf_id: (event.id).toString(),
          token_id: (localStorage.getItem('token').toString()),
        }
        this.OutboundService.partiallyUpdateOC({ 'status': status }, event['id']).subscribe(data => {
          this.displayAllRecord();
          this.OutboundService.startManualSchecular(obj).subscribe(data => {

          });
        });
      }

    })

  }
  public stopSchedular(event, status) {
    this.toastr.error('Success!', 'Your request has been accepted', { timeOut: 2000 });
    let id = event['id'];
    this.OutboundService.getStatusOC(event['id']).subscribe(data => {
      // if (data.status == '0'){
      //   this.toastr.success('Success!', `Your ${event.name} Conference has been Stoped.`, { timeOut: 2000 });
      // }
      let obj = {
        application: "call_OC",
        status: status,
        cust_id: (localStorage.getItem('id').toString()),
        outconf_id: (event.id).toString(),
        token_id: (localStorage.getItem('token').toString()),
      }
      this.OutboundService.partiallyUpdateOCStop({ 'status': status }, event['id']).subscribe(data => {
        this.displayAllRecord();
        this.OutboundService.startManualSchecular(obj).subscribe(data => {
        });
      });
    })
    setTimeout(() => {
      this.resetStop(id);
    }, 70000);

  }
  resetStop(id) {
    this.OutboundService.partiallyUpdateOCStop({ 'status': '0' }, id).subscribe(data => {
      this.displayAllRecord();
    });

  }

  editOC(data: any) {
    this.openDialog(data);
  }
  addoc() {
    this.openDialog(null)
  }
  deleteOC(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Outbound Conference </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.OutboundService.deleteOC(event.id).subscribe(data => {
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
          html: "<span style='color:#FFFFFF;'> Outbound Conference </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Outbound Conference </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
  }
  livestatusDialog(data?): void {
    const dialogRef = this.dialog.open(livestatusoutboundDialog, { width: '200%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  importContactDialog(data?): void {
    const dialogRef = this.dialog.open(importoutboundContactDialog, { width: '200%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  openDialog(id?): void {
    const dialogRef = this.dialog.open(outboundDialog, {
      width: '60%', disableClose: true,
      data: {
        id: id ? id.id : null,
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,

      }
    });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
@Component({
  selector: 'outbound-dialog',
  templateUrl: 'outbound-dialog.html',
})

export class outboundDialog {
  text = '';
  user_id: any;
  imageSource: any
  count = 1;
  isShowSchedular: boolean = false;
  OutboundForm: FormGroup;
  submitted = false;
  minDate: Date;
  recordData: boolean = false;
  afterDelete: boolean = false;
  afterdisable: boolean = false;
  add: boolean = false;
  welcomepromptValue: any = "";
  IsEdit: any = {};
  basic = false
  todayDate: Date;
  error = '';
  crad: any;
  didList: any[] = [];
  checkedList: any = [];
  excelValue: any = {};
  columnDefs2: any;
  destination_list: any = [];
  destination: boolean = false;
  participatn: any = [];
  defaultPageSize = '10';
  dataSource2: any = [];
  uncheckList: any = [];
  destCheck: boolean = false;
  isDelete: boolean = false;
  is_storage: any;
  is_recording_in_package: any;
  is_custom_prompt: any;
  // OCData: any = {};
  showNotInsertedValue = false;
  public fields2: Object = { text: 'didDisplay', value: 'id' };
  placeholder5 = 'DID as caller id*';
  public fields: Object = { text: "prompt_name", value: "id" };
  public placeholder: string = "Welcome Prompt";
  public popupHeight: string = "200px";
  public popupWidth: string = "200px";
  public fields10: Object = { text: "feature", value: "id" };

  public uploader: FileUploader = new FileUploader({
    url: URL, itemAlias: 'file',
    allowedFileType: ['xls', 'xlsx', 'csv'], method: 'post'
  });
  NameBind: any;
  welData: any;
  didData: any;
  isToggle: any;
  colenderData: any;
  constructor(
    public commonService: CommonService,
    private OutboundService: OutboundService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private packageService: PackageService,
    public dialogRefInfo: MatDialogRef<outboundDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.OutboundForm = this.fb.group({
      'name': ['', [Validators.required]],
      'recording': [""],
      'welcome_prompt': [],
      'is_scheduler_type': ["1"],
      'DID_caller_id': ['', [Validators.required]],
      'add_contact': ['', Validators.pattern(Contact_RegEx)],
      'conf_schedule_time': [''],
      'upload': ['', [Validators.required]],

    });
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
  }
  get name() { return this.OutboundForm.get('name'); }
  get recording() { return this.OutboundForm.get('recording'); }
  get welcome_prompt() { return this.OutboundForm.get('welcome_prompt'); }
  get is_scheduler_type() { return this.OutboundForm.get('is_scheduler_type'); }
  get DID_caller_id() { return this.OutboundForm.get('DID_caller_id'); }
  get upload() { return this.OutboundForm.get('upload'); }
  get conf_schedule_time() { return this.OutboundForm.get('conf_schedule_time'); }
  get add_contact() { return this.OutboundForm.get('add_contact'); }
  schedularChange(event) {
    // this.filter['property'] = event.value;
    let schedularValue = event.value;
    if (schedularValue == '0') {
      this.isShowSchedular = false;
      this.OutboundForm.get('schedular_start_date').clearValidators();
      this.OutboundForm.updateValueAndValidity();
    } else {
      this.isShowSchedular = true;
      this.OutboundForm.get('schedular_start_date').setValidators(Validators.required);
      this.OutboundForm.updateValueAndValidity();
    }
  }

  ngOnInit() {
    this.user_id = localStorage.getItem("id");
    this.packageService.getPbxFeatures(Number(this.user_id), Number(productId)).subscribe(packageData => {
      this.is_storage = packageData['response'][0].storage;
      this.is_recording_in_package = packageData['response'][0].recording;
      this.is_custom_prompt = packageData['response'][0].custom_prompt;
    })
    this.OutboundService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    let d1 = new Date();
    this.todayDate = new Date(d1);


    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
      this.toastr.error('Error!', invalidFileType, { timeOut: 2000 });
    }

    // this.uploader.onCompleteItem = (item: any, response: string, status: any, headers: any) => {
    //   let aaa = JSON.parse(response);  
    //   if(aaa['status_code'] == 200){
    //     this.toastr.success('Success!', OutboundSuccessfully, { timeOut: 2000 });
    //     this.cancleDialog();        
    //   }else if(aaa['status_code'] == 412){
    //     // this.toastr.error('Error!',aaa.message, {timeOut:2000});
    //   }else{
    //     this.toastr.error('Error!', importUnsuccessfully, { timeOut: 2000 });
    //   }      
    // };
    this.uploader.onCompleteItem = (item: any, response: string, status: any, headers: any) => {

      let aaa = JSON.parse(response);
      if (aaa['status_code'] == 200) {
        this.toastr.success('Success!', OutboundSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
        this.excelValue = aaa.value ? aaa.value : '';
        this.showNotInsertedValue = this.excelValue != '' ? true : false;
        imagePath = URL + item.file.name;
      } else if (aaa['err_code']) {
        this.toastr.error('Error!', 'Corrupted File', { timeOut: 2000 });
      }
      else if (aaa['error_code']) {
        this.toastr.error('Error!', 'Empty Excel File', { timeOut: 2000 });
      } else {
        this.toastr.error('Error!', 'Duplicate Entry', { timeOut: 2000 });
      }
    };
    this.uploader.onCompleteAll = () => {
      this.OutboundService.updateGridList();
      // this.dialogRef.close();  
      this.showNotInsertedValue = this.excelValue != '' ? true : false;
      if (!this.showNotInsertedValue) {
        this.toastr.success('Success!', importSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
      } else {
        this.toastr.error('Error!', importUnsuccessfully, { timeOut: 2000 });
      }
    }

    this.uploader.onCompleteAll = () => {
      this.OutboundService.updateGridList();
    }

    let user_id = localStorage.getItem("id");

    this.OutboundService.getQueuePrompt(localStorage.getItem('id')).subscribe(data => {
      this.welcomepromptValue = data.response ? data.response : [];
      this.welcomepromptValue.unshift({ id: 0, prompt_name: "Select Welcome Prompt" })
      this.OutboundForm.get('welcome_prompt').setValue(this.welcomepromptValue[0]['id']);
    }, err => {
      this.error = err.message;
    });
    this.OutboundService.getCustomerDID(user_id).subscribe(pagedData => {
      this.didList = pagedData;
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      document.getElementsByTagName("app-website-nav")[0].scrollIntoView();
    });
    if (this.data.id != null) {
      this.OutboundForm.get('upload').clearValidators();
      this.OutboundForm.updateValueAndValidity();
      this.OutboundService.viewOCGroupById(this.data).subscribe(data => {
        for (let index = 0; index < data['OCC'].length; index++) {
          const element = data['OCC'][index];
          // this.destination_list.push({conf_id: data['OCC'][index].id, contact: data['OCC'][index].contact});                              
          this.destination_list.push({ conf_id: data['OCC'][index].id, contact: data['OCC'][index].contact, num_of_tires: data['OCC'][index].num_of_tires, dialed_status: data['OCC'][index].dialed_status });
        }
        this.displayAllRecord()
        setTimeout(() => {


          this.IsEdit = data['OC']['0'];
          this.IsEdit.DID_caller_id = parseInt(this.IsEdit.DID_caller_id);
          // this.welData = data['OC']['0'].welcome_propmt;
          this.OutboundForm.get('welcome_prompt').setValue(data['OC']['0'].welcome_propmt)
          this.didData = data['OC']['0'].DID_caller_id;
          this.isToggle = data.is_scheduler_type;
          this.colenderData = data.conf_schedule_time;
          this.NameBind = data['OC']['0'].name;
          if (data['OC']['0'].recording == '0') {
            this.recordData = false
          } else {
            this.recordData = true;
          }
          if (this.IsEdit.is_scheduler_type == '1' || this.IsEdit.is_scheduler_type == 1) {
            this.isShowSchedular = true;
            this.todayDate = data['OC']['0'].conf_schedule_time ? data['OC']['0'].conf_schedule_time : '';

          }
        }, 500);
      })
    }
  }
  openPrediction1() {
    this.text = '';
    this.basic = true;

  }


  public displayAllRecord() {
    this.columnDefs2 = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'conf_id', headerName: 'ID', hide: true, width: 100 },
      { field: 'contact', headerName: 'Lead/Phone number', hide: false, width: 100 },
      { field: 'num_of_tires', headerName: 'Attempts', hide: false, width: 100 },
      { field: 'dialed_status', headerName: 'Dial Status', hide: false, width: 100 },
    ];
    this.dataSource2 = [];
    this.manageUserActionBtn(this.destination_list)
    this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.destination_list });
  }
  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete_dest' title='Delete'></i>";
      finalBtn += "</span>";
      if (data[i]['check'] == true) {
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheck' title='Uncheck'></i>";
        finalBtn += "</span>";
      } else {
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='check' title='check'></i>";
        finalBtn += "</span>";
      }
      data[i]['action'] = finalBtn;
    }


    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "delete_dest":
        return this.deleteDest(data);
      case "check":
        return this.check(data);
      case "uncheck":
        return this.uncheck(data);
    }
  }
  // deleteChecked() {
  //   const selectedRecords = this.destination_list.filter(record => record.conf_id);
  //   if (selectedRecords.length === 0) {
  //     alert('No records selected for deletion.');
  //     return;
  //   }
  //   this.manageUserActionBtn(this.destination_list);
  //    this.displayAllRecord();
  // }\
  // selectAll: boolean = false;
  // Selectallrecords(){
  //   for (const record of this.destination_list) {
  //     record.selected = this.selectAll;
  //   }
  // }

  deleteChecked() {
    // this.afterdisable = true
    this.uncheckList = [];

    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'></span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.afterDelete = true;
        for (let i = 0; i < this.checkedList.length; i++) {
          this.destination_list = this.destination_list.filter(item =>
            item.contact != this.checkedList[i].contact)
        }
        this.destination_list.map(data => {
          if (data.check == true) {
            this.uncheckList.push(data.id);
          }
        })
        if (this.uncheckList.length > 0) {
          this.afterdisable = true;
        } else {
          this.afterdisable = false;
        }


        this.manageUserActionBtn(this.destination_list);
        this.displayAllRecord();
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Leads </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'></span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Leads </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'></span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
  }
  selectAll() {
    if (this.destination_list.length >= 1) {
      this.afterdisable = true
    }
    for (let i = 0; i < this.destination_list.length; i++) {
      this.destination_list[i]['check'] = true;
      this.checkedList.push(this.destination_list[i]);
    }
    this.manageUserActionBtn(this.destination_list);
    this.displayAllRecord();
  }

  unselectAll() {
    this.afterdisable = false
    for (let i = 0; i < this.destination_list.length; i++) {
      this.destination_list[i]['check'] = false;
      this.checkedList = [];
    }
    this.manageUserActionBtn(this.destination_list);
    this.displayAllRecord();
  }

  check(data) {
    if (this.destination_list.length >= 1) {
      this.afterdisable = true
    }
    // data['check'] == true;
    for (let i = 0; i < this.destination_list.length; i++) {
      if (this.destination_list[i]['contact'] === data.contact) {
        this.destination_list[i]['check'] = true;
        this.checkedList.push(data)
      }
    }
    this.manageUserActionBtn(this.destination_list);
    this.displayAllRecord();
  }



  uncheck(data) {
    this.uncheckList = [];
    data['check'] = false;
    this.checkedList = this.destination_list.filter(item => item.check != false)
    this.checkedList.map(data => {
      if (data.check == true) {
        this.uncheckList.push(data.id);
      }
    })
    if (this.uncheckList.length > 0) {
      this.afterdisable = true;
    } else {
      this.afterdisable = false;
    }
    this.manageUserActionBtn(this.checkedList);
    this.displayAllRecord();
  }
  // deleteDest(data){
  //   this.afterDelete = true;
  //   for (let i = 0; i < this.destination_list.length; i++) {
  //     if (this.destination_list[i]['conf_id'] === data['conf_id']) {
  //       this.destination_list.splice(i, 1);
  //       this.manageUserActionBtn(this.destination_list);
  //         this.displayAllRecord();
  //     }
  //   }
  // }

  deleteDest(data) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.contact + "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.afterDelete = true;
        for (let i = 0; i < this.destination_list.length; i++) {
          if (this.destination_list[i]['contact'] === data['contact']) {
            this.destination_list.splice(i, 1);
            this.manageUserActionBtn(this.destination_list);
            this.displayAllRecord();
          }
        }
        this.destination_list.map(data => {
          if (data.check == true) {
            this.uncheckList.push(data.id);
          }
        })
        if (this.uncheckList.length > 0) {
          this.afterdisable = true;
        } else {
          this.afterdisable = false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.contact + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.contact + "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
  }
  resetAll() {
    for (let i = 0; i < this.destination_list.length; i++) {
      this.destination_list[i].dialed_status = 'Not started';
      this.destination_list[i].num_of_tires = 0;
    }
    // this.reset = true;
    this.displayAllRecord();
  }

  resetAnswered() {
    for (let i = 0; i < this.destination_list.length; i++) {
      if (this.destination_list[i].dialed_status == 'Success') {
        this.destination_list[i].dialed_status = 'Not started';
        this.destination_list[i].num_of_tires = 0;
      }
    }
    // this.reset = true;
    this.displayAllRecord();
  }

  resetFailed() {
    for (let i = 0; i < this.destination_list.length; i++) {
      if (this.destination_list[i].dialed_status == 'Failed') {
        this.destination_list[i].dialed_status = 'Not started';
        this.destination_list[i].num_of_tires = 0;
      }
    }
    // this.reset = true;
    this.displayAllRecord();
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
      // { header: 'Name', key: 'Name', width: 25 },
      // { header: 'Email', key: 'Email', width: 30 },
      { header: 'Number', key: 'Number', width: 30 },
      // { header: 'Phone_number2', key: 'Phone_number2', width: 30 },
      // { header: 'Organization', key: 'Organization', width: 30 },
      // { header: 'Designation', key: 'Designation', width: 30 },
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
      // Name: '',
      // Email: '',
      Number: '',
      // Phone_number2: '',
      // Organization: '',
      // Designation: ''
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
      FileSaver.saveAs(blob, 'sample_outboundList');
    });

  }
  uploadExcel() {
    this.crad = this.OutboundForm.value;
    let find_prompt_name = this.welcomepromptValue.filter(item => item.id == this.OutboundForm.value["welcome_prompt"]);
    this.crad["welcome_prompt_name"] = find_prompt_name[0].prompt_name;
    let find_Did_name = this.didList.filter(item => item.id == this.OutboundForm.value["DID_caller_id"]);
    this.crad["did_name"] = find_Did_name[0].didDisplay;
    this.basicFile();
    this.uploader.uploadAll();
  }


  basicFile() {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('customer_id', this.data['customerId']); //note comma separating key and value
      form.append('role', localStorage.getItem('type'));
      form.append('id', null);
      form.append('type', 'outboundConference');
      form.append('outboundData', Object.values(this.crad));
    };
  }

  // addDestination(){
  //   this.afterDelete = true;
  //   let number = this.OutboundForm.get('add_contact').value;
  //   if(number != ""){
  //     this.destination_list.push({ contact : number, id: null, outconf_id: this.data.id});
  //     this.OutboundForm.get('add_contact').reset();
  //     this.manageUserActionBtn(this.destination_list)
  //     this.displayAllRecord();
  //   }else{
  //     this.toastr.error('Error!', "Invalid Number!", { timeOut: 2000 });
  //   }
  // }

  addDestination() {
    let duplicate = 0;
    let a = this.count++;
    this.destination = true;
    let code = this.OutboundForm.get('add_contact').value;
    this.destination_list.map(data => {
      if (data.contact == code) {
        duplicate++;
      }
    })
    if (duplicate != 0) {
      this.toastr.error('Error!', "Contact Number already exists.", { timeOut: 2000 });
      return;
    } else {
      if (code != '') {
        this.destination_list.push({ id: this.count++, contact: code })
        this.OutboundForm.get('add_contact').setValue('');
        this.OutboundService.displayAllRecord.subscribe(() => {
          this.manageUserActionBtn(this.destination_list);
          this.displayAllRecord();
        });
      } else {
        this.toastr.error('Error!', "Invalid Number", { timeOut: 2000 });
        return;
      }
    }

    this.OutboundService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

  }
  submitOCForm() {
    if (this.OutboundForm.valid) {
      this.submitted = true;
      const credentials = this.OutboundForm.value;
      credentials.contact = this.destination_list;
      credentials.customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
      credentials.is_scheduler_type = credentials['is_scheduler_type'] ? credentials['is_scheduler_type'] : '0';
      credentials.id = this.data.id
      this.OutboundService.isOCExist(credentials.name, credentials.customerId, credentials.id).subscribe(data => {
        if (data['OC_count'] < 1) {
          if (this.data.id) {
            this.OutboundService.updateOCGroup(credentials).subscribe(data => {
              if (data) {
                this.toastr.success('Successfully!', "Outbound Conference Updated", { timeOut: 2000 });
                this.cancleDialog();
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            })
          }
        } else {
          this.toastr.error('Error!', 'Outbound Conference is already exist!', { timeOut: 3000 });
        }
      })




    }
  }

  cancleDialog(): void {
    this.OutboundForm.reset();
    this.dialogRefInfo.close();
    this.OutboundService.updateGridList();

  }
}
@Component({
  selector: 'livestatus-outbound-dialog',
  templateUrl: './livestatus-outbound-dialog.html'
})
export class livestatusoutboundDialog implements OnInit {
  livecallForm: FormGroup;
  error = '';
  errors: Errors = { errors: {} };
  destination_list: any = [];
  dialog: any;
  isFilter = false;
  countryList = [];
  columnDefs2 = [];
  dataSource2 = [];
  rowData: any;
  defaultPageSize = '10';
  filter: any;
  constructor(
    public dialogRef: MatDialogRef<livestatusoutboundDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private OutboundService: OutboundService,
  ) {
    //   this.livecallForm = this.fb.group({
    //     'prompt': '',
    //  });
  }

  ngOnInit() {
    this.OutboundService.displayAllRecord.subscribe(() => {
      this.displayAllRecordd();
    });
  }

  public displayAllRecordd() {
    this.columnDefs2 = [
      // { field: 'action', headerName: 'Action', hide: true, width: 100 },
      { field: 'contact', headerName: 'Lead', hide: false, width: 150 },
      { field: 'num_of_tires', headerName: 'Attempts', hide: false, width: 150 },
      { field: 'dialed_status', headerName: 'Dial Status', hide: false, width: 150 },
    ];
    // const credentials = this.livecallForm.value;
    // if(false){
    //   // this.OutboundService.getreportFilter(credentials,user_id).subscribe(data => {      
    //   //   data = this.manageUserActionBtn(data);      
    //   //   this.dataSource2 = [];
    //   //   this.dataSource2.push({ 'fields': this.columnDefs2, 'data': data })
    //   // })
    // }else{
    const user_id = localStorage.getItem('id');
    this.OutboundService.livecallforOC(user_id, this.data.id).subscribe((datas => {
      this.dataSource2 = [];
      this.dataSource2.push({ 'fields': this.columnDefs2, 'data': datas });
    })), err => {
      this.error = err.message;
    }
    // }
  }
  resetTable() {
    this.isFilter = false;
    this.displayAllRecordd();
  }
  onNoClick(): void {
    this.dialogRef.close();
    // e.preventDefault();
  }
}
@Component({
  selector: 'import-outbound-contact-dialog',
  templateUrl: './import-outbound-contact-dialog.html'
})

export class importoutboundContactDialog implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  importOutContactForm: FormGroup;
  feature_list: any;
  isEdit: boolean = false;
  errorField: any
  destination_list: any = [];
  dialog: any;
  planData: any;
  globalRateList: any = "";
  countryList = [];
  columnDefs2 = [];
  dataSource2 = [];
  contact: any;
  minutes: any;
  total_minutes: any;
  remaining_minutes: any;
  remaining_contact_minutes: any;
  showNotInsertedValue: any;
  imageSource1: any;
  excelValue: any = {};
  isDelete: boolean = false;
  reset: boolean = false;
  uncheckList: any[];
  checkedList: any[] = [];
  afterDelete: any;
  checkFile: boolean = false;
  defaultPageSize = '10';

  public fields: Object = { text: 'name', value: 'name' };
  public placeholder2: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  filter: any;
  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'file',
    allowedFileType: ['xls', 'xlsx', 'csv'], method: 'post'
  });

  constructor(
    public dialogRef: MatDialogRef<importoutboundContactDialog>, @Inject(MAT_DIALOG_DATA) public data,
    private router: Router,
    // public teleConsultationService :TeleConsultationService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private OutboundService: OutboundService,





  ) {
    this.importOutContactForm = this.fb.group({
      'prompt': '',
    });
  }

  ngOnInit() {
    this.OutboundService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    this.OutboundService.getOutboundParticipants(this.data.id).subscribe(data => {
      this.destination_list = data;
      this.displayAllRecord();
    })

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
      this.toastr.error('Error!', 'Invalid File Type, Only excel files are allowed, File type must be less than 1 mb', { timeOut: 2000 });
    }
    this.uploader.onCompleteItem = (item: any, response: string, status: any, headers: any) => {

      let aaa = JSON.parse(response);
      if (aaa['status_code'] == 200) {
        this.excelValue = aaa.value ? aaa.value : '';
        this.showNotInsertedValue = this.excelValue != '' ? true : false;
        imagePath = URL + item.file.name;
      } else if (aaa['err_code']) {
        this.toastr.error('Error!', 'Corrupted File', { timeOut: 2000 });
      }
      else if (aaa['message']) {
        this.toastr.error('Error!', 'Duplicate Entry', { timeOut: 2000 });
      }
      else if (aaa['error_code']) {
        this.toastr.error('Error!', 'Empty Excel File', { timeOut: 2000 });
      } else {
        this.toastr.error('Error!', 'Duplicate Entry', { timeOut: 2000 });
      }
      if (aaa['message']) {
        this.toastr.error('Duplicate!', aaa['message'] + ' numbers are duplicate')
      }
    };


    this.uploader.onCompleteAll = () => {
      this.OutboundService.updateGridList();
      // this.dialogRef.close();  
      this.showNotInsertedValue = this.excelValue != '' ? true : false;
      if (!this.showNotInsertedValue) {
        this.toastr.success('Success!', importSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
      } else {
        this.toastr.error('Error!', importUnsuccessfully, { timeOut: 2000 });
      }
    }
  }

  public displayAllRecord() {
    this.columnDefs2 = [
      { field: 'action', headerName: 'Action', hide: true, width: 100 },
      { field: 'contact', headerName: 'Lead', hide: false, width: 150 },
      { field: 'num_of_tires', headerName: 'Attempts', hide: false, width: 150 },
      { field: 'dialed_status', headerName: 'Dial Status', hide: false, width: 150 },
    ];
    this.manageUserActionBtn(this.destination_list);
    this.dataSource2 = [];
    this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.destination_list });
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
      if (data[i]['check'] == true) {
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheck' title='Uncheck'></i>";
        finalBtn += "</span>";
      } else {
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='check' title='check'></i>";
        finalBtn += "</span>";
      }
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {


    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "delete":
        return this.deleteParticipant(data);
      case "check":
        return this.check(data);
      case "uncheck":
        return this.uncheck(data);

    }
  }
  deleteChecked() {
    this.uncheckList = [];

    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover these leads in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.afterDelete = true;
        for (let i = 0; i < this.checkedList.length; i++) {
          this.destination_list = this.destination_list.filter(item => item.id != this.checkedList[i])
        }
        this.destination_list.map(item => {
          if (item.check == true) {
            this.uncheckList.push(item.id);
          }
        })
        if (this.uncheckList.length > 0) {
          this.isDelete = false;


        } else {
          this.isDelete = true;


        }

        this.manageUserActionBtn(this.destination_list);
        this.displayAllRecord();
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Leads has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Leads are safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })

  }
  selectAll() {

    for (let i = 0; i < this.destination_list.length; i++) {

      this.destination_list[i]['check'] = true;
      this.checkedList.push(this.destination_list[i]['id']);
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;


    } else {
      this.isDelete = true;


    }
    this.manageUserActionBtn(this.destination_list);
    this.displayAllRecord();



  }

  unselectAll() {

    for (let i = 0; i < this.destination_list.length; i++) {

      this.destination_list[i]['check'] = false;
      this.checkedList = [];
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;


    } else {
      this.isDelete = true;


    }
    this.manageUserActionBtn(this.destination_list);
    this.displayAllRecord();

  }
  check(data) {
    for (let i = 0; i < this.destination_list.length; i++) {
      if (this.destination_list[i]['contact'] === data.contact) {
        this.destination_list[i]['check'] = true;
        this.checkedList.push(data.id)
      }
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;

    } else {
      this.isDelete = true;


    }
    this.manageUserActionBtn(this.destination_list);
    this.displayAllRecord();

  }

  uncheck(data) {
    this.uncheckList = [];
    data['check'] = false;
    this.checkedList = this.destination_list.filter(item => item.id != data.id);
    this.checkedList.map(data => {
      if (data.check == true) {
        this.uncheckList.push(data.id);
      }
    })
    if (this.uncheckList.length > 0) {
      this.isDelete = false;


    } else {
      this.isDelete = true;


    }
    this.manageUserActionBtn(this.checkedList)
    this.displayAllRecord()



  }
  deleteParticipant(data) {
    this.uncheckList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.contact + "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.afterDelete = true;
        for (let i = 0; i < this.destination_list.length; i++) {
          if (this.destination_list[i]['contact'] === data['contact']) {
            this.destination_list.splice(i, 1);


            if (this.uncheckList.length > 0) {
              this.isDelete = false;


            } else {
              this.isDelete = true;


            }

            this.manageUserActionBtn(this.destination_list);
            this.displayAllRecord();
          }
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.contact + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.contact + "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
  }
  cancleDialog(): void {
    this.dialogRef.close();
  }
  submit() {
    this.basicFile();
    this.uploader.uploadAll();
  }

  basicFile() {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('customer_id', localStorage.getItem('id')); //note comma separating key and value
      form.append('role', localStorage.getItem('type'));
      form.append('id', null);
      form.append('type', 'outboundConference');
      form.append('flag', true);
      form.append('outboundData', this.data.id);
    };
  }

  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  onNoClick(): void {
    this.dialogRef.close();
    // e.preventDefault();
  }
}
