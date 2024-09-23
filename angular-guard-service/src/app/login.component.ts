import { Component } from '@angular/core';
import { AuthService } from './auth.service';
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
