import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  errors = "";
  SharingData = new Subject(); 
   
  constructor(
    private apiService: ApiService
  ) { }

  getProductInfo(){
    return this.apiService
      .get('product')
      .pipe(map(data => {
        return data;
      }));
  }

  getPbxPackageInfo(){
    return this.apiService
      .get('productPbxPackage')
      .pipe(map(data => {
        return data;
      }));
  }
  getPbxPackageInfoForCustomerCreation(){
    return this.apiService
      .get('productPbxPackageForCustomerCreation')
      .pipe(map(data => {
        return data;
      }));
  }
  getOcPackageInfo(){
    return this.apiService
      .get('productOcPackage')
      .pipe(map(data => {
        return data;
      }));
  }
  getProductCustomerWise(customerId){
    const url = `product/getProductCustomer?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  checkValidPackage(keyword, product){
    return this.apiService.post('product/verifyPackageName', { package: keyword, product_id: product })
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
    ));
  }
  getAccountManagerPbxPackageInfo(accountManagerId){
    const url = `accountManagerProductPbxPackage?accountManagerId=${accountManagerId}`
    return this.apiService
      .get(url)
      .pipe(map(data => {
        return data;
      }));
  }
  getAccountManagerOCPackageInfo(accountManagerId){
    const url = `accountManagerProductOCPackage?accountManagerId=${accountManagerId}`
    return this.apiService
      .get(url)
      .pipe(map(data => {
        return data;
      }));
  }
  
  getPackageCircleBased(circleId){
    const url = `package/getCirclePackage?circleId=${circleId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }


}
