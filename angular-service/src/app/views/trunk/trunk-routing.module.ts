import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddTrunkComponent, TrunkListComponent } from './trunk-list/trunk-list.component';
import { TrunkRoutingComponent,AddRoutingComponent } from './trunk-routing/trunk-routing.component';

const routes: Routes = [
  {
      path: '', data: { title: 'Trunk List' },
      children: [
          { path: '', redirectTo: 'view' },
          { path: 'view', component: TrunkListComponent, data: { title: 'View Trunk List' } },
          { path: 'view/add', component: AddTrunkComponent, data: { title: 'Add Trunk' } },
          { path: 'routing', component: TrunkRoutingComponent, data: { title: 'Trunk Routing' } },
          { path: 'addRoute', component: AddRoutingComponent, data: { title: 'Add Routing' } },



      ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrunkRoutingModule { }

export const trunkListComponents = [
  TrunkListComponent,AddTrunkComponent,TrunkRoutingComponent,AddRoutingComponent
];
