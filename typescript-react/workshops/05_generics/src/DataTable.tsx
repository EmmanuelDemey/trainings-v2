// A table whose columns are keys of the rows: a column the rows do not have is a
// compile error, and each cell is typed by its column.
import type { ReactNode } from 'react';

/** TODO 2: only keys the rows have, and `renderCell` receives `T[K]`. */
export interface DataTableProps {
  rows: any[];
  columns: string[];
  getRowKey: (row: any) => string;
  renderCell?: (value: any, column: string) => ReactNode;
}

export function DataTable({ rows, columns, getRowKey, renderCell }: DataTableProps) {
  return <table />;
}
