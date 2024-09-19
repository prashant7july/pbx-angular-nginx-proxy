import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService, RINGTIMEOUT_RegEx, SIPError, formError } from '../../../core';
import { CallgroupService } from '../call-group.service';
import { PromptsService } from '../../prompts/prompts.service';
import { ExtensionService } from '../../extension/extension.service';
import { observable, Subscription } from 'rxjs';
import { IVRService } from '../../smart_ivr/ivr.service';
import { DidService } from '../../DID/did.service';
import { ChangeDetectorRef, AfterContentChecked } from '@angular/core';
// import { PickListFilterOptions } from 'primeng/picklist';
import { Observable } from 'rxjs';



export interface CallGroup { id: string }

@Component({
  selector: 'callgroup',
  templateUrl: './view-callgroup.component.html',
  styleUrls: ['./view-callgroup.component.css']
})
export class ViewCallgroupComponent implements OnInit {
  isFilter = false;
  filterForm: FormGroup;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  selectedGTValue: any[] = [];
  defaultPageSize = '10';

  constructor(
    private callgroupService: CallgroupService, public commonService: CommonService, private fb: FormBuilder,
    public dialog: MatDialog,) {
    this.filterForm = this.fb.group({ 'name': [""], 'group_type': [""], 'group_ext': [""] });
  }



  ngOnInit() {
    this.callgroupService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    this.selectedGTValue = [{ id: 2, name: 'Hunt' }, { id: 1, name: 'Ring' }]
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 15 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 50 },
      { field: 'grpType', headerName: 'Group Type', hide: false, width: 30 },
      { field: 'group_ext', headerName: 'Group Exten', hide: false, width: 30 },
      { field: 'ringtimeout', headerName: 'Ring Timeout', hide: false, width: 20 },
      { field: 'recordingDisplay', headerName: 'Recording', hide: false, width: 20 },

    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.group_ext = Number(credentials.group_ext)
      this.callgroupService.filterCallgrouplist(credentials, Number(localStorage.getItem('id'))).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      });
    } else {
      this.callgroupService.getCallgroup({ id: null, name: null, 'customer_id': Number(localStorage.getItem('id')) }).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
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
      let group_ext = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      group_ext += data[i].group_ext;
      data[i]['group_ext'] = group_ext;
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
    this.callgroupService.getCallGroupCount(event.id).subscribe(data => {
      if (data.callGroup_count > 0 || data.speedDialData.length > 0) {
        debugger
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'>Call Group  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> can't be deleted because it is associate with either DID Destination or IVR or call group .</span>",
          type: 'error',
          background: '#000000',
          timer: 5000
        });
      } else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html: "<span style='color:#FFFFFF;'>You will not be able to recover Call Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.callgroupService.deleteCallgroup({ 'id': event.id }).subscribe(data => {
              this.displayAllRecord();
            });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result.value) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Deleted!</span>',
              html: "<span style='color:#FFFFFF;'> Call Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 4000
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html: "<span style='color:#FFFFFF;'>Call Group </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
              type: 'error',
              background: '#000000',
              timer: 4000
            });
          }
        })
      }
    })
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(CallgroupDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe();
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
    const dialogRefInfo = this.dialog.open(InfoCallGroupDialog, {
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

}

@Component({
  selector: 'infoCallGroup-dialog',
  templateUrl: 'infoCallGroup-dialog.html',
})

export class InfoCallGroupDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCallGroupDialog>, @Inject(MAT_DIALOG_DATA) public data: CallGroup,
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
  selector: 'callgroup-dialog',
  templateUrl: 'callgroup-dialog.html',
})

export class CallgroupDialog {
  @Output() myEvent = new EventEmitter();
  callGroupForm: FormGroup;
  selectedGTValue: any[] = [];
  selectedMOHValue: any[] = [];
  sourceAddSIPExt: any[] = [];
  targetAddSIPExt: any[] = [];
  existingGroupName: any[] = [];
  recording = 0;
  moh = 0;
  public fields: Object = { text: 'prompt_name', value: 'id' };
  public placeholder: string = 'Welcome Prompt';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public popupWidth1: string = '200px';
  public fields2: Object = { text: 'feature', value: 'id' };
  public fields3: Object = { text: 'date', value: 'id' };
  public fields4: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Feature';
  public placeholder3: string = 'Value';
  public placeholder5: string = 'Expiry Date';

  public mode;
  sourceAgent: any[] = [];
  public selectAllText: string
  extList: any = [];

  checkForm: any;
  errorField: any;
  callgroupData: any = {};
  stickyAgent = 0;
  isPrompt = 0;
  callGroupPromptList: any[] = [];
  WelcomePromptspace = [];
  WelcomeFilter: any;
  filterPrompt: any;
  activeFeature: any[] = [];
  featuredropspace: any = [];
  filterFeature: any;
  allfilterfeature: any;
  allfilterValue: any;
  allfilterPrompt: any;
  activeFeatureValue: any[] = [];
  valuedropspace = [];
  FilterValue: any;
  FeatureFilter: any;
  filter: any;
  // Sticky_expire:any[]=[];
  isPlayPosition = false;
  stickyExpire: any = [];
  Expiryspace: any = [];
  ExpireFilter: any;
  filterExpire: any;
  listext: any;

  public __UnauthorizedFailChangeSubscription: Subscription;
  public __active_featureChangeSubscription: Subscription;
  public __sticky_agentSubscription: Subscription;
  activeFeature_value: number;
  stickyData = '1';
  checkValue = [];
  active_feat : any;
  obv;


  constructor(
    private cdref: ChangeDetectorRef,
    public dialogRef: MatDialogRef<CallgroupDialog>, @Inject(MAT_DIALOG_DATA) public data: CallGroup,
    // public pickListFilterOptions : PickListFilterOptions,
    private formBuilder: FormBuilder, private promptsService: PromptsService, private callgroupService: CallgroupService,
    private extensionService: ExtensionService, private toastr: ToastrService, public commonService: CommonService,
    private ivrService: IVRService, private didService: DidService) {
    this.callGroupForm = this.formBuilder.group({
      'groupName': ['', Validators.required],
      'groupType': ['', Validators.required],
      'extNo': ['', [Validators.required, Validators.maxLength(5), Validators.minLength(5), Validators.min(1000)]],
      'ringTimeout': [10, [Validators.required, Validators.pattern(RINGTIMEOUT_RegEx), Validators.maxLength(2), Validators.minLength(1)]],
      // 'moh': ['0'],
      'recording': [''],
      'sticky_agent': [''],
      'prompt': [''],
      'unauthorized_fail': [''],
      'active_feature': ['', Validators.required],
      'active_feature_value': ['', Validators.required],
      'sticky_expire': ['']
    });
  }

  get groupName() { return this.callGroupForm.get('groupName'); }
  get groupType() { return this.callGroupForm.get('groupType'); }
  get extNo() { return this.callGroupForm.get('extNo'); }
  get ringTimeout() { return this.callGroupForm.get('ringTimeout'); }
  get unauthorized_fail() { return this.callGroupForm.get('unauthorized_fail'); }
  get active_feature() { return this.callGroupForm.get('active_feature'); }
  get active_feature_value() { return this.callGroupForm.get('active_feature_value'); }
  get sticky_expire() { return this.callGroupForm.get('sticky_expire'); }




  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  ngAfterContentChecked() {

    this.cdref.detectChanges();

  }

  sourceFilterValue: string = '';

  targetFilterValue: string = '';

  // myResetFunction(options: PickListFilterOptions) {
  //     options.reset();
  //     this.targetFilterValue = '';
  // }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;

  }

  ngOnInit() {
    this.mode = 'CheckBox';
    this.selectAllText = 'Select All';
    let i = 1;
    for (i = 1; i <= 30; i++) {
      this.stickyExpire.push({ 'id': "" + i + "", 'date': i });
      // this.Expiryspace = this.stickyExpire.toString()
      this.filterExpire = this.ExpireFilter = this.stickyExpire.slice()
    }
    this.getActiveFeatures();
    this.__UnauthorizedFailChangeSubscription = this.callGroupForm.get('unauthorized_fail').valueChanges.subscribe(data => {
      if (!data) {
        this.callGroupForm.get('active_feature').setValue('');
        this.callGroupForm.get('active_feature_value').setValue('');
        this.callGroupForm.get("active_feature").clearValidators();
        this.callGroupForm.get("active_feature_value").clearValidators();
        this.callGroupForm.get('active_feature').updateValueAndValidity();
        this.callGroupForm.get('active_feature_value').updateValueAndValidity();
      } else {
        this.callGroupForm.get('active_feature').setValidators(Validators.required);
        this.callGroupForm.get('active_feature').updateValueAndValidity();
      }
    });

    this.__sticky_agentSubscription = this.callGroupForm.get('sticky_agent').valueChanges.subscribe(data => {
      if (!data) {
        this.callGroupForm.get('sticky_expire').clearValidators();
        this.callGroupForm.get('sticky_expire').updateValueAndValidity();
      }
      else {
        // this.callGroupForm.get('sticky_expire').setValue('');
        this.callGroupForm.get('sticky_expire').setValidators(Validators.required);
        this.callGroupForm.get('sticky_expire').updateValueAndValidity();

      }
    })

    this.__active_featureChangeSubscription = this.callGroupForm.get('active_feature').valueChanges.subscribe(data => {

      if (!data) {
        this.callGroupForm.get("active_feature_value").clearValidators();
        this.callGroupForm.get('active_feature_value').updateValueAndValidity();
      } else {
        let obj = {
          value: data
        }
        this.getValueOfActiveFeature(obj);
        // this.activeFeatureValue = [];      
        this.callGroupForm.get('active_feature_value').setValue('');
        this.callGroupForm.get('active_feature_value').setValidators(Validators.required);
        this.callGroupForm.get('active_feature_value').updateValueAndValidity();
      }
    });
    this.commonService.getCustomerProductFeatures(localStorage.getItem('id')).subscribe(data => {
      this.moh = (data.response[0].custom_prompt == '1' && data.response[0].music_on_hold == '1') ? 1 : 0;
      this.recording = data.response[0].storage == '0' ? 0 : data.response[0].recording;
      this.stickyAgent = data.response[0].sticky_agent == '0' ? 0 : 1;
      this.isPrompt = (data.response[0].custom_prompt == '1') ? 1 : 0;
    });

    this.promptsService.getMOHPrompt(localStorage.getItem('id')).subscribe(data => {
      this.selectedMOHValue = data.response;
    });

    this.selectedGTValue = [{ id: 1, name: 'Ring Group' }, { id: 2, name: 'Hunt Group' }]

    let promise = new Promise(resolve => {
      this.extensionService.getMyExtension(localStorage.getItem('id')).subscribe(data => {   
        this.extList.push(data.response)        
        resolve(this.extList);
        for (let i = 0; i < data.response.length; i++) {
          this.sourceAddSIPExt.push({ id: data.response[i].id, codec: data.response[i].ext_number + '-' + data.response[i].caller_id_name });
        }
      });  
    })
      
    

    //get CALL-GROUP  prompt
    this.promptsService.getCallGroupPrompt(localStorage.getItem('id')).subscribe(data => {
      this.WelcomePromptspace = this.callGroupPromptList = data.response;
      this.filterPrompt = this.WelcomeFilter = this.callGroupPromptList.slice();
    });
    if (this.data.id) {
      this.callgroupService.getCallgroup({ id: this.data.id, name: null, 'customer_id': Number(localStorage.getItem('id')) }).subscribe(data => {
        // data[0].sticky_expire=parseInt(data[0].sticky_expire);
        data[0].recording = parseInt(data[0].recording);
        data[0].sticky_agent = parseInt(data[0].sticky_agent);
        data[0].unauthorized_fail = parseInt(data[0].unauthorized_fail);
        if (data[0].sticky_agent == 1) {
          this.callGroupForm.controls.sticky_expire.enable();
          this.isPlayPosition = true;
        } else {
          this.callGroupForm.controls.sticky_expire.disable();
          this.isPlayPosition = false;
        }
        this.callgroupData = data[0];

        if (this.callgroupData.sticky_expire !== 0) {
          this.stickyData = this.callgroupData.sticky_expire.toString();
        } else {
          this.stickyData = '1'
        }
        setTimeout(() => {
          this.active_feat = this.callgroupData.active_feature;
          this.activeFeature_value = parseInt(this.callgroupData['active_feature_value']);
        },500);
        
        let targetSIP = (data[0].sip).split(",");

        setTimeout(() => {
          targetSIP.forEach(element => {
            promise.then(response => {
              let obj1 = response[0].find(o => o.ext_number == element.toString());
              let index = this.sourceAddSIPExt.findIndex(obj => obj.codec == (obj1.ext_number + '-' + obj1.caller_id_name));
              this.targetAddSIPExt.push({ id: obj1.id, codec: obj1.ext_number + '-' + obj1.caller_id_name });  
              this.sourceAddSIPExt.splice(index, 1);
            })
          });
        }, 200);

      })
    } else { //used for assign default value
      this.callgroupData.group_type = 1;
      this.callgroupData.moh = 0;
    }
  }


  submitCallGroupForm() {
    this.checkForm = this.findInvalidControls();
    let value: any = [];
    if (this.callGroupForm.valid) {
      const credentials = this.callGroupForm.value;
      credentials.customer_id = Number(localStorage.getItem('id'));
      credentials.id = Number(this.data.id) ? Number(this.data.id) : null;

      let failover = this.callGroupForm.get('unauthorized_fail').value
      let activeFeature = this.callGroupForm.get('active_feature').value
      credentials.extNo = Number(credentials.extNo)
      credentials.ringTimeout = Number(credentials.ringTimeout)
      credentials.sticky_expire = Number(credentials.sticky_expire)
      let featureValue = credentials.id === "null" ? this.callGroupForm.get('active_feature_value').value : this.checkValue === undefined ? this.callGroupForm.get('active_feature_value').setValue('') : this.callGroupForm.get('active_feature_value');
      if (failover && activeFeature) {
        if (!featureValue) {
          this.toastr.error('Error!', 'value cant be null', { timeOut: 2000 });
          return;
        }
      }



      if (this.targetAddSIPExt.length > 0) {
        for (let i = 0; i < this.targetAddSIPExt.length; i++) {
          let res1 = this.targetAddSIPExt[i].codec.split("-");
          value.push(res1[0]);
        }
        credentials.sipExt = value.join();
        this.callgroupService.getCallgroup({ id: null, name: credentials.groupName, 'customer_id': Number(localStorage.getItem('id')) }).subscribe(data => {
          if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
            this.callGroupForm.controls['groupName'].setValue('');
            credentials.groupName = '';
            return;
          } else {
            this.commonService.getExten({ extenid: parseInt(credentials.extNo), 'customer_id': localStorage.getItem('id') }).subscribe(data => {
              if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
                this.errorField = data[0].MESSAGE_TEXT;
                this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
                this.callGroupForm.controls['extNo'].setValue('');
                credentials.extNo = '';
                return;
              } else {
                credentials.prompt_name = this.callGroupPromptList.filter(item => item.id == credentials.prompt).length ? this.callGroupPromptList.filter(item => item.id == credentials.prompt)[0]['prompt_name'] : "";
                credentials.feature_name = this.activeFeature.filter(item => item.id == credentials.active_feature).length ? this.activeFeature.filter(item => item.id == credentials.active_feature)[0]['feature'] : "";
                credentials.feature_value = this.activeFeatureValue.filter(item => item.id == credentials.active_feature_value).length ? this.activeFeatureValue.filter(item => item.id == credentials.active_feature_value)[0]['name'] : "";
                this.callgroupService.saveCallGroup(credentials).subscribe(data => {
                  if (data['code'] == 200) {
                    this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                    this.cancelForm();
                  }
                  else {
                    this.toastr.error('Error!', data['message'], { timeOut: 2000 });
                  }
                });
              }
            });
          }
        });
      } else {
        this.toastr.error('Error!', SIPError, { timeOut: 2000 });
        return;
      }
    } else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }


  }
  WelcomePromptremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase()
    const mohfilterData = this.WelcomePromptspace.filter((data) => {
      return data['prompt_name'].toLowerCase().includes(mohspace);
    })
    event.updateData(mohfilterData);
  }

  Expiryremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase()
    const mohfilterData = this.stickyExpire.filter((data) => {
      return data['date'].toLowerCase().includes(mohspace);
    })
    event.updateData(mohfilterData);
  }
  Valueremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase()
    const mohfilterData = this.activeFeatureValue.filter((data) => {
      return data['name'].toLowerCase().includes(mohspace);
    })
    event.updateData(mohfilterData);
  }

  findInvalidControls() {
    const invalid = [];
    const controls = this.callGroupForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) invalid.push(name);
    }
    return invalid;
  }

  getValueOfActiveFeature(e) {
    this.callGroupForm.get('active_feature_value').setValue('');
    let action = e.value;
    if (action) {
      this.ivrService.getIVRAction({ user_id: localStorage.getItem('id'), action: action }).subscribe(data => {
        this.activeFeatureValue = data.response;
        this.filter = this.FilterValue = this.activeFeatureValue.slice();
        // this.callgroupData.active_feature_value = data.response;

        if (action == 5 && this.data.id) {
          this.activeFeatureValue = this.activeFeatureValue.filter(item => item.id != this.data.id)
        }

        if (action == 6 && this.data.id) {
          this.checkValue = this.activeFeatureValue.find(item => item.id == this.activeFeature_value)
        }
      });
    }
  }
  testFeature() {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this.filterFeature = this.allfilterfeature;
  }
  testValue() {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this.filter = this.allfilterValue;
  }
  testPrompt() {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this.filterPrompt = this.allfilterPrompt;
  }
  // getValueOfActivefeature(e) {
  //   let action = e.value;
  //     if(action){
  //     this.ivrService.getIVRAction({ user_id: localStorage.getItem('id'), action: action }).subscribe(data => {
  //       this.activeFeatureValue = data.response;
  //       if(action == 5 && this.data.id){
  //         this.activeFeatureValue = this.activeFeatureValue.filter(item=> item.id != this.data.id)
  //       }
  //     });
  //     }
  // }


  public getActiveFeatures() {
    this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(data => {
      // this.activeFeature.push({ id: '0', feature: 'Select Feature' });
      if (data[0].call_group == '1') {
        this.activeFeature.push({ id: '5', feature: 'Call Group' });
        this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
      }
      // if (data[0].ivr == '1') {
      //   this.activeFeature.push({ id: '2a', feature: 'IVR' });
      // }

      if (data[0].queue == '1') {
        this.activeFeature.push({ id: '4', feature: 'Queue' });
        this.filterFeature = this.FeatureFilter = this.activeFeature.slice();


      }
      this.activeFeature.push({ id: '1', feature: 'SIP' });
      this.filterFeature = this.FeatureFilter = this.activeFeature.slice();


      if (data[0].voicemail == '1') {
        this.activeFeature.push({ id: '6', feature: 'Voicemail' });
        this.filterFeature = this.FeatureFilter = this.activeFeature.slice();


      }
    }, err => {
      console.log(err);
    });
    
  }
  Featureremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase()
    const mohfilterData = this.activeFeature.filter((data) => {
      return data['feature'].toLowerCase().includes(mohspace);
    })
    event.updateData(mohfilterData);
  }
  cancelForm() {
    this.callGroupForm.reset();
    this.callgroupService.updateGridList();
    this.dialogRef.close();
  }
  showPlayPosition(event) {
    let playPosition = event.checked;
    if (playPosition == true) {
      this.callGroupForm.controls.sticky_expire.enable();
      this.isPlayPosition = true;
    } else {
      this.callGroupForm.controls.sticky_expire.disable();
      this.isPlayPosition = false;
    }

  }

  clearFilter(e) {
    this.sourceFilterValue = '';
    this.targetFilterValue = '';
  }


}