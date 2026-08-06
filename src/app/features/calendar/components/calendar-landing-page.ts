import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
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
import { AddEditEvent } from './add-edit-event/add-edit-event';
import { NotificationService } from '../../../core/services/notification.service';
import { SuccessMessages } from '../../../core/constants/successMessages';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar-landing-page',
  imports: [FullCalendarModule, EventStatusIndicators, EventCalendarFilter],
  templateUrl: './calendar-landing-page.html',
  styleUrl: './calendar-landing-page.scss',
})
export class CalendarLandingPage implements OnInit {
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
  totalEventsLength = computed(() => this.events().length);

  constructor(
    private dialog: MatDialog,
    private categoriesService: CategoriesService,
    private venuesService: VenuesService,
    private eventsService: EventsService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
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
    this.updateCalendarSelectableOption();
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
    select: (info) => this.onSelectedDateTimeRange(info),
    // eventDrop: (info) => console.log('Event moved:', info.event.title, info.event.startStr),
  });

  onViewEvent(info: EventClickArg) {
    console.log(info, 'infoooo');
    this.router.navigate(['/dashboard', 'calendar', 'events', info.event.id, 'booking']);

    // this.dialog.open(ViewEvent, {
    //   width: '800px',
    //   maxWidth: '95vw',
    //   maxHeight: '90vh',
    //   panelClass: 'event-dialog',
    //   autoFocus: false,
    //   data: info.event,
    // });
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

  onSelectedDateTimeRange(info: DateSelectArg): void {
    if (!this.filterObject().venueId) {
      this.notificationService.info(SuccessMessages.shouldSelectVenue);
      return;
    }

    const dialogRef = this.dialog.open(AddEditEvent, {
      width: '550px',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'event-drawer-dialog',
      position: {
        right: '0',
        top: '0',
      },

      data: {
        venueId: this.filterObject().venueId,
        startDateTime: this.formatLocalDateTime(info.start),

        endDateTime: this.formatLocalDateTime(info.end),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.eventsService.createEvent(result).subscribe({
        next: (response) => {
          console.log('Event created:', response);
          this.loadAllEvents();
        },
        error: (error) => {
          console.error('Error creating event:', error);
        },
      });
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

  private formatLocalDateTime(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}:00`;
  }

  private isSelectableDependsRole(): boolean {
    const userRole = this.authService.getUserRole();
    console.log(userRole, 'userRole');
    return userRole === 'ADMIN' || userRole === 'ORGANIZER';
  }

  private updateCalendarSelectableOption(): void {
    this.calendarOptions.update((options) => ({
      ...options,
      selectable: this.isSelectableDependsRole(),
    }));
  }
}
