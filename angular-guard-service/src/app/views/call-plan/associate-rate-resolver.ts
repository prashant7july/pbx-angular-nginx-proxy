import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CallplanService } from './callplan.service';

@Injectable()
export class AssociateRatesResolver implements Resolve<any> {
  constructor(private callplanService: CallplanService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let gid = route.queryParams['gId']; 
    return  this.callplanService.getAllRatesInGroup(gid);
    
  }
}