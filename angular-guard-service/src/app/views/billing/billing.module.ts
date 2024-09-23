import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BillingRountingModule, billingComponents } from './billing.routing';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { InfoBillingDialog} from '../billing/billing/billing.component';
import { InfoCustomerBillingDialog } from '../billing/customer-billing/customer-billing.component';
import { InfoLogPaymentDialog } from '../billing/log-payment/log-payment.component';
import { AddUserBalanceDialog } from '../billing/log-payment/log-payment.component';
import { LogEPaymentComponent, InfoLogEPaymentDialog } from './log-e-payment/log-e-payment.component';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { BillingAdvanceExcelDialog } from '../billing/customer-billing/customer-billing.component';

@NgModule({
  declarations: [billingComponents,BillingAdvanceExcelDialog,InfoCustomerBillingDialog,InfoBillingDialog,InfoLogPaymentDialog,InfoLogEPaymentDialog,AddUserBalanceDialog, LogEPaymentComponent],
  imports: [
    CommonModule,
    BillingRountingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    MaterialComponents,
    MultiSelectModule,
    DropDownListModule
  ],
  entryComponents: [InfoCustomerBillingDialog,InfoBillingDialog,InfoLogPaymentDialog,InfoLogEPaymentDialog,AddUserBalanceDialog,BillingAdvanceExcelDialog],
  providers: [CheckBoxSelectionService]
})
export class BillingModule { }
