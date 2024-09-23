import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtensionRoutingModule, extensionComponents } from './extension.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickListModule } from 'primeng/picklist';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';
import { InfoSupportExtensionDialog } from '../extension/support-view-extension/support-view-extension.component';
import { InfoSupportExtensionFeaturesDialog } from '../extension/support-view-features/support-view-features.component';
import { BulkExtDeleteDialog, BulkExtUpdateDialog, importExtensionDialog, InfoExtensionDialog, removeExtensionMinute } from '../extension/view-extension/view-extension.component';
import { InfoExtensionFeaturesDialog } from '../extension/view-extension-features/view-extension-features.component';
import { ManageMinuteDialog } from '../extension/view-extension/view-extension.component';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ManageExtensionMinuteComponent } from './manage-extension-minute/manage-extension-minute.component';
import { DeductExtensionMinuteComponent } from './deduct-extension-minute/deduct-extension-minute.component';
import { ExtMappedDestinationComponent } from './ext-mapped-destination/ext-mapped-destination.component';
import { FileUploadModule } from 'ng2-file-upload';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  declarations: [
    extensionComponents,
    InfoSupportExtensionDialog,
    InfoSupportExtensionFeaturesDialog,
    InfoExtensionDialog,
    InfoExtensionFeaturesDialog,
    ManageMinuteDialog,
    BulkExtUpdateDialog,
    ManageExtensionMinuteComponent,
    DeductExtensionMinuteComponent,
    ExtMappedDestinationComponent,
    removeExtensionMinute,    
    importExtensionDialog,
    BulkExtDeleteDialog
  ],
  imports: [
    ScrollingModule,
    FileUploadModule,
    CommonModule,
    ExtensionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PickListModule,
    DataViewModule,
    ButtonModule,
    NgxDatatableModule,
    SharedModule,
    ChipListModule,
    MultiSelectModule,
    TooltipModule,DropDownListModule,
    MaterialComponents
  ],
  exports : [extensionComponents],
  entryComponents:[InfoSupportExtensionDialog,InfoSupportExtensionFeaturesDialog,BulkExtDeleteDialog,
                  InfoExtensionDialog,InfoExtensionFeaturesDialog,ManageMinuteDialog, BulkExtUpdateDialog, removeExtensionMinute, importExtensionDialog],
    providers : [CheckBoxSelectionService]

})
export class ExtensionModule { }

