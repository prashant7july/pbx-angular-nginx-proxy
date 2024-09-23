import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Errors, Name_RegEx, CommonService, promptUpdated, invalidFileType, errorMessage } from '../../../core';
import { DateAdapter } from '@angular/material';
import { UserTypeConstants } from 'src/app/core/constants';
import { BackendApiServiceService } from '../backend-api-service.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-smtp-audit-logs',
  templateUrl: './view-smtp-audit-logs.component.html',
  styleUrls: ['./view-smtp-audit-logs.component.css']
})
export class ViewSmtpAuditLogsComponent implements OnInit { 
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
    public dialog: MatDialog
  ) {
    this.maxDate = new Date();
   // this.todayDate = new Date();
    this.dateAdapter.setLocale('en-GB');
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_template' : [''],
      'by_status' : [''],
      'by_date': [""],
    });
   }
  ngOnInit() {
    let user_id = localStorage.getItem('id');
    this.displayAllRecord();
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'service', headerName: 'Name', hide: false, width: 20 },
      { field: 'subject', headerName: 'Email Template', hide: false, width: 10 },
      { field: 'status', headerName: 'Status', hide: false, width: 20 },
      { field: 'date', headerName: 'Date', hide: false, width: 20 },
     ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.logService.getSmtpAuditLogByFilter(credentials).subscribe(pagedData => {
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    } else {
      this.logService.getSmtpAuditLog().subscribe(pagedData => {
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

}
