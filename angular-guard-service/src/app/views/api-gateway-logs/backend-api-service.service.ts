import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BackendApiServiceService {
  errors = "";
  
  getSavedRecord = new BehaviorSubject<boolean>(false);
  
  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  constructor(
    private apiService: ApiService
  ) { }

  // public getAPILog() { // before reseller
  //   const url =`apiLogs/getAllApiLog`;
  //   return this.apiService.get(url)
  //     .pipe(map(data => { return data.response; }));
  // }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  public getAPILog(role,ResellerID) { // after reseller
    const url =`apiLogs/getAllApiLog?role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }

  public getAPILogByFilter(filters,role,ResellerID){
    const url =`apiLogs/getApiLogByFilter`;
    return this.apiService.post(url, { filters: filters,role,ResellerID }).pipe(map(data => {
      return data.response;
    }));
  }

  public getPackageAuditLog(role,ResellerID) {
    const url =`apiLogs/packageAuditLog?role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }

  // route for byID

  public getParam(id){
    const url = `apiLogs/auditbyId?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.data;
    }));
  } 
  public getPackageAuditLogByFilter(filters){
    const url =`apiLogs/packageAuditLogByFilter`;
    return this.apiService.post(url, { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

  public getAuditLogByFilter(filters){
    const url =`audit/getAuditLogByFilter`;
    return this.apiService.post(url, { filters: filters }).pipe(map(data => {
      return data;
    }));
  }
  
  getCountryListActive(cId) {
    return this.apiService.get(`apiLogs/getCountryListActive?cId=${cId}`).pipe(map(data => {
      return data.response;
    }));
  }

  getAuditInfo(id, customer_id){
    return this.apiService.get(`audit/getAuditInfo?module_events=${Object.values(id)}&customer_id=${customer_id}`).pipe(map(data => {
      return data.response;
    }))
  }

  getAuditLog(){
    return this.apiService.get(`audit/getAuditLog`).pipe(map(data => {
      return data;
    }))
  }

  getSmtpAuditLog(){
    return this.apiService.get(`audit/getSmtpAuditLog`).pipe(map(data => {
      return data.response;
    }))
  }

  public getSmtpAuditLogByFilter(filters){
    const url =`audit/getSmtpAuditLogByFilter`;
    return this.apiService.post(url, { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }
}
