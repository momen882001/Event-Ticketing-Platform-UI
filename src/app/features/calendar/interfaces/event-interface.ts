import { EventStatusEnum } from '../../../shared/enums/EventStatusEnum';
import { IVenueResponse } from '../../venues/interfaces/venue-interface';

export interface IEventRequest {
  venueId: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  seatCategories: ISeatCategoryRequest[];
}

export interface IEventResponse {
  id: number;
  organizerId: number;
  venue: IVenueResponse;
  categoryId: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  status: EventStatusEnum;
  createdAt: string;
  updatedAt: string;
  seatCategories: ISeatCategoryResponse[];
}

export interface ISeatCategoryRequest {
  name: string;
  price: number;
  totalSeats: number;
}

export interface ISeatCategoryResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  name: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
}
