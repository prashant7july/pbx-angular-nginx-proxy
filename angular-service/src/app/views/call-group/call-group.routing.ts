import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewCallgroupComponent } from './view-callgroup/view-callgroup.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Email Template' },
        children: [
            { path: '', redirectTo: 'viewCallGroup' },
            { path: 'viewCallGroup', component: ViewCallgroupComponent, data: { title: 'View Call Group' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CallgroupRoutingModule { }

export const callgroupComponents = [
    ViewCallgroupComponent,
];

