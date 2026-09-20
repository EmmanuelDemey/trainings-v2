/** Column descriptor shared by `DataTable` and its consumers. */
export interface Column<Row> {
  key: keyof Row & string;
  label: string;
  sortable?: boolean;
}
