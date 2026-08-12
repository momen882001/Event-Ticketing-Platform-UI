import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../layout/navbar/navbar';
import { InfoComponent } from './info/info';
import { EventCardComponent } from '../../../shared/components/event-card/event-card';
import { UsersService } from '../../../core/services/users.service';
import { IEventResponse } from '../../calendar/interfaces/event-interface';
import { EventStatusEnum } from '../../../shared/enums/EventStatusEnum';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterLink, NavbarComponent, InfoComponent, EventCardComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage implements OnInit, OnDestroy {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  protected readonly featuredEvents = signal<IEventResponse[]>([]);
  protected readonly isFeaturedLoading = signal(true);
  protected readonly featuredBatch = signal(0);

  private readonly featuredCount = 3;
  private readonly autoRotateInterval = 10000;

  private randomTimer?: number;
  private allEvents: IEventResponse[] = [];

  ngOnInit(): void {
    this.loadFeaturedEvents();
  }

  ngOnDestroy(): void {
    this.stopAutoRotate();
  }

  onBookEvent(event: IEventResponse): void {
    this.router.navigate(['/dashboard', 'calendar', 'events', event.id, 'booking']);
  }

  private loadFeaturedEvents(): void {
    this.usersService.getAllEvents(0, 30, 'startDateTime,desc').subscribe({
      next: (page) => {
        this.allEvents = (page.content ?? []).filter((event) => this.isPublished(event));
        this.featuredEvents.set(this.pickRandomFeatured(this.allEvents));
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
      this.featuredEvents.set(this.pickRandomFeatured(this.allEvents));
      this.featuredBatch.update((batch) => batch + 1);
    }, this.autoRotateInterval);
  }

  private stopAutoRotate(): void {
    if (this.randomTimer !== undefined) {
      window.clearInterval(this.randomTimer);
      this.randomTimer = undefined;
    }
  }

  private pickRandomFeatured(events: IEventResponse[]): IEventResponse[] {
    const shuffle = [...events].sort(() => Math.random() - 0.5);
    return shuffle.slice(0, Math.min(this.featuredCount, shuffle.length));
  }

  private isPublished(event: IEventResponse): boolean {
    return String(event.status).toUpperCase() === EventStatusEnum.PUBLISHED;
  }
}
