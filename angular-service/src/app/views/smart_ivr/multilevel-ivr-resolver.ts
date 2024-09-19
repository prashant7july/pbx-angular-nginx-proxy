import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { IVRService } from './ivr.service';

@Injectable()
export class MultilevelIVRResolver implements Resolve<any> {
  constructor(private ivrService: IVRService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let ivrId = route.queryParams['ivrId']; 
    let isParentIVR = route.queryParams['multilevel_ivr'] == 1 ? false : true; 
    return  this.ivrService.getAllAssociatedIVR(ivrId,isParentIVR);
    
  }
}