import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateExtensionComponent } from './create-extension/create-extension.component';
import { ViewExtensionComponent } from './view-extension/view-extension.component';
import { ManageExtensionComponent } from './manage-extension/manage-extension.component';
import { ViewExtensionFeaturesComponent } from './view-extension-features/view-extension-features.component'
import { SupportViewExtensionComponent } from './support-view-extension/support-view-extension.component';
import { SupportViewFeaturesComponent } from './support-view-features/support-view-features.component';
import { ManageExtensionMinuteComponent } from './manage-extension-minute/manage-extension-minute.component';
import { ExtMappedDestinationComponent } from './ext-mapped-destination/ext-mapped-destination.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Extension' },
        children: [
            { path: '', redirectTo: 'view' }, 
            { path: 'create', component: CreateExtensionComponent, data: { title: 'Create Extension' } },
            { path: 'view', component: ViewExtensionComponent, data: { title: 'View Extension' } },
            { path: 'manage', component: ManageExtensionComponent, data: { title: 'Manage Extension' } },
            { path: 'viewFeatures', component: ViewExtensionFeaturesComponent, data: { title: 'View Extension Features' } },
            { path: 'supportViewExtension', component: SupportViewExtensionComponent, data: { title: 'Support View Extension' } },
            { path: 'supportViewExtension/manage', component: ManageExtensionComponent, data: { title: 'Manage Extension' } },
            { path: 'supportViewFeatures', component: SupportViewFeaturesComponent, data: { title: 'Support View Extension Features' } },
            { path: 'supportViewFeatures/manage', component: ManageExtensionComponent, data: { title: 'Manage Extension' } },
            { path: 'minute-manage', component: ManageExtensionMinuteComponent, data: { title: 'Manage Minute Extension' } },
          //  { path: 'mapped-destination', component: ExtMappedDestinationComponent, data: { title: 'Extension Mapped Destination' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExtensionRoutingModule { }

export const extensionComponents = [
    CreateExtensionComponent,
    ViewExtensionComponent,
    ManageExtensionComponent,
    ViewExtensionFeaturesComponent,
    SupportViewExtensionComponent,
    SupportViewFeaturesComponent,
    ExtMappedDestinationComponent
];
