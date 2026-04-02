import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, BookOpen, Users, Bookmark, BookmarkCheck } from 'lucide-react';
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
  return str
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function extractImage(article) {
  const SKIP = [
    'spacer', 'pixel', 'blank', 'icon', 'logo', 'arrow', 'button', 'badge',
    '1x1', 'tracking', 'beacon', 'stat',
    // RSC badge images (open-access badge, CC license icons served from their CDN)
    'rsc-cdn.org', 'newimages', 'open_access',
    // Generic license / ORCID badges that appear in description HTML
    'orcid.org/assets', 'creativecommons.org', 'licens',
  ];
  const isValidImg = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (SKIP.some(s => url.toLowerCase().includes(s))) return false;
    return true;
  };

  // 1. enclosure
  if (isValidImg(article.enclosure?.link)) return article.enclosure.link;
  if (isValidImg(article.enclosure?.url)) return article.enclosure.url;

  // 2. thumbnail / media fields
  if (isValidImg(article.thumbnail)) return article.thumbnail;
  if (isValidImg(article.media_content?.url)) return article.media_content.url;
  if (isValidImg(article.media?.content?.url)) return article.media.content.url;

  // 3. <img> tags inside content or description (ACS encodes these as HTML entities)
  const htmlSources = [article.content, article.description].map(s => decodeHtmlEntities(s));

  for (const src of htmlSources) {
    if (!src) continue;
    const imgRegex = /\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(src)) !== null) {
      const url = match[1];
      if (isValidImg(url) && /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url)) return url;
    }
  }

  // 4. any http src
  for (const src of htmlSources) {
    if (!src) continue;
    const imgRegex = /\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(src)) !== null) {
      const url = match[1];
      if (isValidImg(url) && url.startsWith('http')) return url;
    }
  }

  // 5. bare image URL in text
  for (const src of htmlSources) {
    if (!src) continue;
    const urlMatch = src.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|gif|webp)(\?[^\s"'<>]*)?/i);
    if (urlMatch && isValidImg(urlMatch[0])) return urlMatch[0];
  }

  return null;
}

// ── Seen articles helpers ──────────────────────────────────────────────────
const getSeenArticles = () => {
  try { return new Set(JSON.parse(localStorage.getItem('seenArticles') || '[]')); }
  catch { return new Set(); }
};
const markArticleSeen = (articleId) => {
  const seen = getSeenArticles();
  seen.add(articleId);
  localStorage.setItem('seenArticles', JSON.stringify([...seen]));
};
const isArticleSeen = (articleId) => getSeenArticles().has(articleId);
export const clearAllSeenArticles = () => localStorage.removeItem('seenArticles');

const ArticleCard = React.forwardRef(function ArticleCard({ article, index, savedRecord, onSaveToggle, resetKey = 0 }, _ref) {
  const [imageFailed, setImageFailed] = useState(false);
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = React.useState(() => isArticleSeen(article.link));

  const articleRef = React.useRef(null);
  const wasEverVisibleRef = React.useRef(false);

  const abstractText = extractAbstract(article);
  const imageUrl = extractImage(article);
  const pdfUrl = buildPdfUrl(article);
  const isSaved = !!savedRecord;

  // Reset state when article changes
  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  React.useEffect(() => {
    wasEverVisibleRef.current = false;
    setHasBeenSeen(isArticleSeen(article.link));
  }, [resetKey, article.link]);

  // Track visibility to mark articles as seen
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
        thumbnail: imageUrl || '',
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

  const showImage = !imageFailed && !!imageUrl;

  return (
    <motion.article
      ref={articleRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
      className="group bg-sky-50 rounded-2xl border-[1.5px] border-[#DCE8F6] hover:shadow-xl hover:border-[#C2D5EA] transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-stretch gap-0">
        {/* Graphical abstract — desktop */}
        <div className="hidden sm:flex flex-shrink-0 w-[368px] items-center justify-center bg-slate-50 border-r border-slate-100 p-2" style={{ minHeight: '160px', maxHeight: '220px' }}>
          {showImage ? (
            <img
              src={imageUrl}
              alt="Graphical abstract"
              onError={() => setImageFailed(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
              style={{ maxHeight: '210px' }}
            />
          ) : (
            <div className="flex items-center justify-center text-slate-200">
              <BookOpen className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-5 pr-5 pl-10">
          {/* Mobile image */}
          {showImage && (
            <div className="sm:hidden w-full mb-4 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
              <img
                src={imageUrl}
                alt="Graphical abstract"
                onError={() => setImageFailed(true)}
                referrerPolicy="no-referrer"
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
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.pubDate)}
                  </span>
                )}
              </div>

              {/* Title */}
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                <h3 className={`text-base font-semibold leading-snug mb-2 hover:transition-colors line-clamp-2 ${
                  hasBeenSeen ? 'text-slate-400 hover:text-slate-500' : 'text-blue-600 hover:text-blue-700'
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

              {/* DOI */}
              {(() => {
                const doi = article.doi ||
                  (article.link ? (article.link.match(/10\.\d{4,}\/[^\s?&#"'<>]+/) || [])[0] : null);
                return doi ? (
                  <p className="text-xs text-slate-400 mb-3">
                    DOI: <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors">{doi}</a>
                  </p>
                ) : null;
              })()}

              {/* Save button */}
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={handleSaveToggle}
                  disabled={saving}
                  className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isSaved ? 'text-amber-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-500'}`}
                  title={isSaved ? 'Unsave article' : 'Save article'}
                >
                  {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            <a href={article.link} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all duration-200">
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
            {rawAuthorText && <p className="text-xs text-slate-500 mt-1">{rawAuthorText}</p>}
          </DialogHeader>
          <div className="mt-3">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Abstract</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{abstractText}</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.article>
  );
});

export default ArticleCard;
