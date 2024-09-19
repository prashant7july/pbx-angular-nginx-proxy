import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { CallQueue } from '../../core/models/callqueue.model';
import { PagedData, Page } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class CallqueueService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(private apiService: ApiService) { }

  createCallQueue(type, credentials): Observable<CallQueue> {
    return this.apiService.post('callqueue/createCallQueue', { callqueue: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  filterCallQueuelist(filters, id) {
    const url = `callqueue/getCallQueueByFilters`;
    return this.apiService.post(url, { filters: filters, id: id }).pipe(map(data => {
      return data.response;
    }));
  }



  viewCallqueue(cond) {
    return this.apiService.post(`callqueue/viewCallqueue`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  deleteCallQueue(id) {
    return this.apiService.post(`callqueue/deleteCallQueue?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  getCallQueueCount(callQueue_id){
    const url = `callQueueCount?callQueue_id=${callQueue_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getQueueIVR(cond) {
    return this.apiService.post(`callqueue/getIVR`,cond).pipe(map(data =>{
      return data}));
  }

  createCallQueueAPIintegration(credentials) {
    return this.apiService.postBackEndAPI(`esl_api`,  credentials ) 
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
}
