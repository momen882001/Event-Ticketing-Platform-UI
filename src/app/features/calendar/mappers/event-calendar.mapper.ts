import { EventInput } from '@fullcalendar/core/index.js';
import { IEventResponse } from '../interfaces/event-interface';
import { getEventColors } from './event-colors';

export const mapEventToCalendar = (event: IEventResponse): EventInput => {
  const { id, title, startDateTime, endDateTime, status, ...extendedProps } = event;

  return {
    id: id.toString(),
    title,
    start: startDateTime ? new Date(startDateTime) : undefined,
    end: endDateTime ? new Date(endDateTime) : undefined,
    ...getEventColors(status),
    extendedProps: {
      status,
      ...extendedProps,
    },
  };
};
