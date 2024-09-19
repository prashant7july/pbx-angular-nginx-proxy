import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor( private apiService: ApiService,) { }

  sendEmail(param) {
    //console.log('param=',param);
    return this.apiService.post('sendmail', {param })
    .pipe(map(
      data => {
        return data;
      }
    ));
  }

  emailExpireToken(email) {
    return this.apiService.get('email/emailExpireToken?email='+email)
      .pipe(map(data => {
        return data;
      }));
  }  
 
}
