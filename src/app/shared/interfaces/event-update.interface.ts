import { IEventResponse } from '../../features/calendar/interfaces/event-interface';

export type EventUpdateType = 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_DELETED';

export interface IEventUpdate {
  type: EventUpdateType;
  eventId: number;
  event: IEventResponse | null;
  timestamp: string;
}
