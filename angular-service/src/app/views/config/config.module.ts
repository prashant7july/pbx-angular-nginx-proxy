import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ConfigRoutingModule, ConfigComponents } from './config-routing';
import { PromptsModule } from '../provider/provider.module';
import {  GatewayModule} from '../gateway/gateway.module';
import { ServerModule } from '../server/server.module';
import { MaterialComponents, CommonService } from 'src/app/core';
import { AgGridModule } from '@ag-grid-community/angular';
//import { ProviderDialog,InfoProviderDialog } from '../../views/provider/create-provider/create-provider.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../../shared/shared.module';
import { GatewayGroupDialog } from '../../views/gateway/view-gateway-group/view-gateway-group.component';
//import { InfoGatewayDialog } from '../../views/gateway/view-gateway/view-gateway.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';  
import { ButtonModule } from 'primeng/button'; 
import { ServerDialog, InfoServerDialog} from '../../views/server/view-server/view-server.component';
import { ViewCircleComponent,InfoCircleDialog,Circle, ManageCircle} from './view-circle/view-circle.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CircleContactResolver } from './circle-contact-resolver';
import { ipDialog, WhitelistIpComponent } from './whitelist-ip/whitelist-ip.component';
import { AddDialoutGroup, DialoutGroupComponent } from './dialout-group/dialout-group.component';
import { AddDialoutRule, DialoutRuleComponent } from './dialout-rule/dialout-rule.component';
import {MatChipsModule} from '@angular/material/chips';
import { DialoutRuleContactResolver } from './dialout-rule-contact-resolver';
// import { GroupAssociateContactsComponent } from '../contact-list/group-associate-contacts/group-associate-contacts.component';
import { ContactListModule } from '../contact-list/contact-list.module';
import { GroupAssociateCustomerComponent } from './group-associate-customer/group-associate-customer/group-associate-customer.component';
import { DialoutGroupCustomerResolver } from './dialout-group-customer-resolver';
import { BlockedIpComponent } from './blocked-ip/blocked-ip.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { SmtpComponent } from './smtp/smtp.component';
import { AddSMTP} from './smtp/smtp.component'
import { CreateGatewayComponent } from '../gateway/create-gateway/create-gateway.component';
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";

// import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
// import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';



@NgModule({
  declarations: [
    ConfigComponents,
    ManageCircle,
   // ProviderDialog,
    //InfoProviderDialog,
    GatewayGroupDialog,
    ServerDialog,
    InfoServerDialog,
    ViewCircleComponent,
    InfoCircleDialog,
    Circle,
    CustomerListComponent,
    WhitelistIpComponent,
    ipDialog,
    DialoutGroupComponent,
    AddDialoutGroup,
    DialoutRuleComponent,AddDialoutRule, GroupAssociateCustomerComponent, BlockedIpComponent, SmtpComponent,AddSMTP,CreateGatewayComponent
    // GroupAssociateContactsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ConfigRoutingModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    AgGridModule.withComponents([]),
    MultiSelectModule,
    MaterialComponents,
    SharedModule,
    PromptsModule,
    GatewayModule,
    ServerModule,
    AgGridModule.withComponents([]),
    NgxDatatableModule,
    PickListModule,
    DataViewModule,
    ButtonModule,MatChipsModule,
    ContactListModule,
    BsDatepickerModule.forRoot(),
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    NgxMaterialTimepickerModule

  ],
  exports:[AgGridModule],
  providers:[CommonService,  CircleContactResolver, DialoutRuleContactResolver,DialoutGroupCustomerResolver],
  entryComponents:[InfoCircleDialog, Circle, ManageCircle, ipDialog, AddDialoutGroup, AddDialoutRule,AddSMTP]
  
})
export class ConfigModule { }
