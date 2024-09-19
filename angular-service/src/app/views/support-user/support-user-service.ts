import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';
import {support} from 'src/app/core/models/All_support';
import { assign } from 'src/app/core/models/AssignUser';
@Injectable({
  providedIn: 'root'
})
export class SupportUserService {
  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) { }

  addsupportGroup(supportGrouprData) {
    
    return this.apiService.post(`support-user/addsupportGroup`, supportGrouprData).pipe(map(data => {
      return data;
    }));
  }
  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  getsupportList(filterObj) {
    return this.apiService.post(`support-user/getsupportList`, filterObj).pipe(map(data => {
      return data.response;
    }));
  }
  deletesupportGroup(data): Observable<support> {
    return this.apiService.post('support-user/deletesupportGroup', { supportData: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
  getsupportGroupById(id): Observable<any> {
    const url = `support-user/getsupportGroupById?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  updatesupportGroup(data): Observable<support> {
    return this.apiService.post('support-user/updatesupportGroup', { supportData: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
    }

    updateSupportGroupWithUsers(data): Observable<support> {
      return this.apiService.post('support-user/updateContactGroupWithUser', { supportData: data })
        .pipe(map(
          data => {
            return data;
          }, err => {
            this.errors = err;
          }
        ));
    }

    createSupportUser(data) {
      return this.apiService.post(`support-user/createSupportUser`, data).pipe(map(data => {
        return data;
      }));
    }
    // assign user
    getGroupAssignUser(filterObj) {
      return this.apiService.post(`support-user/assigngroup/getassigntList`, filterObj).pipe(map(data => {
        return data.response;
      }));
    }
    addassigngroup(data) {
      return this.apiService.post(`support-user/assigngroup/addassigngroup`, data).pipe(map(data => {
        return data;
      }));
    }
    updateassignGroup(data): Observable<assign> {
      return this.apiService.post('support-user/assigngroup/updateassignGroup', { assignData: data })
        .pipe(map(
          data => {
            return data;
          }, err => {
            this.errors = err;
          }
        ));
      }


    deleteAssignGroup(data): Observable<assign> {
      return this.apiService.post('support-user/assigngroup/deleteassignGroup', { assignData: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getAllUserInGroup(groupID){
    return this.apiService.get(`support-user/getAllContactFromGroup?id=${groupID}`).pipe(map(data => {
      return data.response; 
    }));
  }

  checkUserInGroup(groupID){
    return this.apiService.get(`support-user/getUserFromGroup?id=${groupID}`).pipe(map(data => {
      return data.response; 
    }));
  }

  }
