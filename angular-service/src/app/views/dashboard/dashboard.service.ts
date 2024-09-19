import { Injectable } from '@angular/core';
import { ApiService } from '../../core';
import { map, distinctUntilChanged } from 'rxjs/operators';
// import { Observable } from 'rxjs';
import { PagedData, Page, InternalCustomerData, AllCustomerDID, CDR } from '../../core';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
 
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService,  private http: HttpClient,) { }

  /**
     * A method that mocks a paged server response
     * @param page The selected page
     * @returns {any} An observable containing the employee data
  */
  //--------------service for home dashboard --------------------------



  ActiveExtensions(customerId){
    const url = `dashboard/ActiveExtensions?customerId=${customerId}`;
    return this.apiService.get(url)
    .pipe(map(data=>{
      return data;
    }))
  }

  inactiveExtensions(customerId){
    const url = `dashboard/inactiveExtensions?customerId=${customerId}`;
    return this.apiService.get(url)
    .pipe(map(data=>{
      return data;
    }))

  }
  getMonthlyRevenue(type,id) {
    return this.apiService.get(`dashboard/getMonthlyRevenue?type=${type}&&id=${id}`)
      .pipe(map(data => {
        return data;
      }));
  }
  getTotalMonthlyCalls(cond) {
    return this.apiService.get('dashboard/getTotalMonthlyCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }
  getTotalMonthlyIncomingCalls(cond) {
    return this.apiService.get('dashboard/getTotalMonthlyIncomingCalls',cond)
      .pipe(map(data => {
        return data;
      }));
  }
  getTotalMonthlyOutgoingCalls(cond) {
    return this.apiService.get('dashboard/getTotalMonthlyOutgoingCalls',cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getTotalMonthlyCallDuration(cond) {
    return this.apiService.get('dashboard/getTotalMonthlyCallDuration', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getAnsweredCalls(cond) {
    return this.apiService.get('dashboard/getAnsweredCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getFailedCalls(cond) {
    return this.apiService.get('dashboard/getFailedCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getNotAnsweredCalls(cond) {
    return this.apiService.get('dashboard/getNotAnsweredCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getBusyCalls(cond) {
    return this.apiService.get('dashboard/getBusyCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getForwardedCalls(cond) {
    return this.apiService.get('dashboard/getForwardCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getRejectedCalls(cond) {
    return this.apiService.get('dashboard/getRejectedCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getMinuteConsumedAnsweredCalls(cond) {
    return this.apiService.get('dashboard/getMinuteConsumedAnsweredCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getMinuteConsumeFailedCalls(cond) {
    return this.apiService.get('dashboard/getMinuteConsumeFailedCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getMinuteConsumeNotAnsweredCalls(cond) {
    return this.apiService.get('dashboard/getMinuteConsumeNotAnsweredCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getCallsPerTenant(cond) {
    return this.apiService.get('dashboard/getCallsPerTenant', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getCallsPerHours(cond) {
    return this.apiService.get('dashboard/getCallsPerHours', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getAsrCallsPerHours(cond) {
    return this.apiService.get('dashboard/getAsrCallsPerHours', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getAcdCallsPerHours(cond) {
    return this.apiService.get('dashboard/getAcdCallsPerHours', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getTotalCallsPerTenant(cond) {
    return this.apiService.get('dashboard/getTotalCallsPerTenant', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getTotalCallsPerHours(cond) {
    return this.apiService.get('dashboard/getTotalCallsPerHours', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getTotalAsrCallsPerHours(cond) {
    return this.apiService.get('dashboard/getTotalAsrCallsPerHours', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getTotalAcdCallsPerHours(cond) {
    return this.apiService.get('dashboard/getTotalAcdCallsPerHours', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getTotalRevenue(type,id) {
    return this.apiService.get(`dashboard/getTotalRevenue?type=${type}&&id=${id}`)
      .pipe(map(data => {
        return data;
      }));
  }

  getTotalActiveExtension() {
    return this.apiService.get('dashboard/getTotalActiveExtension')
      .pipe(map(data => {
        return data;
      }));
  }
  getTotalActiveResellerExtension(ResellerID) {
    return this.apiService.get(`dashboard/getTotalActiveResellerExtension?ResellerID=${ResellerID}`)
      .pipe(map(data => {
        return data;
      }));
  }

 // Admin dashboard show total extension and active
  getActiveExtension() {
    return this.apiService.get('dashboard/getActiveExtension')
    .pipe(map(data =>{
      return data;
    }))
  }
  getActiveResellerExtension(ResellerID) {
    return this.apiService.get(`dashboard/getActiveResellerExtension?ResellerID=${ResellerID}`)
    .pipe(map(data =>{
      return data;
    }))
  }
  //registered extension show on extension portal
  getRegisExtension(id){
    // const url= `dashboard/getregisExtension`;
    return this.apiService.get(`dashboard/getregisExtension?user_id=${id}`)
    .pipe(map(data=>{
      return data;
    }))
  }


  getDateWiseMinuteConsumedAnsweredCalls(cond) {
    return this.apiService.get('dashboard/getDateWiseMinuteConsumedAnsweredCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getDateWiseMinuteConsumeFailedCalls(cond) {
    return this.apiService.get('dashboard/getDateWiseMinuteConsumeFailedCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getDateWiseMinuteConsumeNotAnsweredCalls(cond) {
    return this.apiService.get('dashboard/getDateWiseMinuteConsumeNotAnsweredCalls', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  //
  //------------service for customer-dashboard----start----------------

  getProductwiseDashboardInfo(type,id) {
    return this.apiService.get(`dashboard/getStatusProductwiseDashboard?type=${type}&&id=${id}`)
      .pipe(map(data => {
        return data;
      }));
  }
  // getResellerStatus() {
  //   return this.apiService.get('dashboard/getResellerStatus')
  //     .pipe(map(data => {
  //       return data;
  //     }));
  // }
  getTotalExtension(customerId) {
    const url = `extension/getTotalExtension?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  //Before reseller code
  // getMonthlyTotalExtension(customerId) {
  //   const url = `extension/getMonthlyTotalExtension?customerId=${customerId}`;
  //   return this.apiService.get(url).pipe(map(data => {
  //     return data.response;
  //   }));
  // }
  // After reseller code
  getMonthlyTotalExtension(customerId,role) {
    const url = `extension/getMonthlyTotalExtension?customerId=${customerId}&&role=${role}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getTotalQueue(customerId) {
    const url = `callqueue/getTotalQueue?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getTotalConference(customerId) {
    const url = `conference/getTotalConference?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getPbxTotalIvrByCustomer(customerId) {
    const url = `dashboard/getPbxTotalIvrByCustomer?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  // login(){
  //   return this.apiService.get('auth/login')
  //   .pipe(map(data=>{
  //     return data;
  //   }))
  // }

  getDiskSpaceUsage(cond) {
    return this.apiService.get('dashboard/getDiskSpaceUsage', cond)
      .pipe(map(data => {
        return data;
      }));
  }

  getInvoiceDetails(cond) {
    return this.apiService.get('dashboard/getCustomerInvoiceDetails', cond)
      .pipe(map(data => {
        return data.newObj;
      }));
  }

  //------------service for customer-dashboard----end----------------//


  //------------service for internal-user-dashboard----start----------------//
  public getCustomerDetail(accountManagerId, limit_flag) {
    const url = `internalUserDashboard/getCustomer?accountManagerId=${accountManagerId}&&limit_flag=${limit_flag}`
    return this.apiService.get(url)
      .pipe(map(data => { return data.response }));
  }

  public getDidDetail(cond) {
    const url = `internalUserDashboard/getDidIdForAccountManager`;
    return this.apiService.post(url, cond).pipe(map(data => {
      return data.response;
    }));
  }

  //------------------------------service for internal-user-dashboard----end--------------------------//

  // ------------------service for support dashboard -strat ------------------------//
  public getProductWiseCustomerDetail(cond) {
    const url = `supportDashboard/getProductWiseCustomer`;
    return this.apiService.post(url, cond).pipe(map(data => { return data.response }));
  }

  public getProductWiseDidDetail(cond) {
    const url = `supportDashboard/getProductWiseDid`;
    return this.apiService.post(url, cond).pipe(map(data => { return data.response }));
  }
  // / ------------------service for support dashboard -end ------------------------//
  //------------service for extension-dashboard----start----------------//

  getExtensionDashboardSpeeddial(extensionId) {
    const url = `extensionDashboard/getExtensionDashboardSpeeddial?extensionId=${extensionId}`;
    return this.apiService.get(url)
      .pipe(map(data => {
        return data;
      }));
  }

  getExtensionDashboardCallForward(extensionId) {
    const url = `extensionDashboard/getExtensionDashboardCallForward?extensionId=${extensionId}`;
    return this.apiService.get(url)
      .pipe(map(data => {
        return data;
      }));
  }

  getExtensionDashboardFeatures(extensionId) {
    const url = `extensionDashboard/getExtensionDashboardFeatures?extensionId=${extensionId}`;
    return this.apiService.get(url)
      .pipe(map(data => {
        return data;
      }));
  }

  getExtensionDashboardVoiceMail(extensionId) {
    const url = `extensionDashboard/getExtensionDashboardVoiceMail?extensionId=${extensionId}`;
    return this.apiService.get(url)
      .pipe(map(data => {
        return data;
      }));
  }

  // public getCDRDetail(page: Page): Observable<PagedData<CDR>> {
  //   return this.apiService.get('cdr/getCDRDetail')
  //     .pipe(map(data =>  data.response));
  // }
  //------------service for extension-dashboard----end----------------//

  //----------------------------------- CUSTOMER REALTIME DASHBOARD ---------------------------------------------

  getRegisteredExtension(customerId,singleCall ?) {
    const url = `dashboard/getRegisteredExtension?customerId=${customerId}`;
    // if (singleCall) {
      return this.apiService.get(url).pipe(map(data => {
        return data.response;
      }));
    // } else {
    //   return this.apiService.getDataAsPerTimeSeconds(url,15000);
    // }
  }

  FilterRegisteredExtension(filters) {
    return this.apiService.post('dashboard/FilterRegisteredExtension', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }
  FilterRegisteredAllExtension(filters) {
    return this.apiService.post('dashboard/FilterRegisteredAllExtension', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  getCustomerFullInfo(role,ResellerID) {
    const url = `realtime-dashboard/getCustomerFullDetails?role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getCustomerCallingnfo(customerId ?, singleCall ?, role ?) {
    if(customerId){  // Only single user calls
      const url = `realtime-dashboard/getCustomerCallDetails?customerId=${customerId}`;
      if(singleCall){
        return this.apiService.get(url).pipe(map(data => {
          data.response.refreshCalls = true;
          return data.response;
        }));
      }else{
        return this.apiService.getDataAsPerTimeSeconds(url,30000).pipe(map(data => {
          data.response.refreshCalls = true;
          return data.response;
        }));
      }
    }else{  // All Live calls
      const url = `realtime-dashboard/allCallDetails`;
      return this.apiService.get(url).pipe(map(data => {
        return data.response;
      }));
    }
  }
  getResellerCallinginfo(role,ResellerID){
    const url = `realtime-dashboard/getAllResellerCallDetails?role=${role}&&ResellerID=${ResellerID}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  // getCustomerCallingnfo(customerId ?, singleCall ?, role ?) {
  //   console.log(customerId,'----------id');
    
  //   if(customerId && role != 3){  // Only single user calls
  //     console.log('admin');
      
  //     const url = `realtime-dashboard/getCustomerCallDetails?customerId=${customerId}`;
  //     if(singleCall){
  //       return this.apiService.get(url).pipe(map(data => {
  //         data.response.refreshCalls = true;
  //         return data.response;
  //       }));
  //     }else{
  //       return this.apiService.getDataAsPerTimeSeconds(url,30000).pipe(map(data => {
  //         data.response.refreshCalls = true;
  //         return data.response;
  //       }));
  //     }
  //   }else{  // All Live calls
  //     const url = `realtime-dashboard/allCallDetails?id=${customerId}&role=${role}`;
  //     return this.apiService.get(url).pipe(map(data => {
  //       return data.response;
  //     }));
  //   }
  // }

  getCustomerExtensionInfo(customerId) {
    const url = `dashboard/getCustomerExtension?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
}
