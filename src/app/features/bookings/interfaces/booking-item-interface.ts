export interface IBookingItemRequest {
  seatCategoryId: number;
  quantity: number;
}
export interface IBookingItemResponse {
  seatCategoryId: number;
  seatCategoryName: string;
  quantity: number;
}
