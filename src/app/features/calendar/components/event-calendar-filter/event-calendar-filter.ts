import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Field, form, FormField } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventStatusEnum } from '../../../../shared/enums/EventStatusEnum';
import { ICategoryResponse } from '../../../categories/interfaces/category-interface';
import { IVenueResponse } from '../../../venues/interfaces/venue-interface';
import { ICalendarFilter } from '../../interfaces/calendar-interface';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-event-calendar-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
  ],
  templateUrl: './event-calendar-filter.html',
  styleUrl: './event-calendar-filter.scss',
})
export class EventCalendarFilter {
  readonly categories = input.required<ICategoryResponse[]>();

  readonly venues = input.required<IVenueResponse[]>();

  readonly loadingVenues = input(false);

  readonly filterChanged = output<ICalendarFilter>();

  readonly categoryChanged = output<number | null>();

  readonly resetClicked = output<void>();

  readonly statuses = signal([
    {
      label: 'Published',
      value: EventStatusEnum.PUBLISHED,
    },
    {
      label: 'Sold Out',
      value: EventStatusEnum.SOLD_OUT,
    },
    {
      label: 'Completed',
      value: EventStatusEnum.COMPLETED,
    },
    {
      label: 'Cancelled',
      value: EventStatusEnum.CANCELLED,
    },
  ]);

  filterObject = signal<ICalendarFilter>({
    search: '',
    categoryId: null,
    venueId: null,
    status: null,
  });
  search = signal<string>('');

  hasFilters = computed(() => {
    const value = this.filterObject();

    return (
      value.search.trim().length > 0 ||
      value.categoryId !== null ||
      value.venueId !== null ||
      value.status !== null
    );
  });

  constructor() {
    let timer: ReturnType<typeof setTimeout>;

    effect(() => {
      const value = this.search();

      clearTimeout(timer);

      timer = setTimeout(() => {
        this.filterObject.update((current) => ({
          ...current,
          search: value,
        }));
      }, 500);
    });

    effect(() => {
      this.filterChanged.emit(this.filterObject());
    });
  }

  onCategoryChange(categoryId: number | null): void {
    this.filterObject.update((value) => ({
      ...value,
      categoryId,
      venueId: null,
    }));

    this.categoryChanged.emit(categoryId);
  }

  onVenueChange(venueId: number | null): void {
    this.filterObject.update((value) => ({
      ...value,
      venueId,
    }));
  }

  onStatusChange(status: EventStatusEnum | null): void {
    this.filterObject.update((value) => ({
      ...value,
      status,
    }));
  }

  // onSearch(value: string): void {
  //   this.filterObject.update((current) => ({
  //     ...current,
  //     search: value,
  //   }));
  // }

  reset(): void {
    this.filterObject.set({
      search: '',
      categoryId: null,
      venueId: null,
      status: null,
    });

    this.resetClicked.emit();
    this.categoryChanged.emit(null);
  }
}
