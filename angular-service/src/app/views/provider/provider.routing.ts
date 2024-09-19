import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssociateProviderComponent } from './associate-provider/associate-provider.component';

import { CreateProviderComponent } from './create-provider/create-provider.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Server' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'associateProvider', component: AssociateProviderComponent, data: { title: 'Associate Package' } }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProvidersRoutingModule { }

export const providersComponents = [
        // CreateProviderComponent
];
