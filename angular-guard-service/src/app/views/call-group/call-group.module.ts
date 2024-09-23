import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CallgroupRoutingModule, callgroupComponents } from './call-group.routing';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
// import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';
// import { ButtonModule } from 'primeng/button';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';
import { CallgroupDialog, InfoCallGroupDialog } from '../../views/call-group/view-callgroup/view-callgroup.component';
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';



@NgModule({
  declarations: [callgroupComponents, CallgroupDialog,InfoCallGroupDialog],
  imports: [
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    CommonModule,
    CallgroupRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    BsDatepickerModule.forRoot(),
    MultiSelectModule,
    PickListModule,
    DataViewModule,
    ButtonModule,
    SharedModule,
    MaterialComponents,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  entryComponents: [CallgroupDialog,InfoCallGroupDialog],
})
export class CallgroupModule { }
