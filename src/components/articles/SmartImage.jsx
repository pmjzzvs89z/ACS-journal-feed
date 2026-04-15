import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

// Thin graphical-abstract renderer used by SavedFeed (and available to any
// new consumer that needs the same behavior). Encapsulates:
//
//   1. Springer Nature .png → .jpg fallback (their RSS points at a .png
//      that is sometimes only published as .jpg — try the sibling before
//      giving up).
//   2. A neutral `<BookOpen>` placeholder when the image fails or is
//      missing, so the card doesn't collapse or leave a gap.
//
// ArticleCard.jsx intentionally does NOT use this primitive — it has extra
// wiring (`onImageFail` → parent, per-card `cachedImageUrl`) that doesn't
// map cleanly onto a generic component. Keep it in sync by hand if you
// touch the Springer fallback logic there.
export default function SmartImage({
  src,
  alt = 'Graphical abstract',
  className = '',
  placeholderClassName = '',
  style,
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (
      currentSrc &&
      currentSrc.includes('media.springernature.com') &&
      currentSrc.endsWith('_Figa_HTML.png')
    ) {
      setCurrentSrc(currentSrc.replace('_Figa_HTML.png', '_Figa_HTML.jpg'));
      return;
    }
    setFailed(true);
  };

  if (!currentSrc || failed) {
    return (
      <div className={`flex items-center justify-center text-slate-200 dark:text-slate-700 ${placeholderClassName}`}>
        <BookOpen className="w-10 h-10" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
      style={style}
    />
  );
}
