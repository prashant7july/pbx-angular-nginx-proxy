import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailTemplateRoutingModule, emailTemplateComponents } from './email-template.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileSelectDirective, FileUploadModule } from 'ng2-file-upload';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from '../../shared/shared.module'
import { MaterialComponents } from '../../core/material-ui';  
import { EmailTemplateDialog, InfoEmailTemplateDialog} from '../../views/email-template/view-email-template/view-email-template.component';
import { EmailCategoryDialog, InfoEmailCategoryDialog } from '../../views/email-template/email-category/email-category.component';
// import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule} from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { PreviewDialog } from '../../views/email-template/view-email-template/view-email-template.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';





@NgModule({
  declarations: [
    emailTemplateComponents,EmailTemplateDialog,EmailCategoryDialog,InfoEmailTemplateDialog,InfoEmailCategoryDialog,PreviewDialog
    ],
  imports: [
    DropDownListModule,
    TooltipModule,
    ChipListModule,
    CheckBoxModule,
    CommonModule,
    EmailTemplateRoutingModule,
    FormsModule,
    NgxDatatableModule,
    FileUploadModule ,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    BsDatepickerModule.forRoot(), 
    SharedModule,
    MaterialComponents,
    MultiSelectModule,
  ],
  bootstrap: [emailTemplateComponents],
  entryComponents: [EmailTemplateDialog,EmailCategoryDialog,InfoEmailTemplateDialog,PreviewDialog,InfoEmailCategoryDialog],
  providers : [CheckBoxSelectionService] 
})
export class EmailTemplateModule { }
