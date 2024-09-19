import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewConferenceComponent } from './view-conference/view-conference.component';
import { ConferenceCDRComponent } from './conference-cdr/conference-cdr.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Email Template' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewConferenceComponent, data: { title: 'View Conference' } },
            { path: 'cdr', component: ConferenceCDRComponent, data: { title: ' Conference CDR' } },
         ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ConferenceRoutingModule { }

export const conferenceComponents = [
    ViewConferenceComponent,
];

