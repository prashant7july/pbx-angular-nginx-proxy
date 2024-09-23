import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CDRRoutingModule, cdrComponents } from './cdr.routing';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import {AccountManagerAdvanceExcelDialog, InfoAccountManagerCdrDialog } from '../cdr/account-manager-cdr/account-manager-cdr.component';
import { AdvanceExcelDialog, InfoAdminCdrDialog } from '../cdr/admin-cdr/admin-cdr.component';
import { CustomerAdvanceExcelDialog, InfoCustomerCdrDialog, LocationDialog } from '../cdr/customer-cdr/customer-cdr.component';
import { InfoExtensionCdrDialog } from '../cdr/extension-cdr/extension-cdr.component';
import { SupportAdvanceExcelDialog,InfoSupportCdrDialog } from '../cdr/support-cdr/support-cdr.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CustomerFeedbackReportComponent } from './customer-feedback-report/customer-feedback-report.component';
import { AgmCoreModule } from '@agm/core';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CustomerStickyAgentReportComponent } from './customer-sticky-agent-report/customer-sticky-agent-report.component';
import { AccountManagerIpComponent } from './account-manager-ip/account-manager-ip.component';
import {ViewTicketComponent,TicketDialog} from '../ticket/view-ticket/view-ticket.component'
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { TicketModule } from '../ticket/ticket.module';
import {speechToTextDialog} from '../cdr/customer-cdr/customer-cdr.component'

@NgModule({
  declarations: [cdrComponents,InfoAccountManagerCdrDialog,InfoAdminCdrDialog,InfoCustomerCdrDialog,
    InfoExtensionCdrDialog,InfoSupportCdrDialog, CustomerFeedbackReportComponent,LocationDialog,AdvanceExcelDialog, CustomerStickyAgentReportComponent,CustomerAdvanceExcelDialog,AccountManagerAdvanceExcelDialog, SupportAdvanceExcelDialog, AccountManagerIpComponent,speechToTextDialog],
  imports: [
    TicketModule,
    CommonModule,
    CDRRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    ChipListModule,
    MultiSelectModule,
    RichTextEditorAllModule,
    TooltipModule,DropDownListModule,
    MaterialComponents,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCh2UWaDQaWJdsrilNjkW6TkH6sYVtMO2w'  //  AIzaSyCh2UWaDQaWJdsrilNjkW6TkH6sYVtMO2w
    })
  ],
  entryComponents: [InfoAccountManagerCdrDialog,InfoAdminCdrDialog,InfoCustomerCdrDialog,
    InfoExtensionCdrDialog,InfoSupportCdrDialog, LocationDialog, AdvanceExcelDialog, CustomerAdvanceExcelDialog, AccountManagerAdvanceExcelDialog, SupportAdvanceExcelDialog,speechToTextDialog],
    providers : [CheckBoxSelectionService,ViewTicketComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Add this line if needed

})
export class CdrModule { }
