import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';  
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { HttpClientModule } from  '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SMSMsgReportDialog } from './view-customer-sms-report/view-customer-sms-report.component';
import { SmsRoutingModule } from './sms-routing.module';
import { SmsDialog, ViewSmsComponent } from './view-sms/view-sms.component';
import { ApiConfigDialog, ViewApiConfigComponent } from './view-api-config/view-api-config.component';
import { InfoSMSTemplateDialog, SmsTemplateDialog, ViewCustomerTemplateComponent } from './view-customer-template/view-customer-template.component';
import { SmsConfigComponent } from './sms-config/sms-config.component';
import { ViewUsersComponent } from './view-users/view-users.component';
import { UserListResolver } from './userList-resolver';
import { ViewCustomerSmsPlanComponent } from './view-customer-sms-plan/view-customer-sms-plan.component';
import { ViewAdminSmsReportComponent } from './view-admin-sms-report/view-admin-sms-report.component';
import { InfoSMSReportDialog, ViewCustomerSmsReportComponent } from './view-customer-sms-report/view-customer-sms-report.component';
// import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ViewProvidersComponent } from './view-providers/view-providers.component';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import {MatIconModule} from '@angular/material/icon';


@NgModule({
  declarations: [ViewSmsComponent,SmsDialog, ViewApiConfigComponent, ApiConfigDialog,
                 ViewCustomerTemplateComponent, SmsTemplateDialog, SmsConfigComponent, ViewUsersComponent,
                  ViewCustomerSmsPlanComponent, ViewAdminSmsReportComponent, ViewCustomerSmsReportComponent,
                   InfoSMSTemplateDialog, InfoSMSReportDialog, ViewProvidersComponent,SMSMsgReportDialog],
  imports: [
    MatIconModule,
    CheckBoxModule,
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    CommonModule,
    SmsRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    NgxDatatableModule,
    SharedModule,
    MaterialComponents,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    MultiSelectModule  
  ],
  providers:[UserListResolver, CheckBoxSelectionService],
  entryComponents: [SmsDialog,ApiConfigDialog,SmsTemplateDialog, InfoSMSTemplateDialog, InfoSMSReportDialog, SMSMsgReportDialog],
})
export class SmsModule { }
