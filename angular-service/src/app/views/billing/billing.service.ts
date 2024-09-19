import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  errors = "";
  constructor(
    private apiService: ApiService
  ) { }

public getBillingInfo(cond){
  // const url = `billing/getBillingInfo`;
  return this.apiService.get(`billing/getBillingInfo`,cond)
  .pipe(map(data => { return data.response; }));
}

public filterBillingInfo(filters,role,ResellerID) {
  return this.apiService.post('billing/getBillingByFilters', { filters: filters,role,ResellerID })
  .pipe(map(data => {
    return data.response;
  }));
}

public getCustomerBillingInfo(user_id){
  const url = `billing/getCustomerBillingInfo?user_id=${user_id}`;
  return this.apiService.get(url).pipe(map(data => {
    return data.response;
  }));
}

public filterCustomerBillingInfo(filters){
  return this.apiService.post('billing/getCustomerBillingByFilters', { filters: filters })
  .pipe(map(data => {
    return data.response;
  }));
}

public getEBillingInfo(cond){
  const url = `billing/getAllBillingInfo`;
  return this.apiService.get('billing/getAllBillingInfo',cond)
  .pipe(map(data => { return data.response; }));
}

public filterEBillingInfo(filters,role,ResellerID){
  return this.apiService.post('billing/getAllBillingInfoByFilters', { filters: filters,role,ResellerID })
  .pipe(map(data => {
    return data.response;
  }));
}

}
