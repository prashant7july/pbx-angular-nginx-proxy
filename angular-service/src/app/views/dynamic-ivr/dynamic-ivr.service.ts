import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicIvrService {

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  saveDynamicIvr(credentials){
    return this.apiService.post('dynamicIvr/saveDynamicIvr', { credentials: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getDynamicIvrList(cond) {
    return this.apiService.get(`dynamicIvr/getDynamicIvrList`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  filterDynamicIvrList(filters,id,role) {
    const url = `dynamicIvr/filterDynamicIvrList`;
    return this.apiService.post(url, {filters,id,role}).pipe(map(data => {
      return data.response;
    }));
  }

//   deleteContact(id) {
//     return this.apiService.post(`contactList/deleteContact?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
//       return data;
//     }));
//   }


}
