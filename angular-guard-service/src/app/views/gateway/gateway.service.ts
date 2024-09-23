import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GatewayGroup } from "../../core/models";
import { Gateway } from "../../core/models/gateway.model";
import { ApiService } from "../../core/services/api.service";

@Injectable({
  providedIn: "root",
})
export class GatewayService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  constructor(private apiService: ApiService) {}

  getCodecInfo() {
    return this.apiService.get("codec/getCodecInfo").pipe(
      map((data) => {
        return data;
      })
    );
  }
  getSofiaProfileName() {
    return this.apiService.get('gateway/getSofiaProfileName')
      .pipe(map(data => {
        return data;
      }));
  }

  createGateway(type, credentials): Observable<Gateway> {
    return this.apiService
      .post("gateway/createGateway", { gateway: credentials })
      .pipe(
        map(
          (data) => {
            return data;
          },
          (err) => {
            this.errors = err;
          }
        )
      );
  }

  getGateway(cond) {
    return this.apiService.post(`gateway/viewGateway`, cond).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  viewGatewayById(id): Observable<Gateway> {
    const url = `gateway/viewGatewayById?id=${id}`;
    return this.apiService.get(url).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  updateGateway(type, credentials): Observable<Gateway> {
    return this.apiService
      .put("gateway/updateGateway", { gateway: credentials })
      .pipe(
        map(
          (data) => {
            return data;
          },
          (err) => {
            this.errors = err;
          }
        )
      );
  }
  deleteGateway(id) {
    return this.apiService
      .post(
        `gateway/deleteGateway?` +
          Object.keys(id)[0] +
          "=" +
          id[Object.keys(id)[0]]
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  updateGatewayStatus(type, id, action) {
    let status = "";
    if (action == "Active") {
      status = "0"; //if active then update status inactive
    } else {
      status = "1";
    }
    return this.apiService
      .put("gateway/updateGatewayStatus", { id: id, status: status })
      .pipe(
        map(
          (data) => {
            return data;
          },
          (err) => {
            this.errors = err;
          }
        )
      );
  }

  filterGateway(filters) {
    return this.apiService
      .post("gateway/getGatewayByFilters", { filters: filters })
      .pipe(
        map((data) => {
          return data.response;
        })
      );
  }

  getGatewayName() {
    return this.apiService.get("gateway/gatewayProvider").pipe(
      map((data) => {
        return data;
      })
    );
  }

  public getActiveGateway(credentials) {
    return this.apiService.postBackEndAPI(`esl_api`, credentials).pipe(
      map(
        (data) => {
          return data;
        },
        (err) => {
          return err;
        }
      )
    );
  }

  ////***************************GATEWAY GROUP*********************************************************/
  createGatewayGroup(type, credentials): Observable<GatewayGroup> {
    return this.apiService
      .post("gatewayGroup/createGatewayGroup", { gatewayGroup: credentials })
      .pipe(
        map(
          (data) => {
            return data;
          },
          (err) => {
            this.errors = err;
          }
        )
      );
  }

  filterGatewayGroup(filters) {
    return this.apiService
      .post("gatewayGroup/getGatewayGroupFilter", { filters: filters })
      .pipe(
        map((data) => {
          return data.response;
        })
      );
  }

  deleteGatewayGroup(id) {
    return this.apiService
      .post(
        `gatewayGroup/deleteGatewayGroup?` +
          Object.keys(id)[0] +
          "=" +
          id[Object.keys(id)[0]]
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  public viewGatewayGroup(cond) {
    return this.apiService.post(`gatewayGroup/viewGatewayGroup`, cond).pipe(
      map((data) => {
        return data.response;
      })
    );
  }
  public updateGatewayManipulation(add, id) {
    return this.apiService
      .post(`gateway/updateGatewayManipulation?id=${id}`, { data: add })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
  public viewgatewayAPI(id) {
    return this.apiService.get(`gateway/viewGatewayialog?id=${id}`).pipe(
      map((data) => {
        return data;
      })
    );
  }
  public getdata(id) {
    return this.apiService.post(`gateway/getdata`, { id: id }).pipe(
      map((data) => {
        return data.response;
      })
    );
  }
  public getIpDomain(id) {
    return this.apiService.get(`gateway/getIpDomain?id=${id}`).pipe(
      map((data) => {
        return data;
      })
    );
  }
}
