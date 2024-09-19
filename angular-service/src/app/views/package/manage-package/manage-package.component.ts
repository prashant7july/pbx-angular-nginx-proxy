import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CommonService, ProductService, ExcelService, PackageData, CallPlanRate } from '../../../core';
import { PackageService } from '../package.service';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CallplanService } from '../../call-plan/callplan.service';
import { SmsService } from '../../sms/sms.service';
import { UserService } from '../../user/user.service';

declare const ExcelJS: any;

@Component({
  selector: 'app-manage-package',
  templateUrl: './manage-package.component.html',
  styleUrls: ['./manage-package.component.css']
})
export class ManagePackageComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  filterForm: FormGroup;
  isFilter = false;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  callPlans: any = [];
  menus: any;
  packageMenu: any = '';
  public minutePlan: any= [
    {id: 1,
    name:'Bundle'},
    {id: 2,
    name:'Roaming'},
    {id: 3,
    name:'Tele Consultancy'},
    ];

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Call Plan';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';

  constructor(
    private packageService: PackageService,
    private router: Router,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    private productService: ProductService,
    private excelService: ExcelService,
    public dialog: MatDialog,
  ) {
    this.filterForm = this.formBuilder.group({
      'by_validity': [''],
      'by_name': [''],
      'by_product': [''],
      'by_billing_type': [''],
      'by_minute_plan':[''],
      'by_call_plan': new FormControl([]),
    });
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.packageMenu = this.menus.find((o) => o.url == '/package');
    this.userType = localStorage.getItem('type');


    this.productService.getProductInfo().subscribe(data => {
      this.selectedValue = data.response;
    });
    if (localStorage.getItem('type') === '1') {
      this.packageService.getCustomerPackage( Number(localStorage.getItem('id'))).subscribe(pagedData => {
        this.router.navigate(['package/customerView'], { queryParams: { proId: pagedData[0].product_id, pId: pagedData[0].id } });
      });
    } else {
      this.getCallPlans()
      this.displayAllRecord();
    }
  }
  Minuteremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.minutePlan.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Planremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.callPlans.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }


  getCallPlans() {

    this.packageService.getCallPlan().subscribe(data => {
      this.callPlans = data.response;
    });

  }
  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'product_name', headerName: 'Product', hide: false, width: 15 },
      { field: 'name', headerName: 'Package', hide: false, width: 20 },
      { field: 'plan_name', headerName: 'Call Plan', hide: false, width: 10 },
      //  { field: 'duration', headerName: 'Validity', hide: false, width: 10 },

    ];

    if (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2') {
      if (this.isFilter) {
        const credentials = this.filterForm.value;
        credentials.by_billing_type = Number(credentials.by_billing_type);
        
        this.packageService.filterPackage(credentials).subscribe(data => {
          this.exportData = data;
          
          data = this.manageUserActionBtn(data);
          this.dataSource = [];
          this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        }, err => {
          this.error = err.message;
        });
      } else {        
        this.packageService.getPackageInfo().subscribe(pagedData => {                    
          this.exportData = pagedData;
            this.packageService.checkCallRates(pagedData).subscribe((data)=>{
              pagedData = this.manageUserActionBtn(data.data);
              this.dataSource = [];
              this.dataSource.push({ 'fields': this.columnDefs, 'data': data.data });
            })
        });
      }
    }
    if (localStorage.getItem('type') === '1') {
      this.packageService.getCustomerPackage(Number(localStorage.getItem('id'))).subscribe(pagedData => {
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
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Product', key: 'Product', width: 25 },
      { header: 'Package', key: 'Package', width: 20 },
      { header: 'Call Plan', key: 'callPlan', width: 20 },
      { header: 'Validity', key: 'Validity', width: 10 }
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
        Product: this.exportData[i].product_name,
        Package: this.exportData[i].name,
        callPlan: this.exportData[i].plan_name,
        Validity: this.exportData[i].duration,
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

    // this.excelService.exportAsExcelFile(arr, 'package');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'package');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Product", "Package", "Call Plan", "Validity"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.product_name, element.name, element.plan_name, element.duration];
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
        2: { cellWidth: 'wrap' }
      },
    });
    doc.save('package.pdf');
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      if (this.packageMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
        if(pagedData[i].show_rates == true){
          finalBtn += "<i class='fa fa-briefcase list-button' style='cursor:pointer; display: inline' data-action-type='newRates' title='New Call Rates'></i>";   
        }
      }
      if (this.userType == '0' || this.userType == '2') {
        // finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewUsers' title='View Customers'></i>";
        if (this.packageMenu.delete_permission) {
          finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
        }
      }
      if(this.userType == '0' || this.userType == '2'){
      if (pagedData[i]['flag'] == 1) {
        finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewUsers' title='View Customers'></i>";
      }
    }

      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  editPackage(data) {
    this.userType = localStorage.getItem('type');
    if (localStorage.getItem('type') === '0' || localStorage.getItem('type') === '2') {
      this.router.navigate(['package/view'], { queryParams: { proId: data.product_id, pId: data.id,  } });
    } else if (localStorage.getItem('type') === '1') {
      this.router.navigate(['package/customerView'], { queryParams: { proId: data.product_id, pId: data.id } });
    }
  }

  deletePackage(datas) {
    let product_id = datas.product_id;
    let package_id = datas.id;
    this.packageService.getFeatureUserCount(product_id, package_id).subscribe(data => {
      if (data.response[0].user_count >= 1) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'>Package </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + datas.name + "</span> <span style='color:#FFFFFF;'> can't be deleted because it is assigned to one or more accounts.</span>",
          type: 'error',
          background: '#000000',
          timer: 6000
        });
      } else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html: "<span style='color:#FFFFFF;'>Package </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + datas.name + "</span> <span style='color:#FFFFFF;'> will be removed permanently .</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.packageService.deletePackage(product_id, package_id).subscribe(data => {
              this.displayAllRecord();
            });
          }, allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result.value) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Deleted!</span>',
              html: "<span style='color:#FFFFFF;'>Package </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + datas.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 3000
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html: "<span style='color:#FFFFFF;'>Package </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + datas.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
              type: 'error',
              background: '#000000',
              timer: 3000
            });
          }
        });
      }
    });

  }

  showCustomer(data) {
    this.router.navigate(['package/packageCustomer'], { queryParams: { proId: data.product_id, pId: data.id, pName: data.name } });
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editPackage(data);
      case "delete":
        return this.deletePackage(data);
      case "viewUsers":
        return this.showCustomer(data);
        case "newRates":
          return this.addNewCallRates(data);
    }
  }

  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  goToCreate() {
    this.router.navigateByUrl('package/create');
  }

  addNewCallRates(data){
    const dialogRef = this.dialog.open(NewCallRatesDialog, { width: '60%', disableClose: true, data: data });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
    
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoPackageDialog, {
      width: '80%', disableClose: true, autoFocus: false,
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
  selector: 'infoPackage-dialog',
  templateUrl: 'infoPackage-dialog.html',
})

export class InfoPackageDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoPackageDialog>, @Inject(MAT_DIALOG_DATA) public data: PackageData,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'addNewRates-dialog',
  templateUrl: 'addNewRates-dialog.html',
})

export class NewCallRatesDialog {
  addRatesForm: FormGroup;
  serverData: any = {};
  // customer_id = "";
  providerList = "";
  columnDefs = [];
  dataSource = [];
  defaultPageSize = '10';
  exportData  = [];
  table : boolean =  false;

  constructor(
    public dialogRef: MatDialogRef<NewCallRatesDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlanRate,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private smsService: SmsService,
    private userService: UserService,
    private packageService: PackageService,
  ) {
    this.addRatesForm = this.fb.group({
      'name': '',  // 'first_name': [{value:'' , disabled:true}],
      'plan_type': '',
      
    });
  }

  ngOnInit() {
    
    
  }

  isChnageMinutePlanType(e){
    this.table = true;
    
    this.data['plan_type'] = e.value;

    this.packageService.getNewRates(this.data).subscribe((data) =>{
      this.exportData = data['rates'];
      this.displayAllRecord();
    })
    
  }

  displayAllRecord() {
    this.columnDefs = [
      // { field: "action", headerName: "Action", hide: false, width: 90 },
      // { field: "id", headerName: "ID", hide: true, width: 110 },
      // { field: "call_plan", headerName: "Call Plan", hide: false, width: 120 },
      // {
      //   field: "plan_type_name",
      //   headerName: "Plan Type",
      //   hide: false,
      //   width: 120,
      // },
      // { field: 'call_plan', headerName: 'Minute Plan', hide: false, width: 22 },
      {
        field: "dial_prefix",
        headerName: "Dial Prefix",
        hide: false,
        width: 100,
      },
      {
        field: "buying_rate",
        headerName: "Buying Rate",
        hide: false,
        width: 120,
      },
      { field: "talktime_minutes", headerName: "TalkTime Minutes", hide: false, width: 170 },
      {
        field: "actual_minutes",
        headerName: "Actual Minutes",
        hide: false,
        width: 120,
      },
      // { field: 'validity', headerName: 'Validity', hide: false, width: 100 },
      // { field: 'charge', headerName: 'Charge', hide: false, width: 100 },
      // {
      //   field: "group_minutes",
      //   headerName: "Minutes",
      //   hide: false,
      //   width: 120,
      // },
      // { field: 'buying_rate', headerName: 'Buying Rate', hide: false, width: 30 },
      {
        field: "selling_rate",
        headerName: "Selling Rate",
        hide: false,
        width: 120,
      },
      // { field: 'selling_min_duration', headerName: 'Selling Min Duration', hide: false, width: 160 },
      // {
      //   field: "selling_billing_block",
      //   headerName: "Selling Billing Block",
      //   hide: false,
      //   width: 110,
      // },
      // { field: 'booster_for', headerName: 'Booster For', hide: false, width: 150 }
      { field: 'expiry_date', headerName: 'Expiry Date', hide: false, width: 175 }
    ];

    this.dataSource = [];
    this.dataSource.push({ fields: this.columnDefs, data: this.exportData });
  }

  submitAssignRates(){
    let credentials = {};
    credentials['rates'] = this.exportData;
    credentials['users'] = this.data['customers_id'];
    credentials['feature_id'] = this.data['feature_id'];

    if(credentials['rates'].length < 1){
      this.toastr.error('Error!', 'No Rates Available', { timeOut: 2000 });
    }else{
      this.packageService.assignNewRates(credentials).subscribe((data)=>{
        
        if(data.status_code == 200){
          this.toastr.success('Success!', 'Rates Assigned !!', { timeOut: 2000 });
          this.dialogRef.close();
        }else{
          this.toastr.error('Error!', 'Something bad wrong.', { timeOut: 2000 });
        }
      })
    }

  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
 
  cancleDialog(): void {
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }


}