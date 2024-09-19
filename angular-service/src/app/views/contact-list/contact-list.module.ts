import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ContactListRoutingModule, contactListComponents } from './contact-list.routing';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';
import { ContactlistDialog,ImportDialog,InfoDialog} from '../../views/contact-list/view-contactlist/view-contactlist.component';
import { FileUploadModule } from 'ng2-file-upload';
import { AddContactGroupDialog, AddContactInGroupDialog, ViewContactGroupComponent, InfoGroupDialog} from './view-contact-group/view-contact-group.component';
// import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { GroupAssociateContactsComponent } from './group-associate-contacts/group-associate-contacts.component';
import { AssociateContactResolver } from './associate-contact-resolver';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

// import { CheckBoxAllModule } from '@syncfusion/ej2-angular-buttons';

@NgModule({
  declarations: [contactListComponents, ContactlistDialog,ImportDialog,InfoDialog, ViewContactGroupComponent,AddContactGroupDialog,
    AddContactInGroupDialog,
    InfoGroupDialog, 
    GroupAssociateContactsComponent],
  imports: [
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    CommonModule,
    ContactListRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgxDatatableModule,
    SharedModule,
    MaterialComponents,
    FileUploadModule,
    CheckBoxModule,MultiSelectModule
    // CheckBoxAllModule
  ],
  providers:[ AssociateContactResolver],
  entryComponents: [ContactlistDialog,ImportDialog,InfoDialog, AddContactGroupDialog, AddContactInGroupDialog, InfoGroupDialog],
})
export class ContactListModule { }
