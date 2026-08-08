import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IBookingRequest } from '../../features/bookings/interfaces/booking-interface';
import { URLs } from '../api/api-urls';

@Injectable({
  providedIn: 'root',
})
export class BookingsService {
  constructor(private http: HttpClient) {}

  //* APIs

  createBooking(bookingData: IBookingRequest) {
    return this.http.post(`${URLs.apiBaseUrl + URLs.createBooking}`, bookingData);
  }
}
