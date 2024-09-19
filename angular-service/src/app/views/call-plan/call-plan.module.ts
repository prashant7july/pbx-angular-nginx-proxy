import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallPlanRoutingModule, callplanComponents } from './call-plan.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { CallPlanRateDialog, ImportCallPlanDialog, InfoCallPlanRateDialog,ManageGatewaydialog } from '../../views/call-plan/views-callplanrates/views-callplanrates.component';
import { CallPlanDialog, InfoCallPlanDialog, NewRatesDialog } from '../../views/call-plan/call-plan/call-plan.component';
import { FileSelectDirective, FileUploadModule } from 'ng2-file-upload';
import { CustomerCallPlanRateDialog, InfoCustomerCallPlanRateDialog } from '../../views/call-plan/customer-callplanrate/customer-callplanrate.component';
import { ExtensionCallPlanRateDialog, InfoExtensionCallPlanRateDialog } from '../../views/call-plan/extension-callplanrate/extension-callplanrate.component';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CallRateGroupComponent, CallRateGroupDialog } from './call-rate-group/call-rate-group.component';
import { BundlePlanComponent, BundlePlanDialog } from './bundle-plan/bundle-plan.component';
import { GroupAssociateRateComponent } from './group-associate-rate/group-associate-rate.component';
import { AssociateRatesResolver } from './associate-rate-resolver';
import { AssignBoosterPlanComponent } from '../customer-minute-plan/assign-booster-plan/assign-booster-plan.component';
import { MinutePlanAssociateUsersComponent } from './minute-plan-associate-users/minute-plan-associate-users.component';
// import { PackageAssociateDialog } from './bundle-plan/bundle-plan.component';
import { UserListResolver } from './associate-users-resolver';
import { CallRatesAssociateGroupComponent } from './call-rates-associate-group/call-rates-associate-group.component';
import { CallRatesResolver } from './associate-call_rates-resolver';
import { AssociatePackageComponent } from './associate-package/associate-package.component';
import { AssociatePackageResolver } from './associate-package-resolver';
import { BoosterAssociateRatesDialog } from '../customer-minute-plan/booster-minutes/booster-minutes.component';
import { CallPlanDetailsComponent } from './call-plan-details/call-plan-details.component';
import { CallplanAssociatePackageComponent } from './callplan-associate-package/callplan-associate-package.component';
@NgModule({
  declarations: [callplanComponents, CallPlanRateDialog, CallPlanDialog, ImportCallPlanDialog, InfoCallPlanDialog, InfoCallPlanRateDialog,
    CustomerCallPlanRateDialog, InfoCustomerCallPlanRateDialog, ExtensionCallPlanRateDialog, InfoExtensionCallPlanRateDialog, CallRateGroupComponent,CallRateGroupDialog, BundlePlanComponent,BundlePlanDialog, GroupAssociateRateComponent,
    AssignBoosterPlanComponent,
    MinutePlanAssociateUsersComponent, ManageGatewaydialog, CallRatesAssociateGroupComponent, AssociatePackageComponent, CallPlanDetailsComponent, CallplanAssociatePackageComponent,NewRatesDialog],
  imports: [
    CommonModule,
    CallPlanRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgxDatatableModule,
    MaterialComponents,
    SharedModule,
    FileUploadModule,
    MultiSelectModule,
    DropDownListModule,
  ],
  entryComponents: [CallPlanRateDialog, CallPlanDialog, ImportCallPlanDialog, InfoCallPlanDialog, InfoCallPlanRateDialog,
    CustomerCallPlanRateDialog, InfoCustomerCallPlanRateDialog, ExtensionCallPlanRateDialog, InfoExtensionCallPlanRateDialog, CallRateGroupDialog,
    BundlePlanDialog, ManageGatewaydialog,BoosterAssociateRatesDialog,NewRatesDialog],
  providers: [CheckBoxSelectionService, AssociateRatesResolver, UserListResolver, CallRatesResolver, AssociatePackageResolver]
})

export class CallPlanModule { }
