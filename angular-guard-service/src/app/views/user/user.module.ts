import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchwizardModule } from 'angular-archwizard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserRoutingModule, userComponents } from './user.routing';

import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { UserDialog,InfoUserDialog, AddUserBalanceDialog, ViewManagerCustomerCallPlanDialog, ViewCustomerSMSPackageDialog, NewCallRatesDialog } from '../../views/user/view-user/view-user.component';
import {CreateExtensionComponent} from '../extension/create-extension/create-extension.component'
import { InfoExtensionDialog, ManageMinuteDialog } from '../extension/view-extension/view-extension.component';
import { InfoExtensionFeaturesDialog } from '../extension/view-extension-features/view-extension-features.component';
import { InfoSupportExtensionDialog } from '../extension/support-view-extension/support-view-extension.component';
import { InfoSupportExtensionFeaturesDialog } from '../extension/support-view-features/support-view-features.component';
import { extensionComponents } from '../extension/extension.routing';
import { ExtensionModule } from '../extension/extension.module';
import { PackageModule } from '../package/package.module';

import { CustomerMappedMinutePlanComponent } from './customer-mapped-minute-plan/customer-mapped-minute-plan.component';
import { MinutePlanResolver } from './minutePlan.resolver';
import { BundlePlanDialog } from '../call-plan/bundle-plan/bundle-plan.component';
import { CallPlanModule } from '../call-plan/call-plan.module';
import { PluginComponent } from './plugin/plugin.component';
import { PluginDialog } from './plugin/plugin.component';
import { pluginlinkdialog } from './plugin/plugin.component';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { PluginCDRComponent,PluginInfoDialog ,PluginAdvanceExcelDialog} from './plugin-cdr/plugin-cdr.component';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CallPlanRateListComponent } from './call-plan-rate-list/call-plan-rate-list.component';
import { CallPlanRatesResolver } from './callPlanRates.resolver';






// import { CustomerViewComponent } from '../package/customer-view/customer-view.component';
//import {CreateExtensionComponent} from '../extension/create-extension/create-extension.component'
@NgModule({
  declarations: [
    userComponents,
    // CreateExtensionComponent,
    PluginDialog,
    UserDialog,InfoUserDialog,AddUserBalanceDialog,ViewManagerCustomerCallPlanDialog,
    ViewCustomerSMSPackageDialog, CustomerMappedMinutePlanComponent, PluginComponent,pluginlinkdialog, PluginCDRComponent,PluginInfoDialog
    ,PluginAdvanceExcelDialog, CallPlanRateListComponent,NewCallRatesDialog
    
    //InfoExtensionDialog,
    // ManageMinuteDialog,
    // InfoExtensionFeaturesDialog,
    // InfoSupportExtensionDialog,
    // InfoSupportExtensionFeaturesDialog,
  ],
  imports: [
    DropDownListModule,
    ChipListModule,
    TooltipModule,
    CommonModule,
    UserRoutingModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule
  ],
  entryComponents: [CreateExtensionComponent,UserDialog,InfoUserDialog,AddUserBalanceDialog,ViewManagerCustomerCallPlanDialog,
    InfoExtensionDialog,ManageMinuteDialog,InfoExtensionFeaturesDialog,InfoSupportExtensionDialog,InfoSupportExtensionFeaturesDialog,
    ViewCustomerSMSPackageDialog, BundlePlanDialog,PluginDialog,pluginlinkdialog,PluginInfoDialog,PluginAdvanceExcelDialog,NewCallRatesDialog],
  providers : [CheckBoxSelectionService, MinutePlanResolver,CallPlanRatesResolver]  
})
export class UserModule { }
