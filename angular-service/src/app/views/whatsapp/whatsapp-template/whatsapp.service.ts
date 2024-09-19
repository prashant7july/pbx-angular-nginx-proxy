import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { GatewayGroup } from "../../../core/models";
import { Gateway } from "../../../core/models/gateway.model";
import { ApiService } from "../../../core/services/api.service";
import { map } from "rxjs/operators";


@Injectable({
  providedIn: "root",
})
export class WhatsAppService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);
  
  constructor(private apiService: ApiService) {}

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  public displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  public createWhatsappTemplate(credentials){
    return this.apiService.post('whatsapp/addTemplate', {credentials}).pipe(map((data) => {
        return data
    }, (err) => {
        this.errors = err;
    }));
  }

  public getTemplate(credentials, id){
    return this.apiService.post(`whatsapp/templateListing?customer_id=${id}`, {credentials}).pipe(map((data) => {
        return data.response;
    }, (err) => {
        this.errors = err;
    }));
  }
  
  public deleteTemplate(credentials){
    return this.apiService.post('whatsapp/deleteTemplate',{credentials}).pipe(map((data) => {
      return data;
    }, (err) => {
      this.errors = err;
    }))
  }
  public deleteSocialGroup(credentials){
    return this.apiService.post('socialMedial/deleteSocialGroup',{credentials}).pipe(map((data) => {
      return data;
    }, (err) => {
      this.errors = err;
    }))
  }
  

  public getTemplateById(credentials){
    return this.apiService.get(`whatsapp/getTemplateById?id=${credentials}`).pipe(map((data) => {
      return data.response[0];
    }, (err) => {
      this.errors = err;
    }))
  }
  public getSocialById(credentials){
    return this.apiService.get(`socialMedial/getSocialById?id=${credentials}`).pipe(map((data) => {
      return data.response[0];
    }, (err) => {
      this.errors = err;
    }))
  }

  public updateTemplateDetail(credentials){
    return this.apiService.post(`whatsapp/updateTemplate`, {credentials}).pipe(map((data) => {      
      return data;
    }, (err) => {
      this.errors = err;
    }))
  }
  public updateSocialMedia(credentials){
    return this.apiService.post(`socialMedial/updateSocialMediaChannel`, {credentials}).pipe(map((data) => {      
      return data;
    }, (err) => {
      this.errors = err;
    }))
  }

  public getProviderList(){
    return this.apiService.get('whatsapp/providerListing').pipe(map((data) => {
      return data.response;
    }, (err) => {
      this.errors = err;
    }))
  }

  public createSocialMediaChannel(credentials){
    return this.apiService.post('socialMedia/addChannel', {credentials}).pipe(map((data) => {
      return data;
    }, (err) => {
      this.errors = err;
    }))
  }
  

  // public getSocialChannel(req, res){
  //   return this.apiService.get(``)
  // }
  getSocial(customer) {
    var url =`socialMedial/socialChannelListing?customerId=${customer}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  } 

  filterSocialList(filters, id) {
    const url = `socialMedial/getSocialFilter` ;   
      return this.apiService.post(url,{ filters: filters , customer_id:id}).pipe(map(data => {
        return data.response;
      }));
  } 

}


