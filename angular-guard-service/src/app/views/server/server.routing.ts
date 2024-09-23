import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewServerComponent } from './view-server/view-server.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Server' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewServerComponent, data: { title: 'View Server' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ServerRoutingModule { }

export const serverComponents = [
    ViewServerComponent,
];
