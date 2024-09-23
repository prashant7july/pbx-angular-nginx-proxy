## Vulnerability Name Privilege escalation
Description A privilege escalation attack is a type of cyber attack that gives an attacker higher access
to a system than they were initially granted. This is done by exploiting a vulnerability in
the system, such as a configuration oversight or programming error

### CRITICAL
1. login to firefox browser with admin role
2. navigate to User -> Internal User List and copy the URL.
3. Login with Tenant 1 role using Edge browser and paste the URL.
4. We can access Admin pages and download all the data.

The **privilege escalation vulnerability** you're facing is due to improper **access control** in your Angular frontend and Node.js (Express.js) backend. This issue arises because the backend API or route handling doesn't properly check the user's role or permissions before serving sensitive data or allowing access to restricted pages.

### Steps to Fix the Vulnerability

You can address this by implementing proper **authorization checks** at the backend and ensuring the frontend doesn't rely solely on URL-based navigation. Below are the recommended steps:

### 1. **Backend: Implement Role-Based Access Control (RBAC)**
You should ensure that your backend (Express.js) checks for the user's role and permissions on each request, especially for sensitive routes like admin pages.

#### Example Implementation for Express.js

You can create a middleware function that checks the user's role (like Admin, Tenant, etc.) and restrict access accordingly.

#### Step 1: Middleware to Check User Role
```javascript
// Middleware to check if the user has admin role
function checkRole(roles) {
    return function (req, res, next) {
        const user = req.user; // Assuming the user is attached to the request (e.g., through JWT)
        
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
        }
        
        next(); // User has the necessary role, proceed to the next middleware or route handler
    };
}
```

#### Step 2: Protect Sensitive Routes
Apply this middleware to routes that require admin privileges or other specific roles.

```javascript
// Route accessible only by admins
app.get('/admin/internal-users', checkRole(['Admin']), (req, res) => {
    // Logic to retrieve and send internal user list
    res.json({ message: 'This is admin-only content.' });
});

// Route accessible by both admin and tenant
app.get('/tenant/data', checkRole(['Admin', 'Tenant']), (req, res) => {
    // Logic for tenant-specific data
    res.json({ message: 'This is tenant and admin accessible content.' });
});
```

### 2. **Backend: Ensure Proper Session Handling**
If you're using JWT tokens, ensure that:
- Tokens include role information.
- Tokens are validated and verified on every request.
- Sensitive data is not exposed without verifying the user’s role.

#### JWT Example with Role
Ensure your JWT token payload includes a `role` field, and your backend decodes and checks this field on every request.

```javascript
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and attach user to request
function authenticateJWT(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = user; // Attach the decoded token to the request
        next();
    });
}
```

Now combine `authenticateJWT` with the `checkRole` middleware to protect routes:

```javascript
app.get('/admin/internal-users', authenticateJWT, checkRole(['Admin']), (req, res) => {
    res.json({ message: 'Admin-only content.' });
});
```

### 3. **Frontend: Restrict Access Based on Role**
On the Angular frontend, prevent users from accessing unauthorized routes. Although you should never rely only on frontend checks (since users can manipulate the browser), it's still important to handle role-based navigation and hiding sensitive UI elements.

#### Angular Route Guard (CanActivate)
Use **Angular Route Guards** to restrict route access based on the user’s role.

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getUser();

    if (user?.role === 'Admin') {
      return true; // Allow navigation if user is admin
    } else {
      this.router.navigate(['/unauthorized']); // Redirect to unauthorized page
      return false;
    }
  }
}
```

#### Protect Admin Routes in `app-routing.module.ts`
```typescript
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent },
  // Other routes
];
```

### 4. **Frontend: Hide Admin Features**
In your Angular templates, ensure that elements meant for admins are hidden from users without admin privileges.

```html
<div *ngIf="authService.getUser().role === 'Admin'">
  <!-- Admin-only buttons, links, or components -->
  <button routerLink="/admin">Admin Panel</button>
</div>
```

### 5. **Log Access Attempts**
For additional security, log access attempts, especially when a user tries to access a restricted page. This will help you identify potential security issues or suspicious behavior.

```javascript
app.use((req, res, next) => {
    if (req.user && req.user.role !== 'Admin' && req.originalUrl.startsWith('/admin')) {
        console.warn(`Unauthorized access attempt by user ${req.user.id} on ${new Date()}`);
    }
    next();
});
```

### 6. **Security Testing and Monitoring**
After implementing these fixes:
- Perform **Vulnerability Assessment and Penetration Testing (VAPT)** again to verify that the vulnerability is fixed.
- Continuously monitor logs for unauthorized access attempts and investigate unusual activities.

### Summary of Fixes:
1. **Backend**:
   - Use **Role-Based Access Control (RBAC)** by verifying user roles in sensitive routes.
   - Implement proper session handling with **JWT** (including roles).
   - Ensure restricted resources are protected by combining JWT validation with role checks.

2. **Frontend**:
   - Use **Angular Route Guards** to protect routes based on user roles.
   - Hide sensitive UI elements and links from non-admin users.
   - Never rely on frontend checks alone — always verify roles on the backend.

By following these steps, you'll mitigate the **privilege escalation vulnerability** and ensure that users can only access the resources they are authorized to view or manipulate.

Let me know if you need more specific examples or further clarifications!


## Kycloak+Express.js (Node.js Framework)+Angular vs Express.js (Node.js Framework)+Angular
Yes, using **Keycloak** in combination with **Node.js (Express.js)** and **Angular** can be a better and more secure solution than building a custom authentication and authorization system from scratch for the following reasons:

### 1. **Keycloak Provides a Complete Authentication and Authorization Solution**
   - **Keycloak** is an open-source Identity and Access Management (IAM) system that provides features like:
     - **Single Sign-On (SSO)**
     - **OAuth2 and OpenID Connect** support
     - **Role-Based Access Control (RBAC)**
     - **Social Login Integration** (Google, Facebook, etc.)
     - **Session management**
     - **Token management** (JWT tokens with roles and permissions)
     - **Password policies, multifactor authentication, and account recovery**

   Using **Keycloak** allows you to leverage a mature and secure solution rather than implementing these complex features manually. It also ensures that best practices for security are followed, reducing the risk of vulnerabilities like **Privilege Escalation**, **Session Hijacking**, and **Improper Access Control**.

### 2. **Security Benefits of Using Keycloak**

   - **Pre-built Security Features**: Keycloak is built by security professionals and has been tested thoroughly. It has protections against common vulnerabilities, such as **Cross-Site Scripting (XSS)**, **Cross-Site Request Forgery (CSRF)**, and **Open Redirects**.
   
   - **Centralized User Management**: With Keycloak, user management is centralized, and roles/permissions can be defined and managed in one place. This reduces complexity in your Node.js backend.
   
   - **Token Management**: Keycloak generates and manages JWT tokens that include roles, permissions, and user information. You can easily validate these tokens in Node.js and check roles in a standardized way.

### 3. **Reduced Development and Maintenance Effort**
   - **Time-Saving**: Keycloak eliminates the need to build custom authentication and authorization flows in your Node.js app. Setting up security, session handling, password policies, or OAuth providers from scratch is complex and time-consuming.
   
   - **Focus on Core Business Logic**: With Keycloak handling the security and user management aspects, your development team can focus on building the core features of your application rather than spending time on complex security tasks.
   
   - **Scalability**: Keycloak is designed to scale well, and it integrates easily into microservices or distributed architectures, allowing you to manage users and roles across multiple services.

### 4. **Integration with Angular**
   - **Keycloak Angular Library**: You can use the **`keycloak-angular`** library, which simplifies the integration of Keycloak with your Angular frontend. This library allows for easy handling of authentication flows like login, logout, token refreshing, and role-based routing.

   - **Angular Route Guards with Keycloak**: Keycloak integrates seamlessly with Angular's route guards, allowing you to secure your routes based on user roles. This is more secure and robust than implementing custom route guards and session checks.

### 5. **Token-Based Authorization with Node.js**
   - **Middleware for Token Validation**: With Keycloak, you don’t need to build custom JWT validation. Instead, you can use middleware to validate the tokens generated by Keycloak and ensure that the user has the appropriate roles for each route.
   
   - **Role-Based Access Control (RBAC)**: You can define user roles (Admin, Tenant, User, etc.) in Keycloak and check those roles in your Node.js backend using middleware. This is similar to the custom RBAC system you would build, but Keycloak gives you better flexibility and ease of use.

   ```javascript
   const jwt = require('jsonwebtoken');

   // Middleware to check token and validate role
   function authenticateToken(req, res, next) {
       const token = req.headers['authorization']?.split(' ')[1];
       if (!token) return res.sendStatus(401); // Unauthorized

       jwt.verify(token, process.env.KEYCLOAK_PUBLIC_KEY, (err, user) => {
           if (err) return res.sendStatus(403); // Forbidden
           req.user = user;
           next();
       });
   }

   function checkRole(role) {
       return function (req, res, next) {
           if (req.user && req.user.roles.includes(role)) {
               next(); // User has the role
           } else {
               res.status(403).json({ message: 'Access Denied' });
           }
       };
   }

   app.get('/admin/data', authenticateToken, checkRole('Admin'), (req, res) => {
       res.json({ message: 'This is Admin data.' });
   });
   ```

### 6. **Custom Node.js Authentication Can Be Error-Prone**
   - **Security Risks**: Building custom authentication is risky because small mistakes can lead to critical vulnerabilities (e.g., improper token validation, insecure session handling, poor password management).
   
   - **Maintenance Overhead**: Custom authentication requires ongoing maintenance and updates to keep up with new security threats. You must ensure that the system complies with modern security standards, which can be complex and time-consuming.

   - **Complexity**: Managing roles, tokens, refresh tokens, session timeouts, and other security features is complex and prone to errors. With a solution like Keycloak, you can rely on a well-tested and actively maintained system.

### 7. **OAuth2 and Social Logins with Keycloak**
   Keycloak provides out-of-the-box support for **OAuth2** and **OpenID Connect**. You can easily integrate social logins like **Google**, **Facebook**, or **GitHub** without needing to manage the OAuth2 flows yourself.

   - With a custom Node.js system, you would need to build and maintain the entire OAuth2 flow, including token exchanges, refresh tokens, and scopes.

### 8. **Compliance and Security Auditing**
   Keycloak has built-in support for logging, auditing, and reporting, which is especially useful for ensuring compliance with standards like **GDPR**, **HIPAA**, or **ISO 27001**.

   - Custom Node.js solutions require you to build your own logging and auditing infrastructure, which is complex and error-prone.

### 9. **Keycloak Features You Get for Free**
   - **Password policies** (complexity, expiration, history)
   - **Multi-Factor Authentication (MFA)**
   - **Social logins** (e.g., Google, Facebook)
   - **Token management and refreshing**
   - **User federation** (LDAP, Active Directory)
   - **Account management** (password reset, account lockout, etc.)

### Conclusion: **Keycloak + Node.js (Express) + Angular** vs. **Custom Authentication**
- **Keycloak** provides a **robust, secure, and feature-rich solution** for managing user authentication and authorization.
- **Custom authentication** in **Node.js** can be error-prone, time-consuming, and require constant maintenance and updates.
- By using **Keycloak**, you reduce development time, leverage existing security best practices, and gain advanced features like SSO, OAuth2, RBAC, and more with minimal effort.
  
For **enterprise-level applications** or any system where security is critical, **Keycloak** is the better choice over building a custom system in Node.js and Angular.

If you're dealing with high security demands, using Keycloak is the **safer and more scalable** approach. Let me know if you need help with Keycloak integration or further details!