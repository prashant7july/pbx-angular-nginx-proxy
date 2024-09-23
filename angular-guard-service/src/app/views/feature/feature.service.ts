import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { RatePlan  } from 'src/app/core/models/RatePlan.model';

@Injectable({
  providedIn: 'root'
})
export class FeaturesService {

  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  getDefaultGlobalFeatureRate(filterObj) {
    return this.apiService.post(`feature/viewGlobalRate`, filterObj).pipe(map(data => {
      return data.response;
    }));
  }

  getGlobalFeatureRate(filterObj) {
    return this.apiService.post(`feature/viewGlobalRateMapping`, filterObj).pipe(map(data => {
      return data.response;
    }));
  }

  getrateById(id): Observable<any> {
    const url = `feature/getglobalRateById?id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public viewGlobalRate(cond) {
    return this.apiService.post(`callPlan/viewCallPlan`,cond).pipe(map(data =>{
      return data.response}));
  }

  updateGlobalRate(data): Observable<RatePlan> {
    return this.apiService.post('feature/updateGlobalRate', { globalRate: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  upgradeFeaturePlanRate(data): Observable<RatePlan> {
    return this.apiService.post('feature/upgradeFeatureRatePlan', { upgradeRate: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  deleteGlobalRate(data): Observable<RatePlan> {
    return this.apiService.post('feature/deleteGlobalRate', { globalRate: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  // Feature Rate Plan

  addFeaturePlan(PlanData) {
    return this.apiService.post('feature/addFeaturePlan', PlanData)
    .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return  err;
        }
      ));

  }

  getFeaturePlan(filterObj) {
    return this.apiService.post(`feature/viewFeaturePlan`, filterObj).pipe(map(data => {
      return data.response;
    }));
  }

  updateFeaturePlan(data): Observable<RatePlan> {
    return this.apiService.post('feature/updateFeaturePlan', { featurePlan: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  deleteFeaturePlan(data): Observable<RatePlan> {
    return this.apiService.post('feature/deleteFeaturePlan', { featurePlan: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }

  getFeaturePlanPackages(feature_plan_id){
    // const url1 = 'getPackageById1?packageId=' + packageId + '&productId=' + productId;
     const url = `feature/getfeaturePackages?feature_plan_id=${feature_plan_id}`;
     return this.apiService.get(url).pipe(map(data => {
       return data;
     }));
   }


};
