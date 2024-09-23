import { Component, OnInit, Inject } from '@angular/core';
import { Errors, CommonService, formError, EMAIL_RegEx, errorMessage, voicemailUpdated, voicemailCreated } from '../../../core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VoicemailService } from '../voicemail.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-voicemail-settings',
  templateUrl: './voicemail-settings.component.html',
  styleUrls: ['./voicemail-settings.component.css']
})
export class VoicemailSettingsComponent implements OnInit {
  errors: Errors = { errors: {} };
  voicemailSettingsForm: FormGroup;
  submitted = false;
  error = "";
  voicemailData: any = {}
  isotherEmail = false;
  checkForm: any;
  voicemailOtherEmail = '';
  voicemailExists = false;
  voicemailId: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private commonService: CommonService,
    private voicemailService: VoicemailService,
    public dialog: MatDialog

  ) {
    this.voicemailSettingsForm = this.formBuilder.group({
      'voicemailToEmail': [''],
      'delVoicemailAfterEmail': [''],
      'deliverVoicemailTo': [''],
      'announceCallerID': [''],
      'otherEmail': ['', [Validators.required, Validators.pattern(EMAIL_RegEx)]],
    });
  }

  get otherEmail() { return this.voicemailSettingsForm.get('otherEmail'); }

  ngOnInit() {
    this.voicemailSettingsForm.controls.otherEmail.disable();
    this.voicemailService.viewVoiceMailById({ id: Number(localStorage.getItem('id')) }).subscribe(data => {
      this.voicemailId = data ? data[0].id : null;      
      if (data) {
        this.voicemailData = data[0];
        this.voicemailSettingsForm.patchValue(data[0]);
        this.voicemailSettingsForm.updateValueAndValidity();
        this.voicemailExists = true;
        if (data[0].deliverVoicemailTo === 1) {
          this.voicemailSettingsForm.controls.otherEmail.enable();
          this.voicemailSettingsForm.controls['otherEmail'].updateValueAndValidity();
          this.voicemailSettingsForm.updateValueAndValidity();
          // this.isotherEmail = true;
        } else {
          this.voicemailSettingsForm.controls.otherEmail.disable();
          this.isotherEmail = false;
        }
        console.log(this.voicemailSettingsForm.value)
        console.log(this.voicemailSettingsForm.valid)
      }
    }, err => {
      this.error = err.message;
    });
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.voicemailSettingsForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  showDeliverVoiceMail(event) {
    let deliver_voice_mail = event.checked;
    if (deliver_voice_mail == true) {
      this.voicemailSettingsForm.controls.otherEmail.enable();
      // this.isotherEmail = true;
    } else {
      this.voicemailSettingsForm.get('otherEmail').setValue('');
      this.voicemailSettingsForm.controls.otherEmail.disable();
      this.voicemailSettingsForm.controls['otherEmail'].updateValueAndValidity();
      // this.isotherEmail = false;
    }
  }

  submitVoicemailSettings() {
    this.checkForm = this.findInvalidControls();
    if (this.voicemailSettingsForm.valid) {
      this.submitted = true;
      const credentials = this.voicemailSettingsForm.value;
      credentials.extension_id = Number(localStorage.getItem('id'));

      // console.log('@@',this.voicemailId)
      credentials.id = this.voicemailId ? this.voicemailId : null;

      this.voicemailService.createVoicemail('createVoicemail', credentials)
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
    else {
      this.toastr.error('Error!', formError + ' ' + this.checkForm, { timeOut: 2000 });
    }
  }

  showInfo() {
    const dialogRefInfo = this.dialog.open(InfoVoicemailSettingDialog, {
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
      console.log('Dialog closed');
    });
  }

}

@Component({
  selector: 'infoVoicemailSetting-dialog',
  templateUrl: 'infoVoicemailSetting-dialog.html',
})

export class InfoVoicemailSettingDialog {
  constructor(
    private router: Router,
    public dialogRefInfo: MatDialogRef<InfoVoicemailSettingDialog>, @Inject(MAT_DIALOG_DATA) public data: '',
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
