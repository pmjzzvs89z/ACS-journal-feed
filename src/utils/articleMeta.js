// Utility functions for extracting article metadata (abstract, PDF URL,
// images, HTML entity decoding). Extracted from ArticleCard.jsx.

export function extractAbstract(article) {
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

export function buildPdfUrl(article) {
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

export function decodeHtmlEntities(str) {
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
