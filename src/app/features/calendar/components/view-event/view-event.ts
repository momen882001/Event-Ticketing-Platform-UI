import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { EventImpl } from '@fullcalendar/core/internal';
import { EventStatusEnum } from '../../../../shared/enums/EventStatusEnum';

@Component({
  selector: 'app-view-event',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, DatePipe, CurrencyPipe],
  templateUrl: './view-event.html',
  styleUrl: './view-event.scss',
})
export class ViewEvent {
  public EventStatusEnum = EventStatusEnum;
  private dialogRef = inject(MatDialogRef<ViewEvent>);
  event = inject<EventImpl>(MAT_DIALOG_DATA);

  props = computed(() => this.event.extendedProps as any);

  close(): void {
    this.dialogRef.close();
  }
}
