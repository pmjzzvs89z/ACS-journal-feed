import { useEffect } from 'react';

// Papers by ReadCube injects its buttons at runtime. We want them to
// show the same tooltip as our Save/Share buttons (dark pill below the
// button, 500 ms appear delay, matching typography) — not the browser's
// native yellow `title` tooltip with its ~1 s unstyled delay.
//
// This hook watches the DOM for injected ReadCube buttons and rewrites
// any `title` attribute into `data-rc-tip` so a pure-CSS tooltip in
// index.css can render a styled popup. Removing `title` suppresses the
// native browser tooltip so we don't see two popups on hover.

const SELECTORS = [
  '[class*="readcube" i] a',
  '[class*="readcube" i] button',
  'a[class*="readcube" i]',
  'button[class*="readcube" i]',
  '.__readcube-library-button ~ a',
  '.__readcube-library-button ~ button',
  '.__readcube-library-button + * a',
  '.__readcube-library-button + * button',
];

function annotate(root = document) {
  const nodes = root.querySelectorAll(SELECTORS.join(','));
  for (const el of nodes) {
    if (el.hasAttribute('data-rc-tip')) continue;
    let tip = el.getAttribute('title') || el.getAttribute('aria-label') || '';
    // Fall back to the button's own visible text if no title/aria-label
    if (!tip) {
      const text = (el.textContent || '').trim();
      if (text) {
        const low = text.toLowerCase();
        if (low.includes('paper')) tip = 'Save to Papers library';
        else if (low.includes('pdf')) tip = 'Download PDF';
        else tip = text;
      }
    }
    if (!tip) continue;
    el.setAttribute('data-rc-tip', tip);
    // Suppress native browser tooltip so only our styled one shows
    if (el.hasAttribute('title')) el.removeAttribute('title');
  }
}

export function useReadCubeTooltips() {
  useEffect(() => {
    // Run once on mount for any already-injected buttons
    annotate();

    // Watch for new injections (articles paginating in, tab changes, etc.)
    const observer = new MutationObserver(() => annotate());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
}
