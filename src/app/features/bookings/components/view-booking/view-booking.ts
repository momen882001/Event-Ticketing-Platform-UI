import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IBookingResponse } from '../../interfaces/booking-interface';
import { BookingsService } from '../../../../core/services/bookings.service';
import { BookingStatusEnum } from '../../../../shared/enums/BookingStatusEnum';

@Component({
  selector: 'app-view-booking',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './view-booking.html',
  styleUrl: './view-booking.scss',
})
export class ViewBooking implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly booking = signal<IBookingResponse | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  readonly totalTickets = computed(() => {
    return this.booking()?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  });

  readonly eventDuration = computed(() => {
    const booking = this.booking();

    if (!booking) {
      return '';
    }

    const start = new Date(booking.event.startDateTime);
    const end = new Date(booking.event.endDateTime);

    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  });

  ngOnInit(): void {
    const bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));

    if (!bookingId || Number.isNaN(bookingId)) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.loadBookingById(bookingId);
  }

  private loadBookingById(id: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.bookingsService.getBookingById(id).subscribe({
      next: (res) => {
        console.log(res);

        this.booking.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load booking details', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  goToMyBookings(): void {
    this.router.navigate(['/dashboard', 'bookings']);
  }

  getStatusClass(status: BookingStatusEnum): string {
    switch (status) {
      case BookingStatusEnum.BOOKED:
        return 'status-booked';

      case BookingStatusEnum.RESERVED:
        return 'status-reserved';

      case BookingStatusEnum.CANCELLED:
        return 'status-cancelled';

      default:
        return '';
    }
  }

  getStatusIcon(status: BookingStatusEnum): string {
    switch (status) {
      case BookingStatusEnum.BOOKED:
        return 'check_circle';

      case BookingStatusEnum.RESERVED:
        return 'schedule';

      case BookingStatusEnum.CANCELLED:
        return 'cancel';

      default:
        return 'info';
    }
  }

  getStatusLabel(status: BookingStatusEnum): string {
    switch (status) {
      case BookingStatusEnum.BOOKED:
        return 'Confirmed';

      case BookingStatusEnum.RESERVED:
        return 'Reserved';

      case BookingStatusEnum.CANCELLED:
        return 'Cancelled';

      default:
        return status;
    }
  }
}
