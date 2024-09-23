import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserListResolver } from './userList-resolver';
import { ViewTcBoosterMinutesComponent } from './view-tc-booster-minutes/view-tc-booster-minutes.component';
import { ViewTcCdrComponent } from './view-tc-cdr/view-tc-cdr.component';
import { ViewTcListComponent } from './view-tc-list/view-tc-list.component';
import { ViewTcPlanListComponent } from './view-tc-plan-list/view-tc-plan-list.component';
import { ViewTcPlanMinuteAssignComponent } from './view-tc-plan-minute-assign/view-tc-plan-minute-assign.component';
import { ViewTcRecordingComponent } from './view-tc-recording/view-tc-recording.component';
import { ViewUsersComponent } from './view-users/view-users.component';
import { TeleConsultationCdrComponent } from './tele-consultation-cdr/tele-consultation-cdr.component';
import { MappedContactsComponent } from './mapped-contacts/mapped-contacts.component';
import { ViewTcMinutesComponent } from './view-tc-minutes/view-tc-minutes.component';
import { ViewTcSubscriberInfoComponent } from './view-tc-subscriber-info/view-tc-subscriber-info.component';


const routes: Routes = [
  {
    path: '', data: { title: 'TeleConsultation' },
    children: [
        { path: '', redirectTo: 'tc-plan-list' },
        { path: 'tc-list', component: ViewTcListComponent, data: { title: 'View TC-List' } },
        { path: 'tc-plan-list', component: ViewTcPlanListComponent, data: { title: 'View TC-Plan-List' } },
        { path: 'tc-min-mapping', component: ViewTcPlanMinuteAssignComponent, data: { title: 'View TC-Plan-Minute-Assign' } },
        { path: 'tc-associate-users', component: ViewUsersComponent, resolve: { packageData: UserListResolver }, data: { title: 'View Users' } },     
        { path: 'cdr', component: ViewTcCdrComponent, data: { title: 'View TC-CDR' } },
        { path: 'recording', component: ViewTcRecordingComponent, data: { title: 'View TC-Recording' } },  
        { path: 'tc-booster-minutes', component: ViewTcBoosterMinutesComponent, data: { title: 'View TC-Recording' } },  
        { path: 'tc-cdr', component: TeleConsultationCdrComponent, data: { title: 'View TC-CDR' } },  
        { path: 'tc-plan-list/tc-mapped-contacts', component: MappedContactsComponent, data: { title: 'View Mapped-Contacts' } },  
        { path: 'tc-minutes', component: ViewTcMinutesComponent, data: { title: 'View Minutes' } },  
        { path: 'tc-subscriber-info', component: ViewTcSubscriberInfoComponent, data: { title: 'View Subscriber Info' } },  
        
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeleConsultationRoutingModule { }
