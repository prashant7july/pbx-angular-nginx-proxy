import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models';
import { map, distinctUntilChanged } from 'rxjs/operators';


 @Injectable()
export class loginservice {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private apiService: ApiService,
    private jwtService: JwtService
  ) { }

  populate() {
    if (this.jwtService.getToken()) {
      this.apiService.get('/user')
        .subscribe(
          data => this.setAuth(data.user),
          err => this.purgeAuth()
        );
    } else {
      this.purgeAuth();
    }
  }

  setAuth(user: any) {
    this.jwtService.saveToken(user.data);
    this.currentUserSubject.next(user);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('id', user.user_id);
    localStorage.setItem('type', user.role);
    localStorage.setItem('user_name', user.user_name);
    localStorage.setItem('uname', user.uname);
    localStorage.setItem('uemail', user.uemail);
    localStorage.setItem('menu', JSON.stringify(user.menu));
    localStorage.setItem('token', user.token);
    localStorage.setItem('ext_number', user.ext_number);

  }

  purgeAuth() {
    this.jwtService.destroyToken();
    this.currentUserSubject.next({} as User);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('id');
    localStorage.removeItem('productId');
    localStorage.removeItem('type');
    localStorage.removeItem('user_name');
    localStorage.removeItem('uname');
    localStorage.removeItem('data');
    localStorage.removeItem('addMessageText');
    localStorage.removeItem('uemail');
    localStorage.removeItem('token');
    localStorage.removeItem('ext_number');
  }

  attemptAuth(credentials): Observable<User> {
    return this.apiService.post('auth/login', { user: credentials }).pipe(map(data => {
      if (data['code'] != 404) this.setAuth(data);
      return data;
    }
    ));
  }

  getHistory(credentials): Observable<User> {
    return this.apiService.post('auth/getHistory', credentials).pipe(map(data => {
      return data;
    }));
  }

  makeNotificationAsRead(credentials): Observable<User> {
    return this.apiService.post('auth/makeNotificationAsRead', credentials).pipe(map(data => {
      return data;
    }));
  }

  getMenuListForOcPbx(credentials):Observable<User> {
    return this.apiService.post('auth/getMenuListForOcPbx', credentials).pipe(map(data => {
      return data;
    }
    ));
  }

  changePassword(credentials): Observable<User> {
    return this.apiService.put('auth/updatePassword/user', credentials).pipe(map(data => {
      return data;
    }
    ));
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  update(user): Observable<User> {
    return this.apiService
      .put('/update/user', { user })
      .pipe(map(data => {
        // Update the currentUser observable
        this.currentUserSubject.next(data.user);
        return data.user;
      }));
  }

  emailExist(cond) {
    return this.apiService.post('auth/emailExist', cond).pipe(map(data => {
      return data;
    }));
  }

  resetPassword(email, newPassword, action) {
    const url = `user/resetPassword?email=${email}&newPassword=${newPassword}&action=${action}`;
    return this.apiService.post(url).pipe(map(data => {
      return data;
    }));
  }
  updateLogoutActivity(user_type, user_id ) {
    //const route = (type === 'deleteUser') ? 'deleteCustomer' : 'inactiveCustomer';
    return this.apiService.put('user/updateLogoutLog', {user_type: user_type, user_id: user_id})
      .pipe(map(
        data => {
          return data.response;
        }
      ));
  }

}
