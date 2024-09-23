import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Extension } from '../../core/models/extension.model';

@Injectable({
  providedIn: 'root'
})
export class ExtensionSettingsService {  
  errors = "";
  constructor(private apiService: ApiService) { }

  getExtensionSetting(cond){
    return this.apiService.post(`extension/getExtensionSetting`,cond).pipe(map(data => {
      return data.response;
    }));
  }

  updateExtensionSettings(type, credentials): Observable<Extension>{  
    return this.apiService.put('extension/updateExtensionSettings', { extension: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
    ));
  }

  updateExtensionFindMeFollowMeSettings(type, credentials): Observable<Extension>{  
    return this.apiService.put('extension/updateExtension_fmfm_Settings', { extension: credentials })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
    ));
  }

  getExtensionFMFMSetting(cond){
    return this.apiService.post(`extension/getExtension_FMFM_Setting`,cond).pipe(map(data => {
      return data.response;
    }));
  }
}
