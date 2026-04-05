export default async function handler(req, res) {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).json({ error: 'missing url param' });
  }

  // Only allow known publisher image domains
  try {
    const hostname = new URL(imageUrl).hostname;
    const allowed = ['pubs.acs.org', 'onlinelibrary.wiley.com'];
    if (!allowed.some(h => hostname === h || hostname.endsWith('.' + h))) {
      return res.status(403).json({ error: 'hostname not allowed' });
    }
  } catch {
    return res.status(400).json({ error: 'invalid url' });
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://pubs.acs.org/',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `upstream ${upstream.status}` });
    }

    const contentType = upstream.headers.get('content-type') || 'image/gif';
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(buffer);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
