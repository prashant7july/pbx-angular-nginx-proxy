import { Component, OnInit } from '@angular/core';
import { ExtensionService } from '../../extension/extension.service';
import { DashboardService } from '../dashboard.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/core';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
declare const ExcelJS: any;





@Component({
  selector: 'app-customer-realtime-dashboard',
  templateUrl: './customer-realtime-dashboard.component.html',
  styleUrls: ['./customer-realtime-dashboard.component.css']
})
export class CustomerRealtimeDashboardComponent implements OnInit {
  filterForm: FormGroup;
  RegisteredForm:FormGroup
  isFilter = false;
  isFilterr = false;
  columnDefs: any;
  dataSource: any = [];
  errors = '';
  rowData: any;
  extensionList = [];
  fetchValue = '';
  registeredExt = [];
  registerExtCount = 0;
  unRegisterExtCount = 0;
  dndRegisterExtCount = 0;
  defaultPageSize = '10';
  searchValue = [];
  excelValue = [];
  // public __extenaionInfoSubscription;
//  public __realTimeExtenaionInfoSubscription;


  constructor(
    private dashboardService: DashboardService,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
    public commonService: CommonService

  ) {
    this.filterForm = this.formBuilder.group({
      'by_number': [""],
      'by_username':[""]
    });
    this.RegisteredForm = this.formBuilder.group({
      'registered_type':[""]
      // 'Registered_Extensions': [""],
      // 'UnRegistered_Extensions':[""],
      // 'DND_Enable_Extensions':[""],
    });
  }

  ngOnInit() {
    this.setPage();
    this.getCustomerExtension();
  }
  setPage(refreshCalls?) {    
    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'sipUsername', headerName: 'Extension Name', hide: false, width: 15 },
      { field: 'username', headerName: 'Extension Number', hide: false, width: 10 },
      { field: 'ip', headerName: 'IP', hide: false, width: 15 },
      { field: 'port', headerName: 'Port', hide: false, width: 10 },
      { field: 'protocol', headerName: 'Protocol', hide: false, width: 10 },
      { field: 'user_agent', headerName: 'SIP Client', hide: false, width: 15 },
    ];
    // this.dashboardService.getRegisteredExtension(localStorage.getItem('id')).subscribe(pagedData => {
    //   console.log(pagedData,'---------alletesnhgf');
    //   pagedData = this.manageUserActionBtn(pagedData);
      // this.registeredExt = pagedData;
    //   this.dataSource = [];
    //   this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      // this.getCustomerExtension();
      this.customInit()
    // }, err => {
    //  console.log(err)
    // });
 
}
   customInit() {    
    var user_id = localStorage.getItem("id");
    if (this.isFilter) {      
      const credentials = this.filterForm.value;
      credentials.user_id = user_id;
      this.dashboardService.FilterRegisteredExtension(credentials).subscribe(pagedData => {
        // if(this.isFilterr != true){
          // this.registeredExt = pagedData;
        // }
        this.excelValue = pagedData
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
    else{      
      this.dashboardService.getRegisteredExtension(localStorage.getItem('id')).subscribe(pagedData => {        
        pagedData = this.manageUserActionBtn(pagedData);
        // this.registeredExt = this.excelValue = pagedData;
        this.excelValue = pagedData;
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });                
        // this.customInit()
      },
      err => {
       console.log(err)
      });
    }
  }
  getCustomerExtensionn(value) {      
    this.extensionList = [];  
    const credentials = this.RegisteredForm.value;
    this.fetchValue =  this.RegisteredForm.value.registered_type;      
   
    this.extensionList = credentials.registered_type == 1 ? value.filter((item) => item.color == 'green') : credentials.registered_type == 2 ? value.filter((item) => item.color == 'red') : credentials.registered_type == 3 ? value.filter((item) => item.color == 'yellow') : value;  
  }


  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let prortocolData = "";
      let data = (pagedData[i].contact).split('@');
      let ipData = ((data[1]).split(';'))[0];
      if(pagedData[i].contact.indexOf('transport') != -1){
        if (((((data[1]).split(';'))[1]).split('='))[0] == 'transport') {
          prortocolData = (((data[1]).split(';'))[1]).split('=')[1]
        } else {
          prortocolData = (((data[1]).split(';'))[2]).split('=')[1]
        }
      }else{
          let p = ((pagedData[i].socket).split(':'))[0];
          prortocolData = p ? p.toUpperCase(): '';
      }
      let portData = ipData.split(':')[1];
      ipData = ipData.split(':')[0];
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "</span>";

      pagedData[i]['ip'] = ipData;
      pagedData[i]['port'] = portData;
      pagedData[i]['protocol'] = prortocolData;
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

   exportToExcel(): void {
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
      { header: 'Extension Name', key: 'sipUsername', width: 25 },
      { header: 'Extension Number', key: 'username', width: 30 },
      { header: 'IP', key: 'ip', width: 30 },
      { header: 'Port', key: 'port', width: 30 },
      { header: 'Protocol', key: 'protocol', width: 30 },
      { header: 'SIP Client', key: 'user_agent', width: 35 },
    ];
    worksheet.getRow(1).font = {
      bold: true,
    }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
    };
    for (let i = 0; i < this.excelValue.length; i++) {
      worksheet.addRow({
        sipUsername: this.excelValue[i].sipUsername,
        username: this.excelValue[i].username,
        ip: this.excelValue[i].ip,
        port: this.excelValue[i].port,
        protocol: this.excelValue[i].protocol,
        user_agent: this.excelValue[i].user_agent
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

    let offset = this.excelValue.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset));
    //this.excelService.exportAsExcelFile(arr, 'contactList');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'Registered Extension');
    });

  }

  resetTable() {
    this.isFilter = false;
    this.setPage();
  }

  filterData() {    
    this.isFilter = true;
    this.setPage();
  }

  public getCustomerExtension() {    
    let user_id = localStorage.getItem("id");
    this.extensionService.getExtensionForRealTimeDashboard(user_id).subscribe(pagedData => {
      this.extensionList = pagedData;
      if (pagedData) {
        this.manipulateArray();
      }
    });
  }

  public manipulateArray() {
    this.registerdExtension().then(() => {
        this.registerExtCount = 0;
        this.unRegisterExtCount = 0;
        this.dndRegisterExtCount = 0;
        let count = 0;
        this.extensionList = this.extensionList.map(item => {
            count++;
            let obj = item;
            this.registeredExt.forEach(item2 => {
                if (item['ext_number'] == item2['username']) {
                    obj['color'] = 'green';
                    return;
                }
            });
            return obj;
        });
        if (this.extensionList.length == count) {
            this.extensionList = this.extensionList.map(item => {
                let obj = item;
                if (obj['dnd'] == 1) {
                    this.dndRegisterExtCount++;
                    obj['color'] = 'rgb(250, 211, 17)'; //rgb(155, 102, 102) yellow
                } else {
                    if (!obj.hasOwnProperty('color')) {
                        obj['color'] = 'red';
                        this.unRegisterExtCount++;
                    } else {
                        obj['color'] = 'green';
                        this.registerExtCount++;
                    }
                }
                return obj;
            });
        }
        if (this.isFilterr == true) {
            this.getCustomerExtensionn(this.extensionList);
        }
    }).catch(error => {
        console.log(error);
    });
}

  resettTable() {    
    this.fetchValue = ''
    this.isFilterr = false;
    this.getCustomerExtension();
  }

  filterrData() {      
    this.isFilterr = true;
    this.getCustomerExtension();
  }

  registerdExtension (){    
    return new Promise<void> ((resolve, reject) => {
      this.dashboardService.getRegisteredExtension(localStorage.getItem('id')).subscribe(pagedData => {            
        this.registeredExt = pagedData;      
        resolve();
      },
      err => {
       console.log(err)
       reject(err);
      });
    })
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
   
   
  }

  public refeshLiveDashboard(){
     this.setPage();
    // this.ngOnInit();
  }

  ngOnDestroy(): void {
   
    // this.__extenaionInfoSubscription.unsubscribe();
  //  this.__realTimeExtenaionInfoSubscription.unsubscribe();
  }

}