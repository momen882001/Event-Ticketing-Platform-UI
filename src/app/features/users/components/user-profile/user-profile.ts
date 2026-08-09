import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SuccessMessages } from '../../../../core/constants/successMessages';
import { PageHero } from '../../../../shared/components/page-hero/page-hero';
import { UserRoleEnum } from '../../../../shared/enums/UserRoleEnum';

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    PageHero,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // Signals for user data
  readonly fullname = signal<string>(this.authService.getUserData?.fullname || '');
  readonly username = signal<string>(this.authService.getUserData?.username || '');
  readonly email = signal<string>(this.authService.getUserData?.email || '');
  readonly role = signal<string>(this.authService.getUserData?.role || '');

  // Computed display helpers
  readonly roleLabel = computed(() => {
    switch (this.role()) {
      case UserRoleEnum.ADMIN:
        return 'Administrator';
      case UserRoleEnum.ORGANIZER:
        return 'Organizer';
      case UserRoleEnum.USER:
        return 'User';
      default:
        return this.role();
    }
  });

  readonly roleClass = computed(() => this.role().toLowerCase());

  // Navigation to reset password page
  goToResetPassword(): void {
    this.router.navigate(['/dashboard/user-profile/reset-password']);
  }
}
