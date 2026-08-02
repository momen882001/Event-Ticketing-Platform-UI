import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { URLs } from '../api/api-urls';
import { ICategoryResponse } from '../../features/categories/interfaces/category-interface';
import { IGetAllApiParams } from '../../shared/interfaces/apis-interface';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(private http: HttpClient) {}

  //* APIs
  getAllCategories(params?: IGetAllApiParams) {
    // const httpParams = new HttpParams().set('page', params.pageNumber).set('size', params.pageSize);

    // return this.http.get<ICategoryResponse[]>(`${URLs.apiBaseUrl + URLs.getAllCategoriesPaginated}`, {
    //   params: httpParams,
    // });

    return this.http.get<ICategoryResponse[]>(`${URLs.apiBaseUrl + URLs.getAllCategories}`);
  }
}
