import { Component, Inject } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Errors, Name_RegEx,CommonService, promptUpdated, invalidFileType, errorMessage } from '../../../core';
import { PromptsService } from '../prompts.service';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment.prod';
import { DidService } from '../../DID/did.service';
import { ToastrService } from 'ngx-toastr';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { PromptDetail } from '../../../core/models';

export interface PromptScreen {
  id: string, prompt_name: string, prompt_type: string, prompt_desc: string
}

const URL = environment.api_url + 'prompts';
// const URL = 'http://119.18.55.154:3000/prompts';
// const URL = 'http://localhost:3000/prompts';      


export let imagePath: any;
let _validFileExtensions = [".wav",".mp3"];

@Component({
  selector: 'app-view-prompts',
  templateUrl: './view-prompts.component.html',
  styleUrls: ['./view-prompts.component.css']
})
export class ViewPromptsComponent {
  error = '';
  filterForm: FormGroup;
  isFilter = false;
  columnDefs: any;
  dataSource: any = [];
  activeFeature: any[] = [];
  rowData: any;
  defaultPageSize = '10';
  public fields3: Object = { text: 'feature', value: 'id' };
  public fields9: Object = { text: 'name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder3: string = 'Select Prompt Type';

  constructor(
    private fb: FormBuilder,
    private promptsService: PromptsService,
    private router: Router,
    public dialog: MatDialog,
    private didService: DidService,
    public commonService: CommonService,
  ) {
    this.filterForm = this.fb.group({
      'by_name': [""],
      'by_type': [""]
    });
  }

  ngOnInit() {
    let user_id = localStorage.getItem('id');
    this.promptsService.displaySavedRecord.subscribe(() => {
      this.displayAllRecord();
    });

    // get active feature
    this.didService.getActiveFeature(user_id).subscribe(data => {
      this.activeFeature.unshift({id: '' , feature: 'Select Prompt'});
      if (data[0].conference == '1') {
        this.activeFeature.push({ id: '4', feature: 'Conference' });
      }
      if (data[0].ivr == '1') {
        this.activeFeature.push({ id: '3', feature: 'IVR' });
      }
      if (data[0].music_on_hold == '1') {
        this.activeFeature.push({ id: '1', feature: 'MOH' });
      }
      if (data[0].queue == '1') {
        this.activeFeature.push({ id: '5', feature: 'Queue' });
      }
      this.activeFeature.push({ id: '6', feature: 'Time Group' });
      if (data[0].voicemail == '1') {
        this.activeFeature.push({ id: '2', feature: 'Voice Mail' });
      }
      if (data[0].tele_consultancy == '1') {
        this.activeFeature.push({ id: '10', feature: 'TELE CONSULTATION' });
      }
      if (data[0].broadcasting == '1') {
        this.activeFeature.push({ id: '11', feature: 'BROADCAST' });
      }
      if (data[0].playback == '1') {
        this.activeFeature.push({ id: '12', feature: 'Playback' });
      }
      if (data[0].custom_prompt == '1') {
        this.activeFeature.push({ id: '15', feature: 'Ringtone' });
      }
      if (data[0].custom_prompt == '1') {
        this.activeFeature.push({ id: '16', feature: 'Call Group' });
      }
      this.activeFeature.push({ id: '17', feature: 'General' });

    });
  }

  Accountremovedspace = (event:any) => {
    const countryspace = event.text.trim().toLowerCase();
    const countryFilter = this.activeFeature.filter((data) =>{
      return data['feature'].toLowerCase().includes(countryspace);
    })
    event.updateData(countryFilter);
  }

  displayAllRecord() {
    let customer_id = localStorage.getItem('id');

    this.columnDefs = [
      // { field: 'id', headerName: 'ID', hide: true, width: 10 },
      // { field: 'company', headerName: 'User', hide: false, width: 10 },
      // { field: 'Login Time', headerName: 'login_time', hide: false, width: 10 },
      // { field: 'Login Machine IP', headerName: 'login_ip', hide: false, width: 10 },
      // { field: 'Log Out Time', headerName: 'logout_time', hide: false, width: 10 },
      // { field: 'Log Out Action Type', headerName: 'logout_cause', hide: false, width: 10 },
      { field: 'action', headerName: 'Action', hide: false, width: 10 }, 
      { field: 'id', headerName: 'ID', hide: true, width: 10 },
      { field: 'prompt_name', headerName: 'Name', hide: false, width: 10 },
      { field: 'prompt_type_name', headerName: 'Prompt For', hide: false, width: 10 },
      { field: 'prompt', headerName: 'Play Prompt', hide: false, width: 10 },
    

    ];

    if (this.isFilter) {
      const credentials = this.filterForm.value;
      credentials.customer_id = Number(customer_id);
      credentials.by_type = Number(credentials.by_type); 
      this.promptsService.filterPrompt(credentials).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    } else {
      this.promptsService.viewPrompt(customer_id).subscribe(pagedData => {
        pagedData = this.manageUserActionBtn(pagedData);
        this.dataSource = [];
        this.dataSource.push({ 'fields': this.columnDefs, 'data': pagedData });
      });
    }
  }

  onPageSizeChanged(newPageSize) {
    let value = newPageSize.value;
    this.defaultPageSize = value;
  }


  manageUserActionBtn(pagedData) {
    for (let i = 0; i < pagedData.length; i++) {
      let finalBtn = '';
      let filePath = '';
      finalBtn += "<span>";
      finalBtn += "<i class='fa fa-pencil-square-o edit-button' style='cursor:pointer; display: inline' data-action-type='edit' title='Edit'></i>";
      finalBtn += "<i class='fa fa-trash-o delete-button' style='cursor:pointer; display: inline' data-action-type='delete' title='Delete'></i>";
      if(pagedData[i]['flag'] == 1){
        finalBtn += "<i class='fa fa-users list-button' style='cursor:pointer; display: inline' data-action-type='destination-info' title='Info'></i>";
        }
      finalBtn += "</span>";

      filePath = '<audio controls="" preload="auto" controlsList="nodownload" height="32" style="float:left; margin-left:5px; width: 85%;">\
      <source src="'+ pagedData[i].file_path + '" type="audio/wav"/>\audio isn\'t supported.\</audio>';

      pagedData[i]['action'] = finalBtn;
      pagedData[i]['prompt'] = filePath;

      if(pagedData[i]['prompt_type'] == '1'){

        pagedData[i]['prompt_type_name'] = 'MOH';

      }else if(pagedData[i]['prompt_type'] == '2'){

        pagedData[i]['prompt_type_name'] = 'VOICE MAIL';

      }else if(pagedData[i]['prompt_type'] == '3'){

        pagedData[i]['prompt_type_name'] = 'IVR';

      }else if(pagedData[i]['prompt_type'] == '4'){

        pagedData[i]['prompt_type_name'] = 'CONFERENCE';

      }else if(pagedData[i]['prompt_type'] == '5'){

        pagedData[i]['prompt_type_name'] = 'QUEUE';

      }else if(pagedData[i]['prompt_type'] == '6'){

        pagedData[i]['prompt_type_name'] = 'TIME GROUP';

      }else if(pagedData[i]['prompt_type'] == '10'){

        pagedData[i]['prompt_type_name'] = 'TELE CONSULTATION';

      }else if(pagedData[i]['prompt_type'] == '11'){

        pagedData[i]['prompt_type_name'] = 'BROADCAST';

      }else if(pagedData[i]['prompt_type'] == '15'){

        pagedData[i]['prompt_type_name'] = 'RINGTONE';

      }else if(pagedData[i]['prompt_type'] == '16'){

        pagedData[i]['prompt_type_name'] = 'CALL GROUP';

      }else if(pagedData[i]['prompt_type'] == '17'){

        pagedData[i]['prompt_type_name'] = 'GENERAL';

      }else{
        pagedData[i]['prompt_type_name'] = '';
      }


    }
    return pagedData;
  }

  editPrompt(data) {
    this.openDialog(data);
  }

  openDialog(data?): void {
    const dialogRef = this.dialog.open(PromptDialog, {
      width: '60%',
      disableClose: true,
      data: {
        id: data ? data.id : null,
        prompt_name: data ? data.prompt_name : null,
        promptType: data ? data.prompt_type : null,
        prompt_desc: data ? data.prompt_desc : null,
        
      }
    });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode == 27) {
        dialogRef.close('Dialog closed');
      }
    });
    dialogRef.afterClosed().subscribe();
  }

  deletePrompt(data) {
    this.promptsService.getPromptAssociateOrNot(data.id, data.prompt_type).subscribe(result => {
      if (result.response[0].count > 0) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Oopss...</span>',
          html : "<span style='color:#FFFFFF;'>Prompt </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.prompt_name + "</span><span style='color:#FFFFFF;'> can't be deleted because it is associate with Features.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
      else {
    Swal.fire({
      title: '<span style="color:#FFFFFF;">Are you sure?</span>',
      html: "<span style='color:#FFFFFF;'>You will not be able to recover prompt </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.prompt_name + "</span><span style='color:#FFFFFF;'> in future!</span>",
      type: 'warning',
      showCancelButton: true,
      background: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it', 
      timer: 3000,
      preConfirm: () => {
        this.promptsService.deletePrompt(data.id, localStorage.getItem('id')).subscribe(data => {
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
          html: "<span style='color:#FFFFFF;'>Prompt </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.prompt_name + "</span> <span style='color:#FFFFFF;'> has been deleted.</span>",
          type: 'success',
          background: '#000000',
          timer : 3000
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: '<span style="color:#FFFFFF;">Cancelled</span>',
          html: "<span style='color:#FFFFFF;'>Prompt </span><span style ='color:red; font-weight :bold; font-size: 1.2em'>" + data.prompt_name + "</span> <span style='color:#FFFFFF;'> is safe.</span>",
          type: 'error',
          background: '#000000',
          timer: 3000
        });
      }
    })
  }
})
  }

  resetTable() {
    this.isFilter = false;
    this.displayAllRecord();
  }

  filterData() {
    this.isFilter = true;
    this.displayAllRecord();
  }

  manageAction(e) {
    let data = e.data;
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "edit":
        return this.editPrompt(data);
      case "delete":
        return this.deletePrompt(data);
        case "destination-info":
          return this.showMappedprompt(data);
    }
  }
  
  showMappedprompt(data) {
    this.router.navigate(["prompts/view/associate-prompt"], {
      queryParams: {
        promptId: data.id,
        ivrName: data.prompt_name,
        prompt_type: data.prompt_type
        // multilevel_ivr: data.is_multilevel_ivr,
      },
    });
  }
  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoPromptDialog, {
      width: '80%', disableClose: true, autoFocus:false,
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
      console.log('Dialog closed');
    });
  }
}

@Component({
  selector: 'infoPrompt-dialog',
  templateUrl: 'infoPrompt-dialog.html',
})

export class InfoPromptDialog {
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoPromptDialog>, @Inject(MAT_DIALOG_DATA) public data: PromptDetail,
  ) {}
 
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

@Component({
  selector: 'prompt-dialog',
  templateUrl: 'prompt-dialog.html',
})

export class PromptDialog {
  error = '';
  errors: Errors = { errors: {} };
  promptForm: FormGroup;
  submitted = false;
  selectedFile = null;
  imagePath1 = "";
  user_id = '';
  activeFeature: any[] = [];
  isEdit = false;
  prompts = '';
  pageloader: boolean;
  promptData: any = {};
  public fields3: Object = { text: 'feature', value: 'id' };
  public fields9: Object = { text: 'name', value: 'id' };
  public popupHeight: string = '200px';
  public popupWidth: string = '200px';
  public placeholder3: string = 'Select Prompt Type';

  public uploader: FileUploader = new FileUploader({
    url: URL, itemAlias: 'prompt',
    allowedFileType: ['audio'], method: 'post',
    maxFileSize: 1024 * 1024 * 1
  });

  constructor(
    public dialogRef: MatDialogRef<PromptDialog>, @Inject(MAT_DIALOG_DATA) public data: PromptDetail,
    private formBuilder: FormBuilder,
    public promptsService: PromptsService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private didService: DidService
  ) {
    this.promptForm = this.formBuilder.group({
      'promptType': ["", [Validators.required]],
      'prompt_description': ['', [ Validators.maxLength(200)]],
      'prompt_name': ['', [Validators.required, Validators.pattern(Name_RegEx)]],
      'prompt': ['', Validators.required]
    });
  }

  get prompt() { return this.promptForm.get('prompt'); }
  get prompt_name() { return this.promptForm.get('prompt_name'); }
  get promptType() { return this.promptForm.get('promptType'); }
  get prompt_description() { return this.promptForm.get('prompt_description'); }

  ngOnInit() {
    if (this.data.id) {
      this.isEdit = true;
      this.promptData = this.data;
      if(this.promptData.promptType=='1'){
        this.prompts = 'MOH';
      }else if(this.promptData.promptType=='2'){
        this.prompts = 'VOICE MAIL';
      }else if(this.promptData.promptType=='3'){
        this.prompts = 'IVR';
      }else if(this.promptData.promptType=='4'){
        this.prompts = 'CONFERENCE';
      }else if(this.promptData.promptType=='5'){
        this.prompts = 'QUEUE';
      }else if(this.promptData.promptType=='6'){
        this.prompts = 'TIME GROUP';
      }else if(this.promptData.promptType=='10'){
        this.prompts = 'TELE CONSULTATION';
      }else if (this.promptData.promptType == '11') {
        this.prompts = 'BROADCAST';
      }else if (this.promptData.promptType == '15') {
        this.prompts = 'RINGTONE';
      }else if (this.promptData.promptType == '16') {
        this.prompts = 'CALL GROUP';
      }else if (this.promptData.promptType == '17') {
        this.prompts = 'GENERAL';
      }
      this.promptForm.controls.prompt.clearValidators();
      this.promptForm.controls.prompt.updateValueAndValidity();

    } else {
      this.promptData['prompt_desc'] = "";
      this.isEdit = false;
    }
    this.user_id = localStorage.getItem('id');
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      imagePath = URL + item.file.name;
      this.imagePath1 = item.file.name;
    };    
     this.uploader.onCompleteItem= (a,b,c) => { 
      };

    this.uploader.onCompleteAll = () => {
      this.pageloader = false;
      // this.toastr.success('Success!', '', { timeOut: 2000 });
      this.promptsService.updateGridList();  ////////for table refresh
      this.dialogRef.close();
    }

    this.uploader.response.subscribe(res => {
     let responseCode = parseInt(res.toString().match(/\d+/g)[0]);
      if (responseCode == 409) {
        this.toastr.error('Error!', 'Prompt Name is already Exist', { timeOut: 2000 });
      } else {
        this.toastr.success('Success!', 'Prompt Uploaded Successfully!', { timeOut: 2000 });
      }
    });

    // this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
    //   this.toastr.error('Error!', invalidFileType, { timeOut: 2000 });
    // }

    // get active feature
    this.didService.getActiveFeature(this.user_id).subscribe(data => {
      if (data[0].conference == '1') {
        this.activeFeature.push({ id: '4', feature: 'CONFERENCE' });
      }
      if (data[0].ivr == '1') {
        this.activeFeature.push({ id: '3', feature: 'IVR' });
      }
      if (data[0].music_on_hold == '1') {
        this.activeFeature.push({ id: '1', feature: 'MOH' });
      }
      if (data[0].queue == '1') {
        this.activeFeature.push({ id: '5', feature: 'QUEUE' });
      }
      this.activeFeature.push({id: '6', feature: 'TIME GROUP'});
      if (data[0].voicemail == '1') {
        this.activeFeature.push({ id: '2', feature: 'VOICE MAIL' });
      }
      if (data[0].tele_consultancy == '1') {
        this.activeFeature.push({ id: '10', feature: 'TELE CONSULTATION' });
      }
      if (data[0].broadcasting == '1') {
        this.activeFeature.push({ id: '11', feature: 'BROADCAST' });
      }
      if (data[0].custom_prompt == '1') {
        this.activeFeature.push({ id: '15', feature: 'RINGTONE' });
      }
      if (data[0].custom_prompt == '1') {
        this.activeFeature.push({ id: '16', feature: 'CALL GROUP' }); 
      }
      this.activeFeature.push({ id: '17', feature: 'GENERAL' }); //Its latest id =17

    });

  }

  Accountremovedspace = (event:any) => {
    const countryspace = event.text.trim().toLowerCase();
    const countryFilter = this.activeFeature.filter((data) =>{
      return data['feature'].toLowerCase().includes(countryspace);
    })
    event.updateData(countryFilter);
  }

  uploadPrompt(){
    this.filterPrompt();
    this.uploader.uploadAll();
  }

  filterPrompt(){
    let feature = this.promptForm.get('promptType').value;    
    let feature_name = this.activeFeature.filter(item => item.id == feature)[0]['feature']    
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('promptType', this.promptForm.value.promptType); //note comma separating key and value
      form.append('prompt_description', this.promptForm.value.prompt_description); //note comma separating key and value
      form.append('user_id', localStorage.getItem('id'));
      form.append('prompt_name', this.promptForm.value.prompt_name);
      form.append('feature_name', feature_name);
    };

  }
  Validate(fileEvent: any) {
    const oInput = fileEvent.target.files[0];
    let sFileName = oInput.name;
    // let result = sFileName.replace(/\s/g, "");
    let result = sFileName.replace(/[^\w.]/g, '');
    console.log(result,"--result--");
    
    let blnValid = false;
    for (let j = 0; j < _validFileExtensions.length; j++) {
      let sCurExtension = _validFileExtensions[j];
      if (result.substr(result.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
        blnValid = true;
        break;
      }
      // else{
      //   blnValid = true;
      //   break;
      // }
    }    
    if (!blnValid) {
      this.toastr.error('Error!', "Sorry, " + result + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "), { timeOut: 4000 });
      //alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
      fileEvent.srcElement.value = null;
      this.promptForm.get('prompt').setValue('');
      this.promptForm.get('prompt').updateValueAndValidity();
      return false;
    }
  }

  submitPromptForm() {
    
    if (this.promptForm.valid) {
      this.submitted = true;
      const credentials = this.promptForm.value;
      // credentials.prompt = credentials.prompt.replace(/\s/g, "")
      // credentials.prompt = credentials.prompt.replace(/[^A-Z0-9]/ig, "_")
      credentials.prompt = credentials.prompt.replace(/[^\w.]/g, '');
      credentials.id = Number(this.data.id);
      credentials.promtTypeId = Number(this.promptData.promptType)
      credentials.customer_id = Number(localStorage.getItem('id'));
      this.promptsService.updatePrompts(credentials)
        .subscribe(data => {
          if(data['code'] === 409){
            this.toastr.error('Error!', data['error_msg'], { timeOut: 2000 });
          }else{
            this.toastr.success('Success!', promptUpdated, { timeOut: 2000 });
          }
          this.promptsService.updateGridList();
          this.dialogRef.close();

        }, err => {
          this.error = err;
          this.toastr.error('Error!', errorMessage, { timeOut: 2000 });
        });
    }
  }

  onNoClick(e): void {
    this.dialogRef.close();
    e.preventDefault();
  }


}