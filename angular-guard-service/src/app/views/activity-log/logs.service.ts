import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  errors = "";
  constructor(
    private apiService: ApiService
  ) { }

  public getActivityLog(user_type, user_id) {
    const url =`activityLog/getActivityLog?user_id=${user_id}&user_type=${user_type}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }

  getActivityLogByFilter(filters, user_type, user_id){
    const url =`activityLog/getActivityLogByFilter`;
    return this.apiService.post(url, { filters: filters, user_type: user_type, user_id: user_id }).pipe(map(data => {
      return data.response;
    }));
  }

 

  

}
