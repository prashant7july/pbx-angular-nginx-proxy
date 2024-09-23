import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MinutePlanHistoryRoutingModule } from './minute-plan-history-routing.module';
import { BoosterPlanComponent } from './booster-plan/booster-plan.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { HttpClientModule } from  '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HelpRoamingDialog, InfoRoamingDialog, RoamingBundlePlanComponent } from './roaming-bundle-plan/roaming-bundle-plan.component';
import { CheckBoxSelectionService, DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';

@NgModule({
  declarations: [BoosterPlanComponent, RoamingBundlePlanComponent,InfoRoamingDialog,HelpRoamingDialog],
  imports: [
    CommonModule,
    MinutePlanHistoryRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    SharedModule,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    MultiSelectModule,
    CheckBoxModule,
    ChipListModule,
    TooltipModule,
    DropDownListModule,
    MaterialComponents
  ],
  entryComponents: [InfoRoamingDialog,HelpRoamingDialog],
  providers : [CheckBoxSelectionService]  
})
export class MinutePlanHistoryModule { }
