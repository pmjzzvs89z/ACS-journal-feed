import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { entities } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';

// Broad category-level fallback keywords so journals without indexed scopes still appear
const CATEGORY_FALLBACK = {
  'Analytical Chemistry': ['analytical', 'analysis', 'sensor', 'spectroscopy', 'chromatography', 'detection', 'measurement', 'titration', 'electrochemistry', 'mass spectrometry', 'toxicology', 'toxic', 'bioanalysis', 'trace'],
  'Biological/Medicinal Chemistry': ['biology', 'medicinal', 'drug', 'pharmaceutical', 'biochemistry', 'medicine', 'biomedical', 'enzyme', 'protein', 'toxicology', 'pharmacology', 'receptor', 'therapeutic', 'clinical'],
  'Physical/Theoretical Chemistry': ['physical', 'theoretical', 'computational', 'quantum', 'thermodynamics', 'kinetics', 'simulation', 'spectroscopy', 'dynamics', 'statistical mechanics'],
  'Inorganic/Materials Chemistry': ['inorganic', 'materials', 'crystal', 'nanomaterial', 'solid state', 'coordination', 'organometallic', 'catalysis', 'metal complex', 'ligand'],
  'Polymers/Macromolecules': ['polymer', 'macromolecule', 'soft matter', 'rubber', 'plastic', 'copolymer', 'polymerization', 'biopolymer'],
  'Organic Chemistry': ['organic', 'synthesis', 'catalysis', 'natural product', 'reaction', 'mechanism', 'heterocyclic', 'total synthesis', 'stereoselective', 'asymmetric', 'homogeneous', 'homogenous'],
  'Applied/Industrial Chemistry': ['applied', 'industrial', 'engineering', 'environment', 'energy', 'sustainable', 'green', 'toxicology', 'environmental', 'process', 'scale-up'],
  'Materials Science & Nanotechnology': ['materials', 'nano', 'nanotechnology', 'surface', 'thin film', 'semiconductor', 'composite', 'coating', 'nanoparticle', 'graphene'],
  'Analytical & Measurement Science': ['analytical', 'measurement', 'sensor', 'spectroscopy', 'detection', 'toxicology', 'calibration', 'metrology'],
  'Sustainability & Green Chemistry': ['sustainability', 'green', 'environment', 'energy', 'renewable', 'carbon', 'toxicology', 'lifecycle', 'bio-based', 'circular economy'],
  'Sensors & Diagnostics': ['sensor', 'diagnostic', 'biosensor', 'imaging', 'detection', 'point-of-care', 'immunoassay', 'biomarker'],
  'Polymers & Soft Matter': ['polymer', 'soft matter', 'colloid', 'gel', 'hydrogel', 'elastomer', 'self-assembly'],
  'Chemical Engineering': ['chemical engineering', 'process', 'reactor', 'fluid', 'heat transfer', 'mass transfer', 'separation', 'distillation', 'scale-up'],
  'Reaction Engineering': ['reaction', 'kinetics', 'catalysis', 'reactor', 'combustion', 'homogeneous', 'heterogeneous', 'catalytic', 'mechanism'],
  'Separations': ['separation', 'membrane', 'chromatography', 'distillation', 'extraction', 'adsorption', 'ion exchange', 'filtration'],
  'Process Modeling & Simulation': ['modeling', 'simulation', 'computation', 'optimization', 'control', 'numerical', 'CFD'],
  'Scale-up & Manufacturing Science': ['scale-up', 'manufacturing', 'pharmaceutical', 'production', 'formulation', 'toxicology', 'quality'],
  'General': ['chemistry', 'chemical', 'multidisciplinary', 'interdisciplinary', 'general', 'research'],
};

// Simple fuzzy: checks if query words are substrings of keyword or vice versa
function fuzzyMatch(query, keyword) {
  const q = query.toLowerCase();
  const k = keyword.toLowerCase();
  if (k.includes(q) || q.includes(k)) return true;
  // Allow for common misspellings: homogenous/homogeneous
  if (Math.abs(q.length - k.length) <= 2) {
    let matches = 0;
    for (let i = 0; i < Math.min(q.length, k.length); i++) {
      if (q[i] === k[i]) matches++;
    }
    if (matches / Math.max(q.length, k.length) > 0.8) return true;
  }
  return false;
}

function useJournalScopes() {
  return useQuery({
    queryKey: ['journalScopes'],
    queryFn: () => entities.JournalScope.list(),
    initialData: [],
    staleTime: 1000 * 60 * 5,
  });
}

export default function JournalSearch({ allJournals, publishers, onResults, placeholder = "Search journals by topic, keyword, or method…" }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const { data: scopeRecords } = useJournalScopes();
  const scopeMap = useMemo(() => {
    const map = {};
    (scopeRecords || []).forEach(s => {
      map[s.journal_id] = (s.keywords || []).map(k => k.toLowerCase());
    });
    return map;
  }, [scopeRecords]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allJournals.filter(j => {
      // 1. Name / abbrev match
      if (j.name.toLowerCase().includes(q) || j.abbrev.toLowerCase().includes(q)) return true;
      // 2. Indexed scope keywords
      const scopeKws = scopeMap[j.id] || [];
      if (scopeKws.some(k => fuzzyMatch(q, k))) return true;
      // 3. Category fallback keywords for journals not yet indexed
      if (!scopeMap[j.id]) {
        const fallback = CATEGORY_FALLBACK[j.category] || [];
        if (fallback.some(k => fuzzyMatch(q, k))) return true;
      }
      return false;
    });
  }, [query, allJournals, scopeMap]);

  // Report results up to parent
  useEffect(() => {
    if (onResults) onResults(query.trim(), results);
  }, [results, query]);


  // Close search on click outside
  useEffect(() => {
    if (!query.trim()) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  return (
    <div ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground placeholder:text-muted-foreground bg-slate-300 dark:bg-[rgb(38,42,56)]"
          style={{ padding: '0.35rem 2rem 0.35rem 2.25rem', fontSize: '0.828rem' }}
        />
        {query && (
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
