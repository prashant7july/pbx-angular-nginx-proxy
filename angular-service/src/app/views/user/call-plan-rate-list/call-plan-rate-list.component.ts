import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../user.service';

@Component({
  selector: 'app-call-plan-rate-list',
  templateUrl: './call-plan-rate-list.component.html',
  styleUrls: ['./call-plan-rate-list.component.css']
})
export class CallPlanRateListComponent implements OnInit {
  dataSource = [];
  dataSource2 = [];
  dataSource3 = [];
  dataSource4 = [];
  dataSource5 = [];
  columnDefs = [];
  columnDefs2 = [];
  columnDefs3 = [];
  columnDefs4 = [];
  columnDefs5 = [];
  bundleData =[];
  callPlanRate: any[] = [];
  tcData = [];
  standardData = [];
  raomingData = [];
  OutgoingBundleData = [];
  bundleRatesList = [];
  checkedBundleList = [];
  checkedRoamingList = [];
  checkedTCList = [];
  checkedStandardList = [];
  checkedOutgoingList = [];
  uncheckBundleList = [];
  uncheckRoamingList = [];
  uncheckTCList = [];
  uncheckStandardList = [];
  uncheckOutgoingList = [];
  defaultPageSize = '10';
  id = '';
  userRole:any;
  isDeleteBundle : boolean = false;
  isDeleteRoaming : boolean = false;
  isDeleteTC : boolean = false;
  isDeleteStandard : boolean = false;
  isDeleteOutgoing : boolean = false;
  showDelete : boolean = false;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router

  ) { }

  ngOnInit() {
    this.userRole = localStorage.getItem('type');
    this.route.queryParams.subscribe(params => {
      this.id = params.custId;
    });

    if(localStorage.getItem('type') == '0'){
      this.showDelete = true;
    }else{
      this.showDelete = false;
    }


    this.route.data.subscribe(data => {    
      this.callPlanRate.push(data['planData']);
    });

    for(let i = 0 ; i < this.callPlanRate[0]['0'].length ; i++){
      if(this.callPlanRate[0]['0'][i]['plan_type'] == '1'){
        this.bundleData.push(this.callPlanRate[0]['0'][i]);
      }else if(this.callPlanRate[0]['0'][i]['plan_type'] == '2'){
        this.raomingData.push(this.callPlanRate[0]['0'][i]);
      }else if(this.callPlanRate[0]['0'][i]['plan_type'] == '4'){
        this.tcData.push(this.callPlanRate[0]['0'][i]);
      }else if(this.callPlanRate[0]['0'][i]['plan_type'] == '5'){
        this.OutgoingBundleData.push(this.callPlanRate[0]['0'][i]);
      }
    }
    
    for(let i = 0; i < this.callPlanRate[0]['1'].length ; i++){
      if(this.callPlanRate[0]['1'][i]['plan_type'] == '0'){
        this.standardData.push(this.callPlanRate[0]['1'][i]);
      }
    }
    this.displayAllRecord();
    this.displayAllRecord2();
    this.displayAllRecord3();
    this.displayAllRecord4();
    this.displayAllRecord5();
  }

  public displayAllRecord() {
    this.columnDefs = [
      // { field: 'action', headerName: 'Action', hide: false, width: 150 },
      { field: 'name', headerName: 'Call Plan Name', hide: false, width: 150 },
      { field: 'dial_prefix', headerName: 'Destination', hide: false, width: 150 },
      { field: 'group_name', headerName: 'Group Name', hide: false, width: 150 },
      { field: 'talktime_minutes', headerName: 'Talktime Minutes', hide: false, width: 150 },
      { field: 'used_minutes', headerName: 'Used Minutes', hide: false, width: 150 },
      { field: 'buying_rate', headerName: 'Buying Rate', hide: false, width: 150 },
      { field: 'selling_rate', headerName: 'Selling Rate', hide: false, width: 150 },
      { field: 'selling_billing_block', headerName: 'Selling Billing Block', hide: false, width: 150 },
      { field: 'expiry_date', headerName: 'Expiry Date', hide: false, width: 150 },
    ];    

    if(localStorage.getItem('type') == '0'){
      this.columnDefs.unshift({
        field: 'action', headerName: 'Action', hide: false, width: 150
      })
    }
 
      this.manageUserActionBtn(this.bundleData)
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, 'data': this.bundleData });
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  public displayAllRecord2() {
    this.columnDefs2 = [
      // { field: 'action', headerName: 'Action', hide: false, width: 150 },
      { field: 'name', headerName: 'Call Plan Name', hide: false, width: 150 },
      { field: 'dial_prefix', headerName: 'Destination', hide: false, width: 150 },
      { field: 'group_name', headerName: 'Group Name', hide: false, width: 150 },
      { field: 'talktime_minutes', headerName: 'Talktime Minutes', hide: false, width: 150 },
      { field: 'used_minutes', headerName: 'Used Minutes', hide: false, width: 150 },
      { field: 'buying_rate', headerName: 'Buying Rate', hide: false, width: 150 },
      { field: 'selling_rate', headerName: 'Selling Rate', hide: false, width: 150 },
      { field: 'selling_billing_block', headerName: 'Selling Billing Block', hide: false, width: 150 },
      { field: 'expiry_date', headerName: 'Expiry Date', hide: false, width: 150 },
    ];    

    if(localStorage.getItem('type') == '0'){
      this.columnDefs2.unshift({
        field: 'action', headerName: 'Action', hide: false, width: 150
      })
    }

      this.manageUserActionBtn2(this.raomingData)
      this.dataSource2 = [];
      this.dataSource2.push({ 'fields': this.columnDefs2, 'data': this.raomingData });
  }

  public displayAllRecord3() {
    this.columnDefs3 = [
      // { field: 'action', headerName: 'Action', hide: false, width: 150 },
      { field: 'name', headerName: 'Call Plan Name', hide: false, width: 150 },
      { field: 'dial_prefix', headerName: 'Destination', hide: false, width: 150 },
      { field: 'group_name', headerName: 'Group Name', hide: false, width: 150 },
      { field: 'talktime_minutes', headerName: 'Talktime Minutes', hide: false, width: 150 },
      { field: 'used_minutes', headerName: 'Used Minutes', hide: false, width: 150 },
      { field: 'buying_rate', headerName: 'Buying Rate', hide: false, width: 150 },
      { field: 'selling_rate', headerName: 'Selling Rate', hide: false, width: 150 },
      { field: 'selling_billing_block', headerName: 'Selling Billing Block', hide: false, width: 150 },
      { field: 'expiry_date', headerName: 'Expiry Date', hide: false, width: 150 },
    ];    

    if(localStorage.getItem('type') == '0'){
      this.columnDefs3.unshift({
        field: 'action', headerName: 'Action', hide: false, width: 150
      })
    }
      this.manageUserActionBtn3(this.tcData)
      this.dataSource3 = [];
      this.dataSource3.push({ 'fields': this.columnDefs3, 'data': this.tcData });
  }

  public displayAllRecord4() {
    this.columnDefs4 = [
      // { field: 'action', headerName: 'Action', hide: false, width: 150 },
      { field: 'name', headerName: 'Call Plan Name', hide: false, width: 150 },
      { field: 'dial_prefix', headerName: 'Destination', hide: false, width: 150 },
      { field: 'talktime_minutes', headerName: 'Talktime Minutes', hide: false, width: 150 },
      { field: 'used_minutes', headerName: 'Used Minutes', hide: false, width: 150 },
      { field: 'buying_rate', headerName: 'Buying Rate', hide: false, width: 150 },
      { field: 'selling_rate', headerName: 'Selling Rate', hide: false, width: 150 },
      { field: 'selling_billing_block', headerName: 'Selling Billing Block', hide: false, width: 150 },
      { field: 'expiry_date', headerName: 'Expiry Date', hide: false, width: 150 },
    ];    
    if(localStorage.getItem('type') == '0'){
      this.columnDefs4.unshift({
        field: 'action', headerName: 'Action', hide: false, width: 150
      })
    }

      this.manageUserActionBtn4(this.standardData)
      this.dataSource4 = [];
      this.dataSource4.push({ 'fields': this.columnDefs4, 'data': this.standardData });
  }

  public displayAllRecord5() {
    this.columnDefs5 = [
      // { field: 'action', headerName: 'Action', hide: false, width: 150 },
      { field: 'name', headerName: 'Call Plan Name', hide: false, width: 150 },
      { field: 'dial_prefix', headerName: 'Destination', hide: false, width: 150 },
      { field: 'group_name', headerName: 'Group Name', hide: false, width: 150 },
      { field: 'talktime_minutes', headerName: 'Talktime Minutes', hide: false, width: 150 },
      { field: 'used_minutes', headerName: 'Used Minutes', hide: false, width: 150 },
      { field: 'buying_rate', headerName: 'Buying Rate', hide: false, width: 150 },
      { field: 'selling_rate', headerName: 'Selling Rate', hide: false, width: 150 },
      { field: 'selling_billing_block', headerName: 'Selling Billing Block', hide: false, width: 150 },
      { field: 'expiry_date', headerName: 'Expiry Date', hide: false, width: 150 },
    ];    
    if(localStorage.getItem('type') == '0'){
      this.columnDefs5.unshift({
        field: 'action', headerName: 'Action', hide: false, width: 150
      })
    }
      this.manageUserActionBtn5(this.OutgoingBundleData)
      this.dataSource5 = [];
      this.dataSource5.push({ 'fields': this.columnDefs5, 'data': this.OutgoingBundleData });
  }

  manageUserActionBtn(data) { 
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      // finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      // finalBtn += "</span>";      
      if(data[i]['check'] == true){
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheckBundle' title='Uncheck'></i>"; 
        finalBtn += "</span>";    
      }else{       
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='checkBundle' title='check'></i>";
        finalBtn += "</span>";
      }      
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageUserActionBtn2(data) { 
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      // finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      // finalBtn += "</span>";      
      if(data[i]['check'] == true){
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheckRoaming' title='Uncheck'></i>"; 
        finalBtn += "</span>";    
      }else{       
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='checkRoaming' title='check'></i>";
        finalBtn += "</span>";
      }      
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageUserActionBtn3(data) { 
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      // finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      // finalBtn += "</span>";      
      if(data[i]['check'] == true){
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheckTC' title='Uncheck'></i>"; 
        finalBtn += "</span>";    
      }else{       
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='checkTC' title='check'></i>";
        finalBtn += "</span>";
      }      
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageUserActionBtn4(data) { 
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      // finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      // finalBtn += "</span>";      
      if(data[i]['check'] == true){
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheckStandard' title='Uncheck'></i>"; 
        finalBtn += "</span>";    
      }else{       
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='checkStandard' title='check'></i>";
        finalBtn += "</span>";
      }      
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageUserActionBtn5(data) { 
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      // finalBtn += "<span>";
      // finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      // finalBtn += "</span>";      
      if(data[i]['check'] == true){
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-check-square-o ' style='cursor:pointer; display: inline' data-action-type='uncheckOutgoing' title='Uncheck'></i>"; 
        finalBtn += "</span>";    
      }else{       
        finalBtn += "<span>";
        finalBtn += "<i class='fa fa-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='checkOutgoing' title='check'></i>";
        finalBtn += "</span>";
      }      
      data[i]['action'] = finalBtn;
    }
    return data;
  }

  manageAction(e) {
    
    
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      // case "edit":
      //   return this.editParticipant(data);
      // case "delete":
      //   return this.deleteParticipant(data);
      case "checkBundle":
        return this.checkBundle(data);
      case "uncheckBundle":
        return this.uncheckBundle(data);
      case "checkRoaming":
        return this.checkRoaming(data);
      case "uncheckRoaming":
        return this.uncheckRoaming(data);
      case "checkTC":
        return this.checkTC(data);
      case "uncheckTC":
        return this.uncheckTC(data);
      case "checkStandard":
        return this.checkStandard(data);
      case "uncheckStandard":
        return this.uncheckStandard(data);
      case "uncheckOutgoing":
        return this.uncheckOutgoing(data);
      case "checkOutgoing":
        return this.checkOutgoing(data);
    }
  }


  checkBundle(data){
    
    for(let i = 0; i< this.bundleData.length ; i++){  
      if(this.bundleData[i]['id'] === data.id){
        this.bundleData[i]['check'] = true;
        this.checkedBundleList.push( data)
      }
    }
    
    
    if(this.checkedBundleList.length > 0){
      this.isDeleteBundle = false;
    }else{
      this.isDeleteBundle = true;
    }
    this.manageUserActionBtn(this.bundleData);
    this.displayAllRecord();
    
  }

  checkTC(data){
     
    for(let i = 0; i< this.tcData.length ; i++){  
      if(this.tcData[i]['id'] === data.id){
        this.tcData[i]['check'] = true;
        this.checkedTCList.push( data)
      }
    }
    if(this.checkedTCList.length > 0){
      this.isDeleteTC = false;
    }else{
      this.isDeleteTC = true;
    }
    this.manageUserActionBtn3(this.tcData);
    this.displayAllRecord3();
    
  }

  checkStandard(data){  
    for(let i = 0; i< this.standardData.length ; i++){  
      if(this.standardData[i]['id'] === data.id){
        this.standardData[i]['check'] = true;
        this.checkedStandardList.push( data)
      }
    }
    
    if(this.checkedStandardList.length > 0){
      this.isDeleteStandard = false;
    }else{
      this.isDeleteStandard = true;
    }
    this.manageUserActionBtn4(this.standardData);
    this.displayAllRecord4();
    
  }

  checkRoaming(data){ 
    for(let i = 0; i< this.raomingData.length ; i++){  
      if(this.raomingData[i]['id'] === data.id){
        this.raomingData[i]['check'] = true;
        this.checkedRoamingList.push( data)
      }
    }
    
    if(this.checkedRoamingList.length > 0){
      this.isDeleteRoaming = false;
    }else{
      this.isDeleteRoaming = true;
    }
    this.manageUserActionBtn2(this.raomingData);
    this.displayAllRecord2();
    
  }

  checkOutgoing(data){ 
    for(let i = 0; i< this.OutgoingBundleData.length ; i++){  
      if(this.OutgoingBundleData[i]['id'] === data.id){
        this.OutgoingBundleData[i]['check'] = true;
        this.checkedOutgoingList.push( data)
      }
    }
    
    if(this.checkedOutgoingList.length > 0){
      this.isDeleteOutgoing = false;
    }else{
      this.isDeleteOutgoing = true;
    }
    this.manageUserActionBtn5(this.OutgoingBundleData);
    this.displayAllRecord5();
    
  }
 

  uncheckBundle(data){
    this.uncheckBundleList = [];
    data['check'] = false;
    this.checkedBundleList = this.bundleData.filter(item => item.check != false);
    this.checkedBundleList.map(data=>{
      if(data.check == true){
        this.uncheckBundleList.push(data.id);
      }
    })
    if(this.uncheckBundleList.length > 0){
      this.isDeleteBundle = false;
    }else{
      this.isDeleteBundle = true;
    }

  this.manageUserActionBtn(this.bundleData)
  this.displayAllRecord()
  }

  uncheckRoaming(data){
    this.uncheckRoamingList = [];
    data['check'] = false;
    this.checkedRoamingList = this.raomingData.filter(item => item.check != false);
    this.checkedRoamingList.map(data=>{
      if(data.check == true){
        this.uncheckRoamingList.push(data.id);
      }
    })

    if(this.uncheckRoamingList.length > 0){
      this.isDeleteRoaming = false;
    }else{
      this.isDeleteRoaming = true;
    }

  this.manageUserActionBtn2(this.raomingData)
  this.displayAllRecord2()
  }

  uncheckTC(data){
    this.uncheckTCList = [];
    data['check'] = false;
    this.checkedTCList = this.tcData.filter(item => item.check != false);
    this.checkedTCList.map(data=>{
      if(data.check == true){
        this.uncheckTCList.push(data.id);
      }
    })
    if(this.uncheckTCList.length > 0){
      this.isDeleteTC = false;
    }else{
      this.isDeleteTC = true;
    }

  this.manageUserActionBtn3(this.tcData)
  this.displayAllRecord3()
  }

  uncheckStandard(data){
    this.uncheckStandardList = [];
    data['check'] = false;
    this.checkedStandardList = this.standardData.filter(item => item.check != false);
    this.checkedStandardList.map(data=>{
      if(data.check == true){
        this.uncheckStandardList.push(data.id);
      }
    })
    if(this.uncheckStandardList.length > 0){
      this.isDeleteStandard = false;
    }else{
      this.isDeleteStandard = true;
    }

  this.manageUserActionBtn4(this.standardData)
  this.displayAllRecord4()
  }

  uncheckOutgoing(data){
    this.uncheckOutgoingList = [];
    data['check'] = false;
    this.checkedOutgoingList = this.OutgoingBundleData.filter(item => item.check != false);
    this.checkedOutgoingList.map(data=>{
      if(data.check == true){
        this.uncheckOutgoingList.push(data.id);
      }
    })
    if(this.uncheckOutgoingList.length > 0){
      this.isDeleteOutgoing = false;
    }else{
      this.isDeleteOutgoing = true;
    }

  this.manageUserActionBtn5(this.OutgoingBundleData)
  this.displayAllRecord5()
  }


  deleteCheckedBundle(){
    this.uncheckBundleList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>It may impact the features! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.checkedBundleList['cust_id'] = this.id;
        this.checkedBundleList['user_id'] = localStorage.getItem('id');
        this.userService.deleteBundleRates(this.checkedBundleList).subscribe(data =>{
          // window.location.reload();
          this.router.navigate(['user/view/call-plan-rates']);
        })
        // this.afterDelete = true;
        for(let i =0 ; i<this.checkedBundleList.length ; i++){
          this.bundleData = this.bundleData.filter(item => item.id != this.checkedBundleList[i].id)
        }
        this.manageUserActionBtn(this.bundleData);
        this.displayAllRecord();
        this.bundleData.map(item =>{
          if(item.check == true){
            this.uncheckBundleList.push(item.id);
          }
        })
        if(this.uncheckBundleList.length > 0){
          this.isDeleteBundle = false;
        }else{
          this.isDeleteBundle = true;
        }
        
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Call Rates has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Call Rates are safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
    
  }
  deleteCheckedRoaming(){
    this.uncheckRoamingList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>It may impact the features! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.checkedRoamingList['cust_id'] = this.id;
        this.checkedBundleList['user_id'] = localStorage.getItem('id');
        this.userService.deleteBundleRates(this.checkedRoamingList).subscribe(data =>{
        })
        // this.afterDelete = true;
        for(let i =0 ; i<this.checkedRoamingList.length ; i++){
          this.raomingData = this.raomingData.filter(item => item.id != this.checkedRoamingList[i].id)
        }
        this.manageUserActionBtn2(this.raomingData);
        this.displayAllRecord2();
        this.raomingData.map(item =>{
          if(item.check == true){
            this.uncheckRoamingList.push(item.id);
          }
        })
        if(this.uncheckRoamingList.length > 0){
          this.isDeleteRoaming = false;
        }else{
          this.isDeleteRoaming = true;
        }
        
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Call Rates has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Call Rates are safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
    
  }
  deleteCheckedTC(){
    this.uncheckTCList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>It may impact the features! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.checkedTCList['cust_id'] = this.id;
        this.checkedBundleList['user_id'] = localStorage.getItem('id');
        this.userService.deleteBundleRates(this.checkedTCList).subscribe(data =>{
     
        })
        // this.afterDelete = true;
        for(let i =0 ; i<this.checkedTCList.length ; i++){
          this.tcData = this.tcData.filter(item => item.id != this.checkedTCList[i].id)
        }
        this.manageUserActionBtn3(this.tcData);
        this.displayAllRecord3();
        this.tcData.map(item =>{
          if(item.check == true){
            this.uncheckTCList.push(item.id);
          }
        })
        if(this.uncheckTCList.length > 0){
          this.isDeleteTC = false;
        }else{
          this.isDeleteTC = true;
        }
        
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Call Rates has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Call Rates are safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
    
  }
  deleteCheckedStandard(){
    this.uncheckStandardList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>It may impact the features! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.checkedStandardList['cust_id'] = this.id;
        this.checkedBundleList['user_id'] = localStorage.getItem('id');
        this.userService.deleteBundleRates(this.checkedStandardList).subscribe(data =>{
          // window.location.reload();
          this.router.navigate(['user/view/call-plan-rates']);
        })
        // this.afterDelete = true;
        for(let i =0 ; i<this.checkedStandardList.length ; i++){
          this.standardData = this.standardData.filter(item => item.id != this.checkedStandardList[i].id)
        }
        this.manageUserActionBtn4(this.standardData);
        this.displayAllRecord4();
        this.raomingData.map(item =>{
          if(item.check == true){
            this.uncheckRoamingList.push(item.id);
          }
        })
        if(this.uncheckRoamingList.length > 0){
          this.isDeleteRoaming = false;
        }else{
          this.isDeleteRoaming = true;
        }
        
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Call Rates has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Call Rates are safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
    
  }

  deleteCheckedOutgoing(){
    this.uncheckOutgoingList = [];
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>It may impact the features! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.checkedOutgoingList['cust_id'] = this.id;
        this.checkedOutgoingList['user_id'] = localStorage.getItem('id');
        this.userService.deleteBundleRates(this.checkedOutgoingList).subscribe(data =>{
          // window.location.reload();
          this.router.navigate(['user/view/call-plan-rates']);
        })
        // this.afterDelete = true;
        for(let i =0 ; i<this.checkedOutgoingList.length ; i++){
          this.OutgoingBundleData = this.OutgoingBundleData.filter(item => item.id != this.checkedOutgoingList[i].id)
        }
        this.manageUserActionBtn5(this.OutgoingBundleData);
        this.displayAllRecord5();
        this.OutgoingBundleData.map(item =>{
          if(item.check == true){
            this.uncheckOutgoingList.push(item.id);
          }
        })
        if(this.uncheckOutgoingList.length > 0){
          this.isDeleteOutgoing = false;
        }else{
          this.isDeleteOutgoing = true;
        }
        
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html: "<span style='color:#FFFFFF;'> Call Rates has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 2000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Call Rates are safe. </span>",
          type: 'error',
          background: '#000000',
          timer: 2000
        });
      }
    })
    
  }

  selectAllBundle(){
    for(let i = 0; i< this.bundleData.length ; i++){
        this.bundleData[i]['check'] = true;
        this.checkedBundleList.push(this.bundleData[i]);
      }
      if(this.checkedBundleList.length > 0){
        this.isDeleteBundle = false;
      }else{
        this.isDeleteBundle= true;
      }  
    this.manageUserActionBtn(this.bundleData);
    this.displayAllRecord();
  }

  selectAllRoaming(){
    for(let i = 0; i< this.raomingData.length ; i++){
        this.raomingData[i]['check'] = true;
        this.checkedRoamingList.push(this.raomingData[i]);
      }
      if(this.checkedRoamingList.length > 0){
        this.isDeleteRoaming = false;
      }else{
        this.isDeleteRoaming = true;
      }  
    this.manageUserActionBtn2(this.raomingData);
    this.displayAllRecord2();
  }

  selectAllTC(){
    for(let i = 0; i< this.tcData.length ; i++){
        this.tcData[i]['check'] = true;
        this.checkedTCList.push(this.tcData[i]);
      }
      if(this.checkedTCList.length > 0){
        this.isDeleteTC = false;
      }else{
        this.isDeleteTC = true;
      }  
    this.manageUserActionBtn3(this.tcData);
    this.displayAllRecord3();
  }

  selectAllStandard(){
    for(let i = 0; i< this.standardData.length ; i++){
        this.standardData[i]['check'] = true;
        this.checkedStandardList.push(this.standardData[i]);
      }
      if(this.checkedStandardList.length > 0){
        this.isDeleteStandard = false;
      }else{
        this.isDeleteStandard = true;
      }  
    this.manageUserActionBtn4(this.standardData);
    this.displayAllRecord4();
  }

  selectAllOutgoing(){
    for(let i = 0; i< this.OutgoingBundleData.length ; i++){
        this.OutgoingBundleData[i]['check'] = true;
        this.checkedOutgoingList.push(this.OutgoingBundleData[i]);
      }
      if(this.checkedOutgoingList.length > 0){
        this.isDeleteOutgoing = false;
      }else{
        this.isDeleteOutgoing = true;
      }  
    this.manageUserActionBtn5(this.OutgoingBundleData);
    this.displayAllRecord5();
  }

  unselectAllBundle(){
    for(let i = 0; i< this.bundleData.length ; i++){
        this.bundleData[i]['check'] = false;
        this.checkedBundleList=[];
      }
      // if(this.checkedBundleList.length > 0){
      //   this.isDelete = false;
      // }else{
      //   this.isDelete = true;
      // }
    this.manageUserActionBtn(this.bundleData);
    this.displayAllRecord();
  }

  unselectAllRoaming(){
    for(let i = 0; i< this.raomingData.length ; i++){
        this.raomingData[i]['check'] = false;
        this.checkedRoamingList=[];
      }
      // if(this.checkedBundleList.length > 0){
      //   this.isDelete = false;
      // }else{
      //   this.isDelete = true;
      // }
    this.manageUserActionBtn2(this.raomingData);
    this.displayAllRecord2();
  }

  unselectAllTC(){
    for(let i = 0; i< this.tcData.length ; i++){
        this.tcData[i]['check'] = false;
        this.checkedTCList=[];
      }
      // if(this.checkedBundleList.length > 0){
      //   this.isDelete = false;
      // }else{
      //   this.isDelete = true;
      // }
    this.manageUserActionBtn3(this.tcData);
    this.displayAllRecord3();
  }

  unselectAllStandard(){
    for(let i = 0; i< this.standardData.length ; i++){
        this.standardData[i]['check'] = false;
        this.checkedStandardList=[];
      }
      // if(this.checkedBundleList.length > 0){
      //   this.isDelete = false;
      // }else{
      //   this.isDelete = true;
      // }
    this.manageUserActionBtn4(this.standardData);
    this.displayAllRecord4();
  }

  unselectAllOutgoing(){
    for(let i = 0; i< this.OutgoingBundleData.length ; i++){
        this.OutgoingBundleData[i]['check'] = false;
        this.checkedOutgoingList=[];
      }
      // if(this.checkedBundleList.length > 0){
      //   this.isDelete = false;
      // }else{
      //   this.isDelete = true;
      // }
    this.manageUserActionBtn5(this.OutgoingBundleData);
    this.displayAllRecord5();
  }

}
