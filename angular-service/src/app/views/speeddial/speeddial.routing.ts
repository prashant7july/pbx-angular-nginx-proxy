import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpeedDialFeaturesComponent } from './speed-dial-features/speed-dial-features.component'; 
const routes: Routes = [
    {
        path: '', data: { title: 'Speed Dial' },
        children: [
            { path: '', redirectTo: 'speedDialFeatures' },
            { path: 'speedDialFeatures', component: SpeedDialFeaturesComponent, data: { title: 'speeddial features' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SpeedDialRoutingModule { }

export const SpeedDialComponent = [
    SpeedDialFeaturesComponent
];
