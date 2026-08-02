import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { signal, computed } from '@angular/core';
import { ICategoryRequest, ICategoryResponse } from '../../interfaces/category-interface';

@Component({
  selector: 'app-add-edit-category',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormField,
  ],
  templateUrl: './add-edit-category.html',
  styleUrl: './add-edit-category.scss',
})
export class AddEditCategory {
  private dialogRef = inject(MatDialogRef<AddEditCategory>);
  data = inject<ICategoryResponse | null>(MAT_DIALOG_DATA);

  readonly isEditMode = computed(() => !!this.data);

  categoryModel = signal<ICategoryRequest>({
    name: this.data?.name ?? '',
  });

  categoryForm = form(this.categoryModel, (schema) => {
    required(schema.name, {
      message: 'Category name is required',
    });

    minLength(schema.name, 2, {
      message: 'Minimum 2 characters',
    });

    maxLength(schema.name, 100, {
      message: 'Maximum 100 characters',
    });
  });

  close() {
    this.dialogRef.close();
  }

  save() {
    this.categoryForm().markAsTouched();

    if (this.categoryForm().invalid()) {
      return;
    }

    this.dialogRef.close(this.categoryForm().value());
  }
}
