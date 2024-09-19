import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Injectable({
  providedIn: 'root'
})
export class ProductProfileService {

  constructor( private apiService: ApiService,
    private http:HttpClient,
    private sanitizer: DomSanitizer
    ) { }    
    
    setLogo(data){
      return this.apiService.post('pbx/setLogoProfile',data)
      .pipe(map(data => {
        return data;
      },err => {
        this.errors = err;
      }))
    }

    getLogo(data, type){
      return this.apiService.get(`pbx/getLogoPath?id=${data}&type=${type}`)
      .pipe(map(data => {        
        return data;
      }, err => {
        this.errors = err;
      }))
    }
  errors = "";
getSavedRecord = new BehaviorSubject<boolean>(false);

updateGridList(): void {
  this.getSavedRecord.next(true);
}

get displayAllRecord(): Observable<boolean> {
  return this.getSavedRecord.asObservable();
}
}
