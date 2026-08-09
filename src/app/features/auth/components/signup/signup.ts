import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  required,
  submit,
  validate,
} from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../../core/services/auth.service';
import { UserRoleEnum } from '../../../../shared/enums/UserRoleEnum';
import { NotificationService } from '../../../../core/services/notification.service';
import { SuccessMessages } from '../../../../core/constants/successMessages';

const NAME_PATTERN = /^[a-zA-Z\s'-]+$/;

interface SignupModel {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-signup',
  imports: [
    RouterLink,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly hidePassword = signal(true);

  readonly hideConfirmPassword = signal(true);

  readonly submitAttempted = signal(false);

  readonly signupModel = signal<SignupModel>({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  readonly signupForm = form(
    this.signupModel,

    (schema) => {
      required(schema.fullname, {
        message: 'Full name is required',
      });

      minLength(schema.fullname, 2, {
        message: 'Full name must be between 2 and 100 characters',
      });

      maxLength(schema.fullname, 100, {
        message: 'Full name must be between 2 and 100 characters',
      });

      pattern(schema.fullname, NAME_PATTERN, {
        message: 'Only letters, spaces, - and apostrophes are allowed.',
      });

      required(schema.username, {
        message: 'Username is required',
      });

      minLength(schema.username, 3, {
        message: 'Username must be between 3 and 50 characters',
      });

      maxLength(schema.username, 50, {
        message: 'Username must be between 3 and 50 characters',
      });

      required(schema.email, {
        message: 'Email is required',
      });

      email(schema.email, {
        message: 'Please enter a valid email (example: name@example.com)',
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

      required(schema.confirmPassword, {
        message: 'Confirm password is required',
      });

      validate(schema.confirmPassword, ({ value, valueOf }) => {
        const password = valueOf(schema.password);

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

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((hidden) => !hidden);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    this.signupForm().markAsTouched();

    if (this.signupForm().invalid()) {
      return;
    }

    const { fullname, username, email, password } = this.signupModel();

    this.authService
      .signUp({
        fullname,
        username,
        password,
        role: UserRoleEnum.USER,
        email,
      })

      .subscribe({
        next: (res) => {
          console.log(res);
          this.notificationService.success(SuccessMessages.userCreated);
          this.router.navigate(['/auth/login']);
        },

        error: (err) => {
          console.log('err', err);
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

  protected fullnameError(): string | null {
    return this.fieldError(this.signupForm.fullname);
  }

  protected usernameError(): string | null {
    return this.fieldError(this.signupForm.username);
  }

  protected emailError(): string | null {
    return this.fieldError(this.signupForm.email);
  }

  protected passwordError(): string | null {
    return this.fieldError(this.signupForm.password);
  }

  protected confirmPasswordError(): string | null {
    return this.fieldError(this.signupForm.confirmPassword);
  }

  protected readonly passwordType = computed(() => (this.hidePassword() ? 'password' : 'text'));

  protected readonly confirmPasswordType = computed(() =>
    this.hideConfirmPassword() ? 'password' : 'text',
  );

  protected readonly passwordToggleIcon = computed(() =>
    this.hidePassword() ? 'visibility_off' : 'visibility',
  );

  protected readonly confirmPasswordToggleIcon = computed(() =>
    this.hideConfirmPassword() ? 'visibility_off' : 'visibility',
  );

  protected readonly passwordToggleLabel = computed(() =>
    this.hidePassword() ? 'Show password' : 'Hide password',
  );

  protected readonly confirmPasswordToggleLabel = computed(() =>
    this.hideConfirmPassword() ? 'Show confirm password' : 'Hide confirm password',
  );
}
