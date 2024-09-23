import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTicketComponent } from './view-ticket/view-ticket.component';
import { ManageTicketComponent } from './manage-ticket/manage-ticket.component';
import {TicketTypeComponent} from './ticket-type/ticket-type.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Ticket' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewTicketComponent, data: { title: 'View Ticket' } },
            { path: 'manage', component: ManageTicketComponent, data: { title: 'Manage Ticket' } },
            { path: 'view/manage', component: ManageTicketComponent, data: { title: 'Manage Ticket' } },// new created for resolve menu background highlight
            { path: 'ticket-type/view', component: TicketTypeComponent, data: { title: 'Manage Ticket' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TicketRoutingModule {
 }

export const ticketComponents = [
    ViewTicketComponent,
    ManageTicketComponent,
    TicketTypeComponent,
];
