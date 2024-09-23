import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromptsRoutingModule, promptsComponents } from './prompts.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileSelectDirective, FileUploadModule } from 'ng2-file-upload';
// import { SafeUrlPipe } from '../../core';
import { SharedModule } from '../../shared/shared.module';
import { PromptDialog,InfoPromptDialog } from '../../views/prompts/view-prompts/view-prompts.component'
import { MaterialComponents } from '../../core/material-ui';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { AssociatePromptComponent } from './associate-prompt/associate-prompt.component';
import {MultiPromptResolver} from './multiprompt-resolver'

@NgModule({
  declarations: [
    promptsComponents,PromptDialog,InfoPromptDialog, AssociatePromptComponent
  ],
  imports: [
    DropDownListModule,
    ButtonModule,
    TooltipModule,
    ChipListModule,
    MultiSelectModuleNag,
    MultiSelectModule,
    ColorPickerModule,
    CommonModule,
    PromptsRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    FileUploadModule, 
    SharedModule,
    MaterialComponents 
  ],
  providers:[MultiPromptResolver,CheckBoxSelectionService],
  entryComponents: [PromptDialog,InfoPromptDialog],

})
export class PromptsModule { }
