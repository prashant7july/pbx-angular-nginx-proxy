import { Component, OnInit } from "@angular/core";
import Swal from "sweetalert2";
import { environment } from "../../../../environments/environment.prod";
// import { RecordingService } from '../recording.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { Router, NavigationEnd } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  Errors,
  CommonService,
  ExcelService,
  invalidForm,
  Number_RegEx,
} from "../../../core";
import { RecordingService } from "../../recording/recording.service";
import { AllCommunityModules, Module } from "@ag-grid-enterprise/all-modules";

const uname = localStorage.getItem("uname");
const URL = environment.api_url + "recording/";
export let imagePath: any;
let _validFileExtensions = [".wav"];

@Component({
  selector: "app-view-tc-recording",
  templateUrl: "./view-tc-recording.component.html",
  styleUrls: ["./view-tc-recording.component.css"],
})
export class ViewTcRecordingComponent implements OnInit {
  columnDefs: any;
  currentPage: any;
  dataSource: any = [];
  rowData: any;
  error = "";
  defaultPageSize = "10";
  filterForm: FormGroup;
  isFilter = false;
  totalRecords: any = [];
  specificGridOptions: any = {
    columnDefs: this.columnDefs,
    rowData: this.rowData || null,
    rowModelType: "infinite",
    modules: AllCommunityModules,
    //cacheOverflowSize: 3,
    //maxBlocksInCache: 3,
    // enableColResize: true,
    pagination: false,
    suppressHorizontalScroll: true,
    scrollbarWidth: 10,
    rowSelection: "Multiple",
    // resizable: true,

    colResizeDefault: "Shift",

    enableSorting: false, // to stop column sorting
    enableServerSideSorting: false, // to stop column sorting
    localeText: { noRowsToShow: "No Record Found" },
    defaultColDef: {
      suppressFilter: false, // to stop column sorting
      suppressMovable: true,
      filter: false, // to stop column sorting
      resizable: true,
    },
  };
  

  constructor(
    private recordingService: RecordingService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public commonService: CommonService
  ) {
    this.filterForm = this.fb.group({
      by_range: [""],
      by_src: [""],
      by_dest: [""],
    });
  }

  ngOnInit() {
    this.recordingService.getSavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    let userRole = localStorage.getItem("type") == "1" ? false : true;

    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 10 },
      { field: "id", headerName: "ID", hide: true, width: 10 },
      { field: "name", headerName: "Name", hide: true, width: 10 },
      { field: "file_type", headerName: "File Type", hide: true, width: 10 },
      { field: "extension", headerName: "Caller", hide: userRole, width: 10 },
      { field: "callee_ext", headerName: "Callee", hide: false, width: 10 },
      { field: "time", headerName: "Date", hide: false, width: 10 },
      {
        field: "recording",
        headerName: "Play Recording",
        hide: false,
        width: 10,
      },
    ];
    const page = this.currentPage || 1; // current page
    const pageSize = this.defaultPageSize || 10; // default page size
    const offset = (page - 1) * Number(pageSize);
    // if (this.isFilter) {
    //   const credentials = this.filterForm.value;
    //   credentials.user_id = Number(localStorage.getItem("id"));
    //   credentials.role = Number(localStorage.getItem("type"));
    //   credentials.type = "normalRecording";
    //   credentials.offset = offset;
    //   credentials.limit = pageSize;
    //   credentials.limit_flag = 1;
    //   this.recordingService.filterRecordingList(credentials).subscribe(
    //     (pagedData) => {
    //       this.totalRecords = pagedData.total;
    //       pagedData.response = this.manageUserActionBtn(pagedData.response);
    //       this.dataSource = [];
    //       this.dataSource.push({
    //         fields: this.columnDefs,
    //         data: pagedData.response,
    //       });
    //     },
    //     (err) => {
    //       this.error = err.message;
    //     }
    //   );
    // } else
    //  {
    //   const credentials = this.filterForm.value;
    //   credentials.user_id = Number(localStorage.getItem("id"));
    //   credentials.role = Number(localStorage.getItem("type"));
    //   credentials.type = "normalRecording";
    //   credentials.offset = offset;
    //   credentials.limit = pageSize;
    //   credentials.limit_flag = 1;
    //   this.recordingService
    //     .filterRecordingList(credentials)
    //     .subscribe((pagedData) => {
    //       this.totalRecords = pagedData.total;

    //       setTimeout(() => {
    //         pagedData = this.manageUserActionBtn(pagedData.response);
    //       }, 500);
    //       this.dataSource = [];
    //       this.dataSource.push({
    //         fields: this.columnDefs,
    //         data: pagedData.response,
    //       });
    //     });
    // }

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.user_id = Number(localStorage.getItem("id"));
      credentials.role = Number(localStorage.getItem("type"));
      credentials.type = "normalRecording";
      credentials.offset = offset;
      credentials.pageSize = pageSize;
      credentials.limit_flag = 1;
      this.recordingService.filterRecordingList(credentials).subscribe(
        (pagedData) => {          
          this.totalRecords = pagedData.total;
          pagedData = this.manageUserActionBtn(pagedData.response);
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
      const credentials = this.filterForm.value;
      credentials.user_id = Number(localStorage.getItem("id"));
      credentials.role = Number(localStorage.getItem("type"));
      credentials.type = "normalRecording";
      credentials.offset = offset;
      credentials.pageSize = pageSize;
      credentials.limit_flag = 1;
      // Remove by_range from credentials if not in filter mode
      delete credentials.by_range;
      this.recordingService.filterRecordingList(credentials).subscribe(
        (pagedData) => {          
            this.totalRecords = pagedData.total;
            pagedData = this.manageUserActionBtn(pagedData.response);          
          this.dataSource = [];
          this.dataSource.push({
            fields: this.columnDefs,
            data: pagedData,
        });                    
        }
      );
    }
    
  }
  onPageChanged(page: number) {
    this.currentPage = page;
    this.displayAllRecord();
  }

  // onPageSizeChanged(newPageSize) {
  //   let value = newPageSize.value;
  //   this.defaultPageSize = value;
  // }
  onPageSizeChanged(event: any) {
    this.defaultPageSize = event.value;
    this.displayAllRecord();
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = "";
      let filePath = "";
      finalBtn += "<span>";
      finalBtn +=
        "<a href='" +
        pagedData[i].file_path +
        "' download='" +
        pagedData[i].file_path +
        "' style='margin-left:10px'><i class='fa fa-download edit-button' style='cursor:pointer; display: inline' data-action-type='download' title='Download'></i></a> ";
      finalBtn +=
        "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";

      filePath =
        '<audio controls="" preload="none" height="32" style="float:left; margin-left:5px; width: 85%;">\
    <source src="' +
        pagedData[i].file_path +
        '" type="audio/wav"/>audio isn\'t supported.</audio>';

      pagedData[i]["action"] = finalBtn;
      pagedData[i]["recording"] = filePath;
    }

    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "delete":
        return this.deleteRecording(data);
      case "download":
        return this.downloadRecording(data);
    }
  }

  public downloadRecording(data) {}

  deleteRecording(data) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: "You will not be able to recover this Recording in future!",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.recordingService
          .deleteRecording({
            filename: data.name,
            id: Number(localStorage.getItem("id")),
            role: Number(localStorage.getItem("type")),
          })
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
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          text: "Recording has been deleted.",
          type: "success",
          background: "#000000",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: "Recording is safe :)",
          type: "error",
          background: "#000000",
        });
      }
    });
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoRecordingDialog, {
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

  resetTable() {
    this.filterForm.controls.by_range.clearValidators();
    this.filterForm.controls.by_range.setValue('');
    this.filterForm.controls.by_range.updateValueAndValidity();
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
}

