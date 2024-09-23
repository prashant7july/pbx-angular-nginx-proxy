import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlackListRoutingModule, blackListComponents } from './black-list.routing';
import { MaterialComponents } from '../../core/material-ui';  
import { SharedModule } from '../../shared/shared.module';
import { BlacklistDialog, InfoBlackListDialog } from '../../views/black-list/view-blacklist/view-blacklist.component';
// import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
// import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [blackListComponents,BlacklistDialog,InfoBlackListDialog],
  imports: [
    CommonModule,
    BlackListRoutingModule ,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    SharedModule,
    MaterialComponents,
    MultiSelectModule,
    DropDownListModule,
    ButtonModule,
    ChipListModule,
    TooltipModule
  ],
  entryComponents: [BlacklistDialog,InfoBlackListDialog],
  providers : [CheckBoxSelectionService]
})
export class BlackListModule { }
