import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Errors, CommonService, ExcelService, invalidForm, Number_RegEx, ExtensionService, minTime, closeTime  } from '../../../core';
import { ToastrService } from 'ngx-toastr';
import { PromptsService } from '../../prompts/prompts.service';
import { DidService } from '../../DID/did.service';
import { AppointmentService } from '../appointment.service';
import { IVRService } from '../../smart_ivr/ivr.service';
import { ContactListService } from '../../contact-list/contact-list.service';
import { Item } from '@syncfusion/ej2-angular-splitbuttons';
declare const ExcelJS: any;
@Component({
  selector: 'app-appointment-ivr',
  templateUrl: './appointment-ivr.component.html',
  styleUrls: ['./appointment-ivr.component.css']
})
export class AppointmentIvrComponent implements OnInit {
  filterForm: FormGroup;
  defaultPageSize:any='10';
  packageData = '';
  error = '';
  userType = '';
  html = '';
  data = '';
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  errorField = '';
  exportData: any = {};
  constructor(    
    private router: Router,
    private fb: FormBuilder,
    public commonService: CommonService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    private appointmentService: AppointmentService,
    private ivrService: IVRService,
    private extensionService : ExtensionService
  ){
    this.filterForm = this.fb.group({
      'by_name': [""]
    });
  }

  ngOnInit() {

    this.appointmentService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 10 },
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'name', headerName: 'Name', hide: false, width: 20 },      
      { field: 'welcomePrompt', headerName: 'Welcome Prompt', hide: false, width: 15 },
      { field: 'digit_timeout', headerName: 'Digit Timeout', hide: false, width: 15 },
      { field: 'max_timeout_count', headerName: 'Max Timeout Try', hide: false, width: 15 },
      {field:'open_time',headerName:'Open Time',hide:false,width:15},
      {field:'close_time',headerName:'Close Time', hide:false,width:15},
      {field:'time_break_start',headerName:'Time Break ',hide:false,width:15},
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.user_id = Number(localStorage.getItem('id'));
      this.appointmentService.filterAppointmentIVR(credentials).subscribe(data => {
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    } else {
      this.appointmentService.getAppointmentIVR({customer_id: localStorage.getItem('id') }).subscribe(data => {
        data = this.manageUserActionBtn(data)
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      }, err => {
        this.error = err.message;
      });
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editData(data);
      case "delete":
        return this.deleteData(data);
    }
  }

  editData(event) {
    this.openDialog(event);
   }

  deleteData(event) {
    this.ivrService.getIVRCount(event.id,localStorage.getItem('id')).subscribe(data => {
      if (data.count > 0) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'>Appointment <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'> can't be deleted because it is "+ data['message'],
          type: 'error',
          background: '#000000',
          timer: 5000
        });
      } else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html : "<span style='color:#FFFFFF;'>You will not be able to recover appointment </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'>  in future!</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.appointmentService.deleteAppointmentIVR({ id: event.id }).subscribe(data => {
              if (data['code'] == 400) {
                Swal.fire(
                  {
                    type: 'error',
                    title: '<span style="color:#FFFFFF;">Oopss...</span>',
                    text: data['message'],
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#000000'
                  })
                return;
              } else {
                this.displayAllRecord();
              }
            });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result.value) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Deleted!</span>',
              html : "<span style='color:#FFFFFF;'>Appointment <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'>  has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 3000
            });

          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html : "<span style='color:#FFFFFF;'>Appointment <span style ='color:red; font-weight :bold; font-size: 1.2em'>"+event.name+"</span> <span style='color:#FFFFFF;'>  is safe.</span>",
              type: 'error',
              background: '#000000',
              timer: 3000
            });
          }
        })
      }
    })
}

openDialog(event?): void {
  const dialogRef = this.dialog.open(AppointmentAddIvrDialog, { width: '60%', disableClose: true, data: { id: event ? event.id : null, obj : event ? event : '' } });
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
    const dialogRefInfo = this.dialog.open(InfoAppointmentIVRDialog, {
      width: '60%', disableClose: true, autoFocus: false,
      data: {
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
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
  selector: 'appointment-ivr-dialog',
  templateUrl: 'add-appointment-ivr-dialog.html',
})

export class AppointmentAddIvrDialog implements OnInit {
  errors: Errors = { errors: {} };
  basicIVRForm: FormGroup;
  submitted = false;
  errorField = "";
  selectedIVRValue = [];
  filterPrompt:any;
  PromptFilter:any;
  filterInvalid:any;
  InvalidFilter:any;
  filterTime:any;
  TimeFilter:any;
  welcomePrompt = 0;
  sourceAgent: any[] = [];
  contactList: any[] = [];
  groupList: any[] = [];
  Allpstn: any[] = [];
  pstnList: any[] = [];
  isShowExtension: boolean = false;
  isShowPSTN: boolean = false;

  public placeholder: string = 'Select Extension';
  public placeholder2: string = 'Select Contact';
  public placeholder1: string = 'Welcome Prompt *';
  public placeholder4: string = 'Invalid Prompt *';
  public placeholder5: string = 'Timeout Prompt *';
  public popupHeight: string = '200px';   
  public popupWidth: string = '250px'; 
  public fields: Object = { text: 'agent', value: 'id' };
  public fields1: Object = { text: 'prompt_name', value: 'id' };
  public mode ;
  public selectAllText: string
  isOutbound: any;
  isMinutePlan: any;
  Open_time:any;
  Close_time:any;
  Time_break_start:any
   endTimeValue: any;

  constructor(
    public dialogRef: MatDialogRef<AppointmentAddIvrDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    //private ivrService: IVRService,
    public commonService: CommonService,
    private promptsService: PromptsService,
    private appointmentService: AppointmentService,
    private extensionService: ExtensionService,
    private contactListService: ContactListService,
  ) {
    this.Open_time = new Date();
    this.Close_time = new Date();
    this.Time_break_start=new Date();
    this.basicIVRForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'welcome_prompt': ['', [Validators.required]],
     // 'repeat_prompt': [''],
      'invalid_prompt': ['',[Validators.required]],
      'timeout_prompt': ['',[Validators.required]],
      'digit_timeout': ['10', [Validators.required, Validators.maxLength(2), Validators.max(60), Validators.min(1)]],
      'inter_digit_timeout': ['10', [Validators.required, Validators.maxLength(2), Validators.max(60), Validators.min(1)]],
      'max_timeout_try': ['3', [Validators.required, Validators.maxLength(1), Validators.max(3), Validators.min(1)]],
      'max_invalid_try': ['3', [Validators.required, Validators.maxLength(1), Validators.max(3), Validators.min(1)]],
      'time_interval' : ['15',[Validators.required]],
      'open_time':['',[Validators.required]],
      'close_time':['',[Validators.required]],
     'time_break_start':['',[Validators.required]],
      // 'time-break_end':[""],
      'is_extension': [''],
      'is_pstn': [''],
      'extension': [''],
      'pstn': [''],
      'group': [''],
    });
  }

  get extension() { return this.basicIVRForm.get('extension'); }
  get pstn() { return this.basicIVRForm.get('pstn'); }
  get group() { return this.basicIVRForm.get('group'); }

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    this.Open_time = this.Open_time.getHours() + ':' + (this.Open_time.getMinutes());
    this. Close_time= this.Close_time.getHours() + ':' + (this.Close_time.getMinutes());
    this.Time_break_start = this.Time_break_start.getHours() + ':' + (this.Time_break_start.getMinutes());

    // this.time_break_end = this.time_break_end.getHours() + ':' + (this.time_break_end.getMinutes());
    let user_id = localStorage.getItem("id");
    let product_id = localStorage.getItem("product_id");
     this.mode = 'CheckBox';
    this.selectAllText= 'Select All';
    //showing moh and recording
    this.commonService.getCustomerProductFeatures(localStorage.getItem('id')).subscribe(data => {
      this.welcomePrompt = data.response[0].custom_prompt == '1' ? 1 : 0;
    }, err => {
      this.errors = err.message;
    });

    this.promptsService.getIVRPrompt(localStorage.getItem('id')).subscribe(data => {
      this.selectedIVRValue = data.response;
      this.selectedIVRValue.unshift({prompt_name:'default' ,id: 0})
      this.filterPrompt = this.PromptFilter = this.selectedIVRValue.slice();
      this.filterInvalid = this.InvalidFilter =this.selectedIVRValue.slice();
      this.filterTime = this.TimeFilter = this.selectedIVRValue.slice();


    }, err => {
      this.errors = err.message;
    });

     //add SIP(Extn)
     this.extensionService.getMyExtension(localStorage.getItem('id')).subscribe(data => {
      for (let i = 0; i < data.response.length; i++) {
        this.sourceAgent.push({ id: data.response[i].id, agent: data.response[i].ext_number + '-' + data.response[i].caller_id_name });
      }
    }, err => {
      this.errors = err.message;
    });

    //ADD User(PSTN)
    this.contactListService.getContactList({ id: null, phonenumber1: null, phonenumber2: null, 'customer_id': Number(localStorage.getItem('id')), 'extension_id': 0, 'role': Number(localStorage.getItem('type')) }).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.contactList.push({ id: data[i].id, name: data[i].name, agent: data[i].name + ' - ' + data[i].phoneNumber1Display });
      }
    }, err => {
      this.errors = err.message;
    });

    //Add group
    let customerId = localStorage.getItem('id');
    this.contactListService.getContactGroups(customerId).subscribe(data => {
      for(let i=0; i<data.length; i++ ){        
        if(data[i]['contact_id'] != null){     
          this.Allpstn.push({ id: data[i].id, name: data[i].name, agent: data[i].name});          
        }        
      }
      // for (let i = 0; i < data.length; i++) {
      //   this.Allpstn.push({ id: data[i].id, name: data[i].name, agent: data[i].name});
        if (this.data.id) {
          this.setAppointmentValue(this.data.obj);
            let data = this.data;
            // this.callqueueData = data[0];
            // this.callqueueData.welcome_prompt = this.callqueueData.welcome_prompt == 0 ? '0' : this.callqueueData.welcome_prompt;
            // this.callqueueData.is_caller_id = this.callqueueData.is_caller_id ? Number(this.callqueueData.is_caller_id) : 0;
            let groupIds = data['obj'].group_ids ? (data['obj'].group_ids).split(",") : [];
            let groupListData = [];
            groupIds.forEach((element, j) => {
              groupListData.push(Number(element));
            });
           
    
            if (data['obj'].is_extension == '1') {
              this.basicIVRForm.get('is_extension').setValue(true);
              this.isShowExtension = true;
            } else {
              // this.callqueueData.is_extension = false;
              this.basicIVRForm.get('is_extension').setValue(false);
            }
            if (data['obj'].is_pstn == '1') {
              // this.callqueueData.is_pstn = true;
              this.basicIVRForm.get('is_pstn').setValue(true);
              this.isShowPSTN = true;
            } else {
              // this.callqueueData.is_pstn = false;
              this.basicIVRForm.get('is_pstn').setValue(false);
            }
            // contacts data
            let usersId = (data['obj'].ref_id).split(",");
            let usersType = (data['obj'].ref_type).split(",");
            let extensionList = [];
            let pstnList = [];
            setTimeout(() => {
              usersId.forEach((element1, i) => {
                usersType.forEach((element2, j) => {
                  if (i === j) {
                    if (element2 == 'E') {
                      extensionList.push(Number(element1));
                    } else if (element2 == 'P') {
                      pstnList.push(Number(element1));
                    } else {
                      // usersList.push(element1);
                    }
                  }
                });
              });
              // this.callqueueData.extension = extensionList ? extensionList : '';
              this.basicIVRForm.get('extension').setValue(extensionList);
              // this.callqueueData.pstn = pstnList ? pstnList : '';
              this.pstnList = pstnList ? pstnList : [];
              // this.callqueueData.group = groupListData; 
              this.basicIVRForm.get('group').setValue(groupListData);
            }, 200);
          // }, err => {
          //   this.errors = err;
          // });
        }

      // }
    }); 

    if (this.data.id) {
     this.setAppointmentValue(this.data.obj);
    }else{
      this.promptsService.getIVRPrompt(localStorage.getItem('id')).subscribe(data => {
        this.selectedIVRValue = data.response;
      this.selectedIVRValue.unshift({prompt_name:'default' ,id: 0})

      this.filterPrompt = this.PromptFilter =this.selectedIVRValue.slice();
      this.filterInvalid = this.InvalidFilter = this.selectedIVRValue.slice();
      this.filterTime = this.TimeFilter = this.selectedIVRValue.slice();




        // this. Open_time = data[0].open_time;
        // if(this.selectedIVRValue.length > 0) this.basicIVRForm.get('welcome_prompt').setValue(this.selectedIVRValue[0]['id']) ;
        if(this.selectedIVRValue.length > 0) this.basicIVRForm.get('invalid_prompt').setValue(this.selectedIVRValue[0]['id']) ;
        if(this.selectedIVRValue.length > 0) this.basicIVRForm.get('timeout_prompt').setValue(this.selectedIVRValue[0]['id']) ;
      this.filterPrompt = this.PromptFilter = this.selectedIVRValue.slice();
      this.filterInvalid = this.InvalidFilter = this.selectedIVRValue.slice();
      this.filterTime = this.TimeFilter = this.selectedIVRValue.slice();



      }, err => {
        this.errors = err.message;
      });
    }

    this.extensionService.getMyExtensionLimit( user_id,localStorage.getItem('type')).subscribe(item=>{
      this.isOutbound = item.ext.outbound_call;
      this.isMinutePlan = item.ext.mapped;
    })
    
    // this.packageService.getPackageInfoById( product_id,localStorage.getItem('type')).subscribe(item=>{
    //   this.isMinutePlan = item.ext.minute_plan;
    // })
  }
  groupremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.Allpstn.filter((data) =>{    
      return data['agent'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  extensionremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.sourceAgent.filter((data) =>{    
      return data['agent'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  Countryremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.selectedIVRValue.filter((data) =>{    
      return data['prompt_name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }

  get name() { return this.basicIVRForm.get('name'); }
  get digit_timeout() { return this.basicIVRForm.get('digit_timeout'); }
  get inter_digit_timeout() { return this.basicIVRForm.get('inter_digit_timeout'); }
  get max_timeout_try() { return this.basicIVRForm.get('max_timeout_try'); }
  get max_invalid_try() { return this.basicIVRForm.get('max_invalid_try'); }
  get open_time(){return this.basicIVRForm.get('open_time');}
  get close_time(){return this.basicIVRForm.get('close_time');}
  get time_break_start(){return this.basicIVRForm.get('time_break_start');}

  public findInvalidControls() {
    const invalid = [];
    const controls = this.basicIVRForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitbasicIVRForm() {    
    var credentials= this.basicIVRForm.value;
    if (credentials.open_time>= credentials.close_time) {
      this.toastr.error('Error!',closeTime, { timeOut: 2000 });
      return;
    }
     const filteredArr = this.pstnList.reduce((acc, current) => {
      const x = acc.find(item => item === current);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }

    }, []);    
    this.basicIVRForm.get('pstn').setValue(filteredArr);
    let isPSTN = this.basicIVRForm.get('group').value ? (this.basicIVRForm.get('group').value).length > 0 ? true : false : false;
    let isExtn = this.basicIVRForm.get('extension').value ? (this.basicIVRForm.get('extension').value).length > 0 ? true : false : false;    
    if (!isPSTN && !isExtn) {
      this.toastr.error('Error!', 'Please select at least one Consultant', { timeOut: 2000 });
      return;
    }
    if(this.basicIVRForm.value.is_pstn == true && this.basicIVRForm.value.pstn == ""){      
      this.toastr.error('Error!', `Pstn can't be null`, { timeOut: 2000 });      
      return;
    }  
    if(this.basicIVRForm.value.is_extension == true && this.basicIVRForm.value.extension == ""){      
      this.toastr.error('Error!', `Sip can't be null`, { timeOut: 2000 });      
      return;
    }   

    if (this.basicIVRForm.valid) {
      this.submitted = true;
      const credentials = this.basicIVRForm.value;
      if(this.data.id){
        credentials.id = this.data.id ? this.data.id : null;
        credentials['customer_id'] = localStorage.getItem('id');
        credentials.welcome_prompt = Number(credentials.welcome_prompt)
        credentials.invalid_prompt = Number(credentials.invalid_prompt)
        credentials.timeout_prompt = Number(credentials.timeout_prompt)
        credentials.digit_timeout = Number(credentials.digit_timeout)
        credentials.inter_digit_timeout = Number(credentials.inter_digit_timeout)
        credentials.max_timeout_try = Number(credentials.max_timeout_try)
        credentials.max_invalid_try = Number(credentials.max_invalid_try)
        credentials.time_interval = Number(credentials.time_interval)
        credentials.customer_id = Number(credentials.customer_id)
        this.appointmentService.updateAppointmentIVR(credentials).subscribe(data => {
          if (data) {
            this.toastr.success('Success!', "Appointment updated successfully", { timeOut: 2000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
      }
      else{
        credentials['customer_id'] = localStorage.getItem('id');
        credentials.welcome_prompt = Number(credentials.welcome_prompt)
        credentials.invalid_prompt = Number(credentials.invalid_prompt)
        credentials.timeout_prompt = Number(credentials.timeout_prompt)
        credentials.digit_timeout = Number(credentials.digit_timeout)
        credentials.inter_digit_timeout = Number(credentials.inter_digit_timeout)
        credentials.max_timeout_try = Number(credentials.max_timeout_try)
        credentials.max_invalid_try = Number(credentials.max_invalid_try)
        credentials.time_interval = Number(credentials.time_interval)
        credentials.customer_id = Number(credentials.customer_id)
        this.appointmentService.createAppointmentIVR(credentials).subscribe(data => {
          if (data) {
            this.toastr.success('Success!', data['message'], { timeOut: 2000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['error'], { timeOut: 2000 });
          }
        });
      }
    }
  }
  onTimeSelect(e) {
    var initialDate = e;
    var theAdd = new Date(1900, 0, 1, initialDate.split(":")[0], initialDate.split(":")[1]);
    theAdd.setMinutes(theAdd.getMinutes() + 300);
    let setFinTime = theAdd.getHours() + ":" + theAdd.getMinutes();
    this.endTimeValue = setFinTime;
  }


  cancelForm() {
    this.basicIVRForm.reset();
    this.appointmentService.updateGridList();
    this.dialogRef.close();
  }

  public setAppointmentValue(obj){
    this.basicIVRForm.patchValue(obj);
    this.basicIVRForm.get('max_invalid_try').setValue(obj.max_invalid_count);
    this.basicIVRForm.get('max_timeout_try').setValue(obj.max_timeout_count);
    // this.basicIVRForm.get('invalid_prompt').setValue(obj.invalid_prompt.toString());
    // this.basicIVRForm.get('timeout_prompt').setValue(obj.timeout_prompt.toString());
    this.basicIVRForm.updateValueAndValidity();
  }

  

  // getPackageByProduct(data) {
    
  //   if (data.source.value == 1 && data.checked) {
  //     this.isShowExtension = true;
  //     this.basicIVRForm.get('extension').setValidators(Validators.required);
  //     // this.basicIVRForm.get('is_pstn').setValue(false);
  //     this.isShowPSTN = true;
  //     this.basicIVRForm.get('pstn').clearValidators();
  //     this.basicIVRForm.get('pstn').setValue([]);
  //     this.basicIVRForm.get('pstn').updateValueAndValidity();
  //     this.basicIVRForm.get('group').clearValidators();
  //     this.basicIVRForm.get('group').setValue([]);
  //     this.basicIVRForm.get('group').updateValueAndValidity();
  //   } else if (data.source.value == 1 && !data.checked) {
  //     this.isShowExtension = true;
  //     this.basicIVRForm.get('extension').clearValidators();
  //     this.basicIVRForm.get('extension').setValue([]);
  //     this.basicIVRForm.get('extension').updateValueAndValidity();
  //   }
  //   else if (data.source.value == 2 && data.checked) {
  //     this.isShowPSTN = true;
  //     this.basicIVRForm.get('group').setValidators(Validators.required);
  //     // this.basicIVRForm.get('is_extension').setValue(false);
  //     this.isShowExtension = true;
  //     this.basicIVRForm.get('extension').clearValidators();
  //     this.basicIVRForm.get('extension').setValue([]);
  //     this.basicIVRForm.get('extension').updateValueAndValidity();
  //   } else if (data.source.value == 2 && !data.checked) {
  //     this.isShowPSTN = true;
  //     this.basicIVRForm.get('pstn').clearValidators();
  //     this.basicIVRForm.get('pstn').setValue([]);
  //     this.basicIVRForm.get('pstn').updateValueAndValidity();
  //     this.basicIVRForm.get('group').clearValidators();
  //     this.basicIVRForm.get('group').setValue([]);
  //     this.basicIVRForm.get('group').updateValueAndValidity();
  //   }
  // }

  getPackageByProductSIP(data){
    if (data.source.value == 1 && data.checked) {
      this.isShowExtension = true;
      this.basicIVRForm.get('extension').setValidators(Validators.required);
      //  this.basicIVRForm.get('is_pstn').setValue(false);
      this.basicIVRForm.get('pstn').clearValidators();
      // this.basicIVRForm.get('pstn').setValue([]);
      this.basicIVRForm.get('pstn').updateValueAndValidity();
      this.basicIVRForm.get('group').clearValidators();
      // this.basicIVRForm.get('group').setValue([]);
      this.basicIVRForm.get('group').updateValueAndValidity();
  }else if (data.source.value == 1 && !data.checked) {
         this.isShowExtension = false;
        //  this.isShowPSTN=false;
         this.basicIVRForm.get('extension').clearValidators();
         this.basicIVRForm.get('extension').setValue([]);
         this.basicIVRForm.get('extension').updateValueAndValidity();
}
  }

  
getPackageByProductPSTN(data){
if(this.isOutbound == 0 && this.isMinutePlan == 0) {
   this.isShowPSTN = false;
   this.basicIVRForm.get('is_pstn').setValue(false);
} else if(data.source.value == 2 && data.checked) {
    this.isShowPSTN = true;
    this.basicIVRForm.get('group').setValidators(Validators.required);
    //  this.basicIVRForm.get('is_extension').setValue(false);
    this.basicIVRForm.get('extension').clearValidators();
    // this.basicIVRForm.get('extension').setValue([]);
    this.basicIVRForm.get('extension').updateValueAndValidity();
  } else if (data.source.value == 2 && !data.checked) {
    this.isShowPSTN = false;
    // this.isShowExtension= false;
    this.basicIVRForm.get('group').clearValidators(); 
    // this.basicIVRForm.get('pstn').setValue([]);
    //change group to pstn
    this.basicIVRForm.get('pstn').clearValidators();
    this.basicIVRForm.get('group').setValue([]);
    this.basicIVRForm.get('group').updateValueAndValidity();

    // this.basicIVRForm.get('group').updateValueAndValidity();
}
}


  public selectGroup(data, itemSelect){
    let gId = data['itemData'].id;
       this.contactListService.getAllContactInGroup(gId).subscribe(data => {
         if(data && itemSelect){
           data.forEach(element => {
             this.pstnList.push(element.contact_id);
           });
         }else if(data && !itemSelect){
           data.forEach(element => {
             const index = this.pstnList.indexOf(element.contact_id);
             if(index != -1){
               this.pstnList.splice(index,1);
             }
           });
         }
       }, err => {
         this.errors = err.message;
       });
 }
}

@Component({
  selector: 'infoAppointment-dialog',
  templateUrl: 'infoAppointment-dialog.html',
})

export class InfoAppointmentIVRDialog {
  constructor(
    public dialogRefInfo: MatDialogRef<InfoAppointmentIVRDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    const element = document.querySelector('#scrollId');
    element.scrollIntoView();
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
