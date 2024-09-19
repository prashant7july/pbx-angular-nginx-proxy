import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { circle } from 'src/app/core/models/circle.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  errors = "";

  getSavedRecord = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) { }

  addCircle(circleData) {
    console.log('circleData');
    return this.apiService.post(`config/addCircle`, circleData).pipe(map(data => {
      return data;
    }));
  }
  
  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  
  updateGridList(): void {
    this.getSavedRecord.next(true);
  }
  
  getcircleList(filterObj) {
    return this.apiService.post(`config/circleList`, filterObj).pipe(map(data => {
      return data.response;
    }));
  }
  getblockedIP(filterObj) {
    return this.apiService.post(`config/getblockedIP`, filterObj).pipe(map(data => {
      return data.response;
    }));
  }
  deleteCircle(data): Observable<circle> {
    return this.apiService.post('config/deleteCircle', { circle: data })
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
      ));
    }
    getCircleById(id): Observable<any> {
      const url = `config/getCircleById?id=${id}`;
      return this.apiService.get(url).pipe(map(data => {
        return data.response;
      }));
    }
    updateCircle(data): Observable<circle> {
      return this.apiService.post('config/updateCircle', { circle: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
        ));
      }
      
      getAllContactInCircle(circleID){
        return this.apiService.get(`config/getAllContactFromCircle?id=${circleID}`).pipe(map(data => {
          return data.response; 
        }));
      }
      
      //------------------------------------------- WHITE LIST API -----------------------------------------------
      
      createWhiteListIp(type, credentials): Observable<any> {
        return this.apiService.post('config/createWhiteIp', { ipDetail: credentials })
        .pipe(map(
          data => {
            return data;
          }, err => {
            this.errors = err;
          }
          ));
        }
        
        getWhiteListAPI(filterObj) { // its used for both (get listing and filter too)
          return this.apiService.post('config/getWhiteIp', filterObj).pipe(map(data => {
            return data.response;
          }));
        }
        
        
        deleteWhiteListAPI(id) {
          return this.apiService.delete(`config/deleteWhiteIP?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
            return data;
          }));
        }
        
        //----------------------------------  DIALOUT GROUP ----------------------------------------------------
        
        getDialOutGroupList(filterObj) {
          return this.apiService.post(`config/dialoutGroupList`, filterObj).pipe(map(data => {
            return data.response;
          }));
        }
        
        addDialOutGroup(Data) {
          return this.apiService.post(`config/addDialoutGroup`, Data).pipe(map(data => {
            return data;
          }));
        }
        
        deleteDialOutGroup(data): Observable<circle> {  //working on it.
          return this.apiService.post('config/deleteDialOutGroup', data)
          .pipe(map(
            data => {
              return data;
            }, err => {
              this.errors = err;
            }
            ));
          }
          
          getAllContactInDialOutGroup(DialOutGroupID){
            return this.apiService.get(`config/getAllContactFromDialoutGroup?id=${DialOutGroupID}`).pipe(map(data => {
              return data.response; 
            }));
          }
          
          getAssociatedUser(DialOutGroupID){
    return this.apiService.get(`config/getAssociatedUser?id=${DialOutGroupID}`).pipe(map(data => {
      return data.response; 
    }));
  }
  
  //----------------------------------  DIALOUT RULES ----------------------------------------------------
  
  getDialOutRuleList(filterObj) {
    return this.apiService.post(`config/dialoutRuleList`, filterObj).pipe(map(data => {
      return data.response;
    }));
  }

  addDialOutRules(DialOutData) {
    return this.apiService.post(`config/addDialoutRules`, DialOutData).pipe(map(data => {
      return data;
    }));
  }
  
  deleteDialOutRule(data): Observable<circle> {  //working on it.
    return this.apiService.post('config/deleteDialOutRule', data)
    .pipe(map(
      data => {
        return data;
      }, err => {
        this.errors = err;
      }
      ));
    }
    
    getActiveDID(){
      return this.apiService.get('did/getAllDID').pipe(map(data => {
        return data;
      },err => {
        this.errors = err;
      }))
    }
    
    public unbanIp(credentials) {    
      return this.apiService.postBackEndAPI(`esl_api`,  credentials )
      .pipe(map(
        data => {
          console.log(data,"----service-----");
          
          return data;
        }, err => {
          return err;
        }
        ));
      }

      addSmtp(credentials) {
        return this.apiService.post(`config/addSmtp`, credentials).pipe(map(data => {
          return data;
        }));
      }

      updateSmtp(credentials) {
        return this.apiService.post(`config/updateSmtp`, credentials).pipe(map(data => {
          return data;
        }));
      }

      getSmtpList(){
        return this.apiService.get('config/getSmtpList').pipe(map(data => {
          return data.response;
        },err => {
          this.errors = err;
        }))
      }

      public getSmtpListByFilter(filters) {
        return this.apiService.post('config/getSmtpListByFilter', { filters: filters })
          .pipe(map(data => {
            return data.response;
          }));
      }

      deleteSmtp(id) {
        return this.apiService.delete(`config/deleteSmtp?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
          return data;
        }));
      }
      getSmtpByList(id) {
        const url = `config/getSmtpByList?id=${id}`;
        return this.apiService.get(url).pipe(map(data => {
          return data.response;
        }));
      }
    }