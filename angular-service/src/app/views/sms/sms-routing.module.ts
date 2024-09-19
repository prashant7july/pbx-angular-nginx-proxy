import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SmsConfigComponent } from './sms-config/sms-config.component';
import { UserListResolver } from './userList-resolver';
import { ViewAdminSmsReportComponent } from './view-admin-sms-report/view-admin-sms-report.component';
import { ViewApiConfigComponent } from './view-api-config/view-api-config.component';
import { ViewCustomerSmsPlanComponent } from './view-customer-sms-plan/view-customer-sms-plan.component';
import { ViewCustomerSmsReportComponent } from './view-customer-sms-report/view-customer-sms-report.component';
import { ViewCustomerTemplateComponent } from './view-customer-template/view-customer-template.component';
import { ViewProvidersComponent } from './view-providers/view-providers.component';
import { ViewSmsComponent } from './view-sms/view-sms.component';
import { ViewUsersComponent } from './view-users/view-users.component';

const routes: Routes = [
  {
      path: '', data: { title: 'Call Plan' },
      children: [
          { path: '', redirectTo: 'admin-sms-plan' },
          { path: 'admin-sms-plan', component: ViewSmsComponent, data: { title: 'View SMS List' } },
          { path: 'admin-sms-api', component: ViewApiConfigComponent, data: { title: 'View Admin SMS APIs' } },
          { path: 'customer-sms-api', component: ViewApiConfigComponent, data: { title: 'View Customer SMS APIs' } },
          { path: 'admin-sms-api/customer-sms-api/view-providers', component: ViewProvidersComponent,  resolve: { userData: UserListResolver }, data: { title: 'View providers' } },
          { path: 'customer-sms-template', component: ViewCustomerTemplateComponent, data: { title: 'View SMS Template' } },
          { path: 'customer-sms-config', component: SmsConfigComponent, data: { title: 'SMS Config' } },
          { path: 'admin-sms-plan/associate-users', component: ViewUsersComponent, resolve: { userData: UserListResolver }, data: { title: 'View Users' } },     
          { path: 'customer-sms-plan', component: ViewCustomerSmsPlanComponent, data: { title: 'Customer SMS Plan' } },
          { path: 'admin-report', component: ViewAdminSmsReportComponent, data: { title: 'View Admin SMS Report' } },
          { path: 'report', component: ViewCustomerSmsReportComponent, data: { title: 'View Customer SMS Report' } },
          // { path: 'extensioncallplan', component: ExtensionCallplanrateComponent, data: { title: 'Extension Call Plan' } },
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmsRoutingModule { }
