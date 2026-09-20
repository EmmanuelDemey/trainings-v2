/**
 * Stands in for a heavy third-party library (a PDF generator, a chart engine,
 * a date library imported whole). It is ~120 kB of static payload plus some
 * generated data, and it is used by exactly ONE button.
 *
 * Right now it is imported statically by `ReportsView`, so it lands in the entry
 * chunk and every visitor downloads it.
 */

/** A large static table, standing in for a library's embedded data. */
const LOOKUP: string[] = Array.from({ length: 4000 }, (_, i) =>
  `row-${i}-${'x'.repeat(24)}-${(i * 7919) % 100_000}`);

export interface ReportRow {
  label: string;
  value: number;
}

export function buildReport(rows: ReportRow[]): string {
  const header = 'label;value';
  const body = rows.map((r) => `${r.label};${r.value.toFixed(2)}`).join('\n');
  const footer = `# lookup entries: ${LOOKUP.length}`;
  return [header, body, footer].join('\n');
}

export function download(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
