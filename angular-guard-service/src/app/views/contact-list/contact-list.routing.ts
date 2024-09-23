import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssociateContactResolver } from './associate-contact-resolver';
import { GroupAssociateContactsComponent } from './group-associate-contacts/group-associate-contacts.component';
import { ViewContactGroupComponent } from './view-contact-group/view-contact-group.component';
import { ViewContactlistComponent } from './view-contactlist/view-contactlist.component';


const routes: Routes = [
    {
        path: '', data: { title: 'Email Template' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewContactlistComponent, data: { title: 'View Contact list' } },
            { path: 'group', component: ViewContactGroupComponent, data: { title: 'View Contact Group' } },
            { path: 'groupContacts', component: GroupAssociateContactsComponent,resolve: { contactData: AssociateContactResolver }, data: { title: 'Group Contacts' } },
            { path: 'group/groupContacts', component: GroupAssociateContactsComponent,resolve: { contactData: AssociateContactResolver }, data: { title: 'Group Contacts' } }, // new created for resolve menu background highlight

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ContactListRoutingModule { }

export const contactListComponents = [
    ViewContactlistComponent
];

