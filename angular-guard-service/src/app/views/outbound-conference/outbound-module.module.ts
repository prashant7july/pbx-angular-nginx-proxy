import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutboundModuleRoutingModule } from './outbound-module-routing.module';
import { OutboundService } from './outbound.service';
import { OutboundConferenceComponent, importoutboundContactDialog,livestatusoutboundDialog } from './outbound-conference.component';
import { outboundDialog} from './outbound-conference.component';
import { MaterialComponents } from '../../core/material-ui';  
import {MatSelectModule} from '@angular/material/select';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatOptionModule } from '@angular/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import {CalendarModule} from 'primeng/calendar';
import { FileSelectDirective, FileUploadModule } from 'ng2-file-upload';
import { OutboundConferenceCdrComponent } from './outbound-conference-cdr/outbound-conference-cdr.component';
import { OcInstanceReportComponent, ocreportDialog } from './oc-instance-report/oc-instance-report.component';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { OcRecordingComponent } from './oc-recording/oc-recording.component';






@NgModule({
  declarations: [OutboundConferenceComponent,outboundDialog, ocreportDialog, OutboundConferenceCdrComponent, OcInstanceReportComponent,importoutboundContactDialog,livestatusoutboundDialog, OcRecordingComponent],
  imports: [
    CommonModule,
    OutboundModuleRoutingModule,   MatSelectModule,
    MatOptionModule,
    CommonModule,
    MaterialComponents,
    FormsModule ,
    SharedModule,
    HttpClientModule,
    MatFormFieldModule,
    CalendarModule,
    MatInputModule,
    NgMultiSelectDropDownModule,
    ChipListModule,
    TooltipModule,
    MultiSelectModule,
    DropDownListModule,
    FileUploadModule,
    MatDatepickerModule,
    MatNativeDateModule,
    BsDatepickerModule.forRoot(),

  ],
  providers: [OutboundService],
  entryComponents: [outboundDialog, ocreportDialog,importoutboundContactDialog,livestatusoutboundDialog],

})
export class OutboundModuleModule { }
