import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { URLs } from '../api/api-urls';
import {
  ILoginRequest,
  ILoginResponse,
  IRegisterRequest,
} from '../../features/auth/interfaces/AuthInterface';
import { UserRoleEnum } from '../../shared/enums/UserRoleEnum';
import { NotificationService } from './notification.service';
import { SuccessMessages } from '../constants/successMessages';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
  ) {}

  //* APIs
  login(loginData: ILoginRequest) {
    return this.http.post(`${URLs.apiBaseUrl + URLs.login}`, loginData);
  }

  signUp(resgisterData: IRegisterRequest) {
    return this.http.post(`${URLs.apiBaseUrl + URLs.register}`, resgisterData);
  }

  //* public methods
  // check if the user is authenticated
  hasUserToken(): boolean {
    return !!this.storageService.getItem<ILoginResponse>('userData')?.token;
  }

  // logout user account
  logout() {
    this.router.navigate(['/auth/login']);
    localStorage.clear();
  }

  //* getters

  // Get user token
  get getToken(): string | null {
    return this.storageService.getItem<ILoginResponse>('userData')?.token || null;
  }

  get getUserData(): ILoginResponse | null {
    return this.storageService.getItem<ILoginResponse>('userData');
  }

  getUserRole(): UserRoleEnum {
    return this.storageService.getItem<ILoginResponse>('userData')?.role as UserRoleEnum;
  }
}
