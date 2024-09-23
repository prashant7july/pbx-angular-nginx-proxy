import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable ,BehaviorSubject } from 'rxjs';
import { PagedData, Page ,Holiday,TimeGroup} from '../../core/models';
import { id } from '@swimlane/ngx-datatable/release/utils';

@Injectable({
  providedIn: 'root'
})
export class TimeGroupService {

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get setPage(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  createHoliday(type, credentials): Observable<Holiday> {
    return this.apiService.post('holiday/createHoliday', { holiday: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  createAccessRestriction(){
    return this.apiService.get('timeGroup/createAccessRestriction')
       .pipe(map(data => {
         return data;
       }));
   }
   


  createHolidayfromExcel(type, credentials,customerId): Observable<Holiday> {
    return this.apiService.post('holiday/createHolidayFromExcel', { holiday: credentials, customer_id:customerId })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
  

  viewHoliday(cond) {
    return this.apiService.post('holiday/viewHoliday',cond).pipe(map(data =>
       { return data.response}));
  }

  deleteHoliday(id){
    return this.apiService.post(`holiday/deleteHoliday?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  filterHoliday(filters) {
    return this.apiService.post('holiday/getHolidayFilters', { filters: filters})
    .pipe(map(data => { return data.response }));
  }
  
 
  //*****************************TIME GROUP****************************************************************//

  createTimeGroup(type, credentials): Observable<TimeGroup> {
    return this.apiService.post('timeGroup/createTimeGroup', { timeGroup: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  public viewTimeGroup(cond) {
    return this.apiService.post(`timeGroup/viewTimeGroup`,cond).pipe(map(data =>
      { return data.response}));
  }

 
  filterTimeGroup(filters,id,role) {
    return this.apiService.post('timeGroup/getTimeGroupFilters', { filters: filters ,id:id,role:role})
    .pipe(map(data => { return data.response }));
  }
  
  deleteTimeGroup(id){
    return this.apiService.post(`timeGroup/deleteTimeGroup?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));   
  }

  
}
