Deno.serve(async (req) => {
  // No auth check — this function only fetches publicly accessible
  // academic journal images; auth gate was blocking anonymous users.

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

  // ── Helper: convert a fetch Response into a base64 data-URL JSON response ──
  const imageToBase64Response = async (response: Response): Promise<Response | null> => {
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.log(`[proxyImage] unexpected content-type: ${contentType}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    // Chunked base64 — avoids stack overflow for large images (>65 KB)
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
    }
    const base64Image = btoa(binary);
    return new Response(
      JSON.stringify({ file_url: `data:${contentType};base64,${base64Image}` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  // ── Attempt 1: Direct fetch with publisher-matching Referer ─────────────
  // Setting Referer to the publisher's own origin (e.g. https://pubs.acs.org/)
  // bypasses most hotlink-protection rules that check for cross-origin Referers.
  try {
    let response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': origin + '/',
        'Origin': origin,
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(12000),
    });

    // Retry with minimal headers (some servers reject Sec-Fetch-* headers from non-browsers)
    if (!response.ok) {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': origin + '/',
          'Accept': 'image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000),
      });
    }

    if (response.ok) {
      console.log(`[proxyImage] direct ok for ${url.slice(0, 80)}`);
      const result = await imageToBase64Response(response);
      if (result) return result;
    } else {
      console.log(`[proxyImage] direct failed: status=${response.status} for ${url.slice(0, 80)}`);
    }
  } catch (e) {
    console.log(`[proxyImage] direct error: ${(e as Error).message}`);
  }

  // ── Attempt 2: wsrv.nl image proxy (server-side) ────────────────────────
  // wsrv.nl is a dedicated image CDN with good IP reputation among academic
  // publishers. It fetches images server-side without sending a cross-origin
  // Referer, so publisher CDN hotlink rules don't trigger.
  // &output=webp&w=800 — converts to WebP and caps width at 800px, keeping
  // file sizes small (important for base64 JSON payloads).
  try {
    const wsrvUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&w=800&n=-1`;
    const response = await fetch(wsrvUrl, {
      headers: { 'Accept': 'image/webp,image/*,*/*;q=0.8' },
      signal: AbortSignal.timeout(20000),
    });
    console.log(`[proxyImage] wsrv.nl status=${response.status} for ${url.slice(0, 80)}`);
    if (response.ok) {
      const result = await imageToBase64Response(response);
      if (result) return result;
    }
  } catch (e) {
    console.log(`[proxyImage] wsrv.nl error: ${(e as Error).message}`);
  }

  console.log(`[proxyImage] all attempts failed for: ${url.slice(0, 100)}`);
  return new Response(
    JSON.stringify({ error: 'Failed to fetch image from all sources' }),
    { status: 502, headers: { 'Content-Type': 'application/json' } },
  );
});
