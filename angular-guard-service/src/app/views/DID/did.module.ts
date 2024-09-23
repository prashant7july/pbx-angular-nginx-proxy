import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DIDModule, DidComponents } from './did.routing';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { DIDDialog,InfoDidDialog, ImportDID } from '../../views/DID/view-did/view-did.component';
import { CustomerDIDDialog, InfoCustomerDidDialog } from '../../views/DID/customer-did/customer-did.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { InfoInternalUserDidDialog } from '../../views/DID/internal-user-did/internal-user-did.component';
import { InfoSupportDidDialog } from '../../views/DID/support-did/support-did.component';
import { InfoAssignDidDialog } from '../../views/DID/assign-did/assign-did.component';
import { InfoPurchaseDidDialog } from '../../views/DID/did-purchase/did-purchase.component';
import { FileUploadModule } from 'ng2-file-upload';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { DidMappedHistoryComponent, InfoDidHistoryDialog } from './did-mapped-history/did-mapped-history.component';
import { InfoDidfeatureDialog } from './customer-did/customer-did.component'
import { MatSelectFilterModule } from 'mat-select-filter';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { MultiSelectModule as MultiSelectModuleNag } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { ImportVmnComponent } from './import-vmn/import-vmn.component';
import { ImportVMNDialog } from './import-vmn/import-vmn.component';
import { ViewAssociateDIDComponent } from './view-associate-did/view-associate-did.component';
import {DidListResolver} from './didList-resolver'

@NgModule({
  declarations: [DidComponents, DIDDialog, CustomerDIDDialog,InfoDidDialog,InfoCustomerDidDialog,InfoInternalUserDidDialog,
               InfoSupportDidDialog,InfoAssignDidDialog,InfoPurchaseDidDialog,ImportDID, InfoDidHistoryDialog, DidMappedHistoryComponent,InfoDidfeatureDialog, ImportVmnComponent, ImportVMNDialog, ViewAssociateDIDComponent],
  imports: [
    CheckBoxModule,
    MatAutocompleteModule,
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    MatSelectFilterModule,
    CommonModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    DIDModule,
    MaterialComponents,
    SharedModule,
    NgxDatatableModule,
    FileUploadModule,
    MultiSelectModule,
    ColorPickerModule,
    MultiSelectModule,
    MultiSelectModuleNag
  ],
  entryComponents: [DIDDialog, CustomerDIDDialog,InfoDidDialog,InfoCustomerDidDialog,InfoInternalUserDidDialog,InfoSupportDidDialog,InfoAssignDidDialog,InfoPurchaseDidDialog,ImportDID, InfoDidHistoryDialog, InfoDidfeatureDialog, ImportVMNDialog],
  providers : [CheckBoxSelectionService,DidListResolver]  
})
export class DidModule { }
