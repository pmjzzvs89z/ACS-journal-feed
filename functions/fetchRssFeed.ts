import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function parseRSS(xmlText) {
  const items = [];

  const itemMatches = xmlText.match(/<item[\s>][^]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const get = (tag) => {
      const cdataMatch = itemXml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, 'i'));
      if (cdataMatch) return cdataMatch[1].trim();
      const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? match[1].trim() : '';
    };

    const getAttr = (tag, attr) => {
      const match = itemXml.match(new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, 'i'));
      return match ? match[1] : '';
    };

    const getAllCreators = () => {
      const results = [];
      const regex = /(?:^|[^a-z])creator[^>]*>([^<]+)<\/(?:[a-z]+:)?creator>/gi;
      let m;
      while ((m = regex.exec(itemXml)) !== null) {
        const val = m[1].trim();
        if (val) results.push(val);
      }
      return results;
    };

    const title = get('title');

    const rdfAbout = itemXml.match(/<item[^>]+rdf:about=["']([^"']+)["']/i)?.[1] || '';
    const link = get('link') || getAttr('link', 'href') || rdfAbout ||
      (getAttr('guid', 'isPermaLink') !== 'false' ? get('guid') : '');

    let pubDate = get('pubDate') || get('dc:date') || get('date') || get('published') || get('updated');

    let doi = '';
    const doiTagMatch = itemXml.match(/<[^>]*:?doi[^>]*>\s*(10\.\d{4,}\/[^\s<]+)\s*<\/[^>]*:?doi>/i);
    if (doiTagMatch) doi = doiTagMatch[1].trim();
    if (!doi) {
      let dcId = get('dc:identifier') || '';
      if (dcId.startsWith('doi:')) dcId = dcId.slice(4).trim();
      if (/^10\.\d{4,}\//.test(dcId)) doi = dcId;
    }
    if (!doi) {
      const doiInGuid = get('guid').match(/10\.\d{4,}\/[^\s<"']+/);
      if (doiInGuid) doi = doiInGuid[0];
    }
    if (!doi) {
      const doiInLink = (link || '').match(/10\.\d{4,}\/[^\s?&#"'<>]+/);
      if (doiInLink) doi = doiInLink[0];
    }

    const allCreators = getAllCreators();
    let author = allCreators.length > 1
      ? allCreators
      : (get('author') || (allCreators.length === 1 ? allCreators[0] : '') || get('dc:creator') || '');

    const description = get('description') || get('summary') || get('dc:description');
    const content = get('content:encoded') || get('content') || description;

    if (!author && description) {
      const elsevierAuthorMatch = description.match(/Author\(s\):\s*([^<]+)/i);
      if (elsevierAuthorMatch) {
        const authorList = elsevierAuthorMatch[1].trim();
        const parts = authorList.split(/,\s*/);
        author = parts.length > 1 ? parts : authorList;
      }
    }

    if (!pubDate && description) {
      const elsevierDateMatch = description.match(/Publication date:\s*([^<\n]+)/i);
      if (elsevierDateMatch) {
        const parsed = new Date(elsevierDateMatch[1].trim());
        if (!isNaN(parsed.getTime())) pubDate = parsed.toISOString();
        else pubDate = elsevierDateMatch[1].trim();
      }
    }

    const enclosureUrl = getAttr('enclosure', 'url') || getAttr('media:content', 'url') || getAttr('media:thumbnail', 'url');

    if (title) {
      items.push({
        title,
        link: link || '',
        pubDate: pubDate || '',
        author: author || '',
        doi: doi || '',
        description: description || '',
        content: content || '',
        enclosure: enclosureUrl ? { link: enclosureUrl } : null,
      });
    }
  }

  return items;
}

function mapRss2JsonItems(items) {
  return items.map(item => {
    const link = item.link || '';
    const doiInLink = link.match(/10\.\d{4,}\/[^\s?&#"'<>]+/);
    const doi = doiInLink ? doiInLink[0] : '';
    return {
      title: item.title || '',
      link,
      pubDate: item.pubDate || '',
      author: item.author ? item.author.split(/,\s*/).filter(Boolean) : '',
      doi,
      description: item.description || '',
      content: item.content || item.description || '',
      enclosure: item.enclosure?.link ? { link: item.enclosure.link } : (item.thumbnail ? { link: item.thumbnail } : null),
    };
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { rss_url } = await req.json();
  if (!rss_url) {
    return Response.json({ error: 'rss_url is required' }, { status: 400 });
  }

  const RSS2JSON_API_KEY = Deno.env.get('RSS2JSON_API_KEY') || '';

  const normalized_url = rss_url.replace(/^http:\/\/feeds\.rsc\.org/, 'https://feeds.rsc.org');

  // MDPI & RSC: try multiple proxy strategies
  if (rss_url.includes('mdpi.com') || rss_url.includes('rsc.org')) {
    // Strategy 1: direct fetch with browser-like headers
    try {
      const resp = await fetch(normalized_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Referer': rss_url.includes('mdpi.com') ? 'https://www.mdpi.com/' : 'https://www.rsc.org/',
        },
        signal: AbortSignal.timeout(8000),
      });
      console.log(`[Strategy 1] status=${resp.status} ok=${resp.ok}`);
      if (resp.ok) {
        const xml = await resp.text();
        console.log(`[Strategy 1] xml length=${xml.length}`);
        const items = parseRSS(xml);
        console.log(`[Strategy 1] items parsed=${items.length}`);
        if (items.length > 0) {
          return Response.json({ status: 'ok', items });
        }
      }
    } catch (e) { console.log(`[Strategy 1] error: ${e.message}`); }

    // Strategy 2: rss2json API
    try {
      const apiKeyParam = RSS2JSON_API_KEY ? `&api_key=${RSS2JSON_API_KEY}` : '';
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(normalized_url)}&count=100${apiKeyParam}`;
      const proxyResp = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      const data = await proxyResp.json();
      console.log(`[Strategy 2] rss2json status=${data.status} items=${data.items?.length} message=${data.message}`);
      if (data.items && data.items.length > 0) {
        return Response.json({ status: 'ok', items: mapRss2JsonItems(data.items) });
      }
    } catch (e) { console.log(`[Strategy 2] error: ${e.message}`); }

    // Strategy 3: allorigins proxy
    try {
      const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalized_url)}`;
      const resp = await fetch(allOriginsUrl, { signal: AbortSignal.timeout(10000) });
      const data = await resp.json();
      console.log(`[Strategy 3] allorigins contents length=${data.contents?.length} status=${data.status?.http_code}`);
      if (data.contents) {
        const items = parseRSS(data.contents);
        console.log(`[Strategy 3] items parsed=${items.length}`);
        if (items.length > 0) {
          return Response.json({ status: 'ok', items });
        }
      }
    } catch (e) { console.log(`[Strategy 3] error: ${e.message}`); }

    return Response.json({ status: 'ok', items: [] });
  }

  // Other publishers known to block direct server-side requests
  const forceProxy = rss_url.includes('asmedigitalcollection.asme.org');

  if (forceProxy) {
    const apiKeyParam = RSS2JSON_API_KEY ? `&api_key=${RSS2JSON_API_KEY}` : '';
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(normalized_url)}&count=100${apiKeyParam}`;
    try {
      const proxyResp = await fetch(proxyUrl);
      const data = await proxyResp.json();
      if (data.items && data.items.length > 0) {
        return Response.json({ status: 'ok', items: mapRss2JsonItems(data.items) });
      }
    } catch (_e) {}
    return Response.json({ status: 'ok', items: [] });
  }

  // Try direct fetch first
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  let xmlText = '';
  try {
    const directResponse = await fetch(normalized_url, { headers });
    if (directResponse.ok) {
      xmlText = await directResponse.text();
    }
  } catch (_err) {
    // fall through to proxy
  }

  let items = [];
  if (xmlText) {
    try { items = parseRSS(xmlText); } catch (_e) {}
  }

  // If direct fetch failed or returned no items, fall back to rss2json
  if (items.length === 0) {
    try {
      const apiKeyParam = RSS2JSON_API_KEY ? `&api_key=${RSS2JSON_API_KEY}` : '';
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(normalized_url)}&count=100${apiKeyParam}`;
      const proxyResp = await fetch(proxyUrl);
      const data = await proxyResp.json();
      if (data.items && data.items.length > 0) {
        return Response.json({ status: 'ok', items: mapRss2JsonItems(data.items) });
      }
    } catch (_e) {}
  }

  return Response.json({ status: 'ok', items });
});