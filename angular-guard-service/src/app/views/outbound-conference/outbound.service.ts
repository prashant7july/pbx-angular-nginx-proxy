import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class OutboundService {
  errors = "";
  error = ""
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }
  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  get displaySavedRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(
    private apiService: ApiService

  ) { }

  getQueuePrompt(customerId) {
    const url = `prompt/getQueuePrompt?customerId=${customerId}`;
    return this.apiService.get(url).pipe(map(data => {

      return data;
    }));
  }
  getOutboundParticipants(id) {
    return this.apiService.get(`outboundconf/getoutboundParticipants?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }
  viewOCGroupById(id) {
    var url = `outboundconf/viewOCGroupById`;
    return this.apiService.post(url, id).pipe(map(data => {
      // return data.response;
      return data.obj;

    }));
  }
  public getConferenceCount(broadcast_id) {
    const url = `outboundconfCount?broadcast_id=${broadcast_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data;
    }));
  }
  // deleteOC(id){
  //   return this.apiService.post(`outboundconf/deleteOC?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
  //     return data;
  //   }));   
  // }
  deleteOC(id) {
    return this.apiService.get(`outboundconf/deleteOC?id=${id}`)
  }
  getStatusOC(id) {
    var url = `outboundconf/getStatusOC?OC_id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response[0];
    }));
  }
  addoc(OCData) {
    return this.apiService.post('outboundconf/addOC', OCData)
      .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return err;
        }
      ));
  }
  updateOCGroup(credentials): Observable<any> {
    return this.apiService.patch('outboundconf/updateOCGroup', credentials)
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.error = err;
        }
      ));
  }
  partiallyUpdateOC(obj, id) {
    return this.apiService.patch(`outboundconf/partiallyUpdateOC?id=${id}`, obj)
      .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return err;
        }
      ));
  }
  partiallyUpdateOCStop(obj, id) {
    return this.apiService.patch(`outboundconf/partiallyUpdateOCStop?id=${id}`, obj)
      .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return err;
        }
      ));
  }
  public startManualSchecular(credentials) {
    return this.apiService.postBackEndAPI(`esl_api`, credentials)
      .pipe(map(
        data => {
          return data;
        }, err => {
          return err;
        }
      ));
  }
  getOC(filterObj, customerId) {
    const url = `outboundconf/viewOC?customer_id=${customerId}`;
    return this.apiService.post(url, filterObj).pipe(map(data => {
      return data;
    }));
  }
  getOCc(filterObj, customerId) {
    const url = `outboundconf/viewOC?customer_id=${customerId}`;
    return this.apiService.post(url, filterObj).pipe(map(data => {
      return data;
    }));
  }
  public getCustomerDID(user_id) {
    const url = `did/getCustomerDID?user_id=${user_id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  public isOCExist(bcName, customer_id, bcId) {
    const url = `outboundconf/isOCExist?bc_name=${bcName}&customer_id=${customer_id}&bc_id=${bcId}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getoutboundCDR(customer) {
    var url = `outboundconf/outboundcdr?customerId=${customer}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getstatusById(customer) {
    var url = `outboundconf/getstatusById?id=${customer}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getoutboundReport(customer) {
    var url = `outboundconf/outboundreport?customerId=${customer}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  // livecallforOC(customer) {
  //   var url =`outboundconf/livecallforOC?customerId=${customer}`;
  //   return this.apiService.get(url).pipe(map(data => {
  //     return data.response;
  //   }));
  // }
  outboundreportstatusNotlive(customer) {
    var url = `outboundconf/outboundreportstatusNotlive?customerId=${customer}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  getreportFilter(filters, id) {
    const url = `outboundconf/getreportFilter`;
    return this.apiService.post(url, { filters: filters, customer_id: id }).pipe(map(data => {
      return data.response;
    }));
  }
  getreportFilterTwo(filters, id) {
    const url = `outboundconf/getreportFilterTwo`;
    return this.apiService.post(url, { filters: filters, customer_id: id }).pipe(map(data => {
      return data.response;
    }));
  }
  filteroutboundcdrList(filters, id) {
    const url = `outboundconf/getoutboundcdrFilter`;
    return this.apiService.post(url, { filters: filters, customer_id: id }).pipe(map(data => {
      return data.response;
    }));
  }
  public getassocieateCDR(outboundId): Observable<any> {
    return this.apiService.get(`outboundconf/getoutboundCDR?outbound_id=${outboundId}`).pipe(map(data => {
      return data.response
    }));
  }
  livecallforOC(outboundId, id): Observable<any> {
    var url = `outboundconf/livecallforOC?outbound_id=${outboundId}&id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  public getoutboundCDRAssociate(outboundId): Observable<any> {
    return this.apiService.get(`outboundconf/getoutboundCDRAssociate?outbound_id=${outboundId}`).pipe(map(data => {
      return data.response
    }));
  }
  getPbxFeatures(customerId, productId) {
    return this.apiService.post('features/getPbxFeatures', { customerId: customerId, productId: productId })
      .pipe(map(data => {
        return data;
      }, err => {
        this.errors = err;
      }
      ));
  }
  getOCRecordingList(cond) {
    return this.apiService.post('outboundconf/getOCRecordingList', cond)
      .pipe(map(data => { return data.response }));
  }
  filterRecordingList(filters) {
    return this.apiService.post('outboundconf/filterRecordingList', { filters: filters })
      .pipe(map(data => {
        return data.response;
      }));
  }
  deleteRecording(id) {
    return this.apiService.post(`outboundconf/deleteRecording?` + Object.keys(id)[0] + '=' + id[Object.keys(id)[0]]).pipe(map(data => {
      return data;
    }));
  }

}
