import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-booking-header',
  imports: [DatePipe, MatIconModule],
  templateUrl: './booking-header.html',
  styleUrl: './booking-header.scss',
})
export class BookingHeader {
  readonly event = input.required<any>();
}
