import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { URLs } from '../api/api-urls';
import { ICalendarFilter } from '../../features/calendar/interfaces/calendar-interface';
import { IEventRequest, IEventResponse } from '../../features/calendar/interfaces/event-interface';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(private http: HttpClient) {}

  //* APIs

  getAllEvents(params?: ICalendarFilter) {
    return this.http.get<IEventResponse[]>(`${URLs.apiBaseUrl + URLs.getAllEvents}`, {
      params: this.buildParams(params),
    });
  }

  getEventById(id: number) {
    return this.http.get<IEventResponse>(
      `${URLs.apiBaseUrl + URLs.getEventById}`.replace(':id', id.toString()),
    );
  }

  createEvent(eventDate: IEventRequest) {
    return this.http.post(`${URLs.apiBaseUrl + URLs.createEvent}`, eventDate);
  }

  cancelEvent(eventId: number) {
    return this.http.put(
      `${URLs.apiBaseUrl + URLs.cancelEventById}`.replace(':id', eventId.toString()),
      {},
    );
  }

  deleteEvent(eventId: number) {
    return this.http.delete(
      `${URLs.apiBaseUrl + URLs.deleteEventById}`.replace(':id', eventId.toString()),
    );
  }

  // ------------------------------ Private Methods ------------------------------------
  private buildParams(params?: ICalendarFilter): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }
}
