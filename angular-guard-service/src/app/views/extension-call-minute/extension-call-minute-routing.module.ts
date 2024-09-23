import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExtensionCallMinuteDetailComponent } from './extension-call-minute-detail/extension-call-minute-detail.component';

const routes: Routes = [
  {
    path: '', data: { title: 'View' },
    children: [
        { path: '', redirectTo: 'detail' },
        { path: 'detail', component: ExtensionCallMinuteDetailComponent, data: { title: 'Extension Call Minute Details' } },
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtensionCallMinuteRoutingModule { }
