import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private apiService: ApiService,) { }
  upload(param) {
    //console.log('param=',param);
    return this.apiService.post('/api/upload')
    .pipe(map(
      data => {
        return data;
      }
    ));
  }
}
