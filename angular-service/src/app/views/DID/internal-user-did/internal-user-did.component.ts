import { Component, OnInit,Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DidService } from '../did.service';
import { CommonService,ExcelService } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../user/user.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare const ExcelJS: any;

@Component({
  selector: 'app-internal-user-did',
  templateUrl: './internal-user-did.component.html',
  styleUrls: ['./internal-user-did.component.css']
})
export class InternalUserDidComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  countryList = [];
  CountrydataFilter = [];
  isFilter = false;
  selectedValue:any = "";
  columnDefs: any;
  dataSource: any = [];
  userRole = '';
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
 
  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'company_name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';

  constructor(private router: Router,
    private didService: DidService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toastr: ToastrService,
    private userService: UserService,
    private excelService: ExcelService,
    public dialog: MatDialog,
  ) {
    this.filterForm = this.fb.group({
      'by_did': [""],
      'by_country': new FormControl([]),
      'by_status': [""],
      'by_company': new FormControl([]),
      'by_group': [""]
    });

  }

  ngOnInit() {
    this.didService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });
    //get country list
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
    }, err => {
      this.error = err.message;
    });

    this.userService.getAccountManagerCustomercompany(localStorage.getItem('id')).subscribe(data => {
      this.selectedValue = data.response;
    }, err => {
      this.error = err.message;
    });
  }
  Countryremovedspace = (event:any) => {
    const countryspace = event.text.trim().toLowerCase();
    const countryFilter = this.countryList.filter((data) =>{
      return data['name'].toLowerCase().includes(countryspace);
    })
    event.updateData(countryFilter);
  }
  Companyremovedspace = (event:any) => {
    const countryspace = event.text.trim().toLowerCase();
    const countryFilter = this.selectedValue.filter((data) =>{
      return data['company_name'].toLowerCase().includes(countryspace);
    })
    event.updateData(countryFilter);
  }

  displayAllRecord() {
    var user_id = localStorage.getItem("id");
    var user_type = localStorage.getItem("type");
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'didDisplay', headerName: 'DID', hide: false, width: 10 },
      { field: 'country', headerName: 'Country', hide: false, width: 10 },
      { field: 'company_name', headerName: 'Company', hide: false, width: 10 },
      // { field: 'provider', headerName: 'Provider', hide: false, width: 10 },  // bhati sir said removed this from AM
      { field: 'max_concurrent', headerName: 'Max CC', hide: false, width: 10 },
      { field: 'did_group', headerName: 'Group', hide: false, width: 10 },
      { field: 'did_type', headerName: 'DID Type', hide: false, width: 10 },
      { field: 'destination_name', headerName: 'Assigned to', hide: false, width: 10 },
      { field: 'activated', headerName: 'Status', hide: false, width: 10 },
  
    ];
    if (user_type === '4') {
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        this.didService.filterInternalUserCustomerDID(credentials, user_id).subscribe(data => {
          this.exportData = data;
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        }, err => {
          this.error = err.message;
        });
      } else {
        this.didService.getIntenalUserDID(user_id).subscribe(pagedData => {
          this.exportData = pagedData;
          pagedData = this.manageUserActionBtn(pagedData);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
        });
      }

    } else {
      this.toastr.error('Error!', "Unauthorise access!!!", { timeOut: 2000 });
      this.router.navigateByUrl('did/internalUser-view');
    }
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
      pageSetup:{paperSize: 8, orientation:'landscape',fitToPage: true, fitToHeight: 5, fitToWidth: 7}
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };

    worksheet.columns = [
      { header: 'DID', key: 'Did', width: 20 },
      { header: 'Country', key: 'Country', width: 30 },
      { header: 'Company', key: 'Company', width: 30 },
      { header: 'Group', key: 'Group', width: 20 },
      { header: 'Max CC', key: 'MaxCC', width: 15 },
      { header: 'DID Type', key: 'DidType', width: 25 },
      { header: 'Assigned to', key: 'ReservedFor', width: 25 },
      { header: 'Status', key: 'Status', width: 10 },
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
      let strStatus = this.exportData[i].activated;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Did:this.exportData[i].did,
        Country:this.exportData[i].country,
        Company:this.exportData[i].company_name,
        Group:this.exportData[i].did_group,
        MaxCC:this.exportData[i].max_concurrent,
        DidType:this.exportData[i].did_type,
        ReservedFor:this.exportData[i].active_feature +' - ' +this.exportData[i].destination_name,
        Status:strStatus1
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
    //  worksheet.eachRow(function (row, _rowNumber) {
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
    worksheet.spliceRows(1,0,new Array(offset));

    // this.excelService.exportAsExcelFile(arr, 'did');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'did');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["DID", "Country","Company","Group","Max CC","DID Type","Assigned to","Status"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.activated;
      let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11= [element.did,element.country,element.company_name,element.did_group,element.max_concurrent,element.did_type,element.active_feature,strStatus1];
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
        3:{cellWidth: 'wrap'},
        4:{cellWidth: 'wrap'},
        5: {cellWidth: 'wrap'},
        6: {cellWidth: 'wrap'},
        7: {cellWidth: 'wrap'}
      },
    });
    doc.save('did.pdf');
  }


  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline' data-action-type='view' title='View'></i>";
      finalBtn += "</center></span>";
      if (pagedData[i].activated == 'Active') {
        pagedData[i].activated = "<span style='color:#379457;'><strong>" + pagedData[i].activated + "</strong></span>";
      } else {
        pagedData[i].activated = "<span style='color:#c69500;'><strong>" + pagedData[i].activated + "</strong></span>";
      }
      if(pagedData[i]['active_feature'] != null){
        pagedData[i]['destination_name'] =  pagedData[i]['active_feature']+" - "+ pagedData[i]['destination_name'];
  }
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    //alert(actionType);
    switch (actionType) {
      case "view":
        return this.editDID(data);
    }
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  editDID(data) {
    this.router.navigate(['did/internalUser-view/manage'], { queryParams: { id: data.id } });
  }
 
  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoInternalUserDidDialog, {
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
  selector: 'infoInternalUserDid-dialog',
  templateUrl: 'infoInternalUserDid-dialog.html',
})

export class InfoInternalUserDidDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoInternalUserDidDialog>, @Inject(MAT_DIALOG_DATA) public data:'',
  ) {}
 
  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }
  
  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}