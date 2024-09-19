import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerDialoutRuleComponent } from './customer-dialout-rule/customer-dialout-rule.component';
import { IntercomAssociatedExtensionsComponent } from './intercom-associated-extensions/intercom-associated-extensions.component';
import { IntercomDialoutRuleComponent } from './intercom-dialout-rule/intercom-dialout-rule.component';

const routes: Routes = [
    {
        path: '', data: { title: 'dialout-rule' },
        children: [
            { path: '', redirectTo: 'dialout-rule' },
            { path: 'customer-dialout-rule', component: CustomerDialoutRuleComponent, data: { title: 'Create Package' } },
            { path: 'intercom-dialout-rule', component: IntercomDialoutRuleComponent, data: { title: 'Intercom Dialout Rule' } },
            { path: 'intercom-dialout-rule/intercom-assiciated-extensions', component: IntercomAssociatedExtensionsComponent, data: { title: 'Intercom Dialout Rule' } },
     
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CustomerDialoutRoutingModule { }

export const packageComponents = [
    CustomerDialoutRuleComponent,IntercomDialoutRuleComponent,IntercomAssociatedExtensionsComponent

];
