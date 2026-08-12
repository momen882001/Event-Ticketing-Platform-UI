import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);

  protected readonly isLoggedIn = computed(() => this.authService.hasUserToken());

  onLogout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
