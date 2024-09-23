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
  selector: 'app-date-hour-wise-calls',
  templateUrl: './date-hour-wise-calls.component.html',
  styleUrls: ['./date-hour-wise-calls.component.css'],
  providers: [CheckBoxSelectionService] 
})
export class DateHourWiseCallsComponent implements OnInit {

  //------------------------------  Add Date & Hour wise calls By. (Nagender Pratap Chauhan 09-08-2021) ------------------------------------------------------------//

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
      { field: 'startTime', headerName: 'Date', hide: false, width: 150 },
      { field: 'customer_name', headerName: 'Company', hide: false, width: 150 },
      { field: 'total_calls', headerName: 'Total Calls', hide: false, width: 150 },
      { field: '00', headerName: '00', hide: false, width: 75 },
      { field: '01', headerName: '01', hide: false, width: 75 },   
      { field: '02', headerName: '02', hide: false, width: 75 },  
      { field: '03', headerName: '03', hide: false, width: 75 },   
      { field: '04', headerName: '04', hide: false, width: 75 },  
      { field: '05', headerName: '05', hide: false, width: 75 },   
      { field: '06', headerName: '06', hide: false, width: 75 },   
      { field: '07', headerName: '07', hide: false, width: 75 },   
      { field: '08', headerName: '08', hide: false, width: 75 },   
      { field: '09', headerName: '09', hide: false, width: 75 },   
      { field: '10', headerName: '10', hide: false, width: 75 },   
      { field: '11', headerName: '11', hide: false, width: 75 },   
      { field: '12', headerName: '12', hide: false, width: 75 },   
      { field: '13', headerName: '13', hide: false, width: 75 },   
      { field: '14', headerName: '14', hide: false, width: 75 },   
      { field: '15', headerName: '15', hide: false, width: 75 },   
      { field: '16', headerName: '16', hide: false, width: 75 },   
      { field: '17', headerName: '17', hide: false, width: 75 },   
      { field: '18', headerName: '18', hide: false, width: 75 },   
      { field: '19', headerName: '19', hide: false, width: 75 },   
      { field: '20', headerName: '20', hide: false, width: 75 },   
      { field: '21', headerName: '21', hide: false, width: 75 },   
      { field: '22', headerName: '22', hide: false, width: 75 },   
      { field: '23', headerName: '23', hide: false, width: 75 },   

    ];
   
      if (this.isFilter) {
        let role = Number(localStorage.getItem('type'));
        let ResellerID = Number(localStorage.getItem('id'));
        const credentials = this.filterForm.value;
        this.reportService.getCallDateHourWiseByFilters(credentials,role,ResellerID).subscribe(pagedData => {
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
        this.reportService.getCallDateHourWise(role,ResellerID).subscribe(pagedData => {
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
      { header: 'Company', key: 'Company', width: 30 },
      { header: 'Total Calls', key: 'Total_Calls', width: 30 },
      { header: '00', key: 'Zero', width: 20 },
      { header: '01', key: 'One', width: 20 },
      { header: '02', key: 'Two', width: 20 },
      { header: '03', key: 'Three', width: 20 },
      { header: '04', key: 'Four', width: 20 },
      { header: '05', key: 'Five', width: 20 },
      { header: '06', key: 'Six', width: 20 },
      { header: '07', key: 'Seven', width: 20 },
      { header: '08', key: 'Eight', width: 20 },
      { header: '09', key: 'Nine', width: 20 },
      { header: '10', key: 'Ten', width: 20 },
      { header: '11', key: 'Eleven', width: 20 },
      { header: '12', key: 'Twelve', width: 20 },
      { header: '13', key: 'Thirteen', width: 20 },
      { header: '14', key: 'Fourteen', width: 20 },
      { header: '15', key: 'Fifteen', width: 20 },
      { header: '16', key: 'Sixteen', width: 20 },
      { header: '17', key: 'Seventeen', width: 20 },
      { header: '18', key: 'Eighteen', width: 20 },
      { header: '19', key: 'Ninteen', width: 20 },
      { header: '20', key: 'Twenty', width: 20 },
      { header: '21', key: 'Twentyone', width: 20 },
      { header: '22', key: 'Twentytwo', width: 20 },
      { header: '23', key: 'Twentythree', width: 20 },
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
        Company: this.exportData[i].customer_name,
        Total_Calls: this.exportData[i].total_calls,
        Zero: this.exportData[i]['00'],
        One: this.exportData[i]['01'],
        Two: this.exportData[i]['02'],
        Three: this.exportData[i]['03'],
        Four: this.exportData[i]['04'],
        Five: this.exportData[i]['05'],
        Six: this.exportData[i]['06'],
        Seven: this.exportData[i]['07'],
        Eight: this.exportData[i]['08'],
        Nine: this.exportData[i]['09'],
        Ten: this.exportData[i]['10'],
        Eleven: this.exportData[i]['11'],
        Tweleve: this.exportData[i]['12'],
        Thirteen: this.exportData[i]['13'],
        Fourteen: this.exportData[i]['14'],
        Fifteen: this.exportData[i]['15'],
        Sixteen: this.exportData[i]['16'],
        Seventeen: this.exportData[i]['17'],
        Eighteen: this.exportData[i]['18'],
        Ninteen: this.exportData[i]['19'],
        Twenty: this.exportData[i]['20'],
        Twentyone: this.exportData[i]['21'],
        Twentytwo: this.exportData[i]['22'],
        Twentythree: this.exportData[i]['23']
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
      FileSaver.saveAs(blob, 'date-hour-wise-calls');
    });
  }
  
  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Date","Company", "Total Calls", "00", "01", "02", "03", "04", "05","06", "07", "08", "09", "10", "11",  "12",  "13",  "14",  "15",  "16",  "17",  "18",  "19",  "20",  "21",  "22",  "23"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.startTime, element.customer_name, element.total_calls, element['00'], element['01'], element['02'], element['03'],element['04'], element['05'], element['06'], element['07'], element['08'], element['09'], element['10'], element['11'], element['12'], element['13'], element['14'], element['15'], element['16'], element['17'], element['18'], element['19'], element['20'], element['21'], element['22'], element['23']];
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
        6: { cellWidth: 'wrap' },
        7: { cellWidth: 'wrap' },
        8: { cellWidth: 'wrap' },
        9: { cellWidth: 'wrap' },
        10: { cellWidth: 'wrap' },
        11: { cellWidth: 'wrap' },
        12: { cellWidth: 'wrap' },
        13: { cellWidth: 'wrap' },
        14: { cellWidth: 'wrap' },
        15: { cellWidth: 'wrap' },
        16: { cellWidth: 'wrap' },
        17: { cellWidth: 'wrap' },
        18: { cellWidth: 'wrap' },
        19: { cellWidth: 'wrap' },
        20: { cellWidth: 'wrap' },
        21: { cellWidth: 'wrap' },
        22: { cellWidth: 'wrap' },
        23: { cellWidth: 'wrap' }
      },
    });
    doc.save('customer-call-charges.pdf');
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }

}
