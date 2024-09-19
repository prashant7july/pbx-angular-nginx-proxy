import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable ,BehaviorSubject} from 'rxjs';
import { EmailTemplate } from '../../core/models/email-template.model';
import { EmailCategory } from '../../core/models/email-category.model';
import { PagedData, Page } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(private apiService: ApiService) { }

  createEmailTemplate(type, credentials): Observable<EmailTemplate> {
    return this.apiService.post('emailTemplate/createEmailTemplate', { emailTemplate: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }
 
  public viewEmailTemplate(cond) {
    return this.apiService.post(`emailTemplate/viewEmailTemplate`, cond).pipe(map(data => { return data.response }));
  }

 
  deleteEmailTemplate(id) {
    return this.apiService.post(`emailTemplate/deleteEmailTemplate?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

  updateEmailTemplateStatus(type, id, action, email_category_id) {
    let status = '';
    if (action == 'Active') {
      status = '0';//if active then update status inactive
    } else {
      status = '1';
    }
    return this.apiService.put('emailTemplate/updateEmailTemplateStatus', { id: id, status: status, email_category_id: email_category_id })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  checkExistedCategory(categoryId, id): Observable<EmailTemplate> {
    const url = `emailTemplate/checkExistedCategory?categoryId=${categoryId}&id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }

  filterEmailtemplate(filters) {
      return this.apiService.post('emailTemplate/getEmailTemplateByFilters', { filters: filters }).pipe(map(data => {
        return data.response;
      }));
  }

  checkMultipleStatus(type, id, action, email_category_id) {
    let status = '';
    if (action == 'Active') {
      status = '1';//if active then update status inactive
    }
    return this.apiService.post('emailTemplate/checkMultipleStatus', { id: id, status: status, email_category_id: email_category_id })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  countEmailTemplate(email_category_id){
    const url = `emailTemplate/countEmailTemplate?email_category_id=${email_category_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }


  getProductEmailCategory(cond) {
    return this.apiService.get(`emailTemplate/getProductEmailCategory`, cond).pipe(map(data => { return data.response }));
  }


    // Category api
  createEmailCategory(type, credentials): Observable<EmailCategory> {
    return this.apiService.post('emailCategory/createEmailCategory', { emailCategory: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  public viewEmailCategory() {
    return this.apiService.get(`EmailCategory/viewEmailCategory`).pipe(map(data => {
      return data.response;
    }));
  } 

  getEmailCategory() {
    return this.apiService.get('getEmailCategory').pipe(map(data => {
      return data;
    }));
  }  

  filterEmailCategory(filters) {
    return this.apiService.post('emailCategory/getEmailCatgeoryByFilters', { filters: filters }).pipe(map(data => {
      return data.response;
    }));
}
}
