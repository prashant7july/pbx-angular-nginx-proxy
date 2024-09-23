import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { BlackList } from '../../core/models/blackList.model';
import { PagedData, Page } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class BlackListService {

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  createBlackListContact(type, credentials): Observable<BlackList> {
    return this.apiService.post('blackList/createBlackListContact', { blackList: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  createWhiteListContact(type, credentials): Observable<BlackList> {
    return this.apiService.post('blackList/createWhiteListContact', { whiteList: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  updateBlackListContactStatus(type, id, action) {
    let status = '';
    if (action == 'Active') {
      status = '0';//if active then update status inactive
    } else {
      status = '1';
    }
    return this.apiService.put('blackList/updateBlackListContactStatus', { id: id, status: status })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  updateWhiteListContactStatus(type, id, action) {
    let status = '';
    if (action == 'Active') {
      status = '0';//if active then update status inactive
    } else {
      status = '1';
    }
    return this.apiService.put('blackList/updateWhiteListContactStatus', { id: id, status: Number(status) })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  verifyNumberExistInBlackList(phone, id) {
    const url = `blackList/verifyNumberExistInBlackList?phone=${phone}&id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  verifyNumberExistInWhiteList(phone, id) {
    const url = `blackList/verifyNumberExistInWhiteList?phone=${phone}&id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  filterBlackList(filters, id, role) {
    const url = `blackList/getBlackListByFilters`;
    return this.apiService.post(url, { filters: filters, id: id,role: role }).pipe(map(data => {
      return data.response;
    }));
  }

  filterWhiteList(filters, id, role) {
    const url = `blackList/getWhiteListByFilters`;
    return this.apiService.post(url, { filters: filters, id: id,role: role }).pipe(map(data => {
      return data.response;
    }));
  }

  getBlackList(cond) {
    return this.apiService.post(`blackList/viewBlackList`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  getWhiteList(cond) {
    return this.apiService.post(`blackList/viewWhiteList`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  deleteBlackListContact(id) {
    return this.apiService.post(`blackList/deleteBlackListContact?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  deleteWhiteListContact(id) {
    return this.apiService.post(`blackList/deleteWhiteListContact?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

}
