/** 172 → "1.72 m": the data stores centimetres, people read metres. */
export function formatHeight(centimetres: number): string {
  // TODO 3.1: return the height in metres, two decimals, followed by " m".
  return String(centimetres);
}

/** 77 → "77 kg", and `null` (nobody knows) → "unknown". */
export function formatMass(kilograms: number | null): string {
  // TODO 3.2: "77 kg" for a known mass, "unknown" for `null`.
  return String(kilograms);
}
