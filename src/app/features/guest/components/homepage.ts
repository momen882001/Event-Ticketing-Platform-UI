import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../../../layout/navbar/navbar';
import { InfoComponent } from './info/info';
import { EventCardComponent, EventCard } from '../../../shared/components/event-card/event-card';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterLink, NavbarComponent, InfoComponent, EventCardComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected featuredEvents: EventCard[] = [];
  protected isFeaturedLoading = true;
  protected featuredBatch = 0;

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
    if (this.authService.hasUserToken()) {
      this.router.navigate(['/dashboard']);
    }

    this.loadFeaturedEvents();
  }

  ngOnDestroy(): void {
    this.stopAutoRotate();
  }

  private loadFeaturedEvents(): void {
    forkJoin({
      events: this.usersService.getAllEvents(0, 20, 'startDateTime,desc'),
      categories: this.usersService.getAllCategories(),
      venues: this.usersService.getPagedVenues(0, 50, 'name,asc'),
    }).subscribe({
      next: ({ events, categories, venues }) => {
        const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
        const venueMap = new Map(venues.content.map((venue) => [venue.id, venue.name]));

        const mapped = (events.content ?? []).map((event) => ({
          title: event.title,
          category: categoryMap.get(event.categoryId) ?? `Category ${event.categoryId}`,
          date: new Date(event.startDateTime).toLocaleString(),
          venue: venueMap.get(event.venueId) ?? `Venue ${event.venueId}`,
          price: '—',
          image: this.pickRandomImage(),
        }));

        this.allMappedEvents = mapped;
        this.featuredEvents = this.pickRandomFeatured(mapped);
        this.featuredBatch++;
        this.isFeaturedLoading = false;
        this.changeDetectorRef.markForCheck();
        this.startAutoRotate();
      },
      error: () => {
        this.featuredEvents = [];
        this.isFeaturedLoading = false;
        this.changeDetectorRef.markForCheck();
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
    this.featuredEvents = this.pickRandomFeatured(this.allMappedEvents);
    this.featuredBatch++;
    this.changeDetectorRef.markForCheck();
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
