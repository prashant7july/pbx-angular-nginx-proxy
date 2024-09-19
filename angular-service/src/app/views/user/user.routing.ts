import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewUserComponent } from './view-user/view-user.component';
import { CreateUserComponent } from './create-user/create-user.component';
// import { InternalUserComponent } from './internal-user/internal-user.component';

import { CreateExtensionComponent } from '../extension/create-extension/create-extension.component';
import { ViewExtensionComponent, InfoExtensionDialog, ManageMinuteDialog } from '../extension/view-extension/view-extension.component';
import { ManageExtensionComponent } from '../extension/manage-extension/manage-extension.component';
import { ViewExtensionFeaturesComponent, InfoExtensionFeaturesDialog } from '../extension/view-extension-features/view-extension-features.component'
import { SupportViewExtensionComponent, InfoSupportExtensionDialog } from '../extension/support-view-extension/support-view-extension.component';
import { SupportViewFeaturesComponent, InfoSupportExtensionFeaturesDialog } from '../extension/support-view-features/support-view-features.component';
import { CustomerViewComponent } from '../package/customer-view/customer-view.component';
import { ManageExtensionMinuteComponent } from '../extension/manage-extension-minute/manage-extension-minute.component';
import { DeductExtensionMinuteComponent } from '../extension/deduct-extension-minute/deduct-extension-minute.component';
import { CustomerMappedMinutePlanComponent } from './customer-mapped-minute-plan/customer-mapped-minute-plan.component';
import { MinutePlanResolver } from './minutePlan.resolver';
import { ExtMappedDestinationComponent } from '../extension/ext-mapped-destination/ext-mapped-destination.component';
import { PluginComponent } from './plugin/plugin.component';
import {PluginCDRComponent} from './plugin-cdr/plugin-cdr.component'
import { CallPlanRatesResolver } from './callPlanRates.resolver';
import { CallPlanRateListComponent } from './call-plan-rate-list/call-plan-rate-list.component';




const routes: Routes = [
    {
        path: '', data: { title: 'User' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewUserComponent, data: { title: 'View User' } },
            { path: 'create', component: CreateUserComponent, data: { title: 'Create Customer' } },
            { path: 'view/create', component: CreateUserComponent, data: { title: 'Create Customer' } }, // new created for resolve menu background highlight
            // { path: 'internalUser', component: InternalUserComponent, data: { title: 'Create Internal User' } },
            { path: 'extension/view/create', component: CreateExtensionComponent, data: { title: 'Create Extension' } },
            { path: 'extension/view', component: ViewExtensionComponent, data: { title: 'View Extension' } },
            { path: 'extension/view/manage', component: ManageExtensionComponent, data: { title: 'Manage Extension' } },
            { path: 'extension/viewFeatures', component: ViewExtensionFeaturesComponent, data: { title: 'View Extension Features' } },
            { path: 'extension/supportViewExtension', component: SupportViewExtensionComponent, data: { title: 'Support View Extension' } },
            { path: 'extension/supportViewFeatures', component: SupportViewFeaturesComponent, data: { title: 'Support View Extension Features' } },
            { path: 'extension/viewFeatures/manage', component: ManageExtensionComponent, data: { title: 'Manage Extension' } },
            { path: 'plugin', component: PluginComponent, data: { title: 'Customer Plugin' } },
            { path: 'plugin-CDR', component: PluginCDRComponent, data: { title: ' Plugin CDR' } },
            { path: 'view/package/customerView', component: CustomerViewComponent, data: { title: 'Package Deatil' } },// new created for resolve menu background highlight
            { path: 'extension/view/minute-manage', component: ManageExtensionMinuteComponent, data: { title: 'Manage Extension' } },
            { path: 'extension/view/minute-deduct', component: DeductExtensionMinuteComponent, data: { title: 'Deduct Extension' } },
            { path: 'extension/view/mapped-destination', component: ExtMappedDestinationComponent, data: { title: 'Manage Extension' } },
            { path: 'view/minute-plan-associate', component: CustomerMappedMinutePlanComponent, resolve: { planData: MinutePlanResolver }, data: { title: 'View Minute Plan' } },     
            { path: 'view/call-plan-rates', component: CallPlanRateListComponent, resolve: { planData: CallPlanRatesResolver}, data: { title: 'View Call Plan Rates' } },     

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }

export const userComponents = [
    ViewUserComponent,
    CreateUserComponent,
    // InternalUserComponent,
    // CreateExtensionComponent,
    // ViewExtensionComponent,
    // ManageExtensionComponent,
    // ViewExtensionFeaturesComponent,
    // SupportViewExtensionComponent,
    // SupportViewFeaturesComponent
];


export const entryComponents = [
    InfoSupportExtensionDialog,
    InfoSupportExtensionFeaturesDialog,
    InfoExtensionDialog,
    InfoExtensionFeaturesDialog,
    ManageMinuteDialog

]
