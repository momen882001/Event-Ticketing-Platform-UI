import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { URLs } from '../api/api-urls';
import {
  ICategoryRequest,
  ICategoryResponse,
} from '../../features/categories/interfaces/category-interface';
import { IGetAllApiParams } from '../../shared/interfaces/apis-interface';
import { IPagedResponse } from '../../shared/interfaces/pagination-interface';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(private http: HttpClient) {}

  //* APIs

  createCategory(categoryData: ICategoryRequest) {
    return this.http.post(`${URLs.apiBaseUrl + URLs.createCategory}`, categoryData);
  }

  updateCategory(categoryData: ICategoryRequest, id: number) {
    return this.http.put(
      `${URLs.apiBaseUrl + URLs.updateCategory}`.replace(':id', id.toString()),
      categoryData,
    );
  }

  getAllCategoriesPaginated(params: IGetAllApiParams) {
    const httpParams = new HttpParams().set('page', params.pageNumber).set('size', params.pageSize);

    return this.http.get<IPagedResponse<ICategoryResponse>>(
      `${URLs.apiBaseUrl + URLs.getAllCategoriesPaginated}`,
      {
        params: httpParams,
      },
    );
  }

  getAllCategories() {
    return this.http.get<ICategoryResponse[]>(`${URLs.apiBaseUrl + URLs.getAllCategories}`);
  }
}
