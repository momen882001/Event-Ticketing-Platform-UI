import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { URLs } from '../api/api-urls';
import { IGetAllApiParams } from '../../shared/interfaces/apis-interface';

@Injectable({
  providedIn: 'root',
})
export class VenuesService {
  constructor(private http: HttpClient) {}

  //* APIs
  getAllVenuesPaginated(params: IGetAllApiParams) {
    const httpParams = new HttpParams().set('page', params.pageNumber).set('size', params.pageSize);

    return this.http.get(`${URLs.apiBaseUrl + URLs.getAllCategoriesPaginated}`, {
      params: httpParams,
    });
  }
}
