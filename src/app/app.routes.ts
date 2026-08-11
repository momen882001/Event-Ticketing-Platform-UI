import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/guest/components/homepage').then((c) => c.Homepage),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./features/guest/components/event-view-all/event-view-all').then(
        (c) => c.EventViewAllComponent,
      ),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./layout/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized').then((c) => c.Unauthorized),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then((c) => c.NotFound),
  },
];
