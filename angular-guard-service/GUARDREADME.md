To quickly implement **Angular Route Guards** to protect routes based on user roles and hide sensitive UI elements, here’s a step-by-step guide along with complete code that you can run immediately.

### Step 1: Install Required Dependencies

In your Angular project, ensure you have the `@auth0/angular-jwt` library for handling JWT tokens.

```bash
npm install @auth0/angular-jwt
```

### Step 2: Create the **AuthService** to Handle Authentication and Authorization

This service will handle user login, storing the JWT token, and retrieving the user's role.

#### `auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private apiUrl = 'http://localhost:3000';  // Point to your Express API URL

  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService) {}

  // Login method: Send credentials to the backend and store the JWT token
  login(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username });
  }

  // Store the JWT token
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Retrieve the JWT token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  // Get user role from JWT token
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decodedToken = this.jwtHelper.decodeToken(token);
    return decodedToken ? decodedToken.role : null;
  }

  // Logout and clear token
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }
}
```

### Step 3: Create Route Guards for Role-Based Access

Create route guards to restrict access based on user roles. You’ll have one for admin and one for tenant roles.

#### `admin.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.getUserRole() === 'Admin') {
      return true;
    }
    this.router.navigate(['/unauthorized']);  // Redirect to unauthorized page
    return false;
  }
}
```

#### `tenant.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TenantGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.authService.getUserRole();
    if (role === 'Tenant' || role === 'Admin') {
      return true;
    }
    this.router.navigate(['/unauthorized']);  // Redirect to unauthorized page
    return false;
  }
}
```

### Step 4: Protect Routes in the Angular Routing Module

Now, define the routes and apply the route guards to protect them.

#### `app-routing.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { TenantGuard } from './tenant.guard';
import { AdminComponent } from './admin/admin.component';
import { TenantComponent } from './tenant/tenant.component';
import { LoginComponent } from './login/login.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

const routes: Routes = [
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'tenant', component: TenantComponent, canActivate: [TenantGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### Step 5: Implement the Login Component

Create the login component to allow users to log in, receive the JWT token, and store it in local storage.

#### `login.component.ts`

```typescript
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <h2>Login</h2>
    <input [(ngModel)]="username" placeholder="Username">
    <button (click)="login()">Login</button>
  `
})
export class LoginComponent {
  username: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.username).subscribe(response => {
      this.authService.setToken(response.token);
      this.router.navigate(['/tenant']);  // Navigate to a protected route
    }, error => {
      console.error('Login failed', error);
    });
  }
}
```

### Step 6: Hide Admin-Only Links in the Template

You can use the `AuthService` to hide certain UI elements based on the user role.

#### `app.component.html`

```html
<nav>
  <a *ngIf="authService.getUserRole() === 'Admin'" routerLink="/admin">Admin Panel</a>
  <a *ngIf="authService.getUserRole() === 'Tenant'" routerLink="/tenant">Tenant Dashboard</a>
  <a *ngIf="authService.isAuthenticated()" (click)="logout()">Logout</a>
</nav>

<router-outlet></router-outlet>
```

#### `app.component.ts`

```typescript
import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
```

### Step 7: Add Unauthorized Component

Create an `UnauthorizedComponent` to handle unauthorized access attempts.

#### `unauthorized.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <h2>Unauthorized</h2>
    <p>You do not have permission to access this page.</p>
  `
})
export class UnauthorizedComponent {}
```

### Step 8: Complete JWT Token Handling

Configure the JWT Helper service in `app.module.ts`:

#### `app.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { TenantComponent } from './tenant/tenant.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export function tokenGetter() {
  return localStorage.getItem('auth_token');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    TenantComponent,
    UnauthorizedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:3000'],  // Adjust for your API URL
        disallowedRoutes: []
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Step 9: Run the Application

1. Start your **Express.js** backend that issues JWT tokens.
2. Start your **Angular** application by running:

   ```bash
   ng serve
   ```

Now, your Angular app should properly handle **authentication** and **authorization** based on **user roles** using route guards and JWT tokens.

### Conclusion

This complete example demonstrates how to:
- Protect routes using Angular route guards based on user roles (admin, tenant).
- Securely store JWT tokens and use them for authorization.
- Hide or show UI elements based on the user's role.

Let me know if you need further adjustments or have questions!


The errors you're seeing indicate that some modules are missing, including components (`admin.component`, `tenant.component`, `login.component`, and `unauthorized.component`) and the `@auth0/angular-jwt` package. Below are steps to fix these issues.

### Steps to Fix the Errors:

#### 1. **Install `@auth0/angular-jwt`**

It seems that the `@auth0/angular-jwt` package is not installed. Run the following command to install it:

```bash
npm install @auth0/angular-jwt
```

#### 2. **Create Missing Components**

The errors indicate that the following components are missing:
- `AdminComponent`
- `TenantComponent`
- `LoginComponent`
- `UnauthorizedComponent`

To fix this, create these components using Angular CLI:

```bash
ng generate component admin
ng generate component tenant
ng generate component login
ng generate component unauthorized
```

This will generate the required component files and automatically add the necessary imports to the `app.module.ts` and `app-routing.module.ts` files.

#### 3. **Check and Fix Import Paths**

Verify that the import paths in `app-routing.module.ts` and `app.module.ts` are correct and reflect the location of the components.

For example, in `app-routing.module.ts`:

```typescript
import { AdminComponent } from './admin/admin.component';
import { TenantComponent } from './tenant/tenant.component';
import { LoginComponent } from './login/login.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
```

In `app.module.ts`, ensure the imports are correct:

```typescript
import { AdminComponent } from './admin/admin.component';
import { TenantComponent } from './tenant/tenant.component';
import { LoginComponent } from './login/login.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
```

#### 4. **Verify that the Components Are Declared in `app.module.ts`**

Ensure that the components are declared in the `@NgModule` decorator in `app.module.ts`. The module should look like this:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AdminComponent } from './admin/admin.component';
import { TenantComponent } from './tenant/tenant.component';
import { LoginComponent } from './login/login.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export function tokenGetter() {
  return localStorage.getItem('auth_token');
}

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    TenantComponent,
    LoginComponent,
    UnauthorizedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:3000'],  // Adjust for your API URL
        disallowedRoutes: []
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### 5. **Rebuild and Run the Angular Application**

Once you've created the missing components and fixed the imports, rebuild and run the Angular application:

```bash
ng serve
```

This should resolve the errors, and the Angular app should compile successfully.

### Conclusion:

1. Install `@auth0/angular-jwt`.
2. Create missing components using Angular CLI.
3. Ensure all import paths are correct.
4. Declare the components in `app.module.ts`.
5. Rebuild and run the app.

Let me know if you encounter any further issues!


The error you are encountering happens because **`@auth0/angular-jwt@5.2.0`** requires **Angular 14 or higher**, but your project is using **Angular 8** (`@angular/common@8.0.3`).

To resolve this issue, you can install an older version of `@auth0/angular-jwt` that is compatible with Angular 8.

### Solution:

1. **Install the Compatible Version of `@auth0/angular-jwt`**

For **Angular 8**, use `@auth0/angular-jwt@4.0.0`, which is compatible with older Angular versions.

Run the following command inside the Docker container:

```bash
npm install @auth0/angular-jwt@4.0.0 --legacy-peer-deps
```

The `--legacy-peer-deps` flag will allow npm to bypass strict dependency resolution for peer dependencies, avoiding conflicts.

2. **Check Package Installation**

After the installation completes, verify that `@auth0/angular-jwt@4.0.0` was added to your `package.json`:

```json
"@auth0/angular-jwt": "^4.0.0"
```

3. **Rebuild and Run the Angular App**

Once the installation is successful, rebuild and run your Angular app:

```bash
ng serve
```

### Summary:

- Install the compatible version of `@auth0/angular-jwt` (`4.0.0`) that works with Angular 8.
- Use the `--legacy-peer-deps` flag to avoid dependency conflicts.
- Rebuild and serve your Angular app.

Let me know if you face any further issues!


ng generate component admin
ng generate component tenant
ng generate component login
ng generate component unauthorized
