import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { PUBLISHER_COLORS, PUBLISHER_LABELS } from '@/components/journals/JournalList';

// Dropdown that lets the user filter the feed to a single journal or
// "All Selected Journals". Publisher-grouped with colored dots and
// separator lines between publisher groups.
//
// Extracted from ArticleFeed.jsx to keep that file focused on the
// feed logic (filtering, pagination, infinite scroll).

export default function JournalDropdown({ value, onChange, journals, publisherKeyForId }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = journals.find(j => j.id === value);
  const label = selected ? selected.name : 'All Selected Journals';

  const colorFor = (id) => {
    const key = publisherKeyForId(id);
    return PUBLISHER_COLORS[key] || '#64748b';
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 h-9 text-sm border border-slate-300 dark:border-blue-700 rounded-lg px-3 bg-slate-200/80 dark:bg-blue-900/30 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-slate-300/80 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
      >
        <span className="truncate max-w-[220px]">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Filter by journal"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 min-w-[220px] max-h-[90vh] overflow-y-auto rounded-xl py-1 shadow-2xl bg-neutral-100 dark:bg-[rgb(28,30,38)] border border-neutral-300 dark:border-white/10"
          style={{ zIndex: 9999, isolation: 'isolate' }}
        >
          {(() => {
            const rows = [];
            rows.push({ type: 'item', key: '__all', journal: { id: '', name: 'All Selected Journals' }, isFirstInGroup: true, pub: null });
            let prevPub = null;
            journals.forEach((j, idx) => {
              const pub = publisherKeyForId(j.id) || 'other';
              const isFirstInGroup = idx === 0 || pub !== prevPub;
              if (isFirstInGroup) {
                rows.push({ type: 'sep', key: `sep-${idx}-${pub}` });
                rows.push({ type: 'label', key: `lbl-${pub}`, pub });
              }
              rows.push({ type: 'item', key: j.id || `item-${idx}`, journal: j, isFirstInGroup, pub });
              prevPub = pub;
            });
            return rows.map((row) => {
              if (row.type === 'sep') {
                return (
                  <div
                    key={row.key}
                    className="my-1 mx-3 border-t border-slate-300 dark:border-white/15"
                  />
                );
              }
              if (row.type === 'label') {
                const labelColor = PUBLISHER_COLORS[row.pub] || '#64748b';
                return (
                  <div key={row.key} className="px-3 pt-0.5 pb-[1px]">
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: labelColor }}>
                      {PUBLISHER_LABELS[row.pub] || row.pub}
                    </span>
                  </div>
                );
              }
              const j = row.journal;
              const isSelected = j.id === value;
              const pubColor = j.id ? colorFor(j.id) : null;
              return (
                <button
                  key={j.id || '__all'}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(j.id); setOpen(false); }}
                  className="w-full flex items-center gap-2 pl-3 pr-4 py-[0.08rem] text-sm text-left transition-colors text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="w-4 flex-shrink-0 flex items-center justify-center">
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : pubColor ? (
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pubColor }} />
                    ) : null}
                  </span>
                  <span className="truncate">
                    {j.name}
                  </span>
                </button>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
