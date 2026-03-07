import React from 'react';

export default function ToggleSwitch({ checked, onCheckedChange }) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex items-center w-16 h-8 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${checked ? '' : 'bg-red-500'}`}
      style={checked ? { backgroundColor: '#4db85e' } : {}}
    >
      {/* Label text */}
      <span
        className={`absolute text-white text-xs font-bold select-none transition-all duration-200 ${checked ? 'left-2.5' : 'right-2'}`}
      >
        {checked ? 'ON' : 'OFF'}
      </span>
      {/* Circle */}
      <span
        className={`absolute w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-9' : 'translate-x-1'}`}
      />
    </button>
  );
}