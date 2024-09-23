import { Injectable } from '@angular/core';
import { ApiService } from '../../core';
import { Ticket } from '../../core/models';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import {TicketType} from 'src/app/core/models/ticket_type.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }
  constructor(private apiService: ApiService) { }

  //----------------------create-ticket.service------start-------------------//
  postTicket(credentials): Observable<Ticket> {
    return this.apiService.post('ticket/createTicket', credentials)
      .pipe(map(data => { return data; }));
  }

  //----------------------create-ticket.service------end-------------------//

  //----------------------manage-ticket.service------start-------------------//

  viewTicketId(credentials): Observable<Ticket> {
    return this.apiService.post('ticket/viewTicketId', { ticket: credentials })
      .pipe(map(data => { return data.response; }));
  }

  ticketHistory(credentials): Observable<Ticket> {
    return this.apiService.post('ticket/ticketHistory', { ticket: credentials })
      .pipe(map(data => { return data.response; }));
  }

  getTicketHistory(ticketId) {
    return this.apiService.post('ticket/getTicketHistory', { ticketId: ticketId })
      .pipe(map(data => { return data.response; }));
  }
  //----------------------manage-ticket.service------end-------------------//
  updateTicketNewStatus(cond){
    return this.apiService.put('ticket/updateTicketNewStatus', cond).pipe(map(data => {
        return data;
      }));
  }
  getticketList(filterObj) {
    return this.apiService.post('ticket/ticketList', filterObj).pipe(map(data => {
      return data.response;
    }));
  }
  addTicket(ticketData){
    return this.apiService.post(`ticket/addTicket`, ticketData).pipe(map(data => {
      return data;
    }));
  }
  updateTicket(data): Observable<TicketType> {
    return this.apiService.post('ticket/updateTicket',{ ticketData: data })
      .pipe(map(
        data => {
          return data;
        }, err => {
          this.errors = err;
        }
      ));
}
}
