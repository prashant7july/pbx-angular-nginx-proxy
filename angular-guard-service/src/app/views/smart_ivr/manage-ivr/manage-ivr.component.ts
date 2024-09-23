import { Component, OnInit } from "@angular/core";
import {
  Errors,
  CommonService,
  invalidForm,
  Number_RegEx,
} from "../../../core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { IVRService } from "../ivr.service";
import { PromptsService } from "../../prompts/prompts.service";
import { DidService } from "../../DID/did.service";

@Component({
  selector: "app-manage-ivr",
  templateUrl: "./manage-ivr.component.html",
  styleUrls: ["./manage-ivr.component.css"],
})
export class ManageIvrComponent implements OnInit {
  errors: Errors = { errors: {} };
  basicIVRForm: FormGroup;
  submitted = false;
  errorField = "";
  ivrName = "";
  checkForm: any;
  valuebind0:any;
  selectedIVRValueWelcome = [];
  selectedIVRValue = [];
  selectedIVRValueTime = [];
  selectedIVRValueSelection = [];
  MOHselected = [];
  filterTimeout: any;
  TimeOutPromptFilter: any;
  filterManage: any;
  WelcomePromptFilter: any;
  filterInvalid: any;
  InvalidPromptFilter: any;
  filters: any;
  SelectionPromptFilter: any;
  welcomePrompt = 0;
  countryList: any = "";
  filterCountryOne: any;
  CountryFilterOne: any;
  filterCountryTwo: any;
  CountryFilterTwo: any;
  filterCountryThree: any;
  CountryFilterThree: any;
  filterCountryFour: any;
  CountryFilterFour: any;
  filterCountryFive: any;
  CountryFilterFive: any;
  filterCountrySix: any;
  CountryFilterSix: any;
  filterCountrySev: any;
  CountryFilterSev: any;
  filterCountryEig: any;
  CountryFilterEig: any;
  filterCountryNine: any;
  CountryFilterNine: any;
  filterCountryTen: any;
  CountryFilterTen: any;
  filterCountryEle: any;
  CountryFilterEle: any;
  filterCountrytwe: any;
  CountryFilterTwe: any;
  countryList0 = "";
  countryCode0 = "";
  allAction0 = true;
  externalNumber0 = false;
  hangupAction0 = false;
  // valueData0: any = "";
  valueData0 = [];
  filterValueOne: any;
  ValueFilterOne: any;
  countryList1 = "";
  countryCode1 = "";
  allAction1 = true;
  externalNumber1 = false;
  hangupAction1 = false;
  // valueData1: any = "";
  valueData1 = [];
  filterValueTwo: any;
  ValueFilterTwo: any;
  countryList2 = "";
  countryCode2 = "";
  allAction2 = true;
  externalNumber2 = false;
  hangupAction2 = false;
  // valueData2: any = "";
  valueData2 = [];
  filterValueThree: any;
  ValueFilterThree: any;
  countryList3 = "";
  countryCode3 = "";
  allAction3 = true;
  externalNumber3 = false;
  hangupAction3 = false;
  valueData3 = [];
  filterValueFour: any;
  ValueFilterFour: any;
  countryList4 = "";
  countryCode4 = "";
  allAction4 = true;
  externalNumber4 = false;
  hangupAction4 = false;
  valueData4 = [];
  filterValueFive: any;
  ValueFilterFive: any;
  countryList5 = "";
  countryCode5 = "";
  allAction5 = true;
  externalNumber5 = false;
  hangupAction5 = false;
  valueData5 = [];
  filterValueSix: any;
  ValueFilterSix: any;
  countryList6 = "";
  countryCode6 = "";
  allAction6 = true;
  externalNumber6 = false;
  hangupAction6 = false;
  valueData6 = [];
  filterValueSeven: any;
  ValueFilterSeven: any;
  countryList7 = "";
  countryCode7 = "";
  allAction7 = true;
  externalNumber7 = false;
  hangupAction7 = false;
  valueData7 = [];
  filterValueEigh: any;
  ValueFilterEigh: any;
  countryList8 = "";
  countryCode8 = "";
  allAction8 = true;
  externalNumber8 = false;
  hangupAction8 = false;
  valueData8 = [];
  filterValueNine: any;
  ValueFilterNine: any;
  countryList9 = "";
  countryCode9 = "";
  allAction9 = true;
  externalNumber9 = false;
  hangupAction9 = false;
  valueData9 = [];
  filterValueTen: any;
  ValueFilterTen: any;
  countryList10 = "";
  countryCode10 = "";
  allAction10 = true;
  externalNumber10 = false;
  hangupAction10 = false;
  valueData10 = [];
  filterValueElev: any;
  ValueFilterElev: any;
  countryList11 = "";
  countryCode11 = "";
  allAction11 = true;
  externalNumber11 = false;
  hangupAction11 = false;
  valueData11 = [];
  filterValueTwel: any;
  ValueFilterTwel: any;
  sessionId = "";
  count = 0;
  ivrData: any = {};
  invalid_Sound:any;
  repeat_Prompt:any;
  time_Prompt:any;
  welcome_Prompt:any;
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
  country_id10 = "";
  country_id11 = "";
  ivr_digit0 = "";
  ivr_action_desc0: string = "";
  ivr_param0: any;
  ivr_number_param0 = "";
  ivr_digit1 = "";
  ivr_action_desc1 = "";
  ivr_param1 = "";
  ivr_number_param1 = "";
  ivr_digit2 = "";
  ivr_action_desc2 = "";
  ivr_param2 = "";
  ivr_number_param2 = "";
  ivr_digit3 = "";
  ivr_action_desc3 = "";
  ivr_param3 = "";
  ivr_number_param3 = "";
  ivr_digit4 = "";
  ivr_action_desc4 = "";
  ivr_param4 = "";
  ivr_number_param4 = "";
  ivr_digit5 = "";
  ivr_action_desc5 = "";
  ivr_param5 = "";
  ivr_number_param5 = "";
  ivr_digit6 = "";
  ivr_action_desc6 = "";
  ivr_param6 = "";
  ivr_number_param6 = "";
  ivr_digit7 = "";
  ivr_action_desc7 = "";
  ivr_param7 = "";
  ivr_number_param7 = "";
  ivr_digit8 = "";
  ivr_action_desc8 = "";
  ivr_param8 = "";
  ivr_number_param8 = "";
  ivr_digit9 = "";
  ivr_action_desc9 = "";
  ivr_param9 = "";
  ivr_number_param9 = "";
  ivr_digit10 = "";
  ivr_action_desc10 = "";
  ivr_param10 = "";
  ivr_number_param10 = "";
  ivr_digit11 = "";
  ivr_action_desc11 = "";
  ivr_param11 = "";
  ivr_number_param11 = "";
  activeFeature: any[] = [];
  filterFeatureZero: any;
  FeatureFilterZero: any;
  FeatureFilterOne: any;
  FeatureFilterTwo: any;
  FeatureFilterThree: any;
  FeatureFilterFour: any;
  FeatureFilterFive: any;
  FeatureFilterSix: any;
  FeatureFilterSev: any;
  FeatureFilterEig: any;
  FeatureFilterNine: any;
  FeatureFilterTen: any;
  FeatureFilterEle: any;
  filterFeatureOne: any;
  filterFeatureTwo: any;
  filterFeatureThree: any;
  filterFeatureFour: any;
  filterFeatureFive: any;
  filterFeatureSix: any;
  filterFeatureSev: any;
  filterFeatureEig: any;
  filterFeatureNine: any;
  filterFeatureTen: any;
  filterFeatureEle: any;
  isShowFeedBackIVR: boolean = false;
  feedBackIVR = false;
  isShowSelectionDTMF: boolean = false;
  isDisabledMultilevelBtn: boolean = false;
  isShowDTMFSelectionPart: boolean = true;
  isManageFeebackIVRbtn: boolean = true; // based on mapped with DID Destination
  packageActiveFeature: any;
  public fields: Object = { text: "prompt_name", value: "id" };
  public placeholder: string = "Welcome Prompt";
  public placeholder1: string = "Selection Prompt";
  public placeholder2: string = "Invalid Prompt";
  public placeholder3: string = "Timeout Prompt";
  public placeholder11: string = "Value";
  public placeholder10: string = "Feature";
  public placeholder12: string = "Select Country";
  public popupHeight: string = "200px";
  public popupWidth: string = "200px";
  public popupWidth1: string = "170px";
  public fields10: Object = { text: "feature", value: "id" };
  public fields12: Object = { text: "name", value: "id" };
  public fields11: Object = { text: "name", value: "id" };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ivrService: IVRService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private didService: DidService
  ) {
    this.basicIVRForm = this.formBuilder.group({
      name: ["", Validators.required],
      welcome_prompt: [0],
      repeat_prompt: ["",Validators.required],
      invalid_prompt: [0],
      timeout_prompt: [0],
      digit_timeout: [
        "10",
        [
          Validators.required,
          Validators.maxLength(2),
          Validators.max(60),
          Validators.min(1),
        ],
      ],
      inter_digit_timeout: [
        "10",
        [
          Validators.required,
          Validators.maxLength(2),
          Validators.max(60),
          Validators.min(1),
        ],
      ],
      max_timeout_try: [
        "3",
        [
          Validators.required,
          Validators.maxLength(1),
          Validators.max(3),
          Validators.min(1),
        ],
      ],
      max_invalid_try: [
        "3",
        [
          Validators.required,
          Validators.maxLength(1),
          Validators.max(3),
          Validators.min(1),
        ],
      ],
      digit0: ["0"],
      action0: ["0"],
      value0: ["", Validators.required],
      digit1: ["1"],
      action1: ["0"],
      value1: ["", Validators.required],
      digit2: ["2"],
      action2: ["0"],
      value2: ["", Validators.required],
      digit3: ["3"],
      action3: ["0"],
      value3: ["", Validators.required],
      digit4: ["4"],
      action4: ["0"],
      value4: ["", Validators.required],
      digit5: ["5"],
      action5: ["0"],
      value5: ["", Validators.required],
      digit6: ["6"],
      action6: ["0"],
      value6: ["", Validators.required],
      digit7: ["7"],
      action7: ["0"],
      value7: ["", Validators.required],
      digit8: ["8"],
      action8: ["0"],
      value8: ["", Validators.required],
      digit9: ["9"],
      action9: ["0"],
      value9: ["", Validators.required],
      digit10: ["*"],
      action10: ["0"],
      value10: ["", Validators.required],
      digit11: ["#"],
      action11: ["0"],
      value11: ["", Validators.required],
      value0_hanpUp: [""],
      value1_hanpUp: [""],
      value2_hanpUp: [""],
      value3_hanpUp: [""],
      value4_hanpUp: [""],
      value5_hanpUp: [""],
      value6_hanpUp: [""],
      value7_hanpUp: [""],
      value8_hanpUp: [""],
      value9_hanpUp: [""],
      value10_hanpUp: [""],
      value11_hanpUp: [""],
      country0: [99, Validators.required],
      country1: [99, Validators.required],
      country2: [99, Validators.required],
      country3: [99, Validators.required],
      country4: [99, Validators.required],
      country5: [99, Validators.required],
      country6: [99, Validators.required],
      country7: [99, Validators.required],
      country8: [99, Validators.required],
      country9: [99, Validators.required],
      country10: [99, Validators.required],
      country11: [99, Validators.required],
      country_code0: [""],
      country_code1: [""],
      country_code2: [""],
      country_code3: [""],
      country_code4: [""],
      country_code5: [""],
      country_code6: [""],
      country_code7: [""],
      country_code8: [""],
      country_code9: [""],
      country_code10: [""],
      country_code11: [""],
      value0_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value1_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value2_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value3_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value4_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value5_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value6_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value7_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value8_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value9_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value10_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      value11_Number: [
        "",
        [Validators.required, Validators.pattern(Number_RegEx)],
      ],
      feedbackIVR: ["0"],
      selection_dtmf_required: ["0"],
      directExtenDial: ["0"],
      multilevel_ivr: ["0"],
    });
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
    var k = "this.basicIVRForm.controls.value";
    for (let i = 0; i <= 11; i++) {
      eval(k + i + ".disable();");
      eval(k + i + "_Number.disable();");
    }
    this.sessionId = this.route.snapshot.queryParams.id;
    this.isIVRAssociateWithDID(this.sessionId);
    this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(
      (data) => {
        this.packageActiveFeature = data;
        const dataActiveFeature = []
        dataActiveFeature.push({ id: "0", feature: "Select Feature" });

        if (data[0].call_group == "1") {
          dataActiveFeature.push({ id: "5", feature: "Call Group" });
        }
        if (data[0].conference == "1") {
          dataActiveFeature.push({ id: "3", feature: "Conference" });
        }
        dataActiveFeature.push({ id: "8", feature: "Enterprise PSTN" });
        dataActiveFeature.push({ id: "9", feature: "Custom PSTN" });
        dataActiveFeature.push({ id: "7", feature: "Hangup" });

        if (data[0].ivr == "1") {
          dataActiveFeature.push({ id: "2", feature: "IVR" });
        }
        if (data[0].custom_prompt == "1") {
          dataActiveFeature.push({ id: "11", feature: "Prompt" });
        }
        if (data[0].queue == "1") {
          dataActiveFeature.push({ id: "4", feature: "Queue" });
        }
        dataActiveFeature.push({ id: "10", feature: "Repeat" });
        dataActiveFeature.push({ id: "1", feature: "SIP" });

        if (data[0].queue == "1") {
          dataActiveFeature.push({ id: "6", feature: "Voicemail" });
        }
        if (data[0].playback == "1") {
          dataActiveFeature.push({ id: "12", feature: "Playback Call" });
        }
        if (data[0].feedbackcall == "1") {
          this.isShowFeedBackIVR = true;
        }
        this.activeFeature = dataActiveFeature;
        this.filterFeatureZero = this.FeatureFilterZero =
          this.activeFeature.slice();
        this.filterFeatureOne = this.FeatureFilterOne =
          this.activeFeature.slice();
        this.filterFeatureTwo = this.FeatureFilterTwo =
          this.activeFeature.slice();
        this.filterFeatureThree = this.FeatureFilterThree =
          this.activeFeature.slice();
        this.filterFeatureFour = this.FeatureFilterFour =
          this.activeFeature.slice();
        this.filterFeatureFive = this.FeatureFilterFive =
          this.activeFeature.slice();
        this.filterFeatureSix = this.FeatureFilterSix =
          this.activeFeature.slice();
        this.filterFeatureSev = this.FeatureFilterSev =
          this.activeFeature.slice();
        this.filterFeatureEig = this.FeatureFilterEig =
          this.activeFeature.slice();
        this.filterFeatureNine = this.FeatureFilterNine =
          this.activeFeature.slice();
        this.filterFeatureTen = this.FeatureFilterTen =
          this.activeFeature.slice();
        this.filterFeatureEle = this.FeatureFilterEle =
          this.activeFeature.slice();
        this.loadViewBasicIvr()
      },
      (err) => {
        this.errors = err.message;
      }
    );

    //showing moh and recording
    this.commonService
      .getCustomerProductFeatures(localStorage.getItem("id"))
      .subscribe(
        (data) => {
          this.welcomePrompt = data.response[0].custom_prompt == "1" ? 1 : 0;
        },
        (err) => {
          this.errors = err.message;
        }
      );
    this.promptsService.getIVRPromptWelcome(localStorage.getItem("id")).subscribe(
      (dataa) => {
        // if (dataa.response && this.welcomePrompt == 1) {
          this. selectedIVRValueWelcome = dataa.response;
          this.selectedIVRValueWelcome.unshift({ prompt_name: 'Select Welcome Prompt', id: 0 });
          this.basicIVRForm.get('welcome_prompt').setValue(this.selectedIVRValueWelcome[0]['id']) ;
        // } else if (this.welcomePrompt == 0) {
        //   // this.selectedIVRValueWelcome.unshift({ prompt_name: 'default', id: '0' });
        // } else {
        //   this.selectedIVRValueWelcome = [];
        // }
        // this.selectedIVRValueWelcome = dataa.response;
      },
      (err) => {
        this.errors = err.message;
      }
    );
    this.promptsService.getIVRPromptSelection(localStorage.getItem("id")).subscribe(
      (dataa) => {
          this.selectedIVRValueSelection = dataa.response;
      },
      (err) => {
        this.errors = err.message;
      }
    );
    this.promptsService.getIVRPromptTime(localStorage.getItem("id")).subscribe(
      (dataa) => {
          this.selectedIVRValueTime = dataa.response;
        this.selectedIVRValueTime.unshift({ id: 0, prompt_name: "default" });
        this.basicIVRForm.get('timeout_prompt').setValue(this.selectedIVRValueTime[0]['id']);

      },
      (err) => {
        this.errors = err.message;
      }
    );

    this.promptsService.getIVRPrompt(localStorage.getItem("id")).subscribe(
      (data) => {
        this.selectedIVRValue = data.response;
        this.selectedIVRValue.unshift({ id: 0, prompt_name: "default" });
     
        this.basicIVRForm.get('invalid_prompt').setValue(this.selectedIVRValue[0]['id']);
      },
      (err) => {
        this.errors = err.message;
      }
    );

    //get country list
    this.commonService.getCountryList().subscribe(
      (data) => {
        const contry = data.response
        this.countryList = contry;
        // this.filterCountryOne = this.CountryFilterOne =
        //   this.countryList.slice();
        // this.filterCountryTwo = this.CountryFilterTwo =
        //   this.countryList.slice();
        // this.filterCountryThree = this.CountryFilterThree =
        //   this.countryList.slice();
        // this.filterCountryFour = this.CountryFilterFour =
        //   this.countryList.slice();
        // this.filterCountryFive = this.CountryFilterFive =
        //   this.countryList.slice();
        // this.filterCountrySix = this.CountryFilterSix =
        //   this.countryList.slice();
        // this.filterCountrySev = this.CountryFilterSev =
        //   this.countryList.slice();
        // this.filterCountryEig = this.CountryFilterEig =
        //   this.countryList.slice();
        // this.filterCountryNine = this.CountryFilterNine =
        //   this.countryList.slice();
        // this.filterCountryTen = this.CountryFilterTen =
        //   this.countryList.slice();
        // this.filterCountryEle = this.CountryFilterEle =
        //   this.countryList.slice();
        // this.filterCountrytwe = this.CountryFilterTwe =
        //   this.countryList.slice();
      },
      (err) => {
        this.errors = err.message;
      }
    );

    //get customer wise country
    this.commonService.getCustomerCountry(localStorage.getItem("id")).subscribe(
      (data) => {
        this.country_id0 = data.response[0].id;
        this.country_id1 = data.response[0].id;
        this.country_id2 = data.response[0].id;
        this.country_id3 = data.response[0].id;
        this.country_id4 = data.response[0].id;
        this.country_id5 = data.response[0].id;
        this.country_id6 = data.response[0].id;
        this.country_id7 = data.response[0].id;
        this.country_id8 = data.response[0].id;
        this.country_id9 = data.response[0].id;
        this.country_id10 = data.response[0].id;
        this.country_id11 = data.response[0].id;

        this.countryCode0 = "+" + data.response[0].phonecode;
        this.countryCode1 = "+" + data.response[0].phonecode;
        this.countryCode2 = "+" + data.response[0].phonecode;
        this.countryCode3 = "+" + data.response[0].phonecode;
        this.countryCode4 = "+" + data.response[0].phonecode;
        this.countryCode5 = "+" + data.response[0].phonecode;
        this.countryCode6 = "+" + data.response[0].phonecode;
        this.countryCode7 = "+" + data.response[0].phonecode;
        this.countryCode8 = "+" + data.response[0].phonecode;
        this.countryCode9 = "+" + data.response[0].phonecode;
        this.countryCode10 = "+" + data.response[0].phonecode;
        this.countryCode11 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err ? err.message : "Something went wrong";
      }
    );


  }

  loadViewBasicIvr() {
    this.ivrService
      .viewBasicIVR({
        id: this.sessionId,
        name: null,
        customer_id: localStorage.getItem("id"),
      })
      .subscribe(
        (data) => {

          this.ivrData = data;
          this.invalid_Sound = this.ivrData.invalid_sound;
          this.repeat_Prompt = this.ivrData.repeat_prompt;
          this.time_Prompt = this.ivrData.timeout_prompt;
          this.welcome_Prompt = this.ivrData.welcome_prompt;
          
          
          if (this.ivrData.timeout_prompt == 0) {
            this.ivrData.timeout_prompt = "0";
          } else if (this.ivrData.timeout_prompt == 1) {
            this.ivrData.timeout_prompt = "1";
          } else {
            this.ivrData.timeout_prompt = this.ivrData.timeout_prompt;
          }
          if (this.ivrData.invalid_sound == 0) {
            this.ivrData.invalid_sound = "0";
          } else if (this.ivrData.invalid_sound == 1) {
            this.ivrData.invalid_sound = "1";
          } else {
            this.ivrData.invalid_sound = this.ivrData.invalid_sound;
          }
          this.ivrData.welcome_prompt =
            this.ivrData.welcome_prompt == 0
              ? "0"
              : this.ivrData.welcome_prompt;
          this.ivrData.repeat_prompt =
            this.ivrData.repeat_prompt == 0 ? "0" : this.ivrData.repeat_prompt;
          this.ivrData.feedBackIVR =
            this.ivrData.feedback_call == "1" ? true : false;
          this.ivrData.is_direct_ext_dial =
            this.ivrData.is_direct_ext_dial == "1" ? true : false;
          this.ivrData.is_multilevel_ivr =
            this.ivrData.is_multilevel_ivr == "1" ? true : false;
          this.ivrData.is_selection_dtmf =
            this.ivrData.is_selection_dtmf == "1" ? true : false;
          if (this.ivrData.is_multilevel_ivr) {
            this.isDisabledMultilevelBtn = true;
          }
          if (this.ivrData.feedBackIVR) {
            this.isShowSelectionDTMF = true;
            let e = {
              checked: true,
            };
            this.ivrData.is_selection_dtmf == true
              ? this.dtmfRequiredToggle(e)
              : this.feedbackIVRToggle(e);
          }

          
          this.ivrName = this.ivrData.name;
          if (this.ivrData.is_multilevel_ivr) {
            
            let e = {
              checked: true,
            };
            // this.activeFeature = [];            
              this.multilevelIVRToggle(e);                          
          }

          setTimeout(() => {
            data = data["dtmf"];
            this.valuebind0 = data[0]['ivr_action']
            for (let i = 0; i < data.length; i++) {
              if (data[i].ivr_digit == "0") {

                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value0_Number.enable();
                  this.allAction0 = false;
                  this.hangupAction0 = false;
                  this.externalNumber0 = true;
                  this.ivr_digit0 = data[i].ivr_digit;
                  this.ivr_action_desc0 = data[i].ivr_action_desc;
                  this.ivr_number_param0 = data[i].phoneNumber;
                  this.country_id0 = data[i].country_id;
                  this.countryCode0 = data[i].country_code;
                  this.getCountryCode0(data[i].country_id);
                  this.basicIVRForm.get('country0').setValue(data[i].country_id);
                  this.basicIVRForm.get('action0').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value0').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value0_Number.disable();
                  this.allAction0 = false;
                  this.hangupAction0 = true;
                  this.externalNumber0 = false;
                  this.ivr_digit0 = data[i].ivr_digit;
                  this.ivr_action_desc0 = data[i].ivr_action_desc;
                  this.ivr_param0 = "";
                  this.basicIVRForm.get('action0').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value0_Number.disable();
                  this.allAction0 = false;
                  this.hangupAction0 = true;
                  this.externalNumber0 = false;
                  this.ivr_digit0 = data[i].ivr_digit;
                  this.ivr_action_desc0 = data[i].ivr_action_desc;
                  this.ivr_param0 = "";
                  this.basicIVRForm.get('action0').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction0 = true;
                  this.hangupAction0 = false;
                  this.externalNumber0 = false;
                  this.ivr_digit0 = data[i].ivr_digit;
                  this.ivr_action_desc0 = data[i].ivr_action_desc;
                  this.ivr_param0 = parseInt(data[i].ivr_action);
                  
                  setTimeout(() => {
                    this.getValueData0(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action0').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value0').setValue(data[i].ivr_action);

                }
              } else if (data[i].ivr_digit == "1") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value1_Number.enable();
                  this.allAction1 = false;
                  this.hangupAction1 = false;
                  this.externalNumber1 = true;
                  this.ivr_digit1 = data[i].ivr_digit;
                  this.ivr_action_desc1 = data[i].ivr_action_desc;
                  this.ivr_number_param1 = data[i].phoneNumber;
                  this.country_id1 = data[i].country_id;
                  this.countryCode1 = data[i].country_code;
                  this.getCountryCode1(data[i].country_id);
                  this.basicIVRForm.get('country1').setValue(data[i].country_id);
                  this.basicIVRForm.get('action1').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value1').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value1_Number.disable();
                  this.allAction1 = false;
                  this.hangupAction1 = true;
                  this.externalNumber1 = false;
                  this.ivr_digit1 = data[i].ivr_digit;
                  this.ivr_action_desc1 = data[i].ivr_action_desc;
                  this.ivr_param1 = "";
                  this.basicIVRForm.get('action1').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value1_Number.disable();
                  this.allAction1 = false;
                  this.hangupAction1 = true;
                  this.externalNumber1 = false;
                  this.ivr_digit1 = data[i].ivr_digit;
                  this.ivr_action_desc1 = data[i].ivr_action_desc;
                  this.ivr_param1 = "";
                  this.basicIVRForm.get('action1').setValue(data[i].ivr_action_desc);
                } else {
                  

                  this.allAction1 = true;
                  this.hangupAction1 = false;
                  this.externalNumber1 = false;
                  this.ivr_digit1 = data[i].ivr_digit;
                  this.ivr_action_desc1 = data[i].ivr_action_desc;
                  this.ivr_param1 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData1(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action1').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value1').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "2") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value2_Number.enable();
                  this.allAction2 = false;
                  this.hangupAction2 = false;
                  this.externalNumber2 = true;
                  this.ivr_digit2 = data[i].ivr_digit;
                  this.ivr_action_desc2 = data[i].ivr_action_desc;
                  this.ivr_number_param2 = data[i].phoneNumber;
                  this.country_id2 = data[i].country_id;
                  this.countryCode2 = data[i].country_code;
                  this.getCountryCode2(data[i].country_id);
                  this.basicIVRForm.get('country2').setValue(data[i].country_id);
                  this.basicIVRForm.get('action2').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value2').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value2_Number.disable();
                  this.allAction2 = false;
                  this.hangupAction2 = true;
                  this.externalNumber2 = false;
                  this.ivr_digit2 = data[i].ivr_digit;
                  this.ivr_action_desc2 = data[i].ivr_action_desc;
                  this.ivr_param2 = "";
                  this.basicIVRForm.get('action2').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value2_Number.disable();
                  this.allAction2 = false;
                  this.hangupAction2 = true;
                  this.externalNumber2 = false;
                  this.ivr_digit2 = data[i].ivr_digit;
                  this.ivr_action_desc2 = data[i].ivr_action_desc;
                  this.ivr_param2 = "";
                  this.basicIVRForm.get('action2').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction2 = true;
                  this.hangupAction2 = false;
                  this.externalNumber2 = false;
                  this.ivr_digit2 = data[i].ivr_digit;
                  this.ivr_action_desc2 = data[i].ivr_action_desc;
                  this.ivr_param2 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData2(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action2').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value2').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "3") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value3_Number.enable();
                  this.allAction3 = false;
                  this.hangupAction3 = false;
                  this.externalNumber3 = true;
                  this.ivr_digit3 = data[i].ivr_digit;
                  this.ivr_action_desc3 = data[i].ivr_action_desc;
                  this.ivr_number_param3 = data[i].phoneNumber;
                  this.country_id3 = data[i].country_id;
                  this.countryCode3 = data[i].country_code;
                  this.getCountryCode3(data[i].country_id);
                  this.basicIVRForm.get('country3').setValue(data[i].country_id);
                  this.basicIVRForm.get('action3').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value3').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value3_Number.disable();
                  this.allAction3 = false;
                  this.hangupAction3 = true;
                  this.externalNumber3 = false;
                  this.ivr_digit3 = data[i].ivr_digit;
                  this.ivr_action_desc3 = data[i].ivr_action_desc;
                  this.ivr_param3 = "";
                  this.basicIVRForm.get('action3').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value3_Number.disable();
                  this.allAction3 = false;
                  this.hangupAction3 = true;
                  this.externalNumber3 = false;
                  this.ivr_digit3 = data[i].ivr_digit;
                  this.ivr_action_desc3 = data[i].ivr_action_desc;
                  this.ivr_param3 = "";
                  this.basicIVRForm.get('action3').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction3 = true;
                  this.hangupAction3 = false;
                  this.externalNumber3 = false;
                  this.ivr_digit3 = data[i].ivr_digit;
                  this.ivr_action_desc3 = data[i].ivr_action_desc;
                  this.ivr_param3 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData3(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action3').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value3').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "4") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value4_Number.enable();
                  this.allAction4 = false;
                  this.hangupAction4 = false;
                  this.externalNumber4 = true;
                  this.ivr_digit4 = data[i].ivr_digit;
                  this.ivr_action_desc4 = data[i].ivr_action_desc;
                  this.ivr_number_param4 = data[i].phoneNumber;
                  this.country_id4 = data[i].country_id;
                  this.countryCode4 = data[i].country_code;
                  this.getCountryCode4(data[i].country_id);
                  this.basicIVRForm.get('country4').setValue(data[i].country_id);
                  this.basicIVRForm.get('action4').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value4').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value4_Number.disable();
                  this.allAction4 = false;
                  this.hangupAction4 = true;
                  this.externalNumber4 = false;
                  this.ivr_digit4 = data[i].ivr_digit;
                  this.ivr_action_desc4 = data[i].ivr_action_desc;
                  this.ivr_param4 = "";
                  this.basicIVRForm.get('action4').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value4_Number.disable();
                  this.allAction4 = false;
                  this.hangupAction4 = true;
                  this.externalNumber4 = false;
                  this.ivr_digit4 = data[i].ivr_digit;
                  this.ivr_action_desc4 = data[i].ivr_action_desc;
                  this.ivr_param4 = "";
                  this.basicIVRForm.get('action4').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction4 = true;
                  this.hangupAction4 = false;
                  this.externalNumber4 = false;
                  this.ivr_digit4 = data[i].ivr_digit;
                  this.ivr_action_desc4 = data[i].ivr_action_desc;
                  this.ivr_param4 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData4(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action4').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value4').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "5") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value5_Number.enable();
                  this.allAction5 = false;
                  this.hangupAction5 = false;
                  this.externalNumber5 = true;
                  this.ivr_digit5 = data[i].ivr_digit;
                  this.ivr_action_desc5 = data[i].ivr_action_desc;
                  this.ivr_number_param5 = data[i].phoneNumber;
                  this.country_id5 = data[i].country_id;
                  this.countryCode5 = data[i].country_code;
                  this.getCountryCode5(data[i].country_id);
                  this.basicIVRForm.get('country5').setValue(data[i].country_id);
                  this.basicIVRForm.get('action5').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value5').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value5_Number.disable();
                  this.allAction5 = false;
                  this.hangupAction5 = true;
                  this.externalNumber5 = false;
                  this.ivr_digit5 = data[i].ivr_digit;
                  this.ivr_action_desc5 = data[i].ivr_action_desc;
                  this.ivr_param5 = "";
                  this.basicIVRForm.get('action5').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value5_Number.disable();
                  this.allAction5 = false;
                  this.hangupAction5 = true;
                  this.externalNumber5 = false;
                  this.ivr_digit5 = data[i].ivr_digit;
                  this.ivr_action_desc5 = data[i].ivr_action_desc;
                  this.ivr_param5 = "";
                  this.basicIVRForm.get('action5').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction5 = true;
                  this.hangupAction5 = false;
                  this.externalNumber5 = false;
                  this.ivr_digit5 = data[i].ivr_digit;
                  this.ivr_action_desc5 = data[i].ivr_action_desc;
                  this.ivr_param5 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData5(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action5').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value5').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "6") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value6_Number.enable();
                  this.allAction6 = false;
                  this.hangupAction6 = false;
                  this.externalNumber6 = true;
                  this.ivr_digit6 = data[i].ivr_digit;
                  this.ivr_action_desc6 = data[i].ivr_action_desc;
                  this.ivr_number_param6 = data[i].phoneNumber;
                  this.country_id6 = data[i].country_id;
                  this.countryCode6 = data[i].country_code;
                  this.getCountryCode6(data[i].country_id);
                  this.basicIVRForm.get('country6').setValue(data[i].country_id);
                  this.basicIVRForm.get('action6').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value6').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value6_Number.disable();
                  this.allAction6 = false;
                  this.hangupAction6 = true;
                  this.externalNumber6 = false;
                  this.ivr_digit6 = data[i].ivr_digit;
                  this.ivr_action_desc6 = data[i].ivr_action_desc;
                  this.ivr_param6 = "";
                  this.basicIVRForm.get('action6').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value6_Number.disable();
                  this.allAction6 = false;
                  this.hangupAction6 = true;
                  this.externalNumber6 = false;
                  this.ivr_digit6 = data[i].ivr_digit;
                  this.ivr_action_desc6 = data[i].ivr_action_desc;
                  this.ivr_param6 = "";
                  this.basicIVRForm.get('action6').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction6 = true;
                  this.hangupAction6 = false;
                  this.externalNumber6 = false;
                  this.ivr_digit6 = data[i].ivr_digit;
                  this.ivr_action_desc6 = data[i].ivr_action_desc;
                  this.ivr_param6 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData6(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action6').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value6').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "7") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value7_Number.enable();
                  this.allAction7 = false;
                  this.hangupAction7 = false;
                  this.externalNumber7 = true;
                  this.ivr_digit7 = data[i].ivr_digit;
                  this.ivr_action_desc7 = data[i].ivr_action_desc;
                  this.ivr_number_param7 = data[i].phoneNumber;
                  this.country_id7 = data[i].country_id;
                  this.countryCode7 = data[i].country_code;
                  this.getCountryCode7(data[i].country_id);
                  this.basicIVRForm.get('country7').setValue(data[i].country_id);
                  this.basicIVRForm.get('action7').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value7').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value7_Number.disable();
                  this.allAction7 = false;
                  this.hangupAction7 = true;
                  this.externalNumber7 = false;
                  this.ivr_digit7 = data[i].ivr_digit;
                  this.ivr_action_desc7 = data[i].ivr_action_desc;
                  this.ivr_param7 = "";
                  this.basicIVRForm.get('action7').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value7_Number.disable();
                  this.allAction7 = false;
                  this.hangupAction7 = true;
                  this.externalNumber7 = false;
                  this.ivr_digit7 = data[i].ivr_digit;
                  this.ivr_action_desc7 = data[i].ivr_action_desc;
                  this.ivr_param7 = "";
                  this.basicIVRForm.get('action7').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction7 = true;
                  this.hangupAction7 = false;
                  this.externalNumber7 = false;
                  this.ivr_digit7 = data[i].ivr_digit;
                  this.ivr_action_desc7 = data[i].ivr_action_desc;
                  this.ivr_param7 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData7(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action7').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value7').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "8") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value8_Number.enable();
                  this.allAction8 = false;
                  this.hangupAction8 = false;
                  this.externalNumber8 = true;
                  this.ivr_digit8 = data[i].ivr_digit;
                  this.ivr_action_desc8 = data[i].ivr_action_desc;
                  this.ivr_number_param8 = data[i].phoneNumber;
                  this.country_id8 = data[i].country_id;
                  this.countryCode8 = data[i].country_code;
                  this.getCountryCode8(data[i].country_id);
                  this.basicIVRForm.get('country8').setValue(data[i].country_id);
                  this.basicIVRForm.get('action8').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value8').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value8_Number.disable();
                  this.allAction8 = false;
                  this.hangupAction8 = true;
                  this.externalNumber8 = false;
                  this.ivr_digit8 = data[i].ivr_digit;
                  this.ivr_action_desc8 = data[i].ivr_action_desc;
                  this.ivr_param8 = "";
                  this.basicIVRForm.get('action8').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value8_Number.disable();
                  this.allAction8 = false;
                  this.hangupAction8 = true;
                  this.externalNumber8 = false;
                  this.ivr_digit8 = data[i].ivr_digit;
                  this.ivr_action_desc8 = data[i].ivr_action_desc;
                  this.ivr_param8 = "";
                  this.basicIVRForm.get('action8').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction8 = true;
                  this.hangupAction8 = false;
                  this.externalNumber8 = false;
                  this.ivr_digit8 = data[i].ivr_digit;
                  this.ivr_action_desc8 = data[i].ivr_action_desc;
                  this.ivr_param8 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData8(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action8').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value8').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "9") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value9_Number.enable();
                  this.allAction9 = false;
                  this.hangupAction9 = false;
                  this.externalNumber9 = true;
                  this.ivr_digit9 = data[i].ivr_digit;
                  this.ivr_action_desc9 = data[i].ivr_action_desc;
                  this.ivr_number_param9 = data[i].phoneNumber;
                  this.country_id9 = data[i].country_id;
                  this.countryCode9 = data[i].country_code;
                  this.getCountryCode9(data[i].country_id);
                  this.basicIVRForm.get('country9').setValue(data[i].country_id);
                  this.basicIVRForm.get('action9').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value9').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value9_Number.disable();
                  this.allAction9 = false;
                  this.hangupAction9 = true;
                  this.externalNumber9 = false;
                  this.ivr_digit9 = data[i].ivr_digit;
                  this.ivr_action_desc9 = data[i].ivr_action_desc;
                  this.ivr_param9 = "";
                  this.basicIVRForm.get('action9').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value9_Number.disable();
                  this.allAction9 = false;
                  this.hangupAction9 = true;
                  this.externalNumber9 = false;
                  this.ivr_digit9 = data[i].ivr_digit;
                  this.ivr_action_desc9 = data[i].ivr_action_desc;
                  this.ivr_param9 = "";
                  this.basicIVRForm.get('action9').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction9 = true;
                  this.hangupAction9 = false;
                  this.externalNumber9 = false;
                  this.ivr_digit9 = data[i].ivr_digit;
                  this.ivr_action_desc9 = data[i].ivr_action_desc;
                  this.ivr_param9 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData9(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action9').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value9').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "*") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value10_Number.enable();
                  this.allAction10 = false;
                  this.hangupAction10 = false;
                  this.externalNumber10 = true;
                  this.ivr_digit10 = "*";
                  this.ivr_action_desc10 = data[i].ivr_action_desc;
                  this.ivr_number_param10 = data[i].phoneNumber;
                  this.country_id10 = data[i].country_id;
                  this.countryCode10 = data[i].country_code;
                  this.getCountryCode10(data[i].country_id);
                  this.basicIVRForm.get('country10').setValue(data[i].country_id);
                  this.basicIVRForm.get('action10').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value10').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value10_Number.disable();
                  this.allAction10 = false;
                  this.hangupAction10 = true;
                  this.externalNumber10 = false;
                  this.ivr_digit10 = "*";
                  this.ivr_action_desc10 = data[i].ivr_action_desc;
                  this.ivr_param10 = "";
                  this.basicIVRForm.get('action10').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value10_Number.disable();
                  this.allAction10 = false;
                  this.hangupAction10 = true;
                  this.externalNumber10 = false;
                  this.ivr_digit10 = "*";
                  this.ivr_action_desc10 = data[i].ivr_action_desc;
                  this.ivr_param10 = "";
                  this.basicIVRForm.get('action10').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction10 = true;
                  this.hangupAction10 = false;
                  this.externalNumber10 = false;
                  this.ivr_digit10 = "*";
                  this.ivr_action_desc10 = data[i].ivr_action_desc;
                  this.ivr_param10 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData10(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action10').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value10').setValue(data[i].ivr_action);
                }
              } else if (data[i].ivr_digit == "#") {
                if (data[i].ivr_action_desc == "9") {
                  this.basicIVRForm.controls.value11_Number.enable();
                  this.allAction11 = false;
                  this.hangupAction11 = false;
                  this.externalNumber11 = true;
                  this.ivr_digit11 = "#";
                  this.ivr_action_desc11 = data[i].ivr_action_desc;
                  this.ivr_number_param11 = data[i].phoneNumber;
                  this.country_id11 = data[i].country_id;
                  this.countryCode11 = data[i].country_code;
                  this.getCountryCode11(data[i].country_id);
                  this.basicIVRForm.get('country11').setValue(data[i].country_id);
                  this.basicIVRForm.get('action11').setValue(data[i].ivr_action_desc);
                  this.basicIVRForm.get('value11').setValue(data[i].ivr_action);
                } else if (data[i].ivr_action_desc == "7") {
                  this.basicIVRForm.controls.value11_Number.disable();
                  this.allAction11 = false;
                  this.hangupAction11 = true;
                  this.externalNumber11 = false;
                  this.ivr_digit11 = "#";
                  this.ivr_action_desc11 = data[i].ivr_action_desc;
                  this.ivr_param11 = "";
                  this.basicIVRForm.get('action11').setValue(data[i].ivr_action_desc);
                } else if (data[i].ivr_action_desc == "10") {
                  this.basicIVRForm.controls.value11_Number.disable();
                  this.allAction11 = false;
                  this.hangupAction11 = true;
                  this.externalNumber11 = false;
                  this.ivr_digit11 = "#";
                  this.ivr_action_desc11 = data[i].ivr_action_desc;
                  this.ivr_param11 = "";
                  this.basicIVRForm.get('action11').setValue(data[i].ivr_action_desc);
                } else {
                  this.allAction11 = true;
                  this.hangupAction11 = false;
                  this.externalNumber11 = false;
                  this.ivr_digit11 = "#";
                  this.ivr_action_desc11 = data[i].ivr_action_desc;
                  this.ivr_param11 = data[i].ivr_action;
                  setTimeout(() => {
                    
                    this.getValueData11(data[i].ivr_action_desc, true);
                  }, 1000);
                    this.basicIVRForm.get('action11').setValue(data[i].ivr_action_desc);
                    this.basicIVRForm.get('value11').setValue(data[i].ivr_action);
                }
              }
            }
          }, 500);
        },
        (err) => {
          this.errors = err.message;
        }
      );

  }

  Valueremovedspace0(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData0.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace1(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData1.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace2(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData2.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace3(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData3.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace4(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData4.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace5(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData5.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace6(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData6.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace7(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData7.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace8(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData8.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace9(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData9.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace10(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData10.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Valueremovedspace11(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.valueData11.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  selectremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  PromptremovedspaceSelection(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedIVRValueSelection.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }  
  PromptremovedspaceTime(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedIVRValueTime.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Promptremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedIVRValue.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  PromptremovedspaceWelcome(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedIVRValueWelcome.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  get welcome_prompt(){
    return this.basicIVRForm.get("welcome_prompt")
  }

  get name() {
    return this.basicIVRForm.get("name");
  }
  get digit_timeout() {
    return this.basicIVRForm.get("digit_timeout");
  }
  get inter_digit_timeout() {
    return this.basicIVRForm.get("inter_digit_timeout");
  }
  get max_timeout_try() {
    return this.basicIVRForm.get("max_timeout_try");
  }
  get max_invalid_try() {
    return this.basicIVRForm.get("max_invalid_try");
  }
  get value0() {
    return this.basicIVRForm.get("value0");
  }
  get value1() {
    return this.basicIVRForm.get("value1");
  }
  get value2() {
    return this.basicIVRForm.get("value2");
  }
  get value3() {
    return this.basicIVRForm.get("value3");
  }
  get value4() {
    return this.basicIVRForm.get("value4");
  }
  get value5() {
    return this.basicIVRForm.get("value5");
  }
  get value6() {
    return this.basicIVRForm.get("value6");
  }
  get value7() {
    return this.basicIVRForm.get("value7");
  }
  get value8() {
    return this.basicIVRForm.get("value8");
  }
  get value9() {
    return this.basicIVRForm.get("value9");
  }
  get value10() {
    return this.basicIVRForm.get("value10");
  }
  get value11() {
    return this.basicIVRForm.get("value11");
  }
  get country0() {
    return this.basicIVRForm.get("country0");
  }
  get country1() {
    return this.basicIVRForm.get("country1");
  }
  get country2() {
    return this.basicIVRForm.get("country2");
  }
  get country3() {
    return this.basicIVRForm.get("country3");
  }
  get country4() {
    return this.basicIVRForm.get("country4");
  }
  get country5() {
    return this.basicIVRForm.get("country5");
  }
  get country6() {
    return this.basicIVRForm.get("country6");
  }
  get country7() {
    return this.basicIVRForm.get("country7");
  }
  get country8() {
    return this.basicIVRForm.get("country8");
  }
  get country9() {
    return this.basicIVRForm.get("country9");
  }
  get country10() {
    return this.basicIVRForm.get("country10");
  }
  get country11() {
    return this.basicIVRForm.get("country11");
  }
  get value0_Number() {
    return this.basicIVRForm.get("value0_Number");
  }
  get value1_Number() {
    return this.basicIVRForm.get("value1_Number");
  }
  get value2_Number() {
    return this.basicIVRForm.get("value2_Number");
  }
  get value3_Number() {
    return this.basicIVRForm.get("value3_Number");
  }
  get value4_Number() {
    return this.basicIVRForm.get("value4_Number");
  }
  get value5_Number() {
    return this.basicIVRForm.get("value5_Number");
  }
  get value6_Number() {
    return this.basicIVRForm.get("value6_Number");
  }
  get value7_Number() {
    return this.basicIVRForm.get("value7_Number");
  }
  get value8_Number() {
    return this.basicIVRForm.get("value8_Number");
  }
  get value9_Number() {
    return this.basicIVRForm.get("value9_Number");
  }
  get value10_Number() {
    return this.basicIVRForm.get("value10_Number");
  }
  get value11_Number() {
    return this.basicIVRForm.get("value11_Number");
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.basicIVRForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitbasicIVRForm() {
    if (this.basicIVRForm.valid) {
      this.submitted = true;
      const credentials = this.basicIVRForm.value;
      if (
        credentials["repeat_prompt"] == "" ||
        credentials["repeat_prompt"] == "0"
      ) {
        credentials["repeat_prompt"] = credentials["welcome_prompt"];
      }
      credentials.id = this.sessionId;
      credentials["extension"] = "";
      credentials["greet_long"] = "";
      credentials["greet_short"] = "";
      credentials["digit_len"] = "";
      credentials["language"] = "";
      credentials["direct_ext_call"] = "0";
      credentials["tenant_id"] = "";
      credentials["mapped_id"] = "";
      credentials["level"] = "";
      credentials["digit_length"] = "1";
      credentials["customer_id"] = localStorage.getItem("id");
      let count = 0;
      let multilevel_count = 0;
      for (let j = 0; j <= 11; j++) {
        if (credentials["action" + j] != null && credentials["action" + j] != 0) {
          count = count + 1;
        }
      }
      if (
        (count == 0 && credentials["feedbackIVR"]! == "0") ||
        (count == 0 && credentials["feedbackIVR"]! == false)
      ) {
        this.toastr.error(
          "Error!",
          "Please select atleast one entry from IVR Selection",
          { timeOut: 4000 }
        );
        return;
      }

      let arrVal = [];
      for (let i = 0; i <= 11; i++) {
        if (credentials["action" + i] != "0") {
          if (credentials["action" + i] == "9") {
            let val1 = eval("this.countryCode" + i);
            let val2 = eval("this.ivr_param" + i);
            arrVal.push({
              ivr_digit: credentials["digit" + i],
              ivr_action: 0,
              ivr_action_desc: credentials["action" + i],
              ivr_param: credentials["value" + i + "_Number"]
                ? "custom_exten_" +
                credentials["country_code" + i] +
                credentials["value" + i + "_Number"]
                : "custom_exten_" + val1 + val2,
              country: credentials["country" + i],
            });
          } else if (credentials["action" + i] == "7") {
            arrVal.push({
              ivr_digit: credentials["digit" + i],
              ivr_action: 0,
              ivr_action_desc: credentials["action" + i],
              ivr_param: 0,
              country: 0,
            });
          } else if (credentials["action" + i] == "10") {
            arrVal.push({
              ivr_digit: credentials["digit" + i],
              ivr_action: -1,
              ivr_action_desc: credentials["action" + i],
              ivr_param: -1,
              country: 0,
            });
          } else if (credentials["action" + i] == "14") {
            arrVal.push({
              ivr_digit: credentials["digit" + i],
              ivr_action: -2,
              ivr_action_desc: credentials["action" + i],
              ivr_param: -2,
              country: 0,
            });
          } else {
            if (credentials["action" + i] == "1") {
              var feature = "sip_" + credentials["value" + i];
            } else if (credentials["action" + i] == "3") {
              var feature = "conf_" + credentials["value" + i];
            } else if (credentials["action" + i] == "4") {
              var feature = "queue_" + credentials["value" + i];
            } else if (credentials["action" + i] == "5") {
              var feature = "cg_" + credentials["value" + i];
            } else if (credentials["action" + i] == "6") {
              var feature = "vm_" + credentials["value" + i];
            } else if (credentials["action" + i] == "8") {
              var feature = "contact_exten_" + credentials["value" + i];
            } else if (credentials["action" + i] == "11") {
              var feature = "playback_" + credentials["value" + i];
            } else if (credentials["action" + i] == "2") {
              var feature = "ivr_" + credentials["value" + i];
            }
            arrVal.push({
              ivr_digit: credentials["digit" + i],
              ivr_action: credentials["value" + i],
              ivr_action_desc: credentials["action" + i],
              ivr_param: feature,
              country: 0,
            });
          }
        }
      }

      for (let j = 0; j <= 11; j++) {
        if (credentials["action" + j] == "14") {
          // for count and apply validation on multilevel
          multilevel_count = multilevel_count + 1;
        }
      }
      if (credentials["multilevel_ivr"] && multilevel_count == 0) {
        this.toastr.error(
          "Please select atleast one Back to Main IVR !",
          "Error!",
          { timeOut: 4000 }
        );

        return;
      }

      this.ivrService
        .getIVRMaster({
          id: this.sessionId,
          name: credentials.name,
          customer_id: localStorage.getItem("id"),
        })
        .subscribe((data) => {
          if (
            data &&
            data[0].lastInserted >= 1 &&
            this.sessionId != data[0].lastInserted
          ) {
            this.errorField = data[0].MESSAGE_TEXT;
            this.toastr.error("Error!", this.errorField, { timeOut: 4000 });
            this.ivrName = "";
          } else {
            this.ivrService
              .createBasicIVR({
                ivr: credentials,
                arr_val: JSON.stringify(arrVal),
              })
              .subscribe((data) => {
                if (data["code"] == 200) {
                  this.toastr.success("Success!", data["message"], {
                    timeOut: 2000,
                  });
                  this.basicIVRForm.reset();
                  this.router.navigateByUrl("ivr/view");
                } else {
                  this.toastr.error("Error!", data["message"], {
                    timeOut: 2000,
                  });
                }
              });
          }
        });
    } else {
      this.toastr.error("Error!", invalidForm, { timeOut: 2000 });
    }
  }

  cancelForm(e) {
    this.basicIVRForm.reset();
    this.router.navigateByUrl("ivr/view");
  }

  getValueData0(e, loadDataFirstTime?) {
    // this.basicIVRForm.get("value0").reset();
    // this.basicIVRForm.get("value0").updateValueAndValidity();
    // this.basicIVRForm.controls.value0.clearValidators();
    // this.basicIVRForm.controls.value0.updateValueAndValidity();
    // this.basicIVRForm.get('value0').setValue('');
    
    
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    



    if (action == "9") {
      this.externalNumber0 = true;
      this.allAction0 = false;
      this.hangupAction0 = false;
      this.basicIVRForm.get("value0").setValue("");
      // this.basicIVRForm.controls.value0.clearValidators();
      // this.basicIVRForm.controls.value0.updateValueAndValidity();
      this.valueData0 = []

      this.basicIVRForm.controls.value0_Number.enable();
      this.basicIVRForm.controls.value0.disable();

    } else if (action == "7") {
      this.externalNumber0 = false;
      this.allAction0 = false;
      this.hangupAction0 = true;
      this.basicIVRForm.get("value0").setValue("");
    // this.basicIVRForm.controls.value0.clearValidators();
    // this.basicIVRForm.controls.value0.updateValueAndValidity();
    this.valueData0 = []


      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.disable();

    } else if (action == "10") {
      this.externalNumber0 = false;
      this.allAction0 = false;
      this.hangupAction0 = true;
      this.basicIVRForm.get("value0").setValue("");
    // this.basicIVRForm.controls.value0.clearValidators();
    // this.basicIVRForm.controls.value0.updateValueAndValidity();
    this.valueData0 = []


      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.disable();

    } else if (action == "0") {
      this.externalNumber0 = false;
      this.allAction0 = false;
      this.hangupAction0 = true;
      this.basicIVRForm.get("value0").setValue("");
    // this.basicIVRForm.controls.value0.clearValidators();
    // this.basicIVRForm.controls.value0.updateValueAndValidity();
    this.valueData0 = []


      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.disable();

    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value0").setValue("");
    // this.basicIVRForm.controls.value0.clearValidators();
    // this.basicIVRForm.controls.value0.updateValueAndValidity();
    this.valueData0 = []


        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction0 = true;
      this.externalNumber0 = false;
      this.hangupAction0 = false;
      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData0 = data.response;

          this.filterValueOne = this.ValueFilterOne = this.valueData0.slice();
        });
    } else if (action == "14") {
      this.externalNumber0 = false;
      this.allAction0 = false;
      this.hangupAction0 = true;
      this.basicIVRForm.get("value0").setValue("");
    // this.basicIVRForm.controls.value0.clearValidators();
    // this.basicIVRForm.controls.value0.updateValueAndValidity();
    this.valueData0 = []


      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.disable();

    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value0").setValue("");
    // this.basicIVRForm.controls.value0.clearValidators();
    // this.basicIVRForm.controls.value0.updateValueAndValidity();
    this.valueData0 = []

        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction0 = true;
      this.externalNumber0 = false;
      this.hangupAction0 = false;
      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData0 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });

          this.filterValueOne = this.ValueFilterOne = this.valueData0.slice();
        });
    } else {

      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value0").setValue("");
    // this.basicIVRForm.controls.value0.clearValidators();
    // this.basicIVRForm.controls.value0.updateValueAndValidity();
    this.valueData0 = []


        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction0 = true;
      this.externalNumber0 = false;
      this.hangupAction0 = false;
      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.enable();

      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData0 = data.response;

          this.filterValueOne = this.ValueFilterOne = this.valueData0.slice();
        });
    }
  }

  getCountryCode0(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode0 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData1(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value1.clearValidators();
    // this.basicIVRForm.controls.value1.updateValueAndValidity();
    // this.basicIVRForm.get('value1').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value1").setValue("");
      // this.basicIVRForm.controls.value1.clearValidators();
      // this.basicIVRForm.controls.value1.updateValueAndValidity();
      this.valueData1 = [];
      this.externalNumber1 = true;
      this.allAction1 = false;
      this.hangupAction1 = false;
      this.basicIVRForm.controls.value1_Number.enable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value1").setValue("");
      // this.basicIVRForm.controls.value1.clearValidators();
      // this.basicIVRForm.controls.value1.updateValueAndValidity();
      this.valueData1 = [];
      this.externalNumber1 = false;
      this.allAction1 = false;
      this.hangupAction1 = true;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value1").setValue("");
      // this.basicIVRForm.controls.value1.clearValidators();
      // this.basicIVRForm.controls.value1.updateValueAndValidity();
      this.valueData1 = [];
      this.externalNumber1 = false;
      this.allAction1 = false;
      this.hangupAction1 = true;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value1").setValue("");
      // this.basicIVRForm.controls.value1.clearValidators();
      // this.basicIVRForm.controls.value1.updateValueAndValidity();
      this.valueData1 = [];
      this.externalNumber1 = false;
      this.allAction1 = false;
      this.hangupAction1 = true;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value1").setValue("");
        // this.basicIVRForm.controls.value1.clearValidators();
        // this.basicIVRForm.controls.value1.updateValueAndValidity();
      this.valueData1 = [];
        this.basicIVRForm.get("value1").setValue("");
        this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction1 = true;
      this.externalNumber1 = false;
      this.hangupAction1 = false;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData1 = data.response;
          this.filterValueTwo = this.ValueFilterTwo = this.valueData1.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value1").setValue("");
      // this.basicIVRForm.controls.value1.clearValidators();
      // this.basicIVRForm.controls.value1.updateValueAndValidity();
      this.valueData1 = [];
      this.externalNumber1 = false;
      this.allAction1 = false;
      this.hangupAction1 = true;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value1").setValue("");
        // this.basicIVRForm.controls.value1.clearValidators();
        // this.basicIVRForm.controls.value1.updateValueAndValidity();
      this.valueData1 = [];
        this.basicIVRForm.get("value1").setValue("");
        this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction1 = true;
      this.externalNumber1 = false;
      this.hangupAction1 = false;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData1 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueTwo = this.ValueFilterTwo = this.valueData1.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value1").setValue("");
        // this.basicIVRForm.controls.value1.clearValidators();
        // this.basicIVRForm.controls.value1.updateValueAndValidity();
      this.valueData1 = [];
        this.basicIVRForm.get("value1").setValue("");
        this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction1 = true;
      this.externalNumber1 = false;
      this.hangupAction1 = false;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData1 = data.response;
          this.filterValueTwo = this.ValueFilterTwo = this.valueData1.slice();
        });
    }
  }

  getCountryCode1(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode1 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData2(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value2.clearValidators();
    // this.basicIVRForm.controls.value2.updateValueAndValidity();
    // this.basicIVRForm.get('value2').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;

    if (action == "9") {
      this.basicIVRForm.get("value2").setValue("");
      // this.basicIVRForm.controls.value2.clearValidators();
      // this.basicIVRForm.controls.value2.updateValueAndValidity();
      this.valueData2 = [];
      this.externalNumber2 = true;
      this.allAction2 = false;
      this.hangupAction2 = false;
      this.basicIVRForm.controls.value2_Number.enable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value2").setValue("");
      // this.basicIVRForm.controls.value2.clearValidators();
      // this.basicIVRForm.controls.value2.updateValueAndValidity();
      this.valueData2 = [];
      this.externalNumber2 = false;
      this.allAction2 = false;
      this.hangupAction2 = true;
      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value2").setValue("");
      // this.basicIVRForm.controls.value2.clearValidators();
      // this.basicIVRForm.controls.value2.updateValueAndValidity();
      this.valueData2 = [];
      this.externalNumber2 = false;
      this.allAction2 = false;
      this.hangupAction2 = true;
      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value2").setValue("");
      // this.basicIVRForm.controls.value2.clearValidators();
      // this.basicIVRForm.controls.value2.updateValueAndValidity();
      this.valueData2 = [];
      this.externalNumber2 = false;
      this.allAction2 = false;
      this.hangupAction2 = true;
      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value2").setValue("");
        // this.basicIVRForm.controls.value2.clearValidators();
        // this.basicIVRForm.controls.value2.updateValueAndValidity();
        this.valueData2 = [];
        // this.basicIVRForm.get("value2").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction2 = true;
      this.externalNumber2 = false;
      this.hangupAction2 = false;
      this.basicIVRForm.controls.value2_Number.enable();
      this.basicIVRForm.controls.value2.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData2 = data.response;
          this.filterValueThree = this.ValueFilterThree =
            this.valueData2.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value2").setValue("");
      // this.basicIVRForm.controls.value2.clearValidators();
      // this.basicIVRForm.controls.value2.updateValueAndValidity();
      this.valueData2 = [];
      this.externalNumber2 = false;
      this.allAction2 = false;
      this.hangupAction2 = true;
      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value2").setValue("");
        // this.basicIVRForm.controls.value2.clearValidators();
        // this.basicIVRForm.controls.value2.updateValueAndValidity();
        this.valueData2 = [];
        // this.basicIVRForm.get("value2").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction2 = true;
      this.externalNumber2 = false;
      this.hangupAction2 = false;
      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData2 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueThree = this.ValueFilterThree =
            this.valueData2.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value2").setValue("");
        // this.basicIVRForm.controls.value2.clearValidators();
        // this.basicIVRForm.controls.value2.updateValueAndValidity();
        this.valueData2 = [];
        // this.basicIVRForm.get("value2").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction2 = true;
      this.externalNumber2 = false;
      this.hangupAction2 = false;
      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData2 = data.response;
          this.filterValueThree = this.ValueFilterThree =
            this.valueData2.slice();
        });
    }
  }

  getCountryCode2(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode2 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData3(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value3.clearValidators();
    // this.basicIVRForm.controls.value3.updateValueAndValidity();
    // this.basicIVRForm.get('value3').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value3").setValue("");
      // this.basicIVRForm.controls.value3.clearValidators();
      // this.basicIVRForm.controls.value3.updateValueAndValidity();
      this.valueData3 = [];
      this.externalNumber3 = true;
      this.allAction3 = false;
      this.hangupAction3 = false;
      this.basicIVRForm.controls.value3_Number.enable();
      this.basicIVRForm.controls.value3.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value3").setValue("");
      // this.basicIVRForm.controls.value3.clearValidators();
      // this.basicIVRForm.controls.value3.updateValueAndValidity();
      this.valueData3 = [];
      this.externalNumber3 = false;
      this.allAction3 = false;
      this.hangupAction3 = true;
      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value3").setValue("");
      // this.basicIVRForm.controls.value3.clearValidators();
      // this.basicIVRForm.controls.value3.updateValueAndValidity();
      this.valueData3 = [];
      this.externalNumber3 = false;
      this.allAction3 = false;
      this.hangupAction3 = true;
      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value3").setValue("");
      // this.basicIVRForm.controls.value3.clearValidators();
      // this.basicIVRForm.controls.value3.updateValueAndValidity();
      this.valueData3 = [];
      this.externalNumber3 = false;
      this.allAction3 = false;
      this.hangupAction3 = true;
      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value3").setValue("");
        // this.basicIVRForm.controls.value3.clearValidators();
        // this.basicIVRForm.controls.value3.updateValueAndValidity();
        this.valueData3 = [];
        // this.basicIVRForm.get("value3").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction3 = true;
      this.externalNumber3 = false;
      this.hangupAction3 = false;
      this.basicIVRForm.controls.value3.enable();
      this.basicIVRForm.controls.value3_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData3 = data.response;
          this.filterValueFour = this.ValueFilterFour = this.valueData3.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value3").setValue("");
      // this.basicIVRForm.controls.value3.clearValidators();
      // this.basicIVRForm.controls.value3.updateValueAndValidity();
      this.valueData3 = [];
      this.externalNumber3 = false;
      this.allAction3 = false;
      this.hangupAction3 = true;
      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value3").setValue("");
        // this.basicIVRForm.controls.value3.clearValidators();
        // this.basicIVRForm.controls.value3.updateValueAndValidity();
        this.valueData3 = [];
        // this.basicIVRForm.get("value3").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction3 = true;
      this.externalNumber3 = false;
      this.hangupAction3 = false;
      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData3 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueFour = this.ValueFilterFour = this.valueData3.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value3").setValue("");
        // this.basicIVRForm.controls.value3.clearValidators();
        // this.basicIVRForm.controls.value3.updateValueAndValidity();
        this.valueData3 = [];
        // this.basicIVRForm.get("value3").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction3 = true;
      this.externalNumber3 = false;
      this.hangupAction3 = false;
      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData3 = data.response;
          this.filterValueFour = this.ValueFilterFour = this.valueData3.slice();
        });
    }
  }

  getCountryCode3(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode3 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData4(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value4.clearValidators();
    // this.basicIVRForm.controls.value4.updateValueAndValidity();
    // this.basicIVRForm.get('value4').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value4").setValue("");
      // this.basicIVRForm.controls.value4.clearValidators();
      // this.basicIVRForm.controls.value4.updateValueAndValidity();
      this.valueData4 = [];
      this.externalNumber4 = true;
      this.allAction4 = false;
      this.hangupAction4 = false;
      this.basicIVRForm.controls.value4_Number.enable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value4").setValue("");
      // this.basicIVRForm.controls.value4.clearValidators();
      // this.basicIVRForm.controls.value4.updateValueAndValidity();
      this.valueData4 = [];
      this.externalNumber4 = false;
      this.allAction4 = false;
      this.hangupAction4 = true;
      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value4").setValue("");
      // this.basicIVRForm.controls.value4.clearValidators();
      // this.basicIVRForm.controls.value4.updateValueAndValidity();
      this.valueData4 = [];
      this.externalNumber4 = false;
      this.allAction4 = false;
      this.hangupAction4 = true;
      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value4").setValue("");
      // this.basicIVRForm.controls.value4.clearValidators();
      // this.basicIVRForm.controls.value4.updateValueAndValidity();
      this.valueData4 = [];
      this.externalNumber4 = false;
      this.allAction4 = false;
      this.hangupAction4 = true;
      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value4").setValue("");
        // this.basicIVRForm.controls.value4.clearValidators();
        // this.basicIVRForm.controls.value4.updateValueAndValidity();
        this.valueData4 = [];
        // this.basicIVRForm.get("value4").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction4 = true;
      this.externalNumber4 = false;
      this.hangupAction4 = false;
      this.basicIVRForm.controls.value4.enable();
      this.basicIVRForm.controls.value4_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData4 = data.response;
          this.filterValueFive = this.ValueFilterFive = this.valueData4.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value4").setValue("");
      // this.basicIVRForm.controls.value4.clearValidators();
      // this.basicIVRForm.controls.value4.updateValueAndValidity();
      this.valueData4 = [];
      this.externalNumber4 = false;
      this.allAction4 = false;
      this.hangupAction4 = true;
      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value4").setValue("");
        // this.basicIVRForm.controls.value4.clearValidators();
        // this.basicIVRForm.controls.value4.updateValueAndValidity();
        this.valueData4 = [];
        // this.basicIVRForm.get("value4").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction4 = true;
      this.externalNumber4 = false;
      this.hangupAction4 = false;
      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData4 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueFive = this.ValueFilterFive = this.valueData4.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value4").setValue("");
        // this.basicIVRForm.controls.value4.clearValidators();
        // this.basicIVRForm.controls.value4.updateValueAndValidity();
        this.valueData4 = [];
        // this.basicIVRForm.get("value4").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction4 = true;
      this.externalNumber4 = false;
      this.hangupAction4 = false;
      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData4 = data.response;
          this.filterValueFive = this.ValueFilterFive = this.valueData4.slice();
        });
    }
  }

  getCountryCode4(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode4 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData5(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value5.clearValidators();
    // this.basicIVRForm.controls.value5.updateValueAndValidity();
    // this.basicIVRForm.get('value5').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value5").setValue("");
      // this.basicIVRForm.controls.value5.clearValidators();
      // this.basicIVRForm.controls.value5.updateValueAndValidity();
      this.valueData5 = [];
      this.externalNumber5 = true;
      this.allAction5 = false;
      this.hangupAction5 = false;
      this.basicIVRForm.controls.value5_Number.enable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value5").setValue("");
      // this.basicIVRForm.controls.value5.clearValidators();
      // this.basicIVRForm.controls.value5.updateValueAndValidity();
      this.valueData5 = [];
      this.externalNumber5 = false;
      this.allAction5 = false;
      this.hangupAction5 = true;
      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value5").setValue("");
      // this.basicIVRForm.controls.value5.clearValidators();
      // this.basicIVRForm.controls.value5.updateValueAndValidity();
      this.valueData5 = [];
      this.externalNumber5 = false;
      this.allAction5 = false;
      this.hangupAction5 = true;
      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value5").setValue("");
      // this.basicIVRForm.controls.value5.clearValidators();
      // this.basicIVRForm.controls.value5.updateValueAndValidity();
      this.valueData5 = [];
      this.externalNumber5 = false;
      this.allAction5 = false;
      this.hangupAction5 = true;
      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value5").setValue("");
        // this.basicIVRForm.controls.value5.clearValidators();
        // this.basicIVRForm.controls.value5.updateValueAndValidity();
        this.valueData5 = [];
        // this.basicIVRForm.get("value5").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction5 = true;
      this.externalNumber5 = false;
      this.hangupAction5 = false;
      this.basicIVRForm.controls.value5.enable();
      this.basicIVRForm.controls.value5_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData5 = data.response;
          this.filterValueSix = this.ValueFilterSix = this.valueData5.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value5").setValue("");
      // this.basicIVRForm.controls.value5.clearValidators();
      // this.basicIVRForm.controls.value5.updateValueAndValidity();
      this.valueData5 = [];
      this.externalNumber5 = false;
      this.allAction5 = false;
      this.hangupAction5 = true;
      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value5").setValue("");
        // this.basicIVRForm.controls.value5.clearValidators();
        // this.basicIVRForm.controls.value5.updateValueAndValidity();
        this.valueData5 = [];
        // this.basicIVRForm.get("value5").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction5 = true;
      this.externalNumber5 = false;
      this.hangupAction5 = false;
      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData5 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueSix = this.ValueFilterSix = this.valueData5.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value5").setValue("");
        // this.basicIVRForm.controls.value5.clearValidators();
        // this.basicIVRForm.controls.value5.updateValueAndValidity();
        this.valueData5 = [];
        // this.basicIVRForm.get("value5").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction5 = true;
      this.externalNumber5 = false;
      this.hangupAction5 = false;
      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData5 = data.response;
          this.filterValueSix = this.ValueFilterSix = this.valueData5.slice();
        });
    }
  }

  getCountryCode5(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode5 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData6(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value6.clearValidators();
    // this.basicIVRForm.controls.value6.updateValueAndValidity();
    // this.basicIVRForm.get('value6').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value6").setValue("");
      // this.basicIVRForm.controls.value6.clearValidators();
      // this.basicIVRForm.controls.value6.updateValueAndValidity();
      this.valueData6 = [];
      this.externalNumber6 = true;
      this.allAction6 = false;
      this.hangupAction6 = false;
      this.basicIVRForm.controls.value6_Number.enable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value6").setValue("");
      // this.basicIVRForm.controls.value6.clearValidators();
      // this.basicIVRForm.controls.value6.updateValueAndValidity();
      this.valueData6 = [];
      this.externalNumber6 = false;
      this.allAction6 = false;
      this.hangupAction6 = true;
      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value6").setValue("");
      // this.basicIVRForm.controls.value6.clearValidators();
      // this.basicIVRForm.controls.value6.updateValueAndValidity();
      this.valueData6 = [];
      this.externalNumber6 = false;
      this.allAction6 = false;
      this.hangupAction6 = true;
      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value6").setValue("");
      // this.basicIVRForm.controls.value6.clearValidators();
      // this.basicIVRForm.controls.value6.updateValueAndValidity();
      this.valueData6 = [];
      this.externalNumber6 = false;
      this.allAction6 = false;
      this.hangupAction6 = true;
      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value6").setValue("");
        // this.basicIVRForm.controls.value6.clearValidators();
        // this.basicIVRForm.controls.value6.updateValueAndValidity();
        this.valueData6 = [];
        // this.basicIVRForm.get("value6").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction6 = true;
      this.externalNumber6 = false;
      this.hangupAction6 = false;
      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData6 = data.response;
          this.filterValueSeven = this.ValueFilterSeven =
            this.valueData6.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value6").setValue("");
      // this.basicIVRForm.controls.value6.clearValidators();
      // this.basicIVRForm.controls.value6.updateValueAndValidity();
      this.valueData6 = [];
      this.externalNumber6 = false;
      this.allAction6 = false;
      this.hangupAction6 = true;
      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value6").setValue("");
        // this.basicIVRForm.controls.value6.clearValidators();
        // this.basicIVRForm.controls.value6.updateValueAndValidity();
        this.valueData6 = [];
        // this.basicIVRForm.get("value6").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction6 = true;
      this.externalNumber6 = false;
      this.hangupAction6 = false;
      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData6 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueSeven = this.ValueFilterSeven =
            this.valueData6.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value6").setValue("");
        // this.basicIVRForm.controls.value6.clearValidators();
        // this.basicIVRForm.controls.value6.updateValueAndValidity();
        this.valueData6 = [];
        // this.basicIVRForm.get("value6").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction6 = true;
      this.externalNumber6 = false;
      this.hangupAction6 = false;
      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData6 = data.response;
          this.filterValueSeven = this.ValueFilterSeven =
            this.valueData6.slice();
        });
    }
  }

  getCountryCode6(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode6 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData7(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value7.clearValidators();
    // this.basicIVRForm.controls.value7.updateValueAndValidity();
    // this.basicIVRForm.get('value7').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value7").setValue("");
      // this.basicIVRForm.controls.value7.clearValidators();
      // this.basicIVRForm.controls.value7.updateValueAndValidity();
      this.valueData7 = [];
      this.externalNumber7 = true;
      this.allAction7 = false;
      this.hangupAction7 = false;
      this.basicIVRForm.controls.value7_Number.enable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value7").setValue("");
      // this.basicIVRForm.controls.value7.clearValidators();
      // this.basicIVRForm.controls.value7.updateValueAndValidity();
      this.valueData7 = [];
      this.externalNumber7 = false;
      this.allAction7 = false;
      this.hangupAction7 = true;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value7").setValue("");
      // this.basicIVRForm.controls.value7.clearValidators();
      // this.basicIVRForm.controls.value7.updateValueAndValidity();
      this.valueData7 = [];
      this.externalNumber7 = false;
      this.allAction7 = false;
      this.hangupAction7 = true;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value7").setValue("");
      // this.basicIVRForm.controls.value7.clearValidators();
      // this.basicIVRForm.controls.value7.updateValueAndValidity();
      this.valueData7 = [];
      this.externalNumber7 = false;
      this.allAction7 = false;
      this.hangupAction7 = true;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value7").setValue("");
        // this.basicIVRForm.controls.value7.clearValidators();
        // this.basicIVRForm.controls.value7.updateValueAndValidity();
        this.valueData7 = [];
        // this.basicIVRForm.get("value7").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction7 = true;
      this.externalNumber7 = false;
      this.hangupAction7 = false;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData7 = data.response;
          this.filterValueEigh = this.ValueFilterEigh = this.valueData7.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value7").setValue("");
      // this.basicIVRForm.controls.value7.clearValidators();
      // this.basicIVRForm.controls.value7.updateValueAndValidity();
      this.valueData7 = [];
      this.externalNumber7 = false;
      this.allAction7 = false;
      this.hangupAction7 = true;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value7").setValue("");
        // this.basicIVRForm.controls.value7.clearValidators();
        // this.basicIVRForm.controls.value7.updateValueAndValidity();
        this.valueData7 = [];
        // this.basicIVRForm.get("value7").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction7 = true;
      this.externalNumber7 = false;
      this.hangupAction7 = false;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData7 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueEigh = this.ValueFilterEigh = this.valueData7.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value7").setValue("");
        // this.basicIVRForm.controls.value7.clearValidators();
        // this.basicIVRForm.controls.value7.updateValueAndValidity();
        this.valueData7 = [];
        // this.basicIVRForm.get("value7").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction7 = true;
      this.externalNumber7 = false;
      this.hangupAction7 = false;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData7 = data.response;
          this.filterValueEigh = this.ValueFilterEigh = this.valueData7.slice();
        });
    }
  }

  getCountryCode7(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode7 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData8(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value8.clearValidators();
    // this.basicIVRForm.controls.value8.updateValueAndValidity();
    // this.basicIVRForm.get('value8').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value8").setValue("");
      // this.basicIVRForm.controls.value8.clearValidators();
      // this.basicIVRForm.controls.value8.updateValueAndValidity();
      this.valueData8 = [];
      this.externalNumber8 = true;
      this.allAction8 = false;
      this.hangupAction8 = false;
      this.basicIVRForm.controls.value8_Number.enable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value8").setValue("");
      // this.basicIVRForm.controls.value8.clearValidators();
      // this.basicIVRForm.controls.value8.updateValueAndValidity();
      this.valueData8 = [];
      this.externalNumber8 = false;
      this.allAction8 = false;
      this.hangupAction8 = true;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value8").setValue("");
      // this.basicIVRForm.controls.value8.clearValidators();
      // this.basicIVRForm.controls.value8.updateValueAndValidity();
      this.valueData8 = [];
      this.externalNumber8 = false;
      this.allAction8 = false;
      this.hangupAction8 = true;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value8").setValue("");
      // this.basicIVRForm.controls.value8.clearValidators();
      // this.basicIVRForm.controls.value8.updateValueAndValidity();
      this.valueData8 = [];
      this.externalNumber8 = false;
      this.allAction8 = false;
      this.hangupAction8 = true;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value8").setValue("");
        // this.basicIVRForm.controls.value8.clearValidators();
        // this.basicIVRForm.controls.value8.updateValueAndValidity();
        this.valueData8 = [];
        // this.basicIVRForm.get("value8").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction8 = true;
      this.externalNumber8 = false;
      this.hangupAction8 = false;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData8 = data.response;
          this.filterValueNine = this.ValueFilterNine = this.valueData8.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value8").setValue("");
      // this.basicIVRForm.controls.value8.clearValidators();
      // this.basicIVRForm.controls.value8.updateValueAndValidity();
      this.valueData8 = [];
      this.externalNumber8 = false;
      this.allAction8 = false;
      this.hangupAction8 = true;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value8").setValue("");
        // this.basicIVRForm.controls.value8.clearValidators();
        // this.basicIVRForm.controls.value8.updateValueAndValidity();
        this.valueData8 = [];
        // this.basicIVRForm.get("value8").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction8 = true;
      this.externalNumber8 = false;
      this.hangupAction8 = false;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData8 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueNine = this.ValueFilterNine = this.valueData8.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value8").setValue("");
        // this.basicIVRForm.controls.value8.clearValidators();
        // this.basicIVRForm.controls.value8.updateValueAndValidity();
        this.valueData8 = [];
        // this.basicIVRForm.get("value8").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction8 = true;
      this.externalNumber8 = false;
      this.hangupAction8 = false;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData8 = data.response;
          this.filterValueNine = this.ValueFilterNine = this.valueData8.slice();
        });
    }
  }

  getCountryCode8(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode8 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData9(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value9.clearValidators();
    // this.basicIVRForm.controls.value9.updateValueAndValidity();
    // this.basicIVRForm.get('value9').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value9").setValue("");
      // this.basicIVRForm.controls.value9.clearValidators();
      // this.basicIVRForm.controls.value9.updateValueAndValidity();
      this.valueData9 = [];
      this.externalNumber9 = true;
      this.allAction9 = false;
      this.hangupAction9 = false;
      this.basicIVRForm.controls.value9_Number.enable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value9").setValue("");
      // this.basicIVRForm.controls.value9.clearValidators();
      // this.basicIVRForm.controls.value9.updateValueAndValidity();
      this.valueData9 = [];
      this.externalNumber9 = false;
      this.allAction9 = false;
      this.hangupAction9 = true;
      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value9").setValue("");
      // this.basicIVRForm.controls.value9.clearValidators();
      // this.basicIVRForm.controls.value9.updateValueAndValidity();
      this.valueData9 = [];
      this.externalNumber9 = false;
      this.allAction9 = false;
      this.hangupAction9 = true;
      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value9").setValue("");
      // this.basicIVRForm.controls.value9.clearValidators();
      // this.basicIVRForm.controls.value9.updateValueAndValidity();
      this.valueData9 = [];
      this.externalNumber9 = false;
      this.allAction9 = false;
      this.hangupAction9 = true;
      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value9").setValue("");
        // this.basicIVRForm.controls.value9.clearValidators();
        // this.basicIVRForm.controls.value9.updateValueAndValidity();
        this.valueData9 = [];
        // this.basicIVRForm.get("value9").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction9 = true;
      this.externalNumber9 = false;
      this.hangupAction9 = false;
      this.basicIVRForm.controls.value9.enable();
      this.basicIVRForm.controls.value9_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData9 = data.response;
          this.filterValueTen = this.ValueFilterTen = this.valueData9.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value9").setValue("");
      // this.basicIVRForm.controls.value9.clearValidators();
      // this.basicIVRForm.controls.value9.updateValueAndValidity();
      this.valueData9 = [];
      this.externalNumber9 = false;
      this.allAction9 = false;
      this.hangupAction9 = true;
      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value9").setValue("");
        // this.basicIVRForm.controls.value9.clearValidators();
        // this.basicIVRForm.controls.value9.updateValueAndValidity();
        this.valueData9 = [];
        // this.basicIVRForm.get("value9").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction9 = true;
      this.externalNumber9 = false;
      this.hangupAction9 = false;
      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData9 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueTen = this.ValueFilterTen = this.valueData9.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value9").setValue("");
        // this.basicIVRForm.controls.value9.clearValidators();
        // this.basicIVRForm.controls.value9.updateValueAndValidity();
        this.valueData9 = [];
        // this.basicIVRForm.get("value9").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction9 = true;
      this.externalNumber9 = false;
      this.hangupAction9 = false;
      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData9 = data.response;
          this.filterValueTen = this.ValueFilterTen = this.valueData9.slice();
        });
    }
  }

  getCountryCode9(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode9 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData10(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value10.clearValidators();
    // this.basicIVRForm.controls.value10.updateValueAndValidity();
    // this.basicIVRForm.get('value10').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value10").setValue("");
      // this.basicIVRForm.controls.value10.clearValidators();
      // this.basicIVRForm.controls.value10.updateValueAndValidity();
      this.valueData10 = [];
      this.externalNumber10 = true;
      this.allAction10 = false;
      this.hangupAction10 = false;
      this.basicIVRForm.controls.value10_Number.enable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value10").setValue("");
      // this.basicIVRForm.controls.value10.clearValidators();
      // this.basicIVRForm.controls.value10.updateValueAndValidity();
      this.valueData10 = [];
      this.externalNumber10 = false;
      this.allAction10 = false;
      this.hangupAction10 = true;
      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value10").setValue("");
      // this.basicIVRForm.controls.value10.clearValidators();
      // this.basicIVRForm.controls.value10.updateValueAndValidity();
      this.valueData10 = [];
      this.externalNumber10 = false;
      this.allAction10 = false;
      this.hangupAction10 = true;
      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value10").setValue("");
      // this.basicIVRForm.controls.value10.clearValidators();
      // this.basicIVRForm.controls.value10.updateValueAndValidity();
      this.valueData10 = [];
      this.externalNumber10 = false;
      this.allAction10 = false;
      this.hangupAction10 = true;
      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value10").setValue("");
        // this.basicIVRForm.controls.value10.clearValidators();
        // this.basicIVRForm.controls.value10.updateValueAndValidity();
        this.valueData10 = [];
        // this.basicIVRForm.get("value10").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction10 = true;
      this.externalNumber10 = false;
      this.hangupAction10 = false;
      this.basicIVRForm.controls.value10.enable();
      this.basicIVRForm.controls.value10_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData10 = data.response;
          this.filterValueElev = this.ValueFilterElev =
            this.valueData10.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value10").setValue("");
      // this.basicIVRForm.controls.value10.clearValidators();
      // this.basicIVRForm.controls.value10.updateValueAndValidity();
      this.valueData10 = [];
      this.externalNumber10 = false;
      this.allAction10 = false;
      this.hangupAction10 = true;
      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value10").setValue("");
        // this.basicIVRForm.controls.value10.clearValidators();
        // this.basicIVRForm.controls.value10.updateValueAndValidity();
        this.valueData10 = [];
        // this.basicIVRForm.get("value10").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction10 = true;
      this.externalNumber10 = false;
      this.hangupAction10 = false;
      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData10 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueElev = this.ValueFilterElev =
            this.valueData10.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value10").setValue("");
        // this.basicIVRForm.controls.value10.clearValidators();
        // this.basicIVRForm.controls.value10.updateValueAndValidity();
        this.valueData10 = [];
        // this.basicIVRForm.get("value10").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction10 = true;
      this.externalNumber10 = false;
      this.hangupAction10 = false;
      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData10 = data.response;
          this.filterValueElev = this.ValueFilterElev =
            this.valueData10.slice();
        });
    }
  }

  getCountryCode10(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode10 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData11(e, loadDataFirstTime?) {
    // this.basicIVRForm.controls.value11.clearValidators();
    // this.basicIVRForm.controls.value11.updateValueAndValidity();
    // this.basicIVRForm.get('value11').setValue('');
    let action = e.value ? e.value : typeof e == 'object' ? e.previousItemData.id : e;
    if (action == "9") {
      this.basicIVRForm.get("value11").setValue("");
      // this.basicIVRForm.controls.value11.clearValidators();
      // this.basicIVRForm.controls.value11.updateValueAndValidity();
      this.valueData11 = [];
      this.externalNumber11 = true;
      this.allAction11 = false;
      this.hangupAction11 = false;
      this.basicIVRForm.controls.value11_Number.enable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "7") {
      this.basicIVRForm.get("value11").setValue("");
      // this.basicIVRForm.controls.value11.clearValidators();
      // this.basicIVRForm.controls.value11.updateValueAndValidity();
      this.valueData11 = [];
      this.externalNumber11 = false;
      this.allAction11 = false;
      this.hangupAction11 = true;
      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "10") {
      this.basicIVRForm.get("value11").setValue("");
      // this.basicIVRForm.controls.value11.clearValidators();
      // this.basicIVRForm.controls.value11.updateValueAndValidity();
      this.valueData11 = [];
      this.externalNumber11 = false;
      this.allAction11 = false;
      this.hangupAction11 = true;
      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "0") {
      this.basicIVRForm.get("value11").setValue("");
      // this.basicIVRForm.controls.value11.clearValidators();
      // this.basicIVRForm.controls.value11.updateValueAndValidity();
      this.valueData11 = [];
      this.externalNumber11 = false;
      this.allAction11 = false;
      this.hangupAction11 = true;
      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "12") {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value11").setValue("");
        // this.basicIVRForm.controls.value11.clearValidators();
        // this.basicIVRForm.controls.value11.updateValueAndValidity();
        this.valueData11 = [];
        // this.basicIVRForm.get("value11").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction11 = true;
      this.externalNumber11 = false;
      this.hangupAction11 = false;
      this.basicIVRForm.controls.value11.enable();
      this.basicIVRForm.controls.value11_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData11 = data.response;
          this.filterValueTwel = this.ValueFilterTwel =
            this.valueData11.slice();
        });
    } else if (action == "14") {
      this.basicIVRForm.get("value11").setValue("");
      // this.basicIVRForm.controls.value11.clearValidators();
      // this.basicIVRForm.controls.value11.updateValueAndValidity();
      this.valueData11 = [];
      this.externalNumber11 = false;
      this.allAction11 = false;
      this.hangupAction11 = true;
      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "2") {
      // use for remove itself IVR in list when i select ivr as a feature.
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value11").setValue("");
        // this.basicIVRForm.controls.value11.clearValidators();
        // this.basicIVRForm.controls.value11.updateValueAndValidity();
        this.valueData11 = [];
        // this.basicIVRForm.get("value11").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction11 = true;
      this.externalNumber11 = false;
      this.hangupAction11 = false;
      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          let ivrList = data.response;
          this.valueData11 = ivrList.filter((item) => {
            if (item.id != Number(this.sessionId)) return item;
          });
          this.filterValueTwel = this.ValueFilterTwel =
            this.valueData11.slice();
        });
    } else {
      if (!loadDataFirstTime) {
        this.basicIVRForm.get("value11").setValue("");
        // this.basicIVRForm.controls.value11.clearValidators();
        // this.basicIVRForm.controls.value11.updateValueAndValidity();
        this.valueData11 = [];
        // this.basicIVRForm.get("value11").setValue("");
        // this.basicIVRForm.updateValueAndValidity();
      }
      this.allAction11 = true;
      this.externalNumber11 = false;
      this.hangupAction11 = false;
      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData11 = data.response;
          this.filterValueTwel = this.ValueFilterTwel =
            this.valueData11.slice();
        });
    }
  }

  getCountryCode11(event) {
    let country_id = event.value ? event.value : event;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode11 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  feedbackIVRToggle(e) {
    let value = e.checked;
    this.activeFeature = [];
    if (value === true) {
      this.isShowSelectionDTMF = true;
      this.isShowDTMFSelectionPart = false;
      this.basicIVRForm.get("multilevel_ivr").setValue(false);
      this.basicIVRForm.controls["multilevel_ivr"].disable();
      this.activeFeature.push({ id: "0", feature: "Select Feature" });
      this.setEmptyAllValueFields(); // set black of all feature values
      this.filterFeatureZero = this.FeatureFilterZero =
        this.activeFeature.slice();
      this.filterFeatureOne = this.FeatureFilterOne =
        this.activeFeature.slice();
      this.filterFeatureTwo = this.FeatureFilterTwo =
        this.activeFeature.slice();
      this.filterFeatureThree = this.FeatureFilterThree =
        this.activeFeature.slice();
      this.filterFeatureFour = this.FeatureFilterFour =
        this.activeFeature.slice();
      this.filterFeatureFive = this.FeatureFilterFive =
        this.activeFeature.slice();
      this.filterFeatureSix = this.FeatureFilterSix =
        this.activeFeature.slice();
      this.filterFeatureSev = this.FeatureFilterSev =
        this.activeFeature.slice();
      this.filterFeatureEig = this.FeatureFilterEig =
        this.activeFeature.slice();
      this.filterFeatureNine = this.FeatureFilterNine =
        this.activeFeature.slice();
      this.filterFeatureTen = this.FeatureFilterTen =
        this.activeFeature.slice();
      this.filterFeatureEle = this.FeatureFilterEle =
        this.activeFeature.slice();
    } else {
      this.activeFeature = [];
      this.isShowSelectionDTMF = false;
      this.isShowDTMFSelectionPart = true;
      this.basicIVRForm.controls["multilevel_ivr"].enable();
      this.basicIVRForm.get("selection_dtmf_required").setValue(false);
      this.setEmptyAllValueFields(); // set black of all feature values
      this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(
        (data) => {
          this.activeFeature.push({ id: "0", feature: "Select Feature" });
          this.filterFeatureZero = this.FeatureFilterZero =
            this.activeFeature.slice();
          this.filterFeatureOne = this.FeatureFilterOne =
            this.activeFeature.slice();
          this.filterFeatureTwo = this.FeatureFilterTwo =
            this.activeFeature.slice();
          this.filterFeatureThree = this.FeatureFilterThree =
            this.activeFeature.slice();
          this.filterFeatureFour = this.FeatureFilterFour =
            this.activeFeature.slice();
          this.filterFeatureFive = this.FeatureFilterFive =
            this.activeFeature.slice();
          this.filterFeatureSix = this.FeatureFilterSix =
            this.activeFeature.slice();
          this.filterFeatureSev = this.FeatureFilterSev =
            this.activeFeature.slice();
          this.filterFeatureEig = this.FeatureFilterEig =
            this.activeFeature.slice();
          this.filterFeatureNine = this.FeatureFilterNine =
            this.activeFeature.slice();
          this.filterFeatureTen = this.FeatureFilterTen =
            this.activeFeature.slice();
          this.filterFeatureEle = this.FeatureFilterEle =
            this.activeFeature.slice();

          if (data[0].call_group == "1") {
            this.activeFeature.push({ id: "5", feature: "Call Group" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].conference == "1") {
            this.activeFeature.push({ id: "3", feature: "Conference" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          this.activeFeature.push({ id: "8", feature: "Enterprise PSTN" });
          this.activeFeature.push({ id: "9", feature: "Custom PSTN" });
          this.activeFeature.push({ id: "7", feature: "Hangup" }); //1
          this.filterFeatureZero = this.FeatureFilterZero =
            this.activeFeature.slice();
          this.filterFeatureOne = this.FeatureFilterOne =
            this.activeFeature.slice();
          this.filterFeatureTwo = this.FeatureFilterTwo =
            this.activeFeature.slice();
          this.filterFeatureThree = this.FeatureFilterThree =
            this.activeFeature.slice();
          this.filterFeatureFour = this.FeatureFilterFour =
            this.activeFeature.slice();
          this.filterFeatureFive = this.FeatureFilterFive =
            this.activeFeature.slice();
          this.filterFeatureSix = this.FeatureFilterSix =
            this.activeFeature.slice();
          this.filterFeatureSev = this.FeatureFilterSev =
            this.activeFeature.slice();
          this.filterFeatureEig = this.FeatureFilterEig =
            this.activeFeature.slice();
          this.filterFeatureNine = this.FeatureFilterNine =
            this.activeFeature.slice();
          this.filterFeatureTen = this.FeatureFilterTen =
            this.activeFeature.slice();
          this.filterFeatureEle = this.FeatureFilterEle =
            this.activeFeature.slice();

          if (data[0].ivr == "1") {
            this.activeFeature.push({ id: "2", feature: "IVR" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].custom_prompt == "1") {
            this.activeFeature.push({ id: "11", feature: "Prompt" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].queue == "1") {
            this.activeFeature.push({ id: "4", feature: "Queue" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          this.activeFeature.push({ id: "10", feature: "Repeat" });
          this.activeFeature.push({ id: "1", feature: "SIP" });
          this.filterFeatureZero = this.FeatureFilterZero =
            this.activeFeature.slice();
          this.filterFeatureOne = this.FeatureFilterOne =
            this.activeFeature.slice();
          this.filterFeatureTwo = this.FeatureFilterTwo =
            this.activeFeature.slice();
          this.filterFeatureThree = this.FeatureFilterThree =
            this.activeFeature.slice();
          this.filterFeatureFour = this.FeatureFilterFour =
            this.activeFeature.slice();
          this.filterFeatureFive = this.FeatureFilterFive =
            this.activeFeature.slice();
          this.filterFeatureSix = this.FeatureFilterSix =
            this.activeFeature.slice();
          this.filterFeatureSev = this.FeatureFilterSev =
            this.activeFeature.slice();
          this.filterFeatureEig = this.FeatureFilterEig =
            this.activeFeature.slice();
          this.filterFeatureNine = this.FeatureFilterNine =
            this.activeFeature.slice();
          this.filterFeatureTen = this.FeatureFilterTen =
            this.activeFeature.slice();
          this.filterFeatureEle = this.FeatureFilterEle =
            this.activeFeature.slice();

          if (data[0].queue == "1") {
            this.activeFeature.push({ id: "6", feature: "Voicemail" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].playback == "1") {
            this.activeFeature.push({ id: "12", feature: "Playback Call" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].feedbackcall == "1") {
            this.isShowFeedBackIVR = true;
          }
        },
        (err) => {
          this.errors = err.message;
        }
      );
    }
  }

  dtmfRequiredToggle(e) {
    let value = e.checked;
    this.activeFeature = [];
    if (value === true) {
      this.isShowSelectionDTMF = true;
      this.isShowDTMFSelectionPart = true;
      this.activeFeature.push({ id: "0", feature: "Select Feature" });
      this.activeFeature.push({ id: "7", feature: "Hangup" });
      this.activeFeature.push({ id: "10", feature: "Repeat" });
      this.activeFeature.push({ id: "1", feature: "SIP" });
      this.filterFeatureZero = this.FeatureFilterZero =
        this.activeFeature.slice();
      this.filterFeatureOne = this.FeatureFilterOne =
        this.activeFeature.slice();
      this.filterFeatureTwo = this.FeatureFilterTwo =
        this.activeFeature.slice();
      this.filterFeatureThree = this.FeatureFilterThree =
        this.activeFeature.slice();
      this.filterFeatureFour = this.FeatureFilterFour =
        this.activeFeature.slice();
      this.filterFeatureFive = this.FeatureFilterFive =
        this.activeFeature.slice();
      this.filterFeatureSix = this.FeatureFilterSix =
        this.activeFeature.slice();
      this.filterFeatureSev = this.FeatureFilterSev =
        this.activeFeature.slice();
      this.filterFeatureEig = this.FeatureFilterEig =
        this.activeFeature.slice();
      this.filterFeatureNine = this.FeatureFilterNine =
        this.activeFeature.slice();
      this.filterFeatureTen = this.FeatureFilterTen =
        this.activeFeature.slice();
      this.filterFeatureEle = this.FeatureFilterEle =
        this.activeFeature.slice();

      if (this.packageActiveFeature[0].queue == "1") {
        this.activeFeature.push({ id: "4", feature: "Queue" });
        this.filterFeatureZero = this.FeatureFilterZero =
          this.activeFeature.slice();
        this.filterFeatureOne = this.FeatureFilterOne =
          this.activeFeature.slice();
        this.filterFeatureTwo = this.FeatureFilterTwo =
          this.activeFeature.slice();
        this.filterFeatureThree = this.FeatureFilterThree =
          this.activeFeature.slice();
        this.filterFeatureFour = this.FeatureFilterFour =
          this.activeFeature.slice();
        this.filterFeatureFive = this.FeatureFilterFive =
          this.activeFeature.slice();
        this.filterFeatureSix = this.FeatureFilterSix =
          this.activeFeature.slice();
        this.filterFeatureSev = this.FeatureFilterSev =
          this.activeFeature.slice();
        this.filterFeatureEig = this.FeatureFilterEig =
          this.activeFeature.slice();
        this.filterFeatureNine = this.FeatureFilterNine =
          this.activeFeature.slice();
        this.filterFeatureTen = this.FeatureFilterTen =
          this.activeFeature.slice();
        this.filterFeatureEle = this.FeatureFilterEle =
          this.activeFeature.slice();
      }
      if (this.packageActiveFeature[0].call_group == "1") {
        this.activeFeature.push({ id: "5", feature: "Call Group" });
        this.filterFeatureZero = this.FeatureFilterZero =
          this.activeFeature.slice();
        this.filterFeatureOne = this.FeatureFilterOne =
          this.activeFeature.slice();
        this.filterFeatureTwo = this.FeatureFilterTwo =
          this.activeFeature.slice();
        this.filterFeatureThree = this.FeatureFilterThree =
          this.activeFeature.slice();
        this.filterFeatureFour = this.FeatureFilterFour =
          this.activeFeature.slice();
        this.filterFeatureFive = this.FeatureFilterFive =
          this.activeFeature.slice();
        this.filterFeatureSix = this.FeatureFilterSix =
          this.activeFeature.slice();
        this.filterFeatureSev = this.FeatureFilterSev =
          this.activeFeature.slice();
        this.filterFeatureEig = this.FeatureFilterEig =
          this.activeFeature.slice();
        this.filterFeatureNine = this.FeatureFilterNine =
          this.activeFeature.slice();
        this.filterFeatureTen = this.FeatureFilterTen =
          this.activeFeature.slice();
        this.filterFeatureEle = this.FeatureFilterEle =
          this.activeFeature.slice();
      }
      this.setEmptyAllValueFields(); // set black of all feature values
    } else {
      this.activeFeature = [];
      this.isShowDTMFSelectionPart = false;
      this.activeFeature.push({ id: "0", feature: "Select Feature" });
      this.filterFeatureZero = this.FeatureFilterZero =
        this.activeFeature.slice();
      this.filterFeatureOne = this.FeatureFilterOne =
        this.activeFeature.slice();
      this.filterFeatureTwo = this.FeatureFilterTwo =
        this.activeFeature.slice();
      this.filterFeatureThree = this.FeatureFilterThree =
        this.activeFeature.slice();
      this.filterFeatureFour = this.FeatureFilterFour =
        this.activeFeature.slice();
      this.filterFeatureFive = this.FeatureFilterFive =
        this.activeFeature.slice();
      this.filterFeatureSix = this.FeatureFilterSix =
        this.activeFeature.slice();
      this.filterFeatureSev = this.FeatureFilterSev =
        this.activeFeature.slice();
      this.filterFeatureEig = this.FeatureFilterEig =
        this.activeFeature.slice();
      this.filterFeatureNine = this.FeatureFilterNine =
        this.activeFeature.slice();
      this.filterFeatureTen = this.FeatureFilterTen =
        this.activeFeature.slice();
      this.filterFeatureEle = this.FeatureFilterEle =
        this.activeFeature.slice();
      this.setEmptyAllValueFields(); // set black of all feature values
    }
  }


  multilevelIVRToggle(e) {
    let value = e.checked;
    this.activeFeature = [];
    let array = [];    

    
   
    if (value === true) {
      
      this.basicIVRForm.get("feedbackIVR").setValue(false);
      this.basicIVRForm.get("selection_dtmf_required").setValue(false);
      this.basicIVRForm.controls["feedbackIVR"].disable();
      this.basicIVRForm.controls["selection_dtmf_required"].disable();
      this.basicIVRForm.get("directExtenDial").setValue(false);
      this.basicIVRForm.controls["directExtenDial"].disable();

      this.activeFeature = [];
      this.isShowSelectionDTMF = false;
      this.basicIVRForm.get("action0").setValue('0');
      this.basicIVRForm.get("action1").setValue("0");
      this.basicIVRForm.get("action2").setValue("0");
      this.basicIVRForm.get("action3").setValue("0");
      this.basicIVRForm.get("action4").setValue("0");
      this.basicIVRForm.get("action5").setValue("0");
      this.basicIVRForm.get("action6").setValue("0");
      this.basicIVRForm.get("action7").setValue("0");
      this.basicIVRForm.get("action8").setValue("0");
      this.basicIVRForm.get("action9").setValue("0");
      this.basicIVRForm.get("action10").setValue("0");
      this.basicIVRForm.get("action11").setValue("0");
      // this.basicIVRForm.get("selection_dtmf_required").setValue(false);
      this.setEmptyAllValueFields(); // set black of all feature values

      this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(
        (data) => {
          this.count++;          
                                         
          // this.activeFeature.push({ id: '0', feature: "Select Feature" });
          // this.activeFeature.push({ id: '14', feature: "Back to Main IVR" });
          array.push({ id: '0', feature: "Select Feature" });
          array.push({ id: '14', feature: "Back to Main IVR" });

          this.filterFeatureZero = this.FeatureFilterZero =
            this.activeFeature.slice();
          this.filterFeatureOne = this.FeatureFilterOne =
            this.activeFeature.slice();
          this.filterFeatureTwo = this.FeatureFilterTwo =
            this.activeFeature.slice();
          this.filterFeatureThree = this.FeatureFilterThree =
            this.activeFeature.slice();
          this.filterFeatureFour = this.FeatureFilterFour =
            this.activeFeature.slice();
          this.filterFeatureFive = this.FeatureFilterFive =
            this.activeFeature.slice();
          this.filterFeatureSix = this.FeatureFilterSix =
            this.activeFeature.slice();
          this.filterFeatureSev = this.FeatureFilterSev =
            this.activeFeature.slice();
          this.filterFeatureEig = this.FeatureFilterEig =
            this.activeFeature.slice();
          this.filterFeatureNine = this.FeatureFilterNine =
            this.activeFeature.slice();
          this.filterFeatureTen = this.FeatureFilterTen =
            this.activeFeature.slice();
          this.filterFeatureEle = this.FeatureFilterEle =
            this.activeFeature.slice();

          if (data[0].call_group == "1") {
      
            // this.activeFeature.push({ id: '5', feature: "Call Group" });
            array.push({ id: '5', feature: "Call Group" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }

          if (data[0].conference == "1") {

            // this.activeFeature.push({ id: '3', feature: "Conference" });
            array.push({ id: '3', feature: "Conference" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }

          // this.activeFeature.push({ id: '8', feature: "Enterprise PSTN" });
          // this.activeFeature.push({ id: '9', feature: "Custom PSTN" });
          // this.activeFeature.push({ id: '7', feature: "Hangup" }); //1
          array.push({ id: '8', feature: "Enterprise PSTN" });
          array.push({ id: '9', feature: "Custom PSTN" });
          array.push({ id: '7', feature: "Hangup" }); //1
          this.filterFeatureZero = this.FeatureFilterZero =
            this.activeFeature.slice();
          this.filterFeatureOne = this.FeatureFilterOne =
            this.activeFeature.slice();
          this.filterFeatureTwo = this.FeatureFilterTwo =
            this.activeFeature.slice();
          this.filterFeatureThree = this.FeatureFilterThree =
            this.activeFeature.slice();
          this.filterFeatureFour = this.FeatureFilterFour =
            this.activeFeature.slice();
          this.filterFeatureFive = this.FeatureFilterFive =
            this.activeFeature.slice();
          this.filterFeatureSix = this.FeatureFilterSix =
            this.activeFeature.slice();
          this.filterFeatureSev = this.FeatureFilterSev =
            this.activeFeature.slice();
          this.filterFeatureEig = this.FeatureFilterEig =
            this.activeFeature.slice();
          this.filterFeatureNine = this.FeatureFilterNine =
            this.activeFeature.slice();
          this.filterFeatureTen = this.FeatureFilterTen =
            this.activeFeature.slice();
          this.filterFeatureEle = this.FeatureFilterEle =
            this.activeFeature.slice();

          if (data[0].ivr == "1") {

            // this.activeFeature.push({ id: '2', feature: "IVR" });
            array.push({ id: '2', feature: "IVR" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].custom_prompt == "1") {

            // this.activeFeature.push({ id: '11', feature: "Prompt" });
            array.push({ id: '11', feature: "Prompt" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          // id 13 is reserved for appointment
          if (data[0].playback == "1") {

            array.push({ id: '12', feature: "Playback Call" });
            this.activeFeature.push({ id: '12', feature: "Playback Call" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].queue == "1") {

            // this.activeFeature.push({ id: '4', feature: "Queue" });
            array.push({ id: '4', feature: "Queue" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          // this.activeFeature.push({ id: '10', feature: "Repeat" });
          // this.activeFeature.push({ id: '1', feature: "SIP" });
          array.push({ id: '10', feature: "Repeat" });
          array.push({ id: '1', feature: "SIP" });
          this.filterFeatureZero = this.FeatureFilterZero =
            this.activeFeature.slice();
          this.filterFeatureOne = this.FeatureFilterOne =
            this.activeFeature.slice();
          this.filterFeatureTwo = this.FeatureFilterTwo =
            this.activeFeature.slice();
          this.filterFeatureThree = this.FeatureFilterThree =
            this.activeFeature.slice();
          this.filterFeatureFour = this.FeatureFilterFour =
            this.activeFeature.slice();
          this.filterFeatureFive = this.FeatureFilterFive =
            this.activeFeature.slice();
          this.filterFeatureSix = this.FeatureFilterSix =
            this.activeFeature.slice();
          this.filterFeatureSev = this.FeatureFilterSev =
            this.activeFeature.slice();
          this.filterFeatureEig = this.FeatureFilterEig =
            this.activeFeature.slice();
          this.filterFeatureNine = this.FeatureFilterNine =
            this.activeFeature.slice();
          this.filterFeatureTen = this.FeatureFilterTen =
            this.activeFeature.slice();
          this.filterFeatureEle = this.FeatureFilterEle =
            this.activeFeature.slice();

          if (data[0].queue == "1") {

            // this.activeFeature.push({ id: '6', feature: "Voicemail" });
            array.push({ id: '6', feature: "Voicemail" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
             
          this.activeFeature = array;
          array = [];    

          if (data[0].feedbackcall == "1") {

            this.isShowFeedBackIVR = true;
          }
        },
        (err) => {
          this.errors = err.message;
        }
      );

    } else {         
      // this.basicIVRForm.get("action0").clearValidators()
      // this.basicIVRForm.get("action1").clearValidators()
      // this.basicIVRForm.get("action2").clearValidators()
      // this.basicIVRForm.get("action3").clearValidators()
      // this.basicIVRForm.get("action4").clearValidators()
      // this.basicIVRForm.get("action5").clearValidators()
      // this.basicIVRForm.get("action6").clearValidators()
      // this.basicIVRForm.get("action7").clearValidators()
      // this.basicIVRForm.get("action8").clearValidators()
      // this.basicIVRForm.get("action9").clearValidators()
      // this.basicIVRForm.get("action10").clearValidators()
      // this.basicIVRForm.get("action11").clearValidators()
      this.activeFeature = [];
      this.isShowSelectionDTMF = false;
      let id = localStorage.getItem('id');
      this.basicIVRForm.controls["feedbackIVR"].enable();
      this.basicIVRForm.controls["directExtenDial"].enable();
      this.basicIVRForm.controls["selection_dtmf_required"].enable();
      this.basicIVRForm.get("action0").setValue('0');
      this.basicIVRForm.get("action1").setValue("0");
      this.basicIVRForm.get("action2").setValue("0");
      this.basicIVRForm.get("action3").setValue("0");
      this.basicIVRForm.get("action4").setValue("0");
      this.basicIVRForm.get("action5").setValue("0");
      this.basicIVRForm.get("action6").setValue("0");
      this.basicIVRForm.get("action7").setValue("0");
      this.basicIVRForm.get("action8").setValue("0");
      this.basicIVRForm.get("action9").setValue("0");
      this.basicIVRForm.get("action10").setValue("0");
      this.basicIVRForm.get("action11").setValue("0");   
      this.setEmptyAllValueFields(); // set black of all fea/ture values
      this.didService.getActiveFeature(id).subscribe(
        (data) => {          
          array.push({ id: "0", feature: "Select Feature" });
          // this.filterFeatureZero = this.FeatureFilterZero =
          //   this.activeFeature.slice();
          // this.filterFeatureOne = this.FeatureFilterOne =
          //   this.activeFeature.slice();
          // this.filterFeatureTwo = this.FeatureFilterTwo =
          //   this.activeFeature.slice();
          // this.filterFeatureThree = this.FeatureFilterThree =
          //   this.activeFeature.slice();
          // this.filterFeatureFour = this.FeatureFilterFour =
          //   this.activeFeature.slice();
          // this.filterFeatureFive = this.FeatureFilterFive =
          //   this.activeFeature.slice();
          // this.filterFeatureSix = this.FeatureFilterSix =
          //   this.activeFeature.slice();
          // this.filterFeatureSev = this.FeatureFilterSev =
          //   this.activeFeature.slice();
          // this.filterFeatureEig = this.FeatureFilterEig =
          //   this.activeFeature.slice();
          // this.filterFeatureNine = this.FeatureFilterNine =
          //   this.activeFeature.slice();
          // this.filterFeatureTen = this.FeatureFilterTen =
          //   this.activeFeature.slice();
          // this.filterFeatureEle = this.FeatureFilterEle =
          //   this.activeFeature.slice();

          if (data[0].call_group == "1") {
            array.push({ id: "5", feature: "Call Group" });
            // this.filterFeatureZero = this.FeatureFilterZero =
            //   this.activeFeature.slice();
            // this.filterFeatureOne = this.FeatureFilterOne =
            //   this.activeFeature.slice();
            // this.filterFeatureTwo = this.FeatureFilterTwo =
            //   this.activeFeature.slice();
            // this.filterFeatureThree = this.FeatureFilterThree =
            //   this.activeFeature.slice();
            // this.filterFeatureFour = this.FeatureFilterFour =
            //   this.activeFeature.slice();
            // this.filterFeatureFive = this.FeatureFilterFive =
            //   this.activeFeature.slice();
            // this.filterFeatureSix = this.FeatureFilterSix =
            //   this.activeFeature.slice();
            // this.filterFeatureSev = this.FeatureFilterSev =
            //   this.activeFeature.slice();
            // this.filterFeatureEig = this.FeatureFilterEig =
            //   this.activeFeature.slice();
            // this.filterFeatureNine = this.FeatureFilterNine =
            //   this.activeFeature.slice();
            // this.filterFeatureTen = this.FeatureFilterTen =
            //   this.activeFeature.slice();
            // this.filterFeatureEle = this.FeatureFilterEle =
            //   this.activeFeature.slice();
          }
          if (data[0].conference == "1") {
            this.activeFeature.push({ id: "3", feature: "Conference" });
            // this.filterFeatureZero = this.FeatureFilterZero =
            //   this.activeFeature.slice();
            // this.filterFeatureOne = this.FeatureFilterOne =
            //   this.activeFeature.slice();
            // this.filterFeatureTwo = this.FeatureFilterTwo =
            //   this.activeFeature.slice();
            // this.filterFeatureThree = this.FeatureFilterThree =
            //   this.activeFeature.slice();
            // this.filterFeatureFour = this.FeatureFilterFour =
            //   this.activeFeature.slice();
            // this.filterFeatureFive = this.FeatureFilterFive =
            //   this.activeFeature.slice();
            // this.filterFeatureSix = this.FeatureFilterSix =
            //   this.activeFeature.slice();
            // this.filterFeatureSev = this.FeatureFilterSev =
            //   this.activeFeature.slice();
            // this.filterFeatureEig = this.FeatureFilterEig =
            //   this.activeFeature.slice();
            // this.filterFeatureNine = this.FeatureFilterNine =
            //   this.activeFeature.slice();
            // this.filterFeatureTen = this.FeatureFilterTen =
            //   this.activeFeature.slice();
            // this.filterFeatureEle = this.FeatureFilterEle =
            //   this.activeFeature.slice();
          }
          array.push({ id: "8", feature: "Enterprise PSTN" });
          array.push({ id: "9", feature: "Custom PSTN" });
          array.push({ id: "7", feature: "Hangup" }); //1
          // this.filterFeatureZero = this.FeatureFilterZero =
          //   this.activeFeature.slice();
          // this.filterFeatureOne = this.FeatureFilterOne =
          //   this.activeFeature.slice();
          // this.filterFeatureTwo = this.FeatureFilterTwo =
          //   this.activeFeature.slice();
          // this.filterFeatureThree = this.FeatureFilterThree =
          //   this.activeFeature.slice();
          // this.filterFeatureFour = this.FeatureFilterFour =
          //   this.activeFeature.slice();
          // this.filterFeatureFive = this.FeatureFilterFive =
          //   this.activeFeature.slice();
          // this.filterFeatureSix = this.FeatureFilterSix =
          //   this.activeFeature.slice();
          // this.filterFeatureSev = this.FeatureFilterSev =
          //   this.activeFeature.slice();
          // this.filterFeatureEig = this.FeatureFilterEig =
          //   this.activeFeature.slice();
          // this.filterFeatureNine = this.FeatureFilterNine =
          //   this.activeFeature.slice();
          // this.filterFeatureTen = this.FeatureFilterTen =
          //   this.activeFeature.slice();
          // this.filterFeatureEle = this.FeatureFilterEle =
          //   this.activeFeature.slice();

          if (data[0].ivr == "1") {
            array.push({ id: "2", feature: "IVR" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].custom_prompt == "1") {
            array.push({ id: "11", feature: "Prompt" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          // id 13 is reserved for appointment
          if (data[0].playback == "1") {
            array.push({ id: "12", feature: "Playback Call" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].queue == "1") {
            array.push({ id: "4", feature: "Queue" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          array.push({ id: "10", feature: "Repeat" });
          array.push({ id: "1", feature: "SIP" });
          // this.filterFeatureZero = this.FeatureFilterZero =
          //   this.activeFeature.slice();
          // this.filterFeatureOne = this.FeatureFilterOne =
          //   this.activeFeature.slice();
          // this.filterFeatureTwo = this.FeatureFilterTwo =
          //   this.activeFeature.slice();
          // this.filterFeatureThree = this.FeatureFilterThree =
          //   this.activeFeature.slice();
          // this.filterFeatureFour = this.FeatureFilterFour =
          //   this.activeFeature.slice();
          // this.filterFeatureFive = this.FeatureFilterFive =
          //   this.activeFeature.slice();
          // this.filterFeatureSix = this.FeatureFilterSix =
          //   this.activeFeature.slice();
          // this.filterFeatureSev = this.FeatureFilterSev =
          //   this.activeFeature.slice();
          // this.filterFeatureEig = this.FeatureFilterEig =
          //   this.activeFeature.slice();
          // this.filterFeatureNine = this.FeatureFilterNine =
          //   this.activeFeature.slice();
          // this.filterFeatureTen = this.FeatureFilterTen =
          //   this.activeFeature.slice();
          // this.filterFeatureEle = this.FeatureFilterEle =
          //   this.activeFeature.slice();

          if (data[0].queue == "1") {
            array.push({ id: "6", feature: "Voicemail" });
            this.filterFeatureZero = this.FeatureFilterZero =
              this.activeFeature.slice();
            this.filterFeatureOne = this.FeatureFilterOne =
              this.activeFeature.slice();
            this.filterFeatureTwo = this.FeatureFilterTwo =
              this.activeFeature.slice();
            this.filterFeatureThree = this.FeatureFilterThree =
              this.activeFeature.slice();
            this.filterFeatureFour = this.FeatureFilterFour =
              this.activeFeature.slice();
            this.filterFeatureFive = this.FeatureFilterFive =
              this.activeFeature.slice();
            this.filterFeatureSix = this.FeatureFilterSix =
              this.activeFeature.slice();
            this.filterFeatureSev = this.FeatureFilterSev =
              this.activeFeature.slice();
            this.filterFeatureEig = this.FeatureFilterEig =
              this.activeFeature.slice();
            this.filterFeatureNine = this.FeatureFilterNine =
              this.activeFeature.slice();
            this.filterFeatureTen = this.FeatureFilterTen =
              this.activeFeature.slice();
            this.filterFeatureEle = this.FeatureFilterEle =
              this.activeFeature.slice();
          }
          if (data[0].feedbackcall == "1") {
            this.isShowFeedBackIVR = true;
          }

          this.activeFeature = array;
          array = [];          
          
        },
        (err) => {
          this.errors = err.message;
        }
      );
    }
  }



  // multilevelIVRToggle2(e) {
  
  //   let value = e.checked;
  //   // this.activeFeature = [];
   
  //   if (value === true) {
  
  //     this.basicIVRForm.get("feedbackIVR").setValue(false);
  //     this.basicIVRForm.get("selection_dtmf_required").setValue(false);
  //     this.basicIVRForm.controls["feedbackIVR"].disable();
  //     this.basicIVRForm.controls["selection_dtmf_required"].disable();
      
  //     this.isShowSelectionDTMF = false;
  //     // this.basicIVRForm.get("selection_dtmf_required").setValue(false);
  //     this.setEmptyAllValueFields(); // set black of all feature values

  //     if(this.activeFeature.length == 12){
  //       this.activeFeature = [];
  //     }

  //     this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(
  //       (data) => {
  //         this.activeFeature.push({ id: '0', feature: "Select Feature" });
  //         this.activeFeature.push({ id: '14', feature: "Back to Main IVR" });

  //         this.filterFeatureZero = this.FeatureFilterZero =
  //           this.activeFeature.slice();
  //         this.filterFeatureOne = this.FeatureFilterOne =
  //           this.activeFeature.slice();
  //         this.filterFeatureTwo = this.FeatureFilterTwo =
  //           this.activeFeature.slice();
  //         this.filterFeatureThree = this.FeatureFilterThree =
  //           this.activeFeature.slice();
  //         this.filterFeatureFour = this.FeatureFilterFour =
  //           this.activeFeature.slice();
  //         this.filterFeatureFive = this.FeatureFilterFive =
  //           this.activeFeature.slice();
  //         this.filterFeatureSix = this.FeatureFilterSix =
  //           this.activeFeature.slice();
  //         this.filterFeatureSev = this.FeatureFilterSev =
  //           this.activeFeature.slice();
  //         this.filterFeatureEig = this.FeatureFilterEig =
  //           this.activeFeature.slice();
  //         this.filterFeatureNine = this.FeatureFilterNine =
  //           this.activeFeature.slice();
  //         this.filterFeatureTen = this.FeatureFilterTen =
  //           this.activeFeature.slice();
  //         this.filterFeatureEle = this.FeatureFilterEle =
  //           this.activeFeature.slice();

  //         if (data[0].call_group == "1") {
  //           this.activeFeature.push({ id: '5', feature: "Call Group" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }

  //         if (data[0].conference == "1") {
  //           this.activeFeature.push({ id: '3', feature: "Conference" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }    
  //         this.activeFeature.push({ id: '8', feature: "Enterprise PSTN" });
  //         this.activeFeature.push({ id: '9', feature: "Custom PSTN" });
  //         this.activeFeature.push({ id: '7', feature: "Hangup" }); //1
  //         this.filterFeatureZero = this.FeatureFilterZero =
  //           this.activeFeature.slice();
  //         this.filterFeatureOne = this.FeatureFilterOne =
  //           this.activeFeature.slice();
  //         this.filterFeatureTwo = this.FeatureFilterTwo =
  //           this.activeFeature.slice();
  //         this.filterFeatureThree = this.FeatureFilterThree =
  //           this.activeFeature.slice();
  //         this.filterFeatureFour = this.FeatureFilterFour =
  //           this.activeFeature.slice();
  //         this.filterFeatureFive = this.FeatureFilterFive =
  //           this.activeFeature.slice();
  //         this.filterFeatureSix = this.FeatureFilterSix =
  //           this.activeFeature.slice();
  //         this.filterFeatureSev = this.FeatureFilterSev =
  //           this.activeFeature.slice();
  //         this.filterFeatureEig = this.FeatureFilterEig =
  //           this.activeFeature.slice();
  //         this.filterFeatureNine = this.FeatureFilterNine =
  //           this.activeFeature.slice();
  //         this.filterFeatureTen = this.FeatureFilterTen =
  //           this.activeFeature.slice();
  //         this.filterFeatureEle = this.FeatureFilterEle =
  //           this.activeFeature.slice();

  //         if (data[0].ivr == "1") {
  //           this.activeFeature.push({ id: '2', feature: "IVR" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         if (data[0].custom_prompt == "1") {
  //           this.activeFeature.push({ id: '11', feature: "Prompt" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         // id 13 is reserved for appointment
  //         if (data[0].playback == "1") {

  //           this.activeFeature.push({ id: '12', feature: "Playback Call" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         if (data[0].queue == "1") {
  //           this.activeFeature.push({ id: '4', feature: "Queue" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         this.activeFeature.push({ id: '10', feature: "Repeat" });
  //         this.activeFeature.push({ id: '1', feature: "SIP" });
  //         this.filterFeatureZero = this.FeatureFilterZero =
  //           this.activeFeature.slice();
  //         this.filterFeatureOne = this.FeatureFilterOne =
  //           this.activeFeature.slice();
  //         this.filterFeatureTwo = this.FeatureFilterTwo =
  //           this.activeFeature.slice();
  //         this.filterFeatureThree = this.FeatureFilterThree =
  //           this.activeFeature.slice();
  //         this.filterFeatureFour = this.FeatureFilterFour =
  //           this.activeFeature.slice();
  //         this.filterFeatureFive = this.FeatureFilterFive =
  //           this.activeFeature.slice();
  //         this.filterFeatureSix = this.FeatureFilterSix =
  //           this.activeFeature.slice();
  //         this.filterFeatureSev = this.FeatureFilterSev =
  //           this.activeFeature.slice();
  //         this.filterFeatureEig = this.FeatureFilterEig =
  //           this.activeFeature.slice();
  //         this.filterFeatureNine = this.FeatureFilterNine =
  //           this.activeFeature.slice();
  //         this.filterFeatureTen = this.FeatureFilterTen =
  //           this.activeFeature.slice();
  //         this.filterFeatureEle = this.FeatureFilterEle =
  //           this.activeFeature.slice();

  //         if (data[0].queue == "1") {
  //           this.activeFeature.push({ id: '6', feature: "Voicemail" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
          
  //         if (data[0].feedbackcall == "1") {

  //           this.isShowFeedBackIVR = true;
  //         }
  //       },
  //       (err) => {
  //         this.errors = err.message;
  //       }
  //     );

  //   } else {
  //     // this.activeFeature = [];
  //     this.isShowSelectionDTMF = false;
  //     let id = localStorage.getItem('id');
  //     this.basicIVRForm.controls["feedbackIVR"].enable();
  //     this.basicIVRForm.controls["selection_dtmf_required"].enable();
  //     this.setEmptyAllValueFields(); // set black of all feature values
  //     this.didService.getActiveFeature(id).subscribe(
  //       (data) => {
  //         this.activeFeature.push({ id: "0", feature: "Select Feature" });
  //         this.filterFeatureZero = this.FeatureFilterZero =
  //           this.activeFeature.slice();
  //         this.filterFeatureOne = this.FeatureFilterOne =
  //           this.activeFeature.slice();
  //         this.filterFeatureTwo = this.FeatureFilterTwo =
  //           this.activeFeature.slice();
  //         this.filterFeatureThree = this.FeatureFilterThree =
  //           this.activeFeature.slice();
  //         this.filterFeatureFour = this.FeatureFilterFour =
  //           this.activeFeature.slice();
  //         this.filterFeatureFive = this.FeatureFilterFive =
  //           this.activeFeature.slice();
  //         this.filterFeatureSix = this.FeatureFilterSix =
  //           this.activeFeature.slice();
  //         this.filterFeatureSev = this.FeatureFilterSev =
  //           this.activeFeature.slice();
  //         this.filterFeatureEig = this.FeatureFilterEig =
  //           this.activeFeature.slice();
  //         this.filterFeatureNine = this.FeatureFilterNine =
  //           this.activeFeature.slice();
  //         this.filterFeatureTen = this.FeatureFilterTen =
  //           this.activeFeature.slice();
  //         this.filterFeatureEle = this.FeatureFilterEle =
  //           this.activeFeature.slice();

  //         if (data[0].call_group == "1") {
  //           this.activeFeature.push({ id: "5", feature: "Call Group" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         if (data[0].conference == "1") {
  //           this.activeFeature.push({ id: "3", feature: "Conference" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         this.activeFeature.push({ id: "8", feature: "Enterprise PSTN" });
  //         this.activeFeature.push({ id: "9", feature: "Custom PSTN" });
  //         this.activeFeature.push({ id: "7", feature: "Hangup" }); //1
  //         this.filterFeatureZero = this.FeatureFilterZero =
  //           this.activeFeature.slice();
  //         this.filterFeatureOne = this.FeatureFilterOne =
  //           this.activeFeature.slice();
  //         this.filterFeatureTwo = this.FeatureFilterTwo =
  //           this.activeFeature.slice();
  //         this.filterFeatureThree = this.FeatureFilterThree =
  //           this.activeFeature.slice();
  //         this.filterFeatureFour = this.FeatureFilterFour =
  //           this.activeFeature.slice();
  //         this.filterFeatureFive = this.FeatureFilterFive =
  //           this.activeFeature.slice();
  //         this.filterFeatureSix = this.FeatureFilterSix =
  //           this.activeFeature.slice();
  //         this.filterFeatureSev = this.FeatureFilterSev =
  //           this.activeFeature.slice();
  //         this.filterFeatureEig = this.FeatureFilterEig =
  //           this.activeFeature.slice();
  //         this.filterFeatureNine = this.FeatureFilterNine =
  //           this.activeFeature.slice();
  //         this.filterFeatureTen = this.FeatureFilterTen =
  //           this.activeFeature.slice();
  //         this.filterFeatureEle = this.FeatureFilterEle =
  //           this.activeFeature.slice();

  //         if (data[0].ivr == "1") {
  //           this.activeFeature.push({ id: "2", feature: "IVR" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         if (data[0].custom_prompt == "1") {
  //           this.activeFeature.push({ id: "11", feature: "Prompt" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         // id 13 is reserved for appointment
  //         if (data[0].playback == "1") {
  //           this.activeFeature.push({ id: "12", feature: "Playback Call" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         if (data[0].queue == "1") {
  //           this.activeFeature.push({ id: "4", feature: "Queue" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         this.activeFeature.push({ id: "10", feature: "Repeat" });
  //         this.activeFeature.push({ id: "1", feature: "SIP" });
  //         this.filterFeatureZero = this.FeatureFilterZero =
  //           this.activeFeature.slice();
  //         this.filterFeatureOne = this.FeatureFilterOne =
  //           this.activeFeature.slice();
  //         this.filterFeatureTwo = this.FeatureFilterTwo =
  //           this.activeFeature.slice();
  //         this.filterFeatureThree = this.FeatureFilterThree =
  //           this.activeFeature.slice();
  //         this.filterFeatureFour = this.FeatureFilterFour =
  //           this.activeFeature.slice();
  //         this.filterFeatureFive = this.FeatureFilterFive =
  //           this.activeFeature.slice();
  //         this.filterFeatureSix = this.FeatureFilterSix =
  //           this.activeFeature.slice();
  //         this.filterFeatureSev = this.FeatureFilterSev =
  //           this.activeFeature.slice();
  //         this.filterFeatureEig = this.FeatureFilterEig =
  //           this.activeFeature.slice();
  //         this.filterFeatureNine = this.FeatureFilterNine =
  //           this.activeFeature.slice();
  //         this.filterFeatureTen = this.FeatureFilterTen =
  //           this.activeFeature.slice();
  //         this.filterFeatureEle = this.FeatureFilterEle =
  //           this.activeFeature.slice();

  //         if (data[0].queue == "1") {
  //           this.activeFeature.push({ id: "6", feature: "Voicemail" });
  //           this.filterFeatureZero = this.FeatureFilterZero =
  //             this.activeFeature.slice();
  //           this.filterFeatureOne = this.FeatureFilterOne =
  //             this.activeFeature.slice();
  //           this.filterFeatureTwo = this.FeatureFilterTwo =
  //             this.activeFeature.slice();
  //           this.filterFeatureThree = this.FeatureFilterThree =
  //             this.activeFeature.slice();
  //           this.filterFeatureFour = this.FeatureFilterFour =
  //             this.activeFeature.slice();
  //           this.filterFeatureFive = this.FeatureFilterFive =
  //             this.activeFeature.slice();
  //           this.filterFeatureSix = this.FeatureFilterSix =
  //             this.activeFeature.slice();
  //           this.filterFeatureSev = this.FeatureFilterSev =
  //             this.activeFeature.slice();
  //           this.filterFeatureEig = this.FeatureFilterEig =
  //             this.activeFeature.slice();
  //           this.filterFeatureNine = this.FeatureFilterNine =
  //             this.activeFeature.slice();
  //           this.filterFeatureTen = this.FeatureFilterTen =
  //             this.activeFeature.slice();
  //           this.filterFeatureEle = this.FeatureFilterEle =
  //             this.activeFeature.slice();
  //         }
  //         if (data[0].feedbackcall == "1") {
  //           this.isShowFeedBackIVR = true;
  //         }

  
          
  //       },
  //       (err) => {
  //         this.errors = err.message;
  //       }
  //     );
  //   }
  // }

  public setEmptyAllValueFields() {
    
    this.value0.setValue("");
    this.value0.disable();
    this.value0.updateValueAndValidity();

    this.value1.setValue("");
    this.value1.disable();
    this.value1.updateValueAndValidity();

    this.value2.setValue("");
    this.value2.disable();
    this.value2.updateValueAndValidity();

    this.value3.setValue("");
    this.value3.disable();
    this.value3.updateValueAndValidity();

    this.value4.setValue("");
    this.value4.disable();
    this.value4.updateValueAndValidity();

    this.value5.setValue("");
    this.value5.disable();
    this.value5.updateValueAndValidity();

    this.value6.setValue("");
    this.value6.disable();
    this.value6.updateValueAndValidity();

    this.value7.setValue("");
    this.value7.disable();
    this.value7.updateValueAndValidity();

    this.value8.setValue("");
    this.value8.disable();
    this.value8.updateValueAndValidity();

    this.value9.setValue("");
    this.value9.disable();
    this.value9.updateValueAndValidity();

    this.value10.setValue("");
    this.value10.disable();
    this.value10.updateValueAndValidity();

    this.value11.setValue("");
    this.value11.disable();
    this.value11.updateValueAndValidity();

    this.basicIVRForm.get("action0").setValue("0");
    this.basicIVRForm.get("action1").setValue("0");
    this.basicIVRForm.get("action2").setValue("0");
    this.basicIVRForm.get("action3").setValue("0");
    this.basicIVRForm.get("action4").setValue("0");
    this.basicIVRForm.get("action5").setValue("0");
    this.basicIVRForm.get("action6").setValue("0");
    this.basicIVRForm.get("action7").setValue("0");
    this.basicIVRForm.get("action8").setValue("0");
    this.basicIVRForm.get("action9").setValue("0");
    this.basicIVRForm.get("action10").setValue("0");
    this.basicIVRForm.get("action11").setValue("0");

    this.commonService.getCustomerCountry(localStorage.getItem("id")).subscribe(
      (data) => {
        //  customerWiseCountry
        this.country_id0 = data.response[0].id;
        this.country_id1 = data.response[0].id;
        this.country_id2 = data.response[0].id;
        this.country_id3 = data.response[0].id;
        this.country_id4 = data.response[0].id;
        this.country_id5 = data.response[0].id;
        this.country_id6 = data.response[0].id;
        this.country_id7 = data.response[0].id;
        this.country_id8 = data.response[0].id;
        this.country_id9 = data.response[0].id;
        this.country_id10 = data.response[0].id;
        this.country_id11 = data.response[0].id;

        this.countryCode0 = "+" + data.response[0].phonecode;
        this.countryCode1 = "+" + data.response[0].phonecode;
        this.countryCode2 = "+" + data.response[0].phonecode;
        this.countryCode3 = "+" + data.response[0].phonecode;
        this.countryCode4 = "+" + data.response[0].phonecode;
        this.countryCode5 = "+" + data.response[0].phonecode;
        this.countryCode6 = "+" + data.response[0].phonecode;
        this.countryCode7 = "+" + data.response[0].phonecode;
        this.countryCode8 = "+" + data.response[0].phonecode;
        this.countryCode9 = "+" + data.response[0].phonecode;
        this.countryCode10 = "+" + data.response[0].phonecode;
        this.countryCode11 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );

    this.basicIVRForm.updateValueAndValidity();
    this.allAction0 = true;
    this.externalNumber0 = false;
    this.hangupAction0 = false;
    this.allAction1 = true;
    this.externalNumber1 = false;
    this.hangupAction1 = false;
    this.allAction2 = true;
    this.externalNumber2 = false;
    this.hangupAction2 = false;
    this.allAction3 = true;
    this.externalNumber3 = false;
    this.hangupAction3 = false;
    this.allAction4 = true;
    this.externalNumber4 = false;
    this.hangupAction4 = false;
    this.allAction5 = true;
    this.externalNumber5 = false;
    this.hangupAction5 = false;
    this.allAction6 = true;
    this.externalNumber6 = false;
    this.hangupAction6 = false;
    this.allAction7 = true;
    this.externalNumber7 = false;
    this.hangupAction7 = false;
    this.allAction8 = true;
    this.externalNumber8 = false;
    this.hangupAction8 = false;
    this.allAction9 = true;
    this.externalNumber9 = false;
    this.hangupAction9 = false;
    this.allAction10 = true;
    this.externalNumber10 = false;
    this.hangupAction10 = false;
    this.allAction11 = true;
    this.externalNumber11 = false;
    this.hangupAction11 = false;
  }

  public isIVRAssociateWithDID(extId) {
    this.ivrService
      .getIVRCount(extId, localStorage.getItem("id"))
      .subscribe((data) => {
        let isMappedDIDcount = data && data["response"] ? data["response"][0]["ivr_count"] : 0;
        this.isManageFeebackIVRbtn = isMappedDIDcount > 0 ? true : false;
      });
  }
}
