import { useState, useEffect, useRef } from 'react';

const STORAGE_PREFIX = 'fret_';

export function useLocalStorage(key, defaultValue) {
  const storageKey = STORAGE_PREFIX + key;
  const restoredRef = useRef(false);

  const [value, setValue] = useState(() => {
    try {
      restoredRef.current = true;
      const stored = localStorage.getItem(storageKey);
      if (stored === null) return defaultValue;
      const parsed = JSON.parse(stored);
      if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
        return { ...defaultValue, ...parsed };
      }
      return parsed;
    } catch {
      return defaultValue;
    }
  });

  const [restoreCompleted] = useState(() => restoredRef.current);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // silently fail if storage is full
    }
  }, [storageKey, value]);

  return [value, setValue, restoreCompleted];
}
