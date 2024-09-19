import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureRoutingModule } from './feature-routing.module';
import { GlobalFeatureRateComponent,GlobalRateDilog,GlobalRateInfoDialog  } from './global-feature-rate/global-feature-rate.component';
import {ViewFeaturesCodeComponent} from '../features-code/view-features-code/view-features-code.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { InfoFeatureCodeDialog } from '../features-code/view-features-code/view-features-code.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {FeatureRatePlanComponent,ViewRatePlanDialog,featurePlanInfoDialog } from './feature-rate-plan/feature-rate-plan.component'
import { CommonService } from 'src/app/core';
import { PackageListComponent } from './package-list/package-list.component';
import { UpgradeFeatureRatePlanComponent } from './upgrade-feature-rate-plan/upgrade-feature-rate-plan.component';
import { PackageListResolver } from './packageList-resolver';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [GlobalFeatureRateComponent, featurePlanInfoDialog,ViewRatePlanDialog, ViewFeaturesCodeComponent,InfoFeatureCodeDialog, GlobalRateDilog ,GlobalRateInfoDialog, FeatureRatePlanComponent,featurePlanInfoDialog, PackageListComponent, UpgradeFeatureRatePlanComponent],
  imports: [
    DropDownListModule,
    MultiSelectModule,
    TooltipModule,
    ChipListModule,
    CommonModule,
    NgxDatatableModule, 
    NgbModule,
    MaterialComponents,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FeatureRoutingModule,
    BsDatepickerModule
  ],
  providers:[CommonService, PackageListResolver,CheckBoxSelectionService],
  entryComponents: [InfoFeatureCodeDialog, featurePlanInfoDialog,GlobalRateDilog,
    UpgradeFeatureRatePlanComponent, GlobalRateInfoDialog,ViewRatePlanDialog,featurePlanInfoDialog],

})
export class FeatureModule { }
