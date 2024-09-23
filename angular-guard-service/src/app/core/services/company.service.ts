import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private apiService: ApiService) { }

  getCompanyInfo(){
    return this.apiService.get('company/getCompanyInfo')
      .pipe(map(data => {
        return data;
      }));
  }
}
