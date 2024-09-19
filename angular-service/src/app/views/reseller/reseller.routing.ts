import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResellerComponent, ResellerDialog } from './reseller.component';

const routes: Routes = [
  {
    path:'',data: {title: 'Reseller'},
    children: [
      {path: '',redirectTo: 'reseller'},
      {path: 'reseller', component: ResellerComponent, data:{title: 'Reseller'}},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResellerRoutingModule { }
export const resellerentryComponent = [ResellerDialog]
