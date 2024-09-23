import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateExtensionSettingsComponent } from './create-extension-settings/create-extension-settings.component';
const routes: Routes = [
    {
        path: '', data: { title: 'Create' },
        children: [
            { path: '', redirectTo: 'create' },
            { path: 'create', component: CreateExtensionSettingsComponent, data: { title: 'Extension Settings' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExtensionSettingsRoutingModule { }

export const ExtensionSettingsComponent = [
    CreateExtensionSettingsComponent
];
