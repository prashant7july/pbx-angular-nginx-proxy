import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { AppAsideModule, AppBreadcrumbModule, AppHeaderModule, AppFooterModule, AppSidebarModule, } from '@coreui/angular';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule, routingComponents } from './app.routing';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule ,BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { EmailService } from './core/services/email.service';
import { SupportDashboardComponent } from './views/dashboard/support-dashboard/support-dashboard.component';
import { HttpClientModule } from '@angular/common/http'; 
import { NgHttpLoaderModule } from 'ng-http-loader';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { MaterialComponents } from './core/material-ui';
import { InfoProfileDialog,InfoChangePasswordDialog, Did2SipDialog } from './layout/secured-layout/secured-layout.component';
import { AgmCoreModule } from '@agm/core';
import { NgxUiLoaderModule, NgxUiLoaderHttpModule, SPINNER,PB_DIRECTION,POSITION, NgxUiLoaderService } from "ngx-ui-loader";
import { NgxUiLoaderConfig } from "ngx-ui-loader";
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';
import { EmitterService, UserService, userUpdated } from './core';
import {MatIconModule} from '@angular/material/icon';
import { ObdComponent } from './views/obd/obd.component';

// import { ImGroupComponent, ImGroupDialog } from './views/im-group/im-group.component';
// import { PackageAssociateComponent } from './package-associate/package-associate.component';

// import { loginservice } from './core/services/login.service';



const NgxUiLoaderConfi : NgxUiLoaderConfig ={
  "bgsColor": "#8cc0e5",
  "bgsOpacity": 0.5,
  "bgsPosition": "bottom-right",
  "bgsSize": 110,
  "bgsType": "ball-spin-clockwise",
  "blur": 5,
  "delay": 0,
  "fastFadeOut": true,
  "fgsColor": "8cc0e5",
  "fgsPosition": "center-center",
  "fgsSize": 120,
  "fgsType": "three-strings",
  "gap": 24,
  "logoPosition": "center-center",
  "logoSize": 150,
  "logoUrl": "",
  "masterLoaderId": "master",
  "overlayBorderRadius": "0",
  "overlayColor": "rgba(40, 40, 40, 0.8)",
  "pbColor": "8cc0e5",
  "pbDirection": "ltr",
  "pbThickness": 5,
  "hasProgressBar": true,
  // "text": "ECTPL",
  "textColor": "#FFFFFF",
  "textPosition": "top-center",
  "maxTime": -1,
  "minTime": 300
}



@NgModule({
  declarations: [
    // AccessRestriction,
    AppComponent,
    routingComponents,
    InfoProfileDialog,
    InfoChangePasswordDialog,
    Did2SipDialog,
    
    // PackageAssociateComponent
   ],
  imports: [
    BrowserModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot() ,
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    AppRoutingModule,
    CoreModule,
    ReactiveFormsModule,
    SharedModule,  
    NoopAnimationsModule,
    BrowserAnimationsModule,
    FormsModule,
    NgxUiLoaderModule.forRoot(NgxUiLoaderConfi),
    NgxUiLoaderHttpModule.forRoot({showForeground: true}),
    ToastrModule.forRoot(),
    HttpClientModule,
    NgHttpLoaderModule.forRoot(),
    TimepickerModule.forRoot(),
    MaterialComponents,
    MatIconModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCh2UWaDQaWJdsrilNjkW6TkH6sYVtMO2w'
    }),
  ],
  schemas:[NO_ERRORS_SCHEMA],
  providers: [EmailService,SupportDashboardComponent,NgxUiLoaderService,UserService,EmitterService],
  bootstrap: [AppComponent],
  entryComponents: [InfoProfileDialog,InfoChangePasswordDialog,Did2SipDialog],
})
export class AppModule { }
