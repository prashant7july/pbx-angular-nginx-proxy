import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { InternalUserDashboardComponent } from './internal-user-dashboard/internal-user-dashboard.component';
import { SupportDashboardComponent } from './support-dashboard/support-dashboard.component';
import { ExtensionDashboardComponent } from './extension-dashboard/extension-dashboard.component';
import { CustomerRealtimeDashboardComponent } from './customer-realtime-dashboard/customer-realtime-dashboard.component';
import { AdminCustomerRealtimeDashboardComponent } from './admin-customer-realtime-dashboard/admin-customer-realtime-dashboard.component';
import { AdminLiveCallDashboardComponent } from './admin-live-call-dashboard/admin-live-call-dashboard.component';
import { CustomerLiveCallDashboardComponent } from './customer-live-call-dashboard/customer-live-call-dashboard.component';
import { ResourceLoader } from '@angular/compiler';
import { ResellerDashboardComponent } from './reseller-dashboard/reseller-dashboard.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Home' },
        children: [
            { path: '', redirectTo: 'home' },  
            { path: 'home', component: HomeComponent, data: { title: 'Dashboard' } },
            { path: 'customerDashboard', component: CustomerDashboardComponent, data: { title: 'Customer Dashboard' } },
            { path: 'internalUserDashboard', component: InternalUserDashboardComponent, data: { title: 'Internal User Dashboard' } },
            { path: 'supportDashboard', component: SupportDashboardComponent, data: { title: 'Support Dashboard' } },
            { path: 'extensionDashboard', component: ExtensionDashboardComponent, data: { title: 'Extension Dashboard' } },
            { path: 'customer-realtime-dashboard', component: CustomerRealtimeDashboardComponent, data: { title: 'Customer Realtime Dashboard' } },     
            { path: 'admin-customer-realtime-dashboard', component: AdminCustomerRealtimeDashboardComponent, data: { title: 'Customer Realtime Dashboard' } },     
            { path: 'admin-live-call-dashboard', component: AdminLiveCallDashboardComponent, data: { title: 'Customer Realtime Dashboard' } },     
            { path: 'customer-live-call-dashboard', component: CustomerLiveCallDashboardComponent, data: { title: 'Customer Live Realtime Dashboard' } }, 
            { path: 'resellerDashboard', component: ResellerDashboardComponent, data: { title: 'Reseller Dashboard' } },

        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule {}

export const dashboardComponents = [
    HomeComponent,
    CustomerDashboardComponent,
    InternalUserDashboardComponent,
    SupportDashboardComponent,
    ExtensionDashboardComponent,
    ResellerDashboardComponent,
];
