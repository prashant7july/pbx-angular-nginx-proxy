import { Component, OnInit, ChangeDetectorRef, Inject } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import Swal from "sweetalert2";
import { DidService } from "../did.service";
import { ToastrService } from "ngx-toastr";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  Errors,
  CommonService,
  ExcelService,
  formError,
  errorMessage,
  invalidForm,
  destinationCreated,
  destinationUpdated,
  AllDID,
  EMAIL_RegEx,
} from "../../../core";
import * as jsPDF from "jspdf";
import "jspdf-autotable";
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import { TimeGroupService } from "../../time-group/time-group.service";
import { first } from "rxjs-compat/operator/first";
import { ConferenceCDRComponent } from "../../conference/conference-cdr/conference-cdr.component";

declare const ExcelJS: any;

@Component({
  selector: "app-customer-did",
  templateUrl: "./customer-did.component.html",
  styleUrls: ["./customer-did.component.css"],
})
export class CustomerDidComponent implements OnInit {
  error = "";
  filterForm: FormGroup;
  countryList: any = "";
  CountryFilter: any;
  filterCountry: any;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  activeFeature: any[] = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = "10";
  customerId: any;
  extensionId: any;
  // public mode : string = 'CheckBox' ;
  // public selectAllText: string = "Select All"
  // public fie
  public mode = "CheckBox";
  public selectAllText: string = "Select All";
  public fields: Object = { text: "name", value: "id" };
  public placeholder: string = "Select Country";
  public placeholder1: string = "Select Fee Type";
  public popupHeight: string = "200px";
  public popupWidth: string = "200px";

  constructor(
    private router: Router,
    private didService: DidService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public commonService: CommonService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private excelService: ExcelService
  ) {
    this.filterForm = this.fb.group({
      by_did: [""],
      by_country: new FormControl([]), // [""],
      by_status: [""],
      by_did_type: [""],
      by_group: [""],
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
    var user_id = localStorage.getItem("id");

    this.didService.getActiveFeature(user_id).subscribe(
      (data) => {
        const list = [];
        if (data[0].appointment == "1") {
          list.push({ id: "13", feature: "Appointment" });
        }
        if (data[0].conference == "1") {
          list.push({ id: "3", feature: "Conference" });
        }
        if (data[0].call_group == "1") {
          list.push({ id: "5", feature: "Call Group" });
        }
        if (data[0].ivr == "1") {
          list.push({ id: "2", feature: "IVR" });
        }
        if (data[0].playback == "1") {
          list.push({ id: "12", feature: "Playback" });
        }
        if (data[0].queue == "1") {
          list.push({ id: "4", feature: "Queue" });
        }
        list.push({ id: "1", feature: "SIP" });
        if (data[0].tele_consultancy == "1") {
          list.push({ id: "10", feature: "Tele Consultation" });
        }
        if (data[0].dynamic_ivr == "1") {
          list.push({ id: "21", feature: "Dynamic IVR" });
        }
        if (data[0].voicebot == "1") {
          list.push({ id: "16", feature: "Voicebot" });
        }
        if (data[0].sip_trunk == "1") {
          list.push({ id: "20", feature: "SIP Trunk" });
        }
        this.activeFeature = list;
      },
      (err) => {
        this.error = err.message;
      }
    );

    this.didService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
    //get country list
    this.commonService.getCountryList().subscribe(
      (data) => {
        this.countryList = data.response;
        this.filterCountry = this.CountryFilter = this.countryList.slice();
      },
      (err) => {
        this.error = err.message;
      }
    );
  }
  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data["name"].toLowerCase().includes(textValue);
    });
    event.updateData(filterData);
  }

  displayAllRecord() {
    var user_id = localStorage.getItem("id");
    var user_type = localStorage.getItem("type");
    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 150 },
      { field: "id", headerName: "ID", hide: true, width: 10 },
      { field: "didDisplay", headerName: "DID", hide: false, width: 150 },
      { field: "country", headerName: "Country", hide: false, width: 150 },
      { field: "product", headerName: "Product", hide: false, width: 150 },
      {
        field: "max_concurrent",
        headerName: "Max CC",
        hide: false,
        width: 150,
      },
      { field: "did_group", headerName: "Group", hide: false, width: 150 },
      { field: "did_type", headerName: "DID Type", hide: false, width: 150 },
      {
        field: "destination_name",
        headerName: "Assigned to",
        hide: false,
        width: 150,
      },
      {
        field: "fixrate",
        headerName: "Monthly Price",
        hide: false,
        width: 150,
      },
      {
        field: "selling_rate",
        headerName: "Buying Rate",
        hide: false,
        width: 150,
      },
      {
        field: "time_group_name",
        headerName: "Time Group Name",
        hide: false,
        width: 150,
      },
      { field: "vmn_num", headerName: "VMN", hide: false, width: 150 },
      { field: "activated", headerName: "Status", hide: false, width: 150 },
    ];
    if (user_type === "1") {
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        credentials["by_did"] = Number(credentials["by_did"])
        credentials["by_status"] = Number(credentials["by_status"])
        credentials["by_did_type"] = Number(credentials["by_did_type"])
        credentials["by_group"] = Number(credentials["by_group"])
        this.didService.filterCustomerDID(credentials, Number(user_id)).subscribe(
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
        this.didService.getCustomerDID(user_id, null).subscribe(pagedData => {
          this.exportData = pagedData;
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: pagedData });
        });
      }
    } else {
      this.toastr.error("Error!", "Unauthorise access!!!", { timeOut: 2000 });
      this.router.navigateByUrl("did/mydid-view");
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
      { header: "DID", key: "Did", width: 20 },
      { header: "Country", key: "Country", width: 30 },
      { header: "Max CC", key: "MaxCC", width: 10 },
      { header: "Group", key: "did_group", width: 25 },
      { header: "DID Type", key: "DidType", width: 20 },
      { header: "Assigned to", key: "ReservedFor", width: 15 },
      { header: "Monthly Price", key: "MonthlyPrice", width: 15 },
      { header: "Buying Rate", key: "BuyingRate", width: 15 },
      { header: "Time Group Name", key: "time_group_name", width: 15 },
      { header: "Status", key: "Status", width: 10 },
      { header: "VMN", key: "Vmn", width: 25 },
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
      let strStatus = this.exportData[i].activated;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, "");
      worksheet.addRow({
        Did: this.exportData[i].did,
        Country: this.exportData[i].country,
        MaxCC: this.exportData[i].max_concurrent,
        did_group: this.exportData[i].did_group,
        DidType: this.exportData[i].did_type,
        ReservedFor:
          this.exportData[i].active_feature +
          " - " +
          this.exportData[i].destination_name,
        MonthlyPrice: this.exportData[i].fixrate,
        BuyingRate: this.exportData[i].selling_rate,
        TimeGroupName: this.exportData[i].time_group_name,
        Vmn: this.exportData[i].vmn_num,
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
    worksheet.pageSetup.printTitlesRow = "1:2";
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, "did");
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = [
      "DID",
      "Country",
      "Max CC",
      "Group",
      "DID Type",
      "Assigned to",
      "Monthly Price",
      "Buying Rate",
      "Time Group Name",
      "Status",
      "VMN",
    ];
    var rows = [];
    this.exportData.forEach((element) => {
      let strStatus = element.activated;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, "");
      const e11 = [
        element.did,
        element.country,
        element.max_concurrent,
        element.did_group,
        element.did_type,
        element.active_feature,
        element.fixrate,
        element.selling_rate,
        element.time_group_name,
        strStatus1,
        element.vmn_num,
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
    doc.save("did.pdf");
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = "";
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";

      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='history' title='History'></i>";
      finalBtn += "</span>";
      pagedData[i]["action"] = finalBtn;

      if (pagedData[i].activated == "Active") {
        pagedData[i].activated =
          "<span style='color:#379457;'><strong>" +
          pagedData[i].activated +
          "</strong></span>";
        finalBtn +=
          "<i class='fa fa-dot-circle-o active-button' style='cursor:pointer; display: inline' data-action-type='inactive' title='Active'></i>";
      } else {
        pagedData[i].activated =
          "<span style='color:#c69500;'><strong>" +
          pagedData[i].activated +
          "</strong></span>";
        finalBtn +=
          "<i class='fa fa-dot-circle-o inactive-button' style='cursor:pointer; display: inline' data-action-type='active' title='Inactive'></i>";
      }
      finalBtn +=
        "<i class='fa fa-rocket views-button' style='cursor:pointer; display: inline;' data-action-type='release' title='Release'></i>";

      // if(pagedData[i].master == "Master"){
      // finalBtn += "<i class='fa fa-toggle-on' style='cursor:pointer; display: inline;' data-action-type='master' title='master''></i>";
      // }else{
      //   finalBtn += "<i class='fa fa-toggle-off' style='cursor:pointer; display: inline;' data-action-type='master' title='master''></i>";
      // }

      if (pagedData[i].master == "Not-Master") {
        // pagedData[i].status = "<span style='color:#c69500;'><strong>" + pagedData[i].status + "</strong></span>";
        finalBtn +=
          "<i class='fa fa-star-o star-icon' style='cursor:pointer; display: inline' data-action-type='master' title='Not-master'></i>\
        ";
      } else {
        finalBtn +=
          "<i class='fa fa-star' style='display: inline'  title='Master'></i>\
        ";
      }
      finalBtn += "</span>";

      pagedData[i]["action"] = finalBtn;
      if (pagedData[i]["product_id"] == "1") {
        pagedData[i]["product"] = "PBX";
      } else if (pagedData[i]["product_id"] == "2") {
        pagedData[i]["product"] = "OC";
      }
      if (pagedData[i]["active_feature"] != null) {
        // pagedData[i]['destination_name'] =  pagedData[i]['active_feature']+" - "+ pagedData[i]['destination'];
        const activeFeatureList = this.activeFeature;
        const checkFeature = activeFeatureList.find(
          (ft) => ft.id == pagedData[i]["active_feature_id"]
        );
        if (pagedData[i]["active_feature_id"] == 19) {
          pagedData[i]["destination_name"] = pagedData[i]["destination"];
        }
        if (pagedData[i]["active_feature_id"] == 16) {
          pagedData[i]["destination_name"] = pagedData[i]["voicebot_name"];
        }
        // if(checkFeature){
        pagedData[i]["destination_name"] =
          pagedData[i]["active_feature"] +
          "-" +
          pagedData[i]["destination_name"];
        // }else{
        //   pagedData[i]['destination_name'] = '';
        // }
      }
    }
    return pagedData;
  }

  destinationDid(data) {
    this.openDialog(data);
    //this.router.navigate(['did/mydid-destination'], { queryParams: { id: id } });
  }

  makeMasterDID(data, action) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'>You want to make this DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
        data.did +
        "</span> <span style='color:#FFFFFF;'> Master!</span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, make it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        let customer_id = localStorage.getItem("id");
        let action_type;
        if (action == "master") {
          action_type = 1;
        }
        this.didService
          .makeMasterDID(action, { did: Number(data.did), customer_id: Number(customer_id) })
          .subscribe(
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
          title: '<span style="color:#FFFFFF;">Activated!</span>',
          html:
            "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.did +
            "</span> <span style='color:#FFFFFF;'> has been made master DID.</span>",
          type: "success",
          background: "#000000",
          timer: 4000,
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          // html : "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+data.did+"</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: "error",
          background: "#000000",
          timer: 4000,
        });
      }
    });
  }

  manageDid(data, action) {
    if (action == "inactive") {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html:
          "<span style='color:#FFFFFF;'>You can activate DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
          data.did +
          "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: "warning",
        showCancelButton: true,
        background: "#000000",
        confirmButtonText: "Yes, Inactive it!",
        cancelButtonText: "No, keep it",
        preConfirm: () => {
          this.didService.manageDID(action, data.id).subscribe(
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
            title: '<span style="color:#FFFFFF;">Inactivated!</span>',
            html:
              "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.did +
              "</span> <span style='color:#FFFFFF;'> has been inactivated.</span>",
            type: "success",
            background: "#000000",
            timer: 4000,
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html:
              "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.did +
              "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: "error",
            background: "#000000",
            timer: 4000,
          });
        }
      });
    } else {
      Swal.fire({
        title: '<span style="color:#FFFFFF;">Are you sure?</span>',
        html:
          "<span style='color:#FFFFFF;'>You can inactivate DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
          data.did +
          "</span> <span style='color:#FFFFFF;'> in future!</span>",
        type: "warning",
        showCancelButton: true,
        background: "#000000",
        confirmButtonText: "Yes, active it!",
        cancelButtonText: "No, keep it",
        preConfirm: () => {
          this.didService.manageDID(action, data.id).subscribe(
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
            title: '<span style="color:#FFFFFF;">Activated!</span>',
            html:
              "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.did +
              "</span> <span style='color:#FFFFFF;'> has been activated.</span>",
            type: "success",
            background: "#000000",
            timer: 4000,
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: '<span style="color:#FFFFFF;">Cancelled</span>',
            html:
              "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
              data.did +
              "</span> <span style='color:#FFFFFF;'> is safe.</span>",
            type: "error",
            background: "#000000",
            timer: 4000,
          });
        }
      });
    }
  }

  releaseDID(data) {
    var user_id = localStorage.getItem("id");
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'> DID release may affect your destination services like IVR, Conference etc.</span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, release it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.didService
          .releaseDID(
            data.id,
            Number(user_id),
            data.fixrate,
            data.product_id,
            Number(data.did),
            data.country
          )
          .subscribe(
            (data) => {
              if (data.response == "1") {
                this.displayAllRecord();
              }
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
          title: '<span style="color:#FFFFFF;">Released!</span>',
          html:
            "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.did +
            "</span> <span style='color:#FFFFFF;'> has been released.</span>",
          type: "success",
          background: "#000000",
          timer: 4000,
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html:
            "<span style='color:#FFFFFF;'>DID </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            data.did +
            "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: "error",
          background: "#000000",
          timer: 4000,
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

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.destinationDid(data);
      case "active":
        return this.manageDid(data, actionType);
      case "inactive":
        return this.manageDid(data, actionType);
      case "release":
        return this.releaseDID(data);
      case "history":
        return this.showDIDFeatureHistory(data);
      case "master":
        this.makeMasterDID(data, actionType);
    }
  }

  public showDIDFeatureHistory(data) {
    const dialogRef = this.dialog.open(InfoDidfeatureDialog, {
      width: "80%",
      disableClose: true,
      data: data,
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.displayAllRecord();
    });
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(CustomerDIDDialog, {
      width: "80%",
      disableClose: true,
      data: { id: id ? id : null },
    });
    dialogRef.keydownEvents().subscribe((e) => {
      if (e.keyCode == 27) {
        dialogRef.close("Dialog closed");
      }
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCustomerDidDialog, {
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
    dialogRefInfo.afterClosed().subscribe((result) => { });
  }
}

@Component({
  selector: "infoCustomerDid-dialog",
  templateUrl: "infoCustomerDid-dialog.html",
})
export class InfoCustomerDidDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCustomerDidDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ""
  ) { }

  ngOnInit() {
    const element = document.querySelector("#scrollId");
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: "customer-did-dialog",
  templateUrl: "customer-did-dialog.html",
})
export class CustomerDIDDialog {
  destinationForm: FormGroup;
  submitted = false;
  checkForm: any;
  countryList = "";
  countryCode = "";
  error = "";
  didId = "";
  user_id = "";
  activeFeature: any[] = [];
  featuredropspace: any = [];
  FeatureFilter: any;
  filterFeature: any;
  destination_data: any[] = [];
  Destinationspace = [];
  DestinationFilter: any;
  didFeature: any;
  didDestination: any;
  filter: any;
  update = false;
  destinationId = "";
  did_num = "";
  isUrl: boolean = false;
  isVoicebot: boolean = false;
  customerId: any;
  extensionId: any;
  timeGroup_data: any[] = [];
  timespaceremove = [];
  TimeGroupFilter: any;
  filterTimeGroup: any;
  didTimeGroup: any;
  dynamic_ivr_url: any;
  voicebot: any;
  // url_dynamic_ivr: any;
  didActive = [];
  voicebotList = [];
  CIDdest = [
    {
      id: "0",
      name: "SIP",
    },
    {
      id: "1",
      name: "PSTN",
    },
  ];
  public fields: Object = { text: "feature", value: "id" };
  public placeholder: string = "Feature";
  public popupHeight: string = "200px";
  public popupWidth: string = "220px";
  public fields2: Object = { text: "name", value: "id" };
  public placeholder2: string = "Destination";
  public placeholder3: string = "Time Group";
  constructor(
    public dialogRef: MatDialogRef<CustomerDIDDialog>,
    @Inject(MAT_DIALOG_DATA) public data: "",
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private didService: DidService,
    private timegroupService: TimeGroupService
  ) {
    this.destinationForm = this.formBuilder.group({
      active_feature: ["", [Validators.required]],
      destination_id: ["", [Validators.required]],
      time_group_id: [""],
      url_dynamic_ivr: [""],
      voicebot: [""],
    });
  }

  get active_feature() {
    return this.destinationForm.get("active_feature");
  }
  get destination_id() {
    return this.destinationForm.get("destination_id");
  }
  get time_group_id() {
    return this.destinationForm.get("time_group_id");
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
    this.user_id = localStorage.getItem("id");
    this.didId = this.data["id"]["id"];
    this.did_num = this.data["id"]["did"];

    //get active feature

    //check destination
    setTimeout(() => {
      this.didService.getDIDDestination(this.user_id, this.didId).subscribe(
        (data) => {
          if (data["did"]["active_feature_id"] == "21") {
            this.dynamic_ivr_url = data["did"]["destination"];
          }
          setTimeout(() => {
            if (data["did"]["active_feature_id"] == "16") {
              this.voicebot = Number(data["did"]["destination_id"]);
            }
          }, 500);

          if (data.did.id > 0) {
            
            this.destinationId = data.did.id;
            this.didFeature = data.did.active_feature_id.toString();
            // this.didDestination = data.did.destination_id.toString();
            for (let index = 0; index < this.activeFeature.length; index++) {
              this.didActive.push(this.activeFeature[index]["id"]);
            }
            // if(this.didFeature != '19' && this.didActive.includes(this.didFeature)){
            if (this.didFeature != "19" && this.didFeature != "21") {
              
              if (this.didActive.includes(this.didFeature)) {
                this.didService
                .getDestination(this.user_id, this.didFeature)
                .subscribe((datas) => {
                  if(this.didFeature == '16'){
                    this.voicebotList = datas;
                    this.destinationForm.get("destination_id").clearValidators();
                    this.destinationForm.get("destination_id").updateValueAndValidity();
                    this.isVoicebot = true;
                  }else{
                    this.destination_data = datas; //imp
                  }
                    let promise = new Promise((resolve, reject) => {
                      setTimeout(() => {
                        resolve(data.did.destination_id);
                      }, 200);
                    });
                    if(this.didFeature == '16'){
                      promise.then((result) => {
                        this.destinationForm
                          .get("voicebot")
                          .setValue(Number(result));
                      });
                    }else{
                      promise.then((result) => {
                        this.destinationForm
                          .get("destination_id")
                          .setValue(Number(result));
                      });
                    }

                    let timepromise = new Promise((resolve, reject) => {
                      setTimeout(() => {
                        resolve(data.did.time_group_id);
                      }, 200);
                    });
                    timepromise.then((result) => {
                      this.destinationForm
                        .get("time_group_id")
                        .setValue(result);
                    });


                    if(this.didFeature == '16'){
                      this.destinationForm
                      .get("voicebot")
                      .setValue(data.did.destination_id);
                    this.filter = this.DestinationFilter =
                      this.destination_data.slice();
                    }else{
                      this.destinationForm
                        .get("destination_id")
                        .setValue(data.did.destination_id);
                      this.filter = this.DestinationFilter =
                        this.destination_data.slice();
                    }
                    this.update = true;
                  });
              } else {
                this.destinationForm.get("destination_id").setValue("");
              }
              this.didTimeGroup = Number(data.did.time_group_id);
            } else {
              this.isUrl = true;
              const destination_promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve((this.destination_data = this.CIDdest));
                }, 200);
              });
              destination_promise.then((result) => {
                this.didTimeGroup = Number(data.did.time_group_id);
                this.destinationForm
                  .get("destination_id")
                  .setValue(data.did.destination_id.toString());
              });
            }
          } else {
            this.didFeature = "";
            this.didDestination = "";
            this.didTimeGroup = "";
            this.update = false;
          }
        },
        (err) => {
          this.error = err.message;
        }
      );
    }, 1000);
    this.customOninit();
    //get time group
    if (localStorage.getItem("type") == "1") {
      this.customerId = localStorage.getItem("id");
      this.extensionId = 0;
    } else {
      this.customerId = 0;
      this.extensionId = localStorage.getItem("id");
    }
    this.timegroupService
      .viewTimeGroup({
        id: null,
        name: null,
        customer_id: Number(this.customerId),
        extension_id: this.extensionId,
        role: Number(localStorage.getItem("type")),
      })
      .subscribe(
        (pagedData) => {
          this.timeGroup_data = pagedData;
          this.timeGroup_data.unshift({ id: 0, name: "Select Time Group" });

          this.filterTimeGroup = this.TimeGroupFilter =
            this.timeGroup_data.slice();
        },
        (err) => {
          this.error = err.message;
        }
      );
  }

  customOninit() {
    this.didService.getActiveFeature(this.user_id).subscribe(
      (data) => {
        if (data[0]["appointment"] == "0") {
          this.destinationForm.get("active_feature").setValue("");
        }
        if (data[0].appointment == "1") {
          this.activeFeature.push({ id: "13", feature: "Appointment" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].conference == "1") {
          this.activeFeature.push({ id: "3", feature: "Conference" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].call_group == "1") {
          this.activeFeature.push({ id: "5", feature: "Call Group" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].CID_routing == "1") {
          this.activeFeature.push({ id: "19", feature: "CID Routing" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].ivr == "1") {
          this.activeFeature.push({ id: "2", feature: "IVR" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].playback == "1") {
          this.activeFeature.push({ id: "12", feature: "Playback" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].queue == "1") {
          this.activeFeature.push({ id: "4", feature: "Queue" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        this.activeFeature.push({ id: "1", feature: "SIP" });
        this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        if (data[0].tele_consultancy == "1") {
          this.activeFeature.push({ id: "10", feature: "Tele Consultation" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].dynamic_ivr == "1") {
          this.activeFeature.push({ id: "21", feature: "Dynamic IVR" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].voicebot == "1") {
          this.activeFeature.push({ id: "16", feature: "Voicebot" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
        if (data[0].sip_trunk == "1") {
          this.activeFeature.push({ id: "20", feature: "SIP Trunk" });
          this.filterFeature = this.FeatureFilter = this.activeFeature.slice();
        }
      },
      (err) => {
        this.error = err.message;
      }
    );
  }

   async submitdestinationForm() {
    if (this.destinationForm.valid) {

      let voicebotValue = this.destinationForm.get('voicebot').value;

      this.submitted = true;
      const credentials = await this.destinationForm.value;
      let feature = this.destinationForm.get("appointment");
      // if(Number(feature) == 0){
      //   this.toastr.success('error!','Invalid Form.', { timeOut: 2000 });
      //   return;
      // }else{
      if (credentials.active_feature == "1") {
        var destination = "sip_" + credentials.destination_id;
      } else if (credentials.active_feature == "2") {
        var destination = "ivr_" + credentials.destination_id;
      } else if (credentials.active_feature == "3") {
        var destination = "conf_" + credentials.destination_id;
      } else if (credentials.active_feature == "4") {
        var destination = "queue_" + credentials.destination_id;
      } else if (credentials.active_feature == "5") {
        var destination = "cg_" + credentials.destination_id;
      } else if (credentials.active_feature == "10") {
        var destination = "tc_" + credentials.destination_id;
      } else if (credentials.active_feature == "11") {
        var destination = "broadcast_" + credentials.destination_id;
      } else if (credentials.active_feature == "12") {
        var destination = "playback_" + credentials.destination_id;
      } else if (credentials.active_feature == "13") {
        var destination = "appointment_" + credentials.destination_id;
      } else if (credentials.active_feature == "19") {
        var destination = "cid_" + credentials.destination_id;
      } else if (credentials.active_feature == "21") {
        var destination = "dynamic_ivr_" + credentials.destination_id;
      } else if (credentials.active_feature == "16") {
        var destination = "voicebot_" + credentials.voicebot;
      } else if (credentials.active_feature == "20") {
        var destination = "trunk_" + credentials.destination_id;
      }
      credentials.user_id = Number(this.user_id);
      credentials["did_id"] = this.didId;
      credentials.destination = destination;
      credentials.product_id = Number(localStorage.getItem("product_id"));
      let path = this.destinationId ? "updateDestination" : "createDestination";
      if (credentials["active_feature"] == "16") {
        credentials["destination_id"] = credentials["voicebot"];
        this.voicebotList.find((item) => {
          if (item.id == credentials.destination_id) {
            credentials["name"] = item.name;
          }
          return credentials["name"];
        });
      }else{
        this.destination_data.find((item) => {
          if (item.id == credentials.destination_id) {
            credentials["name"] = item.name;
          }
          return credentials["name"];
        });
      }
      credentials["active_feature"] = Number(credentials["active_feature"]);
      credentials['destination_id'] = Number(credentials['destination_id']);      

      this.didService.createDestination(path, credentials).subscribe(
        (data) => {
          let msg = this.destinationId
            ? destinationUpdated
            : destinationCreated;
          this.toastr.success("Success!", msg, { timeOut: 2000 });
          this.didService.updateGridList();
          this.dialogRef.close();
        },
        (err) => {
          this.error = err;
          this.toastr.error("Error!", errorMessage, { timeOut: 2000 });
        }
      );
    }
    // }
    else {
      this.toastr.error("Error!", invalidForm, { timeOut: 2000 });
    }
  }
  Featureremovedspace(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.activeFeature.filter((data) => {
      return data["feature"].toLowerCase().includes(promptspace);
    });
    event.updateData(promptData);
  }

  getDestinationList(event) {
    // let feature = event.value;
    let feature = event["itemData"].id;
    this.destinationForm.get("destination_id").setValue("");
    this.destination_data = [];
    if (feature == "21") {
      this.isUrl = true;
      this.isVoicebot = false;
      this.destinationForm.get("destination_id").clearValidators();
      this.destinationForm.get("destination_id").updateValueAndValidity();
      this.destinationForm.get("voicebot").setValue("");
      this.destinationForm.get("voicebot").clearValidators();
      this.destinationForm.get("voicebot").updateValueAndValidity();
      this.destinationForm
        .get("url_dynamic_ivr")
        .setValidators([Validators.required]);
      this.destinationForm.get("url_dynamic_ivr").updateValueAndValidity();
    } else if (feature == "16") {
      this.isVoicebot = true;
      this.isUrl = false;
      this.destinationForm.get("destination_id").clearValidators();
      this.destinationForm.get("destination_id").updateValueAndValidity();
      this.destinationForm.get("voicebot").setValidators([Validators.required]);
      this.destinationForm.get("voicebot").updateValueAndValidity();
      this.destinationForm.get("url_dynamic_ivr").setValue("");
      this.destinationForm.get("url_dynamic_ivr").clearValidators();
      this.destinationForm.get("url_dynamic_ivr").updateValueAndValidity();
    } else {

      
      this.destinationForm
        .get("destination_id")
        .setValidators(Validators.required);
      this.destinationForm.get("destination_id").updateValueAndValidity();
      this.destinationForm.get("url_dynamic_ivr").setValue("");
      this.destinationForm.get("url_dynamic_ivr").clearValidators();
      this.destinationForm.get("url_dynamic_ivr").updateValueAndValidity();
      this.destinationForm.get("voicebot").setValue("");
      this.destinationForm.get("voicebot").clearValidators();
      this.destinationForm.get("voicebot").updateValueAndValidity();
      this.isUrl = false;
      this.isVoicebot = false;
    }
    // this.timeGroup_data = [];
    this.didDestination = [];
    if (feature != "19" && feature != "21" && feature != "16") {
      this.didService
        .getDestination(this.user_id, feature)
        .subscribe((data) => {
          // this.destinationForm.controls.time_group_id.clearValidators();
          // this.destinationForm.controls.time_group_id.updateValueAndValidity();
          // this.destinationForm.get('time_group_id').setValue('');
          this.destination_data = data;
          this.filter = this.DestinationFilter = this.destination_data.slice();
        });
    } else if (feature == "16") {
      this.didService
        .getVoicebotByCustId(localStorage.getItem("id"))
        .subscribe((data) => {
          this.destination_data = data.response;
          this.voicebotList = data.response;
        });
    } else {
      this.destinationForm.get("destination_id").reset();
      // this.destinationForm.get('time_group_id').reset();
      this.destination_data = this.CIDdest;
    }
    // }
  }
  Destinationremovedspace(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.destination_data.filter((data) => {
      return data["name"].toLowerCase().includes(promptspace);
    });
    event.updateData(promptData);
  }
  Timeremovedspace(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.timeGroup_data.filter((data) => {
      return data["name"].toLowerCase().includes(promptspace);
    });
    event.updateData(promptData);
  }

  cancelForm() {
    this.destinationForm.reset();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }
}
@Component({
  selector: "infodidfeature-dialog",
  templateUrl: "infodidfeature-dialog.html",
})
export class InfoDidfeatureDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoDidfeatureDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AllDID,
    private didService: DidService,
    private fb: FormBuilder
  ) { }

  didHistoryList: [];
  firstIndex: any;
  LastIndex: any;
  ngOnInit() {
    if (this.data.id) {
      let user_id = localStorage.getItem("id");
      let id = this.data.id;
      let didFeature = this.data["active_feature_id"];
      this.didService.getAllFeatureDIDHistory(id).subscribe((pagedData) => {
        for (let index = 0; index < pagedData.length; index++) {
          const element = pagedData[index];
          this.firstIndex = element["assigned_to"].split("_")[0];
          this.LastIndex = element["assigned_to"].split("_")[1];
          pagedData[index].firstIndex = this.firstIndex;
          pagedData[index].LastIndex = this.LastIndex;
        }
        this.didHistoryList = pagedData ? pagedData : [];
      });
    }
  }
  cancleDialog(e): void {
    this.dialogRefInfo.close();
    e.preventDefault();
  }
}
