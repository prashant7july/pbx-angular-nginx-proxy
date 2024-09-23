import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule, dashboardComponents } from './dashboard.routing';
import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';
import { MatDatepickerModule,MatNativeDateModule} from '@angular/material';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import { CustomerRealtimeDashboardComponent } from './customer-realtime-dashboard/customer-realtime-dashboard.component';
import { AdminCustomerRealtimeDashboardComponent } from './admin-customer-realtime-dashboard/admin-customer-realtime-dashboard.component';
import {MatTableModule} from '@angular/material/table';
import { AdminLiveCallDashboardComponent } from './admin-live-call-dashboard/admin-live-call-dashboard.component';
import { CustomerLiveCallDashboardComponent } from './customer-live-call-dashboard/customer-live-call-dashboard.component';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { ResellerDashboardComponent } from './reseller-dashboard/reseller-dashboard.component';

@NgModule({
  declarations: [
    dashboardComponents,
    CustomerRealtimeDashboardComponent,
    AdminCustomerRealtimeDashboardComponent,
    AdminLiveCallDashboardComponent,
    CustomerLiveCallDashboardComponent,
    ResellerDashboardComponent,
  ],
  imports: [
    CheckBoxModule,
    ColorPickerModule,
    MatAutocompleteModule,
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    MultiSelectModule,
    CommonModule,
    DashboardRoutingModule,
    ChartsModule,
    NgxChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    NgxDatatableModule,    
    SharedModule,
    MaterialComponents,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule
  ],
  bootstrap: [dashboardComponents],
  exports: [ ChartsModule],
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
export class DashboardModule { }
