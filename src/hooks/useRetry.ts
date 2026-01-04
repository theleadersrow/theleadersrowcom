import { useState, useCallback, useRef } from "react";

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
}

/**
 * Hook for executing async operations with automatic retry and exponential backoff
 * Designed for resilience with 500+ concurrent users
 */
export function useRetry<T>(
  asyncFn: () => Promise<T>,
  config: RetryConfig = {}
): {
  execute: () => Promise<T | null>;
  state: RetryState;
  reset: () => void;
} {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 8000, onRetry } = config;
  
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
  });
  
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ isRetrying: false, attempt: 0, lastError: null });
  }, []);

  const execute = useCallback(async (): Promise<T | null> => {
    abortRef.current = false;
    setState({ isRetrying: false, attempt: 0, lastError: null });

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (abortRef.current) return null;
      
      try {
        setState(prev => ({ ...prev, attempt, isRetrying: attempt > 0 }));
        const result = await asyncFn();
        setState(prev => ({ ...prev, isRetrying: false }));
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, lastError: err }));
        
        if (attempt < maxRetries && !abortRef.current) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
          const jitter = delay * 0.2 * Math.random();
          
          onRetry?.(attempt + 1, err);
          
          await new Promise(resolve => setTimeout(resolve, delay + jitter));
        } else {
          setState(prev => ({ ...prev, isRetrying: false }));
          throw err;
        }
      }
    }
    
    return null;
  }, [asyncFn, maxRetries, baseDelay, maxDelay, onRetry]);

  return { execute, state, reset };
}

/**
 * Simple retry wrapper for one-off operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
