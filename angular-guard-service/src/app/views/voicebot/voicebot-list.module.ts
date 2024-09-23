import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule, TooltipModule } from 'ngx-bootstrap';
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
import { VoicebotListRoutingModule } from './voicebot-list-routing.module';
import { VoicebotDialog, VoicebotListComponent } from './voicebot-list/voicebot-list.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { VoicebotCdrComponent } from './voicebot-cdr/voicebot-cdr.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';




@NgModule({
  declarations: [VoicebotListComponent,VoicebotDialog, VoicebotCdrComponent],
  imports: [
    CheckBoxModule,
    ColorPickerModule,
    MatAutocompleteModule,
    ChipListModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    MaterialComponents,
    SharedModule,
    MultiSelectModule,
    DropDownListModule,
    CommonModule,
    VoicebotListRoutingModule,
    MatGridListModule,
    BsDatepickerModule.forRoot(),
  ],
  entryComponents: [VoicebotDialog],
  providers : [CheckBoxSelectionService]

})
export class VoicebotListModule { }
