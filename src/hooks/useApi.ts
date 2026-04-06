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

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      if (isMountedRef.current) {
        setData(result);
        setError(null);

        if (options?.onSuccess) {
          options.onSuccess(result);
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

        if (options?.onError) {
          options.onError(apiError);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, options]);

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

  // Auto-fetch na montagem se habilitado
  useEffect(() => {
    if (options?.autoFetch !== false) {
      refetch();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [options?.autoFetch, refetch]);

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

  const mutate = useCallback(
    async (payload: P) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher(payload);

        if (isMountedRef.current) {
          setData(result);
          setError(null);

          if (options?.onSuccess) {
            options.onSuccess(result);
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

          if (options?.onError) {
            options.onError(apiError);
          }
        }

        throw apiError;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fetcher, options]
  );

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
