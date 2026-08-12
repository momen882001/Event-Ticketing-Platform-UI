import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventCardComponent } from '../../../../shared/components/event-card/event-card';
import { NavbarComponent } from '../../../../layout/navbar/navbar';
import { UsersService } from '../../../../core/services/users.service';
import { IEventResponse } from '../../../calendar/interfaces/event-interface';

@Component({
  selector: 'app-event-view-all',
  imports: [CommonModule, EventCardComponent, NavbarComponent],
  templateUrl: './event-view-all.html',
  styleUrl: './event-view-all.scss',
})
export class EventViewAllComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  protected readonly categories = signal<string[]>(['All']);
  protected readonly venues = signal<string[]>(['All']);

  protected readonly selectedCategory = signal('All');
  protected readonly selectedVenue = signal('All');

  protected readonly allEvents = signal<IEventResponse[]>([]);
  protected readonly isLoadingEvents = signal(true);
  protected readonly isLoadingCategories = signal(true);
  protected readonly isLoadingVenues = signal(true);

  private readonly categoryPageSize = 8;
  private readonly venuePageSize = 8;

  private readonly categoryPage = signal(0);
  private readonly venuePage = signal(0);

  private readonly allCategories = signal<string[]>([]);
  private readonly allVenues = signal<string[]>([]);

  protected readonly filteredEvents = computed<IEventResponse[]>(() =>
    this.allEvents().filter((event) => {
      // Backend may return category as `venue.category.name` instead of `venue.categoryName`.
      const venueAny = event.venue as unknown as { categoryName?: string; category?: { name?: string }; name?: string } | null;
      const categoryName = venueAny?.categoryName ?? venueAny?.category?.name ?? '';
      const venueName = venueAny?.name ?? '';

      const matchCategory =
        this.selectedCategory() === 'All' || categoryName === this.selectedCategory();
      const matchVenue =
        this.selectedVenue() === 'All' || venueName === this.selectedVenue();

      return matchCategory && matchVenue;
    }),
  );

  ngOnInit(): void {
    this.loadAllData();
  }

  protected onBookEvent(event: IEventResponse): void {
    this.router.navigate(['/dashboard', 'calendar', 'events', event.id, 'booking']);
  }

  protected selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  protected selectVenue(venue: string): void {
    this.selectedVenue.set(venue);
  }

  protected changeCategoryPage(direction: number): void {
    const maxPage = Math.max(0, Math.ceil(this.allCategories().length / this.categoryPageSize) - 1);
    this.categoryPage.update((page) => Math.min(maxPage, Math.max(0, page + direction)));
    this.renderCategorySlice();
  }

  protected changeVenuePage(direction: number): void {
    const maxPage = Math.max(0, Math.ceil(this.allVenues().length / this.venuePageSize) - 1);
    this.venuePage.update((page) => Math.min(maxPage, Math.max(0, page + direction)));
    this.renderVenueSlice();
  }

  private loadAllData(): void {
    forkJoin({
      events: this.usersService.getAllEvents(0, 60, 'startDateTime,desc'),
      categories: this.usersService.getAllCategories(),
      venues: this.usersService.getAllVenues(),
    }).subscribe({
      next: ({ events, categories, venues }) => {
        const categoryList = categories ?? [];
        const venueList = venues ?? [];

        this.allCategories.set(categoryList.map((c) => c.name));
        this.renderCategorySlice();
        this.isLoadingCategories.set(false);

        this.allVenues.set(venueList.map((v) => v.name));
        this.renderVenueSlice();
        this.isLoadingVenues.set(false);

        this.allEvents.set(events.content ?? []);
        this.isLoadingEvents.set(false);
      },
      error: (err) => {
        console.error('Failed to load event page data', err);
        this.allEvents.set([]);
        this.categories.set(['All']);
        this.venues.set(['All']);
        this.isLoadingEvents.set(false);
        this.isLoadingCategories.set(false);
        this.isLoadingVenues.set(false);
      },
    });
  }

  private renderCategorySlice(): void {
    const start = this.categoryPage() * this.categoryPageSize;
    const end = start + this.categoryPageSize;
    this.categories.set(['All', ...this.allCategories().slice(start, end)]);
  }

  private renderVenueSlice(): void {
    const start = this.venuePage() * this.venuePageSize;
    const end = start + this.venuePageSize;
    this.venues.set(['All', ...this.allVenues().slice(start, end)]);
  }
}
