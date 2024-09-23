import { Component, OnInit, Inject } from '@angular/core';
import { Errors, CommonService, ExcelService, Name_RegEx, UserService, GatewayService } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl,FormArray} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CallplanService } from '../callplan.service';
import { Page, CallPlan } from '../../../core/models';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';

declare const ExcelJS: any;

@Component({
  selector: 'app-call-plan',
  templateUrl: './call-plan.component.html',
  styleUrls: ['./call-plan.component.css']
})
export class CallPlanComponent implements OnInit {
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  errorField = "";
  isFilter = false;
  filterForm: FormGroup;
  errors: Errors = { errors: {} };
  exportData: any = {};
  defaultPageSize = '10';
  circleList: any = "";
  CallPlanFilter:any;
  filterCircle:any;
  menus: any;
  callPlanMenu: any = '';
  callRateMenu: any = '';

  public mode = 'CheckBox';;
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Circle';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';

  constructor(
    private fb: FormBuilder,
    private callplanService: CallplanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private router: Router,
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_type': [""],
      'by_circle': Number([]),
      'minute_paln_type': [""],
      'by_minute_plan': [''],
      'by_validity': [''],
      'by_bundle_type': [''],
    });
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.callPlanMenu = this.menus.find((o) => o.url == '/callPlan/callplan');
    this.callRateMenu = this.menus.find((o) => o.url == '/callPlan/view');
    this.callplanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    this.getCircle();
  }
  Circleremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.circleList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 20 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 25 },
      { field: 'charge', headerName: 'Plan Price(₹)', hide: false, width: 15 },
      { field: 'validity', headerName: 'Validity', hide: false, width: 10 },
      { field: 'lcTypeDisplay', headerName: 'LC Type', hide: false, width: 30 },
      { field: 'circle_name', headerName: 'Circle', hide: false, width: 20 },
      { field: 'plan_type_name', headerName: 'Plan Type', hide: false, width: 30 },

    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;            
      credentials.minute_paln_type = Number(this.filterForm.value.minute_paln_type);
      credentials.by_type = Number(this.filterForm.value.by_type); 
      credentials.by_circle = this.filterForm.value.by_circle == 0 ? [] : this.filterForm.value.by_circle;           
      this.callplanService.filterCallPlan(credentials).subscribe(pagedData => {
        
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.errors = err.message;
      });
    } else {
      this.callplanService.viewCallPlan({ id: null, name: null }).subscribe(pagedData => {
      
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
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'LC Type', key: 'lcTypeDisplay', width: 35 },
      { header: 'Circle', key: 'circle_name', width: 35 },
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
        name: this.exportData[i].name,
        lcTypeDisplay: this.exportData[i].lcTypeDisplay,
        circle_name: this.exportData[i].circle_name
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
    worksheet.spliceRows(1, 0, new Array(offset))

    //this.excelService.exportAsExcelFile(arr, 'callPlan');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'callPlan');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Name", "LC Type", "Circle"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.name, element.lcTypeDisplay, element.circle_name];
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
    doc.save('callPlan.pdf');
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let nameBtn = '';
      let extbtn;
      extbtn = Number(pagedData[i].charge) + Number(pagedData[i].extra_fee);
      nameBtn += "<span>";
      nameBtn += pagedData[i].name;
      pagedData[i]['actual_value'] = pagedData[i].name;
      finalBtn += "<span>";     
      if(this.callPlanMenu.all_permission == '0' && this.callPlanMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if (this.callPlanMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (this.callPlanMenu.delete_permission) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      if (this.callRateMenu && pagedData[i]['flag'] == 1) {
        finalBtn += "<i class='fa fa-phone edit-button' style='cursor:pointer; display: inline' data-action-type='showCallPlanRate' title='Call Rate'></i>";
      }
      if (pagedData[i]['is_visible_customer'] == '1') {
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' title='Visible For Customer'></i>";
      }
      if(pagedData[i]['associate'] == 1) {
        finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='associatePackage' title='Associate customer'></i>";      
      }
      // if(pagedData[i]['associate'] == 1 && this.callPlanMenu.modify_permission) {
      //   finalBtn += "<i class='fa fa-briefcase list-button' style='cursor:pointer; display: inline' data-action-type='newRates' title='New Call Rates'></i>";      
      // }
      if(pagedData[i]['status'] == 1) {
        finalBtn += "<i class='fa fa-list list-button' style='cursor:pointer; display: inline' data-action-type='callPlanAssociatePackage' title='Associate Package'></i>";      
      }
      finalBtn += "</span>";
      pagedData[i]['name'] = nameBtn;
      pagedData[i]['action'] = finalBtn;
      pagedData[i]['charge'] = extbtn;
      
      
    }

    return pagedData;
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(CallPlanDialog, { width: '60%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editCallPlan(data);
      case "delete":
        return this.deleteCallPlan(data);
      case "showCallPlanRate":
        return this.showCallPlanRates(data);
      case "associatePackage":
        return this.associatePackageDetail(data);
      case "callPlanAssociatePackage":
        return this.callPlanAssociatePackageDetail(data);
      case "newRates":
        return this.NewRates(data);
    }
  }

  NewRates(data){
    
    const dialogRef = this.dialog.open(NewRatesDialog, { width: '60%', disableClose: true, data: data });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
    
  }

  editCallPlan(event) {
    this.openDialog(event.id);
  }


  deleteCallPlan(event) {
    // this.cancelCallPlan();

    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Call Plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.actual_value + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.callplanService.deleteCallPlan({ id: event.id }).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                text: data['message'],
                showConfirmButton: false,
                timer: 3000,
                background: '#000000'
              })
            return;
          } else {
            this.displayAllRecord();
          }
        },
          err => {
            this.errors = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Call Plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.actual_value + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000'
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Call Plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.actual_value + "</span> <span style='color:#FFFFFF'> is safe.</span> ",
          type: 'error',
          background: '#000000',
        });
      }
    })
  }

  public showCallPlanRates(data) {
    this.router.navigateByUrl('/callPlan/view', { state: data });
  }

  public associatePackageDetail(data) {        
    this.router.navigate(['/callPlan/callplan/associate-package'], {queryParams: {id: data.id, name: data.actual_value}})
  }

  public callPlanAssociatePackageDetail(data) {        
    this.router.navigate(['/callPlan/callplan/callPlan-associate-package'], {queryParams: {id: data.id}})
  }



  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoCallPlanDialog, {
      width: '80%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0
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

  public getCircle() { //get circle data
    this.callplanService.getCircle().subscribe(data => {
      this.circleList = data.response;
      this.filterCircle = this.CallPlanFilter = this.circleList.slice();
    }, err => {
      this.errors = err.message;
    });
  }
}

@Component({
  selector: 'infoCallPlan-dialog',
  templateUrl: 'infoCallPlan-dialog.html',
})

export class InfoCallPlanDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoCallPlanDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlan,
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
  selector: 'new-rates-dialog',
  templateUrl: 'new-rates-dialog.html',
})

export class NewRatesDialog {
  error = "";
  isFilter = false;
  filterForm: FormGroup;
  selectedValue: any = [];
  allCountryList: any = "";
  ManageIcon;
  SelectCallFilter: any;
  filterCallPlan: any;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  callplanId: any;
  exportData: any = {};
  defaultPageSize = "10";
  loginUserType = localStorage.getItem("type");
  accountManagerCustomerList: "";
  selectedGroupValue: any;
  gateways: any = [];
  companyList: any[] = [];
  GatewayFilter: any;
  filterGateway: any;
  autoFilledCallPlanFilter: any;
  public mode = "CheckBox";
  public selectAllText: string = "Select All";
  constructor(
    public dialogRefInfo: MatDialogRef<NewRatesDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlan,
    private fb: FormBuilder,
    private callplanService: CallplanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private gatewayService: GatewayService,
    private toastr: ToastrService
    
  ) { }

  ngOnInit() {
    this.callplanId = this.data.id;
    
    // const element = document.querySelector('#scrollId');
    // element.scrollIntoView();
    this.displayAllRecord();
  }

  displayAllRecord() {
    let loginUserId = localStorage.getItem("id");
    let loginUserType = localStorage.getItem("type"); // admin, manager, support, customer etc
    this.columnDefs = [
      { field: "action", headerName: "Action", hide: false, width: 90 },
      { field: "id", headerName: "ID", hide: true, width: 110 },
      { field: "call_plan", headerName: "Call Plan", hide: false, width: 120 },
      {
        field: "plan_type_name",
        headerName: "Plan Type",
        hide: false,
        width: 120,
      },
      // { field: 'call_plan', headerName: 'Minute Plan', hide: false, width: 22 },
      {
        field: "dial_prefix",
        headerName: "Dial Prefix",
        hide: false,
        width: 100,
      },
      {
        field: "nicename",
        headerName: "Country Name",
        hide: false,
        width: 120,
      },
      { field: "gatewayName", headerName: "Gateway", hide: false, width: 120 },
      {
        field: "group_name",
        headerName: "Group Name",
        hide: false,
        width: 120,
      },
      // { field: 'ip_info', headerName: 'IP/Domain', hide: false, width: 20 },
      // { field: 'minute_plan', headerName: 'Minute Plan', hide: false, width: 20 },
      {
        field: "group_minutes",
        headerName: "Minutes",
        hide: false,
        width: 120,
      },
      // { field: 'buying_rate', headerName: 'Buying Rate', hide: false, width: 30 },
      {
        field: "selling_rate",
        headerName: "Selling Rate",
        hide: false,
        width: 100,
      },
      // { field: 'selling_min_duration', headerName: 'Selling Min Duration', hide: false, width: 160 },
      {
        field: "selling_billing_block",
        headerName: "Selling Billing Block",
        hide: false,
        width: 110,
      },
      { field: 'booster_for', headerName: 'Booster For', hide: false, width: 150}
    ];
    this.callplanService.getNewRates(this.callplanId).subscribe(data=>{
    })
  
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

@Component({
  selector: 'call-plan-dialog',
  templateUrl: 'call-plan-dialog.html',
  styles: [' small { color: darkgreen !important; position: absolute !important;top: 44px !important} ']
})

export class CallPlanDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  callPlanForm: FormGroup;
  checkForm: any;
  page = new Page();
  rows = new Array<CallPlan>();
  callPlanData: any = {};
  callPlanExist = false;
  selectedValue = "";
  call_plan_id = "";
  callPlanName = "";
  columnDefs: any;
  dataSource: any = [];
  errorField = "";
  validCallPlanName = false;
  defaultLC = '0';
  circleList: any;
  CallPlanFilter:any;
  filterCircle:any;
  isCircleShow: any;
  callPlanCirlce: any;
  isAssign: boolean = false;
  isMinutePlanShow: any;
  planTypeValue: any;
  isVisibleCustomer: any;
  extraFeeList: any = [];
  FreeFilter:any;
  filterFee:any;
  checkEvent: boolean = false;  
  checkButton: boolean = false;  
  selectValue: boolean = false;  
  readonlyMode: boolean = false;
  recurringT: boolean = false;
  MonthlyT: boolean = false;
  NOCT: boolean = false;
  OneTimeT: boolean = false;
  checkRemove: any = []; 
  extraFee: any; 
  b_price: any; 
  menus: any;
  callPlanMenu: any = '';
  callRateMenu: any = '';
  extra = [
    {
      'fee_type': '',
      'charge': ''
    },
    {
      'fee_type': '',
      'charge': ''
    },
    {
      'fee_type': '',
      'charge': ''
    },
    {
      'fee_type': '',
      'charge': ''
    }
  ]
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Circle Name';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';


  constructor(
    public dialogRef: MatDialogRef<CallPlanDialog>, @Inject(MAT_DIALOG_DATA) public data: CallPlan,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
  ) {
    this.callPlanForm = this.fb.group({
      'name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'type': ['', Validators.required],
      'isCircle': [''],
      'circle': [''],
      'isMinutePlan': [false],
      'isPlanType': ['0'],
      'is_visible_customer': [''],
      'validity': [''],
      'booster_for': [''],
      'number_of_days': [''],
      'is_overuse': [''],
      'fee_type': [''],
      'charge': [''],
      'base_charge': [''],
      'recurring': [''],
      'monthlySupport': [''],
      'NocSupport': [''],
      'OneTimeSupport': [''],
      'charge1': [''],
      'charge2': [''],
      'charge3': [''],
      'charge4': [''],
      'bundle_type': [1],
      'bundle_type_booster': ['1'],
      'fee_type_charges': new FormArray([])
    });

    this.extraFeeList = [{ id: 1, name: 'Recurring charge - RECURRING' }, { id: 2, name: 'Monthly Support - RECURRNG' }, { id: 3, name: 'NOC Support - ONE TIME' }, { id: 4, name: 'One Time Charge - ONE TIME' }];
    this.filterFee = this.FreeFilter = this.extraFeeList.slice();
    if (!this.data.id) {    
      this.checkEvent = true;      
      this.addNewCharges()
    }

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.callPlanMenu = this.menus.find((o) => o.url == '/callPlan/callplan');
    this.callRateMenu = this.menus.find((o) => o.url == '/callPlan/view');

  }

  

  get name() { return this.callPlanForm.get('name'); }
  get type() { return this.callPlanForm.get('type'); }
  get isCircle() { return this.callPlanForm.get('isCircle'); }
  get circle() { return this.callPlanForm.get('circle'); }
  get isMinutePlan() { return this.callPlanForm.get('isMinutePlan'); }
  get isPlanType() { return this.callPlanForm.get('isPlanType'); }
  get is_visible_customer() { return this.callPlanForm.get('is_visible_customer'); }
  get number_of_days() { return this.callPlanForm.get('number_of_days'); }
  get validity() { return this.callPlanForm.get('validity'); }
  get base_charge() { return this.callPlanForm.get('base_charge'); }
  get booster_for() { return this.callPlanForm.get('booster_for'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {

    if(this.callPlanMenu.all_permission == '0' && this.callPlanMenu.view_permission == '1'){
      this.callPlanForm.disable();
    }
    
    if (this.data.id) {
      this.callplanService.viewCallPlan({ id: this.data.id, name: null }).subscribe(data => {
        this.callPlanData = data[0];
        this.callPlanName = data[0].name;
        this.callPlanExist = true;
        this.isCircleShow = data[0].is_circle == '1' ? true : false;
        this.isMinutePlanShow = data[0].is_minute_plan == '1' ? true : false;
        this.planTypeValue = data[0].plan_type ? data[0].plan_type : '';
        this.callPlanCirlce = data[0].circle_id ? Number(data[0].circle_id) : '';
        this.defaultLC = data[0].lc_type;
        this.isVisibleCustomer = data[0].is_visible_customer ? Number(data[0].is_visible_customer) : '';
        this.callPlanForm.get('bundle_type').setValue(this.callPlanData.bundle_type)
        this.callPlanForm.get('bundle_type_booster').setValue(this.callPlanData.bundle_booster_type)
        
        this.readonlyMode = this.data['readonly'];

        this.callplanService.getExtraFeeMapping({ id: this.data.id}).subscribe(data =>{
            

            let fee_type = data[0]['extra_fee'].split(',');
            let charges = data[0]['fee_charge'].split(',');
            
            
            
            if(fee_type[0] != ''){
              this.callPlanForm.get('recurring').setValue(true);
              this.callPlanForm.get('charge1').setValue(charges[0]);
              this.recurringT = true;
            }

            if(fee_type[1] != ''){
              this.callPlanForm.get('monthlySupport').setValue(true);
              this.callPlanForm.get('charge2').setValue(charges[1]);
              this.MonthlyT = true;
            }

            if(fee_type[2] != ''){
              this.callPlanForm.get('NocSupport').setValue(true);
              this.callPlanForm.get('charge3').setValue(charges[2]);
              this.NOCT = true;
            }

            if(fee_type[3] != ''){
              this.callPlanForm.get('OneTimeSupport').setValue(true);
              this.callPlanForm.get('charge4').setValue(charges[3]);
              this.OneTimeT = true;
            }
          })
        
        // this.checkButton = true;
        this.callPlanForm.patchValue(data[0]);
        this.callPlanForm.get('is_overuse').setValue(Number(data[0]['is_overuse']));
        this.setExtraFeeFields(data[0]);
    
        
      }, err => {
        this.errors = err.message;
      });
      // this.isCheckAssignOrNot(this.data.id);
    }

    if(this.data['readonly'] == true){
      this.disableFormControls()
    }

    this.getCircle();

    
  }

  disableFormControls() {
    Object.keys(this.callPlanForm.controls).forEach(controlName => {
      this.callPlanForm.get(controlName).disable();
    });
  }

  circleremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.circleList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }


  public findInvalidControls() {
    const invalid = [];
    const controls = this.callPlanForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitCallPlan() {
    if (this.callPlanForm.valid) {
      if(this.callPlanForm.get('recurring').value){
        if(!this.callPlanForm.get('charge1').value){
          this.toastr.error('Error!', 'Fill The Form Correctly', { timeOut: 4000 });
          return;
        }
      }
      if(this.callPlanForm.get('monthlySupport').value){
        if(!this.callPlanForm.get('charge2').value){
          this.toastr.error('Error!', 'Fill The Form Correctly', { timeOut: 4000 });
          return;
        }
      }
      if(this.callPlanForm.get('NocSupport').value){
        if(!this.callPlanForm.get('charge3').value){
          this.toastr.error('Error!', 'Fill The Form Correctly', { timeOut: 4000 });
          return;
        }
      }
      if(this.callPlanForm.get('OneTimeSupport').value){
        if(!this.callPlanForm.get('charge4').value){
          this.toastr.error('Error!', 'Fill The Form Correctly', { timeOut: 4000 });
          return;
        }
      }
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.callPlanForm.value;
      credentials.base_charge = Number(this.callPlanForm.value.base_charge);
      credentials.isPlanType = Number(this.callPlanForm.value.isPlanType);
      credentials.type = Number(this.callPlanForm.value.type);
      credentials.number_of_days = Number(this.callPlanForm.value.number_of_days);
      credentials.bundle_type = Number(this.callPlanForm.value.bundle_type);      
      // credentials.validity = Number(this.callPlanForm.value.validity);
      this.extra[0]['fee_type'] = this.callPlanForm.get('recurring').value ? '1' : '';
      this.extra[1]['fee_type'] = this.callPlanForm.get('monthlySupport').value ? '2' : '';
      this.extra[2]['fee_type'] = this.callPlanForm.get('NocSupport').value ? '3' : '';
      this.extra[3]['fee_type'] = this.callPlanForm.get('OneTimeSupport').value ? '4' : '';
      this.extra[0]['charge'] = this.callPlanForm.get('charge1').value ? this.callPlanForm.get('charge1').value : '0.00';
      this.extra[1]['charge'] = this.callPlanForm.get('charge2').value ? this.callPlanForm.get('charge2').value : '0.00';
      this.extra[2]['charge'] = this.callPlanForm.get('charge3').value ? this.callPlanForm.get('charge3').value : '0.00';
      this.extra[3]['charge'] = this.callPlanForm.get('charge4').value ? this.callPlanForm.get('charge4').value : '0.00';
      credentials['fee_type_charges'] = this.extra;
      
      credentials.id = this.data.id ? this.data.id : null;
      credentials.circle_name = credentials.isCircle ? this.circleList.filter(item => item.id == credentials.circle)[0]['name'] : null
      this.callplanService.viewCallPlan({ 'id': credentials.id, 'name': credentials.name }).subscribe(data => {
        if (data && data[0].lastInserted >= 1 && this.data.id != data[0].lastInserted) {
          this.errorField = data[0].MESSAGE_TEXT;
          this.toastr.error('Error!', this.errorField, { timeOut: 4000 });
          this.callPlanName = "";
          this.callPlanData.name = '';
        } else {
          this.callplanService.createCallPlan('createCallPlan', credentials)
            .subscribe(data => {
              if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                this.cancelCallPlan();
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            });
        }
      });
    }
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  recurring(e){
    
    
    if(e){
      this.recurringT = true;
      this.extra[0]['fee_type'] = '1';
      this.callPlanForm.get('charge1').setValidators(Validators.required); 
      this.callPlanForm.get('charge1').updateValueAndValidity(); 
    }else{
      this.extra[0]['fee_type'] = '';
      this.recurringT = false;
      this.callPlanForm.get('charge1').reset();
      this.callPlanForm.get('charge1').clearValidators(); 
      this.callPlanForm.get('charge1').updateValueAndValidity(); 
    }

    
    
  }
  monthlySupport(e){
    
    
    if(e){
      this.MonthlyT = true;
      this.extra[1]['fee_type'] = '2';
      this.callPlanForm.get('charge2').setValidators(Validators.required); 
      this.callPlanForm.get('charge2').updateValueAndValidity(); 
    }else{
      this.extra[1]['fee_type'] = '';
      this.MonthlyT = false;
      this.callPlanForm.get('charge2').reset();
      this.callPlanForm.get('charge2').clearValidators(); 
      this.callPlanForm.get('charge2').updateValueAndValidity(); 

    }

    
    
  }
  NOCSupport(e){
    
    
    if(e){
      this.NOCT = true;
      this.extra[2]['fee_type'] = '3';
      this.callPlanForm.get('charge3').setValidators(Validators.required); 
      this.callPlanForm.get('charge3').updateValueAndValidity(); 
    }else{
      this.extra[2]['fee_type'] = '';
      this.NOCT = false;
      this.callPlanForm.get('charge3').reset();
      this.callPlanForm.get('charge3').clearValidators(); 
      this.callPlanForm.get('charge3').updateValueAndValidity(); 
    }

    
    
  }
  OneTimeCharge(e){
    
    
    if(e){
      this.OneTimeT = true;
      this.extra[3]['fee_type'] = '4';
      this.callPlanForm.get('charge4').setValidators(Validators.required); 
      this.callPlanForm.get('charge4').updateValueAndValidity(); 
    }else{
      this.extra[3]['fee_type'] = '';
      this.OneTimeT = false;
      this.callPlanForm.get('charge4').reset();
      this.callPlanForm.get('charge4').clearValidators(); 
      this.callPlanForm.get('charge4').updateValueAndValidity(); 
    }

    
    
  }

  cancelCallPlan() {
    this.callPlanForm.reset();
    this.callplanService.updateGridList();
    this.dialogRef.close();
  }

  public getCircle() { //get circle data
    this.callplanService.getCircle().subscribe(data => {
      this.circleList = data.response;
      this.filterCircle = this.CallPlanFilter = this.circleList.slice();
    }, err => {
      this.errors = err.message;
    });
  }

  addNewCharges(): void {        
    let fee_length = this.callPlanForm.get('fee_type_charges').value.length
    const fbs = this.callPlanForm.get('fee_type_charges') as FormArray;   
    if(this.extraFee){
      let a = 0;
      this.checkRemove.push(a++);
    }    
    // if(this.checkRemove.length == 4){
    //   this.checkButton = true;
    // }        
    // this.extraFeeList.map(data => {
    //   if(data.id == this.extraFee){
    //     Object.assign(data,{flag : 1});
    //   }
    // });
    for(let i=0; i<this.callPlanForm.get('fee_type_charges').value.length; i++) {
      if(this.callPlanForm.get('fee_type_charges').value[i]['fee_type'] == ''){
        this.toastr.error('Please Fill the Fee Type', 'Error!', { timeOut: 2000 });
        return;
      }
    }
    const fb = this.callPlanForm.get('fee_type_charges') as FormArray;
    if(fb.length == 3){
      this.checkButton = true;
    }
    if (fb.length > 3) {      
      this.toastr.error('Max 4 parameter allowed only!', 'Error!', { timeOut: 2000 });
      return;
    }
    const formGroupArray = this.createCharges();
    fb.push(formGroupArray);
  }

  createCharges() {    
    const fg = this.fb.group({
      fee_type: [''],
      charge: [0],
    });
    return fg;
  }

  public onValidityChanged(data) {    
    if (data.value === 'custom') {
      this.number_of_days.setValidators(Validators.required);
      this.number_of_days.updateValueAndValidity();
    } else {
      this.number_of_days.setValue('');
      this.number_of_days.clearValidators();
      this.number_of_days.updateValueAndValidity();
    }
  }

  removeCharges(fee_type,index) {    
    this.checkButton = false;
    this.checkRemove.pop();     
    this.extraFeeList.map(data => {
      if(data.id == fee_type.value){     
        Object.assign(data,{flag : 0});
      }   
      else if(this.checkRemove.length == 0 && !this.data.id){        
        this.checkEvent = false
        Object.assign(data,{flag : 0});
      }      
    }) 
    const fb = this.callPlanForm.get('fee_type_charges') as FormArray;
    fb.removeAt(index);
    this.callPlanForm.updateValueAndValidity();
  }

  public onFeeTypeChanged(item, position) {   
    this.checkEvent = true;  
    this.selectValue = true;  
    this.extraFee = item.value;
    if(item.value == undefined){
      this.selectValue = false;
    }
    
    if (!item.value) {
      const fb = this.callPlanForm.get('fee_type_charges') as FormArray;
      fb.controls[position].get('charge').setValue(0);
      this.callPlanForm.get('fee_type_charges').updateValueAndValidity();      
    }  
    this.callPlanForm.get('fee_type_charges').value.map(data => {      
      // this.checkButton = data.fee_type === '' ? true : false;      
    });      
    
    this.extraFeeList.map(element => {      
        if(element.id == item.value){
          Object.assign(element,{flag:1});
        }      
    })
  }

  public isChnageCircle(event) {
    let isCircleEnable = event.checked;
    if (isCircleEnable == true) {
      this.callPlanForm.controls.circle.setValidators(Validators.required);
      this.callPlanForm.controls.circle.updateValueAndValidity();
      this.callPlanForm.controls.isMinutePlan.disable();
    } else {
      this.callPlanForm.controls.circle.clearValidators();
      this.callPlanForm.controls.circle.updateValueAndValidity();
      this.callPlanForm.get('circle').setValue('');
      this.callPlanForm.controls.isMinutePlan.enable();
    }
  }

  public isCheckAssignOrNot(callPlanId) {
    this.callplanService.isExistCallPlan({ id: callPlanId }).subscribe(data => {
      if (data['code'] == 200) {
        this.isAssign = true;
        return;
      } else {
      }
    },
      err => {
        this.errors = err.message;
      });
  }

  checkPrice(){                     
    let credentials = this.base_charge;    
    
    if(credentials.value.length > 5 || credentials.value == 0){
      this.toastr.error('Please Provide Valid Price.', 'Error!', { timeOut: 2000 });
      this.b_price = "";
    }    
  }

  public setExtraFeeFields(data) {        
    this.b_price = data.charge;
    let feeTypes = (data.fee_types).split(",");
    let charges = (data.charges).split(",");    
    setTimeout(() => {
      feeTypes.forEach((element1, i) => {
        charges.forEach((element2, j) => {      
          if (i === j) {                                   
            this.extraFeeList = this.extraFeeList.map(data => {               
              if(data.id == element1){
                return Object.assign(data,{flag : 1});
              }              
              return data;
            });                   
            const fb = this.callPlanForm.get('fee_type_charges') as FormArray;
            const fg = this.fb.group({
              fee_type: [Number(element1)],
              charge: [Number(element2)],

            });                                            
            fb.push(fg);            
          }
        });
      })
    }, 500)
    
  }

  public changeCallPlan(data) {    
    if (!this.isPlanType.value) {
      this.toastr.error('Error!', 'Please select Plan Type First', { timeOut: 2000 });
      return;
    }
    if (data === '3') { // booster plAN Purpose
      this.booster_for.setValidators(Validators.required);
      this.booster_for.updateValueAndValidity();
      // this.validity.setValue('');
      // this.validity.clearValidators();
      // this.validity.updateValueAndValidity()
      this.callPlanForm.updateValueAndValidity();
    } else {
      this.booster_for.reset();
      this.booster_for.clearValidators();
      this.booster_for.updateValueAndValidity();
      // this.validity.setValidators(Validators.required);
      // this.validity.updateValueAndValidity();
      this.callPlanForm.updateValueAndValidity();
    }
  }

  public isChnageMinutePlan(check) {
    if (check) {
      this.planTypeValue = '1';
      this.isPlanType.updateValueAndValidity();
      this.callPlanForm.controls.isCircle.disable();
    } else {
      this.planTypeValue = '';
      this.callPlanForm.get('isPlanType').setValue('0');
      this.isPlanType.updateValueAndValidity();
      this.isVisibleCustomer = ''
      this.is_visible_customer.updateValueAndValidity();
      this.callPlanForm.updateValueAndValidity();
      this.callPlanForm.controls.isCircle.enable();
      this.callPlanForm.get('validity').reset();
      this.callPlanForm.get('validity').clearValidators();
      this.callPlanForm.get('validity').updateValueAndValidity();
      this.callPlanForm.get('base_charge').reset();
      this.callPlanForm.get('base_charge').clearValidators();
      this.callPlanForm.get('base_charge').updateValueAndValidity();
      this.callPlanForm.get('is_overuse').reset();
      this.callPlanForm.get('is_overuse').updateValueAndValidity();

    }
  }

  public isChnageMinutePlanType(data) {
    if (data.value != '3') {
      this.callPlanForm.get('booster_for').reset();
      this.callPlanForm.get('booster_for').updateValueAndValidity();
      this.isVisibleCustomer = ''
      this.is_visible_customer.updateValueAndValidity();
      // this.is_visible_customer.setValue('');
      // this.is_visible_customer.updateValueAndValidity();
    }else{
      this.callPlanForm.get('charge1').clearValidators();
      this.callPlanForm.get('charge1').updateValueAndValidity();
      this.callPlanForm.get('charge2').clearValidators();
      this.callPlanForm.get('charge2').updateValueAndValidity();
      this.callPlanForm.get('charge3').clearValidators();
      this.callPlanForm.get('charge3').updateValueAndValidity();
      this.callPlanForm.get('charge4').clearValidators();
      this.callPlanForm.get('charge4').updateValueAndValidity();
    }
  }
}
