import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { HttpClientModule } from  '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';


import { CustomerMinutePlanRoutingModule } from './customer-minute-plan-routing.module';
import {  BundleMinutesComponent, InfoBundleMinuteDialog } from './bundle-minutes/bundle-minutes.component';
import { RoamingMinutesComponent } from './roaming-minutes/roaming-minutes.component';
import { BoosterAssociateRatesDialog, BoosterMinutesComponent, InfoBoosterMinuteDialog } from './booster-minutes/booster-minutes.component';
// import { BundlePlanDialog } from '../call-plan/bundle-plan/bundle-plan.component';
import { CallPlanModule } from '../call-plan/call-plan.module';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
//import { AssignBoosterPlanComponent } from './assign-booster-plan/assign-booster-plan.component';

@NgModule({
  declarations: [BundleMinutesComponent, RoamingMinutesComponent,
                  InfoBoosterMinuteDialog, InfoBundleMinuteDialog],
  imports: [
    DropDownListModule,
    ButtonModule,
    TooltipModule,
    ChipListModule,
    ColorPickerModule,
    CommonModule,
    CustomerMinutePlanRoutingModule,
    CommonModule,FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    NgxDatatableModule,
    SharedModule,
    MaterialComponents,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    MultiSelectModule,
    MultiSelectModuleNag,
    CallPlanModule
  ],
  entryComponents : [InfoBoosterMinuteDialog, InfoBundleMinuteDialog],
  providers : [CheckBoxSelectionService]
})
export class CustomerMinutePlanModule { }
