import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Errors, Name_RegEx, CommonService, promptUpdated, invalidFileType, errorMessage } from '../../../core';
import { DateAdapter } from '@angular/material';
import { UserTypeConstants } from 'src/app/core/constants';
import { BackendApiServiceService } from '../backend-api-service.service';

@Component({
  selector: 'app-view-tc-audit-logs',
  templateUrl: './view-tc-audit-logs.component.html',
  styleUrls: ['./view-tc-audit-logs.component.css']
})
export class ViewTcAuditLogsComponent implements OnInit {

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
    private logService: BackendApiServiceService,
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
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'api_name', headerName: 'API', hide: false, width: 10 },
      { field: 'api_response_msg', headerName: 'Api Response', hide: false, width: 10 },
      { field: 'api_status', headerName: 'Api Status', hide: false, width: 10 },
      { field: 'application', headerName: 'End Point', hide: false, width: 10 },
    //   { field: 'logout_cause', headerName: 'Log Out Cause', hide: false, width: 10 },
    //   { field: 'user_ip', headerName: 'IP', hide: false, width: 10 },
     ];

    if (this.isFilter) {
      // const credentials = this.filterForm.value;
      // this.logService.getActivityLogByFilter(credentials, customer_type, customer_id).subscribe(pagedData => {
      //   if(customer_type == '5'){
      //     var newArray = pagedData.filter(function (el) {
      //     return el.logout_cause != '1' && el.logout_cause != '0' && el.role != '0';
      //   });
      //   pagedData = this.manageUserActionBtn(newArray);
      // }else{
      //   pagedData = this.manageUserActionBtn(pagedData);
      //  }
        
      // this.dataSource = [];
      
      // this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      // });
    } else {
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
      this.logService.getAPILog(role,ResellerID).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
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
      finalBtn += "</span>";
     
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
