import React, { useState, useEffect } from 'react';

import { ExternalLink, Calendar, BookOpen, Users, Bookmark, BookmarkCheck } from 'lucide-react';
import ShareButton from './ShareButton';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { entities } from '@/api/entities';
import { renderAuthors } from './AuthorRenderer';
import { observeElement, unobserveElement } from '@/hooks/useSharedObserver';
import { extractAbstract, extractImage } from '@/utils/articleMeta';
import { markArticleSeen, isArticleSeen } from '@/utils/seenArticles';
import { showToast } from '@/components/ui/SimpleToast';

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

  // Use the shared IntersectionObserver (one observer for all cards instead
  // of one per card — see src/hooks/useSharedObserver.js).
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const handleIntersection = (entry) => {
      if (entry.isIntersecting) {
        wasEverVisibleRef.current = true;
      } else if (wasEverVisibleRef.current) {
        markArticleSeen(article.link);
        setHasBeenSeen(true);
      }
    };
    observeElement(el, handleIntersection);
    return () => {
      unobserveElement(el);
      // Mark as seen on unmount if the card was ever visible — covers the
      // edge case where a short filtered list never scrolls past the card.
      if (wasEverVisibleRef.current) {
        markArticleSeen(article.link);
      }
    };
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
      showToast(isSaved ? 'Article removed' : 'Article saved');
      if (onSaveToggle) onSaveToggle();
    } catch (err) {
      console.error('Failed to save/unsave article:', err);
      showToast('Something went wrong');
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
    <article
      ref={articleRef}
      className="group relative flex rounded-r-2xl hover:shadow-xl transition-all duration-300"
    >
      {!hasBeenSeen && (
        <div className="absolute left-0 inset-y-0 w-1 bg-blue-500 dark:bg-blue-400 z-10 pointer-events-none" />
      )}
      <div className="flex-1 bg-card rounded-r-2xl border-card border-slate-400/80 dark:border-slate-600 overflow-hidden">
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
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.pubDate)}
                    {!hasBeenSeen && (
                      <span className="w-[7px] h-[7px] rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" title="Unread" />
                    )}
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
    </article>
  );
}));

export default ArticleCard;
