import { Component, signal } from '@angular/core';
import { TableAction, TableColumn } from '../../../shared/interfaces/table-configuration-interface';
import { BookingsService } from '../../../core/services/bookings.service';
import { IGetAllApiParams } from '../../../shared/interfaces/apis-interface';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { IBookingResponse } from '../interfaces/booking-interface';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { IBookingItemRequest, IBookingItemResponse } from '../interfaces/booking-item-interface';
import { IPaymentResponse } from '../interfaces/booking-payment-interface';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { IConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog';
import { SuccessMessages } from '../../../core/constants/successMessages';
import { NotificationService } from '../../../core/services/notification.service';
import { IEventResponse } from '../../calendar/interfaces/event-interface';
import { BookingStatusEnum } from '../../../shared/enums/BookingStatusEnum';

@Component({
  selector: 'app-bookings',
  imports: [GenericTable, PageHero],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class Bookings {
  allBookings = signal<IBookingResponse[]>([]);
  totalItems = signal<number>(0);
  pageSize = signal<number>(5);
  pageNumber = signal<number>(0);

  constructor(
    private bookingsService: BookingsService,
    public dialog: MatDialog,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadAllBookings();
  }

  readonly columns: TableColumn[] = [
    { key: 'event', header: 'Event Name', pipe: (value) => (value as IEventResponse)?.title },
    { key: 'status', header: 'Status' },
    {
      key: 'createdAt',
      header: 'Created At',
      type: 'datetime',
    },
    {
      key: 'payment',
      header: 'Total Amount',
      pipe: (value) => (value as IPaymentResponse)?.amount ?? '-',
    },
  ];

  readonly actions: TableAction<IBookingResponse>[] = [
    {
      icon: 'visibility',
      label: 'View Booking',
      handler: (booking) => console.log(booking),
    },
    {
      icon: 'confirmation_number',
      label: 'Tickets',
      handler: (booking) => console.log(booking),
      visible: (booking) => booking.status !== BookingStatusEnum.CANCELLED,
    },
    {
      icon: 'cancel',
      label: 'Cancel',
      handler: (booking) => this.onCancelBooking(booking),
      visible: (booking) => booking.status !== BookingStatusEnum.CANCELLED,
    },
  ];

  private loadAllBookings() {
    const getCategoriesParams: IGetAllApiParams = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };
    this.bookingsService.getAllBookingsPaginated(getCategoriesParams).subscribe({
      next: (res) => {
        console.log(res);
        this.allBookings.set(res.content);
        this.pageSize.set(res.page.size);
        this.totalItems.set(res.page.totalElements);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  //pagination
  onPageChange(event: any): void {
    this.pageNumber.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAllBookings();
  }

  /* ------------ Private Methods ------------ */
  private onCancelBooking(booking: IBookingResponse): void {
    const dialogRef = this.dialog.open<ConfirmationDialog, IConfirmationDialogData, boolean>(
      ConfirmationDialog,
      {
        panelClass: 'confirmation-dialog-panel',
        data: {
          title: 'Cancel booking?',
          message:
            'Your booking will be cancelled and your reserved tickets will no longer be available. This action cannot be undone.',
          confirmText: 'Cancel Booking',
          cancelText: 'Keep Booking',
          icon: 'bi-ticket-perforated',
          type: 'warning',
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.bookingsService.cancelBooking(booking.id).subscribe({
        next: (res) => {
          this.notificationService.success(SuccessMessages.bookingCanceled);
          this.loadAllBookings();
        },
        error: (err) => {
          console.log(err);
        },
      });
    });
  }
}
