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

    // Taylor & Francis: fetch TOC pages to extract GA image URLs
    if (rss_url.includes("tandfonline.com/feed/rss/")) {
      try {
        const journalCode = rss_url.match(/\/feed\/rss\/([a-z0-9]+)/i)?.[1] || "";
        if (journalCode) {
          const fetchHeaders = {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,*/*",
          };
          // Fetch both current issue and ahead-of-print TOC pages in parallel
          const [tocCurrent, tocAop] = await Promise.allSettled([
            fetch(`https://www.tandfonline.com/toc/${journalCode}/current`, { headers: fetchHeaders }),
            fetch(`https://www.tandfonline.com/toc/${journalCode}/0/0`, { headers: fetchHeaders }),
          ]);
          const gaMap: Record<string, string> = {};
          const gaRegex = /https?:\/\/www\.tandfonline\.com\/cms\/asset\/[a-f0-9-]+\/[a-z]+_a_(\d+)_uf\d+_[a-z]\.(?:jpg|png|gif)/gi;
          for (const result of [tocCurrent, tocAop]) {
            if (result.status === "fulfilled" && result.value.ok) {
              const html = await result.value.text();
              let m: RegExpExecArray | null;
              while ((m = gaRegex.exec(html)) !== null) {
                gaMap[m[1]] = m[0];
              }
            }
          }
          // Attach GA URLs to matching items
          for (const item of items) {
            const link = (item.link as string) || "";
            const artIdMatch = link.match(/\.(\d{5,})(?:\?|$)/);
            if (artIdMatch && gaMap[artIdMatch[1]]) {
              item.enclosure = { link: gaMap[artIdMatch[1]], url: gaMap[artIdMatch[1]] };
            }
          }
        }
      } catch (e) {
        console.error("[fetch-rss] T&F TOC scrape error:", e);
      }
    }

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

function parseRss(xml: string) {
  const DC_NS = "http://purl.org/dc/elements/1.1/";
  const ATOM_NS = "http://www.w3.org/2005/Atom";
  const CONTENT_NS = "http://purl.org/rss/1.0/modules/content/";

  const items: Record<string, unknown>[] = [];

  try {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    if (!doc) return items;

    const entries = doc.querySelectorAll("item, entry");
    for (const item of entries) {
      const getText = (tag: string) => item.getElementsByTagName(tag)?.[0]?.textContent?.trim() || "";
      const getTextNS = (ns: string, local: string) =>
        item.getElementsByTagNameNS(ns, local)?.[0]?.textContent?.trim() || "";
      const getAttr = (tag: string, attr: string) => {
        const els = item.getElementsByTagName(tag);
        for (let i = 0; i < els.length; i++) {
          const v = els[i].getAttribute(attr);
          if (v) return v;
        }
        return "";
      };

      // ── Authors ─────────────────────────────────────────────────────────
      const dcCreatorEls = item.getElementsByTagNameNS(DC_NS, "creator");
      const dcCreators: string[] = [];
      for (let i = 0; i < dcCreatorEls.length; i++) {
        const v = dcCreatorEls[i]?.textContent?.trim();
        if (v) dcCreators.push(v);
      }
      let author: string | string[];
      if (dcCreators.length > 1) {
        author = dcCreators;
      } else if (dcCreators.length === 1) {
        author = dcCreators[0];
      } else {
        author =
          getText("dc:creator") ||
          item.querySelector("author name")?.textContent?.trim() ||
          getText("author") ||
          "";
      }

      // ── Link ────────────────────────────────────────────────────────────
      const link = getAttr("link", "href") || getText("link");

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

      // ── Elsevier fallbacks ──────────────────────────────────────────────
      if (!author && description) {
        const m = description.match(/Author\(s\):\s*([^<]+)/i);
        if (m) {
          const parts = m[1].trim().split(/,\s*/).filter(Boolean);
          author = parts.length > 1 ? parts : m[1].trim();
        }
      }
      let finalPubDate = pubDate;
      if (!finalPubDate && description) {
        const m = description.match(/Publication date:\s*([^<\n]+)/i);
        if (m) {
          const parsed = new Date(m[1].trim());
          finalPubDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : m[1].trim();
        }
      }

      items.push({
        title: getText("title"),
        link,
        pubDate: finalPubDate,
        author,
        doi,
        description,
        content,
        enclosure: enclosureUrl ? { link: enclosureUrl, url: enclosureUrl } : null,
      });
    }
  } catch (e) {
    console.error("[fetch-rss] parse error:", e);
  }

  return items;
}
