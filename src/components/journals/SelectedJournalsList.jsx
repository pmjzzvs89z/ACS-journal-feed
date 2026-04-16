// @ts-nocheck
import React, { useMemo } from 'react';
import { BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';

import {
  ALL_JOURNALS,
  ACS_JOURNALS, RSC_JOURNALS, WILEY_JOURNALS, ELSEVIER_JOURNALS,
  MDPI_JOURNALS, SPRINGER_JOURNALS, TAYLOR_JOURNALS, AAAS_JOURNALS,
  ELSEVIER_ENGINEERING_JOURNALS, WILEY_ENGINEERING_JOURNALS, ACS_ENGINEERING_JOURNALS,
  RSC_ENGINEERING_JOURNALS, SPRINGER_ENGINEERING_JOURNALS, TAYLOR_ENGINEERING_JOURNALS,
  ASME_ENGINEERING_JOURNALS, ICHEMEE_ENGINEERING_JOURNALS,
  ACS_MATERIALS_JOURNALS, RSC_MATERIALS_JOURNALS, WILEY_MATERIALS_JOURNALS,
  ELSEVIER_MATERIALS_JOURNALS, MDPI_MATERIALS_JOURNALS, SPRINGER_MATERIALS_JOURNALS,
  IOP_MATERIALS_JOURNALS,
  PUBLISHER_ORDER, PUBLISHER_COLORS, PUBLISHER_LABELS,
} from './JournalList';

const CHEMISTRY_PUBLISHERS = [
  { id: 'acs',      label: 'ACS',             journals: ACS_JOURNALS,      color: '#2563eb' },
  { id: 'elsevier', label: 'Elsevier',        journals: ELSEVIER_JOURNALS, color: '#ea580c' },
  { id: 'rsc',      label: 'RSC',             journals: RSC_JOURNALS,      color: '#c026d3' },
  { id: 'wiley',    label: 'Wiley',           journals: WILEY_JOURNALS,    color: '#16a34a' },
  { id: 'aaas',     label: 'AAAS',            journals: AAAS_JOURNALS,     color: '#dc2626' },
  { id: 'mdpi',     label: 'MDPI',            journals: MDPI_JOURNALS,     color: '#0891b2' },
  { id: 'springer', label: 'Springer Nature', journals: SPRINGER_JOURNALS, color: '#ca8a04' },
  { id: 'taylor',   label: 'Taylor & Francis',journals: TAYLOR_JOURNALS,  color: '#7c3aed' },
];

const ENGINEERING_PUBLISHERS = [
  { id: 'eng_acs',      label: 'ACS',             journals: ACS_ENGINEERING_JOURNALS,      color: '#2563eb' },
  { id: 'eng_elsevier', label: 'Elsevier',        journals: ELSEVIER_ENGINEERING_JOURNALS, color: '#ea580c' },
  { id: 'eng_rsc',      label: 'RSC',             journals: RSC_ENGINEERING_JOURNALS,      color: '#c026d3' },
  { id: 'eng_wiley',    label: 'Wiley',           journals: WILEY_ENGINEERING_JOURNALS,    color: '#16a34a' },
  { id: 'eng_springer', label: 'Springer Nature', journals: SPRINGER_ENGINEERING_JOURNALS, color: '#ca8a04' },
  { id: 'eng_taylor',   label: 'Taylor & Francis', journals: TAYLOR_ENGINEERING_JOURNALS,  color: '#7c3aed' },
  { id: 'eng_asme',     label: 'ASME',            journals: ASME_ENGINEERING_JOURNALS,     color: '#475569' },
  { id: 'eng_icheme',   label: 'IChemE',          journals: ICHEMEE_ENGINEERING_JOURNALS,  color: '#475569' },
];

const MATERIALS_PUBLISHERS = [
  { id: 'mat_acs',      label: 'ACS',             journals: ACS_MATERIALS_JOURNALS,      color: '#2563eb' },
  { id: 'mat_rsc',      label: 'RSC',             journals: RSC_MATERIALS_JOURNALS,      color: '#c026d3' },
  { id: 'mat_wiley',    label: 'Wiley',           journals: WILEY_MATERIALS_JOURNALS,    color: '#16a34a' },
  { id: 'mat_elsevier', label: 'Elsevier',        journals: ELSEVIER_MATERIALS_JOURNALS, color: '#ea580c' },
  { id: 'mat_mdpi',     label: 'MDPI',            journals: MDPI_MATERIALS_JOURNALS,     color: '#0891b2' },
  { id: 'mat_springer', label: 'Springer Nature', journals: SPRINGER_MATERIALS_JOURNALS, color: '#ca8a04' },
  { id: 'mat_iop',      label: 'IOP Publishing',  journals: IOP_MATERIALS_JOURNALS,      color: '#475569' },
];

// Use canonical PUBLISHER_COLORS and PUBLISHER_LABELS from JournalList

const ALL_PUBLISHERS = [...CHEMISTRY_PUBLISHERS, ...ENGINEERING_PUBLISHERS, ...MATERIALS_PUBLISHERS];

/**
 * Selected journals view — grouped by publisher matching the Feed dropdown.
 * Clicking the row toggles active/inactive (deselect keeps the journal on
 * the list but removes it from the Feed). The X button fully deletes.
 */
export default function SelectedJournalsList({ followedJournals, onToggleJournal, onDeleteJournal, onUnselectAll }) {
  // Build journal ID → publisher key map
  const idToPub = useMemo(() => {
    const map = new Map();
    ALL_PUBLISHERS.forEach(p => {
      const key = p.id.replace(/^(eng_|mat_)/, '');
      p.journals.forEach(j => { if (!map.has(j.id)) map.set(j.id, key); });
    });
    return map;
  }, []);

  // Deduplicate followed journals by RSS URL (O(N) via Map)
  const groups = useMemo(() => {
    const firstByRss = new Map();
    followedJournals.forEach(j => {
      if (!firstByRss.has(j.rss_url)) firstByRss.set(j.rss_url, j.id);
    });
    const deduped = followedJournals.filter(j => firstByRss.get(j.rss_url) === j.id);

    // Enrich each entry with catalog data + publisher key
    const enriched = deduped.map(j => {
      let journal = null;
      for (const p of ALL_PUBLISHERS) {
        const found = p.journals.find(pj => pj.id === j.journal_id);
        if (found) { journal = found; break; }
      }
      if (!journal) {
        const fromCatalog = ALL_JOURNALS.find(aj => aj.rss_url === j.rss_url);
        if (fromCatalog) journal = fromCatalog;
      }
      if (!journal) journal = { id: j.journal_id, name: j.journal_name, abbrev: j.journal_name, rss_url: j.rss_url };
      const pubKey = idToPub.get(j.journal_id) || idToPub.get(journal.id) || 'other';
      return { dbEntry: j, journal, pubKey };
    });

    // Sort by publisher order, then A→Z within each group
    enriched.sort((a, b) => {
      const pa = PUBLISHER_ORDER.indexOf(a.pubKey);
      const pb = PUBLISHER_ORDER.indexOf(b.pubKey);
      const ia = pa === -1 ? PUBLISHER_ORDER.length : pa;
      const ib = pb === -1 ? PUBLISHER_ORDER.length : pb;
      if (ia !== ib) return ia - ib;
      return (a.journal.abbrev || a.journal.name).localeCompare(b.journal.abbrev || b.journal.name, undefined, { sensitivity: 'base' });
    });

    // Group by publisher
    const result = [];
    let lastPub = null;
    enriched.forEach(item => {
      if (item.pubKey !== lastPub) {
        result.push({ pubKey: item.pubKey, items: [] });
        lastPub = item.pubKey;
      }
      result[result.length - 1].items.push(item);
    });
    return result;
  }, [followedJournals, idToPub]);

  return (
    <div>
      <div className="flex items-center gap-2 px-1 pb-2">
        <button
          onClick={onUnselectAll}
          className="text-sm text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
        >
          Unselect All
        </button>
      </div>
      {groups.map((group, gi) => (
        <div key={group.pubKey}>
          {gi > 0 && (
            <div className="my-1.5 mx-3 border-t border-slate-300 dark:border-white/15" />
          )}
          <div className="px-1 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: PUBLISHER_COLORS[group.pubKey] }}>
              {PUBLISHER_LABELS[group.pubKey] || group.pubKey}
            </span>
          </div>
          <div className="space-y-1">
            {group.items.map(({ dbEntry: j, journal, pubKey }) => {
              const followed = j.is_active;
              const color = PUBLISHER_COLORS[pubKey];
              return (
                <div
                  key={j.id}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-[0.4rem] rounded-lg transition-all",
                    followed
                      ? "bg-card border-[1.05px] border-border hover:border-red-400 dark:hover:border-red-500"
                      : "bg-slate-100 dark:bg-[rgb(40,44,55)] border-[1.05px] border-transparent hover:border-green-400 dark:hover:border-green-500"
                  )}
                >
                  <button
                    onClick={() => onToggleJournal(journal)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                  >
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all"
                      style={{ borderColor: color, backgroundColor: followed ? color : 'transparent' }}
                    >
                      {followed && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: followed ? color : '#94a3b8' }} />
                    <span className="text-xs text-foreground truncate">
                      <span className="font-semibold">{journal.abbrev || j.journal_name}</span>
                      {journal.abbrev && journal.name && journal.abbrev !== journal.name && (
                        <span className="text-muted-foreground/80"> ({journal.name})</span>
                      )}
                    </span>
                  </button>
                  <Tooltip label="Remove journal" delay={500}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteJournal) onDeleteJournal(j);
                      }}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
