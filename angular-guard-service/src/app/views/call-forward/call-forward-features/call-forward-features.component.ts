import { Component, OnInit ,Inject} from '@angular/core';
import { numberLength, CommonService, Number_RegEx, blankNumber } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CallForwardService } from '../call-forward.service';
import { ExtensionService } from '../../extension/extension.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Callforward } from 'src/app/core/models/call-forward.model';

@Component({
  selector: 'app-call-forward-features',
  templateUrl: './call-forward-features.component.html',
  styleUrls: ['./call-forward-features.component.css']
})
export class CallForwardFeaturesComponent implements OnInit {
  callForwardForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = '';
  universalForwardType = false;
  busyForwardType = false;
  noanswerForwardType = false;
  unavailableForwardType = false;
  universalType = 0;
  busyType = 0;
  noanswerType = 0;
  unavailableType = 0;
  countryCode = "";
  country_code = "";
  countryID: any = {};
  countryList:any = "";
  CountryFourFilter:any;
  CountryThreeFilter:any;
  CountryTwoFilter:any;
  CountryOneFilter:any;
  callForwardExists = false;
  callForwardData: any = {}
  extensionInfo: any = [];
  ExtensionFourFilter:any;
  ExtensionThreeFilter:any;
  ExtensionTwoFilter:any;
  ExtensionOneFilter:any;
  filterExOne:any;
  filterExTwo:any;
  filterExThree:any;
  filterExFour:any;
  filterOne:any;
  filterTwo:any;
  filterthree:any;
  filterFour:any;
  filters:any;
  universalForwardExtension = false;
  busyForwardExtension = false;
  noanswerForwardExtension = false;
  unavailableForwardExtension = false;
  busy = false;
  checkcondition:boolean = false;
  universal = false;
  noanswer = false;
  unavailable = false;
  extensionFeature: any = {};
  extensionHasVoiceMail : any = {};
  callForwardId: any;
  dataSource: any = [];
  universalExtension: any;
  busyExternal: any;
  filter:any;
  public fields: Object = { text: 'name', value: 'id' };
  public fields1: Object = { text: 'extension', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';
  public placeholder10: string = 'Select Extension';
  public popupHeight: string = '200px';
  public popupWidth: string = '220px';
  public popupWidth1: string = '200px';
  noanswerExternal: any;
  unavailableExternal: any;
  pstnCheck: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private commonService: CommonService,
    private callForwardService: CallForwardService,
    private extensionService: ExtensionService,
    public dialog: MatDialog
  ) {
    this.callForwardForm = this.formBuilder.group({
      'universal_type': ["0"],
      'busy_type': ["0"],
      'noanswer_type': ["0"],
      'unavailable_type': ["0"],
      'universal_country': [99, Validators.required],
      'universal_country_code': ['+91', Validators.required],
      'country_code': [''],
      'busy_country': [99, Validators.required],
      'busy_country_code':  ['+91', Validators.required],
      'noanswer_country': [99, Validators.required],
      'noanswer_country_code':  ['+91', Validators.required],
      'unavailable_country': [99, Validators.required],
      'unavailable_country_code':  ['+91', Validators.required],
      'universal': [''],
      'busy': [''],
      'noanswer': [''],
      'unavailable': [''],
      'universal_external': ['', Validators.compose([Validators.required, Validators.pattern(Number_RegEx)])],
      'busy_external': ['', Validators.compose([Validators.required, Validators.pattern(Number_RegEx)])],
      'noanswer_external': ['', Validators.compose([Validators.required, Validators.pattern(Number_RegEx)])],
      'unavailable_external': ['', Validators.compose([Validators.required, Validators.pattern(Number_RegEx)])],
      'universal_extension': ['', Validators.required],
      'busy_extension': ['', Validators.required],
      'noanswer_extension': ['', Validators.required],
      'unavailable_extension': ['', Validators.required]
    });
  }

  get universal_type() { return this.callForwardForm.get('universal_type'); }
  get busy_type() { return this.callForwardForm.get('busy_type'); }
  get noanswer_type() { return this.callForwardForm.get('noanswer_type'); }
  get unavailable_type() { return this.callForwardForm.get('unavailable_type'); }
  get universal_country() { return this.callForwardForm.get('universal_country'); }
  get busy_country() { return this.callForwardForm.get('busy_country'); }
  get noanswer_country() { return this.callForwardForm.get('noanswer_country'); }
  get unavailable_country() { return this.callForwardForm.get('unavailable_country'); }
  get universal_external() { return this.callForwardForm.get('universal_external'); }
  get busy_external() { return this.callForwardForm.get('busy_external'); }
  get noanswer_external() { return this.callForwardForm.get('noanswer_external'); }
  get unavailable_external() { return this.callForwardForm.get('unavailable_external'); }
  get universal_extension() { return this.callForwardForm.get('universal_extension'); }
  get busy_extension() { return this.callForwardForm.get('busy_extension'); }
  get noanswer_extension() { return this.callForwardForm.get('noanswer_extension'); }
  get unavailable_extension() { return this.callForwardForm.get('unavailable_extension'); }
  get universal_country_code() { return this.callForwardForm.get('universal_country_code'); }
  get busy_country_code() { return this.callForwardForm.get('busy_country_code'); }
  get noanswer_country_code() { return this.callForwardForm.get('noanswer_country_code'); }
  get unavailable_country_code() { return this.callForwardForm.get('unavailable_country_code'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.callForwardForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.callForwardForm.controls.universal_country.disable();
    this.callForwardForm.controls.busy_country.disable();
    this.callForwardForm.controls.noanswer_country.disable();
    this.callForwardForm.controls.unavailable_country.disable();
    this.callForwardForm.controls.universal_external.disable();
    this.callForwardForm.controls.busy_external.disable();
    this.callForwardForm.controls.noanswer_external.disable();
    this.callForwardForm.controls.unavailable_external.disable();
    this.callForwardForm.controls.universal_extension.disable();
    this.callForwardForm.controls.busy_extension.disable();
    this.callForwardForm.controls.noanswer_extension.disable();
    this.callForwardForm.controls.unavailable_extension.disable();

this.callForwardService.getminuteoutbound(localStorage.getItem('id')).subscribe(data =>{
  if(data.response[0]['is_bundle_type'] == 1)
  {
    this.checkcondition = true;
  }
})
this.callForwardService.onlyOutboundStatus(localStorage.getItem('id')).subscribe(data => {
    if(data.response[0]['outbound'] == 1){
    this.pstnCheck = true;
  }  
})

    //get extension feature
    this.callForwardService.extFeatureCallForward(localStorage.getItem('id')).subscribe(data => {
      this.extensionFeature = data.outbound_call;
    }, err => {
      this.error = err.message;
    });

    //get extension voicemail setting
    this.callForwardService.extVoiceMailSetting(localStorage.getItem('id')).subscribe(data => {
      this.extensionHasVoiceMail = data.voicemail_setting;
    }, err => {
      this.error = err.message;
    });

    //get extension name and number
    this.extensionService.getExtensionNameandNumber(localStorage.getItem('id')).subscribe(data => {
      this.extensionInfo = data;
      this.filterOne = this.ExtensionOneFilter = this.extensionInfo.slice();
      this.filterTwo = this.ExtensionTwoFilter = this.extensionInfo.slice();
      this.filterthree = this.ExtensionThreeFilter = this.extensionInfo.slice();
      this.filterFour = this.ExtensionFourFilter = this.extensionInfo.slice();


    }, err => {
      this.error = err.message;
    });
    //get customer wise country
    this.commonService.customerWiseCountry(localStorage.getItem('id')).subscribe(data => {
      this.countryID = data.response[0];
      let uni_countryCode = this.callForwardForm.get('universal_country_code').value
      let busy_countryCode = this.callForwardForm.get('busy_country_code').value
      let noans_countryCode = this.callForwardForm.get('noanswer_country_code').value
      let unavailable_countryCode = this.callForwardForm.get('unavailable_country_code').value
      this.countryCode = '+' + data.response[0].phonecode;
      if(uni_countryCode == ""){
      this.callForwardForm.get('universal_country').setValue(this.countryID['id']);
      this.callForwardForm.get('universal_country_code').setValue(this.countryCode);
      }
      if(busy_countryCode ==""){
      this.callForwardForm.get('busy_country').setValue(this.countryID['id']);
      this.callForwardForm.get('busy_country_code').setValue(this.countryCode);
      }
      if(noans_countryCode == ""){
      this.callForwardForm.get('noanswer_country').setValue(this.countryID['id']);
      this.callForwardForm.get('noanswer_country_code').setValue(this.countryCode);
      }
      if(unavailable_countryCode == ""){
      this.callForwardForm.get('unavailable_country').setValue(this.countryID['id']);
      this.callForwardForm.get('unavailable_country_code').setValue(this.countryCode);
      }
      this.callForwardForm.updateValueAndValidity();
    }, err => {
      this.error = err.message;
    });

    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filterExOne = this.CountryOneFilter = this.countryList.slice();
      this.filterExTwo = this.CountryTwoFilter = this.countryList.slice();
      this.filterExThree = this.CountryThreeFilter = this.countryList.slice();
      this.filterExFour = this.CountryFourFilter = this.countryList.slice();

    }, err => {
      this.error = err.message;
    });
    //call forward exists
    this.callForwardService.viewCallForwardById({ id: Number(localStorage.getItem('id')) }).subscribe(data => {
      setTimeout(() => {
        if (data.length > 0) {
          this.callForwardData = data[0] ? data[0] : '0';
          this.universalExtension = this.callForwardData.universal_external;
          this.busyExternal = this.callForwardData.busy_external;
          this.noanswerExternal = this.callForwardData.noanswer_external;
          this.unavailableExternal = this.callForwardData.unavailable_external;
          this.callForwardExists = true;
          this.callForwardId = data ? data[0].id : null;
          this.countryCode = data[0].country_code ? data[0].country_code : '+91';
          this.callForwardData.country_id = this.callForwardData.country_id ? this.callForwardData.country_id : 99;
          if (data[0].universal_type == "2") {
            this.universalForwardType = true;
            this.universal = true;
            this.callForwardForm.controls.universal_external.enable();
            this.callForwardForm.controls.universal_country.enable();
          } else if (data[0].universal_type == "3") {
            this.universalForwardType = false;
            this.universal = false;
            this.universalForwardExtension = true;
            this.callForwardForm.controls.universal_extension.enable();
            this.universal_extension.setValue(Number(this.universalExtension));
          }
          if (data[0].busy_type == "2") {
            this.busyForwardType = true;
            this.busy = true;
            this.callForwardForm.controls.busy_external.enable();
            this.callForwardForm.controls.busy_country.enable();
          } else if (data[0].busy_type == "3") {
            this.busy = false;
            this.busyForwardType = false;
            this.busyForwardExtension = true;
            this.callForwardForm.controls.busy_extension.enable();
            this.busy_extension.setValue(Number(this.busyExternal));
          }
          if (data[0].noanswer_type == "2") {
            this.noanswer = true;
            this.noanswerForwardType = true;
            this.callForwardForm.controls.noanswer_external.enable();
            this.callForwardForm.controls.noanswer_country.enable();
          } else if (data[0].noanswer_type == "3") {
            this.noanswer = false;
            this.noanswerForwardType = false;
            this.noanswerForwardExtension = true;
            this.callForwardForm.controls.noanswer_extension.enable();
            this.noanswer_extension.setValue(Number(this.noanswerExternal));
          }
          if (data[0].unavailable_type == "2") {
            this.unavailable = true;
            this.unavailableForwardType = true;
            this.callForwardForm.controls.unavailable_external.enable();
            this.callForwardForm.controls.unavailable_country.enable();
          } else if (data[0].unavailable_type == '3') {
            this.unavailable = false;
            this.unavailableForwardType = false;
            this.unavailableForwardExtension = true;
            this.callForwardForm.controls.unavailable_extension.enable();
            this.unavailable_extension.setValue(Number(this.unavailableExternal));
          }

          if(this.callForwardData.universal_country) this.callForwardForm.get('universal_country').setValue(this.callForwardData.universal_country);
          if(this.callForwardData.universal_country_code !='0') this.callForwardForm.get('universal_country_code').setValue(this.callForwardData.universal_country_code);
          if(this.callForwardData.busy_country) this.callForwardForm.get('busy_country').setValue(this.callForwardData.busy_country);
          if(this.callForwardData.busy_country_code != '0') this.callForwardForm.get('busy_country_code').setValue(this.callForwardData.busy_country_code);
          if(this.callForwardData.noanswer_country) this.callForwardForm.get('noanswer_country').setValue(this.callForwardData.noanswer_country);
          if(this.callForwardData.noanswer_country_code !='0') this.callForwardForm.get('noanswer_country_code').setValue(this.callForwardData.noanswer_country_code);
          if(this.callForwardData.unavailable_country) this.callForwardForm.get('unavailable_country').setValue(this.callForwardData.unavailable_country);
          if(this.callForwardData.unavailable_country_code != '0') {
            this.callForwardForm.get('unavailable_country_code').setValue(this.callForwardData.unavailable_country_code);
          }
        } else {
          this.callForwardExists = false;
          this.callForwardId = null;
        }
      }, 500);
    });
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.countryList.filter((data) =>{
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Extensionremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.extensionInfo.filter((data) =>{
      return data['extension'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  getUniversalForwardType(event) {

    this.universalType = event.value;
    if (this.universalType == 0) {
      this.universal = false;
      this.universalForwardType = false;
      this.universalForwardExtension = false;
      this.callForwardForm.controls.universal_country.disable();
      this.callForwardForm.controls.universal_external.disable();
      this.callForwardForm.controls.universal_extension.disable();
      this.callForwardForm.controls.universal_country_code.disable();
    } else if (this.universalType == 1) {
      this.universal = false;
      this.universalForwardType = false;
      this.universalForwardExtension = false;
      this.callForwardForm.controls.universal_country.disable();
      this.callForwardForm.controls.universal_external.disable();
      this.callForwardForm.controls.universal_extension.disable();
    } else if (this.universalType == 2) {
      this.universal = false;
      this.universalForwardType = true;
      this.universalForwardExtension = false;
      this.callForwardForm.controls.universal_country.enable();
      this.callForwardForm.controls.universal_external.enable();
      this.callForwardForm.controls.universal_extension.disable();
    } else if (this.universalType == 3) {
      this.universal = false;
      this.universalForwardType = false;
      this.universalForwardExtension = true;
      this.callForwardForm.controls.universal_extension.enable();
      this.callForwardForm.controls.universal_country.disable();
      this.callForwardForm.controls.universal_external.disable();
    }
    else {
      this.universalForwardType = false;
      this.universal = false;
      this.universalForwardExtension = false;
      this.callForwardForm.controls.universal_country.disable();
      this.callForwardForm.controls.universal_external.disable();
      this.callForwardForm.controls.universal_extension.disable();
    }
  }
  getBusyForwardType(event) {
    this.busyType = event.value;
    if (this.busyType == 0) {
      this.busyForwardType = false;
      this.busy = false;
      this.busyForwardExtension = false;
      this.callForwardForm.controls.busy_country.disable();
      this.callForwardForm.controls.busy_external.disable();
      this.callForwardForm.controls.busy_extension.disable();
      this.callForwardForm.controls.busy_country_code.disable();
    } else if (this.busyType == 1) {
      this.busyForwardType = false;
      this.busyForwardExtension = false;
      this.busy = false;
      this.callForwardForm.controls.busy_country.disable();
      this.callForwardForm.controls.busy_external.disable();
      this.callForwardForm.controls.busy_extension.disable();
    } else if (this.busyType == 2) {
      this.busyForwardType = true;
      this.busy = false;
      this.busyForwardExtension = false;
      this.callForwardForm.controls.busy_country.enable();
      this.callForwardForm.controls.busy_external.enable();
      this.callForwardForm.controls.busy_extension.disable();
    } else if (this.busyType == 3) {
      this.busyForwardType = false;
      this.busy = false;
      this.busyForwardExtension = true;
      this.callForwardForm.controls.busy_country.disable();
      this.callForwardForm.controls.busy_external.disable();
      this.callForwardForm.controls.busy_extension.enable();
    } else {
      this.busyForwardType = false;
      this.busy = false;
      this.busyForwardExtension = false;
      this.callForwardForm.controls.busy_country.disable();
      this.callForwardForm.controls.busy_external.disable();
      this.callForwardForm.controls.busy_extension.disable();
    }
  }

  getNoanswerForwardType(event) {
    this.noanswerType = event.value;
    if (this.noanswerType == 0) {
      this.noanswer = false;
      this.noanswerForwardType = false;
      this.noanswerForwardExtension = false;
      this.callForwardForm.controls.noanswer_country.disable();
      this.callForwardForm.controls.noanswer_external.disable();
      this.callForwardForm.controls.noanswer_extension.disable();
      this.callForwardForm.controls.noanswer_country_code.disable();

    } else if (this.noanswerType == 1) {
      this.noanswer = false;
      this.noanswerForwardType = false;
      this.noanswerForwardExtension = false;
      this.callForwardForm.controls.noanswer_country.disable();
      this.callForwardForm.controls.noanswer_external.disable();
      this.callForwardForm.controls.noanswer_extension.disable();
    } else if (this.noanswerType == 2) {
      this.noanswer = false;
      this.noanswerForwardType = true;
      this.noanswerForwardExtension = false;
      this.callForwardForm.controls.noanswer_country.enable();
      this.callForwardForm.controls.noanswer_external.enable();
      this.callForwardForm.controls.noanswer_extension.disable();
    } else if (this.noanswerType == 3) {
      this.noanswer = false;
      this.noanswerForwardType = false;
      this.noanswerForwardExtension = true;
      this.callForwardForm.controls.noanswer_country.disable();
      this.callForwardForm.controls.noanswer_external.disable();
      this.callForwardForm.controls.noanswer_extension.enable();
    } else {
      this.noanswerForwardType = false;
      this.noanswer = false;
      this.noanswerForwardExtension = false;
      this.callForwardForm.controls.noanswer_country.disable();
      this.callForwardForm.controls.noanswer_external.disable();
      this.callForwardForm.controls.noanswer_extension.disable();
    }
  }

  getUnavailableForwardType(event) {
    this.unavailableType = event.value;
    if (this.unavailableType == 0) {
      this.unavailable = false;
      this.unavailableForwardType = false;
      this.unavailableForwardExtension = false;
      this.callForwardForm.controls.unavailable_country.disable();
      this.callForwardForm.controls.unavailable_external.disable();
      this.callForwardForm.controls.unavailable_extension.disable();
      this.callForwardForm.controls.unavailable_country_code.disable();
    } else if (this.unavailableType == 1) {
      this.unavailable = false;
      this.unavailableForwardType = false;
      this.unavailableForwardExtension = false;
      this.callForwardForm.controls.unavailable_country.disable();
      this.callForwardForm.controls.unavailable_external.disable();
      this.callForwardForm.controls.unavailable_extension.disable();
    } else if (this.unavailableType == 2) {
      this.unavailable = false;
      this.unavailableForwardType = true;
      this.unavailableForwardExtension = false;
      this.callForwardForm.controls.unavailable_country.enable();
      this.callForwardForm.controls.unavailable_external.enable();
      this.callForwardForm.controls.unavailable_extension.disable();
    } else if (this.unavailableType == 3) {
      this.unavailable = false;
      this.unavailableForwardType = false;
      this.unavailableForwardExtension = true;
      this.callForwardForm.controls.unavailable_country.disable();
      this.callForwardForm.controls.unavailable_external.disable();
      this.callForwardForm.controls.unavailable_extension.enable();
    } else {
      this.unavailable = false;
      this.unavailableForwardType = false;
      this.unavailableForwardExtension = false;
      this.callForwardForm.controls.unavailable_country.disable();
      this.callForwardForm.controls.unavailable_external.disable();
      this.callForwardForm.controls.unavailable_extension.disable();
    }
  }


  // getCountryCode(event) {
  //   let country_id = event.value;
  //   this.commonService.getCountryById(country_id).subscribe(data => {
  //     this.countryCode = '+' + data.response[0].phonecode;
  //   }, err => {
  //     this.error = err.message;
  //   });
  // }

  getCountryCode(event,formControlName) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode = '+' + data.response[0].phonecode;
      this.callForwardForm.get(formControlName).setValue(this.countryCode);
    }, err => {
      this.error = err.message;
    });
  }

  submitCallForwardForm() {
    this.submitted = true;
    const credentials = this.callForwardForm.value;

    if (!credentials.unavailable_type) {
      credentials.unavailable_type = "0";
    }
    if (!credentials.busy_type) {
      credentials.busy_type = "0";
    }
    if (!credentials.noanswer_type) {
      credentials.noanswer_type = "0"
    }
    if (!credentials.universal_type) {
      credentials.universal_type = "0"
    }

    if (credentials.unavailable_type == "3" && (credentials.unavailable_extension == "" || credentials.unavailable_extension == null)) {
      this.toastr.error('Error!', "Unavailable extension can't be blank", { timeOut: 2000 });
      return;
    }
    if (credentials.universal_type == "3" && (credentials.universal_extension == "" || credentials.universal_extension == null)) {
      this.toastr.error('Error!', blankNumber, { timeOut: 2000 });
      return;
    }
    if (credentials.busy_type == "3" && (credentials.busy_extension == "" || credentials.busy_extension == null)) {
      this.toastr.error('Error!', "Busy extension can't be blank", { timeOut: 2000 });
      return;
    }
    if (credentials.noanswer_type == "3" && (credentials.noanswer_extension == "" || credentials.noanswer_extension == null)) {
      this.toastr.error('Error!', "No answer extension can't be blank", { timeOut: 2000 });
      return;
    }

    if (credentials.unavailable_type == "2" && (credentials.unavailable_external == "" || credentials.unavailable_external == null)) {
      this.toastr.error('Error!', "Unavailable external can't be blank", { timeOut: 2000 });
      return;
    } else if (credentials.unavailable_type == "2" && credentials.unavailable_external < 1000000000) {
      this.toastr.error('Error!', numberLength, { timeOut: 2000 });
      return;
    }
    if (credentials.universal_type == "2" && (credentials.universal_external == "" || credentials.universal_external == null)) {
      this.toastr.error('Error!', blankNumber, { timeOut: 2000 });
      return;
    } else if (credentials.universal_type == "2" && credentials.universal_external < 1000000000) {
      this.toastr.error('Error!', numberLength, { timeOut: 2000 });
      return;
    }

    if (credentials.busy_type == '2' && (credentials.busy_external == '' || credentials.busy_external == null)) {
      this.toastr.error('Error!', blankNumber, { timeOut: 2000 });
      return;
    } else if (credentials.busy_type == "2" && credentials.busy_external < 1000000000) {
      this.toastr.error('Error!', numberLength, { timeOut: 2000 });
      return;
    }

    if (credentials.noanswer_type == "2" && (credentials.noanswer_external == "" || credentials.noanswer_external == null)) {
      this.toastr.error('Error!', blankNumber, { timeOut: 2000 });
      return;
    } else if (credentials.noanswer_type == "2" && credentials.noanswer_external < 1000000000) {
      this.toastr.error('Error!', numberLength, { timeOut: 2000 });
      return;
    }
    credentials.extension_id = localStorage.getItem('id');
    credentials.id = this.callForwardId ? this.callForwardId : null;

    this.callForwardService.createCallForward('createCallForward', credentials)
      .subscribe(data => {
        if (data['code'] == 200) {
          this.toastr.success('Success!', data['message'], { timeOut: 2000 });
          this.router.navigateByUrl('dashboard/extensionDashboard');
        }
        else {
          this.toastr.error('Error!', data['message'], { timeOut: 2000 });
        }
      });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCallForwardDialog, {
      width: '80%', disableClose: true, autoFocus:false,
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
  selector: 'infoCallForward-dialog',
  templateUrl: 'infoCallForward-dialog.html',
})

export class InfoCallForwardDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCallForwardDialog>, @Inject(MAT_DIALOG_DATA) public data:Callforward,
  ) {}

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
