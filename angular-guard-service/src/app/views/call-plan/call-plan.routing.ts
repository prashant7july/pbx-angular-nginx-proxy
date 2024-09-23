import { ViewsCallplanratesComponent } from './views-callplanrates/views-callplanrates.component';
import { CallPlanComponent } from './call-plan/call-plan.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerCallplanrateComponent } from './customer-callplanrate/customer-callplanrate.component';
import { ExtensionCallplanrateComponent } from './extension-callplanrate/extension-callplanrate.component';
import { CallRateGroupComponent } from './call-rate-group/call-rate-group.component';
import { BundlePlanComponent } from './bundle-plan/bundle-plan.component';
import { GroupAssociateRateComponent } from './group-associate-rate/group-associate-rate.component';
import { AssociateRatesResolver } from './associate-rate-resolver';
import { AssignBoosterPlanComponent } from '../customer-minute-plan/assign-booster-plan/assign-booster-plan.component';
import { MinutePlanAssociateUsersComponent } from './minute-plan-associate-users/minute-plan-associate-users.component';
import { UserListResolver } from './associate-users-resolver';
import { CallRatesAssociateGroupComponent } from './call-rates-associate-group/call-rates-associate-group.component';
import { CallRatesResolver } from './associate-call_rates-resolver';
import { AssociatePackageComponent } from './associate-package/associate-package.component';
import { AssociatePackageResolver } from './associate-package-resolver';
import { BundleMinutesComponent } from '../customer-minute-plan/bundle-minutes/bundle-minutes.component';
import { RoamingMinutesComponent } from '../customer-minute-plan/roaming-minutes/roaming-minutes.component';
import { BoosterMinutesComponent } from '../customer-minute-plan/booster-minutes/booster-minutes.component';
import { CallPlanDetailsComponent } from './call-plan-details/call-plan-details.component';
import { CallplanAssociatePackageComponent } from './callplan-associate-package/callplan-associate-package.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Call Plan' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewsCallplanratesComponent, data: { title: 'View callplan' } },
            { path: 'callplan', component: CallPlanComponent, data: { title: 'Call Plan' } },
            { path: 'customercallplan', component: CustomerCallplanrateComponent, data: { title: 'Customer Call Plan' } },
            { path: 'extensioncallplan', component: ExtensionCallplanrateComponent, data: { title: 'Extension Call Plan' } },
            { path: 'call-rate-group', component: CallRateGroupComponent, data: { title: 'Call Rate Group' } },
            { path: 'bundle-plan', component: BundlePlanComponent, data: { title: 'Bundle Plan' } },
            { path: 'call-rate-group/groupRates', component: GroupAssociateRateComponent, resolve: { contactData: AssociateRatesResolver }, data: { title: 'Group Rates' } },
            { path: 'assign-booster', component: AssignBoosterPlanComponent, data: { title: 'Assign Booster Plan' } },
            { path: 'bundle-plan/minute-plan-associate-users', component: MinutePlanAssociateUsersComponent, resolve: { planData: UserListResolver }, data: { title: 'View Users' } },    
            { path: 'call-rate-group/call-rates-associate-group', component: CallRatesAssociateGroupComponent, resolve: { groupData : CallRatesResolver}, data: {title: 'View Call Rates'}},            
            { path: 'callplan/associate-package', component: AssociatePackageComponent, resolve: {packageData: AssociatePackageResolver}, data: {title: 'Associate Package'}},
            { path: 'callplan/callPlan-associate-package', component: CallplanAssociatePackageComponent, data: {title: ' Call Plan Associate Package'}},
            // { path: 'bundle', component: BundleMinutesComponent, data: { title: 'View Bundle Minutes' } },
            // { path: 'roaming', component: RoamingMinutesComponent, data: { title: 'View Roaming Minutes' } },
            { path: 'booster', component: BoosterMinutesComponent, data: { title: 'View Booster Minutes' } },
            { path: 'callPlanDetails', component: CallPlanDetailsComponent, data: { title: 'View Booster Minutes' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CallPlanRoutingModule { }

export const callplanComponents = [
    CustomerCallplanrateComponent,
    ViewsCallplanratesComponent,
    ExtensionCallplanrateComponent,
    CallPlanComponent,
    BoosterMinutesComponent,
    CallPlanDetailsComponent
];

