import { Component, OnInit,Inject} from '@angular/core';
import { Errors, CommonService, ExtensionService } from '../../../core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router,NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExtensionSettingsService } from '../extension-settings.service';
import { CallForwardService } from '../../call-forward/call-forward.service'; 
import { DashboardService } from '../../dashboard/dashboard.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PromptsService } from '../../prompts/prompts.service';

@Component({
  selector: 'app-create-extension-settings',
  templateUrl: './create-extension-settings.component.html',
  styleUrls: ['./create-extension-settings.component.css']
})
export class CreateExtensionSettingsComponent implements OnInit {
  errors: Errors = { errors: {} };
  extensionSettingsForm: FormGroup;
  submitted = false;
  error = "";
  settings: any = {};
  callForward :any={};
  disableCallForward = false;
  disableRingtone = false;
  callForwardStatus :any=0;
  ringtoneList : any = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private commonService: CommonService,
    private extensionSettingsService: ExtensionSettingsService,
    private callForwardService: CallForwardService,
    private dashboardService:DashboardService,
    public dialog: MatDialog,
    private promptsService: PromptsService,
    private extensionService: ExtensionService
  ) {
    this.extensionSettingsForm = this.formBuilder.group({
      'dnd': [''],
      'callForward':[''],
      'ringtone':['']
    });
  }

  ngOnInit() {
    //get extension features
    this.dashboardService.getExtensionDashboardFeatures(localStorage.getItem('id')).subscribe(data => {
      this.disableCallForward = data.forward == '1' ? true :false;
      this.disableRingtone = data.ringtone == '1' && data.custom_prompt_package == '1' ? true :false;
      console.log(data.ringtone)
      console.log(this.disableRingtone);
      
    }, err => {
      this.errors = err.message;
    });

    this.extensionSettingsService.getExtensionSetting({id:Number(localStorage.getItem('id'))}).subscribe(data => {
      this.settings = data[0];
    }, err => {
      this.error = err.message;
    });

    this.callForwardService.viewCallForwardById({id:Number(localStorage.getItem('id'))}).subscribe(data => {
      //console.log(data);
      this.callForward = data[0].status; 
      this.callForwardStatus = this.callForward == '0' ? 0 : 1;
      //console.log(' this.callForwardStatus==', this.callForwardStatus);
    }, err => {
      this.error = err.message;
    });

    

    let user_id = localStorage.getItem("id");
    this.extensionService.getExtensionById(user_id).subscribe(data => {
      let ext_admin_id = data.response[0] ? (data.response[0].customer_id) : 0;
      let obj = {};
      obj['by_name'] = "";
      obj['by_type'] = 15;
      obj['customer_id'] = ext_admin_id;
      this.promptsService.filterPrompt(obj).subscribe(pagedData => {
        this.ringtoneList = pagedData;
      });
    });

    
  }

  submitExtensionSettings() {
    this.submitted = true;
    const credentials = this.extensionSettingsForm.value;

    credentials.id = Number(localStorage.getItem('id'));
    //console.log(credentials);
    this.extensionSettingsService.updateExtensionSettings('updateExtensionSettings', credentials)
      .subscribe(data => {
        if (data['code'] == 200) {
          this.toastr.success('Success!', data['message'], { timeOut: 2000 });
          this.router.navigateByUrl('dashboard/extensionDashboard');
        }
        else {
          this.toastr.error('Error!', data['message'], { timeOut: 2000 });
        }
      });
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoExtensionSettingDialog, {
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
  selector: 'infoExtensionSetting-dialog',
  templateUrl: 'infoExtensionSetting-dialog.html',
})

export class InfoExtensionSettingDialog {
  constructor(
    private router:Router,
    public dialogRefInfo: MatDialogRef<InfoExtensionSettingDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
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
