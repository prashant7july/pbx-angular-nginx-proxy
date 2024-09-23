import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewProfileComponent } from './view-profile/view-profile.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { DashboadCustomizeComponent } from './dashboad-customize/dashboad-customize.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Password' },
        children: [
            { path: '', redirectTo: 'userProfile' },
            { path: 'userProfile', component: UserProfileComponent, data: { title: 'Edit User Profile' } },
            { path: 'viewProfile', component: ViewProfileComponent, data: { title: 'View User Profile' } },
            { path: 'dashboard-customize', component: DashboadCustomizeComponent, data: { title: 'Dashboard Customize Profile' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }

export const profileComponents = [
    UserProfileComponent,
    ViewProfileComponent
];
