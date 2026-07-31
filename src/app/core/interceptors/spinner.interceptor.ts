import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { SpinnerService } from '../services/spinner.service';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);

  // Skip spinner for specific requests
  if (req.headers.has('No-Spinner')) {
    return next(req);
  }

  spinnerService.show();

  return next(req).pipe(
    finalize(() => {
      spinnerService.hide();
    }),
  );
};
