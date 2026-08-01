import { Component, inject, OnInit, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatDialogRef } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { MatDividerModule } from '@angular/material/divider';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatSelectModule } from '@angular/material/select';

import { MatOptionModule } from '@angular/material/core';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { form, required, minLength, maxLength, min } from '@angular/forms/signals';

import { FormField } from '@angular/forms/signals';

interface VenueModel {
  name: string;

  address: string;

  capacity: number;

  categoryId: number | null;

  isSeatable: boolean;
}

@Component({
  selector: 'app-create-venue',

  imports: [
    CommonModule,

    MatButtonModule,

    MatIconModule,

    MatDividerModule,

    MatFormFieldModule,

    MatInputModule,

    MatSelectModule,

    MatOptionModule,

    MatSlideToggleModule,

    FormField,
  ],

  templateUrl: './create-venue.html',

  styleUrl: './create-venue.scss',
})
export class CreateVenue implements OnInit {
  private dialogRef = inject(MatDialogRef<CreateVenue>);

  categories: any[] = [
    {
      id: 1,
      name: 'Main Hall',
    },

    {
      id: 2,
      name: 'Outdoor',
    },

    {
      id: 3,
      name: 'Conference Room',
    },
  ];

  venueModel = signal<VenueModel>({
    name: '',
    address: '',
    capacity: 0,
    categoryId: null as number | null,
    isSeatable: false,
  });

  venueForm = form(
    this.venueModel,

    (schema) => {
      required(schema.name, {
        message: 'Name is required',
      });

      minLength(schema.name, 2, {
        message: 'Minimum 2 characters',
      });

      maxLength(schema.name, 100, {
        message: 'Maximum 100 characters',
      });

      required(schema.address, {
        message: 'Address is required',
      });

      minLength(schema.address, 2, {
        message: 'Minimum 2 characters',
      });

      maxLength(schema.address, 255, {
        message: 'Maximum 255 characters',
      });

      min(schema.capacity, 1, {
        message: 'Capacity must be greater than 0',
      });

      required(schema.categoryId, {
        message: 'Category is required',
      });

      required(schema.isSeatable, {
        message: 'Seatable value is required',
      });
    },
  );

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }

  save() {
    this.venueForm().markAsTouched();

    if (this.venueForm().invalid()) {
      return;
    }

    const request = this.venueForm().value();

    console.log(request);

    this.dialogRef.close(request);
  }
}
