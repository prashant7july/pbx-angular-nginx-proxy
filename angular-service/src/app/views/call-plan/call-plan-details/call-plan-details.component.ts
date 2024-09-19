import { Component, OnInit, Inject } from '@angular/core';
import { Errors, CommonService, ExcelService, Name_RegEx } from '../../../core';
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
import { Router } from '@angular/router';
import { UserService } from '../../user/user.service';
import { PackageService } from '../../package/package.service';

@Component({
  selector: 'app-call-plan-details',
  templateUrl: './call-plan-details.component.html',
  styleUrls: ['./call-plan-details.component.css']
})
export class CallPlanDetailsComponent implements OnInit {
  columnDefs: any;
  dataSource: any = [];
  bundlePlan: any = [];
  roamingPlan: any = [];
  tcPlan: any = [];
  outPlan: any = [];
  rowData: any;
  pageSize: number = 10;
  errorField = "";
  isFilter = false;
  isCircle = false;
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
  callPlanName: any = '';  
  circle: any = '';  

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
    private userService : UserService,
    private callPlanService : CallplanService,
    private packageService : PackageService
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_type': [""],
      'by_circle': new FormControl([]),
      'minute_paln_type': [""],
      'by_minute_plan': ['']
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
      // { field: 'action', headerName: 'Action', hide: false, width: 15 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 30 },
      { field: 'lcTypeDisplay', headerName: 'LC Type', hide: false, width: 30 },
      { field: 'circle_name', headerName: 'Circle', hide: false, width: 20 },
      { field: 'plan_type_name', headerName: 'Minute Plan', hide: false, width: 20 },

    ];

    // if (this.isFilter) {
    //   const credentials = this.filterForm.value;

    //   this.callplanService.filterCallPlan(credentials).subscribe(pagedData => {
    //     this.exportData = pagedData;
        
    //     this.dataSource = [];
    //     this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    //   }, err => {
    //     this.errors = err.message;
    //   });
    // } else {
      this.packageService.getPbxFeatures(Number(localStorage.getItem('id')),1).subscribe(packageData =>{
        
      this.callPlanService.getCallPlan().subscribe(data=>{
        
        let standard = data.response.filter(item => item.id == packageData['response'][0]['call_plan_id']);
        
        this.callPlanName = standard[0]['name'];
        if(standard[0]['circle_id'] != ""){
          this.isCircle = true;
            this.circle = this.circleList.filter(item => item.id == standard[0]['circle_id'])
          
          
        }else{
          this.isCircle = false;
        }
            
      })
      })
setTimeout(() => {
  this.userService.getCustomerAssociateMinutePlan(localStorage.getItem('id')).subscribe(data=>{
  
    this.bundlePlan = data['response']['0'];
    this.roamingPlan =data['response']['1'];
    this.tcPlan = data['response']['2'];
    this.outPlan = data['response']['3'];
    console.log("--gg");

    })
}, 500);
      
 
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
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
