import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeGroupRoutingModule, timegroupComponents } from './time-group.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
// import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { TimeGroupDialog, InfoTimeGroupDialog } from '../../views/time-group/view-time-group/view-time-group.component';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { HolidayDialog, InfoHolidayDialog, ImportXLDialog } from '../../views/time-group/create-holiday/create-holiday.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [timegroupComponents, TimeGroupDialog, HolidayDialog, InfoTimeGroupDialog, InfoHolidayDialog,ImportXLDialog],
  imports: [
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    CheckBoxModule,
    CommonModule,
    TimeGroupRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgxDatatableModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    MultiSelectModule,
    CalendarModule,
    MaterialComponents,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule
  ],
  entryComponents: [TimeGroupDialog, HolidayDialog, InfoTimeGroupDialog, InfoHolidayDialog,ImportXLDialog],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'LL'
        },
        display: {
          dateInput: 'DD-MM-YYYY',
          monthYearLabel: 'YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'YYYY'
        }
      },
    },
  ],
})
export class TimeGroupModule { }
