import { Component, OnInit, Inject, } from '@angular/core';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment.prod';
import { RecordingService } from '../recording.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Errors, CommonService, ExcelService, invalidForm, Number_RegEx } from '../../../core';
import { BackendAPIIntegrationService } from 'src/app/core/services/backend-api-integration.service';
import { AllCommunityModules, Module } from "@ag-grid-enterprise/all-modules";


const uname = localStorage.getItem('uname');
const URL = environment.api_url + 'recording/';
export let imagePath: any;
let _validFileExtensions = [".wav"];

@Component({
  selector: 'app-recoding-features',
  templateUrl: './recoding-features.component.html',
  styleUrls: ['./recoding-features.component.css']
})
export class RecodingFeaturesComponent implements OnInit {
  columnDefs: any;
  dataSource: any = [];
  totalRecords: any = [];
  currentPage: any;
  rowData: any;
  error = "";
  defaultPageSize = '10';
  filterForm: FormGroup;
  isFilter = false;
  userType; 
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
    public commonService: CommonService,
    private backendIntegrationService:BackendAPIIntegrationService
  ) {
    this.filterForm = this.fb.group({
      'by_range': [""],
      'by_src': [""],
      'by_dest': [""],
    });
  }

  ngOnInit() {
    this.userType =  localStorage.getItem('type') == '1' ? true : false;
    this.recordingService.getSavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    let userRole = localStorage.getItem('type') == '1' ? false : true;

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100},
      { field: 'id', headerName: 'ID', hide : false , width: 100 },
      { field: 'name', headerName: 'Name', hide: true, width: 200 },
      // { field: 'file_type', headerName: 'File Type', hide: false, width: 10 },
      { field: 'call_type', headerName: 'Call Type', hide: false, width: 200 },
      { field: 'extension', headerName: 'Caller', hide: userRole, width: 200 },
      { field: 'callee_ext', headerName: 'Callee', hide: false, width: 200 },
      { field: 'time', headerName: 'Date', hide: false, width: 200 },
      { field: 'recording', headerName: 'Play Recording', hide: false, width: 300 },

    ];
    const page = this.currentPage || 1; // current page
    const pageSize = this.defaultPageSize || 10; // default page size
    const offset = (page - 1) * Number(pageSize);

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.user_id = Number(localStorage.getItem('id'));
      credentials.role = Number(localStorage.getItem('type'));
      credentials.by_dest = Number(credentials.by_dest);
      credentials.by_src = Number(credentials.by_src);
      credentials.type = 'normalRecording';
      credentials.offset = offset;
      credentials.pageSize = pageSize;
      credentials.limit_flag = 1;
      this.recordingService.filterRecordingList(credentials).subscribe(response => {
        let pagedData = response.response
        this.totalRecords = response.total;

        // let dateData = response['dateArr'];
        // let otherData = response['arr'];
        // var credentials_data = JSON.parse(JSON.stringify(credentials));
        // if (otherData.length) {
        //   let rangeFilterData: any = [] = dateData;
        //   if (credentials_data['by_src'] != '' && credentials_data['by_dest'] != '' && credentials_data['by_range'] != '') { // Case 1
        //     let callerFilterData = otherData.filter(item => (item.extension).includes(credentials_data['by_src']));
        //     let calleeFilterData = otherData.filter(item => (item.callee_ext).includes(credentials_data['by_dest']))
        //     let rangeFilterData = dateData;
        //     let caller_callee = callerFilterData.filter(x => calleeFilterData.includes(x));
        //     pagedData = [];
        //     for (const x of rangeFilterData) {
        //       for (const y of caller_callee) {
        //         if (x.id == y.id) {
        //           pagedData.push(x);
        //         }
        //       }
        //     }

        //   } else if (credentials_data['by_src'] != '' && credentials_data['by_dest'] != '') { // case 2
        //     let callerFilterData = otherData.filter(item => {
        //       if ((item.extension).includes(credentials_data['by_src'])) {
        //         return item;
        //       }
        //     })
        //     let calleeFilterData = otherData.filter(item => (item.callee_ext).includes(credentials_data['by_dest']))
        //     pagedData = callerFilterData.filter(x => calleeFilterData.includes(x));

        //   } else if (credentials_data['by_src'] != '' && credentials_data['by_range'] != '') { // case 3
        //     let callerFilterData = otherData.filter(item => (item.extension).includes(credentials_data['by_src']));
        //     let rangeFilterData = dateData;
        //     pagedData = [];
        //     for (const x of rangeFilterData) {
        //       for (const y of callerFilterData) {
        //         if (x.id == y.id) {
        //           pagedData.push(x);
        //         }
        //       }
        //     }
        //   } else if (credentials_data['by_dest'] != '' && credentials_data['by_range'] != '') { // case 4
        //     let calleeFilterData = otherData.filter(item => (item.callee_ext).includes(credentials_data['by_dest']))
        //     let rangeFilterData = dateData;
        //     pagedData = [];
        //     for (const x of rangeFilterData) {
        //       for (const y of calleeFilterData) {
        //         if (x.id == y.id) {
        //           pagedData.push(x);
        //         }
        //       }
        //     }
        //   } else if (credentials_data['by_src'] != '') { // case 5
        //     pagedData = otherData.filter(item => {
        //       if ((item.extension).includes(credentials_data['by_src'])) {
        //         return item;
        //       }
        //     })

        //   } else if (credentials_data['by_dest'] != '') { // case 6
        //     pagedData = otherData.filter(item => (item.callee_ext).includes(credentials_data['by_dest']))

        //   } else if (credentials_data['by_range'] != '') { // case 7
        //     pagedData = rangeFilterData;

        //   } else if (credentials_data['by_range'] == '' && credentials_data['by_src'] == '' && credentials_data['by_dest'] == '') { // CASE 8
        //     pagedData = otherData;
        //   }
        // }
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } 
    else {
      // this.recordingService.getRecordingList({ 'id': Number(localStorage.getItem('id')), 'role': Number(localStorage.getItem('type')), 'type': 'normalRecording' }).subscribe(pagedData => {
        const credentials = this.filterForm.value;
        credentials.user_id = Number(localStorage.getItem('id'));
        credentials.role = Number(localStorage.getItem('type'));
        credentials.by_dest = Number(credentials.by_dest);
        credentials.by_src = Number(credentials.by_src);
        credentials.type = 'normalRecording';
        credentials.offset = offset;
        credentials.pageSize = pageSize;
        credentials.limit_flag = 1;
        delete credentials.by_range
        delete credentials.by_dest
        this.recordingService.filterRecordingList(credentials).subscribe(pagedData => {
        this.totalRecords = pagedData.total;
        pagedData = this.manageUserActionBtn(pagedData.response);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
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
    let role = localStorage.getItem('type');    
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let callType = "";
      let filePath = '';
      finalBtn += "<span>";
      finalBtn += "<a href='" + pagedData[i].file_path +  "' download='" + pagedData[i].file_name + "'  style='margin-left:10px'><i class='fa fa-download edit-button' style='cursor:pointer; display: inline' data-action-type='download' title='Download'></i></a> ";
      if(role == '1'){
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      finalBtn += "</span>";
 
      filePath = '<audio controls="" preload="auto" height="32" style="float:left; margin-left:5px; width: 85%;">\
    <source src="'+ pagedData[i].file_path + '" type="audio/wav"/>\audio isn\'t supported.\</audio>';
      callType += pagedData[i]['call_type'].replace('_',' ');
      callType = callType == 'call' ? callType.replace('call','Outgoing Call') : callType;
      pagedData[i]['call_type'] = callType;
      pagedData[i]['recording'] = filePath;
      pagedData[i]['action'] = finalBtn;
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

  public downloadRecording(data){
    console.log(data)
  }

  deleteRecording(data) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html : "<span style='color:#FFFFFF;'>You will not be able to recover recording </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+data.id+"</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.recordingService.deleteRecording({ 'filename': data.file_name, 'id': Number(localStorage.getItem('id')), 'role': Number(localStorage.getItem('type')), 'type' : '' }).subscribe(data => {
          this.displayAllRecord();
        },
          err => {
            this.error = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html : "<span style='color:#FFFFFF;'> Recording </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+data.id+"</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 3000
        });
        let obj = {
          application: "recording",
          action: "delete", //update
          file: data.name,
          cust_id: (localStorage.getItem('id'))
        } 
        this.backendIntegrationService.createAPIintegration(obj).subscribe(res => {
          console.log(res)
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html : "<span style='color:#FFFFFF;'>Recording  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+data.id+"</span> <span style='color:#FFFFFF'> is safe.</span> ",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoRecordingDialog, {
      width: '80%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
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

  resetTable() {
    this.filterForm.controls.by_range.clearValidators();
    this.filterForm.controls.by_range.setValue('');
    this.filterForm.controls.by_range.updateValueAndValidity();
    this.filterForm.controls.by_dest.clearValidators();
    this.filterForm.controls.by_dest.setValue('');
    this.filterForm.controls.by_dest.updateValueAndValidity();
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
}

@Component({
  selector: 'infoRecording-dialog',
  templateUrl: 'infoRecording-dialog.html',
})

export class InfoRecordingDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoRecordingDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

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