import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { CallplanService } from './callplan.service';

@Injectable()
export class AssociatePackageResolver implements Resolve<any> {
    constructor(private callplanService: CallplanService, private router: Router) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {        
        let call_plan_id = route.queryParams['id'];
        let flag = '1';
        return forkJoin([
            this.callplanService.getAssociatePackageDetail(call_plan_id,flag)
                .catch(error => {
                    return Observable.throw(error);
                })
        ]).map(result => {            
            return {                
                package: result[0]['response']                                
            };
        });
    }
}