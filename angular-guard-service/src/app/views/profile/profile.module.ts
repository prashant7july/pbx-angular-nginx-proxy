import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule,profileComponents } from './profile.routing';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { FileSelectDirective, FileUploadModule } from 'ng2-file-upload';
import { DashboadCustomizeComponent } from './dashboad-customize/dashboad-customize.component';

@NgModule({
  declarations: [profileComponents, DashboadCustomizeComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponents,
    SharedModule,
    FileUploadModule
  ]
})
export class ProfileModule { }
