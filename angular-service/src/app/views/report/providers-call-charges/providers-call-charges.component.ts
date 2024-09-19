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
import { ProviderService } from '../../provider/provider.service';
declare const ExcelJS: any;

@Component({
  selector: 'app-providers-call-charges',
  templateUrl: './providers-call-charges.component.html',
  styleUrls: ['./providers-call-charges.component.css'],
  providers: [CheckBoxSelectionService] 
})
export class ProvidersCallChargesComponent implements OnInit {

  //------------------------------  Add Providers calls Charges By. (Nagender Pratap Chauhan 19-08-2021) ------------------------------------------------------------//

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
  public fields: Object = { text: 'provider', value: 'id' };
  public placeholder: string = 'Select Provider';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
 
  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    public providerService: ProviderService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private userService: UserService,
    private route : ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
       'by_range': [""],
       'by_provider' :  new FormControl([]),
    });
  }
 
  ngOnInit() {    
    this.mode = 'CheckBox';
    this.reportService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
 
    this.providerService.viewProviderDetails('','').subscribe(datas => {
      this.companyList = datas;
    }, err => {
      this.error = err.message;
    });
  
  }
 
  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 150 },
      { field: 'id', headerName: 'ID', hide: true, width: 75 },
      { field: 'startTime', headerName: 'Date', hide: false, width: 150 },
      { field: 'provider_name', headerName: 'Provider', hide: false, width: 150 },
      { field: 'gateway_charge', headerName: 'Gateway Charges', hide: false, width: 150 },
      { field: 'did_charge', headerName: 'DID Charges', hide: false, width: 150 },
      { field: 'total_charges', headerName: 'Total Charges', hide: false, width: 150 },
      
    ];
   
      if (this.isFilter) {
        let role = localStorage.getItem('type');
        let ResellerID = localStorage.getItem('id');
        const credentials = this.filterForm.value;
        this.reportService.getProvidersCallChargesDateWiseByFilters(credentials,role,ResellerID).subscribe(pagedData => {
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
        this.reportService.getProvidersCallChargesDateWise(role,ResellerID).subscribe(pagedData => {
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
      { header: 'Date', key: 'Date', width: 30 },
      { header: 'Provider', key: 'Provider', width: 40 },
      { header: 'Gateway Charges', key: 'Gateway_Charges', width: 30 },
      { header: 'DID Charges', key: 'DID_Charges', width: 30 },
      { header: 'Total Charges', key: 'Total_Charges', width: 30 },
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
        Date: this.exportData[i].startTime,
        Provider: this.exportData[i].provider_name,
        Gateway_Charges: this.exportData[i].gateway_charge,
        DID_Charges: this.exportData[i].did_charge,
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
      FileSaver.saveAs(blob, 'provider-call-charges');
    });
  }
  
  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Date", "Provider", "Gateway Charges", "DID Charges", "Total Charges"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.startTime, element.provider_name, element.gateway_charge, element.did_charge, element.total_charges];
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
      },
    });
    doc.save('provider-call-charges.pdf');
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
}
