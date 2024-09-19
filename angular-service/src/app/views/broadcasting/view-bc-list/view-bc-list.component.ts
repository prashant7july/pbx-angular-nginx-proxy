import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx, hours_regex, minute_regex } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page } from '../../../core/models'
import { RatePlan } from '../../../core/models/RatePlan.model';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { LimitData } from '@syncfusion/ej2-angular-inputs';
import { id } from '@swimlane/ngx-datatable/release/utils';
import { FormArray } from '@angular/forms';
import { PromptsService } from '../../prompts/prompts.service';
import { ExtensionService } from '../../extension/extension.service';
import { formError, agentError } from '../../../core';
import { CallQueue } from 'src/app/core/models/callqueue.model';
import { ContactListService } from '../../contact-list/contact-list.service';
import { BroadcastService } from '../broadcast.service';
import { TeleConsultationService } from '../../tele-consultation/tele-consultation.service';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { DidService } from '../../DID/did.service';
import { Scheduler } from 'rxjs-compat';
import { ThumbsConstraints } from '@syncfusion/ej2-angular-diagrams';
import { log } from 'console';
import { CustomerDialoutServiceService } from '../../customer-dialoutRule/customer-dialout-service.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


@Component({
  selector: 'app-view-bc-list',
  templateUrl: './view-bc-list.component.html',
  styleUrls: ['./view-bc-list.component.css']
})
export class ViewBcListComponent implements OnInit {


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
  filter_list: any;
  globalRateList: any = "";
  //as : number = 1_00_000;
  constructor(
    public broadcastService: BroadcastService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public teleConsultationService: TeleConsultationService,

  ) { }

  ngOnInit() {
    this.filterForm = this.fb.group({
      'name': [""],
      'by_schduler': [""],
    });
    this.broadcastService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 20 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 30 },
      { field: 'schedular_start_date', headerName: 'Schedular', hide: false, width: 20 },

    ];
    if (this.isFilter) {
      this.filterObj = this.filterForm.value
      this.filterObj.by_schduler = this.filterObj.by_schduler !=""?Number(this.filterObj.by_schduler):""
      
    } else {
      this.filterObj = {};
    }
    let customerId = localStorage.getItem('type') == '1' ? Number(localStorage.getItem('id')) : 0;
    this.broadcastService.getBC(this.filterObj, customerId).subscribe(pagedData => {
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


  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Plan Name", "Price", "Description"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status;
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.name, element.price, element.description];
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

      },
    });
    doc.save('rateplan.pdf');

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
    worksheet.columns = [
      { header: 'Plan Name', key: 'name', width: 30 },
      { header: 'Price', key: 'price', width: 40 },
      { header: 'Description', key: 'description', width: 40 },

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
      let strStatus = this.exportData[i].status;
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Name: this.exportData[i].name,
        Price: this.exportData[i].price,
        Description: this.exportData[i].description,
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

    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'gateway');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'TCPlan');
    });
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let schedularBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "<i class='fa fa-list edit-button' style='cursor:pointer; display: inline' data-action-type='manage' title='Manage'></i>";
      finalBtn += "</span>";
      if (pagedData[i]['scheduler'] == '1' && pagedData[i]['status'] == '0') { //schedular
        schedularBtn += "<span>";
        schedularBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='start' title='Start Schedular'>Start</button> ";
        schedularBtn += "</span>";
      } else if (pagedData[i]['scheduler'] == '1' && pagedData[i]['status'] == '1') { //schedular
        schedularBtn += "<span>";
        schedularBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='stop' title='Stop Schedular'>Stop</button> ";
        schedularBtn += "</span>";
      } else {
        schedularBtn += "<p>" + pagedData[i]['schedular_start_date'] + "</p>";
        // data[i]['description'] = finalBtn;
      }
      pagedData[i]['schedular_start_date'] = schedularBtn;
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editBC(data);
      case "delete":
        return this.deleteBC(data);
      case "start":
        return this.startSchedular(data, '1');   // 1 = start schedular
      case "stop":
        return this.startSchedular(data, '0'); // 0 = stop schedular
      case "manage":
        return this.manageBroadcast(data);
    }
  }

  manageBroadcast(data) {
    this.manageBroadcastDialog(data);
  }

  editBC(data: any) {
    this.openDialog(data);
  }

  addBC() {
    this.openDialog(null)
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddBCDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  manageBroadcastDialog(data?): void {
    const dialogRef = this.dialog.open(ManageBroadcastDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoBroadcastListDialog, {
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
    });
  }

  deleteBC(event) {
    this.broadcastService.getBroadcastCount(event.id).subscribe(data => {
      if (data.response[0].broadcast_count > 0) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'> Broadcast <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> can't be deleted because it is associate with DID Destination.",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
      else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html: "<span style='color:#FFFFFF;'>You will not be able to recover Broadcast </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.broadcastService.deleteBC({ id: event.id }).subscribe(data => {
              if (data['code'] == 400) {
                Swal.fire(
                  {
                    type: 'error',
                    title: '<span style="color:#FFFFFF;">Oopss...</span>',
                    text: 'This Feature is mapped with DID.',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#000000'
                  })
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
              html: "<span style='color:#FFFFFF;'>Broadcast <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 3000
            });
            this.displayAllRecord();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html: "<span style='color:#FFFFFF;'>Broadcast <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
              type: 'error',
              background: '#000000',
              timer: 3000
            });
          }
        })
      }
    })
  }

  public startSchedular(event, status) {
    let obj = {
      application: "manual_broadcast",
      cust_id: (localStorage.getItem('id').toString()),
      broadcast_id: (event.id).toString(),
      token_id: (localStorage.getItem('token').toString()),
    }
    this.broadcastService.partiallyUpdateBC({ 'status': Number(status) }, event['id']).subscribe(data => {
      this.displayAllRecord();
      this.broadcastService.startManualSchecular(obj).subscribe(data => {

      });
    });
  }
}

@Component({
  selector: 'addBC-dialog',
  templateUrl: './addBC-dialog.html',
  providers: [CheckBoxSelectionService]
})

export class AddBCDialog implements OnInit {
  BCForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = '';
  selectedConferenceValue = "";
  selectedQueueValue = "";
  sourceAgent: any[] = [];
  SIPFilter: any;
  filter: any;
  queueName = false;
  callqueueData: any = {};
  ext_group_List:any = []
  extList: any = {};
  errorField: any;
  welcomePrompt = 0;
  isShowPSTN: boolean = false;
  isShowExtension: boolean = false;
  contactGroupList: any = [];
  removable = true;
  selectable = true;
  selectedTeleConsultationValue: any = [];
  selectPrompt = [];
  PromptFilter: any;
  filters: any;
  isCallerId: any;
  minDate: Date;
  minEndDate: Date;
  todayDate: Date;
  isShowSchedular: boolean = false;
  contactList: any[] = [];
  groupList: any[] = [];
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public fields11: Object = { text: 'prompt_name', value: 'id' };
  public fields3: Object = { text: 'agent', value: 'id' };
  public fields: Object = { text: 'agent', value: 'id' };
  public fields2: Object = { text: 'didDisplay', value: 'id' };
  public fields1: Object = { text: "name", value: "id" };
  public mode: string = 'CheckBox';
  public selectAllText: string = "Select All"
  pstnList: any[] = [];
  didList: any[] = [];
  maskArray: any[] = [];
  sipgroupList: any[] = [];
  DIDFilter: any;
  filterDID: any;
  hoursV: any;
  minutesV: any;
  attempt: any;
  is_pstn: boolean = false;
  is_extension: boolean = false;
  onext_listSelect: boolean = false;
  onext_group_listSelect: boolean = false;
  disabledExtList:any;
  placeholder = 'Select Extension';
  placeholder2 = 'Select Group';
  placeholder4 = 'SIP as caller id*';
  placeholder3 = 'Select Prompt';
  placeholder5 = 'DID as caller id*';
  promise: any;
  public attempts: any = [
    {
      id: 1,
      label: '1'
    },
    {
      id: 2,
      label: '2'
    },
    {
      id: 3,
      label: '3'
    },
  ];
  public fields4: Object = { text: 'label', value: 'id' };


  constructor(private changeRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddBCDialog>, @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private extensionService: ExtensionService,
    private teleConsultationService: TeleConsultationService,
    private contactListService: ContactListService,
    public broadcastService: BroadcastService,
    private didService: DidService,
    private customerDialoutService: CustomerDialoutServiceService,

  ) {
    this.BCForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'welcome_prompt': ['0', Validators.required],
      'scheduler': ['1'],
      'schedular_start_date': [''],
      'is_extension': [''],
      'is_pstn': [''],
      'extension': [''],
      'feature_select': [''],
      'ext_group_id': [''],
      'pstn': [''],
      'group': [''],
      // 'is_caller_id' : [''],
      // 'caller_id_type' : [''],
      'caller_id_ext': [''],
      'caller_id_pstn': [''],
      'attempts': [''],
      // 'hours': ['', [Validators.required, Validators.pattern(hours_regex)]],
      'minutes': ['', [Validators.required,this.minutesRangeValidator()]],

    });

    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
  }
  get name() { return this.BCForm.get('name'); }
  get extension() { return this.BCForm.get('extension'); }
  get pstn() { return this.BCForm.get('pstn'); }
  get schedular_start_date() { return this.BCForm.get('schedular_start_date'); }
  get group() { return this.BCForm.get('group'); }
  get caller_id_ext() { return this.BCForm.get('caller_id_ext'); }
  get caller_id_pstn() { return this.BCForm.get('caller_id_pstn'); }
  get hours() { return this.BCForm.get('hours'); }
  get minutes() { return this.BCForm.get('minutes'); }
  get ext_group_id() { return this.BCForm.get('ext_group_id'); }


  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.onext_listSelect = true;
    this.onext_group_listSelect = false;
    this.BCForm.get('attempts').setValue(1);
    this.mode = 'CheckBox';
    this.selectAllText = 'Select All';
    let d1 = new Date();
    let user_id = localStorage.getItem("id");
    let customerId = localStorage.getItem('id');
    this.todayDate = new Date(d1);
    this.todayDate.setMinutes(d1.getMinutes() + 10);  // Add 10 minutes extra into current date as per bhati sir requirement

    // this.mode = 'CheckBox';
    // this.selectAllText= 'Select All';
    this.promptsService.getBroadcastPrompt(localStorage.getItem('id')).subscribe(data => {
      this.selectedTeleConsultationValue = data.response;
      //  this.selectPrompt.unshift({id:0 ,prompt_name:'default' })

      this.filters = this.PromptFilter = this.selectedTeleConsultationValue.slice();
      if (this.selectedTeleConsultationValue.length > 0 && !this.data) {
        this.callqueueData.welcome_prompt = this.selectedTeleConsultationValue[0]['id'];
      }
    }, err => {
      this.error = err.message;
    });

    //add sip group
    this.customerDialoutService
    .getGroupType(localStorage.getItem("id"), 1)
    .subscribe((data) => {
      this.sipgroupList = data.map((item) => ({ id: item.id, name: item.name }));
    });

    //add SIP(Extn)    
    this.extensionService.getMyExtension(localStorage.getItem('id')).subscribe(async data => {
      this.extList = data.response;
      let promise = new Promise((resolve) => {
        for (let i = 0; i < data.response.length; i++) {
          this.sourceAgent.push({ id: data.response[i].id, agent: data.response[i].ext_number + '-' + data.response[i].caller_id_name });
          this.filter = this.SIPFilter = this.sourceAgent.slice();
        }
        resolve(this.sourceAgent);
      })
      promise.then(response => {
        this.customOnInIt(customerId)
      })
    }, err => {
      this.error = err.message;
    });

    //ADD User(PSTN)
    this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, 'customer_id': Number(localStorage.getItem('id')), 'extension_id': 0, 'role': Number(localStorage.getItem('type')) }).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.contactList.push({ id: data[i].id, name: data[i].name, agent: data[i].name + ' - ' + data[i].phoneNumber1Display });
      }
    }, err => {
      this.error = err.message;
    });

    //ADD Group(PSTN)        
    // this.promise.then((response) => {      

    // })

    // this.contactListService.getContactGroups(customerId).subscribe(data => {
    //   for (let i = 0; i < data.length; i++) {
    //     this.groupList.push({ id: data[i].id, name: data[i].name, agent: data[i].name});
    //   }
    //     // if (this.data) {
    //       this.broadcastService.getSingleBC(this.data.id).subscribe(data => {
    //         data = data.response;            
    //         this.callqueueData = data[0];                
    //         this.BCForm.get('caller_id_ext').setValue(JSON.parse(this.callqueueData.SIP_caller_id));
    //           // this.callqueueData.SIP_caller_id = parseInt(this.callqueueData.SIP_caller_id);                          
    //         this.callqueueData.DID_caller_id = parseInt(this.callqueueData.DID_caller_id);




    //         // this.callqueueData.is_extension = this.callqueueData.is_extension == '1'?true:false
    //         // this.callqueueData.is_pstn = this.callqueueData.is_pstn == '1'?true:false
    //         this.callqueueData.welcome_prompt = this.callqueueData.welcome_prompt == 0 ? '0' : this.callqueueData.welcome_prompt;
    //         this.callqueueData.is_caller_id = this.callqueueData.is_caller_id ? Number(this.callqueueData.is_caller_id) : 0;
    //         let groupIds = data[0].group_ids ? (data[0].group_ids).split(",") : [];
    //         let groupListData = [];
    //         groupIds.forEach((element, j) => {
    //           groupListData.push(Number(element));
    //         });
    //         if (this.callqueueData.scheduler == '2' || this.callqueueData.scheduler == 2) {
    //           this.isShowSchedular = true;
    //           this.todayDate = data[0].schedular_start_date ? data[0].schedular_start_date : '';
    //         }
    //         if (data[0].is_extension == '1') {
    //           this.callqueueData.is_extension = true;
    //           this.BCForm.get('is_extension').setValue('1');
    //           this.isShowExtension = true;
    //         } else {
    //           this.callqueueData.is_extension = false;
    //           this.BCForm.get('is_extension').setValue('0');
    //         }
    //         if (data[0].is_pstn == '1') {
    //           this.callqueueData.is_pstn = true;
    //           this.BCForm.get('is_pstn').setValue('1');
    //           this.isShowPSTN = true;
    //         } else {
    //           this.callqueueData.is_pstn = false;
    //           this.BCForm.get('is_pstn').setValue('0');
    //         }
    //         // if(this.callqueueData.is_extension == true){
    //         //   this.BCForm.get('is_extension').setValue('1');
    //         //   this.isShowExtension = true;
    //         // }else{
    //         //   this.BCForm.get('is_extension').setValue('0');
    //         //   this.isShowExtension = false;
    //         //   this.callqueueData.is_extension = false;
    //         // }

    //         // if(this.callqueueData.is_pstn == true){
    //         //   this.BCForm.get('is_pstn').setValue('1');
    //         //   this.isShowPSTN = true;
    //         // }else{
    //         //   this.BCForm.get('is_pstn').setValue('0');
    //         //   this.isShowPSTN = false;
    //         //   this.callqueueData.is_pstn = false;
    //         // }

    //         // contacts data
    //         let usersId = (data[0].ref_id).split(",");
    //         let usersType = (data[0].ref_type).split(",");
    //         var extensionList = [];
    //         var pstnList = [];
    //         setTimeout(() => {
    //           usersId.forEach((element1, i) => {
    //             usersType.forEach((element2, j) => {
    //               if (i === j) {
    //                 if (element2 == 'E') {
    //                   extensionList.push(Number(element1));
    //                 } else if (element2 == 'P') {
    //                   pstnList.push(Number(element1));
    //                 } else {
    //                   // usersList.push(element1);
    //                 }
    //               }
    //             });
    //           });
    //           this.callqueueData.extension = extensionList ? extensionList : '';
    //           // this.callqueueData.pstn = pstnList ? pstnList : '';
    //           this.pstnList = pstnList ? pstnList : [];
    //           this.callqueueData.group = groupListData; 
    //         }, 200);
    //       }, err => {
    //         this.error = err;
    //       });
    //     // }
    //   // }
    // }, err => {
    //   this.error = err.message;
    // });
    // if (this.data) {
    //   this.broadcastService.getSingleBC(this.data.id).subscribe(data => {
    //     data = data.response
    //     this.callqueueData = data[0];
    //     this.callqueueData.welcome_prompt = this.callqueueData.welcome_prompt == 0 ? '0' : this.callqueueData.welcome_prompt;
    //     this.callqueueData.is_caller_id = this.callqueueData.is_caller_id ? Number(this.callqueueData.is_caller_id) : 0;
    //     // this.callqueueData.scheduler =  Number(this.callqueueData['scheduler']);
    //     let groupIds = data[0].group_ids ? (data[0].group_ids).split(",") : [];
    //     let groupListData = [];
    //     groupIds.forEach((element, j) => {
    //       groupListData.push(Number(element));
    //     });
    //    // this.callqueueData.group = (data[0].group_ids).split(",");
    //     if (this.callqueueData.scheduler == '2' || this.callqueueData.scheduler == 2) {
    //       this.isShowSchedular = true;
    //       this.todayDate = data[0].schedular_start_date ? data[0].schedular_start_date : '';
    //     }

    //     if (data[0].is_extension == '1') {
    //       this.callqueueData.is_extension = true;
    //       this.BCForm.get('is_extension').setValue('1');
    //       this.isShowExtension = true;
    //     } else {
    //       this.callqueueData.is_extension = false;
    //       this.BCForm.get('is_extension').setValue('0');
    //     }
    //     if (data[0].is_pstn == '1') {
    //       this.callqueueData.is_pstn = true;
    //       this.BCForm.get('is_pstn').setValue('1');
    //       this.isShowPSTN = true;
    //     } else {
    //       this.callqueueData.is_pstn = false;
    //       this.BCForm.get('is_pstn').setValue('0');
    //     }
    //     // contacts data
    //     let usersId = (data[0].ref_id).split(",");
    //     let usersType = (data[0].ref_type).split(",");
    //     var extensionList = [];
    //     var pstnList = [];
    //     setTimeout(() => {
    //       usersId.forEach((element1, i) => {
    //         usersType.forEach((element2, j) => {
    //           if (i === j) {
    //             if (element2 == 'E') {
    //               extensionList.push(Number(element1));
    //             } else if (element2 == 'P') {
    //               pstnList.push(Number(element1));
    //             } else {
    //               // usersList.push(element1);
    //             }
    //           }
    //         });
    //       });
    //       this.callqueueData.extension = extensionList ? extensionList : '';
    //       // this.callqueueData.pstn = pstnList ? pstnList : '';
    //       this.pstnList = pstnList ? pstnList : [];
    //       this.callqueueData.group = groupListData;
    //     }, 200);
    //   }, err => {
    //     this.error = err;
    //   });
    // }

    this.extensionService.getMyExtensionLimit(localStorage.getItem("id"), localStorage.getItem('type')).subscribe(data => {
      this.isCallerId = data.ext.is_caller_id;
    });
    this.didService.getCustomerDID(user_id, null).subscribe(pagedData => {
      this.didList = pagedData;
      this.filterDID = this.DIDFilter = this.didList.slice();
    });
  }

  customOnInIt(customerId) {
    this.contactListService.getContactGroups(customerId).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.groupList.push({ id: data[i].id, name: data[i].name, agent: data[i].name });
      }
      if (this.data) {
        this.broadcastService.getSingleBC(this.data.id).subscribe(data => {
          data = data.response;
          this.callqueueData = data[0];
          this.ext_group_List = this.callqueueData.intercom_group ? this.callqueueData.intercom_group.split(',').map(Number) : [];
    
          let featureSelect = this.callqueueData.feature_select;
          if(featureSelect == '1'){
            this.onext_group_listSelect = true;
            this.onext_listSelect = false;
          }else if(featureSelect == '0'){
            this.onext_group_listSelect = false;
            this.onext_listSelect = true;
          }

          if (this.extList.length >= 301) {
            this.disabledExtList = true;
          }else{
            this.disabledExtList = false;
          }

          // this.callqueueData.intercom_group = parseInt(this.callqueueData.intercom_group)
          if(this.callqueueData.intercom_group.length){
            this.BCForm.get('ext_group_id').setValue(parseInt(this.callqueueData.intercom_group));
          }
          
          if (this.callqueueData.is_extension) this.BCForm.get('caller_id_ext').setValue(JSON.parse(this.callqueueData.SIP_caller_id));
          // this.callqueueData.SIP_caller_id = parseInt(this.callqueueData.SIP_caller_id);                          
          this.callqueueData.DID_caller_id = parseInt(this.callqueueData.DID_caller_id);




          // this.callqueueData.is_extension = this.callqueueData.is_extension == '1'?true:false
          // this.callqueueData.is_pstn = this.callqueueData.is_pstn == '1'?true:false
          this.callqueueData.welcome_prompt = this.callqueueData.welcome_prompt == 0 ? '0' : this.callqueueData.welcome_prompt;
          this.callqueueData.is_caller_id = this.callqueueData.is_caller_id ? Number(this.callqueueData.is_caller_id) : 0;
          let groupIds = data[0].group_ids ? (data[0].group_ids).split(",") : [];
          let groupListData = [];
          groupIds.forEach((element, j) => {
            groupListData.push(Number(element));
          });
          if (this.callqueueData.scheduler == '2' || this.callqueueData.scheduler == 2) {
            this.isShowSchedular = true;
            this.todayDate = data[0].schedular_start_date ? data[0].schedular_start_date : '';
          }
          if (data[0].is_extension == '1') {
            this.callqueueData.is_extension = true;
            this.BCForm.get('is_extension').setValue('1');
            this.isShowExtension = true;
          } else {
            this.callqueueData.is_extension = false;
            this.BCForm.get('is_extension').setValue('0');
          }
          if (data[0].is_pstn == '1') {
            this.callqueueData.is_pstn = true;
            this.BCForm.get('is_pstn').setValue('1');
            this.isShowPSTN = true;
          } else {
            this.callqueueData.is_pstn = false;
            this.BCForm.get('is_pstn').setValue('0');
          }
          // if(this.callqueueData.is_extension == true){
          //   this.BCForm.get('is_extension').setValue('1');
          //   this.isShowExtension = true;
          // }else{
          //   this.BCForm.get('is_extension').setValue('0');
          //   this.isShowExtension = false;
          //   this.callqueueData.is_extension = false;
          // }

          // if(this.callqueueData.is_pstn == true){
          //   this.BCForm.get('is_pstn').setValue('1');
          //   this.isShowPSTN = true;
          // }else{
          //   this.BCForm.get('is_pstn').setValue('0');
          //   this.isShowPSTN = false;
          //   this.callqueueData.is_pstn = false;
          // }

          // contacts data

          // this.hoursV = this.data.try_interval.split(',')[0];
          this.minutesV = this.data.try_interval;
          this.attempt = this.data.attempt;
          let usersId = (data[0].ref_id).split(",");
          let usersType = (data[0].ref_type).split(",");
          var extensionList = [];
          var pstnList = [];
          setTimeout(() => {
            usersId.forEach((element1, i) => {
              usersType.forEach((element2, j) => {
                if (i === j) {
                  if (element2 == 'E') {
                    extensionList.push(Number(element1));
                  } else if (element2 == 'P') {
                    pstnList.push(Number(element1));
                  } else {
                    // usersList.push(element1);
                  }
                }
              });
            });
            this.callqueueData.extension = extensionList ? extensionList : '';
            // this.callqueueData.pstn = pstnList ? pstnList : '';
            this.pstnList = pstnList ? pstnList : [];
            this.callqueueData.group = groupListData;
          }, 200);
        }, err => {
          this.error = err;
        });
        // }
      } else {
        this.BCForm.get('hours').setValue('0');
        this.BCForm.get('minutes').setValue('0');
        this.BCForm.get('attempts').setValue(1);
      }
    }, err => {
      this.error = err.message;
    });
  }


    minutesRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value < 1 || value > 240) {
        return { invalidRange: true };
      }
      return null;
    };
  }

  categoryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedTeleConsultationValue.filter((data) => {
      return data['prompt_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Callerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.sourceAgent.filter((data) => {
      return data['agent'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  DIDremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.didList.filter((data) => {
      return data['didDisplay'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  extensionremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.sourceAgent.filter((data) => {
      return data['agent'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  groupremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.groupList.filter((data) => {
      return data['agent'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  validateTime(selectedDate: Date): void {
    const hours = selectedDate.getHours();

    if (hours >= 20 || hours < 7) {
      alert('Selected time is not allowed. Please select a time between 7 AM and 8 PM.');
      this.todayDate = new Date();  // Reset to current date/time or handle as needed
    }
  }

  submitBCForm() {
    const filteredArr = this.pstnList.reduce((acc, current) => {
      const x = acc.find(item => item === current);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    this.BCForm.get('pstn').setValue(filteredArr);
    let isPSTN = this.BCForm.get('group').value ? (this.BCForm.get('group').value).length > 0 ? true : false : false;

    let isExtn = this.BCForm.get('extension').value ? (this.BCForm.get('extension').value).length > 0 ? true : false : false;
    let isExtnGroup = this.BCForm.get('ext_group_id').value ? (this.BCForm.get('ext_group_id').value).length > 0 ? true : false : false;

    if ((!isPSTN && !isExtn && !isExtnGroup)) {
      this.toastr.error('Error!', 'Please select at least one Consultant', { timeOut: 2000 });
      return;
    }
    // if(this.BCForm.value.caller_id == "" || this.BCForm.value.caller_id == undefined) {
    //   this.toastr.error('Error!', `Provide caller id value`, { timeOut: 2000 });
    //   return;    
    // }    

    if (this.BCForm.value.is_pstn == true && this.BCForm.value.group == "") {
      this.toastr.error('Error!', `Pstn can't be null`, { timeOut: 2000 });
      return;
    }
    if (this.BCForm.value.is_extension == true && this.BCForm.value.extension == "" && this.BCForm.value.ext_group_id == "") {
      this.toastr.error('Error!', `Sip can't be null`, { timeOut: 2000 });
      return;
    }
    if (this.isShowExtension && !this.caller_id_ext.value) {
      this.toastr.error('Error!', `SIP Caller id can't be null`, { timeOut: 2000 });
      return;
    }
    if (this.isShowPSTN && !this.caller_id_pstn.value) {
      this.toastr.error('Error!', `DID Caller id can't be null`, { timeOut: 2000 });
      return;
    }
    this.checkForm = this.findInvalidControls();
    if (this.BCForm.valid){this.submitted = true;
      const credentials = this.BCForm.value;
      // let hours = credentials['hours'].toString();
      let minutes = credentials['minutes']
      credentials['try_interval'] = minutes;
      credentials.scheduler = credentials['scheduler'] ? credentials['scheduler'] : '1';
      // credentials.is_pstn = this.BCForm.get('pstn').value ? (this.BCForm.get('pstn').value).length > 0 ? true : false : false;
      credentials.is_pstn = this.BCForm.get('group').value ? (this.BCForm.get('group').value).length > 0 ? true : false : false;
      
      credentials.is_extension = this.BCForm.get('extension').value ? (this.BCForm.get('extension').value).length > 0 ? true : false : false;
      credentials.is_group_ext = this.BCForm.get('ext_group_id').value ? (this.BCForm.get('ext_group_id').value).length > 0 ? true : false : false;

      credentials.prompt_name = this.selectedTeleConsultationValue.filter(item => item.id == credentials.welcome_prompt).length ? this.selectedTeleConsultationValue.filter(item => item.id == credentials.welcome_prompt)[0]['prompt_name'] : "";

      credentials.caller_id_ext_name = this.sourceAgent.filter(item => item.id == credentials.caller_id_ext).length ? this.sourceAgent.filter(item => item.id == credentials.caller_id_ext)[0]['agent'] : [];
      
      if(credentials.is_extension){
        let ext_name = [];
        credentials.extension.length ? credentials.extension.map(item => {
          let names = this.sourceAgent.find(value => value.id == item)
          ext_name.push(names.agent);
        }) : "";
        credentials.ext_name = ext_name;
      }else{
        credentials.extension = [];
      }

      if(credentials.is_group_ext){
        let grp_ext_name = [];
        credentials.ext_group_id.length ? credentials.ext_group_id.map(item => {
          let names = this.sipgroupList.find(value => value.id == item)          
          grp_ext_name.push(names.name);
        }) : "";
        credentials.grp_ext_name = grp_ext_name;
      }else{
        credentials.ext_group_id = [];
      }

      credentials.caller_id_pstn_name = this.didList.filter(item => item.id == credentials.caller_id_pstn).length ? this.didList.filter(item => item.id == credentials.caller_id_pstn)[0]['didDisplay']: [];

      if(credentials.is_pstn){
        let pstn_name = [];
        credentials.group.length ? credentials.group.map(item => {
          let names = this.groupList.find(value => value.id == item)
          pstn_name.push(names.agent);
        }) : "";
        credentials.pstn_name = pstn_name;
      }else{
        credentials.pstn = [];
      }
      
      if (this.data) {
        credentials.id = this.data.id;
        credentials.customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
        this.broadcastService.getBroadcastIsExist(credentials.name, credentials.customerId, credentials.id).subscribe((data) => {
          if (data['broadcast_count'] < 1) {
            this.broadcastService.updateBC(credentials).subscribe((data) => {
              if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                this.cancelForm();
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            })
          } else {
            this.toastr.error('Error!', 'Broadcast is already exist!', { timeOut: 3000 });
            this.cancelForm();
          }
        })
      } else {
        credentials.customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
        this.broadcastService.getBroadcastIsExist(credentials.name, credentials.customerId, '').subscribe((data) => {
          if (data['broadcast_count'] < 1) {
            this.broadcastService.addBC(credentials).subscribe((data) => {
              if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                this.cancelForm();
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                this.cancelForm();
              }
            })
          } else {
            this.toastr.error('Error!', 'Broadcast is already exist!', { timeOut: 3000 });
            this.cancelForm();
          }
        });

      }
    } else {
      this.toastr.error('Error!', 'Mandatory field is missing.', { timeOut: 2000 });
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.BCForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancelForm() {
    this.BCForm.reset();
    // this.callqueueService.updateGridList();
    this.dialogRef.close();
  }


  getPackageByProduct(data) {
    
    

    if (data.source.value == '1' && data.checked) {
      if (this.extList.length >= 301) {
        
        this.disabledExtList = true;
        this.BCForm.get("extension").clearValidators();
        this.BCForm.get("extension").updateValueAndValidity();
        this.BCForm.get("extension").reset();
        this.isShowExtension = true;
      }else{
        this.isShowExtension = true;
        this.BCForm.get('extension').setValidators(Validators.required)
      }
    } else if (data.source.value == '1' && !data.checked) {
      
      
      this.isShowExtension = false;
      this.BCForm.get('extension').clearValidators();
      this.BCForm.get('extension').setValue([]);
      this.BCForm.get('extension').updateValueAndValidity();
      // this.BCForm.get('feature_select').reset();
      // this.BCForm.get('feature_select').updateValueAndValidity();
      this.BCForm.get('ext_group_id').reset();
      this.BCForm.get('ext_group_id').updateValueAndValidity();
    }
    else if (data.source.value == '2' && data.checked) {
      // this.BCForm.get('feature_select').reset();
      // this.BCForm.get('feature_select').updateValueAndValidity();
      // this.BCForm.get('ext_group_id').reset();
      // this.BCForm.get('ext_group_id').updateValueAndValidity();
      this.isShowPSTN = true;
      // this.BCForm.get('pstn').setValidators(Validators.required)
      this.BCForm.get('group').setValidators(Validators.required)
    } else if (data.source.value == '2' && !data.checked) {
      this.isShowPSTN = false;
      this.BCForm.get('pstn').clearValidators();
      this.BCForm.get('pstn').setValue([]);
      this.BCForm.get('pstn').updateValueAndValidity();
      this.BCForm.get('group').clearValidators();
      this.BCForm.get('group').setValue([]);
      this.BCForm.get('group').updateValueAndValidity();
      this.BCForm.get('caller_id_pstn').clearValidators();
      this.BCForm.get('caller_id_pstn').reset();
      this.BCForm.get('caller_id_pstn').updateValueAndValidity();
      // this.BCForm.get('feature_select').reset();
      // this.BCForm.get('feature_select').updateValueAndValidity();
      // this.BCForm.get('ext_group_id').reset();
      // this.BCForm.get('ext_group_id').updateValueAndValidity();
    }
}

  SelectfeatureChange(e) {
    if (e.value == "0") {
      this.onext_listSelect = true;
      this.onext_group_listSelect = false;
      this.BCForm.get("extension").setValidators(Validators.required);
      this.BCForm.get("extension").updateValueAndValidity();
      this.BCForm.get("ext_group_id").reset();
      this.BCForm.get("ext_group_id").clearValidators();
      this.BCForm.get("ext_group_id").updateValueAndValidity();
    } else {
      
      this.onext_listSelect = false;
      this.onext_group_listSelect = true;
      this.BCForm.get("extension").reset();
      this.BCForm.get("extension").clearValidators();
      this.BCForm.get("extension").updateValueAndValidity();
    }
  }

  schedularChange(event) {
    // this.filter['property'] = event.value;
    let schedularValue = event.value;
    if (schedularValue == '1') {
      this.isShowSchedular = false;
      this.BCForm.get('schedular_start_date').clearValidators();
      this.BCForm.updateValueAndValidity();
    } else {
      this.isShowSchedular = true;
      this.BCForm.get('schedular_start_date').setValidators(Validators.required);
      this.BCForm.updateValueAndValidity();
    }
  }

  public getGroupName(gId) {
    const result = this.groupList.filter(item => item.id == gId);
    return result[0].name;
  }

  public getGroupContactName(gId) {
    this.contactListService.getAllContactInGroup(gId).subscribe(data => {
      return data;
    }, err => {
      this.error = err.message;
    });
  }

  public selectGroup(data, itemSelect) {
    let gId = data['itemData'].id;
    this.contactListService.getAllContactInGroup(gId).subscribe(data => {
      if (data && itemSelect) {
        data.forEach(element => {
          this.pstnList.push(element.contact_id);
        });
      } else if (data && !itemSelect) {
        data.forEach(element => {
          const index = this.pstnList.indexOf(element.contact_id);
          if (index != -1) {
            this.pstnList.splice(index, 1);
          }
        });
      }
    }, err => {
      this.error = err.message;
    });
  }

  // public changeCaller(event){
  //  if(event.checked){
  //   this.BCForm.get('caller_id_type').setValue('SIP');
  //   this.callqueueData['caller_id_type'] = 'SIP';
  //   this.BCForm.get('caller_id_type').updateValueAndValidity();
  //   this.BCForm.get('caller_id').setValue('');
  //   this.BCForm.get('caller_id').setValidators(Validators.required);
  //   this.BCForm.get('caller_id').updateValueAndValidity();
  //   this.BCForm.updateValueAndValidity();
  //  }else{
  //   this.BCForm.get('caller_id').setValue('');  
  //   this.BCForm.get('caller_id').clearValidators();
  //   this.BCForm.get('caller_id_type').setValue('');
  //   this.BCForm.get('caller_id').updateValueAndValidity();
  //   this.BCForm.get('caller_id_type').updateValueAndValidity();
  //  }
  // }

  // public changeCallerType(event){
  //   let callerValue = event.value;
  //   if (callerValue) {
  //     this.BCForm.get('caller_id').setValue('');
  //     this.BCForm.get('caller_id').setValidators(Validators.required);
  //     this.BCForm.get('caller_id').updateValueAndValidity();
  //     this.BCForm.updateValueAndValidity();
  //   }
  // }

}

@Component({
  selector: 'infoBroadcastList-dialog',
  templateUrl: 'infoBroadcastList-dialog.html',
})

export class InfoBroadcastListDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoBroadcastListDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
@Component({
  selector: 'manage-broadcast-dialog',
  templateUrl: 'manage-broadcast-dialog.html',
})

export class ManageBroadcastDialog {
  b_id = '';
  dataSource2 = [];
  columnDefs2 = [];
  dataSource = [];
  columnDefs = [];
  participants = [];
  participantsExt = [];
  participantsPstn = [];
  checkedExtList = [];
  uncheckExtList = [];
  checkedPstnList = [];
  uncheckPstnList = [];
  exportDataExt = [];
  exportDataPstn = [];
  defaultPageSize = '10';
  isDeleteExt: boolean = true;
  isDeletePstn: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<ManageBroadcastDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    public broadcastService: BroadcastService,
    private toastr: ToastrService,


  ) { }

  ngOnInit() {

    let id = this.data.id;
    this.b_id = this.data.id;

    new Promise((resolve, reject) => {
      this.broadcastService.getBroadcastParticipants(id).subscribe(pagedData => {
        this.participants = pagedData.response
        resolve("Promise Resolved");
      }, err => {
        reject("error");
      });
    }).then((success) => {
      if (this.data) {
        this.participants.map((item) => {
          if (item.type == 'P') {
            this.participantsPstn.push(item);
            this.displayAllRecord();
          } else {
            this.participantsExt.push(item);
            this.displayAllRecord2();
          }
        })
      }
    })

  }

  public displayAllRecord2() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'extension', headerName: 'Lead', hide: false, width: 150 },
      { field: 'tries', headerName: 'Attempts', hide: false, width: 150 },
      { field: 'dialed_status', headerName: 'Dial Status', hide: false, width: 150 },
    ];
    this.manageUserActionBtn2(this.participantsExt);
    this.exportDataExt = this.participantsExt
    this.dataSource = [];
    this.dataSource.push({ 'fields': this.columnDefs, 'data': this.participantsExt });

  }

  public displayAllRecord() {
    this.columnDefs2 = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'contact', headerName: 'Lead', hide: false, width: 150 },
      { field: 'tries', headerName: 'Attempts', hide: false, width: 150 },
      { field: 'dialed_status', headerName: 'Dial Status', hide: false, width: 150 },
    ];

    this.manageUserActionBtn(this.participantsPstn);
    this.exportDataPstn = this.participantsPstn
    this.dataSource2 = [];
    this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.participantsPstn });

  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='deletePstn' title='Delete'></i>";
      finalBtn += "</span>";
      if (data[i]['check'] == true) {
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheckPstn' title='Uncheck'></i>";
        finalBtn += "</span>";
      } else {
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='checkPstn' title='check'></i>";
        finalBtn += "</span>";
      }
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageUserActionBtn2(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='deleteExt' title='Delete'></i>";
      finalBtn += "</span>";
      if (data[i]['check'] == true) {
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheckExt' title='Uncheck'></i>";
        finalBtn += "</span>";
      } else {
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='checkExt' title='check'></i>";
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
      case "deletePstn":
        return this.deleteParticipantPstn(data);
      case "deleteExt":
        return this.deleteParticipantExt(data);
      case "checkPstn":
        return this.checkPstn(data);
      case "uncheckPstn":
        return this.uncheckPstn(data);
      case "checkExt":
        return this.checkExt(data);
      case "uncheckExt":
        return this.uncheckExt(data);

    }
  }


  deleteCheckedPstn() {

    this.uncheckPstnList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover these leads in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        // this.afterDelete = true;
        for (let i = 0; i < this.checkedPstnList.length; i++) {
          this.participantsPstn = this.participantsPstn.filter(item => item.contact != this.checkedPstnList[i].contact)
        }
        this.participantsPstn.map(item => {
          if (item.check == true) {
            this.uncheckPstnList.push(item.id);
          }
        })
        if (this.uncheckPstnList.length > 0) {
          this.isDeletePstn = false;
        } else {
          this.isDeletePstn = true;
        }

        this.manageUserActionBtn(this.participantsPstn);
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

  deleteCheckedExt() {

    this.uncheckExtList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover these leads in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        // this.afterDelete = true;
        for (let i = 0; i < this.checkedExtList.length; i++) {
          this.participantsExt = this.participantsExt.filter(item => item.contact != this.checkedExtList[i].contact)
        }
        this.participantsExt.map(item => {
          if (item.check == true) {
            this.uncheckExtList.push(item.id);
          }
        })
        if (this.uncheckExtList.length > 0) {
          this.isDeleteExt = false;
        } else {
          this.isDeleteExt = true;
        }

        this.manageUserActionBtn2(this.participantsExt);
        this.displayAllRecord2();
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

  deleteParticipantExt(data) {
    this.uncheckExtList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.extension + "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        // this.afterDelete = true;
        for (let i = 0; i < this.participantsExt.length; i++) {
          if (this.participantsExt[i]['extension'] === data['extension']) {
            this.participantsExt.splice(i, 1);


            if (this.uncheckExtList.length > 0) {
              this.isDeleteExt = false;
            } else {
              this.isDeleteExt = true;
            }

            this.manageUserActionBtn2(this.participantsExt);
            this.displayAllRecord2();
          }
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.extension + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.extension + "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
  }

  deleteParticipantPstn(data) {
    this.uncheckPstnList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.contact + "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        // this.afterDelete = true;
        for (let i = 0; i < this.participantsPstn.length; i++) {
          if (this.participantsPstn[i]['contact'] === data['contact']) {
            this.participantsPstn.splice(i, 1);


            if (this.uncheckPstnList.length > 0) {
              this.isDeletePstn = false;
            } else {
              this.isDeletePstn = true;
            }

            this.manageUserActionBtn(this.participantsPstn);
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

  checkPstn(data) {
    for (let i = 0; i < this.participantsPstn.length; i++) {
      if (this.participantsPstn[i]['contact'] === data.contact) {
        this.participantsPstn[i]['check'] = true;
        this.checkedPstnList.push(data)
      }
    }
    if (this.checkedPstnList.length > 0) {
      this.isDeletePstn = false;
    } else {
      this.isDeletePstn = true;
    }
    this.manageUserActionBtn(this.participantsPstn);
    this.displayAllRecord();

  }

  uncheckPstn(data) {
    this.uncheckPstnList = [];
    data['check'] = false;
    this.checkedPstnList = this.participantsPstn.filter(item => item.check != false);
    this.checkedPstnList.map(data => {
      if (data.check == true) {
        this.uncheckPstnList.push(data.id);
      }
    })
    if (this.checkedPstnList.length == 0) {
      this.isDeletePstn = true
    } else {
      this.isDeletePstn = false
    }
    this.manageUserActionBtn(this.participantsPstn);
    this.displayAllRecord();
  }

  checkExt(data) {
    for (let i = 0; i < this.participantsExt.length; i++) {
      if (this.participantsExt[i]['extension'] === data.extension) {
        this.participantsExt[i]['check'] = true;
        this.checkedExtList.push(data)
      }
    }
    if (this.checkedExtList.length > 0) {
      this.isDeleteExt = false;
    } else {
      this.isDeleteExt = true;
    }
    this.manageUserActionBtn2(this.participantsExt);
    this.displayAllRecord2();

  }

  uncheckExt(data) {
    this.uncheckExtList = [];
    data['check'] = false;
    this.checkedExtList = this.participantsExt.filter(item => item.check != false);
    this.checkedExtList.map(data => {
      if (data.check == true) {
        this.uncheckExtList.push(data.id);
      }
    })
    if (this.checkedExtList.length == 0) {
      this.isDeleteExt = true
    } else {
      this.isDeleteExt = false
    }
    this.manageUserActionBtn2(this.participantsExt);
    this.displayAllRecord2();
  }

  selectAllExt() {

    for (let i = 0; i < this.participantsExt.length; i++) {

      this.participantsExt[i]['check'] = true;
      this.checkedExtList.push(this.participantsExt[i]);
    }
    if (this.checkedExtList.length > 0) {
      this.isDeleteExt = false;
    } else {
      this.isDeleteExt = true;
    }
    this.manageUserActionBtn2(this.participantsExt);
    this.displayAllRecord2();



  }

  unselectAllExt() {

    for (let i = 0; i < this.participantsExt.length; i++) {

      this.participantsExt[i]['check'] = false;
      this.checkedExtList = [];
    }
    if (this.checkedExtList.length > 0) {
      this.isDeleteExt = false;
    } else {
      this.isDeleteExt = true;
    }
    this.manageUserActionBtn2(this.participantsExt);
    this.displayAllRecord2();

  }

  selectAllPstn() {

    for (let i = 0; i < this.participantsPstn.length; i++) {

      this.participantsPstn[i]['check'] = true;
      this.checkedPstnList.push(this.participantsPstn[i]);
    }
    if (this.checkedPstnList.length > 0) {
      this.isDeletePstn = false;
    } else {
      this.isDeletePstn = true;
    }
    this.manageUserActionBtn(this.participantsPstn);
    this.displayAllRecord();



  }

  unselectAllPstn() {

    for (let i = 0; i < this.participantsPstn.length; i++) {

      this.participantsPstn[i]['check'] = false;
      this.checkedPstnList = [];
    }
    if (this.checkedPstnList.length > 0) {
      this.isDeletePstn = false;
    } else {
      this.isDeletePstn = true;
    }
    this.manageUserActionBtn(this.participantsPstn);
    this.displayAllRecord();

  }

  resetAllExt() {
    for (let i = 0; i < this.participantsExt.length; i++) {
      this.participantsExt[i].dialed_status = 'Not started';
      this.participantsExt[i].tries = 0;
    }
    // this.reset = true;
    this.displayAllRecord2();
  }

  resetAnsweredExt() {
    for (let i = 0; i < this.participantsExt.length; i++) {
      if (this.participantsExt[i].dialed_status == 'Answered') {
        this.participantsExt[i].dialed_status = 'Not started';
        this.participantsExt[i].tries = 0;
      }
    }
    // this.reset = true;
    this.displayAllRecord2();
  }

  resetFailedExt() {
    for (let i = 0; i < this.participantsExt.length; i++) {
      if (this.participantsExt[i].dialed_status == 'Call Failed') {
        this.participantsExt[i].dialed_status = 'Not started';
        this.participantsExt[i].tries = 0;
      }
    }
    // this.reset = true;
    this.displayAllRecord2();
  }

  resetAllPstn() {
    for (let i = 0; i < this.participantsPstn.length; i++) {
      this.participantsPstn[i].dialed_status = 'Not started';
      this.participantsPstn[i].tries = 0;
    }
    // this.reset = true;
    this.displayAllRecord();
  }

  resetAnsweredPstn() {
    for (let i = 0; i < this.participantsPstn.length; i++) {
      if (this.participantsPstn[i].dialed_status == 'Answered') {
        this.participantsPstn[i].dialed_status = 'Not started';
        this.participantsPstn[i].tries = 0;
      }
    }
    // this.reset = true;
    this.displayAllRecord();
  }

  resetFailedPstn() {
    for (let i = 0; i < this.participantsPstn.length; i++) {
      if (this.participantsPstn[i].dialed_status == 'Call Failed') {
        this.participantsPstn[i].dialed_status = 'Not started';
        this.participantsPstn[i].tries = 0;
      }
    }
    // this.reset = true;
    this.displayAllRecord();
  }


  submitParticipants() {

    this.participantsExt.map(data => {
      this.participantsPstn.push(data);
    })

    let credentials = {};
    credentials['extension'] = this.participantsExt;
    credentials['pstn'] = this.participantsPstn;



    this.broadcastService.saveParticipants(this.participantsPstn).subscribe(data => {

      if (data.status_code = 200) {
        this.toastr.success('Success!', 'Updated Successfully', { timeOut: 2000 });
        this.dialogRef.close();
      } else {
        this.toastr.error('Error!', 'Something Went Wrong', { timeOut: 2000 });
      }
    })

  }

  exportToExcelExt() {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Lead', key: 'extension', width: 25 },
      { header: 'Attempts', key: 'tries', width: 25 },
      { header: 'Dial Status', key: 'dialed_status', width: 25 },
    ];

    worksheet.getRow(1).font = {
      bold: true,
    }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
    };
    for (let i = 0; i < this.exportDataExt.length; i++) {
      worksheet.addRow({
        contact: this.exportDataExt[i].extension,
        num_of_tires: this.exportDataExt[i].tries,
        dialed_status: this.exportDataExt[i].dialed_status,
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
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportDataExt.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'BroadcastExt');
    });
  }


  cancleDialog(): void {
    this.dialogRef.close();
  }
}