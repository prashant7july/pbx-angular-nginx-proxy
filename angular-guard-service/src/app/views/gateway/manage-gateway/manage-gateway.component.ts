import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BackendAPIIntegrationService } from "src/app/core/services/backend-api-integration.service";
import {
  codecError,
  CommonService,
  duplicateIP,
  duplicatePort,
  Errors,
  formError,
  invalidIP,
  IP_RegEx,
  plus_number_RegEx,
  sameCallerID,
  TransportError,
  minTime
} from "../../../core";
import { GatewayService } from "../gateway.service";

export var source: any = [];
export var target: any = [];

@Component({
  selector: "app-manage-gateway",
  templateUrl: "./manage-gateway.component.html",
  styleUrls: ["./manage-gateway.component.css"],
})
export class ManageGatewayComponent implements OnInit {
  errors: Errors = { errors: {} };
  gatewayForm: FormGroup;
  submitted = false;
  checkForm: any;
  error = "";
  validPort: any = false;
  theCheckbox = true;
  sessionId = "";
  gatewayData: any = {};
  codecValue: any = [];
  sourceCodec: any = [];
  targetCodec: any = [];
  ProfileValueBind:any
  validIP: any = false;
  registered = false;
  providerList: any = "";
  ProfileList:any = [];
  ProviderFilter: any;
  filterProvider: any;
  errorField = "";
  validProvider = false;
  selectedIp = false;
  selectedDomain = false;
  realm = false;
  public fields: Object = { text: "provider", value: "id" };
  public fields1: Object = { text: "profile_name", value: "id" };
  public placeholder: string = "Provider";
  public placeholder1: string = "Sofia Profile";
  public popupHeight: string = "200px";
  public popupWidth: string = "200px";
  gatewayDataBind: any;
  timeCheckBox = true;
  endTimeValue: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private gatewayService: GatewayService,
    public commonService: CommonService,
    private backendIntegrationService: BackendAPIIntegrationService
  ) {
    this.gatewayForm = this.formBuilder.group({
      provider: ["", Validators.required],
      ip: [
        "",
        [
          Validators.required,
          Validators.pattern(IP_RegEx),
          Validators.maxLength(40),
        ],
      ],
      port: [
        "",
        [
          Validators.required,
          Validators.maxLength(5),
          Validators.minLength(2),
          Validators.max(65535),
        ],
      ],
      expiry: ["", [Validators.required, Validators.min(1)]],
      retry: ["", [Validators.required, Validators.min(1), Validators.max(60)]],
      ping: ["", [Validators.required, Validators.min(1)]],
      callerid: ["", [Validators.pattern(plus_number_RegEx)]],
      callerID_headervalue: ["", [Validators.pattern(plus_number_RegEx)]],
      callerID_headertype: [""],
      transport_type: [""],
      sofia_profile: [""],
      dtmf_type: [""],
      simultaneous_call: [""],
      from_user: [""],
      auth_username: ["", Validators.required],
      password: ["", Validators.required],
      calling_profile: [""],
      prependDigit_dialnumber: ["", [Validators.pattern(plus_number_RegEx)]],
      prependDigit_callerid: [""],
      register: [""],
      callerID_header: [""],
      status: [""],
      subnet: ["1"],
      domain: ["", Validators.required],
      realm: [""],
      stripedDigit_dialnumber: ["", [Validators.pattern(plus_number_RegEx)]],
      stripedDigit_callerid: [""],
      is_sign: [""],
      is_register_proxy: [""],
      is_outbound_proxy: [""],
      is_realm: [""],
      register_proxy: [""],
      outbound_proxy: [""],
      time_finish: [''],
      time_start: ['']
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
    this.gatewayForm.controls.auth_username.disable();
    this.gatewayForm.controls.expiry.disable();
    this.gatewayForm.controls.password.disable();
    this.gatewayForm.controls.domain.disable();
    this.gatewayForm.controls.ping.disable();
    this.gatewayForm.controls.retry.disable();

    this.sessionId = this.route.snapshot.queryParams.id;
    let codecArr: any = [];
    this.targetCodec = [];
    target = []; //initialize list 2;
    this.sourceCodec = [];
    source = []; //initialize list 2;
    this.gatewayService.viewGatewayById(this.sessionId).subscribe(
      (data) => {
        this.gatewayData = data[0];
        this.ProfileValueBind = Number(this.gatewayData.sofia_profile) 
        this.gatewayDataBind = JSON.parse(this.gatewayData.provider_id);
        if (this.gatewayData.time_start != "00:00:00") {
          this.timeCheckBox = false;
        }
        this.gatewayData.register =
          this.gatewayData.register == "1" ? true : false;
        this.gatewayData.is_sign =
          this.gatewayData.is_sign == "1" ? true : false;
        this.gatewayData.is_realm =
          this.gatewayData.is_realm == "1" ? true : false;
        this.gatewayData.is_register_proxy =
          this.gatewayData.is_register_proxy == "1" ? true : false;
        this.gatewayData.is_outbound_proxy =
          this.gatewayData.is_outbound_proxy == "1" ? true : false;
        this.selectedIp = this.gatewayData.subnet == 1 ? true : false;
        this.selectedDomain = this.gatewayData.subnet == 2 ? true : false;
        this.gatewayData.subnet = this.gatewayData.subnet == 1 ? "1" : "2";
        if (this.gatewayData.subnet == 1) {
          this.gatewayForm.controls.domain.disable();
          this.gatewayForm.controls.ip.enable();
          this.selectedDomain = false;
          this.selectedIp = true;
        } else if (this.gatewayData.subnet == 2) {
          this.gatewayForm.controls.domain.enable();
          this.gatewayForm.controls.ip.disable();
          this.selectedDomain = true;
          this.selectedIp = false;
        }

        //akshay
        if (this.gatewayData.is_outbound_proxy == 0) {
          this.gatewayForm.controls.outbound_proxy.enable();
        } else {
          this.gatewayForm.controls.outbound_proxy.disable();
        }

        if (this.gatewayData.is_register_proxy == 0) {
          this.gatewayForm.controls.register_proxy.enable();
        } else {
          this.gatewayForm.controls.register_proxy.disable();
        }

        if (this.gatewayData.is_realm == 1) {
          this.gatewayForm.controls.realm.enable();
        } else {
          this.gatewayForm.controls.realm.disable();
        }

        if (data[0].callerID != data[0].callerID_headervalue) {
          this.theCheckbox = false;
        } else {
          this.theCheckbox = true;
        }
        codecArr = data[0].codec == "" ? "" : data[0].codec.split(",");
        for (let i = 0; i < codecArr.length; i++) {
          target.push({ id: i + 1, codec: codecArr[i] });
        }
        this.targetCodec = target;

        if (data[0].is_realm == 1) {
          this.gatewayForm.controls.realm.enable();
        } else {
          this.gatewayForm.controls.realm.disable();
        }

        if (data[0].register == 1 || data[0].register == true) {
          this.gatewayForm.controls.auth_username.enable();
          this.gatewayForm.controls.expiry.enable();
          this.gatewayForm.controls.password.enable();
          this.gatewayForm.controls.ping.enable();
          this.gatewayForm.controls.retry.enable();
          this.registered = true;
        } else {
          this.gatewayForm.controls.auth_username.disable();
          this.gatewayForm.controls.expiry.disable();
          this.gatewayForm.controls.password.disable();
          this.gatewayForm.controls.ping.disable();
          this.gatewayForm.controls.retry.disable();
          this.registered = false;
        }
      },
      (err) => {
        this.errors = err.message;
      }
    );

    //sourceCodec//initialize list 1;
    this.gatewayService.getCodecInfo().subscribe(
      (data) => {
        source = data.response;
        for (let i = 0; i < target.length; i++) {
          for (let j = 0; j < source.length; j++) {
            if (target[i].codec == source[j].codec) {
              source.splice(j, 1);
            }
          }
        }
        this.sourceCodec = source;
      },
      (err) => {
        this.errors = err.message;
      }
    );
    //get Providers list
    this.commonService.getProviders().subscribe(
      (data) => {
        this.providerList = data.response;
        this.filterProvider = this.ProviderFilter = this.providerList.slice();
      },
      (err) => {
        this.error = err.message;
      }
    );

    // this.gatewayService.getSofiaProfileName().subscribe((data) =>{
    //   this.ProfileList = data.response ? data.response : [];
    // })
    this.gatewayService.getSofiaProfileName().subscribe((data) => {
      this.ProfileList = data.response ? data.response.map(item => {
        return {
          ...item,
          profile_name: item.profile_name.charAt(0).toUpperCase() + item.profile_name.slice(1)
        };
      }) : [];
    }, (error) => {
      console.error('Error fetching profile names:', error);
    });
    
  }
  Providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.providerList.filter((data) => {
      return data["provider"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Profileremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.ProfileList.filter((data) => {
      return data["profile_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  get ip() {
    return this.gatewayForm.get("ip");
  }
  get port() {
    return this.gatewayForm.get("port");
  }
  get provider() {
    return this.gatewayForm.get("provider");
  }
  get expiry() {
    return this.gatewayForm.get("expiry");
  }
  get retry() {
    return this.gatewayForm.get("retry");
  }
  get ping() {
    return this.gatewayForm.get("ping");
  }
  get password() {
    return this.gatewayForm.get("password");
  }
  get auth_username() {
    return this.gatewayForm.get("auth_username");
  }
  get domain() {
    return this.gatewayForm.get("domain");
  }
  get callerID_headervalue() {
    return this.gatewayForm.get("callerID_headervalue");
  }
  get callerid() {
    return this.gatewayForm.get("callerid");
  }
  get prependDigit_callerid() {
    return this.gatewayForm.get("prependDigit_callerid");
  }
  get stripedDigit_callerid() {
    return this.gatewayForm.get("stripedDigit_callerid");
  }
  get time_start() { return this.gatewayForm.get('time_start'); }
  get time_finish() { return this.gatewayForm.get('time_finish'); }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.gatewayForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  toggleVisibility(e) {
    let value = e.checked;
    if (value === true) {
      this.theCheckbox = false;
    } else {
      this.theCheckbox = true;
    }
  }

  checkPort(keyword) {
    let mykeyword = keyword.target.value;
    if (mykeyword.length >= 2) {
      this.gatewayService
        .getGateway({ id: null, ip: null, port: mykeyword, provider_id: null })
        .subscribe(
          (data) => {
            if (!data) {
              this.validPort = false;
            } else if (data["code"]) {
              this.errorField = data["message"];
              this.toastr.error("Error!", this.errorField, { timeOut: 4000 });
              keyword.target.value = "";
              this.validPort = true;
              return;
            } else {
              this.validPort = false;
            }
          },
          (err) => {
            this.error = err.message;
          }
        );
    }
  }

  timeToggleVisibility(e) {
    let value = e.checked;
    this.gatewayData.time_start = "";
    this.gatewayData.time_finish = "";
    if (value === true) {
      this.timeCheckBox = false;
      this.gatewayForm.get('time_start').setValidators(Validators.required);
      this.gatewayForm.get('time_finish').setValidators(Validators.required);
      this.gatewayForm.get('time_start').updateValueAndValidity();
    } else {
      this.timeCheckBox = true;
      this.gatewayForm.get('time_start').clearValidators();
      this.gatewayForm.get('time_finish').clearValidators();
      this.gatewayForm.get('time_start').updateValueAndValidity();
      this.gatewayForm.get('time_start').setValue("");
      this.gatewayForm.get('time_finish').setValue("");
    }
  }

  checkIP(keyword) {
    let mykeyword = keyword.target.value;
    if (mykeyword.length >= 4) {
      this.gatewayService
        .getGateway({ id: null, ip: mykeyword, port: null, provider_id: null })
        .subscribe(
          (data) => {
            if (!data) {
              this.validIP = false;
            } else if (data["code"]) {
              this.errorField = data["message"];
              this.toastr.error("Error!", this.errorField, { timeOut: 4000 });
              keyword.target.value = "";
              this.validIP = true;
              return;
            } else {
              this.validIP = false;
            }
          },
          (err) => {
            this.error = err.message;
          }
        );
    }

    let splitted = mykeyword.split(".", 4);
    let splittedV6 = mykeyword.split(":", 1);
    if (mykeyword.includes(".")) {
      if (splitted.length < 4) {
        this.toastr.error("Error!", invalidIP, { timeOut: 2000 });
        keyword.target.value = "";
        return;
      } else {
        for (let i = 0; i <= splitted.length; i++) {
          if (splitted[i] > 255) {
            this.toastr.error("Error!", invalidIP, { timeOut: 2000 });
            keyword.target.value = "";
            return;
          }
        }
      }
    } else if (mykeyword.includes(":")) {
      for (let i = 0; i <= splittedV6.length; i++) {
        if (splittedV6[i] == "") {
          this.toastr.error("Error!", invalidIP, { timeOut: 2000 });
          keyword.target.value = "";
          return;
        }
      }
    }
  }
  

  editGatewayForm() {
    var value: any = [];
    this.checkForm = this.findInvalidControls();
    
    if (this.gatewayForm.valid) {
      this.submitted = true;
      const credentials = this.gatewayForm.value;
      for (let i = 0; i < this.targetCodec.length; i++) {
        value.push(this.targetCodec[i].codec);
      }
      credentials.codec = value;
      if (credentials.codec == "") {
        this.toastr.error("Error!", codecError, { timeOut: 2000 });
        return;
      }

      if (credentials.transport_type == "") {
        this.toastr.error("Error!", TransportError, { timeOut: 2000 });
        return;
      }

      if (this.theCheckbox === true) {
        credentials.callerID_headervalue = credentials.callerid;
      }

      if (this.validPort == true) {
        this.toastr.error("Error!", duplicatePort, { timeOut: 2000 });
        return;
      }

      if (this.validIP == true) {
        this.toastr.error("Error!", duplicateIP, { timeOut: 2000 });
        return;
      }

      credentials.ip = credentials.subnet == "1" ? credentials.ip : "";
      credentials.domain = credentials.subnet == "2" ? credentials.domain : "";
      // check for valid ip
      if (credentials.ip != "") {
        if (!credentials.ip.includes(".") && !credentials.ip.includes(":")) {
          this.toastr.error("Error!", invalidIP, { timeOut: 2000 });
          return;
        }
      }
      if (credentials.ip != "") {
        let mykeyword = credentials.ip;
        let splitted = mykeyword.split(".", 4);
        let splittedV6 = mykeyword.split(":", 1);
        if (mykeyword.includes(".")) {
          if (splitted.length < 4) {
            this.toastr.error("Error!", invalidIP, { timeOut: 2000 });
            return;
          } else {
            for (let i = 0; i <= splitted.length; i++) {
              if (splitted[i] > 255) {
                this.toastr.error("Error!", invalidIP, { timeOut: 2000 });
                return;
              }
            }
          }
        } else if (mykeyword.includes(":")) {
          for (let i = 0; i <= splittedV6.length; i++) {
            if (splittedV6[i] == "") {
              this.toastr.error("Error!", invalidIP, { timeOut: 2000 });
              return;
            }
          }
        }
      }

      if (
        this.theCheckbox == false &&
        credentials.callerid == credentials.callerID_headervalue
      ) {
        this.toastr.error("Error!", sameCallerID, { timeOut: 2000 });
        return;
      }

      if (this.timeCheckBox == false && credentials.time_start >= credentials.time_finish) {
        this.toastr.error('Error!', minTime, { timeOut: 2000 });
        return;
      }

      credentials.id = this.sessionId;
      this.gatewayService.updateGateway("updateGateway", credentials).subscribe(
        (data) => {
          this.toastr.success("Success!", data["message"], { timeOut: 2000 });
          this.gatewayForm.reset();
          let obj = {
            application: "gateway",
            action: "update",
            que_typ: "",
            id: this.sessionId.toString(),
          };
          this.backendIntegrationService
            .createAPIintegration(obj)
            .subscribe((res) => { });
          this.router.navigateByUrl("config/gateway/view");
        },
        (err) => {
          this.errors = err;
        }
      );
    } else {
      this.toastr.error("Error!", formError + " " + this.checkForm, {
        timeOut: 2000,
      });
    }
  }



  cancelForm() {
    this.gatewayForm.reset();
    this.router.navigateByUrl("config/gateway/view");
  }

  gatewayRegister(e) {
    let myKeyword = e.checked;

    if (myKeyword == true) {
      this.gatewayForm.controls.auth_username.enable();
      this.gatewayForm.controls.expiry.enable();
      this.gatewayForm.controls.password.enable();
      this.gatewayForm.controls.ping.enable();
      this.gatewayForm.controls.retry.enable();
      this.registered = true;
    } else {
      this.gatewayForm.controls.auth_username.disable();
      this.gatewayForm.controls.expiry.disable();
      this.gatewayForm.controls.password.disable();
      this.gatewayForm.controls.ping.disable();
      this.gatewayForm.controls.retry.disable();
      this.registered = false;
    }
  }

  selectSubnet(e) {
    let myservice = e.value;
    if (myservice == 1) {
      this.gatewayForm.controls.domain.disable();
      this.gatewayForm.controls.ip.enable();
      this.selectedDomain = false;
      this.selectedIp = true;
    } else if (myservice == 2) {
      this.gatewayForm.controls.domain.enable();
      this.gatewayForm.controls.ip.disable();
      this.selectedDomain = true;
      this.selectedIp = false;
    }
  }

  public changeOutboundProxy(e) {
    let myKeyword = e.checked;
    if (myKeyword == true) {
      this.gatewayForm.controls.outbound_proxy.disable();
      this.gatewayForm.controls.outbound_proxy.setValue("");
      this.gatewayForm.controls.outbound_proxy.updateValueAndValidity();
    } else {
      this.gatewayForm.controls.outbound_proxy.enable();
    }
  }

  public changeRegisterProxy(e) {
    let myKeyword = e.checked;
    if (myKeyword == true) {
      this.gatewayForm.controls.register_proxy.disable();
      this.gatewayForm.controls.register_proxy.setValue("");
      this.gatewayForm.controls.register_proxy.updateValueAndValidity();
    } else {
      this.gatewayForm.controls.register_proxy.enable();
    }
  }

  public changeRealm(e) {
    let myKeyword = e.checked;
    if (myKeyword == true) {
      this.gatewayForm.controls.realm.enable();
      this.gatewayForm.controls.realm.updateValueAndValidity();
      this.realm = true;
    } else {
      this.gatewayForm.controls.realm.disable();
      this.gatewayForm.controls.realm.setValue("");
      this.realm = false;
    }
  }

  stripDigit(event, stripValue) {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 43) {
      let convertIntoString = stripValue.toString();
      if (event.key == "+" && convertIntoString.length == 0) {
        return true;
      } else if (event.key == "+" && convertIntoString.length >= 1) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  prepandDigit(event, stripValue) {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 43) {
      let convertIntoString = stripValue.toString();
      if (event.key == "+" && convertIntoString.length == 0) {
        return true;
      } else if (event.key == "+" && convertIntoString.length >= 1) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
}
