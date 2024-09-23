import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewCallqueueComponent } from './view-callqueue/view-callqueue.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Email Template' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewCallqueueComponent, data: { title: 'View callqueue' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CallQueueRoutingModule { }

export const callqueueComponents = [ViewCallqueueComponent];