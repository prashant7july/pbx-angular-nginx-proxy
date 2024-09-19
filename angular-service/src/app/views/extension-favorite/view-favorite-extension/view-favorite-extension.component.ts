import { Component, OnInit } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Errors, CommonService,ExcelService, ExtensionService } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FeaturesCodeService } from '../../features-code/features-code.service';
import { FavoriteExtensionService } from '../favorite-extension.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

declare const ExcelJS: any;

@Component({
  selector: 'app-view-favorite-extension',
  templateUrl: './view-favorite-extension.component.html',
  styleUrls: ['./view-favorite-extension.component.css']
})
export class ViewFavoriteExtensionComponent implements OnInit {

  error = '';
  filterForm: FormGroup;
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
  isCallTransfer : boolean = false;
  isCallForward : boolean = false;
  isVoicemail : boolean = false;
  isAdminExtension : boolean = false;
  extensionUserId : any ;
  extensionList : any = [];
  constructor(
    private favoriteExtensionService: FavoriteExtensionService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private extensionService: ExtensionService,
    private toastr: ToastrService,
  ) {
    this.filterForm = this.fb.group({
      'by_username': [""],
      'by_type': [""],
      'by_number': [""],
      'by_roaming' : [""],
      'by_id' : [""],
      
    });   
  }

  ngOnInit() {
    this.favoriteExtensionService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'ext_number', headerName: 'Extension Number', hide: false, width: 10 },
      { field: 'username', headerName: 'Extension Name', hide: false, width: 10 },
      { field: 'email', headerName: 'Email', hide: false, width: 12 },
   
    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.by_id = Number(credentials.by_id);
      credentials.by_number = Number(credentials.by_number);
      let user_id = localStorage.getItem("id");
      this.extensionService.getExtensionById(user_id).subscribe(data => {
        this.filterForm.get('by_id').setValue(data.response[0].ext_number)
        let ext_admin_id = data.response[0] ? (data.response[0].customer_id) : 0;
        credentials.user_id = ext_admin_id;
        this.extensionService.filterExtension(credentials).subscribe(pagedData => {
          let allExtn = pagedData ? pagedData : [];
          this.extensionList = allExtn.filter(item => item.ext_number != data.response[0].ext_number)
          let managedData = this.extensionList;
          this.exportData = this.extensionList;
          managedData = this.manageUserActionBtn(managedData, data.response[0].favorite);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': managedData });
        });
      })
    } else {
      let user_id = localStorage.getItem("id");
      this.extensionService.getExtensionById(user_id).subscribe(data => {
        this.filterForm.get('by_id').setValue(data.response[0].ext_number)
        let ext_admin_id = data.response[0] ? (data.response[0].customer_id) : 0
        this.extensionService.getExtension(ext_admin_id).subscribe(pagedData => {
          let allExtn = pagedData ? pagedData : [];
          this.extensionList = allExtn.filter(item => item.ext_number != data.response[0].ext_number)
          let managedData = this.extensionList;
          this.exportData = this.extensionList;
          managedData = this.manageUserActionBtn(managedData, data.response[0].favorite);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': managedData });
        });
      })
    }
  }
  

  manageUserActionBtn(pagedData, favoriteContact) {
    console.log(favoriteContact);
    // console.log(JSON.parse(favoriteContact));
    
    
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let d = favoriteContact ? (JSON.parse(favoriteContact))['ext_number'] : '';
      console.log(d);
      let favoriteContactList = favoriteContact ? d.split(','): [];
      console.log('favoriteContactList',favoriteContactList);
      
      finalBtn += "<span>";
      favoriteContactList = favoriteContactList.filter(item=>  item == pagedData[i].ext_number);
      if(favoriteContactList.length > 0){
        pagedData[i]['favorite'] = 1;
        finalBtn += "<i class='fa fa-star' style='cursor:pointer; display: inline ; color: green' data-action-type='favorite' title='Make UnFavorite'></i>";
      }else{
        finalBtn += "<i class='fa fa-star' style='cursor:pointer; display: inline;  color: black' data-action-type='favorite' title='Make Favorite'></i>";
        pagedData[i]['favorite'] = 0;
      }
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "favorite":
        return this.makeContactFavorite(data); 
      case "delete":
        // return this.deleteExtension(data);
    }
  }

  public makeContactFavorite(event){
    console.log('cdsoc',event);
    let type = (event.favorite == 0) ? 'favorite' :'Unfavorite';
    event['id'] = localStorage.getItem('id');
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>Are you want to make SIP </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.ext_number +"</span><span style='color:#FFFFFF;'> as a " +  type + "? </span>?",
      type: 'question',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes',   // make ' + type,
      cancelButtonText: 'No', //, make ' + type,
      preConfirm: () => {
        let obj = {};
        this.favoriteExtensionService.makeFavoriteContact(event).subscribe(data => {
          this.displayAllRecord();
          if(data[0].MYSQL_SUCCESSNO === 401){
            this.toastr.error('Error!', data[0].MESSAGE_TEXT, { timeOut: 2000 });
          }else if(data[0].MYSQL_SUCCESSNO === 200 || data[0].MYSQL_SUCCESSNO === 201){
            this.toastr.success('Error!', data[0].MESSAGE_TEXT, { timeOut: 2000 });
          }else{
            console.log(data);
          }
        },
          err => {
            // this.toastr.error('Error!', err.message, { timeOut: 2000 });
            this.error = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">'+type+'!</span>',
          html:  " <span style='color:#FFFFFF;'> SIP </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.ext_number+ "</span> <span style='color:#FFFFFF;'maked as a " + type+"</span>",
          type: 'success',
          background: '#000000'
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
           html: "<span style='color:#FFFFFF;'>Request has been Cancelled</span>",  //Contact did not make as a ' + type,
          type: 'error',
          background: '#000000',
        });
      }
    })
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  exportToExcel():void { 
    let worksheet:any;
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
      { header: 'Code', key: 'Code', width: 15 },
      { header: 'Type', key: 'Type', width: 20 },
      { header: 'Name', key: 'Name', width: 25 },
      { header: 'Description', key: 'Description', width: 80 }
    ];

    worksheet.getRow(1).font={
      bold:true,
    }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'FFFF00'}
    };
    for(let i=0;i<this.exportData.length;i++){
      let strCode = this.exportData[i].code;
      let strCode1 = strCode.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Code:strCode1,
        Type:this.exportData[i].type,
        Name:this.exportData[i].name,
        Description:this.exportData[i].description,
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
    worksheet.spliceRows(1,0,new Array(offset))

    // this.excelService.exportAsExcelFile(arr, 'featureCode');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'featureCode');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Code","Type","Name","Description"];
    var rows = [];
    this.exportData.forEach(element => {
      debugger
      let strCode = element.code;
      let strCode1 = strCode.replace(/<[^>]*>/g, '');
      const e11= [strCode1,element.type,element.name,element.description];
      rows.push(e11);
    });
    doc.autoTable(col, rows,{
      theme: 'grid',      
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      styles: {
        overflow: 'linebreak',
        fontSize: 6
      },     
      columnStyles: {
        0: {cellWidth: 'wrap'},
        1: {cellWidth: 'wrap'},
        2: {cellWidth: 'wrap'},
        3:{cellWidth: 'wrap'}
      },
    });
    doc.save('featureCode.pdf');
  }

  
  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  showInfo() {
    // const dialogRefInfo = this.dialog.open(InfoFeatureCodeDialog, {
    //   width: '80%', disableClose: true, autoFocus:false,
    //   data: {
    //     customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
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
}

