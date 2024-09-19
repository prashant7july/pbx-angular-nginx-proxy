import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagedData, Page, Ticket } from '../models';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class TicketServerResultService {

  constructor(private apiService: ApiService) { }
  /**
  * A method that mocks a paged server response
  * @param page The selected page
  * @returns {any} 
  */

  public viewTicket(cond) {
    return this.apiService.post(`ticket/viewTicket`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  public viewTicketCustomerwise(page: Page, userId): Observable<PagedData<Ticket>> {
    if (page) {
      return this.apiService.post('ticket/viewTicketCustomerwise', { userId: userId }).pipe(map(data => this.getPagedData(page, data.response)));
    } else {
      return this.apiService.post('ticket/viewTicketCustomerwise', { userId: userId }).pipe(map(data => {
        return data.response;
      }));
    }

  }
// Before reseller code
  public viewTicketPBX(limit_flag) {
    return this.apiService.get('ticket/viewTicketFORPBX?limit_flag='+limit_flag).pipe(map(data => {
      return data.response;
    }));
  }
  // After reseller code
  public viewResellerTicketPBX(limit_flag,role,user_id,) {
    return this.apiService.get(`ticket/viewResellerTicketPBX?limit_flag=${limit_flag}&&role=${role}&&user_id=${user_id}`).pipe(map(data => {
      return data.response;
    }));
  }

  public viewTicketPBXForSupport(limit_flag) {
    return this.apiService.get('ticket/viewTicketFORPBXForSupport?limit_flag='+limit_flag).pipe(map(data => {
      return data.response;
    }));
  }

  public viewTicketOC(limit_flag) {
    return this.apiService.get('ticket/viewTicketFOROC?limit_flag='+limit_flag).pipe(map(data => {
      return data.response;
    }));
  }

  public viewTicketProductandCustomerwise(userId, productId, limit_flag) {
    return this.apiService.post(`ticket/viewTicketProductandCustomerwise`, { userId: userId, productId: productId, limit_flag:limit_flag }).pipe(map(data => {
      return data.response;
    }));

  }

  public viewAccountManagerTicket(cond) {
    return this.apiService.post(`ticket/viewAccountManagerTicket`, cond).pipe(map(data => {
      return data.response;
    }));
  }
  /**
    * Ticket  into a PagedData object based on the selected Page
    * @param page The page data used to get the selected data from companyData
    * @returns {PagedData<Ticket>} An array of the selected data and page
    */

  private getPagedData(page: Page, ticket): PagedData<Ticket> {
    const pagedData = new PagedData<Ticket>();

    page.totalElements = ticket.length;
    page.totalPages = page.totalElements / page.size;
    const start = page.pageNumber * page.size;
    const end = Math.min((start + page.size), page.totalElements);
    for (let i = start; i < end; i++) {
      const jsonObj = ticket[i];
      const pack = new Ticket(jsonObj.created_at, jsonObj.product, jsonObj.ticket_number,
        jsonObj.ticket_type, jsonObj.assignedTo,
        jsonObj.message, jsonObj.status,
        jsonObj.id, jsonObj.customer_id, jsonObj.company_name);

      pagedData.data.push(pack);
    }
    pagedData.page = page;
    return pagedData;
  }

  filterTicket(filters,role,ResellerID) {
    return this.apiService.post('ticket/getTicketByFilters', { filters: filters ,role:role, ResellerID:ResellerID}).pipe(map(data => {
      return data.response;
    }));
  }

  filterCustomerTicket(filters) {
    return this.apiService.post('ticket/getCustomerWithProductTicketByFilters', { filters: filters }).pipe(map(data => {
      return data.response;
    }));
  }

  filterAccountManagerTicket(cond) {
    return this.apiService.post(`ticket/getAccountManagerTicketByFilters`, cond).pipe(map(data => {
      return data.response;
    }));
  }

  filterSupportTicket(cond) {
    return this.apiService.post(`ticket/getSupportTicketByFilters`, cond).pipe(map(data => {
      return data.response;
    }));
  }
}
