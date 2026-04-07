import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiError } from '@/lib/api';

export interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
  autoFetch?: boolean;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
  reset: () => void;
}

export function useApi<T = unknown>(
  fetcher: () => Promise<T>,
  options?: UseApiOptions
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const isMountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);
  const hasFetchedRef = useRef(false);

  // Keep refs up-to-date without triggering re-renders
  fetcherRef.current = fetcher;
  optionsRef.current = options;

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();

      if (isMountedRef.current) {
        setData(result);
        setError(null);

        if (optionsRef.current?.onSuccess) {
          optionsRef.current.onSuccess(result);
        }
      }
    } catch (err) {
      const apiError = err instanceof Error
        ? {
            message: err.message,
          }
        : (err as ApiError);

      if (isMountedRef.current) {
        setError(apiError);
        setData(null);

        if (optionsRef.current?.onError) {
          optionsRef.current.onError(apiError);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // No dependencies — uses refs

  const mutate = useCallback((newData: T) => {
    if (isMountedRef.current) {
      setData(newData);
    }
  }, []);

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if enabled (runs only once)
  useEffect(() => {
    isMountedRef.current = true;

    if (optionsRef.current?.autoFetch !== false && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refetch();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    reset,
  };
}

// Hook para fazer mutações (POST, PUT, DELETE)
export function useApiMutation<T = unknown, P = unknown>(
  fetcher: (payload: P) => Promise<T>,
  options?: UseApiOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const isMountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  // Keep refs up-to-date
  fetcherRef.current = fetcher;
  optionsRef.current = options;

  const mutate = useCallback(
    async (payload: P) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current(payload);

        if (isMountedRef.current) {
          setData(result);
          setError(null);

          if (optionsRef.current?.onSuccess) {
            optionsRef.current.onSuccess(result);
          }
        }

        return result;
      } catch (err) {
        const apiError = err instanceof Error
          ? {
              message: err.message,
            }
          : (err as ApiError);

        if (isMountedRef.current) {
          setError(apiError);
          setData(null);

          if (optionsRef.current?.onError) {
            optionsRef.current.onError(apiError);
          }
        }

        throw apiError;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [] // No dependencies — uses refs
  );

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}
