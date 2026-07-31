import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private requestCount = signal(0);

  isLoading = this.requestCount.asReadonly();

  show(): void {
    this.requestCount.update((count) => count + 1);
  }

  hide(): void {
    this.requestCount.update((count) => Math.max(0, count - 1));
  }

  reset(): void {
    this.requestCount.set(0);
  }
}
