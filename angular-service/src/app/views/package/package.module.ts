import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule, TooltipModule } from 'ngx-bootstrap';
import { PackageRoutingModule, packageComponents } from './package.routing';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module'
import { CustomerDialog } from './customer-list/customer-list.component'
import { InfoPackageDialog, NewCallRatesDialog } from './manage-package/manage-package.component';
import { InfoCustomerPackageDialog } from './customer-view/customer-view.component';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';


@NgModule({
  declarations: [
    packageComponents, CustomerDialog,InfoPackageDialog,InfoCustomerPackageDialog,NewCallRatesDialog
  ],
  imports: [
    CheckBoxModule,
    ColorPickerModule,
    MatAutocompleteModule,
    ChipListModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    CommonModule,
    PackageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    MaterialComponents,
    SharedModule,
    MultiSelectModule,
    DropDownListModule
  ],
  entryComponents: [CustomerDialog,InfoPackageDialog,InfoCustomerPackageDialog,NewCallRatesDialog],
  providers: [CheckBoxSelectionService]
})
export class PackageModule { }
