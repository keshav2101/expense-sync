import { useState, useEffect, useDebugValue } from 'react';

/**
 * Custom Hook: useDebounce
 * Syllabus requirement: Custom hook with useDebugValue
 * Delays updating the debounced value until after a specified delay.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  // Expose readable state in React DevTools
  useDebugValue(`Debounced: "${debouncedValue}" (${delay}ms)`);

  return debouncedValue;
}
