import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { ServerDetail } from '../../core/models/serverDetail.model';

@Injectable({  
  providedIn: 'root'
})
export class SmsService {

  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }


  //--------------------------------------------- SMS Plan -----------------------------------------------------

  getSMSPlan() {
    return this.apiService.get('sms/getAllSMS').pipe(map(data => {
      return data.response;
    }));
  }

  createSMSPlan(type, credentials): Observable<ServerDetail> {
    return this.apiService.post('sms/createSMSPlan', { smsDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  filterSMSPlan(filters) {
    return this.apiService.post('sms/createSMSPlanByFilters', { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

  getSMSPlanByID(id) {
    return this.apiService.get(`sms/viewSMSById?id=${id}`).pipe(map(data => {
      return data.response;
    }));
  }

  updateSMSPlan(type, credentials): Observable<ServerDetail> {
    return this.apiService.put('sms/updateSMSPlan', { smsDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  deleteSMSPlan(id) {
    return this.apiService.delete(`sms/deleteSMSPlan?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));

  }

  getSMSPlanAssociateUsers(id){
    const url = `sms/associateUsers?smsPlan_id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getCustomerSMSid(id){
    const url = `sms/customer_sms_id?customer_id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  //---------------------------------------------------------------------------------------------------------


  //-------------------------------------------- SMS API's -----------------------------------------------------

  createSmsApi(type, credentials): Observable<ServerDetail> {
    return this.apiService.post('sms/createSMSApi', { apiDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getSMSApi(cId) {
    return this.apiService.get(`sms/getAllSMSApi?cId=${cId}`).pipe(map(data => {
      return data.response;
    }));
  }
  viewAllSMSProvider(cId) {
    return this.apiService.get(`sms/viewAllSMSProvider?cId=${cId}`).pipe(map(data => {
      return data.response;
    }));
  }

  getSMSApiByID(id) {
    return this.apiService.get(`sms/viewSMSApiById?id=${id}`).pipe(map(data => {
      return {data: data.response && data.response[0], mapping: data.mappingResponse};
    }));
  }

  updateSMSApi(type, credentials): Observable<ServerDetail> {
    return this.apiService.put('sms/updateSMSApi', { apiDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  filterSMSApi(filters,id) {
    return this.apiService.post(`sms/viewSMSApiByFilters?cid=${id}`, { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

  deleteSMSApi(id) {
    return this.apiService.delete(`sms/deleteSMSApi?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));

  }

  //--------------------------------------------- SMS Templates Methods -----------------------------------------------------

  getSMSCategories() {
    return this.apiService.get(`sms/getSMSCategory`).pipe(map(data => {
      return data.response;
    }));
  }

  createSMSTemplate(type, credentials): Observable<ServerDetail> {
    return this.apiService.post('sms/createSMSTemplate', { smsDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getSMSTemplates(cid) {
    return this.apiService.get(`sms/getSMSTemplate?cid=${cid}`).pipe(map(data => {
      return data.response;
    }));
  }

  filterSMSTemplate(filters) {
    return this.apiService.post('sms/viewSMSTemplateByFilters', { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

  updateSMSTemplate(type, credentials): Observable<ServerDetail> {
    return this.apiService.put('sms/updateSMSTemplate', { smsDetail: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  updateSMSTemplateStatus(type, id, action, category_id) {
    let status = '';
    if (action == 'Active') {
      status = '0';//if active then update status inactive
    } else {
      status = '1';
    }
    return this.apiService.put('sms/updateSMSTemplateStatus', { id: id, status: status, category_id: category_id })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  deleteSMSTemplate(id) {
    return this.apiService.delete(`sms/deleteSMSTemplate?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }
//------------------------------------------- SMS Config ---------------------------------------------------

createSMSService(data): Observable<any> {
    return this.apiService.post('sms/createService', { service: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  sendSms(data) {
    return this.apiService.post('sms/send', { data })
        .pipe(map(response => {
          return response;
        }));
  }

  getSMSService(cid) {
    return this.apiService.get(`sms/getSMSService?cid=${cid}`).pipe(map(data => {
      return data.response;
    }));
  }

  //---------------------------------------------- SMS Reports -----------------------------------------------

  getAdminSMSReportInfo(limit_flag) {
    const url = `sms/getAdminSMSReportInfo?limit_flag=${limit_flag}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }

  public getAdminSMSReportByFilters(filters) {
    return this.apiService.post('sms/getAdminSMSReportByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  getCustomerSMSReportInfo(limit_flag,cId) {
    const url = `sms/getCustomerSMSReportInfo?limit_flag=${limit_flag}&customer_id=${cId}`;
    return this.apiService.get(url)
      .pipe(map(data => { return data.response; }));
  }

  public getCustomerSMSReportByFilters(filters) {
    return this.apiService.post('sms/getCustomerSMSReportByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  //fetched the message data
  public getmessage(id){
    const url = `sms/auditbymsg?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.data;
    }));
  } 

  getProviderAssociateSms(id){
    return this.apiService.get('sms/getProviderAssociateSms',id)
    .pipe(map(data =>{
      return data;
    }))
  }

}
