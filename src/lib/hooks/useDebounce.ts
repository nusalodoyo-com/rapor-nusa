"use client";

import { useState, useEffect } from "react";

/**
 * useDebounce: Menunda update nilai sampai waktu jeda (delay) terpenuhi
 * Berguna untuk pencarian real-time dan input handler tanpa re-render berlebihan
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
