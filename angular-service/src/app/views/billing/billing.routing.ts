import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BillingComponent } from './billing/billing.component';
import { CustomerBillingComponent } from './customer-billing/customer-billing.component';
import { LogPaymentComponent } from './log-payment/log-payment.component';
import { LogEPaymentComponent } from './log-e-payment/log-e-payment.component';


const routes: Routes = [
    {
        path: '', data: { title: 'Billing Details' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: BillingComponent, data: { title: 'Billing Detail' } },
            { path: 'customer-view', component: CustomerBillingComponent, data: { title: 'Billing Detail' } } ,
            { path: 'log-payment', component: LogPaymentComponent, data: { title: 'Log payment' } } ,
            { path: 'log-epayment', component: LogEPaymentComponent, data: { title: 'Log Epayment' } } ,
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BillingRountingModule { }

export const billingComponents = [
    BillingComponent,
    CustomerBillingComponent,
    LogPaymentComponent,
    LogEPaymentComponent
];
