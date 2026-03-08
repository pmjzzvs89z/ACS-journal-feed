Deno.serve(async (req) => {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { url } = body;
  if (!url) {
    return new Response(JSON.stringify({ error: 'url is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const SKIP = ['spacer', 'pixel', 'blank', 'icon', 'logo', 'arrow', 'button', 'badge',
                '1x1', 'tracking', 'beacon', 'stat', 'placeholder', 'default', 'missing',
                'no-image', 'noimage', 'generic'];

  const isValidImg = (imgUrl: string | null | undefined): imgUrl is string => {
    if (!imgUrl || typeof imgUrl !== 'string') return false;
    if (!imgUrl.startsWith('http') && !imgUrl.startsWith('//')) return false;
    if (SKIP.some(s => imgUrl.toLowerCase().includes(s))) return false;
    return true;
  };

  const resolveUrl = (src: string, base: string): string => {
    if (src.startsWith('http')) return src;
    if (src.startsWith('//')) return 'https:' + src;
    try { return new URL(src, base).href; } catch { return src; }
  };

  const extractOgImage = (html: string): string | null => {
    // og:image and twitter:image — both attribute orderings, both property= and name=
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:image["']/i,
      /<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:url["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
      /<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image:src["']/i,
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m?.[1]) {
        const resolved = resolveUrl(m[1], url);
        if (isValidImg(resolved)) return resolved;
      }
    }
    // Graphical abstract img tags (ACS, RSC, Wiley patterns in article body)
    const gaPatterns = [
      /<img[^>]+alt=["'][^"']*graphical\s*abstract[^"']*["'][^>]+src=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']+)["'][^>]+alt=["'][^"']*graphical\s*abstract[^"']*["']/i,
      /<img[^>]+class=["'][^"']*graphical[^"']*["'][^>]+src=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*graphical[^"']*["']/i,
      /graphical[\s_-]abstract[\s\S]{0,300}?<img[^>]+src=["']([^"']+)["']/i,
    ];
    for (const p of gaPatterns) {
      const m = html.match(p);
      if (m?.[1]) {
        const resolved = resolveUrl(m[1], url);
        if (isValidImg(resolved)) return resolved;
      }
    }
    return null;
  };

  // ── Helper: fetch HTML, reading only the first `maxBytes` ─────────────────
  const fetchHtml = async (fetchUrl: string, headers: Record<string, string>, maxBytes = 150_000): Promise<string> => {
    const resp = await fetch(fetchUrl, {
      headers,
      signal: AbortSignal.timeout(12000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const reader = resp.body?.getReader();
    if (!reader) return '';
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (totalBytes < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      totalBytes += value.length;
    }
    reader.cancel();
    return new TextDecoder().decode(
      chunks.reduce((acc, c) => {
        const m = new Uint8Array(acc.length + c.length);
        m.set(acc); m.set(c, acc.length); return m;
      }, new Uint8Array(0))
    );
  };

  const tryExtract = async (label: string, fn: () => Promise<string>): Promise<string | null> => {
    try {
      const html = await fn();
      if (html.length > 200) {
        const found = extractOgImage(html);
        if (found) {
          console.log(`[fetchArticleImage] found via ${label}: ${found.slice(0, 100)}`);
          return found;
        }
        console.log(`[fetchArticleImage] ${label} ok (${html.length}B) but no og:image`);
      } else {
        console.log(`[fetchArticleImage] ${label} returned short/empty response`);
      }
    } catch (e) {
      console.log(`[fetchArticleImage] ${label} error: ${(e as Error).message}`);
    }
    return null;
  };

  // ── Strategy 1: Twitterbot UA ─────────────────────────────────────────────
  // Publishers whitelist social-media crawlers in Cloudflare so that Twitter
  // cards and Facebook link previews work. This bypasses Cloudflare's JS
  // challenge for ACS, Wiley, Elsevier, and many other gated publishers.
  // The returned HTML contains og:image — exactly what we need.
  const s1 = await tryExtract('Twitterbot', () => fetchHtml(url, {
    'User-Agent': 'Twitterbot/1.0',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  }));
  if (s1) return new Response(JSON.stringify({ image_url: s1 }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  // ── Strategy 2: facebookexternalhit UA ────────────────────────────────────
  // Facebook's link-preview bot is also universally whitelisted.
  const s2 = await tryExtract('facebookbot', () => fetchHtml(url, {
    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  }));
  if (s2) return new Response(JSON.stringify({ image_url: s2 }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  // ── Strategy 3: allorigins.win proxy ──────────────────────────────────────
  // Works for publishers without aggressive Cloudflare (MDPI, RSC, T&F, etc.)
  const s3 = await tryExtract('allorigins', async () => {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.contents || data.contents.length < 200) {
      throw new Error(`short contents (http_code=${data.status?.http_code})`);
    }
    return data.contents as string;
  });
  if (s3) return new Response(JSON.stringify({ image_url: s3 }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  // ── Strategy 4: direct fetch with full browser headers ────────────────────
  // Last resort for open publishers without bot protection.
  const s4 = await tryExtract('direct', () => fetchHtml(url, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': origin + '/',
    'Cache-Control': 'no-cache',
  }));
  if (s4) return new Response(JSON.stringify({ image_url: s4 }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  // ── Strategy 5: rss2json (open-access publishers only) ────────────────────
  const canTryRss2json = url.includes('mdpi.com') || url.includes('frontiersin.org') ||
                         url.includes('plos.org') || url.includes('hindawi.com');
  if (canTryRss2json) {
    try {
      const RSS2JSON_API_KEY = Deno.env.get('RSS2JSON_API_KEY') || '';
      const apiKeyParam = RSS2JSON_API_KEY ? `&api_key=${RSS2JSON_API_KEY}` : '';
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=1${apiKeyParam}`;
      const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
      const data = await resp.json();
      const thumb = data?.feed?.image || data?.items?.[0]?.thumbnail;
      if (isValidImg(thumb)) {
        console.log(`[fetchArticleImage] found via rss2json: ${thumb.slice(0, 100)}`);
        return new Response(JSON.stringify({ image_url: thumb }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    } catch (e) {
      console.log(`[fetchArticleImage] rss2json error: ${(e as Error).message}`);
    }
  }

  console.log(`[fetchArticleImage] all strategies failed for: ${url.slice(0, 100)}`);
  return new Response(JSON.stringify({ image_url: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
