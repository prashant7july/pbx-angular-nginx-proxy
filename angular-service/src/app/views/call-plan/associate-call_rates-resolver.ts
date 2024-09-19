import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { CallplanService } from './callplan.service';

@Injectable()
export class CallRatesResolver implements Resolve<any> {
  constructor(private callplanService: CallplanService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    // debugger
    let data = {};
    data['id'] = Number(route.queryParams['gId']);        
    return this.callplanService.getAssociateCallRates(data);

  }
}