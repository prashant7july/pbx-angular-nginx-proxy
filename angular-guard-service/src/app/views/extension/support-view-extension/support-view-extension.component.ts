import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup,FormControl } from '@angular/forms';
import { PagedData, Page, AllExtension } from '../../../core/models';
import { ExtensionService, ExcelService, CommonService } from '../../../core';
import { UserService } from '../../user/user.service';
import { ToastrService } from 'ngx-toastr';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserTypeConstants } from 'src/app/core/constants';

declare const ExcelJS: any;


export var userId = '';
export var productId = '1';
export var count = false;

@Component({
  selector: 'app-support-view-extension',
  templateUrl: './support-view-extension.component.html',
  styleUrls: ['./support-view-extension.component.css']
})
export class SupportViewExtensionComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  companyfilterForm: FormGroup;
  isFilter = false;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  userRole = false;
  showSearching = false;
  exportData: any = {};
  defaultPageSize = '10';
  companyList: any[] = [];
  ExtensionNumber:any[] = [];
  public mode ;
  public selectAllText: string
  public fields: Object = { text: 'name', value: 'id' };
  public fields1: Object = { text: 'name', value: 'name' };
  public placeholder: string = 'Select Company';
  public placeholder1: string = 'Extension Number';
  public popupHeight: string = '200px'; 
  public popupWidth: string = '100%';
  public companyInSelectedFilter  : any ;
  constructor(
    private router: Router,
    private extensionService: ExtensionService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public commonService: CommonService,
    private route: ActivatedRoute,
  ) {
    this.filterForm = this.formBuilder.group({
      'by_username': [""],
      'by_external_callerId': [""],
      'by_number':new FormControl([])
    });
    this.companyfilterForm = this.formBuilder.group({
      'company_id': [""],
    });
 }

  ngOnInit() {    
    this.mode = 'CheckBox';
    this.selectAllText= 'Select All';
    let id = localStorage.getItem('id');
    let userType = localStorage.getItem('type');
    this.userRole = localStorage.getItem('type') == '0' ||localStorage.getItem('type') == '2' ? true : localStorage.getItem('type') == '4' ? true: false;
    //get customer company
    productId = localStorage.getItem('header_product_value') ? localStorage.getItem('header_product_value') : '1';
 
    if (userType == UserTypeConstants.ADMIN) {  
      
      this.userService.getCustomerCompany(productId).subscribe(datas => {        
        // this.selectedValue = data.response;
        let data = datas.response;
        let companyData = []
        for (let i = 0; i < data.length; i++) {
          companyData.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});

        }
        this.companyList = companyData
      }, err => {
        this.error = err.message;
      });
    } else if (userType == UserTypeConstants.ACCOUNT_MANAGER) {  
      this.extensionService.getExtension(productId).subscribe(datas => {
        
        let data = datas.response;
        // for (let i = 0; i < data.length; i++) {
        //   this.ExtensionNumber.push({ id: data[i].id, name: data[i].ext_number });
        // }
      }, err => {
        this.error = err.message;
      });
      this.userService.getAccountManagerCustomercompany(localStorage.getItem('id')).subscribe(datas => {
        // this.selectedValue = data.response;
        let data = datas.response;
        let companyData = []
        for (let i = 0; i < data.length; i++) {
          companyData.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
        }
        this.companyList = companyData
      }, err => {
        this.error = err.message;
      });
    }
    else if (userType == '3') {
      this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          // this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')',  });
          this.companyList.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
          // this.droplist.push({ id: data[i].id, name: data[i].company_name });
          // this.filterProducthtml = this.ProducthtmlFilter = this.droplist.slice();
        }
      }, err => {
        this.error = err.message;
      });
    }
     else {
      this.userService.getCustomerCompany(productId).subscribe(datas => {
        // this.selectedValue = data.response;
        let data = datas.response;
        let companyData = []
        for (let i = 0; i < data.length; i++) {
          companyData.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
        }
        this.companyList = companyData;
        this.bindSelectCompany()
        // }
      }, err => {
        this.error = err.message;
      });
    }
  } 

  bindSelectCompany(){
    let user_id = this.route.snapshot.queryParams.id;    
    if(user_id){
        this.companyfilterForm.get('company_id').setValue(Number(user_id))
        this.companyInSelectedFilter = Number(user_id)
        this.showSearching = true;
      this.displayAllRecord()
    }
  }
  removedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterDataa = this.ExtensionNumber.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterDataa);
  }
  Companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterDataa = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterDataa);
  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: this.userRole, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'ext_number', headerName: 'Number', hide: false, width: 5 },
      { field: 'username', headerName: 'Name', hide: false, width: 10 },
      { field: 'caller_id_name', headerName: 'Caller ID Name', hide: false, width: 10 },
      //{ field: 'external_caller_id', headerName: 'External Caller ID', hide: false, width: 10 },
      { field: 'email', headerName: 'Email', hide: false, width: 15 },
      // { field: 'codec', headerName: 'Codec', hide: false, width: 20 },
     
    ];

    if (this.isFilter) {

      const credentials = this.filterForm.value;
      credentials.user_id = this.companyfilterForm.value.company_id;
      
     this.extensionService.filterSupportExtension(credentials).subscribe(pagedData => {
    // this.ExtensionNumber = [];

      
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {  
      // let user_id = this.route.snapshot.queryParams.id;
      const user_id =  this.companyfilterForm.value.company_id  
      this.extensionService.getExtension(user_id).subscribe(pagedData => {
        this.ExtensionNumber = [];
    // this.filterForm.get('by_number').reset();
    // this.filterForm.get('by_number').setValue('');
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        for (let i = 0; i < pagedData.length; i++) {
          this.ExtensionNumber.push({ id: pagedData[i].id, name: pagedData[i].ext_number });
        }
      });
       
     
    }
  }

  exportToExcel(): void {
    let worksheet: any;
    let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    let blobType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    worksheet = workbook.addWorksheet('My Sheet', {
      properties: {
        defaultRowHeight: 100,
      }, 
      pageSetup:{paperSize: 8, orientation:'landscape',fitToPage: true, fitToHeight: 1, fitToWidth: 1}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };

    worksheet.columns = [
      { header: 'Number', key: 'Number', width: 15 },
      { header: 'Ext Name', key: 'ExtName', width: 20 },
      { header: 'Caller ID Name', key: 'CallerIDName', width: 20 },
      //{ header: 'External Caller ID', key: 'ExternalCallerID', width: 20 },
      { header: 'Email', key: 'Email', width: 30 },
      // { header: 'Codec', key: 'Codec', width: 40 },
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
        Number: this.exportData[i].ext_number,
        ExtName: this.exportData[i].username,
        CallerIDName: this.exportData[i].caller_id_name,
        //ExternalCallerID: this.exportData[i].external_caller_id,
        Email: this.exportData[i].email,
        Codec: this.exportData[i].codec,
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
    // worksheet.eachRow(function (row, _rowNumber) {
    //   row.eachCell(function (cell, _colNumber) {
    //     cell.border = {
    //       top: { style: 'thin', color: { argb: '000000' } },
    //       left: { style: 'thin', color: { argb: '000000' } },
    //       bottom: { style: 'thin', color: { argb: '000000' } },
    //       right: { style: 'thin', color: { argb: '000000' } }
    //     };
    //   });
    // });
    //To repeate header row on each page
    worksheet.pageSetup.printTitlesRow = '1:2';
    let offset = this.exportData.length; // to offset by 3 rows
    worksheet.spliceRows(1, 0, new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'extension');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'extension');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Number", "Ext Name", "Caller ID Name", "Email"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.ext_number, element.username, element.caller_id_name, element.email, element.codec];
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
       // 5: { cellWidth: 'wrap' }
      },
    });
    doc.save('extension.pdf');
  }


  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline' data-action-type='view' title='View'></i>";
      finalBtn += "</span>";

      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  editExtension(data) {
    this.router.navigate(['extension/supportViewExtension/manage'], { queryParams: { id: data.id, customer_id: data.customer_id } });
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    //alert(actionType);
    switch (actionType) {
      case "view":
        return this.editExtension(data);
    }
  }

  resetTable() {
    // count = true;

    this.isFilter = false;
    this.displayAllRecord();
  }

  selectCompanyDiv(e) {
    this.isFilter = false; 
    this.filterForm.get('by_number').reset();
    this.filterForm.get('by_username').setValue('');
    this.companyfilterForm.get('company_id').setValue(Number(e.itemData.id))
    this.showSearching = true;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoSupportExtensionDialog, {
      width: '80%', disableClose: true, autoFocus:false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRefInfo.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefInfo.close('Dialog closed');
      }
    });
    dialogRefInfo.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }
}

@Component({
  selector: 'infoSupportExtension-dialog',
  templateUrl: 'infoSupportExtension-dialog.html',
})

export class InfoSupportExtensionDialog {
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoSupportExtensionDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      document.getElementsByTagName("app-website-nav")[0].scrollIntoView();
    });
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
