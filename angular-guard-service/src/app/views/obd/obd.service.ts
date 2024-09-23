import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GatewayGroup } from "../../core/models";
import { Gateway } from "../../core/models/gateway.model";
import { ApiService } from "../../core/services/api.service";

@Injectable({
  providedIn: "root",
})
export class OBDService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  public displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) {}

  getIVRForObd(id) {
    return this.apiService.get(`obd/getIvr?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }
  viewSMSActive(id) {
    return this.apiService.get(`obd/viewSMSActive?id=${id}`).pipe(map(data => {
      return data.response;
    }));
  }

  getObdByCustomer(id) {
    return this.apiService.get(`obd/getObdByCustomer?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getObdCDRByFilter(credentials) {
    return this.apiService.post(`obd/getObdCDRByFilter`,{credentials}).pipe(
      map((data) => {
        return data.response;
      })
    );
  }
  getObdApiCDRByFilter(credentials) {
    return this.apiService.post(`obd/getObdApiCDRByFilter`,{credentials}).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getobdCDR(id) {
    return this.apiService.get(`obd/getobdCDR?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }
  getobdApiCDR(id) {
    return this.apiService.get(`obd/getobdApiCDR?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getObdByFilter(credentials) {
    return this.apiService.post("obd/getObdByFilter",{credentials}).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getOdbById(id) {
    return this.apiService.get(`obd/getOdbById?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  createObd(credentials){
    return this.apiService
      .post("obd/createObd",{credentials})
      .pipe(
        map(
          (data) => {
            return data.status;
          },
          (err) => {
            this.errors = err;
          }
        )
      );
  }

  deleteObd(id){
    return this.apiService.get(`obd/deleteObd?id=${id}`)
  }

  updateObd(credentials){
    return this.apiService
      .post("obd/updateObd",{credentials})
      .pipe(
        map(
          (data) => {
            
            return data.status;
          },
          (err) => {
            
            this.errors = err;
          }
        )
      );
  }

  partiallyUpdateOC(obj,id) {
    return this.apiService.patch(`obd/partiallyUpdateOC?id=${id}`, obj)
      .pipe(map(
        data => {
          return data;
        }, err => {
          console.log(err);
          return err;
        }
      ));
  }

  partiallyUpdateOCStop(obj,id) {
    return this.apiService.patch(`obd/partiallyUpdateOCStop?id=${id}`, obj)
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
    return this.apiService.postBackEndAPI(`esl_api`,  credentials )
      .pipe(map(
        data => {
          return data;
        }, err => {
          return err;
        }
      ));
  }

  getObdParticipants(id){
    return this.apiService.get(`obd/getObdParticipants?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getWhatsappTemp(id){
    return this.apiService.get(`obd/getWhatsappTemp?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getOBDreportFilter(filters, id) {
    const url = `obd/getOBDreportFilter` ;
      return this.apiService.post(url,{ filters: filters , customer_id:id}).pipe(map(data => {
        return data.response;
      }));
  }  

  getOBDReport(id) {
    var url =`obd/getOBDreport?customerId=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }
  obdreportstatusNotlive(id) {
    var url =`obd/obdreportstatusNotlive?customerId=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getStatusOBD(id) {
    var url =`obd/getStatusOBD?obd_id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response[0];
    }));
  }

  getOBDRecording(id) {
    var url =`obd/getOBDRecording?obd_id=${id}`;
    return this.apiService.get(url).pipe(map(data => {
      return data.response;
    }));
  }

  getOBDRecordingByFilter(filters) {
    return this.apiService.post('obd/getOBDRecordingByFilter', { filters: filters })
    .pipe(map(data => {
      return data.response;
    }));
  }

  deleteOBDRecording(cond){
    return this.apiService.post('obd/deleteOBDRecording', cond)
    .pipe(map(data => { return data.response }));
  }



public getOBDassocieateCDR(obdId): Observable<any> {
    return this.apiService.get(`obd/getOBDassocieateCDR?obd_id=${obdId}`).pipe(map(data => {
        return data.response
    }));
}

livecallforOBD(outboundId,id): Observable<any> {
  var url =`obd/livecallforOBD?outbound_id=${outboundId}&id=${id}`;
  return this.apiService.get(url).pipe(map(data => {
    return data.response;
  }));
}

public postApiIntegration(credentials) {
  return this.apiService.post('call_connection/createApiIntegration',credentials).pipe(map(data => {    
    return data
  },(err: string) => this.errors = err ));
}

public getApiIntegration(customer_id){
  return this.apiService.get(`call-connection/getApiIntegration?customer_id=${customer_id}`).pipe(map(data => {    
    return data.response;
  }, (err: string) => this.errors = err));
}

public getApiIntegrationById(customer_id, id){
  return this.apiService.get(`call-connection/getApiIntegrationById?customer_id=${customer_id}&id=${id}`).pipe(map(data => {    
    return {data: data.response && data.response[0], mapping: data.modifyArray};
  }))
}

public deleteApiIntegration(customer_id, id){
  return this.apiService.delete(`call-connection/deleteIntegration?customer_id=${customer_id}&id=${id}`).pipe(map(data => {
    return data;
  }, (err: string) => this.errors = err));
}

public getIntegrationByFilter(customer_id, credentials){
  return this.apiService.post(`call-connection/getApiIntegrationByFilter?customer_id=${customer_id}`, credentials).pipe(map(data => {
    return data.response;
  }))
}

public setDIDInObd(credential){
  return this.apiService.patch(`obd/insetDidInObd`,credential).pipe(map(data => {
    return data;
  }))
}

}


