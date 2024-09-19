import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable ,BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord( ): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) { }

  getRecordingList(cond){
    return this.apiService.post('recording/getRecordingList', cond)
    .pipe(map(data => { return data.response }));
  }

  deleteRecording(cond){
    return this.apiService.post('recording/deleteRecording', cond)
    .pipe(map(data => { return data.response }));
  }

  filterRecordingList(filters) {
    return this.apiService.post('recording/filterRecordingList', { filters: filters })
    .pipe(map(data => {
      return data;
    }));
  }

  // getTeleConsultRecording(cond){
  //   return this.apiService.post('recording/getTeleConsultationRecording', cond)
  //   .pipe(map(data => { return data.response }));
  // }
}
