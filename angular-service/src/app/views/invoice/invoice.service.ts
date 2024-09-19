import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';  // import for table refresh

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  errors = "";
  //// for table refresh from here ---------------------------------
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  public displaySavedRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  ////////////////// till here ---------------------------------

  constructor(
    private apiService: ApiService
  ) { }


  // getInvoiceByFilters(filters){ // before reseller
  //   return this.apiService.post('invoice/getInvoiceByFilters', { filters: filters })
  // .pipe(map(data => {
  //   return data.response;
  // }));
  // }
  getInvoiceByFilters(filters,role,ResellerID){ //after reseller
    return this.apiService.post('invoice/getInvoiceByFilters', { filters: filters,role,ResellerID })
  .pipe(map(data => {
    return data.response;
  }));

  }

  getInvoicesOfManagerCustomerByFilters(filters){
      return this.apiService.post('invoice/getInvoicesOfManagerCustomerByFilters', { filters: filters })
    .pipe(map(data => {
      return data.response;
    }));
  
    }
    
    getAllInvoices() {
    const url = `invoice/getAllInvoices`;
    return this.apiService.get(url)
    .pipe(map(data => {
      return data.response;
    }));
  }

  getAllInvoicesOfCustomer(id,role) {
    const url = `invoice/getAllInvoicesOfCustomer?id=${id}&&role=${role}`;
    return this.apiService.get(url)
    .pipe(map(data => {
      return data.response;
    }));
  }

  getAllInvoicesOfCustomerOfYear(id) {
    const url = `invoice/getAllInvoicesOfCustomerOfYear?id=${id}`;
    return this.apiService.get(url)
    .pipe(map(data => {
      return data.response;
    }));
  }
    
  getInvoicesById(id) {
    const url = `invoice/getAllInvoices?id=${id}`;
    return this.apiService.get(url)
    .pipe(map(data => {
      return data.response;
    }));
  }

  getInvoicesDetail(id){
    const url = `invoice/getInvoiceDetail?id=${id}`;
    return this.apiService.get(url)
    .pipe(map(data => {
      return data.response;
    }));
  }

  getInvoiceCdrDetail(customer_id){
    const url = `invoice/getInvoiceCdrDetail?id=${customer_id}`;
    return this.apiService.get(url)
    .pipe(map(data => {
      return data.response;
    }));
  }
  getAllInvoicesOfManagerCustomer(id,c_id) {
    const url = `invoice/getAllInvoicesOfManagerCustomer?id=${id}&c_id=${c_id}`;
    return this.apiService.get(url)
    .pipe(map(data => {
      return data.response;
    }));
  }
  saveAdminPaymentLog(credentials){
        return this.apiService.post('invoice/saveAdminPaymentLog', { credentials: credentials })
      .pipe(map(data => {
        return data;
      }));
    
    }

    getPreviousLogPayments(invoice_number){
      const url = `invoice/getPreviousLogPayments?id=${invoice_number}`;
      return this.apiService.get(url)
      .pipe(map(data => {
        return data.response[0];
      }));
    }
  }
