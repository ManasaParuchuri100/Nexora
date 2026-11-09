import { useCallback, useRef, useState } from 'react';

/** State that survives page changes and reloads (stored in this browser). */
export function usePersisted<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch { /* storage unavailable */ }
    return initial;
  });
  // Keep the latest value in a ref and write to storage straight away, so a change is saved
  // even if the page changes before React re-renders.
  const latest = useRef(value);
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const v = typeof next === 'function' ? (next as (p: T) => T)(latest.current) : next;
      latest.current = v;
      try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ }
      setValue(v);
    },
    [key],
  );
  return [value, set];
}

export function readSaved<T extends object>(key: string): Partial<T> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as Partial<T>;
  } catch { /* storage unavailable */ }
  return {};
}

export function writeSaved(key: string, value: object) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

/** Copy text. Resolves false instead of throwing when the browser refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to the older method */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
