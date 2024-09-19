import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewDidComponent } from './view-did/view-did.component';
import { ManageDidComponent } from './manage-did/manage-did.component';
import { AssignDidComponent } from './assign-did/assign-did.component';
import { CustomerDidComponent } from './customer-did/customer-did.component';
import { DidPurchaseComponent } from './did-purchase/did-purchase.component';
import { InternalUserDidComponent } from './internal-user-did/internal-user-did.component';
import { SupportDidComponent } from './support-did/support-did.component';
import { DidMappedHistoryComponent } from './did-mapped-history/did-mapped-history.component';
import { ImportVmnComponent } from './import-vmn/import-vmn.component';
import {DidListResolver} from './didList-resolver';
import {ViewAssociateDIDComponent} from './view-associate-did/view-associate-did.component';

const routes: Routes = [
    {
        path: '', data: { title: 'DID Management' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewDidComponent, data: { title: 'View DID' } },
            { path: 'internalUser-view/manage', component: ManageDidComponent, data: { title: 'Manage DID' } }, 
            { path: 'assign', component: AssignDidComponent, data: { title: 'Assign DID' } },
            { path: 'mydid-view', component: CustomerDidComponent, data: { title: 'My DID' } },
            { path: 'did-purchase', component: DidPurchaseComponent, data: { title: 'DID Purchase' } },                               
            { path: 'internalUser-view', component: InternalUserDidComponent, data: { title: 'View Internal User DID' } },                               
            { path: 'support-view', component: SupportDidComponent, data: { title: 'View Support  DID' } },                               
            { path: 'support-view/manage', component: ManageDidComponent, data: { title: 'Manage DID' } }, 
            { path: 'mapped-history', component: DidMappedHistoryComponent, data: { title: 'DID History' } },
            { path: 'import-vmn', component: ImportVmnComponent, data: { title: 'Import VMN'}},
            { path: 'vmn-associate-did', component: ViewAssociateDIDComponent, resolve: {didData: DidListResolver}, data: { title: 'View DID'}}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DIDModule { }

export const DidComponents = [
    ViewDidComponent,
    ManageDidComponent,
    AssignDidComponent,
    CustomerDidComponent,
    DidPurchaseComponent,
    InternalUserDidComponent,
    SupportDidComponent,
    ImportVmnComponent
];

