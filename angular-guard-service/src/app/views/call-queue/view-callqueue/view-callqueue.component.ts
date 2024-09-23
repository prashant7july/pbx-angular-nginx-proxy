import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CallqueueService } from '../callqueue.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { CallQueue } from '../../../core/models/callqueue.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PromptsService } from '../../prompts/prompts.service';
import { ExtensionService } from '../../extension/extension.service';
import { CommonService, formError, agentError } from '../../../core';
import { DidService } from '../../DID/did.service';
import { IVRService } from '../../smart_ivr/ivr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-callqueue',
  templateUrl: './view-callqueue.component.html',
  styleUrls: ['./view-callqueue.component.css']
})

export class ViewCallqueueComponent implements OnInit {
  error = '';
  isFilter = false;
  filterForm: FormGroup;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  defaultPageSize = '10';

  constructor(private router: Router,
    private fb: FormBuilder,
    private callqueueService: CallqueueService,
    private toastr: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog,
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_feedback_call': [""],
    });
  }

  ngOnInit() {
    this.callqueueService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 30 },
      { field: 'ring_strategy', headerName: 'Ring Strategy', hide: false, width: 20 },
      { field: 'recordingDisplay', headerName: 'Recording', hide: false, width: 20 },
      // { field: 'max_waiting_call', headerName: 'Max Waiting Call', hide: false, width: 20 },
      // { field: 'periodicAnnouncementDisplay', headerName: 'Periodic Announcement', hide: false, width: 30 },
      // { field: 'playPositionOnCallDisplay', headerName: 'Play Position On Call', hide: false, width: 30 },

    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.callqueueService.filterCallQueuelist(credentials, Number(localStorage.getItem('id'))).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.callqueueService.viewCallqueue({ id: null, name: null, 'customer_id': Number(localStorage.getItem('id')) }).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
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
        return this.editData(data);
      case "delete":
        return this.deleteData(data);
    }
  }


  editData(event) {
    this.openDialog(event.id);
  }

  deleteData(event) {
    this.callqueueService.getCallQueueCount(event.id).subscribe(data => {
      if (data.response > 0) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'>Call queue </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> can't be deleted because it is associate with DID Destination or call queue.",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      } else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html: "<span style='color:#FFFFFF;'>You will not be able to recover call queue </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.callqueueService.deleteCallQueue({ 'id': event.id }).subscribe(data => {
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
              html: "<span style='color:#FFFFFF;'>Call queue </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 2000
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html: "<span style='color:#FFFFFF;'>Call queue </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe!</span>",
              type: 'error',
              background: '#000000',
              timer: 2000
            });
          }
        })
      }
    })
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(CallqueueDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
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
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCallQueueDialog, {
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
      console.log('Dialog closed');
    });
  }
}

@Component({
  selector: 'infoCallQueue-dialog',
  templateUrl: 'infoCallQueue-dialog.html',
})

export class InfoCallQueueDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCallQueueDialog>, @Inject(MAT_DIALOG_DATA) public data: CallQueue,
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
  selector: 'callqueue-dialog',
  templateUrl: 'callqueue-dialog.html',
})

export class CallqueueDialog {
  callqueueForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = '';
  selectedMOHValue: any = [];
  filters: any;
  MOHFilter: any;
  selectedConferenceValue = "";
  selectedQueueValue = [];
  promptfilter: any = [];
  filterselect: any;
  Welcomefilter: any;
  selectedIVRValue: any = [];
  filter: any;
  IVRFilter: any;
  productFeatures = "";
  moh = 0;
  recording = 0;
  sourceAgent: any[] = [];
  targetAgent: any[] = [];
  prompt = 0;
  isPeriodicAnnouncementTime = false;
  isPlayPositionOnCall = false;

  queueName = false;
  maxWaitingcall: any = 0;
  callqueueData: any = {};
  extList: any = {};
  errorField: any;
  welcomePrompt = 0;
  feedbackCall = 0;
  stickyAgent = 0;
  isSMS = 0;
  activeFeature: any[] = [];
  activeFeatureValue: any[] = [];
  isPlayPosition = false;
  stickyExpire = [];
  feedback_IVR: any;
  // public htmlAttributes = { name: "prompt_name", placeholder: "MOH", title: "DropDownList" };
  public fields: Object = { text: 'prompt_name', value: 'id' };
  public fields2: Object = { text: 'prompt_name', value: 'id' };
  public fields3: Object = { text: 'name', value: 'id' };
  public fields4: Object = { text: 'date', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder4: string = 'Welcome Prompt';
  public placeholder: string = 'MOH';
  public placeholder2: string = 'FeedBack IVR';
  public placeholder3: string = 'Expiry Date';


  public __feedbackCallChangeSubscription;
  public __stickyAgentCallChangeSubscription;
  public __UnauthorizedFailChangeSubscription: Subscription;
  public __active_featureChangeSubscription: Subscription;
  stickyData = '1';


  constructor(
    public dialogRef: MatDialogRef<CallqueueDialog>, @Inject(MAT_DIALOG_DATA) public data: CallQueue,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private extensionService: ExtensionService,
    private callqueueService: CallqueueService,
    private didService: DidService,
    private ivrService: IVRService,
  ) {
    this.callqueueForm = this.formBuilder.group({
      'name': ['', Validators.required],
      // 'max_waiting_call': ['0'],
      'recording': [''],
      'welcome_prompt': ['0'],
      'moh': ['0'],
      'ring_strategy': ['0'],
      'periodic_announcement': [''],
      'periodic_announcement_time': ['15'],
      'periodic_announcement_prompt': ['0'],
      'play_position_on_call': [''],
      'play_position_periodically': [''],
      'feedback_call': [''],
      'feedback_ivr': [''],
      'sticky_agent': [''],
      'sticky_agent_type': [''],
      'sms': [''],
      'unauthorized_fail': [''],
      'active_feature': [''],
      'active_feature_value': [''],
      'sticky_expire': ['', [Validators.required]],
    });
  }
  get name() { return this.callqueueForm.get('name'); }
  // get sticky_expire(){return this.callqueueForm.get('sticky_expire');}

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  ngOnInit() {
    let i = 1;
    for (i = 1; i <= 30; i++) {
      this.stickyExpire.push({ 'id': "" + i + "", 'date': i });
      this.stickyExpire.toString();
    }
    this.getActiveFeatures();
    this.callqueueForm.controls.sticky_expire.disable();
    this.callqueueForm.controls.periodic_announcement_time.disable();
    this.callqueueForm.controls.play_position_periodically.disable();
    this.__feedbackCallChangeSubscription = this.callqueueForm.get('feedback_call').valueChanges.subscribe(data => {
      if (!data) {
        this.callqueueForm.get('feedback_ivr').disable();
        this.callqueueForm.get('feedback_ivr').setValue('');
        this.callqueueForm.get('feedback_ivr').clearValidators();
        this.callqueueForm.get('feedback_ivr').updateValueAndValidity();
      } else {
        this.callqueueForm.get('feedback_ivr').enable();
        this.callqueueForm.get('feedback_ivr').setValidators(Validators.required);
        this.callqueueForm.get('feedback_ivr').updateValueAndValidity();
      }
    });
    this.__stickyAgentCallChangeSubscription = this.callqueueForm.get('sticky_agent').valueChanges.subscribe(data => {
      if (!data) {
        this.callqueueForm.get('sticky_agent_type').disable();
        this.callqueueForm.get('sticky_agent_type').setValue('1');
      } else {
        this.callqueueForm.get('sticky_agent_type').enable();
        // this.callqueueData.sticky_agent_type = '1';s
      }
    });

    this.__UnauthorizedFailChangeSubscription = this.callqueueForm.get('unauthorized_fail').valueChanges.subscribe(data => {
      if (!data) {
        this.callqueueForm.get('active_feature').setValue('');
        this.callqueueForm.get('active_feature_value').setValue('');
        this.callqueueForm.get("active_feature").clearValidators();
        this.callqueueForm.get("active_feature_value").clearValidators();
        this.callqueueForm.get('active_feature').updateValueAndValidity();
        this.callqueueForm.get('active_feature_value').updateValueAndValidity();
      } else {
        this.callqueueForm.get('active_feature').setValidators(Validators.required);
        this.callqueueForm.get('active_feature').updateValueAndValidity();
      }
    });

    this.__active_featureChangeSubscription = this.callqueueForm.get('active_feature').valueChanges.subscribe(data => {
      if (!data) {
        this.callqueueForm.get("active_feature_value").clearValidators();
        this.callqueueForm.get('active_feature_value').updateValueAndValidity();
      } else {
        let obj = {
          value: data
        }
        // this.cdRef.detectChanges();
        this.getValueOfActiveFeature(obj);
        this.callqueueForm.get('active_feature_value').setValue('');
        this.callqueueForm.get('active_feature_value').setValidators(Validators.required);
        this.callqueueForm.get('active_feature_value').updateValueAndValidity();
      }
    });

    //add agent
    this.extensionService.getMyExtension(localStorage.getItem('id')).subscribe(data => {
      this.extList = data.response;
      for (let i = 0; i < data.response.length; i++) {
        this.sourceAgent.push({ id: data.response[i].id, agent: data.response[i].ext_number + '-' + data.response[i].caller_id_name });
      }
    }, err => {
      this.error = err.message;
    });

    //showing moh and recording
    this.commonService.getCustomerProductFeatures(localStorage.getItem('id')).subscribe(data => {
      this.productFeatures = data.response[0];
      this.welcomePrompt = (data.response[0].custom_prompt == '1' && data.response[0].conference == '1') ? 1 : 0;
      this.moh = (data.response[0].custom_prompt == '1' && data.response[0].music_on_hold == '1') ? 1 : 0;
      this.recording = data.response[0].storage == '0' ? 0 : data.response[0].recording;
      this.prompt = data.response[0].custom_prompt == '1' ? 1 : 0;
      this.feedbackCall = data.response[0].feedback_call == '1' ? 1 : 0;
      this.stickyAgent = data.response[0].sticky_agent == '1' ? 1 : 0;
      this.isSMS = data.response[0].is_sms == '1' ? 1 : 0;

    }, err => {
      this.error = err.message;
    });

    //get moh from prompt
    this.promptsService.getMOHPrompt(localStorage.getItem('id')).subscribe(data => {
      this.selectedMOHValue = data.response;
      this.filters = this.MOHFilter = this.selectedMOHValue.slice();
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

    //get ivr for feedback
    this.callqueueService.getQueueIVR({ id: null, name: null, customer_id: localStorage.getItem('id') }).subscribe(data => {
      this.selectedIVRValue = data.response;
      this.filter = this.IVRFilter = this.selectedIVRValue.slice();
    }, err => {
      this.error = err.message;
    });


    if (this.data.id) {
      this.promptsService.getQueuePrompt(localStorage.getItem('id')).subscribe(data => {
        // this.selectedQueueValue = data.response ? data.response : [];
        if (data.response && this.prompt == 1) {
          this.selectedQueueValue = data.response;
        } else if (this.prompt == 0) {
          this.selectedQueueValue.unshift({ prompt_name: 'default', id: '0' });
        } else {
          this.selectedQueueValue = [];
        }

        this.filterselect = this.Welcomefilter = this.selectedQueueValue.slice();
      }, err => {
        this.error = err.message;
      });
      this.callqueueService.viewCallqueue({ id: this.data.id, name: null, 'customer_id': Number(localStorage.getItem('id')) }).subscribe(data => {
        this.callqueueData = data[0];
        if (this.callqueueData.sticky_expire !== 0) {
          this.stickyData = this.callqueueData.sticky_expire.toString();
        } else {
          this.stickyData = '1'
        }
        // this.maxWaitingcall = data[0].max_waiting_call ;
        setTimeout(() => {
          this.feedback_IVR = this.callqueueData.feedback_ivr;
        }, 500);
        this.callqueueData.welcome_prompt = this.callqueueData.welcome_prompt == 0 ? '0' : this.callqueueData.welcome_prompt;
        this.callqueueData.periodic_announcement_prompt = this.callqueueData.periodic_announcement_prompt == 0 ? '0' : this.callqueueData.periodic_announcement_prompt;
        this.callqueueData.active_feature = this.callqueueData.active_feature == 2 ? '2a' : this.callqueueData.active_feature;
        if (this.callqueueData.periodic_announcement_time == 15) {
          this.callqueueData.periodic_announcement_time = "15";
        } else if (this.callqueueData.periodic_announcement_time == 30) {
          this.callqueueData.periodic_announcement_time = "30";
        } else if (this.callqueueData.periodic_announcement_time == 60) {
          this.callqueueData.periodic_announcement_time = "60";
        } else {
          this.callqueueData.periodic_announcement_time = "0";
        }
        if (data[0].periodic_announcement == 1) {
          this.callqueueForm.controls.periodic_announcement_time.enable();
          this.isPeriodicAnnouncementTime = true;
        } else {
          this.callqueueForm.controls.periodic_announcement_time.disable();
          this.isPeriodicAnnouncementTime = false;
        }
        if (data[0].play_position_on_call == 1) {
          this.callqueueForm.controls.play_position_periodically.enable();
          this.isPlayPositionOnCall = true;
        } else {
          this.callqueueForm.controls.play_position_periodically.disable();
          this.isPlayPositionOnCall = false;
        }

        if (data[0].sticky_agent == 1) {
          this.callqueueForm.controls.sticky_expire.enable();
          this.isPlayPosition = true;
        } else {
          this.callqueueForm.controls.sticky_expire.disable();
          this.isPlayPosition = false;
        }
        //target agent data
        let tarAgent = (data[0].agent).split(",");
        setTimeout(() => {
          tarAgent.forEach(element => {
            let obj1 = this.extList.find(o => o.ext_number == element.toString());
            let index = this.sourceAgent.findIndex(obj => obj.agent == (obj1.ext_number + '-' + obj1.caller_id_name));
            this.targetAgent.push({ id: obj1.id, agent: obj1.ext_number + '-' + obj1.caller_id_name });
            this.sourceAgent.splice(index, 1);
          });
        }, 800);
      }, err => {
        this.error = err;
      });
    } else {
      this.callqueueData.moh = 0;
      this.callqueueData.sticky_agent_type = '1';
      //get queue from prompt
      this.promptsService.getQueuePrompt(localStorage.getItem('id')).subscribe(data => {
        // this.selectedQueueValue = data.response ? data.response : [];
        if (data.response && this.prompt == 1) {
          this.selectedQueueValue = data.response;
        } else if (this.prompt == 0) {
          this.selectedQueueValue.unshift({ prompt_name: 'default', id: '0' });
        } else {
          this.selectedQueueValue = [];
        }
        if (this.selectedQueueValue.length > 0) this.callqueueForm.get('welcome_prompt').setValue(this.selectedQueueValue[0]['id']);
      });
    }
  }

  get unauthorized_fail() { return this.callqueueForm.get('unauthorized_fail'); }
  get active_feature() { return this.callqueueForm.get('active_feature'); }
  get active_feature_value() { return this.callqueueForm.get('active_feature_value'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  public getActiveFeatures() {
    this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(data => {
      // this.activeFeature.push({ id: '0', feature: 'Select Feature' });
      if (data[0].call_group == '1') {
        this.activeFeature.push({ id: '5', feature: 'Call Group' });
      }
      if (data[0].ivr == '1') {
        this.activeFeature.push({ id: '2a', feature: 'IVR' });
      }

      if (data[0].queue == '1') {
        this.activeFeature.push({ id: '4', feature: 'Queue' });
      }
      this.activeFeature.push({ id: '1', feature: 'SIP' });
      if (data[0].queue == '1') {
        this.activeFeature.push({ id: '6', feature: 'Voicemail' });
      }
    }, err => {
      console.log(err);
    });
  }

  getValueOfActiveFeature(e) {
    // let action = e.value;
    let action = e['itemData'].value;
    if (action) {
      this.ivrService.getIVRAction({ user_id: localStorage.getItem('id'), action: action }).subscribe(data => {
        this.activeFeatureValue = data.response;
      });
    }
  }

  submitCallQueueForm() {
    var value: any = [];
    this.checkForm = this.findInvalidControls();

    if (this.callqueueForm.valid) {
      this.submitted = true;
      const credentials = this.callqueueForm.value;
      credentials.active_feature = credentials.active_feature == '2a' ? '2' : credentials.active_feature;
      credentials.customer_id = Number(localStorage.getItem('id'));
      credentials.id = Number(this.data.id) ? Number(this.data.id) : null;
      for (let i = 0; i < this.targetAgent.length; i++) {
        let res1 = this.targetAgent[i].agent.split("-");
        value.push(res1[0]);
      }
      credentials.agent = value;
      if (credentials.agent == '') {
        this.toastr.error('Error!', agentError, { timeOut: 2000 });
        return;
      }
      credentials.ring_strategy = Number(credentials.ring_strategy)  
      credentials.sticky_agent_type = Number(credentials.sticky_agent_type) 
      credentials.sticky_expire = Number(credentials.sticky_expire)
      credentials.welcome_prompt = Number(credentials.welcome_prompt)
      this.callqueueService.viewCallqueue({ id: null, name: credentials.name, 'customer_id': Number(localStorage.getItem('id')) }).subscribe(data => {
        if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
          this.errorField = data[0].MESSAGE_TEXT;
          this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
          this.callqueueForm.controls['name'].setValue('');
          credentials.name == '';
          return;
        } else {
          credentials.welcome_prompt_name = this.selectedQueueValue.filter(item => item.id == credentials.welcome_prompt).length ? this.selectedQueueValue.filter(item => item.id == credentials.welcome_prompt)[0]['prompt_name'] : "";
          credentials.moh_name = this.selectedMOHValue.filter(item => item.id == credentials.moh).length ? this.selectedMOHValue.filter(item => item.id == credentials.moh)[0]['prompt_name'] : "";
          credentials.feedback_name = this.selectedIVRValue.filter(item => item.id == credentials.feedback_ivr).length ? this.selectedIVRValue.filter(item => item.id == credentials.feedback_ivr)[0]['name'] : "";                                  
          this.callqueueService.createCallQueue('createCallQueue', credentials)
            .subscribe(data => {
              if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                if (this.data.id) {
                  let obj = {
                    application: "callcenter",
                    action: "update", //update
                    que_typ: "queue",
                    id: (this.data.id).toString()
                  }
                  this.callqueueService.createCallQueueAPIintegration(obj).subscribe(res => {
                    console.log(res)
                  });
                } else {
                  let obj = {
                    application: "callcenter",
                    action: "add", //create
                    que_typ: "queue",
                    id: ""
                  }
                  this.callqueueService.createCallQueueAPIintegration(obj).subscribe(res => {
                    console.log(res)
                  });
                }
                this.cancelForm();
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
  }
  MOHremovedspace(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.selectedMOHValue.filter((data) => {
      return data['prompt_name'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }
  Promptremovedspace(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.selectedQueueValue.filter((data) => {
      return data['prompt_name'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }
  FeedBackremovedspace(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.selectedIVRValue.filter((data) => {
      return data['name'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }
  Expiryremovedspace = (event) => {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.stickyExpire.filter((data) => {
      return data['date'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.callqueueForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancelForm() {
    this.callqueueForm.reset();
    this.callqueueService.updateGridList();
    this.dialogRef.close();
  }

  showPeriodicAnnouncement(event) {
    let periodicAnnouncement = event.checked;
    if (periodicAnnouncement == true) {
      this.callqueueForm.controls.periodic_announcement_time.enable();
      this.isPeriodicAnnouncementTime = true;
    } else {
      this.callqueueForm.controls.periodic_announcement_time.disable();
      this.isPeriodicAnnouncementTime = false;
    }
  }

  changeStickyBtn(value) {
    if (value) this.callqueueData.sticky_agent_type = '1';
  }

  showPlayPositionOnCall(event) {
    let playPositionOnCall = event.checked;
    if (playPositionOnCall == true) {
      this.callqueueForm.controls.play_position_periodically.enable();
      this.isPlayPositionOnCall = true;
    } else {
      this.callqueueForm.controls.play_position_periodically.disable();
      this.isPlayPositionOnCall = false;
    }
  }
  showPlayPosition(event) {

    let playPosition = event.checked;
    if (playPosition == true) {
      this.callqueueForm.controls.sticky_expire.enable();
      this.isPlayPosition = true;
    } else {
      this.callqueueForm.controls.sticky_expire.disable();
      this.isPlayPosition = false;
    }

  }
  ngOnDestroy(): void {
    this.__feedbackCallChangeSubscription.unsubscribe(); // nagender
    this.__stickyAgentCallChangeSubscription.unsubscribe();
  }


}
