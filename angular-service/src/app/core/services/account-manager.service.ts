import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AccountManagerService {

  constructor(private apiService: ApiService) {  
    
  }
  
  getAccountManagerInfo(userType,customerId){ 
    const url = `accountManager?userType=${userType}&customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
}
