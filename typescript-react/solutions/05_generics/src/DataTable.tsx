// A table whose columns are keys of the rows: a column the rows do not have is a
// compile error, and each cell is typed by its column.
import type { ReactNode } from 'react';

export interface DataTableProps<T, K extends keyof T> {
  rows: readonly T[];
  columns: readonly K[];
  getRowKey: (row: T) => string;
  renderCell?: (value: T[K], column: K) => ReactNode;
}

export function DataTable<T, K extends keyof T>({ rows, columns, getRowKey, renderCell }: DataTableProps<T, K>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column)}>{String(column)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)}>
            {columns.map((column) => (
              <td key={String(column)}>{renderCell ? renderCell(row[column], column) : String(row[column])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
