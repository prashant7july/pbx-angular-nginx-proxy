import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { P404Component } from './error/404.component';
import { P500Component } from './error/500.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Base' },
        children: [
            { path: '', redirectTo: '404' },
            { path: '404', component: P404Component, data: { title: 'Page 404' } },
            { path: '500', component: P500Component, data: { title: 'Page 500' } },
            { path: 'login', component: LoginComponent, data: { title: 'Login Page' } },
            { path: 'register', component: RegisterComponent, data: { title: 'Register Page' } },      
            { path: 'forgetPassword', component: ForgetPasswordComponent, data: { title: 'Forget Password Page' } }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }

export const authComponents = [
    P404Component,
    P500Component,
    LoginComponent,
    RegisterComponent,
    ForgetPasswordComponent
];
