import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { PromptsModule } from '../provider/provider.module';
import {  GatewayModule} from '../gateway/gateway.module';
import { ServerModule } from '../server/server.module';
import { MaterialComponents } from 'src/app/core';
import { AgGridModule } from '@ag-grid-community/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../../shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';  
import { ButtonModule } from 'primeng/button'; 

import {ViewUserComponent, InfoUserDialog, UserDialog, AddUserBalanceDialog} from '../user/view-user/view-user.component'
import { CommonModule } from '@angular/common';
import {CreateUserComponent} from '../user/create-user/create-user.component'
import { InfoInternalUserDialog, InternalUserDialog, InternalUserComponent,  } from '../user/internal-user/internal-user.component';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { ArchwizardModule } from 'angular-archwizard';
import { SupportUserRoutingModule, supportuserComponent, supportuserEntryComponent } from './support-user-routing.module';
import { AssigngroupComponent,viewassigngroupDialog } from './assigngroup/assigngroup.component';
import { AddUserInGroupDialog } from './view-support-user/view-supportgroup.component';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { GroupAssociateUserComponent } from './group-associate-user/group-associate-user.component';
import { AssociateUserResolver } from './associate-user-resolver';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';


@NgModule({
  declarations: [
    supportuserComponent,
    supportuserEntryComponent,
    AssigngroupComponent,
    viewassigngroupDialog,
    AddUserInGroupDialog,
    GroupAssociateUserComponent,
  
    // InfoUserDialog,
    // UserDialog,
    // AddUserBalanceDialog,
    // InfoInternalUserDialog,
    // InternalUserDialog,
    // ViewUserComponent,
    // ViewSupportUserComponent
  
  ],
  imports: [
    ColorPickerModule,
    ChipListModule,
    TooltipModule,
    DropDownListModule,
    CommonModule,
    ArchwizardModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    MultiSelectModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    NgbModule,
    SupportUserRoutingModule,
    PromptsModule,
    AgGridModule.withComponents([]),
    NgxDatatableModule,
    PickListModule,
    DataViewModule,
    ButtonModule,
    MaterialComponents,

  ],
  providers : [CheckBoxSelectionService,AssociateUserResolver],
  exports:[AgGridModule],
  entryComponents:[
    supportuserEntryComponent,
    viewassigngroupDialog,
    AddUserInGroupDialog
    // InfoUserDialog,
    // UserDialog,
    // AddUserBalanceDialog,
    // InfoInternalUserDialog,
    // InternalUserDialog

  ]
  
})
export class SupportUserModule {
}







