import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  IBookingRequest,
  IBookingResponse,
} from '../../features/bookings/interfaces/booking-interface';
import { URLs } from '../api/api-urls';
import { IPagedResponse } from '../../shared/interfaces/pagination-interface';
import { IGetAllApiParams } from '../../shared/interfaces/apis-interface';
import { ITicketResponse } from '../../features/tickets/interfaces/tickets-interface';

const headers = new HttpHeaders({
  'No-Spinner': 'true',
});

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  constructor(private http: HttpClient) {}

  getTicketsByBookingId(bookingId: number) {
    return this.http.get<ITicketResponse[]>(
      `${URLs.apiBaseUrl + URLs.getAllTicketsByBookingId}`.replace(
        ':bookingId',
        bookingId.toString(),
      ),
      {
        headers,
      },
    );
  }

  getTicketById(ticketId: number) {
    return this.http.get<ITicketResponse>(
      `${URLs.apiBaseUrl + URLs.getTicketById}`.replace(':id', ticketId.toString()),
    );
  }
}
