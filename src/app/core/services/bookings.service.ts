import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  IBookingRequest,
  IBookingResponse,
} from '../../features/bookings/interfaces/booking-interface';
import { URLs } from '../api/api-urls';
import { IPagedResponse } from '../../shared/interfaces/pagination-interface';
import { IGetAllApiParams } from '../../shared/interfaces/apis-interface';

@Injectable({
  providedIn: 'root',
})
export class BookingsService {
  constructor(private http: HttpClient) {}

  createBooking(bookingData: IBookingRequest) {
    return this.http.post(`${URLs.apiBaseUrl + URLs.createBooking}`, bookingData);
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
}
