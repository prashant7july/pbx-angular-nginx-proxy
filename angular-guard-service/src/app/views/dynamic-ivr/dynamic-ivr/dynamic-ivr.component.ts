import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonService, EMAIL_RegEx, ExcelService, Name_RegEx, Number_RegEx } from 'src/app/core';
import { UserService } from '../../user/user.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DynamicIvrService } from '../dynamic-ivr.service';
import { Router } from '@angular/router';
import { PromptsService } from '../../prompts/prompts.service';

@Component({
  selector: 'app-dynamic-ivr',
  templateUrl: './dynamic-ivr.component.html',
  styleUrls: ['./dynamic-ivr.component.css']
})
export class DynamicIvrComponent implements OnInit {
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  action = 'reply';
  isFilter = false;
  flag : boolean = false;
  filterForm: FormGroup;
  userRole = '';
  columnDefs: any;
  // dataSource: any = [];
  rowData: any;
  pageSize: number = 10;
  customerId = '';
  exportData: any = {};
  showNotInsertedValue = false;
  excelValue: any = {};
  defaultPageSize = '10'; 
  dataSource: any[];
  promptList;
  
  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    public dialog: MatDialog,
    public userService: UserService,
    private toastr: ToastrService,
    private excelService: ExcelService,
    private dynamicIvrService: DynamicIvrService,
    private promptsService : PromptsService
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_number': [""],
      'by_email': [""]
    });

  }

  ngOnInit() {

    this.dynamicIvrService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
      });

      this.promptsService.getMOHPrompt(localStorage.getItem('id')).subscribe(data => {
        this.promptList = JSON.stringify(data.response);
      });
  



  }


  displayAllRecord() {
    this.showNotInsertedValue = false;
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 15 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 15 },
      { field: 'prompt', headerName: 'Prompt', hide: false, width: 15 },
      { field: 'url/api', headerName: 'URL/API', hide: false, width: 30 },
      { field: 'url/api_action', headerName: 'URL/API_action', hide: false, width: 30 },
      { field: 'url/api_response', headerName: 'URL/API_response', hide: false, width: 30 },

    ];
    
    let role = Number(localStorage.getItem('type'));
    let id = Number(localStorage.getItem('id'));
    if (this.isFilter) {
      const credentials = this.filterForm.value;
  
      this.dynamicIvrService.filterDynamicIvrList(credentials, id, role).subscribe(data => {
        this.exportData = data;
        
        // data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    }
     else {
      
      this.dynamicIvrService.getDynamicIvrList({'customer_id': Number(id)}).subscribe(data => {
        this.exportData = data;
        
        // data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
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


  openDialog(id?, data?): void {    
    const dialogRef = this.dialog.open(DynamicIVRDialog, {
      width: '50%', disableClose: true,
      data: {
        id: id ? id : null,
        promptList: this.promptList
      }
    });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

}

@Component({
  selector: 'dynamic-ivr-dialog',
  templateUrl: 'dynamic-ivr-dialog.html',
})

export class DynamicIVRDialog {
  dynamicIvrForm: FormGroup;
  submitted = false;
  checkForm: any;
  countryList = [];
  CountrydataFilter = [];
  CountryFilter:any;
  filter:any[]=[];
  countryCode = "";
  error = '';
  // validNumber = "";
  countryID: any = {};
  customerId = '';
  extensionId = '';
  contactData: any = {};
  errorField = '';
  phoneNum2 = false;
  phoneNum1 = false;
  isloading  = false;
  dataSource: any = [];
  promptList : any = [];
  urlActionList : any = [];
  public fields: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'prompt_name', value: 'id' };
  public placeholder: string = 'Select Country';
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  DataBind: string;


  constructor(
    public dialogRef: MatDialogRef<DynamicIVRDialog>,@Inject(MAT_DIALOG_DATA) public data: DynamicIvrComponent,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public commonService: CommonService,
    private dynamicIvrService: DynamicIvrService

  ) {
    this.dynamicIvrForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'prompt': [''],
      'dtmf': [''],
      'recording': [''],
      'url_api': [''],
      'url_api_action': [''],
      'url_api_response': [''],
    });
  }

  get name() { return this.dynamicIvrForm.get('name'); }
  get prompt() { return this.dynamicIvrForm.get('prompt'); }
  get dtmf() { return this.dynamicIvrForm.get('dtmf'); }
  get recording() { return this.dynamicIvrForm.get('recording'); }
  get url_api() { return this.dynamicIvrForm.get('url_api'); }
  get url_api_action() { return this.dynamicIvrForm.get('url_api_action'); }
  get url_api_response() { return this.dynamicIvrForm.get('url_api_response'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
  this.promptList = JSON.parse(this.data.promptList); 
  
  }



  submitDynamicIvrForm() {
    this.checkForm = this.findInvalidControls();
    if (this.dynamicIvrForm.valid) {
      this.submitted = true;
      let credentials = this.dynamicIvrForm.value;

      console.log(credentials,"---credentials---");
      
      credentials['customer_id'] = localStorage.getItem('id');
      this.dynamicIvrService.saveDynamicIvr(credentials).subscribe(data=>{
        if(data.status == 409){
          this.toastr.error('Error!', 'Dynamic Ivr Already Exists.', { timeOut: 2000 });
        }else if(data.status == 200){
          this.toastr.success('Success!', 'Dynamic Ivr Already Created.', { timeOut: 2000 });
          this.cancelForm();
        }
        console.log(data);
      })
    }
    
  }

  Countryremovedspace = (event:any) => {
    const countryspace = event.text.trim().toLowerCase();
    const countryFilter = this.CountrydataFilter.filter((data) =>{
      return data['name'].toLowerCase().includes(countryspace);
    })
    
    event.updateData(countryFilter);
  }

  cancelForm() {
    this.dynamicIvrForm.reset();
    this.dynamicIvrService.updateGridList();
    this.dialogRef.close();
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.dynamicIvrForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }


}

