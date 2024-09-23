import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AccessRestrictionComponent} from './access-restriction/access-restriction.component'
import { SupportIpRestrictionComponent } from './support-ip-restriction/support-ip-restriction.component';
import { AccountManagerAccessRestrictionComponent } from './account-manager-access-restriction/account-manager-access-restriction.component';
import { WhitelistComponent } from './whitelist/whitelist.component';
const routes: Routes = [
  {
    path:'',data: {title: 'security'}, 
    children: [  
      {path: '',redirectTo: 'access-restriction'},
      {path: 'access-restriction', component: AccessRestrictionComponent, data:{title: 'Access Restriction'}},
      {path: 'support-ip-restriction', component: SupportIpRestrictionComponent, data:{title: 'Support IP'}},
      {path: 'account-manager-access-restriction', component: AccountManagerAccessRestrictionComponent, data:{title: 'Account Manager IP'}},
      {path: 'whitelist', component: WhitelistComponent, data:{title: 'Whitelist'}},
    ]
  }
]; 

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
