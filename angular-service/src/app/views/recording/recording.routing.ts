import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecodingFeaturesComponent } from './recoding-features/recoding-features.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Recording' },
        children: [
            { path: '', redirectTo: 'recording' },
            { path: 'recording', component: RecodingFeaturesComponent, data: { title: 'Recording' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RecordingRoutingModule { }

export const RecordingComponent = [
    RecodingFeaturesComponent
];
