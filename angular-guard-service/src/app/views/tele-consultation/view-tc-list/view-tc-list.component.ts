import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx, ZEROTOFIVE_RegEx } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { TeleConsultationService } from '../tele-consultation.service';
import { PromptsService } from '../../prompts/prompts.service';
import { ExtensionService } from '../../extension/extension.service';
import { formError, agentError } from '../../../core';
import { CallQueue } from 'src/app/core/models/callqueue.model';
import { ContactListService } from '../../contact-list/contact-list.service';
import { element } from 'protractor';
import { DidService } from '../../DID/did.service';
import { IVRService } from '../../smart_ivr/ivr.service';
import { Subscription } from 'rxjs';
import { BackendAPIIntegrationService } from 'src/app/core/services/backend-api-integration.service';
import { MinutePlanService } from '../../customer-minute-plan/customer-minute-plan.service';

@Component({
  selector: 'app-view-tc-list',
  templateUrl: './view-tc-list.component.html',
  styleUrls: ['./view-tc-list.component.css']
})
export class ViewTcListComponent implements OnInit {

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
  callerIdList: any = [];

  constructor(
    public teleConsultationService: TeleConsultationService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.filterForm = this.fb.group({
      'name': [""],
    });
    this.teleConsultationService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });


    this.teleConsultationService.getCallerId(localStorage.getItem('id')).subscribe(data=>{
      this.callerIdList = data.response;
      console.log(this.callerIdList,"----------");
      
    })

  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 20 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 30 },
      { field: 'ring_strategy', headerName: 'Ring Strategy', hide: false, width: 20 },
      { field: 'recordingDisplay', headerName: 'Recording', hide: false, width: 20 },
      //{ field: 'max_waiting_call', headerName: 'Max Waiting Call', hide: false, width: 20 },
      { field: 'periodicAnnouncementDisplay', headerName: 'Periodic Announcement', hide: false, width: 30 },
      { field: 'playPositionOnCallDisplay', headerName: 'Play Position On Call', hide: false, width: 30 },
    ];
    if (this.isFilter) {
      this.filterObj = this.filterForm.value
    } else {
      this.filterObj = {};
    }
    let customerId = Number(localStorage.getItem('type')) == 1 ? Number(localStorage.getItem('id')) : 0;
    this.teleConsultationService.getTC(this.filterObj, customerId).subscribe(pagedData => {
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
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";

      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editTC(data);
      case "delete":
        return this.deleteTC(data);
    }
  }



  editTC(data: any) {
    this.openDialog(data);
  }
  addTCPlan() {
    this.openDialog()
  }



  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddTCDialog, { width: '80%', disableClose: true, data: data ? data : null});
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
    // const dialogRefInfo = this.dialog.open(featurePlanInfoDialog, {
    //   width: '80%', disableClose: true, autoFocus: false,
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
    // });
  }

  deleteTC(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> TC in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.teleConsultationService.deleteTC({ id: event.id }).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                html: '<span style="color:#FFFFFF;"This feature is mapped with DID.</span>',
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
          html: "<span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> TC Package has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> TC Package has been deleted.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }
}

@Component({
  selector: 'addTC-dialog',
  templateUrl: './addTC-dialog.html'
})

export class AddTCDialog implements OnInit {
  TCForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = '';
  annTime: any;
  selectedMOHValue = "";
  selectedConferenceValue = "";
  selectedQueueValue = "";
  productFeatures = "";
  moh = 0;
  recording = 0;
  sourceAgent: any[] = [];
  prompt = 0;
  isPeriodicAnnouncementTime = false;
  isPlayPositionOnCall = false;
  queueName = false;
  maxWaitingcall: any = 0;
  callqueueData: any = {};
  extList: any = {};
  errorField: any;
  welcomePrompt = 0;
  isShowPSTN: boolean = false;
  isCallerId: boolean = false;
  isShowExtension: boolean = false;
  isContactSection: boolean = false;
  contactGroupList: any = [];
  TcPlans: any[] = [];
  removable = true;
  selectable = true;
  selectedContactList: any[] = [];
  selectedTeleConsultationValue = [];
  filterPrompt: any;
  filterMOH: any;
  activeFeature: any[] = [];
  filterFeature: any;
  activeFeatureValue: any[] = [];
  callerIdList: any[] = [];
  filterFeatureValue: any;
  selected = '15';
  checkedBundleMinute: boolean = false;
  public __UnauthorizedFailChangeSubscription: Subscription;
  public __active_featureChangeSubscription: Subscription;

  contactList: any[] = [];
  public placeholder: string = 'Select Extension';
  public placeholder2: string = 'Select PSTN';
  public placeholder3: string = 'Select Tc Package';
  public placeholder10: string = 'Welcome Prompt';
  public placeholder11: string = 'MOH';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public fields: Object = { text: 'agent', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  public fields3: Object = { text: 'name', value: 'id' };
  public fields4: Object = { text: 'did', value: 'did' };
  public fields10: Object = { text: 'prompt_name', value: 'id' };
  public fields11: Object = { text: 'prompt_name', value: 'id' };
  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';


  constructor(
    public dialogRef: MatDialogRef<AddTCDialog>, @Inject(MAT_DIALOG_DATA) public data: CallQueue,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private extensionService: ExtensionService,
    private teleConsultationService: TeleConsultationService,
    private contactListService: ContactListService,
    private didService: DidService,
    private ivrService: IVRService,
    private backendIntegrationService: BackendAPIIntegrationService,
    private minuteplanservice: MinutePlanService
    // private cdRef:ChangeDetectorRef
  ) {
    this.TCForm = this.formBuilder.group({
      'name': ['', Validators.required],
      // 'max_waiting_call': [0, Validators.required],
      'recording': [''],
      'welcome_prompt': ['', [Validators.required]],
      'moh': ['0'],
      'ring_strategy': ['0'],
      'periodic_announcement': [''],
      'periodic_announcement_time': [15],
      'periodic_announcement_prompt': ['0'],
      'play_position_on_call': [''],
      'play_position_periodically': [''],
      'is_extension': [''],
      'is_pstn': [''],
      'extension': [''],
      'pstn': [''],
      'group_id': [''],
      'user_ids': [''],
      'unauthorized_fail': [''],
      'active_feature': [''],
      'active_feature_value': [''],
      'free_time': [0, [Validators.pattern(ZEROTOFIVE_RegEx)]],
      'exhaust_announcement': [0, [Validators.pattern(ZEROTOFIVE_RegEx)]],
      'tc_caller_id': [''],
      'callerid': [''],
    });
  }
  get name() { return this.TCForm.get('name'); }
  // get max_waiting_call() { return this.TCForm.get('max_waiting_call'); }
  get extension() { return this.TCForm.get('extension'); }
  get pstn() { return this.TCForm.get('pstn'); }
  get unauthorized_fail() { return this.TCForm.get('unauthorized_fail'); }
  get active_feature() { return this.TCForm.get('active_feature'); }
  get active_feature_value() { return this.TCForm.get('active_feature_value'); }
  get free_time() { return this.TCForm.get('free_time'); }
  get exhaust_announcement() { return this.TCForm.get('exhaust_announcement'); }
  get welcome_prompt() { return this.TCForm.get('welcome_prompt'); }
  get callerid() { return this.TCForm.get('callerid'); }


  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  ngOnInit() {

    // this.annTime = [{ value: 15, id: 15 }, { id: 20 }, { id: 25 }];

    this.__UnauthorizedFailChangeSubscription = this.TCForm.get('unauthorized_fail').valueChanges.subscribe(data => {
      if (!data) {
        this.TCForm.get('active_feature').setValue('');
        this.TCForm.get('active_feature_value').setValue('');
        this.TCForm.get("active_feature").clearValidators();
        this.TCForm.get("active_feature_value").clearValidators();
        this.TCForm.get('active_feature').updateValueAndValidity();
        this.TCForm.get('active_feature_value').updateValueAndValidity();
      } else {
        this.TCForm.get('active_feature').setValidators(Validators.required);
        this.TCForm.get('active_feature').updateValueAndValidity();
      }
    });

    this.__active_featureChangeSubscription = this.TCForm.get('active_feature').valueChanges.subscribe(data => {

      if (!data) {
        this.TCForm.get("active_feature_value").clearValidators();
        this.TCForm.get('active_feature_value').updateValueAndValidity();
      } else {
        let obj = {
          value: data
        }
        this.getValueOfActiveFeature(obj);
        this.TCForm.get('active_feature_value').setValue('');
        this.TCForm.get('active_feature_value').setValidators(Validators.required);
        this.TCForm.get('active_feature_value').updateValueAndValidity();
      }
    });

    this.teleConsultationService.getCallerId(localStorage.getItem('id')).subscribe(data=>{
      this.callerIdList = data.response;
      console.log(this.callerIdList,"----------");
      
    })

    this.TCForm.controls.periodic_announcement_time.disable();
    this.TCForm.controls.play_position_periodically.disable();
    this.getActiveFeatures();
    //showing moh and recording
    this.commonService.getCustomerProductFeatures(localStorage.getItem('id')).subscribe(data => {
      this.productFeatures = data.response[0];
      this.welcomePrompt = (data.response[0].custom_prompt == '1') ? 1 : 0;
      this.moh = (data.response[0].custom_prompt == '1' && data.response[0].music_on_hold == '1') ? 1 : 0;
      this.recording = data.response[0].storage == '0' ? 0 : data.response[0].recording;
      this.prompt = data.response[0].custom_prompt == '1' ? 1 : 0;
    }, err => {
      this.error = err.message;
    });

    //get moh from prompt
    this.promptsService.getMOHPrompt(localStorage.getItem('id')).subscribe(data => {
      this.selectedMOHValue = data.response;
    }, err => {
      this.error = err.message;
    });

    //get conference from prompt
    this.promptsService.getConferencePrompt(localStorage.getItem('id')).subscribe(data => {
      this.selectedConferenceValue = data.response;
    }, err => {
      this.error = err.message;
    });
    //get queue from prompt
    this.promptsService.getQueuePrompt(localStorage.getItem('id')).subscribe(data => {
      this.selectedQueueValue = data.response;
    }, err => {
      this.error = err.message;
    });

    //get tele-consultation from prompt
    this.promptsService.getTeleConsultationPrompt(localStorage.getItem('id')).subscribe(data => {
      this.selectedTeleConsultationValue = data.response;
      // this.selectedTeleConsultationValue.unshift({ id: 0, prompt_name: "default" });

      this.filterPrompt = this.selectedTeleConsultationValue.slice();
      this.filterMOH = this.selectedTeleConsultationValue.slice();
      if (this.selectedTeleConsultationValue.length > 0) this.TCForm.get('moh').setValue(this.TCForm[0]['id']);



    }, err => {
      this.error = err.message;
    });

    //add agent
    //  await this.getMyExtensions();
    this.loadData();


    //ADD User(PSTN)
    this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, 'customer_id': Number(localStorage.getItem('id')), 'extension_id': 0, 'role': Number(localStorage.getItem('type')) }).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.contactList.push({ id: data[i].id, name: data[i].name, agent: data[i].name + ' - ' + data[i].phoneNumber1Display });
      }
    }, err => {
      this.error = err.message;
    });

    // get contact group list
    let customerId = localStorage.getItem('id');
    this.contactListService.getContactGroups(customerId)
      .subscribe(data => {
        this.contactGroupList = data;
      }, err => {
        this.error = err.message;
      });
    // if (this.data) {
    //   // this.getSingleTC();

    // } else {
    //   this.callqueueData.moh = 0;
    //   this.callqueueData.periodic_announcement_time = "15";
    // }
    this.teleConsultationService.getTCPlan({}, customerId).subscribe(data => {

      for (let i = 0; i < data.response.length; i++) {
        this.TcPlans.push({ id: data['response'][i].id, name: data['response'][i].name, agent: data['response'][i].name + '-' + data['response'][i].price });
      }
    }, err => {
      this.error = err.message;
    });

    this.minuteplanservice.viewCustomerBundlePlan({customer_id: Number(customerId)}).subscribe((data) => {      
      if(data.length){
        this.checkedBundleMinute = true;
      }
    })
  }
  Promptremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedTeleConsultationValue.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  async loadData() {
    new Promise((resolve, reject) => {
      this.extensionService.getMyExtension(localStorage.getItem('id')).subscribe(data => {
        this.extList = data.response;
        for (let i = 0; i < data.response.length; i++) {
          this.sourceAgent.push({ id: data.response[i].id, agent: data.response[i].ext_number + '-' + data.response[i].caller_id_name });
        }
        resolve("Promise Resolved");
      }, err => {
        this.error = err.message;
        reject(this.error);
      });
    }).then((success) => {
      if (this.data) {
        this.getSingleTC();
      } else {
        this.callqueueData.moh = 0;
        this.callqueueData.periodic_announcement_time = "15";
      }
    })
      .catch((error) => {
        console.log(error);
      });
  }

  public getSingleTC() {
    this.teleConsultationService.getSingleTC(this.data.id).subscribe(data => {
      data = data.response
      this.callqueueData = data[0];
      // this.TCForm.get('extension').setValue([67259, 67260])


      this.callqueueData.callerid_as_DID = this.callqueueData.callerid_as_DID == 0 ? false : true;
      // this.maxWaitingcall = data[0].max_waiting_call ;
      this.callqueueData.welcome_prompt = this.callqueueData.welcome_prompt == 0 ? '0' : Number(this.callqueueData.welcome_prompt);
      this.callqueueData.periodic_announcement_prompt = this.callqueueData.periodic_announcement_prompt == 0 ? '0' : this.callqueueData.periodic_announcement_prompt;
      this.callqueueData.active_feature = this.callqueueData.active_feature == 2 ? '2a' : this.callqueueData.active_feature;
      this.callqueueData.active_feature_value = this.callqueueData.active_feature_value == 0 ? '' : this.callqueueData.active_feature_value;
      if (data[0].periodic_announcement == 1) {
        this.TCForm.controls.periodic_announcement_time.enable();
        this.isPeriodicAnnouncementTime = true;
      } else {
        this.TCForm.controls.periodic_announcement_time.disable();
        this.isPeriodicAnnouncementTime = false;
      }
      if (this.callqueueData.periodic_announcement_time == 15) {
        this.callqueueData.periodic_announcement_time = "15";
      } else if (this.callqueueData.periodic_announcement_time == 30) {
        this.callqueueData.periodic_announcement_time = "30";
      } else if (this.callqueueData.periodic_announcement_time == 60) {
        this.callqueueData.periodic_announcement_time = "60";
      } else if (!this.callqueueData.periodic_announcement_time) {
        this.callqueueData.periodic_announcement_time = "15";
      }

      

      if (data[0].play_position_on_call == 1) {
        this.TCForm.controls.play_position_periodically.enable();
        this.isPlayPositionOnCall = true;
      } else {
        this.TCForm.controls.play_position_periodically.disable();
        this.isPlayPositionOnCall = false;
      }

      if (data[0].is_extension == '1') {
        this.callqueueData.is_extension = true;
        this.TCForm.get('is_extension').setValue('1');
        this.isShowExtension = true;
      } else {
        this.callqueueData.is_extension = false;
        this.TCForm.get('is_extension').setValue('0');
      }
      if (data[0].is_pstn == '1') {
        this.callqueueData.is_pstn = true;
        this.TCForm.get('is_pstn').setValue('1');
        this.isShowPSTN = true;
        this.isCallerId = true;
      } else {
        this.isCallerId = false;
        this.callqueueData.is_pstn = false;
        this.TCForm.get('is_pstn').setValue('0');
      }
      // contacts data
      let usersId = (data[0].ref_id).split(",");
      let usersType = (data[0].ref_type).split(",");
      var extensionList = [];
      var pstnList = [];
      var usersList = [];
      setTimeout(() => {
        usersId.forEach((element1, i) => {
          usersType.forEach((element2, j) => {
            if (i === j) {
              if (element2 == 'E') {
                extensionList.push(Number(element1));
              } else if (element2 == 'P') {
                pstnList.push(Number(element1));
              } else {
                usersList.push(Number(element1));
              }
            }
          });
        });
        setTimeout(() => {
          this.callqueueData.extension = extensionList ? extensionList : '';
          this.callqueueData.pstn = pstnList ? pstnList : '';
          this.callqueueData.userList = usersList ? usersList : '';
        }, 500);
        this.callqueueData.user_ids = this.TcPlans ? this.TcPlans : '';
      }, 200);
    }, err => {
      this.error = err;
    });
  }

  public getMyExtensions() {
    this.extensionService.getMyExtension(localStorage.getItem('id')).subscribe(data => {
      this.extList = data.response;
      for (let i = 0; i < data.response.length; i++) {
        this.sourceAgent.push({ id: data.response[i].id, agent: data.response[i].ext_number + '-' + data.response[i].caller_id_name });
      }


    }, err => {
      this.error = err.message;
    });
  }



  public getActiveFeatures() {
    this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(data => {
      // this.activeFeature.push({ id: '0', feature: 'Select Feature' });
      if (data[0].call_group == '1') {
        this.activeFeature.push({ id: '5', feature: 'Call Group' });
        this.filterFeature = this.activeFeature.slice();
      }
      // if (data[0].ivr == '1') {
      //   this.activeFeature.push({ id: '2a', feature: 'IVR' });
      //   this.filterFeature = this.activeFeature.slice();

      // }

      // if (data[0].queue == '1') {
      //   this.activeFeature.push({ id: '4', feature: 'Queue' });
      //   this.filterFeature = this.activeFeature.slice();

      // }
      this.activeFeature.push({ id: '1', feature: 'SIP' });
      this.filterFeature = this.activeFeature.slice();

      // if (data[0].queue == '1') {
      //   this.activeFeature.push({ id: '6', feature: 'Voicemail' });
      //   this.filterFeature = this.activeFeature.slice();

      // }
    }, err => {
      console.log(err);
    });
  }

  getValueOfActiveFeature(e) {
    let action = e.value;
    if (action) {
      this.ivrService.getIVRAction({ user_id: localStorage.getItem('id'), action: action }).subscribe(data => {
        this.activeFeatureValue = data.response;
        this.filterFeatureValue = this.activeFeatureValue.slice();
      });
    }
  }


  submitTCForm() {
    let isPSTN = this.TCForm.get('pstn').value ? (this.TCForm.get('pstn').value).length > 0 ? true : false : false;
    let isExtn = this.TCForm.get('extension').value ? (this.TCForm.get('extension').value).length > 0 ? true : false : false;
    if (!isPSTN && !isExtn) {
      this.toastr.error('Error!', 'Please select at least one Consultant', { timeOut: 2000 });
      return;
    }
    if ((!this.TCForm.get('user_ids').value || (this.TCForm.get('user_ids').value == '0') || ((this.TCForm.get('user_ids').value).length == '0'))) {
      this.toastr.error('Error!', 'Please select at least one Tc Package', { timeOut: 2000 });
      return;
    }
    // this.checkForm = this.findInvalidControls();
    if (this.TCForm.valid) {
      this.submitted = true;
      const credentials = this.TCForm.value;
      credentials.active_feature = credentials.active_feature == '2a' ? '2' : credentials.active_feature;
      credentials.is_pstn = this.TCForm.get('pstn').value ? (this.TCForm.get('pstn').value).length > 0 ? true : false : false;
      credentials.is_extension = this.TCForm.get('extension').value ? (this.TCForm.get('extension').value).length > 0 ? true : false : false;
      credentials.active_feature = Number(credentials.active_feature)
      credentials.exhaust_announcement = Number(credentials.exhaust_announcement)
      credentials.free_time = Number(credentials.free_time)
      credentials.periodic_announcement_time = Number(credentials.periodic_announcement_time) 
      credentials.ring_strategy = Number(credentials.ring_strategy)
      credentials.active_feature_value = Number(credentials.active_feature_value)
      if (this.data) {
        credentials.id = Number(this.data.id);
        credentials.customerId = Number(localStorage.getItem('type')) == 1 ? Number(localStorage.getItem('id')) : 0;
        // let reformattedArray = this.TCForm.get('user_ids').value.map(obj => {
        //   return obj
        // })
        // credentials.user_ids = reformattedArray;
        this.teleConsultationService.updateTC(credentials).subscribe((data) => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            let obj = {
              application: "callcenter",
              action: "update", //update
              que_typ: "tc",
              id: (this.data.id).toString()
            }
            this.backendIntegrationService.createAPIintegration(obj).subscribe(res => {
            });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        })

      } else {
        credentials.customerId = Number(localStorage.getItem('type')) == 1 ? Number(localStorage.getItem('id')) : 0;
        // let reformattedArray = credentials.user_ids.map(obj => {
        //   return obj.contact_id;
        // })
        // credentials.user_ids = reformattedArray;
        // credentials['free_time'] = parseInt(credentials['free_time']);
        // credentials['exhaust_announcement'] = parseInt(credentials['exhaust_announcement']);

        this.teleConsultationService.addTC(credentials).subscribe((data) => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            let obj = {
              application: "callcenter",
              action: "add", //create
              que_typ: "tc",
              id: ""
            }
            this.backendIntegrationService.createAPIintegration(obj).subscribe(res => {
            });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        })

      }
    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.TCForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancelForm() {
    this.TCForm.reset();
    // this.callqueueService.updateGridList();
    this.dialogRef.close();
  }

  showPeriodicAnnouncement(event) {
    let periodicAnnouncement = event.checked;
    if (periodicAnnouncement == true) {
      this.TCForm.controls.periodic_announcement_time.enable();
      this.isPeriodicAnnouncementTime = true;
    } else {
      this.TCForm.controls.periodic_announcement_time.disable();
      this.isPeriodicAnnouncementTime = false;
    }
  }

  showPlayPositionOnCall(event) {
    let playPositionOnCall = event.checked;
    if (playPositionOnCall == true) {
      this.TCForm.controls.play_position_periodically.enable();
      this.isPlayPositionOnCall = true;
    } else {
      this.TCForm.controls.play_position_periodically.disable();
      this.isPlayPositionOnCall = false;
    }
  }

  getPackageByProduct(data) {
    if (data.source.value == 1 && data.checked) {
      this.isShowExtension = true;
      this.TCForm.get('extension').setValidators(Validators.required)
    } else if (data.source.value == 1 && !data.checked) {
      this.isShowExtension = false;
      this.TCForm.get('extension').clearValidators()
      this.TCForm.get('extension').setValue([]);
    }
    else if (data.source.value == 2 && data.checked) {
      this.isShowPSTN = true;
      this.isCallerId = true;
      this.TCForm.get('pstn').setValidators(Validators.required)
      this.TCForm.get('callerid').setValidators(Validators.required)
    } else if (data.source.value == 2 && !data.checked) {
      this.TCForm.get('pstn').clearValidators()
      this.TCForm.get('callerid').clearValidators()
      this.isShowPSTN = false;
      this.isCallerId = false;
      this.TCForm.get('pstn').setValue([]);
      this.TCForm.get('callerid').setValue([]);
    }
  }

  // groupSelect(data){
  //   this.contactListService.getAllContactInGroup(data.value).subscribe(data => {
  //     this.GroupsContacts = data;
  //   }, err => {
  //     this.error = err.message;
  //   });
  // }


  // contactSelect(data) {
  //   let contacts: any[] = data.value;
  //   // this.selectedContactList = [];
  //   contacts.forEach(element => {
  //     var is_contact_exist: any = true;
  //     const index = this.selectedContactList.indexOf(element);
  //     this.selectedContactList.forEach(element2 => {
  //       if (element2.contact_id === element.contact_id) {
  //         is_contact_exist = false;
  //         return false;
  //       }
  //     })
  //     if (index == -1 && is_contact_exist) {
  //       this.selectedContactList.push(element);
  //       this.TCForm.get('user_ids').setValue(this.selectedContactList)
  //     }
  //   });
  // }

  // remove(contact: string): void {
  //   const index = this.selectedContactList.indexOf(contact);
  //   if (index >= 0) {
  //     this.selectedContactList.splice(index, 1);
  //   }
  // }

  ngOnDestroy(): void {
    this.__UnauthorizedFailChangeSubscription.unsubscribe(); // nagender
    this.__active_featureChangeSubscription.unsubscribe(); // nagender

  }
}