import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CallQueueRoutingModule, callqueueComponents } from './call-queue.routing';
import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { MaterialComponents } from '../../core/material-ui';  
import { SharedModule } from '../../shared/shared.module';
import { CallqueueDialog,InfoCallQueueDialog } from '../../views/call-queue/view-callqueue/view-callqueue.component';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';


@NgModule({
  declarations: [callqueueComponents,CallqueueDialog,InfoCallQueueDialog],
  imports: [
    CommonModule,
    CallQueueRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgxDatatableModule,
    PickListModule,
    DataViewModule,
    ButtonModule,
    MaterialComponents,
    SharedModule,
    CheckBoxModule,
    MultiSelectModule,
    ChipListModule,
    TooltipModule,
    DropDownListModule
  ],
  entryComponents: [CallqueueDialog,InfoCallQueueDialog],
})
export class CallQueueModule { }
