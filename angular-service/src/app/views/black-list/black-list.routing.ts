import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewBlacklistComponent } from './view-blacklist/view-blacklist.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Black List' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewBlacklistComponent, data: { title: 'View Black list' } },
                                 
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BlackListRoutingModule { }

export const blackListComponents = [
    ViewBlacklistComponent
];

