import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AssignBoosterPlanComponent } from './assign-booster-plan/assign-booster-plan.component';
import { BoosterMinutesComponent } from './booster-minutes/booster-minutes.component';
import { BundleMinutesComponent } from './bundle-minutes/bundle-minutes.component';
import { RoamingMinutesComponent } from './roaming-minutes/roaming-minutes.component';

const routes: Routes = [
  {
    path: '', data: { title: 'Appointment' },
    children: [
      { path: '', redirectTo: 'ivr' },
      { path: 'bundle', component: BundleMinutesComponent, data: { title: 'View Bundle Minutes' } },
      { path: 'roaming', component: RoamingMinutesComponent, data: { title: 'View Roaming Minutes' } },
      { path: 'booster', component: BoosterMinutesComponent, data: { title: 'View Booster Minutes' } },
      // { path: 'assign-booster', component: AssignBoosterPlanComponent, data: { title: 'Assign Booster Plan' } },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerMinutePlanRoutingModule { }
