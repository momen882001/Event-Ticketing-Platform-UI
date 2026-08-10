import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IVenueResponse } from '../../../venues/interfaces/venue-interface';
import { VenuesService } from '../../../../core/services/venues.service';
import {
  IEventFormResult,
  IEventRequest,
  IEventResponse,
  IEventUpdateFormResult,
  IEventUpdateRequest,
  ISeatCategoryResponse,
} from '../../interfaces/event-interface';

export interface EventDialogData {
  venueId: number;
  startDateTime: string;
  endDateTime: string;

  event?: IEventResponse;
}

@Component({
  selector: 'app-add-edit-event',
  standalone: true,
  templateUrl: './add-edit-event.html',
  styleUrl: './add-edit-event.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class AddEditEvent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AddEditEvent>);
  private readonly venuesService = inject(VenuesService);
  readonly data = inject<EventDialogData>(MAT_DIALOG_DATA);

  readonly venue = signal<IVenueResponse | null>(null);

  readonly selectedImage = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(this.data.event?.imageUrl ?? null);

  readonly isEditMode = computed(() => !!this.data.event);
  readonly dialogTitle = computed(() => (this.isEditMode() ? 'Edit Event' : 'Create Event'));
  readonly submitLabel = computed(() => (this.isEditMode() ? 'Save Changes' : 'Create Event'));

  readonly form = this.fb.nonNullable.group({
    id: [this.data.event?.id ?? null],
    title: [
      this.data.event?.title ?? '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],

    description: [
      this.data.event?.description ?? '',
      [Validators.required, Validators.maxLength(1000)],
    ],

    seatCategories: this.fb.array([], [this.seatCapacityValidator()]),
  });

  constructor() {
    console.log(this.data, 'dattttttta');

    if (this.data.event) {
      this.data.event.seatCategories.forEach((category) => {
        this.seatCategories.push(this.createSeatCategory(category));
      });
    } else {
      this.addSeatCategory();
    }
  }

  ngOnInit(): void {
    this.loadVenueById();
  }

  private loadVenueById(): void {
    this.venuesService.getVenueById(this.data.venueId).subscribe({
      next: (venue) => {
        this.venue.set(venue);
        this.seatCategories.updateValueAndValidity();
      },

      error: () => {
        console.log('Failed to load venue details. Please try again later.');
      },
    });
  }

  get seatCategories(): FormArray {
    return this.form.controls.seatCategories as FormArray;
  }

  private createSeatCategory(value?: ISeatCategoryResponse) {
    return this.fb.nonNullable.group({
      id: [value?.id ?? null],
      name: [
        value?.name ?? '',

        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],

      price: [value?.price ?? 0, [Validators.required, Validators.min(0)]],

      totalSeats: [value?.totalSeats ?? 0, [Validators.required, Validators.min(1)]],
    });
  }

  addSeatCategory(): void {
    this.seatCategories.push(this.createSeatCategory());
  }

  removeSeatCategory(index: number): void {
    if (this.seatCategories.length === 1) {
      return;
    }

    this.seatCategories.removeAt(index);
  }

  //* ----------- Image Part ------------ *//
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Only image files are allowed');
      input.value = '';
      return;
    }

    // 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      console.error('Image must be less than 5MB');
      input.value = '';
      return;
    }

    this.selectedImage.set(file);

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

  private seatCapacityValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      const venueCapacity = this.venue()?.capacity;

      if (!venueCapacity) {
        return null;
      }

      const totalSeats = this.seatCategories.controls.reduce(
        (sum, control) => sum + Number(control.get('totalSeats')?.value ?? 0),
        0,
      );

      return totalSeats > venueCapacity
        ? {
            capacityExceeded: {
              capacity: venueCapacity,
              selected: totalSeats,
            },
          }
        : null;
    };
  }

  get totalSeats(): number {
    return this.seatCategories.controls.reduce(
      (sum, control) => sum + Number(control.get('totalSeats')?.value ?? 0),
      0,
    );
  }

  get capacityExceeded(): boolean {
    return !!this.seatCategories.errors?.['capacityExceeded'];
  }

  get remainingSeats(): number {
    return (this.venue()?.capacity ?? 0) - this.totalSeats;
  }

  categoryName(index: number) {
    return this.seatCategories.at(index).get('name');
  }

  categoryPrice(index: number) {
    return this.seatCategories.at(index).get('price');
  }

  categorySeats(index: number) {
    return this.seatCategories.at(index).get('totalSeats');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.isEditMode()) {
      const request: IEventUpdateRequest = {
        venueId: this.data.venueId,
        title: value.title.trim(),
        description: value.description.trim(),
        startDateTime: this.data.startDateTime,
        endDateTime: this.data.endDateTime,

        seatCategories: value.seatCategories.map((category: any) => ({
          id: category.id,
          name: category.name.trim(),
          price: Number(category.price),
          totalSeats: Number(category.totalSeats),
        })),
      };

      const result: IEventUpdateFormResult = {
        data: request,
        image: this.selectedImage(),
      };

      this.dialogRef.close(result);
      return;
    }

    const request: IEventRequest = {
      venueId: this.data.venueId,
      title: value.title.trim(),
      description: value.description.trim(),
      startDateTime: this.data.startDateTime,
      endDateTime: this.data.endDateTime,

      seatCategories: value.seatCategories.map((category: any) => ({
        name: category.name.trim(),
        price: Number(category.price),
        totalSeats: Number(category.totalSeats),
      })),
    };

    const result: IEventFormResult = {
      data: request,
      image: this.selectedImage(),
    };

    this.dialogRef.close(result);
  }

  close(): void {
    this.dialogRef.close();
  }
}
