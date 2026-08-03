import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

@Component({
  selector: 'app-calendar-landing-page',
  imports: [FullCalendarModule],
  templateUrl: './calendar-landing-page.html',
  styleUrl: './calendar-landing-page.scss',
})
export class CalendarLandingPage {
  // calendarOptions: CalendarOptions = {
  //   plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  //   initialView: 'timeGridWeek',
  //   headerToolbar: {
  //     left: 'prev,next today',
  //     center: 'title',
  //     right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  //   },
  //   selectable: true,
  //   editable: true,
  //   events: [
  //     { title: 'Wedding - Grand Hall', start: '2026-08-02', end: '2026-08-03' },
  //     { title: 'Conference - Room A', start: '2026-08-05T09:00', end: '2026-08-05T17:00' },
  //     { title: 'Birthday Party - Terrace', start: '2026-08-08T18:00', end: '2026-08-08T22:00' },
  //   ],
  //   eventClick: (info) => console.log('Event clicked:', info.event.title),
  //   select: (info) => console.log('Slot selected:', info.startStr, info.endStr),
  //   eventDrop: (info) => console.log('Event moved:', info.event.title, info.event.startStr),
  // };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    height: 'auto',
    expandRows: true,
    nowIndicator: true,
    dayMaxEvents: true,
    weekends: true,
    selectable: true,
    editable: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '24:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,

    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    },

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },

    events: [
      {
        title: 'Wedding - Grand Hall',
        start: '2026-08-02',
        end: '2026-08-03',
      },
      {
        title: 'Conference - Room A',
        start: '2026-08-05T09:00',
        end: '2026-08-05T17:00',
      },
      {
        title: 'Birthday Party - Terrace',
        start: '2026-08-08T18:00',
        end: '2026-08-08T22:00',
      },
    ],
  };
}
