import { inject, Injectable, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly toastr = inject(ToastrService);

  success(message: string, body: string = ''): void {
    this.toastr.success(message, body, {
      progressBar: true,
      progressAnimation: 'decreasing',
    });
  }

  error(message: string, body: string = ''): void {
    this.toastr.error(message, body, {
      progressBar: true,
      progressAnimation: 'decreasing',
    });
  }
  info(message: string, body: string = ''): void {
    this.toastr.info(message, body, {
      progressBar: true,
      progressAnimation: 'decreasing',
    });
  }
  warning(message: string, body: string = ''): void {
    this.toastr.warning(message, body, {
      progressBar: true,
      progressAnimation: 'decreasing',
    });
  }
}
