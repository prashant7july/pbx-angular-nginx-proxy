import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable ,BehaviorSubject} from 'rxjs';
import { Voicemail } from '../../core/models/voicemail.model';

@Injectable({
  providedIn: 'root'
})
export class VoicemailService {

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  createVoicemail(type, credentials): Observable<Voicemail> {
    return this.apiService.post('voicemail/createVoicemail', { voicemail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  viewVoiceMailById(cond) {
    return this.apiService.post(`voicemail/viewVoiceMailById`,cond).pipe(map(data => {
      return data.response;
    }));
  }

  updateVoicemail(type, credentials): Observable<Voicemail>{  
    return this.apiService.put('voicemail/updateVoicemail', { voicemail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

}
