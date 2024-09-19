import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(private apiService: ApiService) { }

  addBC(BCData) {
    return this.apiService.post('broadcasting/addBC', BCData)
      .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return err;
        }
      ));
  }

  updateBC(PlanData) {
    return this.apiService.put('broadcasting/updateBC', PlanData)
      .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return err;
        }
      ));
  }

  partiallyUpdateBC(obj,id) {
    return this.apiService.patch(`broadcasting/partiallyUpdateBC?id=${id}`, obj)
      .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return err;
        }
      ));
  }


  getBC(filterObj, customerId) {
    const url = `broadcasting/getBC?customer_id=${customerId}`;
    return this.apiService.post(url, filterObj).pipe(map(data => {
      return data;
    }));
  }

  getSingleBC(bcId) {
    const url = `broadcasting/getSingleBC?bc_id=${bcId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getBroadcastParticipants(id) {
    const url = `broadcasting/getBroadcastParticipants?bc_id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  public getBCCdrInfo(user_id,limit_flag) {
    const url = `broadcasting/getCdrInfo?user_id=${user_id}&&limit_flag=${limit_flag}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getBCCdrByFilters(filters) {
    return this.apiService.post('broadcasting/getCdrByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getBroadcastCount(broadcast_id){
    const url = `broadcastCount?broadcast_id=${broadcast_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  public deleteBC(tcId) {
    return this.apiService.delete(`broadcast/deleteBC?` + Object.keys(tcId)[0] + '=' + tcId[Object.keys(tcId)[0]]).pipe(map(data => {
      return data;
    }));
  }

 public startManualSchecular(credentials) {
    return this.apiService.postBackEndAPI(`esl_api`,  credentials ) 
      .pipe(map(
        data => {
          return data;
        }, err => {
          return err;
        }
      ));
  }

 public getBroadcastIsExist(bcName,customer_id, bcId) {
    const url = `broadcasting/isBroadcastExist?bc_name=${bcName}&customer_id=${customer_id}&bc_id=${bcId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  saveParticipants(participantData) {
    return this.apiService.post('broadcasting/saveParticipants', participantData)
      .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return err;
        }
      ));
  }
}

