import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppointmentIvrComponent } from './appointment-ivr/appointment-ivr.component';
import { ViewAppointmentCdrComponent } from './view-appointment-cdr/view-appointment-cdr.component';
import { AppointmentHistoryComponent } from './appointment-history/appointment-history.component';

const routes: Routes = [
  {
      path: '', data: { title: 'Appointment' },
      children: [
          { path: '', redirectTo: 'ivr' },
          { path: 'view', component: AppointmentIvrComponent, data: { title: 'View Appointment IVR' } },
          { path: 'cdr', component: ViewAppointmentCdrComponent, data: { title: 'View Appointment CDR' } },
          { path: 'history', component: AppointmentHistoryComponent, data: { title: 'Appointment-HISTORY' } },
        
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
