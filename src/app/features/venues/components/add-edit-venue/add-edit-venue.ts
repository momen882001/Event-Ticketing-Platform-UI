import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { form, FormField, maxLength, min, minLength, required } from '@angular/forms/signals';
import { IVenueRequest, IVenueResponse } from '../../interfaces/venue-interface';
import { CategoriesService } from '../../../../core/services/categories.service';
import { ICategoryResponse } from '../../../categories/interfaces/category-interface';

export interface VenueModel {
  id?: number;
  name: string;
  address: string;
  capacity: number;
  categoryId: number | null;
  isSeatable: boolean;
}

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

  readonly isEditMode = computed(() => !!this.venue);
  allCategories = signal<ICategoryResponse[]>([]);

  venueModel = signal<VenueModel>({
    id: this.venue?.id,
    name: this.venue?.name ?? '',
    address: this.venue?.address ?? '',
    capacity: this.venue?.capacity ?? 0,
    categoryId: this.venue?.categoryId ?? null,
    isSeatable: this.venue?.isSeatable ?? false,
  });

  venueForm = form(this.venueModel, (schema) => {
    required(schema.name, { message: 'Name is required' });
    minLength(schema.name, 2, { message: 'Minimum 2 characters' });
    maxLength(schema.name, 100, { message: 'Maximum 100 characters' });
    required(schema.address, { message: 'Address is required' });
    minLength(schema.address, 2, { message: 'Minimum 2 characters' });
    maxLength(schema.address, 255, { message: 'Maximum 255 characters' });
    min(schema.capacity, 1, { message: 'Capacity must be greater than 0' });
    required(schema.categoryId, { message: 'Category is required' });
  });

  ngOnInit() {
    this.loadAllCategories();
  }

  private loadAllCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (res: ICategoryResponse[]) => {
        this.allCategories.set(res);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.venueForm().markAsTouched();
    if (this.venueForm().invalid()) {
      return;
    }
    const req: IVenueRequest = {
      name: this.venueForm().value().name,
      address: this.venueForm().value().address,
      capacity: this.venueForm().value().capacity,
      categoryId: this.venueForm().value().categoryId,
      isSeatable: this.venueForm().value().isSeatable,
    };
    this.dialogRef.close(req);
  }
}
