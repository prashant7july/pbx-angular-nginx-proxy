import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import Swal from "sweetalert2";
import {
  CommonService,
  Errors,
  ExcelService,
  GatewayGroup,
  GatewayService,
  groupError,
  Name_RegEx,
} from "../../../core";

@Component({
  selector: "app-view-gateway-group",
  templateUrl: "./view-gateway-group.component.html",
  styleUrls: ["./view-gateway-group.component.css"],
})
export class ViewGatewayGroupComponent implements OnInit {
  error = "";
  filterForm: FormGroup;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  providerList = "";
  exportData: any = {};

  constructor(
    private fb: FormBuilder,
    private gatewayService: GatewayService,
    public dialog: MatDialog,
    public commonService: CommonService,
    private excelService: ExcelService
  ) {
    this.filterForm = this.fb.group({
      by_name: [""],
      by_group: [""],
    });
  }

  ngOnInit() {
    this.gatewayService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    //get Providers list
    this.commonService.getProviders().subscribe(
      (data) => {
        this.providerList = data.response;
      },
      (err) => {
        this.error = err.message;
      }
    );
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: "id", headerName: "ID", hide: true, width: 10 },
      { field: "name", headerName: "Name", hide: false, width: 20 },
      { field: "gateway", headerName: "Gateway Group", hide: false, width: 30 },
      { field: "action", headerName: "Action", hide: false, width: 20 },
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.gatewayService.filterGatewayGroup(credentials).subscribe(
        (data) => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: data });
        },
        (err) => {
          this.error = err.message;
        }
      );
    } else {
      this.gatewayService
        .viewGatewayGroup({ id: null, name: null })
        .subscribe((data) => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ fields: this.columnDefs, data: data });
        });
    }
  }

  exportToExcel(): void {
    let arr: any = [];
    for (let i = 0; i < this.exportData.length; i++) {
      arr.push({
        Name: this.exportData[i].name,
        GatewayGroup: this.exportData[i].gateway,
      });
    }
    this.excelService.exportAsExcelFile(arr, "report");
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = "";
      finalBtn += "<span>";
      finalBtn +=
        "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn +=
        "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";

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
        return this.editGatewayGroup(data);
      case "delete":
        return this.deleteGatewayGroup(data);
    }
  }

  editGatewayGroup(event) {
    this.openDialog(event.id);
  }
  deleteGatewayGroup(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: "You will not be able to recover this Gateway group!",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.gatewayService
          .deleteGatewayGroup({ id: event.id })
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
          text: "Gateway Group has been deleted.",
          type: "success",
          background: "#000000",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: "Gateway Group is safe :)",
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

  openDialog(id?): void {
    const dialogRef = this.dialog.open(GatewayGroupDialog, {
      width: "60%",
      disableClose: true,
      data: { id: id ? id : null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Dialog closed");
    });
  }
}

@Component({
  selector: "gatewaygroup-dialog",
  templateUrl: "gatewaygroup-dialog.html",
})
export class GatewayGroupDialog {
  errors: Errors = { errors: {} };
  gatewayGroupForm: FormGroup;
  submitted = false;
  sourceGroup: any[] = [];
  targetGroup: any[] = [];
  checkForm: any;
  error = "";
  sessionId = "";
  gatewayGroupData: any = {};
  gatewayGroupName = false;
  errorField = "";

  constructor(
    public dialogRef: MatDialogRef<GatewayGroupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: GatewayGroup,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private gatewayService: GatewayService,
    public commonService: CommonService
  ) {
    this.gatewayGroupForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.pattern(Name_RegEx)]],
      group: [""],
      description: [""],
    });
  }

  get name() {
    return this.gatewayGroupForm.get("name");
  }

  ngOnInit() {
    this.sourceGroup = [];
    this.targetGroup = [];
    if (this.data.id) {
      this.gatewayService
        .viewGatewayGroup({ id: this.data.id, name: null })
        .subscribe(
          (data) => {
            this.gatewayGroupData = data[0];
            let grpArr: any = [];
            let tarArr: any = [];
            grpArr = data;
            let tArr = [];
            let sArr = [];
            for (let i = 0; i < grpArr.length; i++) {
              sArr = grpArr[i].gatewayId.split(",");
              tArr = grpArr[i].gateway.split(",");
            }
            // console.log('tArr', tArr);
            // console.log('sArr', sArr);
            for (let j = 0; j < tArr.length; j++) {
              tarArr.push({ id: sArr[j], group: tArr[j] });
            }
            // console.log('this.targetGroup mArr=', tarArr);
            this.targetGroup = tarArr;

            this.gatewayService.getGatewayName().subscribe(
              (data) => {
                let source: any = [];
                for (let i = 0; i < data.response.length; i++) {
                  source.push({
                    id: data.response[i].id,
                    group: data.response[i].gatewayName,
                  });
                }
                // source = data.response;
                for (let i = 0; i < tarArr.length; i++) {
                  for (let j = 0; j < source.length; j++) {
                    if (tarArr[i].group == source[j].group) {
                      source.splice(j, 1);
                    }
                  }
                }
                this.sourceGroup = source;
              },
              (err) => {
                this.errors = err.message;
              }
            );
          },
          (err) => {
            this.errors = err.message;
          }
        );
    } else {
      this.gatewayService.getGatewayName().subscribe(
        (data) => {
          // console.log(data);
          for (let i = 0; i < data.response.length; i++) {
            this.sourceGroup.push({
              id: data.response[i].id,
              group: data.response[i].gatewayName,
            });
          }
        },
        (err) => {
          this.errors = err.message;
        }
      );
    }
  }

  submitGatewayGroupForm() {
    var value: any = [];
    this.checkForm = this.findInvalidControls();
    if (this.gatewayGroupForm.valid) {
      this.submitted = true;
      const credentials = this.gatewayGroupForm.value;
      credentials.id = this.data.id ? this.data.id : null;
      for (let i = 0; i < this.targetGroup.length; i++) {
        value.push(this.targetGroup[i].id);
      }
      credentials.group = value;

      if (credentials.group == "") {
        this.toastr.error("Error!", groupError, { timeOut: 2000 });
        return;
      }

      if (this.gatewayGroupName == true) {
        this.toastr.error("Error!", this.errorField, { timeOut: 4000 });
        return;
      }

      this.gatewayService
        .createGatewayGroup("createGatewayGroup", credentials)
        .subscribe((data) => {
          if (data["code"] == 200) {
            this.toastr.success("Success!", data["message"], { timeOut: 2000 });
            this.cancelForm();
          } else {
            this.toastr.error("Error!", data["message"], { timeOut: 2000 });
          }
        });
    }
  }

  cancelForm() {
    this.gatewayGroupForm.reset();
    this.gatewayService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.gatewayGroupForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  verifyName(e) {
    this.gatewayService
      .viewGatewayGroup({ id: null, name: this.gatewayGroupData.name })
      .subscribe(
        (data) => {
          if (!data) {
            this.gatewayGroupName = false;
          } else if (data["code"]) {
            this.errorField = data["message"];
            this.toastr.error("Error!", this.errorField, { timeOut: 4000 });
            this.gatewayGroupData.name = "";
            this.gatewayGroupName = true;
            return;
          } else {
            this.gatewayGroupName = false;
          }
        },
        (err) => {
          this.error = err.message;
        }
      );
  }
}
