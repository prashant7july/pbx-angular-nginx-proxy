import { Injectable } from '@angular/core';
import { Extension } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FavoriteExtensionService {

  errors = '';
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displaySavedRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(
    private apiService: ApiService
  ) { }

  public getExtension(user_id) {
    const url = `extension/getAllExtension?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  public makeFavoriteContact(data,) {
    return this.apiService.post('extension/makeFavorite', data).pipe(map(data => {
      return data.response;
    }));
  }
}
