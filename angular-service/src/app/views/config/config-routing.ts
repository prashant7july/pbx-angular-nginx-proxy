import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CircleComponent  } from "./circle/circle.component";
 import { CreateProviderComponent  } from "../provider/create-provider/create-provider.component";
 import { ViewServerComponent } from "../server/view-server/view-server.component";
 import { CreateGatewayComponent } from "../gateway/create-gateway/create-gateway.component";
 import { ManageGatewayComponent } from "../gateway/manage-gateway/manage-gateway.component";
 import { ViewGatewayComponent } from "../gateway/view-gateway/view-gateway.component";
 import { ViewGatewayGroupComponent } from "../gateway/view-gateway-group/view-gateway-group.component";
 import  {ViewCircleComponent} from '../config/view-circle/view-circle.component'
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CircleContactResolver } from './circle-contact-resolver';
import { WhitelistIpComponent } from './whitelist-ip/whitelist-ip.component';
import { DialoutGroupComponent } from './dialout-group/dialout-group.component';
import { DialoutRuleComponent } from './dialout-rule/dialout-rule.component';
import { DialoutRuleContactResolver } from './dialout-rule-contact-resolver';
import { GroupAssociateContactsComponent } from '../contact-list/group-associate-contacts/group-associate-contacts.component';
import { DialoutGroupCustomerResolver } from './dialout-group-customer-resolver';
import { GroupAssociateCustomerComponent } from './group-associate-customer/group-associate-customer/group-associate-customer.component';
import { BlockedIpComponent } from './blocked-ip/blocked-ip.component';
import { SmtpComponent } from './smtp/smtp.component';
const routes: Routes = [
  {
    path: '', data: { title: 'Config' },
    children: [
        { path: 'circle', component: ViewCircleComponent, data: { title: 'viewCircle Config' } },
        { path: 'addCircle', component: CircleComponent, data: { title: 'circle Config' } },
        // { path: 'manage-circle', component: ManageCircle, data: { title: 'circle Config' } },
        { path: 'provider',component: CreateProviderComponent, data: { title: 'circle Config' }},
        { path: 'server', component:ViewServerComponent , data: { title: 'server Config' } },
        
        { path: 'gateway',  redirectTo:'gateway/view' , data: { title: 'circle Config' }},
        { path: 'gateway/view',component: ViewGatewayComponent, data: { title: 'circle Config' }},
        { path: 'gateway/manage', component: ManageGatewayComponent, data: { title: 'Manage Gateway' } },
        { path: 'gateway/viewGroup', component: ViewGatewayGroupComponent, data: { title: 'View Gateway Group' } },
        { path: 'gateway/create', component: CreateGatewayComponent, data: { title: 'Manage Gateway' } },
        { path: 'circle/circleCustomer', component: CustomerListComponent,resolve: { contactData: CircleContactResolver }, data: { title: 'Circle Customer' } },
        { path: 'whitelist-ip', component: WhitelistIpComponent, data: { title: 'view whitelist  Ip' } },
        { path: 'dialout-group', component: DialoutGroupComponent, data: { title: 'view Dialout Group' } },
        { path: 'dialout-rule', component: DialoutRuleComponent, data: { title: 'view Dialout Rule' } },
        { path: 'dialout-group/customer', component: GroupAssociateContactsComponent,resolve: { contactData: DialoutRuleContactResolver }, data: { title: 'DialOut Group Customer' } },
        { path: 'dialout-group/group-associate-customer' , component: GroupAssociateCustomerComponent, resolve:{ customerData: DialoutGroupCustomerResolver}, data: {title: 'Dialout Group Customer'}},
        { path: 'blocked-ip', component: BlockedIpComponent, data: { title: 'viewBlocked Ip' } },
        { path: 'smtp', component: SmtpComponent, data: { title: 'SMTP' } },

    ],
},

];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule { }

export const ConfigComponents = [
  CircleComponent,
  CreateProviderComponent,
  CreateGatewayComponent
  // ViewServerComponent,
  // CreateGatewayComponent,
  // ManageGatewayComponent,
  // ViewGatewayComponent,
  // ViewGatewayGroupComponent
];