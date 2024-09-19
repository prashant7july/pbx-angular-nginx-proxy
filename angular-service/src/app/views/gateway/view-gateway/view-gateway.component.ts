import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { NavigationEnd, Router } from "@angular/router";
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import * as jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastrService } from "ngx-toastr";
import { BackendAPIIntegrationService } from "src/app/core/services/backend-api-integration.service";
import Swal from "sweetalert2";
import {
  CommonService,
  ExcelService,
  Gateway,
  ServerDetail,
} from "../../../core";
import { GatewayService } from "../gateway.service";

declare const ExcelJS: any;

@Component({
  selector: "app-view-gateway",
  templateUrl: "./view-gateway.component.html",
  styleUrls: ["./view-gateway.component.css"],
})
export class ViewGatewayComponent implements OnInit {
  packageData = "";
  error = "";
  userType = "";
  html = "";
  data = "";
  action = "reply";
  filterForm: FormGroup;
  isFilter = false;
  providerList: any = "";
  ProviderFilter: any;
  filterProvider: any;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  errorField = "";
  exportData: any = {};
  defaultPageSize = "10";
  menus: any;
  gatewayMenu: any = "";
  public fields: Object = { text: "provider", value: "id" };
  public placeholder: string = "Provider";
  public popupHeight: string = "200px";
  public popupWidth: string = "230px";

  constructor(
    private router: Router,

    private fb: FormBuilder,
    private gatewayService: GatewayService,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private backendIntegrationService: BackendAPIIntegrationService
  ) {
    this.filterForm = this.fb.group({
      by_name: [""],
      by_ip: [""],
      by_status: [""],
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
    this.menus = JSON.parse(localStorage.getItem('menu'));
    
    this.gatewayMenu = this.menus.find((o) => o.url == '/config/gateway');
    this.displayAllRecord();
    //get Providers list
    this.commonService.getProviders().subscribe(
      (data) => {
        this.providerList = data.response;
        this.providerList.unshift({ id: 0, provider: "Select Provider" });

        this.filterProvider = this.ProviderFilter = this.providerList.slice();
      },
      (err) => {
        this.error = err.message;
      }
    );
  }
  Providerremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.providerList.filter((data) => {
      return data["provider"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 20 },
      { field: "id", headerName: "ID", hide: true, width: 10 },
      { field: "provider", headerName: "Provider", hide: false, width: 20 },
      { field: "ip", headerName: "IP", hide: false, width: 20 },
      { field: "domain", headerName: "Domain", hide: false, width: 20 },
      { field: "port", headerName: "Port", hide: false, width: 10 },
      { field: "ping", headerName: "Ping", hide: false, width: 10 },
      { field: "codec", headerName: "Codec", hide: false, width: 30 },
      {
        field: "transport_type",
        headerName: "Transport Type",
        hide: false,
        width: 20,
      },
      { field: "status1", headerName: "Status", hide: false, width: 10 },
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.gatewayService.filterGateway(credentials).subscribe((data) => {
        this.exportData = data;
        data = this.manageUserActionBtn(data, []);
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data: data });
        let obj = {
          application: "gateway_status",
        };
        this.gatewayService.getActiveGateway(obj).subscribe(
          (data2) => {
            let activeGatewayId = data2
              ? data2["active_gateway"].replaceAll("gw_", "").split(" ")
              : []; //active_gateway
            data = this.manageUserActionBtn(data, activeGatewayId);
            this.dataSource = [];
            this.dataSource.push({ fields: this.columnDefs, data: data });
          },
          (err) => {
            this.error = err.message;
          }
        );
      });
    } else {
      this.gatewayService
        .getGateway({ id: null, ip: null, port: null, provider_id: null })
        .subscribe(
          (data) => {
            this.exportData = data;
            data = this.manageUserActionBtn(data, []);
            this.dataSource = [];
            this.dataSource.push({ fields: this.columnDefs, data: data });
            let obj = {
              application: "gateway_status",
            };
            this.gatewayService.getActiveGateway(obj).subscribe((data2) => {
              let activeGatewayId =
                data2 && data2 !== undefined
                  ? data2["active_gateway"].replaceAll("gw_", "").split(" ")
                  : [];
              console.log("151 : ", activeGatewayId);

              data = this.manageUserActionBtn(data, activeGatewayId);
              this.dataSource = [];
              this.dataSource.push({ fields: this.columnDefs, data: data });
            });
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
      { header: "Provider", key: "Provider", width: 30 },
      { header: "IP", key: "IP", width: 40 },
      { header: "Port", key: "Port", width: 10 },
      { header: "Ping", key: "Ping", width: 10 },
      { header: "Codec", key: "Codec", width: 40 },
      { header: "Transport Type", key: "TransportType", width: 15 },
      { header: "Domain", key: "Domain", width: 15 },
      { header: "Status", key: "Status", width: 10 },
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
      let strStatus = this.exportData[i].status;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, "");
      worksheet.addRow({
        Provider: this.exportData[i].provider,
        IP: this.exportData[i].ip,
        Port: this.exportData[i].port,
        Ping: this.exportData[i].ping,
        Codec: this.exportData[i].codec,
        TransportType: this.exportData[i].transport_type,
        Domain: this.exportData[i].domain,
        Status: strStatus1,
      });
    }
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

    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, "gateway");
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = [
      "Provider",
      "IP",
      "Domain",
      "Port",
      "Ping",
      "Codec",
      "Transport Type",
      "Status",
    ];
    var rows = [];
    this.exportData.forEach((element) => {
      let strStatus = element.status;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, "");
      const e11 = [
        element.provider,
        element.ip,
        element.domain,
        element.port,
        element.ping,
        element.codec,
        element.transport_type,
        strStatus1,
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
      },
    });
    doc.save("gateway.pdf");
  }

  manageUserActionBtn(data, activeGatewayList) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = "";
      let activeGtwy = activeGatewayList.every((item) => item != data[i].id);

      finalBtn += "<span>";
      if (!activeGtwy) {
        finalBtn +=
          "<i class='fa fa-arrow-circle-o-up active-button' style='display: inline' title='Up'></i>";
      } else {
        finalBtn +=
          "<i class='fa fa-arrow-circle-o-down delete-button' style='display: inline' title='Down'></i>";
      }
      if (this.gatewayMenu.modify_permission) {
        finalBtn +=
          "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (this.gatewayMenu.add_permission) {
        finalBtn +=
          "<i class='fa fa-list-ul add-button' aria-hidden='true' style='cursor:pointer; mousehover font-size:17px; display: inline' data-action-type='add' title='Gateway Caller ID Rule'></i>";
      }
      if (data[i].status == "Active") {
        data[i].status1 =
          "<span style='color:#379457;'><strong>" +
          data[i].status +
          "</strong></span>";
        finalBtn +=
          "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>\
        ";
      } else if (data[i].status == "Inactive") {
        data[i].status1 =
          "<span style='color:#c69500;'><strong>" +
          data[i].status +
          "</strong></span>";
        finalBtn +=
          "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>\
        ";
      }
      if (this.gatewayMenu.delete_permission) {
        finalBtn +=
          "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      finalBtn += "</span>";
      data[i]["action"] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editData(data);
      case "delete":
        return this.deleteData(data);
      case "active":
        return this.updateStatus(data);
      case "inactive":
        return this.updateStatus(data);
      case "add":
        return this.addStatus(data);
    }
  }
  addStatus(event) {
    this.openDialogg(event.id);
  }
  editData(event) {
    this.router.navigate(["config/gateway/manage"], {
      queryParams: { id: event.id },
    });
  }
  deleteData(event) {
    let value = event.ip ? event.ip : event.domain;
    let key = event.ip ? "IP" : "Domain";

    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'>You will not be able to recover Gateway " +
        key +
        "</span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " +
        value +
        "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.gatewayService
          .deleteGateway({ id: event.id })
          .subscribe((data) => {
            if (data["code"] == 400) {
              Swal.fire({
                type: "error",
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                text: data["message"],
                showConfirmButton: false,
                timer: 3000,
                background: "#000000",
              });
              return;
            } else {
              let obj = {
                application: "gateway",
                action: "delete",
                que_type: "",
                id: event.id.toString(),
              };
              this.backendIntegrationService
                .createAPIintegration(obj)
                .subscribe((res) => {});
              this.displayAllRecord();
            }
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html:
            "<span style='color:#FFFFFF;'> Gateway " +
            key +
            "</span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " +
            value +
            "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: "success",
          background: "#000000",
          timer: 3000,
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html:
            "<span style='color:#FFFFFF;'>Gateway " +
            key +
            "</span><span style ='color:red; font-weight :bold; font-size: 1.2em'> " +
            value +
            "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: "error",
          background: "#000000",
          timer: 3000,
        });
      }
    });
  }

  updateStatus(event) {
    let gatewayStatus = "";
    let btnmessage = "tyfhgj";
    let action = event.status.match(/Active/g) ? "Active" : "Inactive";
    if (action == "Active") {
      gatewayStatus = "re-activate";
      btnmessage = "Inactivate";
    } else {
      gatewayStatus = "inactivate";
      btnmessage = "Activate";
    }
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'> You can " +
        gatewayStatus +
        " this gateway in future!</span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, " + btnmessage + " it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.gatewayService
          .updateGatewayStatus("updateGatewayStatus", event.id, action)
          .subscribe(
            (data) => {
              this.resetTable();
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
          title: '<span style="color:#FFFFFF;">' + btnmessage + "d!</span>",
          html:
            "<span style='color:#FFFFFF;'>Gateway has been " +
            btnmessage +
            "d.</span>",
          type: "success",
          background: "#000000",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Gateway is safe :)</span>",
          type: "error",
          background: "#000000",
        });
      }
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

  openDialog() {
    this.router.navigate(["config/gateway/create"], {
      queryParams: { id: null },
    });
  }
  openDialogg(id?): void {
    const dialogRef = this.dialog.open(addGatewayDialog, {
      width: "60%",
      disableClose: true,

      data: {
        id: id ? id : null,
        customerId:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
      },
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
  }
  showInfo0() {
    const dialogRefInfo = this.dialog.open(addGatewayDialog, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
      data: {
        id:
          localStorage.getItem("type") == "1" ? localStorage.getItem("id") : 0,
      },
    });
    dialogRefInfo.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRefInfo.close("Dialog closed");
      }
    });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoGatewayDialog, {
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

@Component({
  selector: "infoGateway-dialog",
  templateUrl: "infoGateway-dialog.html",
})
export class InfoGatewayDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoGatewayDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Gateway
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
  selector: "addGateway-dialog",
  templateUrl: "addGateway-dialog.html",
})
export class addGatewayDialog {
  serverData = "";
  productForm: FormGroup;
  error = "";
  provider = "";
  checkValidate = true;
  value = "";
  checkForm: any;
  disName = false;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    public dialogRef: MatDialogRef<addGatewayDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ServerDetail,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private gatewayService: GatewayService
  ) {
    this.productForm = this.fb.group({
      parameterForm: new FormArray([]),
    });
  }

  ngOnInit() {
    let gateway_id = this.data.id;
    this.gatewayService.getdata(gateway_id).subscribe((data) => {
      if (data[0].clr_id_manipulation != null) {
        this.setDefaultValue(data);
      } else {
        this.addNewParameter();
      }
    });
    if (this.data.id) {
      this.gatewayService.viewgatewayAPI(this.data.id).subscribe(
        (data) => {
          if (data[0]["ip"] != "") {
            this.provider = data[0].provider;
            this.serverData = data[0]["ip"];
          } else {
            this.provider = data[0].provider;
            this.serverData = data[0]["domain"];
          }
        },
        (err) => {
          this.error = err.message;
        }
      );
    }
  }

  public setDefaultValue(data) {
    let strip_clr_id = data[0].strip_clr_id
      ? data[0].strip_clr_id.split(",")
      : [""];

    let prepend_clr_id = data[0].prepend_clr_id
      ? data[0].prepend_clr_id.split(",")
      : [""];
    let clr_id_manipulation = data[0].clr_id_manipulation
      ? data[0].clr_id_manipulation.split(",")
      : [""];
    let control = <FormArray>this.productForm.controls.parameterForm;
    strip_clr_id.forEach((element1, i) => {
      prepend_clr_id.forEach((element2, j) => {
        clr_id_manipulation.forEach((element3, k) => {
          if (i == j && i == k) {
            let obj = [];
            obj.push();
            obj["strip_clr_id"] = element1;
            obj["prepend_clr_id"] = element2;
            obj["clr_id_manipulation"] = Number(element3);
            control.push(this.fb.group(obj));
          }
        });
      });
    });
  }

  addNewParameter(): void {
    const fb = this.productForm.get("parameterForm") as FormArray;
    if (fb.length > 9) {
      this.toastr.error("Maximum 10 caller ID rule allowed only !", "Error!", {
        timeOut: 2000,
      });
      return;
    }
    const formGroupArray = this.createParameter();
    fb.push(formGroupArray);
  }

  createParameter() {
    const fg = this.fb.group({
      strip_clr_id: [""],
      prepend_clr_id: [""],
      clr_id_manipulation: ["", [Validators.required]],
    });
    return fg;
  }

  get prepend_clr_id() {
    return this.productForm.get("prepend_clr_id");
  }
  get strip_clr_id() {
    return this.productForm.get("strip_clr_id");
  }
  get clr_id_manipulation() {
    return this.productForm.get("clr_id_manipulation");
  }

  removeParameter(index) {
    const fb = this.productForm.get("parameterForm") as FormArray;
    fb.removeAt(index);
    this.productForm.updateValueAndValidity();
  }

  onSubmit() {
    if (this.productForm.valid) {
      const credentials = this.productForm.value.parameterForm;
      let count = 0;
      const gateway_id = this.data.id;
      for (let i = 0; i < credentials.length; i++) {
        if (
          credentials[i]["prepend_clr_id"] == "" &&
          credentials[i]["strip_clr_id"] == ""
        ) {
          count++;
        }
      }
      if (count != 0) {
        this.toastr.error(
          "Error!",
          "One Field Required From Strip Or Prepend Caller ID",
          { timeOut: 2000 }
        );
      } else {
        this.gatewayService
          .updateGatewayManipulation(credentials, gateway_id)
          .subscribe((data) => {
            if (data) {
              this.toastr.success(
                "Successfully!",
                "Gateway Caller ID Rule Created",
                { timeOut: 2000 }
              );
              this.cancelForm();
            } else {
              this.toastr.error("Error!", data["message"], { timeOut: 2000 });
            }
          });
      }
    }
  }
  cancelForm() {
    this.productForm.reset();
    this.gatewayService.updateGridList();
    this.dialogRef.close();
  }
  onClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  count = 0;
  stripDigit(event, stripValue) {
    if (event.key == "+" && stripValue.value.strip_clr_id == "") {
      return true;
    } else if (event.keyCode > 47 && event.keyCode < 58) {
      return true;
    } else {
      return false;
    }
  }

  counts = 0;
  prepandDigit(event, stripValue) {
    if (event.key == "+" && stripValue.value.prepend_clr_id == "") {
      return true;
    } else if (event.keyCode > 47 && event.keyCode < 58) {
      return true;
    } else {
      return false;
    }
  }
}
