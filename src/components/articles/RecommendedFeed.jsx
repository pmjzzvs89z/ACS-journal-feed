import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ExternalLink, Calendar, BookOpen, Users, Bookmark, BookmarkCheck, Plus, X, Tag, User, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ALL_JOURNALS } from '@/components/journals/JournalList';

const RSS_PROXY = 'https://api.rss2json.com/v1/api.json';

function extractKeywords(savedArticles) {
  const text = savedArticles.map(a => `${a.title} ${a.abstract || ''}`).join(' ');
  const stopwords = new Set(['the','a','an','of','in','and','or','for','to','with','on','at','by','is','are','was','were','that','this','which','from','as','be','it','its','not','can','have','has','their','they','been','will','we','our']);
  const words = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 4 && !stopwords.has(w));
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w]) => w);
}

function scoreArticle(article, keywords, authors, followedJournalIds, savedLinks) {
  if (savedLinks.has(article.link)) return -1;
  let score = 0;
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  keywords.forEach(kw => { if (text.includes(kw)) score += 2; });
  const authorStr = (Array.isArray(article.author) ? article.author.join(' ') : article.author || '').toLowerCase();
  authors.forEach(au => { if (authorStr.includes(au)) score += 2; });
  if (followedJournalIds.has(article.journalId)) score += 1;
  return score;
}

export default function RecommendedFeed({ followedJournals, savedArticles, onSaveToggle, userKeywords, setUserKeywords, selectedKeywords, setSelectedKeywords, filterEnabled, setFilterEnabled }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set());
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [userAuthors, setUserAuthors] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState([]);

  const savedLinks = new Set(savedArticles.map(a => a.link || a.article_id));
  const savedIds = new Set(savedArticles.map(a => a.article_id));

  const addKeyword = () => {
    const val = userKeywords.trim();
    if (!val || selectedKeywords.includes(val)) {
      setUserKeywords('');
      return;
    }
    setSelectedKeywords(prev => [...prev, val]);
    setUserKeywords('');
    fetchRecommendations([...selectedKeywords, val]);
  };

  const addAuthor = () => {
    const val = userAuthors.trim();
    if (!val || selectedAuthors.includes(val)) {
      setUserAuthors('');
      return;
    }
    setSelectedAuthors(prev => [...prev, val]);
    setUserAuthors('');
  };

  const removeKeyword = (kw) => {
    const newKeywords = selectedKeywords.filter(k => k !== kw);
    setSelectedKeywords(newKeywords);
    fetchRecommendations(newKeywords);
  };

  const removeAuthor = (au) => {
    setSelectedAuthors(prev => prev.filter(a => a !== au));
  };

  const handleKeyDown = (e, addFn) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFn();
    }
  };

  const fetchRecommendations = async (manualOverride) => {
    const activeJournals = followedJournals.filter(j => j.is_active);
    if (activeJournals.length === 0) return;

    setIsLoading(true);
    const autoKeywords = extractKeywords(savedArticles);
    const manualKeywords = (manualOverride ?? selectedKeywords).map(k => k.trim().toLowerCase()).filter(k => k.length > 1);
    const keywords = [...new Set([...manualKeywords, ...autoKeywords])];
    const authors = selectedAuthors.map(a => a.trim().toLowerCase()).filter(a => a.length > 1);
    const followedJournalIds = new Set(activeJournals.map(j => j.journal_id));

    // Pick journals NOT currently followed to discover new ones, plus some followed ones
    const unfollowedJournals = ALL_JOURNALS.filter(j => !followedJournalIds.has(j.id));
    const shuffled = [...unfollowedJournals].sort(() => Math.random() - 0.5).slice(0, 6);
    const discoveryJournals = [...activeJournals.slice(0, 4), ...shuffled];

    const allArticles = [];
    await Promise.all(
      discoveryJournals.map(async (journal) => {
        const rssUrl = journal.rss_url || journal.rss_url;
        const journalInfo = ALL_JOURNALS.find(j => j.id === (journal.journal_id || journal.id));
        try {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
          const data = await response.json();
          if (data.status === 'ok' && data.items) {
            data.items.forEach(item => {
              allArticles.push({
                ...item,
                journalId: journal.journal_id || journal.id,
                journalName: journal.journal_name || journal.name,
                journalAbbrev: journalInfo?.abbrev || journal.journal_name || journal.name,
                journalColor: journalInfo?.color || '#0066b3',
              });
            });
          }
        } catch {}
      })
    );

    const scored = allArticles
      .map(a => ({ ...a, _score: scoreArticle(a, keywords, authors, followedJournalIds, savedLinks) }))
      .filter(a => a._score >= 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 20);

    setRecommendations(scored);
    setIsLoading(false);
  };

  useEffect(() => {
    if (followedJournals.length > 0) fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedJournals.length, selectedKeywords.length]);

  const handleSaveToggle = async (e, article) => {
    e.preventDefault();
    e.stopPropagation();
    const id = article.link;
    setSavingIds(prev => new Set(prev).add(id));
    const savedRecord = savedArticles.find(s => s.article_id === article.link);
    if (savedRecord) {
      await base44.entities.SavedArticle.delete(savedRecord.id);
    } else {
      await base44.entities.SavedArticle.create({
        article_id: article.link,
        title: article.title,
        link: article.link,
        authors: Array.isArray(article.author) ? article.author.join(', ') : (article.author || ''),
        pub_date: article.pubDate || '',
        journal_name: article.journalName || '',
        journal_abbrev: article.journalAbbrev || '',
        journal_color: article.journalColor || '#0066b3',
        thumbnail: article.enclosure?.link || article.thumbnail || '',
        abstract: '',
      });
    }
    if (onSaveToggle) onSaveToggle();
    setSavingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const formatDate = (d) => { try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; } };

  if (followedJournals.filter(j => j.is_active).length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-purple-300" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No recommendations yet</h3>
        <p className="text-slate-500 max-w-md">Follow some journals in Settings to get personalized article recommendations.</p>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Recommended Articles
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Finding articles for you…' : `${recommendations.length} articles selected for you based on your interest (e.g., selected journals, saved articles, selected keywords and authors)`}
          </p>
        </div>

      </div>

      {/* Filter section toggle - collapsed state */}
      <button
        onClick={() => setFilterExpanded(!filterExpanded)}
        className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 mb-4 flex items-center justify-between hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3 flex-1 text-left min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-700">Keywords & Authors <span className="font-normal text-slate-500">(optional)</span></h3>
            {filterEnabled && (
              <p className="text-xs text-slate-400 mt-0.5">Enabled · {selectedKeywords.length} keyword{selectedKeywords.length !== 1 ? 's' : ''}, {selectedAuthors.length} author{selectedAuthors.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-blue-500 transition-transform flex-shrink-0 stroke-[2.5] ${filterExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded filter section */}
      {filterExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-4"
        >
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            {/* Header with toggle */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Keywords & Authors</h4>
                <p className="text-xs text-slate-400 mt-0.5">Find articles matching your interests</p>
              </div>
              <ToggleSwitch
                checked={filterEnabled}
                onCheckedChange={setFilterEnabled}
              />
            </div>

            {/* Keywords & Authors side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Keywords */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Keywords</label>
                </div>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={userKeywords}
                    onChange={e => setUserKeywords(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, addKeyword)}
                    placeholder="e.g. photocatalysis"
                    className="text-sm h-8 flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={addKeyword} className="h-8 px-3 flex-shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {selectedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedKeywords.map(kw => (
                      <Badge key={kw} variant="secondary" className="gap-1 pr-1 bg-purple-50 text-purple-700 border border-purple-200">
                        {kw}
                        <button onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Authors */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Authors</label>
                </div>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={userAuthors}
                    onChange={e => setUserAuthors(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, addAuthor)}
                    placeholder="e.g. Smith J"
                    className="text-sm h-8 flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={addAuthor} className="h-8 px-3 flex-shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {selectedAuthors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAuthors.map(au => (
                      <Badge key={au} variant="secondary" className="gap-1 pr-1 bg-blue-50 text-blue-700 border border-blue-200">
                        {au}
                        <button onClick={() => removeAuthor(au)} className="hover:text-red-500 transition-colors ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {(selectedKeywords.length === 0 && selectedAuthors.length === 0) && (
              <p className="text-xs text-slate-400 italic">Add keywords or authors to refine recommendations.</p>
            )}
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-slate-500">Analyzing your interests…</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {recommendations.map((article, index) => {
              const isSaved = savedIds.has(article.link);
              const saving = savingIds.has(article.link);
              const authorText = Array.isArray(article.author) ? article.author.join(', ') : article.author;
              return (
                <motion.article
                  key={article.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.3 }}
                  className="group bg-white rounded-2xl border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-stretch gap-0">
                  {/* Graphical abstract box — always present, shows placeholder if no image */}
                  {(() => {
                    const imgUrl = article.enclosure?.link || article.enclosure?.url || article.thumbnail || null;
                    return (
                      <div className="hidden sm:flex flex-shrink-0 w-80 items-center justify-center bg-slate-50 border-r border-slate-100 p-2" style={{ minHeight: '160px', maxHeight: '220px' }}>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt="Graphical abstract"
                            className="w-full h-full object-contain"
                            style={{ maxHeight: '210px' }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300 gap-2">
                            <BookOpen className="w-10 h-10" />
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium px-2.5 py-0.5"
                            style={{ backgroundColor: `${article.journalColor}18`, color: article.journalColor, borderColor: `${article.journalColor}35` }}
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            {article.journalAbbrev}
                          </Badge>
                          {article.pubDate && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(article.pubDate)}
                            </span>
                          )}
                          {article._score >= 4 && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Strong match
                            </span>
                          )}
                        </div>

                        <a href={article.link} target="_blank" rel="noopener noreferrer">
                          <h3 className="text-base font-semibold text-slate-900 leading-snug mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </a>

                        {authorText && (
                          <p className="text-xs text-slate-500 flex items-start gap-1 mb-2">
                            <Users className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" />
                            <span>{(() => { const parts = authorText.split(/,\s*/); return parts.map((name, i) => { const hasStar = /\*/.test(name); const cleanName = name.replace(/\*/g, '').trim(); return (<span key={i}>{i > 0 && ', '}{cleanName}{hasStar && <span className="text-blue-500 ml-0.5" title="Corresponding author">★</span>}</span>); }); })()}</span>
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-1">
                          <button
                            onClick={(e) => handleSaveToggle(e, article)}
                            disabled={saving}
                            className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isSaved ? 'text-amber-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-500'}`}
                          >
                            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                            {isSaved ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>

                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}