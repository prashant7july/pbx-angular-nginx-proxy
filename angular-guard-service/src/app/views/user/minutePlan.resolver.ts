import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
// import { CallplanService } from './callplan.service';

@Injectable()
export class MinutePlanResolver implements Resolve<any> {
  constructor( private userService:UserService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let pid = route.queryParams['custId']; 
    return  this.userService.getCustomerAssociateMinutePlan(pid);
  }
}