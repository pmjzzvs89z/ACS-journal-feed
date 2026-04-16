// @ts-nocheck — see ArticleCard for rationale
import React, { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronDown, X, FlaskConical, Cog, Layers, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';

import JournalSearch from './JournalSearch';
function FilterDropdown({ value, onChange, options, allLabel, style }) {
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

  const selected = options.find(o => o.value === value);
  const label = selected ? selected.label : allLabel;

  return (
    <div ref={wrapRef} className="relative" style={style}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center gap-2 rounded-lg border border-border px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-slate-300 dark:bg-[rgb(38,42,56)]"
        style={{ fontSize: '0.828rem', height: '2.013rem' }}
      >
        <span className="truncate flex-1 text-left">{label}</span>
        <ChevronDown className="w-[1.09rem] h-[1.09rem] opacity-70 flex-shrink-0" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1 min-w-full max-h-[60vh] overflow-y-auto rounded-xl py-1 shadow-2xl bg-white dark:bg-[rgb(28,30,38)] border border-slate-300 dark:border-slate-500"
          style={{
            zIndex: 9999,
            isolation: 'isolate',
          }}
        >
          {[{ value: '', label: allLabel }, ...options].map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value || '__all'}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center gap-2 pl-3 pr-4 py-[0.192rem] text-sm text-left transition-colors text-foreground hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <span className="w-4 flex-shrink-0 flex items-center justify-center">
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 text-foreground" />
                  ) : opt.color ? (
                    <span className="w-[0.47rem] h-[0.47rem] rounded-full" style={{ backgroundColor: opt.color }} />
                  ) : null}
                </span>
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import {
  ALL_JOURNALS,
  ACS_JOURNALS, RSC_JOURNALS, WILEY_JOURNALS, ELSEVIER_JOURNALS,
  MDPI_JOURNALS, SPRINGER_JOURNALS, TAYLOR_JOURNALS, AAAS_JOURNALS,
  CHEMISTRY_CATEGORIES, ENGINEERING_CATEGORIES, MATERIALS_CATEGORIES,
  ELSEVIER_ENGINEERING_JOURNALS, WILEY_ENGINEERING_JOURNALS, ACS_ENGINEERING_JOURNALS,
  RSC_ENGINEERING_JOURNALS, SPRINGER_ENGINEERING_JOURNALS, TAYLOR_ENGINEERING_JOURNALS,
  ASME_ENGINEERING_JOURNALS, ICHEMEE_ENGINEERING_JOURNALS,
  ACS_MATERIALS_JOURNALS, RSC_MATERIALS_JOURNALS, WILEY_MATERIALS_JOURNALS,
  ELSEVIER_MATERIALS_JOURNALS, MDPI_MATERIALS_JOURNALS, SPRINGER_MATERIALS_JOURNALS,
  IOP_MATERIALS_JOURNALS,
} from './JournalList';
import AddCustomJournal from './AddCustomJournal';
import SelectedJournalsList from './SelectedJournalsList';

// ⚠️  Publisher colors — keep in sync with PUBLISHER_COLORS in
//     ArticleFeed.jsx and the table in CLAUDE.md.
//     Chosen so adjacent publishers in the list have maximally distinct hues.
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

const JournalSelector = forwardRef(function JournalSelector({ followedJournals, onToggleJournal, onCustomJournalAdded, onDeleteJournal, showSelected, uniqueActiveJournals, activeCount, onUnselectAll }, ref) {
  const [activeField, setActiveField] = useState('chemistry'); // 'chemistry' | 'engineering' | 'materials'
  const [expandedPublisher, setExpandedPublisher] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Clear everything — same effect as pressing the blue "Close" button, plus
  // collapsing any expanded publisher/category accordion.
  const clearAll = () => {
    setExpandedPublisher(null);
    setExpandedCategories(new Set());
    setFilterCategory('');
    setFilterPublisher('');
  };

  const hasSomethingOpen =
    expandedPublisher !== null ||
    expandedCategories.size > 0 ||
    filterCategory !== '' ||
    filterPublisher !== '';

  // Expose an imperative API so the parent page (Settings.jsx) can trigger
  // clearAll() when the user clicks outside the JournalSelector card.
  useImperativeHandle(ref, () => ({
    clearAll,
    hasSomethingOpen: () =>
      expandedPublisher !== null ||
      expandedCategories.size > 0 ||
      filterCategory !== '' ||
      filterPublisher !== '',
  }), [expandedPublisher, expandedCategories, filterCategory, filterPublisher]);

  const PUBLISHERS = activeField === 'chemistry' ? CHEMISTRY_PUBLISHERS : activeField === 'engineering' ? ENGINEERING_PUBLISHERS : MATERIALS_PUBLISHERS;
  const CATEGORIES = activeField === 'chemistry' ? CHEMISTRY_CATEGORIES : activeField === 'engineering' ? ENGINEERING_CATEGORIES : MATERIALS_CATEGORIES;

  // All static journal IDs for detecting custom ones
  const allStaticIds = useMemo(() => new Set(ALL_JOURNALS.map(j => j.id)), []);

  // Custom journals: followed journals not in any static catalog
  const customJournals = useMemo(() =>
    followedJournals.filter(j => !allStaticIds.has(j.journal_id)),
    [followedJournals, allStaticIds]
  );

  // Build a set of active RSS URLs so cross-field siblings (same feed,
  // different journal ID) show the correct toggle state.
  const activeRssUrls = useMemo(() => {
    const s = new Set();
    followedJournals.forEach(j => { if (j.is_active) s.add(j.rss_url); });
    return s;
  }, [followedJournals]);

  const isFollowed = (journalId) => {
    // Direct ID match
    if (followedJournals.some(j => j.journal_id === journalId && j.is_active)) return true;
    // Cross-field sibling: same RSS URL is already active under a different ID
    const journal = ALL_JOURNALS.find(j => j.id === journalId);
    return journal ? activeRssUrls.has(journal.rss_url) : false;
  };

  const isFiltering = filterCategory !== '' || filterPublisher !== '';

  // Compute filtered results (used only when category/publisher filters active;
  // keyword search is handled by the JournalSearch child component).
  const filteredPublishers = useMemo(() => {
    return PUBLISHERS
      .filter(p => !filterPublisher || p.id === filterPublisher)
      .map(p => {
        const journals = p.journals
          .filter(j => !filterCategory || j.category === filterCategory)
          .sort((a, b) => a.name.localeCompare(b.name));
        return { ...p, journals };
      })
      .filter(p => p.journals.length > 0);
  }, [filterCategory, filterPublisher, activeField]);

  // All journals across all publisher groups (for JournalSearch)
  const allCurrentJournals = useMemo(() => PUBLISHERS.flatMap(p => p.journals), [activeField]);

  const togglePublisher = (publisherId) => {
    if (isFiltering) return; // accordion is bypassed when filtering
    setExpandedPublisher(prev => {
      if (prev === publisherId) { setExpandedCategories(new Set()); return null; }
      setExpandedCategories(new Set());
      return publisherId;
    });
  };

  const toggleCategory = (key) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterPublisher('');
  };

  const handleFieldSwitch = (field) => {
    setActiveField(field);
    setExpandedPublisher(null);
    setExpandedCategories(new Set());
    setFilterCategory('');
    setFilterPublisher('');
  };

  const renderJournal = (journal, publisher) => {
    const followed = isFollowed(journal.id);
    return (
      <button
        key={journal.id}
        onClick={(e) => { e.stopPropagation(); onToggleJournal(journal); }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
          followed ? "bg-card border-[1.05px] border-border shadow-sm hover:border-red-400 dark:hover:border-red-500" : "bg-slate-100 dark:bg-[rgb(40,44,55)] border-[1.05px] border-transparent rounded-lg hover:border-green-400 dark:hover:border-green-500"
        )}
      >
        <div
          className="w-4 h-4 rounded-full flex-shrink-0 border-2 transition-all flex items-center justify-center"
          style={{
            borderColor: publisher.color,
            backgroundColor: followed ? publisher.color : 'transparent',
          }}
        >
          {followed && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <BookOpen
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: followed ? journal.color : '#94a3b8' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate">
            <span className="font-semibold text-foreground">{journal.abbrev}</span>
            <span className="text-muted-foreground/80"> ({journal.name})</span>
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Fixed (non-scrolling) header: field tabs + search + filters.
           Hidden when the "X journals selected" panel is open. */}
      {!showSelected && (
      <div className="flex-shrink-0 px-4 pt-2 pb-2 space-y-[5px] bg-muted/50">
      <div className="flex items-center gap-1 rounded-xl p-1 bg-slate-300 dark:bg-[rgb(38,42,56)]">
        <button
          onClick={() => handleFieldSwitch('chemistry')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-all",
            activeField === 'chemistry'
              ? "bg-card shadow text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Chemistry & Molecular Science</span>
        </button>
        <button
          onClick={() => handleFieldSwitch('engineering')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-all",
            activeField === 'engineering'
              ? "bg-card shadow text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Cog className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Engineering & Process Science</span>
        </button>
        <button
          onClick={() => handleFieldSwitch('materials')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-all",
            activeField === 'materials'
              ? "bg-card shadow text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Materials, Analytics & Sustainability</span>
        </button>
      </div>

      {/* Keyword search — uses AI-indexed scopes */}
      <JournalSearch
        allJournals={allCurrentJournals}
        publishers={PUBLISHERS}
        onResults={(q, r) => { setSearchQuery(q); setSearchResults(r); }}
        placeholder="Search journals by topic, keyword, or method…"
      />

      {/* Filters row — dropdowns span full width to match the search box above */}
      <div className="flex gap-2">
        <FilterDropdown
          value={filterPublisher}
          onChange={setFilterPublisher}
          options={PUBLISHERS.map(p => ({ value: p.id, label: p.label, color: p.color }))}
          allLabel="(By Publisher)"
          style={{ flex: '1 1 0', minWidth: 0 }}
        />

        <FilterDropdown
          value={filterCategory}
          onChange={setFilterCategory}
          options={CATEGORIES.map(c => ({ value: c, label: c }))}
          allLabel="(By Category across Publishers)"
          style={{ flex: '1 1 0', minWidth: 0 }}
        />
      </div>
      </div>
      )}{/* end fixed header */}

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto journal-scroll px-4 pt-1 pb-4 bg-muted/50">

      {/* Results */}
      {showSelected ? (
        <SelectedJournalsList
          followedJournals={followedJournals}
          onToggleJournal={onToggleJournal}
          onDeleteJournal={onDeleteJournal}
          onUnselectAll={onUnselectAll}
        />
      ) : searchQuery ? (
        /* Keyword search results — flat list grouped by publisher */
        <div className="space-y-[5px]">
          {searchResults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No journals found for &ldquo;<strong>{searchQuery}</strong>&rdquo;.</p>
          ) : (() => {
            // Group results by publisher
            const publisherMap = {};
            PUBLISHERS.forEach(p => p.journals.forEach(j => { publisherMap[j.id] = p; }));
            const groups = {};
            searchResults.forEach(j => {
              const p = publisherMap[j.id];
              if (!p) return;
              if (!groups[p.id]) groups[p.id] = { ...p, journals: [] };
              groups[p.id].journals.push(j);
            });
            const groupedPublishers = Object.values(groups);
            return (
              <>
                <p className="text-xs text-muted-foreground px-1 pb-1">{searchResults.length} journal{searchResults.length !== 1 ? 's' : ''} found</p>
                {groupedPublishers.map(publisher => (
                  <div key={publisher.id} className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-border" style={{ backgroundColor: `${publisher.color}10` }}>
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: publisher.color }} />
                      <span className="text-xs font-normal text-muted-foreground">{publisher.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{publisher.journals.length} journal{publisher.journals.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="py-1 px-3 space-y-0.5 bg-muted/50">
                      {publisher.journals.sort((a, b) => a.name.localeCompare(b.name)).map(j => renderJournal(j, publisher))}
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      ) : isFiltering ? (
        /* Flat filtered list grouped by publisher */
        <div className="space-y-[5px]">
          {filteredPublishers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No journals found.</p>
          ) : (
            filteredPublishers.map(publisher => (
              <div key={publisher.id} className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border" style={{ backgroundColor: `${publisher.color}10` }}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: publisher.color }} />
                  <span className="text-xs font-normal text-muted-foreground">{publisher.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{publisher.journals.length} journal{publisher.journals.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="py-1 px-3 space-y-0.5 bg-muted/50">
                  {publisher.journals.map(j => renderJournal(j, publisher))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Normal accordion view */
        <div className="space-y-[5px]">
          {PUBLISHERS.map((publisher) => {
            const isPublisherOpen = expandedPublisher === publisher.id;
            const publisherSelected = publisher.journals.filter(j => isFollowed(j.id)).length;

            return (
              <div key={publisher.id} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => togglePublisher(publisher.id)}
                  className="w-full flex items-center gap-3 px-4 py-[0.325rem] transition-colors"
                  style={{ backgroundColor: `${publisher.color}10` }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${publisher.color}1a`; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${publisher.color}10`; }}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: publisher.color }} />
                  <span className="font-normal text-foreground text-sm">{publisher.label}</span>
                  <span className="text-[11px] text-muted-foreground font-normal ml-1">{publisher.journals.length}</span>
                  <span className="flex-1" />
                  {publisherSelected > 0 && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: publisher.color }}>
                      {publisherSelected}
                    </span>
                  )}
                  {isPublisherOpen
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>

                <AnimatePresence initial={false}>
                  {isPublisherOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="divide-y divide-border">
                        {CATEGORIES.map((category) => {
                          const categoryJournals = publisher.journals.filter(j => j.category === category).sort((a, b) => a.name.localeCompare(b.name));
                          if (categoryJournals.length === 0) return null;
                          const categoryKey = `${publisher.id}-${category}`;
                          const isCategoryOpen = expandedCategories.has(categoryKey);
                          const selectedCount = categoryJournals.filter(j => isFollowed(j.id)).length;

                          return (
                            <div key={category}>
                              <button
                                onClick={() => toggleCategory(categoryKey)}
                                className="w-full flex items-center gap-3 px-4 py-[0.4rem] bg-card hover:bg-accent transition-colors"
                              >
                                <span className="text-left text-sm text-foreground pl-2">{category}</span>
                                <span className="text-[11px] text-muted-foreground font-normal ml-1">{categoryJournals.length}</span>
                                <span className="flex-1" />
                                {selectedCount > 0 && (
                                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: publisher.color }}>
                                    {selectedCount}
                                  </span>
                                )}
                                {isCategoryOpen
                                  ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                              </button>

                              <AnimatePresence initial={false}>
                                {isCategoryOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden bg-muted/50 border-t border-border"
                                  >
                                    <div className="py-1 px-3 space-y-0.5">
                                      {categoryJournals.map(j => renderJournal(j, publisher))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Add Journal Manually — shown in both fields */}
          <AddCustomJournal onJournalAdded={onCustomJournalAdded} />

          {/* Journals Added Manually section */}
          {customJournals.length > 0 && (() => {
            const isOpen = expandedPublisher === '__custom__';
            const selectedCount = customJournals.filter(j => j.is_active).length;
            const color = '#7c3aed';
            return (
              <div className="rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden">
                <button
                  onClick={() => togglePublisher('__custom__')}
                  className="w-full flex items-center gap-3 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-normal text-foreground text-sm">Journals Added Manually</span>
                  <span className="text-[11px] text-muted-foreground font-normal ml-1">{customJournals.length}</span>
                  <span className="flex-1" />
                  {selectedCount > 0 && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                      {selectedCount}
                    </span>
                  )}
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-purple-100 dark:border-purple-800"
                    >
                      <div className="py-1 px-3 space-y-0.5 bg-muted/50">
                        {customJournals.map(j => {
                          const followed = j.is_active;
                          return (
                            <div
                              key={j.journal_id}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                                followed ? "bg-card border-[1.05px] border-border shadow-sm hover:border-red-400 dark:hover:border-red-500" : "bg-slate-100 dark:bg-[rgb(40,44,55)] border-[1.05px] border-transparent rounded-lg hover:border-green-400 dark:hover:border-green-500"
                              )}
                            >
                              <button
                                onClick={() => onToggleJournal({ id: j.journal_id, name: j.journal_name, rss_url: j.rss_url })}
                                className="flex items-center gap-3 flex-1 min-w-0 text-left"
                              >
                                <div
                                  className="w-4 h-4 rounded-full flex-shrink-0 border-2 transition-all flex items-center justify-center"
                                  style={{ borderColor: color, backgroundColor: followed ? color : 'transparent' }}
                                >
                                  {followed && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: followed ? color : '#94a3b8' }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{j.journal_name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{j.rss_url}</p>
                                </div>
                              </button>
                              <Tooltip label="Delete journal" delay={500}>
                                <button
                                  onClick={() => {
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}
        </div>
      )}
      </div>{/* end scrollable body */}
    </div>
  );
});

export default JournalSelector;