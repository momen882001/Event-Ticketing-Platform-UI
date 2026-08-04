import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URLs } from '../api/api-urls';
import { IUserResponse } from '../../features/users/interfaces/user-interface';

@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  constructor(private http: HttpClient) {}

  //* APIs

  getAllUsers(): Observable<IUserResponse[]> {
    return this.http.get<IUserResponse[]>(`${URLs.apiBaseUrl + URLs.getAllUsers}`);
  }
}
