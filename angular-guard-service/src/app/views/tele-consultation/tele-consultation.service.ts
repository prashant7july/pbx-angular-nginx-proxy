import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { RatePlan  } from 'src/app/core/models/RatePlan.model';

@Injectable({
  providedIn: 'root'
})
export class TeleConsultationService {
  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(private apiService: ApiService) { }

  addTCPlan(PlanData) {
    return this.apiService.post('tele-consultation/addTCPackage', PlanData)
    .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return  err;
        }
      ));

  }

  getTCPlan(filterObj, customerId){
     const url = `tele-consultation/getTCPackage?customer_id=${customerId}`;
     return this.apiService.post(url,filterObj).pipe(map(data => {
       return data;
     }));
   }

   updateTCPlan(PlanData) {
    return this.apiService.put('tele-consultation/updateTCPackage', PlanData)
    .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return  err;
        }
      ));
  }

   getMyAssignedMinutes(customerId){
    const url = `tele-consultation/getMyAssignMinutes?customer_id=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
   }

   assignMinuteToUser(data) {
    return this.apiService.post('tele-consultation/assignMinuteToUser', data)
    .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return  err;
        }
      ));

  }

  getAssignUserList(filterObj, customerId){
    const url = `tele-consultation/getAssignUser?customer_id=${customerId}`;
    return this.apiService.post(url,filterObj).pipe(map(data => {
      return data;
    }));
  }

  updateAssignMinuteToUser(data) {
    return this.apiService.put('tele-consultation/updateassignMinuteToUser', data)
    .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return  err;
        }
      ));
  }

  addTC(PlanData) {
    return this.apiService.post('tele-consultation/addTC', PlanData)
    .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return  err;
        }
      ));
  }

  updateTC(PlanData) {
    return this.apiService.put('tele-consultation/updateTC', PlanData)
    .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return  err;
        }
      ));
  }


  getTC(filterObj, customerId){
    const url = `tele-consultation/getTC?customer_id=${customerId}`;
    return this.apiService.post(url,filterObj).pipe(map(data => {
      return data;
    }));
  }

  getSingleTC(tcId){
    const url = `tele-consultation/getSingleTC?tc_id=${tcId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

 
  deleteTC(tcId) {
    return this.apiService.delete(`tele-consultation/deleteTC?` + Object.keys(tcId)[0] + '=' + tcId[Object.keys(tcId)[0]]).pipe(map(data => {
      return data;
    }));
  }

  deleteMinuteMapping(tcId) {
    return this.apiService.delete(`tele-consultation/deleteTcMinuteMapping?` + Object.keys(tcId)[0] + '=' + tcId[Object.keys(tcId)[0]]).pipe(map(data => {
      return data;
    }));
  }

  deleteTCList(tcId) {
    return this.apiService.delete(`tele-consultation/deleteTcList?` + Object.keys(tcId)[0] + '=' + tcId[Object.keys(tcId)[0]]).pipe(map(data => {
      return data;
    }));
  }

  getTCPlanAssociateUsers(tcPlanId){
    const url = `tele-consultation/TCPlanAssociateUsers?tcPlan_id=${tcPlanId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  
  isCheckAlreadyAssignMinute(obj){
    const url = `tele-consultation/getAssignMinuteUser`;
    return this.apiService.post(url,obj).pipe(map(data => {
      return data;
    }));
  }

  public getTCCdrInfo(user_id,limit_flag) {
    const url = `tele-consultation/getCdrInfo?user_id=${user_id}&&limit_flag=${limit_flag}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getTCCdrByFilters(filters) {
    return this.apiService.post('tele-consultation/getCdrByFilters', { filters: filters })
    .pipe(map(data => {
      return data.response;
    }));
  }
  
  public getTCAssignMinute(data){
    return this.apiService.post('tele-consultation/getAssignMinutes', data)
    .pipe(map(data => {
      return data.response;
    }));
  }
  
  public getUnauthCDR(id){
    return this.apiService.post('tele-consultation/getTCCdr',id)
    .pipe(map(data => {
      return data.response;
    }));
    
  }
  
  public getMappedContacts(id){
    return this.apiService.post('tele-consultation/getMappedContacts',{id:id})
    .pipe(map(data => {
      return data.response;
    }));
    
  }
  
  public getUnauthCdrByFilter(filters) {
    return this.apiService.post('tele-consultation/getUnauthCdrByFilter', { filters: filters })
    .pipe(map(data => {
      return data.response;
    }));
  }
  
  public getMappedContactsByFilter(filters) {
    return this.apiService.post('tele-consultation/getMappedContactsByFilter', { filters: filters })
    .pipe(map(data => {
      return data.response;
    }));
  }
  
  public getMappedTcHistory(credentials){
    return this.apiService.post('tele-consultation/getMappedTcHistory',{credentials:credentials})
    .pipe(map(data => {
      return data.response;
    }));
  }
  
  public getTcPkgById(credentials){
    return this.apiService.post('tele-consultation/getTcPackageDetail',credentials)
    .pipe(map(data => {
      return data.response;
    }));
  }
  public remaingMinutes(credentials){
    return this.apiService.post('tele-consultation/remaingMinutes',credentials)
      .pipe(map(data => {
        return data.response;
      }));
  }

  public getRemainingContactMinutes(credentials){
    return this.apiService.post('tele-consultation/getRemainingContactMinutes',credentials)
    .pipe(map(data => {
      return data.response;
    }));
  }
  
  public getSubscriberInfoByFilter(credentials){
    return this.apiService.post('tele-consultation/getSubscriberInfoByFilter',{filters:credentials})
    .pipe(map(data => {
      return data.response;
    }));
    
  }
  
  public getSubscriberInfo(id){
    return this.apiService.post('tele-consultation/getSubscriberInfo',{Id:id})
    .pipe(map(data => {
      return data.response;
    }));
    
  }
  
  public deleteSubscriber(data){
    return this.apiService.post('tele-consultation/deleteSubscriber',data)
    .pipe(map(data => {
      return data.response;
    }));
    
  }
  
  public addContact(data){
    return this.apiService.post('tele-consultation/addContact',data)
    .pipe(map(data => {
        return data;
      }));
      
    }
    
    public addMinutes(data){
      return this.apiService.post('tele-consultation/addMinutes',data)
      .pipe(map(data => {
        return data;
      }));

    }
    
    getCallerId(id){
      const url = `tele-consultation/getCallerId?id=${id}`;
      return this.apiService.get(url).pipe(map(data => {
        return data;
      }));
    }
  }
