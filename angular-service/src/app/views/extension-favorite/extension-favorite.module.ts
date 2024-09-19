import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtensionFavoriteRoutingModule } from './extension-favorite-routing.module';
import { ViewFavoriteExtensionComponent } from './view-favorite-extension/view-favorite-extension.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  

@NgModule({
  declarations: [ViewFavoriteExtensionComponent],
  imports: [
    CommonModule,
    ExtensionFavoriteRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    SharedModule,
    MaterialComponents
  ]
})
export class ExtensionFavoriteModule { }
