import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewApiLogsComponent } from './view-api-logs/view-api-logs.component';
import { ViewPackageAuditLogComponent } from './view-package-audit-log/view-package-audit-log.component';
import { ViewTcAuditLogsComponent } from './view-tc-audit-logs/view-tc-audit-logs.component';
import { ViewAuditLogsComponent } from './view-audit-logs/view-audit-logs.component';
import { ViewSmtpAuditLogsComponent } from './view-smtp-audit-logs/view-smtp-audit-logs.component';

const routes: Routes = [
  {
    path: '', data: { title: 'Activity Log' },
    children: [
        { path: '', redirectTo: 'gateway-api' },
        { path: 'gateway-api', component: ViewApiLogsComponent, data: { title: 'View User Activies' } },
        { path: 'tc', component: ViewTcAuditLogsComponent, data: { title: 'View TC Audit Logs' } },
        { path: 'package', component: ViewPackageAuditLogComponent, data: { title: 'View Package Audit Logs' } },
        { path: 'audit-logs', component: ViewAuditLogsComponent, data: { title: 'View Audit Logs' } },
        { path: 'smtp-audit-logs', component: ViewSmtpAuditLogsComponent, data: { title: 'View SMTP Audit Logs' } },
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApiGatewayLogsRoutingModule { }
