import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Errors, Name_RegEx, CommonService, promptUpdated, invalidFileType, errorMessage } from '../../../core';
import { DateAdapter } from '@angular/material';
import { LogService } from '../logs.service';
import { UserTypeConstants } from 'src/app/core/constants';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.css']
})
export class ActivityLogsComponent implements OnInit {

  error = '';
  isFilter = false;
  filterForm: FormGroup;

  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  viewButton: boolean = true;
  editButton: boolean = true;
  deleteButton: boolean = true;
  packageList = '';
  selectedValue = '';
  defaultPageSize = '10';
  maxDate: Date;
  todayDate: Date;
  loginUserType = localStorage.getItem('type');


  constructor(
    public commonService: CommonService,
    private logService: LogService,
    private dateAdapter: DateAdapter<Date>,
    private fb: FormBuilder,
  ) {
    this.maxDate = new Date();
   // this.todayDate = new Date();
    this.dateAdapter.setLocale('en-GB');
    this.filterForm = this.fb.group({

      'by_ip': [""],
      'by_username': [""],
      'by_date': [""],
      'by_logs': [""],
    });
   }

  ngOnInit() {
    let user_id = localStorage.getItem('id');

    this.displayAllRecord();

  }

  displayAllRecord() {
    const customerId = localStorage.getItem('id');
    const customerType = localStorage.getItem('type');
    if (Number(customerType) === 5) {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
     // { field: 'company_name', headerName: 'Company', hide: false, width: 10 },
      { field: 'username', headerName: 'Username', hide: false, width: 10 },
      { field: 'password', headerName: 'Password', hide: false, width: 10 },
      { field: 'login_time', headerName: 'Attempt Time', hide: false, width: 10 },
      // { field: 'logout_cause', headerName: 'Failure Cause', hide: false, width: 10 },
      { field: 'user_ip', headerName: 'IP', hide: false, width: 10 },
    ];
  } else {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      // { field: 'company_name', headerName: 'Company', hide: false, width: 10 },
      { field: 'username', headerName: 'Username', hide: false, width: 10 },
      { field: 'password', headerName: 'Password', hide: false, width: 10 },
      { field: 'login_time', headerName: 'Attempt Time', hide: false, width: 10 },
      // { field: 'logout_cause', headerName: 'Failure Cause', hide: false, width: 10 },
      { field: 'user_ip', headerName: 'IP', hide: false, width: 10 },
    ];
  }

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.logService.getActivityLogByFilter(credentials, customerType, customerId).subscribe(pagedData => {
        if (Number(customerType) === 5) {
          const newArray = pagedData.filter(function (el) {
          return el.logout_cause != '1' && el.logout_cause != '0' && el.role != '0';
        });
        pagedData = this.manageUserActionBtn(newArray);
      } else {
        pagedData = this.manageUserActionBtn(pagedData);
       }

      this.dataSource = [];

      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    } else {

      this.logService.getActivityLog(customerType, customerId).subscribe(pagedData => {
        //console.log(pagedData);
        if(customerType == '5'){
        var newArray = pagedData.filter(function (el) {
          return el.logout_cause != '1' && el.logout_cause != '0' && el.role != '0';
        });
        pagedData = this.manageUserActionBtn(newArray);
      }else{
        pagedData = this.manageUserActionBtn(pagedData);
      }

        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      var cause = '';
      finalBtn += "<span>";

      if (pagedData[i].logout_cause == '0') {
        cause = "Not logged Out Yet";
      } else if (pagedData[i].logout_cause == '1') {
        cause = "By User";
      } else if (pagedData[i].logout_cause == '2') {
        cause = "Api Crash";
      } else if (pagedData[i].logout_cause == '3') {
        cause = "Token Expire";
      } else if (pagedData[i].logout_cause == '4') {
        cause = "Other";
      } else {
        cause = "Invalid Login Credential";
      }
      finalBtn += "</span>";

      pagedData[i]['logout_cause'] = cause;
    }
    return pagedData;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageAction(e) {

  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
}
