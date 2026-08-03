import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { EventCardComponent, EventCard } from '../../../../shared/components/event-card/event-card';
import { NavbarComponent } from '../../../../layout/navbar/navbar';
import {
  CategoryResponse,
  EventResponse,
  UsersService,
  VenueResponse,
} from '../../../../core/services/users.service';

@Component({
  selector: 'app-event-view-all',
  imports: [CommonModule, EventCardComponent, NavbarComponent],
  templateUrl: './event-view-all.html',
  styleUrl: './event-view-all.scss',
})
export class EventViewAllComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected categories: string[] = ['All'];
  protected venues: string[] = ['All'];

  protected selectedCategory = 'All';
  protected selectedVenue = 'All';

  protected allEvents: EventCard[] = [];
  protected isLoadingEvents = true;
  protected isLoadingCategories = true;
  protected isLoadingVenues = true;

  private readonly categoryPageSize = 8;
  private readonly venuePageSize = 8;

  private categoryPage = 0;
  private venuePage = 0;

  private allCategories: string[] = [];
  private allVenues: string[] = [];

  private categoryNameMap = new Map<number, string>();
  private venueNameMap = new Map<number, string>();

  ngOnInit(): void {
    this.loadAllData();
  }

  protected get filteredEvents(): EventCard[] {
    return this.allEvents.filter((event) => {
      const matchCategory =
        this.selectedCategory === 'All' || event.category === this.selectedCategory;
      const matchVenue = this.selectedVenue === 'All' || event.venue === this.selectedVenue;
      return matchCategory && matchVenue;
    });
  }

  protected selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  protected selectVenue(venue: string): void {
    this.selectedVenue = venue;
  }

  protected changeCategoryPage(direction: number): void {
    const maxPage = Math.max(0, Math.ceil(this.allCategories.length / this.categoryPageSize) - 1);
    this.categoryPage = Math.min(maxPage, Math.max(0, this.categoryPage + direction));
    this.renderCategorySlice();
  }

  protected changeVenuePage(direction: number): void {
    const maxPage = Math.max(0, Math.ceil(this.allVenues.length / this.venuePageSize) - 1);
    this.venuePage = Math.min(maxPage, Math.max(0, this.venuePage + direction));
    this.renderVenueSlice();
  }

  private loadAllData(): void {
    forkJoin({
      events: this.usersService.getAllEvents(0, 10, 'startDateTime,desc'),
      categories: this.usersService.getAllCategories(),
      venues: this.usersService.getPagedVenues(0, 50, 'name,asc'),
    }).subscribe({
      next: ({ events, categories, venues }) => {
        const categoryList = categories ?? [];
        const venueList = venues.content ?? [];

        this.categoryNameMap = new Map(
          categoryList.map((category) => [category.id, category.name]),
        );
        this.allCategories = categoryList.map((category) => category.name);
        this.renderCategorySlice();
        this.isLoadingCategories = false;

        this.venueNameMap = new Map(venueList.map((venue) => [venue.id, venue.name]));
        this.allVenues = venueList.map((venue) => venue.name);
        this.renderVenueSlice();
        this.isLoadingVenues = false;

        this.allEvents = (events.content ?? []).map((event) => this.mapEvent(event));
        this.isLoadingEvents = false;

        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load event page data', err);
        this.allEvents = [];
        this.categories = ['All'];
        this.venues = ['All'];
        this.isLoadingEvents = false;
        this.isLoadingCategories = false;
        this.isLoadingVenues = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private renderCategorySlice(): void {
    const start = this.categoryPage * this.categoryPageSize;
    const end = start + this.categoryPageSize;
    this.categories = ['All', ...this.allCategories.slice(start, end)];
  }

  private renderVenueSlice(): void {
    const start = this.venuePage * this.venuePageSize;
    const end = start + this.venuePageSize;
    this.venues = ['All', ...this.allVenues.slice(start, end)];
  }

  private mapEvent(event: EventResponse): EventCard {
    return {
      title: event.title,
      category: this.categoryNameMap.get(event.categoryId) ?? `Category ${event.categoryId}`,
      date: new Date(event.startDateTime).toLocaleString(),
      venue: this.venueNameMap.get(event.venueId) ?? `Venue ${event.venueId}`,
      price: '—',
      image:
        'https://images.unsplash.com/photo-1459749411177-039908711577?auto=format&fit=crop&w=900&q=80',
    };
  }
}
