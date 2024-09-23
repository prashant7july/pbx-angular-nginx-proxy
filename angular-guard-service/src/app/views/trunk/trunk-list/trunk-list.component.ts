import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService, RINGTIMEOUT_RegEx,EXPANDTIME_RegEx,ExcelService, invalidPhone, invalidForm,errorMessage, countryError,UserName_RegEx, Name_RegEx, Number_RegEx, Errors, invalidFileType, IP_RegEx, duplicateIP } from '../../../core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core';
import 'jspdf-autotable';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { TrunkService } from '../trunk.service';


@Component({
  selector: 'app-trunk-list',
  templateUrl: './trunk-list.component.html',
  styleUrls: ['./trunk-list.component.css']
})
export class TrunkListComponent implements OnInit {
  filterForm: FormGroup;
  rowData: any;
  AgLoad: boolean;
  error = '';
  user_id = '';
  user_type = '';
  isFilter: boolean = false;
  columnDefs: any;
  dataSource: any = [];
  customer_list: any = [];
  serializedArray: any = [];
  companyData = "";
  exportData: any = {};
  destination_data: any[] = [];
  defaultPageSize = '10';
  allCountryList = "";
  isAdd: boolean = true;
  menus: any;
  trunkMenu: any;
  user: any;

  public fields: Object = { text: 'name', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  public placeholder: string = 'Select Extension';
  public popupHeight: string = '200px';
  public popupWidth: string = '100%';


  constructor( 
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public commonService: CommonService,
    private toastr: ToastrService,
    public userservice : UserService,    
    private trunkService: TrunkService,

  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_company': [""],
    });
    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.trunkMenu = this.menus.find((o) => o.url === '/trunk/view');
  }

  ngOnInit() {
     this.user_id = localStorage.getItem('id');
     this.user_type = localStorage.getItem('type');

    this.trunkService.getActiveCustomers().subscribe(pagedData =>{
      pagedData.map(item=>{
       this.customer_list.push({name: item.company_name,
       id: item.id})
     })
     
     this.serializedArray = JSON.stringify(this.customer_list);
     
   })

    this.trunkService.displayAllRecord().subscribe(() =>{
      this.displayAllRecord();
    })
  }

  displayAllRecord() {
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      // { field: 'id', headerName: 'ID', hide: true, width: 50 },
      { field: 'name', headerName: 'Name', width: 150, hide: false },
      { field: 'company_name', headerName: 'Company Name', width: 200, hide: false },
      { field: 'use_as_out', headerName: 'Use As Outbound Trunk', width: 200, hide: false },
      { field: 'use_as_in', headerName: 'Use As Inbound Trunk', width: 200, hide: false },
      { field: 'max_call', headerName: 'Max Simultaneous Calls', width: 200, hide: false },
      { field: 'caller_id', headerName: 'Caller ID', width: 150, hide: false },
    ];
    this.user = localStorage.getItem('type');
    if(this.user != '1'){  
    if(this.isFilter){
      const credentials = this.filterForm.value;
      this.trunkService.getTrunkListByFilter(credentials).subscribe(data =>{
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      })

    }else{
      this.trunkService.getTrunkList().subscribe(data =>{
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      })
    } 
  }else{
    this.isAdd = false;
    if(this.isFilter){
      const credentials = this.filterForm.value;
      this.trunkService.getTrunkListByFilter(credentials).subscribe(data =>{
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      })
    }else{
      this.trunkService.getTrunkListById(Number(this.user_id)).subscribe(data =>{
        this.exportData = data;
        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data });
      })
    } 

  }
  }

  manageUserActionBtn(data) {
    for (let i = 0; i < data.length; i++) {
      let finalBtn = '';
      finalBtn += "<span>";
      if(this.trunkMenu.all_permission == '0' && this.trunkMenu.view_permission == '1'){
        finalBtn += "<i class='fa fa-eye edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='View'></i>";
      }
      if(this.trunkMenu.modify_permission == '1'){

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
        return this.editTrunk(data);
      case "delete":
        return this.deleteTrunk(data);
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

  deleteTrunk(data){
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover Trunk  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name + "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.trunkService.deleteTrunk({ 'id': data.id }).subscribe(data => {
          this.displayAllRecord();
          if (data) {
            this.toastr.success('Successfully !', "Trunk Delete", { timeOut: 2000 });
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
          html: "<span style='color:#FFFFFF;'> Trunk </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +data.name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer: 4000
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Trunk </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.name+ "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 4000
        });
      }
    })
  }

  editTrunk(data){
    // this.router.navigate(['/trunk/add'],{ data: data });  
    this.router.navigate(['/trunk/add'], { queryParams: { trunkId: data.id, customers : this.serializedArray } });
  }

  addTrunk(){
      this.router.navigateByUrl('/trunk/add', {  });
  }
}

@Component({
  selector: 'add-trunk',
  templateUrl: 'add-trunk.component.html',
})

export class AddTrunkComponent {

  linkAddress = "";
  error = '';
  errors: Errors = { errors: {} };
  token = "";
  text:any = "";
  // name: any ="";
  color: any ="";
  lang: any ="";
  id: any="";
  userToken: any="";
  auth1: boolean=false;
  auth2: boolean=false;
  auth3: boolean=false;
  hide1 = true;
  TrunkForm : FormGroup;
  flagOut: boolean = false;
  flagIn: boolean = false;
  allowFlag: boolean = false;
  whitelistIPs = [];
  trunkData: any = [];
  customer_list: any = [];
  profiles: any = [];
  sofia_profile : any = "";
  company_promise : any;
  customer : any  
  sofia : any  
  menus : any  
  trunkMenu : any  
  edit: boolean = true;
  whitelist = [];
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';
  maskArray:any;
  finalCps = 0;


  public fields: Object = { text: 'label', value: 'id' };
  public fields2: Object = { text: 'name', value: 'id' };
  public fields3: Object = { text: 'name', value: 'id' };
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public authentication: any= [
    {id: 1,
    label:'Registration' },
    {id: 2,
    label:'Whitelist IP'},
    {id: 3,
    label:'Whitelist IP + Username/Contact'},
    ];
    public IP_RegEx =/^(\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$)/;

  constructor(
    private userservice: UserService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private trunkService: TrunkService,
    public commonService: CommonService,
    private route: ActivatedRoute,
  ) { 
    this.TrunkForm = this.fb.group({
      'name': ["",[Validators.pattern(Name_RegEx)]],
      'max_simultaneous_calls': [''],
      'caller_id': [""],
      'outbound_trunk': [""],
      'username': ["",[ Validators.minLength(6),Validators.pattern(UserName_RegEx),Validators.maxLength(20)]],
      'authentication': [1],
      'inbound_trunk': [""],
      'allow_calls': [""],
      'external_uri': [""],
      'profile': [""],
      'password': [""],
      'whitelist_ip': ['', [ Validators.pattern(IP_RegEx), Validators.maxLength(20)]],
      // 'whitelist_ip2': ['', [ Validators.pattern(IP_RegEx), Validators.maxLength(20)]],
      'whitelist_ip2':  new FormControl([]),
      'customer': [''],
      'cps': ['1']
    });

    this.menus = JSON.parse(localStorage.getItem('menu'));
    this.trunkMenu = this.menus.find((o) => o.url === '/trunk/view');
  }

  get whitelist_ip2() { return this.TrunkForm.get('whitelist_ip2'); }
  get whitelist_ip() { return this.TrunkForm.get('whitelist_ip'); }
  get username() { return this.TrunkForm.get('username'); }
  get name() { return this.TrunkForm.get('name'); }


  ngOnInit() {

    if(this.trunkMenu.all_permission == '0' && this.trunkMenu.view_permission == '1'){
      this.TrunkForm.disable();
    }
    this.maskArray = [
      { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }, { id: 15 }, { id: 16 }, { id: 17 }, { id: 18 }, { id: 19 }, { id: 20 }
   ]
    let user = localStorage.getItem('type');
    if(user == '1'){
      this.edit = false;
    }else{
      this.edit = true;
    }
        
    this.customInit();
    
     this.route.queryParams.subscribe(params => {
      // const paramValue = params['paramName'];
      this.id = params.trunkId;
      this.customer_list = JSON.parse(params['customers']);
      
    });  
   
    if(this.id){
      this.trunkService.getTrunkById(Number(this.id)).subscribe( async data=>{
        this.trunkData = await data[0];
        this.finalCps = this.trunkData.cps
        
        this.trunkData.authentication = parseInt(this.trunkData.authentication);
        if(this.trunkData.authentication == 2){
          this.whitelist = this.trunkData.whitelist_ip;
        }else{
          this.whitelist = null;
        }
        this.whitelistIPs = this.trunkData['whitelist_ip'] ? this.trunkData['whitelist_ip'].split(',') : [];
        this.TrunkForm.get('profile').setValue(Number(this.trunkData.profile_id));
        this.TrunkForm.get('authentication').setValue(Number(this.trunkData.authentication));                                
        // this.TrunkForm.get('customer').setValue(Number(this.trunkData.customer_id));    
        setTimeout(() => {
          this.sofia = this.trunkData.profile_id;
          this.customer = this.trunkData.customer_id; 
        },500);                            
                                                           
        if(this.trunkData.use_as_out == '1'){
          this.flagOut = true
        }
        if(this.trunkData.use_as_in == '1'){
          this.flagIn = true
        }
        if(this.trunkData.allow_calls_in_registraion == '1'){
          this.allowFlag = true;
        }

        if(this.trunkData.use_as_out == '1'){
        if(this.trunkData.authentication == '1'){
          this.auth1 = true;
        }else if(this.trunkData.authentication == '2'){
          this.auth2 = true;
        }else if(this.trunkData.authentication == '3'){
          this.auth3 = true;
        }
      }

        if(this.trunkData.username == ""){
          this.userToken = this.genRandonString(11);
        }else{
          this.userToken = this.trunkData.username;
        }
      })
    }else{
      this.userToken = this.genRandonString(11);
    }
  }

  customInit(){

    // this.trunkService.getActiveCustomers().subscribe(pagedData =>{
    //   pagedData.map(item=>{
    //    this.customer_list.push({name: item.company_name,
    //     id: item.id});
    //   })
    // }) 

  this.trunkService.getSofiaProfile().subscribe(data =>{
    data.map(item =>{
      this.profiles.push({name : item.profile_name,
      id: item.id})
    })
  })
  
  }

  changeToggleOut(e){
    if(e.checked){
      this.flagOut =  true;
      let authValue = this.TrunkForm.get('authentication').value;
      this.auth1 = true;
      this.TrunkForm.get('authentication').setValue(1);
      this.TrunkForm.get('password').setValidators(Validators.required);
      this.TrunkForm.get('password').updateValueAndValidity();
    }else{
      this.flagOut = false;
      this.auth1 = false;
      this.auth2 = false;
      this.auth3 = false;
      this.TrunkForm.get('password').reset();
      this.TrunkForm.get('password').clearValidators();
      this.TrunkForm.get('password').updateValueAndValidity();
      this.TrunkForm.get('whitelist_ip').reset();
      this.TrunkForm.get('whitelist_ip').clearValidators();
      this.TrunkForm.get('whitelist_ip').updateValueAndValidity();
      this.TrunkForm.get('whitelist_ip2').reset();
      this.TrunkForm.get('whitelist_ip2').clearValidators();
      this.TrunkForm.get('whitelist_ip2').updateValueAndValidity();
      this.TrunkForm.get('authentication').setValue('0');

    }
  }
  changeToggleIn(e){
    if(e.checked){
      this.flagIn =  true;
      this.TrunkForm.get('profile').setValidators(Validators.required);
      this.TrunkForm.get('profile').updateValueAndValidity();
      this.TrunkForm.get('external_uri').setValidators(Validators.required);
      this.TrunkForm.get('external_uri').updateValueAndValidity();

    }else{
      this.flagIn = false;
      this.TrunkForm.get('external_uri').reset();
      this.TrunkForm.get('external_uri').clearValidators();
      this.TrunkForm.get('external_uri').updateValueAndValidity();
      let type = localStorage.getItem('type');
      if(type == '0'){
        this.TrunkForm.get('profile').reset();
        this.TrunkForm.get('profile').clearValidators();
        this.TrunkForm.get('profile').updateValueAndValidity();
      }
    }
  }

  changeToggleReg(e)
{
  if(e.checked){
    this.allowFlag == true;
  }
}
  genRandonString(length) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charLength = chars.length;
    var result = '';
    for ( var i = 0; i < length; i++ ) {
       result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
 }

 changeAuth(e){
  this.whitelistIPs = [];
  this.TrunkForm.get('whitelist_ip2').reset();
  this.TrunkForm.get('whitelist_ip').setValue(null);
  this.TrunkForm.get('password').reset();
  if(e.value == 1){
    this.auth1 = true;
    this.auth2 = false;
    this.auth3 = false;
    this.TrunkForm.controls.password.setValidators(Validators.required);
    this.TrunkForm.controls.whitelist_ip.clearValidators();
    this.TrunkForm.controls.whitelist_ip2.clearValidators();
    this.TrunkForm.get('whitelist_ip').updateValueAndValidity();
    this.TrunkForm.get('whitelist_ip2').updateValueAndValidity();
  }else if(e.value == 2){
    this.TrunkForm.controls.whitelist_ip.setValidators(Validators.pattern(IP_RegEx));
    this.TrunkForm.get('whitelist_ip').updateValueAndValidity();
    this.TrunkForm.controls.password.clearValidators();
    this.TrunkForm.get('password').updateValueAndValidity();
    this.TrunkForm.get('allow_calls').setValue(false);
    this.auth1 = false;
    this.auth2 = true;
    this.auth3 = false;
  }else if(e.value == 3){
    this.TrunkForm.controls.whitelist_ip2.setValidators(Validators.pattern(IP_RegEx));
    this.TrunkForm.controls.password.clearValidators();
    this.TrunkForm.get('password').updateValueAndValidity();
    this.TrunkForm.controls.whitelist_ip.clearValidators();
    this.TrunkForm.get('whitelist_ip').updateValueAndValidity();
    this.TrunkForm.get('allow_calls').setValue(false);
    this.auth1 = false;
    this.auth2 = false;
    this.auth3 = true;
  }else{
    this.auth1 = false;
    this.auth2 = false;
    this.auth3 = false;
  }
  
 }

  myFunction() {
  let x = document.getElementById("password");
  const type = x.getAttribute("type") === "password" ? "text" : "password";
               x.setAttribute("type", type);
 
}

remove(fruit: string): void {
  const index = this.whitelistIPs.indexOf(fruit);
  if (index >= 0) {
    this.whitelistIPs.splice(index, 1);
  }
}
cancleDialog(): void {
  this.router.navigateByUrl('/trunk/view', {  });
}  

add(event: MatChipInputEvent): void {    
  if(IP_RegEx.test(event.value)){
  let a;      
  const value = (event.value || '').trim();    
  a = value; 
  if(value == ''){
    return;
  }            
  if((this.whitelistIPs).length == 0){         
    this.whitelistIPs.push(value);               
  }else{      
    if((this.whitelistIPs).includes(a)){        
      this.toastr.error('Error!','Duplicate value', { timeOut: 2000 });
    }else{
      if(this.whitelistIPs.length != 5){
        this.whitelistIPs.push(value);
      }
    }
  }

  this.TrunkForm.get("whitelist_ip2").setValue(null);
}else{
  this.toastr.error('Error!','Invalid IP', { timeOut: 2000 });
  this.TrunkForm.get("whitelist_ip2").setValue(null);
  return;
}
}

cancelForm() {
  this.TrunkForm.reset();
  this.trunkService.updateGridList();
}

submitTrunkForm(){
  this.whitelist_ip2.setValue(this.whitelistIPs);
  let credentials = this.TrunkForm.value;
  if(credentials.authentication == '3' && credentials.whitelist_ip2 == ""){
    this.toastr.error('Error!','Fill The Form Correctly ', { timeOut: 2000 });
    return;
  }
  credentials.profile_name = this.profiles.filter((item) => item.id == this.TrunkForm.value.profile).length ? this.profiles.filter((item) => item.id == this.TrunkForm.value.profile)[0].name : "";
  credentials.company_name = this.customer_list.filter((item) => item.id == this.TrunkForm.value.customer).length ? this.customer_list.filter((item) => item.id == this.TrunkForm.value.customer)[0].name : "";
  credentials.auth_name = this.authentication.filter((item) => item.id == this.TrunkForm.value.authentication).length ? this.authentication.filter((item) => item.id == this.TrunkForm.value.authentication)[0].label : '';    
  credentials.customer_id = Number(localStorage.getItem('id'));  
  // credentials.cps = !credentials.cps ? this.finalCps : credentials.cps;
  if(!this.id){    
    credentials.whitelist_ip2 = this.whitelistIPs;    
  this.trunkService.postTrunkList(credentials).subscribe(data=>{
    
    if (data['status_code'] == 200) {
      this.toastr.success('Success!', "Trunk Created Successfully!", { timeOut: 2000 });
      this.router.navigateByUrl('/trunk/view', {  });
      this.trunkService.updateGridList();
    }else{
      this.toastr.error('Failed!', "Trunk Name Duplicate!", { timeOut: 2000 });
    }
  })
}else{
  // let credentials = this.TrunkForm.value;
  credentials.whitelist_ip2 = this.whitelistIPs;
  credentials['id'] = Number(this.id);
  this.trunkService.updateTrunkList(credentials).subscribe(data=>{
    
    if (data['status_code'] == 200) {
      this.toastr.success('Success!', "Trunk updated Successfully!", { timeOut: 2000 });
      this.router.navigateByUrl('/trunk/view', {  });
      this.trunkService.updateGridList();
    }else{
      this.toastr.error('Failed!', "Trunk Name Duplicate!", { timeOut: 2000 });
    }
  })
}
}

manageCps(event){  
  this.trunkData.cps = event.target.value < 25 ? 1 : Math.floor(Number(event.target.value)/25);
}

}


