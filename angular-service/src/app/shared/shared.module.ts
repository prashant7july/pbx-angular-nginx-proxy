import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AgGridModule } from '@ag-grid-community/angular';
import { AgGridComponent } from '../layout/ag-grid/ag-grid.component';
import { SafeUrlPipe,SortByPipe,BlockCopyPasteDirective } from '../core';
import { CommonDocumentComponent } from '../layout/common-document/common-document.component';
import { MaterialComponents } from '../core/material-ui';  
import { AccordianFilterComponent } from '../layout/accordian-filter/accordian-filter.component';
import { BackButtonDirective } from '../core/directive/one-step-back.directive';
import { BoosterAssociateRatesDialog } from '../views/customer-minute-plan/booster-minutes/booster-minutes.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AgGridModule.withComponents([]),
    MaterialComponents
  ],
  declarations: [
    AgGridComponent, SortByPipe,BlockCopyPasteDirective,CommonDocumentComponent,SafeUrlPipe,
    AccordianFilterComponent,BackButtonDirective,BoosterAssociateRatesDialog
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AgGridComponent,  
    SortByPipe,
    BlockCopyPasteDirective,
    CommonDocumentComponent,
    SafeUrlPipe,
    AccordianFilterComponent,
    BackButtonDirective,
    BoosterAssociateRatesDialog
  ]
})
export class SharedModule { }
