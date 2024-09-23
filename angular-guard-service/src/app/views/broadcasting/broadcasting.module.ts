import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BroadcastingRoutingModule } from './broadcasting-routing.module';
import { AddBCDialog, InfoBroadcastListDialog, ManageBroadcastDialog, ViewBcListComponent } from './view-bc-list/view-bc-list.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialComponents } from '../../core/material-ui';
import { PickListModule } from 'primeng/picklist';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {CalendarModule} from 'primeng/calendar';
import { InfoBroadcastCDRDialog, ViewBcCdrComponent } from './view-bc-cdr/view-bc-cdr.component';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';


@NgModule({
  declarations: [ViewBcListComponent, AddBCDialog, ViewBcCdrComponent, InfoBroadcastListDialog, InfoBroadcastCDRDialog,ManageBroadcastDialog],
  imports: [
    CommonModule,
    BroadcastingRoutingModule,
    CommonModule,
    SharedModule, 
    FormsModule, 
    ReactiveFormsModule,
    MaterialComponents,
    PickListModule,
    MultiSelectModule,
    BsDatepickerModule.forRoot(),
    CalendarModule,
    ChipListModule,
    TooltipModule,
    ButtonModule,
    DropDownListModule
  ],
  entryComponents: [AddBCDialog, InfoBroadcastListDialog, InfoBroadcastCDRDialog,ManageBroadcastDialog],
  providers : [CheckBoxSelectionService]

})
export class BroadcastingModule { }
