import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvidersRoutingModule, providersComponents } from './provider.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridModule } from '@ag-grid-community/angular';
import { MaterialComponents } from '../../core/material-ui';
import { ProviderDialog,InfoProviderDialog } from '../../views/provider/create-provider/create-provider.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../../shared/shared.module';
import { AssociateProviderComponent } from './associate-provider/associate-provider.component';

@NgModule({
  declarations: [
    providersComponents, ProviderDialog, InfoProviderDialog, AssociateProviderComponent
  ],
  imports: [
    CommonModule,
    ProvidersRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    AgGridModule.withComponents([]),
    MultiSelectModule,
    MaterialComponents,
    SharedModule
  ],
  entryComponents: [ProviderDialog, InfoProviderDialog],
  exports:[ AgGridModule],
})
export class PromptsModule { }
