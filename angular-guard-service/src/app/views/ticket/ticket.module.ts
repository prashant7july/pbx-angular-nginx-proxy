import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketRoutingModule, ticketComponents } from './ticket.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageTicketComponent } from './manage-ticket/manage-ticket.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui'; 
import { TicketDialog, InfoTicketDialog } from '../../views/ticket/view-ticket/view-ticket.component';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { TicketTypeComponent,addTicketTypeDialog,manageTicketDialog ,InfoticketDialog} from './ticket-type/ticket-type.component';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [
    ticketComponents,
    ManageTicketComponent,
    TicketDialog,InfoTicketDialog,InfoticketDialog, TicketTypeComponent,addTicketTypeDialog,manageTicketDialog
  ],
  imports: [
    CommonModule,
    TicketRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    BsDatepickerModule.forRoot(),
    SharedModule,
    MaterialComponents,
    RichTextEditorAllModule,
    MultiSelectModule,
    CheckBoxModule,
    ChipListModule,
    TooltipModule,
    DropDownListModule
  ],
  entryComponents:[TicketDialog,InfoTicketDialog,InfoticketDialog,addTicketTypeDialog,manageTicketDialog],
  providers : [CheckBoxSelectionService]  

})
export class TicketModule { }
