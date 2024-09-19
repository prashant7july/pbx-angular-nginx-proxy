import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatOptionModule } from "@angular/material";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { ButtonModule, ChipListModule } from "@syncfusion/ej2-angular-buttons";
import {
  DropDownListModule,
  MultiSelectModule,
} from "@syncfusion/ej2-angular-dropdowns";
import { TooltipModule } from "@syncfusion/ej2-angular-popups";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { DataViewModule } from "primeng/dataview";
import { PickListModule } from "primeng/picklist";
import { MaterialComponents } from "../../core/material-ui";
import { SharedModule } from "../../shared/shared.module";
import {
  addGatewayDialog,
  InfoGatewayDialog,
} from "../../views/gateway/view-gateway/view-gateway.component";
import { gatewayComponents, GatewayRoutingModule } from "./gateway.routing";
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CalendarModule } from 'primeng/calendar';





@NgModule({
  declarations: [gatewayComponents, InfoGatewayDialog, addGatewayDialog],
  imports: [
    DropDownListModule,
    ChipListModule,
    TooltipModule,
    MultiSelectModule,
    MatInputModule,
    MatFormFieldModule,
    HttpClientModule,
    MatOptionModule,
    CommonModule,
    GatewayRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: "never" }),
    NgxDatatableModule,
    PickListModule,
    DataViewModule,
    ButtonModule,
    SharedModule,
    CalendarModule,
    MaterialComponents,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule
  ],
  entryComponents: [InfoGatewayDialog, addGatewayDialog],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'LL'
        },
        display: {
          dateInput: 'DD-MM-YYYY',
          monthYearLabel: 'YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'YYYY'
        }
      },
    },
  ],
})
export class GatewayModule { }
