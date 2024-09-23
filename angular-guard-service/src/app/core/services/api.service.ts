import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
// import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/interval';
import 'rxjs/Rx';

import { JwtService } from './jwt.service';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class ApiService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  backend_service_api_port =  1111;
  constructor(
    private http: HttpClient,
    private jwtService: JwtService
  ) { }

  private formatErrors(error: any) {
    return throwError(error.error);
  }

  getExternal(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${path}`, { params })
        .pipe(retry(3), catchError(this.formatErrors));
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.api_url}${path}`, { params })
      .pipe(retry(3), catchError(this.formatErrors));
  }

  getDataAsPerTimeSeconds(path: string, miliseconds:number, params: HttpParams = new HttpParams()): Observable<any> {
   let obsv =  Observable.interval(miliseconds).mergeMap(() => {
      return this.http.get(`${environment.api_url}${path}`, { params })
      .pipe(retry(3), catchError(this.formatErrors));
    })
    return obsv;
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  patch(path: string, body: Object = {}): Observable<any> {
    return this.http.patch(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post_paytm(path: string, body: Object = {}): Observable<any> { // as per paytm Payment gateway integration :- Nagender
    return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body),
       {
      responseType:'text',
    }
    ).pipe(catchError(this.formatErrors));
  }

  delete(path): Observable<any> {
    return this.http.delete(
      `${environment.api_url}${path}`
    ).pipe(catchError(this.formatErrors));
  }

  postFile(path: string, body): Observable<any> {
    return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  postBackEndAPI(path: string, body: Object = {}): Observable<any> {  // as per vivek backend api requirement :- Nagender
    // let base_url_changed_port = new URL(environment.backend_service_api_url);
    // console.log(base_url_changed_port);
    // base_url_changed_port.port = '1111';
    return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }
}
