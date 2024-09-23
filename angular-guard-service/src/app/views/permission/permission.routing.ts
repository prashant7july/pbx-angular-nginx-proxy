import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionComponent } from './create-permission/permission.component';
import { ViewPermissionComponent } from './view-permission/view-permission.component';
import { SubadminListComponent } from './subadmin-list/subadmin-list.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Permission' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view/create', component: PermissionComponent, data: { title: 'Create User Permission' } },
            { path: 'view', component: ViewPermissionComponent, data: { title: 'View User Permission' } },
            { path: 'view/viewUser', component: SubadminListComponent, data: { title: 'View Users' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PermissionRoutingModule { }

export const permissionComponents = [
    PermissionComponent,
    ViewPermissionComponent
];
