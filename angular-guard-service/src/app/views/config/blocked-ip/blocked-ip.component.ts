import { Component, OnInit ,Inject,} from '@angular/core';
import {ConfigService} from '../../config/config.service'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {formError, Errors, CommonService,ExcelService ,Name_RegEx} from '../../../core';
import { Router,NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Page} from '../../../core/models';
import { circle } from 'src/app/core/models/circle.model';
import { ToastrService } from 'ngx-toastr';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { ContactListService } from '../../contact-list/contact-list.service';

@Component({
  selector: 'app-blocked-ip',
  templateUrl: './blocked-ip.component.html',
  styleUrls: ['./blocked-ip.component.css']
})
export class BlockedIpComponent implements OnInit {
  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
  filterForm: FormGroup;
  filterObj:any={};
  minDate: Date;
  maxDate: Date;
  bsValue = new Date();
   bsRangeValue: Date[];
   menus: any;
   blockedIpMenu : any;


  constructor(
    public ConfigService :ConfigService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    private toastr: ToastrService,
    private contactService : ContactListService
  ) { 
    this.minDate = new Date();
    this.maxDate = new Date();
    // this.minDate.setDate(this.minDate.getDate() );
    this.maxDate.setDate(this.maxDate.getDate());
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      'ip': [""],
      'created_at': [""]

    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.blockedIpMenu = this.menus.find((o) => o.url == '/config/blocked-ip');
    this.displayAllRecord();
  }
  displayAllRecord() 
  {
    if(localStorage.getItem('type') == '0' || localStorage.getItem('type') == '1'){
      this.columnDefs = [
        { field: 'action', headerName: 'Action', hide:  false, width: 5 },
        { field: 'id', headerName: 'ID', hide: true, width: 10 },
        // { field: 'service', headerName: 'Service', hide: false, width: 15 },
        { field: 'ip', headerName: 'IP', hide: false, width: 30 },
        { field: 'created_at', headerName: 'Create Date', hide: false, width: 10 },
    ];
  }else{
    this.columnDefs = [
      { field: 'action', headerName: 'Action',  hide: this.blockedIpMenu.all_permission == '1' ? false : true, width: 5 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      // { field: 'service', headerName: 'Service', hide: false, width: 15 },
      { field: 'ip', headerName: 'IP', hide: false, width: 30 },
      { field: 'created_at', headerName: 'Create Date', hide: false, width: 10 },
  ];
  }
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.ConfigService.getblockedIP(credentials).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.ConfigService.getblockedIP({}).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    }
  }
  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  manageUserActionBtn(pagedData) {

    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let descField = "";
      finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "<i class='fa fa-unlock list-button' style='cursor:pointer; display: inline' data-action-type='unban' title='Unban IP'></i>";
      finalBtn += "</span>";
      // descField = `<div style="white-space': 'normal; line-height: 1.6;">${pagedData[i].description}</div>`;
      descField = pagedData[i].description;
      pagedData[i]['action'] = finalBtn; 
      pagedData[i]['description'] = descField;

    }
    return pagedData;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");   
    switch (actionType) {
      case "unban":
        return this.unbanIp(data);
      // case "delete":
      //   return this.deleteData(data);
      // case "active":
      //   return this.updateStatus(data);
      // case "inactive":
      //   return this.updateStatus(data);
    }
  }

  unbanIp(data){
    let obj = {
      application : 'f2banip',
      ip : data.ip
    }
    
    this.ConfigService.unbanIp(obj).subscribe(data=>{
      if(data['status_code'] == 200){
        this.toastr.success('Success!', data['message'], { timeOut: 2000 });
        this.ConfigService.updateGridList();
        this.displayAllRecord();
      }else{
        this.toastr.error('Error!', 'oops , something wrong', { timeOut: 2000 });
      }
    })

  }

  resetTable() {
    this.isFilter = false;
   // this.filterForm.reset();
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

}
