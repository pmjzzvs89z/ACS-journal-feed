const TIMEOUT_MS = 12000;
const SUPABASE_RSS_PROXY = 'https://fvjvcxvgxoloyfvchfof.supabase.co/functions/v1/fetch-rss';

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

export async function fetchRssFeed(rssUrl) {
  // Migrate legacy RSC FeedBurner URLs (feeds.rsc.org is dead → use pubs.rsc.org)
  rssUrl = rssUrl.replace(/^https?:\/\/feeds\.rsc\.org\/rss\//, 'https://pubs.rsc.org/rss/');

  // Strategy 1: Supabase Edge Function — server-side proxy, no auth required.
  try {
    const response = await fetchWithTimeout(SUPABASE_RSS_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rss_url: rssUrl }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.items?.length > 0) {
        // Patch missing pubDate for RSC items — the Supabase proxy misses
        // RSC's Atom-namespaced <a10:updated> date. Use today's date as
        // these are "latest articles" feeds, so the publish date is recent.
        if (rssUrl.includes('pubs.rsc.org')) {
          const today = new Date().toISOString();
          for (const item of data.items) {
            if (!item.pubDate) {
              item.pubDate = today;
            }
          }
        }
        if (import.meta.env.DEV) console.log(`[fetchRss] Supabase proxy ok: ${data.items.length} items for ${rssUrl.slice(0, 60)}`);
        return { status: 'ok', items: data.items };
      }
    } else {
      if (import.meta.env.DEV) console.warn(`[fetchRss] Supabase proxy HTTP ${response.status} for ${rssUrl.slice(0, 60)}`);
    }
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[fetchRss] Supabase proxy failed:', e.message);
  }

  // Strategy 2: corsproxy.io + local XML parser
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;
    const response = await fetchWithTimeout(proxyUrl);
    if (response.ok) {
      const text = await response.text();
      if (text) {
        const items = parseRssXml(text);
        if (items.length > 0) {
          if (import.meta.env.DEV) console.log(`[fetchRss] corsproxy ok: ${items.length} items for ${rssUrl.slice(0, 60)}`);
          return { status: 'ok', items };
        }
      }
    }
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[fetchRss] corsproxy.io failed:', e.message);
  }

  if (import.meta.env.DEV) console.warn(`[fetchRss] all strategies failed for ${rssUrl.slice(0, 60)}`);
  return { status: 'error', items: [] };
}

function parseRssXml(xml) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const items = [];

    // Dublin Core namespace URI
    const DC_NS = 'http://purl.org/dc/elements/1.1/';

    const entries = doc.querySelectorAll('item, entry');
    entries.forEach(item => {
      // Get text content of a tag by qualified name (e.g. "title", "dc:creator")
      const getText = (tagName) => item.getElementsByTagName(tagName)[0]?.textContent?.trim() || '';

      // Namespace-aware getter — more reliable for dc:* and content:* in Safari
      const getTextNS = (ns, localName) =>
        item.getElementsByTagNameNS(ns, localName)[0]?.textContent?.trim() || '';

      const getFirstAttr = (tagName, attr) => {
        const els = item.getElementsByTagName(tagName);
        for (let i = 0; i < els.length; i++) {
          const val = els[i].getAttribute(attr);
          if (val) return val;
        }
        return '';
      };

      // ── Author ──────────────────────────────────────────────────────────────
      // Collect ALL dc:creator elements — RSC and others list one per author.
      // getElementsByTagNameNS returns a live HTMLCollection; iterate the whole list.
      const dcCreatorEls = item.getElementsByTagNameNS(DC_NS, 'creator');
      const dcCreators = [];
      for (let i = 0; i < dcCreatorEls.length; i++) {
        const v = dcCreatorEls[i]?.textContent?.trim();
        if (v) dcCreators.push(v);
      }

      let author;
      if (dcCreators.length > 1) {
        author = dcCreators;                         // array → ArticleCard joins with ', '
      } else if (dcCreators.length === 1) {
        author = dcCreators[0];                      // single string
      } else {
        // Fallback: prefix-qualified tag, Atom <author><name>, plain <author>
        author =
          getText('dc:creator') ||
          item.querySelector('author name')?.textContent?.trim() ||
          getText('author') || '';
      }

      const link = getFirstAttr('link', 'href') || getText('link');

      const enclosureUrl =
        getFirstAttr('enclosure', 'url') ||
        getFirstAttr('content', 'url') ||
        getFirstAttr('thumbnail', 'url') ||
        '';

      // content:encoded — try namespace-aware first (more reliable in Safari WebKit XML parser)
      const CONTENT_NS = 'http://purl.org/rss/1.0/modules/content/';
      const content =
        getTextNS(CONTENT_NS, 'encoded') ||
        getText('content:encoded') ||
        getText('encoded') ||
        getText('content');

      const description = getText('description') || getText('summary');

      // ── DOI ─────────────────────────────────────────────────────────────────
      // 1. dc:identifier (RSC, many publishers)
      let doi = '';
      const rawDcId = getTextNS(DC_NS, 'identifier') || getText('dc:identifier') || '';
      const dcId = rawDcId.startsWith('doi:') ? rawDcId.slice(4).trim() : rawDcId;
      if (/^10\.\d{4,}\//.test(dcId)) doi = dcId;
      // 2. DOI pattern in link
      if (!doi) {
        const m = (link || '').match(/10\.\d{4,}\/[^\s?&#"'<>]+/);
        if (m) doi = m[0];
      }
      // 3. DOI pattern in guid
      if (!doi) {
        const guidText = getText('guid');
        const m = guidText.match(/10\.\d{4,}\/[^\s?&#"'<>]+/);
        if (m) doi = m[0];
      }
      // 4. DOI labelled in description HTML — RSC pattern: "<b>DOI</b>: 10.1039/..."
      if (!doi && description) {
        const m = description.match(/\bDOI\b[^:]*:\s*(10\.\d{4,}\/[^\s<,]+)/i);
        if (m) doi = m[1].trim();
      }

      // ── pubDate ─────────────────────────────────────────────────────────────
      const ATOM_NS = 'http://www.w3.org/2005/Atom';
      let pubDate =
        getText('pubDate') ||
        getTextNS(DC_NS, 'date') || getText('dc:date') ||
        getText('published') ||
        getTextNS(ATOM_NS, 'updated') || getText('a10:updated') ||
        getText('updated');

      // ── Elsevier fallbacks (authors + date embedded in description HTML) ────
      if (!author && description) {
        const m = description.match(/Author\(s\):\s*([^<]+)/i);
        if (m) {
          const parts = m[1].trim().split(/,\s*/).filter(Boolean);
          author = parts.length > 1 ? parts : m[1].trim();
        }
      }
      if (!pubDate && description) {
        // Elsevier: text is concatenated "Publication date: June 2026Source: ..."
        // Use non-greedy match ending at year to avoid grabbing trailing text.
        const m = description.match(/Publication date:\s*(.+?\d{4})/i);
        if (m) {
          const dateStr = m[1].trim();
          const parsed = new Date(dateStr);
          pubDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : dateStr;
        }
      }

      items.push({
        title: getText('title'),
        link,
        description,
        content,
        pubDate,
        author,
        doi,
        thumbnail: enclosureUrl,
        enclosure: enclosureUrl ? { link: enclosureUrl, url: enclosureUrl } : null,
      });
    });

    return items;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[fetchRss] XML parse failed:', e);
    return [];
  }
}
