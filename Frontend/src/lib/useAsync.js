import { useState, useCallback, useEffect, useRef } from 'react';

export function useAsync(fn, { autoRun = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoRun);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fn(...args);
        if (mountedRef.current) {
          setData(result == null ? initialData : result);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fn]
  );

  useEffect(() => {
    if (autoRun) {
      execute();
    }
  }, [execute, autoRun]);

  return {
    data,
    error,
    loading,
    execute,
    setData,
    setError,
  };
}
