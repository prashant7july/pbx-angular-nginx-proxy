import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponents } from '../../core/material-ui';  
import {MatSelectModule} from '@angular/material/select';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SecurityService } from './security.service';
import { MatOptionModule } from '@angular/material';
import { SharedModule } from 'src/app/shared/shared.module';
// import { MatButtonModule, MatFormFieldModule, MatInputModule, MatRippleModule } from '@angular/material';
// import { SecurityRoutingModule } from './security-routing.module';
import { SecurityRoutingModule } from './security-routing.module'
import { AccessRestrictionComponent,InfoAccessDialog,InfoAccessHelpCodeDialog } from './access-restriction/access-restriction.component';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { SupportIpRestrictionComponent } from './support-ip-restriction/support-ip-restriction.component';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { AccountManagerAccessRestrictionComponent } from './account-manager-access-restriction/account-manager-access-restriction.component';
import { WhitelistComponent, WhitelistDialog } from './whitelist/whitelist.component';

@NgModule({
  declarations: [AccessRestrictionComponent,InfoAccessDialog,InfoAccessHelpCodeDialog, SupportIpRestrictionComponent, AccountManagerAccessRestrictionComponent, WhitelistComponent,WhitelistDialog],
  imports: [
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    AgGridModule.withComponents([AccessRestrictionComponent]),
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    SecurityRoutingModule,
    MaterialComponents,
    FormsModule ,
    SharedModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    NgMultiSelectDropDownModule,
    ChipListModule,
    TooltipModule,
    MultiSelectModule,
    DropDownListModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [SecurityService,CheckBoxSelectionService],
  entryComponents: [InfoAccessDialog,InfoAccessHelpCodeDialog, WhitelistDialog],
})
export class SecurityModule { }
