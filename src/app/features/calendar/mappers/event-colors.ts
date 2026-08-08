import { EventStatusEnum } from '../../../shared/enums/EventStatusEnum';

export const getEventColors = (
  status: EventStatusEnum,
): {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
} => {
  switch (status) {
    case EventStatusEnum.PUBLISHED:
      return {
        backgroundColor: '#6c4cf6',
        borderColor: '#6c4cf6',
        textColor: '#ffffff',
      };

    case EventStatusEnum.SOLD_OUT:
      return {
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        textColor: '#ffffff',
      };

    case EventStatusEnum.COMPLETED:
      return {
        backgroundColor: '#64748b',
        borderColor: '#64748b',
        textColor: '#ffffff',
      };

    case EventStatusEnum.CANCELLED:
      return {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        textColor: '#ffffff',
      };

    default:
      return {
        backgroundColor: '#6c4cf6',
        borderColor: '#6c4cf6',
        textColor: '#ffffff',
      };
  }
};
