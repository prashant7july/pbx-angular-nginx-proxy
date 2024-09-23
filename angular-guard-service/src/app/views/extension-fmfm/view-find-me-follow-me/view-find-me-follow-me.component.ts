import { Component, OnInit } from '@angular/core';
import { Errors, CommonService, ExtensionService, RINGTIMEOUT_RegEx } from '../../../core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CallForwardService } from '../../call-forward/call-forward.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PromptsService } from '../../prompts/prompts.service';
import { ExtensionSettingsService } from '../../extension-settings/extension-settings.service';
import { ContactListService } from '../../contact-list/contact-list.service';

@Component({
  selector: 'app-view-find-me-follow-me',
  templateUrl: './view-find-me-follow-me.component.html',
  styleUrls: ['./view-find-me-follow-me.component.css']
})
export class ViewFindMeFollowMeComponent implements OnInit {

  errors: Errors = { errors: {} };
  extensionSettingsForm: FormGroup;
  submitted = false;
  error = '';
  settings: any = {};
  callForward: any = {};
  callForwardStatus: any = 0;
  pstnList: any = [];
  filterConOne: any;
  PSTNOneFilter: any;
  filterConTwo: any;
  PSTNTwoFilter: any;
  filterConThree: any;
  PSTNThreeFilter: any;
  extensionList: any = [];
  filterExOne: any;
  SIPOneFilter: any;
  filterExTwo: any;
  SIPTwoFilter: any;
  filterExThree: any;
  SIPThreeFilter: any;
  callqueueData;
  dialOut: boolean = false;
  public fields1: Object = { text: 'name', value: 'id' };
  public fields: Object = { text: 'ext_number', value: 'id' };
  public placeholder3 = 'PSTN *';
  public placeholder2 = 'SIP *';
  public popupHeight = '200px';
  public popupWidth = '200px';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private extensionSettingsService: ExtensionSettingsService,
    public dialog: MatDialog,
    private promptsService: PromptsService,
    private extensionService: ExtensionService,
    private contactListService: ContactListService,
    public commonService: CommonService,
  ) {
    this.extensionSettingsForm = this.formBuilder.group({
      ring_timeout: [10, [Validators.required, Validators.pattern(RINGTIMEOUT_RegEx), Validators.maxLength(2), Validators.minLength(1)]],
      find_me_follow_me_type_1 : ['SIP'],
      caller_id_1: [''],
      find_me_follow_me_type_2 : ['SIP'],
      caller_id_2: [''],
      find_me_follow_me_type_3 : ['SIP'],
      caller_id_3: [''],
    });
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName('mat-filter-input');
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    // GET EXTENSION LIST
    const user_id = localStorage.getItem('id');
    this.extensionService.getExtensionById(user_id).subscribe(data => {
      const ext_admin_id = data.response[0] ? (data.response[0].customer_id) : 0;
      this.dialOut = data.response[0].outbound == 0 ? true : false;      
      this.extensionService.getExtension(ext_admin_id).subscribe(pagedData => {
        const allExtn = pagedData ? pagedData : [];
        this.extensionList = allExtn.filter(item => item.ext_number != data.response[0].ext_number);
        this.filterExOne = this.SIPOneFilter = this.extensionList.slice();
        this.filterExTwo = this.SIPTwoFilter = this.extensionList.slice();
        this.filterExThree = this.SIPThreeFilter = this.extensionList.slice();
        this.extensionList.unshift({ext_number: 'Select Extension' , id: '0'})

        this.getExtensionFMFMSetting();
      });
    });
    // GET PSTN LIST
    this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, customer_id: '', extension_id: Number(localStorage.getItem('id')), role: Number(localStorage.getItem('type')) }).subscribe(data => {
      this.pstnList = data;
      this.filterConOne = this.PSTNOneFilter = this.pstnList.slice();
      this.filterConTwo = this.PSTNTwoFilter = this.pstnList.slice();
      this.filterConThree = this.PSTNThreeFilter = this.pstnList.slice();

    }, err => {
      this.error = err.message;
    });
  }

  getExtensionFMFMSetting = () => {
    this.extensionSettingsService.getExtensionFMFMSetting({id: localStorage.getItem('id')}).subscribe(data => {
        this.extensionSettingsForm.patchValue(data[0]);
    }, err => {
      this.error = err.message;
    });
  }

  SIPremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.extensionList.filter((data) => {
      return data.ext_number.toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  
  PSTNremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.pstnList.filter((data) => {
      return data.name.toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  get ring_timeout() { return this.extensionSettingsForm.get('ring_timeout'); }
  get caller_id_1() { return this.extensionSettingsForm.get('caller_id_1'); }
  get caller_id_2() { return this.extensionSettingsForm.get('caller_id_2'); }
  get caller_id_3() { return this.extensionSettingsForm.get('caller_id_3'); }
  get find_me_follow_me_type_1() { return this.extensionSettingsForm.get('find_me_follow_me_type_1'); }
  get find_me_follow_me_type_2() { return this.extensionSettingsForm.get('find_me_follow_me_type_2'); }
  get find_me_follow_me_type_3() { return this.extensionSettingsForm.get('find_me_follow_me_type_3'); }


  submitExtensionSettings() {
    this.submitted = true;
    const credentials = this.extensionSettingsForm.value;
    credentials.id = localStorage.getItem('id');    
    credentials.caller_id_name1 = this.extensionSettingsForm.get('find_me_follow_me_type_1').value == "SIP" ? this.extensionList.filter(item => item.id == credentials.caller_id_1)[0]['ext_number'] : this.extensionList.filter(item => item.id == credentials.caller_id_1)[0]['name'];
    credentials.caller_id_name2 = this.extensionSettingsForm.get('find_me_follow_me_type_2').value == "SIP" ? this.extensionList.filter(item => item.id == credentials.caller_id_2)[0]['ext_number'] : this.extensionList.filter(item => item.id == credentials.caller_id_2)[0]['name'];
    credentials.caller_id_name3 = this.extensionSettingsForm.get('find_me_follow_me_type_3').value == "SIP" ? this.extensionList.filter(item => item.id == credentials.caller_id_3)[0]['ext_number'] : this.extensionList.filter(item => item.id == credentials.caller_id_3)[0]['name'];;
    this.extensionSettingsService.updateExtensionFindMeFollowMeSettings('updateExtensionSettings', credentials)
      .subscribe(data => {
        if (data['code'] == 200) {
          this.toastr.success('Success!', data['message'], { timeOut: 2000 });
          this.router.navigateByUrl('dashboard/extensionDashboard');
        } else {
          this.toastr.error('Error!', data['message'], { timeOut: 2000 });
        }
      });
  }

  public changeCallerType(event, item) {
    const callerValue = event.value;
    const controlName = item;
    if (callerValue) {
      this.extensionSettingsForm.get(controlName).setValue('');
      // this.extensionSettingsForm.get(controlName).setValidators(Validators.required);
      this.extensionSettingsForm.get(controlName).updateValueAndValidity();
      this.extensionSettingsForm.updateValueAndValidity();
    }
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoExtensionSettingDialog, {
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
}
