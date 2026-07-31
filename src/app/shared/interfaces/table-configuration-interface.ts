export interface TableColumn {
  key: string;
  header: string;
  pipe?: (value: unknown) => unknown;
  type?: 'date' | 'datetime';
}

export interface TableAction<T = unknown> {
  icon?: string;
  conditionalIcon?: (item: T) => string;
  label?: string;
  conditionalLabel?: (item: T) => string;
  handler: (item: T) => void;
  visible?: (item: T) => boolean;
}
