import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewInvoiceComponent } from './view-invoice/view-invoice.component';
import { ViewInvoiceListComponent } from './view-invoice-list/view-invoice-list.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Invoice' },
        children: [
            { path: '', redirectTo: 'view-invoice' },
            { path: 'view-invoice/view', component: ViewInvoiceComponent, data: { title: 'Invoice' } },
            { path: 'view-invoice', component: ViewInvoiceListComponent, data: { title: 'Invoice List' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InvoiceRoutingModule { }

export const InvoiceComponent = [
    ViewInvoiceComponent,
    ViewInvoiceListComponent
];
