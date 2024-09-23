import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable()
export class DialoutRuleContactResolver implements Resolve<any> {
  constructor(private configService: ConfigService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let gid = route.queryParams['gId']; 
    // console.log(gid,'--------------');
    
     return  this.configService.getAllContactInDialOutGroup(gid);
    
  }
}