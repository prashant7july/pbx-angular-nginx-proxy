import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SupportUserService } from './support-user-service';

@Injectable()
export class AssociateUserResolver implements Resolve<any> {
  constructor(private supportUserService: SupportUserService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let gid = route.queryParams['gId']; 
    // this.featurePlanId = this.route.snapshot.queryParams.fId;
    return  this.supportUserService.getAllUserInGroup(gid);
    
  }
}