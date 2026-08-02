import { Component, signal } from '@angular/core';
import { TableAction, TableColumn } from '../../../shared/interfaces/table-configuration-interface';
import { VenuesService } from '../../../core/services/venues.service';
import { IGetAllApiParams } from '../../../shared/interfaces/apis-interface';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { MatDialog } from '@angular/material/dialog';
import { IVenueRequest, IVenueResponse } from '../interfaces/venue-interface';
import { SuccessMessages } from '../../../core/constants/successMessages';
import { NotificationService } from '../../../core/services/notification.service';
import { AddEditVenue } from './add-edit-venue/add-edit-venue';
import { PageHero } from '../../../shared/components/page-hero/page-hero';

@Component({
  selector: 'app-venues',
  imports: [GenericTable, PageHero],
  templateUrl: './venues.html',
  styleUrl: './venues.scss',
})
export class Venues {
  allVenues = signal([]);
  totalItems = signal<number>(0);
  pageSize = signal<number>(5);
  pageNumber = signal<number>(0);

  constructor(
    private venuesService: VenuesService,
    public dialog: MatDialog,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadAllVenues();
  }

  readonly columns: TableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'address', header: 'Address' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'categoryName', header: 'Category Name' },
    { key: 'isSeatable', header: 'Visualized seats', pipe: (value) => (value ? 'Yes' : 'No') },
  ];

  readonly actions: TableAction<IVenueResponse>[] = [
    {
      icon: 'edit',
      label: 'Edit',
      handler: (venue) => this.onEditVenue(venue),
    },
    // {
    //   icon: 'delete',
    //   label: 'Delete',
    //   handler: (venues) => console.log('Delete venues', venues),
    // },
  ];

  private loadAllVenues() {
    const getCategoriesParams: IGetAllApiParams = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };
    this.venuesService.getAllVenuesPaginated(getCategoriesParams).subscribe({
      next: (res: any) => {
        console.log(res);
        this.allVenues.set(res.content);
        this.pageSize.set(res.size);
        this.totalItems.set(res.totalElements);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onPageChange(event: any): void {
    this.pageNumber.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAllVenues();
  }

  onCreateVenue(): void {
    const dialog = this.dialog.open(AddEditVenue, {
      width: '520px',
      height: '100vh',
      autoFocus: false,
      position: {
        right: '0',
      },
      panelClass: 'venue-dialog-panel',
      enterAnimationDuration: '350ms',
      exitAnimationDuration: '250ms',
    });

    dialog.afterClosed().subscribe((result: IVenueRequest) => {
      if (result) {
        console.log(result);
        this.venuesService.createVenue(result).subscribe({
          next: (res) => {
            console.log(res, 'create venue res');
            this.notificationService.success(SuccessMessages.venueCreated);
          },
          error: (err: any) => {
            console.log(err);
          },
          complete: () => {
            this.loadAllVenues();
          },
        });
      }
    });
  }

  onEditVenue(venue: IVenueResponse): void {
    const dialog = this.dialog.open(AddEditVenue, {
      width: '520px',
      height: '100vh',
      autoFocus: false,
      position: {
        right: '0',
      },
      panelClass: 'venue-dialog-panel',
      enterAnimationDuration: '350ms',
      exitAnimationDuration: '250ms',
      data: venue,
    });

    dialog.afterClosed().subscribe((result: IVenueRequest) => {
      if (result) {
        console.log(result);
        this.venuesService.updateVenue(result, venue.id).subscribe({
          next: (res) => {
            console.log(res, 'update venue res');
            this.notificationService.success(SuccessMessages.venueUpdated);
          },
          error: (err: any) => {
            console.log(err);
          },
          complete: () => {
            this.loadAllVenues();
          },
        });
      }
    });
  }
}
