import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service'
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  errors = "";
  constructor(
    private apiService: ApiService
  ) { }
 
  getUserInfo(userId, type){  
    return this.apiService.post('user/getUserInfo',{userId:type})
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
    ));
  }
  
public custDashInfo(cond,customerId){
  return this.apiService.post(`user/custDashInfo?customer_id=${customerId}`,cond).pipe(map(data => {
    return data;
  }, err => {
    this.errors = err;
  }));
}

viewCustomDashboard(customer) {
  var url =`user/viewCustomDashboard?customerId=${customer}`;
  return this.apiService.get(url).pipe(map(data => {
    return data.response;
  }));
} 
  editUser(type,role, credentials){  
    return this.apiService.put('user/updateUserProfile', {role:role, user: credentials })
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
    ));
  }
  profileupdate(role,credential){
    return this.apiService.patch('user/UpdateProfile', {role:role, crdentials:credential})
    .pipe(map(
      data => {
        return data;
      },err => {
        this.errors = err;
      }
    ));
  }  
}
