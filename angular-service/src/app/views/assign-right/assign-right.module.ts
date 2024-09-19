import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssignrightRoutingModule, AssignrightComponents } from './assign-right.routing';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';
import { AssignRightsDialog } from '../assign-right/assign-right/assign-right.component';

@NgModule({
  declarations: [AssignrightComponents, AssignRightsDialog],
  imports: [
    CommonModule,
    AssignrightRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    BsDatepickerModule.forRoot(),
    MultiSelectModule,
    PickListModule,
    DataViewModule,
    ButtonModule,
    SharedModule,
    MaterialComponents
  ],
  entryComponents: [AssignRightsDialog],
})
export class AssignrightModule { }
