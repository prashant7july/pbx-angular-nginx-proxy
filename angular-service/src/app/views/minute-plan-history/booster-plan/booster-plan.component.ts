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
  selector: 'app-booster-plan',
  templateUrl: './booster-plan.component.html',
  styleUrls: ['./booster-plan.component.css']
})
export class BoosterPlanComponent implements OnInit {

   //------------------------------  Add Booster Minute History By. (Nagender Pratap Chauhan 31-07-2021) ------------------------------------------------------------//

   error = '';
   isFilter = false;
   filterForm: FormGroup;
   selectedValue = "";
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
        'by_range': [""],
        'by_name' : [""],
        'by_charge' : [""],
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
      { field: 'action', headerName: 'Action', hide: false, width: 20 },
       { field: 'id', headerName: 'ID', hide: true, width: 10 },
       { field: 'minute_plan_name', headerName: 'Booster Plan', hide: false, width: 25 },
       { field: 'charge', headerName: 'Charge', hide: false, width: 10 },
       { field: 'validity', headerName: 'Validity', hide: false, width: 20 },
       { field: 'customer_name', headerName: 'Customer', hide: false, width: 20 },
       { field: 'purchase_date', headerName: 'Purchase Date', hide: false, width: 20 },     
     
     ];
    
       if (this.isFilter) {
        let role = Number(localStorage.getItem('type'));
        let ResellerID = Number(localStorage.getItem('id'));
         const credentials = this.filterForm.value;
         this.minutePlanService.getBoosterPlanHistoryByFilters(credentials,role,ResellerID).subscribe(pagedData => {
           this.exportData = pagedData;
           pagedData = this.manageUserActionBtn(pagedData);
           this.dataSource = [];
           this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
         }, err => {
           this.error = err.message;
         });
       } else {
        let role = localStorage.getItem('type');
        let ResellerID = localStorage.getItem('id');
         this.minutePlanService.viewBoosterPlanHistory(role,ResellerID).subscribe(pagedData => {
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
       let finalBtn = '';
       finalBtn += "<span>";
       // finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
       finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Information'></i>";
       finalBtn += "</span>";
       pagedData[i]['action'] = finalBtn;
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
