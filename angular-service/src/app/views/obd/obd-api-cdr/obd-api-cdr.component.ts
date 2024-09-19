import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx,Number_RegEx,Contact_RegEx, importSuccessfully, importUnsuccessfully, invalidFileType } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OBDService } from '../obd.service';

@Component({
  selector: 'app-obd-api-cdr',
  templateUrl: './obd-api-cdr.component.html',
  styleUrls: ['./obd-api-cdr.component.css']
})

export class ObdApiCdrComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  filterObj: any = {};
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  filterForm: FormGroup;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private OBDService: OBDService,
  ) { }
  ngOnInit() {
    this.filterForm = this.fb.group({
      'by_call_id': [""],
      'by_a_party_no': [""],
      'by_b_party_no': [""],
      'by_date': [""],
    });

    this.OBDService.displayAllRecord().subscribe(() =>{
      this.displayAllRecord();
    })
  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: true, width: 200 },
      { field: 'id', headerName: 'ID', hide: true, width: 100 },
      { field: 'call_start_time', headerName: 'Call Start Time', hide: false, width: 250 },
      { field: 'service_type', headerName: 'Service Type', hide: false, width: 280 },
      { field: 'event_type', headerName: 'Event Type', hide: false, width: 250 },
      { field: 'call_id', headerName: 'Call ID', hide: false, width: 250 },
      { field: 'dni', headerName: 'DNI', hide: true, width: 150 },
      { field: 'a_party_no', headerName: 'A Party No', hide: false, width: 300 },
      { field: 'a_party_dial_start_time', headerName: 'A Party Dial Start Time', hide: false, width: 300 },
      { field: 'a_party_dial_end_time', headerName: 'A Party Dial End Time', hide: false, width: 300 },
      { field: 'a_party_connected_time', headerName: 'A Party Connect Time', hide: false, width: 300 },
      { field: 'a_dial_status', headerName: 'A Dial Status', hide: false, width: 300 },
      { field: 'a_party_end_time', headerName: 'A Party End Time', hide: false, width: 300 },
      { field: 'b_party_no', headerName: 'B Party No', hide: false, width: 300 },
      { field: 'b_party_dial_start_time', headerName: 'B Party Dial Start Time', hide: false, width: 300 },
      { field: 'b_party_dial_end_time', headerName: 'B Party Dial End Time', hide: false, width: 300 },
      { field: 'b_party_connected_time', headerName: 'B Party Connect Time', hide: false, width: 300 },
      { field: 'b_party_end_time', headerName: 'B Party End Time', hide: false, width: 300 },
      { field: 'b_dial_status', headerName: 'B Dial Status', hide: false, width: 300 },
      { field: 'recordvoice', headerName: 'Play Recording', hide: false, width: 300 },
      { field: 'disconnected_by', headerName: 'Disconnected By', hide: false, width: 300 },
    ];
    const credentials = this.filterForm.value;
    let user_id = localStorage.getItem('id');
    credentials['user_id'] = user_id;
    if(this.isFilter){
      this.OBDService.getObdApiCDRByFilter(credentials).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
      })
    }else{
      const user_id = localStorage.getItem('id');
      this.OBDService.getobdApiCDR(user_id).subscribe((datas => {
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
      let filePath = '';
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
      filePath = '<audio controls="" preload="auto" height="32" style="float:left; margin-left:5px; width: 85%;">\
      <source src="'+ pagedData[i].file_path + '" type="audio/wav"/>\audio isn\'t supported.\</audio>';
      pagedData[i]['conf_schedule_time'] = schedularBtn;
      pagedData[i]['recordvoice'] = filePath;
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }









}
