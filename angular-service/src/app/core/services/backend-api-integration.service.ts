import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BackendAPIIntegrationService {

    constructor(private apiService: ApiService) { }

    createAPIintegration(credentials) {
        return this.apiService.postBackEndAPI(`esl_api`, credentials)
            .pipe(map(
                data => {
                    return data;
                }, err => {
                   console.log(err);
                }
            ));
    }
}