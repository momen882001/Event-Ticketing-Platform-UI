import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventApi,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventStatusEnum } from '../../../shared/enums/EventStatusEnum';
import {
  IEventFormResult,
  IEventResponse,
  IEventUpdateFormResult,
} from '../interfaces/event-interface';
import { EventStatusIndicators } from './event-status-indicators/event-status-indicators';
import { mapEventToCalendar } from '../mappers/event-calendar.mapper';
import { ViewEvent } from './view-event/view-event';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesService } from '../../../core/services/categories.service';
import { VenuesService } from '../../../core/services/venues.service';
import { EventCalendarFilter } from './event-calendar-filter/event-calendar-filter';
import { ICalendarFilter, ICalendarMenuAction } from '../interfaces/calendar-interface';
import { ICategoryResponse } from '../../categories/interfaces/category-interface';
import { IVenueResponse } from '../../venues/interfaces/venue-interface';
import { EventsService } from '../../../core/services/events.service';
import { EventWebSocketService } from '../../../core/services/event-websocket.service';
import { AddEditEvent } from './add-edit-event/add-edit-event';
import { NotificationService } from '../../../core/services/notification.service';
import { SuccessMessages } from '../../../core/constants/successMessages';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { UserRoleEnum } from '../../../shared/enums/UserRoleEnum';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { IConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog';
import { IEventUpdate } from '../../../shared/interfaces/event-update.interface';

@Component({
  selector: 'app-calendar-landing-page',
  imports: [
    FullCalendarModule,
    EventStatusIndicators,
    EventCalendarFilter,
    MatMenuModule,
    MatDividerModule,
    DatePipe,
  ],
  templateUrl: './calendar-landing-page.html',
  styleUrl: './calendar-landing-page.scss',
})
export class CalendarLandingPage implements OnInit, OnDestroy {
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
  clickedEvent = signal<EventApi | null>(null);
  menuOpen = signal(false);
  menuPosition = signal({
    x: 0,
    y: 0,
  });

  private eventUpdatesSubscription?: Subscription;

  @ViewChild('calendarMenu')
  calendarMenu!: ElementRef<HTMLElement>;

  calendarEvents = computed(() => this.events().map(mapEventToCalendar));
  totalEventsLength = computed(() => this.events().length);

  isAdmin = computed(() => this.authService.getUserRole() === UserRoleEnum.ADMIN);
  isOrganizer = computed(() => this.authService.getUserRole() === UserRoleEnum.ORGANIZER);
  isUser = computed(() => this.authService.getUserRole() === UserRoleEnum.USER);

  menuActions = computed<ICalendarMenuAction[]>(() => [
    {
      label: 'View Event',
      icon: 'bi-eye',
      color: 'var(--app-primary)',
      action: () => this.onViewEvent(),
    },

    {
      label: 'Edit Event',
      icon: 'bi-pencil-square',
      color: 'var(--app-warning)',
      isVisible: () => {
        const event = this.clickedEvent();
        const status = event?.extendedProps['status'];

        const isAllowedUser =
          this.isAdmin() ||
          (this.isOrganizer() &&
            this.authService.getUserData?.userId === event?.extendedProps['organizerId']);

        const isActiveEvent = status == EventStatusEnum.PUBLISHED;

        return isAllowedUser && isActiveEvent && !event?.extendedProps['hasBookings'];
      },
      action: () => this.onEditEvent(),
    },

    {
      label: 'Book Event',
      icon: 'bi-ticket-perforated',
      color: 'var(--app-success)',
      isVisible: () =>
        this.isUser() && this.clickedEvent()?.extendedProps['status'] == EventStatusEnum.PUBLISHED,
      action: () => this.onBookEvent(),
    },
    {
      label: 'Delete Event',
      icon: 'bi-trash3',
      type: 'danger',
      color: 'var(--app-danger)',
      isVisible: () => this.isAdmin(),
      action: () => this.onDeleteEvent(),
    },
    {
      label: 'Cancel Event',
      icon: 'bi-x-circle',
      type: 'danger',
      color: 'var(--app-danger)',
      isVisible: () => {
        const event = this.clickedEvent();
        const status = event?.extendedProps['status'];

        const isAllowedUser =
          this.isAdmin() ||
          (this.isOrganizer() &&
            this.authService.getUserData?.userId === event?.extendedProps['organizerId']);

        const isActiveEvent =
          status !== EventStatusEnum.CANCELLED && status !== EventStatusEnum.COMPLETED;

        return isAllowedUser && isActiveEvent;
      },
      action: () => this.onCancelEvent(),
    },
  ]);

  constructor(
    private dialog: MatDialog,
    private categoriesService: CategoriesService,
    private venuesService: VenuesService,
    private eventsService: EventsService,
    private eventWebSocketService: EventWebSocketService,
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
    this.listenToEventUpdates();
  }

  ngOnDestroy(): void {
    this.eventUpdatesSubscription?.unsubscribe();
    this.eventWebSocketService.disconnect();
  }

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    height: '100vh',
    expandRows: true,
    stickyHeaderDates: true,
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
    eventClick: (info) => this.onOpenMenu(info),
    selectAllow: (selectInfo) => {
      return selectInfo.start >= new Date();
    },
    slotLaneClassNames: ({ date }) => (date && date < new Date() ? ['fc-slot-past'] : []),
    dayCellClassNames: (arg) =>
      arg.date < new Date(new Date().setHours(0, 0, 0, 0)) ? ['fc-day-past-custom'] : [],
    select: (info) => this.onSelectedDateTimeRange(info),
    // eventDrop: (info) => console.log('Event moved:', info.event.title, info.event.startStr),
  });

  onOpenMenu(clickInfo: EventClickArg) {
    console.log(clickInfo.event, 'clickInfo event');

    this.clickedEvent.set(clickInfo.event);

    const rect = clickInfo.el.getBoundingClientRect();

    // open temporarily
    this.menuOpen.set(true);

    setTimeout(() => {
      const menu = this.calendarMenu.nativeElement;

      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;

      const OFFSET = 8;

      let x = rect.right + OFFSET;
      let y = rect.top;

      // right overflow
      if (x + menuWidth > window.innerWidth) {
        x = rect.left - menuWidth - OFFSET;
      }

      // bottom overflow
      if (y + menuHeight > window.innerHeight) {
        y = rect.bottom - menuHeight;
      }

      // keep inside viewport
      x = Math.max(OFFSET, x);
      y = Math.max(OFFSET, y);

      this.menuPosition.set({
        x,
        y,
      });
    });
  }

  onViewEvent() {
    console.log(this.clickedEvent(), 'infoooo');

    this.dialog.open(ViewEvent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'event-dialog',
      autoFocus: false,
      data: this.clickedEvent(),
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

    dialogRef.afterClosed().subscribe((result: IEventFormResult) => {
      if (result) {
        this.eventsService.createEvent(result.data, result.image).subscribe({
          next: (response) => {
            console.log('Event created:', response);
            this.notificationService.success(SuccessMessages.eventCreated);
            // this.loadAllEvents();
          },
          error: (error) => {
            console.error('Error creating event:', error);
          },
        });
      }
    });
  }

  // ------------------------------- Private Methods -------------------------------

  private listenToEventUpdates(): void {
    this.eventWebSocketService.connect();

    this.eventUpdatesSubscription = this.eventWebSocketService.updates$.subscribe((update) => {
      this.applyEventUpdate(update);
    });
  }

  private applyEventUpdate(update: IEventUpdate): void {
    if (update.type === 'EVENT_DELETED') {
      this.events.update((events) => events.filter((event) => event.id !== update.eventId));
      return;
    }

    if (!update.event) {
      return;
    }

    const updatedEvent = update.event;
    const matchesFilter = this.eventMatchesFilter(updatedEvent, this.filterObject());

    this.events.update((events) => {
      const index = events.findIndex((event) => event.id === update.eventId);

      if (index >= 0) {
        if (!matchesFilter) {
          return events.filter((event) => event.id !== update.eventId);
        }

        const next = [...events];
        next[index] = updatedEvent;
        return next;
      }

      if (matchesFilter && (update.type === 'EVENT_CREATED' || update.type === 'EVENT_UPDATED')) {
        return [updatedEvent, ...events];
      }

      return events;
    });
  }

  private eventMatchesFilter(event: IEventResponse, filter: ICalendarFilter): boolean {
    const search = filter.search?.trim().toLowerCase();

    if (search) {
      const matchesSearch =
        event.title.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search);

      if (!matchesSearch) {
        return false;
      }
    }

    if (filter.categoryId != null && event.categoryId !== filter.categoryId) {
      return false;
    }

    if (filter.venueId != null && event.venue?.id !== filter.venueId) {
      return false;
    }

    if (filter.status != null && event.status !== filter.status) {
      return false;
    }

    return true;
  }

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

  private onEditEvent(): void {
    const responseEvent = this.mapClickedEventToResponse(this.clickedEvent() as EventApi);
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
        venueId: responseEvent.venue.id,
        startDateTime: this.formatLocalDateTime(this.clickedEvent()?.start as Date),
        endDateTime: this.formatLocalDateTime(this.clickedEvent()?.end as Date),
        event: responseEvent,
      },
    });

    dialogRef.afterClosed().subscribe((result: IEventUpdateFormResult) => {
      if (result) {
        this.eventsService
          .updateEvent(result.data, Number(this.clickedEvent()?.id), result.image)
          .subscribe({
            next: (response) => {
              console.log('Event updated:', response);
              this.notificationService.success(SuccessMessages.eventUpdated);
              // this.loadAllEvents();
            },
            error: (error) => {
              console.error('Error creating event:', error);
            },
          });
      }
    });
  }

  private onCancelEvent(): void {
    const event = this.clickedEvent();

    if (!event) {
      return;
    }

    const dialogRef = this.dialog.open<ConfirmationDialog, IConfirmationDialogData, boolean>(
      ConfirmationDialog,
      {
        panelClass: 'confirmation-dialog-panel',

        data: {
          title: 'Cancel event?',
          message:
            'The event will be marked as cancelled and users will no longer be able to book it.',
          confirmText: 'Cancel Event',
          cancelText: 'Keep Event',
          icon: 'bi-calendar-x',
          type: 'warning',
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.eventsService.cancelEvent(+event.id).subscribe({
        next: (res) => {
          this.notificationService.success(SuccessMessages.eventCanceled);
          // this.loadAllEvents();
        },
        error: (err) => {
          console.log(err);
        },
      });
    });
  }

  private onDeleteEvent(): void {
    const event = this.clickedEvent();

    if (!event) {
      return;
    }

    const dialogRef = this.dialog.open<ConfirmationDialog, IConfirmationDialogData, boolean>(
      ConfirmationDialog,
      {
        panelClass: 'confirmation-dialog-panel',

        data: {
          title: 'Delete event?',
          message: 'This action will permanently delete the event. This cannot be undone.',
          confirmText: 'Delete Event',
          cancelText: 'Keep Event',
          icon: 'bi-trash3',
          type: 'danger',
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.eventsService.deleteEvent(+event.id).subscribe({
        next: (res) => {
          this.notificationService.success(SuccessMessages.eventDeleted);
          // this.loadAllEvents();
        },
        error: (err) => {
          console.log(err);
        },
      });
    });
  }

  private onBookEvent(): void {
    this.router.navigate(['/dashboard', 'calendar', 'events', this.clickedEvent()?.id, 'booking']);
  }

  private mapClickedEventToResponse(event: EventApi): IEventResponse {
    const props = event.extendedProps as Partial<IEventResponse>;

    return {
      id: Number(event.id),
      organizerId: props.organizerId!,
      venue: props.venue!,
      categoryId: props.categoryId!,
      title: event.title,
      description: props.description!,
      startDateTime: this.formatLocalDateTime(event.start!),
      endDateTime: this.formatLocalDateTime(event.end!),
      status: props.status!,
      createdAt: props.createdAt!,
      updatedAt: props.updatedAt!,
      seatCategories: props.seatCategories!,
      imageUrl: props.imageUrl!,
      hasBookings: props.hasBookings as boolean,
    };
  }

  @HostListener('window:scroll')
  onScroll() {
    this.menuOpen.set(false);
  }
}
