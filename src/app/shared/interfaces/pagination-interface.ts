export interface IPagedResponse<T> {
  content: T[];
  totalElements: number;
  size: number;
}
