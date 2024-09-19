import { Component, OnInit } from "@angular/core";
import {
  Errors,
  CommonService,
  ProductService,
  GST_RegEx,
  EMAIL_RegEx,
  Number_RegEx,
  productExist,
  Percentage_RegEx,
  Percentage_RegEx2,
  mailSendError,
  checkCompany,
  userCreated,
  invalidFormError,
  checkUsername,
  emailExist,
  Name_RegEx,
} from "../../../core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../user.service";
import { ToastrService } from "ngx-toastr";
import { DidService } from "../../DID/did.service";
import { PlatformLocation } from "@angular/common";
import { PermissionService } from "../../permission/permission.service";

@Component({
  selector: "app-create-internal-user",
  templateUrl: "./create-internal-user.component.html",
  styleUrls: ["./create-internal-user.component.css"],
})
export class CreateInternalUserComponent implements OnInit {
  isExternalUser = false;
  SelectProduct = false;
  isCredtiLimit = false;
  selectedValue = "";
  selectedProduct = "";
  pbxPackageList = [];
  PackageFilter: any;
  filterPackage: any;
  ocPackageList = [];
  OCPackageFilter: any;
  filterOCPackage: any;
  error = "";
  errors: Errors = { errors: {} };
  userForm: FormGroup;
  submitted = false;
  textboxval = "";
  buttonDisabled = false;
  buttonDisabledOC = false;
  products = [];
  checkForm: any;
  internalUser = "";
  userName = "";
  countryList: any = "";
  CountryFilter;
  filterCountry: any;
  statesList: any = "";
  StateFilter: any;
  filterState: any;
  countryCode = "+91";
  timeZone: any = "";
  TimeZoneFilter: any;
  TimeFilter: any;
  emailContentData: any = {};
  customerName: any = {};
  companyName = "";
  emailId = "";
  goNextPesonalInfo = false;
  goNextCompanyInfo = true;
  credit_value = "0";
  isOCSelect = false;
  isPBXSelect = false;
  URL = "";
  isState = true;
  managerArr = [];
  AccountManager: any;
  AccountFilter: any;
  pbxSelectedValue = "";
  ocSelectedValue = "";
  permissionArr: any;
  PermissionFilter: any;
  filterPermission: any;
  isSubAdmin = false;
  Permmission = false;
  prepaid = false;
  Commission = false;
  OCprepaid = false;
  OCCommission = false;
  EnablePermission: any;
  EnableOCPermission: any;
  isPatternMatched: boolean = false;
  isPatternMatchedd: boolean = false;
  isPatternMatcheddd: boolean = false;

  type: any;
  public fields: Object = { text: "name", value: "id" };
  public fields1: Object = { text: "state_name", value: "id" };
  public fields6: Object = { text: "permission_name", value: "id" };
  public fields2: Object = { text: "gmtzone", value: "id" };
  // public fields3: Object = { text: 'first_name', value: 'id' };
  public fields3: Object = { text: "name", value: "id" };

  public placeholder: string = "Select Country *";
  public placeholder1: string = "Select State *";
  public placeholder6: string = "Choose Permission";
  public placeholder2: string = "Select Time Zone";
  public placeholder3: string = "Select Account Manager";
  public popupHeight: string = "200px";
  public popupWidth: string = "200px";

  constructor(
    private didService: DidService,
    private productService: ProductService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private platformLocation: PlatformLocation,
    private permissionService: PermissionService
  ) {
    this.userForm = this.formBuilder.group({
      product_name: [""],
      pbx_package_name: [""],
      oc_package_name: [""],
      f_name: ["", [Validators.required, Validators.pattern(Name_RegEx)]],
      l_name: ["", Validators.pattern(Name_RegEx)],
      email: ["", [Validators.required, Validators.pattern(EMAIL_RegEx)]],
      username: ["", [Validators.required, Validators.minLength(8)]],
      mobile: ["", [Validators.required, Validators.pattern(Number_RegEx)]],
      company: ["", [Validators.required, Validators.pattern(Name_RegEx)]],
      company_address: [""],
      company_phone: [
        "",
        [
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.min(1000000000),
        ],
      ],
      user_type: [""],
      reseller_type: [""],
      ocreseller_type: [""],
      domain: [""],
      status: ["1"],
      // 'account_manager': ["", [Validators.required]],
      account_manager: [""],
      country: [99, [Validators.required]],
      states: [179, [Validators.required]],
      country_code: [""],
      time_zone: [49, [Validators.required]],
      billing_type: ["1", [Validators.required]],
      balance: [0],
      ocbalance: [0],
      commission: [0],
      occommission: [0],
      commission_balance: [0],
      is_notification_email: [],
      notification_email: [""],
      credit_limit: ["0", [Validators.required]],
      gst_number: ["", Validators.pattern(GST_RegEx)],
      permission_type: [""],
      address: [""],
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
    this.URL = (this.platformLocation as any).location.origin;
    this.type = this.route.snapshot.queryParams.type;

    this.productService.getProductInfo().subscribe((data) => {
      this.selectedValue = data.response;
    });
    this.productService.getProductInfo().subscribe((data) => {
      this.selectedProduct = data.response;
    });

    //get country list
    this.commonService.getCountryList().subscribe((data) => {
      this.countryList = data.response;
      this.filterCountry = this.CountryFilter = this.countryList.slice();
    });

    //get state list
    this.commonService.getIndiaStates().subscribe((data) => {
      this.statesList = data.response;
      this.filterState = this.StateFilter = this.statesList.slice();
    });

    //get active account manager
    this.userService.getInternalUser().subscribe(
      (data) => {
        this.internalUser = data.response;
        const managers = [];
        for (let i = 0; i < this.internalUser.length; i++) {
          if (this.internalUser[i]["role"] == "4") {
            // this.managerArr.push(this.internalUser[i])
            managers.push({
              id: this.internalUser[i]["id"],
              name:
                this.internalUser[i]["first_name"] +
                " " +
                this.internalUser[i]["last_name"],
            });
            this.userForm.get("account_manager").setValue(managers[0]["id"]);
          }
        }
        this.managerArr = managers;
      },
      (err) => {
        this.error = err.message;
      }
    );

    //get time-zones
    this.commonService.getTimezone().subscribe((data) => {
      this.timeZone = data.response;
      this.TimeZoneFilter = this.TimeFilter = this.timeZone.slice();

      //get permission type

      // this.permissionService.getResellerPermission({ 'id': localStorage.getItem('id') }).subscribe(pagedData => {
      //   this.permissionArr = pagedData;
      //   // this.userForm.get('permission_type').setValue(this.permissionArr[0]['id']) ;
      //   this.filterPermission = this.PermissionFilter = this.permissionArr.slice();
      // });
    });

    //get DID for india
    // this.didService.getDIDByCountry(99).subscribe(data => {
    //   this.indianDID = data[0].did;
    //   this.isIndia = true;
    //   this.indianDIDId.push(data[0].id+'-'+data[0].did+'-'+data[0].did_type);
    // });
  }

  Permissionremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.permissionArr.filter((data) => {
      return data["permission_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  pbxPackageListremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.pbxPackageList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Stateremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.statesList.filter((data) => {
      return data["state_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Timeremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.timeZone.filter((data) => {
      return data["gmtzone"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Accountremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.managerArr.filter((data) => {
      return data["first_name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  get company_phone() {
    return this.userForm.get("company_phone");
  }
  get billing_type() {
    return this.userForm.get("billing_type");
  }
  get balance() {
    return this.userForm.get("balance");
  }
  get commission() {
    return this.userForm.get("commission");
  }
  get ocbalance() {
    return this.userForm.get("ocbalance");
  }
  get occommission() {
    return this.userForm.get("occommission");
  }
  get commission_balance() {
    return this.userForm.get("commission_balance");
  }
  get notification_email() {
    return this.userForm.get("notification_email");
  }
  get is_notification_email() {
    return this.userForm.get("is_notification_email");
  }
  get credit_limit() {
    return this.userForm.get("credit_limit");
  }
  get company() {
    return this.userForm.get("company");
  }
  get time_zone() {
    return this.userForm.get("time_zone");
  }
  get country() {
    return this.userForm.get("country");
  }
  get f_name() {
    return this.userForm.get("f_name");
  }
  get l_name() {
    return this.userForm.get("l_name");
  }
  get email() {
    return this.userForm.get("email");
  }
  get username() {
    return this.userForm.get("username");
  }
  get mobile() {
    return this.userForm.get("mobile");
  }
  get user_type() {
    return this.userForm.get("user_type");
  }
  get reseller_type() {
    return this.userForm.get("reseller_type");
  }
  get ocreseller_type() {
    return this.userForm.get("ocreseller_type");
  }
  get account_manager() {
    return this.userForm.get("account_manager");
  }
  get gst_number() {
    return this.userForm.get("gst_number");
  }
  get states() {
    return this.userForm.get("states");
  }
  get pbx_package_name() {
    return this.userForm.get("pbx_package_name");
  }
  get oc_package_name() {
    return this.userForm.get("oc_package_name");
  }
  get permission_type() {
    return this.userForm.get("permission_type");
  }
  static ssss: any;
  checkPattern(event) {
    let value = event.target.value;
    const pattern = /^(?!0\d)(?:[1-9]\d{0,5}|0)?(?:\.\d{1,2})?$|^0\.\d{1,2}$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if (this.isPatternMatchedd == false) {
      let res = value.substr(value.length - 1);
      let array = value.split(".");
      if (res != ".") {
        if (array[0].length > 6) {
          let result = array[0].substring(0, 6);
          this.userForm.controls.balance.setValue(result);
        } else {
          let res = value.includes(".");
          if (res && array[1].length > 2) {
            let valu = array[0] + "." + array[1].substring(0, 2);
            this.userForm.controls.balance.setValue(valu);
          } else {
            let Res = value.substring(0, value.length - 1);
            this.userForm.controls.balance.setValue(Res);
          }
        }
        CreateInternalUserComponent.ssss = value;
      } else {
        if (array[0].length < 6) {
          this.userForm.controls.balance.setValue(value);
        }
      }
      //this.userForm.get('credit_limit').reset();
    } else {
      if (value) {
        let res = value.includes(".");
        if (res == false && CreateInternalUserComponent.ssss) {
          let Res = CreateInternalUserComponent.ssss.includes(".");
          if (Res) {
            let array = CreateInternalUserComponent.ssss.split(".");
            this.userForm.controls.balance.setValue(array[0]);
            value = array[0];
          }
        }
        CreateInternalUserComponent.ssss = value;
        // strValue was non-empty string, true, 42, Infinity, [], ...
      }
    }
  }
  checkbalance(event) {
    let value = event.target.value;
    const pattern = /^(?!0\d)(?:[1-9]\d{0,5}|0)?(?:\.\d{1,2})?$|^0\.\d{1,2}$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if (this.isPatternMatchedd == false) {
      let res = value.substr(value.length - 1);
      let array = value.split(".");
      if (res != ".") {
        if (array[0].length > 6) {
          let result = array[0].substring(0, 6);
          this.userForm.controls.balance.setValue(result);
        } else {
          let res = value.includes(".");
          if (res && array[1].length > 2) {
            let valu = array[0] + "." + array[1].substring(0, 2);
            this.userForm.controls.balance.setValue(valu);
          } else {
            let Res = value.substring(0, value.length - 1);
            this.userForm.controls.balance.setValue(Res);
          }
        }
        CreateInternalUserComponent.ssss = value;
      } else {
        if (array[0].length < 6) {
          this.userForm.controls.balance.setValue(value);
        }
      }
      //this.userForm.get('credit_limit').reset();
    } else {
      if (value) {
        let res = value.includes(".");
        if (res == false && CreateInternalUserComponent.ssss) {
          let Res = CreateInternalUserComponent.ssss.includes(".");
          if (Res) {
            let array = CreateInternalUserComponent.ssss.split(".");
            this.userForm.controls.balance.setValue(array[0]);
            value = array[0];
          }
        }
        CreateInternalUserComponent.ssss = value;
        // strValue was non-empty string, true, 42, Infinity, [], ...
      }
    }
  }
  checkocbalance(event) {
    let value = event.target.value;
    const pattern = /^(?!0\d)(?:[1-9]\d{0,5}|0)?(?:\.\d{1,2})?$|^0\.\d{1,2}$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if (this.isPatternMatchedd == false) {
      let res = value.substr(value.length - 1);
      let array = value.split(".");
      if (res != ".") {
        if (array[0].length > 6) {
          let result = array[0].substring(0, 6);
          this.userForm.controls.ocbalance.setValue(result);
        } else {
          let res = value.includes(".");
          if (res && array[1].length > 2) {
            let valu = array[0] + "." + array[1].substring(0, 2);
            this.userForm.controls.ocbalance.setValue(valu);
          } else {
            let Res = value.substring(0, value.length - 1);
            this.userForm.controls.ocbalance.setValue(Res);
          }
        }
        CreateInternalUserComponent.ssss = value;
      } else {
        if (array[0].length < 6) {
          this.userForm.controls.ocbalance.setValue(value);
        }
      }
      //this.userForm.get('credit_limit').reset();
    } else {
      if (value) {
        let res = value.includes(".");
        if (res == false && CreateInternalUserComponent.ssss) {
          let Res = CreateInternalUserComponent.ssss.includes(".");
          if (Res) {
            let array = CreateInternalUserComponent.ssss.split(".");
            this.userForm.controls.ocbalance.setValue(array[0]);
            value = array[0];
          }
        }
        CreateInternalUserComponent.ssss = value;
        // strValue was non-empty string, true, 42, Infinity, [], ...
      }
    }
  }
  checkbalanceoc(event) {
    let value = event.target.value;
    const pattern = /^(?!0\d)(?:[1-9]\d{0,5}|0)?(?:\.\d{1,2})?$|^0\.\d{1,2}$/; // Example pattern: up to 4 digits
    this.isPatternMatchedd = pattern.test(value);
    if (this.isPatternMatchedd == false) {
      let res = value.substr(value.length - 1);
      let array = value.split(".");
      if (res != ".") {
        if (array[0].length > 6) {
          let result = array[0].substring(0, 6);
          this.userForm.controls.ocbalance.setValue(result);
        } else {
          let res = value.includes(".");
          if (res && array[1].length > 2) {
            let valu = array[0] + "." + array[1].substring(0, 2);
            this.userForm.controls.ocbalance.setValue(valu);
          } else {
            let Res = value.substring(0, value.length - 1);
            this.userForm.controls.ocbalance.setValue(Res);
          }
        }
        CreateInternalUserComponent.ssss = value;
      } else {
        if (array[0].length < 6) {
          this.userForm.controls.ocbalance.setValue(value);
        }
      }
      //this.userForm.get('credit_limit').reset();
    } else {
      if (value) {
        let res = value.includes(".");
        if (res == false && CreateInternalUserComponent.ssss) {
          let Res = CreateInternalUserComponent.ssss.includes(".");
          if (Res) {
            let array = CreateInternalUserComponent.ssss.split(".");
            this.userForm.controls.ocbalance.setValue(array[0]);
            value = array[0];
          }
        }
        CreateInternalUserComponent.ssss = value;
        // strValue was non-empty string, true, 42, Infinity, [], ...
      }
    }
  }

  public changeNotificationEmail(event) {
    let isEmail = event.checked;
    if (isEmail == true) {
      // this.buttonDisabled = true;
      this.userForm.controls.notification_email.setValidators([
        Validators.pattern(EMAIL_RegEx),
        Validators.required,
      ]);
      this.userForm.controls.notification_email.updateValueAndValidity();
    } else {
      this.userForm.controls.notification_email.clearValidators();
      this.userForm.controls.notification_email.setValue("");
      this.userForm.controls.notification_email.updateValueAndValidity();
    }
  }
  getPackageByProduct(product) {
    let myproduct = product.source.value;
    if (myproduct == 1 && product.checked == true) {
      this.Permmission = true;
      this.productService.getPbxPackageInfo().subscribe((data) => {
        this.pbxPackageList = data.response;
        this.filterPackage = this.PackageFilter = this.pbxPackageList.slice();
        this.isPBXSelect = true;
        this.buttonDisabled = false;
        this.pbxSelectedValue = undefined;
        this.userForm.controls.pbx_package_name.setValidators(
          Validators.required
        );
        this.userForm.controls.pbx_package_name.updateValueAndValidity();
      });
    } else if (myproduct == 1 && product.checked == false) {
      this.Permmission = false;
      this.userForm.controls.pbx_package_name.reset;
      this.isPBXSelect = false;
      this.userForm.controls.pbx_package_name.clearValidators();
      this.userForm.controls.pbx_package_name.updateValueAndValidity();
    }
    if (myproduct == 2 && product.checked == true) {
      // this.Permmission = false;
      this.productService.getOcPackageInfo().subscribe((data) => {
        this.ocPackageList = data.response;
        this.filterOCPackage = this.OCPackageFilter =
          this.ocPackageList.slice();
        this.isOCSelect = true;
        this.buttonDisabled = false;
        this.ocSelectedValue = undefined;
        this.userForm.controls.oc_package_name.setValidators(
          Validators.required
        );
        this.userForm.controls.oc_package_name.updateValueAndValidity();
      });
    } else if (myproduct == 2 && product.checked == false) {
      // this.Permmission = false;
      this.userForm.controls.oc_package_name.reset;
      this.isOCSelect = false;
      this.userForm.controls.oc_package_name.clearValidators();
      this.userForm.controls.pbx_package_name.updateValueAndValidity();
    }

    var elements = <HTMLInputElement[]>(
      (<any>document.getElementsByName("product_name"))
    );
    var response_arr = "";
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].tagName == "INPUT") {
        if (elements[i].checked == true) {
          response_arr = elements[i].value;
        }
      }
    }

    if (response_arr.length == 0) {
      this.buttonDisabled = false;
    }
  }

  getByProduct(e, j) {
    let selectProductName = j.checked;
    if (e == 1 && selectProductName == true) {
      this.EnablePermission = true;
      // this.userForm.controls.permission_type.setValidators(Validators.required);
      // this.userForm.controls.permission_type.updateValueAndValidity();
      this.userForm
        .get("permission_type")
        .setValue(this.permissionArr[0]["id"]);

      this.userForm.controls.reseller_type.setValidators(Validators.required);
      this.userForm.controls.reseller_type.updateValueAndValidity();
      // this.buttonDisabled = true;
    } else if (e == 1 && selectProductName == false) {
      this.Commission = false;
      this.prepaid = false;
      this.userForm.controls.balance.clearValidators();
      this.userForm.controls.balance.setValue("");
      this.userForm.controls.balance.updateValueAndValidity();
      this.userForm.controls.reseller_type.clearValidators();
      this.userForm.controls.reseller_type.setValue("");
      this.userForm.controls.reseller_type.updateValueAndValidity();
      this.userForm.controls.commission.clearValidators();
      this.userForm.controls.commission.setValue("");
      this.userForm.controls.commission.updateValueAndValidity();

      this.userForm.controls.permission_type.clearValidators();
      this.userForm.controls.permission_type.updateValueAndValidity();
      this.userForm.get("permission_type").setValue("");
      this.EnablePermission = false;
      this.buttonDisabled = false;
    } else if (e == 2 && selectProductName == true) {
      this.userForm.controls.ocreseller_type.setValidators(Validators.required);
      this.userForm.controls.ocreseller_type.updateValueAndValidity();
      // this.userForm.controls.permission_type.clearValidators();
      // this.userForm.controls.permission_type.updateValueAndValidity();
      // this.userForm.get('permission_type').reset();
      // this.userForm.get('permission_type').setValue('');
      this.EnableOCPermission = true;
      // this.buttonDisabled = true;
      // this.buttonDisabled = true;
    } else if (e == 2 && selectProductName == false) {
      this.OCCommission = false;
      this.OCprepaid = false;
      this.userForm.controls.ocbalance.clearValidators();
      this.userForm.controls.ocbalance.setValue("");
      this.userForm.controls.ocbalance.updateValueAndValidity();
      this.userForm.controls.ocreseller_type.clearValidators();
      this.userForm.controls.ocreseller_type.setValue("");
      this.userForm.controls.ocreseller_type.updateValueAndValidity();
      this.userForm.controls.occommission.clearValidators();
      this.userForm.controls.occommission.setValue("");
      this.userForm.controls.occommission.updateValueAndValidity();

      // this.userForm.controls.permission_type.clearValidators();
      // this.userForm.controls.permission_type.updateValueAndValidity();
      // this.userForm.get('permission_type').setValue('');

      // this.userForm.get('permission_type').reset();
      this.EnableOCPermission = false;
      this.buttonDisabledOC = false;
    }
  }

  usernamelength(e) {
    let max = 20;
    if (e.which < 0x20) {
      // e.which < 0x20, then it's not a printable character
      // e.which === 0 - Not a character
      return; // Do nothing
    }
    if (e.target.value.length == max) {
      e.preventDefault();
    } else if (e.target.length > max) {
      // Maximum exceeded
      e.target.value = e.target.substring(0, max);
    }
  }

  validateForm(event) {
    let text = event.target.value;
    text = text.split(" "); //we split the string in an array of strings using whitespace as separator
    return text.length == 1; //true when there is only one word, false else.
  }
  commissionnn: string = "";
  commissionn: string = "";

  showResellerType(type) {
    // this.buttonDisabled = true;
    let SelectValue = type.value;
    if (SelectValue == "1") {
      this.prepaid = true;
      this.Commission = false;
      this.userForm.controls.balance.setValidators([]);
      this.userForm.controls.balance.updateValueAndValidity();
      this.userForm.controls.commission.clearValidators();
      this.userForm.controls.commission.setValue(0);
      this.userForm.controls.commission.updateValueAndValidity();
    } else if (SelectValue == "2" || SelectValue == "3") {
      this.userForm.controls.commission.setValue("0");
      this.buttonDisabled = false;
      this.prepaid = false;
      this.Commission = true;
      this.userForm.controls.balance.clearValidators();
      this.userForm.controls.balance.setValue("0");
      this.userForm.controls.balance.setValidators([]);
      this.userForm.controls.balance.updateValueAndValidity();
    }
  }
  checkcommission(event) {
    if (event.target.value[0] == '.') {
      this.userForm.controls.commission.setValidators([Validators.required, Validators.pattern(Percentage_RegEx2)]);
      this.userForm.controls.commission.updateValueAndValidity();
    }
    else {
      this.userForm.controls.commission.setValidators([Validators.required, Validators.pattern(Percentage_RegEx)]);
      this.userForm.controls.commission.updateValueAndValidity();
    }    
  
  }

  checkValidation(event){     
    if(event.target.value[0] == '.'){            
      this.userForm.get('commission').setValue('0'+event.target.value)
    }
    if(/^0\d/.test(event.target.value)){      
      this.userForm.get('commission').setValue(event.target.value.replace(/^0+/,""))
    }    
  }
  
  checkOcValidation(event){     
    if(event.target.value[0] == '.'){            
      this.userForm.get('occommission').setValue('0'+event.target.value)
    }
    if(/^0\d/.test(event.target.value)){      
      this.userForm.get('occommission').setValue(event.target.value.replace(/^0+/,""))
    }    
  }

  showResellerOCType(type) {
    // this.buttonDisabled = true;
    let SelectValue = type.value
    if (SelectValue == '1') {
      this.OCprepaid = true;
      this.OCCommission = false;
      this.userForm.controls.ocbalance.setValidators([]);
      this.userForm.controls.ocbalance.updateValueAndValidity();
      this.userForm.controls.occommission.clearValidators();
      this.userForm.controls.occommission.setValue(0);
      this.userForm.controls.occommission.updateValueAndValidity();
    } else if (SelectValue == "2" || SelectValue == "3") {
      this.OCprepaid = false;
      this.OCCommission = true;
      this.buttonDisabledOC = false;
      // this.checkocommission(event);
      // this.userForm.controls.occommission.setValidators([Validators.required,Validators.pattern(Percentage_RegEx)]);
      // this.userForm.controls.occommission.updateValueAndValidity();
      this.userForm.controls.ocbalance.clearValidators();
      this.userForm.controls.ocbalance.setValue(0);
      this.userForm.controls.ocbalance.updateValueAndValidity();
    }
    // else{
    //   this.prepaid = false;

    // }
  }
  checkocommission(event) {
    if (event.target.value[0] == ".") {
      this.userForm.controls.occommission.setValidators([
        Validators.required,
        Validators.pattern(Percentage_RegEx2),
      ]);
      this.userForm.controls.occommission.updateValueAndValidity();
    } else {
      this.userForm.controls.occommission.setValidators([
        Validators.required,
        Validators.pattern(Percentage_RegEx),
      ]);
      this.userForm.controls.occommission.updateValueAndValidity();
    }
  }
  showProduct(customerType) {
    let customer = customerType.value;
    if (customer == "4" || customer == "5") {
      this.buttonDisabled = true;
      this.isExternalUser = false;
      this.isSubAdmin = false;

      this.userForm.controls.account_manager.clearValidators();
      this.userForm.controls.account_manager.updateValueAndValidity();

      this.userForm.controls.time_zone.clearValidators();
      this.userForm.controls.time_zone.updateValueAndValidity();

      this.userForm.controls.company.clearValidators();
      this.userForm.controls.company.updateValueAndValidity();

      this.userForm.controls.billing_type.clearValidators();
      this.userForm.controls.billing_type.updateValueAndValidity();

      this.userForm.controls.balance.clearValidators();
      this.userForm.controls.balance.updateValueAndValidity();

      this.userForm.controls.credit_limit.clearValidators();
      this.userForm.controls.credit_limit.updateValueAndValidity();

      this.userForm.controls.permission_type.clearValidators();
      this.userForm.controls.permission_type.updateValueAndValidity();
    } else if (customer == "2") {
      this.buttonDisabled = false;
      this.isExternalUser = false;
      this.isSubAdmin = true;

      this.permissionService.getSubAdminPer().subscribe((pagedData) => {
        this.permissionArr = pagedData["response"];
        this.filterPermission = this.PermissionFilter =
          this.permissionArr.slice();
      });

      this.userForm.controls.account_manager.clearValidators();
      this.userForm.controls.account_manager.updateValueAndValidity();

      this.userForm.controls.time_zone.clearValidators();
      this.userForm.controls.time_zone.updateValueAndValidity();

      this.userForm.controls.company.clearValidators();
      this.userForm.controls.company.updateValueAndValidity();

      this.userForm.controls.billing_type.clearValidators();
      this.userForm.controls.billing_type.updateValueAndValidity();

      this.userForm.controls.balance.clearValidators();
      this.userForm.controls.balance.updateValueAndValidity();

      this.userForm.controls.credit_limit.clearValidators();
      this.userForm.controls.credit_limit.updateValueAndValidity();

      this.userForm.controls.permission_type.setValidators(Validators.required);
      this.userForm.controls.permission_type.updateValueAndValidity();
    } else if (customer == "3") {
      // this.buttonDisabled = false;
      this.isExternalUser = false;
      // this.isSubAdmin = true;
      this.SelectProduct = true;

      this.permissionService
        .getResellerPermission({ id: localStorage.getItem("id") })
        .subscribe((pagedData) => {
          this.permissionArr = pagedData;
          // this.userForm.get('permission_type').setValue(this.permissionArr[0]['id']) ;
          this.filterPermission = this.PermissionFilter =
            this.permissionArr.slice();
        });

      this.userForm.controls.account_manager.clearValidators();
      this.userForm.controls.account_manager.updateValueAndValidity();

      this.userForm.controls.time_zone.clearValidators();
      this.userForm.controls.time_zone.updateValueAndValidity();

      this.userForm.controls.company.clearValidators();
      this.userForm.controls.company.updateValueAndValidity();

      this.userForm.controls.billing_type.clearValidators();
      this.userForm.controls.billing_type.updateValueAndValidity();

      this.userForm.controls.balance.clearValidators();
      this.userForm.controls.balance.updateValueAndValidity();

      this.userForm.controls.credit_limit.clearValidators();
      this.userForm.controls.credit_limit.updateValueAndValidity();

      // this.userForm.controls.permission_type.setValidators(Validators.required);
      // this.userForm.controls.permission_type.updateValueAndValidity();
    } else {
      this.isExternalUser = true;
      this.buttonDisabled = false;
      this.isSubAdmin = false;

      this.userForm.controls.account_manager.setValidators(Validators.required);
      this.userForm.controls.account_manager.updateValueAndValidity();

      this.userForm.controls.time_zone.setValidators(Validators.required);
      this.userForm.controls.time_zone.updateValueAndValidity();

      this.userForm.controls.company.setValidators(Validators.required);
      this.userForm.controls.company.updateValueAndValidity();

      this.userForm.controls.billing_type.setValidators(Validators.required);
      this.userForm.controls.billing_type.updateValueAndValidity();

      this.userForm.controls.balance.setValidators(Validators.required);
      this.userForm.controls.balance.updateValueAndValidity();

      this.userForm.controls.credit_limit.setValidators(Validators.required);
      this.userForm.controls.credit_limit.updateValueAndValidity();

      this.userForm.controls.permission_type.clearValidators();
      this.userForm.controls.permission_type.updateValueAndValidity();
    }
  }

  manageStates(e) {
    let country_id = e.value;
    if (country_id != "99") {
      this.isState = false;
      this.userForm.controls.states.clearValidators();
      this.userForm.controls.states.updateValueAndValidity();
    } else {
      this.isState = true;
      this.userForm.controls.states.setValidators(Validators.required);
      this.userForm.controls.states.updateValueAndValidity();
    }
  }

  showCreditBox(e) {
    let billing_type = e.value;
    if (billing_type == "1") {
      this.isCredtiLimit = false;
      this.userForm.controls.balance.setValidators(Validators.required);
      this.userForm.controls.balance.updateValueAndValidity();
      this.credit_value = "0";

      this.userForm.controls.credit_limit.clearValidators();
      this.userForm.controls.credit_limit.updateValueAndValidity();
    } else {
      this.isCredtiLimit = true;
      this.userForm.controls.balance.setValidators(Validators.required);
      this.userForm.controls.balance.updateValueAndValidity();

      this.userForm.controls.credit_limit.setValidators(Validators.required);
      this.userForm.controls.credit_limit.updateValueAndValidity();
    }
  }

  personalInfo() {
    let infoField = [
      "f_name",
      "email",
      "username",
      "country",
      "mobile",
      "time_zone",
      "states",
    ];
    this.wizardStepValivation(infoField, "personalInfo");
  }

  companyInfo() {
    let infoField = [
      "company",
      "account_manager",
      "company_phone",
      "gst_number",
    ];
    this.wizardStepValivation(infoField, "companyInfo");
  }

  wizardStepValivation(fieldControl, step) {
    const invalidField = [];

    for (let i = 0; i < fieldControl.length; i++) {
      const controls = this.userForm.controls[fieldControl[i]];
      if (controls.invalid) {
        invalidField.push(fieldControl[i]);
      }
    }

    if (invalidField.length == 0) {
      if (step == "personalInfo") {
        this.goNextPesonalInfo = true;
        this.goNextCompanyInfo = false;
      } else {
        this.goNextCompanyInfo = true;
      }
    } else {
      if (step == "personalInfo") {
        this.goNextPesonalInfo = false;
      } else {
        this.goNextCompanyInfo = false;
      }
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.userForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitUserForm() {
    this.checkForm = this.findInvalidControls();
    if (this.userForm.dirty && this.userForm.valid) {
      this.submitted = true;
      var productArr = [];
      var elements = <HTMLInputElement[]>(
        (<any>document.getElementsByName("product_name"))
      );
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName == "INPUT") {
          if (elements[i].checked == true) {
            let response_arr = elements[i].value;
            productArr.push(response_arr[0]);
          }
        }
      }
      // if(productArr.length == 0){  // Validate atleast one product
      //   this.toastr.error('Error!', productExist, { timeOut: 4000 });
      //   return;
      // }
      const credentials = this.userForm.value;

      this.errors = { errors: {} };
      let user_id = localStorage.getItem("id");
      credentials.user_id = user_id;
      credentials.product_name = productArr;
      credentials["url"] = this.URL;
      this.userService.checkEmailValid(credentials).subscribe((emaildata) => {
        if (emaildata.id != "") {
          this.toastr.error("Error!", emailExist, { timeOut: 4000 });
          this.emailId = "";
          return;
        } else {
          // this.userService.checkCompanyValid(credentials).subscribe(compdata => {
          if (false) {
            this.toastr.error("Error!", checkCompany, { timeOut: 4000 });
            this.emailId = "";
            // this.userForm.get('company').reset();
            return;
          } else {
            this.userService
              .checkUsernameValid(credentials)
              .subscribe((data) => {
                if (data.id != "") {
                  this.toastr.error("Error!", checkCompany, { timeOut: 4000 });
                  this.companyName = "";
                  return;
                } else {
                  // if(this.isIndia){
                  //   credentials['did_number'] = this.indianDIDId;
                  // }
                  if (credentials.user_type == 3) {
                    credentials.permission_name = this.permissionArr.filter(
                      (item) => item.id == credentials.permission_type
                    ).length
                      ? this.permissionArr.filter(
                          (item) => item.id == credentials.permission_type
                        )[0]["permission_name"]
                      : "";
                  }
                  credentials.country_name = this.countryList.filter(
                    (item) => item.id == credentials.country
                  )[0]["name"];
                  if (credentials.country == 99) {
                    credentials.state_name = this.statesList.filter(
                      (item) => item.id == credentials.states
                    )[0]["state_name"];
                  }
                  this.userService.postUserData(credentials).subscribe(
                    (data) => {
                      this.toastr.success(
                        "Registration Successful",
                        userCreated,
                        { timeOut: 4000 }
                      );
                      if (
                        credentials.user_type == "1" ||
                        credentials.user_type == "2"
                      ) {
                        // credentials['customer'] = data['user_id'];
                        // this.didService.assignDID('assignDID',credentials)
                        // .subscribe(data => {
                        //   this.router.navigateByUrl('user/view');
                        // });
                        this.router.navigateByUrl(
                          "support-user/internaluser/view"
                        );
                      } else if (credentials.user_type == "3") {
                        this.router.navigateByUrl("reseller");
                      } else {
                        this.router.navigateByUrl(
                          "support-user/internaluser/view"
                        );
                      }
                    },
                    (err) => {
                      this.errors = err;
                      this.toastr.error("Error!", err.message, {
                        timeOut: 4000,
                      });
                    }
                  );
                }
              });
          }
          // });
        }
      });
    } else {
      this.toastr.error("Error!", invalidFormError, { timeOut: 4000 });
    }
  }

  checkUsername() {
    let credentials = this.userForm.value;
    this.userService.checkUsernameValid(credentials).subscribe((data) => {
      if (data.id >= 1) {
        this.toastr.error("Error!", checkUsername, { timeOut: 4000 });
        this.userName = "";
      }
    });
  }

  checkCompany() {
    let credentials = this.userForm.value;
    this.userService.checkCompanyValid(credentials).subscribe((data) => {
      if (data.id >= 1) {
        this.toastr.error("Error!", checkCompany, { timeOut: 4000 });
        this.companyName = "";
      }
    });
  }

  checkEmail() {
    let credentials = this.userForm.value;
    this.userService.checkEmailValid(credentials).subscribe((data) => {
      if (data.id >= 1) {
        this.toastr.error("Error!", emailExist, { timeOut: 4000 });
        this.emailId = "";
      }
    });
  }

  goNext(event) {
    this.buttonDisabled = true;
    // if(this.type == 3){
    //   let permission = this.userForm.get('permission_type').value;
    //   let resell_type =  this.userForm.get('reseller_type').value
    //   let balance = this.userForm.get('balance').value;
    //   let commission_per = this.userForm.get('commission').value;

    //   let ocresell_type =  this.userForm.get('ocreseller_type').value
    //   let ocbalance = this.userForm.get('ocbalance').value;
    //   let occommission_per = this.userForm.get('occommission').value;
    //   if(resell_type == 1 ){
    //     if(balance == "" || permission == ''){
    //       this.buttonDisabled = false;
    //     }else{
    //       this.buttonDisabled = true;
    //     }
    //   }else if((resell_type == 2 || resell_type == 3)){
    //     if(balance == "" || permission == '' || commission_per == ''){
    //       this.buttonDisabled = false
    //     }else{
    //       this.buttonDisabled = true;
    //     }
    //   }
    //   if(ocresell_type == 1 ){
    //     if(ocbalance == ""){
    //       this.buttonDisabled = false;
    //     }else{
    //       this.buttonDisabled = true;
    //     }
    //   }else if((ocresell_type == 2 || ocresell_type == 3)){
    //     if(ocbalance == "" || occommission_per == ''){
    //       this.buttonDisabled = false
    //     }else{
    //       this.buttonDisabled = true;
    //     }
    //   }
    // }
  }
  goNextOC(event) {
    this.buttonDisabledOC = true;
    if (this.type == 3) {
      let ocresell_type = this.userForm.get("ocreseller_type").value;
      let ocbalance = this.userForm.get("ocbalance").value;
      let occommission_per = this.userForm.get("occommission").value;
      if (ocresell_type == 1) {
        if (ocbalance == "") {
          this.buttonDisabledOC = false;
        } else {
          this.buttonDisabledOC = true;
        }
      } else if (ocresell_type == 2 || ocresell_type == 3) {
        if (ocbalance == "" || occommission_per == "") {
          this.buttonDisabledOC = false;
        } else {
          this.buttonDisabledOC = true;
        }
      }
    }
  }
  goNextPBX() {
    this.buttonDisabled = true;
    if (this.type == 3) {
      let permission = this.userForm.get("permission_type").value;
      let resell_type = this.userForm.get("reseller_type").value;
      let balance = this.userForm.get("balance").value;
      let commission_per = this.userForm.get("commission").value;
      if (resell_type == 1) {
        if (balance == "" || permission == "") {
          this.buttonDisabled = false;
        } else {
          this.buttonDisabled = true;
        }
      } else if (resell_type == 2 || resell_type == 3) {
        if (balance == "" || permission == "" || commission_per == "") {
          this.buttonDisabled = false;
        } else {
          this.buttonDisabled = true;
        }
      }
    }
  }

  onChange() {
    let balance = this.userForm.get("balance").value;
    if (balance == "") {
      this.buttonDisabled = false;
    }
  }

  getCountryCode(event) {
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe((data) => {
      this.countryCode = "+" + data.response[0].phonecode;
    });

    // if(country_id == 99){
    //   this.isIndia = true;
    //   this.didService.getDIDByCountry(country_id).subscribe(data => {
    //     this.indianDID = data[0].did;
    //     this.indianDIDId.push(data[0].id+'-'+data[0].did+'-'+data[0].did_type);
    //   });
    // }else{
    //   this.indianDID = '';
    //   this.indianDIDId = [];
    //   this.isIndia = false;
    // }
  }
}
