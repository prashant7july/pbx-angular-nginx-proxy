import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ConferenceRoutingModule, conferenceComponents } from './conference.routing';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from '../../shared/shared.module';
import { ConferenceDialog, ViewConferenceComponent, InfoConferenceDialog } from '../../views/conference/view-conference/view-conference.component';
import { MaterialComponents } from '../../core/material-ui';  
import {CalendarModule} from 'primeng/calendar';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ConferenceCDRComponent } from './conference-cdr/conference-cdr.component';
import {ConferenceCdrDialog,ConferenceCdrAdvanceExcelDialog,ListDialog} from './conference-cdr/conference-cdr.component'



@NgModule({
  declarations: [conferenceComponents,ConferenceDialog,InfoConferenceDialog, ConferenceCDRComponent,ConferenceCdrDialog,ConferenceCdrAdvanceExcelDialog,ListDialog],
  imports: [
    CommonModule,
    ConferenceRoutingModule ,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    NgxDatatableModule,
    BsDatepickerModule.forRoot(),
    MultiSelectModule,
    SharedModule,
    MaterialComponents,
    CalendarModule,
    CheckBoxModule,
    ChipListModule,
    TooltipModule,
    DropDownListModule,
    
  ],
  entryComponents: [ConferenceDialog,InfoConferenceDialog,ConferenceCdrDialog,ConferenceCdrAdvanceExcelDialog,ListDialog],
  providers: [ViewConferenceComponent,CheckBoxSelectionService],
})
export class ConferenceModule { }
