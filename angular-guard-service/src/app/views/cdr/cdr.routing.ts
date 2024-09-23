import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountManagerCdrComponent } from './account-manager-cdr/account-manager-cdr.component';
import { AdminCdrComponent } from './admin-cdr/admin-cdr.component';
import { CustomerCdrComponent } from './customer-cdr/customer-cdr.component';
import { SupportCdrComponent } from './support-cdr/support-cdr.component';
import { ExtensionCdrComponent } from './extension-cdr/extension-cdr.component';
import { CustomerFeedbackReportComponent } from './customer-feedback-report/customer-feedback-report.component';
import { CustomerStickyAgentReportComponent } from './customer-sticky-agent-report/customer-sticky-agent-report.component';
import { AccountManagerIpComponent } from './account-manager-ip/account-manager-ip.component';


const routes: Routes = [
    {
        path: '', data: { title: 'CDR' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'accountManager-cdr', component: AccountManagerCdrComponent, data: { title: 'View Account Manager CDR' } },
            { path: 'admin-cdr', component: AdminCdrComponent, data: { title: 'View Admin CDR' } },
            { path: 'customer-cdr', component: CustomerCdrComponent, data: { title: 'View Customer CDR' } },
            { path: 'support-cdr', component: SupportCdrComponent, data: { title: 'View Support CDR' } },
            { path: 'extension-cdr', component: ExtensionCdrComponent, data: { title: 'View Extension CDR' } },
            { path: 'feedback-report', component: CustomerFeedbackReportComponent, data: { title: 'Feedback Report' } },
            { path: 'sticky-agent-report', component: CustomerStickyAgentReportComponent, data: { title: 'Sticky Agent Report' } },
            { path: 'account-manager-ip', component: AccountManagerIpComponent, data: { title: 'Account Manager IP' } },

            
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CDRRoutingModule { }

export const cdrComponents = [
    AccountManagerCdrComponent,
    AdminCdrComponent,
    CustomerCdrComponent,
    SupportCdrComponent,
    ExtensionCdrComponent
];