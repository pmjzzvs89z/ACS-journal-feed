import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronDown, X, FlaskConical, Cog, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { entities } from '@/api/entities';
import JournalDiscover from './JournalDiscover';
import JournalSearch from './JournalSearch';
const CATEGORY_KEYWORDS = {
  'General': ['general', 'chemistry', 'chemical', 'multidisciplinary'],
  'Analytical Chemistry': ['analytical', 'analysis', 'sensor', 'spectroscopy', 'chromatography', 'measurement', 'detection', 'toxicology', 'toxic'],
  'Biological/Medicinal Chemistry': ['biology', 'biological', 'medicinal', 'drug', 'pharmaceutical', 'biochemistry', 'medicine', 'biomedical', 'enzyme', 'protein', 'toxicology', 'toxic', 'pharmacology'],
  'Physical/Theoretical Chemistry': ['physical', 'theoretical', 'computational', 'quantum', 'thermodynamics', 'kinetics', 'simulation'],
  'Inorganic/Materials Chemistry': ['inorganic', 'materials', 'crystal', 'nanomaterial', 'solid state', 'coordination'],
  'Polymers/Macromolecules': ['polymer', 'macromolecule', 'soft matter', 'rubber', 'plastic'],
  'Organic Chemistry': ['organic', 'synthesis', 'catalysis', 'natural product', 'reaction'],
  'Applied/Industrial Chemistry': ['applied', 'industrial', 'engineering', 'environment', 'energy', 'sustainable', 'green', 'toxicology', 'environmental'],
  'Materials Science & Nanotechnology': ['materials', 'nano', 'nanotechnology', 'surface', 'thin film', 'semiconductor'],
  'Analytical & Measurement Science': ['analytical', 'measurement', 'sensor', 'spectroscopy', 'detection', 'toxicology'],
  'Sustainability & Green Chemistry': ['sustainability', 'green', 'environment', 'energy', 'renewable', 'carbon', 'toxicology'],
  'Sensors & Diagnostics': ['sensor', 'diagnostic', 'biosensor', 'imaging', 'detection'],
  'Polymers & Soft Matter': ['polymer', 'soft matter', 'colloid', 'gel', 'hydrogel'],
  'Chemical Engineering': ['chemical engineering', 'process', 'reactor', 'fluid', 'heat transfer'],
  'Reaction Engineering': ['reaction', 'kinetics', 'catalysis', 'reactor', 'combustion'],
  'Separations': ['separation', 'membrane', 'chromatography', 'distillation', 'extraction'],
  'Process Modeling & Simulation': ['modeling', 'simulation', 'computation', 'optimization', 'control'],
  'Scale-up & Manufacturing Science': ['scale-up', 'manufacturing', 'pharmaceutical', 'production', 'formulation', 'toxicology'],
};

import {
  ACS_JOURNALS, RSC_JOURNALS, WILEY_JOURNALS, ELSEVIER_JOURNALS,
  MDPI_JOURNALS, SPRINGER_JOURNALS, TAYLOR_JOURNALS, AAAS_JOURNALS,
  CHEMISTRY_CATEGORIES, ENGINEERING_CATEGORIES, MATERIALS_CATEGORIES,
  ELSEVIER_ENGINEERING_JOURNALS, WILEY_ENGINEERING_JOURNALS, ACS_ENGINEERING_JOURNALS,
  RSC_ENGINEERING_JOURNALS, SPRINGER_ENGINEERING_JOURNALS, TAYLOR_ENGINEERING_JOURNALS,
  ASME_ENGINEERING_JOURNALS, ICHEMEE_ENGINEERING_JOURNALS,
  ACS_MATERIALS_JOURNALS, RSC_MATERIALS_JOURNALS, WILEY_MATERIALS_JOURNALS,
  ELSEVIER_MATERIALS_JOURNALS, MDPI_MATERIALS_JOURNALS, SPRINGER_MATERIALS_JOURNALS,
  IOP_MATERIALS_JOURNALS
} from './JournalList';
import AddCustomJournal from './AddCustomJournal';

const CHEMISTRY_PUBLISHERS = [
  { id: 'acs',      label: 'ACS',             journals: ACS_JOURNALS,      color: '#0066b3' },
  { id: 'elsevier', label: 'Elsevier',        journals: ELSEVIER_JOURNALS, color: '#ff6c00' },
  { id: 'rsc',      label: 'RSC',             journals: RSC_JOURNALS,      color: '#e63946' },
  { id: 'wiley',    label: 'Wiley',           journals: WILEY_JOURNALS,    color: '#d63384' },
  { id: 'aaas',     label: 'AAAS',            journals: AAAS_JOURNALS,     color: '#c0392b' },
  { id: 'mdpi',     label: 'MDPI',            journals: MDPI_JOURNALS,     color: '#0a9396' },
  { id: 'springer', label: 'Springer Nature', journals: SPRINGER_JOURNALS, color: '#e9a000' },
  { id: 'taylor',   label: 'Taylor & Francis',journals: TAYLOR_JOURNALS,  color: '#6f42c1' },
];

const ENGINEERING_PUBLISHERS = [
  { id: 'eng_acs',      label: 'ACS',             journals: ACS_ENGINEERING_JOURNALS,      color: '#0066b3' },
  { id: 'eng_elsevier', label: 'Elsevier',        journals: ELSEVIER_ENGINEERING_JOURNALS, color: '#ff6c00' },
  { id: 'eng_rsc',      label: 'RSC',             journals: RSC_ENGINEERING_JOURNALS,      color: '#e63946' },
  { id: 'eng_wiley',    label: 'Wiley',           journals: WILEY_ENGINEERING_JOURNALS,    color: '#d63384' },
  { id: 'eng_springer', label: 'Springer Nature', journals: SPRINGER_ENGINEERING_JOURNALS, color: '#e9a000' },
  { id: 'eng_taylor',   label: 'Taylor & Francis', journals: TAYLOR_ENGINEERING_JOURNALS,  color: '#6f42c1' },
  { id: 'eng_asme',     label: 'ASME',            journals: ASME_ENGINEERING_JOURNALS,     color: '#004B87' },
  { id: 'eng_icheme',   label: 'IChemE',          journals: ICHEMEE_ENGINEERING_JOURNALS,  color: '#005A9C' },
];

const MATERIALS_PUBLISHERS = [
  { id: 'mat_acs',      label: 'ACS',             journals: ACS_MATERIALS_JOURNALS,      color: '#0066b3' },
  { id: 'mat_rsc',      label: 'RSC',             journals: RSC_MATERIALS_JOURNALS,      color: '#e63946' },
  { id: 'mat_wiley',    label: 'Wiley',           journals: WILEY_MATERIALS_JOURNALS,    color: '#d63384' },
  { id: 'mat_elsevier', label: 'Elsevier',        journals: ELSEVIER_MATERIALS_JOURNALS, color: '#ff6c00' },
  { id: 'mat_mdpi',     label: 'MDPI',            journals: MDPI_MATERIALS_JOURNALS,     color: '#0a9396' },
  { id: 'mat_springer', label: 'Springer Nature', journals: SPRINGER_MATERIALS_JOURNALS, color: '#e9a000' },
  { id: 'mat_iop',      label: 'IOP Publishing',  journals: IOP_MATERIALS_JOURNALS,      color: '#C8102E' },
];

export default function JournalSelector({ followedJournals, onToggleJournal, onCustomJournalAdded }) {
  const [activeField, setActiveField] = useState('chemistry'); // 'chemistry' | 'engineering' | 'materials' | 'discover'
  const [expandedPublisher, setExpandedPublisher] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');

  const PUBLISHERS = activeField === 'chemistry' ? CHEMISTRY_PUBLISHERS : activeField === 'engineering' ? ENGINEERING_PUBLISHERS : MATERIALS_PUBLISHERS;
  const CATEGORIES = activeField === 'chemistry' ? CHEMISTRY_CATEGORIES : activeField === 'engineering' ? ENGINEERING_CATEGORIES : MATERIALS_CATEGORIES;

  // All static journal IDs for detecting custom ones
  const allStaticIds = useMemo(() => new Set([...CHEMISTRY_PUBLISHERS, ...ENGINEERING_PUBLISHERS, ...MATERIALS_PUBLISHERS].flatMap(p => p.journals.map(j => j.id))), []);

  // Custom journals: followed journals not in any static publisher list
  const customJournals = useMemo(() =>
    followedJournals.filter(j => !allStaticIds.has(j.journal_id)),
    [followedJournals, allStaticIds]
  );

  const isFollowed = (journalId) =>
    followedJournals.some(j => j.journal_id === journalId && j.is_active);

  const isFiltering = filterCategory !== '' || filterPublisher !== '';
  const isSearching = search.trim() !== '';

  // Compute filtered results (used only when category/publisher filters active, not keyword search)
  const filteredPublishers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PUBLISHERS
      .filter(p => !filterPublisher || p.id === filterPublisher)
      .map(p => {
        const journals = p.journals.filter(j => {
          const matchesCategory = !filterCategory || j.category === filterCategory;
          const matchesSearch = !q ||
            j.name.toLowerCase().includes(q) ||
            j.abbrev.toLowerCase().includes(q) ||
            p.label.toLowerCase().includes(q);
          return matchesCategory && matchesSearch;
        }).sort((a, b) => a.name.localeCompare(b.name));
        return { ...p, journals };
      })
      .filter(p => p.journals.length > 0);
  }, [search, filterCategory, filterPublisher, activeField]);

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
    setSearch('');
    setFilterCategory('');
    setFilterPublisher('');
  };

  const handleFieldSwitch = (field) => {
    setActiveField(field);
    setExpandedPublisher(null);
    setExpandedCategories(new Set());
    setSearch('');
    setFilterCategory('');
    setFilterPublisher('');
  };

  const isDiscoverMode = activeField === 'discover';

  const renderJournal = (journal, publisher) => {
    const followed = isFollowed(journal.id);
    return (
      <button
        key={journal.id}
        onClick={(e) => { e.stopPropagation(); onToggleJournal(journal); }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
          followed ? "bg-card border border-border shadow-sm" : "hover:bg-card"
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
          <p className="text-xs font-semibold text-foreground truncate">{journal.abbrev}</p>
          <p className="text-xs text-muted-foreground truncate">{journal.name}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Field Selector Toggle — sticky so it stays visible when scrolling */}
      <div className="sticky top-0 z-10 bg-card pt-0 pb-1">
      <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
        <button
          onClick={() => handleFieldSwitch('chemistry')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-all",
            activeField === 'chemistry'
              ? "bg-card shadow text-blue-700 border border-blue-100"
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
              ? "bg-card shadow text-orange-700 border border-orange-100"
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
              ? "bg-card shadow text-emerald-700 border border-emerald-100"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Materials, Analytics & Sustainability</span>
        </button>
      </div>

      {/* Discover tab */}
      <button
        onClick={() => handleFieldSwitch(isDiscoverMode ? 'chemistry' : 'discover')}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-3 rounded-lg text-sm font-medium transition-all border",
          isDiscoverMode
            ? "bg-purple-50 border-purple-200 text-purple-700 shadow-sm"
            : "border-dashed border-slate-300 text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50"
        )}
        style={{ height: '2.1rem' }}
      >
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Discover Journals</span>
      </button>
      </div>{/* end sticky wrapper */}

      {/* Discover panel */}
      {isDiscoverMode && (
        <JournalDiscover followedJournals={followedJournals} onToggleJournal={onToggleJournal} />
      )}

      {/* Search bar + filters + results (hidden in discover mode) */}
      {!isDiscoverMode && (
        <>
      {/* Keyword search — uses AI-indexed scopes */}
      <JournalSearch
        allJournals={allCurrentJournals}
        publishers={PUBLISHERS}
        isFollowed={isFollowed}
        onToggleJournal={onToggleJournal}
        placeholder="Search journals by topic, keyword, or method…"
      />

      {/* Filters row */}
      <div className="flex gap-2">
        <select
          value={filterPublisher}
          onChange={e => setFilterPublisher(e.target.value)}
          className="rounded-lg border border-border bg-muted px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
          style={{ flex: '1.3', fontSize: '0.828rem', height: '1.75rem' }}
        >
          <option value="">All Publishers</option>
          {PUBLISHERS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="rounded-lg border border-border bg-muted px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
          style={{ flex: '1.3', fontSize: '0.828rem', height: '1.75rem' }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {isFiltering && (
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {isFiltering ? (
        /* Flat filtered list grouped by publisher */
        <div className="space-y-2">
          {filteredPublishers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No journals found.</p>
          ) : (
            filteredPublishers.map(publisher => (
              <div key={publisher.id} className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted border-b border-border">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: publisher.color }} />
                  <span className="text-xs font-semibold text-muted-foreground">{publisher.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{publisher.journals.length} journal{publisher.journals.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="py-1 px-3 space-y-0.5 bg-muted">
                  {publisher.journals.map(j => renderJournal(j, publisher))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Normal accordion view */
        <div className="space-y-2">
          {PUBLISHERS.map((publisher) => {
            const isPublisherOpen = expandedPublisher === publisher.id;
            const publisherSelected = publisher.journals.filter(j => isFollowed(j.id)).length;

            return (
              <div key={publisher.id} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => togglePublisher(publisher.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-muted hover:bg-accent transition-colors"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: publisher.color }} />
                  <span className="font-semibold text-foreground text-sm">{publisher.label}</span>
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
                                className="w-full flex items-center gap-3 px-4 py-2.5 bg-card hover:bg-accent transition-colors"
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
                                    className="overflow-hidden bg-muted border-t border-border"
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
              <div className="rounded-xl border border-purple-200 overflow-hidden">
                <button
                  onClick={() => togglePublisher('__custom__')}
                  className="w-full flex items-center gap-3 px-4 py-2 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-foreground text-sm">Journals Added Manually</span>
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
                      className="overflow-hidden border-t border-purple-100"
                    >
                      <div className="py-1 px-3 space-y-0.5 bg-muted">
                        {customJournals.map(j => {
                          const followed = j.is_active;
                          return (
                            <div
                              key={j.journal_id}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                                followed ? "bg-card border border-border shadow-sm" : "hover:bg-card"
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
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Delete "${j.journal_name}"?`)) {
                                    await entities.FollowedJournal.delete(j.id);
                                    if (onCustomJournalAdded) onCustomJournalAdded();
                                  }
                                }}
                                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete journal"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
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
      )}</>
      )}
    </div>
  );
}