import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PbxFeature, OcFeature, PagedData, Page, PackageData } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  errors = "";

  constructor(private apiService: ApiService) { }

  //----------------oc-feature.service----------start------------------//

  postOcFeature(type, credentials): Observable<OcFeature> {
    const route = (type === 'createPackage') ? 'createOcFeature' : 'updateOcFeature';
    return this.apiService.post('features/' + route, { feature: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  customPostOcFeature(type, credentials): Observable<OcFeature> {
    const route = (type === 'customCreateOcFeature') ? 'customCreateOcFeature' : 'customUpdateOcFeature';
    return this.apiService.post('features/' + route, { feature: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  //----------------oc-feature.service----------end------------------//
  //----------------pbx-feature.service----------start------------------//

  postPbxFeature(type, credentials): Observable<PbxFeature> {
    const route = (type === 'createPackage') ? 'createPbxFeature' : 'updatePbxFeature';
    return this.apiService.post('features/' + route, { feature: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  customPostPbxFeature(type, credentials): Observable<PbxFeature> {
    const route = (type === 'customCreatePbxFeature') ? 'customCreatePbxFeature' : 'customUpdatePbxFeature';
    return this.apiService.post('features/' + route, { feature: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
  getPbxFeatures(customerId, productId) {
    return this.apiService.post('features/getPbxFeatures', { customerId: customerId, productId: productId })
      .pipe(map(data => {
        return data;
      }, err => {
        this.errors = err;
      }
      ));
  }

  //----------------pbx-feature.service----------end------------------//
  //----------------all-package.service----------start----------------//

  // getPackageInfo() {
  //   return this.apiService
  //     .get('getPackage')
  //     .pipe(map(data => {
  //       return data;
  //     }));
  // }

  getPackageInfoById(packageId, productId) {
    // const url1 = 'getPackageById1?packageId=' + packageId + '&productId=' + productId;
    const url = `getPackageById?packageId=${packageId}&productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
 
  getPackageCustomer(packageId, productId) {
    return this.apiService.post('getPackageCustomers', { package_id: packageId, product_id: productId })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  public getPackageInfo() {
    return this.apiService.get('getPackage').pipe(map(data => {
      return data.response;
   }));
  }
  public getCustomerPackage(userId) {
    return this.apiService.post('getCustomerPackage', { userId: userId }).pipe(map(data => {
      return data.response;
   }));
  }

  filterPackage(filters) {
    return this.apiService.post('getPackageByFilters', { filters: filters })
    .pipe(map(data => {
      return data.response;
    }));      
  }

  deletePackage(product_id, package_id){
    return this.apiService.post('deletePackage', { package_id: package_id, product_id: product_id })
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
    ));
  }

  getFeatureUserCount(product_id, package_id){
   // const url1 = 'getPackageById1?packageId=' + packageId + '&productId=' + productId;
    const url = `featureUsersCount?package_id=${package_id}&product_id=${product_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getGatewayGroup(){
    const url = `getGatewayGroup`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getCallPlan(){
    const url = `getCallPlan`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getCallPlanWithCircle(id){
    const url = `getCircleCallPlan`;
    return this.apiService.post(url,{ circle_id: id }).pipe(map(data => {
      return data;
    }));
  }

  
  getPackageExtensionCount(package_id) {
    return this.apiService.post('getPackageExtensionCount', { package_id: package_id })
    .pipe(map(data => {
      return data.response;
    }));
      
  }
  
  getSMS() {
    return this.apiService.get('sms/getAllSMS').pipe(map(data => {
      return data.response;
    })); 
  }
  
  getCallPlanList(){
    const url = `getCallPlanList`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  
  getTCCallPlanList(){
    const url = `getTCcallPlanList`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  
  getNewRates(data){
    const url = `getNewRates?plan_type=${data.plan_type}&users=${data.customers_id}&feature_id=${data.feature_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  checkCallRates(data){
    const url = `checkCallRates`
    return this.apiService.post(url,{'data':data}).pipe(map(data => {
      return data;
    }));
  }
  
  removeAssociateBoosterFromMinutePlan(data): Observable<PbxFeature> {
    const url = `deleteAssociateBoosterFromMinutePlan`;
    return this.apiService.post(url, {'minute_plan_id':data})
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
      ));
    }

    assignNewRates(credentials) {
      return this.apiService.post('assignNewRates', { credentials: credentials })
      .pipe(map(data => {
        return data;
      }));
        
    }
  }
