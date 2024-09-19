import { Component, OnInit, Inject } from '@angular/core';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { WhatsAppService } from '../whatsapp-template/whatsapp.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Errors, CommonService, ExcelService, Name_RegEx, importSuccessfully, importUnsuccessfully, invalidFileType, createChannel,updateChannel, whatsappTemplateNameDuplicate } from '../../../core';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-social-media-channel',
  templateUrl: './social-media-channel.component.html',
  styleUrls: ['./social-media-channel.component.css']
})
export class SocialMediaChannelComponent implements OnInit {
  errors = ''
  columnDefs: any;
  isFilter = false;
  dataSource: any = [];
  error = '';
  filterForm: FormGroup;
  defaultPageSize = '10';
  
  constructor(
    public whatsappService: WhatsAppService,
    public dialog: MatDialog,
    private toastr: ToastrService,  
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      'channel_name': [""]      
    });
   }

  ngOnInit() {
    this.whatsappService.displayAllRecord().subscribe(() => {
      this.displayAllRecord();      
    })
  }
  displayAllRecord(){
    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 100 },
      { field: 'channel_name', headerName: 'Name', width: 150, hide: false },
      { field: 'description', headerName: 'Description', width: 200, hide: false },
      { field: 'channel_user_id', headerName: 'Channel User ID / Caller ID', width: 200, hide: false },
      { field: 'outbound_prepend_digit', headerName: 'Outbound Prepend Digit', width: 200, hide: false },   
      { field: 'outbound_strip_digit', headerName: 'Outbound Strip Digit', width: 200, hide: false },   
    ];
    const credentials = this.filterForm.value;
    let user_id = localStorage.getItem('id');
    if(this.isFilter){
      this.whatsappService.filterSocialList(credentials,user_id).subscribe(data => {      
        data = this.manageUserActionBtn(data);      
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': data })
      })
    }else{
      const credentials = this.filterForm.value;
      const user_id = localStorage.getItem('id');      
      this.whatsappService.getSocial(user_id).subscribe((datas => {
        datas = this.manageUserActionBtn(datas);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': datas});
      })),err => {
        this.error = err.message;
      }

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
        return this.editSocialData(data);
      case "delete":
        return this.deleteSocialGroup(data);
    }
  }
  editSocialData(event){    
    this.openDialog(event.id)
  }
  addSocialMedia () {
    this.openDialog(null)
  }
  deleteSocialGroup(event) {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',      
      html : "<span style='color:#FFFFFF;'>You will not be able to recover Social Media Channel</span> <span style='color:red; font-weight:bold; font-size:1.2em'>"+event.channel_name+ "</span>  <span style='color:#FFFFFF;'>in future! </span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      preConfirm: () => {
        this.whatsappService.deleteSocialGroup(event.id).subscribe(data => {  
          this.displayAllRecord();
        },
          err => {
            this.errors = err.message;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html : " <span style='color:#FFFFFF;'> Social Media Channel </span> <span style='color:red; font-size:1.2em; font-weight: bold;'>"+event.channel_name+" </span> <span style='color:#FFFFFF'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer:2000
        });
        this.displayAllRecord();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html : "<span style='color:#FFFFFF';>Social Media Channel </span> <span style='color:red; font-weight:bold; font-size:1.3em'>"+event.channel_name+ "</span> <span style='color:#FFFFFF';> is safe </span> ",
          type: 'error',
          background: '#000000',
          timer:2000
        });
      }
    })
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(AddSocialMediaDialog, { width: '60%', disableClose: true, data: data ? data : null });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }
  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }
}



@Component({
  selector: 'socialMedia-dialog',
  templateUrl: './socialMedia-dialog.html',
  providers: [CheckBoxSelectionService]
})

export class AddSocialMediaDialog implements OnInit{
    
  socialMediaForm: FormGroup;
  placeholder = 'Whatsapp Provider'; 
  public popupHeight: string = '200px';
  public popupWidth: string = '250px'; 
  public fields: Object = { text: 'provider_name', value: 'id' };
  providerList: any = [];
  setProvider: any;
  controlProvider: boolean = false;
  columnDefs: any;
  isFilter = false;
  dataSource: any = [];
  error = '';
  providerData: any;
  selected = '1';
  imageSource: any;
  logoText: any;


  constructor(
    public dialogRef: MatDialogRef<AddSocialMediaDialog>, @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private whatsappService: WhatsAppService,
    private toastr: ToastrService,  
  ) {
    this.socialMediaForm = this.fb.group({
      'channel_name': [""],
      'description': [""],
      'provider': ["",[Validators.required]],
      'access_key': [""], 
      'caller_id' : [""],
      'mehry_domain': [""],
      'namespace': [""],
      'prepend_digit': [""],
      'strip_digit': [""]
    })
   }
   get channel_name() { return this.socialMediaForm.get('channel_name'); }  
   get description() { return this.socialMediaForm.get('description'); }  
   get provider() { return this.socialMediaForm.get('provider'); }  
   get access_key() { return this.socialMediaForm.get('access_key'); } 
   get caller_id() { return this.socialMediaForm.get('caller_id'); }  
   get mehry_domain() { return this.socialMediaForm.get('mehry_domain'); } 
   get namespace() { return this.socialMediaForm.get('namespace'); }  
   get prepend_digit() { return this.socialMediaForm.get('prepend_digit'); } 
   get strip_digit() { return this.socialMediaForm.get('strip_digit'); } 
   
   
   ngOnInit() {
    // setTimeout(() => {
      this.whatsappService.getProviderList().subscribe(data => {            
        this.providerList = data;
      });
    // }, 500);
    // setTimeout(() => {
      
      if(this.data){
        this.whatsappService.getSocialById(this.data).subscribe((data) => {  
          this.socialMediaForm.get('channel_name').setValue(data['channel_name']);
          this.socialMediaForm.get('description').setValue(data['description']);        
        // this.socialMediaForm.get('provider').setValue(parseInt(data['whatsapp_provider']));
        this.providerData = Number(data['whatsapp_provider']);
        this.socialMediaForm.get('access_key').setValue(data['access_key']);
        this.socialMediaForm.get('caller_id').setValue(data['channel_user_id']);
        this.socialMediaForm.get('mehry_domain').setValue(data['mehery_domain']);
        this.socialMediaForm.get('namespace').setValue(data['namespace']);
        this.socialMediaForm.get('prepend_digit').setValue(data['outbound_prepend_digit']);
        this.socialMediaForm.get('strip_digit').setValue(data['outbound_strip_digit']);
        
      }
      , err => {
        this.error = err.message;
      });
    }
  // }, 1000);

  }


  selectProvider(e){
    this.controlProvider = e != undefined ? true : false;    
    this.setProvider = e == 1 ? 1 : e == 2 ? 2 : 3;
    this.imageSource = e == 1 ? '../../../../assets/img/messageBird.png' : e == 2 ? '../../../../assets/img/mehery.jpg' : '../../../../assets/img/karix.png';
    this.logoText = e == 1 ? 'MessageBird' : e == 2 ? 'Mehery' : 'Karix';    
  }
  
  submitSocialMediaForm(){
    let credentials = this.socialMediaForm.value;
    let user_id = localStorage.getItem('id');   
    credentials.user_id = user_id;    
    if(!this.data){
    this.whatsappService.createSocialMediaChannel(credentials).subscribe(data => {
      if(data.status_code == 200){
        this.toastr.success('Success!', createChannel, { timeOut: 2000 });          
        this.cancelForm();
      }else {
        this.toastr.error('Error!', data['message'], { timeOut: 2000 });        
      }
    }); 
  }else{
    credentials.id = this.data;
    this.whatsappService.updateSocialMedia(credentials).subscribe((data) => { 
      if(data['status_code'] == 200){        
        this.toastr.success('Success!', updateChannel, { timeOut: 2000 });
        this.cancelForm();
      }else{
        this.toastr.error('Error!', data['message'], { timeOut: 2000 });
      }
    })
  }   
  }

  cancleDialog(): void {
    this.dialogRef.close();
  } 

  cancelForm() {
    this.socialMediaForm.reset();
    this.whatsappService.updateGridList();
    this.dialogRef.close();    
  } 

}









