import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  form,
  FormField,
  maxLength,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SuccessMessages } from '../../../../core/constants/successMessages';
import { PageHero } from '../../../../shared/components/page-hero/page-hero';

interface ResetPasswordModel {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-reset-password',
  imports: [
    PageHero,
    RouterLink,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly hideOldPassword = signal(true);
  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);
  readonly submitAttempted = signal(false);
  readonly isSubmitting = signal(false);

  readonly resetPasswordModel = signal<ResetPasswordModel>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  readonly resetPasswordForm = form(
    this.resetPasswordModel,
    (schema) => {
      required(schema.oldPassword, {
        message: 'Current password is required',
      });

      minLength(schema.oldPassword, 8, {
        message: 'Password must be between 8 and 100 characters',
      });

      maxLength(schema.oldPassword, 100, {
        message: 'Password must be between 8 and 100 characters',
      });

      required(schema.newPassword, {
        message: 'New password is required',
      });

      minLength(schema.newPassword, 8, {
        message: 'Password must be between 8 and 100 characters',
      });

      maxLength(schema.newPassword, 100, {
        message: 'Password must be between 8 and 100 characters',
      });

      required(schema.confirmPassword, {
        message: 'Confirm password is required',
      });

      validate(schema.confirmPassword, ({ value, valueOf }) => {
        const password = valueOf(schema.newPassword);

        if (!value()) {
          return null;
        }

        return password === value()
          ? null
          : {
              kind: 'passwordsMismatch',
              message: 'Passwords do not match',
            };
      });
    },
  );

  protected toggleOldPasswordVisibility(): void {
    this.hideOldPassword.update((hidden) => !hidden);
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((hidden) => !hidden);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    this.resetPasswordForm().markAsTouched();

    if (this.resetPasswordForm().invalid()) {
      return;
    }

    const { oldPassword, newPassword } = this.resetPasswordModel();

    this.isSubmitting.set(true);

    this.authService.resetPassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.notificationService.success(SuccessMessages.passwordReset);
        this.authService.logout();
      },
      error: (err) => {
        console.log('err', err);
      },
      complete: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  protected fieldError(field: any): string | null {
    const errors = field().errors();

    if (!errors || (!field().touched() && !this.submitAttempted())) {
      return null;
    }

    return errors[0]?.message ?? null;
  }

  protected oldPasswordError(): string | null {
    return this.fieldError(this.resetPasswordForm.oldPassword);
  }

  protected newPasswordError(): string | null {
    return this.fieldError(this.resetPasswordForm.newPassword);
  }

  protected confirmPasswordError(): string | null {
    return this.fieldError(this.resetPasswordForm.confirmPassword);
  }

  protected readonly oldPasswordType = computed(() =>
    this.hideOldPassword() ? 'password' : 'text',
  );

  protected readonly passwordType = computed(() =>
    this.hidePassword() ? 'password' : 'text',
  );

  protected readonly confirmPasswordType = computed(() =>
    this.hideConfirmPassword() ? 'password' : 'text',
  );

  protected readonly oldPasswordToggleIcon = computed(() =>
    this.hideOldPassword() ? 'visibility_off' : 'visibility',
  );

  protected readonly passwordToggleIcon = computed(() =>
    this.hidePassword() ? 'visibility_off' : 'visibility',
  );

  protected readonly confirmPasswordToggleIcon = computed(() =>
    this.hideConfirmPassword() ? 'visibility_off' : 'visibility',
  );

  protected readonly oldPasswordToggleLabel = computed(() =>
    this.hideOldPassword() ? 'Show password' : 'Hide password',
  );

  protected readonly passwordToggleLabel = computed(() =>
    this.hidePassword() ? 'Show password' : 'Hide password',
  );

  protected readonly confirmPasswordToggleLabel = computed(() =>
    this.hideConfirmPassword() ? 'Show confirm password' : 'Hide confirm password',
  );
}
