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
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { IVRService } from "../ivr.service";
import { PromptsService } from "../../prompts/prompts.service";
import { DidService } from "../../DID/did.service";

@Component({
  selector: "app-basic-ivr",
  templateUrl: "./basic-ivr.component.html",
  styleUrls: ["./basic-ivr.component.css"],
})
export class BasicIvrComponent implements OnInit {
  errors: Errors = { errors: {} };
  basicIVRForm: FormGroup;
  submitted = false;
  errorField = "";
  ivrName = "";
  selectedIVRValue = [];
  selectedIVRValueSelection = [];
  selectedIVRValueWelcome = [];
  selectedIVRValueTime = []
  TimeOutFilter: any;
  InvalidFilter: any;
  SectionFilter: any;
  WelcomePromptFilter: any;
  filterPrompt: any;
  filterSection: any;
  filterInvalid: any;
  filterTimeOut: any;
  welcomePrompt = 0;
  countryList: any = "";
  filterCountryZero: any;
  CountryZero: any;
  CountryOne: any;
  CountryTwo: any;
  CountryThree: any;
  CountryFour: any;
  CountryFive: any;
  CountrySix: any;
  CountrySev: any;
  CountryEig: any;
  CountryNine: any;
  CountryTen: any;
  CountryEle: any;
  filterCountryOne: any;
  filterCountryTwo: any;
  filterCountryThree: any;
  filterCountryFour: any;
  filterCountryFive: any;
  filterCountrySix: any;
  filterCountrySev: any;
  filterCountryEig: any;
  filterCountryNine: any;
  filterCountryTen: any;
  filterCountryEle: any;
  countryList0 = "";
  countryCode0 = "";
  allAction0 = true;
  externalNumber0 = false;
  hangupAction0 = false;
  valueData0: any = "";
  filterValueZero: any;
  ValueFilterZero: any;
  countryList1 = "";
  countryCode1 = "";
  allAction1 = true;
  externalNumber1 = false;
  hangupAction1 = false;
  valueData1: any = "";
  filterValueOne: any;
  ValueFilterOne: any;
  countryList2 = "";
  countryCode2 = "";
  allAction2 = true;
  externalNumber2 = false;
  hangupAction2 = false;
  valueData2: any = "";
  filterValueTwo: any;
  ValueFilterTwo: any;
  countryList3 = "";
  countryCode3 = "";
  allAction3 = true;
  externalNumber3 = false;
  hangupAction3 = false;
  valueData3: any = "";
  filterValueThree: any;
  ValueFilterThree: any;
  countryList4 = "";
  countryCode4 = "";
  allAction4 = true;
  externalNumber4 = false;
  hangupAction4 = false;
  valueData4: any = "";
  filterValueFour: any;
  ValueFilterFour: any;
  countryList5 = "";
  countryCode5 = "";
  allAction5 = true;
  externalNumber5 = false;
  hangupAction5 = false;
  valueData5: any = "";
  filterValueFive: any;
  ValueFilterFive: any;
  countryList6 = "";
  countryCode6 = "";
  allAction6 = true;
  externalNumber6 = false;
  hangupAction6 = false;
  valueData6: any = "";
  filterValueSix: any;
  ValueFilterSix: any;
  countryList7 = "";
  countryCode7 = "";
  allAction7 = true;
  externalNumber7 = false;
  hangupAction7 = false;
  valueData7: any = "";
  filterValueSev: any;
  ValueFilterSev: any;
  countryList8 = "";
  countryCode8 = "";
  allAction8 = true;
  externalNumber8 = false;
  hangupAction8 = false;
  valueData8: any = "";
  filterValueEig: any;
  ValueFilterEig: any;
  countryList9 = "";
  countryCode9 = "";
  allAction9 = true;
  externalNumber9 = false;
  hangupAction9 = false;
  valueData9: any = "";
  filterValueNine: any;
  ValueFilterNine: any;
  countryList10 = "";
  countryCode10 = "";
  allAction10 = true;
  externalNumber10 = false;
  hangupAction10 = false;
  valueData10: any = ""; 
  MOHselectedWelcome = [];
  MOHselected = [];
  filterValueTen: any;
  ValueFilterTen: any;
  countryList11 = "";
  countryCode11 = "";
  allAction11 = true;
  externalNumber11 = false;
  hangupAction11 = false;
  valueData11: any = "";
  filterValueEle: any;
  ValueFilterEle: any;
  activeFeature: any[] = [];
  filterFeatureZero: any;
  FeatureFilterZero: any;
  filterFeatureOne: any;
  FeatureFilterOne: any;
  filterFeatureTwo: any;
  FeatureFilterTwo: any;
  filterFeatureThree: any;
  FeatureFilterThree: any;
  filterFeatureFour: any;
  FeatureFilterFour: any;
  filterFeatureFive: any;
  FeatureFilterFive: any;
  filterFeatureSix: any;
  FeatureFilterSix: any;
  filterFeatureSev: any;
  FeatureFilterSev: any;
  filterFeatureEig: any;
  FeatureFilterEig: any;
  filterFeatureNine: any;
  FeatureFilterNine: any;
  filterFeatureTen: any;
  FeatureFilterTen: any;
  filterFeatureEle: any;
  FeatureFilterEle: any;
  isShowFeedBackIVR: boolean = false;
  feedBackIVR = false;
  isShowSelectionDTMF: boolean = false;
  selection_dtmf_required = false;
  isShowDirectExten = false;
  isEnableMultilevelIVR = false;
  isShowDTMFSelectionPart: boolean = true;
  public __countryChangeSubscription;
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
    private toastr: ToastrService,
    private ivrService: IVRService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private didService: DidService
  ) {
    this.basicIVRForm = this.formBuilder.group({
      name: ["", Validators.required],
      welcome_prompt: [0],
      repeat_prompt: ["", [Validators.required]],
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
    }

    this.basicIVRForm.controls.value0_Number.disable();
    this.basicIVRForm.controls.value1_Number.disable();
    this.basicIVRForm.controls.value2_Number.disable();
    this.basicIVRForm.controls.value3_Number.disable();
    this.basicIVRForm.controls.value4_Number.disable();
    this.basicIVRForm.controls.value5_Number.disable();
    this.basicIVRForm.controls.value6_Number.disable();
    this.basicIVRForm.controls.value7_Number.disable();
    this.basicIVRForm.controls.value8_Number.disable();
    this.basicIVRForm.controls.value9_Number.disable();
    this.basicIVRForm.controls.value10_Number.disable();
    this.basicIVRForm.controls.value11_Number.disable();

    this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(
      (data) => {
        this.packageActiveFeature = data;
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
        this.activeFeature.push({ id: "7", feature: "Hangup" });
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
        if (data[0].feedbackcall == "1") {
          this.isShowFeedBackIVR = true;
        }
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
            // this.selectedIVRValueWelcome.unshift({ prompt_name: 'Welcome Select Prompt', id: 0 });
            // } else if (this.welcomePrompt == 0) {
              this.selectedIVRValueWelcome.unshift({ prompt_name: 'Select Welcome Prompt', id: 0 });
              this.basicIVRForm.get('welcome_prompt').setValue(this.selectedIVRValueWelcome[0]['id']);
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
        if(this.selectedIVRValueTime.length > 0) this.basicIVRForm.get('timeout_prompt').setValue(this.selectedIVRValueTime[0]['id']) ;


        },
        (err) => {
          this.errors = err.message;
        }
      );

    this.promptsService.getIVRPrompt(localStorage.getItem("id")).subscribe(
      (data) => {
        this.selectedIVRValue = data.response;
        this.selectedIVRValue.unshift({ id: 0, prompt_name: "default" });
        if(this.selectedIVRValue.length > 0) this.basicIVRForm.get('invalid_prompt').setValue(this.selectedIVRValue[0]['id']) ;
      },
      (err) => {
        this.errors = err.message;
      }
    );

    //get country list
    this.commonService.getCountryList().subscribe(
      (data) => {
        this.countryList = data.response;
        this.filterCountryZero = this.CountryZero = this.countryList.slice();
        this.filterCountryOne = this.CountryOne = this.countryList.slice();
        this.filterCountryTwo = this.CountryTwo = this.countryList.slice();
        this.filterCountryThree = this.CountryThree = this.countryList.slice();
        this.filterCountryFour = this.CountryFour = this.countryList.slice();
        this.filterCountryFive = this.CountryFive = this.countryList.slice();
        this.filterCountrySix = this.CountrySix = this.countryList.slice();
        this.filterCountrySev = this.CountrySev = this.countryList.slice();
        this.filterCountryEig = this.CountryEig = this.countryList.slice();
        this.filterCountryNine = this.CountryNine = this.countryList.slice();
        this.filterCountryTen = this.CountryTen = this.countryList.slice();
        this.filterCountryEle = this.CountryEle = this.countryList.slice();
      },
      (err) => {
        this.errors = err.message;
      }
    );

    //get customer wise country
    this.commonService.getCustomerCountry(localStorage.getItem("id")).subscribe(
      (data) => {
        //  customerWiseCountry
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
  }

  get welcome_prompt(){
    return this.basicIVRForm.get("welcome_prompt")
  }
  get repeat_prompt(){
    return this.basicIVRForm.get("repeat_prompt")
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
  selectremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.countryList.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace0(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData0.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace1(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData1.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace2(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData2.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace3(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData3.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace4(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData4.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace5(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData5.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace6(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData6.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace7(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData7.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace8(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData8.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace9(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData9.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace10(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData10.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  Valueremovedspace11(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.valueData11.filter((data) => {
      return data["name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  countryremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.activeFeature.filter((data) => {
      return data["feature"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }  
  promptremovedspaceSelection(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.selectedIVRValueSelection.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  promptremovedspace(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.selectedIVRValue.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  promptremovedWelcome(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.selectedIVRValueWelcome.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  promptremovedspaceTime(event) {
    const mohspace = event.text.trim().toLowerCase();
    const mohfilterData = this.selectedIVRValueTime.filter((data) => {
      return data["prompt_name"].toLowerCase().includes(mohspace);
    });
    event.updateData(mohfilterData);
  }
  submitbasicIVRForm() {
    // debugger
    var value: any = [];
    this.submitted = true;
    const credentials = this.basicIVRForm.value;
    if (
      credentials["repeat_prompt"] == "" ||
      credentials["repeat_prompt"] == "0"
    ) {
      // credentials["repeat_prompt"] = credentials["welcome_prompt"];
      credentials["repeat_prompt"]
    }
    credentials.id = null;
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
      if (credentials["action" + j] != "0") {
        count = count + 1;
      }
    }

    if (
      (count == 0 && credentials["feedbackIVR"] == "0") ||
      (count == 0 && credentials["feedbackIVR"] == false)
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
          arrVal.push({
            ivr_digit: credentials["digit" + i],
            ivr_action: 0,
            ivr_action_desc: credentials["action" + i],
            ivr_param:
              "custom_exten_" +
              credentials["country_code" + i] +
              credentials["value" + i + "_Number"],
            country: credentials["country" + i],
          });
        } else if (credentials["action" + i] == "7") {
          arrVal.push({
            ivr_digit: credentials["digit" + i],
            ivr_action: 0,
            ivr_action_desc: credentials["action" + i],
            ivr_param: "hangup",
            country: 0,
          });
        } else if (credentials["action" + i] == "10") {
          arrVal.push({
            ivr_digit: credentials["digit" + i],
            ivr_action: 0,
            ivr_action_desc: credentials["action" + i],
            ivr_param: "repeat",
            country: 0,
          });
        } else if (credentials["action" + i] == "14") {
          arrVal.push({
            ivr_digit: credentials["digit" + i],
            ivr_action: 0,
            ivr_action_desc: credentials["action" + i],
            ivr_param: "back2ivr",
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
            var feature = "broadcast_" + credentials["value" + i];
          } else if (credentials["action" + i] == "12") {
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
        id: credentials.id,
        name: credentials.name,
        customer_id: localStorage.getItem("id"),
      })
      .subscribe((data) => {
        if (
          data &&
          data[0].lastInserted >= 1 &&
          credentials.id != data[0].lastInserted
        ) {
          this.errorField = data[0].MESSAGE_TEXT;
          this.toastr.error("Error!", this.errorField, { timeOut: 4000 });
          this.ivrName = "";
        } else {
          credentials.welcome_name = this.selectedIVRValueWelcome.filter(item => item.id == credentials.welcome_prompt)[0]['prompt_name'];
          credentials.repeat_name = this.selectedIVRValueSelection.filter(item => item.id == credentials.repeat_prompt)[0]['prompt_name'];
          credentials.invalid_name = this.selectedIVRValue.filter(item => item.id == credentials.invalid_prompt)[0]['prompt_name'];
          credentials.timeout_name = this.selectedIVRValueTime.filter(item => item.id == credentials.timeout_prompt)[0]['prompt_name'];                                              
          let arr0 = this.valueData0;
          let arr1 = this.valueData1;
          let arr2 = this.valueData2;
          let arr3 = this.valueData3;
          let arr4 = this.valueData4;
          let arr5 = this.valueData5;
          let arr6 = this.valueData6;
          let arr7 = this.valueData7;
          let arr8 = this.valueData8;
          let arr9 = this.valueData9;
          let arr10 = this.valueData10;
          let arr11 = this.valueData11;        
          let i=0;
          while (credentials.hasOwnProperty(`action${i}`)) {
            let arrName = `arr${i}`            
            if (credentials[`action${i}`] != 0) {
              if (typeof eval(arrName) !== "undefined") {
                for (let item of eval(arrName)) {                                
                  if (item.id === credentials[`value${i}`]) {
                    credentials[`value_name${i}`] = item.name;
                    break;
                  }
                }
              }
            }
            i++;
          }                              
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
                this.toastr.error("Error!", data["message"], { timeOut: 2000 });
              }
            });
        }
      });
  }

  cancelForm() {
    this.basicIVRForm.reset();
    this.router.navigateByUrl("ivr/view");
  }

  getValueData0(e) {
    this.basicIVRForm.get("value0").reset();
    this.basicIVRForm.get("value0").updateValueAndValidity();

    let action = e.value;
    if (action == "9") {
      this.externalNumber0 = true;
      this.allAction0 = false;
      this.hangupAction0 = false;
      this.basicIVRForm.get("value0").setValue("");

      this.basicIVRForm.controls.value0_Number.enable();
      this.basicIVRForm.controls.value0.disable();
    } else if (action == "7") {
      this.externalNumber0 = false;
      this.allAction0 = false;
      this.hangupAction0 = true;
      this.basicIVRForm.get("value0").setValue("");

      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.disable();
    } else if (action == "10") {
      this.externalNumber0 = false;
      this.allAction0 = false;
      this.hangupAction0 = true;
      this.basicIVRForm.get("value0").setValue("");

      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.disable();
    } else if (action == "0") {
      this.externalNumber0 = false;
      this.allAction0 = false;
      this.hangupAction0 = true;
      this.basicIVRForm.get("value0").setValue("");

      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value0").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction0 = true;
      this.externalNumber0 = false;
      this.hangupAction0 = false;
      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData0 = data.response;
          this.filterValueZero = this.ValueFilterZero = this.valueData0.slice();
        });
    } else if (action == "14") {
      this.externalNumber0 = false;
      this.allAction0 = false;
      this.hangupAction0 = true;
      this.basicIVRForm.get("value0").setValue("");

      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.disable();
    } else {
      this.basicIVRForm.get("value0").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction0 = true;
      this.externalNumber0 = false;
      this.hangupAction0 = false;
      this.basicIVRForm.get("value0").setValue("");

      this.basicIVRForm.controls.value0_Number.disable();
      this.basicIVRForm.controls.value0.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData0 = data.response;
          this.filterValueZero = this.ValueFilterZero = this.valueData0.slice();
        });
    }
  }

  getCountryCode0(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode0 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData1(e) {
    this.basicIVRForm.get("value1").reset();
    this.basicIVRForm.get("value1").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber1 = true;
      this.allAction1 = false;
      this.hangupAction1 = false;
      this.basicIVRForm.get("value1").setValue("");

      this.basicIVRForm.controls.value1_Number.enable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "7") {
      this.externalNumber1 = false;
      this.allAction1 = false;
      this.hangupAction1 = true;
      this.basicIVRForm.get("value1").setValue("");

      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "10") {
      this.externalNumber1 = false;
      this.allAction1 = false;
      this.hangupAction1 = true;
      this.basicIVRForm.get("value1").setValue("");

      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "0") {
      this.externalNumber1 = false;
      this.allAction1 = false;
      this.hangupAction1 = true;
      this.basicIVRForm.get("value1").setValue("");

      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value1").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction1 = true;
      this.externalNumber1 = false;
      this.hangupAction1 = false;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData1 = data.response;
          this.filterValueOne = this.ValueFilterOne = this.valueData1.slice();
        });
    } else if (action == "14") {
      this.externalNumber1 = false;
      this.allAction1 = false;
      this.hangupAction1 = true;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.disable();
    } else {
      this.basicIVRForm.get("value1").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction1 = true;
      this.externalNumber1 = false;
      this.hangupAction1 = false;
      this.basicIVRForm.controls.value1_Number.disable();
      this.basicIVRForm.controls.value1.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData1 = data.response;
          this.filterValueOne = this.ValueFilterOne = this.valueData1.slice();
        });
    }
  }

  getCountryCode1(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode1 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData2(e) {
    this.basicIVRForm.get("value2").reset();
    this.basicIVRForm.get("value2").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber2 = true;
      this.allAction2 = false;
      this.hangupAction2 = false;
      this.basicIVRForm.get("value2").setValue("");

      this.basicIVRForm.controls.value2_Number.enable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "7") {
      this.externalNumber2 = false;
      this.allAction2 = false;
      this.hangupAction2 = true;
      this.basicIVRForm.get("value2").setValue("");

      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "10") {
      this.externalNumber2 = false;
      this.allAction2 = false;
      this.hangupAction2 = true;
      this.basicIVRForm.get("value2").setValue("");

      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "0") {
      this.externalNumber2 = false;
      this.allAction2 = false;
      this.hangupAction2 = true;
      this.basicIVRForm.get("value2").setValue("");

      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value2").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction2 = true;
      this.externalNumber2 = false;
      this.hangupAction2 = false;
      this.basicIVRForm.controls.value2_Number.enable();
      this.basicIVRForm.controls.value2.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData2 = data.response;
          this.filterValueTwo = this.ValueFilterTwo = this.valueData2.slice();
        });
    } else if (action == "14") {
      this.externalNumber2 = false;
      this.allAction2 = false;
      this.hangupAction2 = true;
      this.basicIVRForm.get("value2").setValue("");

      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.disable();
    } else {
      this.basicIVRForm.get("value2").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction2 = true;
      this.externalNumber2 = false;
      this.hangupAction2 = false;
      this.basicIVRForm.controls.value2_Number.disable();
      this.basicIVRForm.controls.value2.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData2 = data.response;
          this.filterValueTwo = this.ValueFilterTwo = this.valueData2.slice();
        });
    }
  }

  getCountryCode2(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode2 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData3(e) {
    this.basicIVRForm.get("value3").reset();
    this.basicIVRForm.get("value3").updateValueAndValidity();
    let action = e.value;

    if (action == "9") {
      this.externalNumber3 = true;
      this.allAction3 = false;
      this.hangupAction3 = false;
      this.basicIVRForm.get("value3").setValue("");

      this.basicIVRForm.controls.value3_Number.enable();
      this.basicIVRForm.controls.value3.disable();
    } else if (action == "7") {
      this.externalNumber3 = false;
      this.allAction3 = false;
      this.hangupAction3 = true;
      this.basicIVRForm.get("value3").setValue("");

      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.disable();
    } else if (action == "10") {
      this.externalNumber3 = false;
      this.allAction3 = false;
      this.hangupAction3 = true;
      this.basicIVRForm.get("value3").setValue("");

      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.disable();
    } else if (action == "0") {
      this.externalNumber3 = false;
      this.allAction3 = false;
      this.hangupAction3 = true;
      this.basicIVRForm.get("value3").setValue("");

      this.basicIVRForm.controls.value3.disable();
      this.basicIVRForm.controls.value3_Number.enable();
    } else if (action == "12") {
      this.basicIVRForm.get("value3").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction3 = true;
      this.externalNumber3 = false;
      this.hangupAction3 = false;
      this.basicIVRForm.controls.value3.enable();
      this.basicIVRForm.controls.value3_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData3 = data.response;
          this.filterValueThree = this.ValueFilterThree =
            this.valueData3.slice();
        });
    } else if (action == "14") {
      this.externalNumber3 = false;
      this.allAction3 = false;
      this.hangupAction3 = true;
      this.basicIVRForm.get("value3").setValue("");

      this.basicIVRForm.controls.value3_Number.disable();
      this.basicIVRForm.controls.value3.disable();
    } else {
      this.basicIVRForm.get("value3").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction3 = true;
      this.externalNumber3 = false;
      this.hangupAction3 = false;
      this.basicIVRForm.controls.value3.enable();
      this.basicIVRForm.controls.value3_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData3 = data.response;
          this.filterValueThree = this.ValueFilterThree =
            this.valueData3.slice();
        });
    }
  }

  getCountryCode3(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode3 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData4(e) {
    this.basicIVRForm.get("value4").reset();
    this.basicIVRForm.get("value4").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber4 = true;
      this.allAction4 = false;
      this.hangupAction4 = false;
      this.basicIVRForm.get("value4").setValue("");

      this.basicIVRForm.controls.value4_Number.enable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "7") {
      this.externalNumber4 = false;
      this.allAction4 = false;
      this.hangupAction4 = true;
      this.basicIVRForm.get("value4").setValue("");

      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "10") {
      this.externalNumber4 = false;
      this.allAction4 = false;
      this.hangupAction4 = true;
      this.basicIVRForm.get("value4").setValue("");

      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "0") {
      this.externalNumber4 = false;
      this.allAction4 = false;
      this.hangupAction4 = true;
      this.basicIVRForm.get("value4").setValue("");

      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value4").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction4 = true;
      this.externalNumber4 = false;
      this.hangupAction4 = false;
      this.basicIVRForm.controls.value4.enable();
      this.basicIVRForm.controls.value4_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData4 = data.response;
          this.filterValueFour = this.ValueFilterFour = this.valueData4.slice();
        });
    } else if (action == "14") {
      this.externalNumber4 = false;
      this.allAction4 = false;
      this.hangupAction4 = true;
      this.basicIVRForm.get("value4").setValue("");

      this.basicIVRForm.controls.value4_Number.disable();
      this.basicIVRForm.controls.value4.disable();
    } else {
      this.basicIVRForm.get("value4").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction4 = true;
      this.externalNumber4 = false;
      this.hangupAction4 = false;
      this.basicIVRForm.controls.value4.enable();
      this.basicIVRForm.controls.value4_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData4 = data.response;
          this.filterValueFour = this.ValueFilterFour = this.valueData4.slice();
        });
    }
  }

  getCountryCode4(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode4 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData5(e) {
    this.basicIVRForm.get("value5").reset();
    this.basicIVRForm.get("value5").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber5 = true;
      this.allAction5 = false;
      this.hangupAction5 = false;
      this.basicIVRForm.get("value5").setValue("");

      this.basicIVRForm.controls.value5_Number.enable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "7") {
      this.externalNumber5 = false;
      this.allAction5 = false;
      this.hangupAction5 = true;
      this.basicIVRForm.get("value5").setValue("");

      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "10") {
      this.externalNumber5 = false;
      this.allAction5 = false;
      this.hangupAction5 = true;
      this.basicIVRForm.get("value5").setValue("");

      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "0") {
      this.externalNumber5 = false;
      this.allAction5 = false;
      this.hangupAction5 = true;
      this.basicIVRForm.get("value5").setValue("");

      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value5").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction5 = true;
      this.externalNumber5 = false;
      this.hangupAction5 = false;
      this.basicIVRForm.controls.value5.enable();
      this.basicIVRForm.controls.value5_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData5 = data.response;
          this.filterValueFive = this.ValueFilterFive = this.valueData5.slice();
        });
    } else if (action == "14") {
      this.externalNumber5 = false;
      this.allAction5 = false;
      this.hangupAction5 = true;
      this.basicIVRForm.get("value5").setValue("");

      this.basicIVRForm.controls.value5_Number.disable();
      this.basicIVRForm.controls.value5.disable();
    } else {
      this.basicIVRForm.get("value5").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction5 = true;
      this.externalNumber5 = false;
      this.hangupAction5 = false;
      this.basicIVRForm.controls.value5.enable();
      this.basicIVRForm.controls.value5_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData5 = data.response;
          this.filterValueFive = this.ValueFilterFive = this.valueData5.slice();
        });
    }
  }

  getCountryCode5(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode5 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData6(e) {
    this.basicIVRForm.get("value6").reset();
    this.basicIVRForm.get("value6").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber6 = true;
      this.allAction6 = false;
      this.hangupAction6 = false;
      this.basicIVRForm.get("value6").setValue("");

      this.basicIVRForm.controls.value6_Number.enable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "7") {
      this.externalNumber6 = false;
      this.allAction6 = false;
      this.hangupAction6 = true;
      this.basicIVRForm.get("value6").setValue("");

      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "10") {
      this.externalNumber6 = false;
      this.allAction6 = false;
      this.hangupAction6 = true;
      this.basicIVRForm.get("value6").setValue("");

      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "0") {
      this.externalNumber6 = false;
      this.allAction6 = false;
      this.hangupAction6 = true;
      this.basicIVRForm.get("value6").setValue("");

      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value6").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction6 = true;
      this.externalNumber6 = false;
      this.hangupAction6 = false;
      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData6 = data.response;
          this.filterValueSix = this.ValueFilterSix = this.valueData6.slice();
        });
    } else if (action == "14") {
      this.externalNumber6 = false;
      this.allAction6 = false;
      this.hangupAction6 = true;
      this.basicIVRForm.get("value6").setValue("");

      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.disable();
    } else {
      this.basicIVRForm.get("value6").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction6 = true;
      this.externalNumber6 = false;
      this.hangupAction6 = false;
      this.basicIVRForm.get("value6").setValue("");

      this.basicIVRForm.controls.value6_Number.disable();
      this.basicIVRForm.controls.value6.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData6 = data.response;
          this.filterValueSix = this.ValueFilterSix = this.valueData6.slice();
        });
    }
  }

  getCountryCode6(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode6 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData7(e) {
    this.basicIVRForm.get("value7").reset();
    this.basicIVRForm.get("value7").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber7 = true;
      this.allAction7 = false;
      this.hangupAction7 = false;
      this.basicIVRForm.get("value7").setValue("");

      this.basicIVRForm.controls.value7_Number.enable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "7") {
      this.externalNumber7 = false;
      this.allAction7 = false;
      this.hangupAction7 = true;
      this.basicIVRForm.get("value7").setValue("");

      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "10") {
      this.externalNumber7 = false;
      this.allAction7 = false;
      this.hangupAction7 = true;
      this.basicIVRForm.get("value7").setValue("");

      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "0") {
      this.externalNumber7 = false;
      this.allAction7 = false;
      this.hangupAction7 = true;
      this.basicIVRForm.get("value7").setValue("");

      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value7").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction7 = true;
      this.externalNumber7 = false;
      this.hangupAction7 = false;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData7 = data.response;
          this.filterValueSev = this.ValueFilterSev = this.valueData7.slice();
        });
    } else if (action == "14") {
      this.externalNumber7 = false;
      this.allAction7 = false;
      this.hangupAction7 = true;
      this.basicIVRForm.get("value7").setValue("");

      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.disable();
    } else {
      this.basicIVRForm.get("value7").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction7 = true;
      this.externalNumber7 = false;
      this.hangupAction7 = false;
      this.basicIVRForm.controls.value7_Number.disable();
      this.basicIVRForm.controls.value7.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData7 = data.response;
          this.filterValueSev = this.ValueFilterSev = this.valueData7.slice();
        });
    }
  }

  getCountryCode7(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode7 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData8(e) {
    this.basicIVRForm.get("value8").reset();
    this.basicIVRForm.get("value8").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber8 = true;
      this.allAction8 = false;
      this.hangupAction8 = false;
      this.basicIVRForm.get("value8").setValue("");

      this.basicIVRForm.controls.value8_Number.enable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "7") {
      this.externalNumber8 = false;
      this.allAction8 = false;
      this.hangupAction8 = true;
      this.basicIVRForm.get("value8").setValue("");

      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "10") {
      this.externalNumber8 = false;
      this.allAction8 = false;
      this.hangupAction8 = true;
      this.basicIVRForm.get("value8").setValue("");

      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "0") {
      this.externalNumber8 = false;
      this.allAction8 = false;
      this.hangupAction8 = true;
      this.basicIVRForm.get("value8").setValue("");

      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value8").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction8 = true;
      this.externalNumber8 = false;
      this.hangupAction8 = false;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData8 = data.response;
          this.filterValueEig = this.ValueFilterEig = this.valueData8.slice();
        });
    } else if (action == "14") {
      this.externalNumber8 = false;
      this.allAction8 = false;
      this.hangupAction8 = true;
      this.basicIVRForm.get("value8").setValue("");

      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.disable();
    } else {
      this.basicIVRForm.get("value8").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction8 = true;
      this.externalNumber8 = false;
      this.hangupAction8 = false;
      this.basicIVRForm.controls.value8_Number.disable();
      this.basicIVRForm.controls.value8.enable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData8 = data.response;
          this.filterValueEig = this.ValueFilterEig = this.valueData8.slice();
        });
    }
  }

  getCountryCode8(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode8 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData9(e) {
    this.basicIVRForm.get("value9").reset();
    this.basicIVRForm.get("value9").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber9 = true;
      this.allAction9 = false;
      this.hangupAction9 = false;
      this.basicIVRForm.get("value9").setValue("");

      this.basicIVRForm.controls.value9_Number.enable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "7") {
      this.externalNumber9 = false;
      this.allAction9 = false;
      this.hangupAction9 = true;
      this.basicIVRForm.get("value9").setValue("");

      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "10") {
      this.externalNumber9 = false;
      this.allAction9 = false;
      this.hangupAction9 = true;
      this.basicIVRForm.get("value9").setValue("");

      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "0") {
      this.externalNumber9 = false;
      this.allAction9 = false;
      this.hangupAction9 = true;
      this.basicIVRForm.get("value9").setValue("");

      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value9").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction9 = true;
      this.externalNumber9 = false;
      this.hangupAction9 = false;
      this.basicIVRForm.controls.value9.enable();
      this.basicIVRForm.controls.value9_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData9 = data.response;
          this.filterValueNine = this.ValueFilterNine = this.valueData9.slice();
        });
    } else if (action == "14") {
      this.externalNumber9 = false;
      this.allAction9 = false;
      this.hangupAction9 = true;
      this.basicIVRForm.get("value9").setValue("");

      this.basicIVRForm.controls.value9_Number.disable();
      this.basicIVRForm.controls.value9.disable();
    } else {
      this.basicIVRForm.get("value9").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction9 = true;
      this.externalNumber9 = false;
      this.hangupAction9 = false;
      this.basicIVRForm.controls.value9.enable();
      this.basicIVRForm.controls.value9_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData9 = data.response;
          this.filterValueNine = this.ValueFilterNine = this.valueData9.slice();
        });
    }
  }

  getCountryCode9(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode9 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData10(e) {
    this.basicIVRForm.get("value10").reset();
    this.basicIVRForm.get("value10").updateValueAndValidity();
    let action = e.value;
    if (action == "9") {
      this.externalNumber10 = true;
      this.allAction10 = false;
      this.hangupAction10 = false;
      this.basicIVRForm.get("value10").setValue("");

      this.basicIVRForm.controls.value10_Number.enable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "7") {
      this.externalNumber10 = false;
      this.allAction10 = false;
      this.hangupAction10 = true;
      this.basicIVRForm.get("value10").setValue("");

      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "10") {
      this.externalNumber10 = false;
      this.allAction10 = false;
      this.hangupAction10 = true;
      this.basicIVRForm.get("value10").setValue("");

      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "0") {
      this.externalNumber10 = false;
      this.allAction10 = false;
      this.hangupAction10 = true;
      this.basicIVRForm.get("value10").setValue("");

      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value10").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction10 = true;
      this.externalNumber10 = false;
      this.hangupAction10 = false;
      this.basicIVRForm.controls.value10.enable();
      this.basicIVRForm.controls.value10_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData10 = data.response;
          this.filterValueTen = this.ValueFilterTen = this.valueData10.slice();
        });
    } else if (action == "14") {
      this.externalNumber10 = false;
      this.allAction10 = false;
      this.hangupAction10 = true;
      this.basicIVRForm.get("value10").setValue("");

      this.basicIVRForm.controls.value10_Number.disable();
      this.basicIVRForm.controls.value10.disable();
    } else {
      this.basicIVRForm.get("value10").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction10 = true;
      this.externalNumber10 = false;
      this.hangupAction10 = false;
      this.basicIVRForm.controls.value10.enable();
      this.basicIVRForm.controls.value10_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData10 = data.response;
          this.filterValueTen = this.ValueFilterTen = this.valueData10.slice();
        });
    }
  }

  getCountryCode10(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(
      (data) => {
        this.countryCode10 = "+" + data.response[0].phonecode;
      },
      (err) => {
        this.errors = err.message;
      }
    );
  }

  getValueData11(e) {
    this.basicIVRForm.get("value11").reset();
    this.basicIVRForm.get("value11").updateValueAndValidity();

    let action = e.value;
    if (action == "9") {
      this.externalNumber11 = true;
      this.allAction11 = false;
      this.hangupAction11 = false;
      this.basicIVRForm.get("value11").setValue("");

      this.basicIVRForm.controls.value11_Number.enable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "7") {
      this.externalNumber11 = false;
      this.allAction11 = false;
      this.hangupAction11 = true;
      this.basicIVRForm.get("value11").setValue("");

      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "10") {
      this.externalNumber11 = false;
      this.allAction11 = false;
      this.hangupAction11 = true;
      this.basicIVRForm.get("value11").setValue("");

      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "0") {
      this.externalNumber11 = false;
      this.allAction11 = false;
      this.hangupAction11 = true;
      this.basicIVRForm.get("value11").setValue("");

      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.disable();
    } else if (action == "12") {
      this.basicIVRForm.get("value11").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction11 = true;
      this.externalNumber11 = false;
      this.hangupAction11 = false;
      this.basicIVRForm.controls.value11.enable();
      this.basicIVRForm.controls.value11_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: "12" })
        .subscribe((data) => {
          this.valueData11 = data.response;
          this.filterValueEle = this.ValueFilterEle = this.valueData11.slice();
        });
    } else if (action == "14") {
      this.externalNumber11 = false;
      this.allAction11 = false;
      this.hangupAction11 = true;
      this.basicIVRForm.get("value11").setValue("");

      this.basicIVRForm.controls.value11_Number.disable();
      this.basicIVRForm.controls.value11.disable();
    } else {
      this.basicIVRForm.get("value11").setValue("");
      this.basicIVRForm.updateValueAndValidity();
      this.allAction11 = true;
      this.externalNumber11 = false;
      this.hangupAction11 = false;
      this.basicIVRForm.controls.value11.enable();
      this.basicIVRForm.controls.value11_Number.disable();
      this.ivrService
        .getIVRAction({ user_id: localStorage.getItem("id"), action: action })
        .subscribe((data) => {
          this.valueData11 = data.response;
          this.filterValueEle = this.ValueFilterEle = this.valueData11.slice();
        });
    }
  }

  getCountryCode11(event) {
    let country_id = event.value;
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
      this.basicIVRForm.get("multilevel_ivr").setValue(false);
      this.basicIVRForm.controls["multilevel_ivr"].disable();
      this.isShowSelectionDTMF = true;
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
    } else {
      this.activeFeature = [];
      this.isShowSelectionDTMF = false;
      this.isShowDTMFSelectionPart = true;
      this.basicIVRForm.get("selection_dtmf_required").setValue(false);
      this.basicIVRForm.controls["multilevel_ivr"].enable();
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
          // id 13 is reserved for appointment
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
    if (value === true) {
      this.basicIVRForm.get("feedbackIVR").setValue(false);
      this.basicIVRForm.get("selection_dtmf_required").setValue(false);
      this.basicIVRForm.controls["feedbackIVR"].disable();
      this.basicIVRForm.controls["selection_dtmf_required"].disable();
      this.basicIVRForm.get("directExtenDial").setValue(false);
      this.basicIVRForm.controls["directExtenDial"].disable();


      this.activeFeature = [];
      this.isShowSelectionDTMF = false;
      this.basicIVRForm.get("selection_dtmf_required").setValue(false);
      this.setEmptyAllValueFields(); // set blank of all feature values
      this.didService.getActiveFeature(localStorage.getItem("id")).subscribe(
        (data) => {
          this.activeFeature.push({ id: "0", feature: "Select Feature" });
          this.activeFeature.push({ id: "14", feature: "Back to Main IVR" });
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
          // id 13 is reserved for appointment
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
          if (data[0].feedbackcall == "1") {
            this.isShowFeedBackIVR = true;
          }
        },
        (err) => {
          this.errors = err.message;
        }
      );
      // this.setEmptyAllValueFields(); // set black of all feature values
    } else {
      this.activeFeature = [];
      this.isShowSelectionDTMF = false;
      this.basicIVRForm.controls["feedbackIVR"].enable();
      this.basicIVRForm.controls["directExtenDial"].enable();
      this.basicIVRForm.controls["selection_dtmf_required"].enable();
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

          // if (data[0].ivr == '1') {
          //   this.activeFeature.push({ id: '14', feature: 'Back to Main IVR' });
          // }
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
          // id 13 is reserved for appointment
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
}
