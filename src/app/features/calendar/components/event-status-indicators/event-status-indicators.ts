import { Component } from '@angular/core';
import { EventStatusEnum } from '../../../../shared/enums/EventStatusEnum';

@Component({
  selector: 'app-event-status-indicators',
  imports: [],
  templateUrl: './event-status-indicators.html',
  styleUrl: './event-status-indicators.scss',
})
export class EventStatusIndicators {
  statuses = Object.values(EventStatusEnum);

  config = {
    [EventStatusEnum.PUBLISHED]: {
      label: 'Published',
      backgroundColor: '#6c4cf6',
      icon: 'bi bi-calendar-check',
    },

    [EventStatusEnum.SOLD_OUT]: {
      label: 'Sold Out',
      backgroundColor: '#f59e0b',
      icon: 'bi bi-ticket-perforated',
    },

    [EventStatusEnum.COMPLETED]: {
      label: 'Completed',
      backgroundColor: '#64748b',
      icon: 'bi bi-check-circle',
    },

    [EventStatusEnum.CANCELLED]: {
      label: 'Cancelled',
      backgroundColor: '#ef4444',
      icon: 'bi bi-x-circle',
    },
  };
}
