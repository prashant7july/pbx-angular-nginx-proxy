import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BoosterPlanComponent } from './booster-plan/booster-plan.component';
import { RoamingBundlePlanComponent } from './roaming-bundle-plan/roaming-bundle-plan.component';

const routes: Routes = [
  {
    path: '', data: { title: 'View' },
    children: [
        { path: '', redirectTo: 'booster' },
        { path: 'booster', component: BoosterPlanComponent, data: { title: 'Booster Plan History' } },
        { path: 'bundle-roaming', component: RoamingBundlePlanComponent, data: { title: 'Roaming Bundle Plan History' } },
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MinutePlanHistoryRoutingModule { }
