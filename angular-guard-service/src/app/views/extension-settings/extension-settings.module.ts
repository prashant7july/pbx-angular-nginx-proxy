import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExtensionSettingsRoutingModule ,ExtensionSettingsComponent } from './extension-settings.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MaterialComponents } from '../../core/material-ui';  
import { InfoExtensionSettingDialog } from '../extension-settings/create-extension-settings/create-extension-settings.component';

@NgModule({
  declarations: [ExtensionSettingsComponent,InfoExtensionSettingDialog],
  imports: [
    CommonModule,
    ExtensionSettingsRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    MaterialComponents
  ],
  entryComponents:[InfoExtensionSettingDialog],
})
export class ExtensionSettingsModule { }
