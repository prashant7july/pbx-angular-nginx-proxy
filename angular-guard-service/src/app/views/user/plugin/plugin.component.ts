import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService, RINGTIMEOUT_RegEx,EXPANDTIME_RegEx,ExcelService, invalidPhone, invalidForm,errorMessage, countryError, Name_RegEx, Number_RegEx, Errors, invalidFileType, IP_RegEx, duplicateIP } from '../../../core';
import { Router, NavigationEnd } from '@angular/router';
import { UserService } from '../user.service';
import { ColDef } from '@ag-grid-community/all-modules';
import { IVRService } from '../../smart_ivr/ivr.service';
import { ExtensionService } from '../../../core';
import { DidService } from '../../DID/did.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { T } from '@angular/cdk/keycodes';
import { getElement, LabelDragTool } from '@syncfusion/ej2-angular-diagrams';
import {  Input } from '@angular/core';
import { Browser } from '@syncfusion/ej2-base';

@Component({
  selector: 'app-plugin',
  templateUrl: './plugin.component.html',
  styleUrls: ['./plugin.component.css']
})
export class PluginComponent implements OnInit {
  filterForm: FormGroup;
  RowData: any;
  AgLoad: boolean;
  error = '';
  user_id = '';
  isFilter = false;
  columnDefs: any;
  columnDefs2: any;
  dataSource: any = [];
  companyData = "";
  exportData: any = {};
  destination_data: any[] = [];
  defaultPageSize = '10';
  allCountryList = "";
  filterFeature: any;
  pluginlinkData = '';
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Extension';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';
  public actionType: any= [
    {id: 1,
    label:'Extension' },
    {id: 2,
    label:'IVR Extension'},
    {id: 3,
    label:'External Number'},
    {id: 4,
    label:'Queue Extension'},
    {id: 5,
    label:'Call Group Extension'},
    ];

    public callType : any =[
      {id: 0,label: 'WEBRTC'},
      {id: 1,label: 'Call Back'},
      {id: 2,label: 'Both'}
    ]


  constructor(
    private userservice: UserService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public commonService: CommonService,
    private toastr: ToastrService,
    private didService: DidService,
    private extensionService : ExtensionService,
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
    });
  }

  ngOnInit() {

    this.user_id = localStorage.getItem("id");

    this.userservice.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }
  public displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'id', headerName: 'ID', hide: true, width: 50 },
      { field: 'name', headerName: 'Name', width: 150, hide: false },
      { field: 'description', headerName: 'Description', width: 200, hide: false },
      { field: 'action_type', headerName: 'Action Type', width: 150, hide: false },
      { field: 'action_value', headerName: 'Action Value', width: 200, hide: false },
      { field: 'call_type', headerName: 'Call Type', width: 250, hide: false },
      { field: 'status', headerName: 'Status', width: 270, hide: false }

    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      const cust_id = localStorage.getItem('id');
      credentials['cust_id'] = cust_id;
      this.userservice.getPluginByFilter(credentials).subscribe((data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        
        
        data = data.length == 0 ? [] : data
        for(let i = 0 ; i < data.length ; i++){
          let actionTitle = this.actionType.find(action => action.id == data[i].action_type);
          data[i].action_type = actionTitle.label;
          let callTypeName = this.callType.find(type => type.id == data[i].call_type);
          data[i].call_type = callTypeName.label;
          this.exportData = data;
          this.pluginlinkData = '';
          this.pluginlinkData = data[i];
          }
      })),err => {
        this.error = err.message;
      }


    }
    else {
      const cust_id = localStorage.getItem('id');
      this.userservice.getPluginByCustomer(Number(cust_id), null).subscribe((data) => {
        for(let i = 0 ; i < data.length ; i++){
          this.didService.getDestination(this.user_id,data[i].action_type).subscribe(data2 =>{
            this.destination_data = data2;
            let featureName = this.destination_data.find(value => value.id == data[i].action_value);
            data[i].action_value = featureName.name;

          })
        let actionTitle = this.actionType.find(action => action.id == data[i].action_type);
        data[i].action_type = actionTitle.label;
        let callTypeName = this.callType.find(type => type.id == data[i].call_type);
        data[i].call_type = callTypeName.label;


        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
        this.pluginlinkData = '';
        this.pluginlinkData = data[i];
        }


      });
    }
  }
  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "<i class='fa fa-files-o copy-button' style='cursor:pointer; display: inline' data-action-type='copy' title='Copy'></i>";


      data[i]['action'] = finalBtn;
    }

    return data;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editPluginData(data);
      case "delete":
        return this.deletePlugin(data);
      case "copy":
        return this.pluginLink(data);
    }
  }

  editPluginData(data) {
    this.openDialog(data.id);
  }

  deletePlugin(event) {

    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Plugin </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span><span style='color:#FFFFFF;'> in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.userservice.deletePlugin({ id: event.id }).subscribe(data => {
          this.displayAllRecord();
        },
          err => {
            this.error = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Plugin </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Plugin </span> <span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> is safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
  }


  openDialog(id?): void {
    const dialogRef = this.dialog.open(PluginDialog, { width: '80%', disableClose: true, data: { id: id ? id : null } });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  pluginLink(event) {
    const dialogRef = this.dialog.open(pluginlinkdialog, { width: '60%', disableClose: true, data: event });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
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

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }
  showInfo() {
    const dialogRefInfo = this.dialog.open(PluginDialog, {
      width: '60%', disableClose: true, autoFocus: false,
      data: {
        cust_id: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
      }
    });
    dialogRefInfo.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRefInfo.close('Dialog closed');
      }
    });
    dialogRefInfo.afterClosed().subscribe(result => {
    });
  }

}
@Component({
  selector: 'Plugin-dialog',
  templateUrl: './plugin-dialog.html',
})

export class PluginDialog {
  PluginForm: FormGroup;
  extensions: any = [];
  countryCode: any;
  countryCode2: any;
  countryCode3: any;
  filterFeature: any;
  error: '';
  countryID: any;
  filter: any;
  phone: boolean = false;
  isPluginExtension: boolean = false;
  isPluginActionValue: boolean = false;
  action_value: boolean = false;
  didDestination: any;
  destination_data: any[] = [];
  destination_data2: any[] = [];
  plugin_action_list: any[] = [];
  plugin_action_db: any[] = [];
  user_id: any;
  countryList: any;
  columnDefs: any;
  columnDefs2: any;
  columnDefs3: any;
  dataSource2: any = [];
  dataSource: any = [];
  dataSource3: any = [];
  destination_list: any = [];
  destination_list2: any = [];
  customer_id: any = '';
  defaultPageSize = '10';
  action: boolean = false;
  destination: boolean = false;
  public fields: Object = { text: 'name', value: 'id' };
  public fields1: Object = { text: 'ext_number', value: 'ext_number' };
  public placeholder: string = 'Select Extension';
  // public placeholder1: string = 'Select Country';
  public placeholder1: string = 'Select Country';

  public placeholder2: string = 'Select Language';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';
  public language: any =[
    {
      id: 0,
      name: 'English'
    },
    
  ]
  public actionType: any= [
  {id: 1,
  label:'Extension' },
  {id: 2,
  label:'IVR Extension'},
  {id: 3,
  label:'External Number'},
  {id: 4,
  label:'Queue Extension'},
  {id: 5,
  label:'Call Group Extension'},
  ];
  checkForm: any[];
  pluginData: any = [];
  action_type = '';
  call_type = '';
  count = 1;
  pluginLink = '';
  external_num:any= '';
  default_value = '';
  selectedCountry :any ='';
  dest:any='';
  color:any ='';
  pluginExt:any =[];
  isPluginExt: boolean = false;
  readOnly: boolean = false;
  extensionNo:any = "";
  actionValueName:any = "";
  defaultValueName:any = "";
  disable: any;
  destCheck: boolean = false;
  default_state = "";


  constructor(
    public dialogRefInfo: MatDialogRef<PluginDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private ivrService: IVRService,
    private router: Router,
    private userservice: UserService,
    private didService: DidService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private extensionService : ExtensionService,
    public commonService: CommonService) {
    this.PluginForm = this.fb.group({
      'name': ['', Validators.required],
      'description': [''],
      'action_type': ['', Validators.required],
      'action_value': ['', Validators.required],
      'call_type': ['', Validators.required],
      'status': [''],
      'action_name': ['', Validators.required],
      'language': [''],
      'default_state': [''],
      'display_time': [10, [ Validators.maxLength(2), Validators.pattern(EXPANDTIME_RegEx)]],
      'expand_time': [10, [ Validators.maxLength(2), Validators.pattern(EXPANDTIME_RegEx)]],
      'active_feature': [''],
      'country': [99],
      'country_code': [''],
      'add_country_code': [''],
      'add_country': [99],
      'OTP_verification': [''],
      'add_action_name': [''],
      'add_action_type': [''],
      'add_action_value': [''],
      'add_phone': [''],
      'action_country_code': [''],
      'action_country': [99],
      'phonee': ['',[Validators.pattern(Number_RegEx)]],
      'phone2': [''],
      'phone3': ['',[Validators.pattern(Number_RegEx)]],
      'footer_name': [''],
      'value':[''],
      'ext_number':['', Validators.required],
    });


  }

  get name() { return this.PluginForm.get('name'); }
  get display_time() { return this.PluginForm.get('display_time'); }
  get expand_time() { return this.PluginForm.get('expand_time'); }
  get phonee() { return this.PluginForm.get('phonee'); }
  get phone2() { return this.PluginForm.get('phone2'); }
  get phone3() { return this.PluginForm.get('phone3'); }


  ngOnInit() {
    this.disable = "country.flag == '1'"
    this.userservice.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });

    if (localStorage.getItem('type') == '6') {
      this.commonService.customerWiseCountry(localStorage.getItem('id')).subscribe(data => {
        this.countryID = data.response[0];
        this.countryCode = '+' + data.response[0].phonecode
        this.countryCode2 = '+' + data.response[0].phonecode
        this.countryCode3 = '+' + data.response[0].phonecode
      }, err => {
        this.error = err.message;
      });
    } else if (localStorage.getItem('type') == '1') {
      this.commonService.getCustomerCountry(localStorage.getItem('id')).subscribe(data => {
        this.countryID = data.response[0];

        this.countryCode = '+' + data.response[0].phonecode
        this.countryCode2 = '+' + data.response[0].phonecode
        this.countryCode3 = '+' + data.response[0].phonecode
      }, err => {
        this.error = err.message;
      });
    }

    this.user_id = localStorage.getItem("id");
    this.extensionService.getPluginExtByCustomerId(this.user_id).subscribe(data2 =>{      
        this.pluginExt = data2.response
        
    })



    this.commonService.getCountryList().subscribe(data => {
      this.countryList = data.response;
      this.filter = this.countryList.slice();

    }, err => {
      this.error = err.message;
    });

    let id = this.data

    if (this.data.id) {
      let credentials = {};
      credentials['cust_id'] = localStorage.getItem('id');
      credentials['id'] = this.data.id;
      this.userservice.getPluginByID(credentials).subscribe(data => {
        this.destination = data['destination'].length != 0 ? true : false;
        this.action = data['action'].length != 0 ? true : false;
        this.phone = data[0]['default_action_type'] === '3' ? true : false;
        this.action_value = data[0]['default_action_type'] !== '3'? true : false;
        this.defaultValueName = data[0]['default_action_value_name'];
        this.default_state = data[0]['plugin_default_state'] == 'open' ? "1" : "" ;


        setTimeout(() => {
          this.external_num = parseInt(data[0]['default_action_value']);
        },500);
        
        if(data[0].call_type == '0' || data[0].call_type == '2'){
          this.isPluginExt = true;
          this.extensionNo = data[0].ext_number;
        }else{
          this.isPluginExt =  false;
          this.PluginForm.get('ext_number').clearValidators();
          this.PluginForm.get('ext_number').updateValueAndValidity();
        }

        if(data[0].default_action_type == '3'){
          this.PluginForm.get('action_value').clearValidators();
          this.PluginForm.get('action_value').updateValueAndValidity();
        }
        
                
        this.pluginLink = data[0];
        let otp_verification = '';
        otp_verification = data['destination'].length !== 0 ? data['destination'][0]['otp_verification'] == "" ? otp_verification = "false" : otp_verification = "true" : otp_verification = "false";

        let feature = data[0]['default_action_type']
        this.didService.getDestination(this.user_id, feature).subscribe(data2  => {
          this.destination_data = data2;
           });


        for (let i = 0; i < data['destination'].length; i++) {
          this.destination_list.push({ id: data['destination'][i].id, dest: data['destination'][i].name, codes: data['destination'][i].dest_prefix,  otps: data['destination'][i].otp_verification == "OFF"? "false":"true" , c_code: data['destination'][i].country_code});
          this.dataSource2 = [];
          this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.destination_list });
        }

        for (let i = 1; i < data['action'].length; i++) {
          let actionTitle = this.actionType.find(action => action.id == data['action'][i].action_type);
          let destinationData = this.destination_data.find(destination => destination.id == data['action'][i].action_value);



          this.plugin_action_list.push({id: data['action'][i].id, name: data['action'][i].action_name, action_type: data['action'][i].action_type, action_value: data['action'][i].action_type != 3 ? data['action'][i].action_value : "", country: data['action'][i].action_type == 3 ? data['action'][i].dest_prefix : "", country_code: data['action'][i].action_type == 3 ? data['action'][i].action_value : "" , action_label: actionTitle.label, action_value_id: data['action'][i].action_value_id}) ;
          this.dataSource3 = [];
          this.dataSource3.push({ 'fields': this.columnDefs3, 'data': this.plugin_action_list });
          this.manageUserActionBtn(this.plugin_action_list);
        }
        if(this.destination_list.length == 1){
          this.destCheck = true;
        }else{
          this.destCheck = false;
        }
        this.displayAllRecord();
        this.pluginData = data[0]; 
        
        this.pluginData.status = parseInt(this.pluginData.status);  
        if(this.pluginData.lang == 'en'){
          this.pluginData.lang = 'English'
        }else{
          this.pluginData.lang =  null
        }
      })

     

    }
    else{
      this.destination = true;
      this.destination_list.push({ dest: "INDIA" , codes: "+91" , otps: "false"  , c_code: "99" });
      this.dataSource2 = [];
      this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.destination_list });
      if(this.destination_list.length == 1){
        this.destCheck = true;
      }else{
        this.destCheck = false;
      }
      this.displayAllRecord();
    }
    
  }
  Languageremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.language.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  pluginExtremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.pluginExt.filter((data) =>{    
      return data['ext_number'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
    const filterData = this.countryList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  public displayAllRecord() {
    if (this.destination == true) {

      this.columnDefs2 = [
        { field: 'id', headerName: 'ID', hide: true, width: 100 },
        { field: 'action', headerName: 'Action', hide: false, width: 100 },
        { field: 'dest', headerName: 'Country', hide: false, width: 100 },
        { field: 'codes', headerName: 'Destination', width: 150, hide: false },
        { field: 'otps', headerName: 'OTP Verification', width: 200, hide: false },
      ];
      let data = this.manageUserActionBtn(this.destination_list)
      this.dataSource2 = [];
      this.dataSource2.push({ 'fields': this.columnDefs2, 'data': data });
    }
    if (this.action == true) {
      this.columnDefs3 = [
        { field: 'id', headerName: 'id', hide: true, width: 100 },
        { field: 'actionn', headerName: 'Action', hide: false, width: 100 },
        { field: 'name', headerName: 'Name', hide: false, width: 100 },
        { field: 'action_label', headerName: 'Action Type', width: 150, hide: false },
        { field: 'action_value', headerName: 'Action Value', width: 200, hide: false },
        { field: 'country', headerName: 'Destination', width: 200, hide: false },
        { field: 'country_code', headerName: 'Ext Number', width: 200, hide: false },
      ];

      this.dataSource3 = [];
      this.dataSource3.push({ 'fields': this.columnDefs3, 'data': this.plugin_action_list });

    }
  }

  getDestinationList(event) {    
    this.PluginForm.get('action_value').reset();
    let feature = event.value;
    if (feature == '3') {
      this.PluginForm.get('action_value').clearValidators();
      this.PluginForm.get('action_value').setValue("");
      this.PluginForm.get('action_value').updateValueAndValidity();

    } else {
      this.PluginForm.get('country').clearValidators();
      this.PluginForm.get('country').updateValueAndValidity();
      this.PluginForm.get('country_code').clearValidators();
      this.PluginForm.get('country_code').updateValueAndValidity();
      this.PluginForm.get('phone3').setValue("");
    }
    if (feature != 3) {
      this.action_value = true;
      this.phone = false;
      this.didDestination = '';
      this.didService.getDestination(this.user_id, feature).subscribe(data => {
        this.destination_data = data;
      });
    } else {
      this.phone = true;
      this.action_value = false;
    }
  }

  getDestinationList2(event) {
    this.PluginForm.get('add_action_value').reset();
    this.PluginForm.get('phone3').reset();
    // this.PluginForm.get('action_country').reset();
    this.PluginForm.get('action_country').clearValidators();
    this.PluginForm.get('action_country').updateValueAndValidity();
    // this.PluginForm.get('action_country_code').reset();
    this.PluginForm.get('action_country_code').clearValidators();
    this.PluginForm.get('action_country_code').updateValueAndValidity();

    let feature = event.value;
    if (feature == '3') {
      this.PluginForm.get('phone3').setValidators(Validators.pattern(Number_RegEx));
      this.PluginForm.get('phone3').updateValueAndValidity();
      this.PluginForm.get('add_action_value').setValue("");
    }
    
    if (feature != 3) {
      this.PluginForm.get('phone3').clearValidators();
      this.PluginForm.get('phone3').updateValueAndValidity();
      this.PluginForm.get('phone3').setValue("");
      this.isPluginActionValue = true;
      this.isPluginExtension = false;
      this.didDestination = '';
      this.didService.getDestination(this.user_id, feature).subscribe(data => {
        this.destination_data2 = data;
      });
    } else {
      this.isPluginExtension = true;
      this.isPluginActionValue = false;
    }
  }

    genRandonString(length) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charLength = chars.length;
    var result = '';
    for ( var i = 0; i < length; i++ ) {
       result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
 }

  getCountryCode(event) {
    this.PluginForm.get('phonee').setValue('');
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode2(event) {
    this.PluginForm.get('phone2').setValue('');
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode2 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }
  getCountryCode3(event) {
    this.PluginForm.get('phone3').setValue('');
    let country_id = event.value;
    this.commonService.getCountryById(country_id).subscribe(data => {
      this.countryCode3 = '+' + data.response[0].phonecode;
    }, err => {
      this.error = err.message;
    });
  }

  changeCallType(eventevent){
    this.PluginForm.get('ext_number').setValue("");
    let calltype = this.PluginForm.get('call_type').value;
    if(calltype == 0 || calltype == 2){
    this.isPluginExt = true;
    }else{
      this.isPluginExt = false;
      this.PluginForm.get('ext_number').clearValidators();
      this.PluginForm.get('ext_number').updateValueAndValidity();
    }
  }
  disableEvent(){
    if(this.disable){
      this.readOnly = true;
    }
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.PluginForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  getactionValue(e){
    this.actionValueName = e.itemData.name;
  }


  submitPluginForm() {
    let action_type1 = this.PluginForm.get('action_type').value;
    if (action_type1 == '3') {
      let checkPrimaryPhone = this.PluginForm.get('phonee').value;
      let len = checkPrimaryPhone.length
      if (len < 10) {
        this.toastr.error('Error!', 'Invalid Phone Number', { timeOut: 2000 });
        return
      }
    }else{
      let check_action_value = this.PluginForm.get('action_value').value;
      if(check_action_value == ""){
        this.toastr.error('Error!', "Action Value can't be empty", { timeOut: 2000 });
       return
      }
    }

    let time = this.PluginForm.get('display_time').value;
    if(time > 60){
     this.toastr.error('Error!', 'Delay Time should be between 0 to 60', { timeOut: 2000 });
       return
    }
    let expandTime = this.PluginForm.get('expand_time').value;
    if(expandTime > 60){
     this.toastr.error('Error!', 'Expand Time should be between 0 to 60', { timeOut: 2000 });
       return
    }

    let is_action_name = this.PluginForm.get('add_action_name').value;
    let actionType = this.PluginForm.get('add_action_type').value;
    let name = this.PluginForm.get('action_name').value;
    let duplicate = 0;
    this.plugin_action_list.map(data =>{     
      if(data.name == name){
        duplicate++;
      }
    })
    if(duplicate != 0){
      this.toastr.error('Error!','Action Name Already Exists', { timeOut: 2000 });
      return;
    }
   
    if (is_action_name != "" && actionType == "") {
      if (actionType == "") {
        this.toastr.error('Error!', 'Action type cant be null', { timeOut: 2000 });
        return
      }
      if (actionType != '3') {
        let actionValue = this.PluginForm.get('add_action_value').value;
        if (actionValue == "") {
          this.toastr.error('Error!', 'Action value cant be null', { timeOut: 2000 });
          return
        }
      } else {
        let checkCountry = this.PluginForm.get('action_country').value;
        if (checkCountry == "") {
          this.toastr.error('Error!', 'Destination cant be null', { timeOut: 2000 });
          return
        }
        let checkPhone = this.PluginForm.get('phone2').value;
        let count = checkPhone.length;

        if (checkPhone.length < 10) {
          this.toastr.error('Error!', 'Invalid Phone Number', { timeOut: 2000 });
          return
        }
      }

    } else {
      if (!this.data.id) {
        let valueId = this.PluginForm.get('action_value').value;
        this.customer_id = localStorage.getItem('id');
        const credentials = this.PluginForm.value;        
        credentials['actionValId'] = valueId;

        credentials['destiantionList'] = this.destination_list;
        credentials['pluginAction'] = this.plugin_action_list;
        let auth = this.genRandonString(30);
        credentials['auth_token'] = auth;
        credentials['action_value'] = this.actionValueName;

        let destinationData  = this.destination_data.find(dest => dest.id == credentials.action_value);
        let checkActionName = this.PluginForm.get('add_action_name').value;
        let checkActionType = this.PluginForm.get('add_action_type').value;

        



        credentials['customer_id'] = this.customer_id;
        this.userservice.createPlugin(credentials).subscribe(data => {
          if (data['status_code'] == 200) {
            this.toastr.success('Success!', "Plugin Created Successfully!", { timeOut: 2000 });
            this.cancelForm();
          }else{
            this.toastr.error('Failed!', "Plugin Name Duplicate!", { timeOut: 2000 });
          }

        })
      } else {
        let valueId = this.PluginForm.get('action_value').value;
        let plugin_id = this.data.id;
        this.customer_id = localStorage.getItem('id');
        const credentials = this.PluginForm.value;
        credentials['destiantionList'] = this.destination_list
        credentials['pluginAction'] = this.plugin_action_list;
        credentials['customer_id'] = this.customer_id;
        credentials['plugin_id'] = plugin_id;
        credentials['actionValId'] = valueId;
        if(this.actionValueName != ""){
        credentials['action_value'] = this.actionValueName;
        }else{
          credentials['action_value'] = this.defaultValueName;
        }
        
        this.userservice.updatePlugin(credentials).subscribe(data => {
          if (data['status_code'] == 200) {
            this.toastr.success('Success!', "Plugin Updated Successfully!", { timeOut: 2000 });
            this.cancelForm();
          }else{            
            this.toastr.error('Failed!', "Plugin Name Duplicate!", { timeOut: 2000 });
          }

        })

      }

    }
  }

  cancelForm() {
    this.PluginForm.reset();
    this.userservice.updateGridList();
    this.dialogRefInfo.close();
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      let finalBtn3 = '';
      finalBtn += "<span>";
      if(this.destCheck){
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:none;  display: inline'  title='Delete'></i>";
      }else{
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer;  display: inline' data-action-type='delete_dest' title='Delete'></i>";
      }
      data[i]['action'] = finalBtn;
      
      finalBtn3 += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete_plug' title='Delete'></i>";
      data[i]['actionn'] = finalBtn3;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "delete_dest":
        return this.deleteDest(data, actionType);
      case "delete_plug":
        return this.deleteAction(data, actionType);
    }
  }

  deleteAction(data, event) {
    for (let i = 0; i < this.plugin_action_list.length; i++) {
      if (this.plugin_action_list[i]['id'] === data['id']) {
        this.plugin_action_list.splice(i, 1);
        this.userservice.displayAllRecord.subscribe(() => {
          this.manageUserActionBtn(this.plugin_action_list);
          this.displayAllRecord();
        });
      }
    }     
  }
  
  deleteDest(data, event) {
    for (let i = 0; i < this.destination_list.length; i++) {
      if (this.destination_list[i]['id'] === data['id']) {
        this.destination_list.splice(i, 1);
        if(this.destination_list.length == 1){
          this.destCheck = true;
        }
        this.userservice.displayAllRecord.subscribe(() => {
          this.manageUserActionBtn(this.destination_list);
          this.displayAllRecord();
        });
      }
    }
  }


  addDestination() {
    let duplicate = 0;
    let a = this.count++;
    this.destination = true;
    let dest = this.PluginForm.get('add_country').value;
    let selected_country = this.countryList.find(country => country.id === dest)
    dest = selected_country.name;

    let c_code = this.PluginForm.get('add_country').value;

    let code = this.PluginForm.get('add_country_code').value;
    let otp = this.PluginForm.get('OTP_verification').value;
    otp = otp ? otp : "false";

    this.destination_list.map(data =>{
      if(data.codes == code){
        duplicate++;
      }
    })
    if(duplicate != 0){
      this.toastr.error('Error!', "this destination already exists.", { timeOut: 2000 });
        return;
    }else{
      this.destination_list.push({ id: a, dest: dest, codes: code, otps: otp, c_code: c_code })
    let data = this.manageUserActionBtn(this.destination_list);

    if(this.destination_list.length == 1){
      this.destCheck = true;
    }else{
      this.destCheck = false;
    }

    this.userservice.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    }
  }

  addPluginAction() {
    let duplicate = 0;
    this.action = true;
    let action_n = this.PluginForm.get('add_action_name').value;
    let add_action_t = this.PluginForm.get('add_action_type').value;
    let add_action_v = this.PluginForm.get('add_action_value').value;
    var action_c =  this.PluginForm.get('action_country').value;
    var action_code =  this.PluginForm.get('action_country_code').value;
    var phn3 =  this.PluginForm.get('phone3').value;

    var action_country_c;
    if(add_action_t !== '3'){
      this.PluginForm.get('action_country_code').setValue('');
      this.PluginForm.get('phone3').setValue('');
    }

    let is_phone = this.PluginForm.get('phone3').value;

    let actionTitle = this.actionType.find(action => action.id == add_action_t);
    let destinationData = this.destination_data2.find(destinaiton => destinaiton.id == add_action_v)

    if (action_n != "") {
      if (add_action_t == "") {
        this.toastr.error('Error!', "Action Type can't be null", { timeOut: 2000 });
        return;
      }
    } else {
      this.toastr.error('Error!', "Action Name can't be bull", { timeOut: 2000 });
      return;
    }
    if (add_action_t != '3') {
      if (add_action_v == null || add_action_v == "" ) {
        this.toastr.error('Error!', "Action Value can't be null", { timeOut: 2000 });
        return;
      }
    }else{
      if(phn3 == null || phn3 == ""){
        this.toastr.error('Error!', "Invalid Phone Number", { timeOut: 2000 });
        return;
      }
    }
    if (add_action_t == "3") {
      if (is_phone.length < 10) {
        this.toastr.error('Error!', "Invalid Phone Number", { timeOut: 2000 });
        return;
      }
    }    

    let defaultName = this.PluginForm.get('action_name').value;
    if( action_n == defaultName){
      duplicate++;
    }
    this.plugin_action_list.map(data =>{    
      if(data.name == action_n){
        duplicate++;
      }
    })
    if(duplicate != 0){
      this.toastr.error('Error!', "Action name already exists.", { timeOut: 2000 });
      return;
    }else{

      this.plugin_action_list.push({ id: this.count++, name: action_n, action_type: add_action_t, action_value: add_action_t == '3' ? "" :destinationData['name'],action_value_id: add_action_v,country: add_action_t != '3' ? "" :action_code, country_code:  is_phone, action_label: actionTitle.label})
      this.userservice.displayAllRecord.subscribe(() => {
      this.manageUserActionBtn(this.plugin_action_list);
      this.displayAllRecord();
    });
    }
  }
}

@Component({
  selector: 'pluginlink-dialog',
  templateUrl: 'pluginlink-dialog.html',
})

export class pluginlinkdialog {

  linkAddress = "";
  token = "";
  text:any = "";
  name: any ="";
  color: any ="";
  lang: any ="";
  scriptURL: any ="";

  constructor(
    public dialogRefInfo: MatDialogRef<pluginlinkdialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private userservice: UserService,
  ) { }

  ngOnInit() {
   let cust_id = localStorage.getItem('id');
   let plug_id = this.data.id;
   let Credentials = {};
   Credentials['cust_id'] = cust_id;
   Credentials['id'] = plug_id;
    this.linkAddress = ""
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();

    this.userservice.getScriptURL().subscribe(datas=>{
      
      this.scriptURL = datas['response'][0].domain;
    })

    
    this.userservice.getPluginByID(Credentials).subscribe(data=>{
      let plugData = data[0];
      this.name = plugData.name;
      this.token = plugData.auth_token;
      this.color = plugData.plugin_color;
      this.lang = plugData.lang; 
    })
   this.text = document.getElementsByTagName('textarea');
  }

   copyText() {
          navigator.clipboard.writeText(this.text[0]['defaultValue']);
   }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

