import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';
import { Conference } from '../../core/models/conference.model';

@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  createConference(type, credentials): Observable<Conference> {
    return this.apiService.post('conference/createConference', { conference: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  checkAdminPin(admin_pin, customer_id,id) {
    const url = `conference/verifyAdminPin?admin_pin=${admin_pin}&customer_id=${customer_id}&id=${id}`
    return this.apiService.get(url)
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  checkParticipantPin(participant_pin, customer_id,id) {
    const url = `conference/verifyParticipantPin?participant_pin=${participant_pin}&customer_id=${customer_id}&id=${id}`
    return this.apiService.get(url)
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  checkConfExt(conf_ext, customer_id,id) {
    const url = `conference/verifyConfExt?conf_ext=${conf_ext}&customer_id=${customer_id}&id=${id}`
    return this.apiService.get(url)
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  public viewConference(cond){
    return this.apiService.post(`conference/viewConference`, cond).pipe(map(data => {
      return data.response;
    }));
  }


  filterConferencelist(cond) {
      return this.apiService.post(`conference/getConferenceByFilters`, cond).pipe(map(data => {
        return data.response;
      }));
  }

  deleteConference(id) {
    return this.apiService.post(`conference/deleteConference?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  getConferenceCount(conference_id){
     const url = `conferenceCount?conference_id=${conference_id}`;
     return this.apiService.get(url).pipe(map(data => {
       return data;
     }));
   }

}
