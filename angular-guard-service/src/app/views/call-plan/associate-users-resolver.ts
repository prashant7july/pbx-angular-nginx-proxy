import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { CallplanService } from './callplan.service';

@Injectable()
export class UserListResolver implements Resolve<any> {  
  constructor(private callplanService: CallplanService, private router: Router) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let mid = route.queryParams['mId'];    
    let planType = route.queryParams['planType']  == '1' ? 'BundlePlan' : route.queryParams['planType']  == '2' ? 'Roaming': route.queryParams['planType'] == '4' ? 'Tele Consultancy' :' Booster';              
  return forkJoin([          
      planType == 'BundlePlan' || planType == 'Roaming' || planType == 'Tele Consultancy'  ? this.callplanService.getUsersInMinutePlan(mid) : this.callplanService.getUsersInMinutePlanBooster(mid),      
      this.callplanService.getAssociatePackage(mid,route.queryParams['planType']) 
      .catch(error => {
          return Observable.throw(error);
      })
]).map(result => {  
  return {
      types: result[0],
      departments: result[1]
  };
});
  }  
}