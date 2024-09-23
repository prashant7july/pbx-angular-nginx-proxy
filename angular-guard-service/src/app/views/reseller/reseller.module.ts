import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponents } from '../../core/material-ui';  
import {MatSelectModule} from '@angular/material/select';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ResellerService } from './reseller.service';
import { MatOptionModule } from '@angular/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { ResellerRoutingModule } from './reseller.routing';
import { ResellerComponent } from './reseller.component';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { ResellerDialog, InfoInternalUserDialog ,permissionDialog,AddResellerBalanceDialog} from './reseller.component';

@NgModule({
  declarations: [ResellerComponent,ResellerDialog,InfoInternalUserDialog,permissionDialog,AddResellerBalanceDialog],
  imports: [
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    AgGridModule.withComponents([ResellerComponent]),    
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    ButtonModule,
    ResellerRoutingModule,
    MaterialComponents,
    FormsModule ,
    SharedModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    NgMultiSelectDropDownModule,
    ChipListModule,
    TooltipModule,
    MultiSelectModule,
    DropDownListModule,
    ColorPickerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule
  
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [ResellerService,CheckBoxSelectionService],
  entryComponents: [ResellerDialog, InfoInternalUserDialog,permissionDialog,AddResellerBalanceDialog],  
})
export class ResellerModule { }
