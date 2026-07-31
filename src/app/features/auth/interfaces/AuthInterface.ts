import { UserRoleEnum } from '../../../shared/enums/UserRoleEnum';

export interface IRegisterRequest {
  fullname: string;
  username: string;
  password: string;
  role: UserRoleEnum;
  email: string;
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  userId: number;
  token: string;
  fullname: string;
  username: string;
  role: UserRoleEnum;
  email: string;
}
