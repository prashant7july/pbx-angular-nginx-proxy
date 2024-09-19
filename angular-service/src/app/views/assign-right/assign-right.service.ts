import { Injectable, EventEmitter } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { Assignrights } from '../../core/models/assignRights.model';
import { PagedData, Page } from '../../core/models';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable({
  providedIn: 'root'
})
export class AssignrightService {
  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displaySavedRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }


  constructor(private apiService: ApiService) { }

  getUserPackageDetails(data): Observable<PagedData<Assignrights>> {
    return this.apiService.post(`assignrights/getuserpackagedetail`, data).pipe(map(data => {
      return data.response;
    }));
  }

  saveAssignRights(credentials): Observable<Assignrights> {
    return this.apiService.post('assignrights/saveAssignRights', credentials).pipe(map(data => {
      return data
    }));
  }

  getAssignRights(): Observable<PagedData<Assignrights>> {
    return this.apiService.get(`assignrights/getAssignRights`).pipe(map(data => {
      return data.response;
    }));
  }

  getSavedAssignRights(val): Observable<PagedData<Assignrights>> {
    return this.apiService.post(`assignrights/getSavedAssignRights`, val).pipe(map(data => {
      return data.response;
    }));
  }

  deleteAssignRights(val) {
    return this.apiService.post(`assignrights/deleteAssignRights`, val).pipe(map(data => {
      return data;
    }));
  }

  getAssignRightsFilter(filters) {
    const url = `assignrights/getAssignRightsFilter`;
    return this.apiService.post(url, { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

}
