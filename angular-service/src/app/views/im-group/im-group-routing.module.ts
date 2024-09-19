import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImGroupComponent } from './im-group.component';

const routes: Routes = [
  {
    path: '', data: { title: 'IM Group' },
    children: [
        { path: '', redirectTo: 'view' },
        { path: 'view', component: ImGroupComponent, data: { title: 'View im-group' } },
   
        
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImGroupRoutingModule { }

