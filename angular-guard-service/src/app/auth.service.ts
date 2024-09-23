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
