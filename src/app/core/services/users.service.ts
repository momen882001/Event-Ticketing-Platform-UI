import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { URLs } from '../api/api-urls';
import { IEventResponse } from '../../features/calendar/interfaces/event-interface';

export type EventResponse = {
  id: number;
  organizerId: number;
  venueId?: number;
  categoryId: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  imageUrl?: string;
  venue?: {
    id: number;
    name: string;
    address?: string;
    category?: { id: number; name: string } | null;
  } | null;
};

export type EventListResponse = {
  value?: EventResponse[];
  content?: EventResponse[];
  data?: EventResponse[];
};

export type CategoryResponse = {
  id: number;
  name: string;
};

export type CategoryListResponse = {
  value?: CategoryResponse[];
  content?: CategoryResponse[];
  Count?: number;
};

export type VenueResponse = {
  id: number;
  name: string;
  address: string;
  capacity: number;
  categoryId: number;
  categoryName: string;
  isSeatable: boolean;
};

export type PageMetadata = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type PageResponse<T> = {
  content: T[];
  page: PageMetadata;
};

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiBase = '/api';

  constructor(private http: HttpClient) {}

  getAllEvents(
    page = 0,
    size = 10,
    sort = 'startDateTime,desc',
  ): Observable<PageResponse<IEventResponse>> {
    const params = this.buildQuery({ page, size, sort });

    return this.http
      .get<IEventResponse[] | PageResponse<IEventResponse> | { value?: IEventResponse[]; content?: IEventResponse[]; data?: IEventResponse[] }>(
        `${this.apiBase}/events`,
        { params },
      )
      .pipe(
        map((response) => {
          // Backend returns a plain array OR a { content, page } object — normalize both.
          if (Array.isArray(response)) {
            return {
              content: response,
              page: {
                size,
                number: page,
                totalElements: response.length,
                totalPages: Math.ceil(response.length / size),
              },
            };
          }

          if (response && typeof response === 'object') {
            const list = response as { value?: IEventResponse[]; content?: IEventResponse[]; data?: IEventResponse[] };
            const content = list.content ?? list.value ?? list.data ?? [];

            if (Array.isArray(content)) {
              const meta = (response as PageResponse<IEventResponse>).page;

              return {
                content,
                page: meta ?? {
                  size,
                  number: page,
                  totalElements: content.length,
                  totalPages: Math.ceil(content.length / size),
                },
              };
            }
          }

          return { content: [], page: { size, number: page, totalElements: 0, totalPages: 0 } };
        }),
        catchError((err) => {
          console.error('getAllEvents failed:', err);
          return of({
            content: [] as IEventResponse[],
            page: {
              size,
              number: page,
              totalElements: 0,
              totalPages: 0,
            },
          });
        }),
      );
  }

  getEventById(id: number): Observable<IEventResponse> {
    return this.http.get<IEventResponse>(`${this.apiBase}/events/${id}`);
  }

  getAllCategories(): Observable<CategoryResponse[]> {
    return this.http
      .get<CategoryListResponse | CategoryResponse[]>(`${this.apiBase}/categories`)
      .pipe(
        map((response) => {
          if (Array.isArray(response)) {
            return response as CategoryResponse[];
          }

          if (response && typeof response === 'object') {
            if (Array.isArray((response as CategoryListResponse).value)) {
              return (response as CategoryListResponse).value as CategoryResponse[];
            }

            if (Array.isArray((response as CategoryListResponse).content)) {
              return (response as CategoryListResponse).content as CategoryResponse[];
            }
          }

          return [];
        }),
        catchError((err) => {
          console.error('getAllCategories failed:', err);
          return of([]);
        }),
      );
  }

  getCategoryById(id: number): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiBase}/categories/${id}`);
  }

  getAllVenues(): Observable<VenueResponse[]> {
    return this.http.get<VenueResponse[]>(`${this.apiBase}/venues`);
  }

  getPagedVenues(
    page = 0,
    size = 20,
    sort = 'name,asc',
  ): Observable<PageResponse<VenueResponse>> {
    const params = this.buildQuery({ page, size, sort });
    return this.http.get<PageResponse<VenueResponse>>(`${this.apiBase}/venues/paged`, { params }).pipe(
      catchError((err) => {
        console.error('getPagedVenues failed:', err);
        return of({
          content: [],
          page: {
            size,
            number: page,
            totalElements: 0,
            totalPages: 0,
          },
        });
      }),
    );
  }

  getVenueById(id: number): Observable<VenueResponse> {
    return this.http.get<VenueResponse>(`${this.apiBase}/venues/${id}`);
  }

  getVenuesByCategory(
    categoryId: number,
    page = 0,
    size = 20,
    sort = 'name,asc',
  ): Observable<PageResponse<VenueResponse>> {
    const params = this.buildQuery({ page, size, sort });
    return this.http.get<PageResponse<VenueResponse>>(
      `${this.apiBase}/venues/category/${categoryId}/paged`,
      { params },
    );
  }

  private buildQuery(params: Record<string, string | number | boolean | undefined>): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
