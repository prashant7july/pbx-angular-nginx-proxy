import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TestPaymentComponent,TestPaymentRoutingModule } from './test-payment.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MaterialComponents } from '../../core/material-ui'; 
import { SharedModule } from '../../shared/shared.module';
import { PaytmSuccessComponent } from './paytm-success/paytm-success.component';

@NgModule({
  declarations: [TestPaymentComponent ],
  imports: [
    CommonModule,
    TestPaymentRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}), 
    MaterialComponents,
    SharedModule
  ]
})
export class TestPaymentModule { }
