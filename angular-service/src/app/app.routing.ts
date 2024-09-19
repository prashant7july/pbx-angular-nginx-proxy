import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './core';

import { OpenLayoutComponent } from './layout/open-layout/open-layout.component';
import { SecuredLayoutComponent } from './layout/secured-layout/secured-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '', component: OpenLayoutComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./views/auth/auth.module').then(m => m.AuthModule)
      },
    ]
  },
  {
    path: '', component: SecuredLayoutComponent,
    children: [
    
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'user',
        loadChildren: () => import('./views/user/user.module').then(m => m.UserModule)
      },
      {
        path: 'package',
        loadChildren: () => import('./views/package/package.module').then(m => m.PackageModule)

      },
      {
        path: 'ticket',
        loadChildren: () => import('./views/ticket/ticket.module').then(m => m.TicketModule)

      },
      {
        path: 'extension',
        loadChildren: () => import('./views/extension/extension.module').then(m => m.ExtensionModule)

      },
      {
        path: 'password',
        loadChildren: () => import('./views/password/password.module').then(m => m.PasswordModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./views/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'emailTemplate',
        loadChildren: () => import('./views/email-template/email-template.module').then(m => m.EmailTemplateModule)
      },
      {
        path: 'contactList',
        loadChildren: () => import('./views/contact-list/contact-list.module').then(m => m.ContactListModule)
      },
      {
        path: 'blackList',
        loadChildren: () => import('./views/black-list/black-list.module').then(m => m.BlackListModule)
      },
      {
        path: 'extensionSettings',
        loadChildren: () => import('./views/extension-settings/extension-settings.module').then(m => m.ExtensionSettingsModule)
      },
      {
        path: 'voicemail',
        loadChildren: () => import('./views/voicemail/voicemail.module').then(m => m.VoicemailModule)
      },
      {
        path: 'callForward',
        loadChildren: () => import('./views/call-forward/call-forward.module').then(m => m.CallForwardModule)
      },
      {
        path: 'prompts',
        loadChildren: () => import('./views/prompts/prompts.module').then(m => m.PromptsModule)
      },
      {
        path: 'did',
        loadChildren: () => import('./views/DID/did.module').then(m => m.DidModule)
      },
      {
        path: 'billing',
        loadChildren: () => import('./views/billing/billing.module').then(m => m.BillingModule)
      },
      {
        path: 'conference',
        loadChildren: () => import('./views/conference/conference.module').then(m => m.ConferenceModule)
      },
      {
        path: 'callgroup',
        loadChildren: () => import('./views/call-group/call-group.module').then(m => m.CallgroupModule)
      },
      {
        path: 'callqueue',
        loadChildren: () => import('./views/call-queue/call-queue.module').then(m => m.CallQueueModule)
      },
      {
        path: 'assign',
        loadChildren: () => import('./views/assign-right/assign-right.module').then(m => m.AssignrightModule)
      },
      {
        path: 'ivr',
        loadChildren: () => import('./views/smart_ivr/appnew.module').then(m => m.AppnewModule)
      },
      {
        path: 'featureCode',
        loadChildren: () => import('./views/features-code/features-code.module').then(m => m.FeaturesCodeModule)
      },
      {
        path: 'timeGroup',
        loadChildren: () => import('./views/time-group/time-group.module').then(m => m.TimeGroupModule)
      },
      {
        path: 'imGroup',
        loadChildren: () => import('./views/im-group/im-group.module').then(m => m.ImGroupModule)
      },
      {
        path: 'callPlan',
        loadChildren: () => import('./views/call-plan/call-plan.module').then(m => m.CallPlanModule)
      },
      {
        path: 'speedDial',
        loadChildren: () => import('./views/speeddial/speeddial.module').then(m => m.SpeeddialModule)
      },  
      {
        path: 'recording',
        loadChildren: () => import('./views/recording/recording.module').then(m => m.RecordingModule)
      },    
      {
        path: 'cdr',
        loadChildren: () => import('./views/cdr/cdr.module').then(m => m.CdrModule)
      },
      {
        path: 'invoice',
        loadChildren: () => import('./views/invoice/invoice.module').then(m => m.InvoiceModule)
      },
      {  // created by Nagender
        path: 'test-payment',
        loadChildren: () => import('./views/test-payment/test-payment.module').then(m => m.TestPaymentModule)
      },
      {
        path: 'config',
        loadChildren: () => import('./views/config/config.module').then(m => m.ConfigModule)
      },
      {
        path: 'feature',
        loadChildren: () => import('./views/feature/feature.module').then(m => m.FeatureModule)
      },
      {
        path: 'support-user',
        loadChildren: () => import('./views/support-user/support-user.module').then(m => m.SupportUserModule)
      },
      {  // created by Nagender
        path: 'teleconsultation',
        loadChildren: () => import('./views/tele-consultation/tele-consultation.module').then(m => m.TeleConsultationModule)
      },
      {
        path: 'activity',
        loadChildren: () => import('./views/activity-log/logs.module').then(m => m.LogModule)
      },
      { // created by Nagender
        path: 'broadcasting',
        loadChildren: () => import('./views/broadcasting/broadcasting.module').then(m => m.BroadcastingModule)
      },
      {  // created by Nagender
        path: 'sms',
        loadChildren: () => import('./views/sms/sms.module').then(m => m.SmsModule)
      }, 
    
      {  // created by Nagender
        path: 'appointment',
        loadChildren: () => import('./views/appointment/appointment.module').then(m => m.AppointmentModule)
      },
      {  // created by Bhupendra 
        path: 'security',
        loadChildren: () => import('./views/security/security.module').then(m => m.SecurityModule)
      },
    
      {  
        path: 'permission',
        loadChildren: () => import('./views/permission/permission.module').then(m => m.PermissionModule)
      },  
      {  // created by Nagender
        path: 'minute-plan',
        loadChildren: () => import('./views/customer-minute-plan/customer-minute-plan.module').then(m => m.CustomerMinutePlanModule)
      },
      {  // created by Nagender
        path: 'favorite-extension',
        loadChildren: () => import('./views/extension-favorite/extension-favorite.module').then(m => m.ExtensionFavoriteModule)
      },
      {  // created by Nagender
        path: 'find-me-follow-me',
        loadChildren: () => import('./views/extension-fmfm/extension-fmfm.module').then(m => m.ExtensionFMFMModule)
      },
      {  // created by Nagender
        path: 'extension-call-minute',
        loadChildren: () => import('./views/extension-call-minute/extension-call-minute.module').then(m => m.ExtensionCallMinuteModule)
      },
      {  // created by Nagender
        path: 'minute-plan-history',
        loadChildren: () => import('./views/minute-plan-history/minute-plan-history.module').then(m => m.MinutePlanHistoryModule)
      },
      {  // created by Nagender
        path: 'report-module',
        loadChildren: () => import('./views/report/report.module').then(m => m.ReportModule)
      },
      {  // created by Nagender
        path: 'logs',
        loadChildren: () => import('./views/api-gateway-logs/api-gateway-logs.module').then(m => m.ApiGatewayLogsModule)
      },
      {  // created by Bhupendra 
        path: 'access-restriction',
        loadChildren: () => import('./views/Access-Restriction/restriction.module').then(m => m.AccessRestrictionModule)
      },         
      {
        path: 'reseller',
        loadChildren: () => import('./views/reseller/reseller.module').then(m => m.ResellerModule)
      },
      {
        path: 'product-profile',
        loadChildren: () => import('./views/product-profile/product.profile.module').then(m => m.ProductProfileModule)
      },   
      {
        path: 'trunk',
        loadChildren: () => import('./views/trunk/trunk.module').then(m => m.TrunkModule)
      },   
      {
        path: 'outbound-conference',
        loadChildren: () => import('./views/outbound-conference/outbound-module.module').then(m => m.OutboundModuleModule)
      },
      {
        path: 'whatsapp',
        loadChildren: () => import('./views/whatsapp/whatsapp.module').then(m => m.WhatsappModule)
      },
            
      {
        path: 'obd',
        loadChildren: () => import('./views/obd/obd.module').then(m => m.ObdModule)
      },    
      {
        path: 'dialout-rule',
        loadChildren: () => import('./views/customer-dialoutRule/customer-dialout.module').then(m => m.CustomerDialoutModule)
      },            
      {
        path: 'voicebot',
        loadChildren: () => import('./views/voicebot/voicebot-list.module').then(m => m.VoicebotListModule)
      },            
      {
        path: 'dynamic_ivr',
        loadChildren: () => import('./views/dynamic-ivr/dynamic-ivr.module').then(m => m.DynamicIvrModule)
      },            
    ],
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  { path: '**', redirectTo: 'auth' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routingComponents = [
  OpenLayoutComponent,
  SecuredLayoutComponent
];
