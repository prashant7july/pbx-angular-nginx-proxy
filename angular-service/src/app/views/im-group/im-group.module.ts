import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImGroupRoutingModule  } from '../im-group/im-group-routing.module'; 
import { ImGroupComponent } from './im-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CalendarModule } from 'primeng/calendar';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { HolidayDialog, InfoHolidayDialog, ImportXLDialog } from '../../views/time-group/create-holiday/create-holiday.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';

import {MatFormFieldModule} from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
// import {ImGroupDialog} from './im-group.component'
import { ImGroupDialog } from './im-group.component';

@NgModule({
  declarations: [ImGroupComponent,ImGroupDialog],
  imports: [
    MatOptionModule,
    MatFormFieldModule,
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    CheckBoxModule,
    CommonModule,
    ImGroupRoutingModule,
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
    NgxMaterialTimepickerModule,
  ],
  entryComponents: [ImGroupDialog],
  providers: [CheckBoxSelectionService,
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
export class ImGroupModule { }
