import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';
import { Callgroup } from '../../core/models/callgroup.model';

@Injectable({
  providedIn: 'root'
})
export class CallgroupService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(private apiService: ApiService) { }

  saveCallGroup(credentials): Observable<Callgroup> {
    return this.apiService.post('callgroup/saveCallGroup', credentials)
      .pipe(map(
        data => { return data },
        err => { this.errors = err }
      ));
  }

  getCallgroup(cond){
    return this.apiService.post(`callgroup/getCallgroup`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  deleteCallgroup(id) {
    return this.apiService.post(`callgroup/deleteCallgroup?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }
  
  filterCallgrouplist(filters, id) {
    const url = `callgroup/getCallgroupByFilters` ;   
      return this.apiService.post(url, { filters: filters , customer_id:id}).pipe(map(data => {
        return data.response;
      }));
  }

  getCallGroupCount(callGroup_id){
    const url = `callGroupCount?callGroup_id=${callGroup_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

}
