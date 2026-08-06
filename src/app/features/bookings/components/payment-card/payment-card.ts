import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { toSignal } from '@angular/core/rxjs-interop';

export interface PaymentCardResult {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-card.html',
  styleUrl: './payment-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCard {
  private readonly fb = inject(FormBuilder);

  private readonly dialogRef = inject(MatDialogRef<PaymentCard>);

  readonly data = inject(MAT_DIALOG_DATA);

  readonly focusedField = signal<'number' | 'name' | 'expiry' | 'cvv' | null>(null);

  readonly paymentForm = this.fb.group({
    number: ['', [Validators.required, Validators.minLength(16)]],

    name: ['', Validators.required],

    expiry: ['', [Validators.required]],

    cvv: ['', [Validators.required, Validators.minLength(3)]],
  });

  // 🔥 convert form changes to signals

  private readonly formValue = toSignal(this.paymentForm.valueChanges, {
    initialValue: this.paymentForm.value,
  });

  readonly number = computed(() => this.formValue().number ?? '');

  readonly name = computed(() => this.formValue().name ?? '');

  readonly expiry = computed(() => this.formValue().expiry ?? '');

  readonly cvv = computed(() => this.formValue().cvv ?? '');

  readonly cardType = computed(() => {
    const value = this.number().replace(/\D/g, '');

    if (value.startsWith('4')) {
      return 'visa';
    }

    if (/^(5[1-5]|2[2-7])/.test(value)) {
      return 'mastercard';
    }

    if (/^3[47]/.test(value)) {
      return 'amex';
    }

    if (value.startsWith('6')) {
      return 'discover';
    }

    return 'unknown';
  });

  readonly formattedNumber = computed(() => {
    const value = this.number().replace(/\D/g, '');

    if (!value) {
      return '•••• •••• •••• ••••';
    }

    return value.match(/.{1,4}/g)?.join(' ') ?? value;
  });

  readonly formattedName = computed(() => {
    return this.name() ? this.name().toUpperCase() : 'FULL NAME';
  });

  readonly formattedExpiry = computed(() => {
    return this.expiry() || 'MM/YY';
  });

  readonly formattedCVV = computed(() => {
    return this.cvv() || '•••';
  });

  readonly isBack = computed(() => {
    return this.focusedField() === 'cvv';
  });

  readonly cardClass = computed(() => {
    return this.cardType();
  });

  focus(field: 'number' | 'name' | 'expiry' | 'cvv') {
    this.focusedField.set(field);
  }

  blur() {
    // don't clear immediately
    setTimeout(() => {
      this.focusedField.set(null);
    }, 100);
  }

  isFocused(field: string) {
    return this.focusedField() === field;
  }

  submit() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();

      return;
    }

    this.dialogRef.close(this.paymentForm.value);
  }

  close() {
    this.dialogRef.close();
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    // 🚫 Stop user after 16 digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }

    const formatted = value.replace(/(.{4})/g, '$1 ').trim();

    this.paymentForm.controls.number.setValue(formatted, {
      emitEvent: false,
    });

    // keep cursor position
    input.value = formatted;
  }

  formatExpiry(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    // 🚫 max 4 digits only
    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    if (value.length >= 3) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }

    this.paymentForm.controls.expiry.setValue(value, {
      emitEvent: false,
    });

    input.value = value;
  }

  onlyNumbers(event: Event) {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '').substring(0, 4);

    this.paymentForm.controls.cvv.setValue(input.value);
  }

  onlyLetters(event: Event) {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/[^a-zA-Z\s]/g, '');

    this.paymentForm.controls.name.setValue(input.value);
  }
}
