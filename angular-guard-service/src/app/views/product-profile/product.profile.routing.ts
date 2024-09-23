import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductProfileComponent } from './product-profile.component';

const routes: Routes = [
  {
    path:'',data: {title: 'Product-Profile'},
    children: [
      {path: '',redirectTo: 'product-profile'},
      {path: 'product-profile', component: ProductProfileComponent, data:{title: 'Product-Profile'}},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
// export const rComponent = []
