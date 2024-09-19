import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import {
  Errors,
  CommonService,
  ExcelService,
  Name_RegEx,
  Number_RegEx,
  Contact_RegEx,
  importSuccessfully,
  importUnsuccessfully,
  invalidFileType,
} from "../../core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { Page } from "../../core/models";
import { RatePlan } from "../../core/models/RatePlan.model";
import Swal from "sweetalert2";
import * as jsPDF from "jspdf";
import "jspdf-autotable";
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as FileSaver from "file-saver";
import { LimitData } from "@syncfusion/ej2-angular-inputs";
import { id } from "@swimlane/ngx-datatable/release/utils";
import { FormArray } from "@angular/forms";
import { PromptsService } from "../prompts/prompts.service";
import { ExtensionService } from "../extension/extension.service";
import { formError, agentError } from "../../core";
import { CallQueue } from "src/app/core/models/callqueue.model";
import { ContactListService } from "../contact-list/contact-list.service";
import { TeleConsultationService } from "../tele-consultation/tele-consultation.service";
import {
  CheckBoxSelectionService,
  FilteringEventArgs,
} from "@syncfusion/ej2-angular-dropdowns";
import { DidService } from "../DID/did.service";
import { Scheduler } from "rxjs-compat";
import { OBDService } from "./obd.service";
import { PackageService } from "../package/package.service";
import { FileUploader } from "ng2-file-upload/ng2-file-upload";
import { environment } from "../../../environments/environment.prod";

export var productId = "1";
const URL = environment.api_url + "uploadCsv/";
// const URL = 'http://localhost:3000/uploadCsv';

export let imagePath: any;
declare const ExcelJS: any;

@Component({
  selector: "app-obd",
  templateUrl: "./obd.component.html",
  styleUrls: ["./obd.component.css"],
})
export class ObdComponent implements OnInit {
  error = "";
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = "10";
  filterForm: FormGroup;
  filterObj: any = {};
  filter_list: any;
  globalRateList: any = "";
  user_id: any = "";
  isDelete: boolean = false;
  stop: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public teleConsultationService: TeleConsultationService,
    private obdService: OBDService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.user_id = localStorage.getItem("id");
    this.filterForm = this.fb.group({
      name: [""],
      by_schduler: [""],
    });

    this.obdService.displayAllRecord().subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 100 },
      { field: "name", headerName: "Name", width: 150, hide: false },
      {
        field: "schedule_time",
        headerName: "Scheduler Time",
        width: 200,
        hide: false,
      },
      {
        field: "scheduler_button",
        headerName: "Scheduler Action",
        width: 200,
        hide: false,
      },
    ];
    if (!this.isFilter) {
      this.obdService.getObdByCustomer(this.user_id).subscribe((datas) => {
        this.exportData = datas;
        datas = this.manageUserActionBtn(datas);
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data: datas });
      });
    } else {
      const credentials = this.filterForm.value;
      const cust_id = localStorage.getItem("id");
      credentials["cust_id"] = cust_id;
      this.obdService.getObdByFilter(credentials).subscribe((datas) => {
        datas = this.manageUserActionBtn(datas);
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data: datas });
      }),
        (err) => {
          this.error = err.message;
        };
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = "";
      let schedulerBtn = "";
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn +=
        "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn +=
        "<i class='fa fa-plus edit-button' style='cursor:pointer; display: inline' data-action-type='add' title='Add Contact'></i>";
      finalBtn +=
        "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline;' data-action-type='view' title='View'></i>";
      finalBtn += "</span>";

      schedulerBtn += "<span>";
      schedulerBtn +=
        "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='start' title='Start Schedular'>Start</button> ";
      schedulerBtn += "</span>";
      // }
      //  else if (data[i]['is_scheduler_type'] == '0' && data[i]['status'] == '1') { //schedular
      if (data[i].stop == "0") {
        schedulerBtn += "<span>";
        schedulerBtn +=
          "<button class='btn btn-sm btn-danger' style='cursor:pointer; display: inline' data-action-type='stop' title='Stop Schedular'>Stop</button> ";
        schedulerBtn += "</span>";
      } else {
        schedulerBtn += "<span>";
        schedulerBtn +=
          "<button class='btn btn-sm btn-danger' style='cursor:not-allowed; display: inline'  title='Stop Schedular'>Stop</button> ";
        schedulerBtn += "</span>";
      }
      if (data[i]["is_scheduler_type"] == "0") {
        //schedular
        schedulerBtn += "<p>" + "-" + "</p>";
      } else {
        schedulerBtn += "<p>" + data[i]["schedule_time"] + "</p>";
        // data[i]['description'] = finalBtn;
      }
      data[i]["scheduler_button"] = schedulerBtn;
      data[i]["action"] = finalBtn;
    }
    return data;
  }

  public startSchedular(event, status) {
    this.toastr.success("Success!", "Your request has been accepted", {
      timeOut: 2000,
    });
    this.obdService.getStatusOBD(event["id"]).subscribe((data) => {
      if (data.status == "1" || data.stop == "1") {
        this.toastr.error("Error!", "OBD is in progress already", {
          timeOut: 2000,
        });
      } else {
        let obj = {
          application: "call_obd",
          status: status,
          cust_id: localStorage.getItem("id").toString(),
          obd_id: event.id.toString(),
          token_id: localStorage.getItem("token").toString(),
        };
        this.obdService
          .partiallyUpdateOC({ status: status }, event["id"])
          .subscribe((data) => {
            this.displayAllRecord();
            this.obdService.startManualSchecular(obj).subscribe((data) => {});
          });
      }
    });
  }
  public stopSchedular(event, status) {
    this.toastr.error("Success!", "Your request has been accepted", {
      timeOut: 2000,
    });
    let id = event["id"];
    this.obdService.getStatusOBD(event["id"]).subscribe((data) => {
      let obj = {
        application: "call_obd",
        status: status,
        cust_id: localStorage.getItem("id").toString(),
        obd_id: event.id.toString(),
        token_id: localStorage.getItem("token").toString(),
      };
      this.obdService
        .partiallyUpdateOCStop({ status: status }, event["id"])
        .subscribe((data) => {
          this.displayAllRecord();
          // this.obdService.startManualSchecular(obj).subscribe((data) => {});
        });
    });
    setTimeout(() => {
      this.resetStop(id);
    }, 70000);
  }

  resetStop(id) {
    this.obdService
      .partiallyUpdateOCStop({ status: "0" }, id)
      .subscribe((data) => {
        this.displayAllRecord();
      });
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editOBD(data);
      case "delete":
        return this.deleteOBD(data);
      case "start":
        return this.startSchedular(data, "0");
      case "stop":
        return this.stopSchedular(data, "1");
      case "add":
        return this.addContact(data);
      case "view":
        return this.LivestatusOC(data);
    }
  }
  LivestatusOC(data) {
    this.livestatusDialog(data);
  }

  addContact(data) {
    this.importContactDialog(data);
  }

  deleteOBD(data) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'>You will not be able to recover OBD </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
        data.name +
        "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.obdService.deleteObd(data.id).subscribe(
          (data) => {
            this.displayAllRecord();
          },
          (err) => {
            this.error = err.message;
          }
        );
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html:
            "<span style='color:#FFFFFF;'> OBD </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.name +
            "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: "success",
          background: "#000000",
          timer: 2000,
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html:
            "<span style='color:#FFFFFF;'>OBD </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.name +
            "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: "error",
          background: "#000000",
          timer: 2000,
        });
      }
    });
  }

  editOBD(data: any) {
    this.openDialog(data);
  }

  addOBD() {
    this.openDialog(null);
  }

  importContactDialog(data?): void {
    const dialogRef = this.dialog.open(importContactDialog, {
      width: "200%",
      disableClose: true,
      data: data ? data : null,
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
  livestatusDialog(data?): void {
    const dialogRef = this.dialog.open(livestatusobdDialog, {
      width: "200%",
      disableClose: true,
      data: data ? data : null,
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddOBDDialog, {
      width: "200%",
      disableClose: true,
      data: data ? data : null,
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoDialog, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: {
        customerId:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
        extensionId:
          localStorage.getItem("type") == "6" ? localStorage.getItem("id") : 0,
      },
    });
    dialogRefInfo.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRefInfo.close("Dialog closed");
      }
    });
    dialogRefInfo.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }
}

@Component({
  selector: "livestatus-obd-dialog",
  templateUrl: "./livestatus-obd-dialog.html",
})
export class livestatusobdDialog implements OnInit {
  livecallForm: FormGroup;
  error = "";
  errors: Errors = { errors: {} };
  destination_list: any = [];
  dialog: any;
  isFilter = false;
  countryList = [];
  columnDefs2 = [];
  dataSource2 = [];
  rowData: any;
  defaultPageSize = "10";
  filter: any;
  constructor(
    public dialogRef: MatDialogRef<livestatusobdDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private obdService: OBDService
  ) {
    //   this.livecallForm = this.fb.group({
    //     'prompt': '',
    //  });
  }

  ngOnInit() {
    this.displayAllRecordd();
  }

  public displayAllRecordd() {
    this.columnDefs2 = [
      // { field: 'action', headerName: 'Action', hide: true, width: 100 },
      { field: "contact", headerName: "Lead", hide: false, width: 150 },
      {
        field: "num_of_tires",
        headerName: "Attempts",
        hide: false,
        width: 150,
      },
      {
        field: "dialed_status",
        headerName: "Dial Status",
        hide: false,
        width: 150,
      },
    ];
    // const credentials = this.livecallForm.value;
    // if(false){
    //   // this.OutboundService.getreportFilter(credentials,user_id).subscribe(data => {
    //   //   data = this.manageUserActionBtn(data);
    //   //   this.dataSource2 = [];
    //   //   this.dataSource2.push({ 'fields': this.columnDefs2, 'data': data })
    //   // })
    // }else{
    const user_id = localStorage.getItem("id");
    this.obdService.livecallforOBD(user_id, this.data.id).subscribe((datas) => {
      this.dataSource2 = [];
      this.dataSource2.push({ fields: this.columnDefs2, data: datas });
    }),
      (err) => {
        this.error = err.message;
      };
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
  selector: "addOBD-dialog",
  templateUrl: "./addOBD-dialog.html",
  providers: [CheckBoxSelectionService],
})
export class AddOBDDialog implements OnInit {
  imagePath1 = "";
  OBDForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = "";
  selectedConferenceValue = "";
  selectedQueueValue = "";
  sourceAgent: any[] = [];
  SIPFilter: any;
  filter: any;
  queueName = false;
  callqueueData: any = {};
  extList: any = {};
  errorField: any;
  welcomePrompt = 0;
  isShowPSTN: boolean = false;
  isShowExtension: boolean = false;
  contactGroupList: any = [];
  removable = true;
  selectable = true;
  selectedTeleConsultationValue: any = "";
  crad: any;
  selectPrompt = [];
  PromptFilter: any;
  filters: any;
  isCallerId: any;
  user_id: any;
  whatsapp_template: any;
  minDate: Date;
  minEndDate: Date;
  todayDate: Date;
  isShowSchedular: boolean = false;
  pageloader: boolean;
  contactList: any[] = [];
  groupList: any[] = [];
  activeFeature: any[] = [];
  valueData: any[] = [];
  public popupHeight: string = "200px";
  public popupWidth: string = "250px";
  public fields11: Object = { text: "prompt_name", value: "id" };
  public fields1: Object = { text: "category_name", value: "id" };
  public fields3: Object = { text: "agent", value: "id" };
  public fields: Object = { text: "feature", value: "id" };
  public fields4: Object = { text: "name", value: "id" };
  public fields2: Object = { text: "didDisplay", value: "id" };
  public mode: string = "CheckBox";
  public selectAllText: string = "Select All";
  pstnList: any[] = [];
  didList: any[] = [];
  ivrList: any[] = [];
  tempList: any[] = [];
  SMSList: any = [];
  checkedList: any[] = [];
  columnDefs2: any;
  dataSource2: any[];
  participantList: any[];
  uncheckList: any[];
  DIDFilter: any;
  filterDID: any;
  OBDData: any;
  dtmf_Selection: any;
  schedularType: any;
  schedular: any;
  showNotInsertedValue: any;
  imageSource1: any;
  excelValue: any = {};
  exportData: any = {};
  imageSource: any;
  statusCode: string = "";
  is_pstn: boolean = false;
  isDTMF: boolean = false;
  isIVR: boolean = false;
  is_ivr: boolean = false;
  edit: boolean = false;
  sms: boolean = false;
  afterDelete: boolean = false;
  iswhatsapp: boolean = false;
  isSMS: boolean = false;
  whatsapp: boolean = false;
  excel: boolean = false;

  recording: boolean = false;
  dtmf: boolean = false;
  isDelete: boolean = true;
  placeholder3 = "Select Prompt";
  placeholder5 = "DID as caller id*";
  is_sms_in_package: any;
  is_recording_in_package: any;
  is_whatsapp: any;
  isApi: boolean = false;
  apiIntegrationList: any[] = [];
  connection_type: boolean = false;
  credential: any = {}
  did_caller_id:any = []
  is_random_did: any;


  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: "file",
    allowedFileType: ["xls", "xlsx", "csv"],
    method: "post",
  });

  constructor(
    private changeRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddOBDDialog>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private extensionService: ExtensionService,
    private teleConsultationService: TeleConsultationService,
    private contactListService: ContactListService,
    private didService: DidService,
    private obdService: OBDService,
    private packageService: PackageService,
    public dialog: MatDialog
  ) {
    this.OBDForm = this.formBuilder.group({
      name: ["", Validators.required],
      welcome_prompt: [0],
      scheduler: ["1"],
      schedular_start_date: [""],
      caller_id_pstn: ["", Validators.required],
      sms: [""],
      recording: [""],
      dtmf: [""],
      dtmfSelection: [""],
      ivr_value: [""],
      add_contact: ["", Validators.pattern(Contact_RegEx)],
      prompt: [""],
      whatsapp: [""],
      whatsapp_temp: [""],
      provider: ["1"],
      api_integration: [""],
      sms_temp: [""],
      random_did: [""]
    });

    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
  }
  get name() {
    return this.OBDForm.get("name");
  }
  get welcome_prompt() {
    return this.OBDForm.get("welcome_prompt");
  }
  get ivr_value() {
    return this.OBDForm.get("ivr_value");
  }
  get schedular_start_date() {
    return this.OBDForm.get("schedular_start_date");
  }
  get caller_id_pstn() {
    return this.OBDForm.get("caller_id_pstn");
  }
  get contacts() {
    return this.OBDForm.get("contacts");
  }
  get prompt() {
    return this.OBDForm.get("prompt");
  }
  get add_contact() {
    return this.OBDForm.get("add_contact");
  }
  get whatsapp_temp() {
    return this.OBDForm.get("whatsapp_temp");
  }
  get sms_temp() {
    return this.OBDForm.get("sms_temp");
  }
  get api_integration() {
    return this.OBDForm.get("api_integration");
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
  ngAfterViewChecked(): void {
    this.changeRef.detectChanges();
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any =
      document.getElementsByClassName("mat-filter-input");
    matFilterInput && matFilterInput.length
      ? (matFilterInput[0].value = "")
      : "";
    this[key] = value;
  }

  ngOnInit() {
    this.mode = "CheckBox";
    this.selectAllText = "Select All";
    let d1 = new Date();
    this.user_id = localStorage.getItem("id");
    this.todayDate = new Date(d1);

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onWhenAddingFileFailed = (
      item: any,
      filter: any,
      options: any
    ) => {
      this.toastr.error(
        "Error!",
        "Invalid File Type, Only excel files are allowed, File type must be less than 1 mb",
        { timeOut: 2000 }
      );
    };
    this.uploader.onCompleteItem = (
      item: any,
      response: string,
      status: any,
      headers: any
    ) => {
      let aaa = JSON.parse(response);
      if (aaa["status_code"] == 200) {
        this.excelValue = aaa ? aaa.response : "";
        this.showNotInsertedValue = this.excelValue != "" ? true : false;
        imagePath = URL + item.file.name;
      } else if (aaa["err_code"]) {
        this.toastr.error("Error!", "Corrupted File", { timeOut: 2000 });
      } else if (aaa["error_code"]) {
        this.toastr.error("Error!", "Empty Excel File", { timeOut: 2000 });
      } else {
        this.toastr.error("Error!", "Duplicate Entry", { timeOut: 2000 });
      }
    };

    this.uploader.onCompleteAll = () => {
      this.credential.obd_id = this.excelValue[0];
      this.credential.customer_id = localStorage.getItem('id');
      this.obdService.updateGridList();      
      this.showNotInsertedValue = this.excelValue != '' ? true : false;
      if (this.showNotInsertedValue) {
        this.obdService.setDIDInObd(this.credential).subscribe(data => {          
        })
        this.toastr.success('Success!', importSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
      } else {
        this.toastr.error("Error!", importUnsuccessfully, { timeOut: 2000 });
      }
    };

    this.packageService
      .getPbxFeatures(Number(this.user_id), Number(productId))
      .subscribe((packageData) => {
        this.is_sms_in_package = packageData["response"][0].is_sms;
        this.is_recording_in_package = packageData["response"][0].recording;
        this.is_whatsapp = packageData["response"][0].whatsapp;
        this.is_ivr = packageData["response"][0].ivr;
      });

    this.promptsService
      .getBroadcastPrompt(localStorage.getItem("id"))
      .subscribe(
        (data) => {
          this.selectedTeleConsultationValue = data.response;

          this.filters = this.PromptFilter =
            this.selectedTeleConsultationValue.slice();
          if (this.selectedTeleConsultationValue.length > 0 && !this.data) {
            this.callqueueData.welcome_prompt =
              this.selectedTeleConsultationValue[0]["id"];
            //  this.OBDForm.get('welcome_prompt').setValue(this.selectedTeleConsultationValue[0]['id']) ;
            this.selectedTeleConsultationValue.unshift({
              id: 0,
              prompt_name: "Select ",
            });
          } else {
            // this.OBDForm.get('welcome_prompt').setValue(this.selectedTeleConsultationValue[0]['id']) ;
            this.selectedTeleConsultationValue.unshift({
              id: 0,
              prompt_name: "Select ",
            });
          }
        },
        (err) => {
          this.error = err.message;
        }
      );

    this.didService.getCustomerDID(this.user_id, "obd").subscribe((pagedData) => {
      this.didList = pagedData;      
      this.filterDID = this.DIDFilter = this.didList.slice();
    });

    this.obdService.getIVRForObd(this.user_id).subscribe((data) => {
      data.map((element) => {
        this.ivrList.push({ name: element.name, id: element.id });
      });
    });
    this.obdService.viewSMSActive(this.user_id).subscribe((data) => {
      data.map((element) => {
        this.SMSList.push({
          category_name: element.category_name,
          id: element.category_id,
        });
      });
    });

    this.obdService.getWhatsappTemp(this.user_id).subscribe((data) => {
      data.map((element) => {
        this.tempList.push({ name: element.name, id: element.id });
      });
    });

    if (this.data.id) {
      this.obdService.getApiIntegration(this.user_id).subscribe((item) => {
        item.map((value) => {
          this.apiIntegrationList.push({
            name: value.provider_name,
            id: value.id,
          });
        });
      });
      this.edit = true;
      this.obdService.getOdbById(this.data.id).subscribe((data1) => {
        this.OBDData = data1[0];

        this.dtmf_Selection = data1[0].dtmf_selection;
        this.sms = data1[0].is_sms == "1" ? true : false;
        if (this.sms == false) {
          this.SMSList = [];
        }

        this.recording = data1[0].recording == "1" ? true : false;
        this.whatsapp = data1[0].is_whatsapp == "1" ? true : false;
        setTimeout(() => {
          this.dtmf = data1[0].dtmf == "1" ? true : false;
          if (this.dtmf == true) {
            this.isDTMF = true;
          } else {
            this.isDTMF = false;
          }
          if (this.OBDData.dtmf_selection == 2) {
            this.isIVR = true;
          } else {
            this.isIVR = false;
          }
          if (this.OBDData.is_whatsapp == "1") {
            this.iswhatsapp = true;
          } else {
            this.iswhatsapp = false;
          }
          if (this.OBDData.is_sms == "1") {
            this.isSMS = true;
          } else {
            this.isSMS = false;
          }
          this.OBDForm.get("provider").setValue(
            data1[0]["call_connection_type"]
          );
          if (data1[0]["call_connection_type"] == 2) {
            this.OBDForm.get("api_integration").setValue(
              JSON.parse(data1[0]["provider_id"])
            );
            this.isApi = true;
          }
        }, 500);
        if (
          this.OBDData.is_scheduler_type == "1" ||
          this.OBDData.is_scheduler_type == 1
        ) {
          this.isShowSchedular = true;

          this.todayDate = data1[0].schedule_time ? data1[0].schedule_time : "";
        }
        this.OBDForm.get("name").setValue(data1[0].name);
        this.OBDForm.get("welcome_prompt").setValue(data1[0].prompt);
        setTimeout(() => {
          this.is_random_did = data1[0].callerid_as_random == 1 ? true : false
          this.OBDForm.get('random_did').setValue(data1[0].callerid_as_random == '1'? true : false);
          this.is_random_did == true ? this.did_caller_id = data1[0].DID_caller_id.split(',').map(Number) : this.OBDForm.get('caller_id_pstn').setValue(parseInt(data1[0].DID_caller_id));;          
          this.OBDForm.get('whatsapp_temp').setValue(parseInt(data1[0].whatsapp_template));
          if(data1[0].is_sms == '1') this.OBDForm.get('sms_temp').setValue(parseInt(data1[0].sms_temp));
          this.schedularType = data1[0].is_scheduler_type == '1' ? '1' : '0';
          if (data1[0].dtmf_selection == '2') {
            this.OBDForm.get('ivr_value').setValue(parseInt(data1[0].ivr_value));
          }
          this.OBDForm.get('dtmfSelection').setValue(data1[0]['dtmf_selection'])          
        }, 500);

        this.displayAllRecord();
      });
      this.obdService.getObdParticipants(this.data.id).subscribe((data) => {
        this.participantList = data;
        this.displayAllRecord();
      });
    } else {
      this.edit = false;
    }
  }

  submit() {
    this.crad = this.OBDForm.value;    
    if (this.crad.api_integration != null && this.crad.api_integration !="") {
      this.crad["api_name"] = this.apiIntegrationList.filter(item => item.id == this.OBDForm.value["api_integration"]).length ? this.apiIntegrationList.filter(item => item.id == this.OBDForm.value["api_integration"])[0]['name'] : [];      
    }
    if (this.crad.whatsapp == true) {
      this.crad["whatsApp_temp_name"] = this.tempList.filter(
        (item) => item.id == this.OBDForm.value["whatsapp_temp"]
      ).length
        ? this.tempList.filter(
            (item) => item.id == this.OBDForm.value["whatsapp_temp"]
          )[0]["name"]
        : [];
    }
    this.crad["welcome_prompt_name"] =
      this.selectedTeleConsultationValue.filter(
        (item) => item.id == this.OBDForm.value["welcome_prompt"]
      ).length
        ? this.selectedTeleConsultationValue.filter(
            (item) => item.id == this.OBDForm.value["welcome_prompt"]
          )[0]["prompt_name"]
        : [];
    this.crad["did_name"] = this.didList.filter(
      (item) => item.id == this.OBDForm.value["caller_id_pstn"]
    ).length
      ? this.didList.filter(
          (item) => item.id == this.OBDForm.value["caller_id_pstn"]
        )[0]["didDisplay"]
      : [];

    if (this.crad.dtmfSelection == 2) {
      this.crad["ivr_name"] = this.ivrList.filter(item => item.id == this.OBDForm.value["ivr_value"]).length ? this.ivrList.filter(item => item.id == this.OBDForm.value["ivr_value"])[0]['name'] : [];      
    }        
    this.credential.caller_id_pstn = this.crad.caller_id_pstn;
    delete this.crad.caller_id_pstn;
    this.credential.did_random = this.crad.random_did;
    delete this.crad.random_did;
    this.basicFile();
    this.uploader.uploadAll();
  }

  SMSTemplate(e) {
    let id = localStorage.getItem("id");
    if (e.checked == true) {
      this.isSMS = true;
      this.OBDForm.controls.sms_temp.setValidators(Validators.required);
      this.OBDForm.controls.sms_temp.updateValueAndValidity();
      this.obdService.viewSMSActive(id).subscribe((data) => {
        data.map((element) => {
          this.SMSList.push({
            category_name: element.category_name,
            id: element.category_id,
          });
        });
      });
    } else {
      this.isSMS = false;
      this.OBDForm.controls.sms_temp.reset();
      this.OBDForm.controls.sms_temp.clearValidators();
      this.OBDForm.controls.sms_temp.updateValueAndValidity();
      this.SMSList = [];
    }
  }
 
  whatsappSelectionn(e) {
    let id = localStorage.getItem("id");

    if (e.checked == true) {
      this.iswhatsapp = true;
      this.OBDForm.controls.whatsapp_temp.setValidators(Validators.required);
      this.OBDForm.controls.whatsapp_temp.updateValueAndValidity();
      this.obdService.getWhatsappTemp(id).subscribe((data) => {
        data.map((element) => {
          this.tempList.push({ name: element.name, id: element.id });
        });
      });
    } else {
      this.iswhatsapp = false;
      this.OBDForm.controls.whatsapp_temp.clearValidators();
      this.OBDForm.controls.whatsapp_temp.updateValueAndValidity();
    }
  }

  randomDID(e){    
    this.OBDForm.get('caller_id_pstn').reset();    
      this.OBDForm.controls.caller_id_pstn.updateValueAndValidity();
    this.is_random_did = e.checked
  }

  basicFile() {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append("customer_id", localStorage.getItem("id")); //note comma separating key and value
      form.append("role", localStorage.getItem("type"));
      form.append("id", null);
      form.append("type", "OBD");
      form.append("obdData", Object.values(this.crad));
    };
  }

  cancleDialog(): void {
    this.dialogRef.close();
  }

  getIvrList(event) {
    if (event.value == 2) {
      this.isIVR = true;
      this.OBDForm.controls.ivr_value.setValidators(Validators.required);
      this.OBDForm.controls.ivr_value.updateValueAndValidity();
    } else {
      this.isIVR = false;
      // this.ivrList = [];
      this.OBDForm.get("ivr_value").reset();
      this.OBDForm.controls.ivr_value.clearValidators();
      this.OBDForm.controls.ivr_value.updateValueAndValidity();
    }
  }

  public displayAllRecord() {
    this.columnDefs2 = [
      { field: "action", headerName: "Action", hide: false, width: 100 },
      { field: "contact", headerName: "Lead", hide: false, width: 150 },
      {
        field: "num_of_tires",
        headerName: "Attempts",
        hide: false,
        width: 150,
      },
      {
        field: "dialed_status",
        headerName: "Dial Status",
        hide: false,
        width: 150,
      },
    ];
    // if(this.afterDelete == false){
    // this.obdService.getObdParticipants(this.data.id).subscribe(data => {
    //   this.participantList = data;
    this.manageUserActionBtn(this.participantList);
    this.exportData = this.participantList;
    this.dataSource2 = [];
    this.dataSource2.push({
      fields: this.columnDefs2,
      data: this.participantList,
    });
    // })
    // }else{
    //   this.dataSource2 = [];
    //   this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.participantList });
    // }
  }

  exportToExcel() {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

    worksheet = workbook.addWorksheet("My Sheet", {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: "landscape", fitToPage: true },
    });
    worksheet.pageSetup.margins = {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    };
    worksheet.columns = [
      { header: "Lead", key: "contact", width: 25 },
      { header: "Attempts", key: "num_of_tires", width: 25 },
      { header: "Dial Status", key: "dialed_status", width: 25 },
    ];

    worksheet.getRow(1).font = {
      bold: true,
    };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    for (let i = 0; i < this.exportData.length; i++) {
      worksheet.addRow({
        contact: this.exportData[i].contact,
        num_of_tires: this.exportData[i].num_of_tires,
        dialed_status: this.exportData[i].dialed_status,
      });
    }
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = "1:2";
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, "obd");
    });
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = "";
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
      if (data[i]["check"] == true) {
        finalBtn += "<span>";
        finalBtn +=
          "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheck' title='Uncheck'></i>";
        finalBtn += "</span>";
      } else {
        finalBtn += "<span>";
        finalBtn +=
          "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='check' title='check'></i>";
        finalBtn += "</span>";
      }
      data[i]["action"] = finalBtn;
    }
    return data;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      // case "edit":
      //   return this.editParticipant(data);
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
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.afterDelete = true;
        for (let i = 0; i < this.checkedList.length; i++) {
          this.participantList = this.participantList.filter(
            (item) => item.contact != this.checkedList[i].contact
          );
        }
        this.participantList.map((item) => {
          if (item.check == true) {
            this.uncheckList.push(item.id);
          }
        });
        if (this.uncheckList.length > 0) {
          this.isDelete = false;
        } else {
          this.isDelete = true;
        }

        this.manageUserActionBtn(this.participantList);
        this.displayAllRecord();
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Leads has been deleted.</span>",
          type: "success",
          background: "#000000",
          timer: 2000,
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Leads are safe. </span>",
          type: "error",
          background: "#000000",
          timer: 2000,
        });
      }
    });
  }

  selectAll() {
    for (let i = 0; i < this.participantList.length; i++) {
      this.participantList[i]["check"] = true;
      this.checkedList.push(this.participantList[i]);
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }
    this.manageUserActionBtn(this.participantList);
    this.displayAllRecord();
  }

  unselectAll() {
    for (let i = 0; i < this.participantList.length; i++) {
      this.participantList[i]["check"] = false;
      this.checkedList = [];
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }
    this.manageUserActionBtn(this.participantList);
    this.displayAllRecord();
  }

  check(data) {
    for (let i = 0; i < this.participantList.length; i++) {
      if (this.participantList[i]["contact"] === data.contact) {
        this.participantList[i]["check"] = true;
        this.checkedList.push(data);
      }
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }
    this.manageUserActionBtn(this.participantList);
    this.displayAllRecord();
  }

  uncheck(data) {
    this.uncheckList = [];
    data["check"] = false;
    this.checkedList = this.participantList.filter(
      (item) => item.check != false
    );
    this.checkedList.map((data) => {
      if (data.check == true) {
        this.uncheckList.push(data.id);
      }
    });

    if (this.uncheckList.length > 0) {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }

    this.manageUserActionBtn(this.checkedList);
    this.displayAllRecord();
  }

  deleteParticipant(data) {
    this.uncheckList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'>You will not be able to recover lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
        data.contact +
        "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.afterDelete = true;
        for (let i = 0; i < this.participantList.length; i++) {
          if (this.participantList[i]["contact"] === data["contact"]) {
            this.participantList.splice(i, 1);

            if (this.uncheckList.length > 0) {
              this.isDelete = false;
            } else {
              this.isDelete = true;
            }

            this.manageUserActionBtn(this.participantList);
            this.displayAllRecord();
          }
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html:
            "<span style='color:#FFFFFF;'> Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.contact +
            "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: "success",
          background: "#000000",
          timer: 2000,
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html:
            "<span style='color:#FFFFFF;'>Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.contact +
            "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: "error",
          background: "#000000",
          timer: 2000,
        });
      }
    });
  }

  resetAll() {
    for (let i = 0; i < this.participantList.length; i++) {
      this.participantList[i].dialed_status = "Not started";
      this.participantList[i].num_of_tires = 0;
    }
    // this.reset = true;
    this.displayAllRecord();
  }

  resetAnswered() {
    for (let i = 0; i < this.participantList.length; i++) {
      if (this.participantList[i].dialed_status == "Answered") {
        this.participantList[i].dialed_status = "Not started";
        this.participantList[i].num_of_tires = 0;
      }
    }
    // this.reset = true;
    this.displayAllRecord();
  }

  resetFailed() {
    for (let i = 0; i < this.participantList.length; i++) {
      if (this.participantList[i].dialed_status == "Call Failed") {
        this.participantList[i].dialed_status = "Not started";
        this.participantList[i].num_of_tires = 0;
      }
    }
    // this.reset = true;
    this.displayAllRecord();
  }

  schedularChange(event) {
    let schedularValue = event.value;
    if (schedularValue == "0") {
      this.isShowSchedular = false;
      this.OBDForm.get("schedular_start_date").clearValidators();
      this.OBDForm.get("schedular_start_date").setValue("");
      this.OBDForm.updateValueAndValidity();
    } else {
      this.isShowSchedular = true;
      this.OBDForm.get("schedular_start_date").setValidators(
        Validators.required
      );
      this.OBDForm.updateValueAndValidity();
    }
  }

  DtmfSelectionn(data): void {
    if (data.checked) {
      this.isDTMF = true;
    } else {
      this.isDTMF = false;
      this.isIVR = false;
      // this.ivrList = [];
      this.OBDForm.get("dtmfSelection").reset();
      this.OBDForm.get("ivr_value").reset();
      this.OBDForm.get("ivr_value").clearValidators();
      this.OBDForm.get("ivr_value").updateValueAndValidity();
    }
  }

  count = 1;
  addContact() {
    let duplicate = 0;
    this.afterDelete = true;
    let number = this.OBDForm.get("add_contact").value;
    this.participantList.map((data) => {
      if (data.contact == number) {
        duplicate++;
      }
    });
    if (duplicate != 0) {
      this.toastr.error("Error!", "Contact Number already exists.", {
        timeOut: 2000,
      });
      return;
    } else {
      if (number != "") {
        this.participantList.push({ id: this.count++, contact: number });
        this.OBDForm.get("add_contact").setValue("");
        this.manageUserActionBtn(this.participantList);
        this.displayAllRecord();
      } else {
        this.toastr.error("Error!", "Invalid Number!", { timeOut: 2000 });
      }
    }
  }

  // addContact(){
  //   this.afterDelete = true;
  //   let number = this.OBDForm.get('add_contact').value;
  //   if(number != ""){
  //     this.participantList.push({ contact : number, id: null, obd_id: this.data.id});
  //     this.OBDForm.get('add_contact').reset();
  //     this.manageUserActionBtn(this.participantList)
  //     this.displayAllRecord();
  //   }else{
  //     this.toastr.error('Error!', "Invalid Number!", { timeOut: 2000 });
  //   }
  // }

  cancelForm() {
    this.OBDForm.reset();
    this.dialogRef.close();
  }

  submitOBDForm() {
    let credentials = this.OBDForm.value;

    if (this.data) {
      credentials["cust_id"] = localStorage.getItem("id");
      credentials["id"] = this.data.id;
      credentials["paricipants_list"] = this.participantList;
      this.obdService.updateObd(credentials).subscribe((data) => {
        if (data == 200) {
          this.toastr.success("Success!", "Updated Successfully", {
            timeOut: 2000,
          });
          this.cancelForm();
          this.obdService.updateGridList();
        } else {
          this.toastr.error("error!", "Duplicate", { timeOut: 2000 });
        }
      });
      // this.obdService.createObd(credentials).subscribe(data =>{
      //   if (data == 200) {
      //     this.toastr.success('Success!', 'Created Successfully', { timeOut: 2000 });
      //     this.cancelForm();
      //     this.obdService.updateGridList();

      //   }else{
      //     this.toastr.error('error!', 'Duplicate', { timeOut: 2000 });
      //   }

      // })
    }
  }

  openPrediction1() {
    this.excel = true;
  }

  downloadExcelSample(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    worksheet = workbook.addWorksheet("My Sheet", {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: {
        paperSize: 8,
        orientation: "landscape",
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
    });
    worksheet.pageSetup.margins = {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    };

    worksheet.columns = [{ header: "Number", key: "Number", width: 25 }];
    worksheet.getRow(1).font = {
      bold: true,
    };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    // for (let i = 0; i < this.exportData.length; i++) {
    worksheet.addRow({
      Name: "",
    });
    // }
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });

    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = "1:2";

    // let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(1));
    //this.excelService.exportAsExcelFile(arr, 'contactList');
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, "sample_obd");
    });
  }

  chooseApiOrGateway(e) {
    if (e.value == 2) {
      this.isApi = true;
      this.OBDForm.get("api_integration").setValidators(Validators.required);
      this.OBDForm.get("api_integration").updateValueAndValidity();
      this.obdService.getApiIntegration(this.user_id).subscribe((item) => {
        item.map((value) => {
          this.apiIntegrationList.push({
            name: value.provider_name,
            id: value.id,
          });
        });
      });
    } else {
      this.apiIntegrationList = [];
      this.isApi = false;
      this.OBDForm.get("api_integration").reset();
      this.OBDForm.get("api_integration").clearValidators();
      this.OBDForm.get("api_integration").updateValueAndValidity();
    }
  }

  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.apiIntegrationList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
}

@Component({
  selector: "info-dialog",
  templateUrl: "info-dialog.html",
})
export class InfoDialog {
  constructor(public dialogRefInfo: MatDialogRef<InfoDialog>) {}

  ngOnInit() {
    const element = document.querySelector("#scrollId");
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
    // e.preventDefault();
  }
}

@Component({
  selector: "import-contact-dialog",
  templateUrl: "./import-contact-dialog.html",
})
export class importContactDialog implements OnInit {
  error = "";
  submitted = false;
  errors: Errors = { errors: {} };
  importContactForm: FormGroup;
  feature_list: any;
  isEdit: boolean = false;
  isDelete: boolean = false;
  reset: boolean = false;
  errorField: any;
  dialog: any;
  planData: any;
  globalRateList: any = "";
  countryList = [];
  columnDefs2 = [];
  dataSource2 = [];
  participantList = [];
  contact: any;
  minutes: any;
  total_minutes: any;
  remaining_minutes: any;
  remaining_contact_minutes: any;
  showNotInsertedValue: any;
  imageSource1: any;
  excelValue: any = {};
  uncheckList: any[];
  checkedList: any[] = [];
  afterDelete: any;
  checkFile: boolean = false;
  defaultPageSize = "10";

  public fields: Object = { text: "name", value: "name" };
  public placeholder2: string = "Select Country";
  public popupHeight: string = "200px";
  public popupWidth: string = "250px";
  filter: any;
  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: "file",
    allowedFileType: ["xls", "xlsx", "csv"],
    method: "post",
  });

  constructor(
    public dialogRef: MatDialogRef<importContactDialog>,
    @Inject(MAT_DIALOG_DATA) public data,
    private router: Router,
    public teleConsultationService: TeleConsultationService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private obdService: OBDService
  ) {
    this.importContactForm = this.fb.group({
      prompt: "",
    });
  }

  ngOnInit() {
    this.obdService.displayAllRecord().subscribe(() => {
      this.displayAllRecord();
    });
    this.obdService.getObdParticipants(this.data.id).subscribe((data) => {
      this.participantList = data;
      this.displayAllRecord();
    });

    this.uploader.onAfterAddingFile = (file) => {
      this.checkFile = true;
      file.withCredentials = false;
    };
    this.uploader.onWhenAddingFileFailed = (
      item: any,
      filter: any,
      options: any
    ) => {
      this.toastr.error(
        "Error!",
        "Invalid File Type, Only excel files are allowed, File type must be less than 1 mb",
        { timeOut: 2000 }
      );
    };
    this.uploader.onCompleteItem = (
      item: any,
      response: string,
      status: any,
      headers: any
    ) => {
      let aaa = JSON.parse(response);

      if (aaa["status_code"] == 200) {
        this.excelValue = aaa.value ? aaa.value : "";
        this.showNotInsertedValue = this.excelValue != "" ? true : false;
        imagePath = URL + item.file.name;
      } else if (aaa["err_code"]) {
        this.toastr.error("Error!", "Corrupted File", { timeOut: 2000 });
      } else if (aaa["error_code"]) {
        this.toastr.error("Error!", "Empty Excel File", { timeOut: 2000 });
      } else {
        this.toastr.error("Error!", "Duplicate Entry", { timeOut: 2000 });
      }

      if (aaa["message"]) {
        this.toastr.error(
          "Duplicate!",
          aaa["message"] + " numbers are duplicate"
        );
      }
    };

    this.uploader.onCompleteAll = () => {
      this.obdService.updateGridList();
      // this.dialogRef.close();
      this.showNotInsertedValue = this.excelValue != "" ? true : false;
      if (!this.showNotInsertedValue) {
        this.toastr.success("Success!", importSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
      } else {
        this.toastr.error("Error!", importUnsuccessfully, { timeOut: 2000 });
      }
    };
  }

  public displayAllRecord() {
    this.columnDefs2 = [
      // { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: "contact", headerName: "Lead", hide: false, width: 150 },
      {
        field: "num_of_tires",
        headerName: "Attempts",
        hide: false,
        width: 150,
      },
      {
        field: "dialed_status",
        headerName: "Dial Status",
        hide: false,
        width: 150,
      },
    ];
    // if(this.reset == false){
    //   this.obdService.getObdParticipants(this.data.id).subscribe(data => {
    //     this.participantList = data;
    //     this.manageUserActionBtn(this.participantList);
    //     this.dataSource2 = [];
    //     this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.participantList });
    // })
    // }else{
    this.manageUserActionBtn(this.participantList);
    this.dataSource2 = [];
    this.dataSource2.push({
      fields: this.columnDefs2,
      data: this.participantList,
    });
    // }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = "";
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
      if (data[i]["check"] == true) {
        finalBtn += "<span>";
        finalBtn +=
          "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheck' title='Uncheck'></i>";
        finalBtn += "</span>";
      } else {
        finalBtn += "<span>";
        finalBtn +=
          "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='check' title='check'></i>";
        finalBtn += "</span>";
      }
      data[i]["action"] = finalBtn;
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
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.afterDelete = true;
        for (let i = 0; i < this.checkedList.length; i++) {
          this.participantList = this.participantList.filter(
            (item) => item.id != this.checkedList[i]
          );
        }
        this.participantList.map((item) => {
          if (item.check == true) {
            this.uncheckList.push(item.id);
          }
        });
        if (this.uncheckList.length > 0) {
          this.isDelete = false;
        } else {
          this.isDelete = true;
        }

        this.manageUserActionBtn(this.participantList);
        this.displayAllRecord();
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Leads has been deleted.</span>",
          type: "success",
          background: "#000000",
          timer: 2000,
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Leads are safe. </span>",
          type: "error",
          background: "#000000",
          timer: 2000,
        });
      }
    });
  }

  selectAll() {
    for (let i = 0; i < this.participantList.length; i++) {
      this.participantList[i]["check"] = true;
      this.checkedList.push(this.participantList[i]["id"]);
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }
    this.manageUserActionBtn(this.participantList);
    this.displayAllRecord();
  }

  unselectAll() {
    for (let i = 0; i < this.participantList.length; i++) {
      this.participantList[i]["check"] = false;
      this.checkedList = [];
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }
    this.manageUserActionBtn(this.participantList);
    this.displayAllRecord();
  }

  check(data) {
    for (let i = 0; i < this.participantList.length; i++) {
      if (this.participantList[i]["contact"] === data.contact) {
        this.participantList[i]["check"] = true;
        this.checkedList.push(data.id);
      }
    }
    if (this.checkedList.length > 0) {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }
    this.manageUserActionBtn(this.participantList);
    this.displayAllRecord();
  }

  uncheck(data) {
    this.uncheckList = [];
    data["check"] = false;
    this.checkedList = this.participantList.filter(
      (item) => item.id != data.id
    );
    this.checkedList.map((data) => {
      if (data.check == true) {
        this.uncheckList.push(data.id);
      }
    });
    if (this.uncheckList.length > 0) {
      this.isDelete = false;
    } else {
      this.isDelete = true;
    }
    this.manageUserActionBtn(this.checkedList);
    this.displayAllRecord();
  }

  deleteParticipant(data) {
    this.uncheckList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'>You will not be able to recover lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
        data.contact +
        "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.afterDelete = true;
        for (let i = 0; i < this.participantList.length; i++) {
          if (this.participantList[i]["contact"] === data["contact"]) {
            this.participantList.splice(i, 1);

            if (this.uncheckList.length > 0) {
              this.isDelete = false;
            } else {
              this.isDelete = true;
            }

            this.manageUserActionBtn(this.participantList);
            this.displayAllRecord();
          }
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html:
            "<span style='color:#FFFFFF;'> Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.contact +
            "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: "success",
          background: "#000000",
          timer: 2000,
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html:
            "<span style='color:#FFFFFF;'>Lead </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.contact +
            "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: "error",
          background: "#000000",
          timer: 2000,
        });
      }
    });
  }

  // resetAll(){
  //   for(let i = 0 ; i < this.participantList.length ; i++){
  //       this.participantList[i].dialed_status = 'Not started';
  //       this.participantList[i].num_of_tires = 0;
  //   }
  //   this.reset = true;
  //   this.displayAllRecord();
  // }

  // resetAnswered(){
  //   for(let i = 0 ; i < this.participantList.length ; i++){
  //     if(this.participantList[i].dialed_status == 'Success'){
  //       this.participantList[i].dialed_status = 'Not started';
  //       this.participantList[i].num_of_tires = 0;
  //     }
  //   }
  //   this.reset = true;
  //   this.displayAllRecord();
  // }

  // resetFailed(){
  //   for(let i = 0 ; i < this.participantList.length ; i++){
  //     if(this.participantList[i].dialed_status == 'Failed'){
  //       this.participantList[i].dialed_status = 'Not started';
  //     this.participantList[i].num_of_tires = 0;
  //     }
  //   }
  //   this.reset = true;
  //   this.displayAllRecord();
  // }
  cancleDialog(): void {
    this.dialogRef.close();
  }
  submit() {
    this.basicFile();
    this.uploader.uploadAll();
  }

  basicFile() {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append("customer_id", localStorage.getItem("id")); //note comma separating key and value
      form.append("role", localStorage.getItem("type"));
      form.append("id", null);
      form.append("type", "OBD");
      form.append("flag", true);
      form.append("obdId", this.data.id);
    };
  }

  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
}