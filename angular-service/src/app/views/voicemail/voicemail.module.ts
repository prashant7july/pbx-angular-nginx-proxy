import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {VoicemailRoutingModule ,VoicemailComponent } from './voicemail.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { FileSelectDirective, FileUploadModule } from 'ng2-file-upload';
import { InfoVoicemailSettingDialog } from '../voicemail/voicemail-settings/voicemail-settings.component';
import { InfoVoicemaillistDialog } from '../voicemail/voicemail-list/voicemail-list.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';


@NgModule({
  declarations: [VoicemailComponent,InfoVoicemailSettingDialog,InfoVoicemaillistDialog],
  imports: [
    CommonModule,
    VoicemailRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    MaterialComponents,
    SharedModule,
    FileUploadModule,
    BsDatepickerModule.forRoot(),
  ],
  entryComponents:[InfoVoicemailSettingDialog,InfoVoicemaillistDialog],
})
export class VoicemailModule { }
