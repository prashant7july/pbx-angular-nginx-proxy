import { Component, OnInit,Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Errors, Name_RegEx, CommonService, promptUpdated, invalidFileType, errorMessage } from '../../../core';
import { DateAdapter } from '@angular/material';
import { UserTypeConstants } from 'src/app/core/constants';
import { BackendApiServiceService } from '../backend-api-service.service';
import { AllDID } from '../../../core/models';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../user/user.service';
export var productId = '1';


@Component({
  selector: 'app-view-api-logs',
  templateUrl: './view-api-logs.component.html',
  styleUrls: ['./view-api-logs.component.css']
})
export class ViewApiLogsComponent implements OnInit {
  error = '';
  isFilter = false;
  filterForm: FormGroup;
  hoverdata: any;
  columnDefs: any;
  dataSource: any = []; 
  rowData: any;
  pageSize: number = 10;
  viewButton: boolean = true;
  editButton: boolean = true;
  deleteButton: boolean = true;
  packageList = '';
  selectedValue = '';
  defaultPageSize = '10';
  ParamData: any;
  maxDate: Date;
  todayDate: Date;
  loginUserType = localStorage.getItem('type');
  showNotInsertedValue = false;
  BindData: any = "";
  tooltipContent : any = "";
  countryList: any = [];
    public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Company Name';
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';


  
  constructor(
    public commonService: CommonService,
    private logService: BackendApiServiceService,
    private dateAdapter: DateAdapter<Date>,      
    private fb: FormBuilder,
    private dialog: MatDialog,
    private userService:UserService
  ) {
    this.maxDate = new Date();
    this.dateAdapter.setLocale('en-GB');
    this.filterForm = this.fb.group({
      
      'by_responsecode': [""],
      'by_username': [""],
      'by_date': [""],
    });
   }

   GetData: any;
  ngOnInit() {
    let userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    if (userType == '3') {
      this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.countryList.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
        }
      }, err => {
        this.error = err.message;
      });
    }else{
    this.logService.getCountryListActive(localStorage.getItem('id')).subscribe(data =>{      
      let datas = data;
      for (let i = 0; i < datas.length; i++) {
       this.countryList.push({ id: datas[i].id, name: datas[i].company_name });
      }                  
    })
  }
    let user_id = localStorage.getItem('id');
    this

    this.displayAllRecord();
  }
  Providerremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.countryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 80 },
      { field: 'id', headerName: 'ID', hide: true, width: 150 },
      { field: 'created_at', headerName: 'Date', hide: false, width: 180 },
      { field: 'api_name', headerName: 'API', hide: false, width: 200 },
      { field: 'api_response_msg', headerName: 'API Response', hide: false, width: 150 },
      { field: 'api_status', headerName: 'Response Code', hide: false, width: 100 },
      { field: 'application', headerName: 'End Point', hide: false, width: 100 },
      { field: 'company_name', headerName: 'Company Name', hide: false, width: 150 },
      // { field: 'extension_number', headerName: 'Username', hide: false, width: 150 },
      { field: 'custom_params', headerName: 'Parameter', hide: false, width: 150 },
     ];

    if (this.isFilter) {
      let role = Number(localStorage.getItem('type'));
      let ResellerID = Number(localStorage.getItem('id'));
      const credentials = this.filterForm.value;
      this.logService.getAPILogByFilter(credentials,role,ResellerID).subscribe(pagedData => {    
        this.ParamData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      
      });
    } 
    else {
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
      this.logService.getAPILog(role,ResellerID).subscribe(pagedData => {
        this.hoverdata = pagedData
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  manageUserActionBtn(pagedData) {
    
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let actionBtn = '';
        this.BindData = pagedData;
        finalBtn += "<i class='fa fa-info-circle edit-button' style='cursor:pointer; display: inline' data-action-type='history' title='Information'></i>";
        pagedData[i]['action'] = finalBtn;
        this.hoverdata = pagedData
        if(pagedData[i]['params']){
        actionBtn += "<span title='"+ pagedData[i]['params'] +"'>"+pagedData[i]['params']+"</span>";
        pagedData[i]['custom_params'] = actionBtn;
        }
        else{
          actionBtn += "<span>No Records Found</span>";
          pagedData[i]['custom_params'] = actionBtn;
        }
    }
    return pagedData;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "history":
         return this.showviewApiLog(data);
    }
  }
  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  get UserTypeAdmin() {
    return UserTypeConstants.ADMIN;
  }

   showviewApiLog(data){
    const dialogRef = this.dialog.open(InfoApiLogDialog, { width: '80%',height: 'auto', disableClose: true, data: data });
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
  selector: 'InfoApiLog-dialog',
  templateUrl: 'InfoApiLog-dialog.html',
})

export class InfoApiLogDialog {
  BindData: any;
  tooltipContent : any = "";
  norecord:any="No Data Found";
  constructor(
    private router: Router,
    private logService: BackendApiServiceService, private fb: FormBuilder,
    public dialogRefInfo: MatDialogRef<InfoApiLogDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }    

  ngOnInit() {    
    if (this.data.id) {
      const credentials = this.data.id;      
      this.logService.getParam(credentials).subscribe(pagedData => {     
        console.log(pagedData)   
        this.BindData = pagedData ? JSON.parse(pagedData) : 'No Records Found.';
        });        
    }
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
