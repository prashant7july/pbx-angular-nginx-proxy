import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivityLogsComponent } from './activity-logs/activity-logs.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Activity Log' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ActivityLogsComponent, data: { title: 'View User Activies' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LOGRoutingModule { }

export const logComponents = [
    ActivityLogsComponent
];