import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IVRCodeComponent } from './ivrcode/ivrcode.component';
import { BasicIvrComponent } from './basic-ivr/basic-ivr.component';
import { ViewIvrComponent } from './view-ivr/view-ivr.component';
import { ManageIvrComponent } from './manage-ivr/manage-ivr.component';
import { AssociateIvrComponent } from './associate-ivr/associate-ivr.component';
import { MultilevelIVRResolver } from './multilevel-ivr-resolver';

const routes: Routes = [
    {
        path: '', data: { title: 'IVR' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view/create', component: IVRCodeComponent, data: { title: 'Advanced IVR' } },
            { path: 'view/master', component: BasicIvrComponent, data: { title: 'Basic IVR' } },
            { path: 'view', component: ViewIvrComponent, data: { title: 'View IVR' } },
            { path: 'view/manage', component: ManageIvrComponent, data: { title: 'Manage IVR' } },
            { path: 'view/associate-ivr', component: AssociateIvrComponent,resolve: { ivrdata: MultilevelIVRResolver }, data: { title: 'Associate IVR' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IVRRoutingModule { }

export const ivrComponents = [
    IVRCodeComponent,
    BasicIvrComponent,
    ViewIvrComponent,
    ManageIvrComponent,
    AssociateIvrComponent
];
