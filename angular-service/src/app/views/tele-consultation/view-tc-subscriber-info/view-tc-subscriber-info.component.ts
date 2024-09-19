import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Errors, CommonService, ExcelService, CallPlanRate, invalidFileType, importUnsuccessfully, importSuccessfully, Number_RegEx, Number_Not_Start_Zero_RegEx, PagedData } from '../../../core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
import { UserTypeConstants } from 'src/app/core/constants';
import { UserService } from '../../user/user.service';
import { TeleConsultationService } from '../tele-consultation.service';
import { id } from '@swimlane/ngx-charts/release/utils';
import { MinutePlanService } from '../../customer-minute-plan/customer-minute-plan.service';


@Component({
  selector: 'app-view-tc-subscriber-info',
  templateUrl: './view-tc-subscriber-info.component.html',
  styleUrls: ['./view-tc-subscriber-info.component.css']
})
export class ViewTcSubscriberInfoComponent implements OnInit {

  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public mode = 'CheckBox';
  public selectAllText= 'Select All';

  error = '';
  isFilter = false;
  filterForm: FormGroup;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  allCountryList = [];
  errors: any;

  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog,
    private userService: UserService,
    private route : ActivatedRoute,
    public teleConsultationService:TeleConsultationService,
  ) {
    this.filterForm = this.fb.group({
      'by_destination': '',
      'by_name': '',
      'by_expiry': ''
   });
  }

  ngOnInit() {
    this.teleConsultationService.displayAllRecord.subscribe(() =>{
      this.displayAllRecord()
    })

    this.commonService.getCountryList().subscribe(data => {   //get country list
      this.allCountryList = data.response;
    }, err => {
      this.error = err.message;
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width:20 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'package_name', headerName: 'Package', hide: false, width: 20 },
      { field: 'date', headerName: 'Package Expiry', hide: false, width: 20 },
      { field: 'phone', headerName: 'Contact', hide: false, width: 30 },
      { field: 'assign_minutes', headerName: 'Assigned Minutes', hide: false, width: 30 },
      { field: 'used_minute', headerName: 'Used Minutes', hide: false, width: 30 },
      { field: 'country', headerName: 'Country', hide: false, width: 30 },
      { field: 'price', headerName: 'Rate', hide: false, width: 30 },
  
    ];
    let id = Number(localStorage.getItem('id'));

    if(this.isFilter){
      let credentials = this.filterForm.value;
      credentials['id'] = id;
      this.teleConsultationService.getSubscriberInfoByFilter(credentials).subscribe(pagedData =>{
        
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);          
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;        
      });

    }else{
      this.teleConsultationService.getSubscriberInfo(id).subscribe(pagedData=>{
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
       this.dataSource = [];
       this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });        
      });
    }
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-plus-square edit-button' style='cursor:pointer; display: inline' data-action-type='renew' title='Renew'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='remove' title='Remove'></i>";
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "renew":
        this.renew(data);
        return;
      case "remove":
        this.remove(data);
        return;
      }
  }

  renew(data){
    const dialogRef = this.dialog.open(subscriberInfoDialog, { width: '60%', disableClose: true , data: data});
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  remove(event){    
    let id = parseInt(localStorage.getItem('id'));
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      text: 'You will not be able to recover this in future!',
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
       this.teleConsultationService.deleteSubscriber({ id: event.id , c_id:event.contact_id, cust_id : id}).subscribe(data => {
          if (data['code'] == 400) {
            Swal.fire(
              {
                type: 'error',
                title: '<span style="color:#FFFFFF;">Oopss...</span>',
                text: 'This already exist in other.',
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
          title: '<span style="color:#FFFFFF;">Minute</span>',
          text: ' has been deleted.',
          type: 'success',
          background: '#000000'
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          text: 'TC Plan is safe :)',
          type: 'error',
          background: '#000000',
        });
      }
    })

  }

  Counteryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.allCountryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  
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

}

@Component({
  selector: 'subscriberInfo-dialog',
  templateUrl: './subscriberInfo-dialog.html'
})

export class subscriberInfoDialog implements OnInit {
  error = '';
  submitted = false;
  errors: Errors = { errors: {} };
  subscriberForm : FormGroup;
  feature_list: any;
  isEdit: boolean = false;
  errorField: any
  dialog: any;
  displayAllRecord: any;
  planData : any;
  globalRateList : any = "";
  countryList = [];
  contact: any;
  minutes: any;
  total_minutes: any;
  remaining_minutes: any;
  remaining_contact_minutes: any;

  public fields: Object = { text: 'name', value: 'name' };
  public placeholder2: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';  
  filter:any;
constructor(
  public dialogRef: MatDialogRef<subscriberInfoDialog>, @Inject(MAT_DIALOG_DATA) public data,
    private router: Router,
    public teleConsultationService :TeleConsultationService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private fb: FormBuilder,
    private minutePlanService: MinutePlanService,

  ) {
    this.subscriberForm = this.fb.group({
      'minutes': '',
   });
  }

  ngOnInit(){    
    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;      
    });

    this.contact = this.data.name + - this.data.phone;
    

    let obj = {
      customer_id: Number(localStorage.getItem('id')),
      flag: true  ,
      dest: this.data.destination,
      tc_pkg_id: this.data.id,
      cont_id : this.data.contact_id
    }
    
    this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
      
      
      this.total_minutes = 0;
      pagedData.map(item => {
        this.total_minutes += Number(item.talktime_minute);
      })
      this.teleConsultationService.getTcPkgById(obj).subscribe(data => {   
        if(data[0]['minutes'] != null){   
          this.remaining_minutes = this.total_minutes - Number(data[0]['total_minutes']);  
          // this.remaining_contact_minutes = Number(data[0]['assign_minutes']) - Number(data[0]['used_minute']); 
          // this.remaining_contact_minutes = data[0]['assign_minutes']
          this.minutes = data[0].minutes;

        }else{
          this.remaining_minutes = this.total_minutes;
        }       
        
      })

      this.teleConsultationService.getRemainingContactMinutes(obj).subscribe(data2 =>{
        this.remaining_contact_minutes = data2[0].assign_minutes  //coz remaining mintutes not provided by backend yet
      })
    });
 
 } 

 Countryremovedspace(event){
  const textValue = event.text.trim().toLowerCase();
  const filterData = this.countryList.filter((data) =>{    
    return data['name'].toLowerCase().includes(textValue);
  })
  event.updateData(filterData);
}

onNoClick(e): void {
  this.dialogRef.close();
  e.preventDefault();
}
AddMinutes(){
  if(this.remaining_minutes <this. minutes){
    this.toastr.error('Error!', "You do not have Reamining Minutes.", { timeOut: 2000 });
  }else{
    let obj = {
      contact_id : this.data.contact_id,
      minutes: this.minutes,
    }

    this.teleConsultationService.addMinutes(obj).subscribe(data =>{
      
      if(data.status_code == 200){
        this.toastr.success('success!', "Minutes Added Successfully", { timeOut: 2000 });
        this.dialogRef.close();
        this.teleConsultationService.updateGridList();
      }else{
        this.toastr.error('Error!', "Something Went Wrong", { timeOut: 2000 });
      }
    })
  }
}
 
}
