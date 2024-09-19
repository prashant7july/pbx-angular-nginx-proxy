import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeleConsultationRoutingModule } from './tele-consultation-routing.module';
import { AddTCPlanDialog, ViewTcPlanListComponent,addContactDialog } from './view-tc-plan-list/view-tc-plan-list.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialComponents } from '../../core/material-ui';
import { TCPlanMinuteMapDialog, ViewTcPlanMinuteAssignComponent } from './view-tc-plan-minute-assign/view-tc-plan-minute-assign.component';
import { AddTCDialog, ViewTcListComponent } from './view-tc-list/view-tc-list.component';  
import { PickListModule } from 'primeng/picklist';
import { ViewUsersComponent } from './view-users/view-users.component';
import { UserListResolver } from './userList-resolver';
import { ViewTcCdrComponent } from './view-tc-cdr/view-tc-cdr.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ViewTcRecordingComponent } from './view-tc-recording/view-tc-recording.component';
import { ViewTcBoosterMinutesComponent } from './view-tc-booster-minutes/view-tc-booster-minutes.component';
import { CallPlanModule } from '../call-plan/call-plan.module';
import { TeleConsultationCdrComponent } from './tele-consultation-cdr/tele-consultation-cdr.component';
import {UnauthorizeCdrDialog} from './tele-consultation-cdr/tele-consultation-cdr.component'
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxSelectionService, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { MappedContactsComponent } from './mapped-contacts/mapped-contacts.component';
import {InfoTcHistoryDialog} from './mapped-contacts/mapped-contacts.component'
import { BoosterAssociateRatesDialog } from '../customer-minute-plan/booster-minutes/booster-minutes.component';
import {MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ViewTcMinutesComponent } from './view-tc-minutes/view-tc-minutes.component';
import { subscriberInfoDialog, ViewTcSubscriberInfoComponent } from './view-tc-subscriber-info/view-tc-subscriber-info.component';



@NgModule({
  declarations: [ViewTcPlanListComponent,AddTCPlanDialog, ViewTcPlanMinuteAssignComponent,
                 TCPlanMinuteMapDialog, ViewTcListComponent, AddTCDialog, ViewUsersComponent, ViewTcCdrComponent, ViewTcRecordingComponent, ViewTcBoosterMinutesComponent, TeleConsultationCdrComponent , UnauthorizeCdrDialog, MappedContactsComponent,InfoTcHistoryDialog, ViewTcMinutesComponent, ViewTcSubscriberInfoComponent,subscriberInfoDialog,addContactDialog],
  imports: [
    MatNativeDateModule,
    MatInputModule,
    MatDatepickerModule,
    MatTableModule,
    CommonModule,
    TeleConsultationRoutingModule,
    SharedModule, 
    FormsModule, 
    ReactiveFormsModule,
    MaterialComponents,
    PickListModule,
    MultiSelectModule,
    BsDatepickerModule.forRoot(),
    CallPlanModule,
    DropDownListModule,
    TooltipModule,
    ChipListModule
  ],
  providers:[UserListResolver, CheckBoxSelectionService],
  entryComponents: [AddTCPlanDialog, TCPlanMinuteMapDialog, AddTCDialog,UnauthorizeCdrDialog,InfoTcHistoryDialog,BoosterAssociateRatesDialog,subscriberInfoDialog ,addContactDialog]


})
export class TeleConsultationModule { }
