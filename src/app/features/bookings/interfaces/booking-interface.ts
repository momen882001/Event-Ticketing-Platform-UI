import { IBookingItemRequest } from './booking-item-interface';
import {IBookingItemResponse} from './booking-item-interface';
import {IPaymentResponse} from './Booking-payment-interface';

export interface IBookingRequest {
  eventId: number;
  items: IBookingItemRequest[];
}
export interface IBookingResponse {
  id: number;
  userId: number;
  eventId: number;
  items: IBookingItemResponse[];
  status: BookingStatusEnum;
  createdAt: string;
  updatedAt: string;
  payment: IPaymentResponse;
}



