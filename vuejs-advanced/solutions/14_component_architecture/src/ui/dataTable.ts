/** What a column of `ui/DataTable.vue` is. No domain type in sight. */
export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}
