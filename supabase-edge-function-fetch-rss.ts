// Supabase Edge Function: fetch-rss
// ----------------------------------------------------------------------
// Server-side RSS proxy. Fetches a publisher's RSS feed with realistic
// browser headers (works around MDPI/Wiley/RSC datacenter-IP blocks),
// parses it into a JSON array of articles, and returns to the client.
//
// Contract (unchanged from previous version so frontend stays compatible):
//   POST /fetch-rss  { "rss_url": "https://..." }
//   200 { "status": "ok" | "error", "items": [...] }
//
// Item shape:
//   { title, link, description, content, pubDate, author,
//     doi, enclosure, thumbnail }
//
// Deploy via Supabase Dashboard → Edge Functions → fetch-rss → Edit Code.
//
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// ── Rotating Chrome/Firefox User-Agent strings ─────────────────────────
// Cloudflare and similar bot managers compare the full header set + TLS
// fingerprint. We can't change Deno's TLS handshake, but rotating a
// modern UA + matching Sec-Ch-Ua hints defeats the simpler filters that
// MDPI, RSC, and Wiley use for RSS.
const UA_POOL = [
  {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    secChPlatform: '"macOS"',
  },
  {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    secChPlatform: '"Windows"',
  },
  {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
    secChUa: '',
    secChPlatform: '',
  },
];

function browserHeaders(targetUrl: string, ua: typeof UA_POOL[number]): HeadersInit {
  const u = new URL(targetUrl);
  const headers: Record<string, string> = {
    'User-Agent': ua.ua,
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9',
    // Deno fetch handles decompression automatically when this is set
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    // Referer matching the origin helps RSC, Elsevier and a few others
    'Referer': `${u.protocol}//${u.hostname}/`,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };
  // Only add Chrome-specific client hints when the UA is Chrome
  if (ua.secChUa) {
    headers['Sec-Ch-Ua'] = ua.secChUa;
    headers['Sec-Ch-Ua-Mobile'] = '?0';
    headers['Sec-Ch-Ua-Platform'] = ua.secChPlatform;
  }
  return headers;
}

const FETCH_TIMEOUT_MS = 10_000;

async function fetchOnce(url: string, ua: typeof UA_POOL[number]): Promise<string | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: browserHeaders(url, ua),
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Bot-wall pages often return 200 but serve HTML instead of XML/Atom
    if (!text) return null;
    const head = text.slice(0, 400).toLowerCase();
    if (head.includes('just a moment') || head.includes('cloudflare') || head.includes('captcha')) {
      return null;
    }
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(url: string): Promise<string | null> {
  for (const ua of UA_POOL) {
    const body = await fetchOnce(url, ua);
    if (body) return body;
  }
  return null;
}

// ── RSS / Atom parser ──────────────────────────────────────────────────
// Regex-based, mirrors the logic in src/utils/fetchRss.js so the client
// gets the same fields regardless of which path served the request.
function stripCData(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function parseItem(body: string) {
  const getTag = (tag: string): string => {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
    const m = body.match(re);
    return m ? stripCData(m[1]) : '';
  };
  const getTagAttr = (tag: string, attr: string): string => {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?\\s${attr}=["']([^"']+)["']`, 'i');
    const m = body.match(re);
    return m ? m[1] : '';
  };

  // Title
  const title = getTag('title');

  // Link — RSS uses <link>text</link>, Atom uses <link href="..."/>
  let link = getTag('link');
  if (!link) link = getTagAttr('link', 'href');

  // Description / content
  const description = getTag('description') || getTag('summary');
  const content = getTag('content:encoded') || getTag('encoded') || getTag('content');

  // Publish date — try all common tags
  const pubDate =
    getTag('pubDate') ||
    getTag('dc:date') ||
    getTag('published') ||
    getTag('a10:updated') ||
    getTag('updated');

  // Authors — collect all <dc:creator> elements for multi-author
  const authors: string[] = [];
  const creatorMatches = body.matchAll(/<dc:creator(?:\s[^>]*)?>([\s\S]*?)<\/dc:creator>/gi);
  for (const m of creatorMatches) {
    const a = stripCData(m[1]);
    if (a) authors.push(a);
  }
  if (authors.length === 0) {
    const fallback = getTag('author');
    if (fallback) authors.push(fallback);
  }
  const author = authors.length > 1 ? authors : (authors[0] || '');

  // Enclosure / thumbnail (used for graphical abstracts)
  const enclosureUrl =
    getTagAttr('enclosure', 'url') ||
    getTagAttr('media:thumbnail', 'url') ||
    getTagAttr('media:content', 'url') ||
    '';

  // DOI — prefer <dc:identifier>, fall back to link regex
  let doi = '';
  const rawDcId = getTag('dc:identifier');
  const dcId = rawDcId.replace(/^doi:\s*/i, '').trim();
  if (/^10\.\d{4,}\//.test(dcId)) doi = dcId;
  if (!doi) {
    const m = link.match(/10\.\d{4,}\/[^\s?&#"'<>]+/);
    if (m) doi = m[0];
  }
  if (!doi) {
    const guid = getTag('guid');
    const m = guid.match(/10\.\d{4,}\/[^\s?&#"'<>]+/);
    if (m) doi = m[0];
  }

  return {
    title,
    link,
    description,
    content,
    pubDate,
    author,
    doi,
    thumbnail: enclosureUrl,
    enclosure: enclosureUrl ? { link: enclosureUrl, url: enclosureUrl } : null,
  };
}

function parseFeed(xml: string): unknown[] {
  const items: unknown[] = [];
  // Match both RSS <item> and Atom <entry>
  const matches = xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi);
  for (const m of matches) {
    const parsed = parseItem(m[2]);
    if (parsed.title || parsed.link) items.push(parsed);
  }
  return items;
}

// ── HTTP handler ───────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ status: 'error', items: [], error: 'method-not-allowed' }, { status: 405 });
  }

  let rssUrl: string;
  try {
    const body = await req.json();
    rssUrl = body?.rss_url;
    if (!rssUrl || typeof rssUrl !== 'string') {
      return jsonResponse({ status: 'error', items: [], error: 'missing-rss_url' }, { status: 400 });
    }
  } catch {
    return jsonResponse({ status: 'error', items: [], error: 'invalid-json' }, { status: 400 });
  }

  const xml = await fetchWithRetry(rssUrl);
  if (!xml) {
    return jsonResponse({ status: 'error', items: [] });
  }

  const items = parseFeed(xml);
  return jsonResponse({ status: items.length > 0 ? 'ok' : 'error', items });
});
