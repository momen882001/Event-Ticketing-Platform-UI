import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { UserRoleEnum } from '../../shared/enums/UserRoleEnum';
import { AuthGuard } from '../../core/guards/auth.guard.service';

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
      {
        path: 'calendar',
        loadComponent: () =>
          import('../../features/calendar/components/calendar-landing-page').then(
            (c) => c.CalendarLandingPage,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'calendar/events/:eventId/booking',
        loadComponent: () =>
          import('../../features/bookings/components/event-booking/event-booking').then(
            (c) => c.EventBooking,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('../../features/bookings/components/bookings').then((c) => c.Bookings),
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings/:bookingId/view',
        loadComponent: () =>
          import('../../features/bookings/components/view-booking/view-booking').then(
            (c) => c.ViewBooking,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'user-profile',
        loadComponent: () =>
          import('../../features/users/components/user-profile/user-profile').then(
            (c) => c.UserProfile,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'user-profile/reset-password',
        loadComponent: () =>
          import('../../features/users/components/reset-password/reset-password').then(
            (c) => c.ResetPassword,
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: '',
    redirectTo: 'dashboard/calendar',
    pathMatch: 'full',
  },
];
