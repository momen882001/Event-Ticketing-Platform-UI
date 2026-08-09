import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { form, FormField, maxLength, min, minLength, required } from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { IVenueFormResult, IVenueRequest, IVenueResponse } from '../../interfaces/venue-interface';

import { CategoriesService } from '../../../../core/services/categories.service';
import { ICategoryResponse } from '../../../categories/interfaces/category-interface';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-add-edit-venue',
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
  templateUrl: './add-edit-venue.html',
  styleUrl: './add-edit-venue.scss',
})
export class AddEditVenue implements OnInit {
  private dialogRef = inject(MatDialogRef<AddEditVenue>);
  venue = inject<IVenueResponse | null>(MAT_DIALOG_DATA);

  private categoriesService = inject(CategoriesService);
  private notificationService = inject(NotificationService);

  readonly isEditMode = computed(() => !!this.venue);

  allCategories = signal<ICategoryResponse[]>([]);

  // Selected image
  selectedImage = signal<File | null>(null);

  // Image preview
  imagePreview = signal<string | null>(this.venue?.imageUrl ?? null);

  venueModel = signal<IVenueRequest>({
    name: this.venue?.name ?? '',
    address: this.venue?.address ?? '',
    capacity: this.venue?.capacity ?? 0,
    categoryId: this.venue?.categoryId ?? null,
    isSeatable: this.venue?.isSeatable ?? false,
  });

  venueForm = form(this.venueModel, (schema) => {
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
  });

  ngOnInit(): void {
    this.loadAllCategories();
  }

  private loadAllCategories(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (res: ICategoryResponse[]) => {
        this.allCategories.set(res);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate image type
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('Only image files are allowed');
      input.value = '';
      return;
    }

    // Optional: 5 MB limit
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.notificationService.error('Image must be less than 5MB');
      input.value = '';
      return;
    }

    this.selectedImage.set(file);

    // Create preview
    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.venueForm().markAsTouched();

    if (this.venueForm().invalid()) {
      return;
    }

    const value = this.venueForm().value();

    const result: IVenueFormResult = {
      data: {
        name: value.name,
        address: value.address,
        capacity: value.capacity,
        categoryId: value.categoryId!,
        isSeatable: value.isSeatable,
      },
      image: this.selectedImage(),
    };

    this.dialogRef.close(result);
  }
}
