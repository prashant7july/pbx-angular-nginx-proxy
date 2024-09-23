import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtensionFMFMRoutingModule } from './extension-fmfm-routing.module';
import { ViewFindMeFollowMeComponent } from './view-find-me-follow-me/view-find-me-follow-me.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MaterialComponents } from '../../core/material-ui';  
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';


@NgModule({
  declarations: [ViewFindMeFollowMeComponent],
  imports: [
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    MultiSelectModule,
    ExtensionFMFMRoutingModule,
    CommonModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    MaterialComponents
  ]
})
export class ExtensionFMFMModule { }
