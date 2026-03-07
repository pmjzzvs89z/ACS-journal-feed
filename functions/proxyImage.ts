import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { url } = await req.json();
  if (!url) {
    return new Response('url is required', { status: 400 });
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': new URL(url).origin + '/',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch image' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }

  const contentType = response.headers.get('Content-Type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    return new Response(JSON.stringify({ error: 'Not an image' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  return new Response(JSON.stringify({ file_url: `data:${contentType};base64,${base64Image}` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});