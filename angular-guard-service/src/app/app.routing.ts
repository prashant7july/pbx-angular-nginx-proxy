import { NgModule } from '@angular/core';  // Import NgModule
import { RouterModule, Routes } from '@angular/router';  // Import RouterModule and Routes
import { AdminComponent } from './admin/admin.component';
import { TenantComponent } from './tenant/tenant.component';
import { LoginComponent } from './login/login.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AppComponent } from './app.component';  // Import AppComponent if used in routing

const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: 'tenant', component: TenantComponent },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Register routes
  exports: [RouterModule]
})
export class AppRoutingModule { }
