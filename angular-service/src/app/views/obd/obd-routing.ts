import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObdCdrComponent } from './obd-cdr/obd-cdr.component';
import { ObdInstanceReportComponent } from './obd-instance-report/obd-instance-report.component';
import { ObdRecordingsComponent } from './obd-recordings/obd-recordings.component';
import { ObdThirdPartyIntegrationComponent } from './obd-third-party-integration/obd-third-party-integration.component';
import { ObdComponent } from "./obd.component"
import { ObdApiCdrComponent } from './obd-api-cdr/obd-api-cdr.component';

const routes: Routes = [
  {
    path: "",
    data: { title: "obd" },
    children: [
      { path: "", redirectTo: "view" },
      {
        path: "view",
        component: ObdComponent,
        data: { title: "View OBD" },
      },
      {
        path: "obd-cdr",
        component: ObdCdrComponent,
        data: { title: "OBD CDR" },
      },
      {
        path: "obd-api-cdr",
        component: ObdApiCdrComponent,
        data: { title: "OBD API CDR" },
      },
      {
        path: "obd-instance",
        component: ObdInstanceReportComponent,
        data: { title: "OBD CDR" },
      },
      {
        path: "obd-recordings",
        component: ObdRecordingsComponent,
        data: { title: "OBD Recordings" },
      },
      {
        path: "third-party-integration",
        component: ObdThirdPartyIntegrationComponent,
        data: { title: "Third Party Integration"}
      }

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ObdRoutingModule { }
