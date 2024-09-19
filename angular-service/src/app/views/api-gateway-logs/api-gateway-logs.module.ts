import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiGatewayLogsRoutingModule } from './api-gateway-logs-routing.module';
import { ViewApiLogsComponent } from './view-api-logs/view-api-logs.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatDatepickerModule,MatNativeDateModule} from '@angular/material';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import { ViewTcAuditLogsComponent } from './view-tc-audit-logs/view-tc-audit-logs.component';
import { InfoPackageLogDialog, ViewPackageAuditLogComponent } from './view-package-audit-log/view-package-audit-log.component';
import {InfoApiLogDialog} from './view-api-logs/view-api-logs.component'
import { ViewAuditLogsComponent, AuditLogInfoDialog } from './view-audit-logs/view-audit-logs.component'
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ViewSmtpAuditLogsComponent } from './view-smtp-audit-logs/view-smtp-audit-logs.component';

@NgModule({
  declarations: [ViewApiLogsComponent,InfoPackageLogDialog, ViewTcAuditLogsComponent, ViewPackageAuditLogComponent,InfoApiLogDialog, ViewAuditLogsComponent, AuditLogInfoDialog, ViewSmtpAuditLogsComponent],
  imports: [
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    MultiSelectModule,
    CheckBoxModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    MaterialComponents,
    MatDatepickerModule,
    MatNativeDateModule,
    ApiGatewayLogsRoutingModule
  ],
  entryComponents: [InfoPackageLogDialog,InfoApiLogDialog, AuditLogInfoDialog],
})
export class ApiGatewayLogsModule { }
