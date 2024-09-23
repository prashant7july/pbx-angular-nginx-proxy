import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { SmsService } from './sms.service';
import { CallplanService } from '../call-plan/callplan.service';
import { ViewProvidersComponent } from './view-providers/view-providers.component';
import { forkJoin, Observable } from 'rxjs';
@Injectable()
export class UserListResolver implements Resolve<any> {
  plan_type = null;
  smsId = null
  constructor(private SmsService: SmsService, private router: Router, private callplanService: CallplanService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    this.smsId = route.queryParams['smsId'] !== "undefined" ? route.queryParams['smsId'] : null;             
    return forkJoin([      
      this.SmsService.getSMSPlanAssociateUsers(this.smsId),
      this.callplanService.getAssociatePackage(this.smsId,this.plan_type),
      this.SmsService.getProviderAssociateSms(route.queryParams)
      .catch(error => {
          return Observable.throw(error);
      })
]).map(result => {         
  return {
      types: result[0]['response'],
      departments: result[1],
      smsDetail: result[2]['data']
  };
});
  }
}