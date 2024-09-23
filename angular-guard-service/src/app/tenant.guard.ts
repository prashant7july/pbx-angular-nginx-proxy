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
