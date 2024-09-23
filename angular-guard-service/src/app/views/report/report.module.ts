import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { DateHourWiseCallsComponent } from './date-hour-wise-calls/date-hour-wise-calls.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { HttpClientModule } from  '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DateWiseCallChargesComponent } from './date-wise-call-charges/date-wise-call-charges.component';
import { CustomersCallChargesComponent } from './customers-call-charges/customers-call-charges.component';
import { CustomersCallDetailComponent } from './customers-call-detail/customers-call-detail.component';
import { ProvidersCallChargesComponent } from './providers-call-charges/providers-call-charges.component';
import { AdvanceExcelDialog, InfomMinutePlanDialog, MinutePlanCallDetailsComponent } from './minute-plan-call-details/minute-plan-call-details.component';
import { VendorDidReportComponent } from './vendor-did-report/vendor-did-report.component';
import {MatTableModule} from '@angular/material/table';


@NgModule({
  declarations: [DateHourWiseCallsComponent, DateWiseCallChargesComponent,
                 CustomersCallChargesComponent, CustomersCallDetailComponent, ProvidersCallChargesComponent,
                  MinutePlanCallDetailsComponent, VendorDidReportComponent,InfomMinutePlanDialog,AdvanceExcelDialog],
  imports: [
    CommonModule,
    ReportRoutingModule ,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    SharedModule,
    HttpClientModule, 
    BsDatepickerModule.forRoot(),
    MaterialComponents,
    MultiSelectModule,
    MatTableModule
  ],
  entryComponents:[InfomMinutePlanDialog,AdvanceExcelDialog],
  providers : [CheckBoxSelectionService]
})
export class ReportModule { }
