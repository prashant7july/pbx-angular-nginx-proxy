import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CallForwardFeaturesComponent } from './call-forward-features/call-forward-features.component';
const routes: Routes = [
    {
        path: '', data: { title: 'Call Forward' },
        children: [
            { path: '', redirectTo: 'features' },
            { path: 'features', component: CallForwardFeaturesComponent, data: { title: 'Call Forwarding Features' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CallForwardRoutingModule { }

export const CallForwardComponent = [
    CallForwardFeaturesComponent
];
