import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChildren,
  QueryList,
  inject,
  signal,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import QRCode from 'qrcode';
import { ITicketResponse } from '../interfaces/tickets-interface';
import { TicketsService } from '../../../core/services/tickets.service';
import { TicketStatusEnum } from '../../../shared/enums/TicketStatusEnum';

@Component({
  selector: 'app-tickets',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss',
})
export class Tickets implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketsService = inject(TicketsService);

  @ViewChildren('qrCanvas')
  private readonly qrCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  readonly tickets = signal<ITicketResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly TicketStatusEnum = TicketStatusEnum;

  readonly bookingId = signal<number | null>(null);

  ngOnInit(): void {
    const bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));

    if (!bookingId) {
      this.loading.set(false);
      this.error.set(true);
      return;
    }

    this.bookingId.set(bookingId);

    this.loadTickets(bookingId);
  }

  loadTickets(bookingId: number): void {
    this.loading.set(true);
    this.error.set(false);

    this.ticketsService.getTicketsByBookingId(bookingId).subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);

        // Wait until canvases are rendered.
        setTimeout(() => {
          this.generateQRCodes();
        });
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private generateQRCodes(): void {
    const canvases = this.qrCanvases.toArray();
    const tickets = this.tickets();

    canvases.forEach((canvasRef, index) => {
      const ticket = tickets[index];

      if (!ticket) {
        return;
      }

      this.generateQRCode(canvasRef.nativeElement, ticket.ticketCode);
    });
  }

  private async generateQRCode(canvas: HTMLCanvasElement, ticketCode: string): Promise<void> {
    try {
      await QRCode.toCanvas(canvas, ticketCode, {
        width: 220,
        margin: 2,
        errorCorrectionLevel: 'H',
      });
    } catch (error) {
      console.error('Failed to generate QR code', error);
    }
  }

  downloadQRCode(ticket: ITicketResponse, index: number): void {
    const canvas = this.qrCanvases.get(index)?.nativeElement;

    if (!canvas) {
      return;
    }

    const link = document.createElement('a');

    link.download = `ticket-${ticket.ticketCode}-qr.png`;

    link.href = canvas.toDataURL('image/png');

    link.click();
  }

  getStatusClass(status: TicketStatusEnum): string {
    switch (status) {
      case TicketStatusEnum.VALID:
        return 'status-valid';

      case TicketStatusEnum.USED:
        return 'status-used';

      case TicketStatusEnum.CANCELLED:
        return 'status-cancelled';

      default:
        return '';
    }
  }

  getStatusIcon(status: TicketStatusEnum): string {
    switch (status) {
      case TicketStatusEnum.VALID:
        return 'check_circle';

      case TicketStatusEnum.USED:
        return 'verified';

      case TicketStatusEnum.CANCELLED:
        return 'cancel';

      default:
        return 'confirmation_number';
    }
  }

  formatDate(date: string | null): string {
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  }

  trackByTicketId(_: number, ticket: ITicketResponse): number {
    return ticket.id;
  }
}
