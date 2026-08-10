import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  IBookingRequest,
  IBookingResponse,
} from '../../features/bookings/interfaces/booking-interface';
import { URLs } from '../api/api-urls';
import { IPagedResponse } from '../../shared/interfaces/pagination-interface';
import { IGetAllApiParams } from '../../shared/interfaces/apis-interface';

const headers = new HttpHeaders({
  'No-Spinner': 'true',
});

@Injectable({
  providedIn: 'root',
})
export class BookingsService {
  constructor(private http: HttpClient) {}

  createBooking(bookingData: IBookingRequest) {
    return this.http.post(`${URLs.apiBaseUrl + URLs.createBooking}`, bookingData);
  }

  getBookingById(id: number) {
    return this.http.get<IBookingResponse>(
      `${URLs.apiBaseUrl + URLs.getBookingById}`.replace(':id', id.toString()),
      {
        headers,
      },
    );
  }

  getAllBookingsPaginated(params: IGetAllApiParams) {
    const httpParams = new HttpParams().set('page', params.pageNumber).set('size', params.pageSize);
    return this.http.get<IPagedResponse<IBookingResponse>>(
      `${URLs.apiBaseUrl + URLs.getAllBookings}`,
      {
        params: httpParams,
      },
    );
  }

  cancelBooking(bookingId: number) {
    return this.http.patch(
      `${URLs.apiBaseUrl + URLs.cancelBookingById}`.replace(':id', bookingId.toString()),
      {},
    );
  }
}
