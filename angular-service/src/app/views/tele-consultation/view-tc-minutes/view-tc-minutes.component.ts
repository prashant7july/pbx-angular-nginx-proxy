import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormArray } from '@angular/forms';
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
import { BundlePlanDialog } from '../../call-plan/bundle-plan/bundle-plan.component';
import { CallplanService } from '../../call-plan/callplan.service';
import { TeleConsultationService } from '../tele-consultation.service';
import { MinutePlanService } from '../../customer-minute-plan/customer-minute-plan.service';


@Component({
  selector: 'app-view-tc-minutes',
  templateUrl: './view-tc-minutes.component.html',
  styleUrls: ['./view-tc-minutes.component.css']
})
export class ViewTcMinutesComponent implements OnInit {

  

  error = '';
  isFilter = false;
  filterForm: FormGroup;
  selectedValue = "";
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  loginUserType = localStorage.getItem('type');
  accountManagerCustomerList: "";
  allCountryList : any[] = [];
  customerBundleInfo : any;

  public fields: Object = { text: 'name', value: 'phonecode' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  public mode = 'CheckBox';
  public selectAllText= 'Select All';

  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog,
    private callplanService: CallplanService,
    private userService: UserService,
    private route : ActivatedRoute,
    public teleConsultationService:TeleConsultationService,
    private minutePlanService: MinutePlanService,

  ) {
    this.filterForm = this.fb.group({
      'by_destination' :  new FormControl([]),
      'by_customerId' : localStorage.getItem('id')
    });
  }

  ngOnInit() {   
    this.teleConsultationService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    
     this.commonService.getCountryList().subscribe(data => {   //get country list
      this.allCountryList = data.response;
    }, err => {
      this.error = err.message;
    });

    this.userService.getCustomerById(localStorage.getItem('id')).subscribe(data => {
      let customerInfo = data.response[0];
      
      let creadentials = {};
      creadentials['by_id'] = customerInfo['teleConsultancy_call_plan_id'] // bundle or roaming
      this.callplanService.filterBundlePlan(creadentials).subscribe(data => {
        
        this.customerBundleInfo = data[0];
      })
    });
  }

  
  Counteryremovedspace(event){
  const textValue = event.text.trim().toLowerCase();
 const filterData = this.allCountryList.filter((data) =>{    
    return data['name'].toLowerCase().includes(textValue);
  })
  event.updateData(filterData);

  }


displayAllRecord() {
  this.columnDefs = [
    { field: 'id', headerName: 'ID', hide: true, width: 10 },
    { field: 'destination', headerName: 'Destination', hide: false, width: 20 },
    { field: 'dial_prefix', headerName: 'Dial Prefix', hide: false, width: 20 },
    { field: 'minutes', headerName: 'Actual Minutes', hide: false, width: 30 },
    { field: 'group_type', headerName: 'Type', hide: false, width: 30 },
    { field: 'group_name', headerName: 'Group Name', hide: false, width: 30 },
    { field: 'talktime_minutes', headerName: 'Total Minutes', hide: false, width: 30 },
    { field: 'used_minutes', headerName: 'Consumed Minutes', hide: false, width: 30 },
    {field: 'expiry_date' , headerName: 'Valid Upto' , hide:false , width : 30}

  ];
 
    if (this.isFilter) {
      const credentials = this.filterForm.value;        
      credentials['flag'] = 1;
      this.minutePlanService.viewCustomerBundlePlan(credentials).subscribe(pagedData => {
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);          
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      let obj = {
        customer_id : Number(localStorage.getItem('id')),
        by_destination : []    ,
        flag: true    
      }
      this.minutePlanService.viewCustomerBundlePlan(obj).subscribe(pagedData => {
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
    finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='info' title='Information'></i>";
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
    case "info":
      this.bundleInfo();
    }
}

bundleInfo(){
  let Id = this.customerBundleInfo['id'];
  
  return this.infoBundlePlan({data : this.customerBundleInfo, id : Id, readonly : true });
}


infoBundlePlan(event) {
  const dialogRef = this.dialog.open(BundlePlanDialog, { width: '60%', disableClose: true, data: event });
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



// showInfo() {
//   const dialogRefInfo = this.dialog.open(InfoBundleMinuteDialog, {
//     width: '80%', disableClose: true, autoFocus:false,
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

get UserTypeAdmin() {
  return UserTypeConstants.ADMIN;
}
}
