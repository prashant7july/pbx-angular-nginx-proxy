import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionRoutingModule, permissionComponents } from './permission.routing';
import { MaterialComponents } from '../../core/material-ui';
import { SharedModule } from '../../shared/shared.module';
import { permissionDialog } from './view-permission/view-permission.component';
import { SubadminListComponent } from './subadmin-list/subadmin-list.component';
import { ExtraPermissionDialog } from '../../views/permission/create-permission/permission.component';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';



@NgModule({
  declarations: [permissionComponents, permissionDialog, SubadminListComponent, ExtraPermissionDialog],
  imports: [
    CommonModule,
    PermissionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponents,
    SharedModule,
    DropDownListModule
  ],
  entryComponents: [permissionDialog, ExtraPermissionDialog]
})
export class PermissionModule { }
