import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const listRef = useRef(null);
  // Active descendant for arrow-key navigation. '' = All Selected Journals row.
  const [activeId, setActiveId] = useState(value || '');

  // Flat list of selectable ids in render order — used for arrow navigation.
  const navIds = ['', ...journals.map(j => j.id)];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // When opening, sync active with currently-selected value so arrow keys
  // start at the right position.
  useEffect(() => {
    if (open) setActiveId(value || '');
  }, [open, value]);

  // Scroll the active option into view as the user arrows through the list.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-journal-id="${CSS.escape(activeId || '__all')}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeId, open]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const i = navIds.indexOf(activeId);
      const next = e.key === 'ArrowDown'
        ? (i < 0 ? 0 : Math.min(i + 1, navIds.length - 1))
        : (i <= 0 ? 0 : i - 1);
      setActiveId(navIds[next]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveId(navIds[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveId(navIds[navIds.length - 1]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onChange(activeId);
      setOpen(false);
    }
  };

  const selected = journals.find(j => j.id === value);
  const label = selected ? selected.name : 'All Selected Journals';

  const colorFor = (id) => {
    const key = publisherKeyForId(id);
    return PUBLISHER_COLORS[key] || '#64748b';
  };

  const selectedColor = selected ? colorFor(selected.id) : null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        id="feed-journal-dropdown-trigger"
        type="button"
        onClick={(e) => { setOpen(o => !o); e.currentTarget.focus(); }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open ? `journal-opt-${activeId || '__all'}` : undefined}
        className="flex items-center justify-center gap-2 h-9 min-w-[135px] text-sm border border-slate-300 dark:border-blue-700 rounded-lg px-3 bg-slate-200/80 dark:bg-blue-900/30 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-slate-300/80 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
      >
        {selectedColor && (
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedColor }} />
        )}
        <span className="truncate max-w-[220px] text-center">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>
      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Filter by journal"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 min-w-[220px] max-h-[41rem] overflow-y-auto rounded-xl py-1 shadow-2xl bg-white dark:bg-[rgb(44,48,60)] border border-neutral-300 dark:border-white/10 journal-scroll"
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
              const isActive = j.id === activeId;
              // "All Selected Journals" has no publisher — use a neutral slate dot
              const pubColor = j.id ? colorFor(j.id) : '#64748b';
              return (
                <button
                  key={j.id || '__all'}
                  id={`journal-opt-${j.id || '__all'}`}
                  data-journal-id={j.id || '__all'}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveId(j.id)}
                  onClick={() => { onChange(j.id); setOpen(false); }}
                  className={`mx-3 w-[calc(100%-1.5rem)] flex items-center gap-2 pl-3 pr-4 py-[0.08rem] text-sm text-left transition-colors text-slate-900 dark:text-white ${isSelected ? 'bg-slate-300 dark:bg-[rgb(20,34,71)] border border-slate-400 dark:border-blue-700 rounded-lg' : `border border-transparent ${isActive ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}`}
                >
                  <span className="w-4 flex-shrink-0 flex items-center justify-center">
                    {pubColor ? (
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
