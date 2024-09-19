import { Component, Inject, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  FormControl,
  FormArray,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import Swal from "sweetalert2";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  Errors,
  CommonService,
  ExcelService,
  CallPlanRate,
  invalidFileType,
  importUnsuccessfully,
  importSuccessfully,
  Number_RegEx,
  Number_Not_Start_Zero_RegEx,
} from "../../../core";
import "jspdf-autotable";
import { UserTypeConstants } from "src/app/core/constants";
import { UserService } from "../../user/user.service";
import { MinutePlanService } from "../../customer-minute-plan/customer-minute-plan.service";
export var productId = '1';

@Component({
  selector: "app-roaming-bundle-plan",
  templateUrl: "./roaming-bundle-plan.component.html",
  styleUrls: ["./roaming-bundle-plan.component.css"],
})
export class RoamingBundlePlanComponent implements OnInit {
  //------------------------------  Bundle/Roaming Minute History By. (Nagender Pratap Chauhan 31-07-2021) ------------------------------------------------------------//

  error = "";
  isFilter = false;
  filterForm: FormGroup;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = "10";
  loginUserType = localStorage.getItem("type");
  accountManagerCustomerList: "";
  placeholder: string = "Plan Type"
  placeholder2: string = "Company"
  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public fields: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'company_name', value: 'id' };

  public planTypes: any = [{
    id: 1,
    name: 'DID Bundle'
  }, {
    id: 5,
    name: 'Outgoing Bundle'
  }, {
    id: 2,
    name: 'Roaming'
  }, {
    id: 4,
    name: 'Teleconsultancy'
  }]
  companyData: any[] = [];
  constructor(
    private fb: FormBuilder,
    private minutePlanService: MinutePlanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      by_name: [""],
      'by_plan_type': [""],
      'by_company': new FormControl([]),
      'by_date': [""]
    });
  }

  ngOnInit() {
    // let loginUserType = localStorage.getItem('type');   // admin, manager, support, customer etc
    this.minutePlanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    let userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    if (userType == '3') {
      this.userService.getCustomerCompanyReseller(id, productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.companyData.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
        }
      }, err => {
        this.error = err.message;
      });
    } else {
      this.commonService.getAllCustomerCompany().subscribe(data => {
        this.companyData = data.response;
      }, err => {
        this.error = err.message;
      });
    }
  }
  Providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.companyData.filter((data) => {
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  displayAllRecord() {
    this.columnDefs = [
      // { field: "action", headerName: "Action", hide: false, width: 120 },
      { field: "id", headerName: "ID", hide: true, width: 10 },
      {
        field: "minute_plan",
        headerName: "Minute Plan",
        hide: false,
        width: 270,
      },
      // { field: 'bundle_plan_validity', headerName: 'Bundle Plan Validity', hide: false, width: 20 },      
      {
        field: "charge",
        headerName: "Charge",
        hide: false,
        width: 250,
      },
      // {
      //   field: "outbound_bundle_plan_name",
      //   headerName: "Outgoing Bundle",
      //   hide: false,
      //   width: 150,
      // },
      // {
      //   field: "outbound_bundle_plan_charge",
      //   headerName: "Outgoing Bundle Charge",
      //   hide: false,
      //   width: 150,
      // },
      // {
      //   field: "roaming_plan_name",
      //   headerName: "Roaming Plan",
      //   hide: false,
      //   width: 150,
      // },
      // // { field: 'roaming_plan_validity', headerName: 'Roaming Plan Validity', hide: false, width: 20 },
      // {
      //   field: "roaming_plan_charge",
      //   headerName: "Roaming Plan Charge",
      //   hide: false,
      //   width: 180,
      // },
      // {
      //   field: "tc_plan_name",
      //   headerName: "Teleconsultancy Plan",
      //   hide: false,
      //   width: 180,
      // },
      {
        field: "plan_type",
        headerName: "Type",
        hide: false,
        width: 250,
      },
      {
        field: "name",
        headerName: "Package",
        hide: false,
        width: 250,
      },
      {
        field: "company_name",
        headerName: "Company",
        hide: false,
        width: 270,
      },
      {
        field: "purchase_date",
        headerName: "Purchase Date",
        hide: false,
        width: 254,
      },
    ];

    if (this.isFilter) {
      let role = Number(localStorage.getItem('type'));
      let ResellerID = Number(localStorage.getItem('id'));
      const credentials = this.filterForm.value;
      this.minutePlanService.viewBundleAndRoamingPlanHistory(credentials, role, ResellerID).subscribe(pagedData => {
        this.exportData = pagedData;
        // pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      let role = Number(localStorage.getItem('type'));
      let ResellerID = Number(localStorage.getItem('id'));
      this.minutePlanService
        .viewBundleAndRoamingPlanHistory({ by_company: null, by_plan_type: null, by_name: null, by_date: null }, role, ResellerID)
        .subscribe((pagedData) => {
          this.exportData = pagedData;
          // pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: pagedData });
        });
    }
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  Planremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.planTypes.filter((data) => {
      return data['company_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  // manageUserActionBtn(pagedData) {
  //   // for (let i = 0; i < pagedData.length; i++) {
  //   //   let finalBtn = "";
  //   //   finalBtn += "<span>";
  //   //   finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='help' title='Edit'></i>";
  //   //   finalBtn +=
  //   //     "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='info' title='Information'></i>";
  //   //   finalBtn += "</span>";
  //   //   pagedData[i]["action"] = finalBtn;
  //   // }
  //   // return pagedData;
  // }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "info":
        return this.infoBundlePlan(data);
      case "help":
        return this.showInfo();
    }
  }

  infoBundlePlan(event) {
    this.openDialog(event);
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  openDialog(data): void {
    const dialogRef = this.dialog.open(InfoRoamingDialog, {
      width: "70%",
      disableClose: true,
      data,
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(HelpRoamingDialog, {
      width: '80%', disableClose: true, autoFocus: false,

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

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
}

@Component({
  selector: "info-roaming-dialog",
  templateUrl: "info-roaming-dialog.html",
})
export class InfoRoamingDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoRoamingDialog>,
    private minutePlanService: MinutePlanService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  filterForm: FormGroup;
  packageLogList: any;
  ngOnInit() {
    const params = {
      bundle_plan_id: this.data.bundle_plan_name,
      roaming_plan_id: this.data.roaming_plan_name,
      teleconsultation: this.data.tc_plan_name
    }
    this.minutePlanService
      .getBundleAndRoamingAuditLogsByPlan(params)
      .subscribe((pagedData) => {
        this.packageLogList = pagedData;

      });
  }

  cancleDialog(e): void {
    this.dialogRefInfo.close();
    e.preventDefault();
  }
}


@Component({
  selector: "help-roaming-dialog",
  templateUrl: "help-roaming-dialog.html",
})
export class HelpRoamingDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoRoamingDialog>,
  ) { }

  ngOnInit() {

  }

  cancleDialog(e): void {
    this.dialogRefInfo.close();
    e.preventDefault();
  }
}