import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewFeaturesCodeComponent } from './view-features-code/view-features-code.component';
const routes: Routes = [
    {
        path: '', data: { title: 'View' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewFeaturesCodeComponent, data: { title: 'Features Code' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeaturesCodeRoutingModule { }

export const FeaturesCodeComponent = [
    
];
