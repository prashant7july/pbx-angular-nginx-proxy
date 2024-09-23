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
import { ReportService } from '../report.service';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
declare const ExcelJS: any;
export var productId = '1';

@Component({
  selector: 'app-customers-call-charges',
  templateUrl: './customers-call-charges.component.html',
  styleUrls: ['./customers-call-charges.component.css'],
  providers: [CheckBoxSelectionService] 

})
export class CustomersCallChargesComponent implements OnInit {

  //------------------------------  Add Customers calls Charges By. (Nagender Pratap Chauhan 09-08-2021) ------------------------------------------------------------//

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

 companyList: any[] = [];
 public mode ;
 public selectAllText: string
 public fields: Object = { text: 'name', value: 'id' };
 public placeholder: string = 'Select Company';
 public popupHeight: string = '200px';
 public popupWidth: string = '250px';

 constructor(
   private fb: FormBuilder,
   private reportService: ReportService,
   public commonService: CommonService,
   public dialog: MatDialog,
   private excelService: ExcelService,
   private userService: UserService,
   private route : ActivatedRoute
 ) {
   this.filterForm = this.fb.group({
      'by_range': [""],
      'by_company' :  new FormControl([]),
   });
 }

 ngOnInit() {    
   this.mode = 'CheckBox';
   this.reportService.displayAllRecord.subscribe(() => {
     this.displayAllRecord();
   });
   let userType = localStorage.getItem('type');
   let id = localStorage.getItem('id');
   if (userType == '3') {
     this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
       let data = datas.response;
       for (let i = 0; i < data.length; i++) {
         this.companyList.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
       }
     }, err => {
       this.error = err.message;
     });
   }else{
   this.commonService.getCompany().subscribe(datas => {
     let data = datas.response;
     for (let i = 0; i < data.length; i++) {
       this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
     }
   }, err => {
     this.error = err.message;
   });
  }
 
 }
 Providerremovedspace(event){
  const textValue = event.text.trim().toLowerCase();
 const filterData = this.companyList.filter((data) =>{    
    return data['name'].toLowerCase().includes(textValue);
  })
  event.updateData(filterData);
}

 displayAllRecord() {
   this.columnDefs = [
    { field: 'action', headerName: 'Action', hide: false, width: 150 },
     { field: 'id', headerName: 'ID', hide: true, width: 75 },
    //  { field: 'startTime', headerName: 'Date', hide: false, width: 150 },
     { field: 'customer_name', headerName: 'Company', hide: false, width: 150 },
     { field: 'outgoing_minutes', headerName: 'Outgoing Minutes', hide: false, width: 150 },
     { field: 'outgoing_charge', headerName: 'Outgoing Charges', hide: false, width: 150 },
     { field: 'incoming_minutes', headerName: 'Incoming Minutes', hide: false, width: 150 },
     { field: 'incoming_charge', headerName: 'Incoming Charges', hide: false, width: 150 },
     { field: 'total_minutes', headerName: 'Total Minutes', hide: false, width: 150 },
     { field: 'total_charges', headerName: 'Total Charges', hide: false, width: 150 },
    
   ];
  
     if (this.isFilter) {
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
       const credentials = this.filterForm.value;
       this.reportService.getCustomersChargesDateWiseByFilters(credentials,role,ResellerID).subscribe(pagedData => {
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
       this.reportService.getCustomersChargesDateWise(role,ResellerID).subscribe(pagedData => {
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

 exportToExcel(): void {
  let worksheet: any;
  let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
  let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  worksheet = workbook.addWorksheet('My Sheet', {
    properties: {
      defaultRowHeight: 100,
    },
    pageSetup:{paperSize: 8, orientation:'landscape',fitToPage: true, fitToHeight: 1, fitToWidth:1}
  });
  worksheet.pageSetup.margins = {
    left: 0.7, right: 0.7,
    top: 0.75, bottom: 0.75,
    header: 0.3, footer: 0.3
  };

  worksheet.columns = [
    { header: 'Company', key: 'Company', width: 30 },
    { header: 'Outgoing Minutes', key: 'Outgoing_Minutes', width: 40 },
    { header: 'Outgoing Charges', key: 'Outgoing_Charges', width: 10 },
    { header: 'Incoming Minutes', key: 'Incoming_Minutes', width: 10 },
    { header: 'Incoming Charges', key: 'Incoming_Charges', width: 40 },
    { header: 'Total Minutes', key: 'Total_Minutes', width: 15 },
    { header: 'Total Charges', key: 'Total_Charges', width: 15 },
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
    // let strStatus = this.exportData[i].status;
    // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
    worksheet.addRow({
      Company: this.exportData[i].customer_name,
      Outgoing_Minutes: this.exportData[i].outgoing_minutes,
      Outgoing_Charges: this.exportData[i].outgoing_charge,
      Incoming_Minutes: this.exportData[i].incoming_minutes,
      Incoming_Charges: this.exportData[i].incoming_charge,
      Total_Minutes: this.exportData[i].total_minutes,
      Total_Charges: this.exportData[i].total_charges
    });
  }
   worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
    row.border =  {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } }
    };
  });
  //To repeate header row on each page
  worksheet.pageSetup.printTitlesRow = '1:2';
  let offset = this.exportData.length; // to offset by 3 rows
  worksheet.spliceRows(1, 0, new Array(offset))
  // this.excelService.exportAsExcelFile(arr, 'gateway');
  workbook.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], { type: blobType });
    FileSaver.saveAs(blob, 'customer-call-charges');
  });
}

downloadPDF(): void {
  var doc = new jsPDF();
  var col = ["Company", "Outgoing Minutes", "Outgoing Charges", "Incoming Minutes", "Incoming Charges", "Total Minutes", "Total Charges"];
  var rows = [];
  this.exportData.forEach(element => {
    const e11 = [element.customer_name, element.outgoing_minutes, element.outgoing_charge, element.incoming_minutes, element.incoming_charge, element.total_minutes, element.total_charges];
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
  doc.save('customer-call-charges.pdf');
}

 get UserTypeAdmin() {
   return UserTypeConstants.ADMIN;
 }
}
