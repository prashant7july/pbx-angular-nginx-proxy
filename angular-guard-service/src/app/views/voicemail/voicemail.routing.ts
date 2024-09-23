import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VoicemailListComponent } from './voicemail-list/voicemail-list.component';
import { VoicemailSettingsComponent } from './voicemail-settings/voicemail-settings.component';
const routes: Routes = [
    {
        path: '', data: { title: 'Voicemail' },
        children: [
            { path: '', redirectTo: 'settings' },
            { path: 'settings', component: VoicemailSettingsComponent, data: { title: 'Voice Mail Settings' } },
            { path: 'list', component: VoicemailListComponent, data: { title: 'Voice Mail List' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VoicemailRoutingModule { }

export const VoicemailComponent = [
    VoicemailSettingsComponent,
    VoicemailListComponent
];
