import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService, ExcelService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdrService } from '../../cdr/cdr.service';
import { AppointmentService } from '../appointment.service';
declare const ExcelJS: any;

@Component({
  selector: 'app-view-appointment-cdr',
  templateUrl: './view-appointment-cdr.component.html',
  styleUrls: ['./view-appointment-cdr.component.css']
})
export class ViewAppointmentCdrComponent implements OnInit {

  error = '';
  filterForm: FormGroup;
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData = "";
  exportData: any = {};
  defaultPageSize = '10';
  allCountryList:any;
  CountryFilter:any;
  filterCountry:any;
  terminatecause:any = [];
  CauseFilter:any;
  filterCause:any;
  appointmentList : any =[];
  AppointmentFilter:any;
  filterAppointment:any;   
public mode = 'CheckBox';;
 public selectAllText: string = 'Select All'; 
  public placeholder5: string = 'Select Country';
  public placeholder2: string = 'Select Terminate Cause';
  public placeholder6: string = 'Select Appointment';
  public popupHeight: string = '200px';   
  public popupWidth: string = '250px'; 
  public fields: Object = { text: 'agent', value: 'id' };
  public fields1: Object = { text: 'name', value: 'phonecode' };
  public fields10: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  datas: any;
  suppressColumnFit: boolean= true;
  // public mode = 'CheckBox';;
  // public selectAllText: string = 'Select All';
  public fields3: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country';
  public placeholder1: string = 'Select Fee Type';
  // public popupHeight: string = '200px';
  // public popupWidth: string = '200px';

  constructor(
    private router: Router,
    private cdrService: CdrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public appointmentService:AppointmentService
  ) {
    this.filterForm = this.fb.group({
      'by_date': [""],
      'by_sellcost': [""],
      'by_src': [""],
      'by_dest': [""],
      'by_destination': [""],
      'by_callerid': [""],
      'by_terminatecause': [""],
      'by_appointment': [""],
    });
  }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.displayAllRecord();
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.allCountryList = data.response;
      this.filterCountry = this.CountryFilter = this.allCountryList.slice()
    }, err => {
      this.error = err.message;
    });
    this.cdrService.getTerminateCause().subscribe(data => {
      // let datas = data
      for (let i = 0; i < data.length; i++) {
          this.terminatecause.push({ id: data[i]['id'], name: data[i]['digit'] + ' ' + data[i]['description'] })
      }
      // this.terminatecause = data;
      // this.filterCause = this.CauseFilter = this.terminatecause.slice()
    }, err => {
      this.error = err.message;
    });
    this.appointmentService.getAppointmentIVR({customer_id: localStorage.getItem('id') }).subscribe(pagedData =>{
      this.appointmentList = pagedData;
      this.filterAppointment = this.AppointmentFilter = this.appointmentList.slice()
    }, err => {
        this.error = err.message;
      }
    ); 
  }
  Terminateremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.terminatecause.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Appointmentremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.appointmentList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.allCountryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true,},
      { field: 'quality', headerName: 'Call Type & Quality', hide: false, },
      { field: 'appointment_name', headerName: 'Appointment Name', hide: false, },
      { field: 'startTime', headerName: 'Start Time', hide: false, },
      { field: 'endTime', headerName: 'End Time', hide: false, },
      { field: 'src', headerName: 'Caller', hide: false, },
      { field: 'dispDst', headerName: 'Callee', hide: false, },
      { field: 'dispCallerId', headerName: 'Caller ID', hide: false, },
      { field: 'sessionTime', headerName: 'Session Time', hide: false, },
      { field: 'bridgeTime', headerName: 'Bridge Time', hide: false, },
      { field: 'termDescription', headerName: 'Terminate Cause', hide: false, },
      { field: 'dispDestination', headerName: 'Country', hide: false, },
      { field: 'hangup_disposition', headerName: 'Hangup Disposition', hide: false, },
      { field: 'uuid', headerName: 'UUID', hide: false, },
    ];
    var user_id = localStorage.getItem("id");
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.customer_id = Number(user_id);
      this.appointmentService.getAppointmentCdrByFilters(credentials).subscribe(pagedData => {
        // debugger
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.appointmentService.getAppointmentCdrInfo(user_id, 0).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span><center>";
      if(data[i]['call_type'] == 'inbound'){

        if(data[i]['mos']>=4 && data[i]['mos']<=5){
          finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: green' title='Inbound/ "+data[i]['mos']+"'></i>";
        }else if(data[i]['mos']>=3.4 && data[i]['mos']<4){
        finalBtn += "<i class='fa fa-arrow-down' display: inline' style='color: orange' display: inline' title='Inbound/ "+data[i]['mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-down' style='color: red' display: inline' title='Inbound/ "+data[i]['mos']+"'></i>";
      }
    }
      if(data[i]['call_type'] == 'outbound'){
        if(data[i]['mos']>=4 && data[i]['mos']<=5){
          finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: green' title='Inbound/ "+data[i]['mos']+"'></i>";
        }else if(data[i]['mos']>=3.4 && data[i]['mos']<4){
        finalBtn += "<i class='fa fa-arrow-up' display: inline' style='color: orange' display: inline' title='Inbound/ "+data[i]['mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrow-up' style='color: red' display: inline' title='Inbound/ "+data[i]['mos']+"'></i>";
      }
      }

      if(data[i]['call_type'] == 'intercom'){
        if(data[i]['mos']>=4 && data[i]['mos']<=5){
          finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: green' title='Intercom/ "+data[i]['mos']+"'></i>";
        }else if(data[i]['mos']>=3.4 && data[i]['mos']<4){
        finalBtn += "<i class='fa fa-arrows-h' display: inline' style='color: orange' display: inline' title='Intercom/ "+data[i]['mos']+"'></i>";
      }else{
        finalBtn += "<i class='fa fa-arrows-h' style='color: red' display: inline' title='Intercom/ "+data[i]['mos']+"'></i>";
      }
      }
      
      finalBtn += "</center></span>";

      data[i]['quality'] = finalBtn;
    }
    return data;
  }

  
  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  exportToExcel() {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      },
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
   
    worksheet.columns = [
      { header: 'Start Time', key: 'StartTime', width: 25 },
      { header: 'End Time', key: 'EndTime', width: 25 },
      { header: 'Caller', key: 'Source', width: 10 },
      { header: 'Callee', key: 'Dest', width: 15 },
      { header: 'Caller Id', key: 'Callerid', width: 20 },
      { header: 'Session Time', key: 'SessionTime', width: 15 },
      { header: 'Bridge Time', key: 'BridgeTime', width: 15 },    
      { header: 'DNID', key: 'DNID', width: 20 },
      { header: 'Buy Cost', key: 'SellCost', width: 10 },  
      { header: 'Terminate Cause', key: 'TerminateCause', width: 20 },
      { header: 'Country', key: 'Destination', width: 15 },      
      { header: 'Hangup Disposition', key: 'HangupDisposition', width: 25 },
      { header: 'UUID', key: 'UUID', width: 25 },
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
        StartTime: this.exportData[i].startTime,
        EndTime: this.exportData[i].endTime,
        Source: this.exportData[i].src,
        Dest: this.exportData[i].dispDst,        
        CallerId: this.exportData[i].dispCallerId,
        SessionTime: this.exportData[i].sessionTime,
        BridgeTime: this.exportData[i].bridgeTime,
        DNID: this.exportData[i].dnid,
        SellCost: this.exportData[i].sellCost,
        TerminateCause: this.exportData[i].termDescription,
        Destination: this.exportData[i].dispDestination,
        HangupDisposition: this.exportData[i].hangup_disposition,
        UUID: this.exportData[i].uuid,
      });
    }
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.border = {
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

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'appointment_report');
    });
  }

  downloadPDF() {
    var doc = new jsPDF();
    var col = ["Start Time", "End Time","Caller", "Callee","Caller Id", "Session Time", "Bridge Time",
    "DNID", "Buy Cost", "Terminate Cause", "Country","Hangup Disposition","UUID"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.startTime, element.endTime,element.src, element.dispDst,element.dispCallerId,element.sessionTime, element.bridgeTime,
        element.dnid, element.sellCost, element.termDescription, element.dispDestination, element.hangup_disposition,element.uuid];
      rows.push(e11);
    });
    doc.autoTable(col, rows, {
      theme: 'grid',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      styles: {
        overflow: 'linebreak',
        fontSize: 5.8,
        columnWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
        7: { cellWidth: 'auto' },
        8: { cellWidth: 'auto' },
        9: { cellWidth: 'auto' },
        10: { cellWidth: 'auto' },
        11: { cellWidth: 'auto' },
        12: { cellWidth: 'auto' },
        13: { cellWidth: 'auto' }             },
    });
    doc.save('appointment_report.pdf');
  }



}
