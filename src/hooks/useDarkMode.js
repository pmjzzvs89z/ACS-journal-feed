import { useState, useEffect } from 'react';

// Single source of truth for the dark-mode localStorage contract.
// The inline pre-paint script in index.html must use the SAME key; if you
// rename this, also update index.html or the white-flash on refresh comes back.
export const DARK_MODE_STORAGE_KEY = 'darkMode';
export const DARK_MODE_DEFAULT = true;

/** @returns {[boolean, () => void]} */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      return stored === null ? DARK_MODE_DEFAULT : stored === 'true';
    } catch {
      return DARK_MODE_DEFAULT;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDark));
    } catch { /* storage unavailable, fine */ }
  }, [isDark]);

  const toggle = () => setIsDark(v => !v);

  return [isDark, toggle];
}
