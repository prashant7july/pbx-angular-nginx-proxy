import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssignRightComponent } from './assign-right/assign-right.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Assign Right' },
        children: [
            { path: '', redirectTo: 'allAssignRight' },
            { path: 'allAssignRight', component: AssignRightComponent, data: { title: 'All Assign Right' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssignrightRoutingModule { }

export const AssignrightComponents = [
    AssignRightComponent,
];

