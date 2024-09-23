import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FeaturesCodeRoutingModule ,FeaturesCodeComponent } from './features-code.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../../shared/shared.module';
import { MaterialComponents } from '../../core/material-ui';  
import { InfoFeatureCodeDialog } from '../features-code/view-features-code/view-features-code.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
@NgModule({
  declarations: [FeaturesCodeComponent],
  imports: [
    CommonModule,
    FeaturesCodeRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDatatableModule,
    SharedModule,
    BsDatepickerModule,
    MaterialComponents
  ],
  entryComponents: [InfoFeatureCodeDialog],
})
export class FeaturesCodeModule { }
