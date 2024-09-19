import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialComponents } from '../../core/material-ui';
import { PickListModule } from 'primeng/picklist';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {CalendarModule} from 'primeng/calendar';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import {AddOBDDialog, importContactDialog,InfoDialog,livestatusobdDialog} from './obd.component'
import { ObdRoutingModule } from './obd-routing';
import { ObdComponent } from './obd.component';
import { FileUploadModule } from 'ng2-file-upload';
import { ObdCdrComponent } from './obd-cdr/obd-cdr.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { ObdInstanceReportComponent, obdreportDialog } from './obd-instance-report/obd-instance-report.component';
import { ObdRecordingsComponent } from './obd-recordings/obd-recordings.component';
import { AddIntegrationDialog, ObdThirdPartyIntegrationComponent } from './obd-third-party-integration/obd-third-party-integration.component';
import { ObdApiCdrComponent } from './obd-api-cdr/obd-api-cdr.component';

@NgModule({
  declarations: [ObdComponent,AddOBDDialog, ObdCdrComponent, ObdInstanceReportComponent,obdreportDialog,importContactDialog,livestatusobdDialog,InfoDialog, ObdRecordingsComponent, ObdThirdPartyIntegrationComponent, AddIntegrationDialog, ObdApiCdrComponent],
  imports: [
    CommonModule,
    ObdRoutingModule,
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
    DropDownListModule,
    FileUploadModule,AgGridModule
  ],
  entryComponents: [AddOBDDialog,obdreportDialog,importContactDialog,livestatusobdDialog,InfoDialog,AddIntegrationDialog],
  providers : [CheckBoxSelectionService]
})
export class ObdModule { }
