import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordRoutingModule, passwordComponents } from './password.routing';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [passwordComponents],
  imports: [
    CommonModule,
    PasswordRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponents,
    SharedModule
  ]
})
export class PasswordModule { }
