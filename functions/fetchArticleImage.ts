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

  // Fetch the article page HTML with browser-like headers
  let html = '';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': origin + '/',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (response.ok) {
      // Only read first 100KB — meta tags are always in <head>
      const reader = response.body?.getReader();
      if (reader) {
        const chunks: Uint8Array[] = [];
        let totalBytes = 0;
        while (totalBytes < 100_000) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          chunks.push(value);
          totalBytes += value.length;
        }
        reader.cancel();
        html = new TextDecoder().decode(
          chunks.reduce((acc, c) => {
            const merged = new Uint8Array(acc.length + c.length);
            merged.set(acc);
            merged.set(c, acc.length);
            return merged;
          }, new Uint8Array(0))
        );
      }
    }
  } catch (e) {
    console.log(`[fetchArticleImage] fetch error: ${(e as Error).message}`);
    return new Response(JSON.stringify({ image_url: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (!html) {
    return new Response(JSON.stringify({ image_url: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const SKIP = ['spacer', 'pixel', 'blank', 'icon', 'logo', 'arrow', 'button', 'badge', '1x1', 'tracking', 'beacon', 'stat', 'placeholder', 'default', 'missing'];

  const isValidImg = (imgUrl: string) => {
    if (!imgUrl || typeof imgUrl !== 'string') return false;
    if (!imgUrl.startsWith('http')) return false;
    if (SKIP.some(s => imgUrl.toLowerCase().includes(s))) return false;
    return true;
  };

  // Try og:image (both attribute orderings)
  const ogPatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image:src["']/i,
  ];

  for (const pattern of ogPatterns) {
    const match = html.match(pattern);
    if (match && isValidImg(match[1])) {
      console.log(`[fetchArticleImage] found via meta tag: ${match[1].slice(0, 80)}`);
      return new Response(JSON.stringify({ image_url: match[1] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Fallback: look for graphical abstract img tags in HTML body
  // Pattern used by ACS and others for graphical abstract sections
  const gaPatterns = [
    /graphical.abstract[^<]*<[^>]*img[^>]+src=["']([^"']+)["']/i,
    /<img[^>]+class=["'][^"']*graphical[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*graphical[^"']*["']/i,
    /<img[^>]+alt=["'][^"']*graphical abstract[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["'][^>]+alt=["'][^"']*graphical abstract[^"']*["']/i,
  ];

  for (const pattern of gaPatterns) {
    const match = html.match(pattern);
    if (match && isValidImg(match[1])) {
      const resolved = match[1].startsWith('http') ? match[1] : origin + match[1];
      console.log(`[fetchArticleImage] found via GA pattern: ${resolved.slice(0, 80)}`);
      return new Response(JSON.stringify({ image_url: resolved }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }

  console.log(`[fetchArticleImage] no image found for: ${url.slice(0, 80)}`);
  return new Response(JSON.stringify({ image_url: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
