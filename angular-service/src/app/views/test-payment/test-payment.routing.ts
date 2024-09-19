import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CcavenueComponent } from './ccavenue/ccavenue.component';
import { PaytmComponent  } from './paytm/paytm.component';
import { PaytmSuccessComponent } from './paytm-success/paytm-success.component';
const routes: Routes = [
    {
        path: '', data: { title: 'Voicemail' },
        children: [
            { path: '', redirectTo: 'settings' },
            { path: 'ccavenue', component: CcavenueComponent, data: { title: 'CCavenue' } },
            { path: 'paytm', component: PaytmComponent, data: { title: 'Paytm' } },
            { path: 'paytm-success', component: PaytmSuccessComponent, data: { title: 'Paytm-success' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TestPaymentRoutingModule { }

export const TestPaymentComponent = [
    CcavenueComponent,
    PaytmComponent,
    PaytmSuccessComponent
];
