import { Component, OnInit, Inject } from '@angular/core';
import { RestrictionService } from '../restriction.service';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IVRService } from '../../smart_ivr/ivr.service';
import { DidService } from '../../DID/did.service';
import { UserService } from '../../user/user.service';
import { UserTypeConstants } from 'src/app/core/constants';
import { ToastrService } from 'ngx-toastr';
import { SecurityService } from '../../security/security.service';
import Swal from 'sweetalert2';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CommonService, ExcelService, invalidPhone, countryError, Name_RegEx, Number_RegEx, Errors, invalidFileType, IP_RegEx, duplicateIP, PagedData } from '../../../core';
export var productId = '1';
export var userId = '';
export var count = false;

@Component({
  selector: 'app-view-access-restriction',
  templateUrl: './view-access-restriction.component.html',
  styleUrls: ['./view-access-restriction.component.css']
})
export class ViewAccessRestrictionComponent implements OnInit {

  columnDefs: any;
  filterForm: FormGroup;
  RowData: any;
  AgLoad: boolean;
  error = '';
  countryList = "";
  isFilter = false;
  dataSource: any = [];
  rowData: any;
  exportData: any = {};
  defaultPageSize = '10';
  allCountryList = "";
  terminatecause: any = [];
  isShowLocation: boolean = false;
  contactCount: any = 0;
  customerId = '';
  extensionId = '';
  allCustomer: any;
  filterProducthtml:any;
  ProducthtmlFilter:any;
  filter:any;
  errors = "";
  a = '';
  //for patch the data
  cidrData = '';
  maskData = '';
  restrictionData = '';
  companyData = '';
  access_typeData = [];
  allow_ip_restrictionData = '';
  acl_descData = '';
  userRole = false;
  showSearching = false;
  companyList: any[] = [];
  droplist: any[] = [];
  droplistone: any[] =[];
  filterProduct: any;
  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';
  public fields1: Object = { text: 'name', value: 'company_name' };
  public fields: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';
  public popupWidth2: string = '100%';
  public companyInSelectedFilter: any;
  customer_id: any;
  flag: boolean = false;
  ckecked: boolean = false
  companyArray: any;
  menus: any;
  AccessMenu: any;
  obj = {};

  constructor(
    private RestrictionService: RestrictionService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public commonService: CommonService,
    private toastr: ToastrService,
    public userService: UserService,
    public securityService: SecurityService
  ) {
    this.filterForm = this.fb.group({
      'cidr': [""],
      'restriction_type': [""],
      'access_type': [""],
      'allow_ip_restriction': [""],
      'company': [""],
    });

    
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.AccessMenu = this.menus.find((o) => o.url === '/access-restriction/');
  }
  get cidr() { return this.filterForm.get('cidr'); }
  get restriction_type() { return this.filterForm.get('restriction_type'); }
  get allow_ip_restriction() { return this.filterForm.get('allow_ip_restriction'); }
  get access_type() { return this.filterForm.get('access_type'); }
  get acl_desc() { return this.filterForm.get('acl_desc'); }
  access: any = [];
  Restriction = [
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
    if ((event.value == 'REGISTRATION') || (event.value == 'PSTN')) {
      this.access.push('SIP Client');
    }
  }


  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
    userId = '';
    this.RestrictionService.displayAllRecord.subscribe(() => {
      this.displayAllRecord();
    });
    let userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    this.userRole = localStorage.getItem('type') == '0' || localStorage.getItem('type') == '2' ? true : localStorage.getItem('type') == '4' ? true : false;
    if (userType == UserTypeConstants.ADMIN) {
      this.userService.getCustomerCompany(productId).subscribe(datas => {
        this.flag = false
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          // this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')',  });
          this.companyList.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
          this.droplist.push({ id: data[i].id, name: data[i].company_name });
          this.filterProducthtml = this.ProducthtmlFilter = this.droplist.slice();
        }
      }, err => {
        this.error = err.message;
      });
    } else if (userType == UserTypeConstants.ACCOUNT_MANAGER) {
      this.userService.getAccountManagerCustomercompany(localStorage.getItem('id')).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')' });
        }
      }, err => {
        this.error = err.message;
      });
    }
    else   if (userType == '3') {
      this.userService.getCustomerCompanyReseller(id,productId).subscribe(datas => {
        this.flag = false
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          // this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')',  });
          this.companyList.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')', id: data[i].id });
          this.droplist.push({ id: data[i].id, name: data[i].company_name });
          this.filterProducthtml = this.ProducthtmlFilter = this.droplist.slice();
        }
      }, err => {
        this.error = err.message;
      });
    }
    
    
    

  }
  
  companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
  ngOnDestroy(){
    localStorage.removeItem('extension_selected_Comapany')
  }


  public displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'id', headerName: 'ID', hide: true, width: 50 },
      { field: 'cidr', headerName: 'IP', width: 150, hide: false },
      { field: 'mask_bit', headerName: 'Mask Bit', width: 120, hide: false },
      { field: 'allow_ip_restriction', headerName: 'Status', width: 200, hide: false },
      { field: 'restriction_type', headerName: 'Restriction Type', width: 150, hide: false },
      { field: 'access_type', headerName: 'Access Type', width: 250, hide: false },
      { field: 'acl_desc', headerName: 'Description', width: 200, hide: true },
      { field: 'company', headerName: 'Company', width: 362, hide: false }
    ];

    if (this.isFilter) {
      let role = Number(localStorage.getItem('type'));
      let ResellerID = Number(localStorage.getItem('id'));
      const credentials = this.filterForm.value;
      credentials.user_id = userId;                        
      this.RestrictionService.getViewAccessFilter(credentials,role,ResellerID).subscribe(pagedData => {
        this.isFilter = false;
        this.flag = true
        // localStorage.setItem('filter_company',)        
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      }, err => {
        this.error = err.message;
      });
    } else {
      let role = localStorage.getItem('type');
      let ResellerID = localStorage.getItem('id');
      if(count == true){
        userId = localStorage.getItem('extension_selected_Comapany')
        count = false;
      }
      this.RestrictionService.viewAccessRestriction({userId,role,ResellerID}).subscribe(pagedData => {    
        userId = '';
        this.exportData = pagedData;
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }
  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";

      
      if(this.AccessMenu.all_permission == '0' && this.AccessMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if(this.AccessMenu.modify_permission == '1'){

        finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
        finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
 
      }
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
    count = true;
  }
  deleteAccessGroup(event) {
    this.RestrictionService.viewAccessRestriction(event.id).subscribe(data => {
      count = true;
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
            this.RestrictionService.deleteviewAccessGroup({ 'id': event.id }).subscribe(data => {
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
    var col = ["IP", "Restriction Type", "Access Type", "Mask Bit"];
    var rows = [];
    this.exportData.forEach(element => {
      const e11 = [element.cidr, element.restriction_type, element.access_type, element.mask_bit];
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
    const dialogRef = this.dialog.open(AddRestrictionDialog, {
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
    count = true;
    this.isFilter = false;
    this.displayAllRecord();
  }
  closeCompanyDiv(event){    
    // if(this.selectCompanyDiv == null){
    this.selectCompanyDiv(this.obj,false);  
    // }    
  }
  selectCompanyDiv(e,flag) {    
    let myKeyword;
    if(flag == true){
      myKeyword = e ? e['itemData'].id : 0;
      this.obj['itemData'] = e ? e['itemData'].id : 0;
    }else{
      myKeyword = e ? e['itemData'] : 0;
    }
    // let myKeyword = e ? e.id : 0;
    userId = myKeyword;
    localStorage.setItem('extension_selected_Comapany', myKeyword.toString())
    this.showSearching = true;
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
    const dialogRefInfo = this.dialog.open(AddRestrictionDialog, {
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
}

@Component({
  selector: 'add-restriction-dialog',
  templateUrl: 'add-restriction-dialog.html',
})

export class AddRestrictionDialog {
  maskArray: any;
  InfoAccessForm: any = {};
  allCustomer: any;
  customerProduct: any;
  companyList: any[] = [];
  filterProduct: any;
  public companyInSelectedFilter: any;
  error = '';
  submitted = false;
  accessData: any = [{}];
  dataId: any;
  callqueueData: any = {};
  is_extension: boolean = false;
  countryCode = "";
  dataSource: any = [];
  columnDefs: any;
  stickyExpire = [];
  AccessType: any = [];
  companyType: any = [];
  states = [""];
  country: any;
  customerId = '';
  showNotInsertedValue: any;
  selectedCustomerValue = "";
  cidrData = ''; // working
  maskData: any = ''; // working
  restrictionData: any = ''; // working
  companyData: any = '';
  access_typeData: any = []; //working
  cust_id: any;
  companys: any;
  menus: any;
  AccessMenu: any;
  isEdit: boolean = false;
  companyName = '';
  a = '';
  allow_ip_restrictionData: any = ''; // working
  acl_descData = ''; // working
  accessArr: any = [];
  access: any = [];
  Restriction = [
    { id: 1, name: "ALL" },
    { id: 4, name: "PSTN" },
    { id: 3, name: "REGISTRATION" },
    { id: 2, name: "WEB" }
  ]
  onChangeRes_Type(event) {
    this.access = []
    if (event.value == 'ALL' || event == 'ALL') {
      this.access.push('Customer Portal');
      this.access.push('Extension Portal');
      this.access.push('SIP Client');
      this.access_type.setValidators([Validators.required]);
      this.access_type.updateValueAndValidity();
      if (!event.value) {
        this.InfoAccessForm.controls.access_type.setErrors(null);
      }
    } else {
      this.AccessType = [];
    }
    if (event.value == 'WEB' || event == 'WEB') {
      this.access.push('Customer Portal');
      this.access.push('Extension Portal');
      this.access_type.setValidators([Validators.required]);
      this.access_type.updateValueAndValidity();
      if (!event.value) {
        this.InfoAccessForm.controls.access_type.setErrors(null);
      }
    } else {
      this.AccessType = [];
    }
    if (event.value == 'REGISTRATION' || event == 'REGISTRATION') {
      this.access.push('SIP Client');
      this.access_type.setValidators([Validators.required]);
      this.access_type.updateValueAndValidity();
      if (!event.value) {
        this.InfoAccessForm.controls.access_type.setErrors(null);
      }
    } else {
      this.AccessType = [];
    }
    if (event.value == 'PSTN' || event == 'PSTN') {
      this.access.push('SIP Client');
      this.access_type.setValidators([Validators.required]);
      this.access_type.updateValueAndValidity();
      if (!event.value) {
        this.InfoAccessForm.controls.access_type.setErrors(null);
      }
    } else {
      this.AccessType = [];
    }
  }
  constructor(
    public dialogRefInfo: MatDialogRef<AddRestrictionDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private ivrService: IVRService,
    private router: Router,
    public userService: UserService,
    private didService: DidService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    public commonService: CommonService,
    public RestrictionService: RestrictionService,
    public securityService: SecurityService

  ) {
    this.InfoAccessForm = this.fb.group({
      'cidr': ['', [Validators.required, Validators.pattern(IP_RegEx), Validators.maxLength(40)]],
      'mask_bit': ['32', [Validators.required]],
      'restriction_type': ['', [Validators.required]],
      'access_type': ['', [Validators.required]],
      'allow_ip_restriction': [""],
      'acl_desc': [''],
      'company': [''],
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.AccessMenu = this.menus.find((o) => o.url === '/access-restriction/');

  }
  get company() { return this.InfoAccessForm.get('company'); }
  get cidr() { return this.InfoAccessForm.get('cidr'); }
  get restriction_type() { return this.InfoAccessForm.get('restriction_type'); }
  get allow_ip_restriction() { return this.InfoAccessForm.get('allow_ip_restriction'); }
  get access_type() { return this.InfoAccessForm.get('access_type'); }
  get acl_desc() { return this.InfoAccessForm.get('acl_desc'); }
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

    if(this.AccessMenu.all_permission == '0' && this.AccessMenu.view_permission == '1'){
      this.InfoAccessForm.disable();
    }

    this.maskArray = [
      { id: 32 }, { id: 31 }, { id: 30 }, { id: 29 }, { id: 28 }, { id: 27 }, { id: 26 }, { id: 25 }, { id: 24 }, { id: 23 }, { id: 22 }, { id: 21 }, { id: 20 }, { id: 19 }, { id: 18 }
    ]
    this.maskData = 32;
    if (this.data.id) {
      this.isEdit = true;
    }
    if(!this.data.id){
    let userType = localStorage.getItem('type');
    if (userType == UserTypeConstants.ADMIN) {
      this.a = localStorage.getItem('extension_selected_Comapany')
      this.RestrictionService.getCustomerCompany(productId, this.a).subscribe(datas => {
        let data = datas.response;
        this.companyList = [];
        this.companyName = data[0]['company_name']
        this.companys = datas;
      }, err => {
        this.error = err.message;
      });
    }
    if (userType == '3') {
      this.a = localStorage.getItem('extension_selected_Comapany')
      this.RestrictionService.getCustomerCompany(productId, this.a).subscribe(datas => {
        let data = datas.response;
        this.companyList = [];
        this.companyName = data[0]['company_name']
        this.companys = datas;
      }, err => {
        this.error = err.message;
      });
    }
  }
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      document.getElementsByTagName("app-website-nav")[0].scrollIntoView();
    });
    if (this.data) {
      const user_id = localStorage.getItem("id");
      this.companyName = localStorage.getItem('extension_selected_Comapany');
      this.RestrictionService.viewAccessRestGroupById(this.data).subscribe(data => {
        this.companyName = data.company;
        this.accessData = data;
        this.onChangeRes_Type(data.restriction_type)
        this.access_typeData = data.access_type;
        let abc = this.access_typeData.split(',');
        abc.map(item => this.AccessType.push(item))
        this.cidrData = this.accessData.cidr; //for ip
        this.maskData = this.accessData.mask_bit; //for mask bit
        this.restrictionData = this.accessData.restriction_type; //for restriction type
        this.companyName = this.companyData = this.accessData.company;
        this.companys = {
          response: [{
            company_name: this.accessData.company,
            id: this.accessData.customer_id
          }]
        };
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
  submitAccessForm() {
    if (this.InfoAccessForm.valid) {
      this.submitted = true;
      const credentials = this.InfoAccessForm.value;
      let a = this.companys;
      credentials['customer_id'] = a.response[0]['id'];
      credentials['company'] = a.response[0]['company_name'];
      credentials['role'] = localStorage.getItem('type');
      credentials['user_id'] = localStorage.getItem('id');
      if (!this.data.id) {
        this.RestrictionService.ValidateAccessIP(credentials).subscribe(data => {
          if (data['response'] == "") {
            this.RestrictionService.createAccessRestrictionData(credentials).subscribe(data => {              
              if (data.code == 200) {
                count = true;
                this.toastr.success('Successfully!', "Access Restriction Created", { timeOut: 2000 });
                this.cancelFormreset();
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            });
          }
          else {
            this.toastr.error('Error!', duplicateIP, { timeOut: 2000 });
            return;
          }
        })

      }
      else if (this.data.id) {
        const credentials = this.InfoAccessForm.value;
        credentials.id = this.data.id;
        this.RestrictionService.ValidateAccessIP(credentials).subscribe(data => {
          if (data['response'] == "") {
            this.RestrictionService.updateAccessRestrictionGroup(credentials).subscribe(data => {
              if (data) {
                this.toastr.success('Successfully!', "Access Restriction Updated", { timeOut: 2000 });
                this.cancelFormreset();
              }
              else {
                this.toastr.error('Error!', data['message'], { timeOut: 2000 });
              }
            })
          }
          else {
            this.toastr.error('Error!', duplicateIP, { timeOut: 2000 });
            return;
          }
        })
      }
    }
  }
  cancelFormreset() {
    this.InfoAccessForm.reset();
    this.RestrictionService.updateGridList();
    this.dialogRefInfo.close();
  }
  cancleDialog(): void {
    this.dialogRefInfo.close();
  }
}

function ngOnDestroy() {
  throw new Error('Function not implemented.');
}