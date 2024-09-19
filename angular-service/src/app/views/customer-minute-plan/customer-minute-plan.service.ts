import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { PagedData, Page, CallPlan, CallPlanRate } from '../../core/models';
import { CallRateGroup } from 'src/app/core/models/call_rate_group.model';
import { BundlePlan } from 'src/app/core/models/bundle.model';

@Injectable({
    providedIn: 'root'
})
export class MinutePlanService {

    errors = "";

    getSavedRecord = new BehaviorSubject<boolean>(false);

    updateGridList(): void {
        this.getSavedRecord.next(true);
    }

    get displayAllRecord(): Observable<boolean> {
        return this.getSavedRecord.asObservable();
    }

    constructor(private apiService: ApiService) { }

    //----------------------------------------Customer bundle plan services -------------------------------------------//

    public viewCustomerBundlePlan(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewCustomerBundlePlan`, cond).pipe(map(data => {
            return data.response
        }));
    }

    public viewCustomerBundlePlanAllRates(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewCustomerBundlePlanAllRates`, cond).pipe(map(data => {
            return data.response
        }));
    }

    public getCustomerAccordingByBoosterType(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewCustomerAccordingByType`, cond).pipe(map(data => {
            return data.response
        }));
    }

    //----------------------------------------Customer ROAMING plan services -------------------------------------------//

    public viewCustomerRoamingPlan(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewCustomerRoamingPlan`, cond).pipe(map(data => {
            return data.response
        }));
    }

    public viewCustomerDidBundlePlan(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewCustomerDidBundlePlan`, cond).pipe(map(data => {
            return data.response
        }));
    }

    //----------------------------------------Customer BOOSTER plan services -------------------------------------------//

    public viewCustomerBoosterPlan(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewCustomerBoosterPlan`, cond).pipe(map(data => {
            return data.response
        }));
    }

    public filterCustomerBoosterPlan(filters) {   
        return this.apiService.post('minutePlan/getCustomerBoosterPlanByFilters', { filters: filters })
          .pipe(map(data => { return data.response }));
      }

    public viewBoosterPlanByType(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewBoosterPlanByType`, cond).pipe(map(data => {
            return data.response
        }));
    }


    public purchaseBoosterPlan(cond): Observable<any> {
        return this.apiService.post(`minutePlan/purchaseBoosterPlan`, cond).pipe(map(data => {
            return data.response
        }));
    }

    public getMinutePlanUser(): Observable<any> {
        return this.apiService.get(`user/getMinutePlanUser`).pipe(map(data => {
            return data.response
        }));
    }

    public getBoosterAssociateRates(boosterId): Observable<any> {
        return this.apiService.get(`minutePlan/getBoosterAssociateRates?booster_id=${boosterId}`).pipe(map(data => {
            return data.response
        }));
    }

    //----------------------------------------Extension call minute plan services -------------------------------------------//

    public viewExtensionCallMinute(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewExtensionCallMinutes`, cond).pipe(map(data => {
            return data.response
        }));
    }

    
    //----------------------------------------Booster plan history -------------------------------------------//

    public viewBoosterPlanHistory(role,ResellerID): Observable<any> {
        return this.apiService.get(`minutePlan/viewBoosterHistory?role=${role}&&ResellerID=${ResellerID}`).pipe(map(data => {
            return data.response
        }));
    }

    public getBoosterPlanHistoryByFilters(filters,role,ResellerID) {
        return this.apiService.post('minutePlan/getBoosterPlanHistoryByFilters', { filters: filters,role,ResellerID })
          .pipe(map(data => {
            return data.response;
          }));
      }

    public viewBundleAndRoamingPlanHistory(data,role,ResellerID): Observable<any> {
        return this.apiService.post(`minutePlan/viewBundleAndRoamingHistory`,{filters: data,role,ResellerID}).pipe(map(data => {
            return data.response
        }));
    }

    public viewBundleAndRoamingHistoryByFilters(filters) {
        return this.apiService.post(`minutePlan/viewBundleAndRoamingHistoryByFilters`,{ filters: filters }).pipe(map(data => {
            return data.response
        }));
    }

    public getBundleAndRoamingAuditLogsByPlan(params) {
        return this.apiService.get(`minutePlan/getBundleAndRoamingAuditLogsByPlan`,params).pipe(map(data => {
            return data.response
        }));
    }
        //---------------------------------------- Customer TC mIN Assign  -------------------------------------------//

    public viewCustomerTeleconsultPlan(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewCustomerTeleconsultancyPlan`, cond).pipe(map(data => {
            return data.response
        }));
    }

    public viewCustomerOutgoingBundlePlan(cond): Observable<any> {
        return this.apiService.post(`minutePlan/viewCustomerOutgoingBundlePlan`, cond).pipe(map(data => {
            return data.response
        }));
    }
} 