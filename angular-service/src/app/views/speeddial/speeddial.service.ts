import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';
import { Speeddial } from '../../core/models/speeddial.model';
@Injectable({
  providedIn: 'root'
})
export class SpeeddialService {
  errors = "";
  constructor(private apiService: ApiService) { }

  createSpeedDial(credentials): Observable<Speeddial> {
    return this.apiService.post('speeddial/createSpeedDial', credentials)
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
  }


  viewSpeedDialById(cond) {
    return this.apiService.post(`speeddial/viewSpeedDialById`, cond).pipe(map(data => {
      return data.response;
    }));
  }
}
