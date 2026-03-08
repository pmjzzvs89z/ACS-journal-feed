import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, BookOpen, Users, Bookmark, BookmarkCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { renderAuthors } from './AuthorRenderer';

function extractAbstract(article) {
  const sources = [article.content, article.description];
  for (const src of sources) {
    if (!src) continue;
    // Try to extract text between <p> tags that looks like an abstract
    const pMatches = src.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (pMatches) {
      for (const p of pMatches) {
        const text = p.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (text.length > 60) return text;
      }
    }
    // Fall back to stripping all HTML
    const plain = src.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (plain.length > 60) return plain;
  }
  return null;
}

function buildPdfUrl(article) {
  const link = article.link || '';
  // ACS: https://pubs.acs.org/doi/10.1021/... → https://pubs.acs.org/doi/pdf/10.1021/...
  if (link.includes('pubs.acs.org/doi/')) {
    return link.replace('/doi/', '/doi/pdf/');
  }
  // RSC: https://pubs.rsc.org/en/content/articlehtml/... → replace html with pdf
  if (link.includes('pubs.rsc.org')) {
    return link.replace('/articlehtml/', '/articlepdf/').replace('/articlelanding/', '/articlepdf/');
  }
  // Wiley: https://onlinelibrary.wiley.com/doi/10.1002/... → /doi/pdf/...
  if (link.includes('onlinelibrary.wiley.com/doi/')) {
    return link.replace('/doi/abs/', '/doi/pdf/').replace('/doi/full/', '/doi/pdf/').replace(/\/doi\/(?!pdf\/)/, '/doi/pdf/');
  }
  // Elsevier ScienceDirect: https://www.sciencedirect.com/science/article/pii/... → /pii/.../pdfft
  if (link.includes('sciencedirect.com/science/article/pii/')) {
    return link + '/pdfft?isDTMRedir=true';
  }
  // Springer: https://link.springer.com/article/... → /content/pdf/...
  if (link.includes('link.springer.com/article/')) {
    return link.replace('/article/', '/content/pdf/') + '.pdf';
  }
  // Nature: https://www.nature.com/articles/... → .pdf
  if (link.includes('nature.com/articles/')) {
    return link + '.pdf';
  }
  // MDPI: https://www.mdpi.com/XXXX/htm → /pdf
  if (link.includes('mdpi.com') && link.endsWith('/htm')) {
    return link.replace('/htm', '/pdf');
  }
  if (link.includes('mdpi.com') && !link.endsWith('/pdf')) {
    return link + '/pdf';
  }
  // Taylor & Francis: https://www.tandfonline.com/doi/full/... → /doi/pdf/...
  if (link.includes('tandfonline.com/doi/')) {
    return link.replace('/doi/full/', '/doi/pdf/').replace('/doi/abs/', '/doi/pdf/').replace(/\/doi\/(?!pdf\/)/, '/doi/pdf/');
  }
  // Fallback: return original link
  return link;
}

function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractImage(article) {
  const SKIP = ['spacer', 'pixel', 'blank', 'icon', 'logo', 'arrow', 'button', 'badge', '1x1', 'tracking', 'beacon', 'stat'];

  const isValidImg = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (SKIP.some(s => url.toLowerCase().includes(s))) return false;
    return true;
  };

  // 1. enclosure (ACS, RSC, Wiley often send graphical abstract here)
  if (isValidImg(article.enclosure?.link)) return article.enclosure.link;
  if (isValidImg(article.enclosure?.url)) return article.enclosure.url;

  // 2. thumbnail field from rss2json (maps media:thumbnail and media:content)
  if (isValidImg(article.thumbnail)) return article.thumbnail;

  // 3. media_content – rss2json sometimes puts it here
  if (isValidImg(article.media_content?.url)) return article.media_content.url;
  if (isValidImg(article.media?.content?.url)) return article.media.content.url;

  // 4. <img> tags inside content or description — also decode HTML entities (e.g. ACS sends &lt;img src=...&gt;)
  const rawSources = [article.content, article.description];
  const htmlSources = rawSources.map(s => decodeHtmlEntities(s));

  for (const src of htmlSources) {
    if (!src) continue;
    const imgRegex = /\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(src)) !== null) {
      const url = match[1];
      if (isValidImg(url) && /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url)) {
        return url;
      }
    }
  }

  // 5. Wider scan: any http image URL in src attribute
  for (const src of htmlSources) {
    if (!src) continue;
    const imgRegex = /\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(src)) !== null) {
      const url = match[1];
      if (isValidImg(url) && url.startsWith('http')) return url;
    }
  }

  // 6. Bare URLs ending in image extension
  for (const src of htmlSources) {
    if (!src) continue;
    const urlMatch = src.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|gif|webp)(\?[^\s"'<>]*)?/i);
    if (urlMatch && isValidImg(urlMatch[0])) return urlMatch[0];
  }

  return null;
}

// ── Image URL cache (module-level, persisted to localStorage) ──────────────
// v3: only caches successful results; failures are retried on next page load.
const IMG_CACHE_KEY = 'cjf_img_cache_v3';

// Track which article links have already been scraped this browser session
// (prevents duplicate in-flight requests for the same article).
const scrapedThisSession = new Set();

function loadImgCache() {
  try { return JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || '{}'); } catch { return {}; }
}

function saveImgCache(cache) {
  try {
    // Keep newest 300 entries
    const keys = Object.keys(cache);
    if (keys.length > 300) {
      const trimmed = {};
      keys.slice(-300).forEach(k => { trimmed[k] = cache[k]; });
      localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache));
    }
  } catch {}
}

// ── Seen articles helpers ──────────────────────────────────────────────────
const getSeenArticles = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem('seenArticles') || '[]'));
  } catch {
    return new Set();
  }
};

const markArticleSeen = (articleId) => {
  const seen = getSeenArticles();
  seen.add(articleId);
  localStorage.setItem('seenArticles', JSON.stringify([...seen]));
};

const isArticleSeen = (articleId) => getSeenArticles().has(articleId);

export const clearAllSeenArticles = () => {
  localStorage.removeItem('seenArticles');
};

export default function ArticleCard({ article, index, savedRecord, onSaveToggle, resetKey = 0 }) {
  // Proxy / display states
  const [imageFailed, setImageFailed] = useState(false);
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [proxiedImageUrl, setProxiedImageUrl] = useState(null);
  const [proxyLoading, setProxyLoading] = useState(false);

  // OG-image scraping states
  const [scrapedImageUrl, setScrapedImageUrl] = useState(() => {
    // Load from persistent cache (only stores successful results)
    const cache = loadImgCache();
    return cache[article.link] || null;
  });
  const [isScraping, setIsScraping] = useState(false);

  const articleRef = React.useRef(null);
  const wasEverVisibleRef = React.useRef(false);
  const scrapingInFlightRef = React.useRef(false);

  const abstractText = extractAbstract(article);
  const rssImageUrl = extractImage(article);               // URL from RSS feed data
  const effectiveUrl = rssImageUrl || scrapedImageUrl;    // Best available URL
  const pdfUrl = buildPdfUrl(article);
  const isSaved = !!savedRecord;

  const [hasBeenSeen, setHasBeenSeen] = React.useState(() => isArticleSeen(article.link));

  // Reset seen state when resetKey changes
  React.useEffect(() => {
    wasEverVisibleRef.current = false;
    setHasBeenSeen(isArticleSeen(article.link));
  }, [resetKey, article.link]);

  // Reset proxy state when effective URL changes
  useEffect(() => {
    setUseProxy(false);
    setProxiedImageUrl(null);
    setProxyLoading(false);
    setImageFailed(false);
  }, [effectiveUrl]);

  const handleImageError = () => {
    if (!useProxy && effectiveUrl) {
      // First failure: try proxy
      setUseProxy(true);
      setProxyLoading(true);
      base44.functions.invoke('proxyImage', { url: effectiveUrl })
        .then(res => {
          // Handle both SDK response shapes: unwrapped { file_url } or wrapped { data: { file_url } }
          const fileUrl = res?.file_url ?? res?.data?.file_url ?? null;
          if (fileUrl) setProxiedImageUrl(fileUrl);
          else setImageFailed(true);
        })
        .catch(() => setImageFailed(true))
        .finally(() => setProxyLoading(false));
    } else {
      setImageFailed(true);
    }
  };

  // Intersection Observer: track visibility, mark seen, and trigger OG image scraping
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        wasEverVisibleRef.current = true;

        // Lazy-load OG image when article becomes visible and RSS data has no image.
        // scrapedThisSession prevents duplicate requests; successful URLs are also
        // persisted to localStorage so they load instantly on future page visits.
        if (!rssImageUrl && !scrapedThisSession.has(article.link) && !scrapingInFlightRef.current && article.link) {
          scrapedThisSession.add(article.link);
          scrapingInFlightRef.current = true;
          setIsScraping(true);
          base44.functions.invoke('fetchArticleImage', { url: article.link })
            .then(res => {
              const imgUrl = res?.image_url ?? res?.data?.image_url ?? null;
              if (imgUrl) {
                // Only persist successful results; failures are retried next session
                const cache = loadImgCache();
                cache[article.link] = imgUrl;
                saveImgCache(cache);
                setScrapedImageUrl(imgUrl);
              }
            })
            .catch(() => { /* silent — will retry next session */ })
            .finally(() => {
              setIsScraping(false);
              scrapingInFlightRef.current = false;
            });
        }
      } else if (wasEverVisibleRef.current) {
        // Article scrolled out of view: mark as seen
        markArticleSeen(article.link);
        setHasBeenSeen(true);
      }
    }, { threshold: 0.1 });

    if (articleRef.current) observer.observe(articleRef.current);
    return () => observer.disconnect();
  }, [article.link, rssImageUrl, hasBeenSeen]);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    if (isSaved) {
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
        thumbnail: effectiveUrl || '',
        abstract: abstractText || '',
      });
    }
    if (onSaveToggle) onSaveToggle();
    setSaving(false);
  };

  const formatDate = (dateString) => {
    try { return format(new Date(dateString), 'MMM d, yyyy'); } catch { return dateString; }
  };

  const rawAuthorText = Array.isArray(article.author)
    ? article.author.join(', ')
    : article.author || article.authors || '';

  const authorText = rawAuthorText;

  // ── Image rendering helpers ──────────────────────────────────────────────
  const showSkeleton = proxyLoading || isScraping;
  const showImage = !imageFailed && (proxiedImageUrl || (effectiveUrl && !useProxy));
  const displaySrc = proxiedImageUrl || effectiveUrl;

  return (
    <motion.article
      ref={articleRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
      className="group bg-white rounded-2xl border-[1.5px] border-[#DCE8F6] hover:shadow-xl hover:border-[#C2D5EA] transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-stretch gap-0">
        {/* Graphical abstract — desktop */}
        <div className="hidden sm:flex flex-shrink-0 w-[368px] items-center justify-center bg-slate-50 border-r border-slate-100 p-2" style={{ minHeight: '160px', maxHeight: '220px' }}>
          {showSkeleton ? (
            <div className="w-full rounded-lg animate-pulse bg-slate-200" style={{ minHeight: '140px' }} />
          ) : showImage ? (
            <img
              src={displaySrc}
              alt="Graphical abstract"
              onError={!proxiedImageUrl ? handleImageError : undefined}
              className="w-full h-full object-contain"
              style={{ maxHeight: '210px' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-2 px-2">
              <BookOpen className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 p-5">
          {/* Mobile image */}
          {(showSkeleton || showImage) && (
            <div className="sm:hidden w-full mb-4 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
              {showSkeleton ? (
                <div className="w-full animate-pulse bg-slate-200" style={{ height: '160px' }} />
              ) : (
                <img
                  src={displaySrc}
                  alt="Graphical abstract"
                  onError={!proxiedImageUrl ? handleImageError : undefined}
                  className="w-full max-h-40 object-contain"
                />
              )}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Journal + date badge row */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-2.5 py-0.5"
                  style={{
                    backgroundColor: `${article.journalColor}18`,
                    color: article.journalColor,
                    borderColor: `${article.journalColor}35`
                  }}
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
              </div>

              {/* Title */}
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                <h3 className={`text-base font-semibold leading-snug mb-2 hover:transition-colors line-clamp-2 ${
                  hasBeenSeen
                    ? 'text-slate-600 hover:text-slate-700'
                    : 'text-blue-600 hover:text-blue-700'
                }`}>
                  {article.title}
                </h3>
              </a>

              {/* Authors */}
              {rawAuthorText && (
                <p className="text-xs text-slate-500 flex items-start gap-1 mb-2">
                  <Users className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span>{renderAuthors(rawAuthorText)}</span>
                </p>
              )}

              {/* DOI link */}
              {(() => {
                const doi = article.doi ||
                  (article.link ? (article.link.match(/10\.\d{4,}\/[^\s?&#"'<>]+/) || [])[0] : null);
                return doi ? (
                  <p className="text-xs text-slate-400 mb-3">
                    DOI: <a
                      href={`https://doi.org/${doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >{doi}</a>
                  </p>
                ) : null;
              })()}

              {/* Action buttons */}
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={handleSaveToggle}
                  disabled={saving}
                  className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isSaved ? 'text-amber-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-500'}`}
                  title={isSaved ? 'Unsave article' : 'Save article'}
                >
                  {isSaved
                    ? <BookmarkCheck className="w-3.5 h-3.5" />
                    : <Bookmark className="w-3.5 h-3.5" />}
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

      {/* Abstract Modal */}
      <Dialog open={abstractOpen} onOpenChange={setAbstractOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900 leading-snug pr-6">
              {article.title}
            </DialogTitle>
            {authorText && (
              <p className="text-xs text-slate-500 mt-1">{authorText}</p>
            )}
          </DialogHeader>
          <div className="mt-3">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Abstract</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {abstractText}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.article>
  );
}
