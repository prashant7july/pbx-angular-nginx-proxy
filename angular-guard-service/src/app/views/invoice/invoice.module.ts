import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InvoiceComponent,InvoiceRoutingModule } from './invoice.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MaterialComponents } from '../../core/material-ui'; 
import { SharedModule } from '../../shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PayInvoiceComponent } from './pay-invoice/pay-invoice.component';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { AdminPayInvoiceComponent } from './view-invoice-list/view-invoice-list.component';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';


@NgModule({
  declarations: [InvoiceComponent, PayInvoiceComponent,AdminPayInvoiceComponent],
  imports: [
    InvoiceRoutingModule,
    CommonModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    MaterialComponents,
    SharedModule,
    BsDatepickerModule.forRoot(),
    DropDownListModule,MultiSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,

  ],
  entryComponents: [PayInvoiceComponent,AdminPayInvoiceComponent],
  providers : [CheckBoxSelectionService,
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
  ]
})
export class InvoiceModule { }
