/**
 * A fake fleet backend. It counts its calls — that counter is how the specs
 * prove a debounce really debounces.
 */

export interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  status: 'moving' | 'idle' | 'charging';
  batteryPercent: number;
}

const FLEET: Vehicle[] = [
  { id: 'v1', plate: 'AB-123-CD', driver: 'Ada Lovelace', status: 'moving', batteryPercent: 72 },
  { id: 'v2', plate: 'EF-456-GH', driver: 'Grace Hopper', status: 'charging', batteryPercent: 31 },
  { id: 'v3', plate: 'IJ-789-KL', driver: 'Alan Turing', status: 'idle', batteryPercent: 88 },
  { id: 'v4', plate: 'MN-012-OP', driver: 'Barbara Liskov', status: 'moving', batteryPercent: 54 },
  { id: 'v5', plate: 'QR-345-ST', driver: 'Margaret Hamilton', status: 'charging', batteryPercent: 12 },
  { id: 'v6', plate: 'UV-678-WX', driver: 'Katherine Johnson', status: 'idle', batteryPercent: 97 },
];

export const apiCalls = { search: 0, status: 0 };

export function resetApiCalls(): void {
  apiCalls.search = 0;
  apiCalls.status = 0;
}

export function searchVehicles(query: string): Vehicle[] {
  apiCalls.search += 1;
  const needle = query.trim().toLowerCase();
  if (needle === '') return [...FLEET];
  return FLEET.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(needle) || vehicle.driver.toLowerCase().includes(needle),
  );
}

/** A number that moves on every call, so a poll is visible on screen. */
export function fetchFleetStatus(): { movingCount: number; polledAt: number } {
  apiCalls.status += 1;
  return { movingCount: FLEET.filter((v) => v.status === 'moving').length, polledAt: apiCalls.status };
}
