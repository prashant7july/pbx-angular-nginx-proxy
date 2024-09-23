import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponents } from '../../core/material-ui';  
import {MatSelectModule} from '@angular/material/select';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatOptionModule } from '@angular/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ProductProfileComponent } from './product-profile.component';
import { ProfileRoutingModule } from './product.profile.routing';
import { ProductProfileService } from './product.profile.service';
import { FileSelectDirective, FileUploadModule } from 'ng2-file-upload';
@NgModule({
  declarations: [ProductProfileComponent],
  imports: [
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    AgGridModule.withComponents([ProductProfileComponent]),    
    MatSelectModule,
    MatOptionModule,
    CommonModule,    
    ProfileRoutingModule,
    MaterialComponents,
    FormsModule ,
    SharedModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    NgMultiSelectDropDownModule,
    ChipListModule,
    TooltipModule,
    MultiSelectModule,
    DropDownListModule,
    FileUploadModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [ProductProfileService],
  entryComponents: [],
  
})
export class ProductProfileModule { }
