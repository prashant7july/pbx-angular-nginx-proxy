import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable ,BehaviorSubject } from 'rxjs';
import { PagedData, Page ,Holiday,TimeGroup} from '../../core/models';
import { id } from '@swimlane/ngx-datatable/release/utils';


@Injectable({
  providedIn: 'root'
})
export class TrunkService {

  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  public displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  public postTrunkList(credentials) {
    return this.apiService.post('trunk/postTrunkList', { credentials: credentials }).pipe(map(data => {
      return data;
    }));
  }

  public postTrunkRouting(credentials) {
    return this.apiService.post('trunk/postTrunkRouting', { credentials: credentials }).pipe(map(data => {
      return data;
    }));
  }

  public updateTrunkList(credentials) {
    return this.apiService.post('trunk/updateTrunkList', { credentials: credentials }).pipe(map(data => {
      return data;
    }));
  }

  public updateRouting(credentials) {
    return this.apiService.post('trunk/updateRouting', { credentials: credentials }).pipe(map(data => {
      return data;
    }));
  }

  public getTrunkList() {
    return this.apiService.get('trunk/getTrunkList').pipe(map(data => {
      return data.response;
    }));
  }

  public getTrunkRouting(id) {
    return this.apiService.post('trunk/getTrunkRouting',{id : id}).pipe(map(data => {
      return data.response;
    }));
  }

  public getTrunkListById(id) {
    return this.apiService.post('trunk/getTrunkListById',{id : id}).pipe(map(data => {
      return data.response;
    }));
  }

  public getTrunkRoutingById(id) {
    return this.apiService.post('trunk/getTrunkRoutingById',{id : id}).pipe(map(data => {
      return data.response;
    }));
  }

  public getActiveCustomers() {
    return this.apiService.get('trunk/getActiveCustomers').pipe(map(data => {
      return data.response;
    }));
  }

  public getSofiaProfile() {
    return this.apiService.get('trunk/getSofiaProfile').pipe(map(data => {
      return data.response;
    }));
  }

  public getGeneralPrompt(id) {
    return this.apiService.post('trunk/getGeneralPrompt',{id : id}).pipe(map(data => {
      return data.response;
    }));
  }

  public getTrunkById(id) {
    return this.apiService.post('trunk/getTrunkById',{id : id}).pipe(map(data => {
      return data.response;
    }));
  }

  deleteTrunk(id){
    return this.apiService.post(`trunk/deleteTrunk?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));   
  }

  deleteRoute(id){
    return this.apiService.post(`trunk/deleteRoute?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));   
  }

  getTrunkListByFilter(filters) {
    const url = `trunk/getTrunkLIstByFilter` ;   
      return this.apiService.post(url,{ filters: filters}).pipe(map(data => {
        return data.response;
      }));
  }

  getTrunkRoutingByFilter(filters,id) {
    const url = `trunk/getTrunkRoutingByFilter` ;   
      return this.apiService.post(url,{ filters: filters,customer_id:id}).pipe(map(data => {
        return data.response;
      }));
  }

}
