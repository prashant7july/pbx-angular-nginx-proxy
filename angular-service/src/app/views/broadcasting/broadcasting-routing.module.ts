import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewBcCdrComponent } from './view-bc-cdr/view-bc-cdr.component';
import { ViewBcListComponent } from './view-bc-list/view-bc-list.component';

const routes: Routes = [
  {
    path: '', data: { title: 'Broadcast' },
    children: [
        { path: '', redirectTo: 'bc-list' },
        { path: 'bc-list', component: ViewBcListComponent, data: { title: 'View BC-List' } },
        // { path: 'tc-plan-list', component: ViewTcPlanListComponent, data: { title: 'View TC-Plan-List' } },
        // { path: 'tc-min-mapping', component: ViewTcPlanMinuteAssignComponent, data: { title: 'View TC-Plan-Minute-Assign' } },
        // { path: 'tc-associate-users', component: ViewUsersComponent, resolve: { packageData: UserListResolver }, data: { title: 'View Users' } },     
        { path: 'cdr', component: ViewBcCdrComponent, data: { title: 'View TC-CDR' } },
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BroadcastingRoutingModule { }
