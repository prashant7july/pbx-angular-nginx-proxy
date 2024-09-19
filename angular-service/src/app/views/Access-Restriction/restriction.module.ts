import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MaterialComponents } from '../../core/material-ui';  
import {MatSelectModule} from '@angular/material/select';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatOptionModule } from '@angular/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { AccessRoutingModule,accessComponents } from './restriction.routing';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ViewAccessRestrictionComponent,AddRestrictionDialog } from './view-access-restriction/view-access-restriction.component';
import { MaterialComponents } from '../../core/material-ui';  
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';






@NgModule({
  declarations: [accessComponents,ViewAccessRestrictionComponent,AddRestrictionDialog],
  imports: [
    // RestrictionService,
    ChipListModule,
    DropDownListModule,
    MultiSelectModule,
    TooltipModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    AgGridModule.withComponents([]),
    MatSelectModule,
    MatOptionModule,
    AccessRoutingModule,
    CommonModule,
    MaterialComponents,
    FormsModule ,
    SharedModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    NgMultiSelectDropDownModule
   
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [CheckBoxSelectionService],
  entryComponents: [AddRestrictionDialog],
  
})
export class AccessRestrictionModule { }

