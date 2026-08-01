import { Component, signal } from '@angular/core';
import { TableAction, TableColumn } from '../../../shared/interfaces/table-configuration-interface';
import { VenuesService } from '../../../core/services/venues.service';
import { IGetAllApiParams } from '../../../shared/interfaces/apis-interface';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { MatDialog } from '@angular/material/dialog';
import { CreateVenue } from './create-venue/create-venue';

@Component({
  selector: 'app-venues',
  imports: [GenericTable],
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

  readonly actions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View',
      handler: (venues) => console.log(venues),
    },
    {
      icon: 'edit',
      label: 'Edit',
      handler: (venues) => console.log(venues),
    },
    {
      icon: 'delete',
      label: 'Delete',
      handler: (venues) => console.log('Delete venues', venues),
    },
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
    this.dialog.open(CreateVenue, {
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
  }
}
