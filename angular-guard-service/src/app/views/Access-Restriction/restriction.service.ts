import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestrictionService {

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
public createAccessRestrictionData(cond){
  return this.apiService.post(`viewAccessRestriction/createviewAccessRestriction`, cond).pipe(map(data => {
    return data;
  }));
}
getViewAccessFilter(filters,role,ResellerID) {
  const url = `viewAccessRestriction/getViewAccessFilter` ;   
    return this.apiService.post(url,{ filters: filters,role:role,ResellerID:ResellerID}).pipe(map(data => {
      return data.response;
    }));
}

getCustomerCompany(productId,customer_id) {
  const url = `viewAccessRestriction/getCustomercompanyByID?productId=${productId}&customer_id=${customer_id}`;
  return this.apiService.get(url).pipe(map(data => {
    return data;
  }));
}

viewAccessRestriction(cond) {
  return this.apiService.get('viewAccessRestriction/viewAccessRestriction', cond)
    .pipe(map(data => {
      return data.response;
    }));
}

// viewAccessRestriction(customer) {
//   var url =`viewAccessRestriction/viewAccessRestriction?customerId=${customer}`;
//   return this.apiService.get(url).pipe(map(data => {
//     return data.response;
//   }));
// } 
deleteviewAccessGroup(id){
  return this.apiService.post(`viewAccessRestriction/deleteviewAccessGroup?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
    return data;
  }));   
}
viewAccessRestGroupById(id){
  var url =`viewAccessRestriction/viewAccessRestGroupById`;
  return this.apiService.post(url, id).pipe(map(data => {
    return data.response;
  }));
}
ValidateAccessIP(cond) {
  return this.apiService.post(`viewAccessRestriction/ValidateAccessRestrictionIP`,{cond:cond}).pipe(map(data => {
    return data;
  }));
}
updateAccessRestrictionGroup(credentials): Observable<any> {
  return this.apiService.patch('viewAccessRestriction/updateAccessRestrictionGroup' ,credentials )
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
    ));
}




}
