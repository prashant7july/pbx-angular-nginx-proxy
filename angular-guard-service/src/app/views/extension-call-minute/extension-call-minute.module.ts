import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtensionCallMinuteRoutingModule } from './extension-call-minute-routing.module';
import { ExtensionCallMinuteDetailComponent } from './extension-call-minute-detail/extension-call-minute-detail.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { HttpClientModule } from  '@angular/common/http';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [ExtensionCallMinuteDetailComponent],
  imports: [
    CommonModule,
    ExtensionCallMinuteRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    SharedModule,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    MaterialComponents
  ]
})
export class ExtensionCallMinuteModule { }
