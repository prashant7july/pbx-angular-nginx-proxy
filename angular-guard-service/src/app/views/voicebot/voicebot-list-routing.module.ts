import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VoicebotCdrComponent } from './voicebot-cdr/voicebot-cdr.component';
import { VoicebotListComponent } from './voicebot-list/voicebot-list.component';

const routes: Routes = [
  {
    path: '', data: { title: 'voicebot' },
    children: [
      { path: '', redirectTo: 'voicebot' },
      { path: 'voicebot-list', component: VoicebotListComponent, data: { title: 'Voicebot List' } },
      { path: 'voicebot-cdr', component: VoicebotCdrComponent, data: { title: 'Voicebot List' } },
   
    ]
}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VoicebotListRoutingModule { }
