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
import { MinutePlanService } from '../customer-minute-plan.service';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { BundlePlanDialog } from '../../call-plan/bundle-plan/bundle-plan.component';
import { CallplanService } from '../../call-plan/callplan.service';

@Component({
  selector: 'app-roaming-minutes',
  templateUrl: './roaming-minutes.component.html',
  styleUrls: ['./roaming-minutes.component.css'],
  providers: [CheckBoxSelectionService]
})
export class RoamingMinutesComponent implements OnInit {


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
 allCountryList : any[] = [];
 customerRoamingInfo : any;

  public fields: Object = { text: 'name', value: 'phonecode' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public mode = 'CheckBox';
  public selectAllText= 'Select All';

 constructor(
   private fb: FormBuilder,
   private minutePlanService: MinutePlanService,
   public commonService: CommonService,
   public dialog: MatDialog,
   private callplanService: CallplanService,
   private userService: UserService,
   private route : ActivatedRoute
 ) {
   this.filterForm = this.fb.group({
      'by_destination' :  new FormControl([]),
      'by_customerId' : localStorage.getItem('id'),
      'by_group_name' :  ['']
   });
 }

 ngOnInit() {   
   this.minutePlanService.displayAllRecord.subscribe(() => {
     this.displayAllRecord();
   });
 
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.allCountryList = data.response;
    }, err => {
      this.error = err.message;
    });

   this.userService.getCustomerById(localStorage.getItem('id')).subscribe(data => {
     let customerInfo = data.response[0];
     let creadentials = {};
     creadentials['by_id'] = customerInfo['roaming_plan_id'] // bundle or roaming
     this.callplanService.filterBundlePlan(creadentials).subscribe(data => {
       this.customerRoamingInfo = data[0];
       
     })
   });
 }

 Roamingremovedspace(event){
  const textValue = event.text.trim().toLowerCase();
 const filterData = this.allCountryList.filter((data) =>{    
    return data['name'].toLowerCase().includes(textValue);
  })
  event.updateData(filterData);
}

 displayAllRecord() {
   this.columnDefs = [
    { field: 'id', headerName: 'ID', hide: true, width: 10 },
    { field: 'destination', headerName: 'Destination', hide: false, width: 20 },
    { field: 'dial_prefix', headerName: 'Dial Prefix', hide: false, width: 20 },
    { field: 'minutes', headerName: 'Actual Minutes', hide: false, width: 30 },
    { field: 'group_type', headerName: 'Type', hide: false, width: 30 },
    { field: 'group_name', headerName: 'Group Name', hide: false, width: 30 },
    { field: 'talktime_minutes', headerName: 'Total Minutes', hide: false, width: 30 },
    { field: 'used_minutes', headerName: 'Consumed Minutes', hide: false, width: 30 },
    {field: 'expiry_date' , headerName: 'Valid Upto' , hide:false , width : 30}
  
   ];
  
     if (this.isFilter) {
       const credentials = this.filterForm.value;
       this.minutePlanService.viewCustomerRoamingPlan(credentials).subscribe(pagedData => {
         this.exportData = pagedData;
         pagedData = this.manageUserActionBtn(pagedData);
         this.dataSource = [];
         this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
       }, err => {
         this.error = err.message;
       });
     } else {
      let obj = {
        customer_id : Number(localStorage.getItem('id')),
        by_destination : "",
        by_group_name : ''
      }
       this.minutePlanService.viewCustomerRoamingPlan(obj).subscribe(pagedData => {        
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
 
 exportToExcel(): void {
   let worksheet: any;
   let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
   let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

   worksheet = workbook.addWorksheet('My Sheet', {
     properties: {
       defaultRowHeight: 100,
     },
     pageSetup:{paperSize: 9, orientation:'landscape',fitToPage: true, fitToHeight: 5, fitToWidth: 7}
   });
   worksheet.pageSetup.margins = {
     left: 0.7, right: 0.7,
     top: 0.75, bottom: 0.75,
     header: 0.3, footer: 0.3
   };
   worksheet.columns = [
     { header: 'Call Plan', key: 'CallPlan', width: 30 },
     { header: 'Dial Prefix', key: 'DialPrefix', width: 10 },
     { header: 'Gateway', key: 'Gateway', width: 25 },
     { header: 'Buying Rate', key: 'BuyingRate', width: 15 },
     { header: 'Selling Rate', key: 'SellingRate', width: 15 },
     { header: 'Selling Min Duration', key: 'SellingMinDuration', width: 18 },
     { header: 'Selling Billing Block', key: 'SellingBillingBlock', width: 18 },
   ];
   worksheet.getRow(1).font = {
     bold: true,
   }
   worksheet.getRow(1).fill = {
     type: 'pattern',
     pattern: 'solid',
     fgColor: { argb: 'FFFF00' }
   };
   for (let i = 0; i < this.exportData.length; i++) {
     worksheet.addRow({
       CallPlan: this.exportData[i].call_plan,
       DialPrefix: this.exportData[i].dial_prefix,
       Gateway: this.exportData[i].gatewayName,
       BuyingRate: this.exportData[i].buying_rate,
       SellingRate: this.exportData[i].selling_rate,
       SellingMinDuration: this.exportData[i].selling_min_duration,
       SellingBillingBlock: this.exportData[i].selling_billing_block
     });
   }
   worksheet.eachRow(function (row, _rowNumber) {
     row.eachCell(function (cell, _colNumber) {
       cell.border = {
         top: { style: 'thin', color: { argb: '000000' } },
         left: { style: 'thin', color: { argb: '000000' } },
         bottom: { style: 'thin', color: { argb: '000000' } },
         right: { style: 'thin', color: { argb: '000000' } }
       };
     });
   });
   //To repeate header row on each page
   worksheet.pageSetup.printTitlesRow = '1:2';
   let offset = this.exportData.length; // to offset by 3 rows
   worksheet.spliceRows(1, 0, new Array(offset));
   workbook.xlsx.writeBuffer().then(data => {
     const blob = new Blob([data], { type: blobType });
     FileSaver.saveAs(blob, 'callPlanRate');
   });
 }

 downloadPDF(): void {
   var doc = new jsPDF();
   var col = ["Call Plan", "Dial Prefix", "Gateway", "Buying Rate", "Selling Rate", "Selling Min Duration", "Selling Billing Block"];
   var rows = [];
   this.exportData.forEach(element => {
     const e11 = [element.call_plan, element.dial_prefix, element.gatewayName, element.buying_rate, element.selling_rate, element.selling_min_duration, element.selling_billing_block];
     rows.push(e11);
   });
   doc.autoTable(col, rows, {
     theme: 'grid',
     pageBreak: 'auto',
     rowPageBreak: 'avoid',
     styles: {
       overflow: 'linebreak',
       fontSize: 6
     },
     columnStyles: {
       0: { cellWidth: 'wrap' },
       1: { cellWidth: 'wrap' },
       2: { cellWidth: 'wrap' },
       3: { cellWidth: 'wrap' },
       4: { cellWidth: 'wrap' },
       5: { cellWidth: 'wrap' },
       6: { cellWidth: 'wrap' }
     },
   });
   doc.save('callPlanRate.pdf');
 }

 manageUserActionBtn(pagedData) {
   for (let i = 0; i < pagedData.length; i++) {
     let finalBtn = '';
     finalBtn += "<span>";
     finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='info' title='Information'></i>";
     finalBtn += "</span>";
     pagedData[i]['action'] = finalBtn;
   }
   return pagedData;
 }


 manageAction(e) {
   let data = e.data;
   let actionType = e.event.target.getAttribute("data-action-type");
   switch (actionType) {
    case "info":
        return this.infoBundlePlan({data : this.customerRoamingInfo, id :this.customerRoamingInfo['id'], readonly : true });
     }
 }


  public infoBundlePlan(event) {
    const dialogRef = this.dialog.open(BundlePlanDialog, { width: '60%', disableClose: true, data: event });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

 deleteCallPlanRate(event) {
   // Swal.fire({
   //   title: '<span style="color:#FFFFFF;">Are you sure?</span>',
   //   text: `You will not be able to recover ${event.name} Call Plan rate in future!`,
   //   type: 'warning',
   //   showCancelButton: true,
   //   background: '#000000',
   //   confirmButtonText: 'Yes, delete it!',
   //   cancelButtonText: 'No, keep it',
   //   preConfirm: () => {
   //     this.callplanService.deleteCallPlanRate({ id: event.id }).subscribe(data => {
   //       this.displayAllRecord();
   //     },
   //       err => {
   //         this.error = err.message;
   //       });
   //   },
   //   allowOutsideClick: () => !Swal.isLoading()
   // }).then((result) => {
   //   if (result.value) {
   //     Swal.fire({
   //       title: '<span style="color:#FFFFFF;">Deleted!</span>',
   //       text: 'Call Rate Group has been deleted.',
   //       type: 'success',
   //       background: '#000000'
   //     });

   //   } else if (result.dismiss === Swal.DismissReason.cancel) {
   //     Swal.fire({
   //       title: '<span style="color:#FFFFFF;">Cancelled</span>',
   //       text: 'Call Rate Group is safe :)',
   //       type: 'error',
   //       background: '#000000',
   //     });
   //   }
   // })
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
