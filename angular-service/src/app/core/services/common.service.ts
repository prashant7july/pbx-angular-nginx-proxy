import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { productId } from 'src/app/views/dashboard/customer-dashboard/customer-dashboard.component';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private apiService: ApiService
  ) { }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;        
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  numberWithNegative(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;        
    if ( (charCode > 47 && charCode < 58 )||  charCode == 45 ) {
      return true;
    }else{
      return false;
    }
  }

  numberWithAstrick(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 13  || charCode == 42 || (charCode >= 48 && charCode <= 57)) {
      return true;
    }
    return false;
  }

  charOnly(e) { // handel space in any input at fist possition
    if (e.which === 32 && !e.target.value.length)
      e.preventDefault();
  }

  alphabetOnly(e){
    if(e.charCode == 13 || e.charCode == 32 || (e.charCode > 64 &&  e.charCode < 91) || (e.charCode > 96 && e.charCode < 123)){
      return true;
    }else{
      return false;
    }
  }

  alphabetWithNumber(e){
    if((e.charCode > 31 &&  e.charCode < 48) || (e.charCode > 57 && e.charCode < 65) || (e.charCode > 90 && e.charCode < 97) || (e.charCode > 122 && e.charCode <= 126)){
      return false;
    }else{
      return true;
    }
  }

  dialoutRules(event){
    const charCode = (event.which) ? event.which : event.keyCode;    
    if ((charCode > 47 && charCode < 58) || (charCode == 42 || charCode == 88)) {
      return true;
    }
    return false;
  }
  // (charCode < 48 || charCode > 57 || charCode == 42 || charCode == 88)
  alphabetWithSplChrOnly(e){
    if(e.charCode < 48 && e.charCode > 58){
      return false;
    }else{
      return true;
    }
  }

  ipOnly(e){
    if((e.charCode > 64 && e.charCode < 71) || (e.charCode > 96 && e.charCode < 103) || e.charCode == 8 || e.charCode == 46 || (e.charCode >= 48 && e.charCode <= 58)){
      return true;
    }else{
      return false;
    }
  }

  webPasswordOnly(e){    
    if(e.charCode == 96 || e.charCode == 39 || e.charCode == 34 || e.charCode == 40  || e.charCode == 41 || e.charCode == 59  ){
      return false;
    }else{
      return true;
    }
  }
  
  getCountryList() {
    return this.apiService.get('common/getCountryList')
      .pipe(map(data => {
        return data;
      }));
  }

  getIndiaStates() {
    return this.apiService.get('common/getIndiaStates')
      .pipe(map(data => {
        return data;
      }));
  }

  getCountryById(id) {
    // const url1 = 'getPackageById1?packageId=' + packageId + '&productId=' + productId;
    const url = `common/getCountryList?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getTimezone() {
    const url = `common/getTimeZone`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  checkNumberExistInBlackList(cond) {
    return this.apiService.post('blackList/checkNumberExistInBlackList',cond).pipe(map(data => {
      return data;
    }));
  }

  customerWiseCountry(id) {
    const url = `common/customerWiseCountry?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  reloadPage() {
    window.location.reload();
  }

  floatOnly(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    var number = evt.target.value.split('.');
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    //just one dot
    if (number.length > 1 && charCode == 46) {
      return false;
    }
    //get the carat position
    //var caratPos = getSelectionStart(el);
    var dotPos = evt.target.value.indexOf(".");
    if (dotPos > -1 && (number[1].length > 4)) {
      return false;
    }
    return true;
  }

  onlyPositiveNumber(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;    
      if (charCode == 45 || charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  decimalWIth2digits(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    var number = evt.target.value.split('.');
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    //just one dot
    if (number.length > 1 && charCode == 46) {
      return false;
    }
    //get the carat position
    //var caratPos = getSelectionStart(el);
    var dotPos = evt.target.value.indexOf(".");
    if (dotPos > -1 && (number[1].length > 1)) {
      return false;
    }
    return true;

  }
  floatWithNegativeNumber(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;    
    var number = evt.target.value.split('.');
    var number1 = evt.target.value.split('-');
    if (charCode != 45 && charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    //just one dot
    if (number.length > 1 && charCode == 46) {
      return false;
    }

    if(number1.length > 1 && charCode == 45){
      return false;
    }
    //get the carat position
    //var caratPos = getSelectionStart(el);
    var dotPos = evt.target.value.indexOf(".");
    if (dotPos > -1 && (number[1].length > 4)) {
      return false;
    }
    return true;
  }

  stdNumber(e) {
    
    var input = e.target;
    input.onkeypress = function(e) {e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    // Allow non-printable keys
    if (!charCode || charCode == 8 /* Backspace */ ) {
        return;
    }

    var typedChar = String.fromCharCode(charCode);

    // Allow numeric characters
    if (/\d/.test(typedChar)) {
        return;
    }

    // Allow the minus sign (-) if the user enters it first
    if (typedChar == "+" && this.value == "") {
        return;
    }

    // In all other cases, suppress the event
    return false;
};
  }

  getEmailContentUsingCategory(category) {
    const url = `emailTemplate/getEmailContentUsingCategory?category=${category}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }


  getProviders() {
    return this.apiService.get('common/getProviders')
      .pipe(map(data => {
        return data;
      }));
  }

  getCustomerName(email) {
    const url = `user/getCustomerName?email=${email}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }


  getCustomerNameandEmail(accountManagerId) {
    const url = `user/getCustomerNameandEmail?accountManagerId=${accountManagerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getCustomerEmail(name) {
    const url = `user/getCustomerEmail?name=${name}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getProductFeatures(customerId,productId) {
    const url = `features/getProductFeatures?customerId=${customerId}&productId=${productId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getCustomerCountry(id) {
    const url = `common/getCustomerCountry?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getCustomerProductFeatures(customerId) {
    const url = `features/getCustomerProductFeatures?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getExtensionFeatures(extensionId) {
    const url = `features/getExtensionFeatures?extensionId=${extensionId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')
  }

  getExten(cond){
    return this.apiService.post(`callgroup/getExten`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  getAllCustomerCompany() {
    const url = `user/getAllCustomerCompany`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getBlacklistFeatures(cond) {
    return this.apiService.post('features/getBlacklistFeatures',cond).pipe(map(data => {
      return data;
    }));
  }

  getCompany() {
    const url = `user/getCompany`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

 toUpperCase(e) {
   let str = e.target.value;
    let up = str.split(/\s+/).map( s => s.charAt( 0 ).toUpperCase() + s.substring(1).toLowerCase() ).join( " " );

    e.target.value = up;
  }

  getDestinationDID(id){
    const url = `extension/getDestinationDID?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response[0][0];
    }));
  }

  checkFeatureByPackage(id){
    const url = `feature/checkFeatureByPackage?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response[0];
    }));
  }

}
