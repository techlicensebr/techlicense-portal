import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * usePolling — Smart polling hook for near-real-time updates.
 * Uses adaptive intervals: faster when active, slower when idle.
 * Automatically pauses when browser tab is hidden.
 */

interface UsePollingOptions<T> {
  fetcher: () => Promise<T>;
  interval?: number;          // Base polling interval in ms (default: 5000)
  idleInterval?: number;      // Interval when no changes detected (default: 15000)
  enabled?: boolean;          // Enable/disable polling (default: true)
  onUpdate?: (data: T) => void;
  compareKey?: (data: T) => string; // Function to detect changes
}

interface UsePollingResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  isActive: boolean;
  refetch: () => Promise<void>;
}

export function usePolling<T = unknown>(options: UsePollingOptions<T>): UsePollingResult<T> {
  const {
    fetcher,
    interval = 5000,
    idleInterval = 15000,
    enabled = true,
    onUpdate,
    compareKey,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(true);

  const lastCompareKeyRef = useRef<string | null>(null);
  const currentIntervalRef = useRef(interval);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  const onUpdateRef = useRef(onUpdate);
  const compareKeyRef = useRef(compareKey);

  // Keep refs in sync
  fetcherRef.current = fetcher;
  onUpdateRef.current = onUpdate;
  compareKeyRef.current = compareKey;

  const doFetch = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      const result = await fetcherRef.current();

      if (!isMountedRef.current) return;

      // Check if data actually changed
      if (compareKeyRef.current) {
        const newKey = compareKeyRef.current(result);
        const changed = newKey !== lastCompareKeyRef.current;
        lastCompareKeyRef.current = newKey;

        if (changed) {
          // Data changed — use fast interval
          currentIntervalRef.current = interval;
          setData(result);
          setLastUpdated(new Date());
          onUpdateRef.current?.(result);
        } else {
          // No change — slow down polling
          currentIntervalRef.current = Math.min(
            currentIntervalRef.current * 1.5,
            idleInterval
          );
        }
      } else {
        setData(result);
        setLastUpdated(new Date());
        onUpdateRef.current?.(result);
      }

      setError(null);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Polling error'));
        // Back off on errors
        currentIntervalRef.current = Math.min(
          currentIntervalRef.current * 2,
          idleInterval * 2
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [interval, idleInterval]);

  // Visibility-based pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsActive(visible);
      if (visible) {
        // Resume with immediate fetch
        currentIntervalRef.current = interval;
        doFetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [interval, doFetch]);

  // Polling loop
  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled || !isActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Initial fetch
    doFetch();

    // Schedule recurring polls
    const schedulePoll = () => {
      timerRef.current = setTimeout(async () => {
        if (!isMountedRef.current || !enabled) return;
        await doFetch();
        schedulePoll(); // Re-schedule with potentially updated interval
      }, currentIntervalRef.current);
    };

    schedulePoll();

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, isActive, doFetch]);

  const refetch = useCallback(async () => {
    currentIntervalRef.current = interval; // Reset to fast interval
    await doFetch();
  }, [interval, doFetch]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isActive,
    refetch,
  };
}
