import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule, authComponents } from './auth.routing';
import { SharedModule } from '../../shared/shared.module';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha'; 



@NgModule({
  declarations: [
    authComponents
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    SharedModule,
    RecaptchaModule.forRoot(),  // Add this line
    RecaptchaFormsModule, 
  ]
})
export class AuthModule { }
