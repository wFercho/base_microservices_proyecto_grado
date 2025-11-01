import { useState, useCallback } from 'react';

export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorBoundary = useCallback(<T extends any[]>(
    fn: (...args: T) => void
  ) => {
    return (...args: T) => {
      try {
        fn(...args);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error capturado:', err);
      }
    };
  }, []);

  return {
    error,
    resetError,
    withErrorBoundary,
    hasError: error !== null
  };
};