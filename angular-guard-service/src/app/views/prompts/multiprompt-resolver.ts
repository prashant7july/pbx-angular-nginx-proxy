import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PromptsService } from './prompts.service';

@Injectable()
export class MultiPromptResolver implements Resolve<any> {
  constructor(private PromptsService: PromptsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let cust_id = localStorage.getItem('id');
    let id = route.queryParams['promptId']; 
    let prompt_type = route.queryParams['prompt_type'];
    // this.featurePlanId = this.route.snapshot.queryParams.fId;
    return  this.PromptsService.getmappedPackages(id,prompt_type,cust_id);
  }
}