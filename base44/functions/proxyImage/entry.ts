Deno.serve(async (req) => {
  // Support both GET (?url=...) and POST (JSON body { url }) so the client
  // can use this function directly as an <img src="...?url=..."> endpoint.

  const reqUrl = new URL(req.url);
  let imageUrl: string | null = null;

  if (req.method === 'GET') {
    imageUrl = reqUrl.searchParams.get('url');
  } else {
    let body: { url?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    imageUrl = body.url ?? null;
  }

  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'url is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let origin: string;
  try {
    origin = new URL(imageUrl).origin;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // CORS headers — allow any origin so browsers can load this as <img src>
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // ── Helper: stream image bytes back to the client ─────────────────────────
  const streamImageResponse = async (response: Response): Promise<Response | null> => {
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.log(`[proxyImage] unexpected content-type: ${contentType}`);
      return null;
    }
    return new Response(response.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  };

  // ── Attempt 1: Direct fetch with publisher-matching Referer ─────────────
  try {
    let response = await fetch(imageUrl, {
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

    if (!response.ok) {
      response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': origin + '/',
          'Accept': 'image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000),
      });
    }

    if (response.ok) {
      console.log(`[proxyImage] direct ok for ${imageUrl.slice(0, 80)}`);
      const result = await streamImageResponse(response);
      if (result) return result;
    } else {
      console.log(`[proxyImage] direct failed: status=${response.status} for ${imageUrl.slice(0, 80)}`);
    }
  } catch (e) {
    console.log(`[proxyImage] direct error: ${(e as Error).message}`);
  }

  // ── Attempt 2: wsrv.nl image proxy (server-side) ────────────────────────
  try {
    const wsrvUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&output=webp&w=800&n=-1`;
    const response = await fetch(wsrvUrl, {
      headers: { 'Accept': 'image/webp,image/*,*/*;q=0.8' },
      signal: AbortSignal.timeout(20000),
    });
    console.log(`[proxyImage] wsrv.nl status=${response.status} for ${imageUrl.slice(0, 80)}`);
    if (response.ok) {
      const result = await streamImageResponse(response);
      if (result) return result;
    }
  } catch (e) {
    console.log(`[proxyImage] wsrv.nl error: ${(e as Error).message}`);
  }

  console.log(`[proxyImage] all attempts failed for: ${imageUrl.slice(0, 100)}`);
  return new Response(JSON.stringify({ error: 'Failed to fetch image from all sources' }), {
    status: 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
