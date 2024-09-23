import { NgModule ,Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerRoutingModule, serverComponents } from './server.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { ServerDialog, InfoServerDialog} from '../../views/server/view-server/view-server.component';

@NgModule({
  declarations: [serverComponents],
  imports: [
    CommonModule,
    ServerRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    NgxDatatableModule,
    SharedModule,
    MaterialComponents
  ],
  entryComponents: [ServerDialog,InfoServerDialog],
})
export class ServerModule { }
