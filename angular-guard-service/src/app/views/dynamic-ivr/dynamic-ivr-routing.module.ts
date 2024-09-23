import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DynamicIvrComponent } from './dynamic-ivr/dynamic-ivr.component';

const routes: Routes = [
  {
      path: '', data: { title: 'Dynamic IVR' },
      children: [
          { path: '', redirectTo: 'view' },
          { path: 'view', component: DynamicIvrComponent, data: { title: 'View Dynamic IVR' } },
      ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicIvrRoutingModule { }
