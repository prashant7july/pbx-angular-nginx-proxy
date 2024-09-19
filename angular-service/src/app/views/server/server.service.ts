import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';
import { ServerDetail } from '../../core/models/serverDetail.model';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
 
  constructor(private apiService: ApiService) { }


  getServices() {
    return this.apiService.get('service/getServices')
      .pipe(map(data => {
        return data;
      }));
  }

  createServer(type, credentials): Observable<ServerDetail> {
    return this.apiService.post('serverDetail/createServer', { serverDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getServer(cond) {
    return this.apiService.post(`serverDetail/viewServerDetails`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  deleteServerDetail(id) {
    return this.apiService.post(`serverDetail/deleteServerDetail?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));

  }

  updateServerStatus(type, id, action) {
    let status: number;
    if (action == 'Active') {
      status = 0;//if active then update status inactive
    } else {
      status = 1;
    }
    return this.apiService.put('serverDetail/updateServerStatus', { id: id, status: status })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  filterServer(filters) {
    return this.apiService.post('serverDetail/getServerByFilters', { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

  checkPortValid(cond){
    return this.apiService.post('serverDetail/verifyPort',cond).pipe(map(data => {
      return data;
    }));
  }
}
