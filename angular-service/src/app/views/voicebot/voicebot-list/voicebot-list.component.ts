import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService, formError, agentError, invalidFileType, importUnsuccessfully, importSuccessfully,Errors,OutboundSuccessfully,Contact_RegEx, ExtensionService } from '../../../../app/core';
import Swal from "sweetalert2";
import { VoicebotService } from '../voicebot-list.service';
@Component({
  selector: 'app-voicebot-list',
  templateUrl: './voicebot-list.component.html',
  styleUrls: ['./voicebot-list.component.css']
})
export class VoicebotListComponent implements OnInit {

  error = '';
  filterForm: FormGroup;
  errors: Errors = { errors: {} };
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  selectedValue: any = [];
  selectedValueTwo : any= [];
  cgList : any= [];
  filterObj: any = {};
  rowData: any;
  intercomData: any;
  exportData: any = {};
  defaultPageSize = '10';
  DialOutName:any;
  sampleRateArr : any= [
  {
      id: '', type : 'Select Sample Rate'
  },
  {
    id : '0' , type : '8000'
  },
{
  id: '1' , type : '16000'
}];

mediaTypeArr : any= [
  {
    id: '', type : 'Select Media Type'
  },
  {
    id: '0', type : 'bytes'
  },
{
  id: '1' , type: 'base64'
}];



  public fields: Object = { text: 'type', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '250px';


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService,
    public commonService: CommonService,
    private voicebotService : VoicebotService


  ) { 
    this.filterForm = this.fb.group({ 
      'name': [""],
      'media_type': [""],
      'sample_rate': [""],
    });
  }

  ngOnInit() {

    this.voicebotService.displayAllRecord().subscribe(data=>{
      this.displayAllRecord();
    })
   
  }
  promptremovedspaceMedia(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.mediaTypeArr.filter((data) => {
      return data['type'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }
  promptremovedspaceRate(event) {
    const promptspace = event.text.trim().toLowerCase();
    const promptData = this.sampleRateArr.filter((data) => {
      return data['type'].toLowerCase().includes(promptspace);
    })
    event.updateData(promptData);
  }

  displayAllRecord() {

    this.columnDefs = [
      { field: 'action', headerName: 'Action', hide: false, width: 150 },
      { field: 'name', headerName: 'Voicebot Name', hide: false, width:200 },
      { field: 'websocket_url', headerName: 'Websocket URL', hide: false, width: 400 },
      { field: 'media_type', headerName: 'Media Type', hide: false, width: 250 },
      { field: 'sample_rate', headerName: 'Sample Rate', hide: false, width: 250 },
   

    ];
    let user_id = Number(localStorage.getItem('id'));
    if(this.isFilter){

      let credentials = this.filterForm.value;
      credentials['customer_id'] = user_id;      
      credentials.media_type = Number(credentials.media_type);
      credentials.sample_rate = Number(credentials.sample_rate);
      this.voicebotService.getVoicebotListByFilter(credentials).subscribe(data=>{
        

        data = this.manageUserActionBtn(data);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, data: data});
      })
   

    }else{
      this.voicebotService.getVoicebotList(localStorage.getItem('id')).subscribe(data =>{
        
      
        
      data = this.manageUserActionBtn(data);
      this.dataSource = [];
      this.dataSource.push({ 'fields': this.columnDefs, data: data});
    })
  }
  
       
    }

    
  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.openDialog(data);
      case "delete":
        return this.deleteVoicebot(data);
    }
  }


  deleteVoicebot(data){
    let event = data; 
    this.voicebotService.getVoicebotCount(event.id).subscribe(data => {
      console.log(data,"--data---");
      
      if (data.voicebot_count > 0) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html: "<span style='color:#FFFFFF;'>Voicebot  </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + event.name + "</span> <span style='color:#FFFFFF;'> can't be deleted because it is associate with either DID Destination or IVR.</span>",
          type: 'error',
          background: '#000000',
          timer: 5000
        });
      } else {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html:
        "<span style='color:#FFFFFF;'>You will not be able to recover Voicebot </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
        event.name +
        "</span> <span style='color:#FFFFFF;'> in future!</span>",
      type: "warning",
      showCancelButton: true,
      background: "#000000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      preConfirm: () => {
        this.voicebotService.deleteVoicebot(event.id).subscribe(
          (data) => {
            this.displayAllRecord();
          },
          (err) => {
            this.error = err.message;
          }
        );
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Deleted!</span>',
          html:
            "<span style='color:#FFFFFF;'> Voicebot </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            event.name +
            "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: "success",
          background: "#000000",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html:
            "<span style='color:#FFFFFF;'>Voicebot </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" +
            event.name +
            "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: "error",
          background: "#000000",
        });
      }
    });
  }
})
}


  editDialOutRule(data: any) {
    this.openDialog(data);
  }
  

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  resetTable() {
    this.isFilter = false;
    // this.filterForm.reset();
    this.displayAllRecord();
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }

  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let mediaBtn = '';
      let sampleBtn = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      finalBtn += "</span>";
      if(pagedData[i].sample_rate == '0'){
        sampleBtn += '8000'
      }else{
        sampleBtn += '16000'
      }

      if(pagedData[i].media_type == '0'){
        mediaBtn += 'bytes'
      }else{
        mediaBtn += 'base64'
      }

      pagedData[i]['action'] = finalBtn;
      pagedData[i]['media_type'] = mediaBtn;
      pagedData[i]['sample_rate'] = sampleBtn;
    }
    return pagedData;
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(VoicebotDialog, { width: '200%', disableClose: true, data: data ? data : null });
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
  selector: 'addVoicebot-dialog',
  templateUrl: './addVoicebot-dialog.html'
})
export class VoicebotDialog {
  errors: Errors = { errors: {} };
  addVoicebotForm: FormGroup;
  editdata: boolean = false;
  public mode;
  sourceAgent: any[] = [];
  public selectAllText: string
  rules: string[] = [];
  public placeholder: string = 'Dialout Group';
  public popupHeight: string = '200px';
  public popupWidth: string = '300px';
  placeholder5 = 'DID as caller id'; 
  didList = []
  public fields: Object = { text: 'type', value: 'id' };
  DIDFilter:any;
  filterDID:any;
  hideRandom = false;
  promise;
  clr_id_as_random: any;
  dialoutName:any;
  prependData:any;
  intercomData:any;
  stripData:any;
  voicebotData: any;
  playback: any;
 
  sampleRateArr : any= [{
    id : '0' , type : '8000'
  },
{
  id: '1' , type : '16000'
}];

mediaTypeArr : any= [{
    id: '0', type : 'bytes'
  },
{
  id: '1' , type: 'base64'
}];

  constructor(
    public dialogRef: MatDialogRef<VoicebotDialog>, @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public commonService: CommonService,
    private extensionService: ExtensionService,
    private voicebotService : VoicebotService
  ) {
    this.addVoicebotForm = this.fb.group({
      'name': ["", Validators.required],
      'websocket_url': [""],
      'playback': [""],
      'media_type': [""],
      'sample_rate': [""],
    });
 
  }

  get name() { return this.addVoicebotForm.get('name'); }
 

  HandleDropdownFilter(key, value) {
    const matFilterInput: any = document.getElementsByClassName("mat-filter-input");
    (matFilterInput && matFilterInput.length) ? matFilterInput[0].value = '' : '';
    this[key] = value;
  }

  ngOnInit() {
  this.addVoicebotForm.get('media_type').setValue('0');    
  this.addVoicebotForm.get('sample_rate').setValue('0');    

  setTimeout(() => {
    this.voicebotService.getVoicebotById(this.data.id).subscribe(data=>{
      this.voicebotData = data;
      this.playback = data.playback == '0' ? false : true;
      this.addVoicebotForm.get('name').setValue(data.name);
      this.addVoicebotForm.get('media_type').setValue(data.media_type);
      this.addVoicebotForm.get('sample_rate').setValue(data.sample_rate);
      this.addVoicebotForm.get('websocket_url').setValue(data.websocket_url);

    })
  }, 500);
 
    

  }

  SubmitvoicebotDialog(){
    let credentials = this.addVoicebotForm.value ;
    credentials['cust_id'] = Number(localStorage.getItem('id'));
    credentials.media_type = Number(credentials.media_type);
    credentials.sample_rate = Number(credentials.sample_rate);
    if(this.data){
      credentials['id'] = Number(this.data.id);
      this.voicebotService.updateVoicebotData(credentials).subscribe(data=>{
        if(data.status_code == 200){
          this.toastr.success('Success!','Voicebot Updated',{timeOut:2000})
          this.voicebotService.updateGridList();
          this.dialogRef.close();
        } else if(data.status_code == 409) {
          this.toastr.error('Error!','Duplicate Entry',{timeOut:2000})
        }else{
          this.toastr.error('Error!','Something Went Wrong',{timeOut:2000})
        }
      })

    }else{
      this.voicebotService.createVoicebot(credentials).subscribe(data=>{ 
        if(data.status_code == 200){
          this.toastr.success('Success!','Voicebot Created',{timeOut:2000})
          this.voicebotService.updateGridList();  
          this.dialogRef.close();
        } else if(data.status_code == 409) {
          this.toastr.error('Error!','Duplicate Entry',{timeOut:2000})
        }else{
          this.toastr.error('Error!','Something Went Wrong',{timeOut:2000})
        }
        
      })
    }

  
    
    
  }


  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }



  cancelForm() {
    // this.ConfigService.updateGridList();
    this.dialogRef.close();
  }

 
}

