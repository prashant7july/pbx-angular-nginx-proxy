import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewFavoriteExtensionComponent } from './view-favorite-extension/view-favorite-extension.component';

const routes: Routes = [
  {
    path: '', data: { title: 'View' },
    children: [
        { path: '', redirectTo: 'view' },
        { path: 'view', component: ViewFavoriteExtensionComponent, data: { title: 'Features Code' } },
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtensionFavoriteRoutingModule { }
