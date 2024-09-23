import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SpeedDialRoutingModule ,SpeedDialComponent } from './speeddial.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MaterialComponents } from '../../core/material-ui'; 
import { SharedModule } from '../../shared/shared.module';
import { InfoSpeeddialDialog } from '../speeddial/speed-dial-features/speed-dial-features.component';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [SpeedDialComponent,InfoSpeeddialDialog],
  imports: [
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    MultiSelectModule,
    CommonModule,
    SpeedDialRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    MaterialComponents,
    SharedModule
  ],
  entryComponents:[InfoSpeeddialDialog],
})
export class SpeeddialModule { }
