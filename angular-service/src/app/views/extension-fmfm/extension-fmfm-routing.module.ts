import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewFindMeFollowMeComponent } from './view-find-me-follow-me/view-find-me-follow-me.component';

const routes: Routes = [
  {
    path: '', data: { title: 'View' },
    children: [
        { path: '', redirectTo: 'extension' },
        { path: 'extension', component: ViewFindMeFollowMeComponent, data: { title: 'Extension FMFM' } },
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtensionFMFMRoutingModule { }
