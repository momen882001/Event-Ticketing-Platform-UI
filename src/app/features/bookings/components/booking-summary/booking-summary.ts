import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-booking-summary',
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './booking-summary.html',
  styleUrl: './booking-summary.scss',
})
export class BookingSummary {
  readonly items = input.required<any[]>();

  readonly tickets = input.required<number>();

  readonly total = input.required<number>();

  readonly loading = input(false);

  readonly disabled = input(false);

  readonly checkout = output<void>();
}
