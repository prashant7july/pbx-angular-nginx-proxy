import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { NavigationEnd, Router } from "@angular/router";
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import "jspdf-autotable";
import Swal from "sweetalert2";
import { CommonService, ExcelService } from "../../../core";
import { IVRService } from "../ivr.service";

declare const ExcelJS: any;

@Component({
  selector: "app-view-ivr",
  templateUrl: "./view-ivr.component.html",
  styleUrls: ["./view-ivr.component.css"],
})
export class ViewIvrComponent implements OnInit {
  filterForm: FormGroup;
  defaultPageSize: any = "10";
  packageData = "";
  error = "";
  userType = "";
  html = "";
  data = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  errorField = "";
  exportData: any = {};

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private ivrService: IVRService,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      by_name: [""],
      by_ivr_category: [""],
    });
  }

  ngOnInit() {
    this.displayAllRecord();
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 15 },
      { field: "id", headerName: "ID", hide: true, width: 10 },
      { field: "display_name", headerName: "Name", hide: false, width: 20 },
      {
        field: "welcomePrompt",
        headerName: "Welcome Prompt",
        hide: false,
        width: 15,
      },
      {
        field: "repeatPrompt",
        headerName: "Repeat Prompt",
        hide: false,
        width: 15,
      },
      {
        field: "timeout_prompt",
        headerName: "Timeout Prompt",
        hide: false,
        width: 15,
      },
      {
        field: "invalid_prompt",
        headerName: "Invalid Prompt",
        hide: false,
        width: 15,
      },
      {
        field: "digit_timeout",
        headerName: "Digit Timeout",
        hide: false,
        width: 15,
      },
      {
        field: "max_timeout",
        headerName: "Max Timeout Try",
        hide: false,
        width: 15,
      },
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.user_id = localStorage.getItem("id");
      this.ivrService.filterBasicIVR(credentials).subscribe(
        (data) => {
          // this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: data });
        },
        (err) => {
          this.error = err.message;
        }
      );
    } else {
      this.ivrService
        .getIVRMaster({
          id: null,
          name: null,
          customer_id: localStorage.getItem("id"),
        })
        .subscribe(
          (data) => {
            data = this.manageUserActionBtn(data);
            this.dataSource = [];
            this.dataSource.push({ fields: this.columnDefs, data: data });
          },
          (err) => {
            this.error = err.message;
          }
        );
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = "";
      let nameBtn = "";
      nameBtn += "<span>";
      nameBtn += data[i].name;
      if (data[i]["is_multilevel_ivr"]) {
        nameBtn +=
          "<i class='fa fa-level-down edit-button' style='float:right; display: inline' title='Child IVR'></i>";
      }
      if (data[i]["feedback_call"]) {
        nameBtn +=
          "<i class='fa fa-comments-o edit-button' style='float:right; display: inline' title='Feedback IVR'></i>";
      }
      nameBtn += "</span>";

      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      if (data[i]["flag"] == 1) {
        finalBtn +=
          "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewAssociateIVR' title='Associate IVR'></i>";
      }
      finalBtn +=
        "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
      data[i]["action"] = finalBtn;
      data[i]["display_name"] = nameBtn;
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
      case "viewAssociateIVR":
        return this.showAssociateIVR(data);
    }
  }

  editData(event) {
    this.router.navigate(["ivr/view/manage"], {
      queryParams: { id: event.id },
    });
  }

  showAssociateIVR(data) {
    this.router.navigate(["ivr/view/associate-ivr"], {
      queryParams: {
        ivrId: data.id,
        ivrName: data.name,
        multilevel_ivr: data.is_multilevel_ivr,
      },
    });
  }

  deleteData(event) {
    this.ivrService.getAllAssociatedIVR(event.id, false).subscribe((data) => {
      if (data.length > 0) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html:
            "<span style='color:#FFFFFF;'>IVR </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            event.name +
            "</span> <span style='color:#FFFFFF;'> can't be deleted because it has main IVR.</span>",
          type: "error",
          background: "#000000",
          timer: 3000,
        });
      } else {
        this.ivrService
          .getIVRCount(event.id, localStorage.getItem("id"))
          .subscribe((data) => {
            if (data.count > 0) {
              Swal.fire({
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                html:
                  "<span style='color:#FFFFFF;'>IVR </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
                  event.name +
                  "</span> <span style='color:#FFFFFF;'> can't be deleted because it is " +
                  data.message,
                type: "error",
                background: "#000000",
                timer: 3000,
              });
            } else {
              Swal.fire({
                title: '<span style="color:#FFFFFF;">Are you sure?</span>',
                html:
                  " <span style='color:#FFFFFF;'>You will not be able to recover IVR </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
                  event.name +
                  "</span><span style='color:#FFFFFF;'> in future.</span>",
                type: "warning",
                showCancelButton: true,
                background: "#000000",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, keep it",
                preConfirm: () => {
                  this.ivrService
                    .deleteBasicIVR({ id: event.id })
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
                      "<span style='color:#FFFFFF;'>IVR </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
                      event.name +
                      "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
                    type: "success",
                    background: "#000000",
                    timer: 2000,
                  });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  Swal.fire({
                    title: '<span style="color:#FFFFFF;">Cancelled</span>',
                    html:
                      "<span style='color:#FFFFFF;'>IVR </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
                      event.name +
                      "</span> <span style='color:#FFFFFF;'> is safe :)",
                    type: "error",
                    background: "#000000",
                    timer: 2000,
                  });
                }
              });
            }
          });
      }
    });
  }

  basicIVR() {
    this.router.navigateByUrl("ivr/view/master");
  }

  advanceIVR() {
    this.router.navigateByUrl("ivr/view/create");
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoIVRDialog, {
      width: "60%",
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
  selector: "infoIVR-dialog",
  templateUrl: "infoIVR-dialog.html",
})
export class InfoIVRDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoIVRDialog>,
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
