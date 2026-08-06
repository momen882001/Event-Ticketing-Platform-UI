import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-booking-ticket-card',
  imports: [CurrencyPipe, MatButtonModule, MatIconModule],
  templateUrl: './booking-ticket-card.html',
  styleUrl: './booking-ticket-card.scss',
})
export class BookingTicketCard {
  readonly category = input.required<any>();

  readonly quantity = input.required<number>();

  readonly canIncrease = input(true);

  readonly canDecrease = input(false);

  readonly increase = output<void>();

  readonly decrease = output<void>();
}
