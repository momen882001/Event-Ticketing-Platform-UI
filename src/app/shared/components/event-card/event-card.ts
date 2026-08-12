import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEventResponse } from '../../../features/calendar/interfaces/event-interface';
import { EventStatusEnum } from '../../enums/EventStatusEnum';

const DEFAULT_EVENT_IMAGE = 'assets/images/default-image.jpeg';

@Component({
  selector: 'app-event-card',
  imports: [CommonModule],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCardComponent {
  public EventStatusEnum = EventStatusEnum;

  private _event!: IEventResponse;

  @Input({ required: true })
  set event(value: IEventResponse) {
    this._event = value;
    this.displayImage = this.resolveImageUrl(value.imageUrl);
  }

  get event(): IEventResponse {
    return this._event;
  }

  @Output() book = new EventEmitter<IEventResponse>();

  protected displayImage = DEFAULT_EVENT_IMAGE;

  get lowestPrice(): string {
    const seats = this.event.seatCategories;
    if (!seats || seats.length === 0) return '—';
    const min = Math.min(...seats.map((s) => s.price));
    return `From $${min.toLocaleString()}`;
  }

  get formattedDate(): string {
    return new Date(this.event.startDateTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  get formattedTime(): string {
    return new Date(this.event.startDateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get categoryName(): string {
    // Backend may return category as `venue.category.name` instead of `venue.categoryName`.
    const venueAny = this.event.venue as unknown as {
      categoryName?: string;
      category?: { name?: string } | null;
    } | null;

    return venueAny?.categoryName ?? venueAny?.category?.name ?? '—';
  }

  get venueName(): string {
    const venueAny = this.event.venue as unknown as { name?: string } | null;
    return venueAny?.name ?? '—';
  }

  protected onImageError(): void {
    if (this.displayImage !== DEFAULT_EVENT_IMAGE) {
      this.displayImage = DEFAULT_EVENT_IMAGE;
    }
  }

  private resolveImageUrl(url?: string | null): string {
    const trimmed = url?.trim();
    return trimmed || DEFAULT_EVENT_IMAGE;
  }
}
