import { BookingStatusEnum } from '../../../shared/enums/BookingStatusEnum';
import { IEventResponse } from '../../calendar/interfaces/event-interface';
import { IBookingItemRequest } from './booking-item-interface';
import { IBookingItemResponse } from './booking-item-interface';
import { IPaymentResponse } from './booking-payment-interface';

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
  event: IEventResponse;
  payment: IPaymentResponse;
}
