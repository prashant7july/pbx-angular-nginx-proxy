import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';
import { PagedData, Page ,CallPlan,CallPlanRate} from '../../core/models';
import { CallRateGroup } from 'src/app/core/models/call_rate_group.model';
import { BundlePlan } from 'src/app/core/models/bundle.model';

@Injectable({
  providedIn: 'root'
})
export class CallplanService {

  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  createCallPlan(type, credentials): Observable<CallPlan> {
    return this.apiService.post('callPlan/createCallPlan', { callPlan: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  public viewCallPlan(cond) {
  return this.apiService.post(`callPlan/viewCallPlan`,cond).pipe(map(data =>{
      return data.response}));
  }

  public viewCallPlanDetails(cond) {
    return this.apiService.post(`callPlan/viewCallPlanDetails`,cond).pipe(map(data =>{
      return data.response}));
  }

  public getExtraFeeMapping(id) {
    return this.apiService.post(`callPlan/getExtraFeeMapping`,id).pipe(map(data =>{
      return data.response}));
  }

  public checkRatesAssociated(id) {
    return this.apiService.get(`callPlan/checkRatesAssociated?id=${id}`).pipe(map(data =>{
      return data.response}));
  }

  deleteCallPlan(id){
    return this.apiService.post(`callPlan/deleteCallPlan?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  getCallPlan() {
    return this.apiService.get('callPlan/getCallPlan')
      .pipe(map(data => {
        return data;
      }));
  }
  forgetCallPlan() {
    return this.apiService.get('callPlan/forgetCallPlanOnMinutePlan')
      .pipe(map(data => {
        return data;
      }));
  }
  //-------on progress work  --------------------------------     
  getManagerCustomersCallPlan(managerId) {
    return this.apiService.get(`callPlan/getManagerCustomerCallPlan?manager_id=${managerId}`)
      .pipe(map(data => {
        return data;
      }));
  }
  getManagerCustomerscallPlanRoaming(managerId) {
    return this.apiService.get(`callPlan/getManagerCustomerscallPlanRoaming?manager_id=${managerId}`)
      .pipe(map(data => {
        return data;
      }));     
  }
  getManagerCustomerscallPlanTC(managerId) {
    return this.apiService.get(`callPlan/getManagerCustomerscallPlanTC?manager_id=${managerId}`)
      .pipe(map(data => {
        return data;
      }));
  }
  getManagerCustomerscallPlanStandard(managerId) {
    return this.apiService.get(`callPlan/getManagerCustomerscallPlanStandard?manager_id=${managerId}`)
      .pipe(map(data => {
        return data;
      }));
  }
  //-------------------------------------------  ---------------

  filterCallPlan(filters) {   
    return this.apiService.post('callPlan/getCallPlanByFilter', { filters: filters })
      .pipe(map(data => { 
        return data.response }));
  }

  //----------------------------------------Call Plan rates services -------------------------------------------//

  createCallPlanRate(type, credentials): Observable<CallPlanRate> {
    return this.apiService.post('callPlanRate/createCallPlanRate', { callPlanRate: credentials })
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  checkUniqueGatewayPrefix(credentials) {
    return this.apiService.post('callPlanRate/checkUniqueGatewayPrefix', credentials).pipe(map(data => {
      return data;
    }));
  }

  public viewCallPlanRate(cond) {
    return this.apiService.post(`callPlanRate/viewCallPlanRate`,cond).pipe(map(data =>{
      
      return data.response}));
  }

  public viewManagerCallPlanRate(cond) {
    return this.apiService.post(`callPlanRate/viewManagerCallPlanRate`,cond).pipe(map(data =>{
      return data.response}));
  }

  public viewManagerCallPlanRateByFilters(cond) {
    return this.apiService.post(`callPlanRate/getManagerCallPlanRateByFilters`,cond).pipe(map(data =>{
      return data.response}));
  }
  
  
  deleteCallPlanRate(id){
    return this.apiService.post(`callPlanRate/deleteCallPlanRate?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  

  filterCallPlanRate(filters) {   
    return this.apiService.post('callPlanRate/getCallPlanRateByFilters', { filters: filters })
      .pipe(map(data => { return data.response }));
  }

  public viewCustomerCallPlanRate(cond) {
    return this.apiService.post(`callPlanRate/viewCustomerCallPlanRate`,cond).pipe(map(data =>{
      return data.response}));
  }

  filterCustomerCallPlanRate(filters) {   
    return this.apiService.post('callPlanRate/getCustomerCallPlanRateByFilters', { filters: filters })
      .pipe(map(data => { return data.response }));
  }

  public viewExtensionCallPlanRate(cond) {
    return this.apiService.post(`callPlanRate/viewExtensionCallPlanRate`,cond).pipe(map(data =>{
      return data.response}));
  }

  filterExtensionCallPlanRate(filters) {   
    return this.apiService.post('callPlanRate/getExtensionCallPlanRateByFilters', { filters: filters })
      .pipe(map(data => { return data.response }));
  }

  viewUserDetailCallPlanRate(cond){
    return this.apiService.post(`callPlanRate/viewUserDetailCallPlanRate`,cond).pipe(map(data =>{
      return data.response}));
  }

  getCountryList() {
    return this.apiService.get('common/getCountryList')
      .pipe(map(data => {
        return data;
      }));
  }
  TCPackageDestination(customer_id) {
    return this.apiService.get(`callPlan/TCPackageDestination?customer_id=${customer_id}`)
      .pipe(map(data => {
        return data;
      }));
  }

  getCircle() {
    return this.apiService.get('config/getCircle')
      .pipe(map(data => {
        return data;
      }));
  }

  public isExistCallPlan(cond) {
    return this.apiService.post(`callPlan/getCallExist`, cond).pipe(map(data => {
      return data;
    }));
  }

  checkUniqueCallGroup(credentials) {
    return this.apiService.post('callPlanRate/checkUniqueCallGroup', credentials).pipe(map(data => {
      return data;
    }));
  }


   //----------------------------------------Call rates group services -------------------------------------------//

  public createCallRateGroup(credentials): Observable<CallRateGroup> {
    return this.apiService.post('callPlan/createCallRateGroup', { callRateGroup: credentials })
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  public viewCallRateGroup(cond): Observable<CallRateGroup>  {
    return this.apiService.post(`callPlan/viewCallRateGroup`,cond).pipe(map(data =>{
      return data.response}));
  }

  
  public filterCallRateGroup(filters) {   
    return this.apiService.post('callPlanRate/getCallRateGroupByFilters', { filters: filters })
      .pipe(map(data => { return data.response }));
  }

 public getAllRatesInGroup(groupID){
    return this.apiService.get(`callPlan/getAllRatesFromGroup?id=${groupID}`).pipe(map(data => {
      return data.response; 
    }));
  }

  deleteCallRateGroup(id){    
    return this.apiService.post(`callPlan/deleteCallRateGroup?id=${id}`).pipe(map(data => {
      return data;
    }));
  }

  // public getCallRateGroupCount(group_id){
  //   const url = `callPlan/callRateGroupCount?callRateGroup_id=${broadcast_id}`;
  //   return this.apiService.get(url).pipe(map(data => {
  //     return data;
  //   }));
  // }


   //---------------------------------------- Bundle group services -------------------------------------------//

   public createBundlePlan(credentials): Observable<BundlePlan> {
    return this.apiService.post('callPlan/createBundlePlan', { bundlePlan: credentials })
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  public updateBundlePlan(credentials): Observable<BundlePlan> {
    return this.apiService.post('callPlan/updateBundlePlan', { bundlePlan: credentials })
      .pipe(map(
        data => {
          return data;
        }
      ));
  }


  public viewBundlePlan(cond): Observable<BundlePlan>  {
    return this.apiService.post(`callPlan/viewBundlePlan`,cond).pipe(map(data =>{
      return data.response}));
  }

  public filterBundlePlan(filters) {   
    return this.apiService.post('callPlan/getBundlePlanByFilters', { filters: filters })
      .pipe(map(data => { 
        return data.response 
      }));
  }

  public filterBundlePlanForPackage(filters) {   
    // return this.apiService.post('callPlan/getBundlePlanByFilters', { filters: filters })
    return this.apiService.post('minutePlan/getBundlePlanByFilters', { filters: filters })
    .pipe(map(data => {
      return data.response }));
         
      
  }

  public getUsersInMinutePlan(minutePlanID){
    return this.apiService.get(`callPlan/getAllUsersFromPlan?id=${minutePlanID}`).pipe(map(data => {
      return data.response; 
    }));
  }

  public getUsersInMinutePlanBooster(minutePlanID){
    return this.apiService.get(`callPlan/getAllUsersFromBoosterPlan?id=${minutePlanID}`).pipe(map(data => {
      return data.response; 
    }));
  }
  
  public deleteMinutePlanRate(id, planType){
    if(planType == '1' || planType == '2'){  // Bundle or roaming
      return this.apiService.delete(`callPlan/deleteMinutePlan?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
        return data;
      }));
    }else{  //Booster
      return this.apiService.delete(`callPlan/deleteBoosterPlan?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
        return data;
      }));
    }
    
  }
  ViewgetCallRateGroup(id){
    var url =`callPlanRate/ViewgetCallRateGroup`;
    return this.apiService.post(url, id).pipe(map(data => {
      return data.response;
    }));
  }

  public UpdateGateway(old_id, new_id) {
    const url = `callPlanRate/GatewaUpdate`;
    return this.apiService.put(url,{new_GatewayId:new_id, old_GatewayId:old_id}).pipe(map(data => {
      return data;
    }));
  }

  public getAssociatePackage(minId,planType) {    
    return this.apiService.post(`minute/getAllMappedPackage`,{id : minId, type:planType}).pipe(map(data => {
      return data.response;     
    }));
  }
  
 public getAssociateCallRates(data){
  return this.apiService.post(`callPlan/associateCallRates`,{data:data}).pipe(map(data => {
    return data.response;     
  }));
 }

 public checkCallRateMapping(id){
  return this.apiService.get(`callPlan/checkCallRateMapping?id=${id}`).pipe(map(data => {
    return data.response[0];     
  }));
 }

 public getAssociatePackageDetail(id,flag){
  return this.apiService.post(`callPlan/associatepackage`,{id: id,flag:flag}).pipe(map(data => {    
    return data;
  }));
 }
 public getNewRates(callPlanId){
   return this.apiService.get(`callPlan/getNewRates?id=${callPlanId}`).pipe(map(data => {
     return data.response; 
   }));
 }
}
