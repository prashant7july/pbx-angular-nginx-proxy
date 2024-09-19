import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RecordingRoutingModule ,RecordingComponent } from './recording.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MaterialComponents } from '../../core/material-ui'; 
import { SharedModule } from '../../shared/shared.module';
import {InfoRecordingDialog} from '../../views/recording/recoding-features/recoding-features.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [RecordingComponent,InfoRecordingDialog],
  imports: [
    CommonModule,
    RecordingRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    MaterialComponents,
    SharedModule,
    BsDatepickerModule.forRoot(),
  ],
  entryComponents: [InfoRecordingDialog],
})
export class RecordingModule { }
