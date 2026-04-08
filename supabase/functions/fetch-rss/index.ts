import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TIMEOUT_MS = 10000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { rss_url } = await req.json();
    if (!rss_url) {
      return new Response(JSON.stringify({ status: "error", items: [], error: "Missing rss_url" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const resp = await fetch(rss_url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ status: "error", items: [], error: `Upstream HTTP ${resp.status}` }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      );
    }

    const xml = await resp.text();
    const items = parseRss(xml);

    return new Response(JSON.stringify({ status: "ok", items }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ status: "error", items: [], error: msg }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});

// Strip CDATA markers that the HTML parser leaves as raw text
function stripCDATA(s: string): string {
  if (!s) return s;
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}

function parseRss(xml: string) {
  const DC_NS = "http://purl.org/dc/elements/1.1/";
  const ATOM_NS = "http://www.w3.org/2005/Atom";
  const CONTENT_NS = "http://purl.org/rss/1.0/modules/content/";

  const items: Record<string, unknown>[] = [];

  try {
    // deno_dom's WASM DOMParser only supports text/html; text/xml returns null.
    // Trade-off: HTML parser can't handle XML namespaces or void <link>, so we
    // pre-extract <link> text and <dc:creator> lists from raw XML per <item>.
    const linkTexts: string[] = [];
    const dcCreatorTexts: string[][] = [];
    const itemBlockRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    let ib: RegExpExecArray | null;
    while ((ib = itemBlockRegex.exec(xml)) !== null) {
      const block = ib[1];
      // Pre-extract link
      const innerLinkMatch = block.match(/<link[^>]*>([^<]+)<\/link>/i);
      linkTexts.push(innerLinkMatch ? innerLinkMatch[1].trim() : "");
      // Pre-extract all dc:creator elements (Springer Nature lists one per author)
      const creators: string[] = [];
      const creatorRegex = /<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/gi;
      let cm: RegExpExecArray | null;
      while ((cm = creatorRegex.exec(block)) !== null) {
        const v = stripCDATA(cm[1].trim());
        if (v) creators.push(v);
      }
      dcCreatorTexts.push(creators);
    }

    const doc = new DOMParser().parseFromString(xml, "text/html");
    if (!doc) return items;

    const entries = doc.querySelectorAll("item, entry");
    let entryIndex = 0;
    for (const item of entries) {
      // getText / getTextNS strip CDATA markers automatically
      const getText = (tag: string) =>
        stripCDATA(item.getElementsByTagName(tag)?.[0]?.textContent?.trim() || "");
      const getTextNS = (ns: string, local: string) =>
        stripCDATA(item.getElementsByTagNameNS(ns, local)?.[0]?.textContent?.trim() || "");
      const getAttr = (tag: string, attr: string) => {
        const els = item.getElementsByTagName(tag);
        for (let i = 0; i < els.length; i++) {
          const v = els[i].getAttribute(attr);
          if (v) return v;
        }
        return "";
      };

      // ── Authors ─────────────────────────────────────────────────────────
      // Prefer pre-extracted dc:creator list (HTML parser can't handle XML namespaces)
      const preCreators = dcCreatorTexts[entryIndex] || [];
      let author: string | string[];
      if (preCreators.length > 1) {
        author = preCreators;
      } else if (preCreators.length === 1) {
        author = preCreators[0];
      } else {
        // Fallback: try DOM-based extraction for non-RSS-2.0 feeds (e.g. Atom)
        const dcCreatorEls = item.getElementsByTagNameNS(DC_NS, "creator");
        const dcCreators: string[] = [];
        for (let i = 0; i < dcCreatorEls.length; i++) {
          const v = stripCDATA(dcCreatorEls[i]?.textContent?.trim() || "");
          if (v) dcCreators.push(v);
        }
        if (dcCreators.length > 1) {
          author = dcCreators;
        } else if (dcCreators.length === 1) {
          author = dcCreators[0];
        } else {
          author =
            getText("dc:creator") ||
            stripCDATA(item.querySelector("author name")?.textContent?.trim() || "") ||
            getText("author") ||
            "";
        }
      }

      // ── Link ────────────────────────────────────────────────────────────
      // HTML parser treats <link> as void, so getText("link") is always "".
      // Use pre-extracted regex matches, then fall back to <guid> text.
      const link = getAttr("link", "href") || getText("link") || linkTexts[entryIndex] || getText("guid") || "";

      // ── Enclosure / thumbnail ───────────────────────────────────────────
      const enclosureUrl =
        getAttr("enclosure", "url") || getAttr("content", "url") || getAttr("thumbnail", "url") || "";

      // ── Content ─────────────────────────────────────────────────────────
      const content =
        getTextNS(CONTENT_NS, "encoded") ||
        getText("content:encoded") ||
        getText("encoded") ||
        getText("content");

      const description = getText("description") || getText("summary");

      // ── DOI ─────────────────────────────────────────────────────────────
      let doi = "";
      const rawDcId = getTextNS(DC_NS, "identifier") || getText("dc:identifier") || "";
      const dcId = rawDcId.startsWith("doi:") ? rawDcId.slice(4).trim() : rawDcId;
      if (/^10\.\d{4,}\//.test(dcId)) doi = dcId;
      if (!doi) {
        const m = (link || "").match(/10\.\d{4,}\/[^\s?&#"'<>]+/);
        if (m) doi = m[0];
      }
      if (!doi) {
        const guidText = getText("guid");
        const m = guidText.match(/10\.\d{4,}\/[^\s?&#"'<>]+/);
        if (m) doi = m[0];
      }
      if (!doi && description) {
        const m = description.match(/\bDOI\b[^:]*:\s*(10\.\d{4,}\/[^\s<,]+)/i);
        if (m) doi = m[1].trim();
      }

      // ── pubDate ─────────────────────────────────────────────────────────
      const pubDate =
        getText("pubDate") ||
        getTextNS(DC_NS, "date") || getText("dc:date") ||
        getText("published") ||
        getTextNS(ATOM_NS, "updated") || getText("a10:updated") ||
        getText("updated") ||
        "";

      // ── Elsevier fallbacks (authors + date from description HTML) ──────
      if (!author && description) {
        const m = description.match(/Author\(s\):\s*([^<]+)/i);
        if (m) {
          const raw = stripCDATA(m[1].trim());
          const parts = raw.split(/,\s*/).filter(Boolean);
          author = parts.length > 1 ? parts : raw;
        }
      }
      let finalPubDate = pubDate;
      if (!finalPubDate && description) {
        // Elsevier description is concatenated: "Publication date: June 2026Source: ..."
        // Use non-greedy match ending at the year to avoid grabbing "Source:..." text.
        const m = description.match(/Publication date:\s*(.+?\d{4})/i);
        if (m) {
          const dateStr = m[1].trim();
          const parsed = new Date(dateStr);
          finalPubDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : dateStr;
        }
      }

      // Strip residual HTML tags (e.g. <sub>, <sup>) from title
      const rawTitle = getText("title");
      const cleanTitle = rawTitle.replace(/<[^>]+>/g, "");

      items.push({
        title: cleanTitle,
        link,
        pubDate: finalPubDate,
        author,
        doi,
        description,
        content,
        enclosure: enclosureUrl ? { link: enclosureUrl, url: enclosureUrl } : null,
      });
      entryIndex++;
    }
  } catch (e) {
    console.error("[fetch-rss] parse error:", e);
  }

  return items;
}
