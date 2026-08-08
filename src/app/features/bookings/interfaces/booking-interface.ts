import { IBookingItemRequest } from './booking-item-interface.';

export interface IBookingRequest {
  eventId: number;
  items: IBookingItemRequest[];
}
