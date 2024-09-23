import { Component, OnInit,Inject } from '@angular/core';
import { CommonService, Number_RegEx } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router,NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpeeddialService } from '../speeddial.service';
import { ExtensionService } from '../../extension/extension.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CallForwardService } from '../../call-forward/call-forward.service';
import { CallgroupService } from '../../call-group/call-group.service';

export var PSTNcheck = false;

@Component({
  selector: 'app-speed-dial-features',
  templateUrl: './speed-dial-features.component.html',
  styleUrls: ['./speed-dial-features.component.css']
})
export class SpeedDialFeaturesComponent implements OnInit {
  speedDialForm: FormGroup;
  submitted = false;
  checkForm: any;
  extensionInfo: any = {};
  filterExOne:any;
  ExOneFilter:any;
  filterExTwo:any;
  ExTwoFilter:any;
  filterExThree:any;
  ExThreeFilter:any;
  filterExFour:any;
  ExFourFilter:any;
  filterExFive:any;
  ExSixFilter:any;
  ExFiveFilter:any;
  filterExSix:any;
  ExSevFilter:any;
  filterExSev:any;
  filterExEig:any;
  ExEigFilter:any;
  filterExNine:any;
  ExNineFilter:any;
  filterExTen:any;
  ExTenFilter:any;
  countryList:any = "";
  filterConOne:any;
  CountryOneFilter:any;
  filterConTwo:any;
  CountryTwoFilter:any;
  filterConThree:any;
  CountryThreeFilter:any;
  filterConFour:any;
  CountryFourFilter:any;
  filterConFive:any;
  CountryFiveFilter:any;
  filterConSix:any;
  CountrySixFilter:any;
  filterConSev:any;
  CountrySevFilter:any;
  filterConEig:any;
  CountryEigFilter:any;
  filterConNine:any;
  CountryNineFilter:any;
  filterConTen:any;
  CountryTenFilter:any;
  countryCode = "";
  countryCode0 = "";
  countryCode1 = "";
  countryCode2 = "";
  countryCode3 = "";
  countryCode4 = "";
  countryCode5 = "";
  countryCode6 = "";
  countryCode7 = "";
  countryCode8 = "";
  countryCode9 = "";
  speeddial0  = '';
  speeddial1 = '';
  speeddial2 = '';
  speeddial3 = '';
  speeddial4 = '';
  speeddial5 = '';
  speeddial6 = '';
  speeddial7 = '';
  speeddial8 = '';
  speeddial9 = '';
  speeddialNumber0 = false;
  digi0_number = '0';
  speeddialNumber1 = false;
  digi1_number = '0';
  speeddialNumber2 = false;
  digi2_number = '0';
  speeddialNumber3 = false;
  digi3_number = '0';
  speeddialNumber4 = false;
  digi4_number = '0';
  speeddialNumber5 = false;
  digi5_number = '0';
  speeddialNumber6 = false;
  digi6_number = '0';
  speeddialNumber7 = false;
  digi7_number = '0';
  speeddialNumber8 = false;
  digi8_number = '0';
  speeddialNumber9 = false;
  digi9_number = '0';
  extNumber0 = "";
  extNumber1 = "";
  extNumber2 = "";
  extNumber3 = "";
  extNumber4 = "";
  extNumber5 = "";
  extNumber6 = "";
  extNumber7 = "";
  extNumber8 = "";
  extNumber9 = "";
  countryDigit = false;
  countryID: any = {};
  country_id0 = "";
  country_id1 = "";
  country_id2 = "";
  country_id3 = "";
  country_id4 = "";
  country_id5 = "";
  country_id6 = "";
  country_id7 = "";
  country_id8 = "";
  country_id9 = "";
  country_Code0 = "";
  country_Code1 = "";
  country_Code2 = "";
  country_Code3 = "";
  country_Code4 = "";
  country_Code5 = "";
  country_Code6 = "";
  country_Code7 = "";
  country_Code8 = "";
  country_Code9 = "";
  callGroupValue0 ;
  callGroupValue1 ;
  callGroupValue2 ;
  callGroupValue3 ;
  callGroupValue4 ;
  callGroupValue5 ;
  callGroupValue6 ;
  callGroupValue7 ;
  callGroupValue8 ;
  callGroupValue9 ;
  countryExists0 = false;
  countryExists1 = false;
  countryExists2 = false;
  countryExists3 = false;
  countryExists4 = false;
  countryExists5 = false;
  countryExists6 = false;
  countryExists7 = false;
  countryExists8 = false;
  countryExists9 = false;
  error = '';
  speeddialExists = false;
  speeddialData: any = {}
  theCheckbox0 = true;
  theCheckbox1 = true;
  theCheckbox2 = true;
  theCheckbox3 = true;
  theCheckbox4 = true;
  theCheckbox5 = true;
  theCheckbox6 = true;
  theCheckbox7 = true;
  theCheckbox8 = true;
  theCheckbox9 = true;
  cg0 = false;
  cg1 = false;
  cg2 = false;
  cg3 = false;
  cg4 = false;
  cg5 = false;
  cg6 = false;
  cg7 = false;
  cg8 = false;
  cg9 = false;
  cgList = [];
  public fields1: Object = { text: 'name', value: 'id' };
  public fields: Object = { text: 'extension', value: 'ext_number' };
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';
  public placeholder1: string = 'Select Extension';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public popupWidth1: string = '200px';
  pstnCheck: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private speeddialService: SpeeddialService,
    private extensionService: ExtensionService,
    public dialog: MatDialog,
    private callForwardService: CallForwardService,
    private callgroupService : CallgroupService
  ) {
    this.speedDialForm = this.formBuilder.group({
      'digit0': ['*0'],
      'extension0': ['0'],
      'digit0_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit1': ['*1'],
      'extension1': ['0'],
      'digit1_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit2': ['*2'],
      'extension2': ['0'],
      'digit2_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit3': ['*3'],
      'extension3': ['0'],
      'digit3_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit4': ['*4'],
      'extension4': ['0'],
      'digit4_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit5': ['*5'],
      'extension5': ['0'],
      'digit5_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit6': ['*6'],
      'extension6': ['0'],
      'digit6_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit7': ['*7'],
      'extension7': ['0'],
      'digit7_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit8': ['*8'],
      'extension8': ['0'],
      'digit8_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'digit9': ['*9'],
      'extension9': ['0'],
      'digit9_number': ['', [Validators.required, Validators.pattern(Number_RegEx)]],
      'country0': [99, Validators.required],
      'country1': [99, Validators.required],
      'country2': [99, Validators.required],
      'country3': [99, Validators.required],
      'country4': [99, Validators.required],
      'country5': [99, Validators.required],
      'country6': [99, Validators.required],
      'country7': [99, Validators.required],
      'country8': [99, Validators.required],
      'country9': [99, Validators.required],
      'country_code0': [''],
      'country_code1': [''],
      'country_code2': [''],
      'country_code3': [''],
      'country_code4': [''],
      'country_code5': [''],
      'country_code6': [''],
      'country_code7': [''],
      'country_code8': [''],
      'country_code9': [''],
      'callGroup0': [''],
      'callGroup1': [''],
      'callGroup2': [''],
      'callGroup3': [''],
      'callGroup4': [''],
      'callGroup5': [''],
      'callGroup6': [''],
      'callGroup7': [''],
      'callGroup8': [''],
      'callGroup9': [''],

    });
  }


  get digit0_number() { return this.speedDialForm.get('digit0_number'); }
  get digit1_number() { return this.speedDialForm.get('digit1_number'); }
  get digit2_number() { return this.speedDialForm.get('digit2_number'); }
  get digit3_number() { return this.speedDialForm.get('digit3_number'); }
  get digit4_number() { return this.speedDialForm.get('digit4_number'); }
  get digit5_number() { return this.speedDialForm.get('digit5_number'); }
  get digit6_number() { return this.speedDialForm.get('digit6_number'); }
  get digit7_number() { return this.speedDialForm.get('digit7_number'); }
  get digit8_number() { return this.speedDialForm.get('digit8_number'); }
  get digit9_number() { return this.speedDialForm.get('digit9_number'); }
  get country0() { return this.speedDialForm.get('country0'); }
  get country1() { return this.speedDialForm.get('country1'); }
  get country2() { return this.speedDialForm.get('country2'); }
  get country3() { return this.speedDialForm.get('country3'); }
  get country4() { return this.speedDialForm.get('country4'); }
  get country5() { return this.speedDialForm.get('country5'); }
  get country6() { return this.speedDialForm.get('country6'); }
  get country7() { return this.speedDialForm.get('country7'); }
  get country8() { return this.speedDialForm.get('country8'); }
  get country9() { return this.speedDialForm.get('country9'); }

  ngOnInit() {
    this.speedDialForm.controls.country0.disable();
    this.speedDialForm.controls.country1.disable();
    this.speedDialForm.controls.country2.disable();
    this.speedDialForm.controls.country3.disable();
    this.speedDialForm.controls.country4.disable();
    this.speedDialForm.controls.country5.disable();
    this.speedDialForm.controls.country6.disable();
    this.speedDialForm.controls.country7.disable();
    this.speedDialForm.controls.country8.disable();
    this.speedDialForm.controls.country9.disable();
    this.speedDialForm.controls.digit0_number.disable();
    this.speedDialForm.controls.digit1_number.disable();
    this.speedDialForm.controls.digit2_number.disable();
    this.speedDialForm.controls.digit3_number.disable();
    this.speedDialForm.controls.digit4_number.disable();
    this.speedDialForm.controls.digit5_number.disable();
    this.speedDialForm.controls.digit6_number.disable();
    this.speedDialForm.controls.digit7_number.disable();
    this.speedDialForm.controls.digit8_number.disable();
    this.speedDialForm.controls.digit9_number.disable();

    //get customer wise country
    this.commonService.customerWiseCountry(localStorage.getItem('id')).subscribe(data => {
      this.countryID = data.response[0];
      this.countryCode = '+' + data.response[0].phonecode;
      this.countryCode0 = '+' + data.response[0].phonecode;
      this.countryCode1 = '+' + data.response[0].phonecode;
      this.countryCode2 = '+' + data.response[0].phonecode;
      this.countryCode3 = '+' + data.response[0].phonecode;
      this.countryCode4 = '+' + data.response[0].phonecode;
      this.countryCode5 = '+' + data.response[0].phonecode;
      this.countryCode6 = '+' + data.response[0].phonecode;
      this.countryCode7 = '+' + data.response[0].phonecode;
      this.countryCode8 = '+' + data.response[0].phonecode;
      this.countryCode9 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });

    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filterConOne = this.CountryOneFilter = this.countryList.slice();
      this.filterConTwo = this.CountryTwoFilter = this.countryList.slice();
      this.filterConThree = this.CountryThreeFilter = this.countryList.slice();
      this.filterConFour = this.CountryFourFilter = this.countryList.slice();
      this.filterConFive = this.CountryFiveFilter = this.countryList.slice();
      this.filterConSix = this.CountrySixFilter = this.countryList.slice();
      this.filterConSev = this.CountrySevFilter = this.countryList.slice();
      this.filterConEig = this.CountryEigFilter = this.countryList.slice();
      this.filterConNine = this.CountryNineFilter = this.countryList.slice();
      this.filterConTen = this.CountryTenFilter = this.countryList.slice();

    
    }, err => {
      this.error = err.message;
    });

    //get extension name and number
    this.extensionService.getExtensionNameandNumber(localStorage.getItem('id')).subscribe(data => {
      this.extensionInfo = data;
      this.filterExOne = this.ExOneFilter = this.extensionInfo.slice()
      this.filterExTwo = this.ExTwoFilter = this.extensionInfo.slice()
      this.filterExThree = this.ExThreeFilter = this.ExThreeFilter = this.extensionInfo.slice()
      this.filterExFour = this.ExFourFilter = this.extensionInfo.slice()
      this.filterExFive = this.ExFiveFilter = this.extensionInfo.slice()
      this.filterExSix = this.ExSixFilter = this.extensionInfo.slice()
      this.filterExSev = this.ExSevFilter = this.extensionInfo.slice()
      this.filterExEig = this.ExEigFilter = this.extensionInfo.slice()
      this.filterExNine = this.ExNineFilter = this.extensionInfo.slice()
      this.filterExTen = this.ExTenFilter = this.extensionInfo.slice()
      this.extensionInfo.unshift({extension:'Select Extension' , ext_number: '0'})

      this.getSpeedDialById();

    }, err => {
      this.error = err.message;
    });
    this.callForwardService.onlyOutboundStatus(localStorage.getItem('id')).subscribe(data => {
      if(data.response[0]['outbound'] == 1){
      this.pstnCheck = true;
    }  
  })

  this.callgroupService.getCallgroup({ id: null, name: null, 'customer_id': Number(localStorage.getItem('cid')) }).subscribe(data => {
    this.cgList = data;        
    });
  }

  getSpeedDialById() {
    this.speeddialService.viewSpeedDialById({ id: Number(localStorage.getItem('id')) }).subscribe(data => {
      if (data) {                        
        this.speeddialData = data[0] ? data[0] : "0";
        this.speeddialExists = true;
        for (let i = 0; i <= 9; i++) {                    
          if (data[i].digit == '*0') {
            this.speeddial0 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi0_number = '0';
              this.speeddialNumber0 = false;
              this.countryExists0 = false;
              this.cg0 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi0_number = data[i].number;
              this.speeddialNumber0 = true;
              this.countryExists0 = false;
              this.cg0 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber0 = data[i].phoneNumber;
              this.country_id0 = data[i].country_id;
              this.country_Code0 = data[i].country_code;
              this.countryExists0 = true;
              this.speeddialNumber0 = false;
              this.theCheckbox0 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country0.enable();
              this.speedDialForm.controls.digit0_number.enable();
              this.cg0 = false;
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue0 =  Number(data[i].number)
              },500);                            
              this.cg0 = true;
              this.speeddialNumber0 = false;
              this.theCheckbox0 = false;
              this.countryExists0 = false;

            }
          }
          if (data[i].digit == '*1') {
            this.speeddial1 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi1_number = '0';
              this.speeddialNumber1 = false;
              this.countryExists1 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi1_number = data[i].number;
              this.speeddialNumber1 = true;
              this.countryExists1 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber1 = data[i].phoneNumber;
              this.country_id1 = data[i].country_id;
              this.country_Code1 = data[i].country_code;
              this.countryExists1 = true;
              this.speeddialNumber1 = false;
              this.theCheckbox1 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country1.enable();
              this.speedDialForm.controls.digit1_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue1 =  Number(data[i].number)                                
              },500);
              this.cg1 = true;
              this.speeddialNumber1 = false;
              this.theCheckbox1 = false;
              this.countryExists1 = false;
            }
          }
          if (data[i].digit == '*2') {
            this.speeddial2 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi2_number = '0';
              this.speeddialNumber2 = false;
              this.countryExists2 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi2_number = data[i].number;
              this.speeddialNumber2 = true;
              this.countryExists2 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber2 = data[i].phoneNumber;
              this.country_id2 = data[i].country_id;
              this.country_Code2 = data[i].country_code;
              this.countryExists2 = true;
              this.speeddialNumber2 = false;
              this.theCheckbox2 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country2.enable();
              this.speedDialForm.controls.digit2_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue2 =  Number(data[i].number)
              },500);
              this.cg2 = true;
              this.speeddialNumber2 = false;
              this.theCheckbox2 = false;
              this.countryExists2 = false;

            }
          }
          if (data[i].digit == '*3') {
           this.speeddial3 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi3_number = '0';
              this.speeddialNumber3 = false;
              this.countryExists3 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi3_number = data[i].number;
              this.speeddialNumber3 = true;
              this.countryExists3 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber3 = data[i].phoneNumber;
              this.country_id3 = data[i].country_id;
              this.country_Code3 = data[i].country_code;
              this.countryExists3 = true;
              this.speeddialNumber3 = false;
              this.theCheckbox3 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country3.enable();
              this.speedDialForm.controls.digit3_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue3 =  Number(data[i].number)
              },500);
              this.cg3 = true;
              this.speeddialNumber3 = false;
              this.theCheckbox3 = false;
              this.countryExists3 = false;

            }
          }
          if (data[i].digit == '*4') {
            this.speeddial4 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi4_number = '0';
              this.speeddialNumber4 = false;
              this.countryExists4 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi4_number = data[i].number;
              this.speeddialNumber4 = true;
              this.countryExists4 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber4 = data[i].phoneNumber;
              this.country_id4 = data[i].country_id;
              this.country_Code4 = data[i].country_code;
              this.countryExists4 = true;
              this.speeddialNumber4 = false;
              this.theCheckbox4 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country4.enable();
              this.speedDialForm.controls.digit4_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue4 =  Number(data[i].number)
              },500);
              this.cg4 = true;
              this.speeddialNumber4 = false;
              this.theCheckbox4 = false;
              this.countryExists4 = false;

            }
          }
          if (data[i].digit == '*5') {
            this.speeddial5 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi5_number = '0';
              this.speeddialNumber5 = false;
              this.countryExists5 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi5_number = data[i].number;
              this.speeddialNumber5 = true;
              this.countryExists5 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber5 = data[i].phoneNumber;
              this.country_id5 = data[i].country_id;
              this.country_Code5 = data[i].country_code;
              this.countryExists5 = true;
              this.speeddialNumber5 = false;
              this.theCheckbox5 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country5.enable();
              this.speedDialForm.controls.digit5_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue5 =  Number(data[i].number)
              },500);
              this.cg5 = true;
              this.speeddialNumber5 = false;
              this.theCheckbox5 = false;
              this.countryExists5 = false;

            }
          }
          if (data[i].digit == '*6') {
            this.speeddial6 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi6_number = '0';
              this.speeddialNumber6 = false;
              this.countryExists6 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi6_number = data[i].number;
              this.speeddialNumber6 = true;
              this.countryExists6 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber6 = data[i].phoneNumber;
              this.country_id6 = data[i].country_id;
              this.country_Code6 = data[i].country_code;
              this.countryExists6 = true;
              this.speeddialNumber6 = false;
              this.theCheckbox6 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country6.enable();
              this.speedDialForm.controls.digit6_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue6 =  Number(data[i].number)
              },500);
              this.cg6 = true;
              this.speeddialNumber6 = false;
              this.theCheckbox6 = false;
              this.countryExists6 = false;

            }
          }
          if (data[i].digit == '*7') {
            this.speeddial7 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi7_number = '0';
              this.speeddialNumber7 = false;
              this.countryExists7 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi7_number = data[i].number;
              this.speeddialNumber7 = true;
              this.countryExists7 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber7 = data[i].phoneNumber;
              this.country_id7 = data[i].country_id;
              this.country_Code7 = data[i].country_code;
              this.countryExists7 = true;
              this.speeddialNumber7 = false;
              this.theCheckbox7 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country7.enable();
              this.speedDialForm.controls.digit7_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue7 =  Number(data[i].number)
              },500);
              this.cg7 = true;
              this.speeddialNumber7 = false;
              this.theCheckbox7 = false;
              this.countryExists7 = false;

            }
          }
          if (data[i].digit == '*8') {
            this.speeddial8 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi8_number = '0';
              this.speeddialNumber8 = false;
              this.countryExists8 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi8_number = data[i].number;
              this.speeddialNumber8 = true;
              this.countryExists8 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber8 = data[i].phoneNumber;
              this.country_id8 = data[i].country_id;
              this.country_Code8 = data[i].country_code;
              this.countryExists8 = true;
              this.speeddialNumber8 = false;
              this.theCheckbox8 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country8.enable();
              this.speedDialForm.controls.digit8_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue8 =  Number(data[i].number)
              },500);
              this.cg8 = true;
              this.speeddialNumber8 = false;
              this.theCheckbox8 = false;
              this.countryExists8 = false;

            }
          }
          if (data[i].digit == '*9') {
            this.speeddial9 = data[i].speeddialNumber;
            if (data[i].speeddialNumber == '0') {
              this.digi9_number = '0';
              this.speeddialNumber9 = false;
              this.countryExists9 = false;
            }
            if (data[i].speeddialNumber == '1') {
              this.digi9_number = data[i].number;
              this.speeddialNumber9 = true;
              this.countryExists9 = false;
            }
            if (data[i].speeddialNumber == '2') {
              this.extNumber9 = data[i].phoneNumber;
              this.country_id9 = data[i].country_id;
              this.country_Code9 = data[i].country_code;
              this.countryExists9 = true;
              this.speeddialNumber9 = false;
              this.theCheckbox9 = false;
              PSTNcheck = true;
              this.speedDialForm.controls.country9.enable();
              this.speedDialForm.controls.digit9_number.enable();
            }
            if(data[i].speeddialNumber == '-1'){
              setTimeout(() => {
                this.callGroupValue9 =  Number(data[i].number)
              },500);
              this.cg9 = true;
              this.speeddialNumber9 = false;
              this.theCheckbox9 = false;
              this.countryExists9 = false;

            }
          }
        }
      } else {
        this.speeddialExists = false;
      }
    }, err => {
      this.error = err.message;
    });
  }
  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
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

  submitspeedDialForm() {
    // this.checkForm = this.findInvalidControls();
    // if (this.speedDialForm.valid) {
    this.submitted = true;
    const credentials = this.speedDialForm.value;
    credentials.extension_id = localStorage.getItem('id');
    credentials.speeddial0 = this.speeddial0
    credentials.speeddial1 = this.speeddial1
    credentials.speeddial2 = this.speeddial2
    credentials.speeddial3 = this.speeddial3
    credentials.speeddial4 = this.speeddial4
    credentials.speeddial5 = this.speeddial5
    credentials.speeddial6 = this.speeddial6
    credentials.speeddial7 = this.speeddial7
    credentials.speeddial8 = this.speeddial8
    credentials.speeddial9 = this.speeddial9    
    // return
    

    for (let i = 0; i < 10; i++) {
      if (PSTNcheck == true && credentials['digit' + i + '_number'] == "") {
        this.toastr.error('Error!', "Digit *" + [i] + " Number can't be blank", { timeOut: 2000 });
        return;
      }
      if (PSTNcheck == true && credentials['digit' + i + '_number'] < 1000000000) {
        this.toastr.error('Error!', "Digit *" + [i] + " Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
        return;
      }
      if (PSTNcheck == true && credentials['digit' + i + '_number']) {
        credentials['extension' + i] = "0";
      }
      // else if (PSTNcheck == false && credentials['extension' + i] == "0") {
      //   credentials['country_code' + i] = "";
      // }
    }
    // if (PSTNcheck == true && credentials.digit0_number == "") {
    //   this.toastr.error('Error!', "Digit *0 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit0_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *0 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit0_number) {
    //   credentials.extension0 = "0";
    // } else if (PSTNcheck == false && credentials.extension0 == "0") {
    //   credentials.country_code0 = "";
    // }

    // if (PSTNcheck == true && credentials.digit1_number == "") {
    //   this.toastr.error('Error!', "Digit *1 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit1_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *1 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit1_number) {
    //   credentials.extension1 = "0";
    // }else if (PSTNcheck == false && credentials.extension1 == "0") {
    //   credentials.country_code1 = "";
    // }

    // if (PSTNcheck == true && credentials.digit2_number == "") {
    //   this.toastr.error('Error!', "Digit *2 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit2_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *2 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit2_number) {
    //   credentials.extension2 = "0";
    // }else if (PSTNcheck == false && credentials.extension2 == "0") {
    //   credentials.country_code2 = "";
    // }

    // if (PSTNcheck == true && credentials.digit3_number == "") {
    //   this.toastr.error('Error!', "Digit *3 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit3_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *3 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit3_number) {
    //   credentials.extension3 = "0";
    // }else if (PSTNcheck == false && credentials.extension3 == "0") {
    //   credentials.country_code3 = "";
    // }

    // if (PSTNcheck == true && credentials.digit4_number == "") {
    //   this.toastr.error('Error!', "Digit *4 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit4_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *4 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit4_number) {
    //   credentials.extension4 = "0";
    // }else if (PSTNcheck == false && credentials.extension4 == "0") {
    //   credentials.country_code4 = "";
    // }

    // if (PSTNcheck == true && credentials.digit5_number == "") {
    //   this.toastr.error('Error!', "Digit *5 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit5_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *5 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit5_number) {
    //   credentials.extension5 = "0";
    // }else if (PSTNcheck == false && credentials.extension5 == "0") {
    //   credentials.country_code5 = "";
    // }

    // if (PSTNcheck == true && credentials.digit6_number == "") {
    //   this.toastr.error('Error!', "Digit *6 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit6_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *6 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit6_number) {
    //   credentials.extension6 = "0";
    // }else if (PSTNcheck == false && credentials.extension6 == "0") {
    //   credentials.country_code6 = "";
    // }

    // if (PSTNcheck == true && credentials.digit7_number == "") {
    //   this.toastr.error('Error!', "Digit *7 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit7_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *7 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit7_number) {
    //   credentials.extension7 = "0";
    // }else if (PSTNcheck == false && credentials.extension7 == "0") {
    //   credentials.country_code7 = "";
    // }

    // if (PSTNcheck == true && credentials.digit8_number == "") {
    //   this.toastr.error('Error!', "Digit *8 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit8_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *8 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit8_number) {
    //   credentials.extension8 = "0";
    // }else if (PSTNcheck == false && credentials.extension8 == "0") {
    //   credentials.country_code8 = "";
    // }

    // if (PSTNcheck == true && credentials.digit9_number == "") {
    //   this.toastr.error('Error!', "Digit *9 Number can't be blank", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit9_number < 1000000000) {
    //   this.toastr.error('Error!', "Digit *9 Number can't start with 0 or less than 10 digits.", { timeOut: 2000 });
    //   return;
    // } else if (PSTNcheck == true && credentials.digit9_number) {
    //   credentials.extension9 = "0";
    // }else if (PSTNcheck == false && credentials.extension9 == "0") {
    //   credentials.country_code9 = "";
    // }


    let arrVal = [];
    for (let i = 0; i < 10; i++) {      
      if (credentials['extension' + i] != "0" || credentials['callGroup' + i] != "" ) {        
        let country = credentials['speeddial' + i] == -1 ? credentials['speeddial' + i] : "0";
        let digitNumber = credentials['extension' + i] !== "0" ? credentials['extension' + i] : credentials['callGroup' + i];        
        arrVal.push({
          'digit': credentials['digit' + i],
          'extension': credentials['extension' + i],
          'digit_number': digitNumber,
          // 'country': "0"
          'country': country
        })

      }
      if (credentials['extension' + i] == "0" && credentials['digit' + i + '_number']) {  
        arrVal.push({
          'digit': credentials['digit' + i],
          'extension': 0,
          'digit_number': credentials['country_code' + i] + credentials['digit' + i + '_number'],
          'country': credentials['country' + i]
        })

      }
    }
    this.speeddialService.createSpeedDial({ extid: Number(credentials.extension_id), arr_val: JSON.stringify(arrVal) })
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


  public findInvalidControls() {
    const invalid = [];
    const controls = this.speedDialForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  getCountryCode(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }

  getCountryCode0(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.country_Code0 = '+' + data.response[0].phonecode;
      this.countryCode0 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode1(event) {
    let country_id1 = event.value;
    this.commonService.getCountryById(country_id1).subscribe(data => {
      this.country_Code1 = '+' + data.response[0].phonecode;
      this.countryCode1 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode2(event) {
    let country_id2 = event.value;
    this.commonService.getCountryById(country_id2).subscribe(data => {
      this.country_Code2 = '+' + data.response[0].phonecode;
      this.countryCode2 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode3(event) {
    let country_id3 = event.value;
    this.commonService.getCountryById(country_id3).subscribe(data => {
      this.country_Code3 = '+' + data.response[0].phonecode;
      this.countryCode3 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode4(event) {
    let country_id4 = event.value;
    this.commonService.getCountryById(country_id4).subscribe(data => {
      this.country_Code4 = '+' + data.response[0].phonecode;
      this.countryCode4 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode5(event) {
    let country_id5 = event.value;
    this.commonService.getCountryById(country_id5).subscribe(data => {
      this.country_Code5 = '+' + data.response[0].phonecode;
      this.countryCode5 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode6(event) {
    let country_id6 = event.value;
    this.commonService.getCountryById(country_id6).subscribe(data => {
      this.country_Code6 = '+' + data.response[0].phonecode;
      this.countryCode6 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode7(event) {
    let country_id7 = event.value;
    this.commonService.getCountryById(country_id7).subscribe(data => {
      this.country_Code7 = '+' + data.response[0].phonecode;
      this.countryCode7 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode8(event) {
    let country_id8 = event.value;
    this.commonService.getCountryById(country_id8).subscribe(data => {
      this.country_Code8 = '+' + data.response[0].phonecode;
      this.countryCode8 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode9(event) {
    let country_id9 = event.value;
    this.commonService.getCountryById(country_id9).subscribe(data => {
      this.country_Code9 = '+' + data.response[0].phonecode;
      this.countryCode9 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }


  toggleVisibility0(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox0 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country0.enable();
      this.speedDialForm.controls.digit0_number.enable();
    } else {
      this.theCheckbox0 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country0.disable();
      this.speedDialForm.controls.digit0_number.disable();
    }
  }
  toggleVisibility1(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox1 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country1.enable();
      this.speedDialForm.controls.digit1_number.enable();
    } else {
      this.theCheckbox1 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country1.disable();
      this.speedDialForm.controls.digit1_number.disable();
    }
  }
  toggleVisibility2(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox2 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country2.enable();
      this.speedDialForm.controls.digit2_number.enable();
    } else {
      this.theCheckbox2 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country2.disable();
      this.speedDialForm.controls.digit2_number.disable();
    }
  }
  toggleVisibility3(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox3 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country3.enable();
      this.speedDialForm.controls.digit3_number.enable();
    } else {
      this.theCheckbox3 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country3.disable();
      this.speedDialForm.controls.digit3_number.disable();
    }
  }
  toggleVisibility4(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox4 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country4.enable();
      this.speedDialForm.controls.digit4_number.enable();
    } else {
      this.theCheckbox4 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country4.disable();
      this.speedDialForm.controls.digit4_number.disable();
    }
  }
  toggleVisibility5(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox5 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country5.enable();
      this.speedDialForm.controls.digit5_number.enable();
    } else {
      this.theCheckbox5 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country5.disable();
      this.speedDialForm.controls.digit5_number.disable();
    }
  }
  toggleVisibility6(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox6 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country6.enable();
      this.speedDialForm.controls.digit6_number.enable();
    } else {
      this.theCheckbox6 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country6.disable();
      this.speedDialForm.controls.digit6_number.disable();
    }
  }
  toggleVisibility7(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox7 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country7.enable();
      this.speedDialForm.controls.digit7_number.enable();
    } else {
      this.theCheckbox7 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country7.disable();
      this.speedDialForm.controls.digit7_number.disable();
    }
  }
  toggleVisibility8(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox8 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country8.enable();
      this.speedDialForm.controls.digit8_number.enable();
    } else {
      this.theCheckbox8 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country8.disable();
      this.speedDialForm.controls.digit8_number.disable();
    }
  }
  toggleVisibility9(e) {
    let value = e.target.checked;
    if (value === true) {
      this.theCheckbox9 = false;
      PSTNcheck = true;
      this.speedDialForm.controls.country9.enable();
      this.speedDialForm.controls.digit9_number.enable();
    } else {
      this.theCheckbox9 = true;
      PSTNcheck = false;
      this.speedDialForm.controls.country9.disable();
      this.speedDialForm.controls.digit9_number.disable();
    }
  }
  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoSpeeddialDialog, {
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
  selector: 'infoSpeeddial-dialog',
  templateUrl: 'infoSpeeddial-dialog.html',
})

export class InfoSpeeddialDialog {
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoSpeeddialDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
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


