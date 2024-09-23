import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { HttpClientModule } from  '@angular/common/http';

import { AppointmentAddIvrDialog, AppointmentIvrComponent, InfoAppointmentIVRDialog } from './appointment-ivr/appointment-ivr.component';
import { AppointmentRoutingModule } from './appointment-routing.module';
import { ViewAppointmentCdrComponent } from './view-appointment-cdr/view-appointment-cdr.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { AppointmentHistoryComponent } from './appointment-history/appointment-history.component';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';






@NgModule({
  declarations: [AppointmentIvrComponent, AppointmentAddIvrDialog, ViewAppointmentCdrComponent, InfoAppointmentIVRDialog, AppointmentHistoryComponent],
  imports: [
    AppointmentRoutingModule,
    CommonModule,FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    NgxDatatableModule,
    SharedModule,
    MaterialComponents,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    MultiSelectModuleNag,
    ColorPickerModule,
    ChipListModule,
    TooltipModule,
    ButtonModule,
    MultiSelectModule,
    DropDownListModule
  ],
  entryComponents: [AppointmentAddIvrDialog, InfoAppointmentIVRDialog],
  providers : [CheckBoxSelectionService]

})
export class AppointmentModule { }
