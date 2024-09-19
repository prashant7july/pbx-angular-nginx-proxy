import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable ,BehaviorSubject } from 'rxjs';
import { PagedData, Page ,Holiday,TimeGroup} from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ImGroupService {
  viewTimeGroup(arg0: { id: any; name: any; customer_id: number; extension_id: any; role: string; }) {
    throw new Error('Method not implemented.');
  }
  createTimeGroup(arg0: string, credentials: any) {
    throw new Error('Method not implemented.');
  }

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get setPage(): Observable<boolean> {
    return this.getSavedRecord.asObservable();

    
  }

  constructor(private apiService: ApiService) { }


  viewImGroup(extension_id){
    console.log(extension_id);
    
    return this.apiService.get('imGroup/viewImGroup',extension_id).pipe(map(data =>{
      return data;
    }, err => {
      this.errors =err;
    }));
  }

  deleteImGroup(id) {        
    const url = `imGroup/deleteImGroup`;
    return this.apiService.post('imGroup/deleteImGroup', { id: id }).pipe(map(data => {
      return data;
    },err =>{
      this.errors = err;
    }));
  }

  getGroupById(id){
    const url = `imGroup/getGroupById?id=${id}`
    return this.apiService.get(url).pipe(map(data =>{
      return data;
    }, err => {
      this.errors =err;
    }));

  }

  createImGroup(data) {
    let url;
    if(data.id == null ){
     url = 'imGroup/createImGroup';
    }else{
      url = 'imGroup/updateImGroup';
    }
    return this.apiService.post(url,data).pipe(map(data => {
      return data;
    },err => {
      this.errors = err;
    }))
  }

  filterImGroup(filters,id){    
    return this.apiService.post('imGroup/filterImGroup', { filters: filters ,id:id})
    .pipe(map(data => { return data }));
  }

}
