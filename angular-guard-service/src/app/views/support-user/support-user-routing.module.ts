import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateInternalUserComponent } from '../user/create-internal-user/create-internal-user.component'
import { InternalUserComponent, InternalUserDialog, InfoInternalUserDialog} from '../user/internal-user/internal-user.component'
import {viewsupportGroupDialog, ViewSupportUserComponent, SupportInfoDialog, assignSupportGroup} from './view-support-user/view-supportgroup.component'
import {AssigngroupComponent ,viewassigngroupDialog} from '../support-user/assigngroup/assigngroup.component'
import { GroupAssociateUserComponent } from './group-associate-user/group-associate-user.component';
import { AssociateUserResolver } from './associate-user-resolver';
const routes: Routes = [
  {
    path: '', data: { title: 'Support user' },
    children: [
         { path: 'supportgroup/view', component: ViewSupportUserComponent, data: { title: 'Supprot user' } },
         { path: 'assigngroup/view', component: AssigngroupComponent, data: { title: 'Supprot user' } },
         { path: 'internaluser/view', component: InternalUserComponent, data: { title: 'Supprot user' } },
         { path: 'internaluser/create', component: CreateInternalUserComponent, data: { title: 'Supprot user' } },
         { path: 'internaluser/view/create', component: CreateInternalUserComponent, data: { title: 'Supprot user' } }, // new created for resolve menu background highlight
         { path: 'groupUsers', component: GroupAssociateUserComponent,resolve: { contactData: AssociateUserResolver }, data: { title: 'Group Users' } },         
        ],
    
},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupportUserRoutingModule { }

export const supportuserComponent = [
  InternalUserComponent,
  CreateInternalUserComponent,
  ViewSupportUserComponent,
  viewsupportGroupDialog,
  SupportInfoDialog,
  assignSupportGroup
]

export const supportuserEntryComponent = [
  InternalUserDialog, 
  InfoInternalUserDialog,
  viewsupportGroupDialog,
  SupportInfoDialog,
  assignSupportGroup,
  viewassigngroupDialog  
  
]
