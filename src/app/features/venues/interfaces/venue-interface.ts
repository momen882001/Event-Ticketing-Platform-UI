export interface IVenueResponse {
  id: number;
  name: string;
  address: string;
  capacity: number;
  categoryId: number;
  categoryName: string;
  isSeatable: boolean;
}

export interface IVenueRequest {
  name: string;
  address: string;
  capacity: number;
  categoryId: number | null;
  isSeatable: boolean;
}
