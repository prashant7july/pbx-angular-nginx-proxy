import { Injectable } from '@angular/core';

import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';  // import for table refresh
import { Page,DID } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class DidService {
  errors = '';

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displaySavedRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  createDID(type, credentials): Observable<DID> {
    const route = (type === 'createDID') ? 'createDID' : 'updateDID';
    return this.apiService.post('did/' + route, { did: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  checkValidDID(keyword) {
    return this.apiService.post('did/verifyDID', { did: keyword })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  public getDID(page: Page, user_id) {
    const url = `did/getAllDID`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public getIntenalUserDID(user_id){
    const url = `did/getIntenalUserDID?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data =>{ return data.response}));
  }

  public getSupportProductWiseDID( productId) {
    const url = `did/getSupportProductWiseDID?productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  deleteDID(type, did_id) {
    //const route = (type === 'deleteUser') ? 'deleteCustomer' : 'inactiveCustomer';
    var route = '';
    if (type === 'delete') {
      route = "deleteDID";
    } else if (type === 'inactive') {
      route = "inactiveDID";
    } else {
      route = "activeDID";
    }
    return this.apiService.put('did/' + route, { did_id: did_id })
      .pipe(map(
        data => {
          return data.response;
        }, err => {
          this.errors = err;
        }
      ));
  }

  filterDID(filters) {
    return this.apiService.post('did/getDIDByFilters', { filters: filters })
    .pipe(map(
      data => {
        return data.response;
      }, err => {
        this.errors = err;
      }
    ));
  }

  public getCustomerDID(user_id, field) {
    const url = `did/getCustomerDID?user_id=${user_id}&type=${field}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  filterCustomerDID(filters, user_id) {
    return this.apiService.post('did/getCustomerDIDByFilters', { filters: filters, user_id: user_id })
    .pipe(map(
      data => {
        return data.response;
      }, err => {
        this.errors = err;
      }
    ));
  }


  filterInternalUserCustomerDID(filters, user_id){
    return this.apiService.post('did/getInternalUserDIDByFilters', { filters: filters, user_id: user_id })
      .pipe(map(data => { return data.response}));
  }

  filterSupportCustomerDID(filters, productId) {
    return this.apiService.post('did/getSupportDIDByFilters', { filters: filters, productId: productId })
    .pipe(map(data => {
      return data.response;
    }));
  }


  getDIDById(id): Observable<DID> {
    const url = `did/getDIDById?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getCustomerList() {
    const url = `user/getCustomers`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getDIDByCountry(obj) { 
    const url = `did/getDIDByCountry`;
    return this.apiService.post(url, obj).pipe(map(data => {
      return data.response;
    }));
  }

  assignDID(type, credentials): Observable<DID> {
    return this.apiService.post('did/assignDID', { credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  releaseDID(did_id, user_id, fixrate, productId, data, country) {
    return this.apiService.post('did/releaseDID', { did_id: did_id, user_id: user_id, fixrate: fixrate, product_id : productId, did_number:data,did_country:country })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
 
  manageDID(type, did_id) {
    //const route = (type === 'deleteUser') ? 'deleteCustomer' : 'inactiveCustomer';
    var route = '';
    if (type === 'inactive') {
      route = "inactiveCustomerDID";
    } else {
      route = "activeCustomerDID";
    }
    return this.apiService.put('did/' + route, { did_id: did_id })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  // makeMasterDID(master_id,did_id){
  //   var route = '';
  //   if(master_id == 'master'){
  //     route = "makeMasterDID";
  //   }else{
  //     route = "removeMasterDID";
  //   }
  //   return this.apiService.patch('did/' + route, {did_id: did_id, master_id: master_id})
  //   .pipe(map(
  //     data=>{
  //       return data;
  //     }, err =>{
  //       this.errors =err;
  //     }
  //   ));
  // }


  makeMasterDID(master_id,data) {
    
    const url = `did/makeMasterDID`;
    return this.apiService.patch(url,{data: data, master_id: master_id}).pipe(map(data => {
      return data.response;
    }));
  }

  getActiveFeature(user_id) {
    const url = `did/getActiveFeature?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getDestination(user_id, feature) {
    var path = `did/getDestination?user_id=${user_id}&feature=${feature}`;
    return this.apiService.get(path).pipe(map(data => {
      return data.response;
    }));
  }

  createDestination(type, credentials){
    const route = (type === 'createDestination') ? 'createDestination' : 'updateDestination';
    return this.apiService.post('did/' + route, { credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getDIDDestination(user_id, did_id){
    var path = `did/getDIDDestination?user_id=${user_id}&did_id=${did_id}`;
    return this.apiService.get(path).pipe(map(data => {
      return data;
    }));
  }

  getProductWiseCustomer(obj){        
    var path = `did/getProductWiseCustomer`;
    return this.apiService.post(path,obj).pipe(map(data => {
      return data;
    }));
  }

  public getMappedDIDHistory() { 
    const url = `did/getAllMappedDIDHistory`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  filterMappedDIDHistory(filters) {
    return this.apiService.post('did/getAllMappedDIDHistoryByFilters', { filters: filters })
    .pipe(map(
      data => {
        return data.response;
      }, err => {
        this.errors = err;
      }
    ));
  }


getAllFeatureDIDHistory(id){
  const url = `did/getAllFeatureDIDHistory?id=${id}`;
  return this.apiService.get(url).pipe(map(data =>{
    return data.response;
  }));
}

getVMNDetails(id){
  return this.apiService.get(`vmn/getVmnDetails?id=${id}`).pipe(map(data => {        
    return data;
  }));
}

getVoicebotByCustId(id){
  return this.apiService.get(`did/getVoicebotByCustId?id=${id}`).pipe(map(data => {        
    return data;
  }));
}

  createVMNNumber(data) {         
    return this.apiService.post('did/createVMN', data).pipe(map(data => {
      return data.response;
    }));
  }

  vmnDetail(data) {         
    return this.apiService.post('did/getVmnById',data).pipe(map(data => {
      return data;
    }));
  }

  deleteVmn(id) {
    return this.apiService.post('did/deleteVMN', id).pipe(map(data => {
      return data.response;
    }));
  }

  getAssociateDIDWithVMN(data){
    return this.apiService.post('did/getAssociateDID', {id:data}).pipe(map(data => {
      return data;
    }));
  }
}
