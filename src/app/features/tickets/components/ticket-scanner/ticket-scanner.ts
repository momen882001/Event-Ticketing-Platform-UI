import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

import { TicketsService } from '../../../../core/services/tickets.service';
import { ITicketResponse } from '../../interfaces/tickets-interface';

@Component({
  selector: 'app-ticket-scanner',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './ticket-scanner.html',
  styleUrl: './ticket-scanner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketScanner implements AfterViewInit, OnDestroy {
  private readonly ticketsService = inject(TicketsService);

  @ViewChild('video', { static: true })
  private readonly video!: ElementRef<HTMLVideoElement>;

  private readonly reader = new BrowserMultiFormatReader();

  private controls?: IScannerControls;

  readonly scanning = signal(false);

  readonly checkingIn = signal(false);

  readonly error = signal<string | null>(null);

  readonly success = signal(false);

  readonly scannedCode = signal<string | null>(null);

  readonly ticket = signal<ITicketResponse | null>(null);

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------

  ngAfterViewInit(): void {
    this.startScanner();
  }

  // --------------------------------------------------
  // Scanner
  // --------------------------------------------------

  async startScanner(): Promise<void> {
    /*
     * Prevent starting multiple camera streams.
     */
    if (this.scanning()) {
      return;
    }

    /*
     * Reset result state.
     */
    this.error.set(null);
    this.success.set(false);
    this.ticket.set(null);
    this.scannedCode.set(null);

    /*
     * Make sure an old scanner is completely stopped.
     */
    this.stopScanner();

    try {
      this.scanning.set(true);

      this.controls = await this.reader.decodeFromConstraints(
        {
          audio: false,

          video: {
            facingMode: {
              ideal: 'environment',
            },
          },
        },

        this.video.nativeElement,

        (result) => {
          if (!result) {
            return;
          }

          /*
           * Prevent processing another QR while
           * the current ticket is being checked.
           */
          if (!this.scanning() || this.checkingIn()) {
            return;
          }

          const ticketCode = result.getText().trim();

          if (!ticketCode) {
            return;
          }

          this.onQRCodeDetected(ticketCode);
        },
      );
    } catch (error) {
      console.error('QR scanner error:', error);

      this.scanning.set(false);

      this.error.set('Unable to access the camera. Please allow camera permission and try again.');
    }
  }

  private onQRCodeDetected(ticketCode: string): void {
    if (!this.scanning() || this.checkingIn()) {
      return;
    }

    /*
     * Store scanned ticket code.
     */
    this.scannedCode.set(ticketCode);

    /*
     * Stop camera immediately.
     *
     * This prevents the same QR from being
     * detected multiple times.
     */
    this.stopScanner();

    /*
     * Validate/check-in through backend.
     */
    this.checkIn(ticketCode);
  }

  // --------------------------------------------------
  // Check-in
  // --------------------------------------------------

  private checkIn(ticketCode: string): void {
    this.checkingIn.set(true);

    this.error.set(null);

    this.ticketsService.checkIn(ticketCode).subscribe({
      next: (ticket) => {
        console.log('Checked-in ticket:', ticket);

        this.ticket.set(ticket);

        this.success.set(true);

        this.checkingIn.set(false);
      },

      error: (error) => {
        console.error('Ticket check-in error:', error);

        this.checkingIn.set(false);

        switch (error.status) {
          case 404:
            this.error.set('Ticket not found.');

            break;

          case 409:
            this.error.set('This ticket has already been used or cannot be checked in.');

            break;

          case 400:
            this.error.set('This ticket is not valid.');

            break;

          case 403:
            this.error.set('You are not authorized to check in tickets.');

            break;

          default:
            this.error.set('Unable to check in this ticket. Please try again.');
        }
      },
    });
  }

  // --------------------------------------------------
  // Scan another
  // --------------------------------------------------

  scanAnother(): void {
    /*
     * Reset the previous result.
     */
    this.error.set(null);

    this.success.set(false);

    this.ticket.set(null);

    this.scannedCode.set(null);

    /*
     * Start camera again.
     *
     * The <video> element is still in the DOM,
     * so ViewChild remains available.
     */
    this.startScanner();
  }

  // --------------------------------------------------
  // Stop scanner
  // --------------------------------------------------

  stopScanner(): void {
    this.controls?.stop();

    this.controls = undefined;

    this.scanning.set(false);
  }

  // --------------------------------------------------
  // Destroy
  // --------------------------------------------------

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
