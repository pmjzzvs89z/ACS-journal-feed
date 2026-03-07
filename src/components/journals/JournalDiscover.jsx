import React, { useState, useMemo } from 'react';
import { Sparkles, Search, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_JOURNALS } from './JournalList';

// Map categories to keywords for keyword-based discovery
const CATEGORY_KEYWORDS = {
  'General': ['general', 'chemistry', 'chemical', 'multidisciplinary'],
  'Analytical Chemistry': ['analytical', 'analysis', 'sensor', 'spectroscopy', 'chromatography', 'measurement', 'detection'],
  'Biological/Medicinal Chemistry': ['biology', 'biological', 'medicinal', 'drug', 'pharmaceutical', 'biochemistry', 'medicine', 'biomedical', 'enzyme', 'protein'],
  'Physical/Theoretical Chemistry': ['physical', 'theoretical', 'computational', 'quantum', 'thermodynamics', 'kinetics', 'simulation'],
  'Inorganic/Materials Chemistry': ['inorganic', 'materials', 'crystal', 'nanomaterial', 'solid state', 'coordination'],
  'Polymers/Macromolecules': ['polymer', 'macromolecule', 'soft matter', 'rubber', 'plastic'],
  'Organic Chemistry': ['organic', 'synthesis', 'catalysis', 'natural product', 'reaction'],
  'Applied/Industrial Chemistry': ['applied', 'industrial', 'engineering', 'environment', 'energy', 'sustainable', 'green'],
  'Materials Science & Nanotechnology': ['materials', 'nano', 'nanotechnology', 'surface', 'thin film', 'semiconductor'],
  'Analytical & Measurement Science': ['analytical', 'measurement', 'sensor', 'spectroscopy', 'detection'],
  'Sustainability & Green Chemistry': ['sustainability', 'green', 'environment', 'energy', 'renewable', 'carbon'],
  'Sensors & Diagnostics': ['sensor', 'diagnostic', 'biosensor', 'imaging', 'detection'],
  'Polymers & Soft Matter': ['polymer', 'soft matter', 'colloid', 'gel', 'hydrogel'],
  'Chemical Engineering': ['chemical engineering', 'process', 'reactor', 'fluid', 'heat transfer'],
  'Reaction Engineering': ['reaction', 'kinetics', 'catalysis', 'reactor', 'combustion'],
  'Separations': ['separation', 'membrane', 'chromatography', 'distillation', 'extraction'],
  'Process Modeling & Simulation': ['modeling', 'simulation', 'computation', 'optimization', 'control'],
  'Scale-up & Manufacturing Science': ['scale-up', 'manufacturing', 'pharmaceutical', 'production', 'formulation'],
};

function getRelatedJournals(followedJournals, allStaticIds) {
  if (followedJournals.length === 0) return [];

  // Collect categories from followed journals
  const followedIds = new Set(followedJournals.filter(j => j.is_active).map(j => j.journal_id));
  const followedStaticJournals = ALL_JOURNALS.filter(j => followedIds.has(j.id));
  const categoryCounts = {};
  followedStaticJournals.forEach(j => {
    if (j.category) categoryCounts[j.category] = (categoryCounts[j.category] || 0) + 1;
  });

  if (Object.keys(categoryCounts).length === 0) return [];

  // Score un-followed journals by category match
  return ALL_JOURNALS
    .filter(j => !followedIds.has(j.id))
    .map(j => ({ ...j, score: categoryCounts[j.category] || 0 }))
    .filter(j => j.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function getJournalsByKeyword(keyword) {
  if (!keyword.trim()) return [];
  const q = keyword.trim().toLowerCase();
  return ALL_JOURNALS.filter(j => {
    const nameMatch = j.name.toLowerCase().includes(q) || j.abbrev.toLowerCase().includes(q);
    const categoryKeywords = CATEGORY_KEYWORDS[j.category] || [];
    const kwMatch = categoryKeywords.some(k => k.includes(q) || q.includes(k));
    return nameMatch || kwMatch;
  }).slice(0, 30);
}

const getColor = (journal) => journal.color || '#64748b';

export default function JournalDiscover({ followedJournals, onToggleJournal }) {
  const [keyword, setKeyword] = useState('');

  const allStaticIds = useMemo(() => new Set(ALL_JOURNALS.map(j => j.id)), []);

  const relatedJournals = useMemo(
    () => getRelatedJournals(followedJournals, allStaticIds),
    [followedJournals, allStaticIds]
  );

  const keywordResults = useMemo(() => getJournalsByKeyword(keyword), [keyword]);

  const isFollowed = (id) => followedJournals.some(j => j.journal_id === id && j.is_active);

  const displayList = keyword.trim() ? keywordResults : relatedJournals;
  const isKeywordMode = !!keyword.trim();

  return (
    <div className="space-y-3">
      {/* Keyword search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Search by keyword, topic, or research area…"
          className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
        />
        {keyword && (
          <button onClick={() => setKeyword('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        {isKeywordMode
          ? <><Search className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs text-slate-500">Results for "<strong>{keyword}</strong>"</span></>
          : <><Sparkles className="w-3.5 h-3.5 text-purple-500" /><span className="text-xs text-slate-500">Suggested based on your followed journals</span></>
        }
      </div>

      {/* Results */}
      {displayList.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          {isKeywordMode
            ? 'No journals found for this keyword.'
            : followedJournals.filter(j => j.is_active).length === 0
              ? 'Follow some journals first to get suggestions.'
              : 'No suggestions available.'}
        </div>
      ) : (
        <div className="space-y-1 py-1 px-1">
          {displayList.map(j => {
            const followed = isFollowed(j.id);
            const color = getColor(j);
            return (
              <button
                key={j.id}
                onClick={() => onToggleJournal(j)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
                  followed ? "bg-white border border-slate-200 shadow-sm" : "hover:bg-white border border-transparent"
                )}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 border-2 transition-all flex items-center justify-center"
                  style={{ borderColor: color, backgroundColor: followed ? color : 'transparent' }}
                >
                  {followed && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: followed ? color : '#94a3b8' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{j.abbrev}</p>
                  <p className="text-xs text-slate-400 truncate">{j.name}</p>
                </div>
                {j.category && (
                  <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 hidden sm:block">
                    {j.category}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}