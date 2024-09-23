import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OutboundConferenceComponent } from './outbound-conference.component';
import { OutboundConferenceCdrComponent } from './outbound-conference-cdr/outbound-conference-cdr.component';
import { OcInstanceReportComponent } from './oc-instance-report/oc-instance-report.component';
import { OcRecordingComponent } from './oc-recording/oc-recording.component';

const routes: Routes = [
  {
    path: '', data: { title: 'Outbound Conference' },
    children: [
        { path: '', redirectTo: 'outbound-conference' },
        { path: 'outbound-conferences', component: OutboundConferenceComponent, data: { title: 'Outbound Conference' } },
        { path: 'outbound-conference-cdr', component: OutboundConferenceCdrComponent, data: { title: 'Outbound Conference cdr' } },
        { path: 'oc-instance-report', component: OcInstanceReportComponent, data: { title: 'Outbound Instance Report' } },
        { path: 'oc-recording', component: OcRecordingComponent, data: { title: 'Outbound Recording' } },
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutboundModuleRoutingModule { }
