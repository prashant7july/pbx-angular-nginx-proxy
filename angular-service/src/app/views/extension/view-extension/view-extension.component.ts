import { Component, OnInit, Inject } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { PagedData, Page, AllExtension } from "../../../core/models";
import Swal from "sweetalert2";
import {
  Errors,
  ExtensionService,
  ExcelService,
  CommonService,
  GatewayService,
  checkExtensionLimit,
  importSuccessfully,
  importUnsuccessfully,
  invalidFileType,
} from "../../../core";
import * as jsPDF from "jspdf";
import "jspdf-autotable";
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as FileSaver from "file-saver";
import { ProfileService } from "../../profile/profile.service";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import {
  CheckBoxSelectionService,
  FilteringEventArgs,
} from "@syncfusion/ej2-angular-dropdowns";
import { UserTypeConstants } from "src/app/core/constants/userType.constant";
import { UserService as userServicee } from "src/app/core/services/user.service";
import { toObjectLowerCase } from "@syncfusion/ej2-angular-richtexteditor";
import { UserService } from "../../user/user.service";
import { CallForwardService } from "../../call-forward/call-forward.service";
import { PackageService } from "../../package/package.service";
import { CallplanService } from "../../call-plan/callplan.service";
import {
  FileUploader,
  FileSelectDirective,
  FileItem,
} from "ng2-file-upload/ng2-file-upload";
import { environment } from "../../../../environments/environment.prod";
import { CustomerDialoutServiceService } from "../../customer-dialoutRule/customer-dialout-service.service";
import { CallgroupService } from "../../call-group/call-group.service";
import { log } from "console";

export var productId = "1";

declare const ExcelJS: any;

const URL = environment.api_url + "uploadCsv/";
// const URL = 'http://localhost:3000'+ '/uploadCsv';

@Component({
  selector: "app-view-extension",
  templateUrl: "./view-extension.component.html",
  styleUrls: ["./view-extension.component.css"],
})
export class ViewExtensionComponent implements OnInit {
  errors: Errors = { errors: {} };
  error = "";
  filterForm: FormGroup;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  userRole = "";
  exportData: any = {};
  defaultPageSize = "10";
  billing_type = "";
  isWithOutPool = false;
  billing_name = "";
  plugin: any;
  isPlugIn: boolean = false;
  manageMinutes: boolean = false;
  // customerStatus = "2";
  activeExtension = false;
  inactiveExtension = false;
  totalUserExtension: any;
  assigned_minute_balance: number = 0;
  pkg_minute_balance: number;
  minute_balance: number;
  allowExtensionLimit: any;
  role = false;
  status: any = "";
  intercomList : any = [];

  checkcondition: boolean = false;
  isRoaming: boolean = true;

  constructor(
    private router: Router,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog,
    private userServicee: userServicee,
    private toastr: ToastrService,
    private profileService: ProfileService,
    private UserService: UserService,
    private callForwardService: CallForwardService,
    private packageService: PackageService,
    private customerDialoutService : CustomerDialoutServiceService

  ) {
    this.filterForm = this.formBuilder.group({
      by_username: [""],
      //'by_external_callerId': [""],
      by_number: [""],
      by_roaming: [""],
    });
  }

  ngOnInit() {
    this.extensionService
      .getroaming(localStorage.getItem("id"))
      .subscribe((data) => {
        if (data.response[0]["is_roaming_type"] == 0) {
          this.isRoaming = false;
        } else {
          this.isRoaming = true;
        }
      });
    this.extensionService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
    let user_id = localStorage.getItem("id");
    this.extensionService
      .getMyExtensionLimit(user_id, localStorage.getItem("type"))
      .subscribe((data) => {
        this.billing_type = data.ext.billing_type;
        // this.extensionService.displaySavedRecord.subscribe(() => {
        //   this.displayAllRecord();
        // });
        if (this.billing_type == "3") {
          this.isWithOutPool = true;
          this.billing_name = "Enterprise without pool";
        }
      });

    this.extensionService
      .getMyExtensionLimit(user_id, localStorage.getItem("type"))
      .subscribe((data) => {
        this.pkg_minute_balance = data.ext.minute_balance;
        this.billing_type = data.ext.billing_type;
        this.allowExtensionLimit = data.ext.extension_limit;
      });

    this.extensionService.getMyExtension(user_id).subscribe((data) => {
      let minute = 0;
      this.totalUserExtension = data.response.length;
      for (let i = 0; i < this.totalUserExtension; i++) {
        this.assigned_minute_balance =
          this.assigned_minute_balance +
          parseFloat(data.response[i].total_min_bal);
      }
      this.minute_balance =
        this.pkg_minute_balance - this.assigned_minute_balance;
    });
  }

  displayAllRecord() {
    var user_id = localStorage.getItem("id");
    this.userRole = localStorage.getItem("type");
    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 10 },
      { field: "id", headerName: "ID", hide: true, width: 10 },
      { field: "ext_number", headerName: "Number", hide: false, width: 10 },
      { field: "username", headerName: "Ext. Name", hide: false, width: 10 },
      {
        field: "caller_id_name",
        headerName: "Caller ID Name",
        hide: false,
        width: 10,
      },
      // { field: 'external_caller_id', headerName: 'External Caller ID', hide: false, width: 10 },
      { field: "email", headerName: "Email", hide: false, width: 10 },
      // { field: 'codec', headerName: 'Codec', hide: false, width: 10 },
      // { field: 'total_min_bal', headerName: 'Minutes', hide: (this.billing_type == '1') ? true:false, width: 10 },
    ];

    this.packageService
      .getPbxFeatures(Number(localStorage.getItem("id")), Number(productId))
      .subscribe((packageData) => {
        if (
          packageData["response"][0].out_bundle_type == "1" &&
          packageData["response"][0].minute_plan == 1
        ) {
          this.manageMinutes = true;
        } else {
          this.manageMinutes = false;
        }
      });

    this.profileService
      .getUserInfo("getUserInfo", Number(localStorage.getItem("id")))
      .subscribe(
        async (data) => {                    
          if (data) {
            let userData = data.response[0];
            console.log(userData,"--userdata--");
            
            this.isPlugIn = userData["plugin"] == "Y" ? true : false;
          }
          this.customInit();
        },
        (err) => {
          this.errors = err.message;
        }
      );
  }

  customInit() {
    var user_id = localStorage.getItem("id");

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.user_id = Number(user_id);
      credentials.by_roaming = Number(credentials.by_roaming);
      credentials.by_number = Number(credentials.by_number);
      this.extensionService
        .filterExtension(credentials)
        .subscribe((pagedData) => {
          this.exportData = pagedData;
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: pagedData });
        });
    } else if (this.isPlugIn == true) {
      this.extensionService
        .getAllExtensionsForCustomer(user_id)
        .subscribe((pagedData) => {
          this.exportData = pagedData.response;

          pagedData = this.manageUserActionBtn(pagedData.response);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: pagedData });
        });
    } else {
      this.extensionService
        .getExtensionWithPlugin(user_id)
        .subscribe((pagedData) => {
          this.exportData = pagedData;
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: pagedData });
        });
    }

    this.customerDialoutService.getIntercomByCustomer(localStorage.getItem('id')).subscribe(data=>{
      this.intercomList = data;
      this.intercomList.unshift({name:'All', id: 0})
    })
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
      pageSetup: { paperSize: 8, orientation: "landscape" },
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
      { header: "Number", key: "Number", width: 15 },
      { header: "Ext Name", key: "ExtName", width: 20 },
      { header: "Caller ID Name", key: "CallerIDName", width: 20 },
      //{ header: 'External Caller ID', key: 'ExternalCallerID', width: 20 },
      { header: "Email", key: "Email", width: 30 },
      { header: "Codec", key: "Codec", width: 40 },
    ];

    //if(this.billing_type == '1') worksheet.columns.push({ header: 'Minutes', key: 'Minutes', width: 30 });

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
        Number: this.exportData[i].ext_number,
        ExtName: this.exportData[i].username,
        CallerIDName: this.exportData[i].caller_id_name,
        Email: this.exportData[i].email,
        Codec: this.exportData[i].codec,
      });
      // if(this.billing_type == '1') worksheet.addRow({Minutes: this.exportData[i].total_min_bal })
    }
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });
    // worksheet.eachRow(function (row, _rowNumber) {
    //   row.eachCell(function (cell, _colNumber) {
    //     cell.border = {
    //       top: { style: 'thin', color: { argb: '000000' } },
    //       left: { style: 'thin', color: { argb: '000000' } },
    //       bottom: { style: 'thin', color: { argb: '000000' } },
    //       right: { style: 'thin', color: { argb: '000000' } }
    //     };
    //   });
    // });
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = "1:2";
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, "extension");
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Number", "Ext Name", "Caller ID Name", "Email", "Codec"];
    if (this.billing_type == "1") col.push("Minutes");
    var rows = [];
    this.exportData.forEach((element) => {
      const e11 = [
        element.ext_number,
        element.username,
        element.caller_id_name,
        element.email,
        element.codec,
        element.total_min_bal,
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
      },
    });
    doc.save("extension.pdf");
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = "";
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn +=
        "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      if (pagedData[i]["flag"] == 1) {
        finalBtn +=
          "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='destination-info' title='Info'></i>";
      }
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-user login-button' style='cursor:pointer; display:inline' data-action-type='login'  title='login'></i>";
      finalBtn += "</span>";
      if (this.manageMinutes == true) {
        finalBtn += "<span>";
        finalBtn +=
          "<i class='fa fa-minus-circle remove-button' style='cursor:pointer; display:inline' data-action-type='remove_minutes' title='Remove Minute'></i>";
        finalBtn += "</span>";
      }
      if (pagedData[i].status == "1") {
        finalBtn +=
          "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>";
      } else if (pagedData[i].status == "0") {
        finalBtn +=
          "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'</i>";
      }

      pagedData[i]["action"] = finalBtn;
    }
    return pagedData;
  }
  editExtension(data) {
    this.router.navigate(["user/extension/view/manage"], {
      queryParams: {
        id: data.id,
        customer_id: data.customer_id,
        action: "viewList",
        intercomList: JSON.stringify(this.intercomList) 
      },
    });
  }

  deleteExtension(event) {
    this.extensionService
      .getExtensionCount(event.id, event.ext_number)
      .subscribe((data) => {
        if (data.extension_count > 0) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Oopss...</span>',
            html:
              "<span style='color:#FFFFFF;'> Extension </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              event.ext_number +
              " </span><span style='color:#FFFFFF'> can't be deleted because </span> <span style='color:#FFFFFf;'> it is associate with either DID Destination or Features.</span>",
            type: "error",
            background: "#000000",
            timer: 5000,
          });
        } else {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Are you sure?</span>',
            html:
              "<span style='color:#FFFFFF;'>You will not be able to recover Extension </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              event.ext_number +
              "</span><span style='color:#FFFFFF;'>  in future!</span>",
            type: "warning",
            showCancelButton: true,
            background: "#000000",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, keep it",
            preConfirm: () => {
              this.extensionService.deleteExtension(event.id).subscribe(
                (data) => {
                  this.displayAllRecord();
                },
                (err) => {
                  // this.toastr.error('Error!', err.message, { timeOut: 2000 });
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
                  "<span style='color:#FFFFFF;'> Extension </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
                  event.ext_number +
                  "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
                type: "success",
                background: "#000000",
                timer: 3000,
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              Swal.fire({
                title: '<span style="color:#FFFFFF;">Cancelled</span>',
                html:
                  "<span style='color:#FFFFFF;'> Extension </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
                  event.ext_number +
                  "</span> <span style='color:#FFFFFF;'> is safe.</span>",
                type: "error",
                background: "#000000",
                timer: 3000,
              });
            }
          });
        }
      });
  }

  deleteextension(data, action) {
    if (action == "inactive") {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html:
          "<span style='color:#FFFFFF;'>You can re-activate account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
          data.ext_number +
          "</span> <span style='color:#FFFFFF;'>  in future!</span>",
        type: "warning",
        showCancelButton: true,
        background: "#000000",
        confirmButtonText: "Yes, inactive it!",
        cancelButtonText: "No, keep it",
        preConfirm: () => {
          this.extensionService
            .deleteextension({
              action: action,
              Number: data.ext_number,
              email: data.email,
              id: data.id,
              role: data.role,
            })
            .subscribe((data) => {
              this.displayAllRecord();
            });
        },
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Inactivated!</span>',
            html:
              "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.ext_number +
              "</span> <span style='color:#FFFFFF;'> has been inactivated.</span>",
            type: "success",
            background: "#000000",
            timer: 3000,
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html:
              "<span style='color:#FFFFFF;'>account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.ext_number +
              "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: "error",
            background: "#000000",
            timer: 3000,
          });
        }
      });
    } else {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html:
          "<span style='color:#FFFFFF;'>You can inactivate account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
          data.ext_number +
          "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: "warning",
        showCancelButton: true,
        background: "#000000",
        confirmButtonText: "Yes, active it!",
        cancelButtonText: "No, keep it",
        preConfirm: () => {
          this.extensionService
            .deleteextension({
              action: action,
              Number: data.ext_number,
              email: data.email,
              id: data.id,
              role: data.role,
            })
            .subscribe((data) => {
              this.displayAllRecord();
            });
        },
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Activated!</span>',
            html:
              "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.ext_number +
              "</span> <span style='color:#FFFFFF;'> has been activated.</span>",
            type: "success",
            background: "#000000",
            timer: 3000,
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html:
              "<span style='color:#FFFFFF;'>Account </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.ext_number +
              "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: "error",
            background: "#000000",
            timer: 3000,
          });
        }
      });
    }
  }

  public bulkExtUpdate() {
    const extDialogRefInfo = this.dialog.open(BulkExtUpdateDialog, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: {
        customerId:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
      },
    });
    extDialogRefInfo.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        extDialogRefInfo.close("Dialog closed");
      }
    });
    extDialogRefInfo.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }

  public submitAdvanceService() {
    const extDialogRefInfo = this.dialog.open(BulkExtDeleteDialog, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: {
        customerId:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
      },
    });
    extDialogRefInfo.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        extDialogRefInfo.close("Dialog closed");
      }
    });
    extDialogRefInfo.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    //alert(actionType);
    switch (actionType) {
      case "edit":
        return this.editExtension(data);
      case "delete":
        return this.deleteExtension(data);
      case "destination-info":
        return this.showMappedExtension(data);
      case "active":
        return this.deleteextension(data, actionType);
      case "inactive":
        return this.deleteextension(data, actionType);
      case "login": {
        // this.extensionService.getExtensionById(data.id).subscribe( async parseData =>{
        // this.status = await parseData.response[0].status;
        // });
        // setTimeout(() => {
        // }, 500);
        let role = localStorage.getItem("type");
        //for extention login for customer.....>>>>>>>>
        var user_id = data.ext_number;
        var pass = data.password;
        let body = {
          ip: "null",
          username: user_id,
          password: pass,
          loginType: "byAdmin",
          role: role,
          flag: "1",
        };

        // if(role == '1'){
        //   body['flag'] = 1;
        // }
        // else{
        //   body['flag'] = 0;
        // }
        //signout api
        let admin = localStorage.getItem("ByAdmin")
          ? localStorage.getItem("ByAdmin")
          : "0";

        if (admin == "1") {
          body["adminLogin"] = "1";
        }

        if (localStorage.getItem("subAdminId")) {
          body["subAdminId"] = localStorage.getItem("subAdminId");
        }

        if (localStorage.getItem("resellerId")) {
          body["resellerId"] = localStorage.getItem("resellerId");
        }
        this.userServicee.attemptAuth(body).subscribe((data) => {
          if (data["code"] == 200) {
            this.userServicee.purgeAuth();
            let ip = localStorage.getItem("ip");
            window.localStorage.clear();
            localStorage.setItem("ip", ip);
            this.dialog.closeAll();
            this.userServicee.setAuth(data);
            this.toastr.success("Success!", "Login Successfully!", {
              timeOut: 2000,
            });
            if (body["adminLogin"]) {
              localStorage.setItem("ByAdmin", "1");
              localStorage.setItem("ByCustomer", "1");
            } else {
              localStorage.setItem("ByCustomer", "1");
            }

            if (body["subAdminId"]) {
              localStorage.setItem("subAdminId", body["subAdminId"]);
            }

            if (body["resellerId"]) {
              localStorage.setItem("resellerId", body["resellerId"]);
            }
            let menuList = JSON.parse(localStorage.getItem("menu"));
            let newV = menuList.find((e) => {
              return e.menuname === "Dashboard";
            });
            setTimeout(() => {
              // this.router.navigateByUrl(newV.url);
              //redirect to any page
              window.location.href = newV.url;
            }, 500);
          }
          // refresh
        });
        break;
      }
      case "remove_minutes":
        return this.removeExtension(data);
    }
  }

  removeExtension(data) {
    const dialogRefInfo = this.dialog.open(removeExtensionMinute, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: {
        customerId:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
        id: data.id,
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

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  goToCreate(keyword) {
    let remianExtension: any;
    let mykeyword = keyword.target.value;
    let user_id = localStorage.getItem("id");
    let finalKey = user_id + "" + mykeyword;
    //check extension limit

    remianExtension =
      parseInt(this.allowExtensionLimit) - parseInt(this.totalUserExtension);
    if (remianExtension == "0") {
      this.toastr.error("Error!", checkExtensionLimit + remianExtension + ")", {
        timeOut: 4000,
      });
      keyword.target.value = "";
      // this.extensionForm.controls.extension_number.setValue('');
      return false;
    } else {
      this.router.navigate(["user/extension/view/create"]);
    }
    // this.router.navigate(['user/extension/create']);
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoExtensionDialog, {
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

  showMappedExtension(data) {
    this.router.navigate(["/user/extension/view/mapped-destination"], {
      queryParams: { ext_number: data.ext_number, ext_name: data.username },
    }); //{ queryParams: { ext_number: data.ext_number, pId: data.id, pName: data.name } }
  }

  assignMinuteDialog() {
    this.router.navigate(["user/extension/view/minute-manage"]);
    // const dialogRefInfo = this.dialog.open(ManageMinuteDialog, {
    //   width: '80%', disableClose: true, autoFocus: false,
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

  public deductMinuteDialog() {
    this.router.navigate(["user/extension/view/minute-deduct"]);
  }

  importFile() {
    const dialogRef11 = this.dialog.open(importExtensionDialog, {
      width: "60%",
      disableClose: true,
      data: {
        customerId:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
        extensionId:
          localStorage.getItem("type") == "6" ? localStorage.getItem("id") : 0,
      },
    });
    dialogRef11.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef11.close("Dialog closed");
      }
    });
    dialogRef11.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }
}

@Component({
  selector: "infoExtension-dialog",
  templateUrl: "infoExtension-dialog.html",
})
export class InfoExtensionDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoExtensionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ""
  ) {}

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

@Component({
  selector: "manageMinute-dialog",
  templateUrl: "manageMinute-dialog.html",
  styleUrls: ["./view-extension.component.css"],
})
export class ManageMinuteDialog {
  error = "";
  minuteForm: FormGroup;
  deductCustomMinuteForm: FormGroup;
  deductAllMinuteForm: FormGroup;
  deductExt = "";
  add_minute = "";
  addExtarr = [];
  deductExtMinute = 0;
  addExtMinute = 0;
  finalMinute = 0;
  formValid: boolean = true;
  deductCustomExtMinute = 0;
  deductFormValid: boolean = true;
  isCustomMinuteForm: boolean = true;
  isAllMinuteForm: boolean = false;
  highestMinute = 0;
  allDeductFormValid: boolean = true;
  ext_ids_arr = [];
  userRole: string;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
    public dialogRefInfo: MatDialogRef<ManageMinuteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ""
  ) {
    this.minuteForm = this.formBuilder.group({
      deduct_minute: [""],
      add_minute: [""],
      add_minutes: [""],
    });
    this.deductCustomMinuteForm = this.formBuilder.group({
      deduct_ext: [""],
      deduct_ext_minutes: [""],
    });
    this.deductAllMinuteForm = this.formBuilder.group({
      deduct_minutes_all: [""],
      ext_id: [""],
    });
  }

  ngOnInit() {
    this.userRole = localStorage.getItem("type");

    this.extensionService
      .getExtension(this.data["customerId"])
      .subscribe((pagedData) => {
        this.deductExt = pagedData;
        let arrr = [];
        for (let i = 0; i < this.deductExt.length; i++) {
          arrr.push(this.deductExt[i]["total_min_bal"]);
          this.ext_ids_arr.push(this.deductExt[i]["id"]);
        }
        this.highestMinute = Math.max(...arrr);
      });
  }

  getDeductExtDetail(e) {
    this.addExtarr = [];
    this.deductExtMinute = e.value.total_min_bal;
    for (let i = 0; i < this.deductExt.length; i++) {
      if (e.value.id != this.deductExt[i]["id"]) {
        this.addExtarr.push(this.deductExt[i]);
      }
    }
  }

  getAddExtDetail(e) {
    this.addExtMinute = e.value.total_min_bal;
  }

  manageMinute(e) {
    let textBoxValue = e.target.value;
    if (textBoxValue > this.deductExtMinute) {
      this.toastr.error("Error!", "Invalid Minute Balance", { timeOut: 2000 });
      e.target.value = "";
      this.formValid = true;
    } else if (textBoxValue == "") {
      e.target.value = "";
      this.formValid = true;
    } else {
      this.formValid = false;
    }
  }

  getDeductExtMinute(e) {
    this.addExtarr = [];
    this.deductCustomExtMinute = e.value.total_min_bal;
  }

  manageDeductMinute(e) {
    let textBoxValue = e.target.value;
    if (textBoxValue > this.deductCustomExtMinute) {
      this.toastr.error("Error!", "Invalid Minute Balance", { timeOut: 2000 });
      e.target.value = "";
      this.deductFormValid = true;
    } else if (textBoxValue == "") {
      e.target.value = "";
      this.deductFormValid = true;
    } else {
      this.deductFormValid = false;
    }
  }

  submitForm() {
    const credentials = this.minuteForm.value;
    credentials["newMinuteForDeductExt"] =
      parseInt(credentials.deduct_minute.total_min_bal) -
      parseInt(credentials.add_minutes);
    credentials["newMinuteForAddExt"] =
      parseInt(credentials.add_minute.total_min_bal) +
      parseInt(credentials.add_minutes);
    credentials["deductExt_id"] = credentials.deduct_minute.id;
    credentials["addExt_id"] = credentials.add_minute.id;
    let addExt = credentials.add_minute.ext_number;
    this.extensionService
      .manageExtMinute("manageExtMinute", credentials)
      .subscribe((data) => {
        this.toastr.success("Success!", "Minute added in " + addExt, {
          timeOut: 4000,
        });
        this.extensionService.updateGridList();
        this.cancleDialog();
      });
  }

  submitDecuctCustomForm() {
    const credentials = this.deductCustomMinuteForm.value;
    let deductExt = credentials.deduct_ext.ext_number;
    this.extensionService
      .dedcutCustomMinute("deductCustomeExtMinute", credentials)
      .subscribe((data) => {
        this.toastr.success("Success!", "Minute deducted from " + deductExt, {
          timeOut: 4000,
        });
        this.extensionService.updateGridList();
        this.cancleDialog();
      });
  }

  deductMinuteCheck(e) {
    let checkForm = e.value;
    if (checkForm == "1") {
      this.isCustomMinuteForm = true;
      this.isAllMinuteForm = false;
    }
    if (checkForm == "2") {
      this.isCustomMinuteForm = false;
      this.isAllMinuteForm = true;
    }
  }

  manageDeductMinuteAll(e) {
    let textBoxValue = e.target.value;
    if (textBoxValue > this.highestMinute) {
      this.toastr.error("Error!", "Invalid Minute Balance", { timeOut: 4000 });
      e.target.value = "";
      this.allDeductFormValid = true;
    } else if (textBoxValue == "") {
      e.target.value = "";
      this.allDeductFormValid = true;
    } else {
      this.allDeductFormValid = false;
    }
  }

  submitDecuctAllForm() {
    const credentials = this.deductAllMinuteForm.value;
    credentials["ext_id"] = this.ext_ids_arr;
    this.extensionService
      .dedcutAllMinute("deductAllExtMinute", credentials)
      .subscribe((data) => {
        this.toastr.success("Success!", "Minute deducted successfully.", {
          timeOut: 4000,
        });
        this.extensionService.updateGridList();
        this.cancleDialog();
      });
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: "bulkExtUpdate-dialog",
  templateUrl: "bulkExtensionUpdate-dialog.html",
  styleUrls: ["./view-extension.component.css"],
  providers: [CheckBoxSelectionService],
})
export class BulkExtUpdateDialog {
  error = "";
  extForm: FormGroup;
  userRole: string;
  isShowExtList: boolean = false;
  extList: any = [];
  isVoicemail = "";
  isOutbound = "";
  isRecording = "";
  isForward = "";
  isSpeedDial = "";
  isBlackList = "";
  isCallTransfer = "";
  isSMSOutbound = "";
  isRoaming = "";
  isStickyAgent: any;
  isIntercomCalling: any;
  sourceCodec: any[] = [];
  targetCodec: any[] = [];
  intercomList: any[] = [];
  isCustomPrompt = "";
  isFindMeFollowMe = "";
  disableList:any;
  onext_listSelect:any;
  onext_group_listSelect : any;

  public placeholder: string = 'Select Extension';
  public placeholder2: string = 'Select Extension Group';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public fields: Object = { text: 'agent', value: 'id' };
  public fieldss: Object = { text: 'name', value: 'id' };
  public mode;
  public selectAllText: string;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
    private gatewayService: GatewayService,
    private customerDialoutService: CustomerDialoutServiceService,
    public dialogRefInfo: MatDialogRef<BulkExtUpdateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ""
  ) {
    this.extForm = this.formBuilder.group({
      'extType': [""],
      'extIds': ['', Validators.required],
      'misscall_notify': [''],
      'roaming': [''],
      'ring_time_out': ['60', Validators.required],
      'dtmf_type': ['0'],
      'header_type': ['0'],
      'multiple_reg': [''],
      'voice_mail': [''],
      'isCheckAllFeatureSettings': [''],
      'outbound': [''],
      'recording': [''],
      'call_forward': [''],
      'speed_dial': [''],
      'call_transfer': [''],
      'dnd': [''],
      'bal_restriction': [''],
      'outbound_sms_notification': [''],
      'sticky_agent': [''],
      'admin': [''],
      'ringtone': [''],
      'find_me_follow_me': [''],
      'active_inactive': [''],
      'intercom_calling': [''],
      'call_waiting': [''],
      'intercom_dialout': [''],
      'ext_group': ['', Validators.required],
      'feature':['']
    });
  }

  get extIds() {
    return this.extForm.get("extIds");
  }
  get ext_group() {
    return this.extForm.get("ext_group");
  }
  ngOnInit() {
    this.mode = "CheckBox";
    this.selectAllText = "Select All";
    this.userRole = localStorage.getItem("type");
    let user_id = localStorage.getItem("id");
    this.onext_listSelect = true;
    //add SIP(Extn)
    this.extensionService.getMyExtension(localStorage.getItem('id')).subscribe(data => {
      for (let i = 0; i < data.response.length; i++) {
        this.extList.push({ id: data.response[i].id, agent: data.response[i].ext_number + '-' + data.response[i].caller_id_name });                
      }
      if(this.extList.length >= 300){        
        this.disableList  = true
        this.extForm.get('extIds').clearValidators();
        this.extForm.get('extIds').updateValueAndValidity();
        // this.toastr.error('Error!', 'Please Select Extension Group.', { timeOut: 2000 })
      }
  });
    // get assined extension limit---------//
    this.extensionService
      .getMyExtensionLimit(user_id, localStorage.getItem("type"))
      .subscribe((data) => {
        this.isVoicemail = data.ext.voicemail;
        this.isOutbound = data.ext.outbound_call;
        this.isRecording = data.ext.recording;
        this.isForward = data.ext.forward;
        this.isSpeedDial = data.ext.speed_dial;
        this.isBlackList = data.ext.black_list;
        this.isCallTransfer = data.ext.call_transfer;
        this.isSMSOutbound = data.ext.sms;
        this.isRoaming = data.ext.roaming;
        this.isStickyAgent = Number(data.ext.sticky_agent);
        this.isCustomPrompt = data.ext.custom_prompt;
        this.isFindMeFollowMe = data.ext.find_me_follow_me;
        this.isIntercomCalling = data.ext.intercom_calling;
      });

    this.customerDialoutService
      .getIntercomByCustomer(localStorage.getItem("id"))
      .subscribe((data) => {
        this.intercomList = data;
      });

    this.gatewayService.getCodecInfo().subscribe((data) => {
      let source = data.response;

      // for (let i = 0; i < target.length; i++) {
      //   for (let j = 0; j < source.length; j++) {
      //     if (target[i].codec == source[j].codec) {
      //       source.splice(j, 1);
      //     }
      //   }
      // }
      this.sourceCodec = source;
    });
  }
  SelectfeatureChange(e) {
    if (e.value == '0') {
      this.onext_listSelect = true;
      this.onext_group_listSelect = false;
        this.extForm.get('extIds').setValidators(Validators.required);
         this.extForm.get('extIds').updateValueAndValidity();
      this.extForm.get('ext_group').reset();
      this.extForm.get('ext_group').clearValidators();
      this.extForm.get('ext_group').updateValueAndValidity();
    } else {
      this.onext_listSelect = false;
      this.onext_group_listSelect = true;
      this.extForm.get('extIds').reset();
      this.extForm.get('extIds').clearValidators();
      this.extForm.get('extIds').updateValueAndValidity();
    }
  }
  Providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.extList.filter((data) => {
      return data["agent"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  public checkAllFeatureSettings(isCheck: boolean) {
    if (isCheck) {
      this.extForm.get("outbound").setValue(1);
      // this.extForm.get('recording').setValue(1);
      this.extForm.get("call_forward").setValue(1);
      this.extForm.get("speed_dial").setValue(1);
      this.extForm.get("call_transfer").setValue(1);
      this.extForm.get("misscall_notify").setValue(1);
      // this.extForm.get('roaming').setValue(1);
      this.extForm.get("bal_restriction").setValue(1);
      this.extForm.get("outbound_sms_notification").setValue(1);
      this.extForm.get("multiple_reg").setValue(1);
      this.extForm.get("voice_mail").setValue(1);
      this.extForm.get("admin").setValue(1);
      this.extForm.get("active_inactive").setValue(1);
      this.extForm.get("call_waiting").setValue(1);
      if (this.isCustomPrompt) this.extForm.get("ringtone").setValue(1);
      if (this.isRoaming) this.extForm.get("roaming").setValue(1);
      if (this.isRecording) this.extForm.get("recording").setValue(1);
      if (this.isStickyAgent) this.extForm.get("sticky_agent").setValue(1);
      if (this.isFindMeFollowMe)
        this.extForm.get("find_me_follow_me").setValue(1);
      if (this.isIntercomCalling)
        this.extForm.get("intercom_calling").setValue(1);
    } else {
      this.extForm.get("outbound").setValue(0);
      //  this.extForm.get('recording').setValue(0);
      this.extForm.get("call_forward").setValue(0);
      this.extForm.get("speed_dial").setValue(0);
      this.extForm.get("call_transfer").setValue(0);
      this.extForm.get("misscall_notify").setValue(0);
      // this.extForm.get('roaming').setValue(0);
      this.extForm.get("bal_restriction").setValue(0);
      this.extForm.get("outbound_sms_notification").setValue(0);
      this.extForm.get("multiple_reg").setValue(0);
      this.extForm.get("voice_mail").setValue(0);
      this.extForm.get("admin").setValue(0);
      this.extForm.get("active_inactive").setValue(0);
      this.extForm.get("call_waiting").setValue(0);
      if (this.isCustomPrompt) this.extForm.get("ringtone").setValue(0);
      if (this.isRoaming) this.extForm.get("roaming").setValue(0);
      if (this.isRecording) this.extForm.get("recording").setValue(0);
      if (this.isStickyAgent) this.extForm.get("sticky_agent").setValue(0);
      if (this.isFindMeFollowMe)
        this.extForm.get("find_me_follow_me").setValue(0);
      if (this.isIntercomCalling)
        this.extForm.get("intercom_calling").setValue(0);
    }
  }

  submitExtensionForm() {
    let codecValue: any = [];
    //  for (let i = 0; i < this.targetCodec.length; i++) {
    //   codecValue.push(this.targetCodec[i].codec);
    // }
    const credentials = this.extForm.value;
    credentials.codec = codecValue;
    // if(!codecValue.length){
    //   this.toastr.error('Error!', 'Please Select at least one codec', { timeOut: 2000 });
    //   return;
    // }

    if (!(credentials.extIds != null ? credentials.extIds.length : credentials.ext_group.length)) {
      this.toastr.error('Error!', `Please Select at least one ${this.disableList == true ? "Group" : "Extension"}`, { timeOut: 2000 });
      return;
    }
    this.extensionService
      .manageBulkUpdation("bulkextension", credentials)
      .subscribe((data) => {
        this.toastr.success("Success!", data["message"], { timeOut: 4000 });
        this.extensionService.updateGridList();
        this.cancleDialog();
      });
  }

  extTypeChange(event) {
    let extValue = event.value;
    if (extValue == "1") {
      this.isShowExtList = false;
      this.extForm.get("extIds").clearValidators();
      this.extForm.updateValueAndValidity();
    } else {
      this.isShowExtList = true;
      this.extForm.get("extIds").setValidators(Validators.required);
      this.extForm.updateValueAndValidity();
    }
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }

  public manageSelectAllBtn() {
    let outbound = this.extForm.get("outbound").value;
    //  let recording =  this.extForm.get('recording').value
    let call_forward = this.extForm.get("call_forward").value;
    let speed_dial = this.extForm.get("speed_dial").value;
    let call_transfer = this.extForm.get("call_transfer").value;
    let misscall_notify = this.extForm.get("misscall_notify").value;
    let roaming = this.extForm.get("roaming").value;
    let bal_restriction = this.extForm.get("bal_restriction").value;
    let multiple_reg = this.extForm.get("multiple_reg").value;
    let voice_mail = this.extForm.get("voice_mail").value;
    let admin = this.extForm.get("admin").value;
    let active_inactive = this.extForm.get("active_inactive").value;

    let outbound_sms_notification = this.extForm.get(
      "outbound_sms_notification"
    ).value;
    let sticky_agent = this.isStickyAgent
      ? this.extForm.get("sticky_agent").value
      : true;
    let ringtone = this.isCustomPrompt
      ? this.extForm.get("ringtone").value
      : true;
    let recording = this.isRecording
      ? this.extForm.get("recording").value
      : true;
    let find_me_follow_me = this.isFindMeFollowMe
      ? this.extForm.get("find_me_follow_me").value
      : true;

    if (
      outbound &&
      recording &&
      call_forward &&
      speed_dial &&
      call_transfer &&
      misscall_notify &&
      roaming &&
      bal_restriction &&
      outbound_sms_notification &&
      multiple_reg &&
      voice_mail &&
      sticky_agent &&
      ringtone &&
      admin &&
      find_me_follow_me &&
      active_inactive
    ) {
      this.extForm.get("isCheckAllFeatureSettings").setValue(true);
    } else {
      this.extForm.get("isCheckAllFeatureSettings").setValue(false);
    }
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
  selector: "bulkExtDelete-dialog",
  templateUrl: "bulkExtensionDelete-dialog.html",
  styleUrls: ["./view-extension.component.css"],
  providers: [CheckBoxSelectionService],
})
export class BulkExtDeleteDialog {
  error = "";
  extForm: FormGroup;
  userRole: string;
  isShowExtList: boolean = false;
  extList: any = [];
  isVoicemail = "";
  isOutbound = "";
  isRecording = "";
  isForward = "";
  isSpeedDial = "";
  isBlackList = "";
  isCallTransfer = "";
  isSMSOutbound = "";
  isRoaming = "";
  isStickyAgent: any;
  isIntercomCalling: any;
  sourceCodec: any[] = [];
  targetCodec: any[] = [];
  intercomList: any[] = [];
  groupList: any = [];
  isCustomPrompt = "";
  isFindMeFollowMe = "";
  showExtensionList: boolean = true;
  showSpeedDial: boolean = false;
  onSipSelect: boolean = false;
  onCgSelect: boolean = false;
  onext_listSelect: boolean = false;
  onext_group_listSelect: boolean = false;
  bulk_listSelect: boolean = false;
  bulk_group_listSelect: boolean = false;
  cgList: [];
  disabledExtList: any;
  disabledExtListGroup: any;
  checkValueGroup: any;
  checkValue: any;
  isDisabled: boolean = true;
  disabledBulkExtList: any;
  checkBulk: any;

  public placeholder: string = "Select Source Extension List";
  public placeholder33: string = "Select Source Extension List";
  public placeholder3: string = "Select Source Group List";
  public placeholder4: string = "Select Source Group List";
  public fields1: Object = { text: "name", value: "id" };
  public popupHeight: string = "200px";
  public popupWidth: string = "250px";
  public fields: Object = { text: "agent", value: "id" };
  public fieldss: Object = { text: "name", value: "id" };
  public mode;
  public selectAllText: string;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
    private gatewayService: GatewayService,
    private customerDialoutService: CustomerDialoutServiceService,
    private callgroupService: CallgroupService,
    public dialogRefInfo: MatDialogRef<BulkExtUpdateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ""
  ) {
    this.extForm = this.formBuilder.group({
      extType: ["1"],
      extIds: [""],
      speed_dial: ["0"],
      feature: ["0"],
      feature_select: ["0"],
      bulk_select: ["0"],
      sip: [""],
      cg: [""],
      ext_list: [""],
      ext_group_id: [""],
      int_group_id: [""],
    });
  }

  get extIds() {
    return this.extForm.get("extIds");
  }
  get sip() {
    return this.extForm.get("sip");
  }
  get cg() {
    return this.extForm.get("cg");
  }
  get ext_list() {
    return this.extForm.get("ext_list");
  }
  get ext_group_id() {
    return this.extForm.get("ext_group_id");
  }
  get int_group_id() {
    return this.extForm.get("int_group_id");
  }

  ngOnInit() {
    this.bulk_listSelect = true;
    this.onext_listSelect = true;
    this.onext_group_listSelect = false;
    this.mode = "CheckBox";
    this.selectAllText = "Select All";
    this.userRole = localStorage.getItem("type");
    let user_id = localStorage.getItem("id");
    this.customerDialoutService
      .getGroupType(localStorage.getItem("id"), 1)
      .subscribe((data) => {
        this.groupList = data.map((item) => ({ id: item.id, name: item.name }));
      });
    this.extensionService.getMyExtension(localStorage.getItem("id")).subscribe(
      (data) => {
        for (let i = 0; i < data.response.length; i++) {
          this.extList.push({
            id: data.response[i].id,
            agent:
              data.response[i].ext_number +
              "-" +
              data.response[i].caller_id_name,
          });
        }
        if (this.extList.length >= 301) {
          this.disabledBulkExtList = true;
          this.extForm.get("extIds").clearValidators();
          this.extForm.get("extIds").updateValueAndValidity();
          this.extForm.get("extIds").reset();
          // this.toastr.error("Error!", "Please Select Extension Group List.", {
          //   timeOut: 2000,
          // });
        }
      },
      (err) => {
        this.error = err.message;
      }
    );

    this.callgroupService
      .getCallgroup({
        id: null,
        name: null,
        customer_id: Number(localStorage.getItem("id")),
      })
      .subscribe((data) => {
        this.cgList = data;
      });
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }

  Providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.extList.filter((data) => {
      return data["agent"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }
  Providerremovedspac_group(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.groupList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  extensionDeleteForm() {
    let extensions = this.extForm.value;
  }
  // onMultiSelectChange(e: any){
  //   this.checkValue = e.value;
  //   if (e.value != null) {
  //     this.disabledExtListGroup = true;

  //     this.extForm.get('ext_list').setValidators(Validators.required);
  //     this.extForm.get('ext_list').updateValueAndValidity();
  //     this.extForm.get('ext_group_id').clearValidators();
  //     this.extForm.get('ext_group_id').updateValueAndValidity();

  //   }

  // }
  // onMultiSelectChangeGroup(event: any){
  //   this.checkValueGroup = event.value;
  //   if (event.value != null) {
  //     this.disabledExtList = true;

  //     this.extForm.get('ext_group_id').setValidators(Validators.required);
  //     this.extForm.get('ext_group_id').updateValueAndValidity();
  //     this.extForm.get('ext_list').clearValidators();
  //     this.extForm.get('ext_list').updateValueAndValidity();
 
  //   }

  // }

  eventTypeChange(e) {
    if (e.value == "1") {
      this.extForm.get("extIds").setValidators(Validators.required);
      this.extForm.get("extIds").updateValueAndValidity();
      this.extForm.get("ext_list").clearValidators();
      this.extForm.get("ext_list").updateValueAndValidity();
      this.extForm.get("ext_group_id").clearValidators();
      this.extForm.get("ext_group_id").updateValueAndValidity();
      this.extForm.get("ext_group_id").reset();
      this.extForm.get("ext_list").reset();
      this.extForm.get("sip").clearValidators();
      this.extForm.get("sip").updateValueAndValidity();
      this.showExtensionList = true;
      this.showSpeedDial = false;
      this.extForm.get("sip").reset();
      this.extForm.get("cg").reset();
      this.extForm.get("feature").setValue("0");
      this.onSipSelect = false;
    } else {
      if (this.extList.length >= 301) {
        this.disabledExtList = true;
        this.extForm.get("ext_list").clearValidators();
        this.extForm.get("ext_list").updateValueAndValidity();
        this.extForm.get("ext_list").reset();
        // this.toastr.error("Error!", "Please Select Extension Group.", {
        //   timeOut: 2000,
        // });
      } else {
        // this.extForm.get('ext_list').setValidators(Validators.required);
        // this.extForm.get('ext_list').updateValueAndValidity();
      }
      this.extForm.get("extIds").clearValidators();
      this.extForm.get("extIds").updateValueAndValidity();

      // this.extForm.get('ext_group_id').setValidators(Validators.required);
      // this.extForm.get('ext_group_id').updateValueAndValidity();
      this.extForm.get("sip").setValidators(Validators.required);
      this.extForm.get("sip").updateValueAndValidity();
      this.showSpeedDial = true;
      this.onSipSelect = true;
      this.onCgSelect = false;
      this.showExtensionList = false;
      this.extForm.get("extIds").reset();
    }
  }

  featureChange(e) {
    if (e.value == "0") {
      this.onSipSelect = true;
      this.onCgSelect = false;
      this.extForm.get("cg").reset();
      this.extForm.get("cg").clearValidators();
      this.extForm.get("cg").updateValueAndValidity();
    } else {
      this.onSipSelect = false;
      this.onCgSelect = true;
      this.extForm.get("sip").reset();
      this.extForm.get("sip").clearValidators();
      this.extForm.get("sip").updateValueAndValidity();
    }
  }
  BulkfeatureChange(e) {
    if (e.value == "0") {
      this.bulk_listSelect = true;
      this.bulk_group_listSelect = false;
      this.extForm.get("extIds").setValidators(Validators.required);
      this.extForm.get("extIds").updateValueAndValidity();
      this.extForm.get("int_group_id").reset();
      this.extForm.get("int_group_id").clearValidators();
      this.extForm.get("int_group_id").updateValueAndValidity();
    } else {
      this.bulk_listSelect = false;
      this.bulk_group_listSelect = true;
      this.extForm.get("extIds").reset();
      this.extForm.get("extIds").clearValidators();
      this.extForm.get("extIds").updateValueAndValidity();
    }
  }
  SelectfeatureChange(e) {
    if (e.value == "0") {
      this.onext_listSelect = true;
      this.onext_group_listSelect = false;
      this.extForm.get("ext_list").setValidators(Validators.required);
      this.extForm.get("ext_list").updateValueAndValidity();
      this.extForm.get("ext_group_id").reset();
      this.extForm.get("ext_group_id").clearValidators();
      this.extForm.get("ext_group_id").updateValueAndValidity();
    } else {
      this.onext_listSelect = false;
      this.onext_group_listSelect = true;
      this.extForm.get("ext_list").reset();
      this.extForm.get("ext_list").clearValidators();
      this.extForm.get("ext_list").updateValueAndValidity();
    }
  }

  submitAdvanceForm() {
    // if (this.checkValueGroup == null && this.checkValue == null) {
    //   this.toastr.error('Error!', "Please select atleast one field extension list or group list", { timeOut: 2000 });
    // }
    let credentials = this.extForm.value;
    let adavanceFeature = this.extForm.get("extType").value;
    if (adavanceFeature == "1") {
      let list = [];
      if (credentials.extIds != null) {
        
        credentials["extIds"].map((item) => {
          this.extList.filter((value) => {
            if (value.id === item) {
              list.push(value["agent"].split("-")[0]);
            }
          });
        });
      }
      else{
      credentials["int_group_id"].map((item) => {
        this.extList.filter((value) => {
          if (value.id === item) {
            list.push(value["name"].split("-")[0]);
          }
        });
      });
    }
      credentials["ext_numbers"] = list;
      this.extensionService
        .bulkDeleteExtension(credentials)
        .subscribe((data) => {
          if (data.status_code == 200) {
            this.toastr.success("Success!", "Extensions Deleted", {
              timeOut: 2000,
            });
            this.extensionService.updateGridList();
            this.cancleDialog();
          } else {
            this.toastr.error("Error!", "Something Went Wrong", {
              timeOut: 2000,
            });
          }
          this.cancleDialog;
        });
    } else {
      if (credentials["feature"] == "0") {
        let ext = this.extForm.get("sip").value;
        let agent;
        if (ext) {
          agent = this.extList.filter((item) => item.id == ext)[0]["agent"];
        }
        credentials["sip_number"] = agent.split("-")[0];
      }
      credentials["customer_id"] = localStorage.getItem("id");
      this.extensionService.setAdvanceService(credentials).subscribe((data) => {
        if (data.status_code == 200) {
          this.toastr.success("Success!", "Feature Applied", { timeOut: 2000 });
          this.cancleDialog();
        } else {
          this.toastr.error("Error!", "Something Went Wrong", {
            timeOut: 2000,
          });
        }
      });
    }
  }
}

@Component({
  selector: "removeMinute-dialog",
  templateUrl: "removeMinute-dialog.html",
  styleUrls: ["./view-extension.component.css"],
})
export class removeExtensionMinute {
  removeMinuteForm: FormGroup;
  countryList = [];
  public popupHeight: string = "200px";
  public popupWidth: string = "250px";
  public fields: Object = { text: "name", value: "phonecode" };
  public placeholder2: string = "Select Country";
  minutes: any = 0;
  isFilter = false;
  used_minutes: any = 0;
  gateway: any;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
    private callplanService: CallplanService,
    public dialogRefInfo: MatDialogRef<removeExtensionMinute>,
    @Inject(MAT_DIALOG_DATA) public data: ""
  ) {
    this.removeMinuteForm = this.formBuilder.group({
      dial_prefix: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.callplanService.getCountryList().subscribe((data) => {
      this.countryList = data.response;
    });
  }

  selectDestinationMinute(e: any): void {
    let obj = {
      destination: e.itemData.phonecode,
      customer_id: this.data["customerId"],
      ext_id: this.data["id"],
    };
    this.extensionService
      .getParticularExtensionMinute(obj)
      .subscribe((value) => {
        if (value.status_code === 201) {
          this.toastr.warning(
            "You do not have minutes.",
            `Country ${e.itemData.name}`,
            { timeOut: 2000 }
          );
        } else {
          this.minutes = value.response[0]["assingn_minutes"];
          this.used_minutes = value.response[0]["used_minutes"];
          this.gateway = value.response[0]["gateway_id"];
        }
      });
  }

  removeMinutes() {
    let credential = this.removeMinuteForm.value;
    if (this.removeMinuteForm.valid) {
      credential.customer_id = this.data["customerId"];
      credential.ext_id = this.data["id"];
      credential.minutes = Number(this.minutes) - Number(this.used_minutes);
      credential.gateway_id = this.gateway;
      this.extensionService
        .removeExtensionMinutes(credential)
        .subscribe((items) => {
          if (items.status_code == 200) {
            this.toastr.success(
              "Success!",
              "Extension Free From Minutes Successfully.",
              { timeOut: 2000 }
            );
            this.extensionService.updateGridList();
            this.cancleDialog();
          }
        });
    }
  }

  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: "import-extension-dialog",
  templateUrl: "import-extension-dialog.html",
  styleUrls: ["./view-extension.component.css"],
})
export class importExtensionDialog {
  excelValue: any = {};
  showNotInsertedValue = false;
  checkInvalid: boolean = false;
  basic = false;
  text = "";
  imageSource: any;

  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: "file",
    allowedFileType: ["xls", "xlsx", "csv"],
    method: "post",
  });

  constructor(
    public dialogRef11: MatDialogRef<importExtensionDialog>,
    @Inject(MAT_DIALOG_DATA) public data,
    private toastr: ToastrService,
    private extensionService: ExtensionService
  ) {}

  onUploadFailed(item: FileItem, filter: any, options: any): void {
    this.checkInvalid = true;
  }

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => {
      this.checkInvalid = false;
      file.withCredentials = false;
    };

    this.uploader.onWhenAddingFileFailed = this.onUploadFailed.bind(this);
    // this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
    //   this.basicFile()
    //   this.toastr.error('Error!', invalidFileType, { timeOut: 2000 });
    // }
    let aaa;
    this.uploader.onCompleteItem = (
      item: any,
      response: string,
      status: any,
      headers: any
    ) => {
      aaa = JSON.parse(response);

      if (aaa.status_code == 401) {
        this.toastr.error("Error!", importUnsuccessfully, { timeOut: 2000 });
      }
      if (aaa.status_code == 490) {
        this.toastr.error(
          "Limit Exceed!",
          `Your Extension Limit is ${aaa.limit}`,
          { timeOut: 2000 }
        );
      }
      this.excelValue = aaa.value ? aaa.value : "";
      this.showNotInsertedValue = this.excelValue != "" ? true : false;
    };

    this.uploader.onCompleteAll = () => {
      this.showNotInsertedValue = this.excelValue != "" ? true : false;
      if (!this.showNotInsertedValue && aaa.status_code == 200) {
        this.toastr.success("Success!", importSuccessfully, { timeOut: 2000 });
        this.cancleDialog();
      }
      // else if(this.checkmessage == true) {
      //   this.toastr.error('Error!', alreadyExist, { timeOut: 2000 });
      //   this.cancleDialog();

      // }
      // else if(this.checkcountrycode == true){
      //   this.cancleDialog();
      //   this.toastr.error('Errro!',countrycodeerror, {timeOut: 2000 });
      // }
      // else {
      //   this.toastr.error('Error!', importUnsuccessfully, { timeOut: 2000 });
      // }
    };
  }

  openPrediction1() {
    this.text = "...";
    this.basic = true;
  }

  basicFile() {
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append("customer_id", this.data["customerId"]); //note comma separating key and value
      form.append("extension_id", this.data["extensionId"]); //note comma separating key and value
      form.append("role", localStorage.getItem("type"));
      form.append("id", null);
      form.append("type", "extension");
    };
  }

  onshowmsg() {
    if (this.checkInvalid == false) {
      this.basicFile();
      this.uploader.queue.forEach((item) => item.upload());
    } else {
      this.toastr.error("Error!", invalidFileType, { timeOut: 2000 });
    }
  }

  downloadExcelSample(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    worksheet = workbook.addWorksheet("My Sheet", {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: {
        paperSize: 8,
        orientation: "landscape",
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
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
      { header: "Extension Number", key: "ext_number", width: 25 },
      { header: "Extension Name", key: "ext_name", width: 25 },
      { header: "Email", key: "Email", width: 30 },
      { header: "Caller ID", key: "caller_id", width: 30 },
      { header: "SIP Password", key: "sip_pass", width: 30 },
      { header: "Web Password", key: "web_pass", width: 30 },
      { header: "Intercom", key: "intercom", width: 30 },
      { header: "Speed Dial", key: "sp_dial", width: 30 },
      { header: "Recording", key: "recording", width: 30 },
      { header: "Voicemail", key: "voicemail", width: 30 },
      { header: "DND ", key: "dnd", width: 30 },
      { header: "Multiple Registration", key: "multiple_register", width: 30 },
      { header: "Dial Timeout", key: "dial_timeout", width: 30 },
      { header: "Ring Timeout ", key: "ring_timeout", width: 30 },
      { header: "DTMF Type ", key: "dtmf_type", width: 30 },
    ];
    worksheet.getRow(1).font = {
      bold: true,
    };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    // for (let i = 0; i < this.exportData.length; i++) {
    worksheet.addRow({
      ext_number: "",
      ext_name: "",
      Email: "",
      caller_id: "",
      sip_pass: "",
      web_pass: "",
      intercom: "",
      sp_dial: 0,
      recording: 0,
      voicemail: 0,
      dnd: 0,
      multiple_register: 0,
      dial_timeout: 30,
      ring_timeout: 30,
      dtmf_type: "0",
    });
    // }
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });

    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = "1:2";

    // let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(1));
    //this.excelService.exportAsExcelFile(arr, 'contactList');
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, "sample_extension");
    });
  }

  cancleDialog(): void {
    this.dialogRef11.close();
    this.showNotInsertedValue = false;
    this.extensionService.updateGridList();
  }
}
