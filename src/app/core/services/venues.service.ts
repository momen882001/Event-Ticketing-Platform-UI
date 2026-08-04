import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { URLs } from '../api/api-urls';
import { IGetAllApiParams } from '../../shared/interfaces/apis-interface';
import { IVenueRequest, IVenueResponse } from '../../features/venues/interfaces/venue-interface';
import { IPagedResponse } from '../../shared/interfaces/pagination-interface';

@Injectable({
  providedIn: 'root',
})
export class VenuesService {
  constructor(private http: HttpClient) {}

  //* APIs

  createVenue(venueData: IVenueRequest) {
    return this.http.post(`${URLs.apiBaseUrl + URLs.createVenue}`, venueData);
  }

  updateVenue(venueData: IVenueRequest, id: number) {
    return this.http.put(
      `${URLs.apiBaseUrl + URLs.updateVenue}`.replace(':id', id.toString()),
      venueData,
    );
  }

  getAllVenuesPaginated(params: IGetAllApiParams) {
    const httpParams = new HttpParams().set('page', params.pageNumber).set('size', params.pageSize);

    return this.http.get<IPagedResponse<IVenueResponse>>(
      `${URLs.apiBaseUrl + URLs.getAllVenuesPaginated}`,
      {
        params: httpParams,
      },
    );
  }

  getAllVenues() {
    return this.http.get<IVenueResponse[]>(`${URLs.apiBaseUrl + URLs.getAllVenues}`);
  }

  getAllVenuesByCategoryId(categoryId: number) {
    return this.http.get<IVenueResponse[]>(
      `${URLs.apiBaseUrl + URLs.getAllVenuesByCategoryId}`.replace(
        ':categoryId',
        categoryId.toString(),
      ),
    );
  }

  getVenueById(id: number) {
    return this.http.get<IVenueResponse>(
      `${URLs.apiBaseUrl + URLs.getVenueById}`.replace(':id', id.toString()),
    );
  }
}
