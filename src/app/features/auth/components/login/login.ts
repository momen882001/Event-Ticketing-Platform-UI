import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, required, minLength, maxLength, submit } from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../../core/services/auth.service';
import { StorageService } from '../../../../core/services/storage.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SuccessMessages } from '../../../../core/constants/successMessages';

interface LoginModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly storageService = inject(StorageService);
  private readonly notification = inject(NotificationService);

  readonly hidePassword = signal(true);
  readonly submitAttempted = signal(false);

  readonly returnUrl = signal('/dashboard');

  readonly loginModel = signal<LoginModel>({
    username: '',
    password: '',
  });

  readonly loginForm = form(this.loginModel, (schema) => {
    required(schema.username, {
      message: 'Username is required',
    });

    minLength(schema.username, 3, {
      message: 'Username must be between 3 and 50 characters',
    });

    maxLength(schema.username, 50, {
      message: 'Username must be between 3 and 50 characters',
    });

    required(schema.password, {
      message: 'Password is required',
    });

    minLength(schema.password, 8, {
      message: 'Password must be between 8 and 100 characters',
    });

    maxLength(schema.password, 100, {
      message: 'Password must be between 8 and 100 characters',
    });
  });

  constructor() {
    const url = this.activatedRoute.snapshot.queryParams['returnUrl'];

    if (url) {
      this.returnUrl.set(url);
    }
  }

  protected readonly passwordType = computed(() => (this.hidePassword() ? 'password' : 'text'));

  protected readonly passwordToggleIcon = computed(() =>
    this.hidePassword() ? 'visibility_off' : 'visibility',
  );

  protected readonly passwordToggleLabel = computed(() =>
    this.hidePassword() ? 'Show password' : 'Hide password',
  );

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    this.loginForm().markAsTouched();

    if (this.loginForm().invalid()) {
      return;
    }

    const { username, password } = this.loginModel();

    this.authService
      .login({
        username,
        password,
      })
      .subscribe({
        next: (res) => {
          this.storageService.setItem('userData', res);
        },

        error: (err) => {
          console.log('err', err);
        },
        complete: () => {
          this.notification.success(SuccessMessages.login);
          this.router.navigateByUrl(this.returnUrl());
        },
      });
  }

  protected usernameError(): string | null {
    const errors = this.loginForm.username().errors();

    if (!errors || (!this.loginForm.username().touched() && !this.submitAttempted())) {
      return null;
    }

    return errors[0]?.message ?? null;
  }

  protected passwordError(): string | null {
    const errors = this.loginForm.password().errors();

    if (!errors || (!this.loginForm.password().touched() && !this.submitAttempted())) {
      return null;
    }

    return errors[0]?.message ?? null;
  }
}
