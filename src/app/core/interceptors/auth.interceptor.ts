import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  if (authService.hasUserToken()) {
    const token = authService.getToken as string;

    const authRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });

    return next(authRequest);
  }

  return next(request);
};
