import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ContactListService } from './contact-list.service';

@Injectable()
export class AssociateContactResolver implements Resolve<any> {
  constructor(private contactListService: ContactListService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let gid = route.queryParams['gId']; 
    // this.featurePlanId = this.route.snapshot.queryParams.fId;
    return  this.contactListService.getAllContactInGroup(gid);
    // return  this.contactListService.getAssociatedUser(gid);
    
  }
}