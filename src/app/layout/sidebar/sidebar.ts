import { Component, Renderer2, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { ILoginResponse } from '../../features/auth/interfaces/AuthInterface';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserRoleEnum } from '../../shared/enums/UserRoleEnum';
import { NotificationService } from '../../core/services/notification.service';
import { SuccessMessages } from '../../core/constants/successMessages';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  constructor(
    private renderer: Renderer2,
    private authservice: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {}

  isAdmin(): boolean {
    return this.authservice.getUserData?.role === UserRoleEnum.ADMIN;
  }

  isOrganizer(): boolean {
    return this.authservice.getUserData?.role === UserRoleEnum.ORGANIZER;
  }
  isUser(): boolean {
    return this.authservice.getUserData?.role === UserRoleEnum.USER;
  }

  getFullname(): string {
    const userData = this.authservice.getUserData;
    return userData?.fullname || 'Admin Dashboard';
  }

  getUserRole(): string {
    return this.authservice.getUserData?.role as UserRoleEnum;
  }

  getDashboardTitleDependsRole(): string {
    switch (this.getUserRole()) {
      case UserRoleEnum.ADMIN:
        return 'Administrator';

      case UserRoleEnum.ORGANIZER:
        return 'Organizer';

      case UserRoleEnum.USER:
        return 'User';
    }
    return '';
  }

  toggleSidebar(): void {
    const body = document.querySelector('body');
    if (body) {
      if (body.classList.contains('toggle-sidebar')) {
        this.renderer.removeClass(body, 'toggle-sidebar');
      } else {
        this.renderer.addClass(body, 'toggle-sidebar');
      }
    }
  }

  logout(): void {
    this.authservice.logout();
    this.notificationService.success(SuccessMessages.logout);
  }
}
