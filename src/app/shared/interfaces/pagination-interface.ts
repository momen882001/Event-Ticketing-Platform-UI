export interface IPagedResponse<T> {
  content: T[];
  page: IPageMetadata;
}

interface IPageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}
