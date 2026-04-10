import React, { useState, useRef, useEffect } from 'react';

/**
 * Lightweight hover tooltip with a configurable appear delay.
 * Wraps a single child (typically a button) and shows `label` after
 * `delay` ms of sustained hover.
 */
export default function Tooltip({ label, delay = 500, children, side = 'bottom', className = '', style }) {
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  const handleEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(true), delay);
  };
  const handleLeave = () => {
    clearTimeout(timerRef.current);
    setShow(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const positionClass =
    side === 'top'
      ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2'
      : side === 'left'
      ? 'right-full mr-1.5 top-1/2 -translate-y-1/2'
      : side === 'right'
      ? 'left-full ml-1.5 top-1/2 -translate-y-1/2'
      : 'top-full mt-1.5 left-1/2 -translate-x-1/2'; // bottom

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={style}
          className={`app-tooltip absolute ${positionClass} whitespace-nowrap rounded-md bg-slate-900 text-white dark:bg-slate-700 shadow-lg z-50 pointer-events-none ${className}`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
