import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';  


@Injectable({
  providedIn: 'root'
})
export class CdrService {
  errors = "";
  constructor(
    private apiService: ApiService
  ) { }
getSavedRecord = new BehaviorSubject<boolean>(false);

updateGridList(): void {
  this.getSavedRecord.next(true);  
}

get displayAllRecord(): Observable<boolean> {
  return this.getSavedRecord.asObservable();
}
  public getCdrResellerInfo(limit_flag,role,ResellerID) { //after reseller
    const url = `cdr/getCdrResellerInfo?limit_flag=${limit_flag}&&role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }
  public getAdminCdrInfo(limit_flag) { //after reseller
    const url = `cdr/getAdminCdrInfo?limit_flag=${limit_flag}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }
  public getAdminCdrInfodash(limit_flag) { //after reseller
    const url = `cdr/getAdminCdrInfodash?limit_flag=${limit_flag}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }

  
  public getResellerCdrInfo(limit_flag,user_id) {
    const url = `cdr/getResellerCdrInfo?limit_flag=${limit_flag}&&user_id=${user_id}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }


  public getAdminCdrByFilters(filters,role,ResellerID) { //after reseller work
    return this.apiService.post('cdr/getAdminCdrByFilters', { filters: filters,role,ResellerID })
      .pipe(map(data => {
        return data.response;
      }));
  }

  // public getCustomerCdrInfo(user_id,limit_flag) {
  //   const url = `cdr/getCustomerCdrInfo?user_id=${user_id}&&limit_flag=${limit_flag}`;
  //   return this.apiService.get(url).pipe(map(data => {
  //     return data.response;
  //   }));
  // }

  getCustomerCdrInfo(user_id: any, limit_flag: any, pageSize: any, offset: any): Observable<any> {
    return this.apiService.get(`cdr/getCustomerCdrInfo?user_id=${user_id}&limit_flag=${limit_flag}&pageSize=${pageSize}&offset=${offset}`).pipe(map(data => {
      return data;
    }));
}


  public getCustomerCdrByFilters(filters) {
    return this.apiService.post('cdr/getCustomerCdrByFilters', { filters: filters })
      .pipe(map(data => {
        return data;
      }));
  }

  public getCustomerCdrByFiltersExcel(filters) {
    return this.apiService.post('cdr/getCustomerCdrByFiltersExcel', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getPluginCdrByFilter(filters) {
    return this.apiService.post('cdr/getPluginCdrByFilter', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getExportExcelData(filters) {
    return this.apiService.post('cdr/getExportExcelData', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getConferenceByFilter(filters) {
    return this.apiService.post('cdr/getConferenceByFilter', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getAccountManagerCdrInfo(user_id, limit_flag) {
    const url = `cdr/getAccountManagerCdrInfo?user_id=${user_id}&&limit_flag=${limit_flag}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }

  public getAccountManagerCdrByFilters(filters) {
    const account_id = localStorage.getItem('id');
    return this.apiService.post('cdr/getAccountManagerCdrByFilters', { filters: filters, account_id : account_id })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getSupportCdrInfo(user_id, limit_flag) {
    const url = `cdr/getSupportCdrInfo?user_id=${user_id}&&limit_flag=${limit_flag}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getSupportCdrByFilters(filters) {
    return this.apiService.post('cdr/getSupportCdrByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getExtensionCdrInfo(user_id) {
    const url =`cdr/getExtensionCdrInfo?user_id=${user_id}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }

  public getExtensionCdrByFilters(filters) {
    return this.apiService.post('cdr/getExtensionCdrByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getTerminateCause() {
    return this.apiService.get('cdr/getTerminateCause')
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getFeedbackReportInfo(user_id,limit_flag) {
    const url = `cdr/getFeedbackReport?user_id=${user_id}&&limit_flag=${limit_flag}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getFeedbackReportByFilters(filters) {
    return this.apiService.post('cdr/getFeedbackReportByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getCustomerStickyAgentReportInfo(user_id,limit_flag) {
    const url = `cdr/getCustomerStickyAgentInfo?user_id=${user_id}&&limit_flag=${limit_flag}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getCustomerStickyAgentReportByFilters(filters) {
    return this.apiService.post('cdr/getCustomerStickyAgentByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

 
  public getPluginCdr(user_id, limit_flag) {
    const url = `cdr/getPluginCdr?user_id=${user_id}&&limit_flag=${limit_flag}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getConferenceData(user_id) {
    const url = `cdr/getConferenceData?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getConferenceCdr(user_id, instance) {
    const url = `cdr/getConferenceCdr?user_id=${user_id}&&instance=${instance}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getSpeechToText(uuid) {
    const url = `cdr/getSpeechToText?uuid=${uuid}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }


}
