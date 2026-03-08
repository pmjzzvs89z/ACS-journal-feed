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
    // Allow http, https, or protocol-relative
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

  // ── Strategy 1: allorigins.win (bypasses Cloudflare/hotlink protection) ───
  // Same proxy used successfully in fetchRssFeed for MDPI, RSC, etc.
  let html = '';
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
    if (resp.ok) {
      const data = await resp.json();
      if (data.contents && data.contents.length > 200) {
        html = data.contents;
        console.log(`[fetchArticleImage] allorigins ok, len=${html.length}`);
      } else {
        console.log(`[fetchArticleImage] allorigins returned empty/short contents, http_code=${data.status?.http_code}`);
      }
    }
  } catch (e) {
    console.log(`[fetchArticleImage] allorigins error: ${(e as Error).message}`);
  }

  if (html) {
    const found = extractOgImage(html);
    if (found) {
      console.log(`[fetchArticleImage] found via allorigins: ${found.slice(0, 100)}`);
      return new Response(JSON.stringify({ image_url: found }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    console.log(`[fetchArticleImage] allorigins html has no og:image`);
  }

  // ── Strategy 2: Direct fetch with browser-like headers ───────────────────
  // Works for publishers without aggressive bot protection (MDPI, T&F, etc.)
  if (!html) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': origin + '/',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(10000),
      });
      console.log(`[fetchArticleImage] direct status=${resp.status}`);
      if (resp.ok) {
        // Read first 150 KB — og:image is always in <head>
        const reader = resp.body?.getReader();
        if (reader) {
          const chunks: Uint8Array[] = [];
          let totalBytes = 0;
          while (totalBytes < 150_000) {
            const { done, value } = await reader.read();
            if (done || !value) break;
            chunks.push(value);
            totalBytes += value.length;
          }
          reader.cancel();
          html = new TextDecoder().decode(
            chunks.reduce((acc, c) => {
              const m = new Uint8Array(acc.length + c.length);
              m.set(acc); m.set(c, acc.length); return m;
            }, new Uint8Array(0))
          );
          console.log(`[fetchArticleImage] direct html len=${html.length}`);
        }
      }
    } catch (e) {
      console.log(`[fetchArticleImage] direct error: ${(e as Error).message}`);
    }
  }

  if (html) {
    const found = extractOgImage(html);
    if (found) {
      console.log(`[fetchArticleImage] found via direct: ${found.slice(0, 100)}`);
      return new Response(JSON.stringify({ image_url: found }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    console.log(`[fetchArticleImage] direct html has no og:image`);
  }

  // ── Strategy 3: rss2json API (returns og:image for some publishers) ───────
  // rss2json has a 'thumbnail' field that maps to og:image for article URLs
  // Only try this for known friendly publishers
  const canTryRss2json = url.includes('mdpi.com') || url.includes('frontiersin.org') ||
                         url.includes('plos.org') || url.includes('hindawi.com');
  if (canTryRss2json) {
    try {
      // Use rss2json to scrape single-article metadata
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
