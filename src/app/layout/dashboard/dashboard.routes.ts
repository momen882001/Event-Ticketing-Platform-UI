import { Routes } from '@angular/router';

import { Dashboard } from './dashboard';
import { AuthGuard } from '../../core/guards/auth.guard.service';
import { UserRoleEnum } from '../../shared/enums/UserRoleEnum';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: '',
        redirectTo: 'calendar',
        pathMatch: 'full',
      },

      // ============================
      // Calendar
      // ============================
      {
        path: 'calendar',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/calendar/components/calendar-landing-page').then(
                (c) => c.CalendarLandingPage,
              ),
          },
          {
            path: 'events/:eventId/booking',
            loadComponent: () =>
              import('../../features/bookings/components/event-booking/event-booking').then(
                (c) => c.EventBooking,
              ),
            canActivate: [AuthGuard],
            data: {
              roles: [UserRoleEnum.USER],
            },
          },
        ],
      },

      // ============================
      // Bookings
      // ============================
      {
        path: 'bookings',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/bookings/components/bookings').then((c) => c.Bookings),
            canActivate: [AuthGuard],
            data: {
              roles: [UserRoleEnum.USER],
            },
          },
          {
            path: ':bookingId/view',
            loadComponent: () =>
              import('../../features/bookings/components/view-booking/view-booking').then(
                (c) => c.ViewBooking,
              ),
            canActivate: [AuthGuard],
            data: {
              roles: [UserRoleEnum.USER],
            },
          },
          {
            path: ':bookingId/tickets',
            loadComponent: () =>
              import('../../features/tickets/components/tickets').then((c) => c.Tickets),
            canActivate: [AuthGuard],
            data: {
              roles: [UserRoleEnum.USER],
            },
          },
          {
            path: 'tickets/scan',
            loadComponent: () =>
              import('../../features/tickets/components/ticket-scanner/ticket-scanner').then(
                (c) => c.TicketScanner,
              ),
            canActivate: [AuthGuard],
            data: {
              roles: [UserRoleEnum.ADMIN, UserRoleEnum.ORGANIZER],
            },
          },
        ],
      },

      // ============================
      // Admin
      // ============================
      {
        path: 'users',
        loadComponent: () => import('../../features/users/components/users').then((c) => c.Users),
        canActivate: [AuthGuard],
        data: {
          roles: [UserRoleEnum.ADMIN],
        },
      },

      {
        path: 'categories',
        loadComponent: () =>
          import('../../features/categories/components/categories').then((c) => c.Categories),
        canActivate: [AuthGuard],
        data: {
          roles: [UserRoleEnum.ADMIN],
        },
      },

      {
        path: 'venues',
        loadComponent: () =>
          import('../../features/venues/components/venues').then((c) => c.Venues),
        canActivate: [AuthGuard],
        data: {
          roles: [UserRoleEnum.ADMIN],
        },
      },

      // ============================
      // User
      // ============================
      {
        path: 'user-profile',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/users/components/user-profile/user-profile').then(
                (c) => c.UserProfile,
              ),
          },
          {
            path: 'reset-password',
            loadComponent: () =>
              import('../../features/users/components/reset-password/reset-password').then(
                (c) => c.ResetPassword,
              ),
          },
        ],
      },
    ],
  },

  // ============================
  // Root redirect
  // ============================
  {
    path: '',
    redirectTo: 'dashboard/calendar',
    pathMatch: 'full',
  },
];
