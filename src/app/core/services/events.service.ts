import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { URLs } from '../api/api-urls';
import { ICalendarFilter } from '../../features/calendar/interfaces/calendar-interface';
import { IEventResponse } from '../../features/calendar/interfaces/event-interface';

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
