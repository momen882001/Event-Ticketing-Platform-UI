import { Component, Input } from '@angular/core';

export interface EventCard {
  title: string;
  category: string;
  date: string;
  venue: string;
  price: string;
  image: string;
}

@Component({
  selector: 'app-event-card',
  imports: [],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss'
})
export class EventCardComponent {
  @Input({ required: true }) event!: EventCard;
}
