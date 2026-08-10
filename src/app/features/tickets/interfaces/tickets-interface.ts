import { TicketStatusEnum } from '../../../shared/enums/TicketStatusEnum';

export interface ITicketResponse {
  id: number;
  bookingId: number;
  bookingItemId: number;
  eventId: number;
  eventTitle: string;
  seatCategoryName: string;
  ticketCode: string;
  status: TicketStatusEnum;
  issuedAt: string;
  checkedInAt: string | null;
}
