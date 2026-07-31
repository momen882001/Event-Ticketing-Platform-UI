import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../api/api-urls';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  //* APIs
  // getAllUsers() {
  //   return this.http.get<IUserResponse[]>(`${URLs.apiBaseUrl + URLs.getAllUsers}`);
  // }
}
