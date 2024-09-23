import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services/api.service";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class ResellerService {
  constructor(private apiService: ApiService, private http: HttpClient) {}

  getReseller(id) {
    return this.apiService.get(`reseller/user_list?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }
  getResellerID(id) {
    return this.apiService.get(`reseller/getResellerID?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }
  getResellerRupeeID(id) {
    return this.apiService.get(`reseller/getResellerRupeeID?id=${id}`).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  deleteInternalUser(cond) {
    var route = "";
    if (cond.action === "delete") route = "deleteCustomer";
    else if (cond.action === "inactive") route = "inactiveCustomer";
    else route = "activeCustomer";

    return this.apiService.put("user/" + route, cond).pipe(
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

  filterReseller(data, product_id) {
    return this.apiService
      .post("reseller/filterReseller", { data: data, product_id })
      .pipe(
        map((data) => {
          return data.response;
        })
      );
  }

  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
}
