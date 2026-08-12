import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../../../layout/navbar/navbar';
import { InfoComponent } from './info/info';
import { EventCardComponent, EventCard } from '../../../shared/components/event-card/event-card';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterLink, NavbarComponent, InfoComponent, EventCardComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage implements OnInit, OnDestroy {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  protected readonly featuredEvents = signal<EventCard[]>([]);
  protected readonly isFeaturedLoading = signal(true);
  protected readonly featuredBatch = signal(0);

  private readonly featuredCount = 3;
  private readonly autoRotateInterval = 10000;
  private readonly imagePool = [
    'https://images.unsplash.com/photo-1459749411177-039908711577?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1452626038306-ef44991c75d0?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1531058020387-3be341df204a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=80',
  ];

  private randomTimer?: number;
  private allMappedEvents: EventCard[] = [];

  ngOnInit(): void {
    this.loadFeaturedEvents();
  }

  ngOnDestroy(): void {
    this.stopAutoRotate();
  }

  onBookEvent(event: EventCard): void {
    if (event.id === undefined) {
      return;
    }

    this.router.navigate(['/dashboard', 'calendar', 'events', event.id, 'booking']);
  }

  private loadFeaturedEvents(): void {
    forkJoin({
      events: this.usersService.getAllEvents(0, 30, 'startDateTime,desc'),
      categories: this.usersService.getAllCategories(),
      venues: this.usersService.getAllVenues(),
    }).subscribe({
      next: ({ events, categories, venues }) => {
        const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
        const venueMap = new Map(venues.map((venue) => [venue.id, venue.name]));

        const mapped = (events.content ?? []).map((event) => ({
          id: event.id,
          title: event.title,
          category:
            categoryMap.get(event.categoryId) ??
            event.venue?.category?.name ??
            `Category ${event.categoryId}`,
          date: new Date(event.startDateTime).toLocaleString(),
          venue:
            event.venue?.name ??
            (event.venueId !== undefined ? venueMap.get(event.venueId) : undefined) ??
            `Venue ${event.venueId ?? '--'}`,
          price: '--',
          image: event.imageUrl?.trim() || this.pickRandomImage(),
          status: event.status,
        }));

        this.allMappedEvents = mapped;
        this.featuredEvents.set(this.pickRandomFeatured(mapped));
        this.featuredBatch.update((batch) => batch + 1);
        this.isFeaturedLoading.set(false);
        this.startAutoRotate();
      },
      error: (err) => {
        console.error('Failed to load featured events', err);
        this.featuredEvents.set([]);
        this.isFeaturedLoading.set(false);
      },
    });
  }

  private startAutoRotate(): void {
    this.stopAutoRotate();
    this.randomTimer = window.setInterval(() => {
      this.applyRandomSelection();
    }, this.autoRotateInterval);
  }

  private stopAutoRotate(): void {
    if (this.randomTimer !== undefined) {
      window.clearInterval(this.randomTimer);
      this.randomTimer = undefined;
    }
  }

  private applyRandomSelection(): void {
    this.featuredEvents.set(this.pickRandomFeatured(this.allMappedEvents));
    this.featuredBatch.update((batch) => batch + 1);
  }

  private pickRandomFeatured(events: EventCard[]): EventCard[] {
    const shuffle = [...events].sort(() => Math.random() - 0.5);
    return shuffle.slice(0, Math.min(this.featuredCount, shuffle.length));
  }

  private pickRandomImage(): string {
    const index = Math.floor(Math.random() * this.imagePool.length);
    return this.imagePool[index];
  }
}
