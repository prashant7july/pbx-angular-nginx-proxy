import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeaturesCodeService {

  errors = "";
  constructor(private apiService: ApiService) { }

  getFeatureCode() {
    return this.apiService.get(`featureCode/viewFeatureCode`).pipe(map(data => {
      return data.response;
    }));
  }



  filterFeatureCode(filters) {

    return this.apiService.post('featureCode/getFeatureCodeByFilters', { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

}
