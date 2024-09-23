import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatePackageComponent } from './create-package/create-package.component';
import { ManagePackageComponent } from './manage-package/manage-package.component';
import { ViewPackageComponent } from './view-package/view-package.component';
import { CustomerViewComponent } from './customer-view/customer-view.component';
import { CustomPackageUpdateComponent } from './custom-package-update/custom-package-update.component';
import { CustomerListComponent } from './customer-list/customer-list.component';

const routes: Routes = [
    {
        path: '', data: { title: 'User' },
        children: [
            { path: '', redirectTo: 'manage' },
            { path: 'create', component: CreatePackageComponent, data: { title: 'Create Package' } },
            { path: 'manage', component: ManagePackageComponent, data: { title: 'Manage Package' } },
            { path: 'view', component: ViewPackageComponent, data: { title: 'Package Deatil' } },
            { path: 'customerView', component: CustomerViewComponent, data: { title: 'Package Deatil' } },
            { path: 'updatePackage', component: CustomPackageUpdateComponent, data: { title: 'Upadet Package' } },
            { path: 'packageCustomer', component: CustomerListComponent, data: { title: 'Package Customer' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PackageRoutingModule { }

export const packageComponents = [
    CreatePackageComponent,
    ManagePackageComponent,
    ViewPackageComponent,
    CustomerViewComponent,
    CustomPackageUpdateComponent,
    CustomerListComponent
];
