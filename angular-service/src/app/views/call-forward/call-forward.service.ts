import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Callforward } from '../../core/models/call-forward.model';

@Injectable({
  providedIn: 'root'
})
export class CallForwardService {

  errors = "";
  constructor(private apiService: ApiService) { }

  createCallForward(type, credentials): Observable<Callforward> {
    return this.apiService.post('callforward/createCallForward', { callforward: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  viewCallForwardById(cond){
    return this.apiService.post(`callforward/viewCallForwardById`,cond).pipe(map(data => {
      return data.response;
    }));
  }

  updateCallForward(type, credentials): Observable<Callforward>{  
    return this.apiService.put('callforward/updateCallForward', { callforward: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  

  extFeatureCallForward(id){
    const url = `callforward/extFeatureCallForward?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getminuteoutbound(id){
    const url = `callforward/getMinuteplanandOutboundcall?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  onlyOutboundStatus(id){
    const url = `extension/onlyOutboundStatus?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  extVoiceMailSetting(id){
    const url = `callforward/extVoiceMailSetting?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
}
