import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerDialoutServiceService {
  errors = "";
  error = ""
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }
  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(
    private apiService:ApiService
  ) { }
  getcustomerdialoutdata(customer) {
    var url =`CustomerDialoutRule/getcustomerdialoutdata?customerId=${customer}`;
    return this.apiService.get(url).pipe(map(data => {    
      return data.response[0][0];
    }));
  } 
  getDialouFilter(filters,id) {
    const url = `CustomerDialoutRule/getDialouFilter`;   
      return this.apiService.post(url,{ filters: filters, customer_id:id}).pipe(map(data => {
        return data.response[0];
      }));
  }

  saveIntercomDialout(credentials){
    return this.apiService.post('CustomerDialoutRule/saveIntercomDialout', { intercomList: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  updateIntercomDialout(credentials){
    return this.apiService.post('CustomerDialoutRule/updateIntercomDialout', { intercomList: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getInternalDialoutByFilter(credentials){
    return this.apiService.post('CustomerDialoutRule/getInternalDialoutByFilter', { credentials: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getInternalDialout(id) {
    return this.apiService.get(`CustomerDialoutRule/getInternalDialout?id=${id}`).pipe(map(data => {
      return data.response;
    }));
  }
  getGroupType(id,checkValue) {
    return this.apiService.get(`CustomerDialoutRule/getGroupType?id=${id}&&checkValue=${checkValue}`).pipe(map(data => {
      return data.response;
    }));
  }
  getGroupCCType(id,checkCCValue) {
    return this.apiService.get(`CustomerDialoutRule/getGroupCCType?id=${id}&&checkCCValue=${checkCCValue}`).pipe(map(data => {
      return data.response;
    }));
  }

  getIntercomById(id) {
    return this.apiService.get(`CustomerDialoutRule/getIntercomById?id=${id}`).pipe(map(data => {
      return data.response;
    }));
  }
  getIntercomByExtID(user_id,id) {
    return this.apiService.get(`CustomerDialoutRule/getIntercomByExtID?user_id=${user_id}&&id=${id}`).pipe(map(data => {
      return data.response;
    }));
  }
  getIntercomIDCount(intercom_id, extension_group_id){
    const url = `getIntercomIDCount?intercom_id=${intercom_id}&extension_group_id=${extension_group_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getIntercomByCustomer(id) {
    return this.apiService.get(`CustomerDialoutRule/getIntercomByCustomer?custId=${id}`).pipe(map(data => {
      return data.response;
    }));
  }

  deleteIntercomRule(id){
    return this.apiService.post(`CustomerDialoutRule/deleteIntercomRule?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  getAssociatedExtensions(id){
    return this.apiService.get(`CustomerDialoutRule/getAssociatedExtensions?id=${id}`).pipe(map(data => {
      return data.response;
    }));
  }
  
}
