import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';  // import for table refresh
import { PromptDetail } from '../../core/models';
import { PagedData, Page } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class PromptsService {
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

  getmappedPackages(promptId,prompt_type,id){
    // const url1 = 'getPackageById1?packageId=' + packageId + '&productId=' + productId;
     const url = `prompt/getmappedPackages?promptId=${promptId}&prompt_type=${prompt_type}&id=${id}`;
     return this.apiService.get(url).pipe(map(data => {
       return data;
     }));
   }

  public viewPrompt(customer_id){
    return this.apiService.post('prompt/viewPrompt', { user_id: customer_id })
    .pipe(map(data => { return data.response }));
  }

  deletePrompt(id, cust_id) {
    const url = `prompt/deletePrompt`;
    return this.apiService.put(url, { id: id, customer_id: cust_id }).pipe(map(data => {
      return data;
    }));
  }

  filterPrompt(filters) {
    return this.apiService.post('prompt/getPromptByFilters', { filters: filters })
      .pipe(map(data => { return data.response }));
  }

  getPromptById(id) {
    const url = `prompt/getPromptById?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  updatePrompts(credentials) {
    return this.apiService.post('prompt/updatePrompt', { prompt: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getMOHPrompt(customerId) {
    const url = `prompt/getMOHPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getConferencePrompt(customerId) {
    const url = `prompt/getConferencePrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getQueuePrompt(customerId) {
    const url = `prompt/getQueuePrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getIVRPrompt(customerId) {
    const url = `prompt/getIVRPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  getIVRPromptWelcome(customerId) {
    const url = `prompt/getIVRPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  getIVRPromptSelection(customerId) {
    const url = `prompt/getIVRPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  getIVRPromptTime(customerId) {
    const url = `prompt/getIVRPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getTimeGroupPrompt(customerId) {
    const url = `prompt/getTimeGroupPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getTimeGroupPromptForExtn(customerId) {
    const url = `prompt/getTimeGroupPromptForExtn?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }


  getTeleConsultationPrompt(customerId) {
    const url = `prompt/getTCPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getBroadcastPrompt(customerId) {
    const url = `prompt/getBroadcastPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  getCallGroupPrompt(customerId) {
    const url = `prompt/getCallGroupPrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  public getPromptAssociateOrNot(prompt_id, prompt_type){
    const url = `prompt/promptAssociate?prompt_id=${prompt_id}&prompt_type=${prompt_type}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  public getGeneralPrompt(customerId){
    const url =`prompt/getGeneralPrompt?customerId=${customerId}`
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }))
  }

}
