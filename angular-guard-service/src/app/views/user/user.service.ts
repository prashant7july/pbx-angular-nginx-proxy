import { Injectable } from '@angular/core';
import { ApiService } from '../../core';

import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';  // import for table refresh
import { Customer } from '../../core/models';


@Injectable({
  providedIn: 'root'
})
export class UserService {  
  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  attemptAuth(body: { ip: string; username: any; password: any; loginType: string; }) {
    throw new Error('Method not implemented.');
  }
  purgeAuth() {
    throw new Error('Method not implemented.');
  }
  setAuth(data: any) {
    throw new Error('Method not implemented.');
  }
  errors = "";
  //// for table refresh from here ---------------------------------
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displaySavedRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  ////////////////// till here ---------------------------------
  constructor(
    private apiService: ApiService
  ) { }


  // Plugin API//
  getAccessCategory(customer) {
    var url =`accessRestriction/viewAccessCategory?customerId=${customer}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  } 

  ////////START VIEW-USER
  checkEmailValid(credentials) {
    return this.apiService.post('user/verifyEmail', credentials).pipe(map(data => {
      return data;
    }));
  }
  verifynotificationEmail(credentials) {
    return this.apiService.post('user/verifynotificationEmail', credentials).pipe(map(data => {
      return data;
    }));
  }

  checkCompanyValid(credentials) {
    return this.apiService.post('user/verifyCompany', credentials).pipe(map(data => {
      return data;
    }
    ));
  }

  getInternalUser() {
    return this.apiService.get('user/getInternalUser').pipe(map(data => {
      return data;
    }));
  }
  getInternalUserReseller(role,ResellerID) {
    return this.apiService.get(`user/getInternalUserReseller?role=${role}&&ResellerID=${ResellerID}`).pipe(map(data => {
      return data;
    }));
  }

  getCustomerBillingTypePackage(productId, packageId) {
    const url = `getCustomerBillingTypePackage?packageId=${packageId}&productId=${productId}`;
    return this.apiService.get('user/' + url).pipe(map(data => {
      return data;
    }));
  }

  getCustomerBillingTypeAndWithOutBundlePackage(productId, packageId) {
    const url = `getCustomerBillingTypeAndWithOutBundlePackage?packageId=${packageId}&productId=${productId}`;
    return this.apiService.get('user/' + url).pipe(map(data => {
      return data;
    }));
  }

  getCustomerById(id) {
    const url = `getCustomerById?id=${id}`;
    return this.apiService.get('user/' + url).pipe(map(data => {      
      return data;
    }));
  }

  getUserInfo(id) {
    const url = `getUserInfo?id=${id}`;
    return this.apiService.post('user/' + url).pipe(map(data => {      
      return data.response;
    }));
  }

  getTopDialOut(id) {
    const url = `user/getTopDialOut?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  deleteCustomer(cond) {
    var route = '';
    if (cond.action === 'delete') route = "deleteCustomer"
    else if (cond.action === 'inactive') route = "inactiveCustomer"
    else route = "activeCustomer"
    return this.apiService.put('user/' + route, cond)
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getCustomerPackage(customerId) {
    return this.apiService.post('getCustomerPackage', { userId: customerId }).pipe(map(data => {
      return data.response;
    }));
  }

  getAllUserStatusWise(customerStatus, productId) {
    return this.apiService.post('user/getAllUserStatusWise', { customerStatus: customerStatus, productId: productId })
      .pipe(map(data => {
        return data.response;
      }));
  }

  getAllUserForSupport(productId) {
    const url = `user/getAllUserForSupport?productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getAllReseller(productId) {
    const url = `user/getAllReseller?productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getAllResellerData(productId) {
    const url = `user/getAllResellerData?productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getAllSupportUser(){
    const url = `user/getAllSupportUser`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));

  }
  getAllUserForAccountManager(accountManagerId) {
    const url = `user/getAllUserForAccountManager?accountManagerId=${accountManagerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getAllUser() {
    return this.apiService.get('user/getAllUsers').pipe(map(data => {
      return data.response;
    }));
  }   
  PaidStatusCustomerInvoice(id) {
    const url = `user/paidStatusCustomerInvoice?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  filterSupportUsers(filters, productId) {
    const url = `user/getUsersForSupportByFilters?productId=${productId}`;
    return this.apiService.post(url, { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

  filterAccountManagerUsers(filters, accountManagerId) {
    const url = `user/getUsersForAccountManagerByFilters?accountManagerId=${accountManagerId}`;
    return this.apiService.post(url, { filters: filters }).pipe(map(data => {
      return data.response;
    }
    ));
  }
  getUsersForResellerByFilters(filters, ResellerId) {
    const url = `user/getUsersForResellerByFilters?ResellerId=${ResellerId}`;
    return this.apiService.post(url, { filters: filters }).pipe(map(data => {
      return data.response;
    }
    ));
  }

  filterUsers(filters) {
    return this.apiService.post('user/getUsersByFilters', { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

  getAllUserStatusWiseFilters(filters) {
    return this.apiService.post('user/getAllUserStatusWiseFilters', { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }
  /////////MAYANK END VIEW-USER
  //-------------------create-user-service------start-----------//

  //update/create/internal user
  postUserData(credentials): Observable<Customer> {
    return this.apiService.post('user/createUser', credentials).pipe(map(data => {
      return data;
    }
    ));
  }

  checkUsernameValid(credentials) {
    return this.apiService.post('user/verifyUsername', credentials)
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  deleteInternalUser(cond) {
    var route = '';
    if (cond.action === 'delete') route = "deleteCustomer"
    else if (cond.action === 'inactive') route = "inactiveCustomer"
    else route = "activeCustomer"

    return this.apiService.put('user/' + route, cond).pipe(map(
      data => { return data },
      err => { this.errors = err; }
    ));
  }

  getInternalUserById(id) {
    const url = `getInternalUserById?id=${id}`;
    return this.apiService.get('user/' + url).pipe(map(data => {
      return data;
    }));
  }

  filterInternalUsers(filters) {
    return this.apiService.post('user/getInternalUsersByFilters', { filters: filters })
      .pipe(map(
        data => {
          return data.response;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getCustomerCompany(productId) {
    const url = `user/getCustomercompany?productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  getCustomerCompanyReseller(id,productId) {
    const url = `user/getCustomercompanyReseller?id=${id}&&productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }


  getAccountManagerCustomercompany(accountManagerId) {
    const url = `user/getAccountManagerCustomercompany?accountManagerId=${accountManagerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getAccountManagerProductCustomercompany(accountManagerId, productId) {
    const url = `user/getAccountManagerProductCustomercompany?accountManagerId=${accountManagerId}&productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getPackageProductWise(packageId) {
    const url = `user/getPackageProductWise?packageId=${packageId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getAssignedUser(id){
    const url = `user/getAssignedUser?managerId=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getUserByType(type) {
    const url = `getUserByType?type=${type}`;
    return this.apiService.get('user/' + url).pipe(map(data => {
      return data;
    }));
  }


  postUserMail(data) {
    return this.apiService.post('user/sendmail', data).pipe(map(data => {
      return data;
    }));
  }

  //////////////////////////////////// Add Balance////////////////////////////////////////////////////

  createAddBalance(credentials) {
    return this.apiService.post('addBalance/createAddBalance', credentials)
      .pipe(map(data => { return data; }));
  }
  createAddResellerBalance(credentials) {
    return this.apiService.post('addBalance/createAddResellerBalance', credentials)
      .pipe(map(data => { return data; }));
  }

  getAddBalance(cond) {
    return this.apiService.post(`addBalance/viewAddBalance`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  deleteAddBalance(id) {
    return this.apiService.post(`addBalance/deleteAddBalance?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  filterAddBalance(filters,role,ResellerID) {
    return this.apiService.post('addBalance/getAddBalanceByFilters', { filters: filters,role,ResellerID })
      .pipe(map(data => {
          return data.response;
        }
      ));
  }

  getProduct(){
    const url = `product/getproduct`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  isSupportContactAssociateWithGroup(supportCustomerId){
    return this.apiService.get(`user/isSuppotContactAssociateGroup?id=${supportCustomerId}`).pipe(map(data => {
      return data.response; 
    }));
  }

// --------------------------------------- SMS -------------------------------------------------------------

  getCustomerRemainingSMS(customerId) {
    return this.apiService.post('sms/getCustomerRemainingSMS', { userId: customerId }).pipe(map(data => {
      return data.response;
    }));
  }

  resetCustomerSMSPackage(customerId) {
    return this.apiService.post('sms/resetCustomerSMSPackage', { userId: customerId }).pipe(map(data => {
      return data.response;
    }));
  }

  createSMSCharge(credentials) {
    return this.apiService.post('sms/createSMSCharge', { smsDetail: credentials })
      .pipe(map(data => { return data; }));
  }
  //-----------------------------------------------------------------------------------------------------------


  getCustomerAssociateMinutePlan(custID){
    return this.apiService.get(`minutePlan/getAllMinutePlanBasedOnPackage?id=${custID}`).pipe(map(data => {
      return data; 
    }));
  }

  getCallPlanRateOfCustomer(custID){
    return this.apiService.get(`minutePlan/getCallPlanRateOfCustomer?id=${custID}`).pipe(map(data => {
      return data.response; 
    }));
  }

  getPluginByCustomer(custID, id){
    return this.apiService.post(`plugin/getPluginByCustomer`,{id:custID,data_id:id}).pipe(map(data => {                
      return data.response; 
    }));
  }


  createPlugin(credentials){
    return this.apiService.post('plugin/createPlugin', credentials)
    .pipe(map(data =>{
      return data;
    }));
  }

  updatePlugin(credentials){
    return this.apiService.post('plugin/updatePluginDetails', credentials)
    .pipe(map(data =>{
      return data;
    }));
  }



  deleteDestination(id){
    return this.apiService.delete('plugin/deleteDestination',)
  }

  viewPlugin(credentials){
    return this.apiService.get('plugin/viewPlugin',credentials)
  }

  deletePlugin(id){
    return this.apiService.get('plugin/deletePlugin',id)
  }
  getPluginByFilter(credentials){
    return this.apiService.get('plugin/getPluginByFilter',credentials)
    .pipe(map(data =>{
      return data.response;
    }))
  }
  // getDestinationData()
  getPluginByID(credentials){
    return this.apiService.post('plugin/getPluginById', credentials)
    .pipe(map(data =>{
      return data.obj;
    }))
  }

  getCountryByDest(code){
    return this.apiService.get(`plugin/getCountryByDest?code=${code}`)
  }

  getScriptURL(){
    return this.apiService.get(`user/getScriptURL`)
    .pipe(map(data=>{
      return data;
    }))
  }

  getLogo(data, type){
    return this.apiService.get(`pbx/getLogoPath?id=${data}&type=${type}`)
    .pipe(map(data => {
      return data;
    }, err => {
      this.errors = err;
    }))
  }

  deleteBundleRates(credentials){
    return this.apiService.post('callPlanRate/deleteBundleRates', credentials)
    .pipe(map(data =>{
      return data;
    }));
  }

  getResellerProduct(id){
    return this.apiService.get(`reseller/getproduct?id=${id}`).pipe(map(data => {
      return data.response;
    }))
  }


}
