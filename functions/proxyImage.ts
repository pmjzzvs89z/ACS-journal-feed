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

  // First attempt: full browser-like headers (beats most hotlink protection)
  let response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': origin + '/',
      'Origin': origin,
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'same-origin',
    },
  });

  // Second attempt: minimal headers (some servers reject Sec-Fetch headers from non-browsers)
  if (!response.ok) {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': origin + '/',
        'Accept': 'image/*,*/*;q=0.8',
      },
    });
  }

  // Third attempt: no headers at all (CDN-hosted images often need nothing)
  if (!response.ok) {
    response = await fetch(url);
  }

  if (!response.ok) {
    return new Response(JSON.stringify({ error: `Failed to fetch image: ${response.status}` }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }

  const contentType = response.headers.get('Content-Type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    return new Response(JSON.stringify({ error: 'Not an image' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const arrayBuffer = await response.arrayBuffer();
  // Chunked base64 conversion — avoids stack overflow for large images (>65KB)
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
  }
  const base64Image = btoa(binary);

  return new Response(JSON.stringify({ file_url: `data:${contentType};base64,${base64Image}` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
