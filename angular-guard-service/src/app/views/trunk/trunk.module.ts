import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchwizardModule } from 'angular-archwizard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { UserDialog,InfoUserDialog, AddUserBalanceDialog, ViewManagerCustomerCallPlanDialog, ViewCustomerSMSPackageDialog } from '../../views/user/view-user/view-user.component';
import {CreateExtensionComponent} from '../extension/create-extension/create-extension.component'
import { InfoExtensionDialog, ManageMinuteDialog } from '../extension/view-extension/view-extension.component';
import { InfoExtensionFeaturesDialog } from '../extension/view-extension-features/view-extension-features.component';
import { InfoSupportExtensionDialog } from '../extension/support-view-extension/support-view-extension.component';
import { InfoSupportExtensionFeaturesDialog } from '../extension/support-view-features/support-view-features.component';
import { extensionComponents } from '../extension/extension.routing';
import { ExtensionModule } from '../extension/extension.module';
import { PackageModule } from '../package/package.module';


import { BundlePlanDialog } from '../call-plan/bundle-plan/bundle-plan.component';
import { CallPlanModule } from '../call-plan/call-plan.module';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

import { TrunkRoutingModule } from './trunk-routing.module';
import { AddTrunkComponent, TrunkListComponent } from './trunk-list/trunk-list.component';
import { TrunkRoutingComponent,AddRoutingComponent } from './trunk-routing/trunk-routing.component';

@NgModule({
  declarations: [TrunkListComponent,AddTrunkComponent, TrunkRoutingComponent,AddRoutingComponent],
  imports: [
    CommonModule,
    TrunkRoutingModule,
    DropDownListModule,
    ChipListModule,
    TooltipModule,
    CommonModule,
    ArchwizardModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    MultiSelectModule,
    MaterialComponents,
    SharedModule,
    BsDatepickerModule.forRoot(),
    PickListModule,
    DataViewModule,
    ButtonModule,
    NgxDatatableModule,
    ExtensionModule,
    PackageModule,
    MultiSelectModuleNag,
    CallPlanModule,
    ColorPickerModule,
  ]
})
export class TrunkModule { }
