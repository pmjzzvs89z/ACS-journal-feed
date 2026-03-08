import React from 'react';

export default function ToggleSwitch({ checked, onCheckedChange }) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${checked ? '' : 'bg-red-500'}`}
      style={checked ? { backgroundColor: '#4db85e' } : {}}
    >
      {/* Label text */}
      <span
        className={`absolute text-white text-[10px] font-bold select-none transition-all duration-200 ${checked ? 'left-2' : 'right-1'}`}
      >
        {checked ? 'ON' : 'OFF'}
      </span>
      {/* Circle */}
      <span
        className={`absolute w-[18px] h-[18px] rounded-full bg-white shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-[27px]' : 'translate-x-[3px]'}`}
      />
    </button>
  );
}