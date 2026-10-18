/** 172 → "1.72 m": the data stores centimetres, people read metres. */
export function formatHeight(centimetres: number): string {
  return `${(centimetres / 100).toFixed(2)} m`;
}

/** 77 → "77 kg", and `null` (nobody knows) → "unknown". */
export function formatMass(kilograms: number | null): string {
  // `null` is a real value in the data, not a bug: say so instead of "null kg".
  return kilograms === null ? 'unknown' : `${kilograms} kg`;
}
