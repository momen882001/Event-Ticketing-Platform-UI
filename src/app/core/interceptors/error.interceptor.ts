import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage =
        error.error?.message ?? error.error?.error ?? error.message ?? 'Something went wrong.';

      // Browser/network errors
      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 401:
            authService.logout();
            break;

          case 403:
            errorMessage = 'You are not authorized to perform this action.';
            break;

          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
        }
      }

      notificationService.error(errorMessage);

      return throwError(() => error);
    }),
  );
};
