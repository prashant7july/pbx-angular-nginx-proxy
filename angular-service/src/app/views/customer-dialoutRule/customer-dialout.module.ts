import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule, TooltipModule } from 'ngx-bootstrap';
import { CustomerDialoutRoutingModule } from './customer-dialout.routing';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module'
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { CustomerDialoutRuleComponent } from './customer-dialout-rule/customer-dialout-rule.component';
import { CustomerDialoutDialog } from './customer-dialout-rule/customer-dialout-rule.component';
import { IntercomDialoutRuleComponent } from './intercom-dialout-rule/intercom-dialout-rule.component';
import { IntercomDialoutDialog } from './intercom-dialout-rule/intercom-dialout-rule.component';
import { IntercomAssociatedExtensionsComponent } from './intercom-associated-extensions/intercom-associated-extensions.component';
import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';



@NgModule({
  declarations: [
    CustomerDialoutRuleComponent,CustomerDialoutDialog, IntercomDialoutRuleComponent,IntercomDialoutDialog, IntercomAssociatedExtensionsComponent
  ],
  imports: [
    PickListModule,
    DataViewModule,
    CheckBoxModule,
    ColorPickerModule,
    MatAutocompleteModule,
    ChipListModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    CommonModule,
    CustomerDialoutRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    MaterialComponents,
    SharedModule,
    MultiSelectModule,
    DropDownListModule
  ],
  entryComponents: [CustomerDialoutDialog,IntercomDialoutDialog],
  providers: [CheckBoxSelectionService]
})
export class CustomerDialoutModule { }
