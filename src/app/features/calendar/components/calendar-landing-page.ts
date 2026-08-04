import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventStatusEnum } from '../../../shared/enums/EventStatusEnum';
import { IEventResponse } from '../interfaces/event-interface';
import { EventStatusIndicators } from './event-status-indicators/event-status-indicators';
import { mapEventToCalendar } from '../mappers/event-calendar.mapper';
import { ViewEvent } from './view-event/view-event';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesService } from '../../../core/services/categories.service';
import { VenuesService } from '../../../core/services/venues.service';
import { EventCalendarFilter } from './event-calendar-filter/event-calendar-filter';
import { ICalendarFilter } from '../interfaces/calendar-interface';
import { ICategoryResponse } from '../../categories/interfaces/category-interface';
import { IVenueResponse } from '../../venues/interfaces/venue-interface';
import { EventsService } from '../../../core/services/events.service';

@Component({
  selector: 'app-calendar-landing-page',
  imports: [FullCalendarModule, EventStatusIndicators, EventCalendarFilter],
  templateUrl: './calendar-landing-page.html',
  styleUrl: './calendar-landing-page.scss',
})
export class CalendarLandingPage implements OnInit {
  // events = signal<IEventResponse[]>([
  //   {
  //     id: 1,
  //     organizerId: 2,
  //     venueId: 1,
  //     categoryId: 1,
  //     title: 'Tech Conference 2026',
  //     description: 'Annual software engineering conference.',
  //     startDateTime: '2026-08-04T09:00:00',
  //     endDateTime: '2026-08-04T17:00:00',
  //     status: EventStatusEnum.PUBLISHED,
  //     createdAt: '2026-07-01T10:15:00',
  //     updatedAt: '2026-07-20T15:30:00',
  //     seatCategories: [
  //       {
  //         id: 1,
  //         eventId: 1,
  //         eventTitle: 'Tech Conference 2026',
  //         name: 'VIP',
  //         price: 1500,
  //         totalSeats: 50,
  //         availableSeats: 18,
  //       },
  //       {
  //         id: 2,
  //         eventId: 1,
  //         eventTitle: 'Tech Conference 2026',
  //         name: 'Regular',
  //         price: 600,
  //         totalSeats: 250,
  //         availableSeats: 120,
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     organizerId: 3,
  //     venueId: 2,
  //     categoryId: 2,
  //     title: 'Wedding Celebration',
  //     description: 'Private wedding event.',
  //     startDateTime: '2026-08-06T18:00:00',
  //     endDateTime: '2026-08-06T23:30:00',
  //     status: EventStatusEnum.SOLD_OUT,
  //     createdAt: '2026-06-15T13:00:00',
  //     updatedAt: '2026-07-25T12:10:00',
  //     seatCategories: [
  //       {
  //         id: 3,
  //         eventId: 2,
  //         eventTitle: 'Wedding Celebration',
  //         name: 'Guests',
  //         price: 0,
  //         totalSeats: 300,
  //         availableSeats: 0,
  //       },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     organizerId: 1,
  //     venueId: 3,
  //     categoryId: 4,
  //     title: 'Music Festival',
  //     description: 'Outdoor live concert.',
  //     startDateTime: '2026-08-08T19:00:00',
  //     endDateTime: '2026-08-09T01:00:00',
  //     status: EventStatusEnum.PUBLISHED,
  //     createdAt: '2026-05-20T09:30:00',
  //     updatedAt: '2026-07-28T11:45:00',
  //     seatCategories: [
  //       {
  //         id: 4,
  //         eventId: 3,
  //         eventTitle: 'Music Festival',
  //         name: 'Front Stage',
  //         price: 2200,
  //         totalSeats: 80,
  //         availableSeats: 15,
  //       },
  //       {
  //         id: 5,
  //         eventId: 3,
  //         eventTitle: 'Music Festival',
  //         name: 'General',
  //         price: 900,
  //         totalSeats: 500,
  //         availableSeats: 220,
  //       },
  //     ],
  //   },
  //   {
  //     id: 4,
  //     organizerId: 5,
  //     venueId: 4,
  //     categoryId: 3,
  //     title: 'Business Workshop',
  //     description: 'Leadership and management workshop.',
  //     startDateTime: '2026-08-02T09:00:00',
  //     endDateTime: '2026-08-02T16:00:00',
  //     status: EventStatusEnum.COMPLETED,
  //     createdAt: '2026-06-10T08:00:00',
  //     updatedAt: '2026-08-02T17:00:00',
  //     seatCategories: [
  //       {
  //         id: 6,
  //         eventId: 4,
  //         eventTitle: 'Business Workshop',
  //         name: 'Standard',
  //         price: 750,
  //         totalSeats: 120,
  //         availableSeats: 0,
  //       },
  //     ],
  //   },
  //   {
  //     id: 5,
  //     organizerId: 4,
  //     venueId: 5,
  //     categoryId: 5,
  //     title: 'Startup Pitch Day',
  //     description: 'Cancelled due to organizer request.',
  //     startDateTime: '2026-08-10T10:00:00',
  //     endDateTime: '2026-08-10T15:00:00',
  //     status: EventStatusEnum.CANCELLED,
  //     createdAt: '2026-07-12T10:00:00',
  //     updatedAt: '2026-07-30T14:20:00',
  //     seatCategories: [
  //       {
  //         id: 7,
  //         eventId: 5,
  //         eventTitle: 'Startup Pitch Day',
  //         name: 'Attendee',
  //         price: 300,
  //         totalSeats: 150,
  //         availableSeats: 150,
  //       },
  //     ],
  //   },
  // ]);

  events = signal<IEventResponse[]>([]);
  allCategories = signal<ICategoryResponse[]>([]);
  allVenues = signal<IVenueResponse[]>([]);
  filterObject = signal<ICalendarFilter>({
    search: '',
    categoryId: null,
    venueId: null,
    status: null,
  });
  loadingVenues = signal<boolean>(false);

  calendarEvents = computed(() => this.events().map(mapEventToCalendar));

  constructor(
    private dialog: MatDialog,
    private categoriesService: CategoriesService,
    private venuesService: VenuesService,
    private eventsService: EventsService,
  ) {
    effect(() => {
      this.calendarOptions.update((options) => ({
        ...options,
        events: this.calendarEvents(),
      }));
    });
  }

  ngOnInit(): void {
    this.loadAllEvents();
    this.loadAllCategories();
    this.loadAllVenues();
  }

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    height: 'auto',
    expandRows: true,
    nowIndicator: true,
    dayMaxEvents: true,
    weekends: true,
    selectable: true,
    editable: false,
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

    events: [],
    eventClick: (info) => this.onViewEvent(info),
    selectAllow: (selectInfo) => {
      return selectInfo.start >= new Date();
    },
    slotLaneClassNames: ({ date }) => (date && date < new Date() ? ['fc-slot-past'] : []),
    dayCellClassNames: (arg) =>
      arg.date < new Date(new Date().setHours(0, 0, 0, 0)) ? ['fc-day-past-custom'] : [],
    // select: (info) => console.log('Slot selected:', info.jsEvent, info.startStr, info.endStr),
    // eventDrop: (info) => console.log('Event moved:', info.event.title, info.event.startStr),
  });

  onViewEvent(info: EventClickArg) {
    console.log(info, 'infoooo');

    this.dialog.open(ViewEvent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'event-dialog',
      autoFocus: false,
      data: info.event,
    });
  }

  onFilterChanged(filterObject: ICalendarFilter): void {
    this.filterObject.set(filterObject);
    this.loadAllEvents(filterObject);
    console.log('Filter changed:', filterObject);
  }

  onCategoryChanged(categoryId: number | null): void {
    if (categoryId === null) {
      this.loadAllVenues();
      return;
    }
    this.venuesService.getAllVenuesByCategoryId(categoryId).subscribe({
      next: (response) => {
        this.allVenues.set(response);
      },
      error: (error) => {
        console.error('Error loading venues by category:', error);
      },
    });
  }

  // ------------------------------- Private Methods -------------------------------

  private loadAllEvents(filterObject?: ICalendarFilter) {
    this.eventsService.getAllEvents(filterObject).subscribe({
      next: (response) => {
        this.events.set(response);
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  private loadAllCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        this.allCategories.set(response);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  private loadAllVenues() {
    this.loadingVenues.set(true);
    this.venuesService.getAllVenues().subscribe({
      next: (response) => {
        this.allVenues.set(response);
        this.loadingVenues.set(false);
      },
      error: (error) => {
        console.error('Error loading venues:', error);
      },
    });
  }
}
