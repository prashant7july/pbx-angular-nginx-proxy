import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { CommonService } from "../../../core";
import { DateAdapter } from "@angular/material";
import { UserTypeConstants } from "src/app/core/constants";
import { BackendApiServiceService } from "../backend-api-service.service";
import { ToastrService } from "ngx-toastr";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: "app-view-audit-logs",
  templateUrl: "./view-audit-logs.component.html",
  styleUrls: ["./view-audit-logs.component.css"],
})
export class ViewAuditLogsComponent implements OnInit {
  error = "";
  isFilter = false;
  filterForm: FormGroup;
  hoverdata: any;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  viewButton: boolean = true;
  editButton: boolean = true;
  deleteButton: boolean = true;
  packageList = "";
  selectedValue = "";
  defaultPageSize = "10";
  ParamData: any;
  maxDate: Date;
  todayDate: Date;
  loginUserType = localStorage.getItem("type");
  showNotInsertedValue = false;
  BindData: any = "";
  tooltipContent: any = "";
  userID: any = "";

  constructor(
    public commonService: CommonService,
    private logService: BackendApiServiceService,
    private dateAdapter: DateAdapter<Date>,
    private toastr: ToastrService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.maxDate = new Date();
    this.dateAdapter.setLocale("en-GB");
    this.filterForm = this.fb.group({
      by_type: [""],
      by_date: [""],
    });
  }

  ngOnInit() {
    this.userID = localStorage.getItem("id");
    this.displayAllRecord();
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: "id", headerName: "ID", hide: true, width: 150 },
      { field: 'action', headerName: 'Action', hide: false, width: 200 },
      { field: "module_name", headerName: "Module Name", hide: false, width: 200 },
      { field: "module_action_name", headerName: "Name", hide: false, width: 200 },
      { field: "message", headerName: "Message", hide: false, width: 200 },
    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.logService.getAuditLogByFilter(credentials).subscribe((res) => {
        const data = this.manageUserActionBtn(res.response);
        this.dataSource = [];
        this.dataSource.push({ fields: this.columnDefs, data });
      });
    } else {
      this.logService.getAuditLog().subscribe((res) => {
        const data = this.manageUserActionBtn(res.response);
        this.dataSource = [];
        this.dataSource.push({ "fields": this.columnDefs, data });
      })
    }

  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let allFeatures: any;
      var cause = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='history' title='History'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "history":
        return this.showhistory(data);
    }
  }

  public showhistory(data) {
    const dialogRef = this.dialog.open(AuditLogInfoDialog, { width: '80%', disableClose: true, data: data });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      //console.log('Dialog closed');
      this.displayAllRecord();
    });
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
}


@Component({
  selector: 'audit-log-dialog',
  templateUrl: 'audit-log-dialog.html',
  styles: [`.switch-div{
    border-right: 1px solid #09aee4;
}
.serviceStatus{
    width: 25px;
}
::ng-deep 
.card-body {
    padding: 25px;
}
.toggle-button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #333;
  cursor: pointer;
}

.toggle-button:disabled {
  background-color: #eee;
  color: #999;
  cursor: not-allowed;
}

.key-column {
  padding-right: 10px; /* Adjust as needed */
}

.value-column {
  padding-left: 10px; /* Adjust as needed */
}
`]
})

export class AuditLogInfoDialog {

  constructor(
    public dialogRefInfo: MatDialogRef<AuditLogInfoDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private logService: BackendApiServiceService, private fb: FormBuilder) { }

  filterForm: FormGroup;
  packageLogList: any;
  fetchData = []
  ngOnInit() {
    let obj = {
      module_action_id :this.data.module_action_id,
      module_action_name: this.data.module_name
    }    
    this.logService.getAuditInfo(obj, this.data.customer_id).subscribe((res) => {
      for (let i = 0; i < res.length; i++) {
        res[i].features = JSON.parse(res[i].features)
      }
      this.packageLogList = res ? res : []
      console.log(this.packageLogList,"packageLogList")
    })
  }
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  chunkArray(array: any[], size: number): any[] {    
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArray.push(array.slice(i, i + size));
    }
    return chunkedArray;
  }


  cancleDialog(e): void {
    this.dialogRefInfo.close();
    e.preventDefault();
  }
}