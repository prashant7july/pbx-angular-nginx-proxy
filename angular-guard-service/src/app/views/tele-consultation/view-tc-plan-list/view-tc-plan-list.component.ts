import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Errors, CommonService, ExcelService, Name_RegEx } from '../../../core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page } from '../../../core/models'
import { RatePlan } from '../../../core/models/RatePlan.model';
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
import { CallplanService } from '../../call-plan/callplan.service';
import { ContactListService } from '../../contact-list/contact-list.service';
import { MinutePlanService } from '../../customer-minute-plan/customer-minute-plan.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

declare const ExcelJS: any;


@Component({
  selector: 'app-view-tc-plan-list',
  templateUrl: './view-tc-plan-list.component.html',
  styleUrls: ['./view-tc-plan-list.component.css']
})
export class ViewTcPlanListComponent implements OnInit {

  error = '';
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  filterForm: FormGroup;
  filterObj: any = {};
  filter_list: any;
  globalRateList: any = "";
  toastr: any;
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';  
  public mode ;
  public selectAllText: string
  countryList: any = "";

  constructor(
    public teleConsultationService: TeleConsultationService,
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.mode = 'CheckBox';
    this.selectAllText= 'Select All';
    this.filterForm = this.fb.group({
      'name': [""],
      'by_country': ['']
    });
    this.teleConsultationService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    // this.FeaturesService.getFeaturePlan({}).subscribe(pagedData =>{
    //     this.filter_list = pagedData; 
    // });    

    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;      
    });
  }

  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'TC Package Name', hide: false, width: 10 },
      { field: 'price', headerName: 'Amount', hide: false, width: 10 },
      { field: 'country', headerName: 'Country', hide: false, width: 10 },
      { field: 'description', headerName: 'Description', hide: false, width: 10 },
    ];
    if (this.isFilter) {
      this.filterObj = this.filterForm.value
    } else {
      this.filterObj = {};
    }
    let customerId = Number(localStorage.getItem('type')) == 1 ? Number(localStorage.getItem('id')) : 0;
    this.teleConsultationService.getTCPlan(this.filterObj, customerId).subscribe(pagedData => {
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


  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["Plan Name", "Price","Country", "Description"];
    var rows = [];
    this.exportData.forEach(element => {
      let strStatus = element.status;
      // let strStatus1 = strStatus.replace(/<[^>]*>/g, '');
      const e11 = [element.name, element.price,element.country,element.description];
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

      },
    });
    doc.save('rateplan.pdf');

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
      pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToHeight: 1, fitToWidth: 1 }
    });
    worksheet.pageSetup.margins = {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.columns = [
      { header: 'Plan Name', key: 'Name', width: 30 },
      { header: 'Price', key: 'Price', width: 40 },
      { header: 'Country', key: 'Country', width: 40 },
      { header: 'Description', key: 'Description', width: 40 },

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
        Name: this.exportData[i].name,
        Price: this.exportData[i].price,
        Country: this.exportData[i].country,
        Description: this.exportData[i].description,
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
      finalBtn += "<i class='fa fa-user list-button' style='cursor:pointer; display: inline' data-action-type='addContact' title='Add Contact'></i>";
      // finalBtn += "<i class='fa fa-cogs config-minute' style='cursor:pointer; display: inline' data-action-type='config' title='Config Minute'></i>";
      if (pagedData[i]['mapped'] == 1) {
        finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='mappedContacts' title='Mapped Contacts'></i>";
      }
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
        return this.editTCPlan(data);
      case "delete":
        return this.deleteTCPlan(data);
      case "addContact":
         return this.showUsers(data);
      // case "config":
      //   return this.configureMinute(data);
      case "mappedContacts":
        return this.contactMapped(data);
    }
  }

  contactMapped(data) {
    this.router.navigate(['teleconsultation/tc-plan-list/tc-mapped-contacts'], { queryParams: { tcpId: data.id } });
  }



  editTCPlan(data: any) {
    
    this.openDialog(data);
    //his.router.navigate(['config/manage-circle'], { queryParams: {id:data.id } });
  }
  addTCPlan() {
    this.openDialog(null)
  }

  showUsers(data) {
    this.addContactDialog(data);
    // this.router.navigate(['teleconsultation/tc-associate-users'], { queryParams: { tcpId: data.id, tcpName: data.name } });
  }

  addContactDialog(data){
    const dialogRef = this.dialog.open(addContactDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddTCPlanDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.displayAllRecord();
    });
  }

  showInfo() {
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

  deleteTCPlan(event) {
    if (event.mapped == "1") {
      Swal.fire(
        {
          type: 'error',
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          text: "This TC Package can't be deleted, it is associated with a contact!",
          showConfirmButton: false,
          timer: 3000,
          background: '#000000'
        })
      return;
    }
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: 'You will not be able to recover this TC Package in future!',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.teleConsultationService.deleteTCList({ id: event.id }).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                text: 'This is TC Package is already exist in other.',
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
          text: 'TC Package has been deleted.',
          type: 'success',
          background: '#000000'
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: 'TC Package is safe :)',
          type: 'error',
          background: '#000000',
        });
      }
    })
  }

  public deductMinuteDialog() {
    this.router.navigate(['user/extension/view/minute-manage']);
  }

  // configureMinute(data) {
  //   this.router.navigate(['user/extension/view/minute-manage'], { queryParams: { id: data.id } });
  // }
}

@Component({
  selector: 'addTCPlan-dialog',
  templateUrl: './addTCPlan-dialog.html'
})

export class AddTCPlanDialog implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  rateplanForm: FormGroup;
  page = new Page();
  feature_list: any;
  isEdit: boolean = false;
  errorField: any
  dialog: any;
  displayAllRecord: any;
  planData: any;
  globalRateList: any = "";
  countryList = [];
  country_id;
  manageMinuteArray = [];
  monthDayStartFinish: Date[];
  minDate: Date;
  
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public placeholder: string = 'Select Contact';
  public popupHeight2: string = '200px';
  public popupWidth2: string = '250px';
  public fields2: Object = { text: 'showDisplay', value: 'id' };
  public mode = 'CheckBox';
  public selectAllText: string
  filter: any;
  contactList = [];
  total_minutes = 0;
  minuteCount = 0
  checkEdit: boolean = false;
  remaining_minutes = 0;    
  contacts = [];
  expirtDate = new Date();
  monthStartDay: any;
  monthFinishDay: any;
  bsRangeValue: Date[];
  bsValue = new Date();
  todayDate = new Date();
  contactLimit: any = 0;
  contactLength: any = 0;
  flag : boolean = false;
  edit : boolean = false;
  constructor(
    public dialogRef: MatDialogRef<AddTCPlanDialog>, @Inject(MAT_DIALOG_DATA) public data: RatePlan,
    private router: Router,
    public teleConsultationService: TeleConsultationService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private callplanService: CallplanService,
    private contactService: ContactListService,
    private minutePlanService: MinutePlanService,
  ) {  
    this.bsRangeValue = [this.bsValue, this.todayDate];
    this.minDate = new Date();
    this.planData = {
      name: '',
      price: '',
      description: '',
      destination: '',
      contact_id: '',
    };

    this.rateplanForm = this.fb.group({
      'name': ["", Validators.required],
      'price': ["", Validators.required],
      'description': [""],
      'country': ["", Validators.required],
      'contact': [""],
      'minutes': ["", Validators.required],
      'email_notification':["1"],
      "sms_notification": [''],
      "by_date": ['']
    });
  }
  get name() { return this.rateplanForm.get('name'); }
  get price() { return this.rateplanForm.get('price'); }
  get description() { return this.rateplanForm.get('description'); }
  get country() { return this.rateplanForm.get('country'); }

  ngOnInit() {
    this.planData = this.data;  
    this.country_id = this.planData != null ? Number(this.planData.destination) : '';
    this.isEdit = true;    
    if (!this.data) {
      this.planData = {
        name: '',
        price: '',
        description: '',
        destination: '',
        contact_id: '',
        minutes: 0
      };
    } else {    
      this.checkEdit = true;
      let obj = {
        customer_id: localStorage.getItem('id'),
        flag: true,
        dest: this.planData.destination
      }
      // this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
      //   pagedData.map(item => {
      //     this.total_minutes += Number(item.talktime_minute);
      //   });
      // });      
      let credentials = {
        tc_pkg_id: this.data.id,
        customer_id: localStorage.getItem('id')
      }
      this.teleConsultationService.getTcPkgById(credentials).subscribe(data => {    
        this.planData.assign_minutes = data[0]['minutes']    
        // this.monthStartDay = this.newVal(data[0].creates);
        // this.monthFinishDay = this.newVal(data[0].expiry);
        // this.planData['dates'] = [this.monthStartDay, this.monthFinishDay];
        this.monthDayStartFinish = data[0].dates ? data[0].dates : this.minDate          
        setTimeout(() => {                                     
          let contact = (data[0]['contact_id']).split(',');
          let c_id = [];        
          contact.map(item => {
            c_id.push(Number(item));
          })
          this.planData.contacts = c_id ? c_id : '';           
        }, 500);
      });
      this.onCountryselect('',obj);
    }

    // this.callplanService.getCountryList().subscribe(data => {
    //   this.countryList = data.response;
    //   this.filter = this.countryList.slice();
    // });
    this.callplanService.TCPackageDestination(localStorage.getItem('id')).subscribe(data => {
      this.countryList = data.response;
      this.filter = this.countryList.slice();
    });

    this.contactService.getContactList({ 'customer_id': localStorage.getItem('id'), 'role': localStorage.getItem('type') }).subscribe(contactData => {
      for (let i = 0; i < contactData.length; i++) {
        this.contactList.push({ id: contactData[i].id, name: contactData[i].name, showDisplay: contactData[i].name + ' - ' + contactData[i].phoneNumber1Display });
      }
    });

  }

  Countryremovedspace(event) {
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) => {
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.rateplanForm.controls;
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
    this.rateplanForm.reset();
    this.dialogRef.close();
  }

  onCountryselect(event,obj_data) {    
    let obj = {
      customer_id: Number(localStorage.getItem('id')),
      flag: true      
    }
    if(!obj_data){
      obj['dest'] = event.itemData.id;
    }else{
      obj['dest'] = obj_data.dest;      
    }
    
    this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
      this.total_minutes = 0;
      pagedData.map(item => {
        // this.total_minutes += Number(item.talktime_minute); // before my code
        this.total_minutes += Number(item.talktime_minutes);
      })
      this.teleConsultationService.getTcPkgById(obj).subscribe(data => {   
        // if(data[0]['minutes'] != null){   
        //   this.remaining_minutes = this.total_minutes - Number(data[0]['total_minutes']);   
        // }else{
        //   this.remaining_minutes = this.total_minutes;
        // }       
      })
      this.teleConsultationService.remaingMinutes(obj).subscribe(data => {   
        this.remaining_minutes = this.total_minutes - Number(data[0]['minutes'])
 })
    });   
  }

  newVal(val) {
    let split = val.split('/');
    return [split[1], split[0], split[2]].join('/');
  }

  
  onMinuteChange(event){  
    if(event.target.value > this.remaining_minutes || event.target.value == 0){
      this.toastr.error('Error!', "You do not have Reamining Minutes.", { timeOut: 2000 });
      this.rateplanForm.get('minutes').setValue('');
    }
    
    let users = Math.floor(this.remaining_minutes/event.target.value);
    this.contactLimit = users;
  }
  
  LimitContact(e){
    let len = 0 ;    
    if(e.value){
       len = e.value.length;
       this.contactLength = len;
    }
  }

  submitRatePlan() {
    if (this.rateplanForm.valid) {      
      this.submitted = true;
      this.errors = { errors: {} };
      const credentials = this.rateplanForm.value; 
      credentials.price = Number(credentials.price)
      credentials.email_notification = Number(credentials.email_notification)
      credentials.minutes = Number(credentials.minutes)
      if(this.flag == true){
      credentials['contact'] = [];      
      }      
      if (this.data) {
        // if(this.contactLimit < this.contactLength){
        //   this.toastr.error('Error!', `maximum number of contact is ${this.contactLimit}`, { timeOut: 2000 });
        //   return;
        // }else{
        credentials.total_minutes = this.total_minutes;
        credentials.id = Number(this.data.id);
        credentials.name = credentials.name[0].toUpperCase() + credentials.name.slice(1);
        credentials.customerId = Number(localStorage.getItem('type')) == 1 ? Number(localStorage.getItem('id')) : 0;
        this.teleConsultationService.updateTCPlan(credentials).subscribe((data) => {
          if (data['code'] == 200) {
            this.toastr.success('Success!', ' TC Plan Updated Successfully', { timeOut: 2000 });
            this.reloadFeature();
          } else if (data['code'] == 1062) {
            data['message'] = 'Package Name are already exist'
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        })
      // }

      } else {
        if(this.contactLimit < this.contactLength){
          this.toastr.error('Error!', `maximum number of contact is ${this.contactLimit}`, { timeOut: 2000 });
          return;
        }else{
        credentials.total_minutes = this.total_minutes;
        credentials.name = credentials.name[0].toUpperCase() + credentials.name.slice(1);
        credentials.customerId = Number(localStorage.getItem('type')) == 1 ? Number(localStorage.getItem('id')) : 0;
        this.teleConsultationService.addTCPlan(credentials).subscribe((data) => {
          if (data['code'] == 200) {
            this.toastr.success('Success!','TC Plan Added Successfully', { timeOut: 2000 });
            this.reloadFeature();
          } else if (data['code'] == 1062) {
            data['message'] = 'Package Name are already exist'
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        })

      }
    }
    }
  }
}
@Component({
  selector: 'addContact-dialog',
  templateUrl: './addContact-dialog.html'
})

export class addContactDialog implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  rateplanForm: FormGroup;
  page = new Page();
  feature_list: any;
  isEdit: boolean = false;
  errorField: any
  dialog: any;
  displayAllRecord: any;
  planData: any;
  globalRateList: any = "";
  countryList = [];
  country_id;
  manageMinuteArray = [];
  monthDayStartFinish: Date[];
  minDate: Date;
  
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder2: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public placeholder: string = 'Select Contact';
  public popupHeight2: string = '200px';
  public popupWidth2: string = '250px';
  public fields2: Object = { text: 'showDisplay', value: 'id' };
  public mode = 'CheckBox';
  public selectAllText: string
  filter: any;
  contactList = [];
  total_minutes = 0;
  minuteCount = 0
  checkEdit: boolean = false;
  remaining_minutes = 0;    
  contacts = [];
  expirtDate = new Date();
  monthStartDay: any;
  monthFinishDay: any;
  bsRangeValue: Date[];
  bsValue = new Date();
  todayDate = new Date();
  contactLimit: any = 0;
  contactLength: any = 0;
  flag : boolean = false;
  edit : boolean = false;
  dest: any ;
  packData: any ;
  selectedContact = [];
  createDate: any;
  expiryDate: any;
  constructor(
    public dialogRef: MatDialogRef<addContactDialog>, @Inject(MAT_DIALOG_DATA) public data: RatePlan,
    private router: Router,
    public teleConsultationService: TeleConsultationService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private callplanService: CallplanService,
    private contactService: ContactListService,
    private minutePlanService: MinutePlanService,
  ) {  
    this.bsRangeValue = [this.bsValue, this.todayDate];
    this.minDate = new Date();
    this.planData = {
      name: '',
      price: '',
      description: '',
      destination: '',
      contact_id: '',
    };

    this.rateplanForm = this.fb.group({
      'name': [""],
      'price': [""],
      'contact': ["",[Validators.required]],
      'minutes': [""],
      
      
      
    });
  }
  get name() { return this.rateplanForm.get('name'); }
  get price() { return this.rateplanForm.get('price'); }
  get description() { return this.rateplanForm.get('description'); }
  get country() { return this.rateplanForm.get('country'); }
  get minutes() { return this.rateplanForm.get('minutes'); }
  
  ngOnInit() {
    this.planData = this.data;  
    this.country_id = this.planData != null ? Number(this.planData.destination) : '';
    this.isEdit = true;            
      this.checkEdit = true;
      let obj = {
        customer_id: localStorage.getItem('id'),
        flag: true,
        dest: this.planData.destination
      }
      // this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
      //   pagedData.map(item => {
      //     this.total_minutes += Number(item.talktime_minute);
      //   });
      // });      
      let credentials = {
        tc_pkg_id: this.data.id,
        customer_id: localStorage.getItem('id')
      }
      this.teleConsultationService.getTcPkgById(credentials).subscribe( data => {
        if(data[0]['contact_id'] != null) {
        this.packData = data[0];   
        this.selectedContact = this.packData.contact_id.split(',').map(id => Number(id));
        this.createDate = this.packData.dates.split(':')[0];
        this.expiryDate = this.packData.dates.split(':')[1];      
        this.planData.assign_minutes = data[0]['minutes']    
        // this.monthStartDay = this.newVal(data[0].creates);
        // this.monthFinishDay = this.newVal(data[0].expiry);
        // this.planData['dates'] = [this.monthStartDay, this.monthFinishDay];
        this.monthDayStartFinish = data[0].dates ? data[0].dates : this.minDate    
        setTimeout(() => {                                     
          let contact = (data[0]['contact_id']).split(',');
          let c_id = [];        
          contact.map(item => {
            c_id.push(Number(item));
          })
          this.planData.contacts = c_id ? c_id : '';           
        }, 500);
      }

        let obj = {
          customer_id: Number(localStorage.getItem('id')),
          flag: true  
        }
  
        obj['dest']= data[0].destination;
        
        this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
          
          this.total_minutes = 0;
          pagedData.map(item => {
            this.total_minutes += Number(item.talktime_minute);
          })
          this.teleConsultationService.getTcPkgById(obj).subscribe(data => {   
            
            
            if(data[0]['minutes'] != null){   
              this.remaining_minutes = this.total_minutes - Number(data[0]['total_minutes']);   
            }else{
              this.remaining_minutes = this.total_minutes;
            }       
          })
        }); 
      });
  
      this.contactService.getContactList({ 'customer_id': localStorage.getItem('id'), 'role': localStorage.getItem('type') }).subscribe(contactData => {
       
       
        for (let i = 0; i < contactData.length; i++) {
          
          if(!this.selectedContact.includes(contactData[i].id)){
            this.contactList.push({ id: contactData[i].id, name: contactData[i].name, showDisplay: contactData[i].name + ' - ' + contactData[i].phoneNumber1Display });
          }
        }
      });
      let min = this.rateplanForm.get('minutes');
    } 
 
    onNoClick(e): void {
   this.dialogRef.close();
    e.preventDefault();
      }

onMinuteChange(event){        
  if(event.target.value > this.remaining_minutes){
    this.toastr.error('Error!', "You do not have Reamining Minutes.", { timeOut: 2000 });
    this.rateplanForm.get('minutes').setValue('');
  }
  
  let users = Math.floor(this.remaining_minutes/event.target.value);
  this.contactLimit = users;
}

LimitContact(e){
  let len = 0 ;
  if(e.value){
     len = e.value.length;
     this.contactLength = len;
  }
}
reloadFeature() {
  this.rateplanForm.reset();
  this.dialogRef.close();
}

submitRatePlan() {
  let assign = this.rateplanForm.get('minutes').value;
  this.contactLimit = Math.floor(this.remaining_minutes/assign);
  if(this.contactLimit < this.contactLength){
    this.toastr.error('Error!', `maximum number of contact is ${this.contactLimit}`, { timeOut: 2000 });
    return;
  }else{
  if (this.rateplanForm.valid) {      
    this.submitted = true;
    this.errors = { errors: {} };
    const credentials = this.rateplanForm.value;
    credentials['destination'] = this.planData.destination;
    // credentials['create_date'] = this.createDate;
    credentials['expiry_date'] = this.expiryDate;
    credentials.total_minutes = this.total_minutes;
    credentials.id = this.data.id;
    credentials.customerId = localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0;
    
    this.teleConsultationService.addContact(credentials).subscribe((data) => {
      if (data['code'] == 200) {
        this.toastr.success('Success!', data['message'], { timeOut: 2000 });
        this.reloadFeature();
      } else if (data['code'] == 1062) {
        data['message'] = 'Package Name are already exist'
        this.toastr.error('Error!', data['message'], { timeOut: 2000 });
      }
      else {
        this.toastr.error('Error!', data['message'], { timeOut: 2000 });
      }
    })
  }
}
} 
}
