import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, CallPlanRate, invalidFileType, importUnsuccessfully, importSuccessfully, Number_RegEx, Number_Not_Start_Zero_RegEx } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
import { UserTypeConstants } from 'src/app/core/constants';
import { UserService } from '../../user/user.service';
import { MinutePlanService } from '../../customer-minute-plan/customer-minute-plan.service';
@Component({
  selector: 'app-extension-call-minute-detail',
  templateUrl: './extension-call-minute-detail.component.html',
  styleUrls: ['./extension-call-minute-detail.component.css']
})
export class ExtensionCallMinuteDetailComponent implements OnInit {

  //------------------------------  Add Extension Call Minute By. (Nagender Pratap Chauhan 30-07-2021) ------------------------------------------------------------//

  error = '';
  isFilter = false;
  filterForm: FormGroup;
  selectedValue = "";
  remaining_minute : any;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  loginUserType = localStorage.getItem('type');
  accountManagerCustomerList: "";

  constructor(
    private fb: FormBuilder,
    private minutePlanService: MinutePlanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private userService: UserService,
    private route : ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
       'by_name' : [""],
       'by_plan_type' : [""],
       'by_validity' : [""]
    });
  }

  ngOnInit() {   
    // let loginUserType = localStorage.getItem('type');   // admin, manager, support, customer etc
    this.minutePlanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'destination', headerName: 'Destination', hide: false, width: 20 },
      { field: 'dest_id', headerName: 'Country Code', hide: false, width: 20 },
      { field: 'assingn_minutes', headerName: 'Assign Minutes', hide: false, width: 20 },
      { field: 'used_minutes', headerName: 'Consumed Minutes', hide: false, width: 20 },
      { field: 'remaining_minute', headerName: 'Outstanding Minutes', hide: false, width: 20 },
      { field: 'assign_date', headerName: 'Assign Date', hide: false, width: 20 },     
      { field: 'action', headerName: 'Action', hide: true, width: 20 },
    ];
   
      if (this.isFilter) {
        // const credentials = this.filterForm.value;
        // this.callplanService.filterBundlePlan(credentials).subscribe(pagedData => {
        //   this.exportData = pagedData;
        //   pagedData = this.manageUserActionBtn(pagedData);
        //   this.dataSource = [];
        //   this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        // }, err => {
        //   this.error = err.message;
        // });
      } else {
        let obj = {
          extension_id : localStorage.getItem('id')
        }
        this.minutePlanService.viewExtensionCallMinute(obj).subscribe(pagedData => {
          this.exportData = pagedData;
           pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        });
      }
    
   
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  
 
  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
    this.remaining_minute = (pagedData[i]['assingn_minutes'] - pagedData[i]['used_minutes']);
      let finalBtn = '';
      let remain = '';
      finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Information'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;

      remain += "<span>";
      remain += this.remaining_minute;
      remain += "</span>";
      pagedData[i]['remaining_minute'] = remain;
    }
    return pagedData;
  }


  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editBundlePlan(data);
      }
  }


  editBundlePlan(event) {
    this.openDialog(event);
  }
  


  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  openDialog(data): void {
    // const dialogRef = this.dialog.open(BundlePlanDialog, { width: '60%', disableClose: true, data: { id: data ? data.id : null, data: data } });
    // dialogRef.keydownEvents().subscribe(e => {
    //   if (e.keyCode == 27) {
    //     dialogRef.close('Dialog closed');
    //   }
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('Dialog closed');
    // });
  }


  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoCallPlanRateDialog, {
    //   width: '80%', disableClose: true, autoFocus:false,
    //   data: {
    //     customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0
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

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
}
