import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicIvrRoutingModule } from './dynamic-ivr-routing.module';
import { DynamicIVRDialog, DynamicIvrComponent } from './dynamic-ivr/dynamic-ivr.component';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { TooltipModule } from 'ngx-bootstrap';
import { CheckBoxModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { ContactListRoutingModule } from '../contact-list/contact-list.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialComponents } from 'src/app/core';
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
  declarations: [DynamicIvrComponent,DynamicIVRDialog],
  imports: [
    CommonModule,
    DynamicIvrRoutingModule,
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgxDatatableModule,
    SharedModule,
    MaterialComponents,
    FileUploadModule,
    CheckBoxModule,
    MultiSelectModule
  ],
  entryComponents: [DynamicIVRDialog],

})
export class DynamicIvrModule { }
