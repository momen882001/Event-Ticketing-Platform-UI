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

export interface IEventUpdateRequest {
  venueId: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  seatCategories: ISeatCategoryUpdateRequest[];
}

export interface ISeatCategoryUpdateRequest {
  id: number | null;
  name: string;
  price: number;
  totalSeats: number;
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
  imageUrl: string;
}

export interface IEventFormResult {
  data: IEventRequest;
  image: File | null;
}

export interface IEventUpdateFormResult {
  data: IEventUpdateRequest;
  image: File | null;
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
