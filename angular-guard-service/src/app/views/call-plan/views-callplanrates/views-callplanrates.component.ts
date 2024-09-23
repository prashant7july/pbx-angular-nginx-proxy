import { Component, OnInit, Inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  FormControl,
} from "@angular/forms";
import { CallplanService } from "../callplan.service";
import { ToastRef, ToastrService } from "ngx-toastr";
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
  num_not_start_with_ziro,
  Number_Not_Start_Zero_RegEx,
  textareaContent,
} from "../../../core";
import { GatewayService } from "../../gateway/gateway.service";
import {
  FileUploader,
  FileSelectDirective,
} from "ng2-file-upload/ng2-file-upload";
import { environment } from "../../../../environments/environment.prod";
import * as jsPDF from "jspdf";
import "jspdf-autotable";
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as FileSaver from "file-saver";
import { UserTypeConstants } from "src/app/core/constants";
import { UserService } from "../../user/user.service";
import { forkJoin } from "rxjs";

declare const ExcelJS: any;
const URL = environment.api_url + "uploadCsv/";
// const URL = 'http://localhost:3000'+ '/uploadCsv';      

export var imagePath: any;

@Component({
  selector: "app-views-callplanrates",
  templateUrl: "./views-callplanrates.component.html",
  styleUrls: ["./views-callplanrates.component.css"],
})
export class ViewsCallplanratesComponent implements OnInit {
  error = "";
  isFilter = false;
  filterForm: FormGroup;
  selectedValue: any = [];
  allCountryList: any = "";
  ManageIcon;
  SelectCallFilter: any;
  filterCallPlan: any;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = "10";
  loginUserType = localStorage.getItem("type");
  accountManagerCustomerList: "";
  selectedGroupValue: any;
  gateways: any = [];
  companyList: any[] = [];
  GatewayFilter: any;
  filterGateway: any;
  autoFilledCallPlanFilter: any;
  public mode = "CheckBox";
  public selectAllText: string = "Select All";
  // public htmlAttributes = { name: "country", placeholder: "Select a country", title: "DropDownList" };
  public fields3: Object = { text: "name", value: "phonecode" };
  public fields: Object = { text: "name", value: "id" };
  public fields4: Object = { text: "name", value: "id" };
  public placeholder: string = "Select Call Plan";
  public placeholder4: string = "Select Gateway";
  public placeholder3: string = "Select Country";
  public popupHeight: string = "200px";
  public popupWidth: string = "200px";
  public fields2: Object = { text: "name", value: "id" };
  public placeholder2: string = "Select Group";
  public fields6: Object = { text: "name", value: "phonecode" };
  public placeholder6: string = "Select Country";
  menus: any;
  callRateMenu: any = "";
  cust_id = "";
  checkMinuteData: any = "";

  constructor(
    private fb: FormBuilder,
    private callplanService: CallplanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private gatewayService: GatewayService,
    private toastr: ToastrService
  ) {
    this.filterForm = this.fb.group({
      by_call_plan: new FormControl([]),
      by_dial_prefix: [""],
      by_buying_rate: [""],
      by_selling_rate: [""],
      by_gateway: new FormControl([]),
      by_customer: [""],
      by_call_group: new FormControl([]),
      by_destination: new FormControl([]),
      by_plan_type: [""],
    });
    this.autoFilledCallPlanFilter =
      this.router.getCurrentNavigation().extras.state;
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
    this.userService
      .getAccountManagerCustomercompany(localStorage.getItem("id"))
      .subscribe(
        (datas) => {
          let data = datas.response;
          for (let i = 0; i < data.length; i++) {
            this.companyList.push({
              id: data[i].id,
              name: data[i].company_name + "(Ref. Code: " + data[i].id + ")",
            });
          }
        },
        (err) => {
          this.error = err.message;
        }
      );
    this.commonService.getCountryList().subscribe(
      (data) => {
        this.allCountryList = data.response;
      },
      (err) => {
        this.error = err.message;
      }
    );
    this.menus = JSON.parse(localStorage.getItem("menu"));
    this.callRateMenu = this.menus.find((o) => o.url == "/callPlan/view");
    let loginUserId = localStorage.getItem("id");
    let loginUserType = localStorage.getItem("type"); // admin, manager, support, customer etc
    this.callplanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    // this.userService.getAccountManagerCustomercompany(localStorage.getItem('id')).subscribe(datas => {
    //   // this.selectedValue = data.response;
    //   let data = datas.response;
    //   for (let i = 0; i < data.length; i++) {
    //     this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
    //   }
    // }, err => {
    //   this.error = err.message;
    // });
    this.gatewayService
      .getGateway({ id: null, ip: null, port: null, provider_id: null })
      .subscribe((data) => {
        let datas = data;
        for (let i = 0; i < datas.length; i++) {
          this.gateways.push({
            id: datas[i].id,
            name: datas[i].provider + " " + datas[i].ip + " " + datas[i].domain,
          });
        }
        // this.allGateway = data ? data : [];
        // this.filterGateway = this.GatewayFilter = this.allGateway.slice();
      });
    // this.gatewayService.getGateway({ id: null, ip: null, port: null, provider_id: null }).subscribe(data => {
    //   let arrMap;
    //   arrMap = data.map( (item) => {
    //     this.gateways.push({ id: item.id, name: item.provider + '-' + item.ip });
    //     // this.gateways.push({id:item['id'], name: item['ip'], provider: item['provider']})
    //     this.filterGateway = this.GatewayFilter = this.gateways.slice()
    //   })
    // });
    // this.callplanService.getCallPlan().subscribe(data => {
    //   this.selectedValue = data.response;
    // });
    // this.callplanService.getManagerCustomersCallPlan(localStorage.getItem('id')).subscribe(data => {
    // });
    if (loginUserType == UserTypeConstants.ACCOUNT_MANAGER) {
      this.ManageIcon = true;
      forkJoin([
        this.callplanService.getManagerCustomersCallPlan(
          localStorage.getItem("id")
        ),
        this.callplanService.getManagerCustomerscallPlanRoaming(
          localStorage.getItem("id")
        ),
        this.callplanService.getManagerCustomerscallPlanTC(
          localStorage.getItem("id")
        ),
        this.callplanService.getManagerCustomerscallPlanStandard(
          localStorage.getItem("id")
        ),
      ]).subscribe(
        ([apiResponse1, apiResponse2, apiResponse3, apiResponse4]) => {
          this.selectedValue = apiResponse1.response.concat(
            apiResponse2.response,
            apiResponse3.response,
            apiResponse4.response
          );
        },
        (error) => {
          console.error(error);
        }
      );
      // this.ManageIcon = true;

      // this.callplanService.getManagerCustomersCallPlan(localStorage.getItem('id')).subscribe(data => {
      //   this.selectedValue = data.response;
      //   this.filterCallPlan = this.SelectCallFilter = this.selectedValue.slice();
      // });
    } else {
      this.callplanService.getCallPlan().subscribe((data) => {
        this.selectedValue = data.response;
        this.filterCallPlan = this.SelectCallFilter =
          this.selectedValue.slice();
      });
    }
    this.callplanService.viewCallRateGroup({}).subscribe((response) => {
      this.selectedGroupValue = response;
    });
  }
  Countryremoved(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.allCountryList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Gatewayremoved(event) {
    const textValuea = event.text.trim().toLowerCase();
    const filterDataa = this.gateways.filter((data) => {
      return data["name"].toLowerCase().includes(textValuea);
    });
    event.updateData(filterDataa);
  }
  CallGroupremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();

    const filterData = this.selectedGroupValue.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Callremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedValue.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  displayAllRecord() {
    let loginUserId = localStorage.getItem("id");
    let loginUserType = localStorage.getItem("type"); // admin, manager, support, customer etc
    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 90 },
      { field: "id", headerName: "ID", hide: true, width: 110 },
      { field: "call_plan", headerName: "Call Plan", hide: false, width: 120 },
      {
        field: "plan_type_name",
        headerName: "Plan Type",
        hide: false,
        width: 120,
      },
      // { field: 'call_plan', headerName: 'Minute Plan', hide: false, width: 22 },
      {
        field: "dial_prefix",
        headerName: "Dial Prefix",
        hide: false,
        width: 100,
      },
      {
        field: "nicename",
        headerName: "Country Name",
        hide: false,
        width: 120,
      },
      { field: "gatewayName", headerName: "Gateway", hide: false, width: 120 },
      {
        field: "group_name",
        headerName: "Group Name",
        hide: false,
        width: 120,
      },
      // { field: 'ip_info', headerName: 'IP/Domain', hide: false, width: 20 },
      // { field: 'minute_plan', headerName: 'Minute Plan', hide: false, width: 20 },
      {
        field: "group_minutes",
        headerName: "Minutes",
        hide: false,
        width: 120,
      },
      // { field: 'buying_rate', headerName: 'Buying Rate', hide: false, width: 30 },
      {
        field: "selling_rate",
        headerName: "Selling Rate",
        hide: false,
        width: 100,
      },
      // { field: 'selling_min_duration', headerName: 'Selling Min Duration', hide: false, width: 160 },
      {
        field: "selling_billing_block",
        headerName: "Selling Billing Block",
        hide: false,
        width: 110,
      },
      { field: 'booster_for', headerName: 'Booster For', hide: false, width: 150 }
    ];
    if (loginUserType == UserTypeConstants.ADMIN || loginUserType == UserTypeConstants.SUBADMIN) {
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        this.callplanService.filterCallPlanRate(credentials).subscribe(
          (pagedData) => {
            this.exportData = pagedData;
            pagedData = this.manageUserActionBtn(pagedData);
            this.dataSource = [];
            this.dataSource.push({ fields: this.columnDefs, data: pagedData });
          },
          (err) => {
            this.error = err.message;
          }
        );
      } else {
        // let autoFilledCallPlanFilter = this.router.getCurrentNavigation().extras.state;
        if (this.autoFilledCallPlanFilter) {
          let arr = [];
          arr.push(this.autoFilledCallPlanFilter.id);
          this.filterForm.get("by_call_plan").setValue(arr);
          const credentials = this.filterForm.value;
          this.callplanService.filterCallPlanRate(credentials).subscribe(
            (pagedData) => {
              this.exportData = pagedData;
              pagedData = this.manageUserActionBtn(pagedData);
              this.dataSource = [];
              this.dataSource.push({
                fields: this.columnDefs,
                data: pagedData,
              });
            },
            (err) => {
              this.error = err.message;
            }
          );
        } else {
          this.callplanService
            .viewCallPlanRate({ id: null, dial_prefix: null })
            .subscribe((pagedData) => {
              this.exportData = pagedData;
              pagedData = this.manageUserActionBtn(pagedData);
              this.dataSource = [];
              this.dataSource.push({
                fields: this.columnDefs,
                data: pagedData,
              });
            });
        }
      }
    } else if (loginUserType == UserTypeConstants.ACCOUNT_MANAGER) {
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        credentials.customer_id = localStorage.getItem("id");
        credentials["by_customer"] = this.cust_id;
        this.callplanService
          .viewManagerCallPlanRateByFilters(credentials)
          .subscribe(
            (pagedData) => {
              this.exportData = pagedData;
              pagedData = this.manageUserActionBtn(pagedData);
              this.dataSource = [];
              this.dataSource.push({
                fields: this.columnDefs,
                data: pagedData,
              });
            },
            (err) => {
              this.error = err.message;
            }
          );
      } else {
        let customerId;
        this.route.queryParams.subscribe((params) => {
          customerId = params["cId"] ? params["cId"] : false;
          this.cust_id = customerId;
          if (customerId) {
            this.callplanService
              .viewCustomerCallPlanRate({ id: Number(customerId) })
              .subscribe((pagedData) => {
                this.exportData = pagedData;
                pagedData = this.manageUserActionBtn(pagedData);
                this.dataSource = [];
                this.dataSource.push({
                  fields: this.columnDefs,
                  data: pagedData,
                });
              });
            return;
          } else {
            this.callplanService
              .viewManagerCallPlanRate({ id: loginUserId })
              .subscribe((pagedData) => {
                this.exportData = pagedData;
                pagedData = this.manageUserActionBtn(pagedData);
                this.dataSource = [];
                this.dataSource.push({
                  fields: this.columnDefs,
                  data: pagedData,
                });
              });
            return;
          }
        });
      }
      this.userService
        .getAllUserForAccountManager(localStorage.getItem("id"))
        .subscribe(
          (data) => {
            this.accountManagerCustomerList = data;
          },
          (err) => {
            this.error = err.message;
          }
        );
    }
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  exportToExcel(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

    worksheet = workbook.addWorksheet("My Sheet", {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToHeight: 5,
        fitToWidth: 7,
      },
    });
    worksheet.pageSetup.margins = {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    };
    worksheet.columns = [
      { header: "Call Plan", key: "CallPlan", width: 30 },
      { header: "Plan Type", key: "PlanName", width: 30 },
      { header: "Dial Prefix", key: "DialPrefix", width: 10 },
      { header: "Gateway", key: "Gateway", width: 25 },
      { header: "Buying Rate", key: "BuyingRate", width: 15 },
      { header: "Group Name", key: "GroupName", width: 15 },
      { header: "Minutes", key: "GroupMinutes", width: 15 },
      { header: "Selling Rate", key: "SellingRate", width: 15 },
      // { header: 'Selling Min Duration', key: 'SellingMinDuration', width: 18 },
      {
        header: "Selling Billing Block",
        key: "SellingBillingBlock",
        width: 18,
      },
    ];
    worksheet.getRow(1).font = {
      bold: true,
    };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    for (let i = 0; i < this.exportData.length; i++) {
      worksheet.addRow({
        CallPlan: this.exportData[i].call_plan,
        PlanName: this.exportData[i].plan_type_name,
        DialPrefix: this.exportData[i].dial_prefix,
        Gateway: this.exportData[i].gatewayName,
        BuyingRate: this.exportData[i].buying_rate,
        GroupName: this.exportData[i].group_name,
        GroupMinutes: this.exportData[i].group_minutes,
        SellingRate: this.exportData[i].selling_rate,
        SellingMinDuration: this.exportData[i].selling_min_duration,
        SellingBillingBlock: this.exportData[i].selling_billing_block,
      });
    }
    worksheet.eachRow(function (row, _rowNumber) {
      row.eachCell(function (cell, _colNumber) {
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
      });
    });
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = "1:2";
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    // this.excelService.exportAsExcelFile(arr, 'callPlanRate');
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, "callPlanRate");
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = [
      "Call Plan",
      "Plan Type",
      "Dial Prefix",
      "Gateway",
      "Group Name",
      "Minutes",
      "Buying Rate",
      "Selling Rate",
      "Selling Billing Block",
    ];
    var rows = [];
    this.exportData.forEach((element) => {
      const e11 = [
        element.call_plan,
        element.plan_type_name,
        element.dial_prefix,
        element.gatewayName,
        element.group_name,
        element.group_minutes,
        element.buying_rate,
        element.selling_rate,
        element.selling_min_duration,
        element.selling_billing_block,
      ];
      rows.push(e11);
    });
    doc.autoTable(col, rows, {
      theme: "grid",
      pageBreak: "auto",
      rowPageBreak: "avoid",
      styles: {
        overflow: "linebreak",
        fontSize: 6,
      },
      columnStyles: {
        0: { cellWidth: "wrap" },
        1: { cellWidth: "wrap" },
        2: { cellWidth: "wrap" },
        3: { cellWidth: "wrap" },
        4: { cellWidth: "wrap" },
        5: { cellWidth: "wrap" },
        6: { cellWidth: "wrap" },
        7: { cellWidth: "wrap" },
        8: { cellWidth: "wrap" },
        9: { cellWidth: "wrap" },
      },
    });
    doc.save("callPlanRate.pdf");
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      // let loginUserType = localStorage.getItem('type');   // admin, manager, support, customer etc
      let userType = localStorage.getItem("type") == "0" ? true : localStorage.getItem("type") == "2" ? true : false;
      // this.userType = localStorage.getItem('type') == '0' || localStorage.getItem('type') == '2' ? true : localStorage.getItem('type') == '4' ? true : false;
      let finalBtn = "";
      let gatewayCol = "";
      finalBtn += "<span>";
      if (this.callRateMenu.view_permission == '1' && this.callRateMenu.all_permission == '0') {
        finalBtn +=
          "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.callRateMenu.modify_permission && userType) {
        if (
          pagedData[i].minute_plan === pagedData[i].plan_type_name &&
          pagedData[i].minute_plan != "Teleconsultation" &&
          userType
        ) {
          finalBtn +=
            "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
        } else {
          finalBtn +=
            "<i class='fa fa-pencil-square-o edit-button' style='cursor: not-allowed; display: inline; color:black' data-action-type='edit-non-click' title='Edit'></i>";
        }
      }
      if (this.callRateMenu.modify_permission) {
        if (this.loginUserType == UserTypeConstants.ADMIN || this.loginUserType == UserTypeConstants.SUBADMIN) {
          finalBtn +=
            "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
        }
      }
      if (this.loginUserType == UserTypeConstants.ACCOUNT_MANAGER) {
        finalBtn +=
          "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline' data-action-type='view' title='View'></i>";
      }
      gatewayCol += pagedData[i].gatewayName + "-" + pagedData[i].ip_info;

      finalBtn += "</span>";

      pagedData[i]["action"] = finalBtn;
      pagedData[i]["gatewayName"] = gatewayCol;
    }

    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editCallPlanRate(data);
      case "delete":
        return this.deleteCallPlanRate(data);
      case "view":
        return this.editCallPlanRate(data);
      case "edit-non-click":
        return this.nothing(data);
    }
  }

  editCallPlanRate(event) {
    this.openDialog(event);
  }

  nothing(event) {
    return;
  }

  deleteCallPlanRate(event) {
    this.callplanService.checkCallRateMapping(event.id).subscribe((data) => {
      this.checkMinuteData = data;
    });
    if (
      this.checkMinuteData.actual_minutes != this.checkMinuteData.used_minutes
    ) {
      this.toastr.error("Error!", "Cannot delete this call rates!", {
        timeOut: 2000,
      });
      return;
    } else {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html:
          "<span style='color:#FFFFFF;'>You will not be able to recover Call Rate </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
          event.call_plan +
          "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: "warning",
        showCancelButton: true,
        background: "#000000",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, keep it",
        preConfirm: () => {
          this.callplanService.deleteCallPlanRate({ id: event.id }).subscribe(
            (data) => {
              this.displayAllRecord();
            },
            (err) => {
              this.error = err.message;
            }
          );
        },
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Deleted!</span>',
            html:
              "<span style='color:#FFFFFF;'> Call Rate </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              event.call_plan +
              "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
            type: "success",
            background: "#000000",
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html:
              "<span style='color:#FFFFFF;'>Call Rate </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              event.call_plan +
              "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: "error",
            background: "#000000",
          });
        }
      });
    }
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(CallPlanRateDialog, {
      width: "60%",
      disableClose: true,
      data: id ? id : null,
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

  importFile() {
    const dialogRef11 = this.dialog.open(ImportCallPlanDialog, {
      width: '60%', disableClose: true,
      data: {}
    });
    dialogRef11.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCallPlanRateDialog, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: {
        customerId:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
      },
    });
    dialogRefInfo.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRefInfo.close("Dialog closed");
      }
    });
    dialogRefInfo.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }
  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }

  manageGateway() {
    const dialogRefInfo = this.dialog.open(ManageGatewaydialog, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: {
        customerId:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
      },
    });
    dialogRefInfo.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRefInfo.close("Dialog closed");
      }
    });
    dialogRefInfo.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }
}

//////info file
@Component({
  selector: "infoCallPlanRate-dialog",
  templateUrl: "infoCallPlanRate-dialog.html",
})
export class InfoCallPlanRateDialog {
  public mode = "CheckBox";
  public selectAllText: string = "Select All";
  public fields: Object = { text: "company_name", value: "id" };
  public placeholder: string = "Select Gateway";
  public popupHeight: string = "200px";
  public popupWidth: string = "250px";
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCallPlanRateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CallPlanRate
  ) { }

  ngOnInit() {
    const element = document.querySelector("#scrollId");
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

//import file
///////////////////////////////////////////////////////////////////////////////////
@Component({
  selector: "importCallPlan-dialog",
  templateUrl: "importCallPlan-dialog.html",
})
export class ImportCallPlanDialog {
  text = "";
  basic = false;
  advance = true; //false;
  importRates: FormGroup;
  importAdvanceFile = false;
  showNotInsertedValue: any = false;
  imageSource1: any;
  excelValue: any = {};
  statusCode: any;
  imageSource: any;
  selectedValue = [];
  public fields: Object = { text: "name", value: "id" };
  public popupHeight: string = "200px";
  public popupWidth: string = "200px";
  public placeholder3: string = "Select Call Plan";
  public placeholder1: string = "Gateway";
  public fields1: Object = { text: "name", value: "id" };
  public placeholder2: string = "Group Name";
  callPlanRateData: any = {};
  allGateway = [];
  planType: any;
  callRategroupList: any = [];
  isGroups = false;
  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: "file",
    allowedFileType: ["xls", "xlsx", "csv"],
    method: "post",
  });

  constructor(
    public dialogRef11: MatDialogRef<ImportCallPlanDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
    private callplanService: CallplanService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private gatewayService: GatewayService
  ) {
    this.importRates = this.fb.group({
      'plan_type': ['0', Validators.required],
      'gateway': ['', Validators.required],
      'isGroup': [false],
      'group_id': ["",],
      'call_plan': ['', Validators.required],
      'booster_for': ['']
    });
  }

  get group_id() {
    return this.importRates.get("group_id");
  }
  get call_plan() {
    return this.importRates.get("call_plan");
  }
  get gateway() {
    return this.importRates.get("gateway");
  }
  get isGroup() {
    return this.importRates.get("isGroup");
  }
  get booster_for() {
    return this.importRates.get("booster_for");
  }

  openPrediction1() {
    this.text = "...";
    this.basic = true;
    this.advance = false;
  }

  openPrediction2() {
    this.text = "...";
    this.advance = true;
    this.basic = false;
  }

  ngOnInit() {
    let obj = {
      by_name: "",
      by_type: "",
      by_circle: [],
      minute_paln_type: "0",
      by_minute_plan: "",
    };
    this.planType = obj['minute_paln_type']
    this.callplanService.filterCallPlan(obj).subscribe((data) => {
      this.selectedValue = data ? data : [];
      if (this.selectedValue.length > 0 && !this.data)
        this.callPlanRateData.call_plan_id = this.selectedValue[0]["id"];

    });
    this.gatewayService
      .getGateway({ id: null, ip: null, port: null, provider_id: null })
      .subscribe((data) => {
        let datas = data;
        for (let i = 0; i < datas.length; i++) {
          this.allGateway.push({
            id: datas[i].id,
            name:
              datas[i].provider + " - " + datas[i].ip + " " + datas[i].domain,
          });
        }
        // this.allGateway = data ? data : [];
        // this.filterGateway = this.GatewayFilter = this.allGateway.slice();
      });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onWhenAddingFileFailed = (
      item: any,
      filter: any,
      options: any
    ) => {
      this.toastr.error("Error!", invalidFileType, { timeOut: 2000 });
    };

    this.uploader.onCompleteItem = (
      item: any,
      response: string,
      status: any,
      headers: any
    ) => {
      let aaa = JSON.parse(response);
      this.excelValue = aaa.error ? aaa.error : "";
      this.statusCode = aaa ? aaa.status_code : 0;
      // this.showNotInsertedValue = this.excelValue == "Unauthorized" ? true : false;
      imagePath = URL + item.file.name;
    };

    this.uploader.onCompleteAll = () => {
      this.showNotInsertedValue = this.excelValue == "Unauthorized" ? false : true;
      if (this.showNotInsertedValue) {
        this.toastr.success("Success!", importSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
      } else if (this.statusCode == 202) {
        this.toastr.success("something is missing.", "File imported successfully.", { timeOut: 2000 });
        this.cancleDialog();
      } else {
        this.toastr.error("Error!", importUnsuccessfully, { timeOut: 2000 });
      }
      this.callplanService.updateGridList();
    };
    this.callplanService.viewCallRateGroup({}).subscribe((response) => {
      this.callRategroupList = response;
    });
  }
  CallRateremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedValue.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  selectPlan(e) {
    this.importRates.get('booster_for').setValue(e.itemData.booster_for);
  }

  public isChnageMinutePlanType(data) {
    let obj = {
      by_name: "",
      by_type: "",
      by_circle: [],
      minute_paln_type: "",
      by_minute_plan: "",
    };
    setTimeout(() => {
      this.uploader.clearQueue()
    }, 100);
    this.imageSource1 = "";
    this.basic = false;
    // if(data.value == 3){   
    //   this.importRates.controls.booster_for.setValidators(Validators.required);
    //   this.importRates.controls.booster_for.updateValueAndValidity();         
    // }else{
    //   this.importRates.controls.booster_for.clearValidators()
    //   this.importRates.controls.booster_for.updateValueAndValidity();
    //   this.importRates.get('booster_for').setValue('');
    // }
    obj["minute_paln_type"] = this.planType = data.value ? data.value : '0';
    this.callplanService.filterCallPlan(obj).subscribe((data) => {
      this.importRates.controls.call_plan.clearValidators();
      this.importRates.controls.call_plan.updateValueAndValidity();
      this.importRates.get('call_plan').setValue('');
      this.importRates.get('gateway').reset();
      this.selectedValue = data ? data : [];
      if (this.selectedValue.length > 0 && !this.data)
        this.callPlanRateData.call_plan_id = this.selectedValue[0]["id"];
    });
    this.isGroups = false;
    this.importRates.get('isGroup').setValue(false);
    this.group_id.setValue("0");
    this.group_id.clearValidators();
    this.group_id.updateValueAndValidity();
  }

  downloadExcelSample(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };

    worksheet.columns = [
      { header: 'Dial Prefix', key: 'dial_prefix', width: 25 },
      { header: 'Buying Rate', key: 'buying_rate', width: 30 },
      { header: 'Selling Rate', key: 'selling_rate', width: 30 },

    ];

    if (this.planType != '1' && this.planType != '2' && this.planType != '4' && this.planType == '0') {
      const newColumns = [
        { header: 'Area Code', key: 'area_code', width: 30 },
        { header: 'Selling Billing Block', key: 'selling_billing_block', width: 30 },
      ];
      worksheet.columns = [...worksheet.columns, ...newColumns];
    } else {
      worksheet.columns = [...worksheet.columns, { header: 'Talktime Minutes', key: 'talktime_minutes', width: 30 }];
    }

    worksheet.getRow(1).font = {
      bold: true,
    }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
    };

    // worksheet.addRow({
    //   DID_Number: '',
    //   Billing_Type: '',
    //   DID_Group: '',
    //   Provider: '',
    //   Country: '',
    //   Vmn: '',
    //   Max_CC: '',
    //   Connect_charge: '',
    //   Monthly_rate: '',
    //   Selling_rate: ''
    // });

    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });

    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';

    // let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(1));
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'sample_CallRateList');
    });

  }

  advanceFile() {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append("customer_id", this.data["customerId"]); //note comma separating key and value
      form.append("extension_id", this.data["extensionId"]); //note comma separating key and value
      form.append("role", localStorage.getItem("type"));
      form.append("id", null);
      form.append("type", "advanceCallPlanRate");
    };
    // this.cancleDialog();
  }

  advanceFile2() {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append("customer_id", this.data["customerId"]); //note comma separating key and value
      form.append("extension_id", this.data["extensionId"]); //note comma separating key and value
      form.append("role", localStorage.getItem("type"));
      form.append("id", null);
      form.append("type", "basicCallPlanRate");
      form.append("rateValue", Object.values(this.importRates.value));
    };
    // this.cancleDialog();
  }

  public isChnageGroup(data, id?) {
    let isCheck = data.checked;
    if (isCheck) {
      this.isGroups = true
      this.importRates.get('group_id').setValue("");
      this.importRates.get('group_id').setValidators(Validators.required);
      this.importRates.get('group_id').updateValueAndValidity();
      // this.importRates.updateValueAndValidity();
      // if (id) this.onGroupSelect(id);
    } else {
      this.isGroups = false;
      this.group_id.setValue("0");
      this.group_id.clearValidators();
      this.group_id.updateValueAndValidity();
      this.importRates.updateValueAndValidity();
      this.importRates.clearValidators();
      // if (id) this.onGroupSelect(id);
    }
  }

  Groupremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.callRategroupList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Gatewayremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.allGateway.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  onupload() {
    this.advanceFile2();
    this.uploader.queue.forEach(item => item.upload())
  }

  cancleDialog(): void {
    this.dialogRef11.close();
    this.showNotInsertedValue = false;
    this.callplanService.updateGridList();
    // e.preventDefault();
  }
}

//------------------------------------ Add call plan rate ---------------------------------------------------

@Component({
  selector: "callplanrate-dialog",
  templateUrl: "callplanrate-dialog.html",
})
export class CallPlanRateDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  callPlanRatesForm: FormGroup;
  checkForm: any;
  selectedValue: any = [];
  SelectCallFilter;
  filterCallPlan: any;
  callPlanRateData: any = {};
  callplanbind: any = {};
  callplanhere: any = [];
  sessionId = "";
  sellingMinDuration = 0;
  errorField: any;
  dialPrefix = "";
  allGateway = [];
  GatewayFilter: any;
  filterGateway: any;
  defaultSellingBillingBlock = 60;
  userRole = localStorage.getItem("type");
  countryList = [];
  SelectDialFilter: any;
  filterCountry: any;
  areaCode = "";
  phoneCode = "";
  sellingRateError: boolean;
  callRategroupList: any = [];
  GroupFilter: any;
  filterGroup: any;
  menus: any;
  callRateMenu: any;
  callPlan = "";
  talk_minutes = "";
  dialPrefixPromise: any;
  disableType: boolean = false;
  notValid: boolean = false;
  edit: boolean = true;
  groupMinutes: boolean = true;
  public fields: Object = { text: "name", value: "id" };
  public fields1: Object = { text: "name", value: "id" };
  public fields2: Object = { text: "gmtzone", value: "id" };
  public fields3: Object = { text: "first_name", value: "id" };
  public fields9: Object = { text: "name", value: "id" };
  public popupHeight: string = "200px";
  public popupWidth: string = "200px";
  public placeholder: string = "Select Dial Prefix";
  public placeholder8: string = "Select Country";
  public placeholder1: string = "Gateway";
  public placeholder2: string = "Group Name";
  public placeholder3: string = "Select Call Plan";
  public placeholder4: string = "Select Dialout Group";
  public placeholder5: string = "Select Circle Name";
  public placeholder6: string = "Select PBX Package";
  public placeholder7: string = "Select OC Package";
  readOnly: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<CallPlanRateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private gatewayService: GatewayService
  ) {
    this.callPlanRatesForm = this.fb.group({
      plan_type: ["0", Validators.required],
      call_plan: ["", Validators.required],
      dial_prefix: [""],
      buying_rate: [
        "",
        [Validators.required, Validators.maxLength(5), Validators.minLength(1)],
      ],
      selling_rate: [
        "",
        [Validators.required, Validators.maxLength(5), Validators.minLength(1)],
      ],
      selling_min_duration: [
        "0",
        [Validators.max(60), Validators.maxLength(2)],
      ],
      selling_billing_block: [
        60,
        [Validators.maxLength(3), Validators.minLength(1), Validators.min(1)],
      ],
      gateway: ["", Validators.required],
      area_code: ["", Validators.pattern(Number_Not_Start_Zero_RegEx)],
      phonecode: ["", [Validators.required]],
      isGroup: [false],
      group_id: [""],
      talktime_minutes: ["", Validators.pattern(Number_Not_Start_Zero_RegEx)],
      booster_for: [""],
    });
  }

  get call_plan() {
    return this.callPlanRatesForm.get("call_plan");
  }
  get dial_prefix() {
    return this.callPlanRatesForm.get("dial_prefix");
  }
  get buying_rate() {
    return this.callPlanRatesForm.get("buying_rate");
  }
  get selling_rate() {
    return this.callPlanRatesForm.get("selling_rate");
  }
  get selling_min_duration() {
    return this.callPlanRatesForm.get("selling_min_duration");
  }
  get selling_billing_block() {
    return this.callPlanRatesForm.get("selling_billing_block");
  }
  get gateway() {
    return this.callPlanRatesForm.get("gateway");
  }
  get area_code() {
    return this.callPlanRatesForm.get("area_code");
  }
  get isGroup() {
    return this.callPlanRatesForm.get("isGroup");
  }
  get group_id() {
    return this.callPlanRatesForm.get("group_id");
  }
  get talktime_minutes() {
    return this.callPlanRatesForm.get("talktime_minutes");
  }
  get plan_type() {
    return this.callPlanRatesForm.get("plan_type");
  }
  get booster_for() {
    return this.callPlanRatesForm.get("booster_for");
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.callPlanRatesForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
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

    this.menus = JSON.parse(localStorage.getItem("menu"));
    this.callRateMenu = this.menus.find((o) => o.url == "/callPlan/view");

    if (this.callRateMenu.all_permission == '0' && this.callRateMenu.view_permission == '1') {
      this.callPlanRatesForm.disable();
    }



    this.sessionId = this.route.snapshot.queryParams.id;
    let obj = {
      by_name: "",
      by_type: "",
      by_circle: [],
      minute_paln_type: "0",
      by_minute_plan: "",
    };
    if (this.data) {
      this.disableType = true;
      obj['minute_paln_type'] = this.data.plan_type;
    }
    this.isChnageMinutePlanType({ value: this.data ? this.data.plan_type : this.data });
    this.callplanService.filterCallPlan(obj).subscribe((data) => {
      this.selectedValue = data ? data : [];

      this.filterCallPlan = this.SelectCallFilter = this.selectedValue.slice();
      if (this.selectedValue.length > 0 && !this.data)
        this.callPlanRateData.call_plan_id = this.selectedValue[0]["id"];
      this.customerOnInIt();
    });
    this.callplanService.getCountryList().subscribe((data) => {
      this.countryList = data.response ? data.response : [];
      this.filterCountry = this.SelectDialFilter = this.countryList.slice();
      if (this.countryList.length > 0 && !this.data)
        this.phoneCode = this.countryList[0]["id"];
      this.filterCountry = this.SelectDialFilter = this.countryList.slice();
    });

    this.callPlanRatesForm
      .get("selling_rate")
      .setValidators(this.greaterThan("buying_rate"));
    this.callPlanRatesForm.valueChanges.subscribe(() => {
      if (this.callPlanRatesForm.get("selling_rate").hasError("lessThan")) {
        this.sellingRateError = true;
      } else {
        this.sellingRateError = false;
      }
    });

    this.gatewayService
      .getGateway({ id: null, ip: null, port: null, provider_id: null })
      .subscribe((data) => {
        let datas = data;
        for (let i = 0; i < datas.length; i++) {
          this.allGateway.push({
            id: datas[i].id,
            name:
              datas[i].provider + " - " + datas[i].ip + " " + datas[i].domain,
          });
        }
        // this.allGateway = data ? data : [];
        // this.filterGateway = this.GatewayFilter = this.allGateway.slice();
      });
  }

  customerOnInIt() {
    this.callplanService.viewCallRateGroup({}).subscribe((response) => {
      this.callRategroupList = response;
      this.filterGroup = this.GroupFilter = this.callRategroupList.slice();
      if (this.data) {
        this.callplanService
          .viewCallPlanRate({ id: this.data.id, dial_prefix: null })
          .subscribe((data) => {
            if (
              (data[0]["call_plan"] !== null,
                data[0]["nicename"] !== null,
                data[0]["ip_info"] !== null)
            ) {
              this.readOnly = true;
            } else {
              this.readOnly = false;
            }
            // let promise = new Promise((resolve, reject) => {
            //   setTimeout(() => {
            // resolve(data[0].call_plan_id);
            //   }, 200);
            // });
            // promise.then((result) => {
            // this.callPlanRatesForm
            //   .get("call_plan")
            //   .setValue(Number(data[0].call_plan_id));
            // });
            setTimeout(() => {

              this.callplanbind = (data[0]['call_plan_id']);
              // this.callplanhere = (data[0]['call_plan']);
            }, 500);
            setTimeout(() => {
              this.callPlanRateData = data[0];
              this.dialPrefix = this.callPlanRateData.dPRefix;
              this.areaCode = this.callPlanRateData.area_code;
              this.phoneCode = this.callPlanRateData.phonecode;
              this.callPlanRateData.is_group =
                this.callPlanRateData.is_group == "1" ? true : false;
              if (this.callPlanRateData.is_group) {
                this.isChnageGroup(
                  { checked: true },
                  this.callPlanRateData.group_id
                );
              }
              this.sellingMinDuration =
                data[0].selling_min_duration != "0"
                  ? data[0].selling_min_duration
                  : "0";
              this.defaultSellingBillingBlock = data[0].selling_billing_block;
            }, 1000);

            this.talk_minutes = data[0].talktime_minutes

            this.callplanService.checkRatesAssociated(data[0].call_plan_id).subscribe(data => {


              if (data.length > 0) {
                this.edit = false;
              } else {
                this.edit = true;
              }

            })
            // let obj = {
            //   by_name: "",
            //   by_type: "",
            //   by_circle: [],
            //   minute_paln_type: this.callPlanRateData.plan_type,
            //   by_minute_plan: ''
            // };
            // this.callplanService.filterCallPlan(obj).subscribe(data => {
            //   this.selectedValue = data ? data : [];
            //   this.filterCallPlan = this.SelectCallFilter = this.selectedValue.slice();
            //   if (this.selectedValue.length > 0 && (!this.data['id'])) this.callPlanRateData.call_plan_id = this.selectedValue[0]['id']
            // });
          });
      } else {
        this.callPlanRateData.plan_type = "0";
      }
    });
  }

  Groupremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.callRategroupList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Gatewayremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.allGateway.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  CallRateremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.selectedValue.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  minuteCheck(e) {
    let minutes = this.callPlanRatesForm.get('talktime_minutes').value;
    if (this.data) {
      if (minutes < this.talk_minutes) {
        this.notValid = true;
        this.toastr.error(
          "Error!",
          "Can't Decrease Talktime Mintues",
          { timeOut: 4000 }
        );
      } else {
        this.notValid = false;
      }
    }
  }

  submitcallPlanRate() {
    "lol"
    let plan = this.callPlanRatesForm.get("plan_type").value;
    if (plan != 0) {
      let val = this.callPlanRatesForm.get("talktime_minutes").value;
      if (val == 0 || val == null) {
        this.toastr.error("Error!", `Talktime minutes cannot be null`, {
          timeOut: 4000,
        });
        return;
      }
    }

    //this.checkForm = this.findInvalidControls();
    if (
      Number(this.callPlanRatesForm.get("selling_rate").value) <
      Number(this.callPlanRatesForm.get("buying_rate").value)
    ) {
      this.toastr.error(
        "Error!",
        "Selling rate should be greater than buying rate!!",
        { timeOut: 4000 }
      );
      return;
    }
    if (
      Number(this.callPlanRatesForm.get("selling_billing_block").value) <
      Number(this.callPlanRatesForm.get("selling_min_duration").value)
    ) {
      this.toastr.error(
        "Error!",
        "Selling Min Duration should be less than or equal to  Selling Billing Block!",
        { timeOut: 4000 }
      );
      return;
    }
    if (this.callPlanRatesForm.valid) {

      this.submitted = true;
      this.errors = { errors: {} };
      this.callPlanRatesForm
        .get("dial_prefix")
        .setValue(
          this.getCountryDialPrefix(
            this.callPlanRatesForm.get("phonecode").value
          ) +
          "" +
          this.callPlanRatesForm.get("area_code").value
        );
      const credentials = this.callPlanRatesForm.value;
      if (this.data) {
        credentials['id'] = this.data.id ? this.data.id : null;
      } else {
        credentials['id'] = null;
      }
      credentials["prefix"] = "+";
      credentials.area_code = Number(this.callPlanRatesForm.value.area_code);
      credentials.buying_rate = Number(this.callPlanRatesForm.value.buying_rate);
      credentials.selling_min_duration = Number(this.callPlanRatesForm.value.selling_min_duration);
      credentials.selling_rate = Number(this.callPlanRatesForm.value.selling_rate);

      

      this.callplanService
        .checkUniqueGatewayPrefix(credentials)
        .subscribe((data) => {
          if (data.id != "") {
            this.toastr.error(
              "Error!",
              "Dial Prefix is already exist with selected gateway!!",
              { timeOut: 4000 }
            );
            this.dialPrefix = "";
            return;
          } else {
            this.callplanService
              .checkUniqueCallGroup(credentials)
              .subscribe((data) => {
                if (data.id != "") {
                  this.toastr.error(
                    "Error!",
                    "Call Rate Group is already exist with selected dial Prefix!!",
                    { timeOut: 4000 }
                  );
                  this.callPlanRateData.group_id = "";
                  return;
                } else {
                  credentials["call_plan_name"] = this.selectedValue.filter(item => item.id == credentials.call_plan).length ? this.selectedValue.filter(item => item.id == credentials.call_plan)[0]['name'] : [];
                  credentials["country_name"] = this.countryList.filter(item => item.id == credentials.phonecode).length ? this.countryList.filter(item => item.id == credentials.phonecode)[0]['name'] : [];
                  credentials['gateway_name'] = this.allGateway.filter(item => item.id == credentials.gateway).length ? this.allGateway.filter(item => item.id == credentials.gateway)[0]['name'] : [];
                  credentials['group_name'] = this.callRategroupList.filter(item => item.id = credentials.group_id).length ? this.callRategroupList.filter(item => item.id = credentials.group_id)[0]['name'] : [];
                  console.log(credentials);
                  this.callplanService
                    .createCallPlanRate("createCallPlanRate", credentials)
                    .subscribe((data) => {
                      if (data["code"] == 200) {
                        this.toastr.success("Success!", data["message"], {
                          timeOut: 2000,
                        });
                        this.cancelForm();
                      } else {
                        this.toastr.error("Error!", data["message"], {
                          timeOut: 2000,
                        });
                      }
                    });
                }
              });
          }
        });
    }
  }

  getCountryDialPrefix(id) {
    let prefix = "";
    let countryObj = this.countryList.filter((item) => {
      if (item.id == id) {
        return item;
      }
    });
    this.filterCountry = this.SelectDialFilter = this.countryList.slice();

    return (prefix = countryObj[0]["phonecode"]);
  }

  cancelForm() {
    this.callPlanRatesForm.reset();
    this.callplanService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public compareToBuying(sellingRate) {
    // let buyingRate = this.callPlanRatesForm.get('buying_rate').value;
    // if(buyingRate > sellingRate){

    // }else{
    //   return;
    // }
    this.callPlanRatesForm.get("selling_rate").hasError("lessThan");
  }

  public greaterThan(field: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const group = control.parent;
      const fieldToCompare = group.get(field);
      const isLessThan = Number(fieldToCompare.value) > Number(control.value);
      return isLessThan ? { lessThan: { value: control.value } } : null;
    };
  }

  public onGroupSelect(id) {
    let talktimeMinutes = this.callRategroupList.filter(
      (item) => item.id === id
    );
    this.callPlanRateData.talktime_minutes = talktimeMinutes[0]["minutes"];
  }

  public isChnageGroup(data, id?) {
    let isCheck = data.checked;
    if (isCheck) {
      // this.area_code.disable();

      this.area_code.setValue("");
      this.groupMinutes = false;
      this.area_code.updateValueAndValidity();
      // this.talktime_minutes.disable();
      this.talktime_minutes.setValue("0");
      this.talktime_minutes.updateValueAndValidity();
      this.group_id.setValue("0");
      this.group_id.setValidators(Validators.required);
      this.group_id.updateValueAndValidity();
      this.callPlanRatesForm.updateValueAndValidity();
      if (id) this.onGroupSelect(id);
    } else {
      // this.isGroup.disable();
      // this.area_code.enable();
      this.groupMinutes = true;
      this.area_code.setValue("");
      this.area_code.updateValueAndValidity();
      this.talktime_minutes.enable();
      this.talktime_minutes.setValue("");
      this.talktime_minutes.updateValueAndValidity();
      this.group_id.setValue("0");
      this.group_id.clearValidators();
      this.group_id.updateValueAndValidity();
      this.callPlanRatesForm.updateValueAndValidity();
      this.callPlanRatesForm.clearValidators();
      if (id) this.onGroupSelect(id);
    }
  }

  // public noZero(e){
  //   if(e.key == 0){

  //  }

  // }

  public checkBillingBlockValue(selling_min_duration_value) {
    let selling_billing_block_value = this.callPlanRatesForm.get(
      "selling_billing_block"
    ).value;

    if (selling_min_duration_value > selling_billing_block_value) {
      this.toastr.error(
        "Error!",
        "Selling Min Duration should be less than or equal to  Selling Billing Block!",
        { timeOut: 4000 }
      );
      this.callPlanRatesForm.get("selling_min_duration").setValue("0");
    }
  }

  public isChnageMinutePlanType(data) {
    this.callPlanRatesForm.get('call_plan').reset();
    let obj = {
      by_name: "",
      by_type: "",
      by_circle: [],
      minute_paln_type: "",
      by_minute_plan: "",
    };
    obj["minute_paln_type"] = data.value ? data.value : '0';
    this.callplanService.filterCallPlan(obj).subscribe((data) => {
      this.selectedValue = data ? data : [];
      this.filterCallPlan = this.SelectCallFilter = this.selectedValue.slice();
      if (this.selectedValue.length > 0 && !this.data)
        this.callPlanRateData.call_plan_id = this.selectedValue[0]["id"];
    });
  }

  public changeCallPlan(data) {
    if (!this.plan_type.value) {
      this.toastr.error("Error!", "Please select Plan Type First", {
        timeOut: 2000,
      });
      return;
    }
    if (data === "3") {
      this.callPlanRatesForm.get('isGroup').reset();
      this.callPlanRatesForm.get('isGroup').updateValueAndValidity();
      // this.booster_for.setValidators();
      this.group_id.setValue("0");
      this.area_code.setValue("");
      this.talktime_minutes.setValue("");
      this.talktime_minutes.updateValueAndValidity();
      this.area_code.updateValueAndValidity();
      this.booster_for.updateValueAndValidity();
      this.talktime_minutes.enable();
      // this.area_code.updateValueAndValidity();
      this.callPlanRatesForm.updateValueAndValidity();
    } else {
      // this.isGroup.disable();
      this.talktime_minutes.setValue("");
      // this.talktime_minutes.clearValidators();
      // this.talktime_minutes.updateValueAndValidity();

      this.area_code.setValue("");
      // this.area_code.clearValidators();
      this.area_code.updateValueAndValidity();
      this.booster_for.setValue("");
      this.booster_for.clearValidators();
      this.booster_for.updateValueAndValidity();
      this.callPlanRatesForm.updateValueAndValidity();
      this.isGroup.setValue("");
      this.isGroup.updateValueAndValidity();
      this.group_id.setValue("0");
      // this.group_id.clearValidators();
    }

    //  this.getCallPlanBytype(data);
    // this.call_plan.setValue('');
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
  get UserTypeAccountManager() {
    return UserTypeConstants.ACCOUNT_MANAGER;
  }
  get UserTypeSupportManager() {
    return UserTypeConstants.SUPPORT_MANAGER;
  }
}
@Component({
  selector: "managegateway-dialog",
  templateUrl: "managegateway-dialog.html",
})
export class ManageGatewaydialog {
  public mode = "CheckBox";
  public selectAllText: string = "Select All";
  public fields: Object = { text: "name", value: "id" };
  public placeholder: string = "Select Gateway";
  public popupHeight: string = "200px";
  public popupWidth: string = "250px";
  dataSource: any = [];
  gateway_new: any;
  gateway_old: any;
  constructor(
    public dialogRefInfo: MatDialogRef<ManageGatewaydialog>,
    @Inject(MAT_DIALOG_DATA) public data: ManageGatewaydialog,
    private gatewayService: GatewayService,
    private callplanService: CallplanService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    const element = document.querySelector("#scrollId");
    element.scrollIntoView();
    this.dataSource = [];
    let arrMap;
    this.gatewayService
      .getGateway({ id: null, ip: null, port: null, provider_id: null })
      .subscribe((data) => {
        arrMap = data.map((item) => {
          this.dataSource.push({
            id: item["id"],
            name: item["ip"],
            provider: item["provider"],
            domain: item["domain"],
          });
        });
      });
  }
  gatewaySelectNew(event) {
    this.gateway_new = event.value;
  }
  gatewaySelect(event) {
    this.gateway_old = event.value;
  }
  Submit() {
    let n_id = this.gateway_new;
    let o_id = this.gateway_old;
    if (n_id == o_id) {
      this.toastr.error("Error!", "Same Gateway at the both end.", {
        timeOut: 2000,
      });
    } else {
      this.callplanService.UpdateGateway(o_id, n_id).subscribe((data) => {
        if (data.status_code == 200) {
          this.toastr.success("Success!", "Gateway Updated Successfully.", {
            timeOut: 2000,
          });
          this.cancleDialog();
        } else {
          this.toastr.error("Error!", "Something wrong!", { timeOut: 2000 });
        }
      });
    }
    this.gateway_new.reset();
  }
  cancleDialog(): void {
    this.callplanService.updateGridList();
    this.dialogRefInfo.close();
  }
}
