import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(private apiService: ApiService) { }

  public getCallDateHourWise(role,ResellerID){
     const url = `report/getCallDateHourWise?role=${role}&&ResellerID=${ResellerID}`;
     return this.apiService.get(url).pipe(map(data => {
       return data.response;
     }));
   }

   public getCallDateHourWiseByFilters(filters,role,ResellerID) {
    return this.apiService.post('report/getCallDateHourWiseByFilters', { filters: filters,role,ResellerID })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getCallChargesDateWise(role,ResellerID){
    const url = `report/getCallChargesDateWise?role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getCallChargesDateWiseByFilters(filters,role,ResellerID) {
    return this.apiService.post('report/getCallChargesDateWiseByFilters', { filters: filters,role,ResellerID })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getCustomersChargesDateWise(role,ResellerID){
    const url = `report/getCustomersChargesDateWise?role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getCustomersChargesDateWiseByFilters(filters,role,ResellerID) {
    return this.apiService.post('report/getCustomersChargesDateWiseByFilters', { filters: filters,role,ResellerID })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getCustomersCallDetails(role,ResellerID){
    const url = `report/getCustomersCallDetails?role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getCustomersCallDetailsByFilters(filters,role,ResellerID) {
    return this.apiService.post('report/getCustomersCallDetailsByFilters', { filters: filters,role,ResellerID})
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getProvidersCallChargesDateWise(role,ResellerID){
    const url = `report/getProvidersCallChargesDateWise?role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getProvidersCallChargesDateWiseByFilters(filters,role,ResellerID) {
    return this.apiService.post('report/getProvidersCallChargesDateWiseByFilters', { filters: filters,role,ResellerID })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getMinutePlanCallDetails(){
    const url=`report/getMinutePlanCallDetails`;
    return this.apiService.get(url).pipe(map(data =>{
      return data.response;
    }));
  }

  public getMinutePlanCallDetailsByFilters(filters){
    return this.apiService.post('report/getMinutePlanCallDetailsByFilters',{filters: filters})
    .pipe(map(data =>{
      return data.response;
    }));
  }
}
