









import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService, ExcelService, invalidPhone, countryError, Name_RegEx, Number_RegEx, Errors, invalidFileType, IP_RegEx,duplicateIP } from '../../../core';
import { Router, NavigationEnd } from '@angular/router';
import { ColDef } from '@ag-grid-community/all-modules';
import { SecurityService } from '../security.service';
import { IVRService } from '../../smart_ivr/ivr.service';
import { DidService } from '../../DID/did.service';
import { log } from 'console';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
@Component({
  selector: 'app-access-restriction',
  templateUrl: './access-restriction.component.html',
  styleUrls: ['./access-restriction.component.css']
})
export class AccessRestrictionComponent implements OnInit {
  filterForm: FormGroup;
  RowData: any;
  AgLoad: boolean;
  error = '';
  countryList = "";
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  rowData: any;
  companyData = "";
  exportData: any = {};
  defaultPageSize = '10';
  allCountryList = "";
  terminatecause: any = [];
  isShowLocation: boolean = false;
  contactCount: any = 0;
  customerId = '';
  extensionId = '';
  errors = "";
  cidrData = '';
  maskData = '';
  restrictionData = '';
  access_typeData = [];
  allow_ip_restrictionData = '';
  acl_descData = '';
  constructor(
    private SecurityService: SecurityService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public commonService: CommonService,
    private toastr: ToastrService,

  ) {
    this.filterForm = this.fb.group({
      'cidr': [""],
      'restriction_type': [""],
      'access_type': [""],
      'allow_ip_restriction': [""]
    });
  }
  get cidr() { return this.filterForm.get('cidr'); }
  get restriction_type() { return this.filterForm.get('restriction_type'); }
  get allow_ip_restriction() { return this.filterForm.get('allow_ip_restriction'); }
  get access_type() { return this.filterForm.get('access_type'); }
  get acl_desc() { return this.filterForm.get('acl_desc'); }
  access: any = [];
  Restriction = [
    { id: 0, name: "Select Restriction Type" },
    { id: 1, name: "ALL" },
    { id: 4, name: "PSTN" },
    { id: 3, name: "REGISTRATION" },
    { id: 2, name: "WEB" }
  ]
  onChangeRes_Type(event) {
    this.access = []
    if (event.value == 'ALL') {
      this.access.push('Customer Portal');
      this.access.push('Extension Portal');
      this.access.push('SIP Client');
    }
    if (event.value == 'WEB') {
      this.access.push('Customer Portal');
      this.access.push('Extension Portal');
    }
    if (event.value == 'REGISTRATION') {
      this.access.push('SIP Client');
    }
    if (event.value == 'PSTN') {
      this.access.push('SIP Client');
    }
  }

  ngOnInit() {
    this.SecurityService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
  }
  public displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'id', headerName: 'ID', hide: true, width: 50 },
      { field: 'cidr', headerName: 'IP', width: 150, hide: false },
      { field: 'mask_bit', headerName: 'Mask Bit', width: 200, hide: false },
      { field: 'allow_ip_restriction', headerName: 'Status', width: 200, hide: false },
      { field: 'restriction_type', headerName: 'Restriction Type', width: 150, hide: false },
      { field: 'access_type', headerName: 'Access Type', width: 250, hide: false },
      { field: 'acl_desc', headerName: 'Description', width: 270, hide: false }
    ];
    if (this.isFilter) {
      const credentials = this.filterForm.value;
      if(credentials.access_type == undefined) {
        credentials.access_type = null;
      }   
      credentials.cidr = Number(credentials.cidr);
      this.SecurityService.filterAccessList(credentials, Number(localStorage.getItem('id'))).subscribe(data => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      });
    }
    else {
      const user_id = localStorage.getItem("id");
      this.SecurityService.getAccessCategory(user_id).subscribe((data) => {
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      });
    }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";

      data[i]['action'] = finalBtn;
    }

    return data;
  }
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editAccessData(data);
      case "delete":
        return this.deleteAccessGroup(data);
    }
  }
  editAccessData(event) {    
    this.openDialog(event.id);        
  }
  deleteAccessGroup(event) {
    this.SecurityService.getAccessCategory(event.id).subscribe(data => {      
      if (data.accessGroup_count > 1) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'>Security Group  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.cidr + "</span> <span style='color:#FFFFFF;'> can't be deleted because it is associate with either DID Destination or IVR or call group .</span>",
          type: 'error',
          background: '#000000',
          timer: 5000
        });
      } else {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Are you sure?</span>',
          html: "<span style='color:#FFFFFF;'>You will not be able to recover Access Restriction  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.cidr + "</span> <span style='color:#FFFFFF;'> in future!</span>",
          type: 'warning',
          showCancelButton: true,
          background: '#000000',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          preConfirm: () => {
            this.SecurityService.deleteAccessGroup({ 'id': event.id }).subscribe(data => {
              this.displayAllRecord();
              if (data) {
                this.toastr.success('Successfully !', "Access Restriction Delete", { timeOut: 2000 });
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
          if (result.value) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Deleted!</span>',
              html: "<span style='color:#FFFFFF;'> Access Restriction </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.cidr + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
              type: 'success',
              background: '#000000',
              timer: 4000
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: '<span style="color:#FFFFFF;">Cancelled</span>',
              html: "<span style='color:#FFFFFF;'>Access Restriction </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.cidr + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
              type: 'error',
              background: '#000000',
              timer: 4000
            });
          }
        })
      }
    })
  }
  downloadPDF(): void {
    var doc = new jsPDF();
    var col = ["IP", "Restriction Type", "Access Type","Mask Bit"];
    var rows = [];    
    this.exportData.forEach(element => {
      const e11 = [element.cidr, element.restriction_type, element.access_type,element.mask_bit];
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
        4: { cellWidth: 'wrap' }
      },
    });
    doc.save('Security.pdf');
  }

  openDialog(id?): void {
    const dialogRef = this.dialog.open(InfoAccessDialog, {
      width: '60%', disableClose: true,

      data: {
        id: id ? id : null,
        customerId: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,

      }
    });
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
    const dialogRefInfo = this.dialog.open(InfoAccessDialog, {
      width: '60%', disableClose: true, autoFocus: false,
      data: {
        id: localStorage.getItem('type') == '1' ? localStorage.getItem('id') : 0,
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
  showInfoHelp() {
    const dialogRefInfo = this.dialog.open(InfoAccessHelpCodeDialog, {
      width: '80%', disableClose: true, autoFocus: false,
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
  selector: 'infoaccess-dialog',
  templateUrl: 'infoADDaccess-dialog.html',
})

export class InfoAccessDialog {
  maskArray:any;
  maskData:number;
  submitted = false;
  accessData: any = [{}];
  dataId: any;
  callqueueData: any = {};
  InfoAccessForm: any = {};
  is_extension: boolean = false;
  countryCode = "";
  error = '';
  dataSource: any = [];
  columnDefs: any;
  stickyExpire =[];
  AccessType:any = [];
  states = [""];
  country: any;
  customerId = '';
  showNotInsertedValue: any;
  cidrData = '';  // working
  restrictionData: any = ''; // working 
  access_typeData:any = []; //working
  allow_ip_restrictionData: any = '';  // working
  acl_descData = '';  // working
  accessArr: any = [];
  access: any = [];
  Restriction = [
    { id: 1, name: "ALL" },
    { id: 4, name: "PSTN" },
    { id: 3, name: "REGISTRATION" },
    { id: 2, name: "WEB" }
  ]
  createAccessRestriction: any;
  constructor(
    public dialogRefInfo: MatDialogRef<InfoAccessDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private ivrService: IVRService,
    private router: Router,
    private SecurityService: SecurityService,
    private didService: DidService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService) {
    this.InfoAccessForm = this.fb.group({
      'cidr': ['', [Validators.required, Validators.pattern(IP_RegEx), Validators.maxLength(40)]],
      'mask_bit': ['32',[Validators.required]],
      'restriction_type': ['', [Validators.required]],
      'access_type': ['', [Validators.required]],
      'allow_ip_restriction': [""],
      'acl_desc': ['']
    });
  }
  get cidr() { return this.InfoAccessForm.get('cidr'); }
  get restriction_type() { return this.InfoAccessForm.get('restriction_type'); }
  get allow_ip_restriction() { return this.InfoAccessForm.get('allow_ip_restriction'); }
  get access_type() { return this.InfoAccessForm.get('access_type'); }
  get acl_desc() { return this.InfoAccessForm.get('acl_desc'); }

  onChangeRes_Type(event) {
    this.access = []    
    if (event.value == 'ALL' || event == 'ALL') {            
      this.access.push('Customer Portal');
      this.access.push('Extension Portal');
      this.access.push('SIP Client');
      this.access_type.setValidators([Validators.required]);
      this.access_type.updateValueAndValidity();
      if(!event.value){
        this.InfoAccessForm.controls.access_type.setErrors(null);
      }
    }else{
      this.AccessType = [];
    }
    if (event.value == 'WEB' || event == 'WEB') {      
      this.access.push('Customer Portal');
      this.access.push('SIP Client');      
      this.access_type.setValidators([Validators.required]);
      this.access_type.updateValueAndValidity();
      if(!event.value){
        this.InfoAccessForm.controls.access_type.setErrors(null);
      }
    }else{
      this.AccessType = [];
    }
    if (event.value == 'REGISTRATION' || event == 'REGISTRATION') {
      this.access.push('Extension Portal');
      this.access_type.setValidators([Validators.required]);
      this.access_type.updateValueAndValidity();
      if(!event.value){
        this.InfoAccessForm.controls.access_type.setErrors(null);
      }
    }else{
      this.AccessType = [];
    }
    if (event.value == 'PSTN' || event == 'PSTN') {
      this.access.push('Extension Portal');
      this.access_type.setValidators([Validators.required]);
      this.access_type.updateValueAndValidity();
      if(!event.value){   
        this.InfoAccessForm.controls.access_type.setErrors(null);
      }
    }else{
      this.AccessType = [];
    }
  }
  public getAccessArray(e) {    
    let selectedExt = [] = e.value;
    let FormArray = <FormArray>this.InfoAccessForm.controls.access_type;
    FormArray.controls.forEach((element) => {
      let FormControl = element.get('accesses') as FormArray;
      selectedExt.forEach(element => {
        FormControl.push(
          this.fb.group({
            accessArr: element
          })
        );
      });        
    });
  }
 
  ngOnInit() {
    this.maskArray = [
      {value: '32', id: 32 }, { id: 31 }, { id: 30 }, { id: 29 }, { id: 28 }, { id: 27 }, { id: 26 }, { id: 25 }, { id: 24 }, { id: 23 }, { id: 22 }, { id: 21 }, { id: 20 }, { id: 19 }, { id: 18 }
    ]
    this.maskData=32;
    let i=32;
    for(i=32;i>=18;i--){
      this.stickyExpire.push({'id' : ""+i+"", 'date': i});
    }
    let val = this.InfoAccessForm.get('mask_bit').value;
    if (this.data) {
      const user_id = localStorage.getItem("id");
      this.SecurityService.viewAccessGroupById(this.data).subscribe(data => {         
        this.accessData = data;
       this.onChangeRes_Type(data.restriction_type)
        this.access_typeData=data.access_type;
        let abc= this.access_typeData.split(',');
        abc.map(item => this.AccessType.push(item))
        this.cidrData = this.accessData.cidr; //for ip 
        this.maskData = this.accessData.mask_bit; //for mask bit        
        this.restrictionData = this.accessData.restriction_type; //for restriction type
        if (this.accessData.allow_ip_restriction == 'N') {
          this.allow_ip_restrictionData = false
        } else {
          this.allow_ip_restrictionData = true;
        }
        this.acl_descData = this.accessData.acl_desc
      }, err => {
        this.error = err.message;
      });

    }
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
    this.showNotInsertedValue = false;
  }  

  submitAccessForm() {
    if (this.InfoAccessForm.valid) {
      this.submitted = true;   
      const credentials = this.InfoAccessForm.value;
      if (!this.data.id) {
        let user_id = localStorage.getItem('id');                
        credentials.user_id = user_id;        
        this.SecurityService.ValidateIP(credentials).subscribe(data=>{
          if(data['response'] == "" ){
        this.SecurityService.createAccessRestriction(credentials).subscribe(data => {
          if (data) {
            this.toastr.success('Successfully!', "Access Restriction Created", { timeOut: 2000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        });
      }
      else{
         this.toastr.error('Error!', duplicateIP, { timeOut: 2000 });
        return;  
      }
    })
        
      }
      else if (this.data.id)  {
        const credentials = this.InfoAccessForm.value;
        let user_id = localStorage.getItem('id');        
        credentials.user_id = user_id;        
        credentials.id = this.data.id;        
        this.SecurityService.ValidateIP(credentials).subscribe(data=>{                              
          if(data['response']==""){            
          this.SecurityService.updateAccessGroup(credentials).subscribe(data => {
          if (data) {
            this.toastr.success('Successfully!', "Access Restriction Updated", { timeOut: 2000 });
            this.cancelForm();
          }
          else {
            this.toastr.error('Error!', data['message'], { timeOut: 2000 });
          }
        })
      }
      else{
         this.toastr.error('Error!', duplicateIP, { timeOut: 2000 });
        return;  
      }
    })
      }
    }            
  }
  cancelForm() {    
    this.InfoAccessForm.reset();
    this.SecurityService.updateGridList();
    this.dialogRefInfo.close();
  }
}
@Component({
  selector: 'infoAccessHelpCode-dialog',
  templateUrl: 'infoAccessHelpCode-dialog.html',
})

export class InfoAccessHelpCodeDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoAccessHelpCodeDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
  ) { }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      document.getElementsByTagName("app-website-nav")[0].scrollIntoView();
    });
  }

  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}
function onChangeActiveFeature() {
  throw new Error('Function not implemented.');
}