import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FeaturesService } from './feature.service';

@Injectable()
export class PackageListResolver implements Resolve<any> {
  constructor(private featuresService: FeaturesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let id = route.queryParams['fId']; 
    // this.featurePlanId = this.route.snapshot.queryParams.fId;
    return  this.featuresService.getFeaturePlanPackages(id);
  }
}