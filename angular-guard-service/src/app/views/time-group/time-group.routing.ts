import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewTimeGroupComponent } from './view-time-group/view-time-group.component';
import { CreateHolidayComponent } from './create-holiday/create-holiday.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Time Group' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewTimeGroupComponent, data: { title: 'View Time Group' } },
           { path: 'holiday', component: CreateHolidayComponent, data: { title: 'Create Holiday' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TimeGroupRoutingModule { }

export const timegroupComponents = [
    ViewTimeGroupComponent,
    CreateHolidayComponent
];
