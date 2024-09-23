import { IVRRoutingModule, ivrComponents } from "./ivr.routing";
import { ContextMenuModule } from "@syncfusion/ej2-angular-navigations";
import { DialogModule, TooltipModule } from "@syncfusion/ej2-angular-popups";
import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { SliderModule } from "@syncfusion/ej2-angular-inputs";
import { IVRCodeComponent } from "./ivrcode/ivrcode.component";
import { DialogAllModule } from "@syncfusion/ej2-angular-popups";
import {
  DiagramAllModule,
  SymbolPaletteAllModule,
  OverviewAllModule,
} from "@syncfusion/ej2-angular-diagrams";
import { ListViewAllModule } from "@syncfusion/ej2-angular-lists";
import { DropDownListAllModule } from "@syncfusion/ej2-angular-dropdowns";
import { MultiSelectModule } from "@syncfusion/ej2-angular-dropdowns";
import { ToolbarModule } from "@syncfusion/ej2-angular-navigations";
import {
  NumericTextBoxModule,
  ColorPickerModule,
  UploaderModule,
  TextBoxModule,
} from "@syncfusion/ej2-angular-inputs";
import { DropDownButtonModule } from "@syncfusion/ej2-angular-splitbuttons";
import {
  ButtonModule,
  CheckBoxModule,
  RadioButtonModule,
} from "@syncfusion/ej2-angular-buttons";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";
import { NgModule } from "@angular/core";
import { MaterialComponents } from "../../core/material-ui";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InfoIVRDialog } from "../smart_ivr/view-ivr/view-ivr.component";
import { MultilevelIVRResolver } from "./multilevel-ivr-resolver";

@NgModule({
  imports: [
    IVRRoutingModule,
    NumericTextBoxModule,
    DropDownButtonModule,
    ContextMenuModule,
    SliderModule,
    ToolbarModule,
    DropDownListModule,
    ButtonModule,
    RadioButtonModule,
    UploaderModule,
    DialogModule,
    CheckBoxModule,
    MultiSelectModule,
    TooltipModule,
    ColorPickerModule,

    DiagramAllModule,
    SymbolPaletteAllModule,
    OverviewAllModule,
    DropDownListAllModule,
    ListViewAllModule,
    DialogAllModule,
    TextBoxModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: "never" }),
    MaterialComponents,
    CommonModule,
    SharedModule,
  ],

  declarations: [ivrComponents, IVRCodeComponent, InfoIVRDialog],
  providers: [MultilevelIVRResolver],
  entryComponents: [IVRCodeComponent, InfoIVRDialog],
  bootstrap: [IVRCodeComponent],
})
export class AppnewModule {}
