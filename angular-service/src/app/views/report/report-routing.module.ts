import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomersCallChargesComponent } from './customers-call-charges/customers-call-charges.component';
import { CustomersCallDetailComponent } from './customers-call-detail/customers-call-detail.component';
import { DateHourWiseCallsComponent } from './date-hour-wise-calls/date-hour-wise-calls.component';
import { DateWiseCallChargesComponent } from './date-wise-call-charges/date-wise-call-charges.component';
import { MinutePlanCallDetailsComponent } from './minute-plan-call-details/minute-plan-call-details.component';
import { ProvidersCallChargesComponent } from './providers-call-charges/providers-call-charges.component';
import { VendorDidReportComponent } from './vendor-did-report/vendor-did-report.component';

const routes: Routes = [
  {
    path: '', data: { title: 'View' },
    children: [
        { path: '', redirectTo: 'hour-wise-call' },
        { path: 'hour-wise-calls', component: DateHourWiseCallsComponent, data: { title: 'Booster Plan History' } },
        { path: 'date-wise-call-charges', component: DateWiseCallChargesComponent, data: { title: 'Datewise Call Charges' } },
        { path: 'customers-call-charges', component: CustomersCallChargesComponent, data: { title: 'Customers Call Charges' } },
        { path: 'customers-call-details', component: CustomersCallDetailComponent, data: { title: 'Customers Call Details' } },
        { path: 'providers-call-charges', component: ProvidersCallChargesComponent, data: { title: 'Customers Call Details' } },
        { path: 'minute-plan-call-details', component: MinutePlanCallDetailsComponent, data: { title: 'Minute Plan Call Details' } },  
        { path: 'providers-did-details', component: VendorDidReportComponent, data: { title: 'Vendor DID Details' } },  
        
      ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
