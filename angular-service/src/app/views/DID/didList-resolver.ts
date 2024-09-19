import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {DidService} from './did.service';

@Injectable()
export class DidListResolver implements Resolve<any> {
  constructor(private router: Router, private didService: DidService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    let id = Number(route.queryParams['did_id']);  
    return this.didService.getAssociateDIDWithVMN(id);
  }
}