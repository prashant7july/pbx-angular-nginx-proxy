import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CallForwardRoutingModule ,CallForwardComponent } from './call-forward.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MaterialComponents } from '../../core/material-ui';  
import { SharedModule } from '../../shared/shared.module';
import { InfoCallForwardDialog } from '../call-forward/call-forward-features/call-forward-features.component';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [CallForwardComponent,InfoCallForwardDialog],
  imports: [
    MultiSelectModule,
    ChipListModule,
    TooltipModule,
    DropDownListModule,
    CommonModule,
    CallForwardRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    MaterialComponents,
    SharedModule
  ],
  entryComponents: [InfoCallForwardDialog],
})
export class CallForwardModule { }
