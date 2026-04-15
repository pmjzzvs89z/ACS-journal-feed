// @ts-nocheck — module-level `_show` is reassigned after mount, which
// TypeScript can't follow from its initial `() => {}` signature.
import React, { useState, useEffect, useCallback, useRef } from 'react';

// Lightweight toast — no external dependencies. Renders a fixed-position
// notification that auto-dismisses after `duration` ms.

let _show = () => {};

export function showToast(message, duration = 2200) {
  _show(message, duration);
}

export default function SimpleToastContainer() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((message, duration) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(message);
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => {
    _show = show;
    return () => { _show = () => {}; };
  }, [show]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
        {toast}
      </div>
    </div>
  );
}
