import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IConfirmationDialogData } from '../../interfaces/confirmation-dialog';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialog {
  loading = signal(false);

  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: IConfirmationDialogData,
  ) {}

  onCancel(): void {
    if (this.loading()) {
      return;
    }

    this.dialogRef.close(false);
  }

  onConfirm(): void {
    if (this.loading()) {
      return;
    }

    this.dialogRef.close(true);
  }
}
