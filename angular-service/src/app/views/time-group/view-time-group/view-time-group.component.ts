import { Component, OnInit, Inject } from '@angular/core';
import { TimeGroupService } from '../time-group.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, errorMessage, formError, timeGroupUpdated, uniqueName, Name_RegEx, minTime } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { PromptsService } from '../../prompts/prompts.service';
import { Subscription } from 'rxjs';
import { DidService } from '../../DID/did.service';
import { IVRService } from '../../smart_ivr/ivr.service';
import { ChangeDetectorRef, AfterContentChecked } from '@angular/core';


export interface TimeGroup {
  id: string,
  customerId: number,
  extensionId: number
}

@Component({
  selector: 'app-view-time-group',
  templateUrl: './view-time-group.component.html',
  styleUrls: ['./view-time-group.component.css']
})
export class ViewTimeGroupComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  filterForm: FormGroup;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  maxDate: Date;
  customerId: any;
  extensionId: any;
  bsValue = new Date();
  bsRangeValue: Date[];
  todayDate = new Date();
  defaultPageSize = '10';
  // public fields: Object = { text: 'name', value: 'id' };
  // public placeholder: string = 'Value';
  // public popupHeight: string = '200px';
  // public popupWidth: string = '250px';


  constructor(
    private cdref: ChangeDetectorRef,
    private fb: FormBuilder,
    private timegroupService: TimeGroupService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public commonService: CommonService,
    public didService: DidService

  ) {
    this.maxDate = new Date();
    this.todayDate.setDate(this.todayDate.getDate() + 0);
    this.bsRangeValue = [this.bsValue, this.todayDate];

    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_range': [""],
      'by_custom': [""],
    });
  }

  ngAfterContentChecked() {

    this.cdref.detectChanges();

  }

  ngOnInit() {
    this.timegroupService.setPage.subscribe(() => {
      this.setPage();
    });

  }

  setPage() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 20 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 20 },
      { field: 'time_start', headerName: 'Start Time', hide: false, width: 15 },
      { field: 'time_finish', headerName: 'Finish Time', hide: false, width: 15 },
      { field: 'month_day_start_finish', headerName: 'Start-Finish Date', hide: false, width: 25 },
      { field: 'monthStartFinish', headerName: 'Month Start-Finish', hide: false, width: 25 },
      { field: 'holidayDisplay', headerName: 'Holiday', hide: false, width: 15 },
      { field: 'schedule_weekly_custom', headerName: 'Custom', hide: false, width: 30 },


    ];

    if (localStorage.getItem('type') == '1') {
      this.customerId = localStorage.getItem('id');
      this.extensionId = 0;
    } else {
      this.customerId = 0;
      this.extensionId = localStorage.getItem('id');
    }


    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.timegroupService.filterTimeGroup(credentials, Number(localStorage.getItem('id')), Number(localStorage.getItem('type'))).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.timegroupService.viewTimeGroup({ id: null, name: null, 'customer_id': Number(this.customerId), 'extension_id': Number(this.extensionId), 'role': Number(localStorage.getItem('type')) }).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    }
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
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
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editTimeGroup(data);
      case "delete":
        return this.deleteTimeGroup(data);
    }
  }

  editTimeGroup(event) {
    this.openDialog(event.id);
  }

  deleteTimeGroup(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Time Group </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.timegroupService.deleteTimeGroup({ id: event.id }).subscribe(data => {
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
          html: "<span style='color:#FFFFFF;'> Time Group </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Time Group </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(TimeGroupDialog,
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

  resetTable() {
    this.isFilter = false;
    this.setPage();
  }

  filterData() {
    this.isFilter = true;
    this.setPage();
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoTimeGroupDialog, {
      width: '80%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
        extensionId: localStorage.getItem('type') == '6' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRefInfo.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefInfo.close('Dialog closed');
      }
    });
    dialogRefInfo.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }
}



@Component({
  selector: 'infoTimeGroup-dialog',
  templateUrl: 'infoTimeGroup-dialog.html',
})

export class InfoTimeGroupDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoTimeGroupDialog>, @Inject(MAT_DIALOG_DATA) public data: TimeGroup,
  ) { }

  ngOnInit() {

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      document.getElementsByTagName("app-website-nav")[0].scrollIntoView();
    });
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'timegroup-dialog',
  templateUrl: 'timegroup-dialog.html',
})

export class TimeGroupDialog {
  startTime: any;
  finishTime: Date;
  minDate: Date;
  maxDate: Date;
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  promptFilter = [];
  selectedValue = "";
  weekDays: any[] = [];
  selectedWeek: any;
  showCustom = false;
  data_date: Date;
  endTimeValue: any;
  checkForm: any;
  sessionId = "";
  timeGroupData: any = {};
  weekly_custom = "";
  monthDayStartFinish: Date[];
  public weekArr = [];
  addPar: any = {};
  arrP = [];
  selectedWeekDays: any[] = [];
  timeGroupName = "";
  formInValid = false;
  errorField = '';
  monthStartDay: any;
  monthFinishDay: any;
  bsValue = new Date();
  bsRangeValue: Date[];
  currDate = new Date();
  selectedPromptValue: any = []
  TimeFilter: any;
  filterPrompt: any;
  featurePrompt: any = '';
  month_day_start_finish_Display: any = '';
  public __startFinishDateChangeSubscription;
  count = 0;
  activeFeature: any[] = [];
  timegroupfilter: any = [];
  filterFeature: any;
  allFilterFeature: any;
  allFilterValue: any;
  activeFeatureValue: any[] = [];
  ValueFilterArray = [];
  filter: any;
  obj: any;
  WelcomePrompt: any;
  public __failoverDestinationChangeSubscription: Subscription;
  public __active_featureChangeSubscription: Subscription;
  activeFeature_value: number;
  timeGroupForm: FormGroup;
  isFailover: boolean = false;
  checkmsg: boolean = false;
  checkfeature: boolean = false;
  public fields: Object = { text: 'prompt_name', value: 'id' };
  public placeholder: string = 'Welcome Prompt';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public fields2: Object = { text: 'feature', value: 'id' };
  public fields3: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Feature';
  public placeholder3: string = 'Time Group Prompt';
  // public autoreactiveplaceholder: String = "Select book";



  constructor(
    public dialogRef: MatDialogRef<TimeGroupDialog>, @Inject(MAT_DIALOG_DATA) public data: TimeGroup,
    private timeGroupService: TimeGroupService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private didService: DidService,
    private ivrService: IVRService
  ) {
    this.startTime = new Date();
    this.finishTime = new Date();
    this.minDate = new Date();
    this.maxDate = new Date();
    this.currDate.setDate(this.currDate.getDate() + 0);
    this.bsRangeValue = [this.bsValue, this.currDate];

    this.timeGroupForm = this.fb.group({
      'name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'description': [''],
      'time_finish': ['', Validators.required],
      'time_start': ['', Validators.required],
      'month_day_start_finish': [''],
      'sch_duration': ['', Validators.required],
      'sch_weekly': ['', Validators.required],
      'schedule_weekly_custom': [''],
      'schedule_weekly_custom_value': [''],
      'holidays': [''],
      'prompt': [''],
      'failover_destination': [''],
      'active_feature': ['', Validators.required],
      'active_feature_value': ['', Validators.required]

    });
  }

  get name() { return this.timeGroupForm.get('name'); }
  get sch_duration() { return this.timeGroupForm.get('sch_duration'); }
  get sch_weekly() { return this.timeGroupForm.get('sch_weekly'); }
  get time_start() { return this.timeGroupForm.get('time_start'); }
  get time_finish() { return this.timeGroupForm.get('time_finish'); }
  get failover_destination() { return this.timeGroupForm.get('failover_destination'); }
  get active_feature() { return this.timeGroupForm.get('active_feature'); }
  get active_feature_value() { return this.timeGroupForm.get('avtive_feature_value'); }


  // timeGroupDataremovedspace(event){
  //   const timespace = event.text.trim()
  //   const tomefilterData = this


  // }



  ngOnInit() {
    this.timeGroupService.setPage.subscribe(() => { });

    this.timeGroupForm.get('active_feature').setValue('');
    this.timeGroupForm.get('active_feature_value').setValue('');
    this.timeGroupForm.get("active_feature").clearValidators();
    this.timeGroupForm.get("active_feature_value").clearValidators();
    this.timeGroupForm.get('active_feature').updateValueAndValidity();
    this.timeGroupForm.get('active_feature_value').updateValueAndValidity();

    this.getActiveFeatures();
  }

  public getActiveFeatures() {
    this.customInit();
    this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(data => {

      if (data[0].call_group == '1') {
        this.activeFeature.push({ id: '5', feature: 'Call Group' });
        this.filterFeature = this.allFilterFeature = this.activeFeature.slice();
      }

      if (data[0].queue == '1') {
        this.activeFeature.push({ id: '4', feature: 'Queue' });
        this.filterFeature = this.allFilterFeature = this.activeFeature.slice();
      }

      this.activeFeature.push({ id: '1', feature: 'SIP' });
      this.filterFeature = this.allFilterFeature = this.activeFeature.slice();

      if (data[0].queue == '1') {
        this.activeFeature.push({ id: '6', feature: 'Voicemail' });
        this.filterFeature = this.allFilterFeature = this.activeFeature.slice();
      }

      this.activeFeature.push({ id: '8', feature: 'Enterprise PSTN' });

      this.filterFeature = this.allFilterFeature = this.activeFeature.slice();


    }, err => {
      console.log(err);
    });
  }

  customInit() {

    let user_type = localStorage.getItem('type');
    this.startTime = this.startTime.getHours() + ':' + (this.startTime.getMinutes());
    this.endTime(this.finishTime);
    this.timeGroupForm.controls.schedule_weekly_custom.disable();
    this.timeGroupForm.controls.schedule_weekly_custom_value.disable();
    this.arrP = [];

    //showing moh and recording
    if (user_type == '6') {
      this.commonService.getExtensionFeatures(localStorage.getItem('id')).subscribe(data => {
        this.featurePrompt = data.response[0].custom_prompt == '1' ? 1 : 0;
      }, err => {
        this.errors = err.message;
      });
    } else {
      this.commonService.getCustomerProductFeatures(localStorage.getItem('id')).subscribe(data => {
        this.featurePrompt = data.response[0].custom_prompt == '1' ? 1 : 0;
      }, err => {
        this.errors = err.message;
      });
    }

    if (user_type == '6') {
      this.promptsService.getTimeGroupPromptForExtn(localStorage.getItem('id')).subscribe(data => {
        if (data.response && this.featurePrompt == 1) {
          this.selectedPromptValue = data.response;
        } else if (this.featurePrompt == 0) {
          this.selectedPromptValue.unshift({ prompt_name: 'default', id: '0' });
        } else {
          this.selectedPromptValue = [];
        }
        this.filterPrompt = this.TimeFilter = this.selectedPromptValue.slice();
        if (!this.data.id) {
          if (this.selectedPromptValue.length > 0) this.timeGroupForm.get('prompt').setValue(this.selectedPromptValue[0]['id']);
          this.filterPrompt = this.TimeFilter = this.selectedPromptValue.slice();

        }
      }, err => {
        this.errors = err.message;
      });
    }

    else {


      this.promptsService.getTimeGroupPrompt(localStorage.getItem('id')).subscribe(data => {
        setTimeout(() => {
          // this.selectedPromptValue = data.response ? this.featurePrompt == 1 ? data.response : this.selectedPromptValue : [];
          if (data.response && this.featurePrompt == 1) {
            this.selectedPromptValue = data.response;
          }
          else if (this.featurePrompt == 0) {
            this.selectedPromptValue.unshift({ prompt_name: 'default', id: '0' });
          } else {
            this.selectedPromptValue = [];
          }
          this.filterPrompt = this.TimeFilter = this.selectedPromptValue.slice();

          if (!this.data.id) {
            if (this.selectedPromptValue.length > 0) this.timeGroupForm.get('prompt').setValue(this.selectedPromptValue[0]['id']);
            this.filterPrompt = this.TimeFilter = this.selectedPromptValue.slice();
          }
        }, 200);
      }, err => {
        this.errors = err.message;
      });
    }

    if (this.data.id) {
      setTimeout(() => {

        this.timeGroupService.viewTimeGroup({ id: this.data.id, name: null, 'customer_id': Number(this.data['customerId']), 'extension_id': Number(this.data['extensionId']), 'role': Number(localStorage.getItem('type')) }).subscribe(data => {

          this.timeGroupData = data[0];
          setTimeout(() => {

            this.WelcomePrompt = data[0].prompt_id;
          }, 500);
          this.timeGroupData.failover_destination = this.timeGroupData.failover_destination == "1" ? true : false;
          this.timeGroupForm.get('active_feature').setValue(this.timeGroupData.active_feature);
          if (this.timeGroupData.active_feature) {
            this.isFailover = true;
            this.obj = {
              value: this.timeGroupData.active_feature
            }
            this.getValueOfActiveFeature(this.obj);



          } else {
            this.isFailover = false;
          }
          this.timeGroupName = data[0].name;
          this.timeGroupData.prompt_id = this.timeGroupData.prompt_id == 0 ? '0' : this.timeGroupData.prompt_id;
          this.monthDayStartFinish = data[0].month_day_start_finish ? data[0].month_day_start_finish : this.minDate;
          this.month_day_start_finish_Display = data[0].month_day_start_finish_Display;
          this.startTime = data[0].time_start;
          this.endTimeValue = data[0].time_finish;
          this.weekly_custom = data[0].schedule_weekly;
          this.activeFeature_value = parseInt(this.timeGroupData['active_feature_value']);

          this.monthStartDay = this.newVal(data[0].month_start_day);
          this.monthFinishDay = this.newVal(data[0].month_finish_day);
          this.timeGroupData['monthlyDateRange'] = [this.monthStartDay, this.monthFinishDay];
          if (this.weekly_custom == '3') {
            this.showCustom = true;
            this.timeGroupForm.controls.schedule_weekly_custom.enable();
            this.timeGroupForm.controls.schedule_weekly_custom_value.enable();
          } else {
            this.showCustom = false;
            this.timeGroupForm.controls.schedule_weekly_custom.disable();
            this.timeGroupForm.controls.schedule_weekly_custom_value.disable();
          }
          // Custom value
          this.addPar = data;
          for (let i = 0; i < this.addPar.length; i++) {
            var res12 = this.addPar[i].schedule_weekly_custom.split(",");
          }

          for (let j = 0; j < res12.length; j++) {
            this.weekDays.push({ label: res12[j], value: res12[j] });
            this.arrP.push({ label: res12[j], value: res12[j] });
          }

          this.selectedWeek = res12;
          this.selectedWeekDays = [];
          this.weekDays.map(item => this.selectedWeekDays.push(item.value));
          let mergeArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          let mergeJs = [];
          for (let i = 0; i < mergeArr.length; i++) {
            mergeJs.push({ label: mergeArr[i], value: mergeArr[i] });
          }
          for (let j = 0; j < this.arrP.length; j++) {
            for (let i = 0; i < mergeJs.length; i++) {
              if (this.arrP[j].value == mergeJs[i].value) {
                mergeJs.splice(i, 1);
              }
            }
          }

          mergeJs.map(item => this.weekDays.push(item));

        }, err => {
          this.errors = err.message;
        });
      }, 1000);

    } else {
      this.timeGroupData['schedule_duration'] = '0';
      this.timeGroupData['schedule_weekly'] = '0';
    }
  }

  newVal(val) {
    let split = val.split('/');
    return [split[1], split[0], split[2]].join('/');
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  schWeekly(e) {
    let mykeyword = e.value;
    if (mykeyword == '3') {
      this.showCustom = true;
      this.timeGroupForm.controls.schedule_weekly_custom.enable();
      this.selectedWeekDays = [];
      this.timeGroupForm.controls.schedule_weekly_custom_value.enable();
      this.checkDate();
    } else {
      this.showCustom = false;
      this.timeGroupForm.controls.schedule_weekly_custom.disable();
      this.timeGroupForm.controls.schedule_weekly_custom_value.disable();
    }
  }

  endTime(value: Date): void {
    // this.data_date = value;
    // this.data_date.setMinutes(this.data_date.getMinutes() + 15);
    this.data_date = new Date(value.getTime() + 59 * 60000);
    let data_date2 = this.data_date.getHours() + ':' + (this.data_date.getMinutes());
    this.endTimeValue = data_date2;
  }

  onTimeSelect(e) {
    var initialDate = e;
    var theAdd = new Date(1900, 0, 1, initialDate.split(":")[0], initialDate.split(":")[1]);
    theAdd.setMinutes(theAdd.getMinutes() + 300);
    let setFinTime = theAdd.getHours() + ":" + theAdd.getMinutes();
    this.endTimeValue = setFinTime;
  }

  promptremovedspace(event) {

    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.selectedPromptValue.filter((data) => {
      return data['prompt_name'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }



  submitTimeGroupForm() {
    if (this.checkmsg == true || this.checkfeature == true) {
      if (this.timeGroupForm.get('active_feature').value == '') {
        this.toastr.error('Error!', 'feature can not be null', { timeOut: 2000 });
        return;
      }
      else if (this.timeGroupForm.get('active_feature_value').value == '' || this.timeGroupForm.get('active_feature_value').value == null) {
        this.toastr.error('Error!', 'value can not be null', { timeOut: 2000 });
        return;
      }
    }

    const credentials = this.timeGroupForm.value;
    if (credentials['sch_weekly'] == '3' && !credentials['schedule_weekly_custom'].length) {//custom
      this.toastr.error('Error!', 'Please select at least one weekday', { timeOut: 2000 });
      return;
    }

    this.checkForm = this.findInvalidControls();



    if (!this.data.id) {


      if (this.timeGroupForm.valid) {
        this.submitted = true;
        this.errors = { errors: {} };
        credentials.role = Number(localStorage.getItem('type'));
        let d1 = credentials.month_day_start_finish;
        let d2 = d1[0].getDate() + "/" + (d1[0].getMonth() + 1) + "/" + d1[0].getFullYear();
        let d3 = d1[1].getDate() + "/" + (d1[1].getMonth() + 1) + "/" + d1[1].getFullYear();
        if (d2 == d3) {
          if (credentials.time_start >= credentials.time_finish) {
            this.toastr.error('Error!', minTime, { timeOut: 2000 });
            return;
          }
        }
        credentials.customer_id = Number(this.data['customerId']);
        credentials.extension_id = Number(this.data['extensionId']);
        credentials.id = Number(this.data.id) ? Number(this.data.id) : null;
        this.timeGroupService.viewTimeGroup({ 'id': credentials.id, 'name': credentials.name, 'customer_id': Number(this.data['customerId']), 'extension_id': Number(this.data['extensionId']), 'role': Number(localStorage.getItem('type')) }).subscribe(data => {
          if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
            this.timeGroupForm.controls['name'].setValue('');
            this.timeGroupName = "";
          } else {

            credentials.feature_name = this.activeFeatureValue.filter(item => item.id == credentials.active_feature_value).length ? this.activeFeatureValue.filter(item => item.id == credentials.active_feature_value)[0]['name'] : [];
            this.timeGroupService.createTimeGroup('createTimeGroup', credentials)
              .subscribe(data => {
                if (data['code'] == 200) {
                  this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                  this.timeGroupForm.reset();
                  this.timeGroupService.updateGridList();
                  this.dialogRef.close();
                }
                else {
                  this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                }
              });
          }
        });
      } else {
        this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
      }
    } else {
      this.timeGroupForm.get("month_day_start_finish").clearValidators();
      this.timeGroupForm.get('month_day_start_finish').updateValueAndValidity();
      if (this.timeGroupForm.valid) {
        this.submitted = true;
        this.errors = { errors: {} };
        credentials.role = Number(localStorage.getItem('type'));
        let d1 = credentials.month_day_start_finish;
        let d2 = d1[0];
        let d3 = d1[1];
        if (d2 == d3) {
          if (credentials.time_start >= credentials.time_finish) {
            this.toastr.error('Error!', minTime, { timeOut: 2000 });
            return;
          }
        }
        let failover = this.timeGroupForm.get('failover_destination').value
        let activeFeature = this.timeGroupForm.get('active_feature').value
        let featureValue = this.timeGroupForm.get('active_feature_value').value
        if (failover && activeFeature) {
          if (!featureValue) {
            this.toastr.error('Error!', 'value cant be null', { timeOut: 2000 });
            return;
          }
        }



        credentials.customer_id = Number(this.data['customerId']);
        credentials.extension_id = Number(this.data['extensionId']);
        credentials.id = Number(this.data.id) ? Number(this.data.id) : null;
        this.timeGroupService.viewTimeGroup({ 'id': credentials.id, 'name': credentials.name, 'customer_id': Number(this.data['customerId']), 'extension_id': Number(this.data['extensionId']), 'role': Number(localStorage.getItem('type')) }).subscribe(data => {
          if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
            this.timeGroupForm.controls['name'].setValue('');
            this.timeGroupName = "";
          } else {
            this.timeGroupService.createTimeGroup('createTimeGroup', credentials)
              .subscribe(data => {
                if (data['code'] == 200) {
                  this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                  this.timeGroupForm.reset();
                  this.timeGroupService.updateGridList();
                  this.dialogRef.close();
                }
                else {
                  this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                }
              });
          }
        });
      }
    }
  }

  checkDate() {
    let ar = this.timeGroupForm.get('month_day_start_finish').value;
    let from = ar[0].length == 1 ? new Date(this.monthStartDay) : new Date(ar[0]);
    let to = ar[1].length == 1 ? new Date(this.monthFinishDay) : new Date(ar[1]);
    this.weekDays = [];
    this.selectedWeek = [];
    var date1 = new Date(from);
    var date2 = new Date(to);

    // To calculate the time difference of two dates
    var Difference_In_Time = date2.getTime() - date1.getTime();// To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    // To calculate the days name between two dates
    var d = new Date(from),
      a = [],
      y = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    while (d < to) {
      a.push(y[d.getDay()]);
      d.setDate(d.getDate() + 1);
    }
    if (d.getDay() === to.getDay())// include last day
      a.push(y[d.getDay()]);

    if (Difference_In_Days <= 6) {
      for (let i = 0; i < a.length; i++) {
        this.weekDays.push({ label: a[i], value: a[i] });
      }
    } else {
      for (let i = 0; i < y.length; i++) {
        this.weekDays.push({ label: y[i], value: y[i] });
      }
    }
  }

  selectedOption() {
    let partArr = [];
    let str = [];
    str = this.timeGroupForm.controls['schedule_weekly_custom'].value;
    for (let i = 0; i < str.length; i++) {
      partArr.push(str[i]);
    }
    this.selectedWeek = partArr;
  }

  public onstartFinishValueChange(event) {
    if (this.count > 1 && this.data.id) {
      if (event) {
        let type = this.timeGroupForm.get('sch_weekly').value;
        if (type == '3') {
          this.selectedWeekDays = [];
          this.checkDate();
          this.timeGroupForm.get('schedule_weekly_custom').setValidators(Validators.required);
          this.timeGroupForm.get('schedule_weekly_custom').updateValueAndValidity();
        } else {
          this.timeGroupForm.get('schedule_weekly_custom').clearValidators();
          this.timeGroupForm.get('schedule_weekly_custom').updateValueAndValidity();
        }
      }
    } else if (this.count > 0 && this.data.id == null) {
      if (event) {
        let type = this.timeGroupForm.get('sch_weekly').value;
        if (type == '3') {
          this.selectedWeekDays = [];
          this.checkDate();
          this.timeGroupForm.get('schedule_weekly_custom').setValidators(Validators.required);
          this.timeGroupForm.get('schedule_weekly_custom').updateValueAndValidity();
        } else {
          this.timeGroupForm.get('schedule_weekly_custom').clearValidators();
          this.timeGroupForm.get('schedule_weekly_custom').updateValueAndValidity();
        }
      }
    }
    this.count++;
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.timeGroupForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }


  getValueOfActiveFeature(e) {
    let action = e.value;
    if (action) {
      setTimeout(() => {

        this.ivrService.getIVRAction({ user_id: localStorage.getItem('id'), action: action }).subscribe(data => {
          this.activeFeatureValue = data.response;

          // this.filter = this.activeFeatureValue.slice();
          this.filter = this.allFilterValue = this.activeFeatureValue.slice();

          if (action == 5 && this.data.id) {
            this.activeFeatureValue = this.activeFeatureValue.filter(item => item.id != this.data.id)
          }
        });
      }, 200);

    }
  }

  onChangeFailoverDestination(e) {
    this.checkmsg = false;
    this.checkfeature = false;
    if (e.checked == "false" || e.checked == false) {
      this.activeFeatureValue = [];
      this.isFailover = false;
      this.timeGroupForm.get('active_feature').setValue('');
      this.timeGroupForm.get('active_feature_value').setValue('');
      this.timeGroupForm.get("active_feature").clearValidators();
      this.timeGroupForm.get("active_feature_value").clearValidators();
      this.timeGroupForm.get('active_feature').updateValueAndValidity();
      this.timeGroupForm.get('active_feature_value').updateValueAndValidity();
    } else {
      this.checkmsg = true;
      this.checkfeature = true;

      this.isFailover = true;
      this.timeGroupForm.get('active_feature').setValidators(Validators.required);
      this.timeGroupForm.get('active_feature').updateValueAndValidity();
      this.timeGroupForm.get('active_feature_value').setValidators(Validators.required);
      this.timeGroupForm.get('active_feature_value').updateValueAndValidity();
    }
  }


  onChangeActiveFeature(e) {
    this.activeFeatureValue = [];
    this.timeGroupForm.get('active_feature_value').setValue('');
    // if(this.timeGroupForm.get(this.activeFeature) === null){
    //       this.timeGroupForm.get(this.activeFeatureValue) === null
    //      }
    if (!e.value) {

      this.timeGroupForm.get("active_feature_value").clearValidators();
      this.timeGroupForm.get('active_feature_value').updateValueAndValidity();

    } else {
      this.checkfeature = true;
      let obj = {
        value: e.value
      }
      // this.activeFeatureValue = [];


      this.getValueOfActiveFeature(obj);

      this.timeGroupForm.get('active_feature_value').setValue('');
      this.timeGroupForm.get('active_feature_value').setValidators(Validators.required);
      this.timeGroupForm.get('active_feature_value').updateValueAndValidity();
    }
  }
  // test(value,key) {
  //   const matFilterInput:any = document.getElementsByClassName("mat-filter-input");
  //   (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
  //   this[key] = this.allFilterFeature[value];
  //   this[key] = this.TimeFilter[value];
  //   this[key] = this.allFilterValue[value];
  // }
  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }
  // testValue() {
  //   const matFilterInput:any = document.getElementsByClassName("mat-filter-input");
  //   (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
  //   this.filter = this.allFilterValue
  // }

  timeGroupDataremovedspace(event) {
    const timespace = event.text.trim().toLowerCase();
    const timefilterData = this.activeFeature.filter((data: any) => {
      return data['feature'].toLowerCase().includes(timespace);
    })
    event.updateData(timefilterData);
  }
  valueremovedspace(event) {
    const valuespace = event.text.trim().toLowerCase();
    const valuefilter = this.activeFeatureValue.filter((data) => {
      return data['name'].toLowerCase().includes(valuespace);
    })
    event.updateData(valuefilter);
  }

}
