import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ViewFeaturesCodeComponent} from '../features-code/view-features-code/view-features-code.component'
import { GlobalFeatureRateComponent } from './global-feature-rate/global-feature-rate.component';
import {FeatureRatePlanComponent} from '../feature/feature-rate-plan/feature-rate-plan.component'
import {ViewRatePlanDialog} from '../feature/feature-rate-plan/feature-rate-plan.component'
import { PackageListComponent } from './package-list/package-list.component';
import { PackageListResolver } from './packageList-resolver';
const routes: Routes = [
  {
    path: '', data: { title: 'feature' },
    children: [
        { path: '', redirectTo: 'GlobalFeatureRate' },
        { path: 'globalRate', component: GlobalFeatureRateComponent, data: { title: 'feature global rate' } },
        { path: 'view',component: ViewFeaturesCodeComponent, data: { title: 'view feature' }},
        { path: 'ratePlan',component: FeatureRatePlanComponent, data: { title: 'view feature' }},
        { path: 'viewratePlan',component: ViewRatePlanDialog, data: { title: 'view feature' }},
        { path: 'planPackage', component: PackageListComponent, resolve: { packageData: PackageListResolver },data: { title: 'Plan Package' } },
        { path: 'ratePlan/planPackage', component: PackageListComponent, resolve: { packageData: PackageListResolver },data: { title: 'Plan Package' } }, // new created for resolve menu background highlight

    ],
    
},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatureRoutingModule { }
