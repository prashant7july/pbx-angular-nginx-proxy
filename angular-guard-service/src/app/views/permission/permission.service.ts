import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service'
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(
    private apiService: ApiService
  ) { }

  getAdminUrls() {
    return this.apiService.post('permission/getAdminUrls')
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getExtraPermission() {
    return this.apiService.post('permission/getExtraPermission')
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  createPermission(route, credentials) {
    return this.apiService.post(route, { permission: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  updatePermission(route, credentials) {
    return this.apiService.post(route, { permission: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
  getProductInfo(){
    return this.apiService
      .get('product')
      .pipe(map(data => {
        return data;
      }));
  }
  
  getPermissionList(param) {
    return this.apiService.post('permission/getPermissionList', param)
    .pipe(map(data => { return data.response }));
  }
  getResellerPermission(param) {
    return this.apiService.post('permission/getResellerPermission', param)
    .pipe(map(data => { return data.response }));
  }

  getPermissionById(param) {

    return this.apiService.post('permission/getPermissionById', param)
      .pipe(map(data => { return data.response }));
  }

  getPermissionByUserId(param) {

    return this.apiService.post('permission/getPermissionByUserId', { data: param })
      .pipe(map(data => { return data.response }));
  }

  getPermissionUser(param) {
    return this.apiService.post('permission/getPermissionUsers', param)
      .pipe(map(data => { return data.response }));
  }

  createExtraPermission(route, credentials) {
    return this.apiService.post(route, { permission: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  deletePermission(param){
    return this.apiService.post('permission/deletePermission',param).pipe(map(data => {
      return data;
    }));
  }

  checkNameValid(credentials){
    return this.apiService.post('permission/verifyName', credentials).pipe(map(data => {
      return data;
    }));
  }

  getPermissionListByFilter(param) {
    return this.apiService.post('permission/getPermissionListByFilter', param)
      .pipe(map(data => { return data.response }));
  }

  getSubAdminPer(){
    return this.apiService
      .get('permission/getSubAdminPer')
      .pipe(map(data => {
        return data;
      }));
  }
}
