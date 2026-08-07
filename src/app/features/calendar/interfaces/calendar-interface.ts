import { EventStatusEnum } from '../../../shared/enums/EventStatusEnum';

export interface ICalendarFilter {
  search: string;
  categoryId: number | null;
  venueId: number | null;
  status: EventStatusEnum | null;
}

export interface ICalendarMenuAction {
  label: string;
  icon: string;
  type?: 'normal' | 'danger';
  color?: string;
  action: () => void;
}
