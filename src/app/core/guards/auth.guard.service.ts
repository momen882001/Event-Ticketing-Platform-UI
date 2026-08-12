import { Injectable } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const hasToken = this.authService.hasUserToken();

    /*
      Guest routes:
      login, register, forgot password
    */

    const guestOnly = route.data['guestOnly'];

    if (guestOnly) {
      if (hasToken) {
        return this.router.createUrlTree(['/']);
      }

      return true;
    }

    /*
      Protected routes:
      dashboard, books, orders...
    */

    if (!hasToken) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: {
          returnUrl: state.url,
        },
      });
    }

    /*
      Role authorization
    */

    const requiredRoles = route.data['roles'];

    if (requiredRoles?.length) {
      const userRole = this.authService.getUserRole();

      if (!requiredRoles.includes(userRole)) {
        return this.router.createUrlTree(['/unauthorized']);
      }
    }

    return true;
  }
}
