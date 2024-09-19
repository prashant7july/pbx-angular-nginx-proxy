import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewAccessRestrictionComponent } from './view-access-restriction/view-access-restriction.component';


const routes: Routes = [
    {
        path: '', data: { title: 'Access Restriction' },
        children: [
            { path: '', redirectTo: 'access-restriction' },
            { path: 'access-restriction', component: ViewAccessRestrictionComponent, data: { title: 'Access Restriction' } },
                                 
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccessRoutingModule { }
export const accessComponents = [ViewAccessRestrictionComponent];


