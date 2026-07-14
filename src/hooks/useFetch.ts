import { useEffect, useState, useCallback, useRef } from 'react';
import { ApiResponse } from '@/types/api';

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, any>;
  headers?: Record<string, string>;
  cache?: number; // Cache duration in milliseconds
  skip?: boolean; // Skip fetching
  revalidateOnFocus?: boolean;
}

interface UseFetchState<T> {
  data: T | null;
  error: any;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T) => Promise<T | undefined>;
  revalidate: () => Promise<T | undefined>;
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();

export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchState<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    cache: cacheDuration = 0,
    skip = false,
    revalidateOnFocus = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(!skip && !!url);
  const [isValidating, setIsValidating] = useState(false);
  const cacheKeyRef = useRef(`${url}:${JSON.stringify(body)}`);

  const fetchData = useCallback(async (skipCache = false): Promise<T | undefined> => {
    if (!url || skip) return undefined;

    const cacheKey = cacheKeyRef.current;
    const cachedData = cache.get(cacheKey);

    // Return cached data if available and not expired
    if (!skipCache && cachedData && cacheDuration > 0) {
      const isExpired = Date.now() - cachedData.timestamp > cacheDuration;
      if (!isExpired) {
        setData(cachedData.data);
        return cachedData.data;
      }
    }

    try {
      setIsValidating(true);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...(body && { body: JSON.stringify(body) }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json: any = await response.json();
      const responseData: T = (json && json.data) ? json.data : json;

      setData(responseData);
      setError(null);

      // Cache the result
      if (cacheDuration > 0) {
        cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
      }

      return responseData;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setData(null);
      return undefined;
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [url, skip, body, method, headers, cacheDuration]);

  // Initial fetch
  useEffect(() => {
    if (url && !skip) {
      fetchData();
    }
  }, [url, skip, fetchData]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      fetchData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, revalidateOnFocus]);

  const mutate = useCallback(
    async (newData?: T) => {
      if (newData !== undefined) {
        setData(newData);
        const cacheKey = cacheKeyRef.current;
        if (cacheDuration > 0) {
          cache.set(cacheKey, { data: newData, timestamp: Date.now() });
        }
        return newData;
      }
      return fetchData();
    },
    [fetchData, cacheDuration]
  );

  const revalidate = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    revalidate,
  };
}

// Convenience hook for GET requests
export function useGet<T = any>(url: string | null, options?: Omit<UseFetchOptions, 'method' | 'body'>) {
  return useFetch<T>(url, { ...options, method: 'GET' });
}
