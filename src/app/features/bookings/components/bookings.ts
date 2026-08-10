import { Component, signal } from '@angular/core';
import { TableColumn } from '../../../shared/interfaces/table-configuration-interface';
import { BookingsService } from '../../../core/services/bookings.service';
import { IGetAllApiParams } from '../../../shared/interfaces/apis-interface';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { IBookingResponse } from '../interfaces/booking-interface';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { IBookingItemRequest, IBookingItemResponse } from '../interfaces/booking-item-interface';
import { IPaymentResponse } from '../interfaces/booking-payment-interface';

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

  constructor(private bookingsService: BookingsService) {}

  ngOnInit(): void {
    this.loadAllBookings();
  }

  readonly columns: TableColumn[] = [
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

  //API call
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
}
