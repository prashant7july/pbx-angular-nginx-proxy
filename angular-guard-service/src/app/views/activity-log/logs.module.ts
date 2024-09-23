import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LOGRoutingModule, logComponents } from './logs.routing';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatDatepickerModule,MatNativeDateModule} from '@angular/material';
import {MAT_DATE_FORMATS} from '@angular/material/core';

@NgModule({
  declarations: [logComponents],
  imports: [
    CommonModule,
    LOGRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    MaterialComponents,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  entryComponents: [],
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
export class LogModule { }
