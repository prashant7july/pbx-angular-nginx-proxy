import { Injectable } from '@angular/core';

import { Extension } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { AllExtension } from '../../core/models/all-extension.model';
import { PagedData, Page, ExtensionFeature } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ExtensionService {
  errors = '';
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displaySavedRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(
    private apiService: ApiService
  ) { }

  public getExtension(user_id) {
    const url = `extension/getAllExtension?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getExtensionWithPlugin(user_id) {
    const url = `extension/getAllExtensionWithPlugin?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getPluginExtByCustomerId(user_id) {
    const url = `extension/getPluginExtByCustomerId?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  public getExtensionForRealTimeDashboard(user_id,singleCall ?) {
    const url = `extension/getExtensionRealtime?user_id=${user_id}`;
    // if (singleCall) {
      return this.apiService.get(url).pipe(map(data => {
        return data.response;
      }));
    // } else {
    //   return this.apiService.getDataAsPerTimeSeconds(url,15000);
    // }
  }


  createExtension(type, credentials): Observable<Extension> {
    const route = (type === 'createExtension') ? 'createExtension' : 'updateExtension';
    return this.apiService.post('extension/' + route, { extension: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  checkValidExt(keyword, user_id) {
    return this.apiService.post('extension/verifyExtension', { extension: keyword, user_id: user_id })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  checkValidExtt(data) {
    return this.apiService.post('extension/verifyExtensionn', { credentials: data})
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
  getroaming(id){
    const url = `extension/getRoaming?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  
  getAllIntercomExtension(user_id) {
    const url = `extension/getAllIntercomExtension?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  getMyExtension(user_id) {
    const url = `extension/getAllExtension?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getAllExtensionsForCustomer(user_id) {
    const url = `extension/getAllExtensionsForCustomer?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
    getAllExtensionNumber(productId) {
    const url = `extension/getAllExtensionNumber?productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getExtensionByExtensionId(ext_id){
    const url = `extension/getExtensionByExtId?ext_id=${ext_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getMyExtensionLimit(user_id, type) {
    const url = `extension/getExtensionLimit?user_id=${user_id}&role=${type}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  deleteExtension(id) {
    const url = `extension/deleteExtension?id=${id}`;
    return this.apiService.delete(url).pipe(map(data => {
      return data;
    }));
  }   
  deleteextension(cond) {
    var route = '';
    if (cond.action === 'inactive') route = "inactiveExtension"
    else route = "activeExtension"
    return this.apiService.put('extension/' + route, cond)
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getExtensionById(id) {
    const url = `extension/getExtensionById?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));

  }

  getDidListById(userId) {
    const url = `extension/getDidListById?userId=${userId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  filterExtension(filters) {
    return this.apiService.post('extension/getExtensionByFilters', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }
  

  getExtensionNameandNumber(id): Observable<Extension> {
    const url = `extension/getExtensionNameandNumber?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }


  updateExtensionPassword(credentials): Observable<Extension> {
    return this.apiService.put('extension/updateExtensionPassword', credentials)
      .pipe(map(data => { return data; }));
      
      
  }

  extensionEmailExist(cond) {
    return this.apiService.post('extension/extensionEmailExist', cond).pipe(map(data => {
      return data;
    }));
  }

  // getExtensionName(email) {
  //   const url = `extension/getExtensionName?email=${email}`;
  //   return this.apiService.get(url).pipe(map(data => {
  //     return data;
  //   }));
  // }

  checkEmailValid(keyword) {
    return this.apiService.post('extension/verifyEmail', { email: keyword })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }



  public getCustomerExtensionFeatures(customerId) {
    const url = `extension/getCustomerExtensionFeatures?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }


  private getPagedDataExtensionFeatures(page: Page, extFeaturesDetail): PagedData<ExtensionFeature> {    
    const pagedData = new PagedData<ExtensionFeature>();
    page.totalElements = extFeaturesDetail.length;
    page.totalPages = page.totalElements / page.size;
    const start = page.pageNumber * page.size;
    const end = Math.min((start + page.size), page.totalElements);
    for (let i = start; i < end; i++) {
      const jsonObj = extFeaturesDetail[i];
      const pack = new ExtensionFeature(jsonObj.dnd, jsonObj.black_list, jsonObj.recording,
        jsonObj.call_transfer, jsonObj.forward, jsonObj.outbound, jsonObj.speed_dial,
        jsonObj.voicemail, jsonObj.balance_restriction, jsonObj.multiple_registration,
        jsonObj.name, jsonObj.number, jsonObj.id, jsonObj.customer_id);

      pagedData.data.push(pack);
    }
    pagedData.page = page;

    return pagedData;
  }

  filterExtensionFeatures(filters) {
    const url = `extension/getExtensionFeaturesByFilters?customerId=${filters.user_id}`;
    return this.apiService.post(url, { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  filterSupportExtension(filters) {
    return this.apiService.post('extension/getExtensionForSupport', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }

  checkExtUsernameValid(keyword) {
    return this.apiService.post('extension/verifyExtUsername', { username: keyword })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  updatePackageMinuteBal(balance, featureId){
    return this.apiService.post('extension/updatePackageMinuteBal', { balance: balance, id: featureId })
      .pipe(map(
        data => {
          return data;
        }
      ));
  }

  manageExtMinute(path, data){
    return this.apiService.post('extension/'+path, data).pipe(map(data => {
      return data;
    }));
  }

  dedcutCustomMinute(path, data){    
    return this.apiService.post('extension/'+path, data).pipe(map(data => {
      return data;
    }));
  }

  dedcutAllMinute(path, data){    
    return this.apiService.post('extension/'+path, data).pipe(map(data => {
      return data;
    }));
  }

  getExtensionCount(extension_id, extension_number){
    const url = `extensionCount?extension_id=${extension_id}&extension_number=${extension_number}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  manageBulkUpdation(path, credentials){
    return this.apiService.post('extension/'+path, { extension: credentials }).pipe(map(data => {
      return data;
    }));
  }
  
  deductBundlePlanMinute(data, customer_id){    
    return this.apiService.post(`extension/bundlePlanMinuteAssign?customer_id=${customer_id}`, data).pipe(map(data => {
      return data;
    }));
  }
  
  getExtensionAssignMinutes(data, cust_id,call_rateId){    
    return this.apiService.post('extension/getExtensionAssignMinutes', {destList : data, customer_id : cust_id, id :call_rateId}).pipe(map(data => {
      return data.response;
    }));
  }

  getExtensionAssignMinutesByExtId(ext_number, cust_id){    
    return this.apiService.post('extension/getExtensionAssignMinutesByExtId', {ext_number : ext_number, customer_id : cust_id}).pipe(map(data => {
      return data.response;
    }));
  }

  adjustBundlePlanMinute(data, customer_id ){    
    return this.apiService.post(`extension/bundlePlanMinuteAdjust?customer_id=${customer_id}`, data).pipe(map(data => {
      return data;
    }));
  }
  
  checkContactExistInBlackList(data) {
    return this.apiService.post('contactList/checkContactExistInBlackList',data).pipe(map(data => {
      return data;
    }));
  }
  
  // Profile Update--------------
  profileupdate(role,credential){    
    return this.apiService.patch('extension/UpdateProfile', {role:role, crdentials:credential})
    .pipe(map(
      data => {
        return data;
      },err => {
        this.errors = err;
      }
      ));
    }
    
    getParticularExtensionMinute(obj){
      let url = `extension/getparticularExtensionMinute?destination=${obj.destination}&cust_id=${obj.customer_id}&ext_id=${obj.ext_id}`;
      return this.apiService.get(url).pipe(map(data => {
        return data;
      },err => {
        this.errors = err;
      }))
    }
    
    removeExtensionMinutes(data){
      return this.apiService.post('extension/removeExtensionMinute',data).pipe((map(item => {
        return item;
      },err => {
      this.errors = err;
    })))
  }
  
  setAdvanceService(credentials){
    return this.apiService.post('extension/setAdvanceService',{ credentials: credentials }).pipe(map(data => {
      return data;
    }));
  }

  bulkDeleteExtension(credentials){
    return this.apiService.post('extension/bulkDeleteExtension',{ credentials: credentials }).pipe(map(data => {
      return data;
    }));
  }
  
}

