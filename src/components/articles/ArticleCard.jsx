import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, BookOpen, Users, Bookmark, BookmarkCheck } from 'lucide-react';
import ShareButton from './ShareButton';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { entities } from '@/api/entities';
import { renderAuthors } from './AuthorRenderer';

function extractAbstract(article) {
  const sources = [article.content, article.description];
  for (const src of sources) {
    if (!src) continue;
    const pMatches = src.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (pMatches) {
      for (const p of pMatches) {
        const text = p.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (text.length > 60) return text;
      }
    }
    const plain = src.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (plain.length > 60) return plain;
  }
  return null;
}

function buildPdfUrl(article) {
  const link = article.link || '';
  if (link.includes('pubs.acs.org/doi/')) return link.replace('/doi/', '/doi/pdf/');
  if (link.includes('pubs.rsc.org')) return link.replace('/articlehtml/', '/articlepdf/').replace('/articlelanding/', '/articlepdf/');
  if (link.includes('onlinelibrary.wiley.com/doi/')) return link.replace('/doi/abs/', '/doi/pdf/').replace('/doi/full/', '/doi/pdf/').replace(/\/doi\/(?!pdf\/)/, '/doi/pdf/');
  if (link.includes('sciencedirect.com/science/article/pii/')) return link + '/pdfft?isDTMRedir=true';
  if (link.includes('link.springer.com/article/')) return link.replace('/article/', '/content/pdf/') + '.pdf';
  if (link.includes('nature.com/articles/')) return link + '.pdf';
  if (link.includes('mdpi.com') && link.endsWith('/htm')) return link.replace('/htm', '/pdf');
  if (link.includes('mdpi.com') && !link.endsWith('/pdf')) return link + '/pdf';
  if (link.includes('tandfonline.com/doi/')) return link.replace('/doi/full/', '/doi/pdf/').replace('/doi/abs/', '/doi/pdf/').replace(/\/doi\/(?!pdf\/)/, '/doi/pdf/');
  return link;
}

function decodeHtmlEntities(str) {
  if (!str) return str;
  // Use the browser's own HTML parser for complete entity decoding
  try {
    const el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
  } catch {
    // SSR/non-browser fallback
    return str
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
  }
}

export function extractImage(article) {
  const SKIP = [
    'spacer', 'pixel', 'blank', 'icon', 'logo', 'arrow', 'button', 'badge',
    '1x1', 'tracking', 'beacon', 'stat',
    'rsc-cdn.org', 'newimages', 'open_access',
    'orcid.org/assets', 'creativecommons.org', 'licens',
  ];
  const isValidImg = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (SKIP.some(s => url.toLowerCase().includes(s))) return false;
    return true;
  };

  if (isValidImg(article.enclosure?.link)) return article.enclosure.link;
  if (isValidImg(article.enclosure?.url)) return article.enclosure.url;
  if (isValidImg(article.thumbnail)) return article.thumbnail;
  if (isValidImg(article.media_content?.url)) return article.media_content.url;
  if (isValidImg(article.media?.content?.url)) return article.media.content.url;

  const htmlSources = [article.content, article.description].map(s => decodeHtmlEntities(s));

  // ACS graphical abstract: pubs.acs.org/cms/.../asset/images/medium/...
  for (const src of htmlSources) {
    if (!src) continue;
    const acsMatch = src.match(/https?:\/\/pubs\.acs\.org\/cms\/[^\s"'<>]+\/asset\/images\/medium\/[^\s"'<>]+/i);
    if (acsMatch && isValidImg(acsMatch[0])) return acsMatch[0];
  }

  // Elsevier graphical abstract: construct from PII in article link
  // Use ga1 (graphical abstract) not fx1 (featured image / scheme)
  const link = article.link || '';
  const piiMatch = link.match(/\/pii\/(S[0-9Xx]+)/i);
  if (piiMatch) return `https://ars.els-cdn.com/content/image/1-s2.0-${piiMatch[1]}-ga1_lrg.jpg`;

  // RSC graphical abstract: only show if the feed description actually contains a GA image
  // (early papers are published without GA; it gets added days later)
  const rscMatch = link.match(/pubs\.rsc\.org\/.*\/([a-z0-9]+)$/i);
  if (rscMatch) {
    const desc = article.description || '';
    if (/GA\?id=/i.test(desc)) {
      return `https://pubs.rsc.org/services/images/RSCpubs.ePlatform.Service.FreeContent.ImageService.svc/ImageService/image/GA?id=${rscMatch[1]}`;
    }
    return null;  // No GA yet — article will be hidden by feed filter
  }

  // Springer Nature graphical abstract: construct from DOI
  // DOI like 10.1007/s10562-026-05358-9 → filename 10562_2026_5358_Figa_HTML.png
  const springerDoi = article.doi || (() => {
    const m = link.match(/(?:link\.springer\.com\/article|nature\.com\/articles)\/.*(10\.\d{4,}\/[^\s?&#]+)/);
    return m ? m[1] : '';
  })();
  if (springerDoi && /^10\.\d{4,}\/s\d+/.test(springerDoi)) {
    const suffix = springerDoi.replace(/^10\.\d+\/s/, '');
    const parts = suffix.split('-');
    if (parts.length >= 4) {
      const journalId = parts[0];
      let year = parts[1];
      if (year.length === 2) year = '20' + year;
      else if (year.length === 3) year = '2' + year;
      const articleNum = String(parseInt(parts[2], 10));
      const encodedDoi = springerDoi.replace('/', '%2F');
      return `https://media.springernature.com/lw685/springer-static/image/art%3A${encodedDoi}/MediaObjects/${journalId}_${year}_${articleNum}_Figa_HTML.png`;
    }
  }

  for (const src of htmlSources) {
    if (!src) continue;
    const imgRegex = /\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(src)) !== null) {
      const url = match[1];
      if (isValidImg(url) && /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url)) return url;
    }
  }

  // href links pointing directly to image files (e.g. ACS GA links)
  for (const src of htmlSources) {
    if (!src) continue;
    const hrefRegex = /\bhref=["']([^"']+\.(?:png|jpg|jpeg|gif|webp))["']/gi;
    let match;
    while ((match = hrefRegex.exec(src)) !== null) {
      const url = match[1];
      if (isValidImg(url)) return url;
    }
  }

  for (const src of htmlSources) {
    if (!src) continue;
    const imgRegex = /\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(src)) !== null) {
      const url = match[1];
      if (isValidImg(url) && url.startsWith('http')) return url;
    }
  }

  for (const src of htmlSources) {
    if (!src) continue;
    const urlMatch = src.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|gif|webp)(\?[^\s"'<>]*)?/i);
    if (urlMatch && isValidImg(urlMatch[0])) return urlMatch[0];
  }

  return null;
}

// ── Image URL cache — avoids re-running expensive regex extraction ─────────
const _imageCache = new Map();
export function getCachedImage(article) {
  const key = article.link;
  if (_imageCache.has(key)) return _imageCache.get(key);
  const url = extractImage(article);
  _imageCache.set(key, url);
  return url;
}

// ── Seen articles helpers (cached in memory, flushed to localStorage) ─────
// Read/unread state is stored per-user at `seenArticles:<userId>` so each
// account has its own reading history and states cannot bleed between
// users on the same browser. The module-level `_seenCache` is invalidated
// whenever the authenticated user changes via setSeenArticlesUser(), which
// Home.jsx calls in response to auth state changes.
const SEEN_KEY_BASE = 'seenArticles';
const LEGACY_SEEN_KEY = 'seenArticles';
let _seenCache = null;
let _currentUserId = null;

const seenKeyForCurrent = () =>
  _currentUserId ? `${SEEN_KEY_BASE}:${_currentUserId}` : null;

export const setSeenArticlesUser = (userId) => {
  const next = userId || null;
  if (next === _currentUserId) return;
  _currentUserId = next;
  _seenCache = null; // force a re-read from the new user's namespaced key
};

const getSeenArticles = () => {
  if (_seenCache) return _seenCache;
  const key = seenKeyForCurrent();
  if (!key) { _seenCache = new Set(); return _seenCache; }
  try { _seenCache = new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { _seenCache = new Set(); }
  return _seenCache;
};

const markArticleSeen = (articleId) => {
  const key = seenKeyForCurrent();
  if (!key) return; // logged out — don't persist read state
  const seen = getSeenArticles();
  if (seen.has(articleId)) return; // skip redundant writes
  seen.add(articleId);
  localStorage.setItem(key, JSON.stringify([...seen]));
};
const isArticleSeen = (articleId) => getSeenArticles().has(articleId);

export const getSeenArticleIds = () => new Set(getSeenArticles());

export const clearAllSeenArticles = () => {
  const key = seenKeyForCurrent();
  _seenCache = null;
  if (key) localStorage.removeItem(key);
};

// One-time legacy cleanup: purge the old un-namespaced `seenArticles`
// key on module load so it can never bleed into a different account
// again. Any per-user keys (`seenArticles:<uid>`) are untouched.
try { localStorage.removeItem(LEGACY_SEEN_KEY); } catch { /* ignore */ }

const ArticleCard = React.memo(React.forwardRef(function ArticleCard({ article, index, savedRecord, onSaveToggle, resetKey = 0, onImageFail, cachedImageUrl }, _ref) {
  const [imageFailed, setImageFailed] = useState(false);
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = React.useState(() => isArticleSeen(article.link));
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const articleRef = React.useRef(null);
  const wasEverVisibleRef = React.useRef(false);

  const abstractText = extractAbstract(article);
  const imageUrl = cachedImageUrl !== undefined ? cachedImageUrl : extractImage(article);
  const isSaved = !!savedRecord;

  // DOI extraction — used in both the visible DOI row and the hidden
  // citation metadata that reference-manager extensions (ReadCube Papers,
  // Zotero Connector, Mendeley, etc.) scan for.
  const doi = article.doi ||
    (article.link ? (article.link.match(/10\.\d{4,}\/[^\s?&#"'<>]+/) || [])[0] : null);

  useEffect(() => {
    setImageFailed(false);
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  const handleImageError = React.useCallback(() => {
    // Springer Nature: try .jpg fallback when .png fails
    if (currentImageUrl && currentImageUrl.includes('media.springernature.com') && currentImageUrl.endsWith('_Figa_HTML.png')) {
      setCurrentImageUrl(currentImageUrl.replace('_Figa_HTML.png', '_Figa_HTML.jpg'));
      return;
    }
    setImageFailed(true);
    if (onImageFail) onImageFail(article.link);
  }, [currentImageUrl, onImageFail, article.link]);

  React.useEffect(() => {
    wasEverVisibleRef.current = false;
    setHasBeenSeen(isArticleSeen(article.link));
  }, [resetKey, article.link]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        wasEverVisibleRef.current = true;
      } else if (wasEverVisibleRef.current) {
        markArticleSeen(article.link);
        setHasBeenSeen(true);
      }
    }, { threshold: 0.1 });
    if (articleRef.current) observer.observe(articleRef.current);
    return () => observer.disconnect();
  }, [article.link]);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      if (isSaved) {
        await entities.SavedArticle.delete(savedRecord.id);
      } else {
        await entities.SavedArticle.create({
          article_id: article.link,
          title: article.title,
          link: article.link,
          authors: Array.isArray(article.author) ? article.author.join(', ') : (article.author || ''),
          pub_date: article.pubDate || '',
          journal_name: article.journalName || '',
          journal_abbrev: article.journalAbbrev || '',
          journal_color: article.journalColor || '#0066b3',
          thumbnail: currentImageUrl || '',
          abstract: abstractText || '',
        });
      }
      if (onSaveToggle) onSaveToggle();
    } catch (err) {
      console.error('Failed to save/unsave article:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    try { return format(new Date(dateString), 'MMM d, yyyy'); } catch { return dateString; }
  };

  const rawAuthorText = Array.isArray(article.author)
    ? article.author.join(', ')
    : article.author || article.authors || '';

  const showImage = !imageFailed && !!currentImageUrl;

  // Render cards instantly with no entry animation. The previous
  // staggered fade-in caused a visible "blink" on every refresh and on
  // every tab-switch remount, which outweighed its aesthetic value.
  return (
    <motion.article
      ref={articleRef}
      initial={false}
      animate={false}
      className="group relative flex rounded-r-2xl hover:shadow-xl transition-all duration-300"
    >
      {!hasBeenSeen && (
        <div className="absolute left-0 inset-y-0 w-1 bg-blue-500 dark:bg-blue-400 z-10 pointer-events-none" />
      )}
      <div className="flex-1 bg-card rounded-r-2xl border-[1.125px] border-slate-400/80 dark:border-slate-600 overflow-hidden">
      <div className="flex items-stretch gap-0">
        {/* Graphical abstract — desktop */}
        <div className="hidden sm:flex flex-shrink-0 w-[405px] items-center justify-center bg-card border-r border-border p-2" style={{ minHeight: '160px', maxHeight: '220px' }}>
          {showImage ? (
            <img
              src={currentImageUrl}
              alt="Graphical abstract"

              onError={handleImageError}
              className="w-full h-full object-contain"
              style={{ maxHeight: '210px' }}
            />
          ) : (
            <div className="flex items-center justify-center text-slate-200 dark:text-slate-700">
              <BookOpen className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-5 pr-5 pl-10">
          {/* Mobile image */}
          {showImage && (
            <div className="sm:hidden w-full mb-4 rounded-xl overflow-hidden bg-card border border-border">
              <img
                src={currentImageUrl}
                alt="Graphical abstract"
  
                onError={handleImageError}
                  className="w-full max-h-40 object-contain"
              />
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
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.pubDate)}
                  </span>
                )}
              </div>

              {/* Title */}
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                <h3 className={`text-base font-semibold leading-snug mb-2 hover:transition-colors line-clamp-2 ${
                  hasBeenSeen
                    ? 'text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400'
                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                }`}>
                  {article.title}
                </h3>
              </a>

              {/* Authors */}
              {rawAuthorText && (
                <p className="text-xs text-muted-foreground flex items-start gap-1 mb-2">
                  <Users className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <span>{renderAuthors(rawAuthorText)}</span>
                </p>
              )}

              {/* DOI */}
              {doi && (
                <p className="text-xs text-muted-foreground mb-3">
                  DOI: <a
                    href={`https://doi.org/${doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >{doi}</a>
                </p>
              )}

              {/* Save + Share buttons */}
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={handleSaveToggle}
                  disabled={saving}
                  className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isSaved ? 'text-amber-500 hover:text-amber-700 dark:hover:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400'}`}
                  title={isSaved ? 'Unsave article' : 'Save article'}
                >
                  {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <ShareButton
                  title={article.title}
                  url={article.link}
                  authors={rawAuthorText}
                  journal={article.journalName || article.journalAbbrev}
                  doi={doi}
                  pubDate={article.pub_date}
                  abstract={article.abstract}
                />
              </div>
            </div>

            <a href={article.link} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-muted-foreground hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-200">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      </div>

      {/* Abstract Modal */}
      <Dialog open={abstractOpen} onOpenChange={setAbstractOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground leading-snug pr-6">
              {article.title}
            </DialogTitle>
            {rawAuthorText && <p className="text-xs text-muted-foreground mt-1">{rawAuthorText}</p>}
          </DialogHeader>
          <div className="mt-3">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Abstract</p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{abstractText}</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.article>
  );
}));

export default ArticleCard;
