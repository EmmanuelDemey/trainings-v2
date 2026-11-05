import { useEffect } from 'react';
import { fetchHealth } from './api/client';

/** Pings the API every 30 seconds, as the real app does to show "offline". */
export function useHealthCheck(): void {
  useEffect(() => {
    void fetchHealth().catch(() => undefined);
    const timer = setInterval(() => void fetchHealth().catch(() => undefined), 30_000);
    return () => clearInterval(timer);
  }, []);
}
