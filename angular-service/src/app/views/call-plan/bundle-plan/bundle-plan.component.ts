import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { CallplanService } from '../callplan.service';
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
import { CallRateGroup } from 'src/app/core/models/call_rate_group.model';
import { BundlePlan } from 'src/app/core/models/bundle.model';
@Component({
  selector: 'app-bundle-plan',
  templateUrl: './bundle-plan.component.html',
  styleUrls: ['./bundle-plan.component.css']
})
export class BundlePlanComponent implements OnInit {

  error = '';
  isFilter = false;
  filterForm: FormGroup;
  selectedValue:any = [];
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  loginUserType = localStorage.getItem('type');
  accountManagerCustomerList: "";

  public mode = 'CheckBox';
  public selectAllText: any = 'Select All';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Call Plan';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';  
  menus: any;
  minutePlanMenu: any = '';
  associatePackage: any = '';
  callRateMenu: any = '';
  filterCallPlan: any;

  constructor(
    private fb: FormBuilder,
    private callplanService: CallplanService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,    

  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_plan_type': [""],
      'by_validity': [""],
      'by_call_plan': [""]
      // 'by_dial_prefix': [""],
      // 'by_buying_rate': [""],
      // 'by_selling_rate': [""],
      // 'by_customer' : [""]
    });
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.minutePlanMenu = this.menus.find((o) => o.url == '/callPlan/bundle-plan');
    this.callRateMenu = this.menus.find((o) => o.url == '/callPlan/view');
    this.associatePackage = this.menus.find((o) => o.url == '/callPlan/bundle-plan');
    // let loginUserType = localStorage.getItem('type');   // admin, manager, support, customer etc
    this.callplanService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });  
    this.callplanService.forgetCallPlan().subscribe(data => {
      this.selectedValue = data.response;            
    })
    
  }
  calleremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedValue.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 160 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Minute Plan Name', hide: false, width: 300 },
      { field: 'extra_fee_total', headerName: 'Plan Price', hide: false, width: 157 },
      { field: 'plan_name', headerName: 'Plan Type', hide: false, width: 170 },
      { field: 'validity', headerName: 'Validity', hide: false, width: 160 },
      { field: 'call_plan_name', headerName: 'Call Plan', hide: false, width: 250 },
      // { field: 'plan_type', headerName: 'Plan Type', hide: false, width: 30 },

    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      this.callplanService.filterBundlePlan(credentials).subscribe(pagedData => {        
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.callplanService.viewBundlePlan({}).subscribe(pagedData => {
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
      { header: 'Call Plan', key: 'CallPlan', width: 30 },
      { header: 'Dial Prefix', key: 'DialPrefix', width: 10 },
      { header: 'Gateway', key: 'Gateway', width: 25 },
      { header: 'Buying Rate', key: 'BuyingRate', width: 15 },
      { header: 'Selling Rate', key: 'SellingRate', width: 15 },
      { header: 'Selling Min Duration', key: 'SellingMinDuration', width: 18 },
      { header: 'Selling Billing Block', key: 'SellingBillingBlock', width: 18 },
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
        CallPlan: this.exportData[i].call_plan,
        DialPrefix: this.exportData[i].dial_prefix,
        Gateway: this.exportData[i].gatewayName,
        BuyingRate: this.exportData[i].buying_rate,
        SellingRate: this.exportData[i].selling_rate,
        SellingMinDuration: this.exportData[i].selling_min_duration,
        SellingBillingBlock: this.exportData[i].selling_billing_block
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
    worksheet.spliceRows(1, 0, new Array(offset));
    // this.excelService.exportAsExcelFile(arr, 'callPlanRate');
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: blobType });
      FileSaver.saveAs(blob, 'callPlanRate');
    });
  }

  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Call Plan", "Dial Prefix", "Gateway", "Buying Rate", "Selling Rate", "Selling Min Duration", "Selling Billing Block"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.call_plan, element.dial_prefix, element.gatewayName, element.buying_rate, element.selling_rate, element.selling_min_duration, element.selling_billing_block];
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
    doc.save('callPlanRate.pdf');
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let totalCharges = 0;
      let chargeList: any = pagedData[i].charges ? (pagedData[i].charges).split(',') : [];
      chargeList.forEach(element => {
        totalCharges += Number(element);
      });
      totalCharges += Number(pagedData[i].charge);
      finalBtn += "<span>";
      if (this.minutePlanMenu.modify_permission) {
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      }
      if (this.minutePlanMenu.delete_permission) {
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      }
      if (this.callRateMenu) {
        finalBtn += "<i class='fa fa-phone edit-button' style='cursor:pointer; display: inline' data-action-type='showCallPlanRate' title='Call Rate'></i>";
      }
      if (pagedData[i].plan_type != '3' && pagedData[i]['flag'] == 1) {
        finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='viewUsers' title='View Users'></i>";
      }  
      // if(this.associatePackage) {
      //   finalBtn += "<i class='fa fa-university list-button' style='cursor:pointer; display: inline' data-action-type='view' title='Mapped Package'></i>";
      // }
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
      pagedData[i]['extra_fee_total'] = totalCharges;
    }
    return pagedData;
  }


  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editBundlePlan(data);
      case "delete":
        return this.deleteMinutePlanRate(data);
      case "showCallPlanRate":
        return this.showCallPlanRates(data);
      case "viewUsers":
        return this.showAssociatedUsers(data);
      // case "view":
      //   return this.mappedPackage(data);
    }
  }

  editBundlePlan(event) {
    this.openDialog(event);
  }


  deleteMinutePlanRate(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: " <span style='color:#FFFFFF;'>You will not be able to recover minute plan </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span><span style='color:#FFFFFF;'> in future.</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.callplanService.deleteMinutePlanRate({ 'id': event.id }, event.plan_type).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                html: "<span style='color:#FFFFFF;'>Minute plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is already exist in a package",
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
            this.toastr.error(err.message, 'Error!', { timeOut: 2000 });
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'>Minute plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000'
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Minute plan </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
        });
      }
    })
  }

  public showCallPlanRates(data) {    
    delete data.id;
    data['id'] = data['call_plan'] ? data['call_plan'] : 0;    
    this.router.navigateByUrl('/callPlan/view', { state: data });
  }

  public showAssociatedUsers(data) {    
    this.router.navigate(['callPlan/bundle-plan/minute-plan-associate-users'], { queryParams: { mId: data.id, mName: data.name, planType: data.plan_type } });    
  }

  // public mappedPackage(data) {
  //   this.router.navigate(['callPlan/bundle-plan/minute-plan-associate-package'], {queryParams: {id: data.id, planType: data.plan_type}});
  // }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  openDialog(data): void {
    const dialogRef = this.dialog.open(BundlePlanDialog, { width: '60%', disableClose: true, data: { id: data ? data.id : null, data: data, readonly: false } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {      
    });
  }

  // openDialogs(event) {
  //   const dialogRefInfo = this.dialog.open(PackageAssociateDialog, {
  //     width: '80%', disableClose: true, autoFocus: false,
  //     data: {
  //       customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0
  //     }
  //   });
  //   dialogRefInfo.keydownEvents().subscribe(e => {
  //     if (e.keyCode == 27) {
  //       dialogRefInfo.close('Dialog closed');
  //     }
  //   });
  //   dialogRefInfo.afterClosed().subscribe(result => {
  //     console.log('Dialog closed');
  //   });
  // }

  
  importFile() {
    // const dialogRef11 = this.dialog.open(ImportCallPlanDialog, {
    //   width: '60%', disableClose: true,
    //   data: {}
    // });
    // dialogRef11.afterClosed().subscribe(result => {
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
  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
}

//------------------------------  Add Bundle Plan By. (Nagender Pratap Chauhan 23-04-2021) ------------------------------------------------------------//

@Component({
  selector: 'bundle-plan-dialog',
  templateUrl: 'add-bundle-plan.html',
})

export class BundlePlanDialog {
  submitted = false;
  errors: Errors = { errors: {} };
  callPlanGroupForm: FormGroup;
  checkForm: any;
  selectedValue = [];
  callPlanRateData: any = {};
  errorField: any;
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Call Plan';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  defaultSellingBillingBlock = 60;
  userRole = localStorage.getItem('type');
  filterForm: FormGroup;
  callPlanList: any = [];
  CallPlanFilter:any;
  filterCallPlan:any;
  extraFeeList: any = [];
  FreeFilter:any;
  filterFee:any;
  readonlyMode: boolean = false;
  datas: any;
  b_price: any;
  extraFee: any; 
  checkButton: boolean = false; 
  checkRemove: any = [];
  checkEvent: boolean = false; 
  selectValue:boolean = false;
  checkutton:boolean = false;
  test = 0
  constructor(
    public dialogRef: MatDialogRef<BundlePlanDialog>, @Inject(MAT_DIALOG_DATA) public data: BundlePlan,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private callplanService: CallplanService,
    public commonService: CommonService,
    private route: ActivatedRoute,
  ) {
    this.callPlanGroupForm = this.fb.group({
      'id': [null],
      'name': ['', Validators.required],
      'charge': ['', Validators.required],
      'plan_type': ['1', Validators.required],
      'validity': ['', Validators.required],
      'number_of_days': [''],
      'call_plan': ['', Validators.required],
      'is_overuse': [''],
      'fee_type_charges': new FormArray([]),
      'booster_for': [''],
      'recurring': [''],
      'monthlySupport': [''],
      'NocSupport': [''],
      'OneTimeSupport': [''],
      'charge1': [''],
      'charge2': [''],
      'charge3': [''],
      'charge4': [''],
      'bundle_type': ['1'],
      'bundle_type_booster': ['1'],
      
    });
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_type': [""],
      'by_circle': new FormControl([]),
      'minute_paln_type': [""]
    });

    this.extraFeeList = [{ id: 1, name: 'Recurring charge - RECURRING' }, { id: 2, name: 'Monthly Support - RECURRNG' }, { id: 3, name: 'NOC Support - ONE TIME' }, { id: 4, name: 'One Time Charge - ONE TIME' }];
    this.filterFee = this.FreeFilter = this.extraFeeList.slice();
    if (!this.data.id) {    
      this.checkEvent = true;      
      this.addNewCharges()
    }
  }

  get name() { return this.callPlanGroupForm.get('name'); }
  get charge() { return this.callPlanGroupForm.get('charge'); }
  get plan_type() { return this.callPlanGroupForm.get('plan_type'); }
  get validity() { return this.callPlanGroupForm.get('validity'); }
  get call_plan() { return this.callPlanGroupForm.get('call_plan'); }
  get number_of_days() { return this.callPlanGroupForm.get('number_of_days'); }
  get booster_for() { return this.callPlanGroupForm.get('booster_for'); }


  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {  
    
    if (this.data.id) {      
      this.readonlyMode = this.data['readonly'];
      // this.checkButton = true;
      this.getCallPlanBytype(this.data['data']['plan_type']);
      this.callPlanGroupForm.patchValue(this.data['data']);
      this.callPlanGroupForm.get('is_overuse').setValue(Number(this.data['data']['is_overuse']));
      this.setExtraFeeFields(this.data['data']);
    } else {
      this.getCallPlanBytype('1');
    }   
  }
  public isChnageDate(event){
    let isSetDateEnable = event.checked;
    if (isSetDateEnable == true) {
      this.checkutton = true;
      this.callPlanGroupForm.controls.charge.setValidators(Validators.required);
      this.callPlanGroupForm.controls.charge.updateValueAndValidity();
    }else{
      this.checkutton = false;
      this.callPlanGroupForm.controls.charge.clearValidators();
      this.callPlanGroupForm.controls.charge.updateValueAndValidity();
      this.callPlanGroupForm.get('charge').setValue('');
    
    }
   }

  calleremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.callPlanList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  checkPrice(){                     
    let credentials = this.charge;    
    
    if(credentials.value.length > 5 || credentials.value == 0){
      this.toastr.error('Please Provide Valid Price.', 'Error!', { timeOut: 2000 });
      this.b_price = "";
    }    
  }

  submitBundlePlan() {
    if (this.callPlanGroupForm.valid) {

      const credentials = this.callPlanGroupForm.value;
      credentials.id = this.data.id ? this.data.id : null;      
                      
      if (credentials.id) {  // update Bundle Plan        
        this.callplanService.updateBundlePlan(credentials)
          .subscribe(data => {                        
            if (data['code'] == 200) {
              this.toastr.success(data['message'], 'Success!', { timeOut: 2000 });
              this.cancelForm();
            }
            else {
              this.toastr.error(data['message'], 'Error!', { timeOut: 2000 });
            }
          });
      } else {  // Create Bundle Plan
        this.callplanService.createBundlePlan(credentials)
          .subscribe(data => {            
            if (data['code'] == 200) {
              this.toastr.success(data['message'], 'Success!', { timeOut: 2000 });
              this.cancelForm();
            }
            else {
              this.toastr.error(data['message'], 'Error!', { timeOut: 2000 });
            }
          });
      }

    }
  }


  cancelForm() {
    this.callPlanGroupForm.reset();
    this.callplanService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public changeCallPlan(data) {    
    if (!this.plan_type.value) {
      this.toastr.error('Error!', 'Please select Plan Type First', { timeOut: 2000 });
      return;
    }
    if (data === '3') { // booster plAN Purpose
      this.booster_for.setValidators(Validators.required);
      this.booster_for.updateValueAndValidity();
      // this.validity.setValue('');
      // this.validity.clearValidators();
      // this.validity.updateValueAndValidity()
      this.callPlanGroupForm.updateValueAndValidity();
    } else {
      this.booster_for.setValue('');
      this.booster_for.clearValidators();
      this.booster_for.updateValueAndValidity();
      // this.validity.setValidators(Validators.required);
      // this.validity.updateValueAndValidity();
      this.callPlanGroupForm.updateValueAndValidity();
    }
    this.getCallPlanBytype(data);
    this.call_plan.setValue('');
  }

  public getCallPlanBytype(type) {
    const credentials = this.filterForm.value;
    credentials['minute_paln_type'] = type;
    // if(type == '3') {  // its just for booster plan type bcz it has no validity
    //   this.validity.setValue('');
    //   this.validity.clearValidators();
    //   this.validity.updateValueAndValidity()
    //   this.callPlanGroupForm.updateValueAndValidity();
    // }    
    this.callplanService.filterCallPlan(credentials).subscribe(res => {      
      this.callPlanList = res;
      this.filterCallPlan = this.CallPlanFilter = this.callPlanList.slice();
    }, err => {
      this.errors = err.message;
    });
  }

  addNewCharges(): void {        
    let fee_length = this.callPlanGroupForm.get('fee_type_charges').value.length
    const fbs = this.callPlanGroupForm.get('fee_type_charges') as FormArray;   
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
    for(let i=0; i<this.callPlanGroupForm.get('fee_type_charges').value.length; i++) {
      if(this.callPlanGroupForm.get('fee_type_charges').value[i]['fee_type'] == ''){
        this.toastr.error('Please Fill the Fee Type', 'Error!', { timeOut: 2000 });
        return;
      }
    }
    const fb = this.callPlanGroupForm.get('fee_type_charges') as FormArray;
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
    const fb = this.callPlanGroupForm.get('fee_type_charges') as FormArray;
    fb.removeAt(index);
    this.callPlanGroupForm.updateValueAndValidity();
  }

  createCharges() {    
    const fg = this.fb.group({
      fee_type: [''],
      charge: [0],
    });
    return fg;
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
            const fb = this.callPlanGroupForm.get('fee_type_charges') as FormArray;
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

  public onFeeTypeChanged(item, position) {   
    this.checkEvent = true;  
    this.selectValue = true;  
    this.extraFee = item.value;
    if(item.value == undefined){
      this.selectValue = false;
    }
    
    if (!item.value) {
      const fb = this.callPlanGroupForm.get('fee_type_charges') as FormArray;
      fb.controls[position].get('charge').setValue(0);
      this.callPlanGroupForm.get('fee_type_charges').updateValueAndValidity();      
    }  
    this.callPlanGroupForm.get('fee_type_charges').value.map(data => {      
      // this.checkButton = data.fee_type === '' ? true : false;      
    });      
    
    this.extraFeeList.map(element => {      
        if(element.id == item.value){
          Object.assign(element,{flag:1});
        }      
    })
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

  public checkDaysValidation(data) {    
    let days = Number(data);
    if (days > 365) {
      this.toastr.error('Number of days should be less than 366.', 'Error!');
      this.number_of_days.setValue('');
      return;
    }

  }

  public _keyUp(event): boolean {        
    const charCode = (event.which) ? event.which : event.keyCode;    
    if (charCode == 45) {
      return false;
    }
    return true;
  }  

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }
  get UserTypeAccountManager() {
    return UserTypeConstants.ACCOUNT_MANAGER;
  }
  get UserTypeSupportManager() {
    return UserTypeConstants.SUPPORT_MANAGER;
  }
}
