import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { startWith } from 'rxjs';

import { EventsService } from '../../../../core/services/events.service';

import { BookingTicketCard } from '../booking-ticket-card/booking-ticket-card';
import { BookingHeader } from '../booking-header/booking-header';
import { BookingSummary } from '../booking-summary/booking-summary';
import { PaymentCard } from '../payment-card/payment-card';
import { MatDialog } from '@angular/material/dialog';
import { BookingsService } from '../../../../core/services/bookings.service';
import { IBookingRequest } from '../../interfaces/booking-interface';
import { NotificationService } from '../../../../core/services/notification.service';
import { SuccessMessages } from '../../../../core/constants/successMessages';

@Component({
  selector: 'app-event-booking',
  standalone: true,
  imports: [ReactiveFormsModule, BookingTicketCard, BookingHeader, BookingSummary],
  templateUrl: './event-booking.html',
  styleUrl: './event-booking.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventBooking implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly dialog = inject(MatDialog);

  private readonly fb = inject(FormBuilder);

  private readonly eventsService = inject(EventsService);
  private readonly bookingsService = inject(BookingsService);
  private readonly notificationsService = inject(NotificationService);

  readonly submitting = signal(false);

  readonly event = signal<any | null>(null);

  readonly bookingForm = this.fb.group({
    eventId: [0, Validators.required],

    items: this.fb.array<FormGroup>([]),
  });

  /**
   * Convert Reactive Form changes into Signal
   */
  readonly formValue = toSignal(
    this.bookingForm.valueChanges.pipe(startWith(this.bookingForm.getRawValue())),

    {
      initialValue: this.bookingForm.getRawValue(),
    },
  );

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('eventId'));

    this.loadEvent(eventId);
  }

  get items(): FormArray<FormGroup> {
    return this.bookingForm.controls.items;
  }

  private loadEvent(eventId: number): void {
    this.eventsService
      .getEventById(eventId)

      .subscribe({
        next: (event) => {
          this.event.set(event);

          this.bookingForm.patchValue({
            eventId: event.id,
          });

          this.buildItems(event.seatCategories);
        },

        error: (error) => {
          console.error('Error fetching event:', error);
        },
      });
  }

  private buildItems(categories: any[]): void {
    this.items.clear();

    categories.forEach((category) => {
      this.items.push(
        this.fb.group({
          seatCategoryId: [category.id],

          quantity: [0, [Validators.min(0), Validators.max(category.availableSeats)]],
        }),
      );
    });
  }

  increase(index: number): void {
    const control = this.items.at(index);

    const quantity = control.value.quantity ?? 0;

    const available = this.event()?.seatCategories[index].availableSeats ?? 0;

    if (quantity >= available) {
      return;
    }

    control.patchValue({
      quantity: quantity + 1,
    });
  }

  decrease(index: number): void {
    const control = this.items.at(index);

    const quantity = control.value.quantity ?? 0;

    if (quantity <= 0) {
      return;
    }

    control.patchValue({
      quantity: quantity - 1,
    });
  }

  /**
   * Receipt depends on form signal
   */
  readonly receipt = computed(() => {
    const event = this.event();

    const form = this.formValue();

    if (!event) {
      return [];
    }

    return event.seatCategories

      .map((category: any, index: number) => {
        const quantity = form.items?.[index]?.quantity ?? 0;

        return {
          seatCategoryId: category.id,

          name: category.name,

          quantity,

          price: category.price,

          subtotal: quantity * category.price,
        };
      })

      .filter((item: any) => item.quantity > 0);
  });

  readonly totalTickets = computed(() =>
    this.receipt()

      .reduce(
        (sum: number, item: any) => sum + item.quantity,

        0,
      ),
  );

  readonly totalAmount = computed(() =>
    this.receipt()

      .reduce(
        (sum: number, item: any) => sum + item.subtotal,

        0,
      ),
  );

  readonly canSubmit = computed(() => this.totalTickets() > 0);

  submit(): void {
    if (!this.canSubmit() || this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();

      return;
    }

    const payload: IBookingRequest = {
      eventId: this.bookingForm.value.eventId as number,

      items:
        this.bookingForm.value.items

          ?.filter((item: any) => item.quantity > 0)

          .map((item: any) => ({
            seatCategoryId: item.seatCategoryId,

            quantity: item.quantity,
          })) ?? [],
    };

    this.onOpenPayment(payload);
  }

  private onOpenPayment(payload: IBookingRequest): void {
    const dialogRef = this.dialog.open(PaymentCard, {
      maxWidth: '80vw',
      height: '90vh',
      panelClass: 'payment-dialog-panel',
      disableClose: true,
      data: {
        totalAmount: this.totalAmount(),
      },
    });

    dialogRef.afterClosed().subscribe((payment) => {
      if (payment) {
        console.log(payment);
        this.bookingsService.createBooking(payload).subscribe({
          next: (res) => {
            this.notificationsService.success(SuccessMessages.bookingCreated);
            this.router.navigate(['dashboard', 'bookings']);
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    });
  }
}
