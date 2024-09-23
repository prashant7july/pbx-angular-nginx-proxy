import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService, ExcelService, invalidPhone, countryError, Name_RegEx, Number_RegEx, Errors, invalidFileType, IP_RegEx,duplicateIP } from '../../../core';
import { Router, NavigationEnd } from '@angular/router';
import { AppointmentService } from '../appointment.service';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.component.html',
  styleUrls: ['./appointment-history.component.css']
})
export class AppointmentHistoryComponent implements OnInit {
  AppointmentForm:FormGroup;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  defaultPageSize:any='10';
  isFilter = false;
  exportData: any = {};
  error='';

  constructor(
    private router: Router,
    private appointmentService:AppointmentService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toastr: ToastrService,
  ) { 
    this.AppointmentForm = this.fb.group({
      'appointment_name': [""],
 
    });
  }  

  ngOnInit() {
    this.appointmentService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }
  public displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: true, width: 100 },
      { field: 'id', headerName: ' Slot ID', hide: false, width: 150 },
      { field: 'name', headerName: 'Appointment Name', width: 150, hide: false },
      { field: 'app_id', headerName: 'Number Of Slots', width: 150, hide: true },
      { field: 'src', headerName: 'Source', width: 200, hide: false },
      { field: 'date_slot', headerName: 'Slot Date', width: 200, hide: false },
      { field: 'time_start', headerName: 'Slot Start Time', width: 200, hide: false },
      { field: 'time_end', headerName: 'Slot End Time', width: 160, hide: false },

    ];
    if (this.isFilter) {
      const credentials = this.AppointmentForm.value;
      this.appointmentService.viewAppointmentHistory(credentials).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.appointmentService.viewAppointmentHistory({customer_id: localStorage.getItem('id') }).subscribe(data => {
        data = this.manageUserActionBtn(data)
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    }
  }
  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      data[i]['action'] = finalBtn;
    }
    return data;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
    }
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

} 



