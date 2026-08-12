import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventCardComponent, EventCard } from '../../../../shared/components/event-card/event-card';
import { NavbarComponent } from '../../../../layout/navbar/navbar';
import { EventResponse, UsersService } from '../../../../core/services/users.service';

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

  protected readonly allEvents = signal<EventCard[]>([]);
  protected readonly isLoadingEvents = signal(true);
  protected readonly isLoadingCategories = signal(true);
  protected readonly isLoadingVenues = signal(true);

  private readonly categoryPageSize = 8;
  private readonly venuePageSize = 8;

  private readonly categoryPage = signal(0);
  private readonly venuePage = signal(0);

  private readonly allCategories = signal<string[]>([]);
  private readonly allVenues = signal<string[]>([]);

  private categoryNameMap = new Map<number, string>();
  private venueNameMap = new Map<number, string>();

  protected readonly filteredEvents = computed<EventCard[]>(() =>
    this.allEvents().filter((event) => {
      const matchCategory =
        this.selectedCategory() === 'All' || event.category === this.selectedCategory();

      const matchVenue = this.selectedVenue() === 'All' || event.venue === this.selectedVenue();

      return matchCategory && matchVenue;
    }),
  );

  ngOnInit(): void {
    this.loadAllData();
  }

  protected onBookEvent(event: EventCard): void {
    if (event.id === undefined) {
      return;
    }

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

        this.categoryNameMap = new Map(
          categoryList.map((category) => [category.id, category.name]),
        );
        this.allCategories.set(categoryList.map((category) => category.name));
        this.renderCategorySlice();
        this.isLoadingCategories.set(false);

        this.venueNameMap = new Map(venueList.map((venue) => [venue.id, venue.name]));
        this.allVenues.set(venueList.map((venue) => venue.name));
        this.renderVenueSlice();
        this.isLoadingVenues.set(false);

        this.allEvents.set((events.content ?? []).map((event) => this.mapEvent(event)));
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

  private mapEvent(event: EventResponse): EventCard {
    return {
      id: event.id,
      title: event.title,
      category:
        this.categoryNameMap.get(event.categoryId) ??
        event.venue?.category?.name ??
        `Category ${event.categoryId}`,
      date: new Date(event.startDateTime).toLocaleString(),
      venue:
        event.venue?.name ??
        (event.venueId !== undefined ? this.venueNameMap.get(event.venueId) : undefined) ??
        `Venue ${event.venueId ?? '�'}`,
      price: '�',
      image:
        event.imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1459749411177-039908711577?auto=format&fit=crop&w=900&q=80',
      status: event.status,
    };
  }
}
