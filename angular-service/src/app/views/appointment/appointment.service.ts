import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { ServerDetail } from '../../core/models/serverDetail.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }
 
  createAppointmentIVR(credentials): Observable<any> {
    return this.apiService.post('appointment/createAppotmentIVR', { ivrDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getAppointmentIVR(cond) {
    return this.apiService.get('appointment/getAllAppotmentIVR', cond).pipe(map(data => {
      return data.response;
    }));
  }
  viewAppointmentHistory(cond) {
    return this.apiService.get('appointment/viewAppointmentHistory', cond).pipe(map(data => {
      return data.response;
    }));
  }

  filterAppointmentIVR(filters) {
    return this.apiService.post('appointment/getAppointmentIVRByFilters', { filters: filters })
      .pipe(map(data => {return data.response}));
  }
  getAppointmentHistoryByFilters(filters) {
    return this.apiService.post('appointment/getAppointmentHistoryByFilters', { filters: filters })
      .pipe(map(data => {return data.response}));
  }

  updateAppointmentIVR(credentials): Observable<any> {
    return this.apiService.put('appointment/updateAppointmentIVR', { ivrDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  deleteAppointmentIVR(id) {
    return this.apiService.delete(`appointment/deleteAppointmentIVR?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));

  }

  public getAppointmentCdrInfo(user_id,limit_flag) {
    const url = `appointment/getCdrInfo?user_id=${user_id}&&limit_flag=${limit_flag}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getAppointmentCdrByFilters(filters) {
    return this.apiService.post('appointment/getCdrByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

}
