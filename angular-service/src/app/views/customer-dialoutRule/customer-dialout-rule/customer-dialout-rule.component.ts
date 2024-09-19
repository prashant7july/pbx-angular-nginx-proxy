import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService, formError, agentError, invalidFileType, importUnsuccessfully, importSuccessfully, 
  Errors,OutboundSuccessfully,Contact_RegEx } from '../../../../app/core';
  import { CustomerDialoutServiceService } from '../customer-dialout-service.service';
import { ConfigService } from '../../config/config.service'
import { DidService } from '../../DID/did.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';


@Component({
  selector: 'app-customer-dialout-rule',
  templateUrl: './customer-dialout-rule.component.html',
  styleUrls: ['./customer-dialout-rule.component.css']
})
export class CustomerDialoutRuleComponent implements OnInit {
  error = '';
  filterForm: FormGroup;
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  selectedValue: any = [];
  selectedValueTwo : any= [];
  filterObj: any = {};
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  DialOutName:any;
  

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private CustomerDialoutServiceService: CustomerDialoutServiceService,
    private didService: DidService,
    public commonService: CommonService,


  ) { 
    this.filterForm = this.fb.group({ 
      'dialout_pattern': [""],
      'exceptional_rule': [""],
    });
  }

  ngOnInit() {
    this.CustomerDialoutServiceService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }
  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      // { field: 'id', headerName: 'ID', hide: false, width: 100 },
      { field: 'name', headerName: 'Dialout Group Name', hide: true, width: 150 },
      { field: 'rule_pattern', headerName: 'Rule Pattern', hide: false, width: 250 },
      { field: 'strip_digit', headerName: 'Strip Digit', hide: false, width: 250 },
      { field: 'prepend_digit', headerName: 'Prepend Digit', hide: false, width: 250 },
      { field: 'exceptional_rule', headerName: 'Exceptional Rule', hide: false, width: 220 },
      { field: 'caller_value', headerName: 'Random Caller ID', hide: false, width: 250 },
      { field: 'did_display', headerName: 'Caller ID', hide: false, width: 250 },
      { field: 'blacklist_value', headerName: 'Black List No. Matching', hide: false, width: 250 },
      { field: 'dialout_value', headerName: 'Dial-out As', hide: false, width: 220 },

    ];
    let user_id = localStorage.getItem('id');
    if(this.isFilter){
      const credentials = this.filterForm.value;
      credentials.exceptional_rule = Number(credentials.exceptional_rule);
      this.CustomerDialoutServiceService.getDialouFilter(credentials,Number(user_id)).subscribe(data => {      
        data = this.manageUserActionBtn(data);      
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
      })
    }else{
      const user_id = localStorage.getItem('id');      
      this.CustomerDialoutServiceService.getcustomerdialoutdata(user_id).subscribe((datas => {  
        this.DialOutName = datas[0].name
        datas = this.manageUserActionBtn(datas);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': datas});
      })),err => {
        this.error = err.message;
      }

    }
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

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-eye views-button' style='cursor:pointer; display: inline' data-action-type='info' title='Information'></i>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
    
      finalBtn += "</span>";
      pagedData[i]['action'] = finalBtn;
    }
    return pagedData;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "info":
        return this.editDialOutRule(data);
    }
  }
  editDialOutRule(data: any) {
    this.openDialog(data);
  }
  openDialog(data?): void {
    const dialogRef = this.dialog.open(CustomerDialoutDialog, { width: '200%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
@Component({
  selector: 'CustomerDialout-dialog',
  templateUrl: './CustomerDialout-dialog.html'
})
// export class CustomerDialoutDialog implements OnInit {
//   livecallForm : FormGroup;
//   error = '';
//   errors: Errors = { errors: {} };
//   destination_list: any = [];
//   dialog: any;
//   isFilter = false;
//   countryList = [];
//   columnDefs2 =[];
//   dataSource2 =[];
//   rowData: any;
//   defaultPageSize = '10';
//   filter:any;
// constructor(
//   public dialogRef: MatDialogRef<CustomerDialoutDialog>, @Inject(MAT_DIALOG_DATA) public data:any,
//     private router: Router,
//     private toastr: ToastrService,
//     public commonService: CommonService,
//     private fb: FormBuilder,
//     private OutboundService: OutboundService,
//   ) {
//   //   this.livecallForm = this.fb.group({
//   //     'prompt': '',
//   //  });
//   }

//   ngOnInit(){    
//     // this.OutboundService.displayAllRecord.subscribe(() => {
//     //   this.displayAllRecordd();
//     // });
//  } 

//  public displayAllRecordd() {
//   this.columnDefs2 = [
//     // { field: 'action', headerName: 'Action', hide: true, width: 100 },
//     { field: 'contact', headerName: 'Lead', hide: false, width: 150 },
//     { field: 'num_of_tires', headerName: 'Attempts', hide: false, width: 150 },
//     { field: 'dialed_status', headerName: 'Dial Status', hide: false, width: 150 },
//   ];
//   // const credentials = this.livecallForm.value;
//   // if(false){
//   //   // this.OutboundService.getreportFilter(credentials,user_id).subscribe(data => {      
//   //   //   data = this.manageUserActionBtn(data);      
//   //   //   this.dataSource2 = [];
//   //   //   this.dataSource2.push({ 'fields': this.columnDefs2, 'data': data })
//   //   // })
//   // }else{
//     const user_id = localStorage.getItem('id');      
//     this.OutboundService.livecallforOC(user_id,this.data.id).subscribe((datas => {    
//       this.dataSource2 = [];
//       this.dataSource2.push({ 'fields': this.columnDefs2, 'data': datas});
//     })),err => {
//       this.error = err.message;
//     }
//   // }
// }
// resetTable() {
//   this.isFilter = false;
//   this.displayAllRecordd();
// }
// onNoClick(): void {
//   this.dialogRef.close();
//   // e.preventDefault();
// }
// }
export class CustomerDialoutDialog {
  dialoutForm: FormGroup;
  c_name = "";
  description = "";
  dialoutGroupList = [];
  DialFilter: any;
  filterDial: any;
  editdata: boolean = false;

  rules: string[] = [];
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Dialout Group';
  public popupHeight: string = '200px';
  public popupWidth: string = '300px';
  placeholder5 = 'DID as caller id'; 
  didList = []
  public fields2: Object = { text: 'didDisplay', value: 'id' };  
  DIDFilter:any;
  filterDID:any;
  hideRandom = false;
  promise;
  clr_id_as_random: any;
  dialoutname:any;
  prependData:any;
  stripData:any;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;



  constructor(
    public dialogRef: MatDialogRef<CustomerDialoutDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private fb: FormBuilder,
    public ConfigService: ConfigService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private didService: DidService
  ) {
    this.dialoutForm = this.fb.group({
      'id': [""],
      'dialout_group_id': ["", Validators.required],
      'rule_pattern': ["", [Validators.required]],
      'prepend_digit': [""],
      'strip_digit': [""],
      // 'is_sign': [""],
      'blacklist_manipulation': [1, Validators.required],
      'exceptional_rule': new FormControl([]),
      'dialout_manipulation': [1, Validators.required],
      "caller_id_pstn":[""],
      "is_random": [""]
    });
 
  }

  get dialout_group_id() { return this.dialoutForm.get('dialout_group_id'); }
  get blacklist_manipulation() { return this.dialoutForm.get('blacklist_manipulation'); }
  get exceptional_rule() { return this.dialoutForm.get('exceptional_rule'); }
  get rule_pattern() { return this.dialoutForm.get('rule_pattern'); }
  get prepend_digit() { return this.dialoutForm.get('prepend_digit'); }
  get strip_digit() { return this.dialoutForm.get('strip_digit'); }
  get dialout_manipulation() { return this.dialoutForm.get('dialout_manipulation'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.ConfigService.getDialOutGroupList({}).subscribe(pagedData => {
      this.dialoutGroupList = pagedData;
      this.filterDial = this.DialFilter = this.dialoutGroupList.slice();

    });    
    this.didService.getDID(null, null).subscribe(item => {      
      item.map(values => {
        if(values.status == 'Active'){
          this.didList.push(values);
          this.filterDID = this.DIDFilter = this.didList.slice();
        }
      })
      if(this.data){               
        this.promise = Number(this.data['did_as_caller']);
      }
    })
    if (this.data) {
      this.prependData = this.data.prepend_digit;
      this.stripData = this.data.strip_digit;
      this.dialoutname = this.data.dialout_group_id;
      // if (this.data['dialout_group_name'] !== '') {
      //   this.editdata = true;

        this.rules = this.data['exceptional_rule'] ? this.data['exceptional_rule'].split(',') : [];
        this.data['blacklist_manipulation'] = Number(this.data['blacklist_manipulation']);
        this.data['dialout_manipulation'] = Number(this.data['dialout_manipulation']);
        this.data['is_sign'] = this.data['is_sign'] === '1' ? true : false;
        if(this.data['caller_id_as_random'] == '1'){
          this.hideRandom = true;
        }                                  
        this.clr_id_as_random = this.data['caller_id_as_random'] == '1' ? true : false;        
        this.dialoutForm.patchValue(this.data);        
        this.exceptional_rule.setValue(null);
      // }
    }
  }



  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }



  cancelForm() {
    this.ConfigService.updateGridList();
    this.dialogRef.close();
  }

 
}
