import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable ,BehaviorSubject } from 'rxjs';
import { PagedData, Page ,Holiday,TimeGroup} from '../../core/models';
import { id } from '@swimlane/ngx-datatable/release/utils';


@Injectable({
  providedIn: 'root'
})
export class VoicebotService {

  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  public displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  createVoicebot(credentials) {
    return this.apiService.post('voicebot/createVoicebot', { credentials: credentials })
      .pipe(map(data => { return data; }));
  }

  updateVoicebotData(credentials) {
    return this.apiService.post('voicebot/updateVoicebotData', { credentials: credentials })
      .pipe(map(data => { return data; }));
  }

  getVoicebotListByFilter(credentials) {
    return this.apiService.post('voicebot/getVoicebotListByFilter', { credentials: credentials })
      .pipe(map(data => { return data.response; }));
  }

  public getVoicebotById(id) {
    return this.apiService.post('voicebot/getVoicebotById',{id : id}).pipe(map(data => {
      return data.response[0];
    }));
  }

  
  getVoicebotList(id) {
    const url = `voicebot/getVoicebotList?cust_id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getVoicebotCDRByFilter(credentials) {
    return this.apiService.post(`voicebot/getVoicebotCDRByFilter`,{credentials}).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getVoicebotCDR(id, limit_flag) {
    return this.apiService.get(`voicebot/getVoicebotCDR?id=${id}&&limit_flag=${limit_flag}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getVoicebotCount(id) {
    return this.apiService.get(`voicebot/getVoicebotCount?id=${id}`).pipe(
      map((data) => {
        return data;
      })
    );
  }

  deleteVoicebot(id) {
    const url = `voicebot/deleteVoicebot?id=${id}`;
    return this.apiService.post(url).pipe(map(data => {
      return data;
    }));
  }   

  

}
