import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { Providers } from '../../core/models';
import { ProviderDetail } from '../../core/models/providerDetail.model';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displaySavedRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(private apiService: ApiService) { }

  createProvider(type, credentials): Observable<Providers> {
    const route = (type === 'createProvider') ? 'createProvider' : 'updateProvider';
    return this.apiService.post('provider/' + route, { provider: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  verifyProvider(keyword) {
    return this.apiService.post('provider/verifyProvider', { provider: keyword })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getProviderById(id) {
    const url = `provider/getProviderById?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }   

  public viewProviderDetails(role,ResellerID) {
    return this.apiService.get(`provider/viewProviderDetails?role=${role}&&ResellerID=${ResellerID}`).pipe(map(data => { return data.response }));
  }

  public viewProviderAssignDID() {
    return this.apiService.get('provider/viewProviderAssignDID').pipe(map(data => { return data.response }));
  }

  deleteProvider(id) {
    const url = `provider/deleteProvider?id=${id}`;
    return this.apiService.delete(url).pipe(map(data => {
      return data;
    }, err => {    
     console.log(err);
    }));
  }

  isProviderInUse(id) {
    const url = `provider/isProviderInUse?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response[0];
    }, err => {    
     console.log(err);
    }));
  } 

  getDIDdetailsBasedOnProvider(id) {
    const url = `provider/getDidDetails?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }, err => {    
     console.log(err);
    }));
  } 
}
