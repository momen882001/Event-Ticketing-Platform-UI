import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventStatusEnum } from '../../enums/EventStatusEnum';

export interface EventCard {
  id?: number;
  title: string;
  category: string;
  date: string;
  venue: string;
  price: string;
  image: string;
  status: string;
}

@Component({
  selector: 'app-event-card',
  imports: [],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
})
export class EventCardComponent {
  public EventStatusEnum = EventStatusEnum;
  @Input({ required: true }) event!: EventCard;
  @Output() book = new EventEmitter<EventCard>();
}
