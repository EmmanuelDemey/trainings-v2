/** "172" (centimetres, as the API sends it) → "1.72 m". */
export function formatHeight(height: string | undefined): string {
  if (height === undefined || height === 'unknown') return 'unknown';
  const centimetres = Number(height);
  if (Number.isNaN(centimetres)) {
    // Bad data is not worth a crash, but it is worth knowing about.
    console.warn(`Unparsable height: "${height}"`);
    return 'unknown';
  }
  return `${(centimetres / 100).toFixed(2)} m`;
}

/** "77" → "77 kg"; "1,358" (the API's thousands separator) → "1358 kg". */
export function formatMass(mass: string | undefined): string {
  if (mass === undefined || mass === 'unknown') return 'unknown';
  return `${mass.replaceAll(',', '')} kg`;
}
