import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialComponents } from '../../core/material-ui';
import { PickListModule } from 'primeng/picklist';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {CalendarModule} from 'primeng/calendar';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { AddWhatsappTemplateDialog, WhatsappTemplateComponent } from './whatsapp-template/whatsapp-template.component';
import { WhatsappRoutingModule } from './whatsapp-routing.module';
import { SocialMediaChannelComponent, AddSocialMediaDialog } from './social-media-channel/social-media-channel.component';
import { MySocialmediaComponent, AddMySocialMediaDialog } from './my-socialmedia/my-socialmedia.component';

@NgModule({
  declarations: [WhatsappTemplateComponent, AddWhatsappTemplateDialog, SocialMediaChannelComponent, AddSocialMediaDialog, MySocialmediaComponent, AddMySocialMediaDialog],
  imports: [
    CommonModule,
    WhatsappRoutingModule,   
    CommonModule,
    SharedModule, 
    FormsModule, 
    ReactiveFormsModule,
    MaterialComponents,
    PickListModule,
    MultiSelectModule,
    BsDatepickerModule.forRoot(),
    CalendarModule,
    ChipListModule,
    TooltipModule,
    ButtonModule,
    DropDownListModule    
  ],
  entryComponents: [AddWhatsappTemplateDialog, AddSocialMediaDialog, AddMySocialMediaDialog],
  providers : [CheckBoxSelectionService]
})
export class WhatsappModule { }
