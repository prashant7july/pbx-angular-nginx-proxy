import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { TeleConsultationService } from './tele-consultation.service';

@Injectable()
export class UserListResolver implements Resolve<any> {
  constructor(private teleConsultationService: TeleConsultationService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let id = route.queryParams['tcpId']; 
    return  this.teleConsultationService.getTCPlanAssociateUsers(id);
  }
}