import { Component, OnInit } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
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
import { CommonService, ExcelService, invalidPhone, countryError, Name_RegEx, Number_RegEx, Errors, invalidFileType, IP_RegEx,duplicateIP, PagedData } from '../../../core';
export var productId = '1';
export var userId = '';
export var count = false;


@Component({
  selector: 'app-account-manager-ip',
  templateUrl: './account-manager-ip.component.html',
  styleUrls: ['./account-manager-ip.component.css']
})
export class AccountManagerIpComponent implements OnInit {

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
  errors = "";
  a='';
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
  ProducthtmlFilter:any;
  AccessFilter:any;
  filterProducthtml:any;
  filterProduct:any;
  public mode = 'CheckBox';
  public selectAllText: string = 'Select All';
  public fields: Object = { text: 'name', value: 'company_name' };
  public placeholder: string = 'Select Company';
  public popupHeight: string = '200px';
  public popupWidth2: string = '100%';
  public companyInSelectedFilter  : any ;
  customer_id: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public commonService: CommonService,
    private toastr: ToastrService,
    public userService: UserService,
    public securityService : SecurityService
  ) {
    this.filterForm = this.fb.group({
      'cidr': [""],
      'restriction_type': [""],
      'access_type': [""],
      'allow_ip_restriction': [""],
      'company':[""],
    });
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
    let userType = localStorage.getItem('type');
    this.userRole = localStorage.getItem('type') == '0' ||localStorage.getItem('type') == '2' ? true : localStorage.getItem('type') == '4' ? true: false;
    if (userType == UserTypeConstants.ADMIN) {  
      this.userService.getCustomerCompany(productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.droplist.push({ id: data[i].id, name: data[i].company_name });
          this.filterProducthtml = this.AccessFilter = this.droplist.slice();
          this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
        }
      }, err => {
        this.error = err.message;
      });
    } else if (userType == UserTypeConstants.ACCOUNT_MANAGER) {  
      this.userService.getAccountManagerCustomercompany(localStorage.getItem('id')).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) { // account manager
          this.companyList.push({ company_name: data[i].company_name, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')',  });
          this.droplist.push({ id: data[i].id, name: data[i].company_name });
          this.filterProducthtml = this.ProducthtmlFilter = this.droplist.slice();

        }
      }, err => {
        this.error = err.message;
      });
    } else {
      this.userService.getCustomerCompany(productId).subscribe(datas => {
        let data = datas.response;
        for (let i = 0; i < data.length; i++) {
          this.companyList.push({ id: data[i].id, name: data[i].company_name + '(Ref. Code: ' + data[i].id + ')'});
        }
        let isPreSelectedCompanyId = localStorage.getItem('extension_selected_Comapany');
        if(isPreSelectedCompanyId) {
          this.companyInSelectedFilter = Number(isPreSelectedCompanyId);
          let obj = {};
          let managedObj = {};
          obj['id'] = isPreSelectedCompanyId;
          managedObj['itemData'] = obj;
          this.selectCompanyDiv(managedObj);
        }
      }, err => {
        this.error = err.message;
      });
    }
  }

  ngOnDestroy(){
    localStorage.removeItem('extension_selected_Comapany')
  }
 

  public displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: true, width: 100 },
      { field: 'id', headerName: 'ID', hide: true, width: 50 },
      { field: 'cidr', headerName: 'IP', width: 150, hide: false },
      { field: 'mask_bit', headerName: 'Mask Bit', width: 120, hide: false },
      { field: 'allow_ip_restriction', headerName: 'Status', width: 200, hide: false },
      { field: 'restriction_type', headerName: 'Restriction Type', width: 150, hide: false },
      { field: 'access_type', headerName: 'Access Type', width: 250, hide: false },
      { field: 'acl_desc', headerName: 'Description', width: 200, hide: true },
      { field: 'company', headerName: 'Company', width: 362, hide: false }

    ];
    let userType = localStorage.getItem('type');
    let id = localStorage.getItem('id');
    if (this.isFilter) {
    const credentials = this.filterForm.value;
    credentials.type = userType;
    credentials.id = id;
    credentials.user_id = userId;
   this.securityService.getViewAccessFilter(credentials).subscribe(pagedData => {
    this.isFilter = false;
      this.exportData = pagedData;
      pagedData = this.manageUserActionBtn(pagedData);
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
    }, err => {
      this.error = err.message;
    });
  } else {    
    if(count == true){
      userId = localStorage.getItem('extension_selected_Comapany')
      count = false;
    }
    this.securityService.viewAccessRestriction(userId).subscribe(pagedData => {          
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
  }
  deleteAccessGroup(event) {
    this.securityService.viewAccessRestriction(event.id).subscribe(data => {
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
            this.securityService.deleteviewAccessGroup({ 'id': event.id }).subscribe(data => {
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
  resetTable() {
    count = true;
    this.isFilter = false;
    this.displayAllRecord();
  }
  selectCompanyDiv(e) {
    let myKeyword = e ? e.id : 0;

    userId = myKeyword;
    localStorage.setItem('extension_selected_Comapany',myKeyword.toString())
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
  Companyremovedspace(event){
    const textValue = event.text.trim().toLowerCase();
   const filterData = this.companyList.filter((data) =>{    
      return data['name'].toLowerCase().includes(textValue);
    })
    event.updateData(filterData);
  }
}