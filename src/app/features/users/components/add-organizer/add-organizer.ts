import { Component, signal, computed, inject } from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

const NAME_PATTERN = /^[a-zA-Z\s'-]+$/;

export interface AddOrganizerResult {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

interface AddOrganizerModel {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-add-organizer',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormField,
  ],
  templateUrl: './add-organizer.html',
  styleUrl: './add-organizer.scss',
})
export class AddOrganizer {
  private readonly dialogRef = inject(MatDialogRef<AddOrganizer>);

  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);
  readonly submitAttempted = signal(false);

  readonly organizerModel = signal<AddOrganizerModel>({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  readonly organizerForm = form(this.organizerModel, (schema) => {
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
  });

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((hidden) => !hidden);
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

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.submitAttempted.set(true);

    this.organizerForm().markAsTouched();

    if (this.organizerForm().invalid()) {
      return;
    }

    const { fullname, username, email, password } = this.organizerModel();

    this.dialogRef.close({
      fullname,
      username,
      email,
      password,
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
    return this.fieldError(this.organizerForm.fullname);
  }

  protected usernameError(): string | null {
    return this.fieldError(this.organizerForm.username);
  }

  protected emailError(): string | null {
    return this.fieldError(this.organizerForm.email);
  }

  protected passwordError(): string | null {
    return this.fieldError(this.organizerForm.password);
  }

  protected confirmPasswordError(): string | null {
    return this.fieldError(this.organizerForm.confirmPassword);
  }
}
