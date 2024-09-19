import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';  

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor( private apiService: ApiService,
    private http:HttpClient
    ) { }



errors = "";
getSavedRecord = new BehaviorSubject<boolean>(false);

updateGridList(): void {
  this.getSavedRecord.next(true);  
}

get displayAllRecord(): Observable<boolean> {
  return this.getSavedRecord.asObservable();
}

public createAccessRestriction(cond){
  return this.apiService.post(`accessRestriction/createAccessRestriction`, cond).pipe(map(data => {
    return data.response;
  }));
}

 showData(){
  return this.apiService.get('accessRestriction/showData')
     .pipe(map(data => {
       return data;
     }));
 }
 
 getAccessCategory(customer) {
  var url =`accessRestriction/viewAccessCategory?customerId=${customer}`;
  return this.apiService.get(url).pipe(map(data => {
    return data.response;
  }));
} 
getViewAccessFilter(filters) {
  const url = `viewAccessRestriction/getViewAccessFilter` ;   
    return this.apiService.post(url,{ filters: filters}).pipe(map(data => {
      return data.response;
    }));
}
viewAccessRestriction(customer) {
  var url =`viewAccessRestriction/viewAccessRestriction?customerId=${customer}`;
  return this.apiService.get(url).pipe(map(data => {
    return data.response;
  }));
} 
deleteviewAccessGroup(id){
  return this.apiService.post(`viewAccessRestriction/deleteviewAccessGroup?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
    return data;
  }));   
}
getCustomerCompany(productId,customer_id) {
  const url = `viewAccessRestriction/getCustomercompanyByID?productId=${productId}&customer_id=${customer_id}`;
  return this.apiService.get(url).pipe(map(data => {
    return data;
  }));
}
viewAccessGroupById(id){
  var url =`accessRestriction/viewAccessGroupById`;
  return this.apiService.post(url, id).pipe(map(data => {
    return data.response;
  }));
}
ValidateIP(cond) {
  return this.apiService.post(`accessRestriction/ValidateIP`,{cond:cond}).pipe(map(data => {
    return data;
  }));
}

filterAccessList(filters, id) {
  const url = `accessRestriction/getAccessFilter` ;   
    return this.apiService.post(url,{ filters: filters , customer_id:id}).pipe(map(data => {
      return data.response;
    }));
}

deleteAccessGroup(id){
  return this.apiService.post(`accessRestriction/deleteAccessGroup?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
    return data;
  }));   
}
updateAccessGroup(credentials): Observable<any> {
  return this.apiService.patch('accessRestriction/updateAccessGroup' ,credentials )
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
    ));
}

}
