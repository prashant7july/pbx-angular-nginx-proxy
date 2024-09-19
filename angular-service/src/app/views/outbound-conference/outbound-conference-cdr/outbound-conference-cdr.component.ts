import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService, formError, agentError, invalidFileType, importUnsuccessfully, importSuccessfully, 
  Errors,OutboundSuccessfully,Contact_RegEx } from '../../../core';
import { OutboundService } from '../outbound.service';

@Component({
  selector: 'app-outbound-conference-cdr',
  templateUrl: './outbound-conference-cdr.component.html',
  styleUrls: ['./outbound-conference-cdr.component.css']
})
export class OutboundConferenceCdrComponent implements OnInit {
  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  filterObj: any = {};
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  OutboundCDRForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private OutboundService: OutboundService,
  ) { }

  ngOnInit() {
    this.OutboundCDRForm = this.fb.group({
      'by_date': [""],
      'by_name': [""],
      'by_callee': [""]
    });
    this.OutboundService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });


    

  }
  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: true, width: 200 },
      { field: 'id', headerName: 'ID', hide: true, width: 100 },
      { field: 'session_start', headerName: 'Date', hide: false, width: 200 },
      { field: 'caller', headerName: 'Caller', hide: false, width: 200 },
      { field: 'callee', headerName: 'Callee', hide: false, width: 300 }, 
      { field: 'conf_name', headerName: 'Conf Name', hide: false, width: 260 },
      { field: 'terminatecause', headerName: 'Hangup Reason', hide: true, width: 260 },
      { field: 'hangup_cause', headerName: 'Terminate Cause', hide: false, width: 300 },
      { field: 'job_uuid', headerName: 'Job Uuid', hide: true, width: 300 },
    ];
    const credentials = this.OutboundCDRForm.value;
    let user_id = localStorage.getItem('id');
    if(this.isFilter){
      this.OutboundService.filteroutboundcdrList(credentials,user_id).subscribe(data => {      
        data = this.manageUserActionBtn(data);      
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
      })
    }else{
      const credentials = this.OutboundCDRForm.value;
      const user_id = localStorage.getItem('id');      
      this.OutboundService.getoutboundCDR(user_id).subscribe((datas => {    
        datas = this.manageUserActionBtn(datas);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': datas});
      })),err => {
        this.error = err.message;
      }

    }
  }
  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let schedularBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
      if (pagedData[i]['is_scheduler_type'] == '0' && pagedData[i]['status'] == '0') { //schedular
        schedularBtn += "<span>";
        schedularBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='start' title='Start Schedular'>Start</button> ";
        schedularBtn += "</span>";
      } else if (pagedData[i]['is_scheduler_type'] == '0' && pagedData[i]['status'] == '1') { //schedular
        schedularBtn += "<span>";
        schedularBtn += "<button class='btn btn-sm btn-primary' style='cursor:pointer; display: inline' data-action-type='stop' title='Stop Schedular'>Stop</button> ";
        schedularBtn += "</span>";
      } else {
        schedularBtn += "<p>" + pagedData[i]['conf_schedule_time'] + "</p>";
        // data[i]['description'] = finalBtn;
      }
      pagedData[i]['conf_schedule_time'] = schedularBtn;
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

}
