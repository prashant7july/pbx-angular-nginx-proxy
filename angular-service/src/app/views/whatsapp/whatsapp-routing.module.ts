import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { WhatsappTemplateComponent } from './whatsapp-template/whatsapp-template.component';
import { SocialMediaChannelComponent } from './social-media-channel/social-media-channel.component';
import { MySocialmediaComponent } from './my-socialmedia/my-socialmedia.component';


const routes: Routes = [
  {
      path: '', data: { title: 'Whatsapp' },
      children: [
          { path: '', redirectTo: 'whatsapp-template' },
          { path: 'whatsapp-template', component: WhatsappTemplateComponent, data: { title: 'Whatsapp Template' } },
          { path: 'social-media', component: SocialMediaChannelComponent, data: { title: 'Social Media Channel' } },
          { path: 'social', component: MySocialmediaComponent, data: { title: 'My Social Media' } }
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class WhatsappRoutingModule { }

export const WhatsappComponents = [
  WhatsappTemplateComponent,
  SocialMediaChannelComponent,
  MySocialmediaComponent
];

