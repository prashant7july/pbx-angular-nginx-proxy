import { Component, Inject, OnInit } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { Errors, CommonService,ExcelService ,Name_RegEx, ExtensionService} from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page} from '../../../core/models'
import {RatePlan} from '../../../core/models/RatePlan.model';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from "exceljs";
import * as FileSaver from 'file-saver';
import { LimitData } from '@syncfusion/ej2-angular-inputs';
import { id } from '@swimlane/ngx-datatable/release/utils';
import { FormArray } from '@angular/forms';
import { TeleConsultationService } from '../tele-consultation.service';
import { ContactListService } from '../../contact-list/contact-list.service';
import { MinutePlanService } from '../../customer-minute-plan/customer-minute-plan.service';

@Component({
  selector: 'app-view-tc-plan-minute-assign',
  templateUrl: './view-tc-plan-minute-assign.component.html',
  styleUrls: ['./view-tc-plan-minute-assign.component.css']
})
export class ViewTcPlanMinuteAssignComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData:any={};
  defaultPageSize = '10';
  filterForm: FormGroup;
  filterObj:any={};
  filter_list: any;
  globalRateList : any = "";

  constructor(
    public teleConsultationService :TeleConsultationService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.filterForm = this.fb.group({
      'name': [""],
    });
    this.teleConsultationService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    // this.FeaturesService.getFeaturePlan({}).subscribe(pagedData =>{
    //     this.filter_list = pagedData; 
    // });

  }

  displayAllRecord() 
  {

    this.columnDefs = [
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'plan_name', headerName: 'Plan Name', hide: false, width: 10 },
      // { field: 'minutes', headerName: 'Assign Minute', hide: false, width: 10 },
      // { field: 'used_minute', headerName: 'Used Minute', hide: false, width: 10 },
      { field: 'name', headerName: 'User', hide: false, width: 20 },
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
    ];
    if(this.isFilter){
        this.filterObj = this.filterForm.value
      } else {
      this.filterObj ={};
    }    
    let customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
    this.teleConsultationService.getAssignUserList(this.filterObj, customerId).subscribe(pagedData =>{
      this.exportData = pagedData.response;
      this.dataSource = [];
      pagedData = this.manageUserActionBtn(pagedData.response);      
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    }, err => {
        this.error = err.message;
      }
    ); 
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }


  downloadPDF(): void{
    var doc = new jsPDF();
    var col = ["Plan Name", "Minutes", "User"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status;
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.plan_name, element.minutes, element.name];
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

      },
    });
    doc.save('assignUserWithMinute.pdf');

  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  
  exportToExcel(): void{
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
      { header: 'Plan Name', key: 'plan_name', width: 30 },
      { header: 'Minutes', key: 'minutes', width: 40 },
      { header: 'User', key: 'name', width: 40 },
     
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
      let strStatus = this.exportData[i].status;
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      worksheet.addRow({
        Name: this.exportData[i].name,
        Price: this.exportData[i].price,
        Description: this.exportData[i].description,
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
      FileSaver.saveAs(blob, 'TCPlan');
    });
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
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
        return this.editMinutePlan(data);
      case "delete":
        return this.deleteMinutePlan(data);
      case "viewPackages":
        // return this.showPackage(data);
      case "upgrade":
        // return this.upgradeFeaturePlan(data)  
      case "active":
    }
   }

  
   
   editMinutePlan(data: any) {    
    this.router.navigate(['user/extension/view/minute-manage'], { queryParams: { id: data.id}});
    
    // this.openDialog(data);
    //his.router.navigate(['config/manage-circle'], { queryParams: {id:data.id } });
  }
  // addTCPlanMinuteMapping(){
  //   this.openDialog(null)
  // }

 

  openDialog(data?): void {
    const dialogRef = this.dialog.open(TCPlanMinuteMapDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
     
      this.displayAllRecord();
    });
  }
  
  showInfo(){
    // const dialogRefInfo = this.dialog.open(featurePlanInfoDialog, {
    //   width: '80%', disableClose: true, autoFocus: false,
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

  deleteMinutePlan(event) {
   Swal.fire({
     title: '<span style="color:#FFFFFF;">Are you sure?</span>',
     text: 'You will not be able to recover this Minute Mapping in future!',
     type: 'warning',
     showCancelButton: true,
     background: '#000000',
     confirmButtonText: 'Yes, delete it!',
     cancelButtonText: 'No, keep it',
     preConfirm: () => {
      this.teleConsultationService.deleteMinuteMapping({ id: event.id }).subscribe(data => {
         if (data['code'] == 400) {
           Swal.fire(
             {
               type: 'error',
               title: '<span style="color:#FFFFFF;">Oopss...</span>',
               text: 'This is Minute Mapping is already exist in other.',
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
         text: 'Minute Mapping has been deleted.',
         type: 'success',
         background: '#000000'
       });
       this.displayAllRecord();
     } else if (result.dismiss === Swal.DismissReason.cancel) {
       Swal.fire({
         title: '<span style="color:#FFFFFF;">Cancelled</span>',
         text: 'Minute Mapping is safe :)',
         type: 'error',
         background: '#000000',
       });
     }
   })
 }

 public deductMinuteDialog(){
  this.router.navigate(['user/extension/view/minute-manage']);
 }
}

@Component({
  selector: 'addTCPlanMinuteMap-dialog',
  templateUrl: './plan-minute-map-dialog.html'
})

export class TCPlanMinuteMapDialog implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  minAssignForm : FormGroup;
  page = new Page();
  feature_list: any;
  isEdit: boolean = false;
  errorField: any
  dialog: any;
  displayAllRecord: any;
  planData : any;
  globalRateList : any = "";
  groupList : any = [];
  userList : any = "";
  balance_minute : number;
  pkg_minute_balance: number;
  isDisabledAssignUserDropDown : boolean = false;
  destinationList  = [];


constructor(
  public dialogRef: MatDialogRef<TCPlanMinuteMapDialog>, @Inject(MAT_DIALOG_DATA) public data: RatePlan,
    private router: Router,
    public teleConsultationService :TeleConsultationService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private contactListService: ContactListService,
    private extensionService: ExtensionService,
    private minutePlanService: MinutePlanService,

  ) {

    this.planData = {
      // balance_minute : '',
      name:'',
      price:'',
      assign_minute :'',
      user_id : ''
    };

    this.minAssignForm = this.fb.group({
    'balance_minute' : [''], 
    'name' : ["" , Validators.required],
    'price' : ["",  Validators.required],
    'assign_minute' :[""],
    'user_id' : ["" , Validators.required],
    'minutManageForm': new FormArray([]),   // this.fb.array([])
    'destinations' : ''
  });
  }
  get name() { return this.minAssignForm.get('name'); }
  get price() { return this.minAssignForm.get('price'); }
  get assign_minute() { return this.minAssignForm.get('assign_minute'); }
  get user_id() { return this.minAssignForm.get('user_id'); }

  ngOnInit(){
    this.getTCPlanList();
    this.getUserList();
    this.getPackageDetails();
    this.getCustomerBundlePlan();
   
    this.planData = this.data;
    this.isEdit = true;
      if (!this.data) {
        this.planData= {
           name:'',
           price:'',
           assign_minute:'',
           user_id : '',
           used_minute : '',
           selectedExtensionList : ''
        };
      }else{
        this.planData['assign_minute'] = this.data['minutes'];
        // this.planData['used_minute'] =  this.data['used_minute'];
        this.planData['name'] = this.data['tc_plan_id'];
        this.planData['selectedExtensionList'] = this.data['destination'] ? this.data['destination'].split(',') : [];
        this.planData['selectedExtensionList'] = this.planData['selectedExtensionList'] ? (this.planData['selectedExtensionList']).map(item=> '+' + item) : [];
        this.isDisabledAssignUserDropDown = true;
        this.setDestiantionMinutesValue(this.planData)        
      }
 }
 
 public findInvalidControls() {
  const invalid = [];
  const controls = this.minAssignForm.controls;
  for (const name in controls) {
    if (controls[name].invalid) {
      invalid.push(name);
    }
  }
  return invalid;
}
onNoClick(e): void {
  this.dialogRef.close();
  e.preventDefault();
}

reloadFeature() {
  this.minAssignForm.reset();
  // this.teleConsultationService.updateGridList();
  this.dialogRef.close();
}

  submitRatePlan(){      
    if (this.minAssignForm.valid) {
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.minAssignForm.value;
      let destinationList = (this.minAssignForm.get('destinations').value).length;
      if (!destinationList) {
        this.toastr.error('Error!', 'Please provide at least one destination', { timeOut: 3000 });
        return;
      }
      let obj = {};
      obj['tc_PlanID'] = credentials.name; // tc plan id
      obj['user_ID'] = credentials.user_id; // user_id id
      obj['id'] = this.data ? this.data.id : ''; // user_id id
          if (this.data) {
            credentials.id = this.data.id;
            credentials.customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;            
            this.teleConsultationService.updateAssignMinuteToUser(credentials).subscribe((data) => {
              if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                this.reloadFeature();
              }
              else if (data['code'] == 1062){
                this.toastr.error('Error!', 'Already assign minutes to this user with destination', { timeOut: 2000 });
              }else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            })

          } else {
            credentials.customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
            this.teleConsultationService.assignMinuteToUser(credentials).subscribe((data) => {
              if (data['code'] == 200) {
                this.toastr.success('Success!', data['message'], { timeOut: 2000 });
                this.reloadFeature();
              }
              else if (data['code'] == 1062){
                this.toastr.error('Error!', 'Already assign minutes to this user with destination', { timeOut: 2000 });
              }else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            })
          }
    }
  }

  public getTCPlanList(){
    let customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
    this.teleConsultationService.getTCPlan({}, customerId).subscribe(pagedData =>{
      this.groupList = pagedData.response;
    }, err => {
        this.error = err.message;
      }
    ); 
  }

  public getUserList(){
    let customerId = localStorage.getItem('id');
    this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, 'customer_id': customerId, 'extension_id': '', 'role': localStorage.getItem('type') }).subscribe(data => {
     this.userList = data;
    }, err => {
      this.error = err.message;
    });
  }
 
  public getPackageDetails(){
    let user_id = localStorage.getItem("id");
    this.extensionService.getMyExtensionLimit(user_id, localStorage.getItem('type')).subscribe(data => {
      this.pkg_minute_balance = data.ext.minute_balance;
      this.teleConsultationService.getMyAssignedMinutes(user_id).subscribe(data => {
        let usable_minutes = data.response[0].minutes;
        let minute_balance: number;
        minute_balance = this.pkg_minute_balance - usable_minutes;
        this.minAssignForm.get('balance_minute').setValue(minute_balance);
        this.balance_minute = Number(this.data ? this.data['minutes'] : 0) + Number(minute_balance);
      });
    });
  }

  public getCustomerBundlePlan(){
    let obj = {
      customer_id : localStorage.getItem('id')
    }
    this.minutePlanService.viewCustomerTeleconsultPlan(obj).subscribe(pagedData => {
      this.destinationList = pagedData? pagedData.filter(item => item['group_type'] === 'Individual') : [];
    });
  }
  // onPlanSelect(event){
  //   console.log(event,'-------------event----------------');
    
  //   debugger
  // }

  // onPlanSelect(data) {    
  //   debugger
  //   let plan_id = data ? data : this.planData['name'];    
  //   if (this.groupList.length == 0) {
  //     let customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
  //     this.teleConsultationService.getTCPlan({}, customerId).subscribe(pagedData => {
  //       this.groupList = pagedData.response;
  //       this.groupList.forEach(element => {
  //         if (element.id === plan_id) {
  //           debugger
  //           this.minAssignForm.get('price').setValue(element.price)
  //         }
  //       });
  //     }, err => {
  //       this.error = err.message;
  //     }
  //     );
  //   } else {
  //     this.groupList.forEach(element => {
  //       if (element.id === plan_id) {
  //         this.minAssignForm.get('price').setValue(element.price)
  //       }
  //     });
  //   }
  // }
  onMinuteValueChange(data){
   
    let assign_minute = Number(data);
    // let minute_balance = Number(this.minAssignForm.get('balance_minute').value) + Number(assign_minute);
    let minute_balance = Number(this.balance_minute);
  
    if(minute_balance < assign_minute){
      this.toastr.error('Error!', 'Assign Minute should be less than from Remaining Minutes', { timeOut: 3000 });
      this.minAssignForm.get('assign_minute').setValue('');
      this.minAssignForm.updateValueAndValidity();
    }
  }

  public getMinutePlanControls() {
    return (this.minAssignForm.get('minutManageForm') as FormArray).controls;
  }


  public getDestinationDetails(e) {    
    let selectedDestination = [] = e.value;
    let control = <FormArray>this.minAssignForm.controls.minutManageForm;
    control.clear();
    selectedDestination.forEach(element => {
     control.push(
      this.fb.group({
        destination: element ? element : 91,
        // minutes : new FormArray([])
        minutes : 0
      })
    );
    });
    // this.getExtensionAssignMinutes(e.value)
  }

  public setDestiantionMinutesValue(obj) {
    let destinationList = obj ? obj['destination'].split(',') : [];
    let destMinuteList = obj ? obj['minutes'].split(',') : [];
    let control = <FormArray>this.minAssignForm.controls.minutManageForm;
    destinationList.forEach((destValue, i) => {
      destMinuteList.forEach((minValue, j) => {
        if (i === j) {
          control.push(
            this.fb.group({
              destination: destValue ? ('+' + destValue) : '+91',
              minutes: minValue ? minValue : 0
            })
          );
        }
      });
    });
  }

  public getDestinationName(item:FormControl, type){    
    let rtrnData ;
    let countryPrefix = item.get('destination').value;
    if(type === 'country_name'){
    let arr = this.destinationList.filter(item => item.dial_prefix == countryPrefix);    
    let minute_plan_type = (arr[0]['minute_plan_type'] == "Booster") ? 'Booster' : '';   
    rtrnData = arr[0]['destination'] + ' (' + arr[0]['dial_prefix'] + ') '  + arr[0]['minute_plan_type'];
    return rtrnData;
    }else{
     let arr = this.destinationList.filter(item => item.dial_prefix == countryPrefix);
    //  let assignMinutesList = item.get('minutes').value;
     let assignMinutes = 0;
    //  assignMinutesList.forEach(element => {
    //    assignMinutes = assignMinutes + element['minutes']
    //  });
     rtrnData = 'Remaining Minutes : '+ assignMinutes + '/' + arr[0]['minutes'];
     return rtrnData;
    }
   }
 
}